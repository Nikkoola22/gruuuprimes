/**
 * Scraper de veille CDG & CIG — indexation quotidienne.
 *
 * Pour chaque Centre de Gestion :
 *   1. Découverte d'un flux RSS/Atom (balises <link rel="alternate"> + chemins candidats).
 *   2. Fallback HTML : extraction des liens d'articles sur la page d'accueil / actualités.
 *   3. En cas d'échec : conservation des news existantes (dégradation gracieuse).
 *
 * Sorties :
 *   - src/data/cdg-news.json      (mis à jour, trié par département)
 *   - src/data/cdg-metadata.json  (lastUpdated réel + compteurs)
 *
 * Usage : node scripts/scrape-cdg-news.mjs [--dry] [--only=DEPT]
 * Conçu pour tourner dans GitHub Actions (Node 20+, aucune dépendance).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NEWS_PATH = path.join(ROOT, 'src', 'data', 'cdg-news.json');
const META_PATH = path.join(ROOT, 'src', 'data', 'cdg-metadata.json');

const UA = 'Mozilla/5.0 (compatible; ATLAS-VeilleCFDT/1.0; +veille CDG/CIG)';
const TIMEOUT_MS = 12_000;
const CONCURRENCY = 8;
const MAX_NEWS_PER_CDG = 8;

const VERBOSE = process.argv.includes('--verbose');

/** Résumé court d'une erreur réseau (code DNS/TLS si disponible) */
function errBrief(err) {
  return err?.cause?.code || err?.message || 'erreur inconnue';
}

// Chemins de flux RSS/Atom couramment rencontrés sur les sites de CDG
const RSS_CANDIDATE_PATHS = [
  '/rss',
  '/feed',
  '/rss.xml',
  '/feed.xml',
  '/actualites/rss',
  '/actualites/feed',
  '/flux-rss',
  '/spip.php?page=backend',
  '/index.php?format=feed&type=rss' // Joomla
];

// Pages HTML où traînent généralement les actualités
const HTML_CANDIDATE_PATHS = ['/', '/actualites', '/actualites/', '/a-la-une', '/news', '/le-cdg/actualites'];

// Mots-clés de navigation à exclure du scraping HTML
const NOISE_RE =
  /(mention|contact|accessibilit|connexion|login|newsletter|legal|cookie|plan du site|facebook|linkedin|twitter|x\.com|youtube|mailto:|javascript:|#|^\/?$)/;

const ENTITY_MAP = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  eacute: 'é', egrave: 'è', ecirc: 'ê', agrave: 'à', agrav: 'à', ccedil: 'ç',
  ugrave: 'ù', ucirc: 'û', ocirc: 'ô', icirc: 'î', laquo: '«', raquo: '»',
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', oelig: 'œ', hellip: '…',
  deg: '°', euro: '€', times: '×', middot: '·'
};

