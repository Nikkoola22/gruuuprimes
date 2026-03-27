// Script Node.js pour supprimer les doublons dans ifse2_primes.json (nettoyage avancé)
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/data/ifse2_primes.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

function normalize(str) {
  return (str || "")
    .toString()
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

const seen = new Set();
const filtered = [];

data.forEach(obj => {
  const key = [
    normalize(obj.Motif),
    normalize(obj.Metiers_concernes),
    normalize(obj.Direction),
    normalize(obj.Service)
  ].join('||');
  if (!seen.has(key)) {
    seen.add(key);
    filtered.push(obj);
  }
});

fs.writeFileSync(file, JSON.stringify(filtered, null, 2), 'utf8');
console.log('Doublons supprimés (nettoyage avancé). Entrées finales :', filtered.length);