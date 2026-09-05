/**
 * Moteur de Génération de Mémoire Juridique & Observations Disciplinaires
 * Application de la méthodologie du syllogisme judiciaire (Amaury Fouret)
 * et du contrôle de proportionnalité du juge administratif (CGFP & CE Dahan).
 * Ville de Gennevilliers & Collectivités Territoriales
 */

export interface MemoireInputData {
  collectivite: string;
  instanceDestinataire: 'conseil_discipline' | 'entretien_prealable' | 'recours_gracieux' | 'tribunal_administratif';
  nomAgent: string;
  prenomAgent: string;
  matricule?: string;
  statut: 'Titulaire' | 'Stagiaire' | 'Contractuel';
  cadreEmploi: string;
  grade: string;
  direction: string;
  service: string;
  anciennete: string;
  dateFaits: string;
  dateRapport?: string;
  auteurRapport?: string;
  faitsReproches: string;
  sanctionEnvisagee: string;
  elementsDefense: {
    contesteMaterialite: boolean;
    absenceIntentionFautive: boolean;
    contexteDifficileOuSurcharge: boolean;
    absenceFormationOuOrdreImprecis: boolean;
    maniereDeServirIrreprochable: boolean;
    provocationOuTensionPartagee: boolean;
    etatDeSanteOuFacteurMedical: boolean;
    prejudiceReelNulOuMinime: boolean;
  };
  detailsDefense: string;
  piecesJointesDefense: string[];
  texteRapportUpload?: string;
}

export interface SyllogismeSection {
  titre: string;
  majeure: string;
  mineure: string;
  conclusion: string;
  jurisprudences: string[];
}

export interface GeneratedMemoireResult {
  titreOfficiel: string;
  dateGeneration: string;
  enTete: {
    instance: string;
    collectivite: string;
    agent: string;
    qualite: string;
    dossierRef: string;
  };
  exposelLitige: {
    rappelProcedure: string;
    griefsArticules: string[];
    contexteProfessionnel: string;
  };
  moyensLégalitéExterne: {
    titre: string;
    points: { intitule: string; developpement: string; viseeCGFP: string }[];
  };
  moyensLégalitéInterne: SyllogismeSection[];
  evaluationManiereDeServir: string;
  conclusionsFormelles: {
    principal: string;
    subsidiaire: string;
    tresSubsidiaire: string;
  };
  bordereauPieces: string[];
  texteCompletFormate: string;
}

/**
 * Analyse heuristique d'un document disciplinaire uploadé pour pré-remplir les champs
 */
