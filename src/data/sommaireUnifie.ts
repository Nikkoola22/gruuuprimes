import { bipIndex } from './bip-index.ts';

export interface SectionIndex {
  id: string;
  titre: string;
  motsCles: string[];
  source: 'temps' | 'formation' | 'teletravail' | 'rifseep' | 'bip';
  chapitre?: number;
  article?: number;
  resume?: string;
  // Champs optionnels pour les fiches BIP
  code?: string;
  localPath?: string;
  content?: string;
  type?: string;
}

export const sommaireUnifie: SectionIndex[] = [
  // (Suppression des objets orphelins, doublons, et correction de la structure du tableau)

  // ============================================
  // RIFSEEP / PRIMES
  // ============================================
  {
    id: 'rifseep_ifse_cia',
    titre: 'RIFSEEP, IFSE et CIA',
    motsCles: ['RIFSEEP', 'IFSE', 'IFSE 1', 'IFSE 2', 'CIA', 'complément indemnitaire annuel', 'indemnité de fonctions', 'sujétions', 'expertise', 'engagement professionnel', 'prime', 'primes', 'régime indemnitaire'],
    source: 'rifseep',
    resume: 'Régime indemnitaire des agents : IFSE 1 selon les fonctions, IFSE 2 selon direction/service/métier, CIA comme part variable annuelle liée à l engagement professionnel.'
  },
  // CHAPITRE 4 : ABSENCES POUR MALADIES ET ACCIDENTS
  {
    id: 'temps_ch4_art1',
    chapitre: 4,
    article: 1,
    titre: 'La maladie',
    motsCles: ['maladie', 'congé maladie', 'arrêt maladie', 'absence', 'carence', 'contrôle médical', 'expertise', 'absence injustifiée'],
    source: 'temps',
    resume: 'Règles de gestion des absences pour maladie, démarches, carence, contrôle médical, expertise, absences injustifiées.'
  },
  {
    id: 'temps_ch4_art2',
    chapitre: 4,
    article: 2,
    titre: 'Accidents de service et de trajet',
    motsCles: ['accident de service', 'accident de trajet', 'déclaration', 'certificat médical', 'prise en charge', 'remboursement'],
    source: 'temps',
    resume: 'Définition, déclaration, prise en charge des accidents de service et de trajet.'
  },
  {
    id: 'temps_ch4_art3',
    chapitre: 4,
    article: 3,
    titre: 'Prise en charge de la rémunération',
    motsCles: ['rémunération', 'congé maladie', 'accident de service', 'accident de trajet', 'traitement', 'demi-traitement', 'CPAM'],
    source: 'temps',
    resume: 'Prise en charge de la rémunération selon le statut de l’agent en cas de maladie ou d’accident.'
  },
  // CHAPITRE 3 : AUTORISATIONS SPÉCIALES D'ABSENCES
  {
    id: 'temps_ch3_art1',
    chapitre: 3,
    article: 1,
    titre: 'Fêtes religieuses',
    motsCles: ['fêtes religieuses', 'autorisation absence', 'calendrier religieux', 'arménienne', 'bouddhiste', 'juive', 'musulmane', 'orthodoxe', 'jour férié'],
    source: 'temps',
    resume: 'Autorisation d’absence pour fêtes religieuses selon calendrier préfectoral, sous réserve des nécessités de service.'
  },
  {
    id: 'temps_ch3_art2',
    chapitre: 3,
    article: 2,
    titre: 'Garde d’enfant malade',
    motsCles: ['garde enfant', 'enfant malade', 'autorisation absence', 'crèche', 'école', 'grève', 'justificatif', 'jours', 'famille', 'quotité'],
    source: 'temps',
    resume: 'Absence pour soigner ou garder un enfant malade, modalités, durée, cas particuliers, justificatifs.'
  },
  {
    id: 'temps_ch3_art3',
    chapitre: 3,
    article: 3,
    titre: 'Prodiguer des soins ou assister un malade',
    motsCles: ['soins', 'malade', 'conjoint', 'enfant', 'ascendant', 'frère', 'sœur', 'oncle', 'tante', 'absence', 'certificat médical'],
    source: 'temps',
    resume: 'Absence pour prodiguer des soins à un proche malade, durée selon le lien familial, justificatifs.'
  },
  {
    id: 'temps_ch3_art4',
    chapitre: 3,
    article: 4,
    titre: 'Congé proche aidant',
    motsCles: ['congé proche aidant', 'dépendance', 'proche', 'pathologie', 'allocation', 'CAF', 'certificat médical', 'non rémunéré'],
    source: 'temps',
    resume: 'Congé non rémunéré pour accompagner un proche dépendant, modalités, durée, justificatifs.'
  },
  {
    id: 'temps_ch3_art5',
    chapitre: 3,
    article: 5,
    titre: 'Décès d’un membre de la famille',
    motsCles: ['décès', 'obsèques', 'conjoint', 'parents', 'enfant', 'frère', 'sœur', 'beaux-parents', 'petits-enfants', 'autorisation absence'],
    source: 'temps',
    resume: 'Absence pour décès d’un membre de la famille, durée selon le lien, conditions.'
  },
  {
    id: 'temps_ch3_art6',
    chapitre: 3,
    article: 6,
    titre: 'Mariage ou PACS',
    motsCles: ['mariage', 'PACS', 'famille', 'autorisation absence', 'acte de mariage', 'jours', 'célébration'],
    source: 'temps',
    resume: 'Absence pour mariage ou PACS de l’agent ou d’un membre de la famille, durée, conditions.'
  },
  {
    id: 'temps_ch3_art7',
    chapitre: 3,
    article: 7,
    titre: 'Absence liée à la maternité',
    motsCles: ['maternité', 'grossesse', 'séances préparatoires', 'examens prénataux', 'aménagement horaires', 'autorisation absence'],
    source: 'temps',
    resume: 'Absence pour examens prénataux, séances préparatoires, aménagement d’horaires pendant la grossesse.'
  },
  {
    id: 'temps_ch3_art8',
    chapitre: 3,
    article: 8,
    titre: 'Consultation médicale',
    motsCles: ['consultation médicale', 'absence', 'rendez-vous', 'justificatif', 'récupération', 'handicap', 'maladie grave', 'don du sang'],
    source: 'temps',
    resume: 'Absence pour consultation médicale, modalités, récupération, cas particuliers (handicap, don du sang).'
  },
  {
    id: 'temps_ch3_art9',
    chapitre: 3,
    article: 9,
    titre: 'Rentrée scolaire',
    motsCles: ['rentrée scolaire', 'enfant', 'école', 'facilités horaires', 'absence'],
    source: 'temps',
    resume: 'Facilités horaires pour accompagner ou aller chercher un enfant à l’école le jour de la rentrée.'
  },
  {
    id: 'temps_ch3_art10',
    chapitre: 3,
    article: 10,
    titre: 'Déménagement',
    motsCles: ['déménagement', 'autorisation absence', 'changement d’adresse', 'justificatif'],
    source: 'temps',
    resume: 'Absence autorisée pour déménagement, conditions et justificatifs.'
  },
  {
    id: 'temps_ch3_art11',
    chapitre: 3,
    article: 11,
    titre: 'Formation',
    motsCles: ['formation', 'journée de travail', 'récupération', 'demi-journée', 'concours', 'examen', 'jury', 'autorisation absence'],
    source: 'temps',
    resume: 'Journée de formation assimilée à une journée de travail, récupération, absences pour concours, jury, représentation.'
  },
  {
    id: 'temps_ch1_art5',
    chapitre: 1,
    article: 5,
    titre: 'Heures supplémentaires et complémentaires',
    motsCles: ['heures supplémentaires', 'heures sup', 'heures complémentaires', 'majoration', 'récupération', 'indemnisation', 'catégorie B', 'catégorie C', 'planning'],
    source: 'temps',
    resume: 'Définition, conditions, majorations, récupération ou indemnisation des heures supplémentaires et complémentaires.'
  },
  {
    id: 'temps_ch1_art6',
    chapitre: 1,
    article: 6,
    titre: 'Temps partiel de droit (naissance, enfant, parentalité)',
    motsCles: [
      'temps partiel', 'temps partiel naissance', 'temps partiel enfant', 'temps partiel parentalité', 'temps partiel droit naissance',
      'droit', 'autorisation', 'quotité', 'naissance', 'adoption', 'parentalité', 'enfant', 'garde enfant', 'soins enfant', 'handicap', 'retraite', 'rémunération', 'surcotisation', 'temps partiel automatique', 'temps partiel fonction publique', 'temps partiel agent', 'temps partiel congé', 'temps partiel demande', 'temps partiel employeur'
    ],
    source: 'temps',
    resume: 'Tout agent a droit à un temps partiel de droit à l’occasion de la naissance ou de l’adoption d’un enfant, ou pour donner des soins à un enfant, un proche ou en cas de handicap. Quotités possibles : 50%, 60%, 70%, 80%, 90%. Démarches simplifiées, droit automatique, incidences sur rémunération, congés, carrière, retraite.'
  },
  {
    id: 'temps_ch1_art7',
    chapitre: 1,
    article: 7,
    titre: 'Journée de solidarité',
    motsCles: ['journée de solidarité', '7 heures', 'jour férié', 'RTT', 'proratisation'],
    source: 'temps',
    resume: 'Modalités d’accomplissement de la journée de solidarité, 7h supplémentaires fractionnées, proratisation temps partiel.'
  },
  {
    id: 'temps_ch1_art8',
    chapitre: 1,
    article: 8,
    titre: 'Astreintes et permanences',
    motsCles: ['astreinte', 'permanence', 'intervention', 'filière technique', 'indemnité', 'repos compensateur', 'week-end', 'sécurité'],
    source: 'temps',
    resume: 'Définition, modalités, indemnisation ou compensation des astreintes et permanences.'
  },
  {
    id: 'temps_ch1_art9',
    chapitre: 1,
    article: 9,
    titre: 'Sujétions particulières (nuit, dimanche)',
    motsCles: ['sujétions', 'travail de nuit', 'dimanche', 'jours fériés', 'compensation', 'pénibilité'],
    source: 'temps',
    resume: 'Compensations pour travail de nuit et dimanches/fériés, barèmes selon volume.'
  },

  // CHAPITRE 2 : LES CONGÉS
  {
    id: 'temps_ch2_art1',
    chapitre: 2,
    article: 1,
    titre: 'Les congés annuels',
    motsCles: ['congés annuels', 'congé annuel', 'congés', 'vacances', '25 jours', 'CA', 'C.A', 'planning', 'estivaux', 'report', 'priorité', 'droit', 'combien', 'jours ouvrés', 'prorata', 'fractionnement', '31 jours', 'consécutifs', 'pose congé', 'demande congé', '1er mars', '15 mars', 'délai', 'refus', 'contractuel'],
    source: 'temps',
    resume: '25 jours ouvrés/an (5j x 5 sem). Prorata selon temps de travail. Modalités de demande, délais, priorités, reports, règles d’attribution.'
  },
  {
    id: 'temps_ch2_art2',
    chapitre: 2,
    article: 2,
    titre: 'Le congé bonifié (outre-mer)',
    motsCles: ['congé bonifié', 'outre-mer', 'DOM', 'Guadeloupe', 'Martinique', 'Réunion', 'Guyane', 'Mayotte', 'Saint Pierre', 'Miquelon', 'Saint Barthélémy', 'Saint Martin', '31 jours', '2 ans', 'métropole'],
    source: 'temps',
    resume: 'Pour fonctionnaires originaires DOM, tous les 2 ans, max 31 jours calendaires, conditions d’ouverture des droits.'
  },
  {
    id: 'temps_ch2_art3',
    chapitre: 2,
    article: 3,
    titre: 'Les jours d’ARTT',
    motsCles: ['RTT', 'ARTT', 'A.R.T.T', 'réduction temps travail', 'jours de repos', 'décompte', 'maladie', 'absence', 'quotient', 'temps partiel', 'proratisé', '37h', '37.5h', '38h', '39h', '15 septembre', 'CET'],
    source: 'temps',
    resume: 'Jours de réduction du temps de travail (ARTT), modalités d’acquisition, gestion, prise, proratisation, déduction en cas d’absence.'
  },
  {
    id: 'temps_ch2_art4',
    chapitre: 2,
    article: 4,
    titre: 'Don de jours de repos',
    motsCles: ['don jours', 'don de jours', 'enfant malade', 'enfant gravement malade', 'proche aidant', 'aidant familial', 'solidarité', 'anonyme', '5 jours', 'moins de 20 ans', 'handicap', 'accident', 'perte autonomie'],
    source: 'temps',
    resume: 'Don anonyme de RTT/CA (max 5j/an) pour collègue avec enfant malade <20 ans ou proche aidant.'
  },
  {
    id: 'temps_ch2_art5',
    chapitre: 2,
    article: 5,
    titre: 'Le compte épargne temps (CET)',
    motsCles: ['compte épargne temps', 'CET', 'jours épargnés', 'congés annuels', 'ARTT', 'indemnisation', 'retraite', 'ouverture', 'alimentation'],
    source: 'temps',
    resume: 'Définition, ouverture, alimentation, utilisation et conditions du compte épargne temps (CET).'
  },
  {
    id: 'temps_ch2_art6',
    chapitre: 2,
    article: 6,
    titre: 'Les congés liés aux naissances',
    motsCles: ['congé maternité', 'congé paternité', 'naissance', 'adoption', 'hospitalisation', 'enfant', 'congé supplémentaire', 'rémunération'],
    source: 'temps',
    resume: 'Congé maternité, paternité, accueil de l’enfant, hospitalisation, durées, modalités, rémunération.'
  },
  {
    id: 'temps_ch2_cet',
    titre: 'Compte Épargne Temps (CET)',
    motsCles: ['CET', 'compte épargne temps', 'épargne', 'capitalisation', 'jours non pris', '5 jours', '1 an', 'service', 'ouverture', 'alimentation', 'stagiaire', 'titularisation', 'indemnisation'],
    source: 'temps',
    chapitre: 2,
    article: 5,
    resume: 'Épargne max 5j CA + RTT/an, ouvert après 1 an de service. Pas pour stagiaires'
  },
  {
    id: 'temps_ch2_maternite',
    titre: 'Congé maternité',
    motsCles: ['maternité', 'congé maternité', 'grossesse', 'accouchement', 'prénatal', 'postnatal', '16 semaines', '26 semaines', '34 semaines', '46 semaines', 'jumeaux', 'triplés', 'couches pathologiques', '2 semaines', '4 semaines', 'déclaration', '4ème mois', 'plein traitement'],
    source: 'temps',
    chapitre: 2,
    article: 6,
    resume: 'Durée: 16 sem (1er/2e enfant), 26 sem (3e+), 34 sem (jumeaux), 46 sem (triplés). Plein traitement'
  },
  {
    id: 'temps_ch2_paternite',
    titre: 'Congé paternité',
    motsCles: ['paternité', 'congé paternité', 'naissance', 'père', 'accueil enfant', '25 jours', '32 jours', '4 jours', '21 jours', '28 jours', '6 mois', 'calendaires', 'hospitalisation', 'naissance multiple'],
    source: 'temps',
    chapitre: 2,
    article: 6,
    resume: '25 jours (32 si multiple): 4j obligatoires après naissance + 21j/28j dans les 6 mois'
  },

  // Chapitre 3 : Autorisations spéciales d'absence
  {
    id: 'temps_ch3_fetes_religieuses',
    titre: 'Fêtes religieuses',
    motsCles: ['fêtes religieuses', 'musulmane', 'juive', 'orthodoxe', 'bouddhiste', 'Aïd', 'Kippour'],
    source: 'temps',
    chapitre: 3,
    article: 1,
    resume: 'Autorisation prioritaire de poser un congé pour fêtes religieuses'
  },
  {
    id: 'temps_ch3_garde_enfant',
    titre: 'Garde d\'enfant malade',
    motsCles: ['garde enfant', 'enfant malade', 'nourrice', 'école fermée', '6 jours', '16 ans', 'grève'],
    source: 'temps',
    chapitre: 3,
    article: 2,
    resume: '6 jours/an (doublés si parent seul), jusqu\'aux 16 ans de l\'enfant'
  },
  {
    id: 'temps_ch3_soins_malade',
    titre: 'Soins ou assistance à un malade',
    motsCles: ['soins', 'malade', 'conjoint', 'ascendant', 'certificat médical', '5 jours', '3 jours'],
    source: 'temps',
    chapitre: 3,
    article: 3,
    resume: '5 jours pour conjoint/parents/enfant, 3 jours pour autres proches'
  },
  {
    id: 'temps_ch3_proche_aidant',
    titre: 'Congé proche aidant (fin de vie)',
    motsCles: ['proche aidant', 'fin de vie', 'AJPA', 'dépendance', 'handicap', 'non rémunéré'],
    source: 'temps',
    chapitre: 3,
    article: 4,
    resume: 'Congé non rémunéré max 3 mois renouvelable, AJPA possible via CAF'
  },
  {
    id: 'temps_ch3_deces',
    titre: 'Décès d\'un membre de la famille',
    motsCles: ['décès', 'obsèques', 'deuil', 'conjoint', 'parent', 'enfant', '5 jours', '14 jours'],
    source: 'temps',
    chapitre: 3,
    article: 5,
    resume: '5j conjoint/parents, 14j enfant <25 ans, 3j grands-parents/frères/soeurs'
  },
  {
    id: 'temps_ch3_mariage',
    titre: 'Mariage ou PACS',
    motsCles: ['mariage', 'PACS', 'union', 'cérémonie', '7 jours', '3 jours', '1 jour'],
    source: 'temps',
    chapitre: 3,
    article: 6,
    resume: '7 jours pour l\'agent, 3 jours pour enfant, 1 jour pour autres proches'
  },
  {
    id: 'temps_ch3_maternite_absence',
    titre: 'Absences liées à la maternité',
    motsCles: ['grossesse', 'examens prénataux', 'accouchement sans douleur', '1 heure par jour'],
    source: 'temps',
    chapitre: 3,
    article: 7,
    resume: 'Examens prénataux, 1h/jour dès le 3e mois, préparation accouchement'
  },
  {
    id: 'temps_ch3_consultation',
    titre: 'Consultation médicale',
    motsCles: ['consultation', 'rendez-vous médical', 'récupération', 'RQTH', '4 jours'],
    source: 'temps',
    chapitre: 3,
    article: 8,
    resume: 'Absence autorisée mais récupérable, sauf RQTH (4j/an)'
  },
  {
    id: 'temps_ch3_rentree',
    titre: 'Rentrée scolaire',
    motsCles: ['rentrée scolaire', 'école', 'maternelle', 'primaire', '6ème', '1 heure'],
    source: 'temps',
    chapitre: 3,
    article: 9,
    resume: 'Facilité d\'1h le jour de la rentrée (maternelle, primaire, entrée en 6e)'
  },
  {
    id: 'temps_ch3_demenagement',
    titre: 'Déménagement',
    motsCles: ['déménagement', 'changement adresse', 'domicile', '1 jour'],
    source: 'temps',
    chapitre: 3,
    article: 10,
    resume: '1 jour d\'autorisation la semaine précédant ou suivant le déménagement'
  },
  {
    id: 'temps_ch3_formation',
    titre: 'Formation et concours',
    motsCles: ['formation', 'concours', 'examen professionnel', 'jury', 'formateur', '1 jour', '2 jours'],
    source: 'temps',
    chapitre: 3,
    article: 11,
    resume: '1j avant admissibilité, 2j avant admission, 5j/an jury ou formateur externe'
  },

  // Chapitre 4 : Maladies et accidents
  {
    id: 'temps_ch4_maladie',
    titre: 'Congé maladie ordinaire et jour de carence',
    motsCles: ['maladie', 'arrêt', 'carence', 'jour de carence', 'règles', '48h', 'contrôle', 'contre-visite', 'CMO', 'maladie ordinaire', 'congé maladie ordinaire'],
    source: 'temps',
    chapitre: 4,
    resume: 'Règles du congé maladie ordinaire (CMO) : transmission sous 48h, 1 jour de carence, contre-visite possible'
  },
  {
    id: 'temps_ch4_accident',
    titre: 'Accident de service ou de trajet',
    motsCles: ['accident service', 'accident travail', 'accident trajet', 'déclaration', '15 jours', 'certificat'],
    source: 'temps',
    chapitre: 4,
    resume: 'Déclaration sous 48h (régime général) ou 15j (CNRACL), plein traitement'
  },
  {
    id: 'temps_ch4_remuneration',
    titre: 'Rémunération en congé maladie',
    motsCles: ['rémunération', 'paye', 'payer', 'paie', 'salaire', 'plein traitement', 'demi-traitement', 'CLM', 'CLD', 'grave maladie', 'CNRACL', 'IRCANTEC', 'longue maladie', 'congé longue maladie', 'durée', 'ans', 'maladie ordinaire', 'CMO', '3 mois', '9 mois'],
    source: 'temps',
    chapitre: 4,
    resume: 'En maladie ordinaire : 3 mois à 90% puis 9 mois à demi-traitement. CLM/CLD : 1 à 3 ans selon le cas.'
  },
  {
    id: 'temps_ch4_clm_details',
    titre: 'Congé de longue maladie (CLM) - Durée et rémunération',
    motsCles: ['congé longue maladie', 'CLM', 'durée CLM', '3 ans', 'maladie longue', 'affection grave', 'plein traitement', 'longue durée', 'indisponibilité'],
    source: 'temps',
    chapitre: 4,
    resume: 'CLM: jusqu\'à 3 ans consécutifs rémunérés à plein traitement pour affection grave requérant repos prolongé'
  },

  // ============================================
  // FORMATION (formation.ts)
  // ============================================
  {
    id: 'formation_obligatoire',
    titre: 'Formations obligatoires (intégration, professionnalisation)',
    motsCles: [
      'formation obligatoire', 'intégration', 'professionnalisation', 'CNFPT', 'titularisation', '5 jours', '10 jours',
      'formation initiale', 'formation continue', 'plan de formation', 'statut', 'carrière', 'catégorie A', 'catégorie B', 'catégorie C', 'diplôme', 'concours', 'examen professionnel', 'formation d\'intégration', 'formation de professionnalisation', 'formation tout au long de la carrière', 'formation réglementaire', 'formation qualifiante', 'formation certifiante', 'hygiène', 'sécurité', 'habilitation électrique', 'premiers secours', 'CACES'
    ],
    source: 'formation',
    resume: 'Quatre types de formations obligatoires : (1) Formation d\'intégration (10 jours cat A/B, 5 jours cat C) pour les nouveaux agents avant titularisation. (2) Formation de professionnalisation au 1er emploi (5-10 jours cat A/B, 3-10 jours cat C) dans les 2 ans suivant nomination. (3) Formation de professionnalisation tout au long de la carrière (2-10 jours) tous les 5 ans pour maintenir les compétences. (4) Formations hygiène et sécurité obligatoires selon le poste (CACES, habilitation électrique, premiers secours, SST). Gérées par CNFPT et DCRH. Prise en charge des frais par la collectivité.'
  },
  {
    id: 'formation_concours',
    titre: 'Préparation concours et examens',
    motsCles: ['concours', 'examen professionnel', 'préparation', 'avancement', 'promotion'],
    source: 'formation',
    resume: 'Préparation aux concours/examens FPT, 1j admissibilité + 2j admission'
  },
  {
    id: 'formation_cpf',
    titre: 'Compte Personnel de Formation (CPF)',
    motsCles: ['CPF', 'compte formation', 'heures', '25 heures', '150 heures', 'diplôme', 'certification'],
    source: 'formation',
    resume: '25h/an (plafond 150h), formations diplômantes ou certifiantes'
  },
  {
    id: 'formation_conge_pro',
    titre: 'Congé de formation professionnelle',
    motsCles: ['congé formation', '3 ans', '85%', 'traitement', 'projet professionnel'],
    source: 'formation',
    resume: 'Max 3 ans sur carrière (5 ans cat C), rémunéré 85% la 1ère année'
  },
  {
    id: 'formation_bilan',
    titre: 'Bilan de compétences',
    motsCles: ['bilan compétences', '24 heures', '72 heures', 'projet professionnel', 'reconversion'],
    source: 'formation',
    resume: '24h (72h si handicap/cat C), tous les 5 ans'
  },
  {
    id: 'formation_vae',
    titre: 'Validation des Acquis de l\'Expérience (VAE)',
    motsCles: ['VAE', 'validation acquis', 'expérience', 'diplôme', '24 heures'],
    source: 'formation',
    resume: '24h de congé (72h si handicap/cat C) pour obtenir un diplôme via expérience'
  },
  {
    id: 'formation_transition',
    titre: 'Congé de transition professionnelle',
    motsCles: ['transition professionnelle', 'reconversion', 'nouveau métier', '120 heures', '6000€'],
    source: 'formation',
    resume: 'Max 1 an, formations ≥120h, frais pris en charge jusqu\'à 6000€'
  },
  {
    id: 'formation_immersion',
    titre: 'Période d\'immersion professionnelle',
    motsCles: ['immersion', 'découverte métier', 'mobilité', '2 à 10 jours'],
    source: 'formation',
    resume: '2 à 10 jours pour découvrir un autre métier, max 20j sur 3 ans'
  },
  {
    id: 'formation_syndicale',
    titre: 'Formation syndicale',
    motsCles: ['formation syndicale', 'syndicat', '12 jours', 'représentant'],
    source: 'formation',
    resume: '12 jours ouvrables par an, frais à charge du syndicat'
  },
  {
    id: 'formation_hygiene_securite',
    titre: 'Formations hygiène et sécurité',
    motsCles: ['sécurité', 'hygiène', 'habilitation', 'CACES', 'électrique', 'premiers secours'],
    source: 'formation',
    resume: 'Formations obligatoires liées au poste (CACES, habilitation électrique, SST...)'
  },
  {
    id: 'formation_perfectionnement',
    titre: 'Formation de perfectionnement et préparation aux diplômes',
    motsCles: ['perfectionnement', 'diplôme', 'frais', '70%', 'prise en charge', 'pédagogique', 'qualification'],
    source: 'formation',
    resume: 'Formations diplômantes/qualifiantes, 70% frais pédagogiques si demande de l\'agent'
  },
  {
    id: 'formation_integration',
    titre: 'Formation d\'intégration',
    motsCles: ['intégration', 'titularisation', '5 jours', '10 jours', 'catégorie A', 'catégorie B', 'catégorie C', 'CNFPT'],
    source: 'formation',
    resume: 'Obligatoire à titularisation : 10 jours (cat A/B), 5 jours (cat C)'
  },
  {
    id: 'formation_professionnalisation',
    titre: 'Formation de professionnalisation',
    motsCles: ['professionnalisation', 'premier emploi', 'carrière', '5 jours', '10 jours', 'nouveau poste'],
    source: 'formation',
    resume: '5 à 10 jours (1er emploi), 2 à 10 jours (tout au long de carrière)'
  },
  {
    id: 'formation_rep',
    titre: 'Reconnaissance de l\'Expérience Professionnelle (REP)',
    motsCles: ['REP', 'reconnaissance', 'expérience', 'équivalence', 'diplôme', 'concours'],
    source: 'formation',
    resume: 'Permet de faire reconnaître son expérience comme équivalente à un diplôme pour les concours'
  },
  {
    id: 'formation_disponibilite_etudes',
    titre: 'Disponibilité pour études ou recherches',
    motsCles: ['disponibilité', 'études', 'recherches', '3 ans', 'renouvelable'],
    source: 'formation',
    resume: 'Max 3 ans renouvelable une fois, sans rémunération ni avancement'
  },
  {
    id: 'formation_formateur_interne',
    titre: 'Formateur interne occasionnel',
    motsCles: ['formateur', 'interne', 'expertise', 'RIFSEEP', 'déroulé pédagogique'],
    source: 'formation',
    resume: 'Agents avec expertise métier, formation de formateur requise, rémunéré via RIFSEEP'
  },

  // ============================================
  // TÉLÉTRAVAIL (teletravail.ts)
  // ============================================
  {
    id: 'teletravail_principes',
    titre: 'Principes du télétravail',
    motsCles: [
      'télétravail', 'principes', 'conditions', 'conditions du télétravail', 'modalités', 'règles', 'volontariat', 'réversibilité', 'confiance', 'déconnexion',
      'organisation du travail', 'management participatif', 'autonomie', 'responsabilisation', 'conditions de travail', 'bien-être', 'flexibilité', 'continuité du service public', 'protection des agents', 'plan de continuité', 'mode de travail', 'règles', 'obligations', 'droit', 'loi 2012-347', 'décret 2016-151', 'accord cadre', 'fonction publique', 'collectivité', 'employeur public'
    ],
    source: 'teletravail',
    resume: 'Conditions générales et principes du télétravail : volontariat, réversibilité, droit à la déconnexion, organisation du travail, autonomie, responsabilités, obligations et cadre réglementaire'
  },
  {
    id: 'teletravail_eligibilite',
    titre: 'Éligibilité au télétravail',
    motsCles: ['éligibilité', 'conditions d accès', 'conditions', 'métiers', 'compatible', 'exclus', 'catégorie A', 'catégorie B', 'catégorie C'],
    source: 'teletravail',
    resume: 'Ouvert à tous si fonctions compatibles, exclus: contact public, voie publique, confidentialité'
  },
  {
    id: 'rifseep_ifse_cia',
    titre: 'RIFSEEP, IFSE et CIA',
    motsCles: ['RIFSEEP', 'IFSE', 'IFSE 1', 'IFSE 2', 'CIA', 'complément indemnitaire annuel', 'indemnité de fonctions', 'sujétions', 'expertise', 'engagement professionnel', 'prime', 'primes', 'régime indemnitaire'],
    source: 'rifseep',
    resume: 'Régime indemnitaire des agents : IFSE 1 selon les fonctions, IFSE 2 selon direction, service et métier, CIA comme part variable annuelle liée à l engagement professionnel.'
  },
  {
    id: 'teletravail_quotite',
    titre: 'Quotité et forfait télétravail',
    motsCles: ['forfait', 'jours télétravail', '15 jours', '1 jour par semaine', '3 jours par mois', 'quotité'],
    source: 'teletravail',
    resume: '1 jour fixe/semaine + forfait 15 jours/an (max 3j/mois), présence obligatoire 3j/semaine'
  },
  {
    id: 'teletravail_demande',
    titre: 'Procédure de demande télétravail',
    motsCles: ['demande', 'formulaire', 'autorisation', 'refus', 'entretien', 'CAP'],
    source: 'teletravail',
    resume: 'Demande écrite, entretien préalable, refus motivé contestable en CAP'
  },
  {
    id: 'teletravail_materiel',
    titre: 'Matériel et équipement télétravail',
    motsCles: ['matériel', 'ordinateur', 'internet', 'kit ergonomique', 'équipement'],
    source: 'teletravail',
    resume: 'Matériel fourni par la collectivité, kit ergonomique, connexion internet requise'
  },
  {
    id: 'teletravail_lieu',
    titre: 'Lieu d\'exercice du télétravail',
    motsCles: ['domicile', 'lieu', 'adresse', 'espace coworking', 'tiers lieu'],
    source: 'teletravail',
    resume: 'Domicile principal ou autre lieu déclaré, espaces publics possibles'
  },
  {
    id: 'teletravail_horaires',
    titre: 'Horaires et temps de travail en télétravail',
    motsCles: ['horaires', 'plages fixes', 'joignable', 'déconnexion', 'heures sup'],
    source: 'teletravail',
    resume: 'Mêmes horaires que sur site, plages fixes obligatoires, pas d\'heures sup'
  },
  {
    id: 'teletravail_situations_particulieres',
    titre: 'Situations particulières (grossesse, aidants, handicap)',
    motsCles: ['grossesse', 'enceinte', 'proche aidant', 'handicap', 'situation particulière', 'dérogation'],
    source: 'teletravail',
    resume: 'Dérogation possible au-delà de 3j/semaine pour femmes enceintes, aidants, handicap'
  },
  {
    id: 'teletravail_exceptionnel',
    titre: 'Télétravail exceptionnel (pandémie, intempéries)',
    motsCles: ['exceptionnel', 'pandémie', 'intempéries', 'circonstances', 'PCA', 'continuité'],
    source: 'teletravail',
    resume: 'Peut être imposé en cas de crise (pandémie, catastrophe), intégré au PCA'
  },
  {
    id: 'teletravail_reversibilite',
    titre: 'Réversibilité et fin du télétravail',
    motsCles: ['réversibilité', 'fin', 'arrêt', 'préavis', '1 mois', '2 mois', 'adaptation'],
    source: 'teletravail',
    resume: 'Fin possible à tout moment : 1 mois préavis pendant adaptation, 2 mois après'
  },
  // --- FICHES BIP DYNAMIQUEMENT CONVERTIES ---
  ...bipIndex.map(fiche => ({
    ...fiche,
    source: 'bip' as const,
  }))
];

