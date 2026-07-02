import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Building2, Users, Landmark, HeartHandshake,
  TrendingUp, TrendingDown, Play, AlertTriangle, Trophy,
  FileText, CheckCircle2, XCircle, RotateCcw, Briefcase, Gavel, Newspaper, Megaphone, Clock, Droplets, Bug
} from 'lucide-react';

interface TycoonProps {
  onClose: () => void;
}

interface Action {
  text: string;
  impact: {
    budget: number; // in k€
    agents: number; // in %
    elus: number;   // in %
    service: number;// in %
  };
}
interface GameEvent {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  image?: string;
  actions: Action[];
}

const ALL_EVENTS: GameEvent[] = [
  {
    id: "police_municipale",
    title: "Crise Sécuritaire",
    description: "Le Maire exige le recrutement immédiat de 5 agents de Police Municipale suite à des incivilités, mais le budget n'était pas prévu.",
    icon: AlertTriangle,
    image: "/images/tycoon/tycoon_police.png",
    actions: [
      { text: "Recruter des contractuels (Rapide)", impact: { budget: -150, agents: -5, elus: +15, service: +10 } },
      { text: "Ouvrir un concours (Lent)", impact: { budget: -80, agents: +5, elus: -10, service: +5 } },
      { text: "Refuser (Pas de budget)", impact: { budget: 0, agents: 0, elus: -20, service: -15 } }
    ]
  },
  {
    id: "greve_cantine",
    title: "Préavis de Grève - Cantines",
    description: "Les agents des cantines scolaires menacent de faire grève si le RIFSEEP n'est pas réévalué. Les parents d'élèves font pression sur les élus.",
    icon: Users,
    image: "/images/tycoon/tycoon_strike.png",
    actions: [
      { text: "Augmenter le RIFSEEP (+200k€)", impact: { budget: -200, agents: +20, elus: +5, service: +15 } },
      { text: "Négocier une prime exceptionnelle", impact: { budget: -80, agents: +5, elus: 0, service: 0 } },
      { text: "Tenir bon face à la grève", impact: { budget: 0, agents: -20, elus: -10, service: -25 } }
    ]
  },
  {
    id: "pic_maladie",
    title: "Pic Hivernal d'Arrêts Maladie",
    description: "L'épidémie de grippe décime le service de l'État Civil. La file d'attente s'allonge et la qualité du service public s'effondre.",
    icon: HeartHandshake,
    image: "/images/tycoon/tycoon_health.png",
    actions: [
      { text: "Prestations intérimaires", impact: { budget: -100, agents: -5, elus: +5, service: +20 } },
      { text: "Heures supplémentaires pour les présents", impact: { budget: -60, agents: -15, elus: +5, service: +10 } },
      { text: "Fermer temporairement les annexes", impact: { budget: 0, agents: +5, elus: -15, service: -20 } }
    ]
  },
  {
    id: "reforme_retraite",
    title: "Vague de Départs à la Retraite",
    description: "Un service entier d'urbanisme voit ses cadres partir à la retraite d'un coup. La perte d'expertise est critique.",
    icon: Landmark,
    image: "/images/tycoon/tycoon_retirement.png",
    actions: [
      { text: "Plan de tuilage (Doublons sur 6 mois)", impact: { budget: -250, agents: +15, elus: +10, service: +15 } },
      { text: "Promotions internes accélérées", impact: { budget: -50, agents: +20, elus: -5, service: -10 } },
      { text: "Remplacer au fur et à mesure", impact: { budget: +50, agents: -15, elus: 0, service: -20 } }
    ]
  },
  {
    id: "informatique_hack",
    title: "Cyberattaque sur le SIRH",
    description: "Le logiciel de paie est paralysé par un ransomware. Les agents s'inquiètent pour leur salaire du mois.",
    icon: AlertTriangle,
    image: "/images/tycoon/tycoon_hack.png",
    actions: [
      { text: "Payer la rançon (Illégal !)", impact: { budget: -300, agents: +10, elus: -30, service: +5 } },
      { text: "Cellule de crise RH avec heures supp'", impact: { budget: -120, agents: -10, elus: +10, service: 0 } },
      { text: "Paie forfaitaire en urgence", impact: { budget: 0, agents: -20, elus: -5, service: -10 } }
    ]
  },
  {
    id: "canicule",
    title: "Alerte Canicule",
    description: "Les températures explosent. Les syndicats demandent l'adaptation des horaires et l'installation de climatiseurs.",
    icon: Building2,
    image: "/images/tycoon/tycoon_weather.png",
    actions: [
      { text: "Achat de clims & horaires d'été", impact: { budget: -150, agents: +25, elus: +5, service: +5 } },
      { text: "Télétravail massif exceptionnel", impact: { budget: 0, agents: +15, elus: -10, service: -5 } },
      { text: "Distribution de bouteilles d'eau", impact: { budget: -10, agents: -20, elus: 0, service: 0 } }
    ]
  },
  {
    id: "elections",
    title: "Approche des Élections",
    description: "Les élections municipales ont lieu l'année prochaine. Le Maire exige que la satisfaction publique et la sienne soient au plus haut, coûte que coûte.",
    icon: Megaphone,
    image: "/images/tycoon/tycoon_politics.png",
    actions: [
      { text: "Gel des impôts & Titularisations massives", impact: { budget: -400, agents: +25, elus: +30, service: +10 } },
      { text: "Petites primes électoralistes", impact: { budget: -100, agents: +10, elus: +15, service: 0 } },
      { text: "Ignorer la pression politique", impact: { budget: +50, agents: -5, elus: -35, service: 0 } }
    ]
  },
  {
    id: "audit",
    title: "Audit de la Chambre Régionale des Comptes",
    description: "La Chambre Régionale pointe du doigt la masse salariale excessive de la commune. Vous devez trouver des économies.",
    icon: Gavel,
    image: "/images/tycoon/tycoon_finance.png",
    actions: [
      { text: "Non-renouvellement de 20 contractuels", impact: { budget: +300, agents: -25, elus: +10, service: -15 } },
      { text: "Gel du point d'indice (localement)", impact: { budget: +150, agents: -30, elus: +5, service: 0 } },
      { text: "Défendre le modèle social actuel", impact: { budget: 0, agents: +15, elus: -20, service: 0 } }
    ]
  },
  {
    id: "demissions",
    title: "Hémorragie des Talents",
    description: "Les ingénieurs du service informatique démissionnent un par un pour le secteur privé, attirés par de meilleurs salaires.",
    icon: Briefcase,
    image: "/images/tycoon/tycoon_hrcrisis.png",
    actions: [
      { text: "Aligner les salaires (Contrats de projet)", impact: { budget: -200, agents: +5, elus: -10, service: +20 } },
      { text: "Embaucher des profils juniors", impact: { budget: -50, agents: 0, elus: +5, service: -15 } },
      { text: "Externaliser le service (Presta)", impact: { budget: -250, agents: -15, elus: +10, service: +5 } }
    ]
  },
  {
    id: "nouveau_decret",
    title: "Nouveau Décret Gouvernemental",
    description: "L'État impose une nouvelle prime obligatoire (Ségur, etc.) pour une partie de vos agents. Ce n'était pas budgété.",
    icon: Newspaper,
    image: "/images/tycoon/tycoon_finance.png",
    actions: [
      { text: "Appliquer immédiatement (Emprunt)", impact: { budget: -250, agents: +25, elus: -10, service: 0 } },
      { text: "Lisser l'application sur 3 ans", impact: { budget: -80, agents: -10, elus: +5, service: 0 } },
      { text: "Attendre les recours juridiques", impact: { budget: 0, agents: -25, elus: -15, service: -5 } }
    ]
  },
  {
    id: "heures_supp",
    title: "Dépassement du Plafond d'Heures Supp",
    description: "Les agents de la voirie ont explosé leur quota d'heures supplémentaires à cause des récentes intempéries. Ils exigent d'être payés.",
    icon: Clock,
    image: "/images/tycoon/tycoon_hrcrisis.png",
    actions: [
      { text: "Payer toutes les heures majorées", impact: { budget: -180, agents: +20, elus: -5, service: +5 } },
      { text: "Placer en récupération obligatoire", impact: { budget: 0, agents: -10, elus: +5, service: -20 } },
      { text: "Refuser le paiement (Non autorisé)", impact: { budget: +50, agents: -35, elus: -10, service: -10 } }
    ]
  },
  {
    id: "visite_ministre",
    title: "Visite Ministérielle Surprise",
    description: "Un Ministre vient inaugurer la nouvelle crèche dans 48h. Le Maire veut que tout le personnel soit mobilisé pour que tout soit parfait.",
    icon: Trophy,
    image: "/images/tycoon/tycoon_politics.png",
    actions: [
      { text: "Mobilisation générale avec primes", impact: { budget: -100, agents: +10, elus: +25, service: +15 } },
      { text: "Réquisition sans contrepartie", impact: { budget: 0, agents: -25, elus: +20, service: +5 } },
      { text: "Maintenir l'organisation normale", impact: { budget: 0, agents: +5, elus: -30, service: -5 } }
    ]
  },
  {
    id: "punaises_lit",
    title: "Invasion de Punaises de Lit",
    description: "Les bureaux de l'Action Sociale sont infestés. Les agents exercent leur droit de retrait et le public ne peut plus être reçu.",
    icon: Bug,
    image: "/images/tycoon/tycoon_pest.png",
    actions: [
      { text: "Fermeture & Traitement d'urgence", impact: { budget: -120, agents: +15, elus: -5, service: -15 } },
      { text: "Reloger le service (Location modulaire)", impact: { budget: -200, agents: +10, elus: +5, service: +10 } },
      { text: "Ignorer (Demander aux agents de rester)", impact: { budget: 0, agents: -40, elus: -15, service: -30 } }
    ]
  },
  {
    id: "inondations",
    title: "Inondations dans les Écoles",
    description: "De violents orages ont inondé 3 écoles. Il faut nettoyer en urgence avant la rentrée scolaire de lundi !",
    icon: Droplets,
    image: "/images/tycoon/tycoon_weather.png",
    actions: [
      { text: "Appel à une société de nettoyage privée", impact: { budget: -250, agents: 0, elus: +15, service: +20 } },
      { text: "Mobiliser les agents techniques en week-end", impact: { budget: -80, agents: -20, elus: +10, service: +15 } },
      { text: "Repousser la rentrée scolaire", impact: { budget: 0, agents: +10, elus: -25, service: -30 } }
    ]
  },
  {
    id: "greve_nationale",
    title: "Mouvement Social National",
    description: "Une grève nationale paralyse les transports. De nombreux agents ne peuvent pas venir travailler, perturbant fortement les services.",
    icon: AlertTriangle,
    image: "/images/tycoon/tycoon_strike.png",
    actions: [
      { text: "Tolérance (Absence justifiée)", impact: { budget: 0, agents: +15, elus: -10, service: -20 } },
      { text: "Exiger des jours de congés", impact: { budget: +50, agents: -20, elus: +10, service: -10 } },
      { text: "Mettre en place des navettes privées", impact: { budget: -150, agents: +10, elus: +5, service: +15 } }
    ]
  },
  {
    id: "refonte_rifseep",
    title: "Refonte du RIFSEEP",
    description: "Le Maire veut revoir le régime indemnitaire au mérite. Les syndicats sont vent debout contre l'introduction du CIA.",
    icon: FileText,
    image: "/images/tycoon/tycoon_finance.png",
    actions: [
      { text: "Passage en force (Vote au Conseil)", impact: { budget: -50, agents: -30, elus: +20, service: -10 } },
      { text: "Concertation longue (Ateliers)", impact: { budget: -20, agents: +10, elus: -15, service: 0 } },
      { text: "Reculer et maintenir l'ancien système", impact: { budget: 0, agents: +20, elus: -25, service: +5 } }
    ]
  },
  {
    id: "bad_buzz_presse",
    title: "Bad Buzz dans la Presse Locale",
    description: "Un article dénonce les conditions de travail au Centre Technique Municipal. Le Maire est furieux et exige des sanctions ou une communication.",
    icon: Newspaper,
    image: "/images/tycoon/tycoon_media.png",
    actions: [
      { text: "Sanctionner les agents identifiés", impact: { budget: 0, agents: -30, elus: +15, service: -10 } },
      { text: "Plan d'action Qualité de Vie", impact: { budget: -200, agents: +25, elus: -10, service: +15 } },
      { text: "Démenti officiel du Cabinet", impact: { budget: -50, agents: -15, elus: +20, service: 0 } }
    ]
  },
  {
    id: "nouveau_logiciel",
    title: "Déploiement du Nouveau Logiciel",
    description: "Le nouveau SIRH est en panne le jour de la clôture de la paie. Panique dans les services !",
    icon: Bug,
    image: "/images/tycoon/tycoon_hack.png",
    actions: [
      { text: "Intervention du prestataire (Urgence)", impact: { budget: -150, agents: -5, elus: +5, service: +10 } },
      { text: "Saisie manuelle nocturne (Heures supp)", impact: { budget: -80, agents: -20, elus: +10, service: 0 } },
      { text: "Repousser la paie d'une semaine", impact: { budget: 0, agents: -35, elus: -20, service: -15 } }
    ]
  },
  {
    id: "fete_personnel",
    title: "Fête Annuelle du Personnel",
    description: "C'est l'heure de la fête du personnel. L'amicale réclame une subvention exceptionnelle pour inviter un groupe de musique.",
    icon: HeartHandshake,
    image: "/images/tycoon/tycoon_celebration.png",
    actions: [
      { text: "Accorder la super subvention", impact: { budget: -100, agents: +25, elus: -5, service: 0 } },
      { text: "Budget standard (Buffet froid)", impact: { budget: -30, agents: +5, elus: +5, service: 0 } },
      { text: "Annuler pour raisons budgétaires", impact: { budget: +50, agents: -30, elus: +15, service: -5 } }
    ]
  },
  {
    id: "harcelement",
    title: "Plainte pour Harcèlement",
    description: "Un agent accuse un cadre très apprécié du Maire de harcèlement moral. L'ambiance est délétère.",
    icon: Gavel,
    image: "/images/tycoon/tycoon_hrcrisis.png",
    actions: [
      { text: "Enquête administrative externe", impact: { budget: -80, agents: +15, elus: -15, service: 0 } },
      { text: "Changer l'agent de service", impact: { budget: -20, agents: -20, elus: +10, service: -5 } },
      { text: "Médiation interne (Rapide)", impact: { budget: 0, agents: -5, elus: +5, service: 0 } }
    ]
  },
  {
    id: "elections_pro",
    title: "Élections Professionnelles (CST)",
    description: "La tension monte avec la campagne électorale syndicale. Les demandes de dispenses d'activité pleuvent.",
    icon: Users,
    image: "/images/tycoon/tycoon_politics.png",
    actions: [
      { text: "Accorder plus d'heures syndicales", impact: { budget: -50, agents: +20, elus: -10, service: -15 } },
      { text: "Strict respect de la loi (Tensions)", impact: { budget: 0, agents: -15, elus: +15, service: +5 } },
      { text: "Débats organisés sur le temps de travail", impact: { budget: -20, agents: +10, elus: -5, service: -10 } }
    ]
  },
  {
    id: "inspection_travail",
    title: "Visite de l'Inspection du Travail",
    description: "Des manquements graves à la sécurité ont été constatés dans les ateliers municipaux (EPI manquants, machines vétustes).",
    icon: AlertTriangle,
    image: "/images/tycoon/tycoon_hrcrisis.png",
    actions: [
      { text: "Achat massif d'EPI et rénovation", impact: { budget: -250, agents: +15, elus: -10, service: +10 } },
      { text: "Fermeture partielle de l'atelier", impact: { budget: 0, agents: -10, elus: -15, service: -25 } },
      { text: "Plan de conformité étalé sur 2 ans", impact: { budget: -80, agents: 0, elus: +5, service: -5 } }
    ]
  },
  {
    id: "fusion_services",
    title: "Fusion de Services",
    description: "Le DGS décide de fusionner le service Culture et le service Sport. Les équipes refusent de travailler ensemble.",
    icon: Briefcase,
    image: "/images/tycoon/tycoon_retirement.png",
    actions: [
      { text: "Séminaire de cohésion (Coûteux)", impact: { budget: -120, agents: +15, elus: -5, service: +10 } },
      { text: "Imposer la nouvelle hiérarchie", impact: { budget: 0, agents: -25, elus: +15, service: -10 } },
      { text: "Accorder des primes de réorganisation", impact: { budget: -150, agents: +20, elus: -10, service: +5 } }
    ]
  },
  {
    id: "prime_inflation",
    title: "Prime de Pouvoir d'Achat",
    description: "Avec l'inflation, les syndicats réclament le versement de la prime exceptionnelle de pouvoir d'achat.",
    icon: Landmark,
    image: "/images/tycoon/tycoon_finance.png",
    actions: [
      { text: "Verser le montant maximum à tous", impact: { budget: -350, agents: +35, elus: -15, service: +5 } },
      { text: "Verser un montant modulé (Minima)", impact: { budget: -150, agents: +10, elus: +10, service: 0 } },
      { text: "Refuser (Pas d'obligation légale)", impact: { budget: 0, agents: -35, elus: +20, service: -5 } }
    ]
  },
  {
    id: "sobriete_energetique",
    title: "Plan de Sobriété Énergétique",
    description: "Chauffage baissé à 19°C dans les bureaux. Les agents viennent avec des plaids et se plaignent d'être malades.",
    icon: Droplets,
    image: "/images/tycoon/tycoon_weather.png",
    actions: [
      { text: "Acheter des polaires logotées", impact: { budget: -60, agents: +15, elus: +10, service: 0 } },
      { text: "Tolérer les radiateurs d'appoint", impact: { budget: -40, agents: +20, elus: -15, service: 0 } },
      { text: "Rappel à l'ordre strict", impact: { budget: 0, agents: -20, elus: +5, service: -5 } }
    ]
  },
  {
    id: "jo_2024",
    title: "Préparation des Jeux Olympiques",
    description: "La ville accueille des épreuves. Les congés d'été sont interdits pour la police municipale et les techniques.",
    icon: Trophy,
    image: "/images/tycoon/tycoon_celebration.png",
    actions: [
      { text: "Prime JO très généreuse", impact: { budget: -300, agents: +25, elus: +10, service: +20 } },
      { text: "Compensation en repos (CET)", impact: { budget: -50, agents: -5, elus: +15, service: +10 } },
      { text: "Refuser toute compensation", impact: { budget: 0, agents: -40, elus: -20, service: -20 } }
    ]
  }
];

