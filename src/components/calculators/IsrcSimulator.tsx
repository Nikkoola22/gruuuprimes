import React, { useState } from "react";
import { Handshake, Info } from "lucide-react";

export const IsrcSimulator: React.FC = () => {
  const [rba, setRba] = useState<number | "">("");
  const [anciennete, setAnciennete] = useState<number | "">("");

  const calculateIsrc = () => {
    if (!rba || !anciennete || anciennete < 0) return null;

    const rbaVal = Number(rba);
    const annees = Number(anciennete);
    
    // Le douzième de la rémunération brute annuelle
    const douzieme = rbaVal / 12;

    // Calcul du Plancher (Décret 2019-1593)
    let plancherMois = 0;
    
    // 1. Jusqu'à 10 ans : 1/4 de mois par année
    const tr1 = Math.min(annees, 10);
    plancherMois += tr1 * 0.25;

    // 2. De 10 à 15 ans : 2/5 de mois par année
    if (annees > 10) {
      const tr2 = Math.min(annees - 10, 5);
      plancherMois += tr2 * 0.40;
    }

    // 3. De 15 à 20 ans : 1/2 de mois par année
    if (annees > 15) {
      const tr3 = Math.min(annees - 15, 5);
      plancherMois += tr3 * 0.50;
    }

    // 4. De 20 à 24 ans : 1/6 de mois par année
    if (annees > 20) {
      const tr4 = Math.min(annees - 20, 4);
      plancherMois += tr4 * (1 / 6);
    }

    const plancherMontant = plancherMois * douzieme;

    // Calcul du Plafond (maximum 1 mois par année jusqu'à 24 ans)
    const plafondMois = Math.min(annees, 24);
    const plafondMontant = plafondMois * douzieme;

    return {
      douzieme,
      plancherMois,
      plancherMontant,
      plafondMois,
      plafondMontant
    };
  };

  const resultat = calculateIsrc();

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn pb-12">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl text-rose-600 dark:text-rose-400">
            <Handshake className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Rupture Conventionnelle (ISRC)</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Fourchette de l'indemnité légale</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Rémunération Brute Annuelle de l'année civile N-1 (€)
            </label>
            <input
              type="number"
              min="0"
              value={rba}
              onChange={(e) => setRba(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Ex: 30000"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            />
            <p className="text-xs text-slate-500 mt-2">
              Sont exclus : indemnités de jury, heures supplémentaires (IHTS), remboursement de frais (déplacement), SFT, etc.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Ancienneté cumulée dans la fonction publique (Années)
            </label>
            <input
              type="number"
              min="0"
              max="45"
              step="0.5"
              value={anciennete}
              onChange={(e) => setAnciennete(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Ex: 12.5"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            />
            <p className="text-xs text-slate-500 mt-2">
              Prenez en compte les services accomplis dans les 3 fonctions publiques (titulaire ou CDD/CDI).
            </p>
          </div>
        </div>

        {/* Résultat */}
        <div className={`mt-8 transition-all duration-500 ${resultat ? 'opacity-100 transform-none' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          {resultat && (
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border-2 border-rose-200 dark:border-rose-800/50 rounded-2xl p-6">
              
              <div className="text-center mb-6">
                <div className="text-sm font-bold text-rose-800 dark:text-rose-400 uppercase tracking-widest mb-1">
                  Fourchette Légale de Négociation
                </div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
                  {resultat.plancherMontant.toFixed(2).replace('.', ',')} € à {resultat.plafondMontant.toFixed(2).replace('.', ',')} €
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-rose-200/60 dark:border-rose-800/60 text-sm">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Plancher minimum imposé</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{resultat.plancherMontant.toFixed(2).replace('.', ',')} €</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Soit {resultat.plancherMois.toFixed(2).replace('.', ',')} mois de salaire</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Plafond maximum autorisé</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{resultat.plafondMontant.toFixed(2).replace('.', ',')} €</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Soit {resultat.plafondMois.toFixed(2).replace('.', ',')} mois de salaire</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-start gap-2.5 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
          <p>
            L'Indemnité Spécifique de Rupture Conventionnelle (ISRC) est négociable entre ces deux bornes. L'ancienneté maximale prise en compte est de 24 ans (soit 24 mois de salaire au maximum).
          </p>
        </div>
      </div>
    </div>
  );
};
