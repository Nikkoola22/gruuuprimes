import React, { useState, useMemo } from "react";
import confetti from "canvas-confetti";
import { STATUTORY_HR_TOOLS, queryStatutoryEngine, StatutoryQueryResult, LEGIFRANCE_CONFIG } from "../services/legifrance";
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
  X
} from "lucide-react";

export interface LegalQuestion {
  id: string;
  category: string;
  question: string;
  answer: string;
  decision: string;
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
    question: "Un responsable déjà sanctionné pour des faits similaires peut‑il faire l’objet d’une exclusion de longue durée ?",
    answer: "Oui. Lorsque sont constatés, de manière répétée, des comportements fautifs (attitude menaçante, injurieuse ou humiliante, organisation arbitraire et inéquitable du travail, usage des moyens du service à des fins personnelles) et que l’agent a déjà fait l’objet de rappels à l’ordre ou de sanctions pour des faits de même nature, une exclusion de fonctions de longue durée, telle que deux ans, n’est pas disproportionnée.",
    decision: "TA Amiens, 06.05.2026, n°2402116",
    quizStatement: "Une exclusion de fonctions de 2 ans est toujours jugée excessive pour des faits de management humiliant, même en cas de récidive.",
    quizCorrection: false,
    difficulty: "Difficile"
  },
  {
    id: "Q9",
    category: "Management et encadrement",
    question: "Un style de management durablement maltraitant peut‑il conduire à une rétrogradation ?",
    answer: "Oui. Lorsque des témoignages concordants font état, sur une période prolongée, de propos dénigrants, d’un climat de peur, d’une absence d’accompagnement des agents et d’une tendance à reprocher les erreurs sans soutien, le comportement de l’encadrant constitue un manquement particulièrement grave à ses obligations. Dans ce contexte, une rétrogradation au grade inférieur peut être regardée comme une sanction adaptée.",
    decision: "TA Bordeaux, 09.06.2026, n°2305060",
    quizStatement: "Une rétrogradation au grade inférieur peut sanctionner un style de management durablement maltraitant (dénigrement, climat de peur).",
    quizCorrection: true,
    difficulty: "Moyen"
  },
  {
    id: "Q10",
    category: "Procédure disciplinaire",
    question: "Une sanction disciplinaire peut‑elle être annulée si l’agent n’a pas eu accès à l’intégralité du rapport d’enquête ?",
    answer: "Oui. Le respect des droits de la défense impose la communication de l’intégralité du dossier, y compris des éléments susceptibles de lui être favorables. Si l’administration ne transmet à l’agent que les pièces à charge et lui refuse l’accès aux autres éléments de l’enquête administrative, la procédure est entachée d’irrégularité et la sanction doit être annulée, indépendamment de la réalité ou de la gravité des faits reprochés.",
    decision: "TA Lyon, 03.06.2026, n°2405971",
    quizStatement: "Si l'administration ne transmet que les pièces à charge de l'enquête à l'agent en lui masquant les pièces favorables, la sanction sera annulée pour vice de procédure.",
    quizCorrection: true,
    difficulty: "Difficile"
  },
  {
    id: "Q11",
    category: "Promotion interne",
    question: "Les organes consultatifs intervenant en promotion interne sont‑ils des jurys qui classent les candidats ?",
    answer: "Non. Ces organes se bornent à apprécier la valeur professionnelle et l’expérience des candidats et à émettre des avis, sans procéder à un classement ni se substituer à l’autorité de nomination. Celle‑ci décide des nominations sur la base de ces avis, sous le contrôle restreint du juge de l’erreur manifeste d’appréciation.",
    decision: "CE, 10.06.2026, n°508369",
    quizStatement: "Les commissions de promotion interne fonctionnent comme des jurys d'examen : leur classement des candidats s'impose à l'employeur.",
    quizCorrection: false,
    difficulty: "Difficile"
  },
  {
    id: "Q12",
    category: "Recrutement",
    question: "L’existence de relations antérieures entre un membre de la commission de sélection et un candidat remet‑elle en cause l’impartialité du recrutement ?",
    answer: "Pas automatiquement. La seule existence de relations ou de différends antérieurs ne suffit pas à caractériser un défaut d’impartialité. Il faut démontrer des liens d’une intensité telle qu’ils soient de nature à influencer l’appréciation portée sur la candidature ; à défaut, la décision de recrutement reste légale, sous réserve de l’absence d’erreur manifeste d’appréciation sur l’adéquation du candidat au poste.",
    decision: "CE, 10.06.2026, n°509963",
    quizStatement: "Tout recrutement est automatiquement annulé si un candidat connaissait déjà un membre du jury, quelle que soit la nature de leur relation.",
    quizCorrection: false,
    difficulty: "Moyen"
  },
  {
    id: "Q13",
    category: "Recrutement",
    question: "L’avis d’un comité de sélection dans un recrutement contractuel réservé aux travailleurs handicapés s’impose‑t‑il à l’autorité de recrutement ?",
    answer: "Non. Dans ce cadre, le comité de sélection exerce un rôle purement consultatif : il émet un avis destiné à éclairer la décision, mais ne la lie pas. Cet avis est un acte préparatoire insusceptible de recours et l’autorité de recrutement conserve l’entière responsabilité de l’appréciation des candidatures, sous le contrôle de l’erreur manifeste.",
    decision: "CE, 10.06.2026, n°501899",
    quizStatement: "L'avis d'un comité de sélection pour le recrutement de travailleurs handicapés lie obligatoirement l'autorité de recrutement.",
    quizCorrection: false,
    difficulty: "Difficile"
  },
  {
    id: "Q14",
    category: "Relations intimes",
    question: "Une relation intime entre agents constitue‑t‑elle, en soi, une faute disciplinaire ?",
    answer: "Non. La relation intime entre collègues n’est pas en elle‑même fautive. En revanche, les comportements qu’elle peut générer sur le lieu de travail (par exemple, organisation d’une confrontation entre conjoint et collègue, donnant lieu à des violences sans intervention de l’agent) peuvent constituer un manquement grave aux obligations de sécurité, de loyauté et de comportement, justifiant une sanction allant jusqu’à la révocation.",
    decision: "TA Toulouse, 09.06.2026, n°2400304",
    quizStatement: "Avoir une liaison amoureuse avec un collègue de travail constitue en soi une faute disciplinaire.",
    quizCorrection: false,
    difficulty: "Facile"
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
  }
];

