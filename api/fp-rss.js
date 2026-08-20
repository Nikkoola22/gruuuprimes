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
    const articles = [];

    // 1. Fetch Lettre du Cadre (Ressources & Actualités)
    try {
      const xml2js = await import('xml2js');
      const parser = new xml2js.default.Parser();
      const ldcFeeds = [
        "https://www.lettreducadre.fr/ressources/rss",
        "https://www.lettreducadre.fr/rss/"
      ];
      const seenLinks = new Set();

      for (const feedUrl of ldcFeeds) {
        try {
          const ldcRes = await fetch(feedUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          if (ldcRes.ok) {
            const ldcXml = await ldcRes.text();
            const ldcData = await parser.parseStringPromise(ldcXml);
            const ldcItems = ldcData.rss?.channel?.[0]?.item || [];
            
            ldcItems.forEach(it => {
              const link = (it.link?.[0] || '').trim();
              if (!link || seenLinks.has(link)) return;
              seenLinks.add(link);

              const title = (it.title?.[0] || 'Sans titre').trim();
              const pubDate = it.pubDate?.[0] || new Date().toISOString();
              const imageUrl = it.enclosure?.[0]?.['$']?.url || null;
              let category = 'Ressources RH';
              if (Array.isArray(it.category) && it.category.length > 0) {
                const catItem = it.category[0];
                const catStr = typeof catItem === 'string' ? catItem : (catItem._ || '');
                category = catStr.trim() || 'Ressources RH';
              }
              const description = (it.description?.[0] || '').replace(/<[^>]*>/g, '').trim();
              const timestamp = new Date(pubDate).getTime() || Date.now();

              articles.push({
                title,
                link,
                pubDate,
                category,
                description,
                imageUrl,
                timestamp,
                source: 'Lettre du Cadre'
              });
            });
          }
        } catch (feedErr) {
          console.warn(`⚠️ Erreur fetch ${feedUrl}:`, feedErr.message);
        }
      }
    } catch (ldcErr) {
      console.warn("⚠️ Erreur fetch Lettre du Cadre RSS (Vercel):", ldcErr.message);
    }

    // 2. Fetch AMF news
    try {
      const url = "https://www.amf.asso.fr/page-toute-actualite/36012";
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      });

      if (response.ok) {
        const html = await response.text();

        // Decode HTML entities helper
        const decodeHtmlEntities = (str) => {
          if (!str) return '';
          return str
            .replace(/&eacute;/g, 'é')
            .replace(/&egrave;/g, 'è')
            .replace(/&agrave;/g, 'à')
            .replace(/&ugrave;/g, 'ù')
            .replace(/&acir;/g, 'ê')
            .replace(/&acirc;/g, 'â')
            .replace(/&ecirc;/g, 'ê')
            .replace(/&icirc;/g, 'î')
            .replace(/&ocirc;/g, 'ô')
            .replace(/&ucirc;/g, 'û')
            .replace(/&euml;/g, 'ë')
            .replace(/&iuml;/g, 'ï')
            .replace(/&uuml;/g, 'ü')
            .replace(/&ccedil;/g, 'ç')
            .replace(/&Eacute;/g, 'É')
            .replace(/&Egrave;/g, 'È')
            .replace(/&Agrave;/g, 'À')
            .replace(/&rsquo;/g, "'")
            .replace(/&oelig;/g, 'œ')
            .replace(/&Oelig;/g, 'Œ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&#039;/g, "'")
            .replace(/&ldquo;/g, '“')
            .replace(/&rdquo;/g, '”')
            .replace(/&laquo;/g, '«')
            .replace(/&raquo;/g, '»')
            .replace(/&deg;/g, '°');
        };

        // Parse french date to ISO string/timestamp
        const parseFrenchDate = (dateText) => {
          let pubDate = new Date().toISOString();
          let timestamp = Date.now();
          if (!dateText) return { pubDate, timestamp };

          const dateStrMatch = dateText.split('-')[0].trim();
          const dateParts = dateStrMatch.split(/\s+/);
          if (dateParts.length >= 3) {
            const day = parseInt(dateParts[0], 10);
            const monthName = dateParts[1].toLowerCase().replace(/\./g, '');
            const year = parseInt(dateParts[2], 10);

            const months = {
              'janvier': 0, 'janv': 0,
              'février': 1, 'févr': 1, 'fevrier': 1, 'fevr': 1,
              'mars': 2,
              'avril': 3, 'avr': 3,
              'mai': 4,
              'juin': 5,
              'juillet': 6, 'juil': 6,
              'août': 7, 'aout': 7,
              'septembre': 8, 'sept': 8,
              'octobre': 9, 'oct': 9,
              'novembre': 10, 'nov': 10,
              'décembre': 11, 'decembre': 11, 'déc': 11, 'dec': 11
            };

            const month = months[monthName];
            if (month !== undefined && !isNaN(day) && !isNaN(year)) {
              const parsedDate = new Date(year, month, day, 12, 0, 0);
              timestamp = parsedDate.getTime();
              pubDate = parsedDate.toISOString();
            }
          }
          return { pubDate, timestamp };
        };

        // Split HTML by box grid class
        const parts = html.split(/class\s*=\s*["'][^"']*liste_actu2[^"']*["']/);

        for (let i = 1; i < parts.length; i++) {
          const part = parts[i];

          const linkMatch = part.match(/href=["']([^"']+)["']/);
          let link = linkMatch ? linkMatch[1] : '#';
          if (link.startsWith('/')) {
            link = 'https://www.amf.asso.fr' + link;
          }

          const imgMatch = part.match(/<img[^>]+src=["']([^"']+)["']/i);
          let imageUrl = imgMatch ? imgMatch[1] : null;
          if (imageUrl && imageUrl.startsWith('/')) {
            imageUrl = 'https://www.amf.asso.fr' + imageUrl;
          }

          const titleMatch = part.match(/<h3><a[^>]*>([\s\S]*?)<\/a><\/h3>/i);
          let title = titleMatch ? titleMatch[1] : 'Sans titre';
          title = decodeHtmlEntities(title.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());

          const descMatch = part.match(/<div class="panel"[^>]*>([\s\S]*?)<\/div>/i);
          let description = descMatch ? descMatch[1] : '';
          description = decodeHtmlEntities(description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());

          const dateMatch = part.match(/<div style="font-size:\s*12px;[^>]*>([\s\S]*?)<\/div>/i);
          let dateText = dateMatch ? dateMatch[1] : '';
          dateText = decodeHtmlEntities(dateText.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());

          const { pubDate, timestamp } = parseFrenchDate(dateText);
          const category = 'AMF';

          articles.push({
            title,
            link,
            pubDate,
            category,
            description,
            imageUrl,
            timestamp,
            source: 'AMF'
          });
        }
      }
    } catch (amfErr) {
      console.warn("⚠️ Erreur fetch AMF (Vercel):", amfErr.message);
    }

    // Prioritize Lettre du Cadre articles first, then AMF
    const ldcArticles = articles.filter(a => a.source === 'Lettre du Cadre');
    const amfArticles = articles.filter(a => a.source === 'AMF');
    const resultArticles = [...ldcArticles, ...amfArticles].slice(0, 30);

    cache = { data: resultArticles, timestamp: now, ttl: cache.ttl };
    console.log(`✅ ${resultArticles.length} actualités FP (${ldcArticles.length} Lettre du Cadre, ${amfArticles.length} AMF) trouvées (cache mis à jour)`);
    res.status(200).json({ items: resultArticles });

  } catch (error) {
    console.error("💥 Erreur FP RSS:", error);
    res.status(200).json({ items: [], error: "Erreur récupération RSS FP", details: error.message });
  }
}