function decodeEntities(str) {
  return (str || '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITY_MAP[name] ?? m)
    .replace(/\s+/g, ' ')
    .trim();
}

function stripTags(html) {
  return decodeEntities(String(html || '').replace(/<[^>]*>/g, ' '));
}

/** Décodage d'une réponse binaire selon le charset annoncé (beaucoup de vieux sites en ISO-8859-1) */
function decodeBuffer(buf, hint = '') {
  const charset =
    hint.match(/charset=([\w-]+)/i)?.[1] ||
    buf.subarray(0, 600).toString('latin1').match(/charset=["']?([\w-]+)/i)?.[1];
  try {
    return new TextDecoder(charset || 'utf-8').decode(buf);
  } catch {
    return buf.toString('utf-8');
  }
}

/** Repli curl : tolère les chaînes TLS incomplètes et les en-têtes HTTP malformés
 *  que le fetch de Node refuse strictement (UNABLE_TO_VERIFY_LEAF_SIGNATURE, CR manquant…). */
async function curlText(url) {
  let stdout;
  try {
    ({ stdout } = await promisify(execFile)(
      'curl',
      ['-fsL', '--max-time', '15', '-A', UA, '-w', '\n__CURL_URL__%{url_effective}__CURL_END__', url],
      { maxBuffer: 32 * 1024 * 1024, encoding: 'buffer' }
    ));
  } catch (e) {
    throw new Error(`curl (exit ${e.code ?? '?'}, ${e.signal ?? 'sans signal'})`);
  }
  const m = stdout.toString('latin1').match(/\n?__CURL_URL__(.*)__CURL_END__\s*$/);
  const raw = m ? stdout.subarray(0, m.index) : stdout;
  return { text: decodeBuffer(raw), finalUrl: m?.[1]?.trim() || url };
}

/** GET avec timeout, User-Agent, décodage charset et repli curl. Retourne { text, finalUrl }. */
async function httpGet(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'text/html,application/rss+xml,application/xml;q=0.9,*/*;q=0.8' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: 'follow'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    return { text: decodeBuffer(buf, res.headers.get('content-type') || ''), finalUrl: res.url || url };
  } catch {
    return curlText(url);
  }
}

function baseOf(url) {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

/** Comparaison d'hôte sans protocole : les sites http→https servent leurs liens en https */
function hostOf(url) {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return null;
  }
}

function absolute(base, href) {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

/* ------------------------------- RSS ------------------------------- */

function parseFeed(xml, feedUrl) {
  const items = [];
  const blocks = xml.match(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi) || [];
  for (const block of blocks.slice(0, MAX_NEWS_PER_CDG)) {
    const title = stripTags(block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
    const rawLink =
      block.match(/<link[^>]*href="([^"]+)"[^>]*\/?>/i)?.[1] || // Atom
      block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] || // RSS
      block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i)?.[1];
    const link = absolute(feedUrl, stripTags(rawLink));
    const pubDate =
      block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1] ||
      block.match(/<(published|updated|dc:date)[^>]*>([\s\S]*?)<\/\1>/i)?.[2];
    const desc = stripTags(block.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1] ||
      block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i)?.[1]).slice(0, 300);
    if (title && link) {
      const date = pubDate ? new Date(pubDate.trim()) : null;
      items.push({
        title,
        link,
        ...(date && !isNaN(date) ? { pubDate: date.toUTCString() } : {}),
        ...(desc ? { description: desc } : {}),
        source: 'RSS'
      });
    }
  }
  return items;
}

async function discoverFeed(base, log = []) {
  // 1. Balises <link rel="alternate" type="application/rss|atom+xml"> de la page d'accueil
  try {
    const { text: home } = await httpGet(base);
    const declared = [...home.matchAll(/<link[^>]+type="application\/(rss|atom)\+xml"[^>]*>/gi)];
    for (const tag of declared) {
      const href = tag[0].match(/href="([^"]+)"/i)?.[1];
      const feedUrl = href && absolute(base, href);
      if (!feedUrl) continue;
      try {
        const { text: xml } = await httpGet(feedUrl);
        const items = parseFeed(xml, feedUrl);
        if (items.length) return items;
        log.push(`flux déclaré vide : ${feedUrl}`);
      } catch (e) {
        log.push(`flux déclaré cassé : ${feedUrl} → ${errBrief(e)}`);
      }
    }
  } catch (e) {
    log.push(`accueil injoignable : ${base} → ${errBrief(e)}`);
  }

  // 2. Chemins candidats
  for (const p of RSS_CANDIDATE_PATHS) {
    const feedUrl = absolute(base, p);
    try {
      const { text: xml } = await httpGet(feedUrl);
      if (!/<(rss|feed)\b/i.test(xml.slice(0, 500))) continue;
      const items = parseFeed(xml, feedUrl);
      if (items.length) return items;
    } catch (e) {
      log.push(`candidat RSS : ${feedUrl} → ${errBrief(e)}`);
    }
  }
  return null;
}

/* ------------------------------- HTML ------------------------------- */

