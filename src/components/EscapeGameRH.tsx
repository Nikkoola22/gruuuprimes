import React, { useState } from "react";
import { 
  ArrowLeft, 
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

  const currentScenario = SCENARIOS[currentScenarioIndex];
  const maxScenarios = SCENARIOS.length;

  const handleStart = () => {
    setScore(0);
    setCurrentScenarioIndex(0);
    setSelectedChoiceIndex(null);
    setScoresHistory([]);
    setGameState("playing");
  };

  const handleChoiceSelect = (choiceIndex: number) => {
    if (selectedChoiceIndex !== null) return; // Un seul choix autorisé
    setSelectedChoiceIndex(choiceIndex);
    const chosenChoice = currentScenario.choices[choiceIndex];
    setScore((prev) => prev + chosenChoice.score);
    setScoresHistory((prev) => [...prev, chosenChoice.score]);
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
    <div className="max-w-6xl mx-auto px-4 py-8 text-slate-100 font-sans min-h-screen flex flex-col justify-between">
      
      {/* HEADER BAR */}
      <div>
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-full transition-all text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour à l'Espace Jeux
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Escape Game RH</span>
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></div>
          </div>
        </div>

        {/* TITLE BLOCK */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 mb-3 shadow-lg">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-2 bg-gradient-to-r from-purple-400 via-pink-200 to-purple-400 bg-clip-text text-transparent">
            Escape Game RH
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto font-light">
            S'échapper des mauvaises situations de travail en adoptant les bons réflexes statutaires et QVT dans la fonction publique.
          </p>
        </div>
      </div>

      {/* WORKSPACE */}
      <div className="flex-grow flex items-center justify-center my-4">
        <AnimatePresence mode="wait">
          
          {/* WELCOME VIEW */}
          {gameState === "welcome" && (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl"></div>
              
              <h2 className="text-2xl font-bold text-purple-300 mb-4 text-center">
                Es-tu prêt à relever le défi RH ?
              </h2>
              
              <p className="text-slate-300 text-sm leading-relaxed mb-6 font-light">
                Chaque jour, les agents et managers territoriaux font face à des choix complexes : surcharge d'activité, conflits d'usagers, respect du droit d'alerte, déconnexion en télétravail...
              </p>
              
              <div className="border border-slate-800 bg-slate-950/40 rounded-2xl p-5 mb-8 text-xs text-slate-400 leading-relaxed font-light">
                <strong className="text-slate-300 block mb-2 font-semibold">🔍 Concept du jeu :</strong>
                Vous allez être confronté à <span className="text-purple-300 font-medium">5 scénarios de crise réalistes</span>. Pour chacun, choisissez la meilleure réponse :
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><span className="text-emerald-400 font-medium">Le Bon Réflexe (2 pts)</span> : préserve la QVT et s'appuie sur les bons dispositifs légaux.</li>
                  <li><span className="text-amber-400 font-medium">Le Choix Risqué (1 pt)</span> : solution temporaire improvisée qui masque le problème ou vous fragilise.</li>
                  <li><span className="text-rose-400 font-medium">Le Choix Contre-Productif (0 pt)</span> : nuit au collectif et aggrave la crise.</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleStart}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full font-bold text-sm shadow-lg hover:shadow-purple-500/20 transform hover:scale-105 transition-all flex items-center gap-2 animate-bounce"
                >
                  Commencer l'escape game
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* PLAYING VIEW */}
          {gameState === "playing" && (
            <motion.div 
              key="playing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-3xl flex flex-col gap-6"
            >
              {/* PROGRESS BAR & STAGE COUNTER */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 backdrop-blur-md flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Scénario de crise {currentScenarioIndex + 1} sur {maxScenarios}</span>
                  <span className="font-semibold text-purple-400 uppercase tracking-wider">{currentScenario.theme}</span>
                </div>
                {/* Visual bar */}
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                    style={{ width: `${((currentScenarioIndex) / maxScenarios) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* SITUATION CARD */}
              <div className="bg-gradient-to-br from-slate-900/90 to-purple-950/20 border border-purple-500/20 rounded-3xl p-8 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl"></div>
                <h3 className="text-xl font-extrabold text-white mb-3">
                  {currentScenario.title}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed font-light">
                  {currentScenario.description}
                </p>
              </div>

              {/* OPTIONS LIST */}
              <div className="flex flex-col gap-3.5">
                {currentScenario.choices.map((choice, index) => {
                  const isSelected = selectedChoiceIndex === index;
                  const hasAnswered = selectedChoiceIndex !== null;

                  let borderStyle = "border-slate-800/80 hover:border-slate-700 bg-slate-900/50";
                  let bgStyle = "";
                  
                  if (isSelected) {
                    if (choice.type === "bon") {
                      borderStyle = "border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]";
                      bgStyle = "text-emerald-400";
                    } else if (choice.type === "risque") {
                      borderStyle = "border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]";
                      bgStyle = "text-amber-400";
                    } else {
                      borderStyle = "border-rose-500 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.15)]";
                      bgStyle = "text-rose-400";
                    }
                  } else if (hasAnswered) {
                    borderStyle = "border-slate-900/40 bg-slate-950/20 opacity-40 cursor-default";
                  }

                  return (
                    <button
                      key={index}
                      disabled={hasAnswered}
                      onClick={() => handleChoiceSelect(index)}
                      className={`w-full p-5 rounded-2xl border transition-all text-left flex items-start gap-4 ${borderStyle}`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {hasAnswered && choice.type === "bon" && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        )}
                        {hasAnswered && choice.type === "risque" && (
                          <AlertTriangle className="w-5 h-5 text-amber-400" />
                        )}
                        {hasAnswered && choice.type === "interdit" && (
                          <XCircle className="w-5 h-5 text-rose-400" />
                        )}
                        {!hasAnswered && (
                          <div className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {String.fromCharCode(65 + index)}
                          </div>
                        )}
                      </div>
                      <p className={`text-xs md:text-sm font-light leading-relaxed text-slate-200 ${bgStyle}`}>
                        {choice.label}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* FEEDBACK EXPLANATION PANEL */}
              <AnimatePresence>
                {selectedChoiceIndex !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className={`rounded-3xl p-6 border text-left shadow-2xl relative overflow-hidden ${
                      currentScenario.choices[selectedChoiceIndex].type === "bon"
                        ? "bg-emerald-500/5 border-emerald-500/30"
                        : currentScenario.choices[selectedChoiceIndex].type === "risque"
                        ? "bg-amber-500/5 border-amber-500/30"
                        : "bg-rose-500/5 border-rose-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {currentScenario.choices[selectedChoiceIndex].type === "bon" && (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <h4 className="font-extrabold text-emerald-400 text-sm uppercase tracking-wide">Excellent Réflexe ! (+2 pts)</h4>
                        </>
                      )}
                      {currentScenario.choices[selectedChoiceIndex].type === "risque" && (
                        <>
                          <AlertTriangle className="w-5 h-5 text-amber-400" />
                          <h4 className="font-extrabold text-amber-400 text-sm uppercase tracking-wide">Comportement Risqué (+1 pt)</h4>
                        </>
                      )}
                      {currentScenario.choices[selectedChoiceIndex].type === "interdit" && (
                        <>
                          <XCircle className="w-5 h-5 text-rose-400" />
                          <h4 className="font-extrabold text-rose-400 text-sm uppercase tracking-wide">À Éviter Absolument (+0 pt)</h4>
                        </>
                      )}
                    </div>

                    <p className="text-slate-300 text-xs md:text-sm font-light leading-relaxed">
                      {currentScenario.choices[selectedChoiceIndex].feedback}
                    </p>

                    <div className="flex justify-end mt-5">
                      <button
                        onClick={handleNext}
                        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                      >
                        <span>{currentScenarioIndex + 1 >= maxScenarios ? "Terminer & Voir le Bilan" : "Scénario Suivant"}</span>
                        <ArrowRight className="w-4 h-4" />
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
              
              <div className="inline-flex p-4 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 mb-4 shadow-lg">
                <Trophy className="w-12 h-12" />
              </div>
              
              <h2 className="text-3xl font-black text-white mb-2">
                Évaluation finale de l'Escape Game
              </h2>
              
              <p className="text-slate-400 text-xs md:text-sm font-light mb-6">
                Tu as réagi à l'ensemble des scénarios de crise opérationnels. Découvre ton bilan QVT global.
              </p>

              {/* Score Display */}
              <div className="flex justify-center mb-8">
                <div className="px-8 py-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Score Final QVT</span>
                  <span className="text-4xl font-black text-purple-400 block mt-1">{score} / {maxScenarios * 2}</span>
                </div>
              </div>

              {/* Evaluation Paragraph */}
              <div className={`p-6 rounded-2xl border ${getResultsFeedback().color} ${getResultsFeedback().bg} text-left mb-8 relative overflow-hidden`}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4.5 h-4.5" />
                  <span className="text-xs uppercase font-bold tracking-wider opacity-80">Profil statutaire :</span>
                </div>
                <h4 className="text-xl font-extrabold text-white mb-2">
                  {getResultsFeedback().level}
                </h4>
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-light">
                  {getResultsFeedback().description}
                </p>
              </div>

              {/* Pédagogical Ressources Box */}
              <div className="border border-slate-800/80 bg-slate-950/50 rounded-2xl p-5 text-left mb-8">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  Ressources et Guides statutaires :
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <a 
                    href="https://www.fonction-publique.gouv.fr" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-3 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center gap-2 text-slate-300 hover:text-purple-300 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-purple-400" />
                    Guide d'évaluation QVT FPT
                  </a>
                  <a 
                    href="https://www.fonction-publique.gouv.fr" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-3 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center gap-2 text-slate-300 hover:text-purple-300 transition-colors"
                  >
                    <ShieldAlert className="w-4 h-4 text-purple-400" />
                    Procédure Droit de Retrait
                  </a>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={handleStart}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Recommencer le jeu
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold text-xs border border-slate-700 hover:border-slate-600 transition-all"
                >
                  Retour aux autres jeux
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <div className="text-center border-t border-slate-900/60 pt-6">
        <p className="text-[10px] text-slate-500 font-light">
          Escape Game RH • Serious game d'évaluation et de formation QVT / Statuts dans la Fonction Publique Territoriale.
        </p>
      </div>

    </div>
  );
};

export default EscapeGameRH;
