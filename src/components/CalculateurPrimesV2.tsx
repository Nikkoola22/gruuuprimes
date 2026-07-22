import { useState, useMemo, useRef, useEffect } from 'react'
import { 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2, 
  TrendingUp, 
  ArrowLeft, 
  Briefcase,
  Building2,
  Users,
  Calendar,
  Award,
  Calculator,
  Info,
  Sparkles,
  HeartPulse,
  Shield,
  Trees,
  Landmark,
  Wrench,
  Scale,
  Home,
  Map,
  BookOpen,
  Baby,
  Cpu,
  Wallet,
  Crown,
  HandHelping,
  FolderKanban,
  Building,
  RotateCcw,
  ShieldAlert,
  Coins
} from 'lucide-react'
import { BorderGlow } from './ui/BorderGlow.tsx'
import { ShinyText } from './ui/ShinyText.tsx'

import { 
  ifse1Data, 
  getDirectionFullName, 
  getAllDirections, 
  getIFSE2ByDirection, 
  getServicesByDirection
} from '../data/rifseep-data'

interface CalculateurPrimesProps {
  onClose?: () => void
}

const STEPS = [
  { 
    id: 1, 
    title: 'Catégorie', 
    subtitle: 'Grille indiciaire',
    icon: Briefcase,
    color: 'blue',
    description: 'La catégorie détermine votre niveau de qualification (A = Bac+3, B = Bac à Bac+2, C = Sans diplôme).',
    tip: '💡 Choisissez votre catégorie statutaire d\'appartenance (A, B ou C).'
  },
  { 
    id: 2, 
    title: 'Fonction', 
    subtitle: 'IFSE 1 - Socle fixe',
    icon: Users,
    color: 'cyan',
    description: 'L\'IFSE 1 est la prime mensuelle liée à la responsabilité de votre poste.',
    tip: '💡 Cette prime est versée chaque mois automatiquement.'
  },
  { 
    id: 3, 
    title: 'Direction & Métier', 
    subtitle: 'IFSE 2 - Sujétions',
    icon: Building2,
    color: 'teal',
    description: 'Primes complémentaires associées à votre direction, service et contraintes métiers.',
    tip: '💡 Les primes de sujétion s\'ajoutent selon vos missions effectives.'
  },
  { 
    id: 4, 
    title: 'Week-ends', 
    subtitle: 'IFSE 3 - Astreintes',
    icon: Calendar,
    color: 'purple',
    description: 'Forfaits pour les samedis et dimanches travaillés dans le mois.',
    tip: '💡 40€, 60€ ou 80€ par samedi ou dimanche travaillé.'
  },
  { 
    id: 5, 
    title: 'Primes spéciales', 
    subtitle: 'Missions particulières',
    icon: Award,
    color: 'orange',
    description: 'Primes événementielles (intérim, tutorat d\'apprenti, suppléance...).',
    tip: '💡 Cochez uniquement les primes correspondant à vos fonctions.'
  },
  { 
    id: 6, 
    title: 'Résultat', 
    subtitle: 'Synthèse globale',
    icon: Calculator,
    color: 'emerald',
    description: 'Tableau de bord complet de vos primes RIFSEEP estimées.',
    tip: '🎉 Cette estimation est mensuelle brute.'
  }
]

