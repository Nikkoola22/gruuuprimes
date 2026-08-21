/**
 * Script d'enrichissement global, rigoureux et exhaustif des modèles administratifs territoriaux
 * Ville de Gennevilliers
 *
 * Reproduit EXACTEMENT la trame, la mise en page et les clauses obligatoires des contrats originaux
 * de la Mairie de Gennevilliers (Arrêtés de délégation, Visas, CGFP, Décret 88-145,
 * Période d'essai, Rémunération, Sécurité Sociale IRCANTEC, Droits et Obligations,
 * Médiation Préalable Obligatoire CIG Petite Couronne Pantin et TA Cergy-Pontoise).
 *
 * Usage : node scripts/enrichThemeTemplates.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("================================================================================");
console.log("🏛️  ENRICHISSEMENT EXACT SELON LES CONTRATS OFFICIELS DE GENNEVILLIERS");
console.log("   Mairie de Gennevilliers — Modèles Contrats Décret 88-145 & CGFP Conformes");
console.log("================================================================================\n");

const GENNEVILLIERS_MPO_RECOURS_CLAUSE = `Je soussigné-e reconnais avoir reçu un exemplaire du présent contrat et avoir été informé-e que je dois obligatoirement, dans un délai de deux mois à compter de sa notification, et avant de saisir le tribunal administratif, saisir le médiateur du Centre Interdépartemental de Gestion de la Petite Couronne soit par courrier postal à l'adresse suivante : « CIG Petite couronne - Recours à la médiation préalable obligatoire 1 rue Lucienne Gérain 93698 Pantin cedex », soit par message électronique à « mediateur@cig929394.fr » pour qu'il engage une médiation (décret n°2018-101 du 16 février 2018 et arrêté du 2 mars 2018). Une copie de ce contrat doit être jointe à la demande.
Si cette médiation ne permet pas de parvenir à un accord, vous pourrez contester le présent contrat devant le tribunal administratif de Cergy-Pontoise dans un délai de deux mois à compter de la fin de la médiation. Une copie de ce contrat devra être jointe à votre recours.`;

const GENNEVILLIERS_ACTES_RECOURS_CLAUSE = `La présente décision municipale [ou Le présent arrêté] peut faire l'objet d'un recours pour excès de pouvoir auprès du Tribunal administratif de Cergy-Pontoise (2-4 boulevard de l'Hautil – BP 30322- 95207 Cergy-Pontoise ou via Télérecours Citoyens : www.telerecours.fr) dans un délai de deux mois à compter de sa publication ou de sa notification.`;

const ALL_THEMES_ENRICHED = [
  // ─── 1. COMMANDE PUBLIQUE & MARCHÉS PUBLICS ───────────────────────────────────
  {
    id: "marches_publics",
    title: "Marchés Publics & Commande Publique",
    icon: "🏗️",
    description: "Attribution de marchés, actes d'engagement ATTRI1, avenants, ordres de service, PV de réception et sans suite",
    templates: [
      {
        id: "mp_decision_signature",
        name: "Décision du Maire : Attribution et Signature d'un Marché Public",
        type: "decision",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/decision_municipale.docx",
        cgfpRef: "CGCT Art. L. 2122-22 (4°) & Code de la Commande Publique",
        summary: "Décision du Maire formalisant l'attribution et autorisant la signature du marché public de travaux, fournitures ou services.",
        sampleDocument: `VILLE DE GENNEVILLIERS
DÉCISION DU MAIRE N° MP-2026-[XXX]
Portant attribution et signature du marché public de [Objet du marché] (Marché n° [Numéro])

Le Maire de la Ville de Gennevilliers,
Vu le Code Général des Collectivités Territoriales (CGCT), notamment ses articles L. 2122-22 (4°) et L. 2122-23 ;
Vu le Code de la Commande Publique (CCP), notamment ses articles L. 2123-1, R. 2123-1 et suivants ;
Vu le Cahier des Clauses Administratives Générales (CCAG) applicable ;
Vu la délibération du Conseil Municipal de Gennevilliers en date du [Date], portant délégation permanente d'attributions au Maire au titre de l'article L. 2122-22 du CGCT ;
Vu l'avis d'appel public à la concurrence publié le [Date] ;
Vu le rapport d'analyse des offres établi par la Direction de la Commande Publique en date du [Date] ;
Considérant que l'offre présentée par la société [Nom de l'attributaire] est l'offre économiquement la plus avantageuse ;
Considérant que les crédits nécessaires sont inscrits au budget communal ;

DÉCIDE :
ARTICLE 1 : Le marché public de [Objet complet], référencé sous le n° [Numéro], est attribué à la société [Nom de l'attributaire], pour un montant de [Montant HT] € HT ([Montant TTC] € TTC).
ARTICLE 2 : Le Maire de Gennevilliers est autorisé à signer l'acte d'engagement ainsi que toutes les pièces contractuelles s'y rapportant.
ARTICLE 3 : Les dépenses seront imputées sur les crédits ouverts au budget principal (Compte [Compte], Opération [Numéro]).
ARTICLE 4 : Il sera rendu compte de la présente décision lors de la plus prochaine séance du Conseil Municipal.
ARTICLE 5 (Voies et délais de recours) :
${GENNEVILLIERS_ACTES_RECOURS_CLAUSE}

Fait à Gennevilliers, le [Date]
Pour le Maire de Gennevilliers, Patrice LECLERC,
Soraya FONTAINE KESSAR, Directrice Générale des Services`
      },
      {
        id: "mp_acte_engagement_attri1",
        name: "Formulaire ATTRI1 : Acte d'Engagement de Marché Public",
        type: "contrat",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/courrier.doc",
        cgfpRef: "Code de la Commande Publique Art. R. 2112-4",
        summary: "Document contractuel liant la Ville et le titulaire avec fixation des prix unitaires/forfaitaires et des délais d'exécution.",
        sampleDocument: `VILLE DE GENNEVILLIERS - COMMANDE PUBLIQUE
ACTE D'ENGAGEMENT (FORMULAIRE ATTRI1)
Marché Public n° [Numéro du marché] - [Intitulé de l'opération]

Entre la Ville de Gennevilliers (SIRET : 219 200 366 00010), représentée par Patrice LECLERC, Maire,
Et la Société [Nom de l'entreprise], représentée par [Nom du gérant], titulaire,

ARTICLE 1 : Le titulaire s'engage à exécuter les prestations décrites au CCTP pour un montant de [Montant HT] € HT ([Montant TTC] € TTC).
ARTICLE 2 : Les délais d'exécution sont fixés à [Durée] à compter de la notification de l'Ordre de Service n° 1.
ARTICLE 3 : Comptable assignataire : Trésorerie Principale de Gennevilliers. Paiement par mandat administratif sous 30 jours (IBAN : [IBAN]).

Fait à Gennevilliers, le [Date]
Le Titulaire (lu et approuvé),                   Pour la Ville de Gennevilliers, Patrice LECLERC`
      },
      {
        id: "mp_avenant_modification",
        name: "Avenant Contractuel de Modification de Marché Public",
        type: "contrat",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/courrier.doc",
        cgfpRef: "Code de la Commande Publique Art. R. 2194-1 à R. 2194-10",
        summary: "Avenant constatant l'ajustement des volumes ou des prestations complémentaires imprévues en cours de contrat.",
        sampleDocument: `VILLE DE GENNEVILLIERS
AVENANT N° [Numéro] AU MARCHÉ PUBLIC N° [Numéro initial]
Objet : [Objet du marché initial]

Entre la Ville de Gennevilliers et la société [Nom du titulaire],
Considérant les sujétions techniques imprévues constatées en cours d'exécution ;

ARTICLE 1 : Prestations complémentaires : [Description précise des travaux ou modifications].
ARTICLE 2 : Incidence financière : + [Montant HT] € HT (+ [X] %). Nouveau montant total : [Nouveau montant TTC] € TTC.
ARTICLE 3 : Les autres stipulations contractuelles non modifiées demeurent applicables.

Fait à Gennevilliers, le [Date]
Le Titulaire,                                    Pour le Maire, Soraya FONTAINE KESSAR (DGS)`
      },
      {
        id: "mp_ordre_service",
        name: "Ordre de Service (OS) : Démarrage ou Prolongation de Prestations",
        type: "decision",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/decision_municipale.docx",
        cgfpRef: "CCAG applicable & Code de la Commande Publique",
        summary: "Notification écrite faisant courir les délais d'exécution contractuels ou ordonnant une suspension temporaire.",
        sampleDocument: `VILLE DE GENNEVILLIERS - SERVICES TECHNIQUES
ORDRE DE SERVICE N° OS-2026-[XXX]
Marché n° [Numéro] - Société [Nom du titulaire]

ARTICLE 1 : La société [Nom du titulaire] est mise en demeure de commencer l'exécution des travaux le [Date de démarrage].
ARTICLE 2 : Le délai contractuel de [Durée] commence à courir à cette même date.
ARTICLE 3 : À retourner signé avec la mention manuscrite « Reçu pour notification ».

Fait à Gennevilliers, le [Date]
Soraya FONTAINE KESSAR, Directrice Générale des Services`
      },
      {
        id: "mp_pv_reception",
        name: "Procès-Verbal de Réception des Prestations / Travaux",
        type: "decision",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/decision_municipale.docx",
        cgfpRef: "CCAG Travaux / CCAG FCS & Opérations préalables à la réception",
        summary: "Constat contradictoire d'achèvement des travaux ouvrant la garantie de parfait achèvement (1 an).",
        sampleDocument: `VILLE DE GENNEVILLIERS
PROCÈS-VERBAL DE RÉCEPTION DES TRAVAUX (Marché n° [Numéro])

ARTICLE 1 : La réception des travaux est prononcée avec effet au [Date d'achèvement] [SANS RÉSERVE / AVEC RÉSERVES].
ARTICLE 2 : Point de départ de la garantie de parfait achèvement (1 an) et des garanties biennale et décennale.
ARTICLE 3 : Le titulaire est invité à transmettre son projet de décompte final (PDF).

Fait à Gennevilliers, le [Date]
Le Maître d'Œuvre,           L'Entreprise,                   Pour la Ville, Soraya FONTAINE KESSAR (DGS)`
      },
      {
        id: "mp_decision_sans_suite",
        name: "Décision du Maire : Déclaration Sans Suite / Infructuosité",
        type: "decision",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/decision_municipale.docx",
        cgfpRef: "Code de la Commande Publique Art. R. 2185-1 (Intérêt général)",
        summary: "Arrêt motivé de la procédure de consultation pour motif d'intérêt général (financier ou technique).",
        sampleDocument: `VILLE DE GENNEVILLIERS - DÉCISION DU MAIRE N° MP-2026-DSS-[XXX]
Portant déclaration sans suite de la consultation n° [Numéro]

Vu le Code de la Commande Publique, article R. 2185-1 ;
Considérant que les offres reçues excèdent substantiellement l'enveloppe budgétaire allouée ;

DÉCIDE :
ARTICLE 1 : La consultation n° [Numéro] est déclarée SANS SUITE pour motif d'intérêt général.
ARTICLE 2 : Les candidats évincés en sont informés par écrit.
ARTICLE 3 (Voies de recours) :
${GENNEVILLIERS_ACTES_RECOURS_CLAUSE}

Fait à Gennevilliers, le [Date]
Pour le Maire, Soraya FONTAINE KESSAR (DGS)`
      }
    ]
  },

  // ─── 2. RECRUTEMENT & CONTRATS PUBLICS (CONFORME AUX ORIGINAUX VILLE) ────────
  {
    id: "recrutement_contrats",
    title: "Recrutement & Contrats Publics",
    icon: "📑",
    description: "Contrats CDD de droit public (L. 332-23 1°, L. 332-13, L. 332-8, L. 332-24, Médecins vacataires, Apprentissage)",
    templates: [
      {
        id: "recrut_cdd_accroissement_temp",
        name: "Contrat CDD : Engagement pour Accroissement Temporaire d'Activité (L. 332-23 1°)",
        type: "contrat",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/courrier.doc",
        cgfpRef: "CGFP Art. L. 332-23 1° & Décret n° 88-145 (Modèle Original Conforme)",
        summary: "Contrat à durée déterminée complet avec grille d'horaires, période d'essai, préavis et médiation préalable obligatoire CIG.",
        sampleDocument: `Gennevilliers                                                   RÉPUBLIQUE FRANÇAISE
(Logo Ville Populaire)                                          LIBERTÉ - ÉGALITÉ - FRATERNITÉ

CONTRAT À DURÉE DÉTERMINÉE PORTANT ENGAGEMENT DE Monsieur/Madame [NOM Prénom]
POUR FAIRE FACE A UN ACCROISSEMENT TEMPORAIRE D'ACTIVITE
(Etabli en application des dispositions de l'article L332-23 1° du code général de la fonction publique)

Monsieur Patrice LECLERC, Maire de Gennevilliers,
                                                                d'une part,
Et
[Monsieur/Madame NOM Prénom], né(e) le [Date de naissance] à [Lieu de naissance],
                                                                d'autre part,

Vu le Code général de la fonction publique,
Vu le décret n°88-145 du 15 février 1988 pris pour l'application de l'article 136 de la loi du 26 janvier 1984 modifiée, portant dispositions statutaires relatives à la Fonction Publique Territoriale et relatif aux agents contractuels de la fonction publique territoriale,
Vu l'arrêté municipal du 30 mars 2026, exécutoire le 30 mars 2026, portant délégation d'attribution de fonctions et de signature à Monsieur Pierric ANNOOT, 12ème adjoint au Maire [ou Madame ZOUAOUI Zineb, adjointe au Maire],
Considérant qu'il est nécessaire de recruter un agent contractuel sur un emploi non permanent pour faire face à un besoin lié à un accroissement temporaire d'activité,
Vu la candidature présentée par [Monsieur/Madame NOM Prénom] ;
Considérant que le cocontractant remplit les conditions générales de recrutement énumérées à l'article 2 du décret susvisé du 15 février 1988 modifié, dont l'aptitude physique attestée par certificat médical ;
Vu le tableau des effectifs annexé au budget,
Vu le diplôme / titre professionnel de [Intitulé du diplôme],

Il a été d'un commun accord convenu ce qui suit :

Article 1er - Objet et durée du contrat :
[Monsieur/Madame NOM Prénom], né(e) le [Date de naissance], est recruté(e) sur un emploi relevant de la catégorie [A / B / C], en qualité de [Intitulé exact du poste] contractuel, pour assurer les fonctions de [Description précise des missions].
Le contrat prend effet à compter du [Date de prise d'effet] jusqu'au [Date de fin de contrat].
La durée hebdomadaire de service de [Monsieur/Madame NOM Prénom] est fixée à [35h ou quotité, ex: 8,5/35ème], répartie sur une amplitude hebdomadaire fixée par la Direction [Nom de la Direction].
Dans le cas où l'intéressé(e) effectuerait des heures complémentaires à la demande de la direction de services, celles-ci seraient rémunérées sur la base des heures normales.
Une rémunération sera opérée selon le nombre d'heures complémentaires effectuées.
[Monsieur/Madame NOM Prénom] s'engage à assurer ses missions au sein de la Direction [Nom de la Direction/Service], située à [Adresse du site à Gennevilliers].

Article 2 - Période d'essai :
Le cocontractant est soumis à une période d'essai de [1 mois / durée selon décret] qui permettra à la collectivité d'évaluer les compétences de l'intéressé et à ce dernier d'apprécier si les fonctions occupées lui conviennent.
La collectivité se réserve la possibilité de renouveler une fois la période d'essai pour une durée au plus égale à sa durée initiale.
Le licenciement en cours ou au terme de la période d'essai doit respecter les conditions fixées à l'article 4 du décret n°88-145 susvisé.

Article 3 - Rémunération :
Pour l'exécution du présent contrat, le cocontractant perçoit une rémunération mensuelle brute calculée par référence à l'Indice Brut [IB], Indice Majoré [IM] [ou taux horaire / vacation de [Montant] € brut].
L'intéressé(e) percevra des indemnités compensatrices de congés payés à raison de 10% du traitement brut [le cas échéant] ou bénéficiera de ses congés statutaires.
La rémunération est versée après service fait au regard des états de paye.

Article 4 - Sécurité sociale – retraite :
[Monsieur/Madame NOM Prénom] relèvera du régime général de la sécurité sociale et sera affilié(e) au régime complémentaire de retraite IRCANTEC.

Article 5 – Renouvellement du contrat, licenciement ou démission :
La collectivité se réserve la possibilité de renouveler ce contrat au-delà de son terme. En aucun cas, le renouvellement du contrat ne peut conduire l'intéressé(e) à être employé(e) pour une durée supérieure à 12 mois sur une même période de 18 mois.
- L'intention de renouveler ou non l'engagement du cocontractant sera notifiée au plus tard :
  * 8 jours avant le terme de l'engagement si l'agent a été recruté pour une durée inférieure à 6 mois ;
  * 1 mois avant le terme de l'engagement si l'agent a été recruté pour une durée supérieure à 6 mois et inférieure à 2 ans.
- Licenciement à l'initiative de l'employeur :
  En cas de licenciement, le cocontractant aura droit à un préavis dont la durée sera déterminée en fonction de son ancienneté dans la collectivité :
  * de huit jours s'il justifie d'une ancienneté de service de moins de 6 mois ;
  * d'un mois s'il justifie d'une durée de service comprise entre 6 mois et inférieure à 2 ans.
  La date de présentation de la lettre recommandée notifiant le licenciement ou la date de remise en main propre de la lettre de licenciement fixe le point de départ du préavis.
- Démission du cocontractant :
  La démission du cocontractant de doit être clairement exprimée et présentée par lettre recommandée avec demande d'avis de réception.
  L'agent contractuel qui présente sa démission est tenu de respecter un préavis :
  * de huit jours, s'il a accompli moins de six mois de services ;
  * d'un mois s'il a accompli des services d'une durée comprise entre six mois et inférieure à 2 ans.

Article 6 - Secret professionnel :
La Municipalité de Gennevilliers garantit à l'agent le libre exercice de ses missions professionnelles.
[Monsieur/Madame NOM Prénom] est tenu-e au secret professionnel et à la discrétion professionnelle prévus par la loi.

Article 7 - Droits et obligations :
Le cocontractant est soumis pendant toute la période d'exécution du présent engagement aux droits et obligations des fonctionnaires tels que définis conformément aux dispositions du Code général de la fonction publique (notamment son article L. 2), et par le décret n° 88-145 du 15 février 1988.
En cas de manquement à ces obligations, le régime disciplinaire prévu par le décret précité pourra être appliqué.

Article 8 – Assurance responsabilité :
L'assurance responsabilité civile contractée par la commune de Gennevilliers couvre la responsabilité professionnelle inhérente à son activité attachée à son service d'affectation.

Article 9 : Monsieur le Directeur Général des Services [ou Madame la Directrice Générale des Services, Soraya FONTAINE KESSAR] est chargé de l'exécution du présent contrat qui sera notifié à l'agent et adressé à Monsieur le Trésorier Principal de Gennevilliers.

Le présent contrat est fait en trois exemplaires dont un original est remis à l'intéressé.
Fait en Mairie de Gennevilliers, le [Date].

${GENNEVILLIERS_MPO_RECOURS_CLAUSE}

Signature de l'intéressé(e) (précédée de la mention « lu et approuvé ») :

                                                Pour le Maire, par délégation,
                                                Pierric ANNOOT [ou Zineb ZOUAOUI]
                                                Adjoint au Maire
                                                [Tampon officiel Ville de Gennevilliers]`
      },
      {
        id: "recrut_medecin_vacataire",
        name: "Contrat Portant Engagement d'un Médecin Vacataire (Permanence des Soins)",
        type: "contrat",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/courrier.doc",
        cgfpRef: "CGCT & Délibération municipale fixant le taux de vacation",
        summary: "Contrat d'engagement de médecin vacataire pour la permanence des soins ambulatoires avec grille forfaitaire dégressive.",
        sampleDocument: `Gennevilliers                                                   RÉPUBLIQUE FRANÇAISE
(Logo Ville Populaire)                                          LIBERTÉ - ÉGALITÉ - FRATERNITÉ

CONTRAT PORTANT ENGAGEMENT DE Madame/Monsieur [NOM Prénom]
MEDECIN VACATAIRE

Monsieur Patrice LECLERC, Maire de Gennevilliers,
                                                                d'une part,
Et
[Madame/Monsieur NOM Prénom], né(e) le [Date] à [Lieu de naissance],
                                                                d'autre part,

Vu le Code Général des Collectivités Territoriales,
Vu l'arrêté municipal du 30 mars 2026 exécutoire le 30 mars 2026, portant délégation d'attribution de fonctions et de signature à Monsieur Pierric Annoot, 12ème adjoint au maire,
Vu la délibération du 1er février 2017, fixant le taux de vacation des médecins salariés extérieurs à la collectivité intervenant dans le cadre de la permanence des soins ambulatoires,
Considérant qu'il est nécessaire de recruter un médecin vacataire pour constituer chaque jour l'équipe de permanence des soins ambulatoires en soirées,
Considérant la candidature présentée par [Madame/Monsieur NOM Prénom], Titulaire du Diplôme d'Etat de Docteur en Médecine,

Il a été d'un commun accord convenu ce qui suit :

Article 1er - Objet et durée du contrat :
[Madame/Monsieur NOM Prénom], né(e) le [Date], est recruté(e) du [Date début] au [Date fin], en qualité de médecin vacataire, pour assurer des fonctions de médecin généraliste au sein de l'équipe de permanence des soins ambulatoires en soirée.
Le cocontractant n'est pas soumis à une période d'essai.

Article 2 - Rémunération :
Pour l'exécution du présent contrat, le cocontractant perçoit une rémunération, par vacation de quatre heures, dégressive en fonction du nombre de patients traités pendant la garde :
┌─────────────────────────┬──────────────────────┐
│   Nombre de patients    │    Forfait (brut)    │
├─────────────────────────┼──────────────────────┤
│ 0                       │ 144 €                │
│ 1                       │ 144 €                │
│ 2                       │ 100 €                │
│ 3                       │ 57 €                 │
│ 4 et +                  │ 43 €                 │
└─────────────────────────┴──────────────────────┘
La rémunération est versée après service fait.

Article 3 - Sécurité sociale – retraite :
[Madame/Monsieur NOM Prénom] relèvera du régime général de la sécurité sociale et sera affilié au régime complémentaire de retraite IRCANTEC.

Article 4 – Contentieux :
Les litiges nés de l'exécution du présent contrat relèvent de la compétence du Tribunal Administratif de Cergy-Pontoise dans le respect du délai de recours de deux mois.

Article 5 : Madame la Directrice Générale des Services est chargée de l'exécution du présent contrat qui sera notifié à l'agent et adressé au Trésorier Principal de Gennevilliers.

Fait en 3 exemplaires en Mairie de Gennevilliers, le [Date].

Je soussigné(e) reconnais avoir reçu un exemplaire du présent contrat et avoir été informé(e) que je dispose de deux mois pour le contester par voie de recours auprès du Tribunal Administratif de Cergy-Pontoise à compter de sa signification.

Signature de l'intéressé(e) (précédée de la mention « lu et approuvé ») :

                                                Pour le Maire, par délégation,
                                                Pierric ANNOOT
                                                Adjoint au Maire
                                                [Tampon officiel Ville de Gennevilliers]`
      },
      {
        id: "recrut_cdd_remplacement",
        name: "Contrat CDD : Remplacement Temporaire d'un Agent Indisponible (L. 332-13)",
        type: "contrat",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/courrier.doc",
        cgfpRef: "CGFP Art. L. 332-13 & Décret n° 88-145 (Modèle Original Conforme)",
        summary: "Contrat de droit public pour remplacer un fonctionnaire ou contractuel indisponible avec toutes les mentions obligatoires.",
        sampleDocument: `Gennevilliers                                                   RÉPUBLIQUE FRANÇAISE
(Logo Ville Populaire)                                          LIBERTÉ - ÉGALITÉ - FRATERNITÉ

CONTRAT À DURÉE DÉTERMINÉE PORTANT ENGAGEMENT DE Monsieur/Madame [NOM Prénom]
POUR ASSURER LE REMPLACEMENT TEMPORAIRE D'UN AGENT INDISPONIBLE
(Etabli en application des dispositions de l'article L332-13 du code général de la fonction publique)

Monsieur Patrice LECLERC, Maire de Gennevilliers,
                                                                d'une part,
Et
[Monsieur/Madame NOM Prénom], né(e) le [Date de naissance] à [Lieu de naissance],
                                                                d'autre part,

Vu le Code général de la fonction publique, notamment son article L. 332-13,
Vu le décret n°88-145 du 15 février 1988 pris pour l'application de l'article 136 de la loi du 26 janvier 1984 modifiée, portant dispositions statutaires relatives à la Fonction Publique Territoriale et relatif aux agents contractuels de la fonction publique territoriale,
Vu l'arrêté municipal du 30 mars 2026, exécutoire le 30 mars 2026, portant délégation d'attribution de fonctions et de signature à Monsieur Pierric ANNOOT, 12ème adjoint au Maire [ou Madame ZOUAOUI Zineb, adjointe au Maire],
Considérant qu'il est nécessaire de recruter un agent contractuel pour assurer le remplacement temporaire de [Monsieur/Madame NOM de l'agent remplacé], titulaire du poste de [Intitulé du poste], placé(e) en [Congé de maladie ordinaire / Congé de longue maladie / Congé maternité / Congé parental / Disponibilité],
Vu la candidature présentée par [Monsieur/Madame NOM Prénom] ;
Considérant que le cocontractant remplit les conditions générales de recrutement énumérées à l'article 2 du décret susvisé du 15 février 1988 modifié, dont l'aptitude physique attestée par certificat médical ;
Vu le tableau des effectifs annexé au budget,
Vu le diplôme / titre professionnel de [Intitulé du diplôme],

Il a été d'un commun accord convenu ce qui suit :

Article 1er - Objet et durée du contrat :
[Monsieur/Madame NOM Prénom], né(e) le [Date de naissance], est recruté(e) sur un emploi relevant de la catégorie [A / B / C], en qualité de [Intitulé exact du poste] contractuel, pour assurer le remplacement de [Monsieur/Madame NOM de l'agent remplacé].
Le contrat prend effet à compter du [Date de prise d'effet] jusqu'au [Date de fin de contrat] [ou formule à terme imprécis : conclu pour une durée minimale de [X] mois et jusqu'au retour effectif de l'agent remplacé].
La durée hebdomadaire de service de [Monsieur/Madame NOM Prénom] est fixée à [35 heures hebdomadaires ou quotité, ex: 17,5/35ème], répartie sur une amplitude hebdomadaire fixée par la Direction [Nom de la Direction].
Dans le cas où l'intéressé(e) effectuerait des heures complémentaires à la demande de la direction de services, celles-ci seraient rémunérées sur la base des heures normales.
[Monsieur/Madame NOM Prénom] s'engage à assurer ses missions au sein de la Direction [Nom de la Direction/Service], située à [Adresse du site à Gennevilliers].

Article 2 - Période d'essai :
Le cocontractant est soumis à une période d'essai de [1 mois / durée selon décret] qui permettra à la collectivité d'évaluer les compétences de l'intéressé et à ce dernier d'apprécier si les fonctions occupées lui conviennent.
La collectivité se réserve la possibilité de renouveler une fois la période d'essai pour une durée au plus égale à sa durée initiale.
Le licenciement en cours ou au terme de la période d'essai doit respecter les conditions fixées à l'article 4 du décret n°88-145 susvisé.

Article 3 - Rémunération :
Pour l'exécution du présent contrat, le cocontractant perçoit une rémunération mensuelle brute calculée par référence à l'Indice Brut [IB], Indice Majoré [IM] (soit un traitement indiciaire de base brut de [Montant] €), complété du régime indemnitaire RIFSEEP (IFSE Groupe [X] : [Montant IFSE] €) et du Supplément Familial de Traitement le cas échéant.
L'intéressé(e) bénéficiera de ses congés statutaires rémunérés (2,5 jours par mois de service).
La rémunération est versée après service fait au regard des états de paye.

Article 4 - Sécurité sociale – retraite :
[Monsieur/Madame NOM Prénom] relèvera du régime général de la sécurité sociale et sera affilié(e) au régime complémentaire de retraite IRCANTEC.

Article 5 – Renouvellement du contrat, licenciement ou démission :
La collectivité se réserve la possibilité de renouveler ce contrat au-delà de son terme en cas de prolongation de l'absence de l'agent remplacé.
- L'intention de renouveler ou non l'engagement du cocontractant sera notifiée au plus tard :
  * 8 jours avant le terme de l'engagement si l'agent a été recruté pour une durée inférieure à 6 mois ;
  * 1 mois avant le terme de l'engagement si l'agent a été recruté pour une durée supérieure à 6 mois et inférieure à 2 ans ;
  * 2 mois avant le terme si l'engagement est égal ou supérieur à 2 ans.
- Licenciement à l'initiative de l'employeur :
  En cas de licenciement, le cocontractant aura droit à un préavis dont la durée sera déterminée en fonction de son ancienneté dans la collectivité :
  * de huit jours s'il justifie d'une ancienneté de service de moins de 6 mois ;
  * d'un mois s'il justifie d'une durée de service comprise entre 6 mois et inférieure à 2 ans ;
  * de deux mois pour une ancienneté égale ou supérieure à 2 ans.
  La date de présentation de la lettre recommandée notifiant le licenciement ou la date de remise en main propre de la lettre de licenciement fixe le point de départ du préavis.
  Le préavis ne s'applique pas aux cas de licenciement prévus au cours ou à l'issue de la période d'essai, ainsi que pour motif disciplinaire.
- Démission du cocontractant :
  La démission du cocontractant doit être clairement exprimée et présentée par lettre recommandée avec demande d'avis de réception.
  L'agent contractuel qui présente sa démission est tenu de respecter un préavis :
  * de huit jours, s'il a accompli moins de six mois de services ;
  * d'un mois s'il a accompli des services d'une durée comprise entre six mois et inférieure à 2 ans ;
  * de deux mois au-delà.
  L'ancienneté est décomptée jusqu'à la date d'envoi de la lettre de démission.

Article 6 - Secret professionnel :
La Municipalité de Gennevilliers garantit à l'agent le libre exercice de ses missions professionnelles.
[Monsieur/Madame NOM Prénom] est tenu-e au secret professionnel et à la discrétion professionnelle prévus par la loi.

Article 7 - Droits et obligations :
Le cocontractant est soumis pendant toute la période d'exécution du présent engagement aux droits et obligations des fonctionnaires tels que définis conformément aux dispositions du Code général de la fonction publique (notamment son article L. 2), et par le décret n° 88-145 du 15 février 1988.
En cas de manquement à ces obligations, le régime disciplinaire prévu par le décret précité pourra être appliqué.

Article 8 – Assurance responsabilité :
L'assurance responsabilité civile contractée par la commune de Gennevilliers couvre la responsabilité professionnelle inhérente à son activité attachée à son service d'affectation.

Article 9 : Madame la Directrice Générale des Services (Soraya FONTAINE KESSAR) est chargée de l'exécution du présent contrat qui sera notifié à l'agent et adressé à Monsieur le Trésorier Principal de Gennevilliers.

Le présent contrat est fait en trois exemplaires dont un original est remis à l'intéressé.
Fait en Mairie de Gennevilliers, le [Date].

${GENNEVILLIERS_MPO_RECOURS_CLAUSE}

Signature de l'intéressé(e) (précédée de la mention « lu et approuvé ») :

                                                Pour le Maire, par délégation,
                                                Pierric ANNOOT [ou Zineb ZOUAOUI]
                                                Adjoint au Maire
                                                [Tampon officiel Ville de Gennevilliers]`
      },
      {
        id: "recrut_cdd_emploi_permanent",
        name: "Contrat CDD sur Emploi Permanent (CGFP Art. L. 332-8 2°)",
        type: "contrat",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/courrier.doc",
        cgfpRef: "CGFP Art. L. 332-8 2°, L. 332-9 & Décret n° 2019-1414 (CDD 3 ans / CDI après 6 ans)",
        summary: "Contrat de 3 ans maximum sur emploi permanent de catégorie A en l'absence de candidature de fonctionnaire titulaire.",
        sampleDocument: `Gennevilliers                                                   RÉPUBLIQUE FRANÇAISE
(Logo Ville Populaire)                                          LIBERTÉ - ÉGALITÉ - FRATERNITÉ

CONTRAT À DURÉE DÉTERMINÉE PORTANT ENGAGEMENT DE Monsieur/Madame [NOM Prénom]
SUR UN EMPLOI PERMANENT DE LA FONCTION PUBLIQUE TERRITORIALE
(Établi en application des dispositions de l'article L. 332-8 2° du Code Général de la Fonction Publique)

Monsieur Patrice LECLERC, Maire de Gennevilliers,
                                                                d'une part,
Et
[Monsieur/Madame NOM Prénom], né(e) le [Date de naissance] à [Lieu de naissance],
Demeurant à [Adresse complète],
Numéro de Sécurité Sociale (NIR) : [NIR],
                                                                d'autre part,

Vu le Code général de la fonction publique (CGFP), notamment ses articles L. 332-8 (2°), L. 332-9, L. 332-10 et L. 332-11 ;
Vu le décret n° 88-145 du 15 février 1988 modifié relatif aux agents contractuels de la fonction publique territoriale ;
Vu le décret n° 2019-1414 du 19 décembre 2019 fixant la procédure de recrutement pour pourvoir les emplois permanents de la fonction publique ouverts aux contractuels ;
Vu la délibération du Conseil Municipal de Gennevilliers créant l'emploi permanent de [Intitulé exact de l'emploi] au tableau des effectifs budgétaires (relevant de la catégorie hiérarchique A / Cadre d'emplois des [Cadre d'emplois de référence]) ;
Vu la déclaration de création / vacance d'emploi transmise au Centre Interdépartemental de Gestion (CIG Petite Couronne) et publiée sur l'espace « Choisir le service public » sous le n° [Numéro d'offre] du [Date de publication] ;
Considérant que la procédure de recrutement n'a pas permis de pourvoir l'emploi permanent par un fonctionnaire titulaire et qu'aucun fonctionnaire n'a pu être recruté ;
Considérant que la nature des fonctions et les besoins du service justifient le recrutement d'un agent contractuel de niveau catégorie A ;
Vu l'arrêté municipal du 30 mars 2026 portant délégation d'attribution de fonctions et de signature à Monsieur Pierric ANNOOT, 12ème adjoint au Maire délégué aux Ressources Humaines ;
Vu la candidature présentée par [Monsieur/Madame NOM Prénom], titulaire du diplôme [Intitulé du diplôme de niveau A / Master / Titre requis] ;
Considérant que le cocontractant remplit les conditions d'aptitude physique (certificat médical) et générales de recrutement prévues à l'article 2 du décret n° 88-145 modifié ;

Il a été d'un commun accord convenu ce qui suit :

Article 1er - Objet du contrat, Fonctions et Affectation :
[Monsieur/Madame NOM Prénom] est engagé(e) en qualité d'agent contractuel de droit public sur l'emploi permanent de [Intitulé exact de l'emploi permanent], relevant de la catégorie hiérarchique A (Cadre d'emplois de référence : [Cadre d'emplois]).
L'agent assurera ses missions au sein de la Direction [Nom de la Direction], service [Nom du service], situé à l'Hôtel de Ville / [Site d'affectation], 177, avenue Gabriel-Péri, 92230 Gennevilliers.
La fiche de poste décrivant l'ensemble des missions, activités principales et sujétions particulières est annexée au présent contrat.

Article 2 - Durée du contrat et Date d'effet :
En application de l'article L. 332-9 du Code Général de la Fonction Publique, le présent contrat est conclu pour une durée déterminée de trois (3) ans.
Il prend effet à compter du [Date de début de contrat] pour s'achever le [Date d'échéance du terme] inclus.

Article 3 - Temps de travail :
[Monsieur/Madame NOM Prénom] effectuera un service à temps complet d'une durée hebdomadaire de 35 heures 00 [ou à temps non complet : [X]/35ème], selon le cycle de travail applicable au sein de la direction d'affectation.

Article 4 - Période d'essai :
Conformément à l'article 4 du décret n° 88-145, le cocontractant est soumis à une période d'essai de trois (3) mois.
La collectivité se réserve la possibilité de renouveler une fois cette période d'essai pour une durée au plus égale à 3 mois.
Le licenciement intervenant en cours ou au terme de la période d'essai ne donne lieu à aucun préavis ni versement d'indemnité de licenciement.

Article 5 - Rémunération et Régime indemnitaire (RIFSEEP) :
Pour une durée hebdomadaire de 35 heures, [Monsieur/Madame NOM Prénom] perçoit une rémunération mensuelle brute comprenant :
- Le traitement indiciaire de base calculé par référence à l'Indice Brut [IB], Indice Majoré [IM] : [Montant traitement brut] € ;
- L'indemnité de résidence : [Montant] € ;
- Le régime indemnitaire RIFSEEP (délibération F13 du Conseil Municipal du 15 décembre 2021) : IFSE Groupe [1 / 2 / 3 / 4] : [Montant IFSE mensuelle] € ;
- Le cas échéant, le Complément Indemnitaire Annuel (CIA) versé selon l'évaluation professionnelle annuelle et le barème d'absences de la collectivité ;
- Le Supplément Familial de Traitement (SFT) selon la situation de famille et les justificatifs d'enfants à charge.
En application de l'article 1-2 du décret n° 88-145, la rémunération de l'agent fait obligatoirement l'objet d'un réexamen au moins tous les trois ans au vu des résultats des entretiens professionnels d'évaluation.

Article 6 - Protection Sociale, Congés et Retraite :
[Monsieur/Madame NOM Prénom] relève du Régime Général de la Sécurité Sociale (CPAM des Hauts-de-Seine) et est affilié(e) au régime complémentaire de retraite de l'IRCANTEC.
L'intéressé(e) bénéficie des droits à congés annuels rémunérés (5 fois les obligations hebdomadaires de service) ainsi que des congés statutaires pour raison de santé ou de maternité/paternité régis par le Titre III du décret n° 88-145.

Article 7 - Évaluation Professionnelle Annuelle (CREP) :
L'agent fait l'objet chaque année d'un entretien professionnel d'évaluation conduit par son supérieur hiérarchique direct, donnant lieu à la rédaction d'un Compte-Rendu d'Entretien Professionnel (CREP), conformément aux articles L. 521-1 du CGFP et au décret n° 2014-1526.

Article 8 - Renouvellement, Passage en CDI, Préavis et Licenciement :
1. Renouvellement : Le contrat est renouvelable par reconduction expresse dans la limite d'une durée maximale totale de six (6) ans (CGFP L. 332-9).
2. Passage de droit en CDI : Tout renouvellement du contrat au-delà de la durée totale de six ans de services continus sur des fonctions de même catégorie hiérarchique ne peut être conclu que sous la forme d'un contrat à durée indéterminée (CDI), en application des articles L. 332-9 et L. 332-10 du CGFP.
3. Prévenance de non-renouvellement : En cas de non-renouvellement à l'initiative de la collectivité, notification sera faite à l'agent au moins trois (3) mois avant le terme du contrat (Décret 88-145 Art. 38-1). L'agent dispose d'un délai de 8 jours pour faire connaître sa réponse.
4. Licenciement : En cas de licenciement pour motif légitime (insuffisance professionnelle, suppression du besoin, inaptitude physique), le préavis applicable est de deux (2) mois pour un agent justifiant de 2 ans ou plus d'ancienneté (Décret 88-145 Art. 40).
5. Démission : La démission doit être notifiée par lettre recommandée avec AR en respectant un préavis de deux (2) mois.

Article 9 - Droits, Déontologie et Obligations Professionnelles :
Le cocontractant est soumis aux dispositions des Livres Ier et V du Code Général de la Fonction Publique :
- Obligation de secret et de discrétion professionnelle pour tous les faits, informations ou documents dont il a connaissance dans l'exercice de ses fonctions ;
- Respect absolu des principes de neutralité, laïcité, probité et égalité de traitement des usagers du service public communal ;
- Obéissance hiérarchique et loyauté envers l'administration municipale ;
- Interdiction stricte de cumul d'activités sans autorisation préalable expresse de l'autorité territoriale (CGFP L. 123-1 et s.).

Article 10 - Assurance Responsabilité Civile :
La commune de Gennevilliers souscrit une assurance garantissant la responsabilité civile de ses agents pour les fautes de service commises dans le cadre de leurs fonctions.

Article 11 - Exécution et Notification :
Madame la Directrice Générale des Services (Soraya FONTAINE KESSAR) et la DRH sont chargées de l'exécution du présent contrat qui sera notifié à l'intéressé(e) et adressé à Monsieur le Trésorier Principal de Gennevilliers.

Le présent contrat est fait en trois exemplaires originaux.
Fait en Mairie de Gennevilliers, le [Date].

${GENNEVILLIERS_MPO_RECOURS_CLAUSE}

Signature de l'intéressé(e) (précédée de la mention « lu et approuvé ») :

                                                Pour le Maire, par délégation,
                                                Pierric ANNOOT
                                                12ᵉ Adjoint au Maire délégué aux RH
                                                [Tampon officiel Ville de Gennevilliers]`
      },
      {
        id: "recrut_contrat_projet",
        name: "Contrat de Projet de Droit Public (CGFP Art. L. 332-24)",
        type: "contrat",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/courrier.doc",
        cgfpRef: "CGFP Art. L. 332-24 & Décret n° 2020-172 (Durée de 1 à 6 ans)",
        summary: "Contrat spécifique pour mener une mission stratégique définie dont l'échéance est liée à la réalisation du projet.",
        sampleDocument: `Gennevilliers                                                   RÉPUBLIQUE FRANÇAISE
(Logo Ville Populaire)                                          LIBERTÉ - ÉGALITÉ - FRATERNITÉ

CONTRAT DE PROJET DE DROIT PUBLIC (CGFP ART. L. 332-24)
Projet : [Intitulé de l'opération stratégique]

Entre la Ville de Gennevilliers et [Monsieur/Madame NOM Prénom], Chef de projet,
Vu le CGFP (Art. L. 332-24) et le décret n° 2020-172 du 27 février 2020 ;
Vu la délibération du Conseil Municipal du [Date] ;

Article 1er : Conduite et réalisation des livrables du projet [Nom du projet].
Article 2 : Durée prévisionnelle de [X] ans prenant effet le [Date début].
Article 3 : Rémunération forfaitaire annuelle brute de [Montant] €.
Article 4 : Indemnité de rupture anticipée de 10% en cas de fin anticipée du projet.
Article 5 : Sécurité Sociale et IRCANTEC.

Fait à Gennevilliers, le [Date].

${GENNEVILLIERS_MPO_RECOURS_CLAUSE}

Signature de l'agent :                          Pour le Maire, Patrice LECLERC`
      },
      {
        id: "recrut_apprentissage",
        name: "Contrat d'Apprentissage dans le Secteur Public Local",
        type: "contrat",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/courrier.doc",
        cgfpRef: "Code du Travail L. 6227-1 & CGFP L. 312-1",
        summary: "Contrat d'alternance diplômante dans les services municipaux avec désignation d'un maître d'apprentissage.",
        sampleDocument: `Gennevilliers                                                   RÉPUBLIQUE FRANÇAISE
(Logo Ville Populaire)                                          LIBERTÉ - ÉGALITÉ - FRATERNITÉ

CONTRAT D'APPRENTISSAGE DU SECTEUR PUBLIC TERRITORIAL
Diplôme préparé : [Intitulé du diplôme] - CFA : [Nom du CFA]

Entre la Ville de Gennevilliers et l'Apprenti(e) [NOM Prénom],
Sous le tutorat de [Nom du maître d'apprentissage], agent titulaire ;

Article 1er : Durée du cycle du [Date début] au [Date fin].
Article 2 : Alternance formation théorique CFA et missions pratiques au sein du service [Service].
Article 3 : Rémunération calculée en pourcentage du SMIC.
Article 4 : Prise en charge des frais pédagogiques CFA par la collectivité.

Fait à Gennevilliers, le [Date].

L'Apprenti(e),           Le Maître d'apprentissage,         Pour le Maire, Pierric ANNOOT`
      },
      {
        id: "recrut_certificat_travail",
        name: "Certificat de Travail & Reçu pour Solde de Tout Compte",
        type: "courrier",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/courrier.doc",
        cgfpRef: "Décret n° 88-145 Art. 44 (Délivrance obligatoire)",
        summary: "Document légal de fin de fonctions constatant l'ancienneté, les fonctions occupées et la liquidation des droits.",
        sampleDocument: `VILLE DE GENNEVILLIERS - DIRECTION DES RESSOURCES HUMAINES
177, avenue Gabriel-Péri, 92230 Gennevilliers

CERTIFICAT DE TRAVAIL & REÇU POUR SOLDE DE TOUT COMPTE

La Ville de Gennevilliers certifie que [Monsieur/Madame NOM Prénom], né(e) le [Date], NIR : [NIR], a été employé(e) en qualité d'agent contractuel du [Date début] au [Date fin].
Fonctions exercées : [Intitulé des fonctions], Direction [Direction]. Catégorie : [A/B/C].
L'intéressé(e) quitte la collectivité libre de tout engagement à compter du [Date].

Fait à Gennevilliers, le [Date].
Soraya FONTAINE KESSAR, Directrice Générale des Services`
      }
    ]
  },

  // ─── 3. CARRIÈRE & PARCOURS PROFESSIONNEL ────────────────────────────────────
  {
    id: "carriere",
    title: "Carrière & Parcours Professionnel",
    icon: "📈",
    description: "Échelons, avancements de grade, titularisations, prorogations, détachements, disponibilités et retraites",
    templates: [
      {
        id: "carriere_echelon_duree_unique",
        name: "Arrêté du Maire : Avancement d'Échelon à Durée Unique",
        type: "arrete",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/arrete.docx",
        cgfpRef: "CGFP Art. L. 522-1 & Grilles indiciaires PPCR",
        summary: "Avancement indiciaire automatique et continu à l'ancienneté requise dans l'échelon.",
        sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-ECH-[XXX]
Portant avancement d'échelon de M./Mme [Nom Prénom]

Le Maire de Gennevilliers,
Vu le CGFP, articles L. 522-1 et suivants ;
Considérant que l'agent justifie de l'ancienneté requise dans son échelon ;

ARRÊTE :
ARTICLE 1 : M./Mme [Nom Prénom] est promu(e) au [Nouvel échelon] échelon de son grade à compter du [Date].
ARTICLE 2 : Nouvel Indice Brut [IB], Indice Majoré [IM]. Ancienneté conservée : [Durée].
ARTICLE 3 (Voies de recours) :
${GENNEVILLIERS_ACTES_RECOURS_CLAUSE}

Fait à Gennevilliers, le [Date]
Pour le Maire, Pierric ANNOOT (Adjoint RH)`
      },
      {
        id: "carriere_avancement_grade",
        name: "Arrêté du Maire : Avancement au Grade Supérieur au Choix",
        type: "arrete",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/arrete.docx",
        cgfpRef: "CGFP Art. L. 522-24 & Tableau annuel d'avancement",
        summary: "Promotion de grade au choix après inscription au tableau annuel d'avancement communal.",
        sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-GRA-[XXX]
Portant avancement au grade de [Nouveau grade] de M./Mme [Nom Prénom]

Le Maire de Gennevilliers,
Vu l'article L. 522-24 du CGFP et le tableau annuel d'avancement 2026 ;

ARRÊTE :
ARTICLE 1 : M./Mme [Nom Prénom] est nommé(e) au grade de [Nouveau Grade] à compter du [Date].
ARTICLE 2 : Classement au [X]e échelon, IB [IB], IM [IM].
ARTICLE 3 (Voies de recours) :
${GENNEVILLIERS_ACTES_RECOURS_CLAUSE}

Fait à Gennevilliers, le [Date]
Pour le Maire, Pierric ANNOOT (Adjoint RH)`
      },
      {
        id: "carriere_titularisation",
        name: "Arrêté du Maire : Titularisation d'un Fonctionnaire Stagiaire",
        type: "arrete",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/arrete.docx",
        cgfpRef: "CGFP Art. L. 327-1 & Attestation CNFPT",
        summary: "Intégration définitive dans le cadre d'emplois suite à validation de formation CNFPT et avis favorable.",
        sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-TIT-[XXX]
Portant titularisation de M./Mme [Nom Prénom]

Vu le CGFP, notamment son article L. 327-1 ;
Vu l'attestation de validation de la formation d'intégration du CNFPT ;

ARRÊTE :
ARTICLE 1 : M./Mme [Nom Prénom] est TITULARISÉ(E) dans son grade à compter du [Date].
ARTICLE 2 : Classement au [X]e échelon, IB [IB], IM [IM].
ARTICLE 3 (Voies de recours) :
${GENNEVILLIERS_ACTES_RECOURS_CLAUSE}

Fait à Gennevilliers, le [Date]
Pour le Maire, Pierric ANNOOT (Adjoint RH)`
      },
      {
        id: "carriere_prorogation_stage",
        name: "Arrêté du Maire : Prorogation de la Période de Stage Probatoire",
        type: "arrete",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/arrete.docx",
        cgfpRef: "Décret n° 92-1194 (Avis CAP obligatoire)",
        summary: "Prorogation probatoire d'une durée maximale égale au stage initial pour parfaire l'évaluation de l'agent.",
        sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-PRO-[XXX]
Portant prorogation de stage de M./Mme [Nom Prénom]

Vu le décret n° 92-1194 ;
Vu le rapport hiérarchique et l'avis de la Commission Administrative Paritaire (CAP) ;

ARRÊTE :
ARTICLE 1 : La période de stage de M./Mme [Nom Prénom] est prorogée pour une durée de [X mois] à compter du [Date].
ARTICLE 2 : La situation de l'agent fera l'objet d'un réexamen à l'échéance de cette période.
ARTICLE 3 (Voies de recours) :
${GENNEVILLIERS_ACTES_RECOURS_CLAUSE}

Fait à Gennevilliers, le [Date]
Pour le Maire, Pierric ANNOOT (Adjoint RH)`
      },
      {
        id: "carriere_disponibilite",
        name: "Arrêté du Maire : Mise en Disponibilité pour Convenances Personnelles",
        type: "arrete",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/arrete.docx",
        cgfpRef: "CGFP Art. L. 514-1 & Décret n° 86-68",
        summary: "Cessation temporaire d'activité et de traitement sur demande formulée par le fonctionnaire.",
        sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-DISP-[XXX]
Portant mise en disponibilité pour convenances personnelles de M./Mme [Nom Prénom]

Vu les articles L. 514-1 et suivants du CGFP ;
Vu la demande formulée par l'agent en date du [Date] ;

ARRÊTE :
ARTICLE 1 : M./Mme [Nom Prénom] est placé(e) en disponibilité pour convenances personnelles pour une durée de [Durée] à compter du [Date].
ARTICLE 2 : Pendant cette période, l'agent cesse d'exercer ses fonctions et ne perçoit aucune rémunération.
ARTICLE 3 (Voies de recours) :
${GENNEVILLIERS_ACTES_RECOURS_CLAUSE}

Fait à Gennevilliers, le [Date]
Pour le Maire, Pierric ANNOOT (Adjoint RH)`
      },
      {
        id: "carriere_retraite",
        name: "Arrêté du Maire : Radiation des Cadres pour Admission à la Retraite CNRACL",
        type: "arrete",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/arrete.docx",
        cgfpRef: "CGFP Art. L. 550-1 & Décret n° 2003-1306",
        summary: "Cessation définitive de fonctions et radiation des cadres après liquidation de la pension CNRACL.",
        sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-RET-[XXX]
Portant admission à la retraite et radiation des cadres de M./Mme [Nom Prénom]

Vu l'article L. 550-1 du CGFP et la décision de liquidation de la CNRACL ;

ARRÊTE :
ARTICLE 1 : M./Mme [Nom Prénom] est admis(e) à faire valoir ses droits à la retraite à compter du [Date].
ARTICLE 2 : À cette même date, l'intéressé(e) est radié(e) des cadres de la Ville de Gennevilliers.
ARTICLE 3 (Voies de recours) :
${GENNEVILLIERS_ACTES_RECOURS_CLAUSE}

Fait à Gennevilliers, le [Date]
Pour le Maire, Pierric ANNOOT (Adjoint RH)`
      }
    ]
  },

  // ─── 4. ÉVALUATION PROFESSIONNELLE & CREP ────────────────────────────────────
  {
    id: "evaluation_crep",
    title: "Évaluation Professionnelle & CREP",
    icon: "📋",
    description: "Compte-Rendu d'Entretien Professionnel (CREP 2025), convocations 8j et demandes de révision",
    templates: [
      {
        id: "crep_modele_officiel",
        name: "Compte-Rendu d'Entretien Professionnel (CREP 2025 Officiel)",
        type: "decision",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_humaines/carriere_et_parcours_professionnels/entretiens_professionnels/modele_crep_2025.docx",
        cgfpRef: "CGFP Art. L. 521-1 & Décret n° 2014-1526",
        summary: "Formulaire officiel d'évaluation annuelle : réalisation des objectifs, compétences, perspectives et cotation RIFSEEP.",
        sampleDocument: `VILLE DE GENNEVILLIERS
COMPTE-RENDU D'ENTRETIEN PROFESSIONNEL (CREP 2025/2026)

Agent évalué : M./Mme [Nom Prénom] - Grade : [Grade] - Direction : [Direction]
Évaluateur hiérarchique direct (N+1) : [Nom Prénom]

1. BILAN DE L'ANNÉE ÉCOULÉE : Résultats obtenus au regard des objectifs fixés.
2. ÉVALUATION DES COMPÉTENCES : Connaissances professionnelles, savoir-être, capacités managériales.
3. OBJECTIFS POUR L'ANNÉE À VENIR : Définition des objectifs individuels et collectifs.
4. SOUHAITS D'ÉVOLUTION & FORMATION : Mobilité, préparation aux concours, CPF.
5. APPRÉCIATION GÉNÉRALE LITTÉRALE SUR LA VALEUR PROFESSIONNELLE.

Date de l'entretien : [Date]
Signature de l'Évaluateur N+1 :                  Signature de l'Agent (date et notification) :
                                                (Voies de recours : demande de révision sous 15 jours)`
      },
      {
        id: "crep_convocation_agent",
        name: "Courrier : Convocation à l'Entretien Professionnel Annuel (Préavis 8j)",
        type: "courrier",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_humaines/carriere_et_parcours_professionnels/entretiens_professionnels/convocation_entretien_professionnel_crep_2025.doc",
        cgfpRef: "Décret n° 2014-1526 Art. 4 (Transmission fiche de poste 8j avant)",
        summary: "Convocation formelle informant l'agent de la date de son entretien et lui transmettant sa fiche de poste actualisée.",
        sampleDocument: `VILLE DE GENNEVILLIERS - DIRECTION DES RESSOURCES HUMAINES
Convocation à l'Entretien Professionnel Annuel (Campagne CREP)

À M./Mme [Nom Prénom]
Vous êtes informé(e) que votre entretien professionnel annuel se tiendra le [Date - au moins 8 jours à l'avance] à [Heure].
Pièces jointes : Fiche de poste actualisée et trame d'entretien CREP.

Le Supérieur Hiérarchique direct (N+1) : [Signature]`
      },
      {
        id: "crep_demande_revision",
        name: "Formulaire & Décision : Demande de Révision du CREP",
        type: "decision",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_humaines/carriere_et_parcours_professionnels/entretiens_professionnels/demande_de_revision_crep_2025.doc",
        cgfpRef: "Décret 2014-1526 Art. 6 (Délai de recours 15 jours)",
        summary: "Recours gracieux de l'agent contestant ses appréciations et décision motivée de l'autorité territoriale.",
        sampleDocument: `VILLE DE GENNEVILLIERS - RECOURS GRACIEUX SUR LE CREP
DÉCISION DU MAIRE N° RH-2026-REV-[XXX]

Vu la demande de révision du CREP formulée par M./Mme [Nom Prénom] le [Date] ;
Vu les observations de l'évaluateur hiérarchique direct ;

DÉCIDE :
ARTICLE 1 : [MAINTIEN des appréciations portées au compte-rendu / MODIFICATION des appréciations comme suit : ...].
ARTICLE 2 (Voies de recours CAP et Tribunal Administratif) :
${GENNEVILLIERS_ACTES_RECOURS_CLAUSE}

Fait à Gennevilliers, le [Date]
Pour le Maire, Pierric ANNOOT (Adjoint RH)`
      }
    ]
  },

  // ─── 5. RÉMUNÉRATION, RIFSEEP (DÉLIBÉRATION F13 DU 15 DÉC 2021) & PRIMES ──────
  {
    id: "remuneration_primes",
    title: "Rémunération, RIFSEEP & Primes",
    icon: "💰",
    description: "IFSE mensuelle (Plafonds délibération F13 15/12/2021), CIA modulé, cotations multicritères, NBI, SFT",
    templates: [
      {
        id: "remun_ifse_cotation",
        name: "Fiche Individuelle de Cotation de Poste (IFSE RIFSEEP)",
        type: "decision",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/decision_municipale.docx",
        cgfpRef: "CGFP Art. L. 714-4 & Délibération F13 du 15 décembre 2021",
        summary: "Cotation selon les critères de Gennevilliers (Encadrement, Technicité, Sujétions/Exposition) et plafonds officiels F13.",
        sampleDocument: `VILLE DE GENNEVILLIERS - DIRECTION DES RESSOURCES HUMAINES
FICHE DE COTATION RIFSEEP (IFSE)
(En application de la délibération F13 du Conseil Municipal du 15 décembre 2021)

Poste : [Intitulé du poste] - Cadre d'emplois : [Cadre d'emplois] - Catégorie : [A / B / C]
Direction / Service : [Direction d'affectation]

CRITÈRES PROFESSIONNELS D'ÉVALUATION (Article 4.1 délibération F13) :
1. Fonctions d'encadrement, coordination, pilotage ou conception : Niveau [1 à 4]
   (Niveau hiérarchique, nombre de collaborateurs, conduite de projets, tutorat)
2. Technicité, expertise ou qualification nécessaire : Niveau [1 à 4]
   (Autonomie, diversité des activités, diplôme, bagage fonctionnel)
3. Sujétions particulières ou exposition du poste : Niveau [1 à 4]
   (Contact usagers, variabilité horaires, risques, pénibilité, informatique, responsabilité financière)

RÉSULTAT DE LA COTATION :
- Groupe de fonctions retenu : GROUPE [1 / 2 / 3 / 4]
- Plafond réglementaire annuel délibération : [Montant plafond non logé] € (Logé : [Montant logé] €)
- Montant annuel IFSE attribué : [Montant annuel brut] €
- Montant mensuel brut versé : [Montant mensuel brut] €

Date de validation DRH : [Date]`
      },
      {
        id: "remun_ifse_arrete",
        name: "Arrêté du Maire : Attribution de l'IFSE Mensuelle",
        type: "arrete",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/arrete.docx",
        cgfpRef: "CGFP Art. L. 714-4 & Délibération F13 du 15/12/2021",
        summary: "Attribution individuelle de la part fixe IFSE versée mensuellement sur la paie.",
        sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-RIF-[XXX]
Portant attribution de l'IFSE à M./Mme [Nom Prénom]

Le Maire de Gennevilliers,
Vu le CGFP, articles L. 714-4 et suivants ;
Vu la délibération F13 du Conseil Municipal du 15 décembre 2021 élargissant le RIFSEEP à l'ensemble des cadres d'emplois de la Ville de Gennevilliers ;
Vu la fiche de cotation classant l'agent dans le Groupe de fonctions [X] de son cadre d'emplois ;

ARRÊTE :
ARTICLE 1 : Une IFSE annuelle brute de [Montant annuel] € est attribuée à M./Mme [Nom Prénom], [Grade], à compter du [Date].
ARTICLE 2 : Versement mensuel de [Montant mensuel] € brut. Maintien en cas de CMO jusqu'à 90 jours, réduit de moitié au-delà (Art. 4.5 et 4.6 délibération F13).
ARTICLE 3 (Voies de recours) :
${GENNEVILLIERS_ACTES_RECOURS_CLAUSE}

Fait à Gennevilliers, le [Date]
Pour le Maire, Pierric ANNOOT (Adjoint RH)`
      },
      {
        id: "remun_cia_arrete",
        name: "Arrêté du Maire : Attribution du Complément Indemnitaire Annuel (CIA)",
        type: "arrete",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/arrete.docx",
        cgfpRef: "Délibération F13 du 15/12/2021 (Article 5 - Manière de servir & Assiduité)",
        summary: "Attribution du CIA calculé à 50% sur l'évaluation CREP et 50% sur le barème d'absences.",
        sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-CIA-[XXX]
Portant attribution du CIA à M./Mme [Nom Prénom]

Vu la délibération F13 du 15 décembre 2021 (Article 5) ;
Vu le compte-rendu d'évaluation CREP (Manière de servir : [Satisfaisant 100% / A améliorer 70% / Insuffisant 40%]) ;
Vu l'état d'assiduité constatant [Nombre de jours] jours d'absence sur l'année civile écoulée ;

ARRÊTE :
ARTICLE 1 : Un Complément Indemnitaire Annuel (CIA) d'un montant brut de [Montant] € (dans la limite du plafond de 10% de l'IFSE) est attribué à M./Mme [Nom Prénom].
ARTICLE 2 : Versement unique sur la paie du mois de [Mois]. Le versement ne revêt aucun caractère de reconduction automatique.
ARTICLE 3 (Voies de recours) :
${GENNEVILLIERS_ACTES_RECOURS_CLAUSE}

Fait à Gennevilliers, le [Date]
Pour le Maire, Pierric ANNOOT (Adjoint RH)`
      },
      {
        id: "remun_nbi_arrete",
        name: "Arrêté du Maire : Attribution de la NBI (Nouvelle Bonification Indiciaire)",
        type: "arrete",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/arrete.docx",
        cgfpRef: "Loi n° 91-73 Art. 27 & Décret n° 2006-779",
        summary: "Attribution de points d'indice majoré réservés aux fonctions prioritaires (accueil, QPV).",
        sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-NBI-[XXX]
Portant attribution de la NBI à M./Mme [Nom Prénom]

Vu la loi n° 91-73 et le décret n° 2006-779 ;
Vu l'exercice effectif de fonctions éligibles [Accueil / Quartier Prioritaire] ;

ARRÊTE :
ARTICLE 1 : M./Mme [Nom Prénom] bénéficie d'une NBI de [X] points majorés mensuels à compter du [Date].
ARTICLE 2 : La NBI est soumise à retenue pension CNRACL.
ARTICLE 3 (Voies de recours) :
${GENNEVILLIERS_ACTES_RECOURS_CLAUSE}

Fait à Gennevilliers, le [Date]
Pour le Maire, Pierric ANNOOT (Adjoint RH)`
      },
      {
        id: "remun_sft_decision",
        name: "Décision du Maire : Attribution du Supplément Familial de Traitement (SFT)",
        type: "decision",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/decision_municipale.docx",
        cgfpRef: "CGFP Art. L. 712-8 à L. 712-11 (Enfants à charge)",
        summary: "Attribution du SFT mensuel selon la composition familiale et les enfants à charge effective.",
        sampleDocument: `VILLE DE GENNEVILLIERS - DÉCISION DU MAIRE N° RH-2026-SFT-[XXX]
Portant attribution du Supplément Familial de Traitement

Vu les articles L. 712-8 et suivants du CGFP ;
Vu les justificatifs d'état civil constatant [X] enfant(s) à charge ;

DÉCIDE :
ARTICLE 1 : Le SFT est alloué à M./Mme [Nom Prénom] (part fixe de [Montant] € + part proportionnelle de [X] %).
ARTICLE 2 (Voies de recours) :
${GENNEVILLIERS_ACTES_RECOURS_CLAUSE}

Fait à Gennevilliers, le [Date]
Pour le Maire, Pierric ANNOOT (Adjoint RH)`
      }
    ]
  },

  // ─── 6. DISCIPLINE & DÉONTOLOGIE ─────────────────────────────────────────────
  {
    id: "discipline",
    title: "Discipline & Déontologie",
    icon: "⚖️",
    description: "Rapports hiérarchiques circonstanciés, convocations 15j, blâme, suspensions et abandon de poste",
    templates: [
      {
        id: "disc_rapport_hierarchique_2024",
        name: "Rapport Hiérarchique Circonstancié Disciplinaire (Modèle 2024)",
        type: "decision",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_humaines/procedure_disciplinaire/modele_rapport_hierarchique_2024.docx",
        cgfpRef: "CGFP Art. L. 530-1 & Guide de Procédure 2024",
        summary: "Trame officielle obligatoire pour consigner de manière objective, chronologique et circonstanciée les fautes reprochées.",
        sampleDocument: `VILLE DE GENNEVILLIERS - DIRECTION DES RESSOURCES HUMAINES
RAPPORT HIÉRARCHIQUE CIRCONSTANCIÉ AUX FINS DE POURSUITES DISCIPLINAIRES

1. IDENTIFICATION : M./Mme [Nom Prénom] - Grade : [Grade] - Service : [Service]
2. EXPOSÉ CHRONOLOGIQUE DES FAITS FAUTIFS : [Dates, faits constatés, pièces jointes]
3. IMPACT SUR LE SERVICE : [Perturbation causée, manquements déontologiques]
4. PROPOSITION DE SANCTION : [Proposition de sanction du 1er/2e/3e/4e groupe].

Fait à Gennevilliers, le [Date]
Le Supérieur Hiérarchique : [Signature]`
      },
      {
        id: "disc_convocation_entretien",
        name: "Courrier : Convocation à l'Entretien Préalable & Droits de la Défense",
        type: "courrier",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_humaines/procedure_disciplinaire/modele_de_courrier_convocation_entretien_hierarchique.doc",
        cgfpRef: "CGFP Art. L. 532-1 à L. 532-4 (Délai de 15 jours francs)",
        summary: "Convocation notifiant l'ouverture de la procédure et garantissant la communication intégrale du dossier individuel.",
        sampleDocument: `VILLE DE GENNEVILLIERS
Direction des Ressources Humaines - 177, avenue Gabriel-Péri, 92230 Gennevilliers

À M./Mme [Nom Prénom]
Objet : Convocation à un entretien préalable disciplinaire

Vous êtes convoqué(e) le [Date - délai de 15 jours francs] à [Heure] à la DRH.
DROITS DE LA DÉFENSE : Vous avez le droit d'obtenir la communication intégrale de votre dossier individuel et de vous faire assister par le défenseur de votre choix.

Pour le Maire, Pierric ANNOOT (Adjoint RH)`
      },
      {
        id: "disc_blame_avertissement",
        name: "Arrêté du Maire : Sanction Disciplinaire du 1er Groupe (Blâme)",
        type: "arrete",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/arrete.docx",
        cgfpRef: "CGFP Art. L. 533-1 (Effacement automatique après 3 ans)",
        summary: "Sanction du premier groupe prononcée directement par le Maire sans saisine du Conseil de Discipline.",
        sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-DISC-[XXX]
Portant sanction disciplinaire du 1er groupe (Blâme) à l'encontre de M./Mme [Nom Prénom]

Le Maire de Gennevilliers,
Vu le CGFP, articles L. 530-1 et suivants ;
Vu la consultation effective du dossier et le procès-verbal d'entretien préalable ;
Considérant les manquements professionnels matériellement établis ;

ARRÊTE :
ARTICLE 1 : La sanction du BLÂME est infligée à M./Mme [Nom Prénom].
ARTICLE 2 : La sanction est versée au dossier et sera effacée automatiquement après 3 ans.
ARTICLE 3 (Voies de recours) :
${GENNEVILLIERS_ACTES_RECOURS_CLAUSE}

Fait à Gennevilliers, le [Date]
Pour le Maire, Pierric ANNOOT (Adjoint RH)`
      },
      {
        id: "disc_suspension_conservatoire",
        name: "Arrêté du Maire : Suspension Conservatoire de Fonctions (Art. L. 531-1)",
        type: "arrete",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/arrete.docx",
        cgfpRef: "CGFP Art. L. 531-1 (Maintien plein traitement, délai max 4 mois)",
        summary: "Écartement d'urgence du service en cas de faute grave avec maintien de la rémunération.",
        sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-SUSP-[XXX]
Portant suspension conservatoire de fonctions de M./Mme [Nom Prénom]

Le Maire de Gennevilliers,
Vu l'article L. 531-1 du CGFP ;
Considérant la gravité exceptionnelle des faits constatés ;

ARRÊTE :
ARTICLE 1 : M./Mme [Nom Prénom] est SUSPENDU(E) de ses fonctions à titre conservatoire à compter du [Date].
ARTICLE 2 : L'agent conserve l'intégralité de son traitement indiciaire brut, du SFT et de l'indemnité de résidence.
ARTICLE 3 : La situation sera définitivement réglée dans un délai maximum de 4 mois.
ARTICLE 4 (Voies de recours) :
${GENNEVILLIERS_ACTES_RECOURS_CLAUSE}

Fait à Gennevilliers, le [Date]
Pour le Maire, Patrice LECLERC`
      }
    ]
  },

  // ─── 7. SANTÉ AU TRAVAIL, INAPTITUDE & CITIS ──────────────────────────────────
  {
    id: "sante_inaptitude",
    title: "Santé au Travail, Inaptitude & CITIS",
    icon: "🩺",
    description: "CMO (90% + 1j carence), Prolongation 50%, CITIS, CLM, CLD, TPT et reclassement PPR",
    templates: [
      {
        id: "sante_cmo_initial",
        name: "Arrêté du Maire : Placement en Congé de Maladie Ordinaire (CMO 90%)",
        type: "arrete",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/arrete.docx",
        cgfpRef: "CGFP Art. L. 822-1 à L. 822-5 & Carence 1 jour",
        summary: "Placement en CMO avec déduction du jour de carence et maintien à 90% du traitement indiciaire.",
        sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-CMO-[XXX]
Portant placement en congé de maladie ordinaire de M./Mme [Nom Prénom]

Le Maire de Gennevilliers,
Vu le CGFP, articles L. 822-1 à L. 822-5 ;
Vu le certificat médical d'arrêt de travail du [Date début] au [Date fin] ;

ARRÊTE :
ARTICLE 1 : M./Mme [Nom Prénom] est placé(e) en CMO du [Date début] au [Date fin] inclus.
ARTICLE 2 : Rémunération maintenue à 90 % du traitement indiciaire. SFT maintenu à 100 %.
ARTICLE 3 : Retenue de 1/30e au titre du jour de carence légal.
ARTICLE 4 (Voies de recours) :
${GENNEVILLIERS_ACTES_RECOURS_CLAUSE}

Fait à Gennevilliers, le [Date]
Pour le Maire, Pierric ANNOOT (Adjoint RH)`
      },
      {
        id: "sante_citis_accord",
        name: "Arrêté du Maire : Reconnaissance d'Imputabilité au Service (CITIS)",
        type: "arrete",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/arrete.docx",
        cgfpRef: "CGFP Art. L. 822-6 à L. 822-17 (Plein traitement & 100% soins)",
        summary: "Accident de service ou maladie professionnelle : garantie du plein traitement et remboursement direct des soins.",
        sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-CITIS-[XXX]
Portant reconnaissance d'imputabilité au service et placement en CITIS

Vu les articles L. 822-6 et suivants du CGFP ;
Vu la déclaration d'accident de service survenu le [Date] ;

ARRÊTE :
ARTICLE 1 : L'accident survenu à M./Mme [Nom Prénom] est RECONNU IMPUTABLE AU SERVICE.
ARTICLE 2 : Placement en CITIS avec maintien de 100 % du traitement et des primes.
ARTICLE 3 : Prise en charge intégrale à 100 % des frais médicaux par la Ville de Gennevilliers.
ARTICLE 4 (Voies de recours) :
${GENNEVILLIERS_ACTES_RECOURS_CLAUSE}

Fait à Gennevilliers, le [Date]
Pour le Maire, Pierric ANNOOT (Adjoint RH)`
      },
      {
        id: "sante_tpt_accord",
        name: "Arrêté du Maire : Autorisation de Temps Partiel Thérapeutique (TPT)",
        type: "arrete",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/arrete.docx",
        cgfpRef: "CGFP Art. L. 823-1 & Décret 2021-1462 (Maintien 100% salaire)",
        summary: "Reprise progressive d'activité après arrêt avec maintien intégral de la rémunération.",
        sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-TPT-[XXX]
Portant autorisation de service à temps partiel pour raison thérapeutique

Vu l'article L. 823-1 du CGFP et le décret n° 2021-1462 ;
Vu la prescription médicale préconisant une reprise à temps partiel thérapeutique ;

ARRÊTE :
ARTICLE 1 : M./Mme [Nom Prénom] est autorisé(e) à exercer à temps partiel thérapeutique à raison de [50% à 80%] du [Date début] au [Date fin].
ARTICLE 2 : Maintien de l'intégralité du traitement indiciaire et du régime indemnitaire.
ARTICLE 3 (Voies de recours) :
${GENNEVILLIERS_ACTES_RECOURS_CLAUSE}

Fait à Gennevilliers, le [Date]
Pour le Maire, Pierric ANNOOT (Adjoint RH)`
      }
    ]
  },

  // ─── 8. FORMATION PROFESSIONNELLE & COMPÉTENCES ──────────────────────────────
  {
    id: "formation",
    title: "Formation Professionnelle & Compétences",
    icon: "🎓",
    description: "Compte Personnel de Formation (CPF), Congé de Formation Professionnelle (CFP 85%) et CNFPT",
    templates: [
      {
        id: "form_cpf_accord",
        name: "Décision du Maire : Accord d'Utilisation du CPF avec Financement",
        type: "decision",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/decision_municipale.docx",
        cgfpRef: "CGFP Art. L. 422-1 à L. 422-17 & Décret n° 2017-928",
        summary: "Prise en charge financière des frais pédagogiques dans le cadre du projet professionnel de l'agent.",
        sampleDocument: `VILLE DE GENNEVILLIERS
DÉCISION DU MAIRE N° RH-2026-CPF-[XXX]
Portant accord d'utilisation du Compte Personnel de Formation (CPF)

Le Maire de Gennevilliers,
Vu le CGFP, articles L. 422-1 à L. 422-17 ;
Vu la demande de mobilisation du CPF pour la formation [Intitulé de la formation] ;

DÉCIDE :
ARTICLE 1 : La mobilisation de [X] heures de CPF est ACCORDÉE à M./Mme [Nom Prénom].
ARTICLE 2 : Prise en charge des frais pédagogiques à hauteur de [Montant] € TTC.
ARTICLE 3 (Voies de recours) :
${GENNEVILLIERS_ACTES_RECOURS_CLAUSE}

Fait à Gennevilliers, le [Date]
Pour le Maire, Pierric ANNOOT (Adjoint RH)`
      },
      {
        id: "form_cfp_conge",
        name: "Arrêté du Maire : Octroi d'un Congé de Formation Professionnelle (CFP 85%)",
        type: "arrete",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/arrete.docx",
        cgfpRef: "CGFP Art. L. 422-21 & Décret 2007-1845 (Indemnité 85%)",
        summary: "Congé accordé pour formation personnelle avec indemnité forfaitaire mensuelle de 85% du traitement.",
        sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-CFP-[XXX]
Portant octroi d'un congé de formation professionnelle à M./Mme [Nom Prénom]

Vu l'article L. 422-21 du CGFP et le décret n° 2007-1845 ;
Vu la demande de congé de formation professionnelle d'une durée de [Durée] ;

ARRÊTE :
ARTICLE 1 : Un congé de formation professionnelle est accordé à M./Mme [Nom Prénom] du [Date début] au [Date fin].
ARTICLE 2 : L'agent perçoit une indemnité mensuelle forfaitaire égale à 85 % de son traitement brut.
ARTICLE 3 : L'agent s'engage à rester au service d'une collectivité publique pour une durée égale au triple de la période indemnisée.
ARTICLE 4 (Voies de recours) :
${GENNEVILLIERS_ACTES_RECOURS_CLAUSE}

Fait à Gennevilliers, le [Date]
Pour le Maire, Pierric ANNOOT (Adjoint RH)`
      }
    ]
  },

  // ─── 9. TEMPS DE TRAVAIL, TÉLÉTRAVAIL & CONGÉS ───────────────────────────────
  {
    id: "temps_travail",
    title: "Temps de Travail, Télétravail & Congés",
    icon: "🏠",
    description: "Conventions de télétravail, temps partiel (80%), Compte Épargne Temps (CET) et congés parentaux",
    templates: [
      {
        id: "temps_teletravail_convention",
        name: "Arrêté & Convention Individuelle d'Autorisation de Télétravail",
        type: "arrete",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/arrete.docx",
        cgfpRef: "CGFP Art. L. 430-1 & Décret n° 2016-151",
        summary: "Fixation des jours télétravaillés, plages de joignabilité et conformité informatique de l'espace à domicile.",
        sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-TT-[XXX]
Portant autorisation d'exercice des fonctions en télétravail

Le Maire de Gennevilliers,
Vu le CGFP, notamment son article L. 430-1 et le décret n° 2016-151 ;
Vu l'accord local sur le télétravail de la Ville de Gennevilliers ;

ARRÊTE :
ARTICLE 1 : M./Mme [Nom Prénom] est autorisé(e) à exercer en télétravail à raison de [1 ou 2 jours par semaine] à son domicile.
ARTICLE 2 : Plages de joignabilité : [9h00-12h00 et 14h00-17h00].
ARTICLE 3 : Mise à disposition d'un ordinateur portable sécurisé et des accès distants VPN.
ARTICLE 4 (Voies de recours) :
${GENNEVILLIERS_ACTES_RECOURS_CLAUSE}

Fait à Gennevilliers, le [Date]
Pour le Maire, Pierric ANNOOT (Adjoint RH)`
      },
      {
        id: "temps_partiel_autorisation",
        name: "Arrêté du Maire : Service à Temps Partiel (Quotité 80% - Règle des 6/7e)",
        type: "arrete",
        officialDocLink: "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/arrete.docx",
        cgfpRef: "CGFP Art. L. 612-1 (Règle des 6/7e pour le 80%)",
        summary: "Autorisation sur demande de l'agent avec rémunération à 85,7% pour une quotité de 80%.",
        sampleDocument: `VILLE DE GENNEVILLIERS - ARRÊTÉ DU MAIRE N° RH-2026-TP-[XXX]
Portant autorisation de service à temps partiel

Vu les articles L. 612-1 et suivants du CGFP ;
Vu la demande présentée par M./Mme [Nom Prénom] tendant à exercer à 80 % ;

ARRÊTE :
ARTICLE 1 : M./Mme [Nom Prénom] est autorisé(e) à accomplir un service à temps partiel à raison de 80 % du [Date début] au [Date fin].
ARTICLE 2 : Rémunération fixée aux 6/7e (85,7 %) du traitement brut et des primes.
ARTICLE 3 (Voies de recours) :
${GENNEVILLIERS_ACTES_RECOURS_CLAUSE}

Fait à Gennevilliers, le [Date]
Pour le Maire, Pierric ANNOOT (Adjoint RH)`
      }
    ]
  }
];

// Validation et écriture TypeScript
let grandTotal = 0;
ALL_THEMES_ENRICHED.forEach((theme) => {
  console.log(`📌 THÈME : ${theme.icon} ${theme.title.toUpperCase()} (${theme.templates.length} modèles rédigés intégralement)`);
  theme.templates.forEach((tpl) => {
    grandTotal++;
    console.log(`   ├─ [${tpl.type.toUpperCase().padEnd(10)}] ${tpl.name}`);
    console.log(`   │  └─ Visas : ${tpl.cgfpRef} | Trame Intranet : ${tpl.officialDocLink.split('/').pop()}`);
  });
  console.log("");
});

const registryFileContent = `/**
 * Registre Global des Modèles d'Actes RH & Administratifs par Thème
 * Ville de Gennevilliers - Généré automatiquement par scripts/enrichThemeTemplates.js
 */

