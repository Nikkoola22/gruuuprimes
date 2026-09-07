/**
 * Service partagé PISTE / Légifrance (DILA)
 * Utilisé à la fois par :
 *  - le serveur Express de dev (server/routes/search.js)
 *  - les fonctions serverless Vercel (api/piste-search.js, api/jurisprudence-search.js)
 *
 * Canaux :
 *  - fond CODE_DATE (lf-engine-app/search) : codes consolidés en vigueur
 *  - fond JURI (lf-engine-app/search)      : jurisprudence judiciaire (Cassation, CAA, TA, CE)
 * Auth : OAuth2 client_credentials sur oauth.piste.gouv.fr, token en cache mémoire.
 */

let pisteAccessToken = null;
let pisteTokenExpiresAt = 0;

// Identifiants PISTE/Légifrance : variables d'environnement uniquement (.env)
function getPisteCredentials() {
  const clientId = process.env.PISTE_CLIENT_ID || process.env.LEGIFRANCE_CLIENT_ID;
  const clientSecret = process.env.PISTE_CLIENT_SECRET || process.env.LEGIFRANCE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Identifiants PISTE non configurés : définissez PISTE_CLIENT_ID et PISTE_CLIENT_SECRET dans .env");
  }
  return { clientId, clientSecret };
}

async function getPisteToken() {
  if (pisteAccessToken && Date.now() < pisteTokenExpiresAt) {
    return pisteAccessToken;
  }

  const { clientId, clientSecret } = getPisteCredentials();

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

/** Extraction de la juridiction depuis le titre normalisé Légifrance ("Cour de cassation, civile, ...") */
function extractJuridiction(title) {
  if (!title) return "Juridiction";
  const sep = title.indexOf(",");
  return (sep > 0 ? title.slice(0, sep) : title).trim();
}

/** Extraction de la date lisible depuis le titre ("Cour de cassation, civile, ..., 5 mai 2021, 20-12.814") */
function extractDateFromTitle(title) {
  if (!title) return "";
  const match = title.match(/(\d{1,2}(?:er)?\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4})/i);
  return match ? match[1] : "";
}

// Mots vides français : le moteur ne les gère pas, et ils polluent le classement
// BM25 (présents dans presque tout le corpus → résultats hors sujet)
const STOPWORDS = new Set([
  "au", "aux", "avec", "ce", "ces", "dans", "de", "des", "du", "elle", "en", "et", "eux",
  "il", "ils", "je", "la", "le", "les", "leur", "lui", "ma", "mais", "me", "mes", "moi",
  "mon", "ne", "nos", "notre", "nous", "on", "ou", "par", "pas", "pour", "que", "qui",
  "sa", "se", "ses", "son", "sur", "ta", "te", "tes", "toi", "ton", "tu", "un", "une",
  "vos", "votre", "vous", "c", "d", "j", "l", "m", "n", "s", "t", "y", "est", "sont"
]);

/**
 * Corps de requête du moteur lf-engine-app/search.
 * Format validé contre l'API (2026-09) : `champs[].criteres[]` + `sort`.
 * L'ancien format `recherche.mots[]` était silencieusement ignoré par le moteur
 * (il renvoyait l'intégralité du fond, tri par défaut → décisions anciennes).
 * Seul `UN_DES_MOTS` est accepté dans criteres[].typeRecherche — la pertinence
 * vient du tri PERTINENCE et du retrait des mots vides de la requête.
 */
