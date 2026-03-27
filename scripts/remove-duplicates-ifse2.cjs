// Script Node.js pour supprimer les doublons dans ifse2_primes.json
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/data/ifse2_primes.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const seen = new Set();
const filtered = [];

data.forEach(obj => {
  const key = [obj.Motif, obj.Metiers_concernes, obj.Direction, obj.Service].join('||');
  if (!seen.has(key)) {
    seen.add(key);
    filtered.push(obj);
  }
});

fs.writeFileSync(file, JSON.stringify(filtered, null, 2), 'utf8');
console.log('Doublons supprimés. Entrées finales :', filtered.length);