function looksLikeArticle(href, text) {
  if (!text || text.length < 18 || NOISE_RE.test(href) || NOISE_RE.test(text.toLowerCase())) return false;
  return /actualit|article|\/post|\/news|evenement|communique|publi|\/page-|\/actus/i.test(href);
}

async function scrapeHtml(base, log = [], extraPaths = []) {
  const paths = [...new Set([...extraPaths, ...HTML_CANDIDATE_PATHS])];
  for (const p of paths) {
    const pageUrl = absolute(base, p);
    if (!pageUrl) continue;
    let html;
    let resolveBase = pageUrl;
    try {
      const res = await httpGet(pageUrl);
      html = res.text;
      if (res.finalUrl) resolveBase = res.finalUrl;
    } catch (e) {
      log.push(`page HTML : ${pageUrl} → ${errBrief(e)}`);
      continue;
    }
    // Base effective : après redirection (http→https, changement d'hôte)
    const siteBase = baseOf(resolveBase) || base;
    const siteHost = hostOf(siteBase);
    const items = [];
    const seen = new Set();
    const anchors = html.match(/<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi) || [];
    for (const a of anchors) {
      const href = a.match(/href="([^"]+)"/i)?.[1];
      if (!href) continue;
      const rawText = stripTags(a.replace(/<[^>]*>/g, ' '));
      const url = absolute(resolveBase, href);
      if (!url || hostOf(url) !== siteHost) continue;
      const key = url.split('#')[0];
      const idx = html.indexOf(a);
      // Titre : texte de l'ancre, ou bloc englobant pour les PDF d'actualités (« ICI », « télécharger »…)
      let title = rawText;
      if (rawText.length < 18) {
        if (!/\.pdf(\?|$)/i.test(key) || NOISE_RE.test(key)) continue;
        const before = html.slice(Math.max(0, idx - 1500), idx);
        const blockStart = Math.max(
          before.lastIndexOf('<li'), before.lastIndexOf('<p'), before.lastIndexOf('<p '),
          before.lastIndexOf('<h2'), before.lastIndexOf('<h3'), before.lastIndexOf('<h4'), before.lastIndexOf('<td')
        );
        const t = stripTags(blockStart >= 0 ? before.slice(blockStart) : before);
        title = t.replace(/\s*(disponibl\w*|ICI|ici)\s*\.?\s*$/, '').trim();
        if (title.length < 18) continue;
      } else if (!looksLikeArticle(key, rawText)) {
        continue;
      }
      if (seen.has(key)) continue;
      seen.add(key);
      // Date éventuelle dans un <time datetime="..."> voisin du lien
      const around = idx >= 0 ? html.slice(idx, idx + 800) : '';
      const timeAttr = around.match(/<time[^>]+datetime="([^"]+)"/i)?.[1];
      const date = timeAttr ? new Date(timeAttr) : null;
      items.push({
        title,
        link: key,
        ...(date && !isNaN(date) ? { pubDate: date.toUTCString() } : {}),
        source: 'HTML'
      });
      if (items.length >= MAX_NEWS_PER_CDG) break;
    }
    if (items.length >= 3) return items;
  }
  return null;
}

/* ------------------------------ Pipeline ------------------------------ */

/** Corrections ponctuelles : domaine déplacé, page d'actualités non standard */
const OVERRIDES = {
  '12': { officialUrl: 'https://www.cdg-12.fr' }, // cdg12.fr inexistant — domaine réel via annuaire service-public
  '54': { officialUrl: 'https://54.cdgplus.fr' }, // cdg54.fr injoignable — plateforme cdgplus
  '52': { newsPaths: ['/actualites-du-cdg/'] },
  '53': { newsPaths: ['/centre-de-gestion-mayenne/actualites'] },
  '63': { newsPaths: ['/connaitre-le-cdg-63/actualites/'] }
};

