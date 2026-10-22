export const config = { runtime: 'edge' };

// ---------- Modelos permitidos ----------
const MODELS = {
  haiku: 'claude-haiku-5-5',
  sonnet: 'claude-sonnet-5-5',
  opus: 'claude-opus-5-5',
};

// ---------- Plantillas de País Lector para briefs ----------
const BRIEF_TEMPLATES = {
  resena: {
    nombre: 'Reseña (cuento o novela)',
    spec: [
      '- URL tipo: /resena-de-[titulo]-de-[autor]/ o /[titulo]-de-[autor]/. Categoría: Reseñas (o Novelas/Cuentos según el caso).',
      '- Antetítulo: "Reseña · Cuento|Novela · [año de publicación]".',
      '- H1 en uno de estos moldes: "*Título* de Autor: de qué trata y por qué no lo olvidarás" o "Reseña de *Título* de Autor".',
      '- Bajada de 2-3 oraciones bajo el H1 (promesa honesta, "sin academia").',
      '- Intro de 2 párrafos en primera persona del editor (Andrés Rendón): gancho + a quién le sirve la reseña.',
      '- Ficha "Datos esenciales" (cada valor marcado [VERIFICAR]): Autor, Título u Original, Publicado, Publicación/Editorial original, Libro recopilatorio (si es cuento), Género, Extensión, Idioma original, Dificultad (nivel + motivo), Traducción (si aplica), Vida autor, Tema dominante o Premios, Tiempo de lectura.',
      '- Índice FIJO de 6 secciones, numeradas 01-06: 01 ¿De qué trata *X*? · 02 ¿Vale la pena leerlo/a? · 03 ¿Qué lo/la hace especial? · 04 ¿Por qué importa en [año en curso]? · 05 ¿Dónde leer *X* completo/a? · 06 El veredicto.',
      '- 01: H2 "De qué trata *X* de Autor"; 3 párrafos de sinopsis sin spoilers grandes + cita destacada [PEGAR CITA — fuente].',
      '- 02: H2 "¿Vale la pena leer *X* hoy?"; 3-4 párrafos, respuesta directa en la primera línea.',
      '- 03: H2 con gancho ("Por qué ... sigue obsesionando lectores"); exactamente 3 razones numeradas 01-03 como H3, un párrafo cada una.',
      '- 04: H2 "Por qué *X* sigue siendo vigente en [año]"; conexión con el presente (2-3 párrafos).',
      '- 05: H2 "Dónde leer..." + botón. Si la obra es de dominio público: enlazar /obras/ propia o fuente pública. Si tiene derechos: SOLO compra o lectura autorizada; nunca enlaces a copias completas.',
      '- 06 Veredicto: H2 frase-sentencia; 2 párrafos; bloques "Para ti, si" y "Sáltatelo, si" (una lista corrida cada uno).',
      '- Bloque "Compra el libro": edición recomendada [VERIFICAR] + enlace afiliado Gandhi [PEGAR URL].',
      '- FAQ de 8-10 preguntas reales (prioriza queries de GSC y sugerencias): de qué trata, cuándo se publicó, significado del título, género, extensión, dificultad, dónde leer, qué leer después, para qué edad.',
      '- Fuentes: 4-6 referencias bibliográficas [VERIFICAR].',
    ].join('\n'),
  },
  poemas: {
    nombre: 'Lista "N poemas de [autor]"',
    spec: [
      '- URL tipo: /poemas-de-[autor]/. Va en un bloque HTML personalizado con clases pl-*.',
      '- Intro de 3 párrafos cortos; la keyword en negritas en el primero; cerrar invitando a leer.',
      '- Índice "Índice: N poemas de [Autor] completos con análisis" (normalmente 10).',
      '- Por cada poema: número + título; H3 "\\"Título\\" – Autor"; texto del poema = [PEGAR POEMA COMPLETO — fuente sugerida]; línea de origen "De [Libro] ([año]) — poema completo" [VERIFICAR]; H4 "Sobre este poema" con 3 párrafos de análisis (indica el ÁNGULO de cada uno); enlace interno si existe una página propia de ese poema; nota "Texto tomado de [fuente]".',
      '- FAQ de 5 preguntas (poema más famoso, mejores frases, significado de un poema clave, de qué libros vienen, poemas de amor/tema más buscado).',
      '- Cierre de 2 párrafos con la keyword en negritas.',
      '- "Fuentes consultadas": sitios de donde se toman los textos.',
      '- Campos personalizados WP: Emoción principal (una de: Amor, Desamor, Nostalgia, Tristeza, Soledad, Rabia, Duelo, Alegría, Esperanza, Erotismo, Confusión, Identidad, Muerte, Naturaleza, Política), País de origen, Autor (nombre limpio), Es traducción propia (Sí/No), Movimiento literario (corto). Recomienda también el TAG con el nombre de la emoción.',
    ].join('\n'),
  },
  cuentos: {
    nombre: 'Lista "Los 10 mejores cuentos de [autor]"',
    spec: [
      '- URL tipo: /cuentos-de-[autor]/. Categoría: Cuentos › [Autor].',
      '- H1: "Los 10 mejores cuentos de [Autor]: [subtítulo con gancho]".',
      '- Intro de 2 párrafos; keyword en negritas; contexto del libro de donde vienen la mayoría.',
      '- Índice "Índice: 10 cuentos de [Autor] completos con análisis".',
      '- Por cada cuento: número; H3 "“Título” — Autor"; sinopsis de 1 párrafo; cita breve = [PEGAR CITA LITERAL — copiar de la fuente]; H4 "Sobre este cuento" con 1 párrafo de análisis (indica el ángulo); línea "Cuento completo de *[Libro]* ([Editorial], [año]). Lee **“Título” completo** en [fuente]" [VERIFICAR].',
      '- H3 de semblanza del autor (3 párrafos).',
      '- FAQ de 7 preguntas.',
      '- "Sobre las fuentes" (ediciones y sitios) y "Sigue leyendo" con enlaces internos.',
    ].join('\n'),
  },
  archivo: {
    nombre: 'Archivo: carta o texto histórico',
    spec: [
      '- Sección Archivo › Cartas (o el tipo de texto). Antetítulo: "Carta · [Mes] de [Año]".',
      '- H1 con gancho humano (molde: "El consejo que [Autor] escribió a los [N] años.").',
      '- Encabezado DE / PARA con lugar.',
      '- Ficha del remitente: fechas de vida, lugar, bio de 2-3 oraciones, edad al escribir, antología/edición, editor [VERIFICAR todo].',
      '- 01 Preámbulo del editor: H2 "Por qué leemos hoy..."; 2-3 párrafos en primera persona + firma.',
      '- 02 El texto íntegro = [PEGAR TRADUCCIÓN PROPIA]. Sugiere 3 notas del editor (dónde van y qué dicen).',
      '- 03 "Lo que queda después": reflexión de 2-3 párrafos.',
      '- Secciones de contexto: Sobre esta carta · El mensaje central · ¿Por qué la escribió? · Las frases más citadas (tomadas LITERALMENTE de la traducción, marcar [COTEJAR]) · ¿Dónde está publicada? (primera publicación [VERIFICAR]) · Otros textos del archivo.',
      '- FAQ de 6 preguntas. Bloque "Sigue leyendo".',
      '- La numeración de secciones debe ser consecutiva.',
    ].join('\n'),
  },
  obra: {
    nombre: 'Obra para leer gratis (/obras/)',
    spec: [
      '- Tipo de contenido Obras, URL /obras/[slug]/. SOLO para textos en dominio público.',
      '- Title SEO molde: "[Título] de [Autor] — Leer gratis en español". Meta: "Lee [Título] de [Autor] completo, gratis y en español. [Género] de [año] sobre [temas]."',
      '- Cabecera: "[Cuento|Novela|Poema] · Lectura gratuita", título, autor (enlace a /autor/), "[año] · Dominio público · [N] min".',
      '- Texto íntegro = [PEGAR TRADUCCIÓN PROPIA].',
      '- H2 "Sobre esta traducción": párrafo de contexto (primera publicación: medio, ciudad, fecha [VERIFICAR]; obras hermanas del autor) + párrafo de fuente (texto original usado y edición cotejada).',
      '- H2 "Más sobre [Autor]": 2-3 fuentes externas de autoridad + enlaces internos a otras obras/poemas del autor.',
    ].join('\n'),
  },
};

