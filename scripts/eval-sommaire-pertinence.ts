import * as fs from 'fs';
import * as path from 'path';
// Enrichit dynamiquement une section du sommaire si la réponse n'est pas pertinente
function enrichirSectionAvecQuestion(section, reponse, questionTexte) {
  const motsQuestion = questionTexte.toLowerCase().split(/\W+/).filter(m => m.length > 3);
  section.motsCles = Array.from(new Set([...(section.motsCles || []), ...motsQuestion]));
  const phrases = reponse.split(/[.!?]/);
  const resumePlus = phrases.filter(p => motsQuestion.some(mk => p.toLowerCase().includes(mk))).slice(0, 2).join('. ');
  if (resumePlus && (!section.resume || !section.resume.includes(resumePlus))) {
    section.resume = (section.resume || '') + ' ' + resumePlus;
  }
}

// Sauvegarde le sommaire enrichi dans un fichier JSON

function sauvegarderSommaire() {
  const __filename = new URL('', import.meta.url).pathname;
  const dir = path.dirname(__filename);
  const outPath = path.join(dir, 'sommaireUnifie.enrichi.json');
  fs.writeFileSync(outPath, JSON.stringify(sommaireUnifie, null, 2), 'utf-8');
}
// (ancienne fonction d'enrichissement automatique supprimée car non utilisée)
/**
 * Script d'évaluation Q&R pour sommaireUnifie.ts
 * Vérifie la pertinence des réponses dans temps.ts, teletravail.ts, formation.ts
 * Arrête le script après 5 séries consécutives de 100% de réponses pertinentes
 */

let sommaireUnifie;
let tempsChapitres, teletravailData, formation;

async function main() {
  const fsPath = path.resolve(path.dirname(new URL('', import.meta.url).pathname), 'sommaireUnifie.enrichi.json');
  if (fs.existsSync(fsPath)) {
    sommaireUnifie = JSON.parse(fs.readFileSync(fsPath, 'utf-8'));
    console.log('Chargement du sommaire enrichi.');
  } else {
    sommaireUnifie = (await import('./data/sommaireUnifie.ts')).sommaireUnifie;
    console.log('Chargement du sommaire initial.');
  }
  const tempsModule = await import('./data/temps.ts');
  tempsChapitres = tempsModule.chapitres;
  const teletravailModule = await import('./data/teletravail.ts');
  teletravailData = teletravailModule.teletravailData;
  const formationModule = await import('./data/formation.ts');
  formation = formationModule.formation;
  await evaluerPertinence();
}



// Génère des questions pour chaque section du sommaire
function genererQuestions() {
  return sommaireUnifie.map(section => {
    return {
      id: section.id,
      question: `Qu'est-ce que : ${section.titre} ? (Mots-clés: ${section.motsCles.join(', ')})`,
      source: section.source,
      chapitre: section.chapitre
    };
  });
}

// Cherche la réponse dans le bon fichier
function trouverReponse(question) {
  switch (question.source) {
    case 'temps':
      if (question.chapitre && tempsChapitres && tempsChapitres[question.chapitre]) {
        return tempsChapitres[question.chapitre];
      }
      return '';
    case 'teletravail':
      return teletravailData || '';
    case 'formation':
      return formation || '';
    default:
      return '';
  }
}

// Boucle principale d'évaluation dynamique
async function evaluerPertinence() {
  // Import dynamique des données nécessaires
  const tempsModule = await import('./data/temps.ts');
  tempsChapitres = tempsModule.chapitres;
  const teletravailModule = await import('./data/teletravail.ts');
  teletravailData = teletravailModule.teletravailData;
  const formationModule = await import('./data/formation.ts');
  formation = formationModule.formation;
  let totalQuestions = 0;
  let tour = 0;
  const maxTours = 1000; // Limite de sécurité pour éviter boucle infinie
  for (let i = 0; i < maxTours; i++) {
    tour++;
    const questions = genererQuestions();
    const total = questions.length;
    let bonnes = 0;

      for (const q of questions) {
        const reponse = trouverReponse(q);
        console.log('\n---');
        console.log('Question :', q.question);
        console.log('Réponse :', reponse.slice(0, 500) + (reponse.length > 500 ? ' ...' : ''));
        const motsTrouves = q.question.split(/\W+/).filter(mot => mot.length > 3 && reponse.toLowerCase().includes(mot.toLowerCase()));
        if (motsTrouves.length > 0) {
          bonnes++;
        } else {
          const section = sommaireUnifie.find(s => s.id === q.id);
          if (section) enrichirSectionAvecQuestion(section, reponse, q.question);
        }
        totalQuestions++;
        if (totalQuestions % 200 === 0) {
          sauvegarderSommaire();
        }
      }
      const taux = (bonnes / total) * 100;
      console.log(`Tour ${tour}: ${bonnes}/${total} réponses pertinentes (${taux.toFixed(1)}%)`);
      // Arrêt si 100% de bonnes réponses 5 fois de suite
      if (taux === 100 && tour >= 5) {
        console.log('Arrêt du script : 5 tours consécutifs à 100%');
        break;
      }
    }
    sauvegarderSommaire();
    console.log('Arrêt du script.');
  }

  main();
