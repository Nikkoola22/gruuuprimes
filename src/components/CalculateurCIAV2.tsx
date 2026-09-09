import { useState, useMemo } from 'react'
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Euro, 
  ArrowLeft, 
  Info, 
  Sparkles, 
  Calculator, 
  BarChart3, 
  CalendarDays, 
  FileText,
  RotateCcw
} from 'lucide-react'

interface CalculateurCIAProps {
  onClose: () => void
}

// Définition des étapes du wizard
const STEPS = [
  { 
    id: 1, 
    title: 'IFSE Mensuel', 
    subtitle: 'Votre prime de base',
    icon: Euro,
    gradient: 'from-orange-500 to-amber-500',
    accentText: 'text-orange-600 dark:text-orange-400',
    description: "L'IFSE est la base de calcul de votre CIA. Indiquez le montant que vous percevez chaque mois.",
    tip: '💡 Consultez votre fiche de paie pour trouver le montant exact de votre IFSE mensuel.'
  },
  { 
    id: 2, 
    title: 'Week-ends travaillés', 
    subtitle: 'Samedis et dimanches',
    icon: CalendarDays,
    gradient: 'from-amber-500 to-yellow-500',
    accentText: 'text-amber-600 dark:text-amber-400',
    description: "Indiquez le nombre exact de samedis et dimanches travaillés de janvier à décembre de l'année N-1, avec le taux appliqué.",
    tip: "💡 Saisissez ici le total exact des week-ends travaillés sur l'année N-1, de janvier à décembre."
  },
  { 
    id: 3, 
    title: "Évaluation annuelle N-1", 
    subtitle: 'Votre note de performance',
    icon: BarChart3,
    gradient: 'from-sky-500 to-blue-500',
    accentText: 'text-sky-600 dark:text-sky-400',
    description: "Votre taux d'évaluation détermine la première moitié de votre CIA (50%).",
    tip: '💡 Très satisfaisant = 100% | Satisfaisant = 70% | À consolider = 50% | Non évalué = 0%'
  },
  { 
    id: 4, 
    title: 'Absences N-1', 
    subtitle: "Jours d'absence passés",
    icon: CalendarDays,
    gradient: 'from-purple-500 to-pink-500',
    accentText: 'text-purple-600 dark:text-purple-400',
    description: "Vos jours d'absence de l'année précédente impactent la seconde moitié du CIA (50%).",
    tip: "⚠️ Attention : si vous êtes arrêté pour maladie (MO, AT) du vendredi matin au mardi soir, il faut compter le week-end, donc 5 jours ! (règles Sécurité sociale)"
  },
  { 
    id: 5, 
    title: 'Résultat', 
    subtitle: 'Votre CIA estimé',
    icon: Calculator,
    gradient: 'from-emerald-500 to-teal-500',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    description: 'Récapitulatif complet de votre Complément Indemnitaire Annuel.',
    tip: '🎉 Le CIA est versé une fois par an, généralement en mai/juin.'
  }
]

// Options d'évaluation avec classes de contraste garanti
const EVALUATION_OPTIONS = [
  {
    value: 100,
    label: 'Très satisfaisant',
    desc: '100% de la première moitié',
    activeClass: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 shadow-md ring-2 ring-emerald-500/30',
    badgeClass: 'bg-emerald-500 text-white',
    textClass: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    value: 70,
    label: 'Satisfaisant',
    desc: '70% de la première moitié',
    activeClass: 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-950 dark:text-sky-100 shadow-md ring-2 ring-sky-500/30',
    badgeClass: 'bg-sky-500 text-white',
    textClass: 'text-sky-600 dark:text-sky-400'
  },
  {
    value: 50,
    label: 'À consolider',
    desc: '50% de la première moitié',
    activeClass: 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100 shadow-md ring-2 ring-amber-500/30',
    badgeClass: 'bg-amber-500 text-white',
    textClass: 'text-amber-600 dark:text-amber-400'
  },
  {
    value: 0,
    label: 'Non évalué',
    desc: '0% de la première moitié',
    activeClass: 'border-slate-500 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-md ring-2 ring-slate-500/30',
    badgeClass: 'bg-slate-500 text-white',
    textClass: 'text-slate-500 dark:text-slate-400'
  }
]

