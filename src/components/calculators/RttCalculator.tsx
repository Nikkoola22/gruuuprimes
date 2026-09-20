import React, { useState } from "react";
import { Clock, Info } from "lucide-react";

export const RttCalculator: React.FC = () => {
  const [joursParSemaine, setJoursParSemaine] = useState<number>(5);
  const [heuresParSemaine, setHeuresParSemaine] = useState<number>(37.5);

  const calculateRights = () => {
    // Congés annuels (CA) = 5 x nombre de jours travaillés par semaine
    const ca = joursParSemaine * 5;

    // Calcul des RTT selon la durée légale de 35h
    // Formule: (Heures - 35) * jours annuels travaillés / heures par jour
    // Approche simplifiée des forfaits dans la FPT (Filière territoriale)
    let rtt = 0;
    if (joursParSemaine === 5) {
      if (heuresParSemaine === 35) rtt = 0;
      else if (heuresParSemaine === 36) rtt = 6;
      else if (heuresParSemaine === 37) rtt = 11;
      else if (heuresParSemaine === 37.5) rtt = 15;
      else if (heuresParSemaine === 38) rtt = 17;
      else if (heuresParSemaine === 39) rtt = 23;
      else {
        // Formule proportionnelle standard
        const heuresAuDelaDe35 = heuresParSemaine - 35;
        // On base le calcul sur 45 semaines environ, divisé par les heures moyennes journalières
        // (45 * h_sup) / (heures / 5)
        const heuresHebdoEnPlus = heuresAuDelaDe35;
        const heuresParJour = heuresParSemaine / 5;
        rtt = Math.round((heuresHebdoEnPlus * 45) / heuresParJour);
      }
    } else {
      // Pour les temps partiels, généralement il n'y a pas de RTT, on reste à 35h au prorata.
      rtt = 0;
    }

    // Le maximum absolu est souvent de 23 (selon décret 2001-623)
    if (rtt > 23) rtt = 23;
    if (rtt < 0) rtt = 0;

    return { ca, rtt };
  };

  const droits = calculateRights();

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn pb-12">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Calculateur de CA & RTT</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Déterminez vos droits à congés annuels et jours RTT</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Cycle de travail */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Rythme de travail (Jours / semaine)
            </label>
            <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
              {[3, 4, 4.5, 5].map(j => (
                <button
                  key={j}
                  type="button"
                  onClick={() => setJoursParSemaine(j)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    joursParSemaine === j ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {j} jours
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Durée de travail hebdomadaire (Heures)
            </label>
            <select
              value={heuresParSemaine}
              onChange={(e) => setHeuresParSemaine(Number(e.target.value))}
              disabled={joursParSemaine < 5}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value={35}>35h00 (Légal)</option>
              <option value={36}>36h00</option>
              <option value={37}>37h00</option>
              <option value={37.5}>37h30 (Classique)</option>
              <option value={38}>38h00</option>
              <option value={39}>39h00 (Maximum)</option>
            </select>
            {joursParSemaine < 5 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> En temps partiel, le régime RTT n'est généralement pas appliqué ou proratisé très spécifiquement.
              </p>
            )}
          </div>
        </div>

        {/* Résultat */}
        <div className="mt-8 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border-2 border-indigo-200 dark:border-indigo-800/50 rounded-2xl p-6">
          <div className="text-center mb-6">
            <div className="text-sm font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-widest mb-1">
              Vos droits annuels
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center shadow-sm border border-slate-200/60 dark:border-slate-700">
              <div className="text-4xl font-black text-slate-900 dark:text-white mb-1">{droits.ca}</div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Jours de CA</div>
              <div className="text-[10px] text-slate-400 mt-1">(Congés Annuels)</div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center shadow-sm border border-slate-200/60 dark:border-slate-700">
              <div className="text-4xl font-black text-slate-900 dark:text-white mb-1">{droits.rtt}</div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Jours de RTT</div>
              <div className="text-[10px] text-slate-400 mt-1">(Réduction Temps Travail)</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-indigo-200/60 dark:border-indigo-800/60 text-center">
             <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
               Total : {droits.ca + droits.rtt} jours d'absence
             </div>
             <div className="text-xs text-indigo-700/80 dark:text-indigo-400/80 mt-1">
               (Hors jours de fractionnement éventuels)
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
