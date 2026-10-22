export const config = { runtime: 'edge' };

// ---------- Modelos permitidos ----------
const MODELS = {
  haiku: 'claude-haiku-5-5',
  sonnet: 'claude-sonnet-5-5',
  opus: 'claude-opus-5-5',
};

// ---------- Tareas permitidas ----------
// El cliente solo elige la tarea y manda datos.
// Modelo, tope de salida y prompt se definen aquí, en el servidor.
const TASKS = {
  test: {
    model: MODELS.haiku,
    max_tokens: 100,
    system: 'Responde en español, en una sola oración.',
    build: () => 'Confirma que la conexión entre SEO Pulse y Claude funciona.',
  },
  // Aquí se irán agregando: anticanibal, brief, article, decay, ctr...
};

const MAX_BODY_CHARS = 60000;

// ---------- Utilidades ----------
function allowedOrigin() {
  return process.env.ALLOWED_ORIGIN || 'https://seo-pulse-dusky.vercel.app';
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': allowedOrigin(),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };
}

function J(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

// Valida el token de Google: que sea de tu Client ID y de tu email.
async function verifyGoogleToken(token) {
  try {
    const r = await fetch('https://oauth2.googleapis.com/tokeninfo?access_token=' + encodeURIComponent(token));
    if (!r.ok) return false;
    const info = await r.json();
    const cid = process.env.GOOGLE_CLIENT_ID;
    const email = (process.env.ALLOWED_EMAIL || '').trim().toLowerCase();
    const audOk = info.aud === cid || info.azp === cid;
    const emailOk = !!email && (info.email || '').toLowerCase() === email && String(info.email_verified) === 'true';
    const aliveOk = Number(info.expires_in) > 0;
    return audOk && emailOk && aliveOk;
  } catch {
    return false;
  }
}

// ---------- Handler ----------
export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders() });
  if (req.method !== 'POST') return J({ error: 'Método no permitido' }, 405);

  const { ANTHROPIC_API_KEY, GOOGLE_CLIENT_ID, ALLOWED_EMAIL } = process.env;
  if (!ANTHROPIC_API_KEY || !GOOGLE_CLIENT_ID || !ALLOWED_EMAIL) {
    return J({ error: 'Faltan variables de entorno en Vercel' }, 500);
  }

  // 1. Origen
  if (req.headers.get('origin') !== allowedOrigin()) return J({ error: 'Origen no permitido' }, 403);

  // 2. Identidad (token de Google)
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token || !(await verifyGoogleToken(token))) return J({ error: 'No autorizado' }, 401);

  // 3. Tamaño y formato del input
  const raw = await req.text();
  if (raw.length > MAX_BODY_CHARS) return J({ error: 'Input demasiado grande' }, 413);
  let body;
  try { body = JSON.parse(raw); } catch { return J({ error: 'JSON inválido' }, 400); }

  // 4. Tarea en lista blanca
  const task = TASKS[body.task];
  if (!task) return J({ error: 'Tarea no permitida' }, 400);

  let prompt;
  try { prompt = task.build(body.data || {}); } catch { return J({ error: 'Datos inválidos para la tarea' }, 400); }

  // 5. Llamada a Claude con streaming
  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: task.model,
      max_tokens: task.max_tokens,
      system: task.system,
      stream: true,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!upstream.ok) {
    let msg = 'Error de la API de Claude';
    try { msg = JSON.parse(await upstream.text()).error?.message || msg; } catch {}
    return J({ error: msg }, upstream.status);
  }

  return new Response(upstream.body, {
    status: 200,
    headers: { ...corsHeaders(), 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store' },
  });
}
