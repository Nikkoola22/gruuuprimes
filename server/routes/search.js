import express from 'express';
import { searchCodes, searchJurisprudence } from '../services/piste.js';

const router = express.Router();

// POST /api/piste-search : articles de codes consolidés (fond CODE_DATE)
router.post('/piste-search', async (req, res) => {
  try {
    const { query } = req.body || {};
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query parameter is required and must be non-empty' });
    }

    const { results, totalCount } = await searchCodes(query, 5);
    return res.status(200).json({ success: true, query, results, totalCount });
  } catch (error) {
    console.error("💥 Erreur serveur /api/piste-search:", error.message);
    return res.status(200).json({ success: false, results: [], error: error.message });
  }
});

// POST /api/jurisprudence-search : jurisprudence judiciaire (fond JURI — Cassation, CAA, TA, CE)
router.post('/jurisprudence-search', async (req, res) => {
  try {
    const { query } = req.body || {};
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query parameter is required and must be non-empty' });
    }

    const { results, totalCount } = await searchJurisprudence(query, 5);
    return res.status(200).json({ success: true, query, results, totalCount });
  } catch (error) {
    console.error("💥 Erreur serveur /api/jurisprudence-search:", error.message);
    return res.status(200).json({ success: false, results: [], error: error.message });
  }
});

export default router;
