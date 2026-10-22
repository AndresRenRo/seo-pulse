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
    system: 'Responde exactamente con el texto que se te pide, sin agregar nada.',
    build: () => 'Responde solo: Conexión con SEO Pulse OK.',
  },

  // Chequeo de canibalización antes de crear contenido nuevo.
  anticanibal: {
    model: MODELS.sonnet,
    max_tokens: 1200,
    system: [
      'Eres un estratega SEO senior. Evalúas riesgo de canibalización de keywords para un sitio en español.',
      'Recibes una keyword candidata para un artículo NUEVO y las páginas del sitio que ya reciben impresiones en Google por queries relacionadas (datos de Search Console, últimos 90 días).',
      'Juzga por INTENCIÓN DE BÚSQUEDA, no por coincidencia de palabras: dos queries con palabras distintas pueden competir, y dos con palabras parecidas pueden tener intenciones distintas.',
      'Veredictos posibles:',
      '- "crear": ninguna página existente cubre esa intención; el artículo nuevo es seguro.',
      '- "actualizar": ya existe una página que cubre esa intención; conviene mejorarla en vez de crear otra.',
      '- "diferenciar": hay páginas cercanas; el artículo nuevo es viable solo con un ángulo o intención distintos, que debes proponer.',
      'Responde SOLO con un objeto JSON válido, sin texto antes ni después y sin bloques de código, con esta forma:',
      '{"veredicto":"crear|actualizar|diferenciar","url_principal":"URL o null","resumen":"1-2 oraciones","conflictos":[{"url":"...","riesgo":"alto|medio|bajo","motivo":"una oración"}],"angulo_sugerido":"texto o null"}',
      'Incluye en conflictos solo páginas con riesgo real, máximo 5. Usa url_principal solo si el veredicto es "actualizar".',
    ].join('\n'),
    build: (data) => {
      const keyword = String(data.keyword || '').trim().slice(0, 200);
      if (!keyword) throw new Error('keyword vacía');
      const site = String(data.site || '').slice(0, 100);
      const pages = (Array.isArray(data.pages) ? data.pages : []).slice(0, 15).map((pg) => ({
        url: String(pg.url || '').slice(0, 300),
        impresiones: Math.round(Number(pg.impressions) || 0),
        clics: Math.round(Number(pg.clicks) || 0),
        mejor_posicion: Number(Number(pg.position || 0).toFixed(1)),
        queries: (Array.isArray(pg.queries) ? pg.queries : []).slice(0, 8).map((q) => ({
          q: String(q.q || '').slice(0, 150),
          impresiones: Math.round(Number(q.impressions) || 0),
          posicion: Number(Number(q.position || 0).toFixed(1)),
        })),
      }));
      return 'Sitio: ' + site + '\nKeyword candidata: "' + keyword + '"\n\nPáginas existentes con queries relacionadas:\n' + JSON.stringify(pages, null, 1);
    },
  },
  // Siguientes: brief, article, decay, ctr...
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
