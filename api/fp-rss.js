import { handleCors } from './_security.js';

// Cache mémoire simple pour les flux RSS Fonction Publique
let cache = {
  data: null,
  timestamp: 0,
  ttl: 10 * 60 * 1000 // 10 minutes
};

export default async function handler(req, res) {
  if (!handleCors(req, res, ['GET', 'OPTIONS'])) {
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

    const rssUrls = [
      "https://www.banquedesterritoires.fr/flux/fonction-publique/localtis.xml"
    ];

    let allArticles = [];

    for (const url of rssUrls) {
      console.log(`📡 Récupération du flux FP: ${url}`);
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (!response.ok) {
          console.error(`❌ Erreur fetch FP RSS (${response.status}) pour ${url}:`, response.statusText);
          continue;
        }

        const xmlText = await response.text();
        const jsonData = await parser.parseStringPromise(xmlText);

        const articles = (jsonData.rss?.channel?.[0]?.item || []).map((item) => {
          const extractText = (node) => {
            if (!node) return '';
            if (typeof node === 'string') return node;
            if (typeof node === 'object') {
              if (node._) return node._;
              if (node.a && node.a[0]) return extractText(node.a[0]);
              return '';
            }
            return '';
          };

          const title = extractText(item.title?.[0]) || 'Sans titre';
          const link = extractText(item.link?.[0]) || '#';
          
          let pubDateStr = extractText(item.pubDate?.[0]) || '';
          let timestamp = Date.now();
          // parse "jeu 18/06/2026 - 15:31"
          const dateMatch = pubDateStr.match(/(\d{2})\/(\d{2})\/(\d{4})\s*-\s*(\d{2}):(\d{2})/);
          if (dateMatch) {
            const [_, day, month, year, hour, minute] = dateMatch;
            timestamp = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`).getTime();
          } else {
             const parsed = new Date(pubDateStr).getTime();
             if (!isNaN(parsed)) timestamp = parsed;
          }
          const pubDate = new Date(timestamp).toISOString();

          const categoryRaw = Array.isArray(item.category) ? item.category[0] : (item.category || '');
          const category = extractText(categoryRaw) || 'Fonction Publique';
          
          const descriptionHtml = extractText(item.description?.[0]) || '';
          const contentEncodedHtml = extractText(item['content:encoded']?.[0]) || '';
          const combinedHtml = contentEncodedHtml + descriptionHtml;
          
          const imgMatch = combinedHtml.match(/(?:<|&lt;)img[^>]+src=["']([^"']+)["']/i);
          let imageUrl = imgMatch ? imgMatch[1] : null;
          
          if (imageUrl && imageUrl.startsWith('/')) {
            try {
              const urlObj = new URL(link);
              imageUrl = urlObj.origin + imageUrl;
            } catch (e) {
              imageUrl = 'https://www.banquedesterritoires.fr' + imageUrl;
            }
          }

          const description = descriptionHtml.replace(/<[^>]*>/g, '').trim().substring(0, 150) || '';

          return {
            title,
            link,
            pubDate,
            category,
            description,
            imageUrl,
            timestamp
          };
        });

        const enrichedArticles = await Promise.all(articles.map(async (article) => {
          if (!article.imageUrl && article.link && article.link.startsWith('http')) {
            try {
              const res = await fetch(article.link, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                signal: AbortSignal.timeout(3000)
              });
              if (res.ok) {
                const html = await res.text();
                const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
                if (ogMatch && ogMatch[1]) {
                  article.imageUrl = ogMatch[1];
                  if (article.imageUrl.startsWith('/')) {
                    try {
                      const urlObj = new URL(article.link);
                      article.imageUrl = urlObj.origin + article.imageUrl;
                    } catch (e) {
                      article.imageUrl = 'https://www.banquedesterritoires.fr' + article.imageUrl;
                    }
                  }
                }
              }
            } catch (e) {
              // Ignore timeouts or network errors
            }
          }
          return article;
        }));

        allArticles = allArticles.concat(enrichedArticles);
      } catch (err) {
        console.error(`💥 Erreur parsing pour ${url}:`, err.message);
      }
    }

    // Sort by most recent
    allArticles.sort((a, b) => b.timestamp - a.timestamp);
    
    // Take top 15 items overall
    allArticles = allArticles.slice(0, 15);

    cache = { data: allArticles, timestamp: now, ttl: cache.ttl };
    console.log(`✅ ${allArticles.length} actualités FP trouvées (cache mis à jour)`);
    res.status(200).json({ items: allArticles });

  } catch (error) {
    console.error("💥 Erreur FP RSS:", error);
    res.status(200).json({ items: [], error: "Erreur récupération RSS FP", details: error.message });
  }
}
