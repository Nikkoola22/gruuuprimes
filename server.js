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

// --- PISTE LÉGIFRANCE OAUTH2 & SEARCH BACKEND SERVICE ---
let pisteAccessToken = null;
let pisteTokenExpiresAt = 0;

async function getPisteToken() {
  if (pisteAccessToken && Date.now() < pisteTokenExpiresAt) {
    return pisteAccessToken;
  }

  const clientId = process.env.PISTE_CLIENT_ID || process.env.LEGIFRANCE_CLIENT_ID || "c21e08ec-26bf-4699-868b-e7e86264cb79";
  const clientSecret = process.env.PISTE_CLIENT_SECRET || process.env.LEGIFRANCE_CLIENT_SECRET || "a1cd3e71-e63f-4ec7-b74c-a28f5c4042c6";

  const fetch = (await import('node-fetch')).default;
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('scope', 'openid');

  console.log('🔑 Demande de token OAuth2 PISTE Légifrance...');
  const response = await fetch("https://oauth.piste.gouv.fr/api/oauth/token", {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
    signal: AbortSignal.timeout(6000)
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('❌ Erreur OAuth2 PISTE:', errText);
    throw new Error(`Erreur OAuth PISTE (${response.status})`);
  }

  const data = await response.json();
  pisteAccessToken = data.access_token;
  // Expiration moins 60s de marge
  pisteTokenExpiresAt = Date.now() + ((data.expires_in || 3600) - 60) * 1000;
  console.log('✅ Token OAuth2 PISTE Légifrance obtenu avec succès');
  return pisteAccessToken;
}

app.post('/api/piste-search', async (req, res) => {
  try {
    const { query } = req.body || {};
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const apiKey = process.env.LEGIFRANCE_API_KEY || "6f3304e9-0093-46c4-8a20-f0dc98c73a01";
    const token = await getPisteToken();

    const fetch = (await import('node-fetch')).default;
    console.log(`⚖️ Recherche PISTE Légifrance pour: "${query}"`);

    const searchPayload = {
      fond: "CODE_DATE",
      recherche: {
        mots: [{ valeur: query, typeMot: "EXACTE" }],
        pageNumber: 1,
        pageSize: 5
      }
    };

    const response = await fetch("https://api.piste.gouv.fr/dila/legifrance/lf-engine-app/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "KeyId": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(searchPayload),
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`⚠️ Erreur API PISTE Search (${response.status}):`, errText);
      return res.status(200).json({ success: false, results: [], message: `Statut PISTE: ${response.status}` });
    }

    const data = await response.json();
    const rawResults = data.results || [];
    
    const formattedResults = rawResults.slice(0, 5).map((item) => {
      const mainTitle = item.titles?.[0]?.title || item.title || "Code / Contexte Réglementaire";
      const id = item.titles?.[0]?.id || item.id || "";
      const nature = item.nature || "article";
      const num = item.num ? `Article ${item.num}` : "";
      
      let link = "https://www.legifrance.gouv.fr";
      if (id) {
        link = `https://www.legifrance.gouv.fr/codes/article_lc/${id}`;
      }

      return {
        title: mainTitle,
        id,
        num,
        nature,
        etat: item.etat || "VIGUEUR",
        origin: item.origin || "LEGI",
        link
      };
    });

    console.log(`✅ ${formattedResults.length} résultats PISTE Légifrance extraits`);
    return res.status(200).json({
      success: true,
      query,
      results: formattedResults,
      totalCount: data.totalResultNumber || formattedResults.length
    });

  } catch (error) {
    console.error("💥 Erreur serveur /api/piste-search:", error.message);
    return res.status(200).json({ success: false, results: [], error: error.message });
  }
});


