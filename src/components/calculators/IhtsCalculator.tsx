import React, { useState } from "react";
import { Clock, Info, Moon, Sun, AlertCircle } from "lucide-react";

export const IhtsCalculator: React.FC = () => {
  const [im, setIm] = useState<number | "">("");
  const [nbi, setNbi] = useState<number | "">("");
  const [zoneIr, setZoneIr] = useState<number>(3);
  const [heures1a14, setHeures1a14] = useState<number>(0);
  const [heures15plus, setHeures15plus] = useState<number>(0);
  const [heuresDimanche, setHeuresDimanche] = useState<number>(0);
  const [heuresNuit, setHeuresNuit] = useState<number>(0);

  const VALEUR_POINT = 4.92278;

  const calculateIhts = () => {
    if (!im || im < 366) return null;

    const imVal = Number(im) || 0;
    const nbiVal = Number(nbi) || 0;
    
    // Le traitement brut mensuel
    const brutMensuel = imVal * VALEUR_POINT;
    const nbiMensuel = nbiVal * VALEUR_POINT;
    
    // IR avec plancher à l'IM 366
    const imForIr = Math.max(imVal, 366);
    const brutForIr = imForIr * VALEUR_POINT;
    let irMensuel = 0;
    if (zoneIr > 0) {
      irMensuel = (brutForIr + nbiMensuel) * (zoneIr / 100);
    }
    
    // Le traitement brut annuel de référence pour les IHTS (Traitement + NBI + IR)
    const baseMensuelle = brutMensuel + nbiMensuel + irMensuel;
    const brutAnnuel = baseMensuelle * 12;
    
    // Taux de base d'une heure (TB annuel / 1820)
    const tauxDeBase = brutAnnuel / 1820;

    // Majoration de 25% pour les 14 premières heures
    const taux1a14 = tauxDeBase * 1.25;
    // Majoration de 27% à partir de la 15ème heure
    const taux15plus = tauxDeBase * 1.27;

    // Majoration nuit (+100% du taux horaire = taux de base x 2)
    // Note: l'indemnité horaire pour travail de nuit normale est fixée différemment, 
    // mais ici on simule les heures SUP de nuit
    const tauxNuit = tauxDeBase * 2;
    
    // Majoration dimanche et férié (+66% = taux de base x 1.66)
    const tauxDimanche = tauxDeBase * 1.66;

    const declared1a14 = Number(heures1a14) || 0;
    const declared15plus = Number(heures15plus) || 0;
    const hDimanche = Number(heuresDimanche) || 0;
    const hNuit = Number(heuresNuit) || 0;

    let totalSpecial = hDimanche + hNuit;
    let normal1a14 = declared1a14;
    let normal15plus = declared15plus;

    // On déduit les heures spéciales des heures normales (en commençant par la tranche 15+)
    if (totalSpecial > normal15plus) {
      let restantADeduire = totalSpecial - normal15plus;
      normal15plus = 0;
      normal1a14 = Math.max(0, normal1a14 - restantADeduire);
    } else {
      normal15plus -= totalSpecial;
    }

    const total1a14 = normal1a14 * taux1a14;
    const total15plus = normal15plus * taux15plus;
    const totalDimanche = hDimanche * tauxDimanche;
    const totalNuit = hNuit * tauxNuit;

    const total = total1a14 + total15plus + totalDimanche + totalNuit;

    return {
      tauxDeBase,
      taux1a14,
      taux15plus,
      tauxDimanche,
      tauxNuit,
      normal1a14,
      normal15plus,
      total1a14,
      total15plus,
      totalDimanche,
      totalNuit,
      total,
      hDimanche,
      hNuit,
      declaredTotal: declared1a14 + declared15plus
    };
  };

  const resultat = calculateIhts();

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn pb-12">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Calcul d'heures supplémentaires</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Indemnités Horaires pour Travaux Supplémentaires (IHTS)</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                NBI (points)
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

            {/* Zone IR */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Zone d'indemnité (IR)
              </label>
              <select
                value={zoneIr}
                onChange={(e) => setZoneIr(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value={0}>Zone 3 (0%)</option>
                <option value={1}>Zone 2 (1%)</option>
                <option value={3}>Zone 1 (3%)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Heures (1 à 14 / mois)
              </label>
              <input
                type="number"
                min="0"
                max="14"
                value={heures1a14 || ""}
                onChange={(e) => setHeures1a14(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Heures (15 et plus)
              </label>
              <input
                type="number"
                min="0"
                max="11"
                value={heures15plus || ""}
                onChange={(e) => setHeures15plus(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <Sun className="w-4 h-4 text-amber-500" />
                Dont Heures Dimanche/Férié
              </label>
              <input
                type="number"
                min="0"
                value={heuresDimanche || ""}
                onChange={(e) => setHeuresDimanche(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <Moon className="w-4 h-4 text-indigo-500" />
                Dont Heures de nuit (22h-7h)
              </label>
              <input
                type="number"
                min="0"
                value={heuresNuit || ""}
                onChange={(e) => setHeuresNuit(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          {/* Jauge des 25 heures */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-2 text-xs font-bold uppercase tracking-wider">
              <span className="text-slate-500">Volume total déclaré</span>
              <span className={(heures1a14 + heures15plus) > 25 ? "text-rose-500" : "text-emerald-600"}>
                {heures1a14 + heures15plus} / 25h
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${(heures1a14 + heures15plus) > 25 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, ((heures1a14 + heures15plus) / 25) * 100)}%` }}
              />
            </div>
            {(heures1a14 + heures15plus) > 25 && (
              <div className="mt-2 flex items-start gap-1.5 text-xs text-rose-500">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>Le plafond réglementaire est généralement fixé à 25 heures supplémentaires par mois maximum.</p>
              </div>
            )}
          </div>
        </div>

        {/* Résultat */}
        <div className={`mt-8 transition-all duration-500 ${resultat ? 'opacity-100 transform-none' : 'opacity-0 translate-y-4 pointer-events-none hidden'}`}>
          {resultat && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-2 border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center shadow-sm border border-emerald-100 dark:border-emerald-700/30">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Taux horaire de référence</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white">{resultat.tauxDeBase.toFixed(2).replace('.', ',')} €</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center shadow-sm border border-emerald-100 dark:border-emerald-700/30">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Heures de jour (x1.25 et x1.27)</div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{(resultat.total1a14 + resultat.total15plus).toFixed(2).replace('.', ',')} €</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center shadow-sm border border-emerald-100 dark:border-emerald-700/30">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Heures de nuit</div>
                  <div className="text-xl font-black text-indigo-500 dark:text-indigo-400">{resultat.totalNuit.toFixed(2).replace('.', ',')} €</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center shadow-sm border border-emerald-100 dark:border-emerald-700/30">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Dimanche ou jour férié</div>
                  <div className="text-xl font-black text-amber-500 dark:text-amber-400">{resultat.totalDimanche.toFixed(2).replace('.', ',')} €</div>
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="text-sm font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest mb-1">
                  Montant brut estimatif
                </div>
                <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  {resultat.total.toFixed(2).replace('.', ',')} €
                </div>
              </div>

              <div className="mt-8 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-800">
                <div className="bg-slate-100 dark:bg-slate-700/50 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-center">
                    Tableau Mensuel
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">Nature des heures</th>
                        <th className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 text-center">Heures</th>
                        <th className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 text-center">Majoration</th>
                        <th className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 text-right">Montant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      <tr className="bg-white dark:bg-slate-800">
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">1 à 14 heures</td>
                        <td className="px-4 py-3 text-center">{resultat.normal1a14}</td>
                        <td className="px-4 py-3 text-center">25 %</td>
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200 text-right">{resultat.total1a14.toFixed(2).replace('.', ',')} €</td>
                      </tr>
                      <tr className="bg-slate-50 dark:bg-slate-900/30">
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">15 heures et plus</td>
                        <td className="px-4 py-3 text-center">{resultat.normal15plus}</td>
                        <td className="px-4 py-3 text-center">27 %</td>
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200 text-right">{resultat.total15plus.toFixed(2).replace('.', ',')} €</td>
                      </tr>
                      <tr className="bg-white dark:bg-slate-800">
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">Dimanche et férié</td>
                        <td className="px-4 py-3 text-center">{resultat.hDimanche}</td>
                        <td className="px-4 py-3 text-center">66 %</td>
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200 text-right">{resultat.totalDimanche.toFixed(2).replace('.', ',')} €</td>
                      </tr>
                      <tr className="bg-slate-50 dark:bg-slate-900/30">
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">Heures de nuit</td>
                        <td className="px-4 py-3 text-center">{resultat.hNuit}</td>
                        <td className="px-4 py-3 text-center">100 %</td>
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200 text-right">{resultat.totalNuit.toFixed(2).replace('.', ',')} €</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-start gap-2.5 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
          <div className="space-y-2">
            <p>
              <strong>Note :</strong> Les IHTS sont exonérées d'impôt sur le revenu dans la limite de 7 500 €/an (loi n°2022-1158). Aucune cotisation CNRACL ni retraite, uniquement CSG/CRDS.
            </p>
            <p>
              Les 14 premières heures supplémentaires du mois sont rémunérées avec une majoration de 25 %. Au-delà, les heures sont majorées à 27 %. Répartissez vos heures dans la bonne tranche selon votre décompte réel (feuille de temps).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