/**
 * Fonction utilitaire pour rechercher dans le sommaire
 * Retourne les sections les plus pertinentes pour une question donnée
 * @param allowedSources - Filtrer par source (ex: ['temps', 'formation', 'teletravail'])
 */
export function rechercherDansSommaire(question: string, maxResults = 3, allowedSources?: string[]): SectionIndex[] {
  const normalizeSearchText = (value: string) =>
    value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const SEARCH_EQUIVALENTS: Record<string, string[]> = {
    'artt': ['rtt', 'reduction temps travail'],
    'cap': ['commission administrative paritaire'],
    'cet': ['compte epargne temps'],
    'cia': ['complement indemnitaire annuel', 'rifseep', 'prime'],
    'cld': ['conge longue duree'],
    'clm': ['conge longue maladie'],
    'cpf': ['compte personnel de formation'],
    'heures sup': ['heures supplementaires'],
    'ifse': ['rifseep', 'indemnite de fonctions', 'prime'],
    'jour de carence': ['carence'],
    'maladie ordinaire': ['cmo', 'conge maladie ordinaire'],
    'pacs': ['mariage'],
    'rtt': ['artt', 'reduction temps travail'],
    'teletravail': ['conditions du teletravail', 'principes du teletravail'],
    'teletravail mobile': ['forfait teletravail'],
    'vae': ['validation des acquis de l experience'],
    'demenagement': ['demenager', 'changement adresse', 'changement d\'adresse'],
    'deces': ['obseques', 'enterrement', 'mort', 'deuil'],
    'mariage': ['pacs', 'union', 'celebration'],
    'accident': ['accident du travail', 'accident de service', 'trajet', 'sinistre', 'professionnelle'],
    'maladie': ['sante', 'arret', 'arrêt', 'cmo', 'clm', 'cld', 'carence'],
    'formation': ['stage', 'concours', 'examen', 'cnfpt', 'iel'],
    'partiel': ['temps partiel', 'quotite', '80%', '90%', '50%'],
    'greve': ['mobilisation', 'preavis', 'retenue']
  };

  const SPECIAL_REQUIREMENTS: Array<{ when: string[]; requireAnyOf: string[]; penalty: number }> = [
    { when: ['carence'], requireAnyOf: ['carence'], penalty: 40 },
    { when: ['cia'], requireAnyOf: ['cia', 'complement indemnitaire annuel', 'rifseep'], penalty: 60 },
    { when: ['ifse'], requireAnyOf: ['ifse', 'rifseep', 'indemnite de fonctions'], penalty: 50 },
    { when: ['maladie', 'ordinaire'], requireAnyOf: ['ordinaire', 'cmo', 'maladie ordinaire'], penalty: 35 },
  ];

  const LOW_SIGNAL_TERMS = new Set([
    'agent', 'agents', 'an', 'ans', 'demande', 'droit', 'droits', 'faire', 'fonctionne', 'fonctionnent', 'jour', 'jours',
    'mettre', 'mois', 'peux', 'peut', 'pose', 'poser', 'prendre', 'question', 'semaines', 'semaine', 'temps', 'utiliser',
  ]);

  // Détecter les acronymes (mots en MAJUSCULES 2-5 lettres) dans la question originale
  const acronymsDetected = new Set<string>();
  question.split(/\s+/).forEach(word => {
    const clean = word.replace(/[^\w]/g, '');
    // Si mot de 2-5 lettres tout en majuscules → probable acronyme (CET, RTT, CAF, etc.)
    if (/^[A-Z]{2,5}$/.test(clean)) {
      acronymsDetected.add(clean.toLowerCase());
    }
  });

  const qNorm = normalizeSearchText(question);

  const STOP_WORDS = new Set([
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'au', 'aux',
    'et', 'ou', 'mais', 'donc', 'or', 'ni', 'car',
    'a', 'dans', 'par', 'pour', 'en', 'vers', 'avec', 'sans', 'sous', 'sur',
    'je', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles',
    'mon', 'ton', 'son', 'ma', 'ta', 'sa', 'mes', 'tes', 'ses',
    'notre', 'votre', 'leur', 'nos', 'vos', 'leurs',
    'ce', 'cet', 'cette', 'ces',
    'qui', 'que', 'quoi', 'dont', 'ou', 'quand',
    'est', 'sont', 'etre', 'avoir', 'ont', 'fait', 'faire', 'peut', 'peuvent', 'veux', 'vouloir',
    'comment', 'combien', 'pourquoi', 'quand', 'quel', 'quelle', 'quels', 'quelles'
  ]);

  // Pseudo-stemmer basique pour pluriel
  const stem = (w: string) => w.replace(/(s|x)$/, '');

  // Extraire les mots de la question, exclure les STOP_WORDS SAUF les acronymes détectés
  const queryWords = qNorm
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && (!STOP_WORDS.has(word) || acronymsDetected.has(word)));

  const queryVariants = new Set<string>([qNorm.trim()]);
  Object.entries(SEARCH_EQUIVALENTS).forEach(([term, variants]) => {
    if (qNorm.includes(term)) {
      variants.forEach((variant) => queryVariants.add(normalizeSearchText(variant)));
    }
  });
  queryWords.forEach((word) => {
    const variants = SEARCH_EQUIVALENTS[word];
    if (variants) {
      variants.forEach((variant) => queryVariants.add(normalizeSearchText(variant)));
    }
  });

  const queryStems = queryWords.map(stem);
  const focusWords = Array.from(new Set(
    queryWords.filter((word) => acronymsDetected.has(word) || (word.length >= 4 && !LOW_SIGNAL_TERMS.has(word))),
  ));
  const focusStems = focusWords.map(stem);

  // Calculer un score pour chaque section
  const sectionsToScore = allowedSources ? sommaireUnifie.filter(s => allowedSources.includes(s.source)) : sommaireUnifie;
  const scored = sectionsToScore.map(section => {
    let score = 0;

    const titreNorm = normalizeSearchText(section.titre);
    const resumeNorm = section.resume ? normalizeSearchText(section.resume) : '';
    const motsClesNorm = section.motsCles.map(m => normalizeSearchText(m));
    const texteCombine = `${titreNorm} ${motsClesNorm.join(' ')} ${resumeNorm}`;

    // 1. Détection des expressions complètes (très fort)
    if (titreNorm.includes(qNorm)) score += 50;
    if (resumeNorm.includes(qNorm)) score += 20;

    queryVariants.forEach((variant) => {
      if (!variant || variant.length < 4 || variant === qNorm) {
        return;
      }

      if (titreNorm.includes(variant)) score += 28;
      if (resumeNorm.includes(variant)) score += 10;
      if (motsClesNorm.some((motCle) => motCle.includes(variant))) score += 18;
    });

    for (const mcNorm of motsClesNorm) {
      if (qNorm.includes(mcNorm)) {
        const wordCount = mcNorm.split(/\s+/).length;
        score += 20 * wordCount;
      }
    }

    // 2. Évaluer chaque mot significatif (racine)
    for (let i = 0; i < queryWords.length; i++) {
      const qStem = queryStems[i];
      const qWord = queryWords[i];
      const isLowSignal = LOW_SIGNAL_TERMS.has(qWord);
      const titleWeight = isLowSignal ? 5 : 15;
      const keywordWeight = isLowSignal ? 4 : 15;
      const resumeWeight = isLowSignal ? 2 : 5;

      const isMatch = (text: string) => text.includes(qStem);
      const isExactMatch = (text: string) => new RegExp(`\\b${qStem}[a-z]*\\b`).test(text);

      // Titre
      if (isMatch(titreNorm)) {
        score += titleWeight;
        if (isExactMatch(titreNorm)) score += isLowSignal ? 3 : 10;
      }

      // Keywords
      for (const mcNorm of motsClesNorm) {
        if (isMatch(mcNorm)) {
          score += keywordWeight;
          if (isExactMatch(mcNorm)) score += isLowSignal ? 2 : 8;
          break; // Un seul match keyword suffit par mot de la question
        }
      }

      // Resume
      if (isMatch(resumeNorm)) {
        score += resumeWeight;
        if (isExactMatch(resumeNorm)) score += isLowSignal ? 1 : 3;
      }

      if (acronymsDetected.has(qWord) && isExactMatch(texteCombine)) {
        score += 18;
      }
    }

    // 3. Multiplicateur de couverture (Boost densité)
    // Favorise la section qui matche le PLUS GRAND NOMBRE de mots différents de la question
    let matchesCount = 0;

    for (const qStem of queryStems) {
      if (texteCombine.includes(qStem)) {
        matchesCount++;
      }
    }

    const focusMatches = focusStems.filter((qStem) => texteCombine.includes(qStem)).length;

    // Si la doc contient plusieurs mots différents exigés par la question, le score explose
    if (matchesCount > 1) {
      score += (matchesCount * matchesCount * 10);
    }

    if (focusMatches > 1) {
      score += focusMatches * focusMatches * 14;
    }

    if (focusStems.length > 0 && focusMatches === 0) {
      score = Math.floor(score * 0.2);
    }

    SPECIAL_REQUIREMENTS.forEach(({ when, requireAnyOf, penalty }) => {
      const shouldApply = when.every((term) => qNorm.includes(term));
      if (shouldApply && !requireAnyOf.some((term) => texteCombine.includes(term))) {
        score -= penalty;
      }
    });

    if (qNorm.includes('teletravail') && (qNorm.includes('condition') || qNorm.includes('conditions'))) {
      const matchesGeneralTeletravail = ['conditions', 'eligibilite', 'principes', 'regles', 'modalites']
        .some((term) => texteCombine.includes(term));
      const isExceptionalOnly = texteCombine.includes('exceptionnel') || texteCombine.includes('pandemie') || texteCombine.includes('crise');

      if (isExceptionalOnly && !matchesGeneralTeletravail) {
        score -= 25;
      }
    }

    return { section, score };
  });

  // Trier par score décroissant et retourner les meilleurs
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(s => s.section);
}

