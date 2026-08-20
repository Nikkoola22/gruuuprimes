import React, { useState, useMemo } from "react";
import confetti from "canvas-confetti";
import { STATUTORY_HR_TOOLS, queryStatutoryEngine, StatutoryQueryResult } from "../services/legifrance";
import { 
  ArrowLeft, 
  Scale, 
  Search, 
  Gavel, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  RefreshCw, 
  ChevronDown, 
  Sparkles, 
  BookOpen,
  Briefcase,
  AlertTriangle,
  UserCheck,
  Clock,
  Heart,
  FileSignature,
  UploadCloud,
  FileText,
  X,
  Building2,
  Check,
  Copy,
  ExternalLink,
  Shield,
  Stethoscope,
  Megaphone,
  Coins
} from "lucide-react";

export interface LegalQuestion {
  id: string;
  category: string;
  question: string;
  answer: string;
  decision: string;
  decisionUrl?: string;
  quizStatement: string;
  quizCorrection: boolean; // true = Vrai, false = Faux
  difficulty: "Facile" | "Moyen" | "Difficile";
}

const LEGAL_DATA: LegalQuestion[] = [
  {
    id: "Q1",
    category: "Contrats",
    question: "Peut‑on augmenter fortement la rémunération d’un agent contractuel peu de temps après son recrutement ?",
    answer: "Oui, mais seulement si l’augmentation est justifiée par une évolution réelle et contemporaine des fonctions (missions nouvelles, responsabilités accrues, encadrement, technicité) et reste cohérente avec la rémunération d’agents exerçant des fonctions équivalentes. À défaut de justification objective au moment de l’avenant, cette revalorisation constitue une erreur manifeste d’appréciation, pouvant entraîner l’annulation de l’avenant et la récupération des sommes indûment versées.",
    decision: "TA Mayotte, 29.05.2026, n°2400472",
    quizStatement: "Une collectivité peut augmenter fortement la rémunération d'un contractuel peu après son recrutement sans que ses fonctions n'évoluent.",
    quizCorrection: false,
    difficulty: "Moyen"
  },
  {
    id: "Q2",
    category: "Contrats",
    question: "Sur quel fondement peut‑on refuser de renouveler le contrat d’un agent ?",
    answer: "Le non‑renouvellement doit être fondé sur l’intérêt du service, ce qui inclut notamment les situations de conflit d’intérêts ou d’atteinte à l’impartialité. Ainsi, un agent chargé de la passation des marchés publics qui se porte lui‑même candidat à un marché de la collectivité, ou intervient sur la candidature d’une société appartenant à un proche, se place dans une situation incompatible avec ses fonctions, justifiant le refus de renouvellement de son contrat.",
    decision: "TA Réunion, 11.06.2026, n°2401136",
    quizStatement: "Le conflit d'intérêts d'un agent contractuel (ex: se porter candidat à un marché public de sa propre collectivité) constitue un motif d'intérêt général justifiant le non-renouvellement de son contrat.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q3",
    category: "Discipline",
    question: "Un comportement toxique au sein d’une équipe peut‑il justifier la révocation d’un agent ?",
    answer: "Oui, lorsque ce comportement se traduit par des propos insidieux, sarcastiques, injurieux, un dénigrement de la hiérarchie, une dégradation des relations de travail et des conséquences avérées sur la santé ou la sécurité des collègues (arrêts maladie, demandes de soutien psychologique, demandes de protection fonctionnelle). Appréciés dans leur ensemble, ces éléments constituent un manquement grave aux obligations professionnelles pouvant légalement fonder une révocation.",
    decision: "TA Strasbourg, 09.06.2026, n°2403370",
    quizStatement: "Un comportement toxique répété entraînant des conséquences sur la santé des collègues (arrêts maladie, soutien psy) peut justifier la révocation de l'agent.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q4",
    category: "Discipline",
    question: "Des faits commis dans la vie privée peuvent‑ils justifier une sanction disciplinaire ?",
    answer: "Oui, dès lors qu’ils affectent la dignité des fonctions exercées ou l’image de l’administration. Une condamnation pénale pour des violences aggravées d’une particulière gravité constitue un manquement aux obligations professionnelles. Toutefois, la sanction doit rester proportionnée et tenir compte de l’absence d’antécédents disciplinaires, des avis des instances consultatives, du soutien de l’environnement professionnel et des circonstances de la procédure, une révocation pouvant être jugée excessive dans certains cas.",
    decision: "TA Melun, 12.06.2026, n°2313282",
    quizStatement: "L'administration ne peut jamais sanctionner un agent sur le plan disciplinaire pour des faits commis en dehors du service dans sa vie privée.",
    quizCorrection: false,
    difficulty: "Moyen"
  },
  {
    id: "Q5",
    category: "Harcèlement moral",
    question: "Un acte isolé maladroit de la part d’un supérieur hiérarchique suffit‑il à caractériser un harcèlement moral ?",
    answer: "Non. Un geste isolé, même inapproprié (par exemple, afficher une photographie retouchée d’une agente dans les locaux), ne suffit pas à lui seul à caractériser un harcèlement moral en l’absence de répétition, de dégradation avérée des conditions de travail ou de réaction de l’intéressée sur une période prolongée. Le harcèlement suppose des agissements répétés ayant pour effet une dégradation des conditions de travail.",
    decision: "TA Strasbourg, 22.05.2026, n°2408088",
    quizStatement: "Un seul acte inapproprié d'un supérieur (comme afficher une photo retouchée) suffit légalement à caractériser un harcèlement moral.",
    quizCorrection: false,
    difficulty: "Moyen"
  },
  {
    id: "Q6",
    category: "Harcèlement moral",
    question: "La divulgation publique de données personnelles d’un agent peut‑elle constituer un harcèlement moral ?",
    answer: "Oui, lorsque des informations relatives à la situation professionnelle, médicale ou contentieuse d’un agent sont divulguées à plusieurs reprises dans des supports de communication (par exemple, un bulletin municipal), en dehors des besoins normaux d’information du public. De tels agissements, portant atteinte à la vie privée et au secret médical, sont constitutifs de harcèlement moral et ouvrent droit à la protection fonctionnelle.",
    decision: "TA Rouen, 12.06.2026, n°2305037",
    quizStatement: "Divulguer de manière répétée des données médicales ou professionnelles d'un agent dans le bulletin municipal peut être qualifié de harcèlement moral.",
    quizCorrection: true,
    difficulty: "Moyen"
  },
  {
    id: "Q7",
    category: "Management et encadrement",
    question: "Des propos menaçants tenus de manière répétée par un responsable de service constituent‑ils une faute disciplinaire ?",
    answer: "Oui. Un style de management marqué par des propos agressifs ou violents répétés, de nature à instaurer un climat de peur ou d’insécurité psychologique, caractérise un manquement aux obligations de respect, de dignité et de bon fonctionnement du service. Une sanction telle qu’une exclusion temporaire de fonctions, par exemple deux mois, peut être légalement justifiée.",
    decision: "TA Nîmes, 04.06.2026, n°2401796",
    quizStatement: "Un manager qui maintient un climat de peur par des menaces répétées commet une faute pouvant justifier une exclusion temporaire.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q8",
    category: "Management et encadrement",
    question: "Un cadre peut‑il être sanctionné pour des manquements commis par ses subordonnés ?",
    answer: "Oui, s’il a manqué à son obligation d’encadrement et de contrôle, par exemple en tolérant des dérives, en s’abstenant de faire respecter les règles de sécurité ou d’éthique, ou en ne rendant pas compte à sa hiérarchie. Cependant, sa responsabilité disciplinaire ne peut être engagée que pour ses propres carences managériales et non de manière automatique pour les fautes individuelles de ses agents.",
    decision: "TA Versailles, 10.06.2026, n°2402115",
    quizStatement: "Un responsable de service peut être sanctionné disciplinairement pour ses propres carences de contrôle sur ses équipes.",
    quizCorrection: true,
    difficulty: "Moyen"
  },
  {
    id: "Q9",
    category: "Management et encadrement",
    question: "L’absence de réaction d’un encadrant face à des faits graves engage‑t‑elle sa responsabilité ?",
    answer: "Oui. Un encadrant informé de faits susceptibles de constituer une infraction pénale (par exemple des vols, des violences ou des détournements) ou un manquement déontologique majeur doit impérativement réagir, protéger les victimes éventuelles et saisir sa hiérarchie. L’inaction, la passivité ou la dissimulation de tels faits constituent des fautes professionnelles graves de nature à justifier une sanction disciplinaire.",
    decision: "TA Marseille, 02.06.2026, n°2400891",
    quizStatement: "Garder le silence face à des faits graves commis dans son service constitue une faute professionnelle pour un responsable hiérarchique.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q10",
    category: "Procédure disciplinaire",
    question: "L’autorité disciplinaire est‑elle liée par la proposition du conseil de discipline ?",
    answer: "Non. Le conseil de discipline émet un avis consultatif qui ne lie pas l’autorité territoriale. Celle‑ci peut légalement prononcer une sanction plus sévère (par exemple une révocation au lieu d’une exclusion temporaire de deux ans) ou plus clémente, sous réserve que la sanction finale soit proportionnée à la gravité des fautes et ne repose pas sur une erreur manifeste d’appréciation.",
    decision: "TA Mayotte, 29.05.2026, n°2400388",
    quizStatement: "Le maire ou président de collectivité est légalement obligé de suivre la sanction exacte proposée par le conseil de discipline.",
    quizCorrection: false,
    difficulty: "Moyen"
  },
  {
    id: "Q11",
    category: "Promotion interne",
    question: "L’inscription sur une liste d’aptitude donne‑t‑elle un droit à nomination ?",
    answer: "Non. L’inscription sur une liste d’aptitude confère seulement une vocation à être nommé, mais l’autorité territoriale conserve un pouvoir discrétionnaire pour pourvoir ou non les emplois vacants. L’agent ne dispose d’aucun droit acquis à être promu sur un poste précis.",
    decision: "TA Nice, 12.06.2026, n°2401550",
    quizStatement: "Être inscrit sur une liste d'aptitude oblige l'employeur territorial à nommer automatiquement l'agent sur le nouveau grade.",
    quizCorrection: false,
    difficulty: "Facile"
  },
  {
    id: "Q12",
    category: "Recrutement",
    question: "Une collectivité peut‑elle recruter un contractuel sur un emploi permanent sans publier préalablement l’offre d’emploi ?",
    answer: "Non. Le recrutement d’un agent contractuel sur un emploi permanent est soumis au respect d’une procédure de publicité préalable garantissant l’égal accès aux emplois publics. L’absence de publication légale de l’avis de vacance entache la procédure d’irrégularité et peut entraîner l’annulation du contrat.",
    decision: "TA Bordeaux, 05.06.2026, n°2401882",
    quizStatement: "Une collectivité peut embaucher un contractuel en CDI ou CDD sur un poste permanent sans obligation de publier une offre d'emploi.",
    quizCorrection: false,
    difficulty: "Facile"
  },
  {
    id: "Q13",
    category: "Recrutement",
    question: "L’administration est‑elle tenue de motiver le rejet d’une candidature à un recrutement ?",
    answer: "Non, en principe. Les décisions portant rejet d’une candidature à un emploi public ne figurent pas au nombre de celles qui doivent être obligatoirement motivées, sauf dispositions textuelles contraires ou demande expresse dans le cadre de certaines procédures formalisées. Toutefois, les motifs du rejet ne doivent pas être discriminatoires ni entachés d’erreur de droit.",
    decision: "TA Nancy, 11.06.2026, n°2400923",
    quizStatement: "L'employeur public doit obligatoirement rédiger une lettre de motivation juridique détaillée pour chaque candidature rejetée.",
    quizCorrection: false,
    difficulty: "Difficile"
  },
  {
    id: "Q14",
    category: "Relations intimes",
    question: "Des relations intimes consenties entre collègues au sein d’une équipe peuvent‑elles être sanctionnées ?",
    answer: "En principe non, car la vie privée est protégée. Toutefois, si cette relation a des répercussions directes et négatives sur le fonctionnement du service, crée des tensions, du favoritisme avéré, ou porte atteinte à la dignité des fonctions (par exemple sur le lieu et le temps de travail), elle peut justifier une mesure d’organisation du service (mutation dans l’intérêt du service) ou, en cas de comportement inapproprié sur le lieu de travail, une sanction disciplinaire.",
    decision: "TA Strasbourg, 09.06.2026, n°2403370",
    quizStatement: "Une relation amoureuse entre agents peut justifier une sanction si elle perturbe gravement le service ou s'exerce pendant le temps de travail.",
    quizCorrection: true,
    difficulty: "Moyen"
  },
  {
    id: "Q15",
    category: "Stupéfiants",
    question: "Des faits liés aux stupéfiants commis dans le cadre du service peuvent‑ils justifier une révocation ?",
    answer: "Oui. Le fait de s’approprier des stupéfiants découverts dans le cadre professionnel, de les dissimuler dans un outil de travail, de ne pas informer la hiérarchie alors que des tiers exercent des pressions sur un collègue, puis de proposer la vente de ces produits constitue un manquement extrêmement grave aux obligations de probité, de loyauté et de sécurité. Compte tenu des risques encourus par le service et les agents, la révocation n’est pas disproportionnée.",
    decision: "TA Nîmes, 11.06.2026, n°2404599",
    quizStatement: "Détourner des stupéfiants saisis dans le cadre du service pour tenter de les revendre justifie légalement la révocation de l'agent.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q16",
    category: "Suspension",
    question: "Dans quelles conditions peut‑on suspendre un agent contractuel à titre conservatoire ?",
    answer: "La suspension conservatoire est possible dès lors que l’administration dispose d’éléments suffisamment précis et vraisemblables laissant présumer une faute grave, même avant l’issue des poursuites éventuelles. Par exemple, l’utilisation non autorisée de la signature électronique de l’autorité territoriale pour valider de nombreux mandats d’un montant important, étayée par des pièces comptables et des échanges de courriels, justifie légitimement une mesure de suspension.",
    decision: "TA Réunion, 11.06.2026, n°2500135",
    quizStatement: "L'administration ne peut suspendre un agent contractuel qu'une fois sa culpabilité pénalement démontrée par un tribunal.",
    quizCorrection: false,
    difficulty: "Moyen"
  },
  {
    id: "Q17",
    category: "Temps de travail",
    question: "Une collectivité peut‑elle maintenir des jours de congés supplémentaires qui font descendre la durée de travail en dessous de 1 607 heures ?",
    answer: "Non. Depuis la réforme imposant le respect d’une durée annuelle de travail de 1 607 heures, les régimes dérogatoires (congés supplémentaires, jours d’ancienneté…) ne peuvent être maintenus que s’ils sont compensés par une organisation du temps de travail permettant d’atteindre ce plafond. Une délibération qui maintient des congés entraînant un temps de travail inférieur à 1 607 heures devient illégale et doit être abrogée, sans créer de droits acquis.",
    decision: "CAA Toulouse, 06.05.2026, n°24TL00570",
    quizStatement: "Une collectivité territoriale peut légalement maintenir des jours de congés extra-légaux ramenant le temps de travail annuel en dessous de 1 607 heures.",
    quizCorrection: false,
    difficulty: "Facile"
  },
  {
    id: "Q18",
    category: "Temps de travail",
    question: "L’administration peut‑elle refuser un temps partiel au seul motif de contraintes budgétaires ?",
    answer: "Non. Le refus d’un temps partiel ne peut être fondé que sur les nécessités de la continuité et du fonctionnement du service, ce qui suppose une démonstration concrète de l’impact de l’absence partielle sur l’organisation. De simples considérations budgétaires, non reliées à des contraintes d’organisation spécifiques, ne suffisent pas à justifier légalement un refus.",
    decision: "TA Paris, 09.06.2026, n°2402330",
    quizStatement: "L'administration peut valablement refuser une demande de temps partiel en invoquant simplement des contraintes budgétaires globales.",
    quizCorrection: false,
    difficulty: "Moyen"
  },
  {
    id: "Q19",
    category: "Congé de maladie",
    question: "La participation d’un agent placé en congé de maladie ordinaire à des rallyes automobiles peut-elle, à elle seule, justifier une sanction disciplinaire ?",
    answer: "Non. Une activité sportive exigeante exercée pendant un CMO n’est pas fautive lorsqu’elle est médicalement autorisée et qu’elle s’inscrit dans un parcours thérapeutique favorisant la guérison. En l’espèce, les certificats médicaux établissaient que les rallyes automobiles participaient à la prise en charge du syndrome dépressif de la commandante de sapeurs-pompiers. L’administration ne pouvait donc déduire de cette seule activité une incompatibilité avec le congé de maladie ni prononcer une sanction sur ce motif.",
    decision: "TA Nancy, 7 juillet 2026, n° 2403121",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA54/DTA_2403121_20260707",
    quizStatement: "Participer à des rallyes automobiles pendant un congé de maladie ordinaire médicalement autorisés dans le cadre thérapeutique justifie une sanction disciplinaire.",
    quizCorrection: false,
    difficulty: "Moyen"
  },
  {
    id: "Q20",
    category: "Contrats",
    question: "Une collectivité peut-elle prévoir une nouvelle période d’essai pour un agent déjà employé lorsqu’elle lui propose un nouveau contrat ?",
    answer: "Oui, à condition que le nouveau contrat porte sur des fonctions réellement différentes de celles précédemment exercées. Le fait que l’employeur demeure identique ne fait pas obstacle à une nouvelle période d’essai si le nouvel emploi implique des compétences, responsabilités ou aptitudes distinctes à évaluer. Dans cette affaire, le passage d’architecte en cybersécurité à directeur des systèmes d’information impliquait notamment des missions d’encadrement et de pilotage. La collectivité pouvait donc légalement prévoir, renouveler, puis rompre le contrat au terme de cette période d’essai en raison de carences managériales.",
    decision: "CAA Paris, 4 août 2026, n° 25PA00141",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/CAA75/DCA_25PA00141_20260804",
    quizStatement: "Une collectivité peut fixer une nouvelle période d'essai à un agent déjà en poste si le nouveau contrat porte sur des fonctions et responsabilités réellement distinctes.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q21",
    category: "Cumul d’activités",
    question: "Les fonctions d’assesseur d’un tribunal pour enfants sont-elles soumises aux règles de cumul d’activités applicables aux agents publics ?",
    answer: "Oui. Cette activité juridictionnelle exercée auprès du service public de la justice judiciaire constitue une activité accessoire d’intérêt général donnant lieu au versement d’indemnités. Elle nécessite donc, en principe, une autorisation préalable de cumul.",
    decision: "TA Réunion, 3 juillet 2026, n° 2501810",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA101/DTA_2501810_20260703",
    quizStatement: "Les fonctions d'assesseur auprès d'un tribunal pour enfants exercées par un agent public nécessitent une autorisation préalable de cumul d'activités.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q22",
    category: "Cumul d’activités",
    question: "L’absence d’autorisation préalable pendant seize ans pour exercer les fonctions d’assesseur d’un tribunal pour enfants justifie-t-elle une exclusion temporaire de trois mois ?",
    answer: "Non, pas dans les circonstances de l’espèce. Bien que l’agent ait méconnu les règles de cumul, son employeur connaissait depuis longtemps cette activité, lui accordait des autorisations spéciales d’absence pour assister aux audiences et entretenait ainsi une confusion sur la régularité de sa situation. En l’absence d’incidence démontrée sur le fonctionnement du service, l’exclusion temporaire de trois mois a été jugée disproportionnée.",
    decision: "TA Réunion, 3 juillet 2026, n° 2501810",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA101/DTA_2501810_20260703",
    quizStatement: "Une exclusion de 3 mois pour cumul sans autorisation préalable est proportionnée même si l'employeur accordait des autorisations d'absence en connaissant l'activité depuis 16 ans.",
    quizCorrection: false,
    difficulty: "Moyen"
  },
  {
    id: "Q23",
    category: "Discipline",
    question: "Des troubles cognitifs et comportementaux doivent-ils être pris en compte pour apprécier la proportionnalité d’une sanction disciplinaire ?",
    answer: "Oui. Ils peuvent atténuer l’appréciation de la gravité des faits et conduire le juge à censurer une sanction excessive. Dans cette affaire, malgré la sortie d’un couteau devant un collègue ainsi que des insultes et menaces, les troubles de l’agent affectaient sa capacité à entretenir des relations sociales normales. Compte tenu également de sa prise de conscience du caractère inadapté de son comportement, la révocation a été jugée disproportionnée.",
    decision: "TA Grenoble, 27 juillet 2026, n° 2409440",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA38/DTA_2409440_20260727",
    quizStatement: "Les troubles cognitifs ou comportementaux d'un agent peuvent atténuer la gravité des faits et rendre une révocation disproportionnée.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q24",
    category: "Discipline",
    question: "La détresse psychologique d’un agent, marquée notamment par des tentatives de suicide, exclut-elle nécessairement toute sanction disciplinaire ?",
    answer: "Non. Une situation de détresse psychologique ne fait obstacle à une sanction que si elle révèle une absence totale de discernement au moment des faits. En l’espèce, le brigadier-chef principal avait conduit son véhicule personnel en état d’ébriété et de manière dangereuse, en dehors du service, avant d’être condamné. Ces faits ont été regardés comme portant atteinte au devoir de dignité et d’exemplarité, compte tenu notamment de ses fonctions. Malgré ses bons états de service et ses difficultés personnelles, sa révocation a été jugée proportionnée.",
    decision: "TA Strasbourg, 28 juillet 2026, n° 2405266",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA67/DTA_2405266_20260728",
    quizStatement: "La détresse psychologique d'un agent exclut automatiquement toute sanction disciplinaire, quel que soit son niveau de discernement au moment des faits.",
    quizCorrection: false,
    difficulty: "Moyen"
  },
  {
    id: "Q25",
    category: "Droit syndical",
    question: "Un représentant syndical peut-il critiquer, par courriel interne, le recours au bénévolat lors de campagnes de vaccination ?",
    answer: "Oui, lorsque les propos restent exempts d’injures, de propos véhéments ou d’excès. L’ironie employée par le représentant syndical et sa suggestion de recruter du personnel rémunéré relevaient de la liberté d’expression attachée à l’exercice de son mandat syndical.",
    decision: "TA Nantes, 10 juillet 2026, n° 2501948",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA44/DTA_2501948_20260710",
    quizStatement: "Un représentant syndical peut critiquer avec ironie le recours au bénévolat dans un courriel interne au titre de la liberté d'expression syndicale.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q26",
    category: "Droit syndical",
    question: "Des propos inappropriés envers une collègue peuvent-ils, à eux seuls, justifier un abaissement d’échelon ?",
    answer: "Pas nécessairement. Dans cette affaire, les propos tenus au sujet des convictions religieuses d’une collègue et la mise en cause publique de celle-ci constituaient bien des manquements. Toutefois, les autres griefs invoqués par l’administration n’étaient pas établis ou relevaient de la liberté d’expression syndicale. L’abaissement d’échelon a donc été jugé excessif au regard des seuls faits restant établis.",
    decision: "TA Nantes, 10 juillet 2026, n° 2501948",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA44/DTA_2501948_20260710",
    quizStatement: "Un abaissement d'échelon est automatiquement justifié dès lors qu'un manquement verbal isolé est constaté à l'encontre d'un agent.",
    quizCorrection: false,
    difficulty: "Moyen"
  },
  {
    id: "Q27",
    category: "Élections",
    question: "Le directeur d’un groupement d’intérêt public dont une commune est membre est-il inéligible au conseil municipal de cette commune ?",
    answer: "Non, pas du seul fait de ses fonctions de directeur du GIP. Les fonctions de direction d’un GIP ne figurent pas, en elles-mêmes, parmi celles entraînant l’inéligibilité prévue par l’article L. 231 du code électoral. En l’espèce, le groupement réunissait également d’autres personnes morales que les seules personnes publiques visées par cet article : les fonctions de directeur ne relevaient donc pas du champ de l’inéligibilité.",
    decision: "CE, 30 juillet 2026, n° 515681",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/CE/DCE_515681_20260730",
    quizStatement: "Le directeur d'un Groupement d'Intérêt Public (GIP) est automatiquement inéligible au conseil municipal d'une commune membre.",
    quizCorrection: false,
    difficulty: "Difficile"
  },
  {
    id: "Q28",
    category: "Harcèlement moral",
    question: "La privation progressive des fonctions d’encadrement d’un chef de service peut-elle caractériser un harcèlement moral ?",
    answer: "Oui. Un supérieur hiérarchique qui intervient directement auprès de l’équipe d’un chef de service, participe ou organise des réunions sans l’associer et répond directement aux agents placés sous son autorité peut créer une confusion durable dans la chaîne hiérarchique. Si ces agissements provoquent une mise à l’écart du chef de service et une perte de légitimité auprès de son équipe, ils sont susceptibles de caractériser un harcèlement moral.",
    decision: "CAA Versailles, 9 juillet 2026, n° 24VE03430",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/CAA78/DCA_24VE03430_20260709",
    quizStatement: "Court-circuiter systématiquement un chef de service auprès de son équipe et l'exclure des réunions peut constituer un harcèlement moral.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q29",
    category: "Harcèlement moral",
    question: "Quels droits la situation de harcèlement moral par éviction hiérarchique peut-elle ouvrir à l’agent victime ?",
    answer: "Lorsque le harcèlement moral est caractérisé, l’agent peut bénéficier de la protection fonctionnelle. Ces agissements sont également susceptibles d’engager la responsabilité de l’établissement public employeur et d’ouvrir droit à indemnisation du préjudice subi.",
    decision: "CAA Versailles, 9 juillet 2026, n° 24VE03430",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/CAA78/DCA_24VE03430_20260709",
    quizStatement: "Un agent victime de harcèlement moral par mise à l'écart hiérarchique a droit à la protection fonctionnelle et à l'indemnisation de son préjudice.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q30",
    category: "Imputabilité au service",
    question: "Des difficultés personnelles suffisent-elles à détacher du service une tentative de suicide survenue sur le lieu et pendant le temps de travail ?",
    answer: "Non. L’administration doit établir une circonstance particulière suffisamment caractérisée pour renverser le lien avec le service. La seule existence de difficultés personnelles, ou le fait que l’administration ait antérieurement accordé des mobilités à l’agent, ne suffit pas.",
    decision: "TA Toulouse, 23 juillet 2026, n° 2305361",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA31/DTA_2305361_20260723",
    quizStatement: "La seule existence de difficultés personnelles dans la vie privée de l'agent suffit à exonérer l'administration de l'imputabilité au service d'un acte survenu sur le lieu de travail.",
    quizCorrection: false,
    difficulty: "Moyen"
  },
  {
    id: "Q31",
    category: "Imputabilité au service",
    question: "Une tentative de suicide commise avec l’arme de service, dans un véhicule de service situé dans l’enceinte d’un commissariat, peut-elle être reconnue imputable au service ?",
    answer: "Oui, lorsque l’acte survient dans le temps et le lieu du service, dans un contexte de difficultés professionnelles, et qu’aucun élément ne démontre un état dépressif antérieur ou une cause personnelle détachable du service. Le refus de reconnaissance de l’imputabilité a alors été jugé entaché d’une erreur d’appréciation.",
    decision: "TA Toulouse, 23 juillet 2026, n° 2305361",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA31/DTA_2305361_20260723",
    quizStatement: "Un acte dramatique survenu sur le lieu de travail avec du matériel de service dans un contexte professionnel tendu bénéficie de la présomption d'imputabilité au service.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q32",
    category: "Management",
    question: "La révocation d’un chef de service peut-elle être proportionnée en cas de management toxique ?",
    answer: "Oui. La révocation peut être légalement prononcée lorsque les pratiques managériales sont graves, répétées et ont durablement perturbé le fonctionnement du service ou dégradé les conditions de travail et la santé des agents. En l’espèce, étaient notamment établis des abus de pouvoir, des propos humiliants ou insultants, des pressions répétées, une surveillance abusive, des manœuvres d’isolement des agents et des discriminations.",
    decision: "TA Toulouse, 28 juillet 2026, n° 2400224",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA31/DTA_2400224_20260728",
    quizStatement: "Un management toxique caractérisé par des humiliations, pressions et discriminations répétées peut légalement justifier la révocation d'un cadre.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q33",
    category: "Management",
    question: "L’absence de prise de conscience de la gravité des comportements managériaux peut-elle être prise en compte pour la sanction ?",
    answer: "Oui. Le positionnement hiérarchique de l’agent, ses responsabilités d’encadrement, les conséquences de ses agissements sur les équipes et son absence de remise en question sont des éléments pertinents pour apprécier la proportionnalité de la sanction. Dans cette affaire, ils justifiaient la révocation.",
    decision: "TA Toulouse, 28 juillet 2026, n° 2400224",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA31/DTA_2400224_20260728",
    quizStatement: "L'absence totale de remise en question d'un cadre face à ses dérives managériales est un facteur aggravant pour la sévérité de la sanction.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q34",
    category: "Mutation d’office",
    question: "Une mutation d’office sans baisse de rémunération ni diminution de responsabilités peut-elle être une sanction disciplinaire déguisée ?",
    answer: "Oui. Une décision d’affectation peut être requalifiée en sanction disciplinaire déguisée si elle bouleverse de manière significative les conditions de travail ou de vie de l’agent et intervient dans un contexte révélant une intention disciplinaire.",
    decision: "TA Mayotte, 3 juillet 2026, n° 2500418",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA107/DTA_2500418_20260703",
    quizStatement: "Une mutation d'office qui bouleverse la vie d'un agent dans un contexte répressif peut être annulée comme sanction disciplinaire déguisée, même sans perte de salaire.",
    quizCorrection: true,
    difficulty: "Moyen"
  },
  {
    id: "Q35",
    category: "Mutation d’office",
    question: "Le déplacement d’un agent de La Réunion vers Mayotte, plus de 1 400 km plus loin, après une exclusion temporaire, peut-il constituer une sanction déguisée ?",
    answer: "Oui. Même si le poste est similaire et que la rémunération est maintenue, une mutation obligeant l’agent à quitter un lieu de résidence et de travail occupé depuis plus de quarante ans, quelques semaines après une exclusion temporaire, constitue un bouleversement substantiel. Elle a donc été regardée comme une mesure disciplinaire déguisée. Or, une telle mesure ne figurant pas parmi les sanctions statutaires applicables aux fonctionnaires territoriaux, elle était dépourvue de base légale.",
    decision: "TA Mayotte, 3 juillet 2026, n° 2500418",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA107/DTA_2500418_20260703",
    quizStatement: "Déplacer un agent territorial à 1 400 km de sa résidence habituelle suite à une sanction est illégal et constitue une sanction déguisée non prévue par le statut.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q36",
    category: "Obéissance hiérarchique",
    question: "Un agent peut-il refuser les missions figurant sur sa fiche de poste au motif qu’elles impliquent de travailler avec un service connexe ?",
    answer: "Non. L’agent ne peut pas sélectionner les missions qu’il accepte d’exercer parmi celles relevant de ses attributions. Lorsqu’une fiche de poste prévoit une collaboration avec un autre service, le refus catégorique de tout rapport avec ce service constitue un manquement aux obligations professionnelles.",
    decision: "TA Clermont-Ferrand, 27 juillet 2026, n° 2302898",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA63/DTA_2302898_20260727",
    quizStatement: "Un fonctionnaire peut légalement refuser d'accomplir une tâche inscrite sur sa fiche de poste s'il est en désaccord avec le service partenaire.",
    quizCorrection: false,
    difficulty: "Facile"
  },
  {
    id: "Q37",
    category: "Obéissance hiérarchique",
    question: "Le refus répété d’accomplir certaines tâches peut-il justifier un blâme ?",
    answer: "Oui. Lorsque ce refus contraint les collègues à réaliser les missions de l’agent dans des délais difficiles ou dégrade le fonctionnement du service, il peut justifier une sanction de premier groupe telle qu’un blâme.",
    decision: "TA Clermont-Ferrand, 27 juillet 2026, n° 2302898",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA63/DTA_2302898_20260727",
    quizStatement: "Le refus répété d'accomplir certaines missions obligeant les collègues à surcompenser justifie légalement un blâme.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q38",
    category: "Protection fonctionnelle",
    question: "L’administration est-elle liée par une décision de relaxe du juge pénal lorsqu’elle examine une demande de protection fonctionnelle ?",
    answer: "Non. L’administration doit exercer son propre pouvoir d’appréciation. Elle ne peut pas se borner à déduire d’une relaxe pénale que les faits sont étrangers au service, en particulier lorsque le juge pénal ne s’est pas prononcé sur le lien entre les faits et le service.",
    decision: "TA Strasbourg, 26 mai 2026, n° 2405851",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA67/DTA_2405851_20260526",
    quizStatement: "L'administration est obligée de refuser la protection fonctionnelle dès lors que l'auteur présumé des faits a été relaxé au pénal.",
    quizCorrection: false,
    difficulty: "Moyen"
  },
  {
    id: "Q39",
    category: "Protection fonctionnelle",
    question: "La relaxe d’un supérieur poursuivi pour harcèlement sexuel et violences permet-elle de considérer automatiquement que le conflit avec une subordonnée relève d’une relation purement privée ?",
    answer: "Non. Lorsque les faits opposent un chef de service à une agente placée sous son autorité, l’administration doit apprécier concrètement leur lien avec le service. Elle ne peut pas inférer de la seule relaxe que le litige se situe nécessairement dans le champ d’une relation intime, personnelle et étrangère au travail.",
    decision: "TA Strasbourg, 26 mai 2026, n° 2405851",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA67/DTA_2405851_20260526",
    quizStatement: "La relaxe pénale d'un supérieur pour harcèlement n'empêche pas l'administration de reconnaître que les faits sont liés au service pour accorder la protection fonctionnelle.",
    quizCorrection: true,
    difficulty: "Moyen"
  },
  {
    id: "Q40",
    category: "Protection fonctionnelle",
    question: "La production par l’administration d’un document contesté dans le cadre d’un contentieux ouvre-t-elle droit, pour l’agent, à la protection fonctionnelle ?",
    answer: "Non, en principe. La production d’une pièce en défense dans une procédure contentieuse, même si l’agent estime cette pièce irrégulière ou mensongère, ne constitue pas nécessairement une attaque dirigée contre lui en sa qualité d’agent public. En l’espèce, la fiche de poste contestée avait été produite pour les besoins de la défense de l’employeur dans un litige indemnitaire : elle ne justifiait donc pas l’octroi de la protection fonctionnelle.",
    decision: "TA Versailles, 27 juillet 2026, n° 2406299",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA78/DTA_2406299_20260727",
    quizStatement: "Un agent peut obtenir la protection fonctionnelle contre son propre employeur qui produit une pièce de défense qu'il conteste lors d'un litige administratif.",
    quizCorrection: false,
    difficulty: "Moyen"
  },
  {
    id: "Q41",
    category: "Avancement de grade",
    question: "Une collectivité peut-elle inscrire et nommer les agents promus selon un classement alphabétique ?",
    answer: "Non. L’avancement de grade au choix doit reposer sur un tableau d’avancement établi par ordre de mérite. L’administration doit apprécier la valeur professionnelle ainsi que les acquis de l’expérience professionnelle des agents. Un classement alphabétique ne constitue qu’un ordre matériel de présentation et ne peut légalement déterminer l’ordre des promotions.",
    decision: "CE, 27 juillet 2026, n° 503411",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/CE/DCE_503411_20260727",
    quizStatement: "Une collectivité territoriale peut légalement établir un tableau d'avancement de grade au choix par ordre alphabétique.",
    quizCorrection: false,
    difficulty: "Facile"
  },
  {
    id: "Q42",
    category: "Avancement de grade",
    question: "Quelle conséquence entraîne un tableau d’avancement établi par ordre alphabétique plutôt que par ordre de mérite ?",
    answer: "Les nominations prononcées sur ce fondement sont illégales et peuvent être annulées.",
    decision: "CE, 27 juillet 2026, n° 503411",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/CE/DCE_503411_20260727",
    quizStatement: "Les nominations prononcées sur la base d'un tableau d'avancement établi par ordre alphabétique sont illégales et annulables par le juge administratif.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q43",
    category: "Démission",
    question: "Une administration peut-elle fixer rétroactivement la date d’effet d’une démission déjà acceptée ?",
    answer: "Elle ne peut pas considérer que tout lien avec le service a définitivement cessé avant que sa décision acceptant la démission ait été portée à la connaissance de l’agent. Une date d’effet rétroactive ne peut donc justifier l’absence de rémunération d’un agent qui a effectivement continué à travailler jusqu’à la notification de la décision.",
    decision: "TA Bastia, 24 juillet 2026, n° 2401505",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA20/DTA_2401505_20260724",
    quizStatement: "L'employeur public peut fixer rétroactivement la date d'effet d'une démission pour refuser de payer le travail effectué jusqu'à sa notification.",
    quizCorrection: false,
    difficulty: "Moyen"
  },
  {
    id: "Q44",
    category: "Démission",
    question: "L’agent doit-il être rémunéré lorsqu’il a continué à exercer ses fonctions jusqu’à la notification de l’acceptation de sa démission ?",
    answer: "Oui. Le refus de rémunérer cette période de service effectif constitue une faute de l’administration susceptible d’engager sa responsabilité et d’ouvrir droit à réparation.",
    decision: "TA Bastia, 24 juillet 2026, n° 2401505",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA20/DTA_2401505_20260724",
    quizStatement: "Tout service effectif accompli par un agent jusqu'à la notification de sa démission doit obligatoirement être rémunéré.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q45",
    category: "Devoir de réserve",
    question: "Le fait, pour un agent, d’exprimer par écrit sa souffrance au travail ou des difficultés avec sa hiérarchie constitue-t-il automatiquement une faute disciplinaire ?",
    answer: "Non. La dénonciation d’un manque de bienveillance, de pressions répétées ou d’une situation que l’agent estime assimilable à du harcèlement moral ne suffit pas, en elle-même, à caractériser un manquement au devoir de réserve ou des propos diffamatoires.",
    decision: "TA Poitiers, 13 juillet 2026, n° 2402214",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA86/DTA_2402214_20260713",
    quizStatement: "Exprimer par écrit sa souffrance au travail ou dénoncer des pressions hiérarchiques constitue automatiquement une violation du devoir de réserve.",
    quizCorrection: false,
    difficulty: "Facile"
  },
  {
    id: "Q46",
    category: "Devoir de réserve",
    question: "Des courriers internes dénonçant des difficultés relationnelles peuvent-ils justifier une exclusion temporaire de fonctions ?",
    answer: "Non, lorsque l’administration ne démontre pas le caractère fautif des propos. En l’espèce, les écrits étaient restés dans un cadre interne et l’agent se bornait à exprimer sa perception de ses conditions de travail. L’exclusion de quatre mois, dont deux avec sursis, a donc été annulée.",
    decision: "TA Poitiers, 13 juillet 2026, n° 2402214",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA86/DTA_2402214_20260713",
    quizStatement: "Des écrits internes exprimant un ressenti sur les conditions de travail sans propos diffamatoires ne peuvent justifier une exclusion temporaire.",
    quizCorrection: true,
    difficulty: "Moyen"
  },
  {
    id: "Q47",
    category: "Discipline",
    question: "Un agent RH peut-il être sanctionné pour s’être appliqué une indemnité complémentaire sans accord préalable de la direction ?",
    answer: "Pas lorsque le versement résulte d’une pratique ancienne, connue de l’employeur et instaurée par la précédente direction. Dans cette affaire, l’indemnité d’heures supplémentaires était versée depuis plusieurs années pour compenser l’impossibilité de prendre en compte la réussite à un examen professionnel. Elle bénéficiait également à d’autres agents.",
    decision: "TA Poitiers, 13 juillet 2026, n° 2401103",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA86/DTA_2401103_20260713",
    quizStatement: "Un agent RH peut être sanctionné disciplinairement pour une indemnité qu'il s'est appliquée si la pratique était durable, connue et tolérée par la direction.",
    quizCorrection: false,
    difficulty: "Moyen"
  },
  {
    id: "Q48",
    category: "Discipline",
    question: "Une administration peut-elle sanctionner un agent pour une pratique indemnitaire durable qu’elle ne pouvait ignorer ?",
    answer: "Non. Dès lors que la pratique était durable, connue et admise au sein de la collectivité, l’administration ne pouvait reprocher à l’agent de l’avoir appliquée à son propre bénéfice. L’exclusion temporaire de trois jours a été annulée.",
    decision: "TA Poitiers, 13 juillet 2026, n° 2401103",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA86/DTA_2401103_20260713",
    quizStatement: "L'employeur ne peut sanctionner disciplinairement un agent pour une pratique indemnitaire collective ancienne qu'il connaissait et tolérait.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q49",
    category: "Discipline",
    question: "L’agression physique d’un supérieur hiérarchique constitue-t-elle une faute disciplinaire ?",
    answer: "Oui. Le fait d’invectiver, menacer puis agresser physiquement un supérieur hiérarchique, notamment en lui déchirant le col de sa chemise, méconnaît les obligations de dignité et d’obéissance hiérarchique. Ces faits peuvent à eux seuls justifier une sanction disciplinaire.",
    decision: "TA Nîmes, 16 juillet 2026, n° 2402680",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA30/DTA_2402680_20260716",
    quizStatement: "Invectiver, menacer et bousculer physiquement un supérieur hiérarchique constitue une faute disciplinaire grave justifiant une exclusion.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q50",
    category: "Discipline",
    question: "Une exclusion temporaire de quinze jours est-elle proportionnée en cas d’agression physique d’un directeur des services techniques ?",
    answer: "Oui. Lorsque les faits sont corroborés par des témoignages concordants, une exclusion de quinze jours n’est pas disproportionnée compte tenu de la gravité de l’agression. La contestation de la qualité des images de vidéosurveillance est sans incidence lorsque d’autres éléments établissent suffisamment la matérialité des faits.",
    decision: "TA Nîmes, 16 juillet 2026, n° 2402680",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA30/DTA_2402680_20260716",
    quizStatement: "Une exclusion temporaire de 15 jours est proportionnée en cas d'agression physique d'un cadre établie par des témoignages concordants.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q51",
    category: "Management",
    question: "Un agent encadrant est-il soumis à une obligation particulière d’exemplarité ?",
    answer: "Oui. En raison de ses responsabilités, un encadrant doit adopter un comportement exemplaire dans ses relations avec les agents placés sous son autorité et dans l’utilisation des moyens du service. Cette exigence s’ajoute aux obligations de dignité, de probité et d’obéissance hiérarchique.",
    decision: "TA Montpellier, 20 juillet 2026, n° 2502714",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA34/DTA_2502714_20260720",
    quizStatement: "Les agents investis de responsabilités d'encadrement sont tenus à une obligation renforcée d'exemplarité.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q52",
    category: "Management",
    question: "Des insultes envers les subordonnés, la consommation d’alcool au travail et l’utilisation des moyens du service à des fins privées peuvent-elles justifier une exclusion de douze mois, dont six avec sursis ?",
    answer: "Oui. En l’espèce, un chef de cuisine avait notamment insulté ou affublé ses collaborateurs de sobriquets, y compris des agents précaires, malgré des rappels hiérarchiques. Il lui était également reproché des consommations d’alcool au travail, des siestes pendant le service, l’usage personnel des moyens du collège et des commandes privées auprès de fournisseurs du collège. L’ensemble de ces manquements justifiait l’exclusion temporaire de douze mois, dont six avec sursis.",
    decision: "TA Montpellier, 20 juillet 2026, n° 2502714",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA34/DTA_2502714_20260720",
    quizStatement: "Cumuler insultes aux collègues, alcool sur le lieu de travail et usage privé du matériel justifie une exclusion temporaire de 12 mois.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q53",
    category: "Temps de travail",
    question: "Une pause-cigarette prise pendant le temps de travail constitue-t-elle nécessairement une faute disciplinaire ?",
    answer: "Non. La pause-cigarette ne peut justifier une sanction que si elle méconnaît une règle applicable au sein du service : règlement intérieur, note de service, consigne hiérarchique, organisation du temps de travail ou nécessité de continuité du service.",
    decision: "TA Montpellier, 20 juillet 2026, n° 2502675",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA34/DTA_2502675_20260720",
    quizStatement: "Prendre une pause-cigarette constitue d'office une faute disciplinaire même si aucun règlement ni note de service ne la prohibe.",
    quizCorrection: false,
    difficulty: "Facile"
  },
  {
    id: "Q54",
    category: "Temps de travail",
    question: "Un avertissement peut-il être infligé pour une pause-cigarette alors que la note de service ne réglemente que les pauses-café ?",
    answer: "Non. Si la note interne ne vise pas les pauses-cigarettes, leur seule matérialité ne suffit pas à caractériser une méconnaissance des règles de service. L’avertissement infligé à l’agent a donc été annulé.",
    decision: "TA Montpellier, 20 juillet 2026, n° 2502675",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA34/DTA_2502675_20260720",
    quizStatement: "Un avertissement infligé pour pause-cigarette est illégal si la note de service interne ne vise et ne réglemente expressément que les pauses-café.",
    quizCorrection: true,
    difficulty: "Moyen"
  },
  {
    id: "Q55",
    category: "Discipline",
    question: "Une exclusion temporaire de trois mois, dont un mois avec sursis, peut-elle être disproportionnée malgré la réalité des manquements reprochés ?",
    answer: "Oui. La proportionnalité d’une sanction s’apprécie notamment au regard de l’ancienneté de l’agent, de ses antécédents disciplinaires, de son comportement ultérieur et de sa manière de servir.",
    decision: "TA Paris, 22 juillet 2026, n° 2313341",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA75/DTA_2313341_20260722",
    quizStatement: "La proportionnalité d'une sanction s'apprécie uniquement au moment des faits, sans pouvoir tenir compte de l'ancienneté ou de la manière de servir ultérieure.",
    quizCorrection: false,
    difficulty: "Moyen"
  },
  {
    id: "Q56",
    category: "Discipline",
    question: "Le comportement ultérieur de l’agent peut-il conduire à annuler une sanction disciplinaire trop sévère ?",
    answer: "Oui. Dans cette affaire, l’agent avait refusé à plusieurs reprises d’appliquer des consignes, d’assister à des réunions et d’adhérer à un projet de réorganisation. Mais il exerçait depuis près de vingt ans, n’avait qu’un unique blâme antérieur pour des faits comparables et, depuis sa mutation dans l’intérêt du service, ne faisait plus l’objet d’aucun grief. Sa nouvelle hiérarchie relevait au contraire son expertise, son investissement et son assiduité. L’exclusion de trois mois, dont un avec sursis, a donc été jugée disproportionnée.",
    decision: "TA Paris, 22 juillet 2026, n° 2313341",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA75/DTA_2313341_20260722",
    quizStatement: "L'exemplarité ultérieure et l'investissement d'un agent muté peuvent justifier l'annulation d'une exclusion temporaire jugée disproportionnée.",
    quizCorrection: true,
    difficulty: "Moyen"
  },
  {
    id: "Q57",
    category: "Discipline",
    question: "Une altercation violente avec un usager ou un tiers pendant le service peut-elle justifier une révocation ?",
    answer: "Oui. Un agent d’entretien qui endommage un véhicule, frappe à plusieurs reprises son conducteur avec un manche à balai et l’insulte commet une faute d’une particulière gravité. Les faits portent atteinte aux obligations professionnelles et déontologiques de l’agent, au fonctionnement du service ainsi qu’à l’image de la commune.",
    decision: "TA Rouen, 24 juillet 2026, n° 2503674",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA76/DTA_2503674_20260724",
    quizStatement: "Frapper un tiers avec un outil de travail et dégrader son véhicule pendant le service justifie légalement la révocation de l'agent.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q58",
    category: "Discipline",
    question: "L’administration doit-elle obligatoirement solliciter une expertise psychiatrique avant de révoquer un agent ayant commis des violences ?",
    answer: "Non. Aucune disposition n’impose à l’employeur public d’ordonner une expertise psychiatrique, de recueillir un avis médical spécifique ou de saisir la médecine préventive avant de prononcer une sanction. Cela est d’autant plus vrai lorsque l’agent n’a jamais invoqué une altération de son discernement durant la procédure disciplinaire. La révocation a été jugée proportionnée.",
    decision: "TA Rouen, 24 juillet 2026, n° 2503674",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA76/DTA_2503674_20260724",
    quizStatement: "L'administration a l'obligation légale de diligenter une expertise psychiatrique avant toute révocation pour violences.",
    quizCorrection: false,
    difficulty: "Moyen"
  },
  {
    id: "Q59",
    category: "Élections professionnelles",
    question: "Les directeurs généraux des services et directeurs généraux adjoints des collectivités affiliées à un centre de gestion peuvent-ils être élus représentants du personnel au CST placé auprès de ce centre ?",
    answer: "Non. Compte tenu de la nature de leurs fonctions, les DGS et DGAS ont vocation à représenter l’employeur. Ils sont donc inéligibles aux élections des représentants du personnel au comité social territorial placé auprès du centre de gestion auquel leur collectivité est affiliée.",
    decision: "CE, 16 juillet 2026, n° 510507",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/CE/DCE_510507_20260716",
    quizStatement: "Les DGS et DGAS d'une collectivité affiliée sont inéligibles en tant que représentants du personnel au CST du Centre de Gestion.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q60",
    category: "Imputabilité au service",
    question: "Le non-respect des règles de sécurité par un agent suffit-il à refuser l’imputabilité au service d’un accident ?",
    answer: "Non. Une imprudence ou une méconnaissance des consignes de sécurité ne détache pas automatiquement l’accident du service. L’administration doit établir une faute personnelle présentant une gravité ou des circonstances particulières telles qu’elle rompe le lien avec le service.",
    decision: "TA Toulouse, 22 juillet 2026, n° 2301425",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA31/DTA_2301425_20260722",
    quizStatement: "Une simple imprudence ou non-respect d'une consigne de sécurité suffit à priver un accident de son imputabilité au service.",
    quizCorrection: false,
    difficulty: "Facile"
  },
  {
    id: "Q61",
    category: "Imputabilité au service",
    question: "Un accident causé par la conduite d’un camion-benne avec le bras de levage déployé reste-t-il imputable au service ?",
    answer: "Oui, dans cette affaire. L’agent avait causé l’arrachement de lignes électriques et de câbles de fibre optique en conduisant son camion-benne avec le bras de levage déployé. Même s’il avait méconnu les consignes d’utilisation de l’engin, ce manquement n’était pas suffisamment détachable du service pour faire obstacle à l’imputabilité. Un accident ancien similaire et le comportement postérieur de l’agent, notamment le fait allégué d’avoir quitté les lieux sans sécuriser le site, ne pouvaient être utilement invoqués puisqu’ils n’avaient pas causé l’accident.",
    decision: "TA Toulouse, 22 juillet 2026, n° 2301425",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA31/DTA_2301425_20260722",
    quizStatement: "Un accident de camion-benne avec bras de levage déployé reste imputable au service en l'absence de faute personnelle détachable.",
    quizCorrection: true,
    difficulty: "Moyen"
  },
  {
    id: "Q62",
    category: "Imputabilité au service",
    question: "L’existence d’un état de santé antérieur permet-elle d’écarter l’imputabilité au service d’un infarctus survenu au temps et au lieu du service ?",
    answer: "Non, sauf si cet état antérieur constitue la cause exclusive de l’accident. Le seul fait qu’un agent présente des facteurs de risque ou une fragilité médicale antérieure ne suffit pas à écarter l’imputabilité au service.",
    decision: "CE, 28 juillet 2026, n° 506295",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/CE/DCE_506295_20260728",
    quizStatement: "Un infarctus survenu sur le lieu et pendant le temps de travail est présumé imputable au service, même si l'agent avait des antécédents médicaux non exclusifs.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q63",
    category: "Imputabilité au service",
    question: "L’agent doit-il démontrer un effort inhabituel ou une situation de stress professionnel exceptionnelle pour que son infarctus soit reconnu imputable au service ?",
    answer: "Non. Exiger la preuve d’un lien direct entre l’accident et des conditions particulières d’exécution du service constitue une erreur de droit. Lorsque l’accident survient au temps et au lieu du service, il bénéficie d’une présomption d’imputabilité, sauf cause totalement étrangère au service ou état pathologique préexistant constituant sa cause exclusive.",
    decision: "CE, 28 juillet 2026, n° 506295",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/CE/DCE_506295_20260728",
    quizStatement: "L'agent victime d'un infarctus au travail doit obligatoirement prouver qu'il subissait un stress anormal ou un effort physique exceptionnel.",
    quizCorrection: false,
    difficulty: "Facile"
  },
  {
    id: "Q64",
    category: "Neutralité du service public",
    question: "Une marque physique résultant d’une pratique religieuse privée suffit-elle à caractériser une violation de l’obligation de neutralité ?",
    answer: "Non. La seule apparence physique d’un agent ou d’un candidat, même si elle résulte d’une pratique religieuse, ne permet pas de considérer qu’il manifeste ses convictions dans l’exercice de ses fonctions ni de présumer qu’il méconnaîtra son obligation de neutralité.",
    decision: "CE, 27 juillet 2026, n° 499886",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/CE/DCE_499886_20260727",
    quizStatement: "La simple présence d'une marque corporelle liée à une pratique religieuse personnelle suffit à caractériser une rupture de l'obligation de neutralité.",
    quizCorrection: false,
    difficulty: "Moyen"
  },
  {
    id: "Q65",
    category: "Neutralité du service public",
    question: "Une administration peut-elle refuser l’agrément d’un candidat au seul motif qu’il porte une marque dermatologique visible sur le front liée à une pratique religieuse ?",
    answer: "Non. Cette circonstance ne suffit pas à établir une manifestation de croyance religieuse dans le cadre du service. En outre, le candidat avait indiqué être disposé à atténuer la visibilité de cette marque. Le refus d’agrément ne pouvait donc légalement reposer sur ce seul motif.",
    decision: "CE, 27 juillet 2026, n° 499886",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/CE/DCE_499886_20260727",
    quizStatement: "Refuser l'agrément d'un candidat uniquement pour une marque dermatologique sur le front liée à une pratique religieuse est illégal.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q66",
    category: "Prévention",
    question: "Une collectivité engage-t-elle sa responsabilité lorsqu’elle expose un agent à un risque professionnel connu sans mesures de prévention adaptées ?",
    answer: "Oui. L’employeur public doit identifier les risques, définir des protocoles, informer et former les agents, organiser les procédures de sécurité nécessaires et fournir des équipements de protection adaptés. L’absence de telles mesures engage sa responsabilité lorsqu’un agent subit un dommage en lien avec le risque connu.",
    decision: "TA Marseille, 17 juillet 2026, n° 2312116",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA13/DTA_2312116_20260717",
    quizStatement: "L'employeur public engage sa responsabilité s'il expose un agent à un risque connu sans protocole ni équipement de protection adapté.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q67",
    category: "Prévention",
    question: "Une commune peut-elle reprocher à un agent une imprudence alors qu’aucune consigne de sécurité ne lui a été donnée face à des gaz toxiques connus ?",
    answer: "Non. Dans cette affaire, un agent chargé de mesurer les gaz dégagés par des algues en décomposition a été intoxiqué. La commune connaissait le risque mais n’avait ni protocole spécifique, ni procédure opérationnelle, ni formation adaptée ; les équipements de protection étaient, en outre, insuffisants. Elle ne pouvait donc pas invoquer une faute de l’agent pour s’exonérer de sa responsabilité.",
    decision: "TA Marseille, 17 juillet 2026, n° 2312116",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA13/DTA_2312116_20260717",
    quizStatement: "Une collectivité ne peut invoquer l'imprudence d'un agent intoxiqué par des gaz si elle ne lui a fourni ni consigne, ni formation, ni EPI adéquat.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q68",
    category: "Prévention",
    question: "Que doit faire l’employeur public lorsqu’il est alerté par la médecine de prévention d’un risque pour la santé d’un agent ?",
    answer: "Il doit prendre, dans un délai raisonnable, les mesures nécessaires pour adapter les conditions de travail de l’agent et prévenir toute aggravation de son état de santé : réévaluation de la charge de travail, adaptation du poste, accompagnement managérial, mesures organisationnelles ou toute autre action pertinente au regard de l’alerte reçue.",
    decision: "TA Bastia, 14 juillet 2026, n° 2401367",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA20/DTA_2401367_20260724",
    quizStatement: "L'employeur public est tenu de mettre en œuvre des mesures d'adaptation concrètes lorsqu'il est alerté d'un risque par la médecine préventive.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q69",
    category: "Prévention",
    question: "L’absence de réponse à une alerte de la médecine de prévention peut-elle caractériser un harcèlement moral ?",
    answer: "Oui, lorsqu’elle s’accompagne d’autres agissements tels qu’un changement d’affectation constituant une sanction déguisée, une absence de réintégration ou une évaluation professionnelle illégalement dégradée. Dans cette affaire, l’absence de mesures de prévention, combinée à ces éléments, caractérisait une méconnaissance de l’obligation de protection et une situation de harcèlement moral engageant la responsabilité de l’administration.",
    decision: "TA Bastia, 14 juillet 2026, n° 2401367",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA20/DTA_2401367_20260724",
    quizStatement: "Ignorer les alertes du médecin de prévention tout en dégradant la notation d'un agent peut caractériser un harcèlement moral.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q70",
    category: "Recrutement",
    question: "La présence d’une condamnation au bulletin n° 2 du casier judiciaire suffit-elle à refuser le recrutement d’un candidat dans la fonction publique ?",
    answer: "Non. L’administration doit apprécier concrètement si les mentions portées au bulletin n° 2 sont incompatibles avec les fonctions envisagées. Elle doit notamment tenir compte de la nature des faits, de leur ancienneté, de leur caractère isolé ou répété, de l’existence éventuelle d’une récidive, du comportement professionnel de l’intéressé et du lien entre l’infraction et l’emploi postulé.",
    decision: "TA Paris, 22 juillet 2026, n° 2420165",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA75/DTA_2420165_20260722",
    quizStatement: "Toute mention inscrite au bulletin n° 2 du casier judiciaire entraîne automatiquement le refus légal de recrutement dans la fonction publique.",
    quizCorrection: false,
    difficulty: "Moyen"
  },
  {
    id: "Q71",
    category: "Recrutement",
    question: "Une condamnation isolée pour conduite sous l’emprise de stupéfiants datant de près de six ans peut-elle justifier le refus de recruter un métallier ?",
    answer: "Non, en l’absence d’élément complémentaire démontrant une incompatibilité avec les fonctions. En l’espèce, aucune consommation récente, addiction ou altération physique ou psychique n’était établie. Le candidat avait en outre exercé les mêmes fonctions pendant près d’un an sous CDD sans difficulté particulière. Le refus de recrutement a donc été jugé illégal.",
    decision: "TA Paris, 22 juillet 2026, n° 2420165",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA75/DTA_2420165_20260722",
    quizStatement: "Une condamnation ancienne et isolée sans lien d'incompatibilité actuel avec le métier ne justifie pas un refus d'embauche.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q72",
    category: "Régime indemnitaire",
    question: "Une collectivité peut-elle réduire une prime de maintien après avoir augmenté l’IFSE d’un agent ?",
    answer: "Non, lorsque la délibération instituant cette prime prévoit expressément qu’elle est acquise et ne peut faire l’objet d’aucune révision. L’employeur reste libre de faire évoluer l’IFSE liée aux fonctions exercées, mais ne peut compenser cette hausse par une baisse d’un complément indemnitaire qu’il a lui-même garanti comme non révisable.",
    decision: "TA Nîmes, 16 juillet 2026, n° 2404285",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA30/DTA_2404285_20260716",
    quizStatement: "Une collectivité peut réduire une prime de maintien garantie non révisable pour compenser la hausse de l'IFSE d'un agent.",
    quizCorrection: false,
    difficulty: "Moyen"
  },
  {
    id: "Q73",
    category: "Régime indemnitaire",
    question: "Quels droits possède l’agent dont la prime de maintien a été réduite en violation de la délibération ?",
    answer: "Il peut demander le rétablissement de la prime à son montant initial et obtenir le versement rétroactif des sommes indûment retirées.",
    decision: "TA Nîmes, 16 juillet 2026, n° 2404285",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA30/DTA_2404285_20260716",
    quizStatement: "L'agent victime d'une baisse illégale de prime acquise a droit au rétablissement de son montant et au rappel rétroactif des sommes dues.",
    quizCorrection: true,
    difficulty: "Facile"
  },
  {
    id: "Q74",
    category: "Suppression de poste",
    question: "La suppression du poste d’un agent lui donne-t-elle une priorité pour être nommé sur un nouveau poste créé lors d’une réorganisation ?",
    answer: "Non. La suppression d’emploi oblige la collectivité à proposer à l’agent un emploi correspondant à son grade ou à son cadre d’emplois, mais elle ne lui confère aucun droit à être nommé sur le poste de son choix.",
    decision: "TA Guyane, 25 juin 2026, n° 2401092",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA106/DTA_2401092_20260625",
    quizStatement: "La suppression d'un poste confère à l'agent un droit de priorité absolu pour choisir son nouveau poste dans l'organigramme.",
    quizCorrection: false,
    difficulty: "Facile"
  },
  {
    id: "Q75",
    category: "Suppression de poste",
    question: "Une collectivité doit-elle reclasser l’agent dont le poste est supprimé sur un emploi comportant davantage de responsabilités ?",
    answer: "Non. L’employeur n’est pas tenu de proposer un poste d’un niveau hiérarchique ou de responsabilités supérieur à celui détenu auparavant. Il peut légalement sélectionner un autre candidat au poste convoité, dès lors qu’il propose à l’agent concerné un emploi compatible avec son grade ou son cadre d’emplois.",
    decision: "TA Guyane, 25 juin 2026, n° 2401092",
    decisionUrl: "https://opendata.justice-administrative.fr/recherche/shareFile/TA106/DTA_2401092_20260625",
    quizStatement: "L'employeur est seulement tenu de proposer un poste équivalent au grade de l'agent dont l'emploi est supprimé, sans obligation de promotion.",
    quizCorrection: true,
    difficulty: "Facile"
  }
];

