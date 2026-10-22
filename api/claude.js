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
  '6. Si hay análisis de competencia, la estructura y el ángulo deben explotar sus huecos y diferenciarse de los formatos dominantes; nunca copies la estructura de un competidor.',
  '',
  'SELECCIÓN AUTOMÁTICA DE PLANTILLA (si se pide AUTO): "poemas de/del/sobre X" → poemas; "cuentos de X" → cuentos; "reseña", "de qué trata", "resumen", "vale la pena", "análisis" de UNA obra → resena; "carta de/a X", textos históricos, manifiestos, discursos → archivo; "leer gratis", "completo", "pdf" de una obra en dominio público → obra. Si es ambiguo, elige la más adecuada a la intención y explica por qué en una línea.',
  '',
  'FORMATO DE SALIDA (Markdown, en este orden, con estos títulos exactos):',
  '# Brief: [keyword]',
  '## 1. Resumen',
  '- Plantilla, intención de búsqueda (una línea), veredicto de canibalización y qué implica, ángulo central del artículo (2-3 oraciones).',
  '## 2. SEO',
  '- Title para Rank Math (≤60 caracteres, incluye la keyword) · Meta description (≤155) · Slug · H1 · Focus keyword · Keywords secundarias (5-10, con su fuente: GSC/sugerencia).',
  '## 3. Competencia',
  '- Si hay análisis: quién domina el SERP y con qué formato, los huecos concretos y cómo este artículo los aprovecha para ganar. Si no hay análisis, escribe una línea diciéndolo.',
  '## 4. Estructura',
  '- La estructura COMPLETA de la plantilla, sección por sección, con lo que debe contener cada una y el ángulo concreto para esta keyword. Incluye los ítems propuestos (poemas/cuentos/razones) marcados [VERIFICAR].',
  '## 5. FAQ propuestas',
  '- Lista de preguntas, marcando cuáles vienen de GSC o sugerencias.',
  '## 6. Enlaces internos',
  '- URL → anchor sugerido → dónde va. Solo de la lista.',
  '## 7. Campos de WordPress',
  '- Categoría, tags y campos personalizados que apliquen a la plantilla.',
  '## 8. Secciones nuevas recomendadas (solo si se piden)',
  '- Por cada una: H2 propuesto · por qué (el dato concreto de GSC/sugerencias o la brecha de intención que la justifica) · dónde va dentro de la estructura · qué cubre (2-3 líneas). Si no hay datos que justifiquen alguna, dilo en vez de forzarla.',
  '## 9. Datos a verificar antes de publicar',
  '- Checklist con "- [ ]" de cada dato marcado [VERIFICAR] o [PEGAR] en el brief.',
].join('\n');

// ---------- Plan (Etapa con razonamiento) ----------
const PLAN_SYSTEM = [
  'Eres el director de SEO de País Lector (revista literaria independiente mexicana; formatos: reseñas, listas de poemas y cuentos, archivo de cartas, obras para leer gratis). Lo opera una sola persona, Andrés, con tiempo limitado.',
  'Recibes: el roadmap de 7 fases del sitio con el estado de cada requisito y las notas del editor; los datos de Search Console y GA4; el estado de producción (briefs, chequeos, ideas guardadas) y el contexto que el editor escribió.',
  'Tu trabajo: RAZONAR cuál es el cuello de botella real y qué hacer, no repetir la checklist en orden.',
  'Criterios:',
  '- El roadmap es el marco, pero los datos mandan: si el sitio tiene pocas páginas con impresiones, producir pesa más que pulir schema; si muchas keywords están en posiciones 4-20, optimizar rinde más que producir; si hay caídas, atenderlas primero.',
  '- Lee y respeta las notas del editor: si una nota explica por qué algo está pendiente o en N/A, no lo contradigas sin un dato.',
  '- Toda afirmación sobre el sitio debe apoyarse en un número de los datos recibidos. Nunca inventes cifras; si falta un dato, dilo.',
  '- Sé concreto: "Escribe la reseña de X" o "Reescribe el title de /url/", no "mejora el contenido".',
  '- Las acciones apuntan a herramientas de SEO Pulse: produccion (con keyword), radar, etapa, pagina (con URL), o ninguna.',
  '- Español de México, directo, sin relleno.',
].join('\n');

