const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

export async function onRequestGet(context) {
  const { env } = context;

  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = env.CLOUDFLARE_API_TOKEN;
  const kvNsId = env.KV_NAMESPACE_ID;

  try {
    // Falls KV direkt gebunden ist (env.VOLLMERS_KV)
    if (env.VOLLMERS_KV && typeof env.VOLLMERS_KV.get === 'function') {
      const data = await env.VOLLMERS_KV.get('products', { type: 'json' });
      if (data) {
        return new Response(JSON.stringify({ success: true, source: 'kv-binding', products: data }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Abruf über Cloudflare KV REST API
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNsId}/values/products`, {
      headers: { 'Authorization': `Bearer ${apiToken}` }
    });

    if (res.ok) {
      const data = await res.json();
      return new Response(JSON.stringify({ success: true, source: 'kv-api', products: data }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'KV nicht erreichbar' }), {
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