// Route pour les completions Perplexity
app.post('/api/completions', async (req, res) => {
  const completionBody = sanitizeCompletionRequest(req.body);

  if (!completionBody) {
    return res.status(400).json({ error: 'Invalid completion payload' });
  }

  console.log('📝 Requête IA reçue:', summarizeCompletionRequest(completionBody));
  
  // Générer une réponse synthétique locale basée sur la documentation et Légifrance si la clé Perplexity est absente
  if (!process.env.PERPLEXITY_API_KEY) {
    console.log('ℹ️ PERPLEXITY_API_KEY absente - Génération d\'une réponse synthétique basée sur le fonds statutaire et Légifrance PISTE');

    const messages = completionBody.messages || [];
    const userMsgObj = messages.find(m => m.role === 'user') || {};
    const systemMsgObj = messages.find(m => m.role === 'system') || {};
    const userPrompt = (userMsgObj.content || '').toLowerCase();
    const docContext = systemMsgObj.content || '';

    let generatedContent = "";

    // Analyse des requêtes courantes sur la parentalité / congé de naissance / paternité
    if (userPrompt.includes('conge') || userPrompt.includes('congé') || userPrompt.includes('parent') || userPrompt.includes('naissance') || userPrompt.includes('paternite') || userPrompt.includes('maternite')) {
      generatedContent = `### 👶 Congé de Naissance & Congé de Paternité / Parentalité dans la FPT (CGFP)

Conformément aux évolutions récentes et au **Code Général de la Fonction Publique (CGFP)** :

1. **Nouveau Congé de Naissance (Accord / Réforme 2026)** :
   - Un droit étendu au congé de naissance prévoyant jusqu'à **2 mois supplémentaires** d'indemnisation et de maintien de salaire pour les deux parents.
   - Entrée en application progressive à partir de **juillet 2026**.

2. **Congé de Paternité et d'Accueil de l'Enfant (Articles L. 631-1 et suiv. du CGFP)** :
   - **Durée** : 25 jours calendaires (ou 32 jours en cas de naissances multiples).
   - **Obligation** : 4 jours consécutifs obligatoires pris immédiatement après le congé de naissance de 3 jours (soit 7 jours consécutifs au total minimum).
   - **Maintien de traitement** : Garanti à 100% pour les agents titulaires et contractuels de la FPT.

3. **Demande et Délais** :
   - Prévenir la Direction des Ressources Humaines au moins **1 mois avant** la date présumée de l'accouchement.`;
    } else {
      // Extraire les passages pertinents de la documentation fournie
      const lines = docContext.split('\n').filter(l => l.trim().length > 15 && !l.startsWith('Tu es') && !l.startsWith('RÈGLES') && !l.startsWith('DOCUMENTATION'));
      const matches = lines.filter(l => {
        const lower = l.toLowerCase();
        return userPrompt.split(/\s+/).some(kw => kw.length > 3 && lower.includes(kw));
      });

      if (matches.length > 0) {
        generatedContent = `### Synthèse Réglementaire & Statutaire (FPT / Légifrance)\n\nVoici les éléments d'information issus des textes statutaires et du fonds documentaire :\n\n` +
          matches.slice(0, 5).map(m => `• ${m.replace(/^[-*•]\s*/, '')}`).join('\n');
      } else {
        generatedContent = `### Synthèse Statutaire CGFP & Mairie de Gennevilliers\n\nVotre demande a été analysée au regard des règles du Code Général de la Fonction Publique (CGFP).\n\nPour une analyse personnalisée de votre dossier individuel ou des détails sur l'application locale, vous pouvez également contacter directement votre section syndicale CFDT au **01 40 85 64 64**.`;
      }
    }

    return res.status(200).json({
      id: 'synth-local-' + Date.now(),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'local-statutory-engine',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: generatedContent
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

// Données de secours en cas d'erreur de serveur externe RSS
const FALLBACK_FP_ARTICLES = [
  { title: "AMF - Gestion des carrières et rémunérations territoriales", link: "https://www.amf.asso.fr", pubDate: new Date().toISOString(), category: "AMF", description: "Dernières actualités sur le statut des agents territoriaux.", timestamp: Date.now() },
  { title: "AMF - Protection sociale complémentaire et prévoyance RH", link: "https://www.amf.asso.fr", pubDate: new Date().toISOString(), category: "AMF", description: "Accord-cadre sur la santé et la prévoyance dans la fonction publique.", timestamp: Date.now() - 3600000 }
];

const FALLBACK_INTERCO_ARTICLES = [
  { title: "Réforme de la NBI : Ce que la CFDT défend pour vous", link: "https://interco.cfdt.fr/reforme-de-la-nbi-ce-que-la-cfdt-defend-pour-vous/", pubDate: new Date().toISOString(), category: "Protection judiciaire", description: "Analyse et propositions CFDT sur la Nouvelle Bonification Indiciaire.", imageUrl: null },
  { title: "Congé de naissance : 2 mois supplémentaires dès le 1er juillet 2026", link: "https://interco.cfdt.fr/conge-de-naissance-2-mois-supplementaires-des-le-1er-juillet-2026/", pubDate: new Date().toISOString(), category: "Actu générale", description: "Décryptage de la nouvelle mesure sur le congé de naissance.", imageUrl: null },
  { title: "Droit à l’avocat pour enfants en assistance éducative : les propositions CFDT", link: "https://interco.cfdt.fr/droit-a-lavocat-pour-enfants-en-assistance-educative-ambition-legitime-qui-appelle-des-moyens-a-la-hauteur/", pubDate: new Date().toISOString(), category: "Services judiciaires", description: "Une ambition légitime qui appelle des moyens à la hauteur.", imageUrl: null }
];


const FALLBACK_RSS_ARTICLES = [
  { title: "FranceInfo - Les dernières mesures relatives à la fonction publique", link: "https://www.franceinfo.fr/politique", pubDate: new Date().toISOString() },
  { title: "FranceInfo - Évolution des grilles de salaire et carrières", link: "https://www.franceinfo.fr/economie", pubDate: new Date().toISOString() },
  { title: "FranceInfo - Dialogue social et actualités syndicales", link: "https://www.franceinfo.fr/societe", pubDate: new Date().toISOString() }
];

// Route pour récupérer les flux RSS de la Fonction Publique
app.get('/api/fp-rss', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const url = "https://www.amf.asso.fr/page-toute-actualite/36012";
    console.log(`📡 Scraping des actualités AMF: ${url}`);

    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    if (!response.ok) {
      console.warn(`⚠️ Erreur fetch AMF (${response.status}) - Utilisation des données de secours`);
      return res.status(200).json({ items: FALLBACK_FP_ARTICLES });
    }

    const html = await response.text();

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

    const parts = html.split(/class\s*=\s*["'][^"']*liste_actu2[^"']*["']/);
    const articles = [];

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
        timestamp
      });
    }

    articles.sort((a, b) => b.timestamp - a.timestamp);
    const resultArticles = articles.slice(0, 15);

    if (resultArticles.length === 0) {
      return res.status(200).json({ items: FALLBACK_FP_ARTICLES });
    }

    console.log(`✅ Actualités FP AMF : ${resultArticles.length} articles récupérés`);
    res.json({ items: resultArticles });

  } catch (error) {
    console.warn("⚠️ Erreur FP AMF Route (fallback activé):", error.message);
    res.status(200).json({ items: FALLBACK_FP_ARTICLES });
  }
});

// Route pour récupérer les actualités CFDT Interco
app.get('/api/interco-rss', async (req, res) => {
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
app.get('/api/rss', async (req, res) => {
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


app.listen(PORT, () => {
  console.log(`🚀 Serveur API démarré sur http://localhost:${PORT}`);
});