export function parseUploadedDisciplinaryReport(rawText: string): Partial<MemoireInputData> {
  const result: Partial<MemoireInputData> = {};
  if (!rawText || rawText.trim().length === 0) return result;

  const text = rawText;

  // 1. Détection du nom et prénom de l'agent
  const agentMatch = text.match(/(?:Monsieur|Madame|M\.|Mme)\s+([A-ZÉÈÊËÀÂÎÏÔÛÇ-]+)\s+([A-Za-zÉÈÊËÀÂÎÏÔÛÇ-]+)/i);
  if (agentMatch) {
    result.nomAgent = agentMatch[1].trim();
    result.prenomAgent = agentMatch[2].trim();
  }

  // 2. Détection du statut / grade
  if (text.match(/contractuel/i)) result.statut = 'Contractuel';
  else if (text.match(/stagiaire/i)) result.statut = 'Stagiaire';
  else if (text.match(/titulaire|fonctionnaire/i)) result.statut = 'Titulaire';

  const gradeMatch = text.match(/grade\s*:\s*([^\n\r,.]+)/i) || 
                     text.match(/(?:en qualité d[e']|au grade d[e'])\s*([A-Za-zÀ-ÿ\s-]+?)(?:\s*(?:depuis|au sein|à la|,|\.))/i);
  if (gradeMatch) {
    result.grade = gradeMatch[1].trim();
  }

  // 3. Détection de la collectivité
  const colMatch = text.match(/(?:Mairie|Ville|Commune|Département|Région|Communauté d'agglomération|CDG|CIG)\s+(?:de\s+|d[e']\s*)?([A-Za-zÀ-ÿ\s-]+?)(?:\s*[\n\r,.]|\s+le\s+)/i);
  if (colMatch) {
    result.collectivite = colMatch[0].trim();
  }

  // 4. Détection de la sanction envisagée
  if (text.match(/révocation/i)) result.sanctionEnvisagee = "Révocation (4ème groupe)";
  else if (text.match(/mise à la retraite d'office/i)) result.sanctionEnvisagee = "Mise à la retraite d'office (4ème groupe)";
  else if (text.match(/rétrogradation/i)) result.sanctionEnvisagee = "Rétrogradation (3ème groupe)";
  else if (text.match(/exclusion temporaire de fonctions?\s*(?:de\s*)?([0-9]+)\s*jours?/i)) {
    const jours = text.match(/exclusion temporaire de fonctions?\s*(?:de\s*)?([0-9]+)\s*jours?/i)?.[1] || "15";
    result.sanctionEnvisagee = `Exclusion temporaire de fonctions (${jours} jours)`;
  }
  else if (text.match(/blâme/i)) result.sanctionEnvisagee = "Blâme (1er groupe)";
  else if (text.match(/avertissement/i)) result.sanctionEnvisagee = "Avertissement (1er groupe)";

  // 5. Extraction des griefs principaux
  const griefsExtracted: string[] = [];
  if (text.match(/manquement\s+au\s+devoir\s+d['’]obéissance|refus\s+d['’]obtempérer|insubordination/i)) {
    griefsExtracted.push("Manquement allégué au devoir d'obéissance hiérarchique (Art. L. 121-10 CGFP)");
  }
  if (text.match(/manquement\s+au\s+devoir\s+de\s+réserve|propos\s+inappropriés|injure|dénigrement/i)) {
    griefsExtracted.push("Manquement allégué à l'obligation de réserve et de dignité (Art. L. 121-2 CGFP)");
  }
  if (text.match(/retards?\s+répétés?|absences?\s+injustifiées?|abandon\s+de\s+poste|défaut\s+d['’]assiduité/i)) {
    griefsExtracted.push("Défaut d'assiduité ou absences injustifiées alléguées (Art. L. 121-3 CGFP)");
  }
  if (text.match(/conflit\s+d['’]intérêts?|manquement\s+à\s+la\s+probité|cumul\s+d['’]activité/i)) {
    griefsExtracted.push("Manquement allégué à l'obligation de probité et d'impartialité (Art. L. 121-4 CGFP)");
  }
  if (text.match(/harcèlement|altération\s+des\s+relations\s+de\s+travail/i)) {
    griefsExtracted.push("Comportement relationnel inadapté ou reproches de harcèlement");
  }

  if (griefsExtracted.length > 0) {
    result.faitsReproches = griefsExtracted.join("\n- ");
  }

  result.texteRapportUpload = rawText;
  return result;
}

/**
 * Génère le mémoire juridique complet selon la méthodologie du syllogisme et CGFP
 */
export function generateMemoireJuridique(data: MemoireInputData): GeneratedMemoireResult {
  const nomComplet = `${data.prenomAgent || ''} ${data.nomAgent || 'AGENT'}`.trim();
  const dateDoc = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const collectiviteTxt = data.collectivite || "la Ville de Gennevilliers";
  const instanceLabel = {
    conseil_discipline: "Monsieur le Président et Mesdames, Messieurs les Membres du Conseil de Discipline compétent",
    entretien_prealable: "Monsieur le Maire / Président de la Collectivité",
    recours_gracieux: "Monsieur le Maire / Président (Recours Gracieux)",
    tribunal_administratif: "Monsieur le Président et Mesdames, Messieurs les Magistrats du Tribunal Administratif de Cergy-Pontoise"
  }[data.instanceDestinataire] || "Monsieur le Président du Conseil de Discipline";

  // 1. Construction des moyens de légalité externe
  const moyensLégalitéExterne = {
    titre: "I. SUR LA LÉGALITÉ EXTERNE ET LE STRICT RESPECT DES DROITS DE LA DÉFENSE",
    points: [
      {
        intitule: "1. Sur la communication intégrale et préalable du dossier individuel (Art. L. 532-4 CGFP)",
        developpement: `Aux termes de l'article L. 532-4 du Code général de la fonction publique, le fonctionnaire à l'encontre duquel une procédure disciplinaire est engagée a droit à la communication intégrale de son dossier individuel et de tous les documents annexes. L'agent entend rappeler que l'exercice effectif des droits de la défense implique la communication de l'ensemble des pièces d'accusation, sans dissimulation, assorti d'un délai utile pour préparer sa défense et mandater son défenseur.`,
        viseeCGFP: "Art. L. 532-4 CGFP et Décret n° 89-677 du 18 septembre 1989"
      },
      {
        intitule: "2. Sur le droit fondamental à l'assistance par un défenseur ou conseil de son choix",
        developpement: `Conformément aux principes généraux du droit disciplinaire public et à l'article L. 532-4 du CGFP, l'agent est fondé à être représenté et assisté par un représentant syndical ou par un avocat lors de toute audition préalable ou séance disciplinaire.`,
        viseeCGFP: "Art. L. 532-4 alinéa 2 CGFP"
      }
    ]
  };

  // 2. Construction des moyens de légalité interne (Syllogismes)
  const moyensLégalitéInterne: SyllogismeSection[] = [];

  // Syllogisme 1 : Matérialité des faits et charge de la preuve
  moyensLégalitéInterne.push({
    titre: "1. Sur l'inexactitude matérielle ou l'absence de preuve probante des faits reprochés",
    majeure: `En vertu des règles fondamentales gouvernant la répression disciplinaire dans la fonction publique, la charge de la preuve des manquements incombe exclusivement à l'autorité territoriale investie du pouvoir de sanction. Une sanction ne peut légalement reposer sur des suppositions, des rumeurs ou de simples témoignages vagues et non circonstanciés (CE, 27 mai 2015, n° 382218).`,
    mineure: data.elementsDefense.contesteMaterialite 
      ? `En l'espèce, les griefs articulés à l'encontre de M./Mme ${nomComplet} (${data.faitsReproches.replace(/\n/g, ' ')}) ne reposent sur aucun élément probant irréfutable. L'agent conteste formellement la matérialité des allégations formulées. ${data.detailsDefense ? `Il est expressément précisé que : ${data.detailsDefense}` : ''}`
      : `En l'espèce, si certains faits matériels sont évoqués, ils doivent être rigoureusement replacés dans leur contexte exact et leur portée réelle, dénuée de toute intention fautive ou de manquement délibéré aux obligations statutaires.`,
    conclusion: `Par voie de conséquence, en l'absence de matérialité fautive établie avec certitude, aucune sanction disciplinaire ne saurait légalement être prononcée de ce chef.`,
    jurisprudences: [
      "CE, 27 mai 2015, n° 382218 (Charge de la preuve et exactitude matérielle)",
      "TA Cergy-Pontoise, 14 mars 2024, n° 2208191 (Annulation pour défaut de preuve matérielle)"
    ]
  });

  // Syllogisme 2 : Circonstances atténuantes & contexte d'exercice
  if (data.elementsDefense.contexteDifficileOuSurcharge || data.elementsDefense.absenceFormationOuOrdreImprecis || data.elementsDefense.provocationOuTensionPartagee || data.elementsDefense.etatDeSanteOuFacteurMedical) {
    const circonstanceDetails: string[] = [];
    if (data.elementsDefense.contexteDifficileOuSurcharge) circonstanceDetails.push("une situation avérée de sous-effectif et de forte surcharge opérationnelle au sein du service");
    if (data.elementsDefense.absenceFormationOuOrdreImprecis) circonstanceDetails.push("une absence de consignes écrites claires et de formation préalable requise");
    if (data.elementsDefense.provocationOuTensionPartagee) circonstanceDetails.push("un climat de tension partagée et d'échanges vifs réciproques");
    if (data.elementsDefense.etatDeSanteOuFacteurMedical) circonstanceDetails.push("un état de santé dégradé médicalement constaté ayant altéré ponctuellement la capacité de discernement");

    moyensLégalitéInterne.push({
      titre: "2. Sur la prise en compte déterminante des circonstances atténuantes et du contexte de service",
      majeure: `Le juge administratif et les instances disciplinaires apprécient la qualification de faute disciplinaire au regard de l'ensemble des circonstances environnantes, notamment l'existence d'une provocation, la défaillance des consignes hiérarchiques ou les difficultés organisationnelles du service (CE, 12 octobre 2018, n° 411894).`,
      mineure: `En l'espèce, les faits imputés à l'agent s'inscrivent dans un contexte très particulier caractérisé par ${circonstanceDetails.join(', ')}. Ces éléments excluent tout comportement délibérément insubordonné et atténuent substantiellement la responsabilité imputée.`,
      conclusion: `Ces circonstances objectives font obstacle à la qualification de faute disciplinaire grave et commandent le rejet de toute mesure disproportionnée.`,
      jurisprudences: [
        "CE, 12 octobre 2018, n° 411894 (Impact du contexte de service sur la qualification de faute)",
        "CAA Versailles, 18 mai 2021, n° 19VE02410 (Atténuation de la sanction pour défaillance d'encadrement)"
      ]
    });
  }

  // Syllogisme 3 : Contrôle de Proportionnalité (CE Dahan) & Évaluation de la carrière
  moyensLégalitéInterne.push({
    titre: "3. Sur la disproportion manifeste de la sanction envisagée au regard de la carrière exemplaire de l'agent",
    majeure: `Depuis la décision d'Assemblée du Conseil d'État *Dahan* (CE Ass., 13 novembre 2013, n° 347704), le juge administratif exerce un **contrôle normal et entier de proportionnalité** sur le choix de la sanction disciplinaire au regard de la gravité des fautes commises, en tenant compte de la manière de servir, de l'ancienneté, des évaluations professionnelles et de l'absence totale d'antécédents disciplinaires.`,
    mineure: `M./Mme ${nomComplet} justifie d'une ancienneté de ${data.anciennete || 'plusieurs années'} au service de ${collectiviteTxt} en qualité de ${data.grade || data.cadreEmploi || 'fonctionnaire territorial'}. Son dossier individuel atteste d'une manière de servir exemplaire, d'évaluations annuelles élogieuses et de l'absence de toute sanction disciplinaire antérieure. La sanction envisagée (${data.sanctionEnvisagee || 'sanction disciplinaire sévère'}) apparaît manifestement excessive et hors de proportion avec la réalité des faits.`,
    conclusion: `Au regard du principe de proportionnalité des peines disciplinaires, la mesure sollicitée par l'autorité territoriale encourt une censure certaine devant la juridiction administrative.`,
    jurisprudences: [
      "CE Ass., 13 novembre 2013, n° 347704, Dahan (Contrôle normal de proportionnalité de la sanction)",
      "CE, 27 juin 2018, n° 406856 (Sanction disproportionnée au regard de l'état de service antérieur)",
      "TA Cergy-Pontoise, 21 septembre 2023, n° 2115409 (Annulation d'une révocation pour disproportion manifeste)"
    ]
  });

  // 3. Évaluation de la manière de servir
  const evaluationManiereDeServir = `L'examen rétrospectif de la carrière de M./Mme ${nomComplet} met en évidence son dévouement constant aux missions de service public territorial. Les comptes-rendus d'entretiens professionnels successifs soulignent sa conscience professionnelle, son sens du service et la qualité de ses relations avec les usagers et ses pairs. Cet engagement continu ne saurait être anéanti par un incident isolé ou mal contextualisé.`;

  // 4. Conclusions Formelles
  const conclusionsFormelles = {
    principal: `À TITRE PRINCIPAL : Constater l'absence de matérialité fautive ou de manquement délibéré caractérisé, et en conséquence, **émettre un avis défavorable à toute sanction disciplinaire** et proposer le **classement sans suite pur et simple** de la procédure engagée.`,
    subsidiaire: `À TITRE SUBSIDIAIRE : Si une irrégularité mineure devait être retenue, constater l'existence de circonstances atténuantes majeures et l'état de service irréprochable de l'agent, et **limiter la mesure à un rappel à l'ordre non inscrit ou à une sanction du 1er groupe au plus (Avertissement ou Blâme)**.`,
    tresSubsidiaire: `À TITRE TRÈS SUBSIDIAIRE : Exclure formellement toute sanction entraînant une privation de rémunération ou une rupture de carrière (${data.sanctionEnvisagee || 'sanction de groupe supérieur'}), eu égard au risque contentieux certain d'annulation pour disproportion manifeste (*CE Dahan*).`
  };

  // 5. Bordereau des pièces
  const bordereauPieces = [
    "Pièce n° 1 : État signalétique et des services / Fiche de carrière de l'agent",
    "Pièce n° 2 : Comptes-rendus des entretiens professionnels des 3 dernières années",
    "Pièce n° 3 : Attestations de collègues et témoignages sur la manière de servir",
    "Pièce n° 4 : Éléments médicaux ou justificatifs de contexte (le cas échéant)",
    ...(data.piecesJointesDefense.length > 0 ? data.piecesJointesDefense.map((p, i) => `Pièce n° ${5 + i} : ${p}`) : [])
  ];

  // 6. Formatage texte complet
  const texteCompletFormate = `
================================================================================
                    MÉMOIRE JURIDIQUE EN DÉFENSE
                 & OBSERVATIONS DISCIPLINAIRES
================================================================================

DESTINATAIRE : ${instanceLabel}

POUR : 
M./Mme ${nomComplet}
Statut : ${data.statut} | Grade : ${data.grade || data.cadreEmploi || 'Non précisé'}
Direction : ${data.direction || 'Direction'} | Service : ${data.service || 'Service'}
Collectivité : ${collectiviteTxt}
Ancienneté : ${data.anciennete || 'Non précisée'}

CONTRE :
Le rapport disciplinaire en date du ${data.dateRapport || dateDoc} proposant à l'encontre de l'agent :
« ${data.sanctionEnvisagee || 'Une sanction disciplinaire'} »

--------------------------------------------------------------------------------
                         EXPOSÉ DES FAITS ET DE LA PROCÉDURE
--------------------------------------------------------------------------------

Il est reproché à M./Mme ${nomComplet} les faits suivants :
${data.faitsReproches || 'Faits visés dans le rapport de saisine.'}

Ces allégations font l'objet d'une contestation rigoureuse et doivent être replacées dans leur contexte opérationnel et humain exact.

--------------------------------------------------------------------------------
                              DISCUSSION JURIDIQUE
--------------------------------------------------------------------------------

${moyensLégalitéExterne.titre}
${moyensLégalitéExterne.points.map(p => `\n${p.intitule}\n${p.developpement}\n(Base : ${p.viseeCGFP})\n`).join('')}

II. SUR LA LÉGALITÉ INTERNE, L'ABSENCE DE FAUTE ET LA DISPROPORTION

${moyensLégalitéInterne.map((s) => `
${s.titre}

A. RÈGLE DE DROIT APPLICABLE (MAJEURE)
${s.majeure}

B. APPLICATION STRICTE À L'ESPÈCE (MINEURE)
${s.mineure}

C. CONCLUSION JURIDIQUE
${s.conclusion}

Jurisprudences de référence :
${s.jurisprudences.map(j => `  • ${j}`).join('\n')}
`).join('\n--------------------------------------------------------------------------------\n')}

III. SUR LA MANIÈRE DE SERVIR ET LE DOSSIER PROFESSIONNEL
${evaluationManiereDeServir}

--------------------------------------------------------------------------------
                               PAR CES MOTIFS
--------------------------------------------------------------------------------

Il est respectueusement demandé à ${instanceLabel} de bien vouloir :

${conclusionsFormelles.principal}

${conclusionsFormelles.subsidiaire}

${conclusionsFormelles.tresSubsidiaire}

--------------------------------------------------------------------------------
                          BORDEREAU DES PIÈCES VERSÉES
--------------------------------------------------------------------------------
${bordereauPieces.map(p => `[x] ${p}`).join('\n')}

Fait pour valoir ce que de droit,
Le ${dateDoc}

Pour l'agent et sa défense,
M./Mme ${nomComplet}
`.trim();

  return {
    titreOfficiel: `Mémoire en défense disciplinaire — ${nomComplet}`,
    dateGeneration: dateDoc,
    enTete: {
      instance: instanceLabel,
      collectivite: collectiviteTxt,
      agent: nomComplet,
      qualite: `${data.statut} - ${data.grade || data.cadreEmploi || 'Agent territorial'}`,
      dossierRef: `DOSSIER-DISC-${new Date().getFullYear()}-${data.nomAgent ? data.nomAgent.toUpperCase() : '001'}`
    },
    exposelLitige: {
      rappelProcedure: `Procédure disciplinaire engagée par ${collectiviteTxt} à la suite du rapport du ${data.dateRapport || 'récent'}.`,
      griefsArticules: data.faitsReproches.split('\n').filter(l => l.trim().length > 0),
      contexteProfessionnel: `L'agent exerce ses fonctions au sein de la direction ${data.direction || ''} depuis ${data.anciennete || 'plusieurs années'}.`
    },
    moyensLégalitéExterne,
    moyensLégalitéInterne,
    evaluationManiereDeServir,
    conclusionsFormelles,
    bordereauPieces,
    texteCompletFormate
  };
}
