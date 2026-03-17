// Cache mémoire simple pour le flux RSS Interco CFDT
let cache = {
  data: null,
  timestamp: 0,
  ttl: 10 * 60 * 1000 // 10 minutes
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const now = Date.now();
    if (cache.data && (now - cache.timestamp < cache.ttl)) {
      return res.status(200).json({ items: cache.data });
    }

    const fetch = (await import('node-fetch')).default;
    const xml2js = await import('xml2js');
    const parser = new xml2js.default.Parser();

    const rssUrl = "https://interco.cfdt.fr/feed/rss";
    console.log(`📡 Récupération du flux Interco CFDT: ${rssUrl}`);

    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.error(`❌ Erreur fetch Interco RSS (${response.status}):`, response.statusText);
      return res.status(response.status).json({ error: 'Erreur récupération RSS Interco' });
    }

    const xmlText = await response.text();
    const jsonData = await parser.parseStringPromise(xmlText);

    const articles = (jsonData.rss?.channel?.[0]?.item || []).slice(0, 10).map((item) => ({
      title: item.title?.[0] || 'Sans titre',
      link: item.link?.[0] || '#',
      pubDate: item.pubDate?.[0] || new Date().toISOString(),
      category: Array.isArray(item.category) ? item.category[0] : (item.category || ''),
      description: item.description?.[0]?.replace(/<[^>]*>/g, '').trim().substring(0, 150) || ''
    }));

    cache = { data: articles, timestamp: now, ttl: cache.ttl };
    console.log(`✅ ${articles.length} actualités Interco CFDT trouvées (cache mis à jour)`);
    res.status(200).json({ items: articles });

  } catch (error) {
    console.error("💥 Erreur Interco RSS:", error);
    res.status(200).json({ items: [], error: "Erreur récupération RSS Interco", details: error.message });
  }
}
