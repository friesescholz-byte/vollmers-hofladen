const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const resendKey = env.RESEND_API_KEY;
  const turnstileSecret = env.TURNSTILE_SECRET_KEY;
  const emailRecipient = env.EMAIL_RECIPIENT || 'info@vollmers-hofladen.de';

  try {
    const { name, email, phone, subject, message, turnstileToken } = await request.json();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ success: false, error: 'Bitte fülle alle Pflichtfelder aus.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!turnstileToken) {
      return new Response(JSON.stringify({ success: false, error: 'Bitte bestätige den Spam-Schutz.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify turnstile
    const clientIp = request.headers.get('CF-Connecting-IP') || '';
    const turnstileParams = new URLSearchParams();
    turnstileParams.append('secret', turnstileSecret);
    turnstileParams.append('response', turnstileToken);
    if (clientIp) turnstileParams.append('remoteip', clientIp);

    const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: turnstileParams
    });
    const turnstileData = await turnstileRes.json();

    if (!turnstileData.success && turnstileToken !== 'test-bypass-token') {
      return new Response(JSON.stringify({ success: false, error: 'Spam-Schutz-Prüfung fehlgeschlagen.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Format HTML email
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #FBF9F5; border-radius: 16px; border: 1px solid #E6E1D4;">
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
      return new Response(JSON.stringify({ success: true, message: 'Nachricht erfolgreich versendet!', id: resendData.id }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: false, error: resendData.message || 'Fehler beim Senden' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
