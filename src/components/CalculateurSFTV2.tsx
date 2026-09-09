import { useState, useMemo } from 'react'
import { 
  Euro, 
  ArrowLeft, 
  Info,
  Calculator,
  Users,
  Clock,
  CheckCircle2
} from 'lucide-react'

interface CalculateurSFTProps {
  onClose?: () => void
}

export default function CalculateurSFTV2({ onClose }: CalculateurSFTProps) {
  const [im, setIm] = useState<string>('')
  const [nbi, setNbi] = useState<string>('0')
  const [tempsTravail, setTempsTravail] = useState<string>('100')
  const [numChildren, setNumChildren] = useState<string>('0')
  const [childrenDates, setChildrenDates] = useState<string[]>([])
  
  const [showResult, setShowResult] = useState(false)

  const handleNumChildrenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    const clamped = Math.max(0, Math.min(15, val));
    setNumChildren(clamped.toString());
    
    // Adjust dates array
    setChildrenDates(prev => {
      const next = [...prev];
      if (next.length < clamped) {
        return [...next, ...Array(clamped - next.length).fill('')];
      }
      return next.slice(0, clamped);
    });
    setShowResult(false);
  }

  const handleDateChange = (index: number, value: string) => {
    setChildrenDates(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setShowResult(false);
  }

  // Fonction pour tronquer à 2 décimales (ignorer les millièmes)
  const trunc = (val: number) => Math.floor(val * 100) / 100;

  const result = useMemo(() => {
    if (!showResult) return null;

    let eligibleChildren = 0;
    const today = new Date();
    
    childrenDates.forEach(dateInput => {
      if (dateInput) {
        const birthDate = new Date(dateInput);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 20) {
          eligibleChildren++;
        }
      }
    });

    const imNum = parseFloat(im) || 0;
    const nbiNum = parseFloat(nbi) || 0;
    const temps = parseFloat(tempsTravail) || 100;
    const ratioTemps = Math.min(100, Math.max(1, temps)) / 100;

    let im_calc = imNum + nbiNum;
    let assumedMinimum = false;
    
    if (im_calc < 454 || imNum === 0) {
        im_calc = 454;
        if (imNum === 0) assumedMinimum = true;
    }
    if (im_calc > 722) {
        im_calc = 722;
    }

    const TIB_full = im_calc * 5907.34 / 1200;
    const TIB_partiel = TIB_full * ratioTemps;

    let sft = 0;
    let details = "";
    
    let sft_min_absolu = 0;
    if (eligibleChildren === 1) sft_min_absolu = 2.29;
    else if (eligibleChildren === 2) sft_min_absolu = 77.71;
    else if (eligibleChildren === 3) sft_min_absolu = 194.03;
    else if (eligibleChildren > 3) sft_min_absolu = 194.03 + (eligibleChildren - 3) * 138.66;

    if (eligibleChildren === 0) {
        sft = 0;
    } else if (eligibleChildren === 1) {
        sft = 2.29; 
    } else if (eligibleChildren === 2) {
        let p_fixe = trunc(10.67 * ratioTemps);
        let p_prop = trunc(TIB_partiel * 0.03);
        sft = p_fixe + p_prop;
        details = `Part fixe (proratisée) : ${p_fixe.toFixed(2)} € | Part proportionnelle (3%) : ${p_prop.toFixed(2)} €`;
    } else if (eligibleChildren === 3) {
        let p_fixe = trunc(15.24 * ratioTemps);
        let p_prop = trunc(TIB_partiel * 0.08);
        sft = p_fixe + p_prop;
        details = `Part fixe (proratisée) : ${p_fixe.toFixed(2)} € | Part proportionnelle (8%) : ${p_prop.toFixed(2)} €`;
    } else {
        let p_fixe_3 = trunc(15.24 * ratioTemps);
        let p_prop_3 = trunc(TIB_partiel * 0.08);
        let extra_fixe = trunc(4.57 * ratioTemps);
        let extra_prop = trunc(TIB_partiel * 0.06);
        
        let extra_count = eligibleChildren - 3;
        sft = p_fixe_3 + p_prop_3 + (extra_count * (extra_fixe + extra_prop));
        
        details = `Base 3 enfants : ${(p_fixe_3 + p_prop_3).toFixed(2)} € | Par enfant supp. (${extra_count}) : ${(extra_fixe + extra_prop).toFixed(2)} € x ${extra_count}`;
    }
    
    let appliedMin = false;
    if (sft < sft_min_absolu && eligibleChildren >= 2) {
        sft = sft_min_absolu;
        appliedMin = true;
    }

    return {
      sft,
      eligibleChildren,
      details,
      appliedMin,
      assumedMinimum,
      capped: im_calc === 722 && (imNum + nbiNum) > 722,
      sft_min_absolu
    };
  }, [showResult, im, nbi, tempsTravail, childrenDates]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4 mb-4">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              title="Retour aux calculateurs"
            >
              <ArrowLeft className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          )}
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">Calculateur SFT</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Supplément Familial de Traitement (à jour des montants 454-722)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Indice Majoré (IM)
                </label>
                <div className="relative">
                  <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    value={im}
                    onChange={(e) => { setIm(e.target.value); setShowResult(false); }}
                    placeholder="Ex: 436"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">Laissez vide pour simuler le plancher (IM 454).</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  NBI (points)
                </label>
                <input
                  type="number"
                  value={nbi}
                  onChange={(e) => { setNbi(e.target.value); setShowResult(false); }}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Temps de travail (%)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={tempsTravail}
                    onChange={(e) => { setTempsTravail(e.target.value); setShowResult(false); }}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nombre d'enfants à charge
                </label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={numChildren}
                  onChange={handleNumChildrenChange}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                />
              </div>
            </div>

            {parseInt(numChildren) > 0 && (
              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-4">Dates de naissance</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {childrenDates.map((date, index) => (
                    <div key={index}>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Enfant {index + 1}
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => handleDateChange(index, e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowResult(true)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              Calculer mon SFT
            </button>
          </div>
        </div>

        {/* Résultats et infos */}
        <div className="space-y-6">
          {showResult && result && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 shadow-sm border border-blue-100 dark:border-blue-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                <Euro className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Résultat
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">Enfants éligibles (-20 ans)</p>
                <p className="text-lg font-semibold text-slate-800 dark:text-white">
                  {result.eligibleChildren} sur {numChildren}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">Montant SFT Brut Mensuel</p>
                <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">
                  {result.sft.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </p>
              </div>

              {result.details && (
                <div className="p-3 bg-white/60 dark:bg-slate-900/60 rounded-lg text-sm text-slate-700 dark:text-slate-300 mt-4 border border-blue-100/50 dark:border-blue-800/50">
                  <p dangerouslySetInnerHTML={{ __html: result.details }}></p>
                </div>
              )}

              {result.appliedMin && !result.assumedMinimum && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg flex gap-3">
                  <Info className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                  <p className="text-xs text-red-800 dark:text-red-300">
                    <strong>Application du plancher garanti</strong> : Votre calcul initial était inférieur au minimum absolu temps plein ({result.sft_min_absolu.toFixed(2)} €). C'est ce minimum légal qui vous est versé.
                  </p>
                </div>
              )}

              {result.assumedMinimum && result.eligibleChildren >= 2 && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg flex gap-3">
                  <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Montant correspondant au <strong>plancher</strong> (calculé sur l'indice 454). Pour un calcul exact, renseignez votre IM.
                  </p>
                </div>
              )}

              {result.capped && (
                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/30 rounded-lg flex gap-3">
                  <Info className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0" />
                  <p className="text-xs text-orange-800 dark:text-orange-300">
                    <strong>Application du plafond</strong> : Indice dépassant 722, calculé sur la base de l'indice 722 maximum.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Règles d'attribution
            </h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-3 list-disc pl-4">
              <li>Versé à tout agent public ayant au moins un enfant à charge de <strong>moins de 20 ans</strong>.</li>
              <li>Calcul basé sur <strong>l'Indice Majoré + la NBI</strong>.</li>
              <li>Encadré par un <strong>plancher</strong> (indice 454) et un <strong>plafond</strong> (indice 722).</li>
              <li>En cas de temps partiel, le SFT est réduit proportionnellement, mais <strong>ne peut être inférieur au SFT minimum d'un agent à temps plein</strong>.</li>
              <li>Si les deux parents sont agents publics, il n'est versé qu'à un seul (au choix, idéalement celui avec l'IM le plus élevé).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
