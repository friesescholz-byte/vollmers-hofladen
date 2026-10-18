const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.includes('vollmer_session_')) {
    return new Response(JSON.stringify({ success: false, error: 'Nicht autorisiert' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = env.CLOUDFLARE_API_TOKEN;
  const r2Bucket = env.R2_BUCKET_NAME || 'website-datein';

  try {
    const { filename, base64 } = await request.json();
    if (!base64) {
      return new Response(JSON.stringify({ success: false, error: 'Keine Bilddaten empfangen' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const cleanName = (filename || 'produkt_' + Date.now())
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    const r2Key = `Vollmers-Hofladen/Produkte/${cleanName}_${Date.now()}.webp`;

    const rawData = atob(base64.replace(/^data:image\/\w+;base64,/, ''));
    const byteNumbers = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
      byteNumbers[i] = rawData.charCodeAt(i);
    }

    // Direct R2 bucket binding if configured
    if (env.R2_BUCKET && typeof env.R2_BUCKET.put === 'function') {
      await env.R2_BUCKET.put(r2Key, byteNumbers.buffer, {
        httpMetadata: { contentType: 'image/webp' }
      });
      const publicUrl = `https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/${r2Key}`;
      return new Response(JSON.stringify({ success: true, url: publicUrl }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Cloudflare R2 REST API
    const r2Url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${r2Bucket}/objects/${r2Key}`;
    const r2Res = await fetch(r2Url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'image/webp'
      },
      body: byteNumbers.buffer
    });

    if (r2Res.ok) {
      const publicUrl = `https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/${r2Key}`;
      return new Response(JSON.stringify({ success: true, url: publicUrl }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const err = await r2Res.text();
    return new Response(JSON.stringify({ success: false, error: 'R2 Upload Fehler: ' + err }), {
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