const BRIEF_SYSTEM = [
  'Eres el editor SEO de País Lector, revista literaria independiente mexicana: anti-académica, irreverente, latinoamericana. Voz: visceral, directa, metáforas corporales, frases cortas que golpean; nada de tono de enciclopedia ni clichés de autoayuda.',
  'Tu trabajo: producir un BRIEF accionable en Markdown, no el artículo. El editor (Andrés Rendón) lo usará para escribir o para generar el borrador.',
  '',
  'REGLAS DE INTEGRIDAD (obligatorias):',
  '1. Nunca escribas versos, citas literales ni fragmentos de obras. Usa marcadores [PEGAR ...] indicando la fuente sugerida.',
  '2. Todo dato factual que venga de tu memoria (años, editoriales, títulos de libros, primeras publicaciones, premios, traductores, fechas de vida) va marcado [VERIFICAR]. No inventes títulos: si dudas, dilo.',
  '3. Enlaces internos: usa SOLO URLs de la lista proporcionada. Nunca inventes URLs del sitio.',
  '4. Respeta el veredicto de canibalización: si es "diferenciar", el brief entero debe seguir el ángulo sugerido y evitar el foco de las páginas en conflicto; si es "actualizar", empieza advirtiéndolo y explica qué cambiaría el enfoque.',
  '5. Keywords secundarias y FAQ: prioriza queries reales de GSC y sugerencias de Google; no rellenes con preguntas inventadas si hay datos.',
  '',
  'SELECCIÓN AUTOMÁTICA DE PLANTILLA (si se pide AUTO): "poemas de/del/sobre X" → poemas; "cuentos de X" → cuentos; "reseña", "de qué trata", "resumen", "vale la pena", "análisis" de UNA obra → resena; "carta de/a X", textos históricos, manifiestos, discursos → archivo; "leer gratis", "completo", "pdf" de una obra en dominio público → obra. Si es ambiguo, elige la más adecuada a la intención y explica por qué en una línea.',
  '',
  'FORMATO DE SALIDA (Markdown, en este orden, con estos títulos exactos):',
  '# Brief: [keyword]',
  '## 1. Resumen',
  '- Plantilla, intención de búsqueda (una línea), veredicto de canibalización y qué implica, ángulo central del artículo (2-3 oraciones).',
  '## 2. SEO',
  '- Title para Rank Math (≤60 caracteres, incluye la keyword) · Meta description (≤155) · Slug · H1 · Focus keyword · Keywords secundarias (5-10, con su fuente: GSC/sugerencia).',
  '## 3. Estructura',
  '- La estructura COMPLETA de la plantilla, sección por sección, con lo que debe contener cada una y el ángulo concreto para esta keyword. Incluye los ítems propuestos (poemas/cuentos/razones) marcados [VERIFICAR].',
  '## 4. FAQ propuestas',
  '- Lista de preguntas, marcando cuáles vienen de GSC o sugerencias.',
  '## 5. Enlaces internos',
  '- URL → anchor sugerido → dónde va. Solo de la lista.',
  '## 6. Campos de WordPress',
  '- Categoría, tags y campos personalizados que apliquen a la plantilla.',
  '## 7. Secciones nuevas recomendadas (solo si se piden)',
  '- Por cada una: H2 propuesto · por qué (el dato concreto de GSC/sugerencias o la brecha de intención que la justifica) · dónde va dentro de la estructura · qué cubre (2-3 líneas). Si no hay datos que justifiquen alguna, dilo en vez de forzarla.',
  '## 8. Datos a verificar antes de publicar',
  '- Checklist con "- [ ]" de cada dato marcado [VERIFICAR] o [PEGAR] en el brief.',
].join('\n');

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

  // Generador de briefs por plantilla de País Lector.
  brief: {
    model: MODELS.sonnet,
    max_tokens: 6000,
    system: () => BRIEF_SYSTEM,
    build: (data) => {
      const keyword = String(data.keyword || '').trim().slice(0, 200);
      if (!keyword) throw new Error('keyword vacía');
      const tipo = BRIEF_TEMPLATES[data.tipo] ? data.tipo : 'auto';
      const extra = Math.max(0, Math.min(3, parseInt(data.extra, 10) || 0));
      const year = parseInt(data.year, 10) || new Date().getFullYear();
      const clip = (s, n) => String(s == null ? '' : s).slice(0, n);
      const queries = (Array.isArray(data.queries) ? data.queries : []).slice(0, 40)
        .map((q) => '- ' + clip(q.q, 150) + ' | ' + Math.round(+q.impressions || 0) + ' impr | pos ' + (+q.position || 0).toFixed(1));
      const sugg = (Array.isArray(data.suggestions) ? data.suggestions : []).slice(0, 30).map((s) => '- ' + clip(s, 150));
      const pages = (Array.isArray(data.pages) ? data.pages : []).slice(0, 50)
        .map((p) => '- ' + clip(p.url, 300) + ' (' + Math.round(+p.impressions || 0) + ' impr)');
      const c = data.canibal && typeof data.canibal === 'object' ? data.canibal : null;
      const canibal = c
        ? 'Veredicto: ' + clip(c.veredicto, 20) + '\nResumen: ' + clip(c.resumen, 600) +
          (c.angulo_sugerido ? '\nÁngulo sugerido: ' + clip(c.angulo_sugerido, 800) : '') +
          (c.url_principal ? '\nURL principal existente: ' + clip(c.url_principal, 300) : '') +
          (Array.isArray(c.conflictos) && c.conflictos.length
            ? '\nConflictos:\n' + c.conflictos.slice(0, 5).map((x) => '- ' + clip(x.url, 300) + ' [' + clip(x.riesgo, 10) + '] ' + clip(x.motivo, 300)).join('\n')
            : '')
        : 'Sin chequeo disponible.';
      const plantilla = tipo === 'auto'
        ? 'AUTO: elige tú la plantilla según la keyword y la intención (reglas abajo). Plantillas disponibles:\n\n' +
          Object.entries(BRIEF_TEMPLATES).map(([k, t]) => '### ' + k + ' — ' + t.nombre + '\n' + t.spec).join('\n\n')
        : 'Plantilla elegida por el editor: ' + tipo + ' — ' + BRIEF_TEMPLATES[tipo].nombre + '\n' + BRIEF_TEMPLATES[tipo].spec;
      return [
        'Keyword objetivo: "' + keyword + '"',
        'Sitio: ' + clip(data.site, 100) + ' | Año en curso: ' + year,
        '',
        '## Chequeo de canibalización',
        canibal,
        '',
        '## Queries reales de Search Console relacionadas (90 días)',
        queries.length ? queries.join('\n') : '(ninguna)',
        '',
        '## Sugerencias de autocompletado de Google',
        sugg.length ? sugg.join('\n') : '(ninguna)',
        '',
        '## URLs existentes del sitio (ÚNICAS válidas para enlaces internos)',
        pages.length ? pages.join('\n') : '(ninguna)',
        '',
        '## Plantilla',
        plantilla,
        '',
        '## Secciones nuevas',
        extra > 0
          ? 'Recomienda ' + extra + ' sección(es) NUEVA(S) que no estén en la plantilla (formato abajo).'
          : 'No recomiendes secciones nuevas; omite ese apartado.',
        '',
        '## Notas del editor',
        clip(data.notes, 2000) || '(ninguna)',
      ].join('\n');
    },
  },
  // Siguientes: article, decay, ctr...
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
      system: typeof task.system === 'function' ? task.system() : task.system,
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
