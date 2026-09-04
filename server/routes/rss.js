import express from 'express';

const router = express.Router();

// Données de secours en cas d'erreur de serveur externe RSS
const FALLBACK_FP_ARTICLES = [
  {
    title: "Ressources & Management Territorial : Dossiers et fiches pratiques",
    link: "https://www.lettreducadre.fr/ressources/",
    pubDate: new Date().toISOString(),
    category: "Ressources RH",
    description: "Accédez à tous les dossiers, guides statutaires et ressources documentaires de La Lettre du Cadre Territorial.",
    imageUrl: "https://www.lettreducadre.fr/mediatheque/0/2/6/000032620_210x140_c.jpeg",
    timestamp: Date.now()
  },
  {
    title: "Rémunération : la FPT au bout du rouleau",
    link: "https://www.lettreducadre.fr/article/remuneration-la-fpt-au-bout-du-rouleau.55529",
    pubDate: new Date().toISOString(),
    category: "Salaire & Primes",
    description: "Analyse sur les grilles indiciaires, le pouvoir d'achat et les tensions indemnitaires dans la territoriale.",
    imageUrl: "https://www.lettreducadre.fr/mediatheque/0/2/6/000032620_210x140_c.jpeg",
    timestamp: Date.now() - 3600000
  },
  {
    title: "Comment accompagner un agent bipolaire au sein de son équipe ?",
    link: "https://www.lettreducadre.fr/article/comment-accompagner-un-agent-bipolaire-au-sein-de-son-equipe.55515",
    pubDate: new Date().toISOString(),
    category: "Santé au travail",
    description: "Conseils et repères managériaux pour les encadrants territoriaux face aux troubles psychiques.",
    imageUrl: "https://www.lettreducadre.fr/mediatheque/7/9/5/000032597_210x140_c.jpeg",
    timestamp: Date.now() - 7200000
  },
  {
    title: "Charge de travail des cadres : retour d'expérience et leviers d'action",
    link: "https://www.lettreducadre.fr/article/comment-rennes-a-planche-sur-la-charge-de-travail-de-ses-cadres-et-mis-au-jour-leurs-irritants-du-quotidien.55073",
    pubDate: new Date().toISOString(),
    category: "Management",
    description: "Comment une collectivité a planché sur la charge de travail de ses cadres et les irritants du quotidien.",
    imageUrl: "https://www.lettreducadre.fr/mediatheque/7/3/0/000032037_210x140_c.jpeg",
    timestamp: Date.now() - 10800000
  },
  {
    title: "AMF - Gestion des carrières et rémunérations territoriales",
    link: "https://www.amf.asso.fr",
    pubDate: new Date().toISOString(),
    category: "AMF",
    description: "Dernières actualités sur le statut des agents territoriaux.",
    imageUrl: "https://www.amf.asso.fr/upload/rubriques/36012.jpg",
    timestamp: Date.now() - 14400000
  }
];

const FALLBACK_INTERCO_ARTICLES = [];
const FALLBACK_RSS_ARTICLES = [];

// Route pour récupérer les flux RSS de la Fonction Publique (Lettre du Cadre & AMF)
router.get('/fp-rss', async (req, res) => {
  try {
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
            signal: AbortSignal.timeout(5000),
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
      console.log(`✅ Articles Lettre du Cadre scrapés : ${articles.length}`);
    } catch (ldcErr) {
      console.warn("⚠️ Erreur globale Lettre du Cadre RSS:", ldcErr.message);
    }

    // 2. Fetch AMF news
    try {
      const amfUrl = "https://www.amf.asso.fr/page-toute-actualite/36012";
      const amfRes = await fetch(amfUrl, {
        signal: AbortSignal.timeout(5000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      });

      if (amfRes.ok) {
        const html = await amfRes.text();
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
            .replace(/&ccedil;/g, 'ç')
            .replace(/&Eacute;/g, 'É')
            .replace(/&rsquo;/g, "'")
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"');
        };

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
              'janvier': 0, 'janv': 0, 'février': 1, 'févr': 1, 'fevrier': 1,
              'mars': 2, 'avril': 3, 'avr': 3, 'mai': 4, 'juin': 5,
              'juillet': 6, 'juil': 6, 'août': 7, 'aout': 7, 'septembre': 8,
              'octobre': 9, 'oct': 9, 'novembre': 10, 'nov': 10, 'décembre': 11
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
      console.warn("⚠️ Erreur fetch AMF:", amfErr.message);
    }

    // Prioritize Lettre du Cadre articles first, then AMF
    const ldcArticles = articles.filter(a => a.source === 'Lettre du Cadre');
    const amfArticles = articles.filter(a => a.source === 'AMF');
    const resultArticles = [...ldcArticles, ...amfArticles].slice(0, 30);

    if (resultArticles.length === 0) {
      return res.status(200).json({ items: FALLBACK_FP_ARTICLES });
    }

    console.log(`✅ Actualités Fonction Publique : ${resultArticles.length} articles récupérés (${ldcArticles.length} Lettre du Cadre, ${amfArticles.length} AMF)`);
    res.json({ items: resultArticles });

  } catch (error) {
    console.warn("⚠️ Erreur FP Route (fallback activé):", error.message);
    res.status(200).json({ items: FALLBACK_FP_ARTICLES });
  }
});