const TycoonCollectivite: React.FC<TycoonProps> = ({ onClose }) => {
  // Game State
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameover" | "victory">("menu");
  
  // Gauges
  const [budget, setBudget] = useState(1000); // k€
  const [agentsSat, setAgentsSat] = useState(60); // %
  const [elusSat, setElusSat] = useState(60); // %
  const [servicePub, setServicePub] = useState(70); // %
  
  const [month, setMonth] = useState(1);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [eventPool, setEventPool] = useState<GameEvent[]>([]);
  const [log, setLog] = useState<{month: number, text: string, type: "good" | "bad" | "neutral"}[]>([]);
  const [failReason, setFailReason] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameState === "playing" && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentEvent, gameState]);

  const initGame = () => {
    setBudget(1000);
    setAgentsSat(60);
    setElusSat(60);
    setServicePub(70);
    setMonth(1);
    setLog([]);
    
    // Shuffle and pick 12 events (we duplicate if not enough)
        let pool = [...ALL_EVENTS].sort(() => Math.random() - 0.5).slice(0, 24);
    setEventPool(pool);
    setCurrentEvent(pool[0]);
    
    setGameState("playing");
  };

  const handleAction = (action: Action) => {
    const newBudget = budget + action.impact.budget;
    const newAgents = Math.min(100, Math.max(0, agentsSat + action.impact.agents));
    const newElus = Math.min(100, Math.max(0, elusSat + action.impact.elus));
    const newService = Math.min(100, Math.max(0, servicePub + action.impact.service));

    setBudget(newBudget);
    setAgentsSat(newAgents);
    setElusSat(newElus);
    setServicePub(newService);

    // Logging
    const impactText = `Mois ${month} : Action choisie - "${action.text}"`;
    const logType = (action.impact.agents > 0 || action.impact.service > 0) ? "good" : (action.impact.agents < 0 || action.impact.service < 0) ? "bad" : "neutral";
    setLog(prev => [{month, text: impactText, type: logType}, ...prev]);

    // Check Game Over Conditions
    if (newBudget < 0) {
      setFailReason("Mise sous tutelle de la préfecture (Budget épuisé).");
      setGameState("gameover");
      return;
    }
    if (newAgents <= 0) {
      setFailReason("Grève générale illimitée. Le service RH est assiégé.");
      setGameState("gameover");
      return;
    }
    if (newElus <= 0) {
      setFailReason("Désaveu total du Maire. Vous êtes révoqué de votre poste.");
      setGameState("gameover");
      return;
    }
    if (newService <= 0) {
      setFailReason("Rupture totale du service public. Les administrés se révoltent.");
      setGameState("gameover");
      return;
    }

    // Next Month
    if (month >= 24) {
      setGameState("victory");
    } else {
      setMonth(m => m + 1);
      setCurrentEvent(eventPool[month]); // month is 1-indexed for display, but 0-indexed array. month 1 -> index 1.
    }
  };

  const GaugeCard = ({ title, value, icon: Icon, colorClass, type }: { title: string, value: number, icon: any, colorClass: string, type: "currency" | "percent" }) => {
    const isCritical = type === "percent" ? value <= 20 : value <= 200;
    
    return (
      <div className={`bg-slate-800/60 backdrop-blur-xl border ${isCritical ? 'border-red-500/50 animate-pulse' : 'border-slate-700'} rounded-2xl p-4 flex flex-col items-center shadow-lg transition-all`}>
        <div className={`p-3 rounded-full mb-2 bg-slate-900 shadow-inner`}>
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">{title}</span>
        <span className={`text-2xl font-bold ${colorClass}`}>
          {value}{type === "percent" ? "%" : " k€"}
        </span>
        
        {type === "percent" && (
          <div className="w-full bg-slate-700 h-2 mt-3 rounded-full overflow-hidden">
            <div 
              className={`h-full ${value > 50 ? 'bg-emerald-500' : value > 20 ? 'bg-amber-500' : 'bg-red-500'} transition-all duration-1000 ease-out`} 
              style={{ width: `${value}%` }} 
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative z-30 isolate min-h-screen flex flex-col pt-6 sm:pt-10 bg-slate-950 transition-colors duration-500  px-4 font-sans text-slate-100">
      
      {/* Background Ornaments */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-900/20 blur-[150px]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10 flex flex-col h-full">
        
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-8">
          <button onClick={onClose} className="flex items-center gap-2 px-5 .5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-full font-semibold transition-all shadow-md">
            <ArrowLeft className="w-4 h-4" /> Quitter
          </button>
          
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Gennevilliers City
            </h1>
          </div>
          
          <div className="px-5 .5 bg-slate-800 border border-slate-700 rounded-full font-bold text-slate-300">
            {gameState === "playing" ? `Mois ${month} / 24` : "Bilan"}
          </div>
        </div>

        {/* Menu Screen */}
        {gameState === "menu" && (
          <div className="flex-1 flex items-center justify-center min-h-[60vh]">
            <div className="bg-slate-800/50 backdrop-blur-2xl border border-slate-700/50 p-12 rounded-3xl text-center max-w-2xl shadow-2xl">
              <Landmark className="w-24 h-24 text-blue-500 mx-auto mb-6" />
              <h2 className="text-4xl font-bold mb-4">Directrice Générale des Services</h2>
              <p className="text-lg text-slate-400 mb-8 font-light">
                Bienvenue dans votre nouvelle collectivité territoriale. Vous avez 2 ans (24 tours) pour gérer le budget, calmer les syndicats, satisfaire les élus et maintenir le service public. Chaque décision aura des conséquences...
              </p>
              <button 
                onClick={initGame}
                className="px-10  bg-blue-600 hover:bg-blue-500 text-white text-xl font-bold rounded-2xl shadow-lg hover:shadow-blue-500/50 transition-all flex items-center gap-3 mx-auto"
              >
                <Play className="w-6 h-6 fill-white" /> Prendre ses fonctions
              </button>
            </div>
          </div>
        )}

        {/* End Screens */}
        {(gameState === "gameover" || gameState === "victory") && (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
            <div className={`bg-slate-800/80 backdrop-blur-xl border ${gameState === 'victory' ? 'border-emerald-500/50' : 'border-red-500/50'} p-10 rounded-3xl text-center max-w-lg shadow-2xl animate-fade-in`}>
              {gameState === "victory" ? (
                <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
              ) : (
                <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
              )}
              <h2 className="text-3xl font-bold mb-2">
                {gameState === "victory" ? "Année Clôturée avec Succès !" : "Révocation Immédiate !"}
              </h2>
              <p className="text-slate-300 mb-6">
                {gameState === "victory" ? "Félicitations, vous avez survécu à 24 mois de gestion RH dans la fonction publique sans vous faire lyncher !" : failReason}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8 text-left">
                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400 block mb-1">Budget Final</span>
                  <span className="font-bold text-emerald-400">{budget} k€</span>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400 block mb-1">Service Public</span>
                  <span className="font-bold text-blue-400">{servicePub}%</span>
                </div>
              </div>

              <button 
                onClick={initGame}
                className="px-8  bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 mx-auto"
              >
                <RotateCcw className="w-5 h-5" /> Recommencer une année
              </button>
            </div>
          </div>
        )}

        {/* Playing Screen */}
        {gameState === "playing" && currentEvent && (
          <div className="flex flex-col gap-6 w-full animate-fade-in">
            
            
        {/* Top Progression Bar */}
        {gameState === "playing" && (
          <div className="w-full mb-6 animate-fade-in">
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest px-1">
              <span>Début du Mandat</span>
              <span className="text-blue-400">Mois {month} / 24</span>
              <span>Bilan Annuel</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden shadow-inner flex">
              {[...Array(24)].map((_, i) => (
                <div key={i} className={`h-full flex-1 border-r border-slate-900/50 last:border-0 transition-all duration-500 ${i < month ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-transparent'}`} />
              ))}
            </div>
          </div>
        )}



            {/* Main Area */}
            <div className="flex flex-col lg:flex-row items-start gap-6 mt-4">
              
              {/* Event Card */}
              <div className="flex-[2] bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <currentEvent.icon className="w-64 h-64" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-rose-500/20 rounded-xl text-rose-400">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Dossier du Mois : <span className="text-rose-300">{currentEvent.title}</span></h2>
                  </div>
                  
                  {currentEvent.image && (
                    <div className="w-full h-48 sm:h-64 mb-6 rounded-2xl overflow-hidden border border-slate-700/50 relative shadow-inner">
                      <img 
                        src={currentEvent.image} 
                        alt={currentEvent.title} 
                        className="w-full h-full object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                    </div>
                  )}
                  
                  <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl bg-slate-900/40 p-6 rounded-2xl border border-slate-700/50">
                    {currentEvent.description}
                  </p>

                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Actions Possibles</h3>
                  <div className="grid grid-cols-1 gap-4 mt-2">
                    {currentEvent.actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAction(action)}
                        className="group flex flex-col justify-between w-full p-5 bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border-2 border-slate-700/50 hover:border-blue-500/50 rounded-2xl transition-all text-left shadow-lg relative overflow-hidden"
                      >
                        {/* Interactive hover background */}
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            {idx + 1}
                          </div>
                          <span className="font-bold text-white text-lg group-hover:text-blue-100 transition-colors">
                            {action.text}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 text-xs font-bold relative z-10 w-full bg-slate-950/50 p-2 rounded-xl border border-slate-800/50">
                          {action.impact.budget !== 0 && (
                            <div className={`flex-1 min-w-[80px] flex justify-center items-center px-3 .5 rounded-lg border ${action.impact.budget > 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                              {action.impact.budget > 0 ? '+' : ''}{action.impact.budget}k€
                            </div>
                          )}
                          {action.impact.agents !== 0 && (
                            <div className={`flex-1 min-w-[80px] flex justify-center items-center px-3 .5 rounded-lg border ${action.impact.agents > 0 ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-red-500/10 border-red-500/30 text-red-400'} flex items-center gap-1`}>
                              {action.impact.agents > 0 ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>} Agents
                            </div>
                          )}
                          {action.impact.elus !== 0 && (
                            <div className={`flex-1 min-w-[80px] flex justify-center items-center px-3 .5 rounded-lg border ${action.impact.elus > 0 ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-red-500/10 border-red-500/30 text-red-400'} flex items-center gap-1`}>
                              {action.impact.elus > 0 ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>} Élus
                            </div>
                          )}
                          {action.impact.service !== 0 && (
                            <div className={`flex-1 min-w-[80px] flex justify-center items-center px-3 .5 rounded-lg border ${action.impact.service > 0 ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-red-500/10 border-red-500/30 text-red-400'} flex items-center gap-1`}>
                              {action.impact.service > 0 ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>} Service
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side Gauges */}
              <div className="flex-1 flex flex-col gap-4 lg:sticky lg:top-24 h-fit">
                <GaugeCard title="Budget Restant" value={budget} icon={Landmark} colorClass="text-emerald-400" type="currency" />
                <GaugeCard title="Satisfaction des Agents" value={agentsSat} icon={Users} colorClass="text-blue-400" type="percent" />
                <GaugeCard title="Satisfaction des Élus" value={elusSat} icon={Building2} colorClass="text-purple-400" type="percent" />
                <GaugeCard title="Qualité du Service Public" value={servicePub} icon={HeartHandshake} colorClass="text-rose-400" type="percent" />
              </div>
              
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(30, 41, 59, 0.5); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(71, 85, 105, 0.8); border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default TycoonCollectivite;
