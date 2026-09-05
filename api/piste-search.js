import { handleCors } from './_security.js';
import { searchCodes } from '../server/services/piste.js';

// Endpoint Vercel serverless : recherche d'articles de codes consolidés
// (fond CODE_DATE Légifrance) via le canal PISTE — miroir de /api/piste-search (Express dev).
export default async function handler(req, res) {
  if (!handleCors(req, res, ['POST', 'OPTIONS'])) {
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, pageSize } = req.body || {};
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query parameter is required and must be non-empty' });
    }

    const limit = Math.min(Math.max(parseInt(pageSize, 10) || 5, 1), 10);
    const { results, totalCount } = await searchCodes(query, limit);

    return res.status(200).json({
      success: true,
      query,
      results,
      totalCount
    });
  } catch (error) {
    console.error("💥 Erreur serveur /api/piste-search:", error.message);
    return res.status(error.status || 200).json({
      success: false,
      results: [],
      error: error.message
    });
  }
}
