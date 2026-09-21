import React, { useState } from "react";
import { Activity, Info, Calendar as CalendarIcon, BookOpen, Plus, Trash2, Clock } from "lucide-react";

interface Arret {
  id: string;
  debut: string;
  fin: string;
}

export const CongesMaladie: React.FC = () => {
  const [statut, setStatut] = useState<"titulaire" | "contractuel">("titulaire");
  const [typeConge, setTypeConge] = useState<"cmo" | "clm" | "cld" | "cgm">("cmo");
  const [dateFonction, setDateFonction] = useState<string>("");
  const [dateArret, setDateArret] = useState<string>("");
  const [dateFin, setDateFin] = useState<string>("");
  
  // Historique des arrêts pour le calcul glissant
  const [historique, setHistorique] = useState<Arret[]>([]);
  const [showResult, setShowResult] = useState<boolean>(false);

  const handleInputChange = <T,>(setter: (val: T) => void, value: T) => {
    setter(value);
    setShowResult(false);
  };

  const addArretHistorique = () => {
    setHistorique([...historique, { id: Date.now().toString(), debut: "", fin: "" }]);
    setShowResult(false);
  };

  const updateArretHistorique = (id: string, field: "debut" | "fin", value: string) => {
    setHistorique(historique.map(h => h.id === id ? { ...h, [field]: value } : h));
    setShowResult(false);
  };

  const removeArretHistorique = (id: string) => {
    setHistorique(historique.filter(h => h.id !== id));
    setShowResult(false);
  };

  // Helper pour parser la date en UTC stricte (évite les décalages de fuseau)
  const parseDateUTC = (dateStr: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    return new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
  };

  // Helper pour calculer l'ancienneté en années (pour contractuels)
  const getAncienneteYears = () => {
    if (!dateFonction || !dateArret) return 0;
    const dFonc = parseDateUTC(dateFonction);
    const dArr = parseDateUTC(dateArret);
    if (!dFonc || !dArr) return 0;
    
    let months = (dArr.getUTCFullYear() - dFonc.getUTCFullYear()) * 12;
    months -= dFonc.getUTCMonth();
    months += dArr.getUTCMonth();
    
    return months / 12;
  };

  const getDureeArret = () => {
    if (!dateArret || !dateFin) return 0;
    const debut = parseDateUTC(dateArret);
    const fin = parseDateUTC(dateFin);
    if (!debut || !fin || fin.getTime() < debut.getTime()) return 0;
    const diffTime = fin.getTime() - debut.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // Calcule les jours de CMO consommés dans l'année glissante précédant le NOUVEL arrêt
  const getCmoConsomme = () => {
    if (!dateArret) return 0;
    const dateNouvelArret = parseDateUTC(dateArret);
    if (!dateNouvelArret) return 0;

    // Période de référence : 365 jours avant la date de début du nouvel arrêt
    const dateReference = new Date(dateNouvelArret);
    dateReference.setUTCFullYear(dateReference.getUTCFullYear() - 1);

    let joursConsommes = 0;

    historique.forEach(h => {
      if (h.debut && h.fin) {
        const dDebut = parseDateUTC(h.debut);
        const dFin = parseDateUTC(h.fin);
        
        if (dDebut && dFin && dFin.getTime() >= dDebut.getTime()) {
          // On trouve l'intersection entre [dDebut, dFin] et [dateReference, dateNouvelArret - 1 jour]
          const intersectionDebut = dDebut.getTime() > dateReference.getTime() ? dDebut : dateReference;
          
          // La veille du nouvel arrêt
          const veilleNouvelArret = new Date(dateNouvelArret);
          veilleNouvelArret.setUTCDate(veilleNouvelArret.getUTCDate() - 1);
          
          const intersectionFin = dFin.getTime() < veilleNouvelArret.getTime() ? dFin : veilleNouvelArret;

          if (intersectionFin.getTime() >= intersectionDebut.getTime()) {
            const diffTime = intersectionFin.getTime() - intersectionDebut.getTime();
            joursConsommes += Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
          }
        }
      }
    });

    return joursConsommes;
  };

  const calculateDroitsCmo = (maxPt: number, maxDt: number) => {
    const consomme = getCmoConsomme();
    const dureeArret = getDureeArret();
    
    // Avant cet arrêt
    const restePtAvant = Math.max(0, maxPt - consomme);
    const dtDejaConsomme = Math.max(0, consomme - maxPt);
    const resteDtAvant = Math.max(0, maxDt - dtDejaConsomme);

    // Application sur l'arrêt actuel
    const ptApplique = Math.min(dureeArret, restePtAvant);
    const joursRestantsApresPT = dureeArret - ptApplique;
    const dtApplique = Math.min(joursRestantsApresPT, resteDtAvant);
    const sansTraitementApplique = joursRestantsApresPT - dtApplique;

    return { 
      dureeArret,
      ptApplique, 
      dtApplique,
      sansTraitementApplique,
      consomme
    };
  };

  const getDroitsSpecifiques = () => {
    if (statut === "titulaire") {
      switch (typeConge) {
        case "cmo": {
          const cmoTitulaire = calculateDroitsCmo(90, 270);
          return {
            title: "Congé de Maladie Ordinaire (CMO)",
            dureeMax: `Bilan sur votre arrêt actuel de ${cmoTitulaire.dureeArret} jours`,
            pleinTraitement: `${cmoTitulaire.ptApplique} j. (à 90%)`,
            demiTraitement: `${cmoTitulaire.dtApplique} j.`,
            sansTraitement: cmoTitulaire.sansTraitementApplique > 0 ? `${cmoTitulaire.sansTraitementApplique} j.` : null,
            total: `${cmoTitulaire.ptApplique + cmoTitulaire.dtApplique + cmoTitulaire.sansTraitementApplique} jours évalués`,
            cmoConsomme: cmoTitulaire.consomme
          };
        }
        case "clm":
          return {
            title: "Congé de Longue Maladie (CLM)",
            dureeMax: "3 ans maximum par affection",
            pleinTraitement: "1 an",
            demiTraitement: "2 ans",
            total: "3 ans"
          };
        case "cld":
          return {
            title: "Congé de Longue Durée (CLD)",
            dureeMax: "5 ans maximum par affection",
            pleinTraitement: "3 ans",
            demiTraitement: "2 ans",
            total: "5 ans"
          };
        default: return null;
      }
    } else {
      const ancYears = getAncienneteYears();
      
      if (typeConge === "cgm") {
        if (ancYears < 3) {
          return {
            title: "Congé de Grave Maladie (CGM)",
            dureeMax: "Aucun droit",
            pleinTraitement: "0",
            demiTraitement: "0",
            total: "0",
            note: "Il faut justifier d'au moins 3 ans de services pour avoir droit au CGM."
          };
        }
        return {
          title: "Congé de Grave Maladie (CGM)",
          dureeMax: "3 ans maximum",
          pleinTraitement: "1 an",
          demiTraitement: "2 ans",
          total: "3 ans"
        };
      } else { // CMO Contractuel
        let maxPt = 0, maxDt = 0;
        
        if (ancYears < (4/12)) {
          maxPt = 0; maxDt = 0;
        } else if (ancYears < 2) {
          maxPt = 30; maxDt = 30;
        } else if (ancYears < 3) {
          maxPt = 60; maxDt = 60;
        } else {
          maxPt = 90; maxDt = 90;
        }

        if (maxPt === 0) {
          return {
            title: "Congé de Maladie Ordinaire (CMO)",
            dureeMax: "Sans traitement",
            pleinTraitement: "0 jours",
            demiTraitement: "0 jours",
            total: "0",
            note: "Ancienneté insuffisante. Indemnités journalières de la Sécurité Sociale (IJSS) uniquement."
          };
        }

        const cmoContractuel = calculateDroitsCmo(maxPt, maxDt);
        return {
          title: "Congé de Maladie Ordinaire (CMO)",
          dureeMax: `Bilan sur votre arrêt actuel de ${cmoContractuel.dureeArret} jours`,
          pleinTraitement: `${cmoContractuel.ptApplique} j.`,
          demiTraitement: `${cmoContractuel.dtApplique} j.`,
          sansTraitement: cmoContractuel.sansTraitementApplique > 0 ? `${cmoContractuel.sansTraitementApplique} j.` : null,
          total: `${cmoContractuel.ptApplique + cmoContractuel.dtApplique + cmoContractuel.sansTraitementApplique} jours évalués`,
          cmoConsomme: cmoContractuel.consomme
        };
      }
    }
  };

  const droits = getDroitsSpecifiques();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
        
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl text-teal-600 dark:text-teal-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Droits à congés maladie</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Évaluation des droits à plein et demi-traitement</p>
            </div>
          </div>
        </div>

        {/* Base Légale */}
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
            <BookOpen className="w-4 h-4" />
            Bases légales
          </div>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Titulaires FPT :</strong> Art. 57 loi n°84-53 du 26 janvier 1984 · Décret n°2025-197 du 27 février 2025 (taux de 90 % du CMO)</li>
            <li><strong>Contractuels :</strong> Les règles diffèrent selon le décret n°88-145 du 15 février 1988</li>
          </ul>
        </div>

        <div className="space-y-6">
          {/* Statut */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Statut
            </label>
            <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => { handleInputChange(setStatut, "titulaire"); handleInputChange(setTypeConge, "cmo"); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  statut === "titulaire" ? "bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Titulaire
              </button>
              <button
                type="button"
                onClick={() => { handleInputChange(setStatut, "contractuel"); handleInputChange(setTypeConge, "cmo"); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  statut === "contractuel" ? "bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Contractuel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type de congé */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Type de congé à évaluer
              </label>
              <select
                value={typeConge}
                onChange={(e) => handleInputChange(setTypeConge, e.target.value as "cmo" | "clm" | "cld" | "cgm")}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              >
                <option value="cmo">Congé Maladie Ordinaire (CMO)</option>
                {statut === "titulaire" ? (
                  <>
                    <option value="clm">Congé de Longue Maladie (CLM)</option>
                    <option value="cld">Congé de Longue Durée (CLD)</option>
                  </>
                ) : (
                  <option value="cgm">Congé de Grave Maladie (CGM)</option>
                )}
              </select>
            </div>
          </div>

          {/* Historique des arrêts (Affiché seulement pour le CMO) */}
          {typeConge === "cmo" && (
            <div className="p-5 bg-amber-50/40 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/50 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-amber-800 dark:text-amber-500 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Historique des arrêts antérieurs (12 derniers mois)
                </h3>
                <button
                  onClick={addArretHistorique}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50 text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Ajouter un arrêt
                </button>
              </div>
              
              {historique.length === 0 ? (
                <div className="p-4 border-2 border-dashed border-amber-200 dark:border-amber-800/50 rounded-xl text-center text-sm text-amber-700/70 dark:text-amber-400/70 bg-white/50 dark:bg-slate-900/50">
                  Aucun arrêt antérieur renseigné. Cliquez sur "Ajouter un arrêt" s'il y a eu des arrêts précédents.
                </div>
              ) : (
                <div className="space-y-3">
                  {historique.map((arret, index) => (
                    <div key={arret.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-amber-100 dark:border-amber-700/30 rounded-xl shadow-sm">
                      <span className="text-xs font-black text-amber-200 dark:text-amber-800 w-6">#{index + 1}</span>
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Début</label>
                          <input
                            type="date"
                            value={arret.debut}
                            onChange={(e) => updateArretHistorique(arret.id, "debut", e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Fin</label>
                          <input
                            type="date"
                            value={arret.fin}
                            onChange={(e) => updateArretHistorique(arret.id, "fin", e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeArretHistorique(arret.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors mt-4"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  {dateArret && showResult && (
                    <div className="mt-2 text-xs text-slate-500 flex items-start gap-2">
                      <Info className="w-4 h-4 shrink-0 text-teal-500" />
                      <p>
                        Le système calcule automatiquement la part de ces arrêts qui tombe dans l'année glissante précédant le {new Date(dateArret).toLocaleDateString('fr-FR')}. 
                        <br/><strong>Jours retenus : {droits?.cmoConsomme ?? 0} jours.</strong>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Saisie du NOUVEL arrêt */}
          <div className="p-5 bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-800/50 rounded-2xl">
            <h3 className="font-bold text-teal-800 dark:text-teal-400 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" /> Nouvel arrêt à évaluer
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {statut === "titulaire" ? "Titularisation" : "Prise de fonctions"}
                </label>
                <input
                  type="date"
                  value={dateFonction}
                  onChange={(e) => handleInputChange(setDateFonction, e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Début de l'arrêt
                </label>
                <input
                  type="date"
                  value={dateArret}
                  onChange={(e) => handleInputChange(setDateArret, e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Fin de l'arrêt
                </label>
                <input
                  type="date"
                  value={dateFin}
                  onChange={(e) => handleInputChange(setDateFin, e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
              </div>
            </div>
          </div>

          {/* Bouton de calcul */}
          <div className="pt-4 flex justify-center">
            <button
              onClick={() => setShowResult(true)}
              disabled={!dateArret || !dateFin}
              className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Calculer les droits
            </button>
          </div>
        </div>

        {/* Résultat Dynamique */}
        <div className={`mt-8 transition-all duration-500 ${showResult ? 'opacity-100 transform-none' : 'opacity-0 translate-y-4 hidden'}`}>
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 border-2 border-teal-200 dark:border-teal-800/50 rounded-2xl p-6">
            <div className="text-center mb-6">
              <div className="text-sm font-bold text-teal-800 dark:text-teal-400 uppercase tracking-widest mb-1">
                Droits Restants Estimés : {droits?.title}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                {droits?.dureeMax}
              </div>
            </div>

            {droits?.note ? (
              <div className="text-center p-4 bg-white/60 dark:bg-slate-900/60 rounded-xl font-medium text-slate-800 dark:text-slate-200">
                {droits.note}
              </div>
            ) : (
              <div className={`grid gap-4 ${droits?.sansTraitement ? 'grid-cols-3' : 'grid-cols-2'}`}>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center shadow-sm border border-slate-200/60 dark:border-slate-700">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Plein Traitement</div>
                  <div className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400">{droits?.pleinTraitement}</div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center shadow-sm border border-slate-200/60 dark:border-slate-700">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Demi-Traitement</div>
                  <div className="text-xl sm:text-2xl font-black text-amber-500 dark:text-amber-400">{droits?.demiTraitement}</div>
                </div>

                {droits?.sansTraitement && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center shadow-sm border border-slate-200/60 dark:border-slate-700">
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Sans Traitement</div>
                    <div className="text-xl sm:text-2xl font-black text-rose-500 dark:text-rose-400">{droits?.sansTraitement}</div>
                  </div>
                )}
              </div>
            )}
            
            {droits?.total && !droits?.note && (
              <div className="mt-4 text-center font-bold text-teal-800 dark:text-teal-300">
                Total évalué : {droits.total}
              </div>
            )}
          </div>
        </div>

        {/* Tableau Récapitulatif Titulaires */}
        {statut === "titulaire" && (
          <div className="mt-8 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-center">
                Récapitulatif des Congés Maladie — Fonctionnaires Titulaires
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">TYPE</th>
                    <th className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">CONDITIONS</th>
                    <th className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">PLEIN TRT</th>
                    <th className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">DEMI-TRT</th>
                    <th className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr className="bg-white dark:bg-slate-800">
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">CMO</td>
                    <td className="px-4 py-3">Toute maladie — aucune ancienneté requise</td>
                    <td className="px-4 py-3 font-semibold text-teal-600 dark:text-teal-400">3 mois (90 %)</td>
                    <td className="px-4 py-3">9 mois</td>
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">12 mois</td>
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-900/30">
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">CLM</td>
                    <td className="px-4 py-3">Maladie grave nécessitant traitement et soins prolongés — aucune ancienneté requise</td>
                    <td className="px-4 py-3 font-semibold text-teal-600 dark:text-teal-400">1 an</td>
                    <td className="px-4 py-3">2 ans</td>
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">3 ans</td>
                  </tr>
                  <tr className="bg-white dark:bg-slate-800">
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">CLD</td>
                    <td className="px-4 py-3">Affection grave listée (cancer, tuberculose…)</td>
                    <td className="px-4 py-3 font-semibold text-teal-600 dark:text-teal-400">3 ans</td>
                    <td className="px-4 py-3">2 ans</td>
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">5 ans</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">CMO :</span> renouvelable, décompté sur 12 mois glissants. <span className="font-semibold text-slate-700 dark:text-slate-300">CLM/CLD :</span> l'agent en CLM ou CLD ne peut pas cumuler avec un CMO pour la même maladie.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
