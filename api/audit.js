export const config = { runtime: 'edge' };

// Crawlers de IA que importan para GEO
const AI_BOTS = ['GPTBot','OAI-SearchBot','ChatGPT-User','ClaudeBot','Claude-Web','anthropic-ai','PerplexityBot','Perplexity-User','Google-Extended','CCBot','Bytespider','Amazonbot','Applebot-Extended'];

function J(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

function domainOf(site) {
  return (site || '').replace(/^sc-domain:/i, '').replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim().toLowerCase();
}

async function fetchText(url, ms = 8000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SEOPulseAudit/1.0; +https://seo-pulse-dusky.vercel.app)' },
      signal: c.signal,
      redirect: 'follow',
    });
    const text = await r.text();
    return { ok: r.ok, status: r.status, url: r.url, text, headers: r.headers };
  } catch (e) {
    return { ok: false, status: 0, error: String((e && e.message) || e), text: '', headers: null };
  } finally {
    clearTimeout(t);
  }
}

// ---------- robots.txt ----------
function parseRobots(txt) {
  const lines = txt.split(/\r?\n/).map(l => l.replace(/#.*/, '').trim()).filter(Boolean);
  const groups = []; let agents = []; let rules = []; let lastWasAgent = false;
  const flush = () => { if (agents.length) groups.push({ agents: [...agents], rules: [...rules] }); agents = []; rules = []; };
  for (const line of lines) {
    const ua = line.match(/^user-agent:\s*(.+)$/i);
    if (ua) { if (!lastWasAgent && rules.length) flush(); agents.push(ua[1].trim().toLowerCase()); lastWasAgent = true; continue; }
    const r = line.match(/^(disallow|allow):\s*(.*)$/i);
    if (r) { rules.push({ type: r[1].toLowerCase(), path: r[2].trim() }); lastWasAgent = false; }
  }
  flush();
  const isBlocked = (name) => {
    name = name.toLowerCase();
    const g = groups.filter(x => x.agents.includes(name));
    if (!g.length) return { mentioned: false, blocked: false };
    const blocked = g.some(x => x.rules.some(r => r.type === 'disallow' && r.path === '/') && !x.rules.some(r => r.type === 'allow' && r.path === '/'));
    return { mentioned: true, blocked };
  };
  const bots = {}; AI_BOTS.forEach(b => bots[b] = isBlocked(b));
  const aiBlocked = AI_BOTS.filter(b => bots[b].blocked);
  const wildcard = isBlocked('*');
  const sm = (txt.match(/^\s*sitemap:\s*(.+)$/im) || [])[1];
  return { aiBlocked, wildcardBlocked: wildcard.blocked, sitemap: sm ? sm.trim() : null };
}

// ---------- sitemap ----------
function extractLocs(xml) { return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map(m => m[1]); }
async function discoverSitemap(domain, robotsSitemap) {
  const cands = [];
  if (robotsSitemap) cands.push(robotsSitemap);
  cands.push(`https://${domain}/sitemap_index.xml`, `https://${domain}/sitemap.xml`, `https://${domain}/wp-sitemap.xml`);
  for (const sm of cands) {
    const r = await fetchText(sm, 8000);
    if (!r.ok || !/</.test(r.text)) continue;
    let locs = extractLocs(r.text);
    if (!locs.length) continue;
    // si es índice de sitemaps, baja al primer hijo
    if (locs.every(l => /\.xml(\?|$)/i.test(l))) {
      const child = await fetchText(locs[0], 8000);
      if (child.ok) locs = extractLocs(child.text);
    }
    if (locs.length) return { urls: locs, total: locs.length, sitemap: sm };
  }
  return { urls: [], total: 0, sitemap: null };
}

function sample(arr, n) {
  if (arr.length <= n) return arr.slice();
  const out = []; const step = arr.length / n;
  for (let i = 0; i < n; i++) out.push(arr[Math.floor(i * step)]);
  return out;
}

// ---------- página ----------
function stripTags(h) {
  return h.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

function parsePage(html, headers, domain) {
  const g1 = (re) => { const m = html.match(re); return m ? (m[1] || '').trim() : null; };
  const title = g1(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const desc = g1(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i)
    || g1(/<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const lang = g1(/<html[^>]*\blang=["']([^"']+)["']/i);
  const canonical = g1(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
    || g1(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  const robotsMeta = g1(/<meta[^>]+name=["']robots["'][^>]*content=["']([^"']*)["']/i) || '';
  const xRobots = (headers && headers.get && headers.get('x-robots-tag')) || '';
  const noindex = /noindex/i.test(robotsMeta) || /noindex/i.test(xRobots);

  const h1s = (html.match(/<h1[\s>]/gi) || []).length;
  const seq = []; const hre = /<h([1-6])[\s>]/gi; let mm;
  while ((mm = hre.exec(html))) seq.push(parseInt(mm[1]));
  let skip = false; for (let i = 1; i < seq.length; i++) if (seq[i] - seq[i - 1] > 1) skip = true;

  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  const types = []; let hasSameAs = false, author = null, dateModified = null;
  // recorre todo el árbol para sameAs / author / dateModified (sin contar @type)
  const collectMeta = (node, depth) => {
    if (!node || typeof node !== 'object' || depth > 6) return;
    if (Array.isArray(node)) { node.forEach(n => collectMeta(n, depth + 1)); return; }
    if (node.sameAs) hasSameAs = true;
    if (node.author && !author) { const a = node.author; author = a.name || (Array.isArray(a) && a[0] && a[0].name) || true; }
    if (node.dateModified && !dateModified) dateModified = node.dateModified;
    for (const k of Object.keys(node)) { const v = node[k]; if (v && typeof v === 'object') collectMeta(v, depth + 1); }
  };
  for (const b of blocks) {
    let parsed; try { parsed = JSON.parse(b.trim()); } catch (e) { continue; }
    // sólo @type de nivel superior (entidades del @graph), no los anidados (autor, publisher, etc.)
    const entities = parsed['@graph'] ? parsed['@graph'] : (Array.isArray(parsed) ? parsed : [parsed]);
    for (const ent of entities) {
      if (ent && ent['@type']) { const t = ent['@type']; (Array.isArray(t) ? t : [t]).forEach(x => types.push(String(x))); }
    }
    collectMeta(parsed, 0);
  }
  const uniq = [...new Set(types)];
  const dup = uniq.filter(t => types.filter(x => x === t).length > 1);
  const hasFAQ = uniq.some(t => /FAQPage/i.test(t));
  const contentTypes = ['Article','BlogPosting','NewsArticle','WebPage','CreativeWork','ItemList','CollectionPage'];
  const hasStack = uniq.length >= 2 || uniq.some(t => contentTypes.some(c => t.toLowerCase() === c.toLowerCase()));

  const hasLists = /<ul[\s>]|<ol[\s>]|<table[\s>]/i.test(html);

  // canonical mismo dominio
  let canonOk = false;
  if (canonical) { try { canonOk = new URL(canonical).hostname.replace(/^www\./, '').endsWith(domain.replace(/^www\./, '')); } catch (e) { canonOk = false; } }

  // apertura (después del primer H1)
  const after = html.split(/<h1[\s>][\s\S]*?<\/h1>/i)[1] || html;
  const body = stripTags(after);
  const words = body ? body.split(/\s+/) : [];
  const opening = words.slice(0, 55).join(' ');
  const digits = (body.slice(0, 1500).match(/\d+/g) || []).length;

  let freshDays = null;
  if (dateModified) { const d = new Date(dateModified); if (!isNaN(d)) freshDays = Math.round((Date.now() - d.getTime()) / 86400000); }

  return {
    title: !!title, desc: !!desc, lang: !!lang, canonical: !!canonical, canonOk,
    noindex, h1ok: h1s === 1, headingSkip: skip,
    types: uniq, hasStack, dup: dup.length > 0, hasSameAs, hasFAQ,
    author: !!author, hasLists, dateModified: !!dateModified, freshDays,
    opening, openingWords: words.length, digits, contentLen: body.length,
  };
}

function pct(n, d) { return d ? Math.round(100 * n / d) : 0; }

export default async function handler(req) {
  let site = '', urls = [];
  try {
    if (req.method === 'POST') { const b = await req.json(); site = b.site || ''; urls = Array.isArray(b.urls) ? b.urls : []; }
    else { const sp = new URL(req.url).searchParams; site = sp.get('site') || ''; }
  } catch (e) {}

  const domain = domainOf(site);
  if (!domain) return J({ error: 'Missing site' }, 400);

  // --- dominio: robots + sitemap ---
  const robotsRes = await fetchText(`https://${domain}/robots.txt`, 7000);
  const robots = robotsRes.ok ? parseRobots(robotsRes.text) : { aiBlocked: [], wildcardBlocked: false, sitemap: null };
  let smInfo = { urls: [], total: 0, sitemap: null };
  if (!urls.length) smInfo = await discoverSitemap(domain, robots.sitemap);
  else { smInfo = await discoverSitemap(domain, robots.sitemap); } // sólo para contar/confirmar presencia
  const pageUrls = urls.length ? urls.slice(0, 10) : sample(smInfo.urls, 8);

  // --- páginas ---
  const results = await Promise.all(pageUrls.map(async (u) => {
    const r = await fetchText(u, 9000);
    if (!r.ok || !r.text) return { url: u, ok: false, status: r.status };
    try { return { url: u, ok: true, ...parsePage(r.text, r.headers, domain) }; }
    catch (e) { return { url: u, ok: false, error: String(e.message || e) }; }
  }));
  const ok = results.filter(p => p.ok);
  const N = ok.length;

  const all = (fn) => ok.filter(fn).length;
  const counts = {
    indexable: `${all(p => !p.noindex)}/${N}`,
    meta_basico_ok: `${all(p => p.title && p.desc && p.lang)}/${N}`,
    canonical_sin_duplicado: `${all(p => p.canonOk)}/${N}`,
    headings_jerarquia_ok: `${all(p => p.h1ok && !p.headingSkip)}/${N}`,
    schema_en_pila: `${all(p => p.hasStack)}/${N}`,
    schema_sin_duplicados: `${all(p => !p.dup)}/${N}`,
    entidad_sameas: `${all(p => p.hasSameAs)}/${N}`,
    faq_presente: `${all(p => p.hasFAQ)}/${N}`,
    formato_estructurado: `${all(p => p.hasLists)}/${N}`,
    frescura: `${all(p => p.dateModified)}/${N}`,
    autor_acreditado: `${all(p => p.author)}/${N}`,
  };
  // señal = true si la mayoría (>=80%) de la muestra cumple
  const maj = (fn) => N > 0 && all(fn) >= Math.ceil(N * 0.8);
  const some = (fn) => N > 0 && all(fn) >= 1;
  const signals = {
    acceso_crawlers_ia: robots.aiBlocked.length === 0 && !robots.wildcardBlocked,
    render_server_side: maj(p => p.contentLen > 600),
    indexable: maj(p => !p.noindex),
    meta_basico_ok: maj(p => p.title && p.desc && p.lang && p.canonical),
    canonical_sin_duplicado: maj(p => p.canonOk),
    headings_jerarquia_ok: maj(p => p.h1ok && !p.headingSkip),
    schema_en_pila: maj(p => p.hasStack),
    schema_sin_duplicados: maj(p => !p.dup),
    entidad_sameas: maj(p => p.hasSameAs),
    faq_presente: some(p => p.hasFAQ),
    formato_estructurado: maj(p => p.hasLists),
    frescura: maj(p => p.dateModified),
    autor_acreditado: maj(p => p.author),
  };
  const evidence = {
    answer_first: ok.map(p => ({ url: p.url, opening: p.opening, words: p.openingWords })).slice(0, 8),
    densidad_factual: ok.map(p => ({ url: p.url, digits: p.digits, words: p.openingWords })).slice(0, 8),
  };

  return J({
    site, domain, sampled: N, ok: results.length,
    domainChecks: {
      robotsFound: robotsRes.ok,
      aiBlocked: robots.aiBlocked,
      wildcardBlocked: robots.wildcardBlocked,
      sitemapUrl: smInfo.sitemap,
      sitemapCount: smInfo.total,
      https: true,
    },
    signals, counts, evidence,
    pages: ok.map(p => ({ url: p.url, types: p.types, freshDays: p.freshDays, canonOk: p.canonOk, noindex: p.noindex })),
  });
}
