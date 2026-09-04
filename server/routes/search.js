import express from 'express';

const router = express.Router();

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

router.post('/piste-search', async (req, res) => {
  try {
    const { query } = req.body || {};
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query parameter is required and must be non-empty' });
    }

    const sanitizedQuery = query.trim().slice(0, 300);

    const apiKey = process.env.LEGIFRANCE_API_KEY;
    if (!apiKey) {
      console.error("🚫 Clé API Légifrance manquante : définissez LEGIFRANCE_API_KEY dans .env");
      return res.status(503).json({ success: false, results: [], error: "Service Légifrance non configuré (LEGIFRANCE_API_KEY manquante)" });
    }
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

export default router;