async function scrapeCdg(entry) {
  const log = [];
  const ov = OVERRIDES[String(entry.dept)] || {};
  if (ov.officialUrl && ov.officialUrl !== entry.officialUrl) {
    log.push(`override domaine : ${entry.officialUrl || 'absente'} → ${ov.officialUrl}`);
    entry = { ...entry, officialUrl: ov.officialUrl };
  }
  const base = baseOf(entry.officialUrl);
  if (!base) {
    log.push('URL officielle absente');
    return { entry, method: 'invalid', log };
  }

  const fresh = (await discoverFeed(base, log)) || (await scrapeHtml(base, log, ov.newsPaths || []));
  if (!fresh || !fresh.length) {
    log.push('aucun flux ni lien d’article exploitable');
    return { entry, method: 'failed', log };
  }

  // Fusion : nouvelles en tête, anciennes conservées (dédupliquées par lien) pour ne rien perdre
  const seenLinks = new Set(fresh.map((n) => n.link.split('#')[0]));
  const kept = (entry.news || []).filter((n) => n && n.link && !seenLinks.has(n.link.split('#')[0]) && n.source !== 'Fallback');
  const news = [...fresh, ...kept].slice(0, MAX_NEWS_PER_CDG);
  return { entry: { ...entry, news }, method: fresh[0].source === 'RSS' ? 'rss' : 'html', log };
}

async function runPool(items, worker, size) {
  const results = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (cursor < items.length) {
        const i = cursor++;
        results[i] = await worker(items[i]).catch(() => ({ entry: items[i], method: 'failed' }));
      }
    })
  );
  return results;
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const only = args.find((a) => a.startsWith('--only='))?.split('=')[1]?.split(',');

  const data = JSON.parse(fs.readFileSync(NEWS_PATH, 'utf8'));
  const targets = only
    ? data.filter((e) => (e.dept || '').split(',').map((s) => s.trim()).some((d) => only.includes(d)))
    : data;
  console.log(`🔎 Veille CDG : ${targets.length}/${data.length} centres à indexer…`);

  const results = await runPool(targets, scrapeCdg, CONCURRENCY);
  const merged = new Map(data.map((e) => [e.cdg, e]));
  const stats = { rss: 0, html: 0, failed: 0, invalid: 0 };
  for (const { entry, method, log = [] } of results) {
    stats[method] = (stats[method] || 0) + 1;
    merged.set(entry.cdg, entry);
    if (VERBOSE && (method === 'failed' || method === 'invalid')) {
      console.log(`\n❌ [${entry.dept}] ${entry.cdg} — ${entry.officialUrl || 'URL absente'}`);
      for (const line of [...log].sort((a, b) => a.localeCompare(b)).slice(0, 12)) {
        console.log(`   • ${line}`);
      }
    }
  }

  const final = [...merged.values()].sort((a, b) => {
    const da = parseInt(a.dept, 10), db = parseInt(b.dept, 10);
    if (!isNaN(da) && !isNaN(db)) return da - db;
    return String(a.dept).localeCompare(String(b.dept));
  });
  const totalNews = final.reduce((acc, e) => acc + (e.news?.length || 0), 0);

  console.log(`✅ RSS: ${stats.rss} | HTML: ${stats.html} | échecs (conservés): ${stats.failed} | URL invalide: ${stats.invalid}`);
  console.log(`📰 ${totalNews} publications au total sur ${final.length} centres`);

  if (dry) {
    console.log('🧪 Mode --dry : aucune écriture.');
    return;
  }

  fs.writeFileSync(NEWS_PATH, JSON.stringify(final, null, 2) + '\n');
  const now = new Date();
  const metadata = {
    lastUpdated: now.toISOString(),
    totalCdgs: final.length,
    totalNews
  };
  fs.writeFileSync(META_PATH, JSON.stringify(metadata, null, 2) + '\n');
  console.log(`💾 Écrit : ${path.relative(ROOT, NEWS_PATH)} + ${path.relative(ROOT, META_PATH)} (${now.toUTCString()})`);
}

main().catch((err) => {
  console.error('❌ Scraper en échec :', err);
  process.exit(1);
});
