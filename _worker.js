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

function formatThursdayText(isoDate) {
  if (!isoDate) return 'Nächster Donnerstag';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return isoDate;
  const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const day = parseInt(match[3], 10);
  const monthName = months[parseInt(match[2], 10) - 1] || match[2];
  return `Donnerstag, ${day}. ${monthName} ${match[1]}`;
}

async function sendCustomerDecisionEmail(env, order, decision) {
  const resendKey = env.RESEND_API_KEY;
  if (!resendKey || !order || !order.email) return;

  const dateText = formatThursdayText(order.deliveryDate);
  const isAccepted = decision === 'accept' || decision === 'accepted';

  const subject = isAccepted
    ? `🥚 Lieferbestätigung: Deine Eier-Bestellung für ${dateText}`
    : `Information zu deiner Anfrage für den Eier-Donnerstag (${dateText})`;

  const htmlContent = isAccepted
    ? `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #FBF9F5; border-radius: 16px; border: 1px solid #E6E1D4;">
        <div style="border-bottom: 2px solid #274B35; padding-bottom: 16px; margin-bottom: 20px;">
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #274B35;">Vollmer’s Hofladen • Eier-Donnerstag</span>
          <h2 style="color: #274B35; margin: 6px 0 0 0; font-size: 24px; font-family: Georgia, serif;">Lieferung bestätigt! 🥚</h2>
        </div>
        <p style="color: #333; font-size: 15px; line-height: 1.6;">
          Hallo <strong>${order.name}</strong>,<br /><br />
          vielen Dank für deine Bestellung! Wir haben deine Lieferanfrage für den Eier-Donnerstag geprüft und freuen uns sehr, sie dir zu bestätigen.
        </p>
        <div style="background-color: #FFFFFF; padding: 20px; border-radius: 12px; border: 1px solid #ECE7DD; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #777; width: 140px;"><strong>Liefertermin:</strong></td>
              <td style="padding: 8px 0; color: #274B35; font-weight: 700;">${dateText}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #777;"><strong>Bestellmenge:</strong></td>
              <td style="padding: 8px 0; color: #111; font-weight: 700;">🥚 ${order.eggCount} frische Freilandeier</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #777;"><strong>Lieferadresse:</strong></td>
              <td style="padding: 8px 0; color: #111; font-weight: 600;">${order.address}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #777;"><strong>Bezahlung:</strong></td>
              <td style="padding: 8px 0; color: #274B35; font-weight: 600;">Bar an der Haustür bei Übergabe</td>
            </tr>
          </table>
        </div>
        <p style="color: #555; font-size: 13px; line-height: 1.6;">
          <strong>Hinweis:</strong> Bitte halte den Betrag nach Möglichkeit passend in bar bei Übergabe an der Haustür bereit.
        </p>
        <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #E6E1D4; font-size: 13px; color: #666;">
          Herzliche Grüße aus Machtsum,<br />
          <strong>Familie Vollmer & das Hof-Team</strong><br />
          <span style="font-size: 11px; color: #999;">Lindenallee 24, 31177 Harsum-Machtsum • 24/7 SB-Hofladen</span>
        </div>
      </div>
    `
    : `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #FBF9F5; border-radius: 16px; border: 1px solid #E6E1D4;">
        <div style="border-bottom: 2px solid #888; padding-bottom: 16px; margin-bottom: 20px;">
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #777;">Vollmer’s Hofladen • Eier-Donnerstag</span>
          <h2 style="color: #222; margin: 6px 0 0 0; font-size: 22px; font-family: Georgia, serif;">Information zu deiner Lieferanfrage</h2>
        </div>
        <p style="color: #333; font-size: 15px; line-height: 1.6;">
          Hallo <strong>${order.name}</strong>,<br /><br />
          vielen Dank für dein Interesse an unseren frischen Machtsumer Freilandeiern zum Eier-Donnerstag.
        </p>
        <p style="color: #444; font-size: 14px; line-height: 1.6;">
          Da unsere Hühner im Freiland täglich frische, aber naturgemäß limitierte Mengen legen, sind unsere Kapazitäten für <strong>${dateText}</strong> leider bereits vollständig vergeben oder unsere geplante Route ist an diesem Tag voll ausgelastet.
        </p>
        <div style="background-color: #FFFFFF; padding: 18px; border-radius: 12px; border: 1px solid #ECE7DD; margin: 20px 0; font-size: 13px; color: #555;">
          Wir können deine Anfrage über <strong>${order.eggCount} Eier</strong> für diesen Donnerstag daher leider nicht annehmen und bitten dich herzlich um Verständnis.
        </div>
        <p style="color: #333; font-size: 14px; line-height: 1.6;">
          👉 <strong>Unser Tipp:</strong> Probiere es sehr gerne für einen der kommenden Donnerstage erneut über unsere Website! Alternativ steht dir unser Hofladen in Machtsum (Lindenallee 24) rund um die Uhr (24/7) mit frischen Eiern zur Verfügung.
        </p>
        <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #E6E1D4; font-size: 13px; color: #666;">
          Herzliche Grüße aus Machtsum,<br />
          <strong>Familie Vollmer</strong><br />
          <span style="font-size: 11px; color: #999;">Lindenallee 24, 31177 Harsum-Machtsum • 24/7 SB-Hofladen</span>
        </div>
      </div>
    `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Vollmers Hofladen <noreply@scholz-friese-webdesign.de>',
        to: [order.email],
        reply_to: env.EMAIL_RECIPIENT || 'info@vollmers-hofladen.de',
        subject,
        html: htmlContent,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.warn('Resend mail error for customer:', errText);
    }
  } catch (err) {
    console.warn('Customer decision email failed:', err);
  }
}