/**
 * Recherche avec hiérarchie de sources
 * Cherche d'abord dans temps/formation/teletravail, puis BIP si nécessaire
 */
export function rechercherAvecPriorite(question: string, maxResults = 3): SectionIndex[] {
  // Phase 1 : Chercher dans les sources prioritaires
  const prioritySources = ['temps', 'formation', 'teletravail', 'rifseep'];
  const priorityResults = rechercherDansSommaire(question, maxResults, prioritySources);

  // Si on a trouvé au moins une section prioritaire, ne pas interroger BIP
  if (priorityResults.length > 0) {
    return priorityResults;
  }

  // Phase 2 : Complémenter avec BIP si nécessaire
  const bipResults = rechercherDansSommaire(question, maxResults - priorityResults.length, ['bip']);
  return [...priorityResults, ...bipResults].slice(0, maxResults);
}

/**
 * Génère un prompt compact du sommaire pour l'API (étape 1)
 * ~500 tokens au lieu de ~15000 pour les docs complètes
 */
export function genererPromptSommaire(): string {
  const lines: string[] = ['SOMMAIRE DES DOCUMENTS INTERNES - MAIRIE DE GENNEVILLIERS\n'];

  let currentSource = '';
  for (const section of sommaireUnifie) {
    if (section.source !== currentSource) {
      currentSource = section.source;
      const sourceLabel = {
        temps: '\n📅 TEMPS DE TRAVAIL ET CONGÉS',
        formation: '\n🎓 FORMATION',
        teletravail: '\n🏠 TÉLÉTRAVAIL',
        bip: '\n📚 FICHES BIP (BASE DE DONNÉES COLLABORATIVE)'
      }[currentSource];
      if (sourceLabel) {
        lines.push(sourceLabel);
      }
    }

    lines.push(`• [${section.id}] ${section.titre}`);
    if (section.resume) {
      lines.push(`  → ${section.resume}`);
    }
  }

  return lines.join('\n');
}