function planContext(data) {
  const clip = (s, n) => String(s == null ? '' : s).slice(0, n);
  const j = (x, n) => clip(JSON.stringify(x == null ? null : x), n);
  return [
    'Fecha: ' + clip(data.fecha, 40),
    'Contexto del editor: ' + (clip(data.contexto, 1500) || '(ninguno)'),
    '',
    '## Roadmap (fases, requisitos y notas)', j(data.roadmap, 9000),
    '',
    '## Datos de búsqueda', j(data.datos, 9000),
    '',
    '## Producción', j(data.produccion, 4000),
    '',
    '## Plan vigente (si existe)', j(data.plan_anterior, 5000),
    '',
    '## Avance registrado', j(data.avance, 2000),
  ].join('\n');
}

// ---------- Lectura de páginas propias (solo tu dominio) ----------
async function fetchOwnPage(url) {
  const host = (process.env.SITE_HOST || 'paislector.com').toLowerCase();
  let u;
  try { u = new URL(String(url)); } catch { return { error: 'URL inválida' }; }
  const h = u.hostname.toLowerCase();
  if (!(h === host || h.endsWith('.' + host)) || !/^https?:$/.test(u.protocol)) return { error: 'Solo se leen páginas de ' + host };
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch(u.toString(), { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SEOPulse/1.0)' }, signal: ctrl.signal });
    clearTimeout(t);
    if (!r.ok) return { error: 'HTTP ' + r.status };
    const html = (await r.text()).slice(0, 600000);
    const pick = (re) => { const m = html.match(re); return m ? m[1].replace(/\s+/g, ' ').trim() : ''; };
    const dec = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
    const title = dec(pick(/<title[^>]*>([\s\S]*?)<\/title>/i));
    const meta = dec(pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) || pick(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i));
    const heads = [...html.matchAll(/<(h[1-3])[^>]*>([\s\S]*?)<\/\1>/gi)].slice(0, 40).map((m) => m[1].toUpperCase() + ': ' + dec(m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())).filter((x) => x.length > 4);
    const body = (html.match(/<article[\s\S]*?<\/article>/i) || html.match(/<main[\s\S]*?<\/main>/i) || [html])[0];
    const text = dec(body.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).slice(0, 12000);
    return { title, meta, encabezados: heads, palabras_aprox: text.split(' ').length, texto: text };
  } catch (e) {
    return { error: 'No se pudo leer: ' + (e.name === 'AbortError' ? 'tiempo agotado' : e.message) };
  }
}
const WEB_SEARCH_MX = (n) => [{ type: 'web_search_20250305', name: 'web_search', max_uses: n, user_location: { type: 'approximate', country: 'MX', timezone: 'America/Mexico_City' } }];

