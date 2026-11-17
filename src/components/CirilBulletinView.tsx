import { useState, useRef } from 'react';
import { BookOpen, Sparkles, ArrowUp } from 'lucide-react';
import {
  CalculParams,
  FichePaieAnalyseResult
} from '../services/openfiscaPayEngine';

export interface CirilBulletinViewProps {
  params: CalculParams;
  result: FichePaieAnalyseResult;
  onUpdateParam?: (key: keyof CalculParams, value: unknown) => void;
  onApplyMultiParams?: (newParams: Partial<CalculParams>) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Codes et libellés réels du bulletin Ciril « Mairie de Gennevilliers »
// (mêmes références que le document papier : 8, 9, 12, 1591, 1735, 40/41/42, 47, 1028…)
// ─────────────────────────────────────────────────────────────────────────────
const RUBRIQUES_CIRIL: Record<string, { code: string; libelle: string }> = {
  tib: { code: '8', libelle: 'Traitement de base indiciaire' },
  nbi: { code: '9', libelle: 'NBI Titulaire' },
  residence: { code: '12', libelle: 'Indemnité de Résidence Tit.' },
  sft: { code: '11', libelle: 'Supplément Familial de Traitement' },
  ppcr: { code: '1735', libelle: 'Transfert primes/points Tit.' },
  ifse: { code: '1591', libelle: 'IFSE Tit.' },
  cia: { code: '1592', libelle: 'CIA Tit.' },
  comp_csg: { code: '1860', libelle: 'Indemnité Compens. CSG Tit' },
  prime_13eme: { code: '7443', libelle: 'Primes du 13ème mois' },
  autres_primes: { code: '1690', libelle: 'Primes diverses Tit.' },
  transport: { code: '1510', libelle: 'Prise en charge transport' },
  cnracl: { code: '47', libelle: 'Retraite CNRACL Titulaire' },
  rafp: { code: '1028', libelle: 'Retraite additionnelle FP' },
  ircantec: { code: '472', libelle: 'Retraite IRCANTEC' },
  maladie: { code: '501', libelle: 'Urssaf Maladie' },
  vieillesse_plaf: { code: '502', libelle: 'Vieillesse plafonnée' },
  vieillesse_deplaf: { code: '503', libelle: 'Vieillesse déplafonnée' },
  csg_nonded: { code: '40', libelle: 'CSG Non déductible Titulaire' },
  csg_ded: { code: '41', libelle: 'CSG Déductible Titulaire' },
  crds: { code: '42', libelle: 'CRDS Non déductible Titulaire' },
  part_mutuelle: { code: '7376', libelle: 'Participation empl mut Tit' },
  cotis_mutuelle: { code: '572', libelle: 'Préfon / Territoria prévoyance' },
  pas: { code: '995', libelle: 'Impôt sur le revenu prélevé à la source' }
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPLICATIONS « GRAND PUBLIC » DE CHAQUE RUBRIQUE (compréhensibles sans jargon)
// Clé = identifiant de ligne du moteur de calcul
// simple    : l'explication en une phrase d'ami
// pourquoi  : à quoi sert la ligne / comment le montant est décidé
// verifier  : ce que l'agent doit contrôler sur son propre bulletin
// attention : le piège ou l'anomalie fréquente
// reference : la base légale
// ─────────────────────────────────────────────────────────────────────────────
const CODES_EXPLIQUES: Record<string, {
  titre: string;
  simple: string;
  pourquoi?: string;
  verifier?: string;
  attention?: string;
  reference?: string;
}> = {
  tib: {
    titre: "Votre salaire de base",
    simple: "La partie fixe de votre salaire, calculée avec votre indice (le chiffre qui résume votre grade et votre ancienneté) : indice × valeur du point. Elle est protégée par votre statut : la Ville ne peut pas la réduire.",
    pourquoi: "C'est la base de tout : l'indemnité de résidence, le supplément familial et l'essentiel de vos droits à la retraite se calculent à partir de ce montant.",
    verifier: "Comparez votre Indice Majoré avec votre dernier arrêté d'avancement. Après un changement d'échelon, la mairie doit appliquer le nouvel indice et verser un rappel de salaire.",
    attention: "Un indice oublié après un avancement ou une promotion est l'anomalie la plus fréquente : elle coûte plusieurs dizaines d'euros chaque mois.",
    reference: "Art. L. 712-1 du Code général de la fonction publique"
  },
  nbi: {
    titre: "Des points d'indice en plus (NBI)",
    simple: "Des points offerts à certains agents pour des fonctions particulières (responsabilité, accueil du public, technicité). Ils s'ajoutent à votre salaire de base et cotisent pour votre retraite.",
    pourquoi: "La NBI est attachée à des fonctions listées par décret. Elle devient définitive tant que vous occupez la fonction.",
    verifier: "Si vous exercez une fonction ouvrant droit à NBI et qu'elle n'apparaît pas sur votre bulletin, interrogez votre service RH.",
    reference: "Loi n° 91-73 du 18 janvier 1991 et décrets d'application"
  },
  residence: {
    titre: "L'indemnité de résidence (+3%)",
    simple: "Un bonus de 3 % de votre salaire de base parce que vous travaillez en Île-de-France (zone 1), où la vie est plus chère. Obligatoire pour tous les agents à Gennevilliers.",
    pourquoi: "La France compte 3 zones d'indemnité de résidence : la zone 1 (3 %) est la plus élevée. Gennevilliers y est classée.",
    verifier: "L'indemnité doit figurer sur chaque bulletin, calculée sur votre traitement indiciaire brut, NBI incluse.",
    reference: "Décret n° 2001-43 du 17 janvier 2001"
  },
  sft: {
    titre: "Le supplément familial de traitement (SFT)",
    simple: "Une aide de la mairie si vous avez des enfants à charge. Plus vous avez d'enfants, plus elle augmente ; elle dépend aussi de votre salaire de base.",
    pourquoi: "Elle s'ajoute aux prestations familiales de la CAF : part fixe + part proportionnelle au traitement, avec plancher et plafond.",
    verifier: "Signalez tout changement (naissance, enfant n'étant plus à charge) : un trop-versé peut être réclamé plus tard.",
    reference: "Décret n° 85-1148 du 4 octobre 1985"
  },
  ppcr: {
    titre: "L'abattement PPCR (retenue)",
    simple: "Une petite retenue mensuelle (entre 13,92 € et 32,42 € selon votre catégorie) créée en 2017. En échange, le point d'indice a été augmenté : c'est le « transfert primes-points », payé par tous les agents concernés.",
    pourquoi: "Le protocole PPCR a revalorisé le point d'indice en 2017. En contrepartie, une retenue sur les primes a été mise en place pour tous les agents ayant bénéficié de la revalorisation.",
    verifier: "Le montant dépend de votre catégorie hiérarchique : 13,92 € en catégorie C, 23,17 € en B, 32,42 € en A (prorata en temps partiel).",
    attention: "En cas d'absence longue (maladie, temps partiel), la retenue doit être ajustée au prorata : vérifiez-la après un changement de situation.",
    reference: "Décret n° 2016-588 du 11 mai 2016"
  },
  ifse: {
    titre: "L'IFSE Tit. : composée de 4 IFSE",
    simple: "Votre prime principale RIFSEEP (rubrique Ciril 1591). Dans la collectivité, l'IFSE Tit. est composée de 4 IFSE cumulatives : IFSE 1 (Prime de fonctions), IFSE 2 (Prime des contraintes de poste), IFSE 3 (Samedis, dimanches et astreintes) et IFSE 4 (Avantages acquis).",
    pourquoi: "L'IFSE Tit. regroupe l'ensemble de votre régime indemnitaire mensuel de base selon 4 volets complémentaires : 1. IFSE 1 (Prime de fonctions) valorisant les responsabilités, l'expertise et l'encadrement du poste ; 2. IFSE 2 (Prime des contraintes de poste) compensant la pénibilité et les sujétions particulières ; 3. IFSE 3 (Pour les samedis, dimanches et astreintes) valorisant le travail le week-end et la disponibilité d'astreinte ; 4. IFSE 4 (Pour les avantages acquis) maintenant individuellement les primes antérieures à la bascule RIFSEEP.",
    verifier: "Votre arrêté individuel RIFSEEP détaille précisément la ventilation en euros de ces 4 composantes (IFSE 1, IFSE 2, IFSE 3 et IFSE 4).",
    attention: "En cas de mobilité, de changement d'horaires ou de fin d'astreintes, seule la part correspondante (ex: IFSE 2 ou IFSE 3) peut être révisée, conformément à la délibération cadre de la Ville.",
    reference: "Décret n° 2014-513 du 20 mai 2014, Art. L. 712-1 du CGFP et délibération relative au RIFSEEP"
  },
  cia: {
    titre: "Le CIA Tit. : Complément Indemnitaire Annuel",
    simple: "Le Complément Indemnitaire Annuel (CIA Tit., rubrique Ciril 1592 ou 7610) se compose de 10 % de l'IFSE mensuelle × 12 mois (soit 1,2 mois d'IFSE). Cette somme est attribuée à 50 % sur la manière de servir et à 50 % selon le nombre de jours d'absence.",
    pourquoi: "Le CIA est la composante variable du RIFSEEP récompensant la valeur professionnelle. Il est scindé en deux volets stricts : 1. La manière de servir (50 %) évaluée au CREP (atteinte des objectifs, investissement) ; 2. L'assiduité (50 %) calculée selon le nombre de jours d'absence enregistrés sur l'année de référence.",
    verifier: "Vérifiez que la base annuelle correspond à (10 % de votre IFSE mensuelle × 12). Contrôlez l'évaluation de votre CREP et le décompte exact de vos jours d'absence appliqués par les RH (les absences protégées comme maternité ou accident de service ne doivent pas pénaliser le CIA).",
    reference: "Décret n° 2014-513 du 20 mai 2014, Art. L. 714-4 à L. 714-13 du CGFP et délibération cadre RIFSEEP de la collectivité"
  },
  comp_csg: {
    titre: "L'indemnité compensatrice CSG",
    simple: "Un petit dédommagement versé par l'employeur pour compenser la hausse de la CSG (un impôt social) intervenue en 2018.",
    pourquoi: "Quand la CSG est passée de 7,5 % à 9,2 % en 2018, cette indemnité a été créée pour limiter la perte de revenu des agents.",
    verifier: "Elle est fixe et mensuelle pour les agents éligibles : si elle disparaît sans explication, signalez-le.",
    reference: "Décret n° 2017-1889 du 30 décembre 2017"
  },
  prime_13eme: {
    titre: "Primes du 13ème mois (Juin / Novembre)",
    simple: "Composante du 13ème mois communal (Complément de rémunération, prime semestrielle ou CIA semestrialisé). Versé généralement en juin et novembre par la Ville.",
    pourquoi: "À Gennevilliers, le 13ème mois est composé de versements semestriels statutaires (code 7443 complément de rémunération, code 8443 prime semestrielle, et code 7610 complément indemnitaire annuel CIA).",
    verifier: "Vérifiez que le versement correspond bien à vos droits au prorata de votre temps de présence sur le semestre.",
    reference: "Délibérations du Conseil Municipal de Gennevilliers relatives au régime indemnitaire et au 13ème mois"
  },
  autres_primes: {
    titre: "Les autres primes",
    simple: "Heures supplémentaires, astreintes, sujétions particulières… toutes les primes ponctuelles qui s'ajoutent ce mois-ci.",
    pourquoi: "Ces montants varient d'un mois à l'autre selon vos activités réelles du mois.",
    verifier: "Conservez vos relevés d'astreintes et de heures supplémentaires : les erreurs de comptabilisation sont fréquentes."
  },
  transport: {
    titre: "Le remboursement transport (Navigo)",
    simple: "La Ville rembourse 75 % de votre abonnement de transport. C'est versé en net, sans cotisations ni impôt : c'est un plus direct sur votre compte en banque.",
    pourquoi: "L'employeur public doit couvrir 75 % du coût des abonnements de transport public de ses agents.",
    verifier: "Le remboursement est calculé au prorata de votre temps de travail. Il ne doit subir aucune retenue.",
    reference: "Décret n° 2023-812 du 21 août 2023"
  },
  cnracl: {
    titre: "Votre retraite (CNRACL)",
    simple: "Vous cotisez 11,10 % de votre salaire de base (+ NBI) pour votre future pension de fonctionnaire. La Ville y ajoute bien plus (37,65 %) : chaque bulletin enrichit votre retraite.",
    pourquoi: "La CNRACL est le régime de retraite des fonctionnaires territoriaux et hospitaliers. Vos droits se construisent trimestriellement.",
    verifier: "La cotisation porte sur le traitement + la NBI, jamais sur vos primes (elles cotisent à la RAFP).",
    attention: "Consultez votre relevé de carrière sur info-retraite.fr tous les 5 ans : un trimestre manqué se régularise plus facilement tôt.",
    reference: "Décret n° 2003-1306 du 26 décembre 2003"
  },
  ircantec: {
    titre: "Votre retraite (IRCANTEC)",
    simple: "Vous cotisez pour votre retraite complémentaire (2,80 % sous le plafond de la Sécurité sociale, 6,95 % au-delà). C'est le régime des agents contractuels.",
    pourquoi: "L'IRCANTEC complète le régime général : ensemble, ils remplacent la CNRACL des titulaires.",
    verifier: "Vérifiez que les tranches sont bien appliquées : sous le plafond PMSS à 2,80 %, au-delà à 6,95 %.",
    reference: "Convention du 23 décembre 1970 (IRCANTEC)"
  },
  maladie: {
    titre: "La Sécurité sociale (maladie)",
    simple: "Une cotisation volontairement très réduite (0,75 %) qui finance vos remboursements de santé, vos arrêts maladie et vos congés maternité.",
    pourquoi: "Depuis 2018, les agents contractuels de la fonction publique paient un taux maladie réduit, bien plus bas que le régime général.",
    reference: "Décret n° 2017-1904 du 30 décembre 2017"
  },
  vieillesse_plaf: {
    titre: "La retraite de base du régime général",
    simple: "6,90 % prélevés dans la limite du plafond mensuel de la Sécurité sociale. C'est l'équivalent de la CNRACL pour les agents contractuels.",
    pourquoi: "Cette cotisation ouvre des droits à la retraite de base de la Sécurité sociale (CNAV).",
    verifier: "La base ne peut pas dépasser le plafond mensuel de la Sécurité sociale (PMSS) : contrôlez-le si votre salaire est élevé.",
    reference: "Art. L. 131-2-1 du Code de la sécurité sociale"
  },
  vieillesse_deplaf: {
    titre: "La retraite du régime général (part déplafonnée)",
    simple: "0,40 % calculé sur la totalité de votre salaire, sans aucun plafond.",
    pourquoi: "Cette petite part complète la cotisation plafonnée : elle porte sur toute la rémunération.",
    reference: "Art. L. 131-2-1 du Code de la sécurité sociale"
  },
  rafp: {
    titre: "La retraite additionnelle (RAFP)",
    simple: "5 % pris sur vos primes (plafonné à 20 % de votre salaire de base). La Ville verse exactement la même somme que vous : à la retraite, tout cela se transforme en points qui s'ajoutent à votre pension.",
    pourquoi: "Le RAFP est le seul régime qui capitalise vos primes pour la retraite : chaque euro cotisé achète des points, versés en complément de pension.",
    verifier: "L'assiette est limitée à 20 % de votre traitement indiciaire brut annuel : au-delà, vos primes ne cotisent plus.",
    attention: "Si vos primes cotisent « à vide » (aucune retenue RAFP visible), signalez-le : c'est une perte sèche pour votre retraite.",
    reference: "Décret n° 2004-569 du 18 juin 2004"
  },
  csg_ded: {
    titre: "La CSG déductible",
    simple: "Un impôt social qui finance la Sécurité sociale et la famille. Cette partie (6,80 %) a un avantage : elle réduit votre impôt sur le revenu.",
    pourquoi: "La CSG finance aujourd'hui une grande partie de la protection sociale française (santé, famille, fonds de solidarité vieillesse).",
    verifier: "L'assiette est 98,25 % de votre rémunération (abattement de 1,75 % pour frais professionnels), plus la part patronale de votre mutuelle.",
    reference: "Art. L. 136-1 et suivants du Code de la sécurité sociale"
  },
  csg_nonded: {
    titre: "La CSG non déductible",
    simple: "L'autre part de la CSG (2,40 %) : elle ne réduit pas votre impôt et est même ajoutée à votre revenu imposable.",
    pourquoi: "La CSG se partage en deux : cette part n'offre aucun avantage fiscal, contrairement à la partie déductible.",
    verifier: "Elle figure bien dans votre net imposable (visible dans la base de l'impôt à la source).",
    reference: "Art. L. 136-1 et suivants du Code de la sécurité sociale"
  },
  crds: {
    titre: "La CRDS",
    simple: "0,50 % pour aider à rembourser la dette sociale. Elle est prélevée sur la même base que la CSG.",
    pourquoi: "Créée en 1996, cette contribution finance le remboursement de la dette de la Sécurité sociale.",
    reference: "Ordonnance n° 96-50 du 24 janvier 1996"
  },
  part_mutuelle: {
    titre: "La participation employeur (santé)",
    simple: "La part que la Ville paie à votre place pour votre mutuelle santé. Elle apparaît comme un gain : c'est de l'argent dédié à votre protection sociale.",
    pourquoi: "Dans le cadre du PSC (Protection Sociale Complémentaire), l'employeur finance une part de votre complémentaire santé labellisée.",
    verifier: "Cette part est soumise à CSG/CRDS : c'est normal de la voir dans le brut, avant les retenues.",
    reference: "Art. L. 827-1 du Code général de la fonction publique"
  },
  part_prevoyance: {
    titre: "La participation employeur (prévoyance)",
    simple: "C'est l'argent que vous donne la mairie pour vous aider à payer votre contrat de prévoyance (maintien de salaire en cas de longue maladie).",
    pourquoi: "Dans le cadre de la protection sociale complémentaire (PSC), l'employeur participe financièrement pour encourager les agents à se couvrir.",
    verifier: "Ce versement apparaît dans vos gains (soumis à CSG/CRDS) et vient alléger le coût de la retenue pour votre prévoyance figurant plus bas.",
    reference: "Art. L. 827-1 du Code général de la fonction publique"
  },
  cotis_mutuelle: {
    titre: "Votre part mutuelle / prévoyance",
    simple: "La part de votre mutuelle ou de votre épargne retraite (Préfon) qui reste à votre charge. Elle est prélevée directement sur votre net.",
    pourquoi: "Ces retenues sont facultatives ou liées à votre affiliation.",
    verifier: "En cas de double retenue (ancienne et nouvelle mutuelle), réagissez vite."
  },
  prevoyance_territoria: {
    titre: "Votre prévoyance (Territoria)",
    simple: "Il s'agit du coût de votre contrat de prévoyance Territoria. Cette couverture vous protège en cas de coup dur (maintien de salaire en cas de longue maladie, invalidité).",
    pourquoi: "C'est une adhésion facultative mais fortement recommandée : après 3 mois d'arrêt maladie, vous passez à demi-traitement. La prévoyance vient compenser cette perte de salaire.",
    verifier: "Le montant est déduit de votre net à payer. Vérifiez que la Ville participe bien au financement de cette prévoyance via le code de participation employeur."
  },
  pas: {
    titre: "L'impôt à la source (PAS)",
    simple: "Votre impôt sur le revenu, prélevé directement par la mairie pour le compte de l'administration fiscale, au taux qui vous a été communiqué. Ce taux dépend de votre situation (revenus du foyer, enfants…).",
    pourquoi: "Depuis 2020, l'employeur collecte l'impôt au moment du paiement : la DGFiP lui transmet votre taux, il ne connaît pas vos autres revenus.",
    verifier: "Comparez le taux du bulletin avec votre avis d'imposition. Après un changement de situation, vous pouvez le modifier en temps réel sur impots.gouv.fr.",
    attention: "Le taux s'applique sur le net imposable (pas sur le brut) : si le montant prélevé semble décalé, vérifiez d'abord la base.",
    reference: "Art. 204 A et suivants du Code général des impôts"
  },
  rappel: {
    titre: "Un rappel de salaire",
    simple: "Ce montant rattrape une somme qui aurait dû être versée (ou retenue) sur un mois précédent. Dans le code, le marqueur « R » signale un rappel, et le libellé indique le mois concerné.",
    pourquoi: "Les rappels suivent un avancement d'échelon, un changement de grade, une prime recalculée ou une régularisation d'absence : la mairie reconstitue ce que vous auriez dû percevoir.",
    verifier: "Repérez le mois écrit dans le libellé, puis vérifiez que le calcul de ce mois-là était bien erroné : un rappel doit pouvoir être justifié rubrique par rubrique.",
    attention: "Un rappel augmente votre net imposable du mois et donc l'impôt à la source prélevé : c'est normal, la régularisation se fait naturellement à la déclaration.",
    reference: "Art. L. 3242-1 du Code du travail (mentions obligatoires du bulletin de paie)"
  },
  fraction_t: {
    titre: "Une fraction du traitement (maladie)",
    simple: "Ce pourcentage n'est pas une somme : c'est la fraction du traitement de base versée pendant votre maladie (ex. 90 % du traitement). L'agent malade perçoit une fraction de son traitement, pas le montant intégral.",
    pourquoi: "En maladie ordinaire, le traitement est versé en fraction décroissante : plein traitement puis demi-traitement selon la durée de l'arrêt. Le libellé indique la fraction appliquée sur cette période.",
    verifier: "Vérifiez que la fraction correspond bien à votre situation (durée de l'arrêt, accident du travail = 100 %) et que la base de calcul est le traitement indiciaire brut.",
    attention: "La fraction s'applique au traitement de base : les primes et indemnités ne suivent pas automatiquement cette réduction — vérifiez leur maintien.",
    reference: "Art. L. 742-1 et suivants du Code général de la fonction publique (maladie ordinaire)"
  },
  treizieme_mois: {
    titre: "Le 13e mois (versé en deux lignes)",
    simple: "Le 13e mois apparaît sur le bulletin en deux lignes : « Complément de rémunération » et « Prime semestrielle ». Les deux montants s'additionnent pour former votre 13e mois.",
    pourquoi: "Le versement en deux lignes est une convention de paramétrage du logiciel de paie : chaque ligne est un versement du même avantage, souvent lié aux semestres travaillés.",
    verifier: "Additionnez les deux lignes : le total doit correspondre au 13e mois attendu selon votre temps de présence et votre quotité dans l'année.",
    attention: "Le 13e mois est proratisé selon la présence : une entrée ou sortie en cours d'année réduit le montant. Vérifiez le calcul si votre situation a changé.",
    reference: "Agents non titulaires — décret n° 88-145 du 11 janvier 1988 et délibération de la Ville"
  },
  indem_differentielle: {
    titre: "L'indemnité différentielle (complément SMIC)",
    simple: "Versée lorsque la grille indiciaire (traitement de base + primes statutaires) est en dessous du SMIC : la Ville complète la différence pour garantir une rémunération au moins égale au SMIC.",
    pourquoi: "La loi interdit de payer un agent en dessous du SMIC. Quand un bas d'échelon, un temps partiel ou un jeune fonctionnaire tombe sous ce plancher, cette indemnité comble l'écart.",
    verifier: "Si votre rémunération passe au-dessus du SMIC (avancement, revalorisation du point d'indice), cette indemnité doit disparaître : vérifiez qu'elle n'est pas restée indûment.",
    attention: "Cette indemnité suit l'évolution du SMIC : si le point d'indice augmente moins vite que le SMIC, elle peut perdurer sur les bas d'échelons.",
    reference: "Salaire minimum — Art. L. 2410-1 et suivants du Code du travail"
  },
  montant_net_social: {
    titre: "Le Montant Net Social",
    simple: "C'est le revenu net de référence utilisé pour le calcul de certaines aides de la CAF (Prime d'activité, RSA). Il est obligatoire depuis juillet 2023.",
    pourquoi: "L'État a standardisé ce calcul pour simplifier les démarches des allocataires. Ce montant est directement transmis par l'employeur à la CAF (via la DSN).",
    verifier: "Vous n'avez aucun calcul à faire. Si vous demandez la Prime d'activité ou le RSA, c'est exactement ce montant (souvent pré-rempli) qu'il faut déclarer.",
    attention: "Le Montant Net Social est souvent supérieur au « net à payer » : il inclut par exemple la part mutuelle payée par l'employeur et ne déduit pas l'impôt à la source.",
    reference: "Arrêté du 31 janvier 2023 fixant le modèle de bulletin de paie"
  },
  nbi_detache: {
    titre: "La NBI détachée (promotion en stage ou détachement)",
    simple: "Versée lorsque l'agent a obtenu une promotion et est en stage sur sa nouvelle catégorie, ou lorsqu'il est détaché : il continue de percevoir la NBI attachée à son ancien grade pendant toute la durée du stage ou du détachement.",
    pourquoi: "La NBI est attachée à des fonctions. Lors d'une promotion ou d'un détachement, l'agent conserve le bénéfice de la NBI acquise dans son ancien cadre d'emplois : on dit qu'elle est « détachée » sur le nouveau grade.",
    verifier: "À la fin du stage ou du détachement, la NBI détachée doit prendre fin (ou être reprise dans les nouvelles fonctions) : vérifiez qu'elle ne reste pas indûment.",
    attention: "Cette ligne cotise pour la retraite comme la NBI classique : elle doit figurer dans la base CNRACL.",
    reference: "Loi n° 91-73 du 18 janvier 1991 (dispositions relatives à la NBI)"
  },
  vacations: {
    titre: "Les vacations",
    simple: "Rémunération d'activités ponctuelles exercées en plus du service normal (enseignements, jurys, expertises, formations), payées « à la vacation ».",
    pourquoi: "Les vacations sont plafonnées et encadrées par décret : elles ne s'imputent pas sur vos congés mais elles sont soumises à cotisations.",
    verifier: "Comparez le nombre de vacations payées avec vos relevés d'activité : les erreurs de décompte sont courantes.",
    reference: "Décret n° 91-829 du 2 septembre 1991"
  },
  p_maladie: {
    titre: "Cotisation Ville : la maladie",
    simple: "La Ville verse à l'URSSAF 9,88 % de votre traitement. C'est du salaire différé : cet argent ne part pas « en charges », il finance vos remboursements de santé, vos arrêts maladie et vos congés maternité — des droits qui vous reviennent quand vous en avez besoin.",
    pourquoi: "Chaque bulletin enrichit la protection santé de tous les agents : c'est la mutualisation — on cotise quand on va bien, on bénéficie quand on va mal.",
    verifier: "L'assiette est votre traitement soumis à pension (TIB + NBI). Elle ne porte pas sur les primes.",
    reference: "Décret n° 2017-1904 du 30 décembre 2017 (taux de la branche maladie FPT)"
  },
  p_alloc_fam: {
    titre: "Cotisation Ville : les allocations familiales",
    simple: "La Ville verse 3,45 % de votre traitement à la branche famille. C'est du salaire différé : cet argent finance les prestations liées aux enfants (allocations, compléments du SFT) pour tous les agents et leurs familles.",
    pourquoi: "En fonction publique, cette cotisation est répartie en deux lignes : la part principale (3,45 %, code 44) et une part complémentaire (1,80 %, code 4082) pour atteindre le taux global de 5,25 %.",
    verifier: "Les deux lignes (44 et 4082) doivent totaliser 5,25 % de votre traitement : additionnez-les pour vérifier.",
    reference: "Branche famille — taux FPT fixé par décret"
  },
  p_alloc_fam_comp: {
    titre: "Cotisation Ville : les allocations familiales (part complémentaire)",
    simple: "Part complémentaire de 1,80 % qui, ajoutée à la part principale de 3,45 % (code 44), porte la contribution famille de la Ville à 5,25 % de votre traitement. Du salaire différé qui finance les droits famille de tous.",
    pourquoi: "Cette répartition en deux codes est une convention de paramétrage : les deux lignes financent la même branche famille.",
    verifier: "Additionnez les codes 44 et 4082 : le total doit représenter 5,25 % de l'assiette.",
    reference: "Branche famille — taux FPT fixé par décret"
  },
  p_fnal: {
    titre: "Cotisation Ville : l'aide au logement (FNAL)",
    simple: "La Ville verse 0,50 % de votre traitement au Fonds National d'Aide au Logement. C'est du salaire différé : cet argent finance les aides au logement (APL) — un droit auquel vous pouvez prétendre comme tous les salariés.",
    pourquoi: "Le FNAL est une cotisation employeur : elle ne se prélève jamais sur votre salaire. « Totalité » signifie qu'elle porte sur l'ensemble de la rémunération.",
    verifier: "Le taux dépend de la taille de l'employeur (0,10 % ou 0,50 %) : 0,50 % est le taux des employeurs de plus de 50 agents.",
    reference: "Art. L. 313-1 et suivants du Code de la construction et de l'habitation"
  },
  p_mobilite: {
    titre: "Cotisation Ville : la mobilité (transports)",
    simple: "La Ville verse 3,20 % de votre traitement au financement des transports publics d'Île-de-France. C'est du salaire différé : cette contribution finance les réseaux que vous utilisez… et le remboursement à 75 % de votre pass Navigo.",
    pourquoi: "Tous les employeurs d'Île-de-France y contribuent : cette somme ne part pas en « charges », elle revient concrètement sur votre trajet domicile-travail.",
    verifier: "Ce montant ne doit jamais apparaître en retenue : il est entièrement à la charge de la Ville.",
    reference: "Art. L. 2333-87 du Code général des collectivités territoriales (versement mobilité)"
  },
  p_autonomie: {
    titre: "Cotisation Ville : la solidarité autonomie",
    simple: "La Ville verse 0,30 % de votre traitement à la CNSA. C'est du salaire différé : cet argent finance l'autonomie des personnes âgées et en situation de handicap (EHPAD, aide à domicile, APA) — la solidarité dont vous bénéficierez peut-être un jour.",
    pourquoi: "La CSA (Contribution Solidarité Autonomie) est une cotisation employeur uniquement : elle n'apparaît jamais sur votre net.",
    reference: "Art. L. 14-10-4 du Code de la sécurité sociale (CNSA)"
  },
  p_atiacl: {
    titre: "Cotisation Ville : l'allocation temporaire d'invalidité (ATIACL)",
    simple: "La Ville verse 0,40 % de votre traitement indiciaire au régime qui finance l'Allocation Temporaire d'Invalidité. C'est du salaire différé : si un accident de service vous invalide, cette allocation s'ajoute à vos droits — la protection que ces cotisations construisent.",
    pourquoi: "L'ATI complète le traitement de l'agent invalide du fait du service (50 % ou 100 % du traitement selon le taux d'invalidité reconnu par la commission de réforme).",
    verifier: "L'assiette est le seul traitement indiciaire brut (TIB, hors NBI) : 0,40 % du TIB. Cette cotisation est entièrement patronale.",
    reference: "CNRACL / Caisse des Dépôts — régime de l'allocation temporaire d'invalidité"
  },
  p_centre_gestion: {
    titre: "Cotisation Ville : le Centre de Gestion",
    simple: "La Ville verse 0,50 % de votre traitement au Centre de Gestion de la Fonction Publique Territoriale des Hauts-de-Seine. C'est du salaire différé : cet argent finance des services mutualisés pour les agents — bourses de l'emploi, concours, formation, conseils.",
    pourquoi: "Les centres de gestion accompagnent les collectivités pour la gestion des agents non titulaires, les concours, la prévention et la formation.",
    verifier: "Cette contribution est entièrement patronale et assise sur le traitement soumis à pension.",
    reference: "Art. L. 722-1 et suivants du Code général de la fonction publique"
  },
  p_cnfpt: {
    titre: "Cotisation Ville : la formation (CNFPT)",
    simple: "La Ville verse 1 % de votre traitement au Centre National de la Fonction Publique Territoriale. C'est du salaire différé : cet argent finance votre formation professionnelle tout au long de la carrière — les stages, concours et préparations dont vous bénéficiez.",
    pourquoi: "C'est la contribution « formation » : elle finance les plans de formation, les concours et la préparation aux concours dont vous bénéficiez.",
    verifier: "La ligne 52 finance la formation classique (0,90 %).",
    reference: "Art. L. 724-1 du Code général de la fonction publique"
  },
  p_cnfpt_maj: {
    titre: "Cotisation Ville : l'alternance (CNFPT Majoration)",
    simple: "La Ville verse 0,10 % de votre traitement en plus au CNFPT pour financer spécifiquement la formation des apprentis (alternants) dans la fonction publique territoriale.",
    pourquoi: "Depuis 2022, cette cotisation additionnelle payée par l'employeur garantit que les collectivités ont les moyens de former les apprentis qu'elles accueillent.",
    verifier: "Elle s'ajoute à la cotisation CNFPT classique (ligne 52) pour former un total de 1 % versé par l'employeur.",
    reference: "Loi de finances pour 2022 (article 122)"
  },
  traitement_detache: {
    titre: "Le traitement de base détaché",
    simple: "Vous êtes fonctionnaire détaché : votre traitement suit la grille de votre grade d'origine (celui où vous avez été recruté), versé par la collectivité qui vous accueille.",
    pourquoi: "En détachement, l'agent reste rattaché à son corps d'origine : il continue d'y progresser (échelon, ancienneté) et son traitement est calculé sur cette grille, pas sur celle de son poste d'accueil.",
    verifier: "Après chaque avancement d'échelon dans votre grade d'origine, le montant doit être réajusté — vérifiez-le à la rentrée suivante.",
    attention: "Le traitement détaché est calculé au prorata de votre quotité de travail : un écart peut signaler une quotité mal appliquée.",
    reference: "Art. L. 521-1 et suivants du Code général de la fonction publique (détachement)"
  },
  cnracl_detache: {
    titre: "Votre retraite CNRACL en détachement",
    simple: "Cotisation CNRACL prélevée par la collectivité d'accueil pour un fonctionnaire détaché : 11,10 % de votre traitement détaché, auxquels s'ajoute la part employeur (37,65 %).",
    pourquoi: "En détachement, vous continuez à cotiser à votre caisse d'origine (CNRACL) comme si vous étiez resté dans votre collectivité : vos droits à pension avancent normalement.",
    verifier: "Vérifiez que ces trimestres apparaissent bien sur votre relevé de carrière CNRACL (info-retraite.fr) : en détachement, les régularisations sont plus lentes.",
    reference: "Décret n° 2003-1306 du 26 décembre 2003 & Art. L. 521-1 CGFP"
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Lignes de cotisations patronales affichées à droite du tableau (titulaires),
// avec les taux observés sur les bulletins Ciril de la Ville (2026)
// ─────────────────────────────────────────────────────────────────────────────


export default function CirilBulletinView({ params, result }: CirilBulletinViewProps) {
  // Rubrique sélectionnée : son explication « en clair » s'affiche dans le panneau de droite
  const [selectedLigneId, setSelectedLigneId] = useState<string | null>(null);
  const explicationPanelRef = useRef<HTMLDivElement>(null);
  const bulletinTableRef = useRef<HTMLDivElement>(null);

  // Sélection d'une ligne avec défilement automatique vers l'explication sur smartphone
  const handleSelectLigne = (id: string) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    setSelectedLigneId(prev => {
      // Sur mobile, si on reclique sur la même ligne, on la conserve pour afficher l'explication
      if (prev === id && isMobile) {
        return id;
      }
      return prev === id ? null : id;
    });

    if (isMobile) {
      setTimeout(() => {
        explicationPanelRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 80);
    }
  };

  const { agent, totaux, lignes } = result;

  // Format Ciril : espace des milliers + point décimal (« 3 618.24 », « -415.29 »)
  const fCiril = (v: number | undefined | null) => {
    if (v === undefined || v === null || isNaN(Number(v))) return '0.00';
    return Math.abs(Number(v)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };
  // Format FR classique pour le panneau explicatif (virgule décimale)
  const formatCur = (val: number | undefined | null) => {
    if (val === undefined || val === null || isNaN(Number(val))) return '0,00';
    return Number(val).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const isTitulaire = agent.statut !== 'contractuel';
  // Bulletin reconstruit depuis le PDF original : codes/libellés/montants copiés tels quels (zéro écart)
  const sourceReconstruite = result.source === 'reconstruite';

  // Période de paie du mois courant
  const now = new Date();
  const annee = now.getFullYear();
  const moisNum = now.getMonth() + 1;
  const dernierJour = new Date(annee, moisNum, 0).getDate();
  const moisNom = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const p2 = (n: number) => String(n).padStart(2, '0');
  const periode = `01-${p2(moisNum)}-${annee} - ${p2(dernierJour)}-${p2(moisNum)}-${annee}`;

  const selectedLigne = selectedLigneId ? (lignes || []).find(l => l.id === selectedLigneId) : null;

  // Liste d'affichage du tableau : toutes les lignes du moteur (simulation ET reconstruction),
  // les patronales étant fournies par le moteur avec leurs explications, dans l'ordre du bulletin
  const affichage = (lignes || []).filter(l => l.id !== 'pas');

  // Rendu d'une ligne de rubrique (cliquable → panneau explicatif)
  const renderLigne = (ligne: (typeof lignes)[number]) => {
    const rub = RUBRIQUES_CIRIL[ligne.id];
    const isRetenue = ligne.montantRetenue !== undefined || (ligne.montantGain !== undefined && ligne.montantGain < 0);
    const hasMontantSalarial = ligne.montantRetenue !== undefined || ligne.montantGain !== undefined;
    const montantAbsolu = isRetenue
      ? (ligne.montantGain !== undefined && ligne.montantGain < 0 ? -ligne.montantGain : ligne.montantRetenue)
      : ligne.montantGain;
    const selected = selectedLigneId === ligne.id;
    let baseAff = ligne.base !== undefined ? `${ligne.base < 0 ? '-' : ''}${fCiril(ligne.base)}` : '';
    let tauxAff = ligne.taux !== undefined ? `${ligne.taux < 0 ? '-' : ''}${Math.abs(ligne.taux).toFixed(4)}` : '';
    if ((ligne.id === 'ifse' || ligne.id === 'cia' || ligne.id === 'comp_csg') && ligne.base === undefined && !sourceReconstruite) {
      baseAff = fCiril(ligne.montantGain);
      tauxAff = '100.0000';
    }
    const montantSalarialAff = hasMontantSalarial ? `${isRetenue ? '-' : ''}${fCiril(montantAbsolu)}` : '';
    // Bulletin reconstruit : code et libellé réels du PDF ; simulation : libellés de la doctrine Ciril
    const codeAff = sourceReconstruite ? (ligne.code ?? rub?.code ?? '') : (rub?.code ?? ligne.code ?? '');
    const libelleAff = sourceReconstruite ? ligne.libelle : (rub?.libelle ?? ligne.libelle);
    return (
      <tr
        key={ligne.id}
        onClick={() => handleSelectLigne(ligne.id)}
        className={`cursor-pointer transition-all duration-150 ${
          selected
            ? 'bg-violet-100 font-semibold text-violet-950 ring-1 ring-inset ring-violet-500/60 shadow-xs'
            : 'hover:bg-violet-50/80 hover:text-violet-900'
        }`}
        title="Cliquez pour afficher l'explication détaillée de cette rubrique"
      >
        <td className="px-1.5 py-[3px] font-mono text-slate-500">{codeAff}</td>
        <td className="px-1.5 py-[3px]">{libelleAff}</td>
        <td className="px-1 py-[3px] text-right font-mono">{baseAff}</td>
        <td className="px-1 py-[3px] text-right font-mono">{tauxAff}</td>
        <td className="px-1.5 py-[3px] text-right font-mono">
          {montantSalarialAff}
        </td>
        {ligne.partPatronale !== undefined && ligne.partPatronale > 0 ? (
          <>
            <td className="px-1 py-[3px] text-right font-mono text-slate-500">
              {ligne.patronalTaux !== undefined ? ligne.patronalTaux.toFixed(4) : (ligne.id === 'cnracl' ? '37.6500' : '5.0000')}
            </td>
            <td className="px-1.5 py-[3px] text-right font-mono text-slate-500">{fCiril(ligne.partPatronale)}</td>
          </>
        ) : (
          <>
            <td className="px-1 py-[3px]" />
            <td className="px-1.5 py-[3px]" />
          </>
        )}
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────────────────
          BANNIÈRE D'ORIENTATION HAUTE VISIBILITÉ INTERACTIVE
      ───────────────────────────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 text-white shadow-xl border border-violet-400/40 flex items-start sm:items-center gap-3.5">
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md text-white shrink-0 shadow-inner flex items-center justify-center animate-bounce">
          <span className="text-2xl select-none">👆</span>
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
              <Sparkles className="w-3 h-3 text-slate-950" />
              Interactif
            </span>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white drop-shadow-xs">
              Cliquez sur une ligne du bulletin pour afficher son explication
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-violet-100 leading-relaxed max-w-3xl">
            Chaque rubrique (traitement de base, RIFSEEP IFSE/CIA, cotisations CNRACL/IRCANTEC, CSG, prélèvement à la source) s'affiche avec son calcul pas-à-pas, ses bases légales et les <strong>conseils syndicaux CFDT</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* ─────────────────────────────────────────────────────────────────────────
            LE BULLETIN DE PAIE — MISE EN FORME FIDÈLE AU DOCUMENT CIRIL ORIGINAL
        ───────────────────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-8 scroll-mt-20" ref={bulletinTableRef} id="tableau-bulletin-paie">
          <div className="bg-white text-slate-900 border border-slate-400 rounded-md shadow-xl overflow-hidden text-[11px] leading-snug">

            {/* En-tête : BULLETIN DE PAIE + employeur */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 px-4 pt-3 pb-2">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-1">BULLETIN DE PAIE</h1>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white text-[11px] sm:text-[12px] uppercase tracking-wider font-black rounded-full shadow-[0_0_18px_rgba(168,85,247,0.6)] border-2 border-white/40 cursor-default mt-1 animate-pulse">
                  <span>👆 Cliquez sur une ligne pour afficher son explication</span>
                </div>
              </div>
              <div className="text-right text-[10px] leading-snug text-slate-700">
                <p className="font-bold text-[12px]">1 Mairie de Gennevilliers</p>
                <p>177 Avenue Gabriel Péri</p>
                <p>92230 GENNEVILLIERS</p>
                <p>N° URSSAF : 117000001513122049</p>
                <p>N° SIRET : 219200367 00015 - Code APE 8411Z</p>
                <p>Convention collective : Statut de la Fonction publique</p>
              </div>
            </div>
            <div className="px-4 pb-2 text-[10px] text-slate-500 capitalize">
              {params.periode ?? moisNom}
            </div>

            {/* Cartouche d'identification (encadrés, comme l'original) */}
            <div className="mx-4 mb-2 border border-slate-500 text-[10px]">
              <div className="grid grid-cols-3 border-b border-slate-400">
                <div className="px-2 py-1 border-r border-slate-400">
                  <span className="block text-[8px] uppercase tracking-wide text-slate-500">Matricule</span>
                  <span className="font-bold">{agent.matricule || params.matricule || '—'}</span>
                </div>
                <div className="px-2 py-1 border-r border-slate-400">
                  <span className="block text-[8px] uppercase tracking-wide text-slate-500">SFT</span>
                  <span className="font-bold">{params.nbEnfantsSft ?? agent.nbEnfantsSft ?? 0}</span>
                </div>
                <div className="px-2 py-1">
                  <span className="block text-[8px] uppercase tracking-wide text-slate-500">Période de paie</span>
                  <span className="font-bold capitalize">{params.periode ?? periode}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 border-b border-slate-400">
                <div className="px-2 py-1 border-r border-slate-400">
                  <span className="block text-[8px] uppercase tracking-wide text-slate-500">N° Sécurite Sociale</span>
                  <span className="font-bold font-mono">{agent.numeroSecu || params.numeroSecu || '—'}</span>
                </div>
                <div className="px-2 py-1 border-r border-slate-400">
                  <span className="block text-[8px] uppercase tracking-wide text-slate-500">Position Administrative</span>
                  <span className="font-bold">{agent.positionAdmin || params.positionAdmin || (isTitulaire ? 'Titulaire CNRACL' : 'Contractuel IRCANTEC')}</span>
                </div>
                <div className="px-2 py-1">
                  <span className="block text-[8px] uppercase tracking-wide text-slate-500">Emploi / Grade</span>
                  <span className="font-bold">{agent.grade || params.grade || '—'}</span>
                </div>
              </div>
              <div className="grid grid-cols-3">
                <div className="px-2 py-1 border-r border-slate-400">
                  <span className="block text-[8px] uppercase tracking-wide text-slate-500">Echelon</span>
                  <span className="font-bold">{agent.echelon || params.echelon || '—'}</span>
                </div>
                <div className="px-2 py-1 border-r border-slate-400">
                  <span className="block text-[8px] uppercase tracking-wide text-slate-500">Service / Poste</span>
                  <span className="font-bold">{agent.service || params.service || agent.poste || params.poste || '—'}</span>
                </div>
                <div className="px-2 py-1">
                  <span className="block text-[8px] uppercase tracking-wide text-slate-500">Agent</span>
                  <span className="font-bold uppercase">{agent.nom || params.nomAgent || '—'}</span>
                </div>
              </div>
            </div>

            {/* Ligne des indices */}
            <div className="mx-4 mb-2 grid grid-cols-4 border border-slate-500 text-center">
              <div className="px-1 py-1 border-r border-slate-400">
                <span className="block text-[8px] uppercase tracking-wide text-slate-500">Ind. Rémun.</span>
                <span className="font-black text-[13px]">{agent.indiceRemun ?? params.indiceRemun ?? agent.indiceMajore}</span>
              </div>
              <div className="px-1 py-1 border-r border-slate-400">
                <span className="block text-[8px] uppercase tracking-wide text-slate-500">Indice Brut</span>
                <span className="font-black text-[13px]">{agent.indiceBrut ?? params.indiceBrut ?? '—'}</span>
              </div>
              <div className="px-1 py-1 border-r border-slate-400">
                <span className="block text-[8px] uppercase tracking-wide text-slate-500">Ind. Majoré</span>
                <span className="font-black text-[13px]">{agent.indiceMajore ?? params.indiceMajore}</span>
              </div>
              <div className="px-1 py-1">
                <span className="block text-[8px] uppercase tracking-wide text-slate-500">Taux Emploi</span>
                <span className="font-black text-[13px]">{agent.quotite ?? params.quotite ?? 100}</span>
              </div>
            </div>

            {/* Tableau des rubriques */}
            <div className="mx-4 mb-2 border border-slate-500">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-[8px] uppercase tracking-wide text-slate-600">
                    <th className="px-1.5 py-1 text-left font-bold border-b border-slate-400 w-10">Code</th>
                    <th className="px-1.5 py-1 text-left font-bold border-b border-slate-400">Libellé</th>
                    <th className="px-1 py-1 text-right font-bold border-b border-l border-slate-400">Base ou Nombre</th>
                    <th className="px-1 py-1 text-right font-bold border-b border-slate-400">Taux</th>
                    <th className="px-1.5 py-1 text-right font-bold border-b border-slate-400">Montant</th>
                    <th className="px-1 py-1 text-right font-bold border-b border-l border-slate-400">Taux</th>
                    <th className="px-1.5 py-1 text-right font-bold border-b border-slate-400">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {[...affichage]
                    .sort((a, b) => {
                      // Forcer le Montant Net Social (1584) à s'afficher tout en bas du bulletin avant les totaux
                      if (a.code === '1584' && b.code !== '1584') return 1;
                      if (b.code === '1584' && a.code !== '1584') return -1;
                      return 0;
                    })
                    .map(ligne => renderLigne(ligne))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-500 font-bold bg-slate-50">
                    <td className="px-1.5 py-1" colSpan={2}>Totaux</td>
                    <td className="px-1 py-1" />
                    <td className="px-1 py-1" />
                    <td className="px-1.5 py-1 text-right font-mono">{fCiril(totaux.salaireBrut)}</td>
                    <td className="px-1 py-1" />
                    <td className="px-1.5 py-1 text-right font-mono text-slate-500">{fCiril(totaux.totalCotisationsPatronales)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* NET A PAYER AVANT IMPÔT */}
            <div className="mx-4 mb-2 border border-slate-500 flex justify-between items-center px-2 py-1.5">
              <span className="font-bold uppercase text-[10px] tracking-wide">Net a payer avant impot sur le revenu</span>
              <span className="font-black font-mono text-[13px]">{fCiril(totaux.netAvantImpot)}</span>
            </div>

            {/* Impôt sur le revenu (PAS) */}
            <div className="mx-4 mb-2 border border-slate-500">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-[8px] uppercase tracking-wide text-slate-600">
                    <th className="px-1.5 py-1 text-left font-bold border-b border-slate-400">Impôt sur le revenu</th>
                    <th className="px-1 py-1 text-right font-bold border-b border-l border-slate-400">Base</th>
                    <th className="px-1 py-1 text-right font-bold border-b border-slate-400">Taux personnalisé</th>
                    <th className="px-1.5 py-1 text-right font-bold border-b border-slate-400">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={selectedLigneId === 'pas' ? 'bg-slate-200/70' : 'hover:bg-slate-100 cursor-pointer'}
                      onClick={() => handleSelectLigne('pas')}>
                    <td className="px-1.5 py-1 font-mono text-slate-500">995</td>
                    <td className="px-1 py-1 text-right font-mono">{fCiril(totaux.netFiscal)}</td>
                    <td className="px-1 py-1 text-right font-mono">{totaux.tauxPas.toFixed(2)}</td>
                    <td className="px-1.5 py-1 text-right font-mono">{totaux.montantPas > 0 ? '-' + fCiril(totaux.montantPas) : '0.00'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Cumuls & paiement */}
            <div className="mx-4 mb-2 border border-slate-500">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-[8px] uppercase tracking-wide text-slate-600">
                    <th className="px-1.5 py-1 text-left font-bold border-b border-slate-400">Cumuls</th>
                    <th className="px-1 py-1 text-right font-bold border-b border-l border-slate-400">Mensuels</th>
                    <th className="px-1 py-1 text-right font-bold border-b border-slate-400">Annuels</th>
                    <th className="px-1.5 py-1 text-left font-bold border-b border-l border-slate-400">Paiement</th>
                  </tr>
                </thead>
                <tbody className="text-mono">
                  <tr className="border-b border-slate-300">
                    <td className="px-1.5 py-1">Brut fiscal</td>
                    <td className="px-1 py-1 text-right font-mono">{fCiril(totaux.salaireBrut)}</td>
                    <td className="px-1 py-1 text-right font-mono">{fCiril((totaux.salaireBrut || 0) * 12)}</td>
                    <td className="px-1.5 py-1 border-l border-slate-300">
                      <span className="text-slate-500">Virement Magnétique</span>
                      <span className="float-right font-bold">Total des retenues</span>
                    </td>
                    <td className="px-1.5 py-1 text-right font-mono font-bold">{fCiril(totaux.totalRetenues)}</td>
                  </tr>
                  <tr>
                    <td className="px-1.5 py-1">Net fiscal</td>
                    <td className="px-1 py-1 text-right font-mono">{fCiril(totaux.netFiscal)}</td>
                    <td className="px-1 py-1 text-right font-mono">{fCiril((totaux.netFiscal || 0) * 12)}</td>
                    <td className="px-1.5 py-1 border-l border-slate-300">
                      <span className="text-slate-500">—</span>
                      <span className="float-right font-bold">Total versé par l'employeur</span>
                    </td>
                    <td className="px-1.5 py-1 text-right font-mono font-bold">{fCiril(totaux.coutGlobalEmployeur)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Net payé en euros */}
            <div className="mx-4 mb-2 border-2 border-slate-700 flex justify-between items-center px-3 py-2">
              <div>
                <span className="block text-[9px] uppercase tracking-wide text-slate-500">Avantage en nature</span>
                <span className="block text-[10px] text-slate-500">—</span>
              </div>
              <div className="text-right">
                <span className="block text-[9px] uppercase tracking-wide text-slate-500">Net payé en euros</span>
                <span className="font-black text-xl font-mono">{fCiril(totaux.netAPayer)}</span>
              </div>
            </div>

            {/* Nombre d'heures + observations */}
            <div className="mx-4 mb-2 flex justify-between items-center text-[10px] border border-slate-400 px-2 py-1">
              <span>
                Nombre d'heures : <b className="font-mono">151.67</b>
                <span className="text-slate-400"> (durée légale mensuelle)</span>
              </span>
              <span className="text-slate-400">salebulind 5.6.35</span>
            </div>
            <div className="mx-4 mb-3 border border-slate-400 px-2 py-1">
              <span className="block text-[8px] uppercase tracking-wide text-slate-500">Observations</span>
              <p className="text-[9px] uppercase text-slate-700 leading-snug">
                Dans votre intérêt et pour vous aider à faire valoir vos droits, conservez ce bulletin de paie sans limitation de durée.
              </p>
            </div>

            {/* DEBUG : Texte brut extrait du PDF */}
            <div className="mx-4 mb-4 mt-8 pt-4 border-t border-slate-200">
              <details className="text-[10px] text-slate-500">
                <summary className="cursor-pointer hover:text-slate-700 font-bold">🔍 Mode Débogage : Voir le texte brut lu par l'ordinateur</summary>
                <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-200 whitespace-pre-wrap font-mono text-[9px] max-h-96 overflow-y-auto">
                  {result.metadata?.rawText || "Aucun texte brut disponible."}
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────
            PANNEAU « EN CLAIR » : L'EXPLICATION DE LA RUBRIQUE CHOISIE
        ───────────────────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-4" ref={explicationPanelRef} id="panneau-explication-paie">
          <div className="p-5 rounded-2xl border-2 border-orange-200 dark:border-orange-900/60 bg-white dark:bg-slate-900 shadow-md sticky top-6 scroll-mt-20">
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm leading-snug">
                  Chaque ligne de votre bulletin, expliquée simplement
                </h4>
              </div>
              {selectedLigne && (
                <button
                  onClick={() => setSelectedLigneId(null)}
                  className="text-xs px-2 py-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title="Fermer l'explication"
                >
                  ✕
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Aucun jargon : comprenez d'où vient chaque euro, ligne par ligne, comme un ami vous l'expliquerait.
            </p>

            {(() => {
              if (!selectedLigne) {
                return (
                  <div className="mt-4 p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      👈 Cliquez sur une rubrique du bulletin pour lire son explication en clair ici.
                    </p>
                  </div>
                );
              }
              const expl = CODES_EXPLIQUES[selectedLigne.id] ?? CODES_EXPLIQUES[selectedLigne.id.split('_')[0]];
              const isRetenue = selectedLigne.montantRetenue !== undefined || (selectedLigne.montantGain !== undefined && selectedLigne.montantGain < 0);
              // Charge employeur pure : une part patronale sans gain ni retenue salariale (codes 43, 44, 1250…)
              const estPatronale = selectedLigne.partPatronale !== undefined && selectedLigne.montantGain === undefined && selectedLigne.montantRetenue === undefined;
              const montantAbsolu = estPatronale
                ? selectedLigne.partPatronale
                : isRetenue
                  ? (selectedLigne.montantGain !== undefined && selectedLigne.montantGain < 0 ? -selectedLigne.montantGain : selectedLigne.montantRetenue)
                  : selectedLigne.montantGain;
              const list = lignes || [];
              const idx = list.findIndex(l => l.id === selectedLigne.id);
              const goto = (delta: number) => {
                if (list.length === 0) return;
                const next = list[(idx + delta + list.length) % list.length];
                setSelectedLigneId(next.id);
              };
              const sensMontant = estPatronale ? '' : (isRetenue ? '− ' : '+ ');
              const couleurCarte = estPatronale
                ? { bord: 'border-sky-200 dark:border-sky-900', fond: 'bg-sky-50 dark:bg-sky-950/30', texte: 'text-sky-600 dark:text-sky-400', titre: 'text-sky-900 dark:text-sky-200' }
                : isRetenue
                  ? { bord: 'border-rose-200 dark:border-rose-900', fond: 'bg-rose-50 dark:bg-rose-950/30', texte: 'text-rose-600 dark:text-rose-400', titre: 'text-rose-900 dark:text-rose-200' }
                  : { bord: 'border-emerald-200 dark:border-emerald-900', fond: 'bg-emerald-50 dark:bg-emerald-950/30', texte: 'text-emerald-600 dark:text-emerald-400', titre: 'text-emerald-900 dark:text-emerald-200' };
              return (
                <>
                  <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-slate-400 gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => goto(-1)}
                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                        title="Rubrique précédente"
                      >
                        ‹ Précédente
                      </button>
                      <button
                        onClick={() => goto(1)}
                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                        title="Rubrique suivante"
                      >
                        Suivante ›
                      </button>
                    </div>
                    <span className="font-mono text-center">{idx + 1} / {list.length}</span>
                    <button
                      onClick={() => bulletinTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                      className="lg:hidden inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 rounded-lg border border-violet-200 dark:border-violet-800 hover:bg-violet-100 cursor-pointer"
                      title="Remonter au tableau du bulletin"
                    >
                      <ArrowUp className="w-3 h-3" />
                      <span>Bulletin</span>
                    </button>
                  </div>

                  <div className={`mt-3 rounded-2xl border-2 overflow-hidden ${couleurCarte.bord}`}>
                    <div className={`px-4 py-3.5 ${couleurCarte.fond}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          Rubrique {RUBRIQUES_CIRIL[selectedLigne.id]?.code ?? selectedLigne.code ?? '—'}
                        </span>
                        <span className={`font-mono font-black text-lg ${couleurCarte.texte}`}>
                          {estPatronale ? '' : sensMontant}{formatCur(montantAbsolu)} €{estPatronale ? ' (cotisation Ville)' : ''}
                        </span>
                      </div>
                      <h5 className={`font-extrabold text-base mt-1.5 ${couleurCarte.titre}`}>
                        {expl?.titre || selectedLigne.libelle}
                      </h5>
                    </div>
                    <div className="p-4 space-y-3">
                      {(selectedLigne.libelle?.trim().toUpperCase().endsWith('P2') || (selectedLigne.code && ["2008", "2009", "2012", "2591", "2860"].includes(selectedLigne.code.toString()))) && (
                        <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 text-[12px] leading-relaxed text-orange-900 dark:text-orange-200">
                          📌 <b>Ligne P2 (Prorata de situation)</b> — Cette ligne se termine par P2 car elle indique un prorata de jours suite à un changement de situation administrative intervenu en cours de mois (exemple : avancement d'échelon, changement de temps de travail...).
                        </div>
                      )}
                      {selectedLigne.moisRappel && (
                        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 text-[12px] leading-relaxed text-indigo-900 dark:text-indigo-200">
                          📌 <b>Rappel sur le mois {selectedLigne.moisRappel}</b> — ce montant régularise la paie du mois cité (marqueur « R » dans le code).
                        </div>
                      )}
                      <p className="text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">
                        {expl?.simple || selectedLigne.explicationLigne}
                      </p>

                      {/* Décomposition officielle : 4 IFSE (Strictement réservé à l'IFSE, exclu pour le CIA) */}
                      {!selectedLigne.id?.toLowerCase().includes('cia') &&
                       selectedLigne.code !== '1592' &&
                       selectedLigne.code !== '7610' &&
                       !/\bCIA\b/i.test(selectedLigne.libelle || '') &&
                       (selectedLigne.id === 'ifse' || selectedLigne.code === '1591' || selectedLigne.code === '2591' || selectedLigne.libelle?.toUpperCase().includes('IFSE')) && (
                        <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border-2 border-amber-300 dark:border-amber-800 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-amber-950 dark:text-amber-200 uppercase tracking-wide flex items-center gap-1.5">
                              <span>🏛️ Décomposition officielle : 4 IFSE</span>
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-600 text-white font-mono">
                              IFSE Tit.
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                            Dans votre collectivité, le montant de l'<strong>IFSE Tit.</strong> est composé de l'addition de <strong>4 IFSE cumulatives</strong> :
                          </p>
                          <div className="space-y-1.5 pt-0.5">
                            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 shadow-xs">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-mono">IFSE 1</span>
                                <span>Prime de fonctions</span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-tight">
                                Liée aux responsabilités, au niveau d'expertise, à la technicité et à l'encadrement selon votre groupe de fonctions RIFSEEP.
                              </p>
                            </div>

                            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-orange-200 dark:border-orange-900/60 shadow-xs">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-900 dark:text-orange-300">
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-200 font-mono">IFSE 2</span>
                                <span>Prime des contraintes de poste</span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-tight">
                                Compense les sujétions particulières, la pénibilité physique, l'exposition aux risques et contraintes spécifiques du service.
                              </p>
                            </div>

                            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 shadow-xs">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 dark:text-purple-300">
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 font-mono">IFSE 3</span>
                                <span>Samedis, dimanches & astreintes</span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-tight">
                                Rémunère les contraintes calendaires atypiques : travail régulier du week-end (samedi/dimanche) et disponibilité d'astreinte.
                              </p>
                            </div>

                            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 shadow-xs">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-mono">IFSE 4</span>
                                <span>Avantages acquis</span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-tight">
                                Clause de sauvegarde individuelle garantissant le maintien des primes et avantages acquis antérieurement au RIFSEEP.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Décomposition officielle : CIA Tit. (10% IFSE x 12 mois = 50% manière de servir + 50% jours absents) */}
                      {selectedLigne.code !== '1584' &&
                       selectedLigne.id !== 'montant_net_social' &&
                       !/social/i.test(selectedLigne.libelle || '') &&
                       !/sécurité\s*sociale/i.test(selectedLigne.libelle || '') &&
                       (selectedLigne.id === 'cia' ||
                        selectedLigne.code === '1592' ||
                        selectedLigne.code === '7610' ||
                        /\bCIA\b/i.test(selectedLigne.libelle || '') ||
                        /compl.*indemnitaire\s*annuel/i.test(selectedLigne.libelle || '')) && (
                        <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/30 border-2 border-indigo-300 dark:border-indigo-800 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-indigo-950 dark:text-indigo-200 uppercase tracking-wide flex items-center gap-1.5">
                              <span>🎯 Décomposition officielle : CIA Tit.</span>
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white font-mono">
                              Rubrique Ciril {selectedLigne.code || '1592'}
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-indigo-100/70 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-950 dark:text-indigo-200 leading-snug">
                            <strong>Formule de calcul :</strong> Le Complément Indemnitaire Annuel se compose de <strong>10 % de l'IFSE mensuelle × 12 mois</strong> (soit 1,2 mois d'IFSE annuelle).
                          </div>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                            Cette somme est attribuée selon <strong>deux critères stricts à parité (50 % / 50 %)</strong> :
                          </p>
                          <div className="space-y-1.5 pt-0.5">
                            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 shadow-xs">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300">
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 font-mono font-bold">50 %</span>
                                <span>Manière de servir</span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-tight">
                                Évaluée lors du compte-rendu d'entretien professionnel annuel (CREP) : valeur professionnelle, atteinte des objectifs fixés, investissement et implication dans les missions.
                              </p>
                            </div>

                            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 shadow-xs">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-300">
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 font-mono font-bold">50 %</span>
                                <span>Nombre de jours d'absence</span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-tight">
                                Critère d'assiduité et présence effective sur l'année de référence : abattement modulé selon le barème des jours d'absence (hors congés légaux protégés).
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {expl?.pourquoi && (
                        <div className="text-[12px] leading-relaxed text-slate-600 dark:text-slate-300">
                          <span className="font-bold text-slate-500 dark:text-slate-400">💡 Bon à savoir — </span>
                          {expl.pourquoi}
                        </div>
                      )}

                      {expl?.verifier && (
                        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-[12px] leading-relaxed text-blue-900 dark:text-blue-200">
                          ✅ <b>À vérifier sur votre bulletin — </b>{expl.verifier}
                        </div>
                      )}

                      {expl?.attention && (
                        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-[12px] leading-relaxed text-amber-900 dark:text-amber-200">
                          ⚠️ <b>Attention — </b>{expl.attention}
                        </div>
                      )}

                      {selectedLigne.base !== undefined && selectedLigne.taux !== undefined && (
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                          {selectedLigne.id === 'tib' || selectedLigne.id === 'nbi'
                            ? `Indice ${formatCur(selectedLigne.base)} × ${selectedLigne.taux.toFixed(5).replace('.', ',')} € le point → ${sensMontant}${formatCur(montantAbsolu)} €`
                            : `Base ${formatCur(selectedLigne.base)} € × Taux ${selectedLigne.taux.toLocaleString('fr-FR')} % → ${sensMontant}${formatCur(montantAbsolu)} €`}
                        </div>
                      )}

                      {!estPatronale && selectedLigne.partPatronale !== undefined && selectedLigne.partPatronale > 0 && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          En plus, la Ville verse <b className="text-slate-700 dark:text-slate-300">{formatCur(selectedLigne.partPatronale)} €</b> de sa part (cotisation employeur).
                        </p>
                      )}

                      {expl?.reference && (
                        <div className="text-[10px] text-slate-400 italic border-t border-slate-200 dark:border-slate-800 pt-2">
                          📜 Référence : {expl.reference}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}

            {selectedLigne && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 lg:hidden">
                <button
                  onClick={() => bulletinTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 rounded-xl border border-violet-200 dark:border-violet-800 hover:bg-violet-100 transition-colors cursor-pointer shadow-xs"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>↑ Remonter au bulletin de paie</span>
                </button>
              </div>
            )}

            <p className="mt-3 text-[10px] text-slate-400 italic">
              Cliquez ici ou directement sur une ligne du bulletin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
