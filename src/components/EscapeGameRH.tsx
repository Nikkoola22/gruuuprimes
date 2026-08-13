import React, { useState } from "react";
import { 
  Key, Lock, LockKeyhole, LogOut, ArrowLeft, 
  RotateCcw, 
  BookOpen, 
  FileText, 
  ShieldAlert, 
  Trophy, 
  HelpCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building2,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EscapeGameRHProps {
  onClose: () => void;
}

type ChoiceType = "bon" | "risque" | "interdit";

interface Choice {
  label: string;
  type: ChoiceType;
  feedback: string;
  score: number;
}

interface Scenario {
  id: number;
  title: string;
  theme: string;
  description: string;
  choices: Choice[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: "Surcharge de travail et RPS",
    theme: "Santé au travail • Charge",
    description: "Depuis 3 semaines, deux collègues de votre service sont absents. Les dossiers urgents s'accumulent sur votre bureau, les usagers s'impatientent et vous commencez à faire des insomnies à cause du stress lié au retard.",
    choices: [
      {
        label: "Vous demandez un entretien avec votre supérieur pour lister vos dossiers en cours, définir des priorités réalistes et consigner cette surcharge par écrit (ex: registre SST).",
        type: "bon",
        feedback: "Excellent réflexe ! Alerter sa hiérarchie de manière écrite et factuelle permet de formaliser la situation de surcharge. Cela responsabilise l'employeur et permet d'ajuster l'organisation du service de façon transparente.",
        score: 2
      },
      {
        label: "Vous décidez de faire des heures supplémentaires non déclarées le soir chez vous pour rattraper le retard, sans en informer formellement votre direction.",
        type: "risque",
        feedback: "Solution risquée... Travailler bénévolement en dehors du cadre légal masque le manque d'effectif structurel aux yeux de la direction et vous expose directement à l'épuisement professionnel (burnout).",
        score: 1
      },
      {
        label: "Vous refusez catégoriquement de traiter les nouveaux dossiers urgents en ignorant les appels des usagers et vous vous isolez en évitant d'en parler à qui que ce soit.",
        type: "interdit",
        feedback: "À éviter absolument ! L'isolement volontaire et le blocage unilatéral du traitement nuisent gravement à la continuité du service public. Cela aggrave votre stress ainsi que les tensions avec les usagers et l'équipe.",
        score: 0
      }
    ]
  },
  {
    id: 2,
    title: "Télétravail et Déconnexion",
    theme: "Temps de travail • QVT",
    description: "Vous bénéficiez de deux jours de télétravail par semaine. Votre responsable hiérarchique vous envoie régulièrement des courriels et des messages professionnels urgents à 20h30 et s'étonne que vous ne répondiez pas dans la foulée.",
    choices: [
      {
        label: "Vous répondez à chaque message tardif pour prouver votre réactivité en télétravail, quitte à sacrifier vos soirées personnelles et à vous sentir anxieux.",
        type: "risque",
        feedback: "Choix risqué... Le télétravail n'est pas un régime de disponibilité continue. Accepter sans mot dire ces débordements crée un précédent néfaste et altère votre équilibre de vie personnelle.",
        score: 1
      },
      {
        label: "Vous profitez du prochain entretien individuel pour rappeler le droit à la déconnexion garanti par la charte de la collectivité et convenez ensemble de plages horaires de contact claires.",
        type: "bon",
        feedback: "Très bon réflexe ! Le droit à la déconnexion est inscrit dans le Code du travail et les chartes de télétravail de la FPT. En parler calmement permet de poser des limites saines et professionnelles.",
        score: 2
      },
      {
        label: "Vous éteignez tout et envoyez un courriel incendiaire à 23h à l'ensemble du service pour dénoncer le harcèlement de votre responsable.",
        type: "interdit",
        feedback: "Comportement contre-productif ! Une réaction impulsive en copie générale enfreint le devoir de réserve et envenime le problème, vous mettant en tort disciplinaire au lieu de résoudre le conflit.",
        score: 0
      }
    ]
  },
  {
    id: 3,
    title: "Agression physique ou verbale d'un Usager",
    theme: "Sécurité des agents • Protection",
    description: "À l'accueil physique de la collectivité, un usager mécontent vous insulte ouvertement de manière répétée et profère des menaces physiques directes avant de quitter les lieux en colère.",
    choices: [
      {
        label: "Vous décidez de régler cela vous-même en insultant l'usager à votre tour et en sortant du comptoir d'accueil pour le confronter physiquement.",
        type: "interdit",
        feedback: "À éviter absolument ! En tant qu'agent public, vous devez faire preuve de maîtrise et respecter vos obligations professionnelles. Répondre à la violence par la violence aggrave le danger physique immédiat.",
        score: 0
      },
      {
        label: "Vous signalez l'incident immédiatement à votre encadrant, rédigez une fiche d'incident SST et sollicitez l'octroi de la protection fonctionnelle auprès de votre collectivité.",
        type: "bon",
        feedback: "Excellent réflexe ! L'employeur public a l'obligation légale de protéger ses agents contre les violences et menaces subies dans l'exercice de leurs fonctions (protection fonctionnelle). La fiche d'incident matérialise l'événement.",
        score: 2
      },
      {
        label: "Vous encaissez l'agression sans rien dire à vos collègues ni à votre responsable pour ne pas faire d'histoire, mais vous commencez à venir travailler la peur au ventre.",
        type: "risque",
        feedback: "Réponse risquée... Passer sous silence un incident grave expose l'ensemble des agents d'accueil à une récidive de cet usager et favorise le développement d'un traumatisme psychologique isolé.",
        score: 1
      }
    ]
  },
  {
    id: 4,
    title: "Danger Grave et Imminent sur un chantier",
    theme: "Prévention des risques • Retrait",
    description: "Sur un chantier de voirie communale, vous constatez que les blindages de la tranchée dans laquelle vous devez descendre sont fissurés et bougent sous la pression de la terre, menaçant de s'effondrer.",
    choices: [
      {
        label: "Vous descendez rapidement en essayant de faire au plus vite pour ne pas retarder le calendrier des travaux.",
        type: "interdit",
        feedback: "Extrêmement dangereux et interdit ! Aucun impératif de chantier ne justifie de mettre votre vie en péril. Les éboulements de tranchées sont soudains et très souvent mortels.",
        score: 0
      },
      {
        label: "Vous demandez au conducteur d'engin de rajouter une plaque de fortune non homologuée pour maintenir la terre avant de descendre travailler.",
        type: "risque",
        feedback: "Solution risquée et bricolée ! Les improvisations sur les dispositifs de sécurité ne garantissent pas votre protection et n'exonèrent pas la responsabilité de l'encadrement en cas d'accident grave.",
        score: 1
      },
      {
        label: "Vous exercez immédiatement votre droit de retrait, informez votre hiérarchie, quittez la zone dangereuse et veillez à ce que l'alerte soit consignée sur le registre officiel des dangers graves.",
        type: "bon",
        feedback: "Parfait ! Le droit de retrait est un droit fondamental individuel. Si vous avez un motif raisonnable de penser qu'une situation présente un danger grave et imminent pour votre vie ou votre santé, vous devez vous retirer et alerter.",
        score: 2
      }
    ]
  },
  {
    id: 5,
    title: "Suspicion de Harcèlement Moral",
    theme: "Dialogue social • Relations",
    description: "Vous observez qu'un collègue de bureau subit quotidiennement des remarques humiliantes, des critiques injustifiées sur son travail et des privations d'outils de la part d'un chef de service lors des réunions d'équipe.",
    choices: [
      {
        label: "Vous conseillez à votre collègue d'orienter sa démarche vers les interlocuteurs de confiance de la collectivité (RH, représentants du personnel, médecin du travail) et vous proposez de témoigner de vos observations.",
        type: "bon",
        feedback: "Excellent réflexe ! Lutter contre le harcèlement nécessite de briser l'isolement. Orienter la victime vers des relais officiels et neutres (médecine, syndicats, RH) et proposer un témoignage écrit est la démarche la plus efficace.",
        score: 2
      },
      {
        label: "Vous décidez de confronter vivement le chef de service devant tout le monde lors de la prochaine réunion pour l'obliger à s'excuser publiquement.",
        type: "risque",
        feedback: "Solution risquée. Bien que guidée par une intention solidaire, une confrontation publique directe peut envenimer la situation globale, braquer le responsable et vous exposer à des sanctions pour manquement à la subordination.",
        score: 1
      },
      {
        label: "Vous préférez rire des remarques du manager pour ne pas attirer l'attention sur vous et dites à votre collègue d'être moins sensible et de faire le dos rond.",
        type: "interdit",
        feedback: "À bannir ! Participer passivement ou minimiser des agissements constitutifs de harcèlement moral contribue à la dégradation de la santé de l'agent et nuit gravement à la cohésion éthique de l'équipe.",
        score: 0
      }
    ]
  }
];

const EscapeGameRH: React.FC<EscapeGameRHProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<"welcome" | "playing" | "results">("welcome");
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [scoresHistory, setScoresHistory] = useState<number[]>([]);
  const [userChoices, setUserChoices] = useState<number[]>([]);

  const currentScenario = SCENARIOS[currentScenarioIndex];
  const maxScenarios = SCENARIOS.length;

  const handleStart = () => {
    setScore(0);
    setCurrentScenarioIndex(0);
    setSelectedChoiceIndex(null);
    setScoresHistory([]);
    setUserChoices([]);
    setGameState("playing");
  };

  const handleChoiceSelect = (choiceIndex: number) => {
    if (selectedChoiceIndex !== null) return; // Un seul choix autorisé
    setSelectedChoiceIndex(choiceIndex);
    const chosenChoice = currentScenario.choices[choiceIndex];
    setScore((prev) => prev + chosenChoice.score);
    setScoresHistory((prev) => [...prev, chosenChoice.score]);
    setUserChoices((prev) => [...prev, choiceIndex]);
  };

  const handleNext = () => {
    if (currentScenarioIndex + 1 < maxScenarios) {
      setCurrentScenarioIndex((prev) => prev + 1);
      setSelectedChoiceIndex(null);
    } else {
      setGameState("results");
    }
  };

  const getResultsFeedback = () => {
    const percent = (score / (maxScenarios * 2)) * 100;
    if (percent >= 90) {
      return {
        level: "Expert RH & QVT",
        color: "text-emerald-400 border-emerald-500/30",
        bg: "bg-emerald-500/10",
        description: "Félicitations ! Tu as d'excellents réflexes managériaux et QVT. Tu sais identifier les dispositifs légaux d'alerte, protéger ta santé et celle de tes collaborateurs tout en respectant le cadre de la fonction publique territoriale."
      };
    } else if (percent >= 60) {
      return {
        level: "Bon Praticien",
        color: "text-amber-400 border-amber-500/30",
        bg: "bg-amber-500/10",
        description: "Globalement bon ! Tu as de bons réflexes pour désamorcer les situations délicates. Veille cependant à éviter les 'solutions de fortune' individuelles et à privilégier systématiquement les procédures d'alerte SST collectives."
      };
    } else {
      return {
        level: "Apprenti RH",
        color: "text-rose-400 border-rose-500/30",
        bg: "bg-rose-500/10",
        description: "À renforcer ! Ce module t'a permis de découvrir des dispositifs d'alerte clés (médecine de prévention, droit de retrait, protection fonctionnelle). N'hésite pas à consulter la charte QVT de ta collectivité pour consolider tes connaissances."
      };
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans min-h-screen flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950">
      
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40 mix-blend-screen">
        <div className="absolute top-0 right-10 w-96 h-96 bg-pink-500 rounded-full blur-[100px] animate-[pulse_4s_infinite]"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-cyan-400 rounded-full blur-[90px] animate-[pulse_5s_infinite]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[150px] animate-[pulse_3s_infinite]"></div>
      </div>

      {/* HEADER BAR */}
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white/10 backdrop-blur-md border-4 border-slate-900 p-4 rounded-3xl shadow-[6px_6px_0px_#1e1b4b]">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow-inner border-2 border-slate-900 rotate-[-5deg]">
              <LockKeyhole className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider" style={{ fontFamily: 'Impact, sans-serif' }}>
                Escape Game <span className="text-pink-400">RH</span>
              </h1>
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Dossiers Confidentiels</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-3 bg-rose-500 hover:bg-rose-400 border-4 border-slate-900 text-white rounded-xl shadow-[4px_4px_0px_#000] active:shadow-none active:translate-y-1 active:translate-x-1 transition-all"
            title="Quitter la mission"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
          <AnimatePresence mode="wait">

            {/* MENU VIEW */}
            {gameState === "welcome" && (
              <motion.div 
                key="welcome"
                initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.1, rotate: 2 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-full bg-white border-4 border-slate-900 rounded-[2.5rem] p-8 shadow-[12px_12px_0px_#4c1d95] relative overflow-hidden text-slate-900"
              >
                {/* Top Secret Badge */}
                <div className="absolute -top-6 -right-6 bg-yellow-400 font-black text-xs uppercase px-10 py-3 rotate-45 border-b-4 border-slate-900 shadow-sm z-20">
                  Top Secret
                </div>
                
                <div className="text-center mb-6 relative">
                  <div className="inline-flex p-4 rounded-full bg-indigo-100 border-4 border-slate-900 shadow-[6px_6px_0px_#000] text-indigo-600 mb-6 animate-bounce">
                    <Key className="w-12 h-12" />
                  </div>
                  <h2 className="text-4xl sm:text-6xl font-black mb-2 uppercase tracking-tighter" style={{ fontFamily: 'Impact, sans-serif' }}>
                    MISSION : <span className="text-indigo-600">CRISES RH</span>
                  </h2>
                  <div className="inline-block px-5 py-2 bg-pink-500 text-white font-black text-sm uppercase rounded-full border-2 border-slate-900 shadow-[4px_4px_0px_#000] -rotate-2 mt-2">
                    Votre objectif : Sauver la collectivité !
                  </div>
                </div>
                
                <p className="text-slate-700 text-base sm:text-lg leading-relaxed mb-8 font-bold text-center">
                  Attention Agent ! Des dossiers épineux vous attendent (surcharge, conflits...). À vous de trouver LA bonne solution pour débloquer la situation.
                </p>
                
                <div className="border-4 border-slate-900 bg-cyan-100 rounded-3xl p-6 mb-8 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)] relative">
                  <div className="absolute -left-4 -top-4 bg-purple-500 w-10 h-10 rounded-full border-4 border-slate-900 shadow-[2px_2px_0px_#000] flex items-center justify-center rotate-[-10deg]">
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                  </div>
                  <strong className="block mb-4 font-black uppercase tracking-wider text-lg text-slate-900 border-b-4 border-slate-900/10 pb-2">Règles d'évaluation :</strong>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-4 bg-white p-3 rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0px_#10b981]">
                      <span className="px-3 py-1 rounded bg-emerald-400 font-black text-sm border-2 border-slate-900">2 pts</span>
                      <span className="font-bold text-slate-800">Le Bon Réflexe (Bingo !)</span>
                    </li>
                    <li className="flex items-center gap-4 bg-white p-3 rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0px_#f59e0b]">
                      <span className="px-3 py-1 rounded bg-amber-400 font-black text-sm border-2 border-slate-900">1 pt</span>
                      <span className="font-bold text-slate-800">Le Choix Risqué (Oups...)</span>
                    </li>
                    <li className="flex items-center gap-4 bg-white p-3 rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0px_#f43f5e]">
                      <span className="px-3 py-1 rounded bg-rose-400 font-black text-sm border-2 border-slate-900">0 pt</span>
                      <span className="font-bold text-slate-800">Le Choix Contre-Productif (Game Over !)</span>
                    </li>
                  </ul>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleStart}
                    className="px-10 py-5 bg-indigo-500 text-white rounded-full font-black text-xl border-4 border-slate-900 shadow-[6px_6px_0px_#000] active:shadow-none active:translate-y-1.5 active:translate-x-1.5 transition-all flex items-center gap-3 uppercase hover:bg-indigo-400 group"
                  >
                    Démarrer l'enquête
                    <ArrowRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* PLAYING VIEW */}
            {gameState === "playing" && (
              <motion.div 
                key="playing"
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, y: -50 }}
                transition={{ type: "spring", bounce: 0.4 }}
                className="w-full flex flex-col gap-6"
              >
                {/* PROGRESS BAR */}
                <div className="bg-white border-4 border-slate-900 rounded-2xl p-4 shadow-[6px_6px_0px_#000] flex flex-col gap-3">
                  <div className="flex justify-between items-center text-sm font-black text-slate-800 uppercase">
                    <span>Dossier <span className="text-indigo-600 text-xl">#{currentScenarioIndex + 1}</span> / {maxScenarios}</span>
                    <span className="bg-yellow-300 px-3 py-1 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#000]">
                      {currentScenario.theme}
                    </span>
                  </div>
                  <div className="w-full h-5 bg-slate-100 rounded-full border-4 border-slate-900 overflow-hidden relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 to-indigo-500 transition-all duration-500 ease-out"
                      style={{ width: `${((currentScenarioIndex + (selectedChoiceIndex !== null ? 1 : 0)) / maxScenarios) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* SCENARIO CARD */}
                <div className="bg-white border-4 border-slate-900 rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#4c1d95] relative overflow-hidden text-slate-900">
                  <h3 className="text-2xl sm:text-3xl font-black mb-5 tracking-tight leading-tight uppercase">
                    {currentScenario.title}
                  </h3>
                  
                  <div className="bg-indigo-50 p-6 rounded-2xl border-4 border-slate-900 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.05)] text-slate-800 font-bold text-base leading-relaxed relative">
                    <div className="absolute -top-5 -left-5 text-5xl transform -rotate-12 bg-white rounded-full p-2 border-4 border-slate-900 shadow-[2px_2px_0px_#000]">🕵️</div>
                    {currentScenario.description}
                  </div>
                </div>

                {/* CHOICES */}
                <div className="space-y-4">
                  {currentScenario.choices.map((choice, index) => {
                    const isSelected = selectedChoiceIndex === index;
                    const hasAnswered = selectedChoiceIndex !== null;
                    
                    let borderStyle = "border-slate-900 bg-white hover:bg-slate-50 text-slate-800 shadow-[6px_6px_0px_#000]";
                    let badgeStyle = "bg-slate-200 text-slate-800 border-slate-900";
                    
                    if (hasAnswered) {
                      if (isSelected) {
                        if (choice.type === "bon") {
                          borderStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-none translate-y-1.5 translate-x-1.5";
                          badgeStyle = "bg-emerald-400 text-slate-900 border-slate-900 shadow-[2px_2px_0px_#000]";
                        } else if (choice.type === "risque") {
                          borderStyle = "border-amber-500 bg-amber-50 text-amber-900 shadow-none translate-y-1.5 translate-x-1.5";
                          badgeStyle = "bg-amber-400 text-slate-900 border-slate-900 shadow-[2px_2px_0px_#000]";
                        } else {
                          borderStyle = "border-rose-500 bg-rose-50 text-rose-900 shadow-none translate-y-1.5 translate-x-1.5";
                          badgeStyle = "bg-rose-400 text-slate-900 border-slate-900 shadow-[2px_2px_0px_#000]";
                        }
                      } else {
                        borderStyle = "border-slate-300 bg-slate-100 text-slate-400 shadow-none opacity-60";
                        badgeStyle = "bg-slate-200 border-slate-300 text-slate-400";
                      }
                    } else {
                      borderStyle += " active:shadow-none active:translate-y-1.5 active:translate-x-1.5 cursor-pointer";
                    }

                    return (
                      <button
                        key={index}
                        disabled={hasAnswered}
                        onClick={() => handleChoiceSelect(index)}
                        className={`w-full p-4 sm:p-5 rounded-2xl border-4 transition-all text-left flex items-start gap-4 ${borderStyle}`}
                      >
                        <div className={`w-12 h-12 rounded-xl border-4 flex items-center justify-center text-lg shrink-0 font-black ${badgeStyle}`}>
                          {hasAnswered && isSelected ? (
                            choice.type === "bon" ? <CheckCircle2 className="w-7 h-7" /> :
                            choice.type === "risque" ? <AlertTriangle className="w-7 h-7" /> :
                            <XCircle className="w-7 h-7" />
                          ) : (
                            String.fromCharCode(65 + index)
                          )}
                        </div>
                        <div className="flex-1 mt-1">
                          {isSelected && (
                            <span className={`text-xs uppercase tracking-widest font-black px-3 py-1 rounded-lg mb-2 inline-block border-4 ${
                              choice.type === "bon" ? "bg-emerald-400 text-slate-900 border-slate-900 shadow-[2px_2px_0px_#000]" :
                              choice.type === "risque" ? "bg-amber-300 text-slate-900 border-slate-900 shadow-[2px_2px_0px_#000]" :
                              "bg-rose-400 text-white border-slate-900 shadow-[2px_2px_0px_#000]"
                            }`}>
                              Ta décision
                            </span>
                          )}
                          <p className="text-base sm:text-lg font-black leading-relaxed">
                            {choice.label}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* FEEDBACK EXPLANATION PANEL */}
                <AnimatePresence>
                  {selectedChoiceIndex !== null && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className={`rounded-3xl p-6 sm:p-8 border-4 border-slate-900 text-left shadow-[8px_8px_0px_rgba(0,0,0,1)] relative overflow-hidden ${
                        currentScenario.choices[selectedChoiceIndex].type === "bon"
                          ? "bg-emerald-100"
                          : currentScenario.choices[selectedChoiceIndex].type === "risque"
                          ? "bg-amber-100"
                          : "bg-rose-100"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap border-b-4 border-slate-900/10 pb-4">
                        <div className="flex items-center gap-3">
                          {currentScenario.choices[selectedChoiceIndex].type === "bon" && (
                            <div className="px-5 py-2 bg-emerald-400 border-4 border-slate-900 rounded-xl flex items-center gap-2 shadow-[4px_4px_0px_#000] rotate-[-2deg]">
                              <CheckCircle2 className="w-6 h-6 text-slate-900" />
                              <span className="font-black text-slate-900 text-sm uppercase tracking-wider">C'est gagné ! (+2 pts)</span>
                            </div>
                          )}
                          {currentScenario.choices[selectedChoiceIndex].type === "risque" && (
                            <div className="px-5 py-2 bg-amber-400 border-4 border-slate-900 rounded-xl flex items-center gap-2 shadow-[4px_4px_0px_#000] rotate-[2deg]">
                              <AlertTriangle className="w-6 h-6 text-slate-900" />
                              <span className="font-black text-slate-900 text-sm uppercase tracking-wider">Limite Limite... (+1 pt)</span>
                            </div>
                          )}
                          {currentScenario.choices[selectedChoiceIndex].type === "interdit" && (
                            <div className="px-5 py-2 bg-rose-400 border-4 border-slate-900 rounded-xl flex items-center gap-2 shadow-[4px_4px_0px_#000] rotate-[-2deg]">
                              <XCircle className="w-6 h-6 text-slate-900" />
                              <span className="font-black text-slate-900 text-sm uppercase tracking-wider">Erreur Fatale ! (+0 pt)</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl p-6 border-4 border-slate-900 mb-8 shadow-inner text-slate-900">
                        <h4 className="text-base font-black text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Sparkles className="w-6 h-6" />
                          Débrief de l'Expert
                        </h4>
                        <p className="text-base leading-relaxed font-bold">
                          {currentScenario.choices[selectedChoiceIndex].feedback}
                        </p>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={handleNext}
                          className="px-8 py-4 bg-indigo-500 text-white rounded-2xl font-black text-lg border-4 border-slate-900 shadow-[6px_6px_0px_#000] active:shadow-none active:translate-y-1.5 active:translate-x-1.5 transition-all flex items-center gap-3 uppercase tracking-wider hover:bg-indigo-400 group"
                        >
                          <span>{currentScenarioIndex + 1 >= maxScenarios ? "Ouvrir le coffre final" : "Dossier Suivant"}</span>
                          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            )}

            {/* RESULTS VIEW */}
            {gameState === "results" && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, scale: 0.8, rotate: 2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                className="w-full bg-white border-4 border-slate-900 rounded-[3rem] p-8 sm:p-10 text-center shadow-[12px_12px_0px_#0ea5e9] relative overflow-hidden flex flex-col gap-8 text-slate-900"
              >
                <div>
                  <div className="inline-flex p-6 rounded-full bg-yellow-300 border-4 border-slate-900 mb-6 shadow-[6px_6px_0px_#000] animate-[bounce_2s_infinite]">
                    <Trophy className="w-16 h-16 text-slate-900" />
                  </div>
                  
                  <h2 className="text-4xl sm:text-6xl font-black mb-4 uppercase tracking-tighter" style={{ fontFamily: 'Impact, sans-serif' }}>
                    MISSION ACCOMPLIE !
                  </h2>
                  
                  <p className="text-slate-600 font-bold text-base max-w-md mx-auto">
                    Le dossier est clos. Voici ton bilan de super-détective RH.
                  </p>
                </div>

                {/* Score Display */}
                <div className="flex justify-center">
                  <div className="px-12 py-8 rounded-3xl bg-slate-900 border-4 border-slate-900 shadow-[8px_8px_0px_#db2777] transform -rotate-2 hover:rotate-0 transition-transform">
                    <span className="text-sm text-slate-300 uppercase font-black tracking-widest block mb-2">Score Final</span>
                    <span className="text-6xl sm:text-7xl font-black text-yellow-400 block drop-shadow-[0_4px_0px_rgba(0,0,0,0.8)]">
                      {score} <span className="text-4xl text-slate-400">/ {maxScenarios * 2}</span>
                    </span>
                  </div>
                </div>

                {/* Evaluation Paragraph */}
                <div className={`p-8 rounded-3xl border-4 border-slate-900 shadow-[6px_6px_0px_#000] text-left relative overflow-hidden ${getResultsFeedback().bg}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-7 h-7 text-slate-900" />
                    <span className="text-sm uppercase font-black tracking-wider text-slate-900 opacity-80">Profil Débloqué :</span>
                  </div>
                  <h4 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 uppercase tracking-tighter" style={{ fontFamily: 'Impact, sans-serif' }}>
                    {getResultsFeedback().level}
                  </h4>
                  <p className="text-slate-800 text-base sm:text-lg leading-relaxed font-bold">
                    {getResultsFeedback().description}
                  </p>
                </div>

                {/* RECAP OF RESPONSES AND FEEDBACK */}
                <div className="border-4 border-slate-900 bg-slate-100 rounded-3xl p-6 text-left shadow-inner">
                  <h4 className="text-base font-black text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-3 border-b-4 border-slate-900/10 pb-4">
                    <BookOpen className="w-6 h-6 text-indigo-600" />
                    Dossiers Résolus (Historique) :
                  </h4>

                  <div className="space-y-6">
                    {SCENARIOS.map((scenario, sIndex) => {
                      const chosenIndex = userChoices[sIndex];
                      const chosenChoice = scenario.choices[chosenIndex];
                      const bestChoice = scenario.choices.find((c) => c.type === "bon");

                      return (
                        <div key={scenario.id} className="bg-white border-4 border-slate-900 rounded-2xl p-6 space-y-5 shadow-[4px_4px_0px_#94a3b8]">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <span className="text-sm font-black text-slate-900 bg-cyan-300 px-4 py-2 rounded-xl border-4 border-slate-900 uppercase shadow-[2px_2px_0px_#000]">
                              Dossier {sIndex + 1} : {scenario.title}
                            </span>
                            <span className="text-sm font-bold text-slate-500 uppercase bg-slate-200 px-3 py-1 rounded-lg">
                              {scenario.theme}
                            </span>
                          </div>

                          {chosenChoice && (
                            <div className={`p-5 rounded-xl border-4 font-bold space-y-3 ${
                              chosenChoice.type === "bon" 
                                ? "bg-emerald-100 border-emerald-500 text-slate-900" 
                                : chosenChoice.type === "risque" 
                                ? "bg-amber-100 border-amber-500 text-slate-900" 
                                : "bg-rose-100 border-rose-500 text-slate-900"
                            }`}>
                              <div className="flex items-center gap-3 font-black uppercase tracking-wider text-sm">
                                {chosenChoice.type === "bon" && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                                {chosenChoice.type === "risque" && <AlertTriangle className="w-6 h-6 text-amber-600" />}
                                {chosenChoice.type === "interdit" && <XCircle className="w-6 h-6 text-rose-600" />}
                                <span>Ta décision ({chosenChoice.score} pt{chosenChoice.score > 1 ? "s" : ""}) :</span>
                              </div>
                              <p className="text-slate-800 text-base">
                                {chosenChoice.label}
                              </p>
                            </div>
                          )}

                          {chosenChoice && chosenChoice.type !== "bon" && bestChoice && (
                            <div className="bg-slate-50 border-4 border-slate-300 p-5 rounded-xl space-y-2 border-dashed">
                              <div className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-wider text-sm">
                                <CheckCircle2 className="w-5 h-5" />
                                La solution parfaite (2 pts) :
                              </div>
                              <p className="text-slate-700 font-bold text-base">{bestChoice.label}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-5 mt-6">
                  <button
                    onClick={handleStart}
                    className="px-8 py-5 bg-yellow-400 text-slate-900 rounded-2xl font-black text-base uppercase shadow-[6px_6px_0px_#000] active:shadow-none active:translate-y-1.5 active:translate-x-1.5 border-4 border-slate-900 transition-all flex items-center justify-center gap-3"
                  >
                    <RotateCcw className="w-6 h-6" />
                    Rejouer la mission
                  </button>
                  <button
                    onClick={onClose}
                    className="px-8 py-5 bg-rose-500 text-white rounded-2xl font-black text-base uppercase shadow-[6px_6px_0px_#000] active:shadow-none active:translate-y-1.5 active:translate-x-1.5 border-4 border-slate-900 transition-all flex items-center justify-center gap-3"
                  >
                    <ArrowLeft className="w-6 h-6" />
                    Retour aux jeux
                  </button>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default EscapeGameRH;