export default function CalculateurPrimesV2({ onClose }: CalculateurPrimesProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [showTip, setShowTip] = useState(true)
  
  // Selection states
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedFunctionIndex, setSelectedFunctionIndex] = useState<number | null>(null)
  const [selectedDirection, setSelectedDirection] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [selectedJob, setSelectedJob] = useState('')
  const [compactJobsView, setCompactJobsView] = useState(true)
  const [selectedIFSE2, setSelectedIFSE2] = useState<Set<number>>(new Set())
  const [lastToggledPrimeIdx, setLastToggledPrimeIdx] = useState<number | null>(null)
  const [lastToggleWasAdd, setLastToggleWasAdd] = useState(false)
  const [selectedSpecialPrimes, setSelectedSpecialPrimes] = useState<Set<number>>(new Set())
  const [weekendSaturdays, setWeekendSaturdays] = useState(0)
  const [weekendSundays, setWeekendSundays] = useState(0)
  const [weekendRateSat, setWeekendRateSat] = useState(40)
  const [weekendRateSun, setWeekendRateSun] = useState(40)

  const serviceSectionRef = useRef<HTMLDivElement | null>(null)
  const jobSectionRef = useRef<HTMLDivElement | null>(null)
  const primesSectionRef = useRef<HTMLDivElement | null>(null)
  const navigationSectionRef = useRef<HTMLDivElement | null>(null)
  const mainScrollRef = useRef<HTMLDivElement | null>(null)

  // Calculations
  const ifse1Amount = useMemo(() => {
    if (selectedFunctionIndex === null) return 0
    const item = ifse1Data[selectedFunctionIndex]
    return item?.monthlyAmount || 0
  }, [selectedFunctionIndex])

  const ifse2Amount = useMemo(() => {
    if (!selectedDirection || selectedIFSE2.size === 0) return 0
    const ifse2List = getIFSE2ByDirection(selectedDirection)
    return Array.from(selectedIFSE2).reduce((sum, idx) => {
      return sum + (ifse2List[idx]?.amount || 0)
    }, 0)
  }, [selectedDirection, selectedIFSE2])

  const ifse3Total = (weekendSaturdays * weekendRateSat) + (weekendSundays * weekendRateSun)

  const specialPrimesData = useMemo(() => [
    { name: 'Prime intérim', amount: 150, desc: 'Remplacement temporaire d\'un poste vacant' },
    { name: 'Prime technicité (Formateur)', amount: 75, desc: 'Expertise technique ou d\'animation reconnue' },
    { name: 'Prime Maître d\'apprentissage', amount: 98.46, desc: 'Encadrement statutaire d\'un apprenti' },
    { name: 'Prime Référent financier suppléant', amount: 40, desc: 'Suppléance de régisseur ou référent financier' },
    { name: 'Prime ODEC Partiel', amount: 40, desc: 'Officier d\'état civil à temps partiel' },
  ], [])

  const specialPrimesAmount = useMemo(() => {
    if (selectedSpecialPrimes.size === 0) return 0
    return Array.from(selectedSpecialPrimes).reduce((sum, idx) => {
      return sum + (specialPrimesData[idx]?.amount || 0)
    }, 0)
  }, [selectedSpecialPrimes, specialPrimesData])

  const allDirections = useMemo(
    () => getAllDirections().filter(dir => dir !== 'Toutes dir°' && dir !== 'Toutes directions'),
    []
  )

  const directionPrimes = useMemo(() => {
    if (!selectedDirection) return []
    return getIFSE2ByDirection(selectedDirection)
  }, [selectedDirection])

  const availableServices = useMemo(() => {
    if (!selectedDirection) return []
    return getServicesByDirection(selectedDirection)
  }, [selectedDirection])

  const availableJobs = useMemo(() => {
    if (!selectedDirection) return []

    return directionPrimes
      .filter(
        p =>
          (!selectedService ||
            p.service === selectedService ||
            p.service === 'Tous services' ||
            p.direction === 'Toutes dir°') &&
          p.jobs?.length
      )
      .flatMap(p => p.jobs || [])
      .filter((job, idx, arr) => arr.indexOf(job) === idx && job !== '')
      .sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }))
  }, [selectedDirection, selectedService, directionPrimes])

  const availablePrimesForSelectedJob = useMemo(() => {
    if (!selectedDirection || !selectedJob) return [] as Array<{ motif: string; amount: number; service: string; realIdx: number }>

    return directionPrimes
      .map((prime, realIdx) => ({
        motif: prime.motif,
        amount: prime.amount,
        service: prime.service || 'Tous services',
        jobs: prime.jobs,
        realIdx,
      }))
      .filter(
        prime =>
          prime.jobs?.includes(selectedJob) &&
          (!selectedService || prime.service === selectedService || prime.service === 'Tous services')
      )
      .map(({ motif, amount, service, realIdx }) => ({ motif, amount, service, realIdx }))
  }, [selectedDirection, selectedJob, selectedService, directionPrimes])

  const functionsForCategory = useMemo(() => {
    if (!selectedCategory) return [] as Array<{ globalIdx: number; functionName: string; amount: number }>
    return ifse1Data
      .map((item, globalIdx) => ({
        globalIdx,
        functionName: item.function,
        amount: item.monthlyAmount,
        category: item.category,
      }))
      .filter(item => item.category === selectedCategory)
      .map(({ globalIdx, functionName, amount }) => ({ globalIdx, functionName, amount }))
  }, [selectedCategory])

  const totalMonthly = Math.round((ifse1Amount + ifse2Amount + ifse3Total + specialPrimesAmount) * 100) / 100

  const getStepStatus = (stepId: number) => {
    if (stepId === 1) return selectedCategory ? 'completed' : currentStep === 1 ? 'active' : 'pending'
    if (stepId === 2) return selectedFunctionIndex !== null ? 'completed' : currentStep === 2 ? 'active' : 'pending'
    if (stepId === 3) return selectedJob ? 'completed' : currentStep === 3 ? 'active' : 'pending'
    if (stepId === 4) return (weekendSaturdays > 0 || weekendSundays > 0) ? 'completed' : currentStep === 4 ? 'active' : 'pending'
    if (stepId === 5) return selectedSpecialPrimes.size > 0 ? 'completed' : currentStep === 5 ? 'active' : 'pending'
    if (stepId === 6) return currentStep === 6 ? 'active' : 'pending'
    return 'pending'
  }

  const canGoNext = () => {
    if (currentStep === 1) return selectedCategory !== ''
    if (currentStep === 2) return selectedFunctionIndex !== null
    if (currentStep === 3) return true
    if (currentStep === 4) return true
    if (currentStep === 5) return true
    return false
  }

  const canGoPrev = () => currentStep > 1

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>, delay = 50) => {
    window.setTimeout(() => {
      const target = ref.current
      if (!target) return
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, delay)
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    setSelectedFunctionIndex(null)
  }

  const handleFunctionSelect = (index: number) => {
    setSelectedFunctionIndex(index)
  }

  const goNext = () => {
    if (canGoNext() && currentStep < 6) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const goPrev = () => {
    if (canGoPrev()) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleDirectionSelect = (dir: string) => {
    setSelectedDirection(dir)
    setSelectedIFSE2(new Set())
    setSelectedJob('')
    setSelectedService('')
    setLastToggledPrimeIdx(null)
  }

  const handleServiceSelect = (service: string) => {
    setSelectedService(service)
    setSelectedIFSE2(new Set())
    setSelectedJob('')
    setLastToggledPrimeIdx(null)
  }

  const handleJobSelect = (job: string) => {
    setSelectedJob(job)
    setLastToggledPrimeIdx(null)
    if (!job) return
    
    const directionPrimesList = getIFSE2ByDirection(selectedDirection)
    const jobPrimes = directionPrimesList.filter(p => 
      p.jobs?.includes(job) && 
      (!selectedService || p.service === selectedService || p.service === 'Tous services')
    )
    
    const newSelectedIFSE2 = new Set<number>()
    jobPrimes.forEach(jobPrime => {
      const primeIdx = directionPrimesList.findIndex(p => p === jobPrime)
      if (primeIdx >= 0) {
        newSelectedIFSE2.add(primeIdx)
      }
    })
    setSelectedIFSE2(newSelectedIFSE2)
  }

  const handleToggleIFSE2 = (idx: number) => {
    const newSet = new Set(selectedIFSE2)
    const wasSelected = newSet.has(idx)
    if (newSet.has(idx)) {
      newSet.delete(idx)
    } else {
      newSet.add(idx)
    }
    setSelectedIFSE2(newSet)
    setLastToggleWasAdd(!wasSelected)
    setLastToggledPrimeIdx(idx)
    window.setTimeout(() => {
      setLastToggledPrimeIdx(prev => (prev === idx ? null : prev))
    }, 700)
  }

  const handleToggleSpecialPrime = (idx: number) => {
    const newSet = new Set(selectedSpecialPrimes)
    if (newSet.has(idx)) {
      newSet.delete(idx)
    } else {
      newSet.add(idx)
    }
    setSelectedSpecialPrimes(newSet)
  }

  const resetCalculator = () => {
    setCurrentStep(1)
    setSelectedCategory('')
    setSelectedFunctionIndex(null)
    setSelectedDirection('')
    setSelectedService('')
    setSelectedJob('')
    setSelectedIFSE2(new Set())
    setSelectedSpecialPrimes(new Set())
    setWeekendSaturdays(0)
    setWeekendSundays(0)
  }

  const currentStepData = STEPS[currentStep - 1]
  const StepIcon = currentStepData.icon

  const getDirectionVisual = (dir: string) => {
    const map: Record<string, { icon: typeof Building2; colorClass: string }> = {
      DAF: { icon: Wallet, colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
      DAJ: { icon: Scale, colorClass: 'text-slate-300 bg-slate-500/10 border-slate-500/30' },
      DCCS: { icon: HandHelping, colorClass: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30' },
      DCJ: { icon: BookOpen, colorClass: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
      DE: { icon: Trees, colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
      DG: { icon: Crown, colorClass: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
      DH: { icon: Home, colorClass: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
      DDU: { icon: Map, colorClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
      DESS: { icon: Shield, colorClass: 'text-violet-400 bg-violet-500/10 border-violet-500/30' },
      DME: { icon: Baby, colorClass: 'text-green-400 bg-green-500/10 border-green-500/30' },
      DRH: { icon: Users, colorClass: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
      DMS: { icon: HeartPulse, colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
      DMSP: { icon: HeartPulse, colorClass: 'text-red-400 bg-red-500/10 border-red-500/30' },
      DMRU: { icon: Landmark, colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
      DPE: { icon: Baby, colorClass: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
      DPO: { icon: FolderKanban, colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
      DPB: { icon: Building, colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
      DRU: { icon: Map, colorClass: 'text-slate-300 bg-slate-500/10 border-slate-500/30' },
      DSA: { icon: HandHelping, colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
      DSI: { icon: Cpu, colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
      'Toutes dir°': { icon: Briefcase, colorClass: 'text-neutral-400 bg-neutral-500/10 border-neutral-500/30' },
    }
    return map[dir] || { icon: Wrench, colorClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Background Glow Overlay */}
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 rounded-full"
        style={{
          width: 1000, height: 1000,
          background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.1) 0%, rgba(59,130,246,0.05) 50%, transparent 75%)',
          filter: 'blur(70px)'
        }}
      />

      <div className="relative z-10 flex flex-col flex-1">

        {/* --- Top Sticky Navigation Header --- */}
        <div className="bg-slate-900/90 backdrop-blur-2xl py-4 px-4 sm:px-8 border-b border-slate-800 shadow-[0_4px_25px_rgba(0,0,0,0.6)] sticky top-0 z-30">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all border border-slate-700 shadow-sm"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                  Calculateur de Primes RIFSEEP
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  Simulation complète IFSE 1, IFSE 2, IFSE 3 et primes spéciales
                </p>
              </div>
            </div>

            {totalMonthly > 0 && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-4 py-2 rounded-2xl flex items-center gap-2 font-mono font-bold text-xs shadow-inner">
                <Coins className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Estimé:</span>
                <span className="text-cyan-200 text-sm">{totalMonthly.toLocaleString('fr-FR')}€/mois</span>
              </div>
            )}
          </div>
        </div>

        {/* --- Interactive Stepper Header --- */}
        <div className="bg-slate-900/60 border-b border-slate-800 py-3.5 px-4 sm:px-8 shadow-sm">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between overflow-x-auto pb-1">
              {STEPS.map((step, idx) => {
                const status = getStepStatus(step.id)
                const Icon = step.icon
                const isActive = currentStep === step.id

                return (
                  <div key={step.id} className="flex items-center shrink-0">
                    <button
                      onClick={() => {
                        if (status === 'completed' || step.id <= currentStep) {
                          setCurrentStep(step.id)
                        }
                      }}
                      disabled={status === 'pending' && step.id > currentStep}
                      className={`flex flex-col items-center gap-1.5 transition-all ${
                        status === 'pending' && step.id > currentStep ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all ${
                        status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : isActive
                            ? 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-110'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}>
                        {status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <span className={`text-[11px] hidden sm:block ${
                        isActive ? 'font-black text-white' : 'font-medium text-slate-400'
                      }`}>
                        {step.title}
                      </span>
                    </button>

                    {idx < STEPS.length - 1 && (
                      <div className={`w-6 sm:w-10 h-0.5 mx-2 transition-all ${
                        getStepStatus(STEPS[idx + 1].id) !== 'pending' ? 'bg-cyan-500' : 'bg-slate-800'
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* --- Main Wizard Container --- */}
        <div ref={mainScrollRef} className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">

            {/* Step Header Banner */}
            <div className="mb-6 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-2xl">
              <div className="flex items-start gap-4">
                <div className="p-3.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shrink-0">
                  <StepIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-slate-400">Étape {currentStep}/6</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30">
                      {currentStepData.subtitle}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-tight">{currentStepData.title}</h2>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">{currentStepData.description}</p>
                </div>
              </div>

              {showTip && (
                <div className="mt-4 p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-center justify-between text-xs text-amber-300 font-medium">
                  <span className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-400 shrink-0" />
                    {currentStepData.tip}
                  </span>
                  <button onClick={() => setShowTip(false)} className="text-slate-500 hover:text-white text-xs px-1.5">✕</button>
                </div>
              )}
            </div>

            {/* Step Body Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
              
              {/* ÉTAPE 1: Catégorie */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-black text-white mb-1">Sélectionnez votre catégorie statutaire</h3>
                    <p className="text-xs text-slate-400">Niveau de qualification RH requis pour votre grille</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { key: 'A', title: 'Catégorie A', level: 'Cadres / Conception', sub: 'Bac +3 minimum', color: 'from-blue-500 to-cyan-500' },
                      { key: 'B', title: 'Catégorie B', level: 'Intermédiaires / Maîtrise', sub: 'Bac à Bac +2', color: 'from-cyan-500 to-teal-500' },
                      { key: 'C', title: 'Catégorie C', level: 'Exécution / Technique', sub: 'Sans condition de diplôme', color: 'from-teal-500 to-emerald-500' },
                    ].map(cat => {
                      const isSelected = selectedCategory === cat.key
                      return (
                        <button
                          key={cat.key}
                          onClick={() => handleCategorySelect(cat.key)}
                          className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 relative overflow-hidden group ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-950/50 shadow-[0_0_30px_rgba(6,182,212,0.25)] scale-[1.02]'
                              : 'border-slate-800 bg-slate-950/80 hover:border-slate-700 hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-3xl font-black text-white font-mono">{cat.key}</span>
                            {isSelected && <CheckCircle2 className="w-6 h-6 text-cyan-400" />}
                          </div>
                          <h4 className="font-bold text-white text-sm mb-1">{cat.level}</h4>
                          <p className="text-[11px] text-slate-400 font-medium">{cat.sub}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ÉTAPE 2: Fonction (IFSE 1) */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-base font-bold text-white">Fonctions disponibles (Cat. {selectedCategory})</h3>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                      {functionsForCategory.length} fonctions
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-700">
                    {functionsForCategory.map((item) => {
                      const isSelected = selectedFunctionIndex === item.globalIdx
                      return (
                        <button
                          key={item.globalIdx}
                          onClick={() => handleFunctionSelect(item.globalIdx)}
                          className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between gap-4 ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                              : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-cyan-400 bg-cyan-400 text-slate-950' : 'border-slate-700'}`}>
                              {isSelected && <span className="text-[10px] font-black">✓</span>}
                            </div>
                            <span className="text-sm font-extrabold text-white">{item.functionName}</span>
                          </div>
                          <span className="text-base font-black text-cyan-400 font-mono">{item.amount}€/mois</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ÉTAPE 3: Direction & Métier (IFSE 2) */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Directions */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 font-mono">1. Choisissez votre Direction</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                      {allDirections.map(dir => {
                        const isSelected = selectedDirection === dir
                        const visual = getDirectionVisual(dir)
                        const DirIcon = visual.icon

                        return (
                          <button
                            key={dir}
                            onClick={() => handleDirectionSelect(dir)}
                            className={`p-3 rounded-2xl border transition-all text-left flex items-center gap-2.5 ${
                              isSelected
                                ? 'border-teal-400 bg-teal-950/50 shadow-[0_0_15px_rgba(20,184,166,0.3)]'
                                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                            }`}
                          >
                            <div className={`p-2 rounded-xl border ${visual.colorClass} shrink-0`}>
                              <DirIcon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-white text-xs block truncate">{dir}</span>
                              <span className="text-[10px] text-slate-400 truncate block">{getDirectionFullName(dir)}</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Services */}
                  {selectedDirection && availableServices.length > 0 && (
                    <div ref={serviceSectionRef} className="pt-2 border-t border-slate-800">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 font-mono">2. Filtrer par Service (Optionnel)</h4>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleServiceSelect('')}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${selectedService === '' ? 'border-teal-400 bg-teal-500/20 text-teal-300' : 'border-slate-800 bg-slate-950 text-slate-400'}`}
                        >
                          Tous services
                        </button>
                        {availableServices.map(service => (
                          <button
                            key={service}
                            onClick={() => handleServiceSelect(service)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${selectedService === service ? 'border-teal-400 bg-teal-500/20 text-teal-300' : 'border-slate-800 bg-slate-950 text-slate-400'}`}
                          >
                            {service}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Jobs */}
                  {selectedDirection && (
                    <div ref={jobSectionRef} className="pt-2 border-t border-slate-800">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 font-mono">3. Sélectionnez votre Métier</h4>
                      <div className="max-h-48 overflow-y-auto pr-1 space-y-2">
                        {availableJobs.map(job => {
                          const isSelected = selectedJob === job
                          return (
                            <button
                              key={job}
                              onClick={() => handleJobSelect(job)}
                              className={`w-full p-3 rounded-2xl border text-left flex justify-between items-center text-xs transition-all ${
                                isSelected
                                  ? 'border-teal-400 bg-teal-950/40 text-white font-bold shadow-[0_0_15px_rgba(20,184,166,0.2)]'
                                  : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <span>{job}</span>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Available Primes List */}
                  {selectedJob && (
                    <div ref={primesSectionRef} className="pt-4 border-t border-slate-800">
                      <h4 className="text-xs font-black uppercase tracking-wider text-teal-400 mb-3 font-mono">Primes de sujétion applicables (IFSE 2)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availablePrimesForSelectedJob.map(prime => {
                          const isSelected = selectedIFSE2.has(prime.realIdx)
                          return (
                            <button
                              key={`${prime.motif}-${prime.realIdx}`}
                              onClick={() => handleToggleIFSE2(prime.realIdx)}
                              className={`p-3.5 rounded-2xl border text-left transition-all ${
                                isSelected
                                  ? 'border-teal-400 bg-teal-950/40 shadow-[0_0_15px_rgba(20,184,166,0.2)]'
                                  : 'border-slate-800 bg-slate-950 opacity-60 hover:opacity-100'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-white text-xs">{prime.motif}</span>
                                <span className="text-emerald-400 font-mono font-black text-xs">+{prime.amount}€</span>
                              </div>
                              <span className="text-[10px] text-slate-400 block">{prime.service}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ÉTAPE 4: Week-ends (IFSE 3) */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Samedis */}
                    <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
                      <label className="text-xs font-bold text-slate-300 block mb-3 uppercase tracking-wider font-mono">
                        Samedis travaillés / mois
                      </label>
                      <div className="flex gap-2 mb-4">
                        {[0, 1, 2, 3, 4, 5].map(n => (
                          <button
                            key={n}
                            onClick={() => setWeekendSaturdays(n)}
                            className={`flex-1 py-2.5 rounded-xl font-bold font-mono text-xs border transition-all ${
                              weekendSaturdays === n
                                ? 'bg-purple-500 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                      <label className="text-[11px] text-slate-400 block mb-1">Forfait par samedi :</label>
                      <select
                        value={weekendRateSat}
                        onChange={e => setWeekendRateSat(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-400 font-mono"
                      >
                        {[40, 60, 80].map(r => (
                          <option key={r} value={r}>{r} € / samedi</option>
                        ))}
                      </select>
                    </div>

                    {/* Dimanches */}
                    <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
                      <label className="text-xs font-bold text-slate-300 block mb-3 uppercase tracking-wider font-mono">
                        Dimanches travaillés / mois
                      </label>
                      <div className="flex gap-2 mb-4">
                        {[0, 1, 2, 3, 4, 5].map(n => (
                          <button
                            key={n}
                            onClick={() => setWeekendSundays(n)}
                            className={`flex-1 py-2.5 rounded-xl font-bold font-mono text-xs border transition-all ${
                              weekendSundays === n
                                ? 'bg-purple-500 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                      <label className="text-[11px] text-slate-400 block mb-1">Forfait par dimanche :</label>
                      <select
                        value={weekendRateSun}
                        onChange={e => setWeekendRateSun(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-400 font-mono"
                      >
                        {[40, 60, 80].map(r => (
                          <option key={r} value={r}>{r} € / dimanche</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {ifse3Total > 0 && (
                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-center">
                      <span className="text-purple-300 font-bold text-xs font-mono">
                        Total IFSE 3 (Week-ends) : <b className="text-purple-200 text-base">{ifse3Total}€/mois</b>
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* ÉTAPE 5: Primes spéciales */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="space-y-2.5">
                    {specialPrimesData.map((prime, idx) => {
                      const isSelected = selectedSpecialPrimes.has(idx)
                      return (
                        <button
                          key={idx}
                          onClick={() => handleToggleSpecialPrime(idx)}
                          className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between ${
                            isSelected
                              ? 'border-amber-400 bg-amber-950/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                              : 'border-slate-800 bg-slate-950 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isSelected ? 'bg-amber-400 border-amber-400 text-slate-950' : 'border-slate-700'}`}>
                              {isSelected && <span className="text-[10px] font-black">✓</span>}
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-xs">{prime.name}</h4>
                              <p className="text-[11px] text-slate-400">{prime.desc}</p>
                            </div>
                          </div>
                          <span className="text-amber-400 font-mono font-black text-sm">+{prime.amount}€</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ÉTAPE 6: Résultat Dashboard */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  
                  {/* Hero Result Banner */}
                  <BorderGlow glowColor="from-cyan-500 via-emerald-400 to-teal-500">
                    <div className="p-8 text-center bg-slate-950/90 rounded-3xl">
                      <p className="text-cyan-400 text-xs font-bold tracking-widest uppercase mb-1 font-mono">
                        <ShinyText text="TOTAL RIFSEEP ESTIMÉ" color="#22d3ee" shineColor="#ffffff" speed={2} />
                      </p>
                      <p className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight my-2">
                        {totalMonthly.toLocaleString('fr-FR')}€<span className="text-lg text-slate-400 font-normal">/mois</span>
                      </p>
                      <p className="text-slate-300 text-xs sm:text-sm font-medium">
                        Soit une enveloppe annuelle d'environ <strong className="text-cyan-300 font-bold">{(totalMonthly * 12).toLocaleString('fr-FR')}€</strong>
                      </p>
                    </div>
                  </BorderGlow>

                  {/* Detailed breakdown list */}
                  <div className="space-y-3">
                    {ifse1Amount > 0 && (
                      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex justify-between items-center">
                        <div>
                          <span className="text-xs font-bold text-blue-300 uppercase tracking-wider font-mono block">IFSE 1 - Socle Fixe</span>
                          <span className="text-sm font-bold text-white">{ifse1Data[selectedFunctionIndex!].function}</span>
                        </div>
                        <span className="text-xl font-black text-blue-400 font-mono">+{ifse1Amount}€</span>
                      </div>
                    )}

                    {ifse2Amount > 0 && (
                      <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex justify-between items-center">
                        <div>
                          <span className="text-xs font-bold text-teal-300 uppercase tracking-wider font-mono block">IFSE 2 - Primes de Sujétion</span>
                          <span className="text-xs text-slate-300">{selectedIFSE2.size} prime(s) active(s) sur {selectedJob}</span>
                        </div>
                        <span className="text-xl font-black text-teal-400 font-mono">+{ifse2Amount}€</span>
                      </div>
                    )}

                    {ifse3Total > 0 && (
                      <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex justify-between items-center">
                        <div>
                          <span className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono block">IFSE 3 - Week-ends</span>
                          <span className="text-xs text-slate-300">{weekendSaturdays} samedi(s) + {weekendSundays} dimanche(s)</span>
                        </div>
                        <span className="text-xl font-black text-purple-400 font-mono">+{ifse3Total}€</span>
                      </div>
                    )}

                    {specialPrimesAmount > 0 && (
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex justify-between items-center">
                        <div>
                          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono block">Primes Spéciales</span>
                          <span className="text-xs text-slate-300">{selectedSpecialPrimes.size} prime(s) sélectionnée(s)</span>
                        </div>
                        <span className="text-xl font-black text-amber-400 font-mono">+{specialPrimesAmount}€</span>
                      </div>
                    )}
                  </div>

                  {/* Warning */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-amber-300 text-xs">
                    <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <b>Remarque :</b> Si votre montant réel sur fiche de paie est supérieur, vous bénéficiez sans doute d'une garantie d'avantage acquis (IFSE 4 / négociation historique).
                    </div>
                  </div>

                  <button
                    onClick={resetCalculator}
                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" /> Recommencer un calcul
                  </button>

                </div>
              )}

            </div>

            {/* Navigation Bar */}
            {currentStep < 6 && (
              <div ref={navigationSectionRef} className="flex items-center justify-between gap-4 mt-6">
                <button
                  onClick={goPrev}
                  disabled={!canGoPrev()}
                  className={`px-6 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                    canGoPrev()
                      ? 'bg-slate-800 hover:bg-slate-700 text-white shadow-sm'
                      : 'opacity-40 cursor-not-allowed bg-slate-900 text-slate-500 border border-slate-800'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </button>

                <button
                  onClick={goNext}
                  disabled={!canGoNext()}
                  className={`px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                    canGoNext()
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95'
                      : 'opacity-40 cursor-not-allowed bg-slate-900 text-slate-500 border border-slate-800'
                  }`}
                >
                  {currentStep === 5 ? 'Résultat' : 'Suivant'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  )
}
