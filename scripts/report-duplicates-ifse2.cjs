// Script Node.js pour générer un rapport des doublons supprimés dans ifse2_primes.json
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/data/ifse2_primes.json');
const backup = path.join(__dirname, '../src/data/ifse2_primes.backup.json');
const report = path.join(__dirname, '../src/data/ifse2_primes.duplicates-report.json');

// Charger la version backup (avant suppression)
if (!fs.existsSync(backup)) {
  console.error('Aucune sauvegarde trouvée. Impossible de générer le rapport.');
  process.exit(1);
}
const original = JSON.parse(fs.readFileSync(backup, 'utf8'));
const cleaned = JSON.parse(fs.readFileSync(file, 'utf8'));

const seen = new Set();
const keptKeys = new Set(cleaned.map(obj => [obj.Motif, obj.Metiers_concernes, obj.Direction, obj.Service].join('||')));
const duplicates = [];

original.forEach(obj => {
  const key = [obj.Motif, obj.Metiers_concernes, obj.Direction, obj.Service].join('||');
  if (seen.has(key) && keptKeys.has(key)) {
    duplicates.push(obj);
  }
  seen.add(key);
});

fs.writeFileSync(report, JSON.stringify(duplicates, null, 2), 'utf8');
console.log('Rapport des doublons généré:', report, 'Total:', duplicates.length);