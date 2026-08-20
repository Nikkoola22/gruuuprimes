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
  Copy
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
  }
];

const CATEGORIES = [
  { name: "Tous", count: 18, icon: <BookOpen className="w-3.5 h-3.5" /> },
  { name: "Contrats", count: 2, icon: <FileSignature className="w-3.5 h-3.5" /> },
  { name: "Discipline", count: 3, icon: <Gavel className="w-3.5 h-3.5" /> },
  { name: "Harcèlement moral", count: 2, icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  { name: "Management et encadrement", count: 3, icon: <UserCheck className="w-3.5 h-3.5" /> },
  { name: "Recrutement", count: 3, icon: <Sparkles className="w-3.5 h-3.5" /> },
  { name: "Temps de travail", count: 2, icon: <Clock className="w-3.5 h-3.5" /> },
  { name: "Vie Quotidienne", count: 3, icon: <Heart className="w-3.5 h-3.5" /> }
];

const mapCategoryToTab = (cat: string): string => {
  if (cat === "Procédure disciplinaire") return "Discipline";
  if (cat === "Promotion interne") return "Recrutement";
  if (cat === "Relations intimes" || cat === "Stupéfiants" || cat === "Suspension") return "Vie Quotidienne";
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
      <header className="relative z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl py-3.5 sm:py-6 border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-2xl shrink-0 transition-colors">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-6 min-w-0">
          
          {/* Header Title & Icon */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="p-2.5 sm:p-3 bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-200/80 dark:border-purple-500/30 shadow-xs flex items-center justify-center animate-pulse shrink-0">
              <Scale className="w-6 h-6 sm:w-8 sm:h-8" />
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

            {/* Quick jump to Veille CDG if provided */}
            {onNavigateToCdg && (
              <button
                type="button"
                onClick={onNavigateToCdg}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 font-bold text-xs shadow-2xs transition-colors cursor-pointer shrink-0"
                title="Consulter les actualités des 86+ CDG et CIG"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Tous les CIG</span>
              </button>
            )}

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
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 flex flex-col gap-5 sm:gap-6 overflow-y-auto">
        
        {viewMode === "fiches" ? (
          <>
            {/* Search & Filter Bar */}
            <div className="w-full flex flex-col md:flex-row gap-3 sm:gap-4 items-center bg-white/85 dark:bg-slate-900/85 p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs dark:shadow-xl backdrop-blur-xl transition-colors min-w-0">
              <div className="relative flex-grow w-full min-w-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-600 dark:text-purple-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Rechercher une décision (ex: harcèlement, congés, révocation)..."
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

            {/* Categories Horizontal Tabs */}
            <div className="w-full overflow-x-auto pb-2 flex gap-2 flex-nowrap no-scrollbar -mx-1 px-1">
              {CATEGORIES.map((cat) => {
                const isActive = activeTab === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setActiveTab(cat.name)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-bold transition-all shrink-0 cursor-pointer whitespace-nowrap ${
                      isActive 
                        ? "bg-purple-600 border-purple-500 text-white shadow-sm scale-105" 
                        : "bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? "bg-white/30 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"}`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
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

                            {/* Decision Ref stamp with wrapping */}
                            <div className="flex flex-wrap items-center justify-between gap-2 mt-1 pt-3 border-t border-slate-200/60 dark:border-slate-700/50">
                              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shrink-0">
                                ⚖️ Référence de décision :
                              </span>
                              <span className="text-xs font-black text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/40 px-3 py-1 rounded-full shadow-2xs break-words">
                                {item.decision}
                              </span>
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
