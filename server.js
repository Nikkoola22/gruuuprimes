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

    const url = "https://www.amf.asso.fr/page-toute-actualite/36012";
    console.log(`📡 Scraping des actualités AMF: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    if (!response.ok) {
      console.error(`❌ Erreur fetch AMF (${response.status})`);
      return res.status(500).json({ error: "Erreur récupération actualités AMF" });
    }

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
    const articles = [];

    // Skip the first part (pre-content)
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];

      // 1. Link
      const linkMatch = part.match(/href=["']([^"']+)["']/);
      let link = linkMatch ? linkMatch[1] : '#';
      if (link.startsWith('/')) {
        link = 'https://www.amf.asso.fr' + link;
      }

      // 2. Image URL
      const imgMatch = part.match(/<img[^>]+src=["']([^"']+)["']/i);
      let imageUrl = imgMatch ? imgMatch[1] : null;
      if (imageUrl && imageUrl.startsWith('/')) {
        imageUrl = 'https://www.amf.asso.fr' + imageUrl;
      }

      // 3. Title
      const titleMatch = part.match(/<h3><a[^>]*>([\s\S]*?)<\/a><\/h3>/i);
      let title = titleMatch ? titleMatch[1] : 'Sans titre';
      title = decodeHtmlEntities(title.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());

      // 4. Description
      const descMatch = part.match(/<div class="panel"[^>]*>([\s\S]*?)<\/div>/i);
      let description = descMatch ? descMatch[1] : '';
      description = decodeHtmlEntities(description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());

      // 5. Date text (e.g. "30 Juin 2026 - Réf: BW43249")
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
        timestamp
      });
    }

    // Sort by timestamp desc
    articles.sort((a, b) => b.timestamp - a.timestamp);

    // Limit to 15 articles
    const resultArticles = articles.slice(0, 15);

    console.log(`✅ Actualités FP AMF : ${resultArticles.length} articles récupérés`);
    res.json({ items: resultArticles });

  } catch (error) {
    console.error("💥 Erreur FP AMF Route:", error);
    res.status(500).json({ error: "Erreur récupération actualités AMF", details: error.message });
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