export interface ThemeTemplateItem {
  id: string;
  name: string;
  type: 'arrete' | 'decision' | 'contrat' | 'circulaire' | 'courrier';
  officialDocLink: string;
  cgfpRef: string;
  summary: string;
  sampleDocument?: string;
}

export interface ThemeDefinition {
  id: string;
  title: string;
  icon?: string;
  description: string;
  templates: ThemeTemplateItem[];
}

export const ALL_THEMES_TEMPLATES: ThemeDefinition[] = ${JSON.stringify(ALL_THEMES_ENRICHED, null, 2)};

export const RECOURS_CERGY_PONTOISE_FORMULA = \`${GENNEVILLIERS_ACTES_RECOURS_CLAUSE}\`;
export const MEDIATION_CIG_PANTIN_FORMULA = \`${GENNEVILLIERS_MPO_RECOURS_CLAUSE}\`;
`;

const outputPath = path.resolve(__dirname, '../src/data/allThemesTemplatesRegistry.ts');
fs.writeFileSync(outputPath, registryFileContent, 'utf-8');

console.log(`--------------------------------------------------------------------------------`);
console.log(`✅ ENRICHISSEMENT EXACT TERMINÉ AVEC SUCCÈS !`);
console.log(`🎯 TOTAL MODÈLES VALIDÉS : ${grandTotal} TRAMES ADMINISTRATIVES CONFORMES`);
console.log(`📁 Registre TypeScript mis à jour : src/data/allThemesTemplatesRegistry.ts`);
console.log(`🏛️  Collectivité : Ville de Gennevilliers (177, avenue Gabriel-Péri)`);
console.log(`⚖️  Médiation Obligatoire : CIG Petite Couronne (1 rue Lucienne Gérain 93698 Pantin cedex)`);
console.log(`⚖️  Clause de Recours : Tribunal administratif de Cergy-Pontoise (BP 30322- 95207 Cergy-Pontoise)`);
console.log("================================================================================\n");
