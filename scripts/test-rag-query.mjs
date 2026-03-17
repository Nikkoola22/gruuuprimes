import { promises as fs } from 'node:fs';

const query = process.argv.slice(2).join(' ').trim();
if (!query) {
  console.error('Usage: node scripts/test-rag-query.mjs <query>');
  process.exit(1);
}

const indexPath = './public/bip/output/bip-rag-index.json';
const raw = await fs.readFile(indexPath, 'utf8');
const data = JSON.parse(raw);

const tokens = query
  .toLowerCase()
  .split(/\s+/)
  .map((token) => token.trim())
  .filter((token) => token.length > 2);

const scored = data
  .map((entry) => {
    const text = (entry.content || '').toLowerCase();
    let score = 0;

    for (const token of tokens) {
      if (text.includes(token)) {
        score += 2;
      }
      const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const count = (text.match(new RegExp(escaped, 'g')) || []).length;
      score += Math.min(count, 5);
    }

    if (text.includes('échelle des sanctions')) {
      score += 8;
    }
    if (text.includes('sanctions suivantes')) {
      score += 4;
    }

    return { ...entry, score };
  })
  .filter((entry) => entry.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 5);

for (const [index, hit] of scored.entries()) {
  console.log(`#${index + 1} score=${hit.score} source=${hit.sourceName} chunk=${hit.chunkId}`);
  console.log(hit.content.slice(0, 900).replace(/\n/g, ' '));
  console.log('---');
}