function buildSearchBody(fond, sanitizedQuery, pageSize) {
  const terms = sanitizedQuery
    .toLowerCase()
    .split(/[^\p{L}\p{N}']+/u)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
  const valeur = terms.length ? terms.join(" ") : sanitizedQuery;

  return {
    fond,
    recherche: {
      champs: [{
        typeChamp: "ALL",
        criteres: [{ valeur, typeRecherche: "UN_DES_MOTS", operateur: "ET" }],
        operateur: "ET"
      }],
      filtres: [],
      pageNumber: 1,
      pageSize,
      operateur: "ET",
      sort: "PERTINENCE",
      typePagination: "DEFAUT"
    }
  };
}

/** Le moteur renvoie les termes trouvés entourés de balises <mark> — à nettoyer avant affichage */
function stripMarks(str) {
  return (str || "").replace(/<\/?mark>/g, "").replace(/\s+/g, " ").trim();
}

/** Résumé du dossier depuis les sections structurées (Résumé principal / Abstrat) */
function extractSummary(item) {
  for (const section of item.sections || []) {
    for (const extract of section.extracts || []) {
      const field = extract.searchFieldName || "";
      if (/Résumé principal|Abstrat/i.test(field) && extract.values?.length) {
        return stripMarks(extract.values[0]).slice(0, 300);
      }
    }
  }
  return "";
}

/** Recherche dans le fond CODE_DATE : articles de codes consolidés en vigueur */
export async function searchCodes(query, pageSize = 5) {
  const sanitizedQuery = query.trim().slice(0, 300);
  const apiKey = process.env.LEGIFRANCE_API_KEY;
  if (!apiKey) {
    throw new Error("Service Légifrance non configuré (LEGIFRANCE_API_KEY manquante)");
  }
  const token = await getPisteToken();

  const fetch = (await import('node-fetch')).default;
  const response = await fetch("https://api.piste.gouv.fr/dila/legifrance/lf-engine-app/search", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "KeyId": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(buildSearchBody("CODE_DATE", sanitizedQuery, pageSize)),
    signal: AbortSignal.timeout(15000)
  });

  if (!response.ok) {
    const errText = await response.text();
    console.warn(`⚠️ Erreur API PISTE Search (${response.status}):`, errText);
    const error = new Error(`Statut PISTE: ${response.status}`);
    error.status = 502;
    throw error;
  }

  const data = await response.json();
  const rawResults = data.results || [];

  return {
    totalCount: data.totalResultNumber || rawResults.length,
    results: rawResults.slice(0, pageSize).map((item) => {
      const mainTitle = stripMarks(item.titles?.[0]?.title) || item.title || "Code / Contexte Réglementaire";
      const id = item.titles?.[0]?.id || item.id || "";
      const num = item.num ? `Article ${item.num}` : "";

      let link = "https://www.legifrance.gouv.fr";
      if (id) {
        link = `https://www.legifrance.gouv.fr/codes/article_lc/${id}`;
      }

      return {
        title: mainTitle,
        id,
        num,
        nature: item.nature || "article",
        etat: item.etat || "VIGUEUR",
        origin: item.origin || "LEGI",
        link
      };
    })
  };
}

/** Recherche dans le fond JURI : jurisprudence judiciaire (Cassation, CAA, TA, CE) */
export async function searchJurisprudence(query, pageSize = 5) {
  const sanitizedQuery = query.trim().slice(0, 300);
  const apiKey = process.env.LEGIFRANCE_API_KEY;
  if (!apiKey) {
    throw new Error("Service Légifrance non configuré (LEGIFRANCE_API_KEY manquante)");
  }
  const token = await getPisteToken();

  const fetch = (await import('node-fetch')).default;
  const response = await fetch("https://api.piste.gouv.fr/dila/legifrance/lf-engine-app/search", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "KeyId": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(buildSearchBody("JURI", sanitizedQuery, pageSize)),
    signal: AbortSignal.timeout(15000)
  });

  if (!response.ok) {
    const errText = await response.text();
    console.warn(`⚠️ Erreur API PISTE Jurisprudence (${response.status}):`, errText);
    const error = new Error(`Statut PISTE: ${response.status}`);
    error.status = 502;
    throw error;
  }

  const data = await response.json();
  const rawResults = data.results || [];

  return {
    totalCount: data.totalResultNumber || rawResults.length,
    results: rawResults.slice(0, pageSize).map((item) => {
      const title = stripMarks(item.titles?.[0]?.title) || "Décision de justice";
      const id = item.titles?.[0]?.id || item.id || "";

      return {
        title,
        id,
        juridiction: extractJuridiction(title),
        nature: item.nature || "décision",
        solution: item.solution || "",
        date: item.date || item.datePublication || item.dateSignature || extractDateFromTitle(title),
        summary: extractSummary(item),
        excerpt: stripMarks(item.text).slice(0, 400),
        link: id ? `https://www.legifrance.gouv.fr/juri/id/${id}` : "https://www.legifrance.gouv.fr"
      };
    })
  };
}
