export async function onRequestPost(context) {
  const { request, env } = context;

  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.includes('vollmer_session_')) {
    return new Response(JSON.stringify({ success: false, error: 'Nicht autorisiert' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = env.CLOUDFLARE_API_TOKEN;
  const kvNsId = env.KV_NAMESPACE_ID;

  try {
    const { products } = await request.json();
    if (!Array.isArray(products)) {
      return new Response(JSON.stringify({ success: false, error: 'Ungültiges Produkt-Array' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Direct binding if available
    if (env.VOLLMERS_KV && typeof env.VOLLMERS_KV.put === 'function') {
      await env.VOLLMERS_KV.put('products', JSON.stringify(products));
      return new Response(JSON.stringify({ success: true, message: 'Produkte in KV gespeichert' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // REST API fallback
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNsId}/values/products`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(products)
    });

    if (res.ok) {
      return new Response(JSON.stringify({ success: true, message: 'Produkte erfolgreich in Cloudflare KV aktualisiert!' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const err = await res.text();
    return new Response(JSON.stringify({ success: false, error: 'KV Fehler: ' + err }), {
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
