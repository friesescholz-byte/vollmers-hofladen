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