// ---------- Sitemap y enlaces de una página ----------
async function fetchText(url, ms) {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), ms || 6000);
  try { const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SEOPulse/1.0)' }, signal: ctrl.signal }); clearTimeout(t); return r.ok ? await r.text() : null; }
  catch { clearTimeout(t); return null; }
}
async function fetchSitemapUrls() {
  const host = (process.env.SITE_HOST || 'paislector.com').toLowerCase();
  const base = 'https://' + host;
  let root = null;
  for (const p of ['/sitemap_index.xml', '/sitemap.xml', '/wp-sitemap.xml']) { root = await fetchText(base + p); if (root && /<(sitemapindex|urlset)/i.test(root)) break; root = null; }
  if (!root) return { error: 'No encontré el sitemap', urls: [] };
  const locs = (xml) => [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1].replace(/&amp;/g, '&'));
  const own = (u) => { try { const h = new URL(u).hostname.toLowerCase(); return h === host || h.endsWith('.' + host); } catch { return false; } };
  let urls = [];
  if (/<sitemapindex/i.test(root)) {
    const subs = locs(root).filter(own).filter((u) => !/(author|category|tag|attachment|local)-sitemap/i.test(u)).slice(0, 12);
    const parts = await Promise.all(subs.map((u) => fetchText(u, 7000)));
    parts.forEach((x) => { if (x) urls.push(...locs(x)); });
  } else urls = locs(root);
  urls = [...new Set(urls.filter(own).filter((u) => !/\.(jpg|jpeg|png|webp|gif|pdf)$/i.test(u)))];
  return { urls: urls.slice(0, 3000), total: urls.length };
}
const LINK_STOP = new Set('de la el los las en y a para por con del que un una al lo se su sus es o como sobre sin le les mas'.split(' '));
function linkTokens(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').split(' ').filter((w) => w.length > 2 && !LINK_STOP.has(w)).map((w) => (w.length > 4 ? w.replace(/(es|s)$/, '') : w)); }
async function pageLinks(url) {
  const html = await fetchText(url, 8000);
  if (!html) return [];
  const body = (html.match(/<article[\s\S]*?<\/article>/i) || html.match(/<main[\s\S]*?<\/main>/i) || [html])[0];
  return [...new Set([...body.matchAll(/<a\s[^>]*href=["']([^"'#]+)["']/gi)].map((m) => m[1]))].slice(0, 200);
}

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
      const comp = data.competencia && typeof data.competencia === 'object' && !data.competencia.error ? data.competencia : null;
      const compTxt = comp ? JSON.stringify({ resultados: (comp.resultados || []).slice(0, 8).map((r) => ({ dominio: clip(r.dominio, 80), titulo: clip(r.titulo, 160), tipo: clip(r.tipo, 30), formato: clip(r.formato, 60), cubre: (r.cubre || []).slice(0, 5).map((x) => clip(x, 160)), fuerza: clip(r.fuerza, 10) })), patrones: (comp.patrones || []).slice(0, 6).map((x) => clip(x, 200)), huecos: (comp.huecos || []).slice(0, 6).map((x) => clip(x, 200)), angulo: clip(comp.angulo, 600), dificultad: clip(comp.dificultad, 10) }, null, 1) : '(sin análisis de competencia)';
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
        '## Competencia en Google México (análisis previo del SERP)',
        compTxt,
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

  // Radar · Vecinos: propone temporadas nuevas a partir de la cobertura actual.
  radar: {
    model: MODELS.sonnet,
    max_tokens: 5000,
    system: [
      'Eres el estratega editorial y SEO de País Lector, revista literaria independiente mexicana (anti-académica, latinoamericana, irreverente). Formatos que produce: reseña (de una obra), poemas (lista "N poemas de [autor]"), cuentos (lista "10 cuentos de [autor]"), archivo (cartas o textos históricos), obra (texto íntegro para leer gratis).',
      'Recibes el mapa de cobertura del sitio (sus URLs y las queries por las que Google ya lo muestra). Tu trabajo: proponer TEMPORADAS nuevas, es decir paquetes de 2-4 piezas sobre un mismo autor u obra que el sitio NO cubre todavía, cercanos a lo que ya cubre (mismo canon, misma época, misma sensibilidad, autores que sus lectores probablemente buscan después).',
      'Reglas:',
      '1. Nada que ya esté cubierto: revisa las URLs y queries; si un autor u obra ya tiene página, no lo propongas (salvo una pieza claramente distinta que no exista, y dilo).',
      '2. Las keywords van como las teclea la gente en Google en español: minúsculas, sin comillas, 2-6 palabras ("poemas de alejandra pizarnik", "el retrato de dorian gray resumen"). Una sola keyword por pieza.',
      '3. Mezcla: autores consagrados con alta demanda probable y apuestas de nicho con poca competencia. Prioriza Latinoamérica sin excluir clásicos universales.',
      '4. Para cada autor indica su año de muerte si lo sabes (null si vive o no estás seguro). No opines sobre derechos de autor.',
      '5. "por_que": una oración concreta que conecte con la cobertura existente (ej. "Tus lectores de Sabines buscan después a Rosario Castellanos").',
      'Responde SOLO con JSON válido, sin texto antes ni después y sin bloques de código:',
      '{"temporadas":[{"autor":"...","muerte":1900,"titulo":"Temporada ...","por_que":"...","piezas":[{"tipo":"resena|poemas|cuentos|archivo|obra","keyword":"...","pieza":"título corto de la pieza"}]}]}',
      'Entre 7 y 9 temporadas, 2-4 piezas cada una.',
    ].join('\n'),
    build: (data) => {
      const clip = (s, n) => String(s == null ? '' : s).slice(0, n);
      const urls = (Array.isArray(data.urls) ? data.urls : []).slice(0, 200).map((u) => '- ' + clip(u, 200));
      const queries = (Array.isArray(data.queries) ? data.queries : []).slice(0, 120).map((q) => '- ' + clip(q, 120));
      const exclude = (Array.isArray(data.exclude) ? data.exclude : []).slice(0, 80).map((x) => '- ' + clip(x, 120));
      return [
        'Sitio: ' + clip(data.site, 100),
        'Enfoque pedido por el editor: ' + (clip(data.focus, 300) || '(libre)'),
        '',
        '## URLs del sitio (cobertura actual)',
        urls.join('\n') || '(ninguna)',
        '',
        '## Queries con impresiones en Google (90 días)',
        queries.join('\n') || '(ninguna)',
        '',
        '## Ya propuestas o descartadas antes (no repetir)',
        exclude.join('\n') || '(ninguna)',
      ].join('\n');
    },
  },

  // Competencia: lee el SERP real con búsqueda web y lo resume.
  competencia: {
    model: MODELS.sonnet,
    max_tokens: 3500,
    tools: WEB_SEARCH_MX(3),
    system: [
      'Eres analista SEO de País Lector (revista literaria mexicana). Analizas la competencia en Google México para una keyword.',
      'Proceso: busca la keyword tal cual (y, si hace falta, una variante) con la herramienta de búsqueda. Identifica los 5-8 resultados orgánicos principales.',
      'Para cada resultado: dominio, título, url, tipo (wikipedia | medio | blog | academico | tienda | foro | video | otro), formato (lista, reseña, resumen, texto completo, análisis, ficha…), qué cubre (3-5 puntos cortos, PARAFRASEADOS, nunca citas textuales) y fuerza (alta | media | baja) con una razón breve.',
      'Luego: patrones (qué premia este SERP: formato, extensión, intención), huecos (qué no cubre bien nadie y País Lector puede ganar), ángulo recomendado (2-3 oraciones, voz de País Lector) y dificultad (alta | media | baja, con motivo).',
      'No escribas texto antes ni entre búsquedas. Al terminar, responde SOLO con JSON válido, sin bloques de código:',
      '{"resultados":[{"dominio":"","titulo":"","url":"","tipo":"","formato":"","cubre":["",""],"fuerza":"","razon":""}],"patrones":["",""],"huecos":["",""],"angulo":"","dificultad":"","dificultad_motivo":""}',
      'Si la búsqueda falla o no devuelve resultados, responde {"error":"motivo"}.',
    ].join('\n'),
    build: (data) => {
      const keyword = String(data.keyword || '').trim().slice(0, 200);
      if (!keyword) throw new Error('keyword vacía');
      return 'Keyword: "' + keyword + '"\nMercado: México, español.';
    },
  },

  // Plan estratégico: cuello de botella + mes + semana.
  plan: {
    model: MODELS.sonnet,
    max_tokens: 5000,
    system: () => PLAN_SYSTEM + '\n\n' + [
      'TAREA: genera el plan del MES y de la SEMANA.',
      'Responde SOLO con JSON válido, sin bloques de código:',
      '{"modo":"producir|optimizar|tecnico|autoridad|medir","cuello":{"titulo":"frase corta","dato":"el número exacto de los datos que lo prueba","explicacion":"2-3 oraciones"},',
      '"mes":{"objetivo":"una frase","fase_foco":4,"metas":[{"meta":"","indicador":"cómo se mide con los datos de SEO Pulse","por_que":""}]},',
      '"semana":{"foco":"una frase","tareas":[{"tarea":"concreta y accionable","por_que":"con dato","esfuerzo":"30 min | 2 h | medio día","accion":{"tipo":"produccion|radar|etapa|pagina|ninguna","valor":"keyword o URL si aplica"}}]},',
      '"esperar":["lo que NO conviene hacer ahora y por qué"],"notas_usadas":["qué notas del editor tomaste en cuenta"]}',
      '3-4 metas al mes, 4-7 tareas a la semana.',
    ].join('\n'),
    build: (data) => planContext(data),
  },

  // Prioridades del día a partir del plan vigente.
  plan_hoy: {
    model: MODELS.sonnet,
    max_tokens: 2000,
    system: () => PLAN_SYSTEM + '\n\n' + [
      'TAREA: elige las PRIORIDADES DE HOY (1 a 3) a partir del plan semanal vigente, de lo que ya se hizo y de los datos frescos.',
      'Si algo urgente apareció en los datos (una caída, una oportunidad nueva), puede desplazar al plan; dilo.',
      'Cada prioridad debe caber en el día y tener un primer paso obvio.',
      'Responde SOLO con JSON válido, sin bloques de código:',
      '{"hoy":[{"tarea":"","por_que":"con dato","esfuerzo":"30 min | 1 h | 2 h","accion":{"tipo":"produccion|radar|etapa|pagina|ninguna","valor":""}}],"nota":"una frase de contexto para el día"}',
    ].join('\n'),
    build: (data) => planContext(data),
  },

  // Verificador de datos del brief con búsqueda web.
  verificar: {
    model: MODELS.sonnet,
    max_tokens: 3500,
    tools: WEB_SEARCH_MX(5),
    system: [
      'Eres verificador de datos de País Lector (revista literaria). Recibes una lista numerada de datos de un brief que deben confirmarse antes de publicar.',
      'Usa la búsqueda web para comprobar los datos factuales (años, editoriales, primeras publicaciones, títulos, fechas de vida, premios, traductores, adaptaciones). Agrupa varios datos por búsqueda cuando puedas.',
      'Estados: "confirmado" (una fuente fiable lo respalda), "corregir" (las fuentes dicen otra cosa: da el dato correcto), "no_encontrado" (no hay evidencia suficiente), "manual" (no es verificable en web: pegar una cita, elegir una edición, un enlace de afiliado).',
      'Prefiere fuentes fiables: editoriales, bibliotecas, universidades, enciclopedias, medios culturales serios. Solo da URLs que aparecieron en tus resultados; nunca inventes una. Parafrasea, no copies texto.',
      'No escribas nada antes ni entre búsquedas. Al terminar responde SOLO con JSON válido, sin bloques de código:',
      '{"items":[{"i":0,"estado":"confirmado|corregir|no_encontrado|manual","dato_correcto":"solo si corregir","fuente":"url o vacío","nota":"una frase"}]}',
      'Incluye un objeto por cada dato recibido, con su número i.',
    ].join('\n'),
    build: (data) => {
      const clip = (s, n) => String(s == null ? '' : s).slice(0, n);
      const items = (Array.isArray(data.items) ? data.items : []).slice(0, 15).map((x, i) => i + '. ' + clip(x, 300));
      if (!items.length) throw new Error('sin datos');
      return 'Artículo sobre: "' + clip(data.keyword, 200) + '"\n\nDatos a verificar:\n' + items.join('\n');
    },
  },

  // Canibalización existente en todo el sitio.
  canibal_sitio: {
    model: MODELS.sonnet,
    max_tokens: 3500,
    system: [
      'Eres estratega SEO de País Lector. Recibes queries de Search Console por las que DOS O MÁS páginas del sitio reciben impresiones a la vez.',
      'Para cada caso decide: "fusionar" (misma intención: unir en la principal y redirigir 301 la otra), "diferenciar" (intenciones cercanas pero distintas: ajustar títulos y enfoques para separarlas), "reforzar" (una página debe ser la principal: enlaces internos con anchor exacto desde las demás y ajustar sus títulos), o "ignorar" (es normal que coexistan, p. ej. una lista y una reseña).',
      'Elige la principal por intención y datos (posición, clics), no por antigüedad. Sé concreto en la acción.',
      'Responde SOLO con JSON válido, sin bloques de código:',
      '{"casos":[{"query":"","decision":"fusionar|diferenciar|reforzar|ignorar","principal":"url","accion":"una frase imperativa","detalle":"2-3 oraciones","prioridad":"alta|media|baja"}]}',
    ].join('\n'),
    build: (data) => {
      const casos = (Array.isArray(data.casos) ? data.casos : []).slice(0, 10);
      if (!casos.length) throw new Error('sin casos');
      return 'Casos (90 días):\n' + JSON.stringify(casos, null, 1).slice(0, 20000);
    },
  },

  // Plan de refresh para una página que cae.
  refresh: {
    model: MODELS.sonnet,
    max_tokens: 3000,
    system: [
      'Eres editor SEO de País Lector. Una página del sitio está perdiendo posiciones. Recibes sus datos de Search Console y su contenido actual (leído del sitio).',
      'Diagnostica las causas probables con base en los datos y el contenido (intención que no cubre, secciones débiles o ausentes, title/meta que no corresponden a las queries, contenido desactualizado, falta de respuesta directa al inicio). No inventes cifras.',
      'Propón acciones concretas, ordenadas por impacto. Si sugieres secciones nuevas, di qué queries las justifican.',
      'Responde SOLO con JSON válido, sin bloques de código:',
      '{"diagnostico":"2-3 oraciones","causas":["",""],"acciones":[{"accion":"","detalle":"","prioridad":"alta|media|baja"}],"secciones_nuevas":[{"h2":"","por_que":""}],"title_nuevo":"≤60 caracteres o vacío","meta_nueva":"≤155 caracteres o vacío"}',
    ].join('\n'),
    build: async (data) => {
      const page = await fetchOwnPage(data.url);
      return 'URL: ' + String(data.url).slice(0, 300) + '\nDatos de caída: ' + JSON.stringify(data.stats || {}).slice(0, 500) +
        '\nQueries de la página (90 días): ' + JSON.stringify((data.queries || []).slice(0, 20)).slice(0, 4000) +
        '\n\nContenido actual:\n' + JSON.stringify(page).slice(0, 16000);
    },
  },

  // Variantes de title y meta para CTR bajo.
  ctr: {
    model: MODELS.sonnet,
    max_tokens: 1800,
    system: [
      'Eres editor SEO de País Lector (voz: directa, irreverente, literaria, sin clickbait barato). Una página recibe muchas impresiones y pocos clics.',
      'Lee el title y la meta actuales (del sitio) y las queries reales. Diagnostica por qué no convence en el resultado de Google y escribe 3 variantes distintas de title (≤60 caracteres, con la query principal al inicio cuando se pueda) y meta description (≤155 caracteres, con una promesa concreta).',
      'Cada variante con un enfoque distinto (p. ej. promesa clara, curiosidad, especificidad). Nada de mayúsculas sostenidas ni emojis.',
      'Responde SOLO con JSON válido, sin bloques de código:',
      '{"title_actual":"","meta_actual":"","diagnostico":"2 oraciones","variantes":[{"enfoque":"","title":"","meta":"","por_que":""}]}',
    ].join('\n'),
    build: async (data) => {
      const page = await fetchOwnPage(data.url);
      const lite = page.error ? page : { title: page.title, meta: page.meta, encabezados: (page.encabezados || []).slice(0, 12), inicio: (page.texto || '').slice(0, 1200) };
      return 'URL: ' + String(data.url).slice(0, 300) + '\nQuery principal: ' + String(data.query || '').slice(0, 200) +
        '\nDatos: ' + JSON.stringify(data.stats || {}).slice(0, 400) + '\nOtras queries de la página: ' + JSON.stringify((data.queries || []).slice(0, 12)).slice(0, 2500) +
        '\n\nPágina actual: ' + JSON.stringify(lite).slice(0, 5000);
    },
  },
  // Enlaces internos (desde el sitemap) y fuentes externas (búsqueda web).
  enlaces: {
    model: MODELS.sonnet,
    max_tokens: 4000,
    tools: WEB_SEARCH_MX(3),
    system: [
      'Eres editor SEO de País Lector. Recomiendas el enlazado de UN artículo: enlaces internos salientes, enlaces entrantes desde páginas existentes y fuentes externas de autoridad.',
      'INTERNOS: elige SOLO entre las URLs candidatas recibidas (vienen del sitemap y de Search Console). Nunca inventes una URL del sitio. Prioriza relevancia temática real (mismo autor, misma obra, movimiento o tema) y páginas con impresiones. No repitas enlaces que el artículo ya tenga. 5-10 salientes, 3-6 entrantes.',
      'Anchors: descriptivos y naturales, variados, sin "clic aquí"; para entrantes, usa anchors con la keyword del artículo o variantes.',
      'EXTERNAS: usa la búsqueda web para encontrar 4-6 fuentes de autoridad en español cuando existan (bibliotecas y archivos digitales, universidades, Cervantes Virtual, editoriales, fundaciones del autor, medios culturales serios). Evita competidores directos de País Lector (blogs y sitios de reseñas o listas de poemas) y Wikipedia salvo que no haya alternativa. Solo URLs que aparecieron en tus resultados.',
      'No escribas nada antes ni entre búsquedas. Al terminar responde SOLO con JSON válido, sin bloques de código:',
      '{"salientes":[{"url":"","anchor":"","donde":"en qué sección o párrafo","por_que":""}],"entrantes":[{"url":"página existente que debe enlazar al artículo","anchor":"","donde":"","por_que":""}],"externas":[{"url":"","titulo":"","fuente":"institución o medio","por_que":"","donde":""}],"notas":"una o dos frases"}',
    ].join('\n'),
    build: async (data) => {
      const clip = (s, n) => String(s == null ? '' : s).slice(0, n);
      const keyword = clip(data.keyword, 200);
      const ctx = clip(data.contexto, 8000);
      const sm = await fetchSitemapUrls();
      const kwT = new Set(linkTokens(keyword));
      const freq = {}; linkTokens(ctx).forEach((t) => { freq[t] = (freq[t] || 0) + 1; });
      const gsc = {}; (Array.isArray(data.gsc_pages) ? data.gsc_pages : []).slice(0, 300).forEach((p) => { if (p && p.url) gsc[p.url] = +p.impr || 0; });
      const self = clip(data.url, 400);
      const pool = [...new Set([...sm.urls, ...Object.keys(gsc)])];
      const scored = pool.filter((u) => u !== self).map((u) => {
        let path = u; try { path = decodeURIComponent(new URL(u).pathname); } catch {}
        const toks = linkTokens(path); let sc = 0;
        toks.forEach((t) => { if (kwT.has(t)) sc += 5; if (freq[t]) sc += Math.min(3, freq[t]); });
        if (gsc[u]) sc += Math.min(4, Math.log10(gsc[u] + 1));
        return { u, sc, impr: gsc[u] || 0 };
      }).filter((x) => x.sc > 0).sort((a, b) => b.sc - a.sc).slice(0, 70);
      const topGsc = Object.entries(gsc).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([u, i]) => ({ u, impr: i }));
      const cand = [...new Map([...scored, ...topGsc].map((x) => [x.u, x])).values()].map((x) => x.u + (x.impr ? ' (' + Math.round(x.impr) + ' impr)' : ''));
      const existing = self ? await pageLinks(self) : [];
      return [
        'Artículo: "' + keyword + '"' + (self ? ' — publicado en ' + self : ' — todavía no publicado'),
        'Sitemap: ' + (sm.error ? sm.error + ' (se usan las páginas de Search Console)' : (sm.total || 0) + ' URLs leídas'),
        '',
        '## Resumen del artículo o brief', ctx || '(sin contexto)',
        '',
        '## URLs candidatas del sitio', cand.join('\n') || '(ninguna)',
        '',
        '## Enlaces que el artículo ya tiene', existing.slice(0, 120).join('\n') || '(ninguno o no publicado)',
      ].join('\n');
    },
  },
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
  try { prompt = await task.build(body.data || {}); } catch { return J({ error: 'Datos inválidos para la tarea' }, 400); }

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
      ...(task.tools ? { tools: task.tools } : {}),
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
