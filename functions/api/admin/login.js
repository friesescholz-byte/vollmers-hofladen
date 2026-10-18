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

  const adminPw = env.ADMIN_PASSWORD || env.Passwort;

  try {
    const { password } = await request.json();
    if (password === adminPw) {
      const token = 'vollmer_session_' + Date.now() + '_' + Math.random().toString(36).substring(2);
      return new Response(JSON.stringify({ success: true, token, message: 'Erfolgreich angemeldet' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Ungültiges Passwort' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
