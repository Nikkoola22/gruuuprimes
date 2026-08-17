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

// --- SÉCURITÉ : Masquer Express & configurer les en-têtes sécurisés ---
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

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
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query parameter is required and must be non-empty' });
    }

    const sanitizedQuery = query.trim().slice(0, 300);

    const apiKey = process.env.LEGIFRANCE_API_KEY || "6f3304e9-0093-46c4-8a20-f0dc98c73a01";
    const token = await getPisteToken();

    const fetch = (await import('node-fetch')).default;
    console.log(`⚖️ Recherche PISTE Légifrance pour: "${sanitizedQuery}"`);

    const searchPayload = {
      fond: "CODE_DATE",
      recherche: {
        mots: [{ valeur: sanitizedQuery, typeMot: "EXACTE" }],
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
  // Générer une réponse synthétique locale basée sur la documentation et Légifrance si la clé Perplexity est absente
  if (!process.env.PERPLEXITY_API_KEY) {
    console.log('ℹ️ PERPLEXITY_API_KEY absente - Génération d\'une réponse synthétique basée sur le fonds statutaire et Légifrance PISTE');

    const messages = completionBody.messages || [];
    const userMsgObj = messages.find(m => m.role === 'user') || {};
    const systemMsgObj = messages.find(m => m.role === 'system') || {};
    const userPrompt = userMsgObj.content || '';
    const docContext = systemMsgObj.content || '';

    const generateLocalStatutoryResponse = (prompt, context) => {
      const promptNorm = prompt
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

      // 1. MARIAGE OU PACS
      if (promptNorm.includes('mariage') || promptNorm.includes('pacs') || promptNorm.includes('se marier') || promptNorm.includes('epouser')) {
        return `### 💍 Autorisation Spéciale d'Absence - Mariage & PACS (Mairie de Gennevilliers / CGFP)\n\nSelon le règlement du temps de travail de la Mairie de Gennevilliers (Chapitre 3 - Article 6) :\n\n• **Mariage ou PACS de l'agent** : **7 jours ouvrés**\n• **Mariage ou PACS d'un enfant de l'agent** : **3 jours ouvrés**\n• **Mariage ou PACS d'un proche** (ascendant, descendant, frère, sœur, beau-frère, belle-sœur, oncle, tante, neveu, nièce) : **1 jour ouvré**\n\nℹ️ *Conditions statutaires* :\n- Les jours accordés au titre d'un PACS ne peuvent pas être réattribués en cas de mariage pour la même personne.\n- Ces jours sont consécutifs, non fractionnables et doivent obligatoirement encadrer ou inclure la date de la célébration.\n- Justificatif : Présentation d'un acte de mariage ou de déclaration de PACS obligatoire.`;
      }

      // 2. DÉMÉNAGEMENT
      if (promptNorm.includes('demenag') || promptNorm.includes('déménag') || promptNorm.includes('changement d\'adresse')) {
        return `### 🚚 Autorisation Spéciale d'Absence - Déménagement (Mairie de Gennevilliers)\n\nSelon le règlement interne de la Mairie de Gennevilliers (Chapitre 3 - Article 10) :\n\n• **Durée** : **1 journée d'autorisation d'absence**\n• **Période** : À prendre au choix au cours de la semaine précédant ou de la semaine suivant le déménagement.\n• **Justificatif** : Présentation obligatoire d'un justificatif de changement d'adresse (contrat de bail, acte d'achat, facture d'énergie).`;
      }

      // 3. DÉCÈS / OBSÈQUES
      if (promptNorm.includes('deces') || promptNorm.includes('obseque') || promptNorm.includes('deuil') || promptNorm.includes('enterrement')) {
        return `### 🕊️ Autorisation Spéciale d'Absence - Décès d'un proche (Mairie de Gennevilliers)\n\nSelon le règlement interne de la Mairie de Gennevilliers (Chapitre 3 - Article 5) :\n\n• **Conjoint, partenaire de PACS ou concubin** : **5 jours ouvrés**\n• **Père ou mère de l'agent / du conjoint** : **5 jours ouvrés**\n• **Enfant de moins de 25 ans** : **14 jours ouvrables** (+ 8 jours complémentaires)\n• **Enfant de plus de 25 ans** : **12 jours ouvrables**\n• **Grands-parents, frères, sœurs** : **3 jours ouvrés**\n• **Oncle, tante, neveu, nièce** : **1 jour ouvré**`;
      }

      // 4. RENTRÉE SCOLAIRE
      if (promptNorm.includes('rentree') || promptNorm.includes('ecole') || promptNorm.includes('scolaire')) {
        return `### 🎒 Facilités Horaires - Rentrée Scolaire (Mairie de Gennevilliers)\n\nSelon le règlement de la Mairie de Gennevilliers (Chapitre 3 - Article 9) :\n\n• **Durée** : Facilités horaires dans la limite d'**1 heure** dans la journée pour accompagner ou aller chercher son enfant.\n• **Public concerné** : Enfants scolarisés en maternelle, primaire et entrée en classe de 6ème.\n• **Sous réserve des nécessités de service**.`;
      }

      // 5. GARDE D'ENFANT MALADE
      if (promptNorm.includes('enfant malade') || promptNorm.includes('soigner enfant') || promptNorm.includes('garde d\'enfant')) {
        return `### 🩺 Autorisation Spéciale d'Absence - Garde d'Enfant Malade (Mairie de Gennevilliers)\n\nSelon le règlement de la Mairie de Gennevilliers (Chapitre 3 - Article 2) :\n\n• **Conditions** : Accordée pour soigner un enfant malade ou en assurer momentanément la garde lors d'un événement imprévu.\n• **Justificatif** : Certificat médical obligatoire attestant de la présence nécessaire du parent.`;
      }

      // 6. DON DU SANG
      if (promptNorm.includes('don du sang') || promptNorm.includes('plaquette')) {
        return `### 🩸 Autorisation d'Absence - Don du Sang & Plaquettes\n\nSelon le règlement de la Mairie de Gennevilliers (Chapitre 3) :\n\n• **Autorisation** : Les agents sont autorisés à s'absenter pour le don du sang ou de plaquettes.\n• **Conditions** : Demande préalable auprès du responsable hiérarchique et production d'un justificatif au retour.`;
      }

      // 7. TEMPS PARTIEL THÉRAPEUTIQUE (Réforme 2026)
      if (promptNorm.includes('temps partiel therapeutique') || promptNorm.includes('tpt') || promptNorm.includes('reprise therapeutique')) {
        return `### 🩺 Temps Partiel Thérapeutique (TPT) - Nouvelles Règles 2026 (CIG / CGFP)\n\n• **Durée** : Accordé dans la limite d'**1 an**.\n• **Délai de réponse employeur** : L'employeur a **30 jours** pour répondre à la demande (sauf CLM, CLD, CITIS : décision au plus tard le jour de la reprise).\n• **Refus motivé** : Obligation de motiver le refus (entretien obligatoire si motif de service ; avis d'un médecin agréé si motif médical).\n• **Contrôle** : Possibilité pour l'employeur de diligenter un contrôle médical dès le dépôt de la demande.`;
      }

      // 8. CONGÉS MALADIE & CONTRÔLE A DOMICILE (Réforme 2026)
      if (promptNorm.includes('arret maladie') || promptNorm.includes('conge maladie') || promptNorm.includes('controle a domicile') || promptNorm.includes('prolongation')) {
        return `### 🏥 Congés Maladie & Contrôle d'Absence - Règles 2026 (Décrets du 30 juil. 1987 et 15 févr. 1988)\n\n• **Plafonnement** : Durée limitée à **31 jours** pour un premier arrêt et à **62 jours** pour une prolongation.\n• **Prescripteur obligatoire** : Maintien de salaire en prolongation uniquement si l'arrêt est délivré par le médecin traitant ou le prescripteur initial.\n• **Contrôle à domicile** : L'employeur peut diligenter un contrôle administratif pour vérifier la présence au domicile (heures obligatoires / sorties).\n• **Formation** : Possibilité pour l'agent en arrêt d'effectuer une formation ou un bilan de compétences sur avis médical.`;
      }

      // 9. RETRAITE & BONIFICATION ENFANTS (Réforme 2026)
      if (promptNorm.includes('retraite') || promptNorm.includes('bonification') || promptNorm.includes('pension') || promptNorm.includes('carriere longue')) {
        return `### 🌴 Retraite FPT - Bonification Enfants & Carrières Longues (Au 1er sept. 2026)\n\n• **Bonification enfants** : **1 trimestre supplémentaire** accordé aux femmes fonctionnaires pour chaque enfant né à compter du 1er janvier 2004 postérieurement à leur recrutement (Décret n°2003-1306).\n• **Carrières longues** : Prise en compte des bonifications et majorations pour enfants dans la période réputée cotisée (art. D. 16-2 CPCMR).`;
      }

      // 7. SMART TF-IDF EXTRACTION SUR DOCUMENTATION INTERNE
      const STOP_WORDS = new Set([
        'pour', 'mon', 'ma', 'mes', 'du', 'des', 'le', 'la', 'les', 'un', 'une',
        'et', 'ou', 'dans', 'en', 'par', 'sur', 'avec', 'sans', 'sous', 'combien',
        'droit', 'droits', 'jour', 'jours', 'avez', 'vous', 'dans', 'sont', 'est',
        'avoir', 'etre', 'faire', 'plus', 'moins', 'quel', 'quelle', 'quels', 'quelles'
      ]);

      const highSignalKeywords = promptNorm
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 3 && !STOP_WORDS.has(w));

      if (highSignalKeywords.length > 0 && context) {
        const blocks = context.split(/\n\n+/).filter(b => b.trim().length > 20);
        const scoredBlocks = blocks.map(block => {
          const lower = block.toLowerCase();
          let score = 0;
          highSignalKeywords.forEach(kw => {
            if (lower.includes(kw)) score += 10;
          });
          const uniqueHits = highSignalKeywords.filter(kw => lower.includes(kw)).length;
          if (uniqueHits > 1) score += uniqueHits * 15;
          return { block, score };
        });

        const bestMatches = scoredBlocks
          .filter(b => b.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map(b => b.block.replace(/^[-*•]\s*/, ''));

        if (bestMatches.length > 0) {
          return `### Synthèse Réglementaire & Statutaire (Mairie de Gennevilliers)\n\nVoici les éléments d'information issus des textes statutaires :\n\n` +
            bestMatches.map(m => `• ${m}`).join('\n\n');
        }
      }

      return `### Synthèse Statutaire CGFP & Mairie de Gennevilliers\n\nVotre demande a été analysée au regard des règles du Code Général de la Fonction Publique (CGFP).\n\nPour une analyse personnalisée de votre dossier individuel ou des détails sur l'application locale, vous pouvez contacter directement vos délégués syndicaux CFDT au **01 40 85 64 64**.`;
    };

    const generatedContent = generateLocalStatutoryResponse(userPrompt, docContext);

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
      model: completionBody.model || "sonar",
      messages: completionBody.messages,
      return_images: false,
      return_related_questions: false,
      max_tokens: 1500,
      temperature: 0.0
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