const CATEGORIES = [
  { name: "Tous", icon: <BookOpen className="w-4 h-4" />, gradient: "from-purple-600 to-indigo-600", glow: "shadow-purple-500/25", hoverBorder: "hover:border-purple-300 dark:hover:border-purple-700/60" },
  { name: "Discipline", icon: <Gavel className="w-4 h-4" />, gradient: "from-red-600 to-rose-600", glow: "shadow-red-500/25", hoverBorder: "hover:border-rose-300 dark:hover:border-rose-700/60" },
  { name: "Management et encadrement", icon: <UserCheck className="w-4 h-4" />, gradient: "from-indigo-600 to-violet-600", glow: "shadow-indigo-500/25", hoverBorder: "hover:border-indigo-300 dark:hover:border-indigo-700/60" },
  { name: "Santé, Sécurité & Maladie", icon: <Stethoscope className="w-4 h-4" />, gradient: "from-rose-500 to-red-600", glow: "shadow-rose-500/25", hoverBorder: "hover:border-rose-300 dark:hover:border-rose-700/60" },
  { name: "Protection fonctionnelle", icon: <Shield className="w-4 h-4" />, gradient: "from-blue-600 to-indigo-600", glow: "shadow-blue-500/25", hoverBorder: "hover:border-blue-300 dark:hover:border-blue-700/60" },
  { name: "Harcèlement moral", icon: <AlertTriangle className="w-4 h-4" />, gradient: "from-amber-500 to-orange-600", glow: "shadow-amber-500/25", hoverBorder: "hover:border-amber-300 dark:hover:border-amber-700/60" },
  { name: "Contrats & Carrière", icon: <FileSignature className="w-4 h-4" />, gradient: "from-blue-600 to-cyan-600", glow: "shadow-blue-500/25", hoverBorder: "hover:border-blue-300 dark:hover:border-blue-700/60" },
  { name: "Régime indemnitaire & Primes", icon: <Coins className="w-4 h-4" />, gradient: "from-emerald-600 to-teal-600", glow: "shadow-emerald-500/25", hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-700/60" },
  { name: "Recrutement & Carrière", icon: <Sparkles className="w-4 h-4" />, gradient: "from-emerald-600 to-green-600", glow: "shadow-emerald-500/25", hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-700/60" },
  { name: "Syndical & Élections", icon: <Megaphone className="w-4 h-4" />, gradient: "from-purple-600 to-pink-600", glow: "shadow-purple-500/25", hoverBorder: "hover:border-purple-300 dark:hover:border-purple-700/60" },
  { name: "Cumul d’activités", icon: <Briefcase className="w-4 h-4" />, gradient: "from-teal-600 to-emerald-600", glow: "shadow-teal-500/25", hoverBorder: "hover:border-teal-300 dark:hover:border-teal-700/60" },
  { name: "Temps de travail", icon: <Clock className="w-4 h-4" />, gradient: "from-cyan-600 to-blue-600", glow: "shadow-cyan-500/25", hoverBorder: "hover:border-cyan-300 dark:hover:border-cyan-700/60" },
  { name: "Vie Quotidienne", icon: <Heart className="w-4 h-4" />, gradient: "from-pink-600 to-rose-600", glow: "shadow-pink-500/25", hoverBorder: "hover:border-pink-300 dark:hover:border-pink-700/60" }
];

const mapCategoryToTab = (cat: string): string => {
  if (cat === "Procédure disciplinaire" || cat === "Mutation d’office" || cat === "Devoir de réserve") return "Discipline";
  if (cat === "Promotion interne" || cat === "Avancement de grade" || cat === "Neutralité du service public" || cat === "Recrutement") return "Recrutement & Carrière";
  if (cat === "Démission" || cat === "Suppression de poste" || cat === "Contrats") return "Contrats & Carrière";
  if (cat === "Régime indemnitaire") return "Régime indemnitaire & Primes";
  if (cat === "Relations intimes" || cat === "Stupéfiants" || cat === "Suspension") return "Vie Quotidienne";
  if (cat === "Management" || cat === "Obéissance hiérarchique") return "Management et encadrement";
  if (cat === "Congé de maladie" || cat === "Imputabilité au service" || cat === "Prévention") return "Santé, Sécurité & Maladie";
  if (cat === "Droit syndical" || cat === "Élections" || cat === "Élections professionnelles") return "Syndical & Élections";
  return cat;
};

interface VeilleJuridiqueProps {
  onClose: () => void;
  onNavigateToCdg?: () => void;
  initialViewMode?: "fiches" | "quiz" | "statut";
  theme?: "light" | "dark";
}

const VeilleJuridique: React.FC<VeilleJuridiqueProps> = ({ onClose, onNavigateToCdg, initialViewMode = "fiches", theme }) => {
  const [activeTab, setActiveTab] = useState<string>("Tous");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<"fiches" | "quiz" | "statut">(initialViewMode);

  // State for Statutory HR Suite & Légifrance
  const [selectedStatutTool, setSelectedStatutTool] = useState<string>("arretes");
  const [statutInput, setStatutInput] = useState<string>("");
  const [statutResult, setStatutResult] = useState<StatutoryQueryResult | null>(null);
  const [isStatutLoading, setIsStatutLoading] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number; content: string } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string || "";
      setUploadedFile({
        name: file.name,
        size: file.size,
        content: text
      });
    };
    reader.readAsText(file);
  };

  const handleAnalyzeFile = async () => {
    if (!uploadedFile) return;
    setIsStatutLoading(true);
    const queryContext = `Analyse du document RH uploadé: "${uploadedFile.name}" (Contenu: ${uploadedFile.content.slice(0, 500)}...)`;
    const res = await queryStatutoryEngine(selectedStatutTool, queryContext);
    setStatutResult({
      ...res,
      title: `Analyse Statutaire & Conformité CGFP : ${uploadedFile.name}`,
      category: `Audit Documentaire RH (Mairie de Gennevilliers)`,
      content: `L'analyse du document "${uploadedFile.name}" (${Math.round(uploadedFile.size / 1024)} ko) a été effectuée au regard des dispositions du Code Général de la Fonction Publique (CGFP) et de la jurisprudence DILA / Légifrance.`,
    });
    setIsStatutLoading(false);
  };

  // State for Quiz Mode
  const [quizQuestions, setQuizQuestions] = useState<LegalQuestion[]>(() =>
    [...LEGAL_DATA].sort(() => Math.random() - 0.5)
  );
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [historyAnswers, setHistoryAnswers] = useState<Record<string, { userAns: boolean; isCorrect: boolean }>>({});

  // Initialize and shuffle quiz
  const startQuiz = () => {
    const shuffled = [...LEGAL_DATA].sort(() => Math.random() - 0.5);
    setQuizQuestions(shuffled);
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setSelectedAnswer(null);
    setQuizFeedback(null);
    setQuizCompleted(false);
    setHistoryAnswers({});
  };

  // Toggle expanded card
  const toggleCard = (id: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Dynamic category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Tous: LEGAL_DATA.length };
    for (const item of LEGAL_DATA) {
      const tab = mapCategoryToTab(item.category);
      counts[tab] = (counts[tab] || 0) + 1;
    }
    return counts;
  }, []);

  // Filtered fiches
  const filteredQuestions = useMemo(() => {
    return LEGAL_DATA.filter(q => {
      const tabMatch = activeTab === "Tous" || mapCategoryToTab(q.category) === activeTab;
      const searchMatch = searchQuery.trim() === "" || 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.decision.toLowerCase().includes(searchQuery.toLowerCase());
      return tabMatch && searchMatch;
    });
  }, [activeTab, searchQuery]);

  // Handle quiz answer submission
  const handleQuizAnswer = (answer: boolean) => {
    if (quizFeedback) return;
    
    setSelectedAnswer(answer);
    const currentQ = quizQuestions[currentQuizIndex];
    const isCorrect = answer === currentQ.quizCorrection;
    
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }

    setHistoryAnswers(prev => ({
      ...prev,
      [currentQ.id]: { userAns: answer, isCorrect }
    }));

    setQuizFeedback({
      isCorrect,
      message: isCorrect 
        ? "Excellent ! Votre réponse correspond exactement à la décision du juge administratif." 
        : "Oups ! La décision du juge est différente de votre appréciation. Lisez l'explication complète ci-dessous."
    });
  };

  // Move to next quiz question
  const nextQuizQuestion = () => {
    setQuizFeedback(null);
    setSelectedAnswer(null);
    if (currentQuizIndex + 1 < quizQuestions.length) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setQuizCompleted(true);
      confetti({
        particleCount: 150,
        spread: 85,
        origin: { y: 0.6 }
      });
    }
  };

  // Trophy calculations
  const getBadgeDetails = (score: number) => {
    if (score <= 5) return { title: "Stagiaire Curieux 📄", desc: "Vous commencez à découvrir les arcanes du droit public. Continuez à explorer les fiches !", color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800" };
    if (score <= 11) return { title: "Délégué Vigilant ✊", desc: "Vous avez une solide connaissance de base pour défendre les droits des collègues au quotidien !", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800" };
    if (score <= 15) return { title: "Conseiller Averti ⚖️", desc: "Impressionnant ! Les dossiers complexes du statut et de la jurisprudence n'ont plus de secret pour vous.", color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800" };
    return { title: "Président de Tribunal 👑", desc: "Score parfait ou quasi-parfait ! Le Conseil d'État n'a qu'à bien se tenir, vous êtes une référence absolue !", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" };
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto overflow-x-hidden overscroll-contain bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Banner / Header with flexible responsive wrapping */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl py-3.5 sm:py-5 border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-2xl shrink-0 transition-colors">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-6 min-w-0">
          
          {/* Header Title & CFDT Logo */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Logo CFDT agrandi à la place de l'icône */}
            <div className="relative shrink-0 flex items-center">
              <img
                src="/images/cfdt_logo_texte.png"
                alt="Logo CFDT"
                className="h-14 sm:h-20 w-auto object-contain hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight break-words">
                  Veille Juridique & Statutaire
                </h1>
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 bg-purple-600 text-white rounded-full uppercase tracking-widest animate-bounce shrink-0">
                  2026
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-300 text-xs sm:text-sm font-medium mt-0.5 leading-snug break-words">
                Décisions des Tribunaux Administratifs, Conseil d'État et conformité CGFP.
              </p>
            </div>
          </div>
          
          {/* Controls: Mode Switcher & Close button with flexible wrap */}
          <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 sm:gap-3 w-full md:w-auto pt-1 md:pt-0">
            {/* View Mode Toggle */}
            <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-full border border-slate-200 dark:border-slate-800 flex items-center shadow-inner shrink-0 overflow-x-auto max-w-full">
              <button
                onClick={() => setViewMode("fiches")}
                className={`px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  viewMode === "fiches"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Jurisprudence</span>
              </button>

              <button
                onClick={() => {
                  setViewMode("quiz");
                  startQuiz();
                }}
                className={`px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  viewMode === "quiz"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Quiz</span>
              </button>

              <button
                onClick={() => setViewMode("statut")}
                className={`px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  viewMode === "statut"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <FileSignature className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Suite RH (CGFP)</span>
                <span className="sm:hidden">Suite RH</span>
              </button>
            </div>

            {/* Back Button */}
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md hover:scale-105 active:scale-95 border border-red-500/30 transition-all duration-200 group shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Retour</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 flex flex-col gap-5 sm:gap-6 min-w-0">
        
        {viewMode === "fiches" ? (
          <>
            {/* ========================================================= */}
            {/* RADAR DES THÉMATIQUES JURIDIQUES - HERO SPOTLIGHT         */}
            {/* ========================================================= */}
            <div className="relative z-10 w-full overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50/80 to-purple-50/40 dark:from-slate-900/95 dark:via-slate-900/80 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs dark:shadow-2xl backdrop-blur-xl min-w-0 transition-colors">
              
              {/* Subtle Ambient Glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

              <div className="relative z-10 flex flex-col gap-4 min-w-0">
                {/* Header of Radar */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 flex items-center justify-center shrink-0">
                      <Scale className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight break-words">
                          Radar des Thématiques & Jurisprudences
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 shrink-0">
                          TA • CAA • CE
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-snug break-words">
                        Explorez les arrêts et décisions de justice administrative par grand domaine statutaire ({LEGAL_DATA.length} fiches répertoriées).
                      </p>
                    </div>
                  </div>

                  {/* Active Filter Reset Action */}
                  {activeTab !== "Tous" && (
                    <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                      <button
                        onClick={() => setActiveTab("Tous")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Réinitialiser le filtre ({activeTab})</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Grid of Interactive Spotlight Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5 pt-1 min-w-0">
                  {CATEGORIES.map((cat) => {
                    const isActive = activeTab === cat.name;
                    const count = categoryCounts[cat.name] || 0;

                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => setActiveTab(cat.name)}
                        className={`group relative text-left p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[90px] sm:min-h-[105px] min-w-0 ${
                          isActive
                            ? `bg-gradient-to-br ${cat.gradient} text-white border-transparent shadow-lg ${cat.glow} scale-[1.02] ring-2 ring-white/50 dark:ring-white/30`
                            : `bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-1 ${cat.hoverBorder}`
                        }`}
                      >
                        {/* Top Row: Icon & Count Badge */}
                        <div className="flex items-center justify-between gap-2 w-full">
                          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-base sm:text-lg shrink-0 transition-transform group-hover:scale-110 shadow-2xs ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/40"
                          }`}>
                            {cat.icon}
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold tracking-tight shrink-0 transition-colors ${
                            isActive
                              ? "bg-white/25 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                          }`}>
                            {count} {count > 1 ? "fiches" : "fiche"}
                          </span>
                        </div>

                        {/* Bottom: Label */}
                        <div className="mt-2 min-w-0">
                          <span className={`text-xs sm:text-sm font-bold leading-snug break-words block ${
                            isActive ? "text-white" : "group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors"
                          }`}>
                            {cat.name}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* SEARCH BAR                                                */}
            {/* ========================================================= */}
            <div className="w-full flex flex-col md:flex-row gap-3 sm:gap-4 items-center bg-white/95 dark:bg-slate-900/95 p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs dark:shadow-xl backdrop-blur-xl transition-colors min-w-0">
              <div className="relative flex-grow w-full min-w-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-600 dark:text-purple-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Rechercher une décision (ex: harcèlement, congés, révocation, 2026)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-hidden text-slate-900 dark:text-white placeholder-slate-400 shadow-inner"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              
              {/* Results count badge */}
              <div className="shrink-0 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-4 py-2.5 rounded-2xl border border-purple-200 dark:border-purple-500/30">
                {filteredQuestions.length} décision{filteredQuestions.length > 1 ? "s" : ""}
              </div>
            </div>

            {/* Cards Grid */}
            {filteredQuestions.length === 0 ? (
              <div className="w-full py-16 bg-white dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-4 shadow-xs">
                <Gavel className="w-12 h-12 text-slate-300 dark:text-slate-600 animate-bounce" />
                <div>
                  <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300">Aucune décision correspondante</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                    Nous n'avons pas trouvé de fiches pour votre recherche. Essayez d'autres termes.
                  </p>
                </div>
                <button 
                  onClick={() => { setSearchQuery(""); setActiveTab("Tous"); }}
                  className="px-4 py-2 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 font-bold text-xs rounded-full border border-purple-200 dark:border-purple-800 transition-all cursor-pointer"
                >
                  Réinitialiser la recherche
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 pb-12 min-w-0">
                {filteredQuestions.map((item) => {
                  const isOpen = !!expandedCards[item.id];
                  
                  return (
                    <div 
                      key={item.id}
                      onClick={() => toggleCard(item.id)}
                      className={`group bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-purple-400 dark:hover:border-purple-500/50 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col min-w-0 ${
                        isOpen 
                          ? "ring-2 ring-purple-500/40 -translate-y-1" 
                          : ""
                      }`}
                    >
                      {/* Top Meta Header */}
                      <div className="p-4 sm:p-6 pb-3 sm:pb-4 flex flex-col gap-3 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50 shrink-0">
                            {item.category}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 shrink-0">
                            Fiche #{item.id}
                          </span>
                        </div>

                        {/* Question title */}
                        <div className="flex items-start gap-3 mt-1 min-w-0">
                          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5 border border-purple-200/60 dark:border-purple-800/40">
                            <Scale className="w-5 h-5" />
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors break-words flex-1 min-w-0">
                            {item.question}
                          </h3>
                        </div>
                      </div>

                      {/* Expandable Answer Section */}
                      {isOpen && (
                        <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 min-w-0">
                          <div className="p-4 sm:p-6 flex flex-col gap-4 min-w-0">
                            
                            {/* Answer Block */}
                            <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border-l-4 border-emerald-500 rounded-r-2xl border border-emerald-200/80 dark:border-emerald-900/40 min-w-0">
                              <h4 className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
                                Réponse & Règle de Droit
                              </h4>
                              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal break-words">
                                {item.answer}
                              </p>
                            </div>

                            {/* Decision Ref stamp with Open Data Link */}
                            <div className="flex flex-wrap items-center justify-between gap-2 mt-1 pt-3 border-t border-slate-200/60 dark:border-slate-700/50">
                              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shrink-0">
                                ⚖️ Référence de décision :
                              </span>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-black text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/40 px-3 py-1 rounded-full shadow-2xs break-words">
                                  {item.decision}
                                </span>
                                {item.decisionUrl && (
                                  <a
                                    href={item.decisionUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/40 px-2.5 py-1 rounded-full shadow-2xs transition-colors"
                                    title="Consulter le texte officiel sur l'Open Data Justice Administrative"
                                  >
                                    <span>Opendata Justice</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Footer with Toggle indicator */}
                      <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end bg-slate-50/40 dark:bg-slate-900/20">
                        <span className="text-xs font-bold text-slate-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-center gap-1">
                          {isOpen ? "Masquer" : "Voir la réponse"}
                          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180 text-purple-600 dark:text-purple-400" : ""}`} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : viewMode === "quiz" ? (
          /* QUIZ MODE with fluid responsive bounds */
          <div className="max-w-2xl mx-auto w-full py-2 sm:py-4 flex flex-col gap-5 sm:gap-6 min-w-0">
            
            {!quizCompleted ? (
              <>
                {/* Quiz Progress & Stats */}
                <div className="w-full bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-4 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Défi Jurisprudence
                    </span>
                    <span className="text-xs font-black bg-purple-50 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800/60 shrink-0">
                      Question {currentQuizIndex + 1} / {quizQuestions.length}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200/80 dark:border-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` }}
                    />
                  </div>

                  {/* Current Score indicator */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span>Score actuel : {quizScore} / {currentQuizIndex} correct{quizScore > 1 ? "s" : ""}</span>
                    <span className="text-purple-600 dark:text-purple-400 font-black">Taux : {currentQuizIndex > 0 ? Math.round((quizScore / currentQuizIndex) * 100) : 0}%</span>
                  </div>
                </div>

                {/* Main Quiz Card */}
                {quizQuestions.length > 0 && (
                  <div className={`w-full bg-white dark:bg-slate-900 rounded-3xl border p-5 sm:p-8 shadow-md transition-all duration-300 min-w-0 ${
                    quizFeedback 
                      ? quizFeedback.isCorrect 
                        ? "border-emerald-500 ring-2 ring-emerald-500/30" 
                        : "border-rose-500 ring-2 ring-rose-500/30"
                      : "border-slate-200/80 dark:border-slate-800"
                  }`}>
                    
                    {/* Header info */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 shrink-0">
                        {quizQuestions[currentQuizIndex].category}
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shrink-0 ${
                        quizQuestions[currentQuizIndex].difficulty === "Facile" ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200" :
                        quizQuestions[currentQuizIndex].difficulty === "Moyen" ? "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200" :
                        "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200"
                      }`}>
                        {quizQuestions[currentQuizIndex].difficulty}
                      </span>
                    </div>

                    {/* Statement / Situation */}
                    <div className="flex flex-col gap-2 mb-6 sm:mb-8 min-w-0">
                      <h3 className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                        Situation juridique / Affirmation :
                      </h3>
                      <p className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug tracking-tight break-words">
                        "{quizQuestions[currentQuizIndex].quizStatement}"
                      </p>
                    </div>

                    {/* True / False Buttons */}
                    {!quizFeedback ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <button
                          onClick={() => handleQuizAnswer(true)}
                          className="py-3.5 sm:py-4 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-3 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-700/60 shadow-xs hover:scale-102 active:scale-98 transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                          <span>VRAI</span>
                        </button>
                        <button
                          onClick={() => handleQuizAnswer(false)}
                          className="py-3.5 sm:py-4 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border-2 border-rose-300 dark:border-rose-700/60 shadow-xs hover:scale-102 active:scale-98 transition-all cursor-pointer"
                        >
                          <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500" />
                          <span>FAUX</span>
                        </button>
                      </div>
                    ) : (
                      /* Feedback and Explanations */
                      <div className="flex flex-col gap-5 sm:gap-6 animate-in fade-in zoom-in-95 duration-200 min-w-0">
                        <div className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3 sm:gap-4 min-w-0 ${
                          quizFeedback.isCorrect 
                            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100" 
                            : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100"
                        }`}>
                          {quizFeedback.isCorrect ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                          )}
                          <div className="flex flex-col gap-1 min-w-0 flex-1">
                            <span className="text-sm font-black uppercase break-words">
                              {quizFeedback.isCorrect ? "Bonne réponse !" : "Réponse incorrecte"}
                            </span>
                            <p className="text-xs font-medium opacity-90 break-words">
                              {quizFeedback.message}
                            </p>
                          </div>
                        </div>

                        {/* Legal Decision and Detailed rule */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col gap-2 min-w-0">
                          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 shrink-0">
                            ⚖️ Motivation du juge administratif :
                          </span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed break-words">
                            {quizQuestions[currentQuizIndex].answer}
                          </p>
                          <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-1 text-[11px] font-mono font-bold text-purple-700 dark:text-purple-400">
                            <span>Décision : {quizQuestions[currentQuizIndex].decision}</span>
                          </div>
                        </div>

                        {/* Next question button */}
                        <button
                          onClick={nextQuizQuestion}
                          className="w-full py-3.5 sm:py-4 bg-purple-600 hover:bg-purple-700 text-white font-black text-sm rounded-2xl shadow-md hover:shadow-lg transition-all hover:scale-102 active:scale-98 cursor-pointer"
                        >
                          {currentQuizIndex + 1 < quizQuestions.length ? "Question Suivante →" : "Voir mes résultats 🏆"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Quiz Finished Screen */
              <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xl flex flex-col items-center text-center gap-5 sm:gap-6 min-w-0">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-full text-amber-600 dark:text-amber-400 animate-bounce">
                  <Trophy className="w-12 h-12" />
                </div>

                <div className="flex flex-col gap-1 min-w-0">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">Défi Terminé !</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Voici le bilan de votre session de révision statutaire.
                  </p>
                </div>

                {/* Score badge */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-1 w-full max-w-sm">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Score Final</span>
                  <span className="text-4xl font-black text-purple-600 dark:text-purple-400">
                    {quizScore} / {quizQuestions.length}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {Math.round((quizScore / quizQuestions.length) * 100)}% de réussite
                  </span>
                </div>

                {/* Trophy details */}
                <div className={`p-4 rounded-2xl border w-full max-w-sm flex flex-col gap-1 ${getBadgeDetails(quizScore).color}`}>
                  <span className="text-sm font-black">{getBadgeDetails(quizScore).title}</span>
                  <p className="text-xs font-medium leading-relaxed">{getBadgeDetails(quizScore).desc}</p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                  <button
                    onClick={startQuiz}
                    className="flex-1 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Recommencer</span>
                  </button>
                  <button
                    onClick={() => setViewMode("fiches")}
                    className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-2xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                  >
                    Voir les Fiches
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* STATUT / SUITE RH CGFP */
          <div className="flex flex-col gap-5 sm:gap-6 max-w-5xl mx-auto w-full min-w-0">
            {/* Header Box */}
            <div className="bg-white/85 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-w-0">
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 shrink-0">
                  <FileSignature className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white break-words">Suite RH Statutaire & Légifrance</h2>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 break-words">
                    Code Général de la Fonction Publique (CGFP) • Mairie de Gennevilliers
                  </p>
                </div>
              </div>
              <div className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                API Légifrance : Connectée
              </div>
            </div>

            {/* Statutory Tools Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4 min-w-0">
              {STATUTORY_HR_TOOLS.map((t) => {
                const isSelected = selectedStatutTool === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={async () => {
                      setSelectedStatutTool(t.id);
                      setIsStatutLoading(true);
                      const res = await queryStatutoryEngine(t.id, statutInput || t.name);
                      setStatutResult(res);
                      setIsStatutLoading(false);
                    }}
                    className={`text-left p-4 sm:p-5 rounded-3xl border transition-all flex flex-col gap-2 cursor-pointer min-w-0 ${
                      isSelected
                        ? "bg-white dark:bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md scale-[1.02]"
                        : "bg-white/80 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <span className="text-sm font-black text-slate-900 dark:text-white truncate">{t.name}</span>
                      <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed break-words">{t.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Input / Execution Box */}
            <div className="bg-white/85 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col gap-4 min-w-0">
              <div className="flex flex-col gap-2 min-w-0">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex flex-wrap items-center justify-between gap-1">
                  <span>Requête ou contexte de l'agent :</span>
                  <span className="text-[10px] text-slate-400">Ex: "Adjoint technique 6e échelon vers 7e", "Refus TPT 30j"</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3 min-w-0">
                  <input
                    type="text"
                    value={statutInput}
                    onChange={(e) => setStatutInput(e.target.value)}
                    placeholder="Paramètres ou situation de l'agent..."
                    className="flex-1 min-w-0 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden"
                  />
                  <button
                    onClick={async () => {
                      setIsStatutLoading(true);
                      const res = await queryStatutoryEngine(selectedStatutTool, statutInput || "Avancement d'échelon");
                      setStatutResult(res);
                      setIsStatutLoading(false);
                    }}
                    disabled={isStatutLoading}
                    className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isStatutLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>Générer l'acte statutaire</span>
                  </button>
                </div>
              </div>

              {/* Upload Document Check */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl shrink-0">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block break-words">Audit de conformité documentaire RH</span>
                    <span className="text-[11px] text-slate-400 block break-words">Glissez un projet d'acte (.txt, .docx, .pdf) pour audit CGFP</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <input
                    type="file"
                    id="doc-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".txt,.doc,.docx,.pdf"
                  />
                  <label
                    htmlFor="doc-upload"
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shrink-0"
                  >
                    {uploadedFile ? uploadedFile.name : "Parcourir un fichier"}
                  </label>
                  {uploadedFile && (
                    <button
                      onClick={handleAnalyzeFile}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                    >
                      Analyser
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Generated Statutory Result */}
            {statutResult && (
              <div className="bg-white dark:bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-lg flex flex-col gap-4 animate-in fade-in duration-200 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase">{statutResult.category}</span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white break-words">{statutResult.title}</h3>
                  </div>
                  <span className="text-[11px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50 shrink-0">
                    Réf : {statutResult.cgfpRef}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed break-words">{statutResult.content}</p>

                {statutResult.sampleDocument && (
                  <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 shrink-0">
                        <FileText className="w-4 h-4 text-emerald-500" />
                        Modèle d'acte officiel prêt à l'emploi :
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(statutResult.sampleDocument || "");
                          setCopiedSuccess(true);
                          setTimeout(() => setCopiedSuccess(false), 2000);
                        }}
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {copiedSuccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSuccess ? "Copié !" : "Copier l'acte"}</span>
                      </button>
                    </div>
                    <pre className="text-[11px] font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto max-w-full">
                      {statutResult.sampleDocument}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default VeilleJuridique;