const CATEGORIES = [
  { name: "Tous", count: 18, color: "bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 border-slate-200" },
  { name: "Contrats", count: 2, icon: <FileSignature className="w-4 h-4" />, color: "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/50" },
  { name: "Discipline", count: 3, icon: <Gavel className="w-4 h-4" />, color: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50" }, // Regroupe Q3, Q4, Q10
  { name: "Harcèlement moral", count: 2, icon: <AlertTriangle className="w-4 h-4" />, color: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50" },
  { name: "Management et encadrement", count: 3, icon: <UserCheck className="w-4 h-4" />, color: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50" },
  { name: "Recrutement", count: 3, icon: <Sparkles className="w-4 h-4" />, color: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50" }, // Regroupe Q11 (Promo), Q12, Q13
  { name: "Temps de travail", count: 2, icon: <Clock className="w-4 h-4" />, color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50" },
  { name: "Vie Quotidienne", count: 3, icon: <Heart className="w-4 h-4" />, color: "bg-fuchsia-50 dark:bg-fuchsia-950/40 text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-800/50" } // Regroupe Q14 (Relations), Q15 (Stup), Q16 (Suspension)
];

// Helper to map DB category names to the UI tabs
const mapCategoryToTab = (cat: string): string => {
  if (cat === "Procédure disciplinaire") return "Discipline";
  if (cat === "Promotion interne") return "Recrutement";
  if (cat === "Relations intimes" || cat === "Stupéfiants" || cat === "Suspension") return "Vie Quotidienne";
  return cat;
};

interface VeilleJuridiqueProps {
  onClose: () => void;
}

const VeilleJuridique: React.FC<VeilleJuridiqueProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<string>("Tous");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<"fiches" | "quiz" | "statut">("quiz");

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
    if (quizFeedback) return; // Prevent double click
    
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
      // Trigger a celebratory confetti burst
      confetti({
        particleCount: 150,
        spread: 85,
        origin: { y: 0.6 }
      });
    }
  };

  // Trophy & Badge calculations
  const getBadgeDetails = (score: number) => {
    if (score <= 5) return { title: "Stagiaire Curieux 📄", desc: "Vous commencez à découvrir les arcanes du droit public. Continuez à explorer les fiches !", color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200" };
    if (score <= 11) return { title: "Délégué Vigilant ✊", desc: "Vous avez une solide connaissance de base pour défendre les droits des collègues au quotidien !", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200" };
    if (score <= 15) return { title: "Conseiller Averti ⚖️", desc: "Impressionnant ! Les dossiers complexes du statut et de la jurisprudence n'ont plus de secret pour vous.", color: "text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200" };
    return { title: "Président de Tribunal 👑", desc: "Score parfait ou quasi-parfait ! Le Conseil d'État n'a qu'à bien se tenir, vous êtes une référence absolue !", color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200" };
  };

  const activeCategoryDetails = useMemo(() => {
    return CATEGORIES.find(c => c.name === activeTab) || CATEGORIES[0];
  }, [activeTab]);

  return (
    <div className="dark fixed inset-0 z-[60] overflow-y-auto overflow-x-hidden overscroll-contain bg-slate-950 text-white flex flex-col font-sans">
      
      {/* Banner / Header */}
      <header className="relative z-40 bg-slate-900/90 backdrop-blur-xl py-8 border-b border-slate-800 shadow-2xl shrink-0">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-purple-500/20 rounded-2xl border border-purple-500/30 shadow-inner flex items-center justify-center animate-pulse">
              <Scale className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                Veille Juridique
                <span className="text-xs font-bold px-2.5 py-1 bg-purple-600 text-white rounded-full uppercase tracking-widest animate-bounce">2026</span>
              </h1>
              <p className="text-slate-300 text-sm font-medium mt-1">
                Les dernières décisions des Tribunaux Administratifs et du Conseil d'État expliquées simplement.
              </p>
            </div>
          </div>
          
          {/* Controls: Mode Switcher & Close button */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* View Mode Toggle */}
            <div className="bg-slate-900 p-1 rounded-full border border-slate-800 flex items-center shadow-lg">
              <button
                onClick={() => setViewMode("fiches")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === "fiches" ? "bg-purple-600 text-white shadow-md" : "text-slate-300 hover:text-white"}`}
              >
                <BookOpen className="w-3.5 h-3.5 inline mr-1.5" />
                Fiches d'étude
              </button>
              <button
                onClick={() => {
                  setViewMode("quiz");
                  startQuiz();
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === "quiz" ? "bg-purple-600 text-white shadow-md" : "text-slate-300 hover:text-white"}`}
              >
                <Trophy className="w-3.5 h-3.5 inline mr-1.5" />
                Mode Défi Quiz
              </button>
              <button
                onClick={() => setViewMode("statut")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === "statut" ? "bg-emerald-600 text-white shadow-md" : "text-slate-300 hover:text-white"}`}
              >
                <FileSignature className="w-3.5 h-3.5 inline mr-1.5" />
                Suite RH Statutaire (CGFP / Légifrance)
              </button>
            </div>

            {/* Back Button */}
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white border border-red-500/40 rounded-full font-bold transition-all text-sm shadow-md hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 flex flex-col gap-6 overflow-y-auto">
        
        {viewMode === "fiches" ? (
          <>
            {/* Search & Filter Bar */}
            <div className="w-full flex flex-col md:flex-row gap-4 items-center bg-slate-900/80 p-4 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-xl">
              <div className="relative flex-grow w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="text"
                  placeholder="Rechercher une décision, un mot-clé (ex: harcèlement, congés)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none text-white placeholder-slate-400"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:scale-110 px-2.5 py-1 rounded-lg border border-slate-700"
                  >
                    Effacer
                  </button>
                )}
              </div>
              
              {/* Optional results count badge */}
              <div className="shrink-0 text-xs font-bold text-purple-300 bg-purple-950/60 px-4 py-2.5 rounded-xl border border-purple-500/30">
                {filteredQuestions.length} décision{filteredQuestions.length > 1 ? "s" : ""} trouvée{filteredQuestions.length > 1 ? "s" : ""}
              </div>
            </div>

            {/* Categories Horizontal Tabs */}
            <div className="w-full overflow-x-auto pb-2 flex gap-2.5 categories-scrollbar">
              {CATEGORIES.map((cat) => {
                const isActive = activeTab === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setActiveTab(cat.name)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-bold transition-all shrink-0 shadow-md ${
                      isActive 
                        ? "bg-purple-600 border-purple-500 text-white shadow-purple-600/30 scale-105" 
                        : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white"
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? "bg-white/30 text-white" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Cards Grid */}
            {filteredQuestions.length === 0 ? (
              <div className="w-full py-16 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-4 shadow-sm">
                <Gavel className="w-12 h-12 text-slate-300 animate-bounce" />
                <div>
                  <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300">Aucune décision correspondante</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                    Nous n'avons pas trouvé de fiches pour votre recherche. Essayez d'autres termes ou modifiez vos filtres.
                  </p>
                </div>
                <button 
                  onClick={() => { setSearchQuery(""); setActiveTab("Tous"); }}
                  className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold text-xs rounded-full border border-purple-200 transition-all"
                >
                  Réinitialiser la recherche
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                {filteredQuestions.map((item) => {
                  const isOpen = !!expandedCards[item.id];
                  const tabColorDetails = CATEGORIES.find(c => c.name === mapCategoryToTab(item.category)) || CATEGORIES[0];
                  
                  return (
                    <div 
                      key={item.id}
                      onClick={() => toggleCard(item.id)}
                      className={`group bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl hover:shadow-2xl hover:border-purple-500/50 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col ${
                        isOpen 
                          ? "ring-2 ring-purple-500/60 shadow-purple-900/30 -translate-y-1" 
                          : "hover:-translate-y-1"
                      }`}
                    >
                      {/* Top Bar with Category Badge and ID */}
                      <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-slate-800">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border bg-purple-950/60 text-purple-300 border-purple-500/30`}>
                          {item.category}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
                            CASE {item.id}
                          </span>
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border ${
                            item.difficulty === "Facile" ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/40" :
                            item.difficulty === "Moyen" ? "bg-amber-950/40 text-amber-300 border-amber-500/40" :
                            "bg-rose-950/40 text-rose-300 border-rose-500/40"
                          }`}>
                            {item.difficulty}
                          </span>
                        </div>
                      </div>

                      {/* Question Container */}
                      <div className="px-6 py-5 flex-grow flex gap-4 items-start">
                        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center text-purple-400 group-hover:text-purple-300 transition-all shrink-0">
                          <Gavel className="w-5 h-5" />
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-base font-extrabold text-white leading-snug tracking-tight group-hover:text-purple-300 transition-colors">
                            {item.question}
                          </h3>
                        </div>
                      </div>

                      {/* Expandable Answer Section */}
                      <div className={`expandable-content ${isOpen ? "open" : ""}`}>
                        <div className="border-t border-slate-800 bg-slate-950/60">
                          <div className="p-6 flex flex-col gap-4">
                            
                            {/* Answer Block */}
                            <div className="p-4 bg-emerald-950/40 border-l-4 border-emerald-500 rounded-r-2xl border border-emerald-900/40">
                              <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider mb-1">
                                Réponse & Règle de Droit
                              </h4>
                              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                                {item.answer}
                              </p>
                            </div>

                            {/* Decision Ref stamp */}
                            <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                ⚖️ Référence de décision :
                              </span>
                              <span className="text-xs font-black text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border border-purple-150 dark:border-purple-800/40 px-3 py-1 rounded-full shadow-sm">
                                {item.decision}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer with Toggle indicator */}
                      <div className="px-6 py-3 border-t border-slate-50 dark:border-slate-700/40 flex items-center justify-end bg-slate-50/30 dark:bg-slate-900/10">
                        <span className="text-xs font-bold text-slate-400 group-hover:text-purple-500 transition-colors flex items-center gap-1">
                          {isOpen ? "Masquer la réponse" : "Cliquer pour voir la réponse"}
                          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180 text-purple-500" : ""}`} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : viewMode === "quiz" ? (
          /* QUIZ MODE */
          <div className="max-w-2xl mx-auto w-full py-4 flex flex-col gap-6">
            
            {!quizCompleted ? (
              <>
                {/* Quiz Progress & Stats */}
                <div className="w-full bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Défi Jurisprudence
                    </span>
                    <span className="text-xs font-black bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400 px-3 py-1 rounded-full">
                      Question {currentQuizIndex + 1} / {quizQuestions.length}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` }}
                    />
                  </div>

                  {/* Current Score indicator */}
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span>Score actuel : {quizScore} / {currentQuizIndex} correct{quizScore > 1 ? "s" : ""}</span>
                    <span className="text-purple-600 dark:text-purple-400 font-black">Taux de réussite : {currentQuizIndex > 0 ? Math.round((quizScore / currentQuizIndex) * 100) : 0}%</span>
                  </div>
                </div>

                {/* Main Quiz Card */}
                {quizQuestions.length > 0 && (
                  <div className={`w-full bg-white dark:bg-slate-800 rounded-3xl border p-8 shadow-lg transition-all duration-300 ${
                    quizFeedback 
                      ? quizFeedback.isCorrect 
                        ? "border-emerald-500 shadow-emerald-100 dark:shadow-none ring-2 ring-emerald-500/30" 
                        : "border-rose-500 shadow-rose-100 dark:shadow-none ring-2 ring-rose-500/30"
                      : "border-slate-200 dark:border-slate-700"
                  }`}>
                    
                    {/* Header info */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full border border-slate-200/50 dark:border-slate-800">
                        {quizQuestions[currentQuizIndex].category}
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                        quizQuestions[currentQuizIndex].difficulty === "Facile" ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200" :
                        quizQuestions[currentQuizIndex].difficulty === "Moyen" ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-200" :
                        "bg-rose-50 dark:bg-rose-950/20 text-rose-600 border-rose-200"
                      }`}>
                        Difficulté : {quizQuestions[currentQuizIndex].difficulty}
                      </span>
                    </div>

                    {/* Statement / Situation */}
                    <div className="flex flex-col gap-2 mb-8">
                      <h3 className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                        Situation juridique / Affirmation :
                      </h3>
                      <p className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white leading-snug tracking-tight">
                        "{quizQuestions[currentQuizIndex].quizStatement}"
                      </p>
                    </div>

                    {/* Buttons: True / False */}
                    {!quizFeedback ? (
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => handleQuizAnswer(true)}
                          className="py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          VRAI
                        </button>
                        <button
                          onClick={() => handleQuizAnswer(false)}
                          className="py-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-base shadow-lg shadow-rose-500/25 transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-5 h-5" />
                          FAUX
                        </button>
                      </div>
                    ) : (
                      /* Quiz Feedback and Explanations */
                      <div className="flex flex-col gap-6 animate-fadeIn">
                        {/* Status message */}
                        <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                          quizFeedback.isCorrect 
                            ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 text-emerald-800 dark:text-emerald-400" 
                            : "bg-rose-50 dark:bg-rose-950/20 border-rose-200 text-rose-800 dark:text-rose-400"
                        }`}>
                          {quizFeedback.isCorrect ? <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" /> : <XCircle className="w-6 h-6 shrink-0 mt-0.5" />}
                          <div>
                            <h4 className="font-extrabold text-sm">{quizFeedback.isCorrect ? "Correct !" : "Erreur"}</h4>
                            <p className="text-xs font-medium mt-1 leading-relaxed">{quizFeedback.message}</p>
                          </div>
                        </div>

                        {/* Complete Decision details */}
                        <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                          <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            Explication et Décision de Justice :
                          </h4>
                          <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200 leading-snug mb-3">
                            Q : {quizQuestions[currentQuizIndex].question}
                          </h5>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium mb-4">
                            {quizQuestions[currentQuizIndex].answer}
                          </p>
                          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] font-black text-slate-400 uppercase">La décision du juge :</span>
                            <span className="text-xs font-black text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800/60 px-3 py-1 rounded-full">
                              {quizQuestions[currentQuizIndex].decision}
                            </span>
                          </div>
                        </div>

                        {/* Next Button */}
                        <button
                          onClick={nextQuizQuestion}
                          className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-base shadow-lg shadow-purple-600/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                          <span>Continuer</span>
                          <ArrowLeft className="w-4 h-4 rotate-180" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Quiz Completed view */
              <div className="w-full bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl text-center flex flex-col items-center gap-6 animate-fadeIn">
                <div className="p-5 bg-amber-100 dark:bg-amber-900/30 rounded-full border border-amber-200 dark:border-amber-800 text-amber-500 animate-bounce">
                  <Trophy className="w-16 h-16" />
                </div>
                
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Défi Terminé !
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-1.5">
                    Vous avez répondu à toutes les questions de la veille juridique.
                  </p>
                </div>

                {/* Score Summary Box */}
                <div className="w-full max-w-sm p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                  <div className="flex justify-between items-center text-sm font-bold border-b border-slate-200 dark:border-slate-800 pb-3">
                    <span className="text-slate-500">Score final :</span>
                    <span className="text-lg font-black text-purple-600 dark:text-purple-400">{quizScore} / {quizQuestions.length} correct{quizScore > 1 ? "s" : ""}</span>
                  </div>
                  
                  {/* Badge */}
                  <div className={`p-4 rounded-2xl border text-left flex flex-col gap-1 ${getBadgeDetails(quizScore).color}`}>
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-85">Titre débloqué :</span>
                    <span className="font-extrabold text-base">{getBadgeDetails(quizScore).title}</span>
                    <p className="text-xs font-medium leading-relaxed mt-1 opacity-90">{getBadgeDetails(quizScore).desc}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 w-full max-w-sm">
                  <button
                    onClick={startQuiz}
                    className="flex-1 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm shadow-lg shadow-purple-600/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Rejouer le quiz
                  </button>
                  <button
                    onClick={() => setViewMode("fiches")}
                    className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-black text-sm border border-slate-200 dark:border-slate-600 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Voir les fiches
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Statutory HR Suite & Légifrance PISTE View */
          <div className="w-full flex flex-col gap-6 animate-fadeIn">
            {/* Header Badge */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                  <FileSignature className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Suite RH Statutaire & API Légifrance (CGFP)</h2>
                  <p className="text-xs font-medium text-slate-400 mt-1">
                    Connecté à Légifrance (PISTE v2.4.2) • Mairie de Gennevilliers (SIREN 219200365)
                  </p>
                </div>
              </div>
              <div className="px-4 py-2 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                API PISTE Légifrance : Connectée
              </div>
            </div>

            {/* Statutory Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    className={`text-left p-5 rounded-3xl border transition-all flex flex-col gap-2 ${
                      isSelected
                        ? "bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/30 shadow-xl scale-[1.02]"
                        : "bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-white">{t.name}</span>
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{t.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Interactive Query Input & Document Upload Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
              
              {/* File Upload Zone */}
              <div className="p-5 bg-slate-950/80 rounded-2xl border border-dashed border-slate-800 flex flex-col items-center justify-center gap-3 text-center transition-all hover:border-emerald-500/50 group">
                <input
                  type="file"
                  id="rh-file-upload"
                  accept=".txt,.pdf,.doc,.docx,.md,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {!uploadedFile ? (
                  <label htmlFor="rh-file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-200 hover:text-emerald-400 transition-colors">
                        Glissez-déposez ou cliquez pour uploader un document RH à analyser
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">
                        Formats supportés : PDF, Word (.docx), Texte (.txt), Markdown (.md) • Analyse CGFP & Légifrance
                      </p>
                    </div>
                  </label>
                ) : (
                  <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 p-3 bg-slate-900 rounded-xl border border-emerald-500/40">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold text-white block truncate max-w-xs md:max-w-md">{uploadedFile.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{Math.round(uploadedFile.size / 1024)} ko • Prêt pour l'analyse CGFP</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleAnalyzeFile}
                        disabled={isStatutLoading}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                      >
                        {isStatutLoading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                            <span>Lancer l'analyse CGFP</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setUploadedFile(null)}
                        className="p-2 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 rounded-xl transition-colors"
                        title="Retirer le fichier"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Text Search Input */}
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Ou posez votre question statutaire RH (ex: durée contrat CGFP Art. L. 332-23, IFSE RIFSEEP...)"
                  value={statutInput}
                  onChange={(e) => setStatutInput(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && statutInput.trim()) {
                      setIsStatutLoading(true);
                      const res = await queryStatutoryEngine(selectedStatutTool, statutInput);
                      setStatutResult(res);
                      setIsStatutLoading(false);
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none text-white placeholder-slate-500"
                />
                <button
                  onClick={async () => {
                    setIsStatutLoading(true);
                    const res = await queryStatutoryEngine(selectedStatutTool, statutInput || "Consultation statutaire");
                    setStatutResult(res);
                    setIsStatutLoading(false);
                  }}
                  disabled={isStatutLoading}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
                >
                  {isStatutLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Consulter Légifrance CGFP</span>
                      <Search className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>


              {/* Result Display */}
              {statutResult && (
                <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{statutResult.category}</span>
                      <h3 className="text-lg font-black text-white mt-0.5">{statutResult.title}</h3>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                      {statutResult.riskText}
                    </span>
                  </div>

                  {/* Legal Visas */}
                  <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-medium text-slate-300 flex flex-col gap-1.5">
                    <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Visas Légaux CGFP :</span>
                    <ul className="list-disc list-inside space-y-1">
                      {statutResult.legalVisas.map((v, idx) => (
                        <li key={idx} className="text-emerald-300">{v}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Sample Act Document / Code Box */}
                  {statutResult.sampleDocument && (
                    <div className="relative p-5 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(statutResult.sampleDocument || "");
                          setCopiedSuccess(true);
                          setTimeout(() => setCopiedSuccess(false), 2000);
                        }}
                        className="absolute top-3 right-3 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-sans font-bold text-[11px] transition-all shadow-md"
                      >
                        {copiedSuccess ? "✓ Copié dans le presse-papier" : "Copier l'acte / arrêté"}
                      </button>
                      <pre className="whitespace-pre-wrap font-sans text-xs">{statutResult.sampleDocument}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default VeilleJuridique;