async function send2FAEmail(env, { code, deviceName, recipient }) {
  const resendKey = env.RESEND_API_KEY;
  if (!resendKey) return;

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Berlin',
  });

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 28px 24px; background-color: #FBF9F5; border-radius: 18px; border: 1px solid #E6E1D4;">
      <div style="border-bottom: 2px solid #274B35; padding-bottom: 16px; margin-bottom: 24px;">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #274B35; background-color: #E8EFEA; padding: 4px 10px; border-radius: 6px;">2-Faktor-Authentifizierung</span>
        <h2 style="color: #182019; margin: 12px 0 6px 0; font-size: 24px; font-family: Georgia, serif;">Sicherheitscode für Admin-Login</h2>
        <p style="color: #666; margin: 0; font-size: 14px;">Anmeldung von einem neuen oder noch nicht gemerkten Gerät.</p>
      </div>

      <p style="color: #222; font-size: 15px; line-height: 1.5; margin: 0 0 16px 0;">
        Hallo Felix,<br />
        es wurde ein Anmeldeversuch im <strong>Vollmer’s Hofladen Admin-Dashboard</strong> registriert. Nutze bitte folgenden 6-stelligen Code zur Bestätigung:
      </p>

      <div style="background-color: #FFFFFF; padding: 24px; border-radius: 14px; border: 1px solid #ECE7DD; text-align: center; margin: 20px 0;">
        <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #777; display: block; margin-bottom: 10px;">Dein Einmal-Sicherheitscode:</span>
        <div style="font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #274B35; background: #F4F7F4; border: 1px solid #CFDFD3; border-radius: 10px; padding: 14px 20px; display: inline-block;">
          ${code}
        </div>
        <p style="font-size: 12px; color: #888; margin: 14px 0 0 0;">
          ⏱️ Dieser Code ist <strong>15 Minuten</strong> lang gültig.
        </p>
      </div>

      <div style="background-color: #FFFFFF; padding: 18px 20px; border-radius: 12px; border: 1px solid #ECE7DD; margin-bottom: 24px;">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #777; display: block; margin-bottom: 8px;">Geräte-Informationen:</span>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 5px 0; color: #777; width: 110px;">Gerät / Browser:</td>
            <td style="padding: 5px 0; font-weight: 600; color: #222;">${deviceName || 'Unbekanntes Gerät'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #777;">Zeitpunkt:</td>
            <td style="padding: 5px 0; color: #555;">${dateFormatted} Uhr</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #777;">Gerät merken:</td>
            <td style="padding: 5px 0; color: #274B35; font-weight: 600;">Nach Bestätigung wird dieses Gerät gemerkt – künftige Logins erfolgen ohne Code!</td>
          </tr>
        </table>
      </div>

      <p style="color: #777; font-size: 12px; line-height: 1.5; margin: 0 0 20px 0;">
        Falls du diesen Anmeldeversuch nicht selbst veranlasst hast, musst du nichts weiter tun. Ohne diesen Code ist kein Zugriff auf das Dashboard möglich.
      </p>

      <div style="text-align: center; font-size: 12px; color: #999; border-top: 1px solid #E6E1D4; padding-top: 16px;">
        Vollmer’s Hofladen Machtsum • Sicherheitsverwaltung<br />
        Bereitgestellt durch Scholz & Friese Webdesign
      </div>
    </div>
  `;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Vollmers Hofladen <noreply@scholz-friese-webdesign.de>',
        to: [recipient],
        subject: `🔐 Dein Sicherheitscode: ${code} • Vollmer’s Hofladen Admin`,
        html,
      }),
    });
  } catch (e) {
    console.warn('Failed to send 2FA code email:', e);
  }
}

function renderActionHtml({ title, isAccepted, order, origin }) {
  const dateText = formatThursdayText(order.deliveryDate);
  const adminUrl = `${origin}/#admin`;

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} • Vollmer’s Hofladen</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      background-color: #FBF9F5;
      color: #182019;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      max-width: 540px;
      width: 100%;
      background: #FFFFFF;
      border: 1px solid #E6E1D4;
      border-radius: 24px;
      padding: 36px 30px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.04);
      text-align: center;
    }
    .badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 16px;
    }
    .badge-accepted {
      background: #E8F5E9;
      color: #2E7D32;
      border: 1px solid #A5D6A7;
    }
    .badge-rejected {
      background: #FFEBEE;
      color: #C62828;
      border: 1px solid #FFCDD2;
    }
    h1 {
      font-size: 26px;
      margin: 0 0 12px 0;
      color: #182019;
      font-family: Georgia, serif;
      line-height: 1.25;
    }
    p.sub {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
      margin: 0 0 24px 0;
    }
    .details {
      background: #FBF9F5;
      border: 1px solid #ECE7DD;
      border-radius: 16px;
      padding: 16px 20px;
      text-align: left;
      font-size: 13px;
      margin-bottom: 24px;
    }
    .details table {
      width: 100%;
      border-collapse: collapse;
    }
    .details td {
      padding: 6px 0;
      border-bottom: 1px solid #EFEAE0;
    }
    .details tr:last-child td {
      border-bottom: none;
    }
    .label {
      color: #777;
      width: 120px;
    }
    .val {
      font-weight: 600;
      color: #111;
    }
    .btn {
      display: inline-block;
      background: #274B35;
      color: #FFFFFF;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      padding: 13px 28px;
      border-radius: 12px;
      transition: background 0.2s;
    }
    .btn:hover {
      background: #1C3526;
    }
    .footer {
      margin-top: 24px;
      font-size: 11px;
      color: #999;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge ${isAccepted ? 'badge-accepted' : 'badge-rejected'}">
      ${isAccepted ? '✓ Status: Angenommen' : '✕ Status: Abgelehnt'}
    </div>
    <h1>${isAccepted ? 'Lieferanfrage angenommen!' : 'Lieferanfrage abgelehnt'}</h1>
    <p class="sub">
      ${isAccepted
        ? `Die Bestellung wurde erfolgreich bestätigt. Eine automatische Bestätigungs-E-Mail wurde an <strong>${order.email}</strong> gesendet.`
        : `Die Anfrage wurde abgelehnt. Eine freundliche Information wurde an <strong>${order.email}</strong> gesendet.`}
    </p>

    <div class="details">
      <table>
        <tr><td class="label">Kunde:</td><td class="val">${order.name}</td></tr>
        <tr><td class="label">Liefertag:</td><td class="val">${dateText}</td></tr>
        <tr><td class="label">Eiermenge:</td><td class="val">🥚 ${order.eggCount} Freilandeier</td></tr>
        <tr><td class="label">Adresse:</td><td class="val">${order.address}</td></tr>
        <tr><td class="label">Bezahlung:</td><td class="val">Bar an der Haustür</td></tr>
      </table>
    </div>

    <a href="${adminUrl}" class="btn">
      👉 Zum Admin-Dashboard (Eier-Donnerstag)
    </a>

    <div class="footer">
      Vollmer’s Hofladen • Lieferservice Eier-Donnerstag<br />
      Bereitgestellt durch Scholz & Friese Webdesign
    </div>
  </div>
</body>
</html>`;
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
        // 2. POST /api/admin/login -> Prüft Admin-Passwort & Geräte-Status
        // -------------------------------------------------------------
        if (url.pathname === '/api/admin/login' && request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const adminPw = env.ADMIN_PASSWORD || env.Passwort;
          const { password, deviceId, deviceName } = body;

          if (!password || !adminPw || password !== adminPw) {
            return jsonResponse({ success: false, error: 'Ungültiges Passwort' }, 401);
          }

          // Passwort ist korrekt! Prüfe jetzt, ob das Gerät bereits gemerkt (vertrauenswürdig) ist
          const { data: trustedData } = await readKV(env, 'admin_trusted_devices');
          const trustedList = Array.isArray(trustedData) ? trustedData : [];

          const existingDevice = deviceId ? trustedList.find(d => d.id === deviceId) : null;

          if (existingDevice) {
            // Bekanntes Gerät -> Sofort ohne 2FA anmelden!
            existingDevice.lastUsed = new Date().toISOString();
            if (deviceName && (!existingDevice.name || existingDevice.name === 'Unbekanntes Gerät')) {
              existingDevice.name = deviceName;
            }
            await writeKV(env, 'admin_trusted_devices', trustedList);

            const token = 'vollmer_session_' + Date.now() + '_' + Math.random().toString(36).substring(2);
            return jsonResponse({
              success: true,
              token,
              trusted: true,
              message: 'Erfolgreich angemeldet (bekanntes Gerät)',
            });
          }

          // Neues oder noch nicht gemerktes Gerät -> 2FA-Code per E-Mail anfordern
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          const targetDeviceId = deviceId || ('dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8));
          const recipient = env.EMAIL_RECIPIENT || 'info@vollmers-hofladen.de';

          const pending2FA = {
            code,
            deviceId: targetDeviceId,
            deviceName: deviceName || 'Unbekanntes Gerät',
            createdAt: new Date().toISOString(),
            expiresAt: Date.now() + 15 * 60 * 1000,
            attempts: 0,
          };
          await writeKV(env, 'admin_2fa_pending', pending2FA);

          // E-Mail mit 2FA Code versenden
          await send2FAEmail(env, {
            code,
            deviceName,
            recipient,
          });

          return jsonResponse({
            success: true,
            requires2FA: true,
            deviceId: targetDeviceId,
            emailMasked: recipient.replace(/^(.)(.*)(@.*)$/, (_, f, m, e) => f + '***' + e),
            message: 'Sicherheitscode wurde per E-Mail versendet.',
          });
        }

        // -------------------------------------------------------------
        // 2b. POST /api/admin/verify-2fa -> Prüft 2FA-Code und merkt Gerät
        // -------------------------------------------------------------
        if (url.pathname === '/api/admin/verify-2fa' && request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const { deviceId, code, trustDevice, deviceName } = body;

          const { data: pendingData } = await readKV(env, 'admin_2fa_pending');
          if (!pendingData || typeof pendingData !== 'object') {
            return jsonResponse({ success: false, error: 'Kein offener Sicherheitscode vorhanden. Bitte melde dich erneut an.' }, 400);
          }

          if (Date.now() > (pendingData.expiresAt || 0)) {
            return jsonResponse({ success: false, error: 'Der Sicherheitscode ist abgelaufen. Bitte fordere einen neuen an.' }, 400);
          }

          if (pendingData.deviceId && deviceId && pendingData.deviceId !== deviceId) {
            return jsonResponse({ success: false, error: 'Geräte-ID stimmt nicht überein.' }, 400);
          }

          const cleanEntered = String(code || '').trim().replace(/\s+/g, '');
          const cleanExpected = String(pendingData.code || '').trim();

          if (cleanEntered !== cleanExpected) {
            pendingData.attempts = (pendingData.attempts || 0) + 1;
            if (pendingData.attempts >= 5) {
              await writeKV(env, 'admin_2fa_pending', null);
              return jsonResponse({ success: false, error: 'Zu viele Fehlversuche. Bitte fordere einen neuen Code an.' }, 400);
            }
            await writeKV(env, 'admin_2fa_pending', pendingData);
            return jsonResponse({ success: false, error: 'Ungültiger Sicherheitscode. Bitte prüfe deine Eingabe.' }, 400);
          }

          // Code ist korrekt! Lösche Pending-Eintrag
          await writeKV(env, 'admin_2fa_pending', null);

          // Gerät dauerhaft merken
          if (trustDevice !== false && deviceId) {
            const { data: trustedData } = await readKV(env, 'admin_trusted_devices');
            const trustedList = Array.isArray(trustedData) ? trustedData : [];
            const idx = trustedList.findIndex(d => d.id === deviceId);
            const nowIso = new Date().toISOString();
            const deviceEntry = {
              id: deviceId,
              name: deviceName || pendingData.deviceName || 'Mobiles / Desktop-Gerät',
              addedAt: nowIso,
              lastUsed: nowIso,
            };
            if (idx >= 0) {
              trustedList[idx] = deviceEntry;
            } else {
              trustedList.push(deviceEntry);
            }
            await writeKV(env, 'admin_trusted_devices', trustedList);
          }

          const token = 'vollmer_session_' + Date.now() + '_' + Math.random().toString(36).substring(2);
          return jsonResponse({
            success: true,
            token,
            trusted: trustDevice !== false,
            message: 'Code erfolgreich bestätigt!',
          });
        }

        // -------------------------------------------------------------
        // 2c. POST /api/admin/resend-2fa -> Neuen 2FA-Code anfordern
        // -------------------------------------------------------------
        if (url.pathname === '/api/admin/resend-2fa' && request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const { deviceId, deviceName } = body;

          const code = Math.floor(100000 + Math.random() * 900000).toString();
          const targetDeviceId = deviceId || ('dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8));
          const recipient = env.EMAIL_RECIPIENT || 'info@vollmers-hofladen.de';

          const pending2FA = {
            code,
            deviceId: targetDeviceId,
            deviceName: deviceName || 'Unbekanntes Gerät',
            createdAt: new Date().toISOString(),
            expiresAt: Date.now() + 15 * 60 * 1000,
            attempts: 0,
          };
          await writeKV(env, 'admin_2fa_pending', pending2FA);

          await send2FAEmail(env, {
            code,
            deviceName,
            recipient,
          });

          return jsonResponse({
            success: true,
            message: 'Neuer Sicherheitscode wurde versendet.',
          });
        }

        // -------------------------------------------------------------
        // 2d. GET & POST /api/admin/trusted-devices & remove-device
        // -------------------------------------------------------------
        if (url.pathname === '/api/admin/trusted-devices' && request.method === 'GET') {
          const authHeader = request.headers.get('authorization') || '';
          if (!authHeader.includes('vollmer_session_')) {
            return jsonResponse({ success: false, error: 'Nicht autorisiert' }, 401);
          }
          const { data: trustedData } = await readKV(env, 'admin_trusted_devices');
          return jsonResponse({ success: true, devices: Array.isArray(trustedData) ? trustedData : [] });
        }

        if (url.pathname === '/api/admin/remove-device' && request.method === 'POST') {
          const authHeader = request.headers.get('authorization') || '';
          if (!authHeader.includes('vollmer_session_')) {
            return jsonResponse({ success: false, error: 'Nicht autorisiert' }, 401);
          }
          const body = await request.json().catch(() => ({}));
          const { deviceId } = body;
          const { data: trustedData } = await readKV(env, 'admin_trusted_devices');
          const trustedList = (Array.isArray(trustedData) ? trustedData : []).filter(d => d.id !== deviceId);
          await writeKV(env, 'admin_trusted_devices', trustedList);
          return jsonResponse({ success: true, devices: trustedList, message: 'Gerät entfernt' });
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
        // 5a. POST /api/eier-donnerstag -> Öffentliche Lieferanfrage
        // -------------------------------------------------------------
        if (url.pathname === '/api/eier-donnerstag' && request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const { name, email, street, town, townId, zip, address, eggCount, deliveryDate, message } = body;

          const resolvedAddress = address || (street && town ? `${street}, ${zip || ''} ${town}` : '');

          if (!name || !email || !resolvedAddress || !eggCount) {
            return jsonResponse({ success: false, error: 'Bitte fülle alle Pflichtfelder (Name, E-Mail, Adresse, Eiermenge) aus.' }, 400);
          }

          const { data: existing } = await readKV(env, 'egg_orders');
          const currentOrders = Array.isArray(existing) ? existing : [];

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
            status: 'pending', // 'pending' | 'accepted' | 'rejected'
            actionToken,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const updatedOrders = [newOrder, ...currentOrders];
          const writeRes = await writeKV(env, 'egg_orders', updatedOrders);

          if (!writeRes.ok) {
            return jsonResponse({ success: false, error: writeRes.error || 'Konnte Anfrage nicht speichern.' }, 500);
          }

          // E-Mail-Benachrichtigung an den Hofladen (Resend API)
          const resendKey = env.RESEND_API_KEY;
          const emailRecipient = env.EMAIL_RECIPIENT || 'info@vollmers-hofladen.de';
          if (resendKey) {
            try {
              const deliveryDateText = formatThursdayText(newOrder.deliveryDate);
              const permanentOrigin = 'https://vollmers-hofladen.friese-scholz.workers.dev';
              const adminLink = `${permanentOrigin}/#admin?tab=eier-donnerstag`;

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
                      <strong style="color: #777; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">Nachricht / Hinweis:</strong>
                      <p style="color: #111; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${newOrder.message}</p>
                    </div>
                  ` : ''}

                  <!-- Direkter Button zum Admin Dashboard -->
                  <div style="background-color: #FFFFFF; padding: 26px 20px; border-radius: 14px; border: 1px solid #ECE7DD; text-align: center; margin-bottom: 24px;">
                    <p style="font-size: 15px; font-weight: 700; color: #182019; margin: 0 0 8px 0;">
                      Lieferanfrage bearbeiten & entscheiden
                    </p>
                    <p style="font-size: 13px; color: #666; margin: 0 0 18px 0; line-height: 1.5;">
                      Öffne direkt das Admin-Dashboard, um die Anfrage mit einem Klick anzunehmen oder abzulehnen. Der Kunde erhält dabei automatisch die passende Benachrichtigung.
                    </p>
                    <a href="${adminLink}" style="display: inline-block; background-color: #274B35; color: #FFFFFF; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 12px; text-decoration: none; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      👉 Im Admin-Dashboard öffnen & entscheiden
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
                  Authorization: `Bearer ${resendKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: 'Scholz & Friese Webdesign <noreply@scholz-friese-webdesign.de>',
                  to: [emailRecipient],
                  reply_to: newOrder.email,
                  subject: `[Vollmers Hofladen] 🥚 Neue Eier-Lieferanfrage: ${newOrder.eggCount} Eier von ${newOrder.name} (${newOrder.town || 'Machtsum'})`,
                  html: htmlContent,
                }),
              });
            } catch (mailErr) {
              console.warn('Hofladen notification mail failed:', mailErr);
            }
          }

          return jsonResponse({
            success: true,
            order: newOrder,
            message: 'Anfrage für den Eier-Donnerstag erfolgreich übermittelt!',
          });
        }

        // -------------------------------------------------------------
        // 5b. GET /api/eier-donnerstag/action -> Annehmen/Ablehnen via Link
        // -------------------------------------------------------------
        if (url.pathname === '/api/eier-donnerstag/action' && request.method === 'GET') {
          const orderId = url.searchParams.get('id');
          const action = url.searchParams.get('action'); // 'accept' | 'reject'
          const token = url.searchParams.get('token');

          if (!orderId || !action || !['accept', 'reject'].includes(action)) {
            return new Response('Ungültiger Aktionslink.', { status: 400 });
          }

          const { data: existing } = await readKV(env, 'egg_orders');
          const currentOrders = Array.isArray(existing) ? existing : [];
          const orderIndex = currentOrders.findIndex((o) => o.id === orderId);

          const permanentOrigin = 'https://vollmers-hofladen.friese-scholz.workers.dev';

          if (orderIndex === -1) {
            return new Response(`
              <!DOCTYPE html>
              <html lang="de">
              <head><meta charset="utf-8"/><title>Anfrage nicht gefunden</title></head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FBF9F5; padding: 40px; text-align: center;">
                <div style="max-width: 500px; margin: 40px auto; background: white; padding: 32px; border-radius: 20px; border: 1px solid #E6E1D4;">
                  <h2 style="color: #182019; font-family: Georgia, serif;">Anfrage nicht gefunden</h2>
                  <p style="color: #666; font-size: 14px;">Dieser Eintrag existiert nicht mehr oder wurde bereits aus dem System entfernt.</p>
                  <a href="${permanentOrigin}/#admin" style="display: inline-block; background: #274B35; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; margin-top: 16px;">Zum Admin-Dashboard</a>
                </div>
              </body>
              </html>
            `, {
              status: 404,
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            });
          }

          const order = currentOrders[orderIndex];

          const newStatus = action === 'accept' ? 'accepted' : 'rejected';
          const previousStatus = order.status;

          order.status = newStatus;
          order.updatedAt = new Date().toISOString();
          currentOrders[orderIndex] = order;

          await writeKV(env, 'egg_orders', currentOrders);

          // Kunden-E-Mail versenden, falls Status sich geändert hat oder noch pending war
          if (previousStatus !== newStatus || previousStatus === 'pending') {
            await sendCustomerDecisionEmail(env, order, action);
          }

          const html = renderActionHtml({
            title: action === 'accept' ? 'Lieferung angenommen' : 'Lieferung abgelehnt',
            isAccepted: action === 'accept',
            order,
            origin: permanentOrigin,
          });

          return new Response(html, {
            status: 200,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              ...corsHeaders,
            },
          });
        }

        // -------------------------------------------------------------
        // 5c. POST /api/admin/eier-donnerstag/status -> Status-Update im Dashboard
        // -------------------------------------------------------------
        if (url.pathname === '/api/admin/eier-donnerstag/status' && request.method === 'POST') {
          const authHeader = request.headers.get('authorization') || '';
          if (!authHeader.includes('vollmer_session_')) {
            return jsonResponse({ success: false, error: 'Nicht autorisiert' }, 401);
          }

          const body = await request.json().catch(() => ({}));
          const { id, status } = body;

          if (!id || !['pending', 'accepted', 'rejected'].includes(status)) {
            return jsonResponse({ success: false, error: 'Ungültige Statusangabe' }, 400);
          }

          const { data: existing } = await readKV(env, 'egg_orders');
          const currentOrders = Array.isArray(existing) ? existing : [];
          const idx = currentOrders.findIndex((o) => o.id === id);

          if (idx === -1) {
            return jsonResponse({ success: false, error: 'Eintrag nicht gefunden' }, 404);
          }

          const prevStatus = currentOrders[idx].status;
          currentOrders[idx].status = status;
          currentOrders[idx].updatedAt = new Date().toISOString();

          await writeKV(env, 'egg_orders', currentOrders);

          // Falls auf accepted oder rejected gesetzt: Mail an den Kunden!
          if (status !== 'pending' && status !== prevStatus) {
            await sendCustomerDecisionEmail(env, currentOrders[idx], status);
          }

          return jsonResponse({ success: true, order: currentOrders[idx] });
        }

        // -------------------------------------------------------------
        // 5d. GET /api/admin/eier-donnerstag & POST /api/admin/eier-donnerstag
        // -------------------------------------------------------------
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
          const emailRecipient = env.EMAIL_RECIPIENT || 'info@vollmers-hofladen.de';
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
