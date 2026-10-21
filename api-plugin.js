import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Lese .dev.vars oder .env
function getEnvConfig() {
  const envFiles = ['.dev.vars', '.env'];
  const config = {};
  for (const f of envFiles) {
    const fullPath = path.resolve(process.cwd(), f);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const idx = trimmed.indexOf('=');
          if (idx !== -1) {
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim();
            config[key] = val;
          }
        }
      }
    }
  }
  return config;
}

export function apiPlugin() {
  return {
    name: 'vollmers-api-backend',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathname = url.pathname;

        // Nur /api/... Requests verarbeiten
        if (!pathname.startsWith('/api/')) {
          return next();
        }

        const env = { ...process.env, ...getEnvConfig() };
        const accountId = env.CLOUDFLARE_ACCOUNT_ID || '';
        const apiToken = env.CLOUDFLARE_API_TOKEN || '';
        const kvNsId = env.KV_NAMESPACE_ID || '';
        const r2Bucket = env.R2_BUCKET_NAME || 'website-datein';
        const resendKey = env.RESEND_API_KEY || '';
        const turnstileSecret = env.TURNSTILE_SECRET_KEY || '';
        const adminPw = env.ADMIN_PASSWORD || '';
        const emailRecipient = env.EMAIL_RECIPIENT || 'friese.scholz@gmail.com';

        res.setHeader('Content-Type', 'application/json');

        // Helper: Body als JSON parsen
        const parseJsonBody = () => new Promise((resolve) => {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              resolve(body ? JSON.parse(body) : {});
            } catch (e) {
              resolve({});
            }
          });
        });

        // Helper: Body als Roh-Buffer empfangen
        const parseRawBody = () => new Promise((resolve) => {
          const chunks = [];
          req.on('data', chunk => chunks.push(chunk));
          req.on('end', () => resolve(Buffer.concat(chunks)));
        });

        try {
          // -------------------------------------------------------------
          // 1. GET /api/products -> Liest Produkte aus Cloudflare KV
          // -------------------------------------------------------------
          if (pathname === '/api/products' && req.method === 'GET') {
            const kvRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNsId}/values/products`, {
              headers: { 'Authorization': `Bearer ${apiToken}` }
            });

            if (kvRes.ok) {
              const data = await kvRes.json();
              res.statusCode = 200;
              return res.end(JSON.stringify({ success: true, source: 'kv', products: data }));
            } else {
              // Fallback
              const productsMod = await import('../src/data/products.js');
              res.statusCode = 200;
              return res.end(JSON.stringify({ success: true, source: 'fallback', products: productsMod.PRODUCTS }));
            }
          }

          // -------------------------------------------------------------
          // 2. POST /api/admin/login -> Prüft Admin-Passwort
          // -------------------------------------------------------------
          if (pathname === '/api/admin/login' && req.method === 'POST') {
            const { password } = await parseJsonBody();
            if (password === adminPw) {
              const token = 'vollmer_session_' + Date.now() + '_' + Math.random().toString(36).substring(2);
              res.statusCode = 200;
              return res.end(JSON.stringify({ success: true, token, message: 'Erfolgreich angemeldet' }));
            } else {
              res.statusCode = 401;
              return res.end(JSON.stringify({ success: false, error: 'Ungültiges Passwort' }));
            }
          }

          // -------------------------------------------------------------
          // 3. POST /api/admin/products -> Speichert Produkte in Cloudflare KV
          // -------------------------------------------------------------
          if (pathname === '/api/admin/products' && req.method === 'POST') {
            const authHeader = req.headers['authorization'];
            if (!authHeader || !authHeader.includes('vollmer_session_')) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ success: false, error: 'Nicht autorisiert' }));
            }

            const { products } = await parseJsonBody();
            if (!Array.isArray(products)) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, error: 'Ungültiges Produkt-Array' }));
            }

            const kvRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNsId}/values/products`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(products)
            });

            if (kvRes.ok) {
              res.statusCode = 200;
              return res.end(JSON.stringify({ success: true, message: 'Produkte erfolgreich in Cloudflare KV gespeichert!' }));
            } else {
              const err = await kvRes.text();
              res.statusCode = 500;
              return res.end(JSON.stringify({ success: false, error: 'KV Fehler: ' + err }));
            }
          }

          // -------------------------------------------------------------
          // 3b. GET /api/events & POST /api/admin/events
          // -------------------------------------------------------------
          if (pathname === '/api/events' && req.method === 'GET') {
            const kvRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNsId}/values/events`, {
              headers: { 'Authorization': `Bearer ${apiToken}` }
            });
            if (kvRes.ok) {
              const data = await kvRes.json();
              res.statusCode = 200;
              return res.end(JSON.stringify({ success: true, source: 'kv', events: data }));
            }
            const eventsMod = await import('./src/data/events.js');
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, source: 'fallback', events: eventsMod.DEFAULT_EVENTS }));
          }

          if (pathname === '/api/admin/events' && req.method === 'POST') {
            const authHeader = req.headers['authorization'];
            if (!authHeader || !authHeader.includes('vollmer_session_')) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ success: false, error: 'Nicht autorisiert' }));
            }
            const { events } = await parseJsonBody();
            const kvRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNsId}/values/events`, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify(events)
            });
            res.statusCode = kvRes.ok ? 200 : 500;
            return res.end(JSON.stringify({ success: kvRes.ok, events }));
          }

          // -------------------------------------------------------------
          // 3c. Eier-Donnerstag Endpunkte (Anfrage, Action, Admin)
          // -------------------------------------------------------------
          if (pathname === '/api/eier-donnerstag' && req.method === 'POST') {
            const body = await parseJsonBody();
            const { name, email, street, town, townId, zip, address, eggCount, deliveryDate, message } = body;
            const resolvedAddress = address || (street && town ? `${street}, ${zip || ''} ${town}` : '');

            if (!name || !email || !resolvedAddress || !eggCount) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, error: 'Bitte fülle alle Pflichtfelder aus.' }));
            }
            let currentOrders = [];
            try {
              const kvGet = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNsId}/values/egg_orders`, {
                headers: { 'Authorization': `Bearer ${apiToken}` }
              });
              if (kvGet.ok) currentOrders = await kvGet.json();
            } catch (e) {}
            if (!Array.isArray(currentOrders)) currentOrders = [];

            const actionToken = 'tok_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);

            const newOrder = {
              id: 'egg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
              name: String(name).trim(),
              email: String(email).trim(),
              street: street ? String(street).trim() : '',
              town: town ? String(town).trim() : 'Machtsum',
              townId: townId ? String(townId).trim() : 'machtsum',
              zip: zip ? String(zip).trim() : '31177',
              address: String(resolvedAddress).trim(),
              eggCount: Number(eggCount) || String(eggCount).trim(),
              deliveryDate: deliveryDate ? String(deliveryDate).trim() : '',
              message: message ? String(message).trim() : '',
              status: 'pending',
              actionToken,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            const updatedOrders = [newOrder, ...currentOrders];

            await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNsId}/values/egg_orders`, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedOrders)
            });

            // E-Mail-Benachrichtigung an den Hofladen (Resend API)
            if (resendKey) {
              try {
                let deliveryDateText = 'Nächster Donnerstag';
                if (newOrder.deliveryDate) {
                  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(newOrder.deliveryDate);
                  if (match) {
                    const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
                    const day = parseInt(match[3], 10);
                    const monthName = months[parseInt(match[2], 10) - 1] || match[2];
                    deliveryDateText = `Donnerstag, ${day}. ${monthName} ${match[1]}`;
                  } else {
                    deliveryDateText = newOrder.deliveryDate;
                  }
                }

                const origin = 'https://vollmers-hofladen.friese-scholz.workers.dev';
                const acceptUrl = `${origin}/api/eier-donnerstag/action?id=${newOrder.id}&action=accept&token=${actionToken}`;
                const rejectUrl = `${origin}/api/eier-donnerstag/action?id=${newOrder.id}&action=reject&token=${actionToken}`;
                const adminLink = `${origin}/#admin`;

                const htmlContent = `
                  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #FBF9F5; border-radius: 16px; border: 1px solid #E6E1D4;">
                    <div style="border-bottom: 2px solid #274B35; padding-bottom: 16px; margin-bottom: 20px;">
                      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #B45309; background-color: #FEF3C7; padding: 3px 8px; border-radius: 6px;">⏳ Neue Lieferanfrage (Ausstehend)</span>
                      <h2 style="color: #274B35; margin: 10px 0 6px 0; font-size: 24px; font-family: Georgia, serif;">🥚 Eier-Donnerstag Anfrage!</h2>
                      <p style="color: #666; margin: 0; font-size: 14px;">Ein Kunde hat eine unverbindliche Anfrage für ${deliveryDateText} gestellt.</p>
                    </div>

                    <div style="background-color: #FFFFFF; padding: 20px; border-radius: 12px; border: 1px solid #ECE7DD; margin-bottom: 20px;">
                      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <tr>
                          <td style="padding: 8px 0; color: #777; width: 140px;"><strong>Liefertermin:</strong></td>
                          <td style="padding: 8px 0; color: #274B35; font-weight: 700; font-size: 15px;">${deliveryDateText}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #777;"><strong>Bestellmenge:</strong></td>
                          <td style="padding: 8px 0; color: #111; font-weight: 700; font-size: 15px;">🥚 ${newOrder.eggCount} frische Freilandeier</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #777;"><strong>Name:</strong></td>
                          <td style="padding: 8px 0; color: #111; font-weight: 600;">${newOrder.name}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #777;"><strong>Lieferadresse:</strong></td>
                          <td style="padding: 8px 0; color: #111; font-weight: 600;">${newOrder.address}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #777;"><strong>E-Mail:</strong></td>
                          <td style="padding: 8px 0;"><a href="mailto:${newOrder.email}" style="color: #274B35; text-decoration: underline;">${newOrder.email}</a></td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #777;"><strong>Abrechnung:</strong></td>
                          <td style="padding: 8px 0; color: #555;">Barzahlung an der Haustür bei Lieferung</td>
                        </tr>
                      </table>
                    </div>

                    ${newOrder.message ? `
                      <div style="background-color: #FFFFFF; padding: 20px; border-radius: 12px; border: 1px solid #ECE7DD; margin-bottom: 20px;">
                        <strong style="color: #777; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">Ablagehinweis / Nachricht:</strong>
                        <p style="color: #111; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${newOrder.message}</p>
                      </div>
                    ` : ''}

                    <div style="background-color: #FFFFFF; padding: 24px 20px; border-radius: 12px; border: 1px solid #ECE7DD; text-align: center; margin-bottom: 24px;">
                      <p style="font-size: 14px; font-weight: 700; color: #182019; margin: 0 0 16px 0;">
                        Möchtest du diese Lieferanfrage annehmen oder ablehnen?
                      </p>
                      <div style="margin: 0 auto; text-align: center;">
                        <a href="${acceptUrl}" style="display: inline-block; background-color: #274B35; color: #FFFFFF; font-weight: 700; font-size: 14px; padding: 13px 26px; border-radius: 10px; text-decoration: none; margin: 6px;">
                          ✅ Anfrage annehmen
                        </a>
                        <a href="${rejectUrl}" style="display: inline-block; background-color: #DC2626; color: #FFFFFF; font-weight: 700; font-size: 14px; padding: 13px 26px; border-radius: 10px; text-decoration: none; margin: 6px;">
                          ❌ Anfrage ablehnen
                        </a>
                      </div>
                      <p style="color: #888; font-size: 11px; margin: 12px 0 0 0;">
                        Ein Klick öffnet die Bestätigung und versendet automatisch die passende Kunden-E-Mail.
                      </p>
                    </div>

                    <div style="text-align: center; margin: 16px 0;">
                      <a href="${adminLink}" style="color: #274B35; font-size: 13px; font-weight: 600; text-decoration: underline;">
                        👉 Oder im Admin-Dashboard bearbeiten
                      </a>
                    </div>

                    <div style="text-align: center; font-size: 12px; color: #999; border-top: 1px solid #E6E1D4; padding-top: 16px;">
                      Automatisches Liefersystem • Vollmer’s Hofladen Machtsum<br />
                      Bereitgestellt durch Scholz & Friese Webdesign
                    </div>
                  </div>
                `;

                await fetch('https://api.resend.com/emails', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${resendKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    from: 'Scholz & Friese Webdesign <noreply@scholz-friese-webdesign.de>',
                    to: [emailRecipient],
                    reply_to: newOrder.email,
                    subject: `[Vollmers Hofladen] 🥚 Neue Eier-Lieferanfrage: ${newOrder.eggCount} Eier von ${newOrder.name} (${newOrder.town})`,
                    html: htmlContent
                  })
                });
              } catch (mailErr) {
                console.warn('Resend mail error in dev plugin:', mailErr);
              }
            }

            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, order: newOrder }));
          }

          if (pathname === '/api/eier-donnerstag/action' && req.method === 'GET') {
            const orderId = url.searchParams.get('id');
            const action = url.searchParams.get('action');
            const token = url.searchParams.get('token');

            let currentOrders = [];
            try {
              const kvGet = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNsId}/values/egg_orders`, {
                headers: { 'Authorization': `Bearer ${apiToken}` }
              });
              if (kvGet.ok) currentOrders = await kvGet.json();
            } catch (e) {}

            const order = currentOrders.find(o => o.id === orderId);
            if (!order) {
              res.statusCode = 404;
              return res.end('Anfrage nicht gefunden.');
            }

            order.status = action === 'accept' ? 'accepted' : 'rejected';
            order.updatedAt = new Date().toISOString();

            await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNsId}/values/egg_orders`, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify(currentOrders)
            });

            // Resend an Kunden
            if (resendKey && order.email) {
              const isAccepted = action === 'accept';
              const subject = isAccepted
                ? `🥚 Lieferbestätigung: Deine Eier-Bestellung für Donnerstag`
                : `Information zu deiner Anfrage für den Eier-Donnerstag`;
              const textContent = isAccepted
                ? `<div style="font-family: sans-serif; padding: 20px;"><h2>Lieferung bestätigt! 🥚</h2><p>Hallo ${order.name}, deine Bestellung über ${order.eggCount} Eier wurde angenommen.</p></div>`
                : `<div style="font-family: sans-serif; padding: 20px;"><h2>Information zu deiner Anfrage</h2><p>Hallo ${order.name}, leider sind unsere Kapazitäten für diesen Donnerstag erschöpft.</p></div>`;

              await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  from: 'Vollmer’s Hofladen <noreply@scholz-friese-webdesign.de>',
                  to: [order.email],
                  subject,
                  html: textContent,
                })
              }).catch(() => {});
            }

            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.statusCode = 200;
            return res.end(`
              <!DOCTYPE html>
              <html lang="de">
              <head><meta charset="utf-8"/><title>Status aktualisiert</title></head>
              <body style="font-family: sans-serif; background: #FBF9F5; padding: 40px; text-align: center;">
                <div style="max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 20px; border: 1px solid #E6E1D4;">
                  <h1 style="color: #274B35;">${action === 'accept' ? '✅ Lieferanfrage angenommen!' : '❌ Lieferanfrage abgelehnt'}</h1>
                  <p>Die Anfrage von ${order.name} wurde als <strong>${order.status}</strong> markiert.</p>
                  <p><a href="/#admin" style="display: inline-block; background: #274B35; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none;">Zum Admin-Dashboard</a></p>
                </div>
              </body>
              </html>
            `);
          }

          if (pathname === '/api/admin/eier-donnerstag/status' && req.method === 'POST') {
            const authHeader = req.headers['authorization'];
            if (!authHeader || !authHeader.includes('vollmer_session_')) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ success: false, error: 'Nicht autorisiert' }));
            }
            const { id, status } = await parseJsonBody();
            let currentOrders = [];
            try {
              const kvGet = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNsId}/values/egg_orders`, {
                headers: { 'Authorization': `Bearer ${apiToken}` }
              });
              if (kvGet.ok) currentOrders = await kvGet.json();
            } catch (e) {}

            const order = currentOrders.find(o => o.id === id);
            if (!order) {
              res.statusCode = 404;
              return res.end(JSON.stringify({ success: false, error: 'Nicht gefunden' }));
            }

            order.status = status;
            order.updatedAt = new Date().toISOString();

            await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNsId}/values/egg_orders`, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify(currentOrders)
            });

            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, order }));
          }

          if (pathname === '/api/admin/eier-donnerstag' && req.method === 'GET') {
            const authHeader = req.headers['authorization'];
            if (!authHeader || !authHeader.includes('vollmer_session_')) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ success: false, error: 'Nicht autorisiert' }));
            }
            let orders = [];
            try {
              const kvGet = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNsId}/values/egg_orders`, {
                headers: { 'Authorization': `Bearer ${apiToken}` }
              });
              if (kvGet.ok) orders = await kvGet.json();
            } catch (e) {}
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, orders: Array.isArray(orders) ? orders : [] }));
          }

          if (pathname === '/api/admin/eier-donnerstag' && req.method === 'POST') {
            const authHeader = req.headers['authorization'];
            if (!authHeader || !authHeader.includes('vollmer_session_')) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ success: false, error: 'Nicht autorisiert' }));
            }
            const { orders } = await parseJsonBody();
            const kvRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNsId}/values/egg_orders`, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify(orders || [])
            });
            res.statusCode = kvRes.ok ? 200 : 500;
            return res.end(JSON.stringify({ success: kvRes.ok, orders }));
          }

          // -------------------------------------------------------------
          // 4. POST /api/admin/upload -> Bild hochladen, WebP, R2 Upload
          // -------------------------------------------------------------
          if (pathname === '/api/admin/upload' && req.method === 'POST') {
            const authHeader = req.headers['authorization'];
            if (!authHeader || !authHeader.includes('vollmer_session_')) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ success: false, error: 'Nicht autorisiert' }));
            }

            const { filename, base64 } = await parseJsonBody();
            if (!base64) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, error: 'Keine Bilddaten empfangen' }));
            }

            // Temporäre Datei anlegen
            const cleanName = (filename || 'produkt_' + Date.now())
              .replace(/\.[^/.]+$/, "")
              .replace(/[^a-zA-Z0-9_-]/g, "_");
            const tempIn = path.join('/tmp', `upload_${Date.now()}_raw`);
            const tempWebp = path.join('/tmp', `upload_${Date.now()}.webp`);
            
            const buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
            fs.writeFileSync(tempIn, buffer);

            // Python Pillow Konvertierung nach Scholz & Friese Standard (Quality 85, max 1920px)
            const pyScriptPath = path.join('/tmp', `conv_${Date.now()}.py`);
            fs.writeFileSync(pyScriptPath, `
from PIL import Image
im = Image.open('${tempIn}').convert('RGB')
if im.width > 1920 or im.height > 1920:
    im.thumbnail((1920, 1920), Image.Resampling.LANCZOS)
im.save('${tempWebp}', 'WEBP', quality=85)
`);
            execSync(`python3 ${pyScriptPath}`);
            try { fs.unlinkSync(pyScriptPath); } catch (e) {}

            // R2 Upload
            const r2Key = `Vollmers-Hofladen/Produkte/${cleanName}_${Date.now()}.webp`;
            const r2Url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${r2Bucket}/objects/${r2Key}`;
            const webpBuffer = fs.readFileSync(tempWebp);

            const r2Res = await fetch(r2Url, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'image/webp'
              },
              body: webpBuffer
            });

            // Aufräumen
            try { fs.unlinkSync(tempIn); fs.unlinkSync(tempWebp); } catch (e) {}

            if (r2Res.ok) {
              const publicUrl = `https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/${r2Key}`;
              res.statusCode = 200;
              return res.end(JSON.stringify({ success: true, url: publicUrl }));
            } else {
              const errText = await r2Res.text();
              res.statusCode = 500;
              return res.end(JSON.stringify({ success: false, error: 'R2 Upload Fehler: ' + errText }));
            }
          }

          // -------------------------------------------------------------
          // 5. POST /api/send-email -> Kontaktformular mit Turnstile & Resend
          // -------------------------------------------------------------
          if (pathname === '/api/send-email' && req.method === 'POST') {
            const { name, email, phone, subject, message, turnstileToken } = await parseJsonBody();

            if (!name || !email || !message) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, error: 'Bitte fülle alle Pflichtfelder aus.' }));
            }

            // Turnstile Token prüfen
            if (!turnstileToken) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, error: 'Bitte bestätige den Spam-Schutz.' }));
            }

            const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const turnstileParams = new URLSearchParams();
            turnstileParams.append('secret', turnstileSecret);
            turnstileParams.append('response', turnstileToken);
            if (clientIp) turnstileParams.append('remoteip', clientIp);

            const turnstileVerifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
              method: 'POST',
              body: turnstileParams
            });
            const turnstileData = await turnstileVerifyRes.json();

            // Falls Turnstile fehlschlägt (außer im reinen localhost dry-run)
            if (!turnstileData.success && turnstileToken !== 'test-bypass-token') {
              console.warn('Turnstile verification failed:', turnstileData);
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, error: 'Spam-Schutz-Prüfung fehlgeschlagen. Bitte versuche es erneut.' }));
            }

            // E-Mail über Resend versenden
            const htmlContent = `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #FBF9F5; border-radius: 16px; border: 1px solid #E6E1D4;">
                <div style="border-bottom: 2px solid #274B35; padding-bottom: 16px; margin-bottom: 20px;">
                  <h2 style="color: #274B35; margin: 0 0 6px 0; font-size: 24px;">🌾 Neue Anfrage via Vollmer’s Hofladen</h2>
                  <p style="color: #666; margin: 0; font-size: 14px;">Eingegangen über das Kontaktformular auf vollmers-hofladen.de</p>
                </div>

                <div style="background-color: #FFFFFF; padding: 20px; border-radius: 12px; border: 1px solid #ECE7DD; margin-bottom: 20px;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                      <td style="padding: 8px 0; color: #777; width: 120px;"><strong>Absender:</strong></td>
                      <td style="padding: 8px 0; color: #111; font-weight: 600;">${name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #777;"><strong>E-Mail:</strong></td>
                      <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #274B35; text-decoration: underline;">${email}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #777;"><strong>Telefon:</strong></td>
                      <td style="padding: 8px 0; color: #111;">${phone || 'Nicht angegeben'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #777;"><strong>Betreff:</strong></td>
                      <td style="padding: 8px 0; color: #111; font-weight: 600;">${subject || 'Allgemeine Anfrage'}</td>
                    </tr>
                  </table>
                </div>

                <div style="background-color: #FFFFFF; padding: 20px; border-radius: 12px; border: 1px solid #ECE7DD; margin-bottom: 24px;">
                  <strong style="color: #777; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">Nachricht:</strong>
                  <p style="color: #111; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
                </div>

                <div style="text-align: center; font-size: 12px; color: #999; border-top: 1px solid #E6E1D4; padding-top: 16px;">
                  Automatisches Formular-System • Vollmer’s Hofladen Machtsum<br />
                  Bereitgestellt durch Scholz & Friese Webdesign
                </div>
              </div>
            `;

            const emailSubject = `[Vollmers Hofladen] 🌾 Neue Anfrage: ${subject || 'Kontaktformular'} von ${name}`;

            const resendRes = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: 'Scholz & Friese Webdesign <noreply@scholz-friese-webdesign.de>',
                to: [emailRecipient],
                reply_to: email,
                subject: emailSubject,
                html: htmlContent
              })
            });

            const resendData = await resendRes.json();
            if (resendRes.ok) {
              res.statusCode = 200;
              return res.end(JSON.stringify({ success: true, message: 'Nachricht erfolgreich versendet!', id: resendData.id }));
            } else {
              console.error('Resend error:', resendData);
              res.statusCode = 500;
              return res.end(JSON.stringify({ success: false, error: 'E-Mail konnte nicht gesendet werden: ' + (resendData.message || 'Unbekannter Fehler') }));
            }
          }

          // Unbekannter API-Endpunkt
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'Endpoint nicht gefunden' }));
        } catch (err) {
          console.error('API Error:', err);
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Interner Server-Fehler: ' + err.message }));
        }
      });
    }
  };
}