// Route pour récupérer les actualités CFDT Interco
router.get('/interco-rss', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const xml2js = await import('xml2js');
    const parser = new xml2js.default.Parser();

    const rssUrl = "https://interco.cfdt.fr/actualites/feed/";
    console.log(`📡 Récupération du flux Interco CFDT: ${rssUrl}`);

    const response = await fetch(rssUrl, {
      signal: AbortSignal.timeout(5000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.warn(`⚠️ Erreur fetch Interco RSS (${response.status}) - Utilisation des données de secours`);
      return res.status(200).json({ items: FALLBACK_INTERCO_ARTICLES });
    }

    const xmlText = await response.text();
    const jsonData = await parser.parseStringPromise(xmlText);

    const articles = (jsonData.rss?.channel?.[0]?.item || []).slice(0, 10).map((item) => {
      const title = item.title?.[0] || 'Sans titre';
      const link = item.link?.[0] || '#';
      const pubDate = item.pubDate?.[0] || new Date().toISOString();
      const category = Array.isArray(item.category) ? item.category[0] : (item.category || '');
      
      const descriptionHtml = item.description?.[0] || '';
      const contentEncodedHtml = item['content:encoded']?.[0] || '';
      const combinedHtml = contentEncodedHtml + descriptionHtml;
      
      const imgMatch = combinedHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
      const imageUrl = imgMatch ? imgMatch[1] : null;
      const description = descriptionHtml.replace(/<[^>]*>/g, '').trim().substring(0, 150) || '';

      return {
        title,
        link,
        pubDate,
        category,
        description,
        imageUrl
      };
    });

    if (articles.length === 0) {
      return res.status(200).json({ items: FALLBACK_INTERCO_ARTICLES });
    }

    console.log(`✅ ${articles.length} actualités Interco CFDT trouvées`);
    res.status(200).json({ items: articles });

  } catch (error) {
    console.warn("⚠️ Erreur Interco RSS (fallback activé):", error.message);
    res.status(200).json({ items: FALLBACK_INTERCO_ARTICLES });
  }
});

// Route pour récupérer les flux RSS (évite les problèmes CORS)
router.get('/rss', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const xml2js = await import('xml2js');
    const parser = new xml2js.default.Parser();
    
    const rssUrl = "https://www.franceinfo.fr/politique.rss";
    console.log(`📡 Récupération du flux RSS: ${rssUrl}`);
    
    const response = await fetch(rssUrl, {
      signal: AbortSignal.timeout(5000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.warn(`⚠️ Erreur fetch RSS (${response.status}) - Utilisation des données de secours`);
      return res.status(200).json({ items: FALLBACK_RSS_ARTICLES });
    }
    
    const xmlText = await response.text();
    const jsonData = await parser.parseStringPromise(xmlText);
    
    const articles = (jsonData.rss?.channel?.[0]?.item || []).slice(0, 10).map((item) => ({
      title: item.title?.[0] || 'Sans titre',
      link: item.link?.[0] || '#',
      pubDate: item.pubDate?.[0] || new Date().toISOString()
    }));
    
    if (articles.length === 0) {
      return res.status(200).json({ items: FALLBACK_RSS_ARTICLES });
    }

    console.log(`✅ ${articles.length} articles RSS trouvés`);
    res.status(200).json({ items: articles });
    
  } catch (error) {
    console.warn("⚠️ Erreur RSS (fallback activé):", error.message);
    res.status(200).json({ items: FALLBACK_RSS_ARTICLES });
  }
});

export default router;
