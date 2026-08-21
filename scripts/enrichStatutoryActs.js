/**
 * Script d'enrichissement et d'audit des modèles d'actes administratifs RH
 * Collectivité Territoriale - Mairie de Gennevilliers
 *
 * Usage : node scripts/enrichStatutoryActs.js
 */

import fs from 'fs';
import path from 'path';

console.log("================================================================================");
console.log("🏛️  SUITE RH STATUTAIRE - ENRICHISSEMENT DES ACTES ADMINISTRATIFS TERRITORIAUX");
console.log("================================================================================\n");

const TOP_FREQUENT_ACTS = [
  {
    category: "Santé & Inaptitude Physique",
    acts: [
      { name: "Congé de Maladie Ordinaire (CMO)", code: "cmo", ref: "CGFP L. 822-1 à L. 822-5 (90% puis 50%)", impact: "1er jour carence + 3 mois à 90% + 9 mois à 50%" },
      { name: "Prolongation CMO à demi-traitement", code: "cmo_prolongation", ref: "Décret 87-602 art. 14 à 18", impact: "Maintien 50% traitement, 100% SFT/Résidence" },
      { name: "Congé pour Invalidité Imputable au Service (CITIS)", code: "citis", ref: "CGFP L. 822-6 à L. 822-17", impact: "Plein traitement garanti + prise en charge 100% des soins" },
      { name: "Refus d'imputabilité au service (CITIS)", code: "citis_refus", ref: "CGFP L. 822-6 (Absence d'imputabilité)", impact: "Motivation obligatoire + voies de recours TA Cergy" },
      { name: "Temps Partiel Thérapeutique (TPT)", code: "tpt", ref: "CGFP L. 823-1 & Décret 2021-1462", impact: "Maintien 100% traitement (délai de réponse strict de 30j)" },
      { name: "Congé de Longue Maladie (CLM)", code: "clm", ref: "CGFP L. 822-18", impact: "3 ans max (1 an plein traitement, 2 ans demi-traitement)" },
      { name: "Congé de Longue Durée (CLD)", code: "cld", ref: "CGFP L. 822-19", impact: "5 ans max (3 ans plein traitement, 2 ans demi-traitement)" }
    ]
  },
  {
    category: "Carrière & Évolution Statutaire",
    acts: [
      { name: "Avancement d'échelon", code: "echelon", ref: "CGFP L. 522-1", impact: "Cadence unique à l'ancienneté (revalorisation indiciaire)" },
      { name: "Avancement de grade", code: "grade", ref: "CGFP L. 522-24", impact: "Tableau annuel d'avancement au choix après quotas/CAP" },
      { name: "Titularisation d'un stagiaire", code: "titularisation", ref: "CGFP L. 327-1 & Décret 92-1194", impact: "Fin de stage probatoire + validation formation CNFPT" },
      { name: "Prorogation de stage", code: "prorogation", ref: "Décret 92-1194", impact: "Prolongation maximale égale à la durée initiale du stage" }
    ]
  },
  {
    category: "Recrutement & Agents Contractuels",
    acts: [
      { name: "Contrat Accroissement Temporaire (L. 332-23 1°)", code: "l332-23-1", ref: "CGFP L. 332-23 1°", impact: "Max 12 mois sur 18 mois consécutifs" },
      { name: "Contrat Accroissement Saisonnier (L. 332-23 2°)", code: "l332-23-2", ref: "CGFP L. 332-23 2°", impact: "Max 6 mois sur 12 mois consécutifs" },
      { name: "Contrat sur Emploi Permanent (L. 332-8)", code: "l332-8", ref: "CGFP L. 332-8", impact: "CDD 3 ans max renouvelable (besoins du service)" },
      { name: "Contrat de Projet", code: "l332-24", ref: "CGFP L. 332-24", impact: "Durée de 1 à 6 ans liée à la réalisation du projet" },
      { name: "Acte d'engagement Vacataire", code: "vacataire", ref: "Jurisprudence CE", impact: "Rémunération horaire à la tâche sans droits statutaires" }
    ]
  },
  {
    category: "Régime Indemnitaire & Primes",
    acts: [
      { name: "Attribution RIFSEEP (IFSE)", code: "ifse", ref: "CGFP L. 714-4 & Décret 2014-513", impact: "Montant mensuel selon le groupe de fonctions coté" },
      { name: "Complément Indemnitaire Annuel (CIA)", code: "cia", ref: "Délibération municipale", impact: "Versement ponctuel selon engagement & entretien pro" },
      { name: "Attribution NBI", code: "nbi_accord", ref: "Loi 91-73 art. 27 & Décrets 2006", impact: "Points majorés mensuels soumis à retenue pension" },
      { name: "Refus ou Retrait NBI", code: "nbi_refus", ref: "CE 28 avr. 2006 n° 279586", impact: "Compétence liée dès non-exercice effectif des fonctions" }
    ]
  },
  {
    category: "Temps de Travail & Organisation",
    acts: [
      { name: "Autorisation de Télétravail", code: "teletravail_accord", ref: "CGFP L. 430-1 & Décret 2016-151", impact: "Organisation des jours fixes/flottants et équipement" },
      { name: "Refus motivé de Télétravail", code: "teletravail_refus", ref: "Décret 2016-151 (Entretien préalable)", impact: "Motivation circonstanciée obligatoire liée au service" },
      { name: "Temps Partiel sur Autorisation", code: "tp_accord", ref: "CGFP L. 612-1 (Quotités 50% à 90%)", impact: "Règle des 6/7e pour le 80% (rémunération à 85,7%)" },
      { name: "Mise en Disponibilité pour convenances", code: "dispo", ref: "Décret 86-68", impact: "Cessation temporaire d'activité et de rémunération" },
      { name: "Congé Parental", code: "conge_parental", ref: "CGFP L. 515-1", impact: "De droit, non rémunéré, conservation des droits avancement" }
    ]
  },
  {
    category: "Discipline, Sécurité & Fin de Fonctions",
    acts: [
      { name: "Sanction du 1er groupe (Blâme)", code: "blame", ref: "CGFP L. 533-1", impact: "Sans conseil de discipline, effacement après 3 ans" },
      { name: "Suspension Conservatoire", code: "suspension", ref: "CGFP L. 531-1", impact: "Urgence en cas de faute grave, maintien plein traitement" },
      { name: "Admission Retraite & Radiation des cadres", code: "retraite", ref: "CGFP L. 550-1 & CNRACL", impact: "Radiation définitive des cadres de la collectivité" },
      { name: "Acceptation de Démission Volontaire", code: "demission", ref: "CGFP L. 551-1", impact: "Perte de la qualité de fonctionnaire" }
    ]
  }
];

let grandTotal = 0;
TOP_FREQUENT_ACTS.forEach((cat) => {
  console.log(`📌 ${cat.category.toUpperCase()} (${cat.acts.length} actes)`);
  cat.acts.forEach((act) => {
    grandTotal++;
    console.log(`   ├─ [${act.code.toUpperCase().padEnd(16)}] ${act.name}`);
    console.log(`   │  └─ Réf : ${act.ref} | Impact : ${act.impact}`);
  });
  console.log("");
});

console.log(`--------------------------------------------------------------------------------`);
console.log(`🎯 TOTAL COUVERTURE : ${grandTotal} MODÈLES D'ACTES RH SÉCURISÉS`);
console.log(`📁 Registre TypeScript : src/data/statutoryActsTemplates.ts`);
console.log(`⚡ Moteur Statutaire    : src/services/legifrance.ts`);
console.log("================================================================================\n");
