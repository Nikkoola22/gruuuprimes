import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { isAllowedOrigin, sanitizeCompletionRequest, summarizeCompletionRequest } from './api/_security.js';

// Charger .env (placeholders) puis .env.local (valeurs locales sensibles qui remplacent les placeholders)
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

const app = express();
const PORT = 3001;

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ limit: '256kb', extended: true }));

// --- RATE LIMITING: 150 requêtes par minute ---
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 150, // 150 requêtes par minute
  message: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer après une minute.',
  standardHeaders: true, // Retourne les infos rate-limit dans les headers
  legacyHeaders: false, // Désactive les anciens headers X-RateLimit-*
});

app.use('/api/', limiter);

// Route pour les completions Perplexity
app.post('/api/completions', async (req, res) => {
  const completionBody = sanitizeCompletionRequest(req.body);

  if (!completionBody) {
    return res.status(400).json({ error: 'Invalid completion payload' });
  }

  console.log('📝 Requête IA reçue:', summarizeCompletionRequest(completionBody));
  
  // Vérifier que la clé API existe
  if (!process.env.PERPLEXITY_API_KEY) {
    console.error('❌ PERPLEXITY_API_KEY n\'est pas définie');
    return res.status(200).json({
      id: 'fallback-no-api-key',
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: completionBody.model || 'fallback-local',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: "Le service de réponse IA externe n'est pas configuré en local (PERPLEXITY_API_KEY manquante). Vous pouvez continuer à utiliser la recherche interne et les contenus locaux de l'application."
          },
          finish_reason: 'stop'
        }
      ]
    });
  }
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Modifier la requête pour limiter les recherches externes
    const modifiedBody = {
      ...completionBody,
      // Paramètres pour limiter les recherches web
      return_images: false,
      return_related_questions: false,
      max_tokens: 1000,
      temperature: 0.0 // Température très basse pour limiter la créativité
    };
    
    // --- TIMEOUT: 30 secondes ---
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(modifiedBody),
      signal: controller.signal // Ajoute le timeout
    });

    clearTimeout(timeoutId);
    console.log('📡 Statut réponse Perplexity:', response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error('❌ Erreur Perplexity:', text);
      
      // Gérer spécifiquement les erreurs 401 (non autorisé)
      if (response.status === 401) {
        return res.status(401).json({ 
          error: "Erreur d'authentification", 
          details: "La clé API Perplexity est invalide ou expirée. Veuillez vérifier votre clé API dans les variables d'environnement.",
          hint: "Assurez-vous que la clé commence par 'pplx-' et qu'elle est correctement configurée."
        });
      }
      
      // Pour les autres erreurs, essayer de parser le JSON si possible
      try {
        const errorJson = JSON.parse(text);
        return res.status(response.status).json({
          error: errorJson.error || `Erreur API Perplexity (${response.status})`,
          details: errorJson.message || response.statusText,
        });
      } catch {
        return res.status(response.status).json({ 
          error: `Erreur API Perplexity (${response.status})`, 
          details: response.statusText,
        });
      }
    }

    const data = await response.json();
    console.log('✅ Réponse Perplexity reçue');
    res.status(200).json(data);

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error("⏱️ Timeout: Requête Perplexity dépassée (30s)");
      return res.status(200).json({
        id: 'fallback-timeout',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: completionBody.model || 'fallback-local',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: "Le service IA externe a expiré. Je peux néanmoins vous aider à partir des contenus internes disponibles dans l'application."
            },
            finish_reason: 'stop'
          }
        ]
      });
    }
    console.error("💥 Erreur serveur:", error);
    res.status(200).json({
      id: 'fallback-server-error',
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: completionBody.model || 'fallback-local',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: "Le service IA externe est temporairement indisponible. Réessayez plus tard ou configurez la clé Perplexity pour activer les réponses externes."
          },
          finish_reason: 'stop'
        }
      ]
    });
  }
});

// Route pour récupérer les flux RSS de la Fonction Publique
app.get('/api/fp-rss', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const xml2js = await import('xml2js');
    const parser = new xml2js.default.Parser();

    const rssUrls = [
      "https://www.fonction-publique.gouv.fr/flux-rss-concours",
      "https://www.fonction-publique.gouv.fr/flux-rss-actualites",
      "https://www.fonction-publique.gouv.fr/flux-rss-rubrique-la-dgafp"
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
            imageUrl = 'https://www.fonction-publique.gouv.fr' + imageUrl;
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
                    article.imageUrl = 'https://www.fonction-publique.gouv.fr' + article.imageUrl;
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

    allArticles.sort((a, b) => b.timestamp - a.timestamp);
    allArticles = allArticles.slice(0, 15);

    console.log(`✅ ${allArticles.length} actualités FP trouvées`);
    res.json({ items: allArticles });

  } catch (error) {
    console.error("💥 Erreur FP RSS:", error);
    res.status(500).json({ error: "Erreur récupération RSS FP", details: error.message });
  }
});

// Route pour récupérer les actualités CFDT Interco
app.get('/api/interco-rss', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const xml2js = await import('xml2js');
    const parser = new xml2js.default.Parser();

    const rssUrl = "https://interco.cfdt.fr/feed/";
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

    const articles = (jsonData.rss?.channel?.[0]?.item || []).slice(0, 10).map((item) => {
      const title = item.title?.[0] || 'Sans titre';
      const link = item.link?.[0] || '#';
      const pubDate = item.pubDate?.[0] || new Date().toISOString();
      const category = Array.isArray(item.category) ? item.category[0] : (item.category || '');
      
      const descriptionHtml = item.description?.[0] || '';
      const contentEncodedHtml = item['content:encoded']?.[0] || '';
      const combinedHtml = contentEncodedHtml + descriptionHtml;
      
      // Extraction de l'URL de l'image (attribut src d'une balise img)
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

    console.log(`✅ ${articles.length} actualités Interco CFDT trouvées`);
    res.status(200).json({ items: articles });

  } catch (error) {
    console.error("💥 Erreur Interco RSS:", error);
    res.status(200).json({ items: [], error: "Erreur récupération RSS Interco", details: error.message });
  }
});

// Route pour récupérer les flux RSS (évite les problèmes CORS)
app.get('/api/rss', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const xml2js = await import('xml2js');
    const parser = new xml2js.default.Parser();
    
    const rssUrl = "https://www.franceinfo.fr/politique.rss";
    
    console.log(`📡 Récupération du flux RSS: ${rssUrl}`);
    
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.error(`❌ Erreur fetch RSS (${response.status}):`, response.statusText);
      return res.status(response.status).json({ error: 'Erreur récupération RSS' });
    }
    
    const xmlText = await response.text();
    const jsonData = await parser.parseStringPromise(xmlText);
    
    // Extraction des articles
    const articles = (jsonData.rss?.channel?.[0]?.item || []).slice(0, 10).map((item) => ({
      title: item.title?.[0] || 'Sans titre',
      link: item.link?.[0] || '#',
      pubDate: item.pubDate?.[0] || new Date().toISOString()
    }));
    
    console.log(`✅ ${articles.length} articles RSS trouvés`);
    res.status(200).json({ items: articles });
    
  } catch (error) {
    console.error("💥 Erreur RSS:", error);
    res.status(200).json({ items: [], error: "Erreur récupération RSS", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur API démarré sur http://localhost:${PORT}`);
});