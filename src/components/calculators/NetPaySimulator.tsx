import React, { useState } from "react";
import { Calculator, AlertCircle } from "lucide-react";

export const NetPaySimulator: React.FC = () => {
  const [im, setIm] = useState<number | "">("");
  const [nbi, setNbi] = useState<number | "">("");
  const [ifse, setIfse] = useState<number | "">("");
  const [statut, setStatut] = useState<"titulaire" | "contractuel">("titulaire");
  const [categorie, setCategorie] = useState<"A" | "B" | "C">("C");
  const [tempsPartiel, setTempsPartiel] = useState<number>(100);
  const [zoneIr, setZoneIr] = useState<number>(3);
  const [enfants, setEnfants] = useState<number>(0);

  // Valeur du point d'indice (FPT - à jour)
  const VALEUR_POINT = 4.92278;

  const calculatePay = () => {
    if (!im || im < 366) return null;

    // 1. Traitement brut de base (Temps plein)
    const imVal = Number(im) || 0;
    const nbiVal = Number(nbi) || 0;
    const ifseVal = Number(ifse) || 0;

    const brutTempsPlein = imVal * VALEUR_POINT;
    const nbiBrut = nbiVal * VALEUR_POINT;

    // 2. Application de la quotité de temps de travail (pour le traitement)
    let tauxProratisation = tempsPartiel / 100;
    if (tempsPartiel === 80) tauxProratisation = 6 / 7;
    else if (tempsPartiel === 90) tauxProratisation = 32 / 35;
    
    const brutReel = brutTempsPlein * tauxProratisation;
    const nbiReel = nbiBrut * tauxProratisation;
    
    // Primes proratisées (IFSE)
    const ifseReel = ifseVal * (tempsPartiel / 100); // L'IFSE est strictement proratisée (sans la règle des 6/7ème pour les temps partiels)

    // Transfert Primes / Points (TPP) - Uniquement pour les titulaires
    let tpp = 0;
    if (statut === "titulaire") {
      if (categorie === "A") tpp = 32.42;
      else if (categorie === "B") tpp = 23.17;
      else if (categorie === "C") tpp = 13.92;
      tpp = tpp * tauxProratisation; // Le TPP est aussi proratisé
    }

    // Indemnité de Résidence (IR)
    // Plancher de l'IR = IM 366 (minimum fonction publique)
    const imForIr = Math.max(imVal, 366);
    const brutForIr = imForIr * VALEUR_POINT;
    // L'IR n'inclut pas la NBI pour la détermination du plancher, mais en pourcentage sur le traitement de base
    // IR est soumise à proratisation
    let irReel = 0;
    if (zoneIr > 0) {
       irReel = brutForIr * (zoneIr / 100) * tauxProratisation;
    }

    // Supplément Familial de Traitement (SFT)
    // SFT basé sur le Traitement Indiciaire Brut temps plein
    // Plancher SFT = IM 449. Plafond SFT = IM 717
    let sft = 0;
    if (enfants > 0) {
      const imForSft = Math.min(Math.max(imVal, 449), 717);
      const brutForSft = imForSft * VALEUR_POINT;

      if (enfants === 1) {
        sft = 2.29;
      } else if (enfants === 2) {
        sft = 10.67 + (brutForSft * 0.03);
      } else if (enfants === 3) {
        sft = 15.24 + (brutForSft * 0.08);
      } else if (enfants >= 4) {
        const enfantsSup = enfants - 3;
        sft = (15.24 + (4.57 * enfantsSup)) + (brutForSft * (0.08 + (0.06 * enfantsSup)));
      }
      
      // En temps partiel, le SFT suit des règles strictes : il est proratisé mais ne peut être inférieur 
      // au montant plancher calculé pour un temps plein au taux temps partiel.
      // Simplification : le SFT est proratisé au même taux que le traitement.
      if (tempsPartiel < 100) {
        // En réalité c'est plus complexe mais on applique le taux standard
        sft = sft * (tempsPartiel / 100);
      }
    }

    const totalBrut = brutReel + nbiReel + ifseReel + irReel + sft;

    // 3. Calcul des cotisations (Estimations standards)
    let totalCotisations = 0;
    
    // Assiette CSG/CRDS (98,25% du brut, les primes sont aussi soumises)
    // Le TPP est déduit du brut pour la CSG ? Non, le TPP réduit le brut total des primes
    const baseCsg = totalBrut - tpp;
    const assietteCsgCrds = baseCsg * 0.9825;
    
    const csg = assietteCsgCrds * 0.092; // 9.2%
    const crds = assietteCsgCrds * 0.005; // 0.5%
    
    totalCotisations += csg + crds;

    if (statut === "titulaire") {
      // CNRACL (11.10%) s'applique sur le traitement indiciaire + NBI
      const baseCnracl = brutReel + nbiReel;
      const cnracl = baseCnracl * 0.1110;
      totalCotisations += cnracl;
      
      // RAFP (5%) sur les primes (IFSE) plafonné à 20% du traitement de base
      let baseRafp = ifseReel;
      const plafondRafp = baseCnracl * 0.20;
      if (baseRafp > plafondRafp) baseRafp = plafondRafp;
      const rafp = baseRafp * 0.05;
      totalCotisations += rafp;
    } else {
      // URSSAF (Maladie 0.4%, Vieillesse plaf 6.9%, deplaf 0.4%)
      // Sur l'ensemble de la rémunération (Base + Primes)
      const baseSecSoc = totalBrut - tpp;
      const secSoc = baseSecSoc * 0.077; 
      // IRCANTEC (Tranche A: 2.8%)
      const ircantec = baseSecSoc * 0.028;
      totalCotisations += secSoc + ircantec;
    }

    const net = (totalBrut - tpp) - totalCotisations;

    return {
      brutTotal: totalBrut,
      tpp: tpp,
      net: net,
      cotisations: totalCotisations,
      tauxPrelevement: (totalCotisations / (totalBrut - tpp)) * 100
    };
  };

  const resultat = calculatePay();

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn pb-12">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Simulateur de net à payer</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Estimation du traitement net mensuel</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Indice Majoré */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Indice Majoré (IM)
              </label>
              <input
                type="number"
                min="366"
                max="1500"
                value={im}
                onChange={(e) => setIm(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Ex: 400"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            {/* NBI */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Points NBI
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={nbi}
                onChange={(e) => setNbi(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Ex: 10"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            {/* IFSE */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                IFSE Brut mensuel (€)
              </label>
              <input
                type="number"
                min="0"
                value={ifse}
                onChange={(e) => setIfse(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Ex: 250"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            {/* Statut */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Statut
              </label>
              <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setStatut("titulaire")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    statut === "titulaire" ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  Titulaire
                </button>
                <button
                  type="button"
                  onClick={() => setStatut("contractuel")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    statut === "contractuel" ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  Contractuel
                </button>
              </div>
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Catégorie (Transfert primes/points)
              </label>
              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value as "A"|"B"|"C")}
                disabled={statut !== "titulaire"}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="C">Catégorie C (13.92 €)</option>
                <option value="B">Catégorie B (23.17 €)</option>
                <option value="A">Catégorie A (32.42 €)</option>
              </select>
            </div>

            {/* Temps de travail */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Temps de travail (%)
              </label>
              <select
                value={tempsPartiel}
                onChange={(e) => setTempsPartiel(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
              >
                <option value={100}>100% (Temps plein)</option>
                <option value={90}>90% (Payé 32/35e soit 91.4%)</option>
                <option value={80}>80% (Payé 6/7e soit 85.7%)</option>
                <option value={70}>70%</option>
                <option value={60}>60%</option>
                <option value={50}>50%</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            {/* Indemnité de Résidence */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Indemnité de Résidence (Zone)
              </label>
              <select
                value={zoneIr}
                onChange={(e) => setZoneIr(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
              >
                <option value={0}>Zone 3 (0%)</option>
                <option value={1}>Zone 2 (1%)</option>
                <option value={3}>Zone 1 (3% - IDF)</option>
              </select>
            </div>

            {/* SFT */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Supplément Familial (SFT) - Enfants
              </label>
              <select
                value={enfants}
                onChange={(e) => setEnfants(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
              >
                <option value={0}>0 enfant</option>
                <option value={1}>1 enfant</option>
                <option value={2}>2 enfants</option>
                <option value={3}>3 enfants</option>
                <option value={4}>4 enfants</option>
                <option value={5}>5 enfants</option>
                <option value={6}>6 enfants</option>
              </select>
            </div>
          </div>
        </div>

        {/* Résultat */}
        <div className={`mt-8 transition-all duration-500 ${resultat ? 'opacity-100 transform-none' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          {resultat && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-2 border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-6">
              
              <div className="text-center mb-6">
                <div className="text-sm font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest mb-1">
                  Traitement Net Mensuel Estimé
                </div>
                <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  {resultat.net.toFixed(2).replace('.', ',')} €
                </div>
                <div className="text-sm text-emerald-700/80 dark:text-emerald-500/80 mt-2 font-medium">
                  Avant impôt sur le revenu
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-emerald-200/60 dark:border-emerald-800/60 text-center">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Total Brut</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{resultat.brutTotal.toFixed(2).replace('.', ',')} €</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Transf. Primes/Points</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{resultat.tpp > 0 ? `-${resultat.tpp.toFixed(2).replace('.', ',')} €` : '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Cotisations (~{resultat.tauxPrelevement.toFixed(1)}%)</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">-{resultat.cotisations.toFixed(2).replace('.', ',')} €</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-start gap-2.5 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-xs text-amber-900 dark:text-amber-200 border border-amber-200/60 dark:border-amber-800/50">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            <strong>Note :</strong> Ce simulateur effectue un calcul simplifié. Le calcul exact du SFT en temps partiel comporte des règles spécifiques de plancher absolu qui peuvent légèrement différer de ce résultat.
          </p>
        </div>

      </div>
    </div>
  );
};
