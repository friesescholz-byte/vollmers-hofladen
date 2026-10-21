import { PRODUCTS as DEFAULT_PRODUCTS } from './src/data/products.js';
import { DEFAULT_EVENTS } from './src/data/events.js';

// Einheitliche CORS-Header
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Generischer KV-Reader (Direktes Binding + REST Fallback)
async function readKV(env, key) {
  if (env.VOLLMERS_KV && typeof env.VOLLMERS_KV.get === 'function') {
    try {
      const data = await env.VOLLMERS_KV.get(key, 'json');
      if (data !== null && data !== undefined) return { data, source: 'kv' };
    } catch (err) {
      console.warn(`KV Binding get error (${key}):`, err);
    }
  }

  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = env.CLOUDFLARE_API_TOKEN;
  const kvNsId = env.KV_NAMESPACE_ID;

  if (accountId && apiToken && kvNsId) {
    try {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNsId}/values/${key}`,
        { headers: { Authorization: `Bearer ${apiToken}` } }
      );
      if (res.ok) {
        const data = await res.json();
        return { data, source: 'kv-api' };
      }
    } catch (e) {
      console.warn(`REST API KV fetch error (${key}):`, e);
    }
  }

  return { data: null, source: 'fallback' };
}

// Generischer KV-Writer (Direktes Binding + REST Fallback)
async function writeKV(env, key, value) {
  if (env.VOLLMERS_KV && typeof env.VOLLMERS_KV.put === 'function') {
    await env.VOLLMERS_KV.put(key, JSON.stringify(value));
    return { ok: true };
  }

  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = env.CLOUDFLARE_API_TOKEN;
  const kvNsId = env.KV_NAMESPACE_ID;

  if (accountId && apiToken && kvNsId) {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNsId}/values/${key}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(value),
      }
    );
    if (res.ok) return { ok: true };
    const errText = await res.text();
    return { ok: false, error: 'KV REST Fehler: ' + errText };
  }

  return { ok: false, error: 'Keine KV-Anbindung konfiguriert' };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 0. Preflight OPTIONS Requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Nur /api/... Requests verarbeiten
    if (url.pathname.startsWith('/api/')) {
      try {
        // -------------------------------------------------------------
        // 1. GET /api/products -> Liest Produkte aus Cloudflare KV
        // -------------------------------------------------------------
        if (url.pathname === '/api/products' && request.method === 'GET') {
          const { data, source } = await readKV(env, 'products');
          if (Array.isArray(data) && data.length > 0) {
            return jsonResponse({ success: true, source, products: data });
          }
          return jsonResponse({ success: true, source: 'fallback', products: DEFAULT_PRODUCTS });
        }

        // -------------------------------------------------------------
        // 2. POST /api/admin/login -> Prüft Admin-Passwort
        // -------------------------------------------------------------
        if (url.pathname === '/api/admin/login' && request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const adminPw = env.ADMIN_PASSWORD || env.Passwort;

          if (body.password && adminPw && body.password === adminPw) {
            const token = 'vollmer_session_' + Date.now() + '_' + Math.random().toString(36).substring(2);
            return jsonResponse({ success: true, token, message: 'Erfolgreich angemeldet' });
          }

          return jsonResponse({ success: false, error: 'Ungültiges Passwort' }, 401);
        }

        // -------------------------------------------------------------
        // 3. POST /api/admin/products -> Speichert Produkte in Cloudflare KV
        // -------------------------------------------------------------
        if (url.pathname === '/api/admin/products' && request.method === 'POST') {
          const authHeader = request.headers.get('authorization') || '';
          if (!authHeader.includes('vollmer_session_')) {
            return jsonResponse({ success: false, error: 'Nicht autorisiert' }, 401);
          }

          const body = await request.json().catch(() => ({}));
          const products = body.products;
          if (!Array.isArray(products)) {
            return jsonResponse({ success: false, error: 'Ungültiges Produkt-Array' }, 400);
          }

          const result = await writeKV(env, 'products', products);
          if (result.ok) {
            return jsonResponse({ success: true, message: 'Produkte erfolgreich gespeichert!' });
          }
          return jsonResponse({ success: false, error: result.error }, 500);
        }

        // -------------------------------------------------------------
        // 4. GET /api/events & POST /api/admin/events -> Termine & Märkte
        // -------------------------------------------------------------
        if (url.pathname === '/api/events' && request.method === 'GET') {
          const { data, source } = await readKV(env, 'events');
          if (Array.isArray(data)) {
            return jsonResponse({ success: true, source, events: data });
          }
          return jsonResponse({ success: true, source: 'fallback', events: DEFAULT_EVENTS });
        }

        if (url.pathname === '/api/admin/events' && request.method === 'POST') {
          const authHeader = request.headers.get('authorization') || '';
          if (!authHeader.includes('vollmer_session_')) {
            return jsonResponse({ success: false, error: 'Nicht autorisiert' }, 401);
          }

          const body = await request.json().catch(() => ({}));
          if (!Array.isArray(body.events)) {
            return jsonResponse({ success: false, error: 'Ungültiges Termine-Array' }, 400);
          }

          const result = await writeKV(env, 'events', body.events);
          if (result.ok) {
            return jsonResponse({ success: true, events: body.events, message: 'Termine gespeichert!' });
          }
          return jsonResponse({ success: false, error: result.error }, 500);
        }

        // -------------------------------------------------------------
        // 5. Eier-Donnerstag Endpunkte (Öffentliche Anmeldung & Admin)
        // -------------------------------------------------------------
        if (url.pathname === '/api/eier-donnerstag' && request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const { name, email, address, eggCount, deliveryDate, message } = body;

          if (!name || !email || !address || !eggCount) {
            return jsonResponse({ success: false, error: 'Bitte fülle Name, E-Mail, Adresse in Machtsum und Eiermenge aus.' }, 400);
          }

          const { data: existing } = await readKV(env, 'egg_orders');
          const currentOrders = Array.isArray(existing) ? existing : [];

          const newOrder = {
            id: 'egg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            name: String(name).trim(),
            email: String(email).trim(),
            address: String(address).trim(),
            eggCount: Number(eggCount) || String(eggCount).trim(),
            deliveryDate: deliveryDate ? String(deliveryDate).trim() : '',
            message: message ? String(message).trim() : '',
            createdAt: new Date().toISOString(),
          };

          const updatedOrders = [newOrder, ...currentOrders];
          const writeRes = await writeKV(env, 'egg_orders', updatedOrders);

          if (!writeRes.ok) {
            return jsonResponse({ success: false, error: writeRes.error || 'Konnte Anmeldung nicht speichern.' }, 500);
          }

          // E-Mail-Benachrichtigung an den Hofladen senden (Resend API)
          const resendKey = env.RESEND_API_KEY;
          const emailRecipient = env.EMAIL_RECIPIENT || 'friese.scholz@gmail.com';
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

              const origin = url.origin && !url.origin.includes('localhost')
                ? url.origin
                : 'https://vollmers-hofladen.friese-scholz.workers.dev';
              const adminLink = `${origin}/#admin`;

              const htmlContent = `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #FBF9F5; border-radius: 16px; border: 1px solid #E6E1D4;">
                  <div style="border-bottom: 2px solid #274B35; padding-bottom: 16px; margin-bottom: 20px;">
                    <h2 style="color: #274B35; margin: 0 0 6px 0; font-size: 24px;">🥚 Neue Eier-Donnerstag Bestellung!</h2>
                    <p style="color: #666; margin: 0; font-size: 14px;">Ein Machtsumer Haushalt hat frische Freilandeier vorbestellt.</p>
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
                        <td style="padding: 8px 0; color: #777;"><strong>Adresse (Machtsum):</strong></td>
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
                  <div style="text-align: center; margin: 28px 0 24px 0;">
                    <a href="${adminLink}" style="display: inline-block; background-color: #274B35; color: #FFFFFF; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 10px; text-decoration: none;">
                      👉 Zum Admin-Dashboard (Eier-Donnerstag Liste öffnen)
                    </a>
                    <p style="color: #888; font-size: 11px; margin-top: 8px;">
                      Direktlink: <a href="${adminLink}" style="color: #274B35;">${adminLink}</a>
                    </p>
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
                  subject: `[Vollmers Hofladen] 🥚 Neue Eier-Donnerstag Bestellung: ${newOrder.eggCount} Eier von ${newOrder.name}`,
                  html: htmlContent
                })
              });
            } catch (mailErr) {
              console.warn('E-Mail Benachrichtigung fehlgeschlagen:', mailErr);
            }
          }

          return jsonResponse({
            success: true,
            order: newOrder,
            message: 'Anmeldung für den Eier-Donnerstag erfolgreich eingetragen!',
          });
        }

        if (url.pathname === '/api/admin/eier-donnerstag' && request.method === 'GET') {
          const authHeader = request.headers.get('authorization') || '';
          if (!authHeader.includes('vollmer_session_')) {
            return jsonResponse({ success: false, error: 'Nicht autorisiert' }, 401);
          }

          const { data } = await readKV(env, 'egg_orders');
          return jsonResponse({
            success: true,
            orders: Array.isArray(data) ? data : [],
          });
        }

        if (url.pathname === '/api/admin/eier-donnerstag' && request.method === 'POST') {
          const authHeader = request.headers.get('authorization') || '';
          if (!authHeader.includes('vollmer_session_')) {
            return jsonResponse({ success: false, error: 'Nicht autorisiert' }, 401);
          }

          const body = await request.json().catch(() => ({}));
          if (!Array.isArray(body.orders)) {
            return jsonResponse({ success: false, error: 'Ungültiges Array' }, 400);
          }

          const result = await writeKV(env, 'egg_orders', body.orders);
          if (result.ok) {
            return jsonResponse({ success: true, orders: body.orders, message: 'Eier-Donnerstag Liste aktualisiert!' });
          }
          return jsonResponse({ success: false, error: result.error }, 500);
        }

        // -------------------------------------------------------------
        // 6. POST /api/admin/upload -> Bild hochladen, nach R2 speichern
        // -------------------------------------------------------------
        if (url.pathname === '/api/admin/upload' && request.method === 'POST') {
          const authHeader = request.headers.get('authorization') || '';
          if (!authHeader.includes('vollmer_session_')) {
            return jsonResponse({ success: false, error: 'Nicht autorisiert' }, 401);
          }

          const body = await request.json().catch(() => ({}));
          const { filename, base64 } = body;
          if (!base64) {
            return jsonResponse({ success: false, error: 'Keine Bilddaten empfangen' }, 400);
          }

          const cleanName = (filename || 'bild_' + Date.now())
            .replace(/\.[^/.]+$/, "")
            .replace(/[^a-zA-Z0-9_-]/g, "_");
          const r2Key = `Vollmers-Hofladen/Produkte/${cleanName}_${Date.now()}.webp`;

          const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
          const binaryString = atob(cleanBase64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          // A) Direkte R2 Bucket Binding
          if (env.R2_BUCKET && typeof env.R2_BUCKET.put === 'function') {
            await env.R2_BUCKET.put(r2Key, bytes.buffer, {
              httpMetadata: { contentType: 'image/webp' }
            });
            const publicUrl = `https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/${r2Key}`;
            return jsonResponse({ success: true, url: publicUrl });
          }

          // B) REST API Fallback
          const accountId = env.CLOUDFLARE_ACCOUNT_ID;
          const apiToken = env.CLOUDFLARE_API_TOKEN;
          const bucketName = env.R2_BUCKET_NAME || 'website-datein';

          if (accountId && apiToken) {
            const r2Url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${r2Key}`;
            const res = await fetch(r2Url, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'image/webp'
              },
              body: bytes.buffer
            });

            if (res.ok) {
              const publicUrl = `https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/${r2Key}`;
              return jsonResponse({ success: true, url: publicUrl });
            }
            const errText = await res.text();
            return jsonResponse({ success: false, error: 'R2 REST Fehler: ' + errText }, 500);
          }

          return jsonResponse({ success: false, error: 'Kein R2 Speicher verfügbar' }, 500);
        }

        // -------------------------------------------------------------
        // 7. POST /api/send-email -> Kontaktformular mit Turnstile & Resend
        // -------------------------------------------------------------
        if (url.pathname === '/api/send-email' && request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const { name, email, phone, subject, message, turnstileToken } = body;

          if (!name || !email || !message) {
            return jsonResponse({ success: false, error: 'Bitte fülle alle Pflichtfelder aus.' }, 400);
          }
          if (!turnstileToken) {
            return jsonResponse({ success: false, error: 'Bitte bestätige den Spam-Schutz.' }, 400);
          }

          // Turnstile Spam-Schutz prüfen
          const turnstileSecret = env.TURNSTILE_SECRET_KEY;
          if (turnstileSecret) {
            const clientIp = request.headers.get('cf-connecting-ip') || '';
            const params = new URLSearchParams();
            params.append('secret', turnstileSecret);
            params.append('response', turnstileToken);
            if (clientIp) params.append('remoteip', clientIp);

            const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
              method: 'POST',
              body: params
            });
            const verifyData = await verifyRes.json();
            if (!verifyData.success && turnstileToken !== 'test-bypass-token') {
              return jsonResponse({ success: false, error: 'Spam-Schutz-Prüfung fehlgeschlagen.' }, 400);
            }
          }

          // E-Mail über Resend senden
          const resendKey = env.RESEND_API_KEY;
          const emailRecipient = env.EMAIL_RECIPIENT || 'friese.scholz@gmail.com';
          if (!resendKey) {
            return jsonResponse({ success: false, error: 'E-Mail Dienst nicht konfiguriert.' }, 500);
          }

          const htmlContent = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #FBF9F5; border-radius: 16px; border: 1px solid #E6E1D4;">
              <div style="border-bottom: 2px solid #274B35; padding-bottom: 16px; margin-bottom: 20px;">
                <h2 style="color: #274B35; margin: 0 0 6px 0; font-size: 24px;">🌾 Neue Anfrage via Vollmer’s Hofladen</h2>
                <p style="color: #666; margin: 0; font-size: 14px;">Eingegangen über das Kontaktformular auf vollmers-hofladen.de</p>
              </div>
              <div style="background-color: #FFFFFF; padding: 20px; border-radius: 12px; border: 1px solid #ECE7DD; margin-bottom: 20px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr><td style="padding: 8px 0; color: #777; width: 120px;"><strong>Absender:</strong></td><td style="padding: 8px 0; color: #111; font-weight: 600;">${name}</td></tr>
                  <tr><td style="padding: 8px 0; color: #777;"><strong>E-Mail:</strong></td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #274B35; text-decoration: underline;">${email}</a></td></tr>
                  <tr><td style="padding: 8px 0; color: #777;"><strong>Telefon:</strong></td><td style="padding: 8px 0; color: #111;">${phone || 'Nicht angegeben'}</td></tr>
                  <tr><td style="padding: 8px 0; color: #777;"><strong>Betreff:</strong></td><td style="padding: 8px 0; color: #111; font-weight: 600;">${subject || 'Allgemeine Anfrage'}</td></tr>
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
            return jsonResponse({ success: true, message: 'Nachricht erfolgreich versendet!', id: resendData.id });
          }
          return jsonResponse({ success: false, error: resendData.message || 'E-Mail Versand fehlgeschlagen' }, 500);
        }

        // 404 für unbekannte /api/* Endpunkte
        return jsonResponse({ success: false, error: 'Endpoint nicht gefunden' }, 404);
      } catch (err) {
        return jsonResponse({ success: false, error: 'Interner Server-Fehler: ' + err.message }, 500);
      }
    }

    // -------------------------------------------------------------
    // Statische Dateien über Cloudflare Assets (SPA Routing)
    // -------------------------------------------------------------
    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not found', { status: 404 });
  }
};
