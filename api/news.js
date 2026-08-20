import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const candidatePaths = [
      path.join(process.cwd(), 'src', 'data', 'cdg-news.json'),
      path.join(process.cwd(), 'public', 'data.json'),
      path.join(process.cwd(), 'data.json')
    ];

    let data = null;
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        data = fs.readFileSync(p, 'utf8');
        break;
      }
    }

    if (data) {
      return res.status(200).json(JSON.parse(data));
    }
    return res.status(200).json([]);
  } catch (error) {
    console.error('Error reading news data:', error);
    return res.status(500).json({ error: 'Failed to retrieve news data' });
  }
}
