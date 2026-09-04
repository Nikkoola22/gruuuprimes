import express from 'express';

const router = express.Router();

router.get(['/news', '/cdg-news'], async (req, res) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const candidatePaths = [
      path.join(process.cwd(), 'src', 'data', 'cdg-news.json'),
      path.join(process.cwd(), 'public', 'data.json'),
      path.join(process.cwd(), 'data.json')
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        const data = fs.readFileSync(p, 'utf8');
        return res.status(200).json(JSON.parse(data));
      }
    }
    res.status(200).json([]);
  } catch (err) {
    console.warn("⚠️ Erreur lecture cdg-news:", err.message);
    res.status(500).json({ error: 'Failed to retrieve news data' });
  }
});

router.get('/infographies', async (req, res) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const candidatePaths = [
      path.join(process.cwd(), 'src', 'data', 'cdg-infographies.json'),
      path.join(process.cwd(), 'public', 'infographies.json'),
      path.join(process.cwd(), 'infographies.json')
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        const data = fs.readFileSync(p, 'utf8');
        return res.status(200).json(JSON.parse(data));
      }
    }
    res.status(200).json([]);
  } catch (err) {
    console.warn("⚠️ Erreur lecture infographies:", err.message);
    res.status(500).json({ error: 'Failed to retrieve infographies data' });
  }
});

router.get('/metadata', async (req, res) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const candidatePaths = [
      path.join(process.cwd(), 'src', 'data', 'cdg-metadata.json'),
      path.join(process.cwd(), 'public', 'metadata.json'),
      path.join(process.cwd(), 'metadata.json')
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        const data = fs.readFileSync(p, 'utf8');
        return res.status(200).json(JSON.parse(data));
      }
    }
    res.status(200).json({ last_updated: new Date().toISOString(), total_cdgs: 86, total_news: 320 });
  } catch (err) {
    console.warn("⚠️ Erreur lecture metadata:", err.message);
    res.status(500).json({ error: 'Failed to retrieve metadata' });
  }
});

export default router;