export default function CalculateurCIAV2({ onClose }: CalculateurCIAProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [showTip, setShowTip] = useState(true)
  
  // États des sélections
  const [ifseMensuel, setIfseMensuel] = useState<number>(0)
  const [weekendSaturdays, setWeekendSaturdays] = useState<number>(0)
  const [weekendSundays, setWeekendSundays] = useState<number>(0)
  const [weekendRateSat, setWeekendRateSat] = useState<number>(40)
  const [weekendRateSun, setWeekendRateSun] = useState<number>(40)
  const [tauxEvaluation, setTauxEvaluation] = useState<number | null>(null)
  const [joursAbsenceN1, setJoursAbsenceN1] = useState<number>(0)
  const [showDetail, setShowDetail] = useState(false)

  // Calculs
  const weekendTotalAnnuel = (weekendSaturdays * weekendRateSat) + (weekendSundays * weekendRateSun)
  const weekendTotalMensuel = weekendTotalAnnuel / 12
  const ifseMensuelTotal = ifseMensuel + weekendTotalMensuel
  const hasWeekendSelection = weekendSaturdays > 0 || weekendSundays > 0

  const resultat = useMemo(() => {
    if (ifseMensuelTotal <= 0) {
      return {
        ifseAnnuel: 0,
        base10Pourcent: 0,
        tauxAbsence: 0,
        ciaEvaluation: 0,
        ciaAbsence: 0,
        ciaFinal: 0
      }
    }
    
    // IFSE annuel
    const ifseAnnuel = ifseMensuelTotal * 12
    
    // Base CIA = 10% de l'IFSE annuel
    const base10Pourcent = ifseAnnuel * 0.10
    
    // Première moitié (Évaluation)
    const evalTaux = tauxEvaluation || 0
    const ciaEvaluation = (base10Pourcent / 2) * (evalTaux / 100)
    
    // Deuxième moitié (Absences)
    let tauxAbsence = 0
    if (joursAbsenceN1 < 6) {
      tauxAbsence = 100
    } else if (joursAbsenceN1 <= 11) {
      tauxAbsence = 50
    } else {
      tauxAbsence = 0
    }
    const ciaAbsence = (base10Pourcent / 2) * (tauxAbsence / 100)
    
    // Total
    const ciaFinal = ciaEvaluation + ciaAbsence
    
    return {
      ifseAnnuel,
      base10Pourcent,
      tauxAbsence,
      ciaEvaluation,
      ciaAbsence,
      ciaFinal
    }
  }, [ifseMensuelTotal, tauxEvaluation, joursAbsenceN1])

  // Progression
  const getStepStatus = (stepId: number) => {
    if (stepId === 1) return ifseMensuel > 0 ? 'completed' : currentStep === 1 ? 'active' : 'pending'
    if (stepId === 2) return hasWeekendSelection ? 'completed' : currentStep === 2 ? 'active' : 'pending'
    if (stepId === 3) return tauxEvaluation !== null ? 'completed' : currentStep === 3 ? 'active' : 'pending'
    if (stepId === 4) return currentStep > 4 ? 'completed' : currentStep === 4 ? 'active' : 'pending'
    if (stepId === 5) return currentStep === 5 ? 'active' : 'pending'
    return 'pending'
  }

  const canGoNext = () => {
    if (currentStep === 1) return ifseMensuel > 0
    if (currentStep === 2) return true // Optionnel
    if (currentStep === 3) return tauxEvaluation !== null
    if (currentStep === 4) return true // Optionnel
    return false
  }

  const canGoPrev = () => currentStep > 1

  const goNext = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const goPrev = () => {
    if (canGoPrev()) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const resetCalculator = () => {
    setCurrentStep(1)
    setIfseMensuel(0)
    setWeekendSaturdays(0)
    setWeekendSundays(0)
    setWeekendRateSat(40)
    setWeekendRateSun(40)
    setTauxEvaluation(null)
    setJoursAbsenceN1(0)
    setShowDetail(false)
  }

  const currentStepData = STEPS[currentStep - 1]
  const StepIcon = currentStepData.icon

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-4 border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-30">
        <div className="px-4 sm:px-6 flex flex-col gap-4 max-w-4xl mx-auto sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between w-full sm:w-auto gap-3 min-w-0">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Calculateur CIA</h1>
              <p className="text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-semibold">Complément Indemnitaire Annuel</p>
            </div>
            <div className={`p-3 bg-gradient-to-br ${currentStepData.gradient} rounded-xl shadow-md flex-shrink-0`}>
              <Euro className="w-6 h-6 text-white" />
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm shadow-sm border border-slate-300 dark:border-slate-700 transition-all duration-200 group shrink-0"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Retour</span>
            </button>
          )}
        </div>
      </div>

      {/* Barre de progression */}
      <div className="bg-white dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 py-3 px-4">
        <div className="max-w-4xl mx-auto overflow-x-auto pb-2">
          <div className="flex items-center justify-between mb-2 min-w-[480px]">
            {STEPS.map((step, idx) => {
              const status = getStepStatus(step.id)
              const Icon = step.icon
              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => {
                      if (status === 'completed' || step.id <= currentStep) {
                        setCurrentStep(step.id)
                      }
                    }}
                    disabled={status === 'pending' && step.id > currentStep}
                    className={`relative flex flex-col items-center transition-all duration-300 ${
                      status === 'pending' && step.id > currentStep ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
                    }`}
                  >
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      status === 'completed' 
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' 
                        : status === 'active'
                          ? `bg-gradient-to-br ${step.gradient} text-white shadow-md ring-2 ring-orange-400/50`
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-600'
                    }`}>
                      {status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </div>
                    <span className={`text-[10px] sm:text-xs mt-1 font-semibold hidden sm:block ${
                      status === 'active' ? step.accentText : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {step.title}
                    </span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div className={`w-4 sm:w-8 h-0.5 mx-1 sm:mx-2 transition-all duration-500 ${
                      getStepStatus(STEPS[idx + 1].id) !== 'pending' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Récapitulatif flottant */}
      {resultat.ciaFinal > 0 && currentStep < 5 && (
        <div className="px-4 pt-4 sm:px-6 animate-in slide-in-from-right duration-500">
          <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-orange-200 dark:border-orange-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">CIA estimé</p>
                <p className="text-2xl font-black text-orange-600 dark:text-orange-400">
                  {resultat.ciaFinal.toFixed(0)} € <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">/ an</span>
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
              Étape {currentStep}/5
            </span>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          
          {/* En-tête de l'étape */}
          <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-start gap-4">
              <div className={`p-3.5 rounded-xl bg-gradient-to-br ${currentStepData.gradient} shadow-md flex-shrink-0`}>
                <StepIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Étape {currentStep}/5</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${currentStepData.accentText} bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600`}>
                    {currentStepData.subtitle}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">{currentStepData.title}</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{currentStepData.description}</p>
              </div>
            </div>
            
            {/* Tip sans clignotement et avec contraste élevé */}
            {showTip && (
              <div className="mt-4 p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-300 dark:border-amber-700/60 flex items-start gap-3 shadow-sm">
                <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="flex-1 text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-200 leading-relaxed">
                  {currentStepData.tip}
                </p>
                <button 
                  onClick={() => setShowTip(false)} 
                  className="text-amber-700 dark:text-amber-300 hover:text-amber-950 dark:hover:text-white text-xs font-bold transition-colors p-1"
                  aria-label="Masquer l'astuce"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Contenu de l'étape */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md">
            
            {/* ÉTAPE 1: IFSE Mensuel */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in duration-500">
                <div>
                  <label className="text-sm text-slate-800 dark:text-slate-200 block font-bold mb-2">
                    Montant de votre IFSE mensuel (en €)
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 dark:bg-orange-950/50 rounded-xl text-orange-600 dark:text-orange-400 shrink-0">
                      <Euro className="w-6 h-6" />
                    </div>
                    <input
                      type="number"
                      value={ifseMensuel || ''}
                      onChange={(e) => setIfseMensuel(Number(e.target.value) || 0)}
                      placeholder="Ex: 250"
                      className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-lg font-bold focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all shadow-sm"
                    />
                    <span className="text-slate-700 dark:text-slate-300 font-bold">€ / mois</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Consultez votre fiche de paie pour ce montant</p>
                </div>

                {ifseMensuel > 0 && (
                  <div className="p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wide">IFSE mensuel saisi</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{ifseMensuel} € / mois</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wide">Soit par an</p>
                        <p className="text-xl font-black text-orange-600 dark:text-orange-400">{(ifseMensuel * 12).toLocaleString('fr-FR')} €</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ÉTAPE 2: Week-ends */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-500">
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                  Indiquez le nombre exact de samedis et dimanches travaillés de janvier à décembre de l'année N-1, avec le taux appliqué.
                </p>

                {/* Samedis */}
                <div className="p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl shadow-sm">
                  <label className="text-sm text-amber-950 dark:text-amber-200 block font-bold mb-3">
                    📅 Samedis travaillés de janvier à décembre en N-1
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                      type="number"
                      min="0"
                      max="53"
                      value={weekendSaturdays || ''}
                      onChange={(e) => setWeekendSaturdays(Number(e.target.value) || 0)}
                      placeholder="Ex: 18"
                      className="w-full sm:max-w-[160px] px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-lg font-bold focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all shadow-sm"
                    />
                    <select
                      value={weekendRateSat}
                      onChange={(e) => setWeekendRateSat(Number(e.target.value))}
                      className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-sm font-bold shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
                    >
                      {[40, 60, 80].map(rate => (
                        <option key={rate} value={rate}>{rate} € / samedi</option>
                      ))}
                    </select>
                    {weekendSaturdays > 0 && (
                      <span className="text-amber-800 dark:text-amber-300 font-black text-base sm:ml-auto">
                        = {weekendSaturdays * weekendRateSat} € / an
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-2">
                    Saisissez le total exact des samedis travaillés entre janvier et décembre de l'année N-1.
                  </p>
                </div>

                {/* Dimanches */}
                <div className="p-5 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 rounded-xl shadow-sm">
                  <label className="text-sm text-purple-950 dark:text-purple-200 block font-bold mb-3">
                    📅 Dimanches travaillés de janvier à décembre en N-1
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                      type="number"
                      min="0"
                      max="53"
                      value={weekendSundays || ''}
                      onChange={(e) => setWeekendSundays(Number(e.target.value) || 0)}
                      placeholder="Ex: 12"
                      className="w-full sm:max-w-[160px] px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-lg font-bold focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all shadow-sm"
                    />
                    <select
                      value={weekendRateSun}
                      onChange={(e) => setWeekendRateSun(Number(e.target.value))}
                      className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-sm font-bold shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                    >
                      {[40, 60, 80].map(rate => (
                        <option key={rate} value={rate}>{rate} € / dimanche</option>
                      ))}
                    </select>
                    {weekendSundays > 0 && (
                      <span className="text-purple-800 dark:text-purple-300 font-black text-base sm:ml-auto">
                        = {weekendSundays * weekendRateSun} € / an
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-2">
                    Saisissez le total exact des dimanches travaillés entre janvier et décembre de l'année N-1.
                  </p>
                </div>

                {/* Récapitulatif week-ends */}
                {weekendTotalMensuel > 0 && (
                  <div className="p-5 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm space-y-2.5">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Période retenue :</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">Janvier à décembre N-1</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Total week-ends annuel :</span>
                      <span className="font-bold text-slate-900 dark:text-white">{weekendTotalAnnuel.toFixed(2)} € / an</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Équivalent mensuel ajouté à l'IFSE :</span>
                      <span className="font-bold text-orange-600 dark:text-orange-400">+{weekendTotalMensuel.toFixed(2)} € / mois</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200 dark:border-slate-700 font-bold">
                      <span className="text-slate-800 dark:text-slate-200">IFSE total (base + équivalent week-ends) :</span>
                      <span className="text-base font-black text-orange-600 dark:text-orange-400">{ifseMensuelTotal.toFixed(2)} € / mois</span>
                    </div>
                  </div>
                )}

                {weekendTotalMensuel === 0 && (
                  <div className="p-4 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-center">
                    <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">
                      Vous ne travaillez pas les week-ends ? Vous pouvez directement passer à l'étape suivante.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ÉTAPE 3: Évaluation */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-3">
                  Sélectionnez votre niveau d'évaluation annuelle de l'année dernière (N-1) :
                </p>
                
                <div className="space-y-3">
                  {EVALUATION_OPTIONS.map((option) => {
                    const isSelected = tauxEvaluation === option.value
                    return (
                      <button
                        key={option.value}
                        onClick={() => setTauxEvaluation(option.value)}
                        className={`w-full p-4 sm:p-5 rounded-xl text-left transition-all border-2 ${
                          isSelected
                            ? option.activeClass
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3.5">
                            <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                              isSelected 
                                ? option.badgeClass 
                                : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-400'
                            }`}>
                              {isSelected ? '✓' : ''}
                            </div>
                            <div>
                              <p className="text-slate-900 dark:text-white font-black text-base">{option.label}</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{option.desc}</p>
                            </div>
                          </div>
                          <span className={`text-xl font-black ${option.textClass}`}>
                            {option.value}%
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {tauxEvaluation !== null && (
                  <div className="p-4 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 shadow-sm rounded-xl mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wide">Part évaluation du CIA</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">(50% de la base × {tauxEvaluation}%)</p>
                      </div>
                      <span className="text-xl font-black text-sky-600 dark:text-sky-400">
                        {resultat.ciaEvaluation.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ÉTAPE 4: Absences */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-in fade-in duration-500">
                <div>
                  <label className="text-sm text-slate-800 dark:text-slate-200 block font-bold mb-2">
                    Nombre de jours d'absence en N-1 (année précédente)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={joursAbsenceN1 || ''}
                    onChange={(e) => setJoursAbsenceN1(Number(e.target.value) || 0)}
                    placeholder="Ex: 3"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-lg font-bold focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all shadow-sm"
                  />
                </div>

                {/* Barème visuel */}
                <div className="space-y-2">
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wide">Barème appliqué :</p>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className={`p-3.5 rounded-xl text-center transition-all ${
                      joursAbsenceN1 < 6 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 shadow-sm text-emerald-950 dark:text-emerald-100' 
                        : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                    }`}>
                      <p className={`text-lg font-black ${joursAbsenceN1 < 6 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>100%</p>
                      <p className="text-xs font-semibold mt-0.5">&lt; 6 jours</p>
                    </div>
                    <div className={`p-3.5 rounded-xl text-center transition-all ${
                      joursAbsenceN1 >= 6 && joursAbsenceN1 <= 11 
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500 shadow-sm text-amber-950 dark:text-amber-100' 
                        : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                    }`}>
                      <p className={`text-lg font-black ${joursAbsenceN1 >= 6 && joursAbsenceN1 <= 11 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>50%</p>
                      <p className="text-xs font-semibold mt-0.5">6 à 11 jours</p>
                    </div>
                    <div className={`p-3.5 rounded-xl text-center transition-all ${
                      joursAbsenceN1 > 11 
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500 shadow-sm text-rose-950 dark:text-rose-100' 
                        : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                    }`}>
                      <p className={`text-lg font-black ${joursAbsenceN1 > 11 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>0%</p>
                      <p className="text-xs font-semibold mt-0.5">&gt; 11 jours</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 shadow-sm rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wide">Part absences du CIA</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">(50% de la base × {resultat.tauxAbsence}%)</p>
                    </div>
                    <span className="text-xl font-black text-purple-600 dark:text-purple-400">
                      {resultat.ciaAbsence.toFixed(2)} €
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 5: Résultat */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-center mb-4">
                  <div className="w-14 h-14 bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Votre CIA estimé</h3>
                  <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">Complément Indemnitaire Annuel</p>
                </div>

                {/* Hero Card Total */}
                <div className="p-6 sm:p-8 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white rounded-2xl sm:rounded-3xl shadow-lg border border-orange-400/40 text-center">
                  <p className="text-orange-100 text-xs sm:text-sm uppercase tracking-widest font-black mb-2">
                    CIA BRUT ANNUEL ESTIMÉ
                  </p>
                  <p className="text-5xl sm:text-6xl font-black text-white drop-shadow-md">
                    {resultat.ciaFinal.toFixed(0)} €
                  </p>
                  <p className="text-orange-100 text-sm mt-3 font-semibold">
                    Montant versé une fois par an (généralement fin mai / juin)
                  </p>
                </div>

                {/* Détail du calcul */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-orange-50/70 dark:bg-orange-950/30 rounded-xl border border-orange-200 dark:border-orange-800/60 shadow-sm">
                    <div>
                      <p className="text-orange-950 dark:text-orange-200 font-bold text-sm">IFSE mensuel total retenu</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Base {ifseMensuel} € + Équivalent week-ends {weekendTotalMensuel.toFixed(2)} €</p>
                    </div>
                    <span className="text-lg font-black text-orange-600 dark:text-orange-400">{ifseMensuelTotal.toFixed(2)} €</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div>
                      <p className="text-slate-900 dark:text-white font-bold text-sm">Base CIA (10% IFSE annuel)</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{resultat.ifseAnnuel.toFixed(0)} € × 10%</p>
                    </div>
                    <span className="text-lg font-black text-slate-900 dark:text-white">{resultat.base10Pourcent.toFixed(2)} €</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-sky-50/70 dark:bg-sky-950/30 rounded-xl border border-sky-200 dark:border-sky-800/60 shadow-sm">
                    <div>
                      <p className="text-sky-950 dark:text-sky-200 font-bold text-sm">Part Évaluation (50%)</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Taux appliqué : {tauxEvaluation}%</p>
                    </div>
                    <span className="text-lg font-black text-sky-600 dark:text-sky-400">{resultat.ciaEvaluation.toFixed(2)} €</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-purple-50/70 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800/60 shadow-sm">
                    <div>
                      <p className="text-purple-950 dark:text-purple-200 font-bold text-sm">Part Absences (50%)</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{joursAbsenceN1} jours → {resultat.tauxAbsence}%</p>
                    </div>
                    <span className="text-lg font-black text-purple-600 dark:text-purple-400">{resultat.ciaAbsence.toFixed(2)} €</span>
                  </div>
                </div>

                {/* Détail complet (toggle) */}
                <button
                  onClick={() => setShowDetail(!showDetail)}
                  className="w-full flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold py-2 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  {showDetail ? 'Masquer' : 'Voir'} le détail formule du calcul
                </button>

                {showDetail && (
                  <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-mono space-y-2 break-words shadow-inner">
                    <p>📊 Période week-ends = janvier à décembre de l'année N-1</p>
                    <p>📊 Total week-ends annuel = ({weekendSaturdays} × {weekendRateSat} €) + ({weekendSundays} × {weekendRateSun} €) = {weekendTotalAnnuel.toFixed(2)} €</p>
                    <p>📊 IFSE mensuel = {ifseMensuel} € + {weekendTotalMensuel.toFixed(2)} € = {ifseMensuelTotal.toFixed(2)} €</p>
                    <p>📊 IFSE annuel = {ifseMensuelTotal.toFixed(2)} € × 12 = {resultat.ifseAnnuel.toFixed(2)} €</p>
                    <p>📊 Base CIA = {resultat.ifseAnnuel.toFixed(2)} € × 10% = {resultat.base10Pourcent.toFixed(2)} €</p>
                    <p className="border-t border-slate-300 dark:border-slate-700 pt-2 mt-2 font-semibold">
                      ➜ Part évaluation = ({(resultat.base10Pourcent/2).toFixed(2)} €) × {tauxEvaluation}% = {resultat.ciaEvaluation.toFixed(2)} €
                    </p>
                    <p className="font-semibold">
                      ➜ Part absences = ({(resultat.base10Pourcent/2).toFixed(2)} €) × {resultat.tauxAbsence}% = {resultat.ciaAbsence.toFixed(2)} €
                    </p>
                    <p className="border-t border-slate-300 dark:border-slate-700 pt-2 mt-2 text-orange-600 dark:text-orange-400 font-black text-sm">
                      ✅ CIA TOTAL ESTIMÉ = {resultat.ciaEvaluation.toFixed(2)} € + {resultat.ciaAbsence.toFixed(2)} € = {resultat.ciaFinal.toFixed(2)} €
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={resetCalculator}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-all shadow-sm border border-slate-300 dark:border-slate-700"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Recommencer
                  </button>
                  {onClose && (
                    <button
                      onClick={onClose}
                      className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all shadow-md shadow-orange-500/20"
                    >
                      Terminer
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center mt-4">
                  ⚠️ Ce calcul est une simulation indicative. Le montant final dépend des décisions et délibérations de votre administration.
                </p>
              </div>
            )}
          </div>

          {/* Boutons de navigation */}
          {currentStep < 5 && (
            <div className="flex flex-col-reverse mt-6 gap-3 sm:flex-row sm:justify-between sm:gap-4">
              <button
                onClick={goPrev}
                disabled={!canGoPrev()}
                className={`flex w-full items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all sm:w-auto ${
                  canGoPrev()
                    ? 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-800'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Précédent
              </button>
              
              <button
                onClick={goNext}
                disabled={!canGoNext() && currentStep !== 2 && currentStep !== 4}
                className={`flex w-full items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all sm:w-auto ${
                  canGoNext() || currentStep === 2 || currentStep === 4
                    ? `bg-gradient-to-r ${currentStepData.gradient} hover:opacity-95 text-white shadow-md shadow-orange-500/20`
                    : 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-800'
                }`}
              >
                {currentStep === 4 ? 'Voir le résultat' : 'Suivant'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Skip pour les étapes optionnelles */}
          {(currentStep === 2 || currentStep === 4) && (
            <div className="text-center mt-4">
              <button
                onClick={goNext}
                className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                Passer cette étape →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
