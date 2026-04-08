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
  Building
} from 'lucide-react'
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

// Définition des étapes du wizard
const STEPS = [
  { 
    id: 1, 
    title: 'Catégorie', 
    subtitle: 'Votre grille indiciaire',
    icon: Briefcase,
    color: 'blue',
    description: 'La catégorie détermine votre grille de rémunération. Elle correspond à votre niveau de qualification.',
    tip: '💡 Catégorie A = Bac+3 minimum | B = Bac à Bac+2 | C = Sans condition de diplôme'
  },
  { 
    id: 2, 
    title: 'Fonction', 
    subtitle: 'IFSE 1 - Prime de base',
    icon: Users,
    color: 'cyan',
    description: 'L\'IFSE 1 est votre prime principale. Elle dépend de votre fonction et de vos responsabilités.',
    tip: '💡 Cette prime est versée chaque mois automatiquement selon votre poste'
  },
  { 
    id: 3, 
    title: 'Direction & Métier', 
    subtitle: 'IFSE 2 - Primes complémentaires',
    icon: Building2,
    color: 'teal',
    description: 'Les primes IFSE 2 sont liées à votre direction, service et métier. Elles récompensent les sujétions particulières.',
    tip: '💡 Certaines primes sont cumulables selon votre situation'
  },
  { 
    id: 4, 
    title: 'Week-ends', 
    subtitle: 'IFSE 3 - Travail week-end',
    icon: Calendar,
    color: 'purple',
    description: 'Si vous travaillez les samedis et/ou dimanches, vous percevez une indemnité supplémentaire.',
    tip: '💡 40€ par samedi et 40€ par dimanche travaillé en moyenne'
  },
  { 
    id: 5, 
    title: 'Primes spéciales', 
    subtitle: 'Primes particulières',
    icon: Award,
    color: 'orange',
    description: 'Certaines situations donnent droit à des primes additionnelles (intérim, apprentissage...).',
    tip: '💡 Ces primes sont versées uniquement si vous êtes dans une situation particulière'
  },
  { 
    id: 6, 
    title: 'Résultat', 
    subtitle: 'Votre total mensuel',
    icon: Calculator,
    color: 'green',
    description: 'Récapitulatif de toutes vos primes et indemnités mensuelles.',
    tip: '🎉 N\'oubliez pas que ce calcul est indicatif'
  }
]

export default function CalculateurPrimesV2({ onClose }: CalculateurPrimesProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [showTip, setShowTip] = useState(true)
  
  // États des sélections
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

  // Calculs
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
    { name: 'Prime technicité (Formateur)', amount: 75, desc: 'Expertise technique reconnue' },
    { name: 'Prime Maître apprentissage', amount: 98.46, desc: 'Encadrement d\'un apprenti' },
    { name: 'Prime Référent financier suppléant', amount: 40, desc: 'Suppléance référent financier' },
    { name: 'Prime ODEC Partiel', amount: 40, desc: 'Officier d\'état civil partiel' },
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

  // Progression
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
    if (currentStep === 3) return true // Optionnel
    if (currentStep === 4) return true // Optionnel
    if (currentStep === 5) return true // Optionnel
    return false
  }

  const canGoPrev = () => currentStep > 1

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>, delay = 50) => {
    window.setTimeout(() => {
      const target = ref.current
      if (!target) return

      // Walk up the DOM to find the actual scrolling container.
      // Skip mainScrollRef (flex-1 unconstrained — grows freely, never scrolls).
      let container: HTMLElement | null = target.parentElement
      while (container && container !== document.body) {
        if (container !== mainScrollRef.current) {
          const overflow = window.getComputedStyle(container).overflowY
          if (overflow === 'auto' || overflow === 'scroll') break
        }
        container = container.parentElement
      }

      if (!container || container === document.body) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }

      // Offset for the sticky header "Retour aux calculateurs / Calculateurs CFDT"
      const stickyHeader = container.querySelector('[class*="sticky"]') as HTMLElement | null
      const headerHeight = stickyHeader ? stickyHeader.offsetHeight : 68

      const containerRect = container.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      const scrollTop = container.scrollTop + (targetRect.top - containerRect.top) - headerHeight - 8

      container.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' })
    }, delay)
  }

  const scrollToNavigation = () => {
    window.setTimeout(() => {
      navigationSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 160)
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    setSelectedFunctionIndex(null)
  }

  const handleFunctionSelect = (index: number) => {
    setSelectedFunctionIndex(index)
    scrollToNavigation()
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

  // Handlers
  const handleDirectionSelect = (dir: string) => {
    setSelectedDirection(dir)
    setSelectedIFSE2(new Set())
    setSelectedJob('')
    setSelectedService('')
    setLastToggledPrimeIdx(null)
  }

  useEffect(() => {
    if (selectedDirection) {
      // 350ms: wait for slide-in-from-bottom duration-300 animation to finish
      scrollToSection(serviceSectionRef, 350)
    }
  }, [selectedDirection])

  const handleServiceSelect = (service: string) => {
    setSelectedService(service)
    setSelectedIFSE2(new Set())
    setSelectedJob('')
    setLastToggledPrimeIdx(null)
    scrollToSection(jobSectionRef)
  }

  const handleJobSelect = (job: string) => {
    setSelectedJob(job)
    setLastToggledPrimeIdx(null)
    if (!job) return
    
    const directionPrimes = getIFSE2ByDirection(selectedDirection)
    const jobPrimes = directionPrimes.filter(p => 
      p.jobs?.includes(job) && 
      (!selectedService || p.service === selectedService || p.service === 'Tous services')
    )
    
    const newSelectedIFSE2 = new Set<number>()
    jobPrimes.forEach(jobPrime => {
      const primeIdx = directionPrimes.findIndex(p => p === jobPrime)
      if (primeIdx >= 0) {
        newSelectedIFSE2.add(primeIdx)
      }
    })
    setSelectedIFSE2(newSelectedIFSE2)
    scrollToSection(primesSectionRef, 450)
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

  // Couleurs par étape
  const getStepColor = (color: string) => {
    const colors: Record<string, { bg: string, border: string, text: string, ring: string }> = {
      blue: { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400/50', text: 'text-blue-300', ring: 'ring-blue-400/50' },
      cyan: { bg: 'from-cyan-500 to-teal-500', border: 'border-cyan-400/50', text: 'text-cyan-300', ring: 'ring-cyan-400/50' },
      teal: { bg: 'from-teal-500 to-green-500', border: 'border-teal-400/50', text: 'text-teal-300', ring: 'ring-teal-400/50' },
      purple: { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400/50', text: 'text-purple-300', ring: 'ring-purple-400/50' },
      orange: { bg: 'from-orange-500 to-amber-500', border: 'border-orange-400/50', text: 'text-orange-300', ring: 'ring-orange-400/50' },
      green: { bg: 'from-green-500 to-emerald-500', border: 'border-green-400/50', text: 'text-green-300', ring: 'ring-green-400/50' },
    }
    return colors[color] || colors.blue
  }

  const stepColor = getStepColor(currentStepData.color)

  const getDirectionVisual = (dir: string) => {
    const map: Record<string, {
      icon: typeof Building2
      active: string
      badge: string
      hover: string
    }> = {
      DAF: { icon: Wallet, active: 'bg-lime-500/20 border-lime-400 shadow-lg shadow-lime-500/20', badge: 'bg-lime-500/20 text-lime-200 border-lime-400/40', hover: 'hover:border-lime-400/50' },
      DAJ: { icon: Scale, active: 'bg-stone-500/20 border-stone-300 shadow-lg shadow-stone-500/20', badge: 'bg-stone-500/20 text-stone-200 border-stone-300/40', hover: 'hover:border-stone-300/50' },
      DCCS: { icon: HandHelping, active: 'bg-fuchsia-500/20 border-fuchsia-400 shadow-lg shadow-fuchsia-500/20', badge: 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-400/40', hover: 'hover:border-fuchsia-400/50' },
      DCJ: { icon: BookOpen, active: 'bg-pink-500/20 border-pink-400 shadow-lg shadow-pink-500/20', badge: 'bg-pink-500/20 text-pink-200 border-pink-400/40', hover: 'hover:border-pink-400/50' },
      DE: { icon: Trees, active: 'bg-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-500/20', badge: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40', hover: 'hover:border-emerald-400/50' },
      DG: { icon: Crown, active: 'bg-yellow-500/20 border-yellow-400 shadow-lg shadow-yellow-500/20', badge: 'bg-yellow-500/20 text-yellow-200 border-yellow-400/40', hover: 'hover:border-yellow-400/50' },
      DH: { icon: Home, active: 'bg-orange-500/20 border-orange-400 shadow-lg shadow-orange-500/20', badge: 'bg-orange-500/20 text-orange-200 border-orange-400/40', hover: 'hover:border-orange-400/50' },
      DDU: { icon: Map, active: 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/20', badge: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40', hover: 'hover:border-cyan-400/50' },
      DESS: { icon: Shield, active: 'bg-violet-500/20 border-violet-400 shadow-lg shadow-violet-500/20', badge: 'bg-violet-500/20 text-violet-200 border-violet-400/40', hover: 'hover:border-violet-400/50' },
      DME: { icon: Baby, active: 'bg-green-500/20 border-green-400 shadow-lg shadow-green-500/20', badge: 'bg-green-500/20 text-green-200 border-green-400/40', hover: 'hover:border-green-400/50' },
      DRH: { icon: Users, active: 'bg-sky-500/20 border-sky-400 shadow-lg shadow-sky-500/20', badge: 'bg-sky-500/20 text-sky-200 border-sky-400/40', hover: 'hover:border-sky-400/50' },
      DMS: { icon: HeartPulse, active: 'bg-rose-500/20 border-rose-400 shadow-lg shadow-rose-500/20', badge: 'bg-rose-500/20 text-rose-200 border-rose-400/40', hover: 'hover:border-rose-400/50' },
      DMSP: { icon: HeartPulse, active: 'bg-red-500/20 border-red-400 shadow-lg shadow-red-500/20', badge: 'bg-red-500/20 text-red-200 border-red-400/40', hover: 'hover:border-red-400/50' },
      DMRU: { icon: Landmark, active: 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/20', badge: 'bg-amber-500/20 text-amber-200 border-amber-400/40', hover: 'hover:border-amber-400/50' },
      DPE: { icon: Baby, active: 'bg-teal-500/20 border-teal-400 shadow-lg shadow-teal-500/20', badge: 'bg-teal-500/20 text-teal-200 border-teal-400/40', hover: 'hover:border-teal-400/50' },
      DPO: { icon: FolderKanban, active: 'bg-indigo-500/20 border-indigo-400 shadow-lg shadow-indigo-500/20', badge: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/40', hover: 'hover:border-indigo-400/50' },
      DPB: { icon: Building, active: 'bg-blue-500/20 border-blue-400 shadow-lg shadow-blue-500/20', badge: 'bg-blue-500/20 text-blue-200 border-blue-400/40', hover: 'hover:border-blue-400/50' },
      DRU: { icon: Map, active: 'bg-slate-500/20 border-slate-300 shadow-lg shadow-slate-500/20', badge: 'bg-slate-500/20 text-slate-200 border-slate-300/40', hover: 'hover:border-slate-300/50' },
      DSA: { icon: HandHelping, active: 'bg-emerald-500/20 border-emerald-300 shadow-lg shadow-emerald-500/20', badge: 'bg-emerald-500/20 text-emerald-100 border-emerald-300/40', hover: 'hover:border-emerald-300/50' },
      DSI: { icon: Cpu, active: 'bg-blue-500/20 border-blue-300 shadow-lg shadow-blue-500/20', badge: 'bg-blue-500/20 text-blue-100 border-blue-300/40', hover: 'hover:border-blue-300/50' },
      'Toutes dir°': { icon: Briefcase, active: 'bg-neutral-500/20 border-neutral-300 shadow-lg shadow-neutral-500/20', badge: 'bg-neutral-500/20 text-neutral-200 border-neutral-300/40', hover: 'hover:border-neutral-300/50' },
    }
    return map[dir] || {
      icon: Wrench,
      active: 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/20',
      badge: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40',
      hover: 'hover:border-cyan-400/50'
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(216,180,254,0.22),_transparent_28%),linear-gradient(135deg,_rgb(58,28,113)_0%,_rgb(91,33,182)_48%,_rgb(76,29,149)_100%)] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-950/90 via-purple-900/90 to-fuchsia-950/90 backdrop-blur-md py-4 border-b border-purple-200/15 shadow-xl glass-banner">
        <div className="px-4 sm:px-6 flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className={`p-3 bg-gradient-to-br ${stepColor.bg} rounded-xl shadow-lg`}>
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-white">Calculateur de Primes</h1>
              <p className="text-purple-100/75 text-xs sm:text-sm">Estimez vos primes RIFSEEP en quelques clics</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all border border-red-500/50 glass-pill"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Retour</span>
            </button>
          )}
        </div>
      </div>

      {/* Barre de progression */}
      <div className="bg-purple-950/30 border-b border-purple-200/10 py-3 px-4 glass-banner">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
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
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                        : status === 'active'
                          ? `bg-gradient-to-br ${getStepColor(step.color).bg} text-white shadow-lg animate-pulse`
                            : 'bg-purple-950/50 text-purple-100/55'
                    }`}>
                      {status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </div>
                    <span className={`text-[10px] sm:text-xs mt-1 font-medium ${
                      status === 'active' ? getStepColor(step.color).text : 'text-purple-100/45'
                    }`}>
                      {step.title}
                    </span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div className={`w-4 sm:w-8 h-0.5 mx-1 sm:mx-2 transition-all duration-500 ${
                      getStepStatus(STEPS[idx + 1].id) !== 'pending' ? 'bg-green-500' : 'bg-purple-950/60'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Récapitulatif flottant */}
      {totalMonthly > 0 && currentStep < 6 && (
        <div className="sticky top-24 sm:top-28 z-30 px-4 sm:px-6 pt-3 pointer-events-none animate-in fade-in slide-in-from-top duration-500">
          <div className="max-w-4xl mx-auto flex justify-center sm:justify-end">
            <div className="bg-gradient-to-br from-green-900/95 to-emerald-900/95 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-green-500/30 glass-card">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-xs text-green-300/70">Total estimé</p>
                  <p className="text-xl font-bold text-green-300">{totalMonthly.toLocaleString('fr-FR')}€<span className="text-sm font-normal">/mois</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div ref={mainScrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          
          {/* En-tête de l'étape */}
          <div className={`mb-6 p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-violet-950/80 via-purple-950/80 to-fuchsia-950/80 border ${stepColor.border} shadow-xl glass-card`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stepColor.bg} shadow-lg`}>
                <StepIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-purple-100/55 text-sm">Étape {currentStep}/6</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stepColor.text} bg-purple-950/45 border border-purple-200/10`}>
                    {currentStepData.subtitle}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{currentStepData.title}</h2>
                <p className="text-purple-100/75 text-sm">{currentStepData.description}</p>
              </div>
            </div>
            
            {/* Tip */}
            {showTip && (
              <div className="mt-4 p-3 bg-purple-950/35 rounded-lg border border-purple-200/15 flex items-start gap-3 glass-card">
                <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                {currentStepData.tip === "💡 Ces primes sont versées uniquement si vous êtes dans une situation particulière" ? (
                  <p className="text-base font-bold text-yellow-400">{currentStepData.tip}</p>
                ) : (
                  <p className="text-xs sm:text-sm text-purple-100/85">{currentStepData.tip}</p>
                )}
                <button onClick={() => setShowTip(false)} className="text-purple-100/45 hover:text-purple-100 text-xs">✕</button>
              </div>
            )}
          </div>

          {/* Contenu de l'étape */}
          <div className={`p-4 sm:p-6 rounded-2xl bg-purple-950/30 border border-purple-200/15 shadow-lg ring-2 ${stepColor.ring} transition-all duration-500 glass-card`}>
            
            {/* ÉTAPE 1: Catégorie */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <label className="text-sm text-purple-100/75 block font-medium">Sélectionnez votre catégorie d'emploi :</label>
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-950/45 border border-purple-200/15 text-purple-100/80">
                    3 profils
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { key: 'A', level: 'Cadres', accent: 'from-blue-600 to-cyan-600', activeBorder: 'border-blue-400', hoverBorder: 'hover:border-blue-400/70', glow: 'shadow-blue-600/40', lightBg: 'bg-blue-950/60' },
                    { key: 'B', level: 'Intermédiaires', accent: 'from-cyan-600 to-teal-600', activeBorder: 'border-cyan-400', hoverBorder: 'hover:border-cyan-400/70', glow: 'shadow-cyan-600/40', lightBg: 'bg-cyan-950/60' },
                    { key: 'C', level: 'Exécution', accent: 'from-teal-600 to-green-600', activeBorder: 'border-teal-400', hoverBorder: 'hover:border-teal-400/70', glow: 'shadow-teal-600/40', lightBg: 'bg-teal-950/60' },
                  ].map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => handleCategorySelect(cat.key)}
                      className={`p-5 sm:p-6 rounded-xl border-2 transition-all duration-300 ${
                        selectedCategory === cat.key
                          ? `bg-gradient-to-br ${cat.accent} ${cat.activeBorder} shadow-xl ${cat.glow} scale-105`
                          : `${cat.lightBg} border-slate-600 ${cat.hoverBorder} hover:shadow-lg`
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="text-left flex-1">
                          <div className="text-2xl sm:text-3xl font-black text-white">Cat. {cat.key}</div>
                          <div className="text-base text-white/95 font-bold">{cat.level}</div>
                        </div>
                        {selectedCategory === cat.key && (
                          <CheckCircle2 className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {selectedCategory && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center justify-between gap-3 glass-card animate-in fade-in duration-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-300">Catégorie {selectedCategory} sélectionnée</span>
                    </div>
                    <span className="text-xs text-green-200/80">Passez à l'étape Fonction</span>
                  </div>
                )}
              </div>
            )}

            {/* ÉTAPE 2: Fonction */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm text-purple-100/75 block font-medium">Choisissez votre fonction :</label>
                  <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-200">
                    Cat. {selectedCategory}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-purple-100/65">{functionsForCategory.length} fonction(s)</span>
                  {selectedFunctionIndex !== null && (
                    <span className="text-cyan-300">Sélection active</span>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto pr-1 space-y-2 teal-scrollbar">
                  {functionsForCategory.map((item, idx) => (
                    <button
                      key={item.globalIdx}
                      onClick={() => handleFunctionSelect(item.globalIdx)}
                      style={{ animationDelay: `${Math.min(260, idx * 20)}ms` }}
                      className={`w-full p-3 rounded-lg text-left transition-all border glass-card animate-in fade-in duration-300 ${
                        selectedFunctionIndex === item.globalIdx
                          ? 'bg-cyan-500/20 border-cyan-400/60 shadow-lg shadow-cyan-500/20'
                          : 'bg-slate-700/30 border-slate-600/20 hover:bg-slate-700/50 hover:border-cyan-400/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedFunctionIndex === item.globalIdx ? 'bg-cyan-500 border-cyan-400' : 'border-slate-500'
                          }`}>
                            {selectedFunctionIndex === item.globalIdx && <span className="text-white text-xs">✓</span>}
                          </div>
                          <p className="text-sm font-medium text-white">{item.functionName}</p>
                        </div>
                        <span className="text-cyan-300 font-bold">{item.amount}€</span>
                      </div>
                    </button>
                  ))}

                  {functionsForCategory.length === 0 && (
                    <div className="p-4 bg-slate-700/30 border border-slate-600/20 rounded-lg text-center">
                      <p className="text-slate-300 text-sm">Aucune fonction disponible pour cette catégorie.</p>
                    </div>
                  )}
                </div>
                
                {selectedFunctionIndex !== null && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border border-cyan-500/30 rounded-xl glass-card animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Votre IFSE 1</p>
                        <p className="text-lg font-semibold text-white">{ifse1Data[selectedFunctionIndex].function}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-cyan-300">{ifse1Amount}€</p>
                        <p className="text-xs text-slate-400">par mois</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ÉTAPE 3: Direction & Métier */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                {/* Direction */}
                <div>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="w-7 h-7 rounded-full bg-teal-500/30 border border-teal-400/50 flex items-center justify-center text-teal-200 font-bold text-sm">1</span>
                    <h3 className="text-base sm:text-lg font-bold text-white">Votre direction</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    {allDirections.map(dir => {
                      const isActive = selectedDirection === dir
                      const visual = getDirectionVisual(dir)
                      const DirectionIcon = visual.icon
                      const directionJobsCount = getIFSE2ByDirection(dir)
                        .flatMap(p => p.jobs || [])
                        .filter((job, idx, arr) => arr.indexOf(job) === idx && job !== '').length

                      return (
                        <button
                          key={dir}
                          onClick={() => handleDirectionSelect(dir)}
                          style={{ animationDelay: `${Math.min(420, allDirections.indexOf(dir) * 35)}ms` }}
                          className={`text-left p-4 rounded-xl border-2 transition-all duration-300 glass-card ${
                            isActive
                              ? `${visual.active} scale-[1.02]`
                              : `bg-slate-700/30 border-slate-600/30 ${visual.hover} hover:bg-slate-700/50`
                          } animate-in fade-in slide-in-from-bottom duration-500`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${visual.badge}`}>
                                <DirectionIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-white font-semibold">{getDirectionFullName(dir)}</p>
                                <p className="text-xs text-slate-400 mt-1">Code: {dir}</p>
                              </div>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full bg-slate-700/70 text-slate-200 border border-slate-500/40">
                              {directionJobsCount} métiers
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Service */}
                {selectedDirection && (
                  <div ref={serviceSectionRef} className="animate-in slide-in-from-bottom duration-300">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <span className="w-7 h-7 rounded-full bg-cyan-500/30 border border-cyan-400/50 flex items-center justify-center text-cyan-200 font-bold text-sm">2</span>
                      <h3 className="text-base sm:text-lg font-bold text-white">Votre service <span className="text-sm font-normal text-slate-400">(optionnel)</span></h3>
                    </div>
                    <div className="flex flex-wrap justify-center gap-5 max-w-2xl mx-auto py-2">
                      <button
                        onClick={() => handleServiceSelect('')}
                        className={`bg-white/90 rounded-2xl shadow-2xl border border-blue-200 p-5 max-w-xs w-full transition-transform hover:scale-105 hover:shadow-blue-400/50 flex flex-col items-center text-center glass-card ${
                          selectedService === ''
                            ? 'ring-2 ring-teal-400 border-teal-400 scale-105'
                            : 'hover:ring-2 hover:ring-blue-300'
                        }`}
                      >
                        <p className="text-base font-bold text-blue-700">Tous les services</p>
                        <p className="text-xs text-gray-500">Affiche toutes les primes de la direction</p>
                      </button>

                      {availableServices.map(service => (
                        <button
                          key={service}
                          onClick={() => handleServiceSelect(service)}
                          style={{ animationDelay: `${Math.min(260, availableServices.indexOf(service) * 30)}ms` }}
                          className={`bg-white/90 rounded-2xl shadow-2xl border border-blue-200 p-5 max-w-xs w-full transition-transform hover:scale-105 hover:shadow-blue-400/50 flex flex-col items-center text-center glass-card animate-in fade-in duration-300 ${
                            selectedService === service
                              ? 'ring-2 ring-teal-400 border-teal-400 scale-105'
                              : 'hover:ring-2 hover:ring-blue-300'
                          }`}
                        >
                          <p className="text-base font-bold text-blue-700">{service}</p>
                          <p className="text-xs text-gray-500">Service ciblé</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Métier */}
                {selectedDirection && (
                  <div ref={jobSectionRef} className="animate-in slide-in-from-bottom duration-300">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <span className="w-7 h-7 rounded-full bg-emerald-500/30 border border-emerald-400/50 flex items-center justify-center text-emerald-200 font-bold text-sm">3</span>
                      <h3 className="text-base sm:text-lg font-bold text-white">Votre métier</h3>
                    </div>
                    <p className="text-sm sm:text-base text-amber-300 mb-3 font-semibold text-center">Si votre métier n'apparaît pas, aucune IFSE2 ne s'applique à votre profil.</p>

                    <div className="flex items-center justify-between mb-2 max-w-2xl mx-auto">
                      <p className="text-sm font-semibold text-emerald-300">{availableJobs.length} métier(s) disponible(s)</p>
                      {selectedJob && (
                        <p className="text-sm font-medium text-teal-300">Sélection: {selectedJob}</p>
                      )}
                    </div>

                    {availableJobs.length > 6 && (
                      <div className="flex justify-center mb-2">
                        <button
                          onClick={() => setCompactJobsView(v => !v)}
                          className="px-3 py-1.5 rounded-lg text-xs border border-slate-600/40 text-slate-300 bg-slate-700/40 hover:border-teal-400/50 transition-all"
                        >
                          {compactJobsView ? 'Vue detaillee' : 'Vue compacte'}
                        </button>
                      </div>
                    )}

                    <div className={`overflow-y-auto pr-1 teal-scrollbar max-w-2xl mx-auto ${compactJobsView ? 'max-h-64 space-y-1.5' : 'max-h-60 space-y-2'}`}>
                      {availableJobs.map((job, idx) => (
                        <button
                          key={job}
                          onClick={() => handleJobSelect(job)}
                          style={{ animationDelay: `${Math.min(320, idx * 22)}ms` }}
                          className={`w-full rounded-xl border-2 transition-all glass-card ${compactJobsView ? 'p-3' : 'p-3.5'} ${
                            selectedJob === job
                              ? 'bg-gradient-to-r from-teal-500/25 to-cyan-500/20 border-teal-300/80 shadow-lg shadow-teal-500/20'
                              : 'bg-slate-700/35 border-slate-500/30 hover:bg-slate-700/55 hover:border-teal-400/45'
                          } animate-in fade-in duration-300`}
                        >
                          <div className="flex flex-col items-center justify-center gap-1">
                            <p className={`${compactJobsView ? 'text-sm' : 'text-base'} text-white font-semibold text-center leading-snug`}>{job}</p>
                            {selectedJob === job && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-teal-200 bg-teal-500/20 border border-teal-300/50 rounded-full px-2 py-0.5">
                                <CheckCircle2 className="w-3 h-3" />
                                Sélectionné
                              </span>
                            )}
                          </div>
                        </button>
                      ))}

                      {availableJobs.length === 0 && (
                        <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/20 text-center">
                          <p className="text-sm text-slate-300">Aucun métier disponible pour cette direction/service.</p>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mt-2 italic">Si vous ne trouvez pas votre métier, contactez-nous.</p>
                  </div>
                )}

                {/* Primes associées */}
                {selectedJob && (
                  <div ref={primesSectionRef} className="animate-in slide-in-from-bottom duration-300">
                    <div className="mb-3 p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg glass-card max-w-2xl mx-auto text-center">
                      <p className="text-sm text-teal-300">
                        {getDirectionFullName(selectedDirection)}
                        {selectedService ? ` · ${selectedService}` : ' · Tous les services'}
                      </p>
                      <p className="text-xs text-slate-300 mt-1">
                        {selectedJob} · {selectedIFSE2.size} prime(s) activée(s)
                      </p>
                    </div>
                    <label className="text-sm text-slate-300 block font-semibold mb-3 text-center">Primes disponibles pour votre profil :</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                      {availablePrimesForSelectedJob.map((prime, idx) => (
                        <button
                          key={`${prime.motif}-${prime.realIdx}`}
                          onClick={() => handleToggleIFSE2(prime.realIdx)}
                          style={{ animationDelay: `${Math.min(260, idx * 24)}ms` }}
                          className={`bg-white/90 rounded-xl shadow-lg border border-blue-200 p-4 transition-transform hover:scale-105 hover:shadow-blue-400/50 flex flex-col items-center text-center glass-card animate-in fade-in duration-300 ${
                            selectedIFSE2.has(prime.realIdx)
                              ? 'ring-2 ring-teal-400 border-teal-400 scale-105'
                              : 'hover:ring-2 hover:ring-blue-300'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2 w-full">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${selectedIFSE2.has(prime.realIdx) ? 'bg-teal-500 border-teal-400 border-2' : 'bg-blue-100 border border-blue-200'}`}> 
                              {selectedIFSE2.has(prime.realIdx) && <span className="text-white text-base">✓</span>}
                            </div>
                            <p className="text-sm font-bold text-blue-700 leading-snug w-full break-words">{prime.motif}</p>
                            <p className="text-xs text-gray-500 w-full break-words">{prime.service}</p>
                            <span className="text-lg font-semibold text-green-600 mt-1 block">{prime.amount}€</span>
                            {lastToggledPrimeIdx === prime.realIdx && (
                              <span className={`text-[11px] ${lastToggleWasAdd ? 'text-emerald-500' : 'text-amber-500'} animate-pulse`}>
                                {lastToggleWasAdd ? 'Ajoutée' : 'Retirée'}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    {ifse2Amount > 0 && (
                      <div className="mt-3 p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg text-center glass-card max-w-2xl mx-auto">
                        <span className="text-teal-300">Total IFSE 2 : <strong>{ifse2Amount}€/mois</strong></span>
                      </div>
                    )}

                    {availablePrimesForSelectedJob.length === 0 && (
                      <div className="mt-3 p-3 bg-slate-700/30 border border-slate-600/20 rounded-lg text-center glass-card max-w-2xl mx-auto">
                        <p className="text-slate-300 text-sm">Aucune prime IFSE2 trouvée pour ce métier avec ce filtre de service.</p>
                      </div>
                    )}
                  </div>
                )}

                {!selectedDirection && (
                  <div className="p-4 bg-slate-700/30 rounded-lg text-center glass-card">
                    <p className="text-slate-400 text-sm">Sélectionnez votre direction pour voir les primes disponibles</p>
                    <p className="text-xs text-slate-500 mt-1">Cette étape est optionnelle, vous pouvez passer directement à la suivante</p>
                  </div>
                )}
              </div>
            )}

            {/* ÉTAPE 4: Week-ends */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400 block font-medium mb-2">Samedis travaillés / mois</label>
                    <div className="flex items-center gap-2 mb-2">
                      {[0, 1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          onClick={() => setWeekendSaturdays(n)}
                          className={`w-10 h-10 rounded-lg font-bold transition-all glass-pill ${
                            weekendSaturdays === n
                              ? 'bg-purple-500 text-white shadow-lg'
                              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <label className="text-xs text-slate-400 block mb-1">Forfait par samedi :</label>
                    <select
                      value={weekendRateSat}
                      onChange={e => setWeekendRateSat(Number(e.target.value))}
                      className="w-full px-2 py-2 rounded border border-purple-400 bg-slate-700 text-purple-200 text-sm glass-pill"
                    >
                      {[40, 60, 80].map(rate => (
                        <option key={rate} value={rate}>{rate} €</option>
                      ))}
                    </select>
                    {weekendSaturdays > 0 && (
                      <p className="text-purple-300 text-sm mt-2">{weekendSaturdays} × {weekendRateSat}€ = {weekendSaturdays * weekendRateSat}€</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block font-medium mb-2">Dimanches travaillés / mois</label>
                    <div className="flex items-center gap-2 mb-2">
                      {[0, 1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          onClick={() => setWeekendSundays(n)}
                          className={`w-10 h-10 rounded-lg font-bold transition-all glass-pill ${
                            weekendSundays === n
                              ? 'bg-purple-500 text-white shadow-lg'
                              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <label className="text-xs text-slate-400 block mb-1">Forfait par dimanche :</label>
                    <select
                      value={weekendRateSun}
                      onChange={e => setWeekendRateSun(Number(e.target.value))}
                      className="w-full px-2 py-2 rounded border border-purple-400 bg-slate-700 text-purple-200 text-sm glass-pill"
                    >
                      {[40, 60, 80].map(rate => (
                        <option key={rate} value={rate}>{rate} €</option>
                      ))}
                    </select>
                    {weekendSundays > 0 && (
                      <p className="text-purple-300 text-sm mt-2">{weekendSundays} × {weekendRateSun}€ = {weekendSundays * weekendRateSun}€</p>
                    )}
                  </div>
                </div>
                {ifse3Total > 0 && (
                  <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl text-center glass-card">
                    <p className="text-purple-300">Total IFSE 3 : <strong className="text-xl">{ifse3Total}€/mois</strong></p>
                  </div>
                )}
                {ifse3Total === 0 && (
                  <div className="p-4 bg-slate-700/30 rounded-lg text-center glass-card">
                    <p className="text-slate-400 text-sm">Vous ne travaillez pas les week-ends ? Pas de souci, passez à l'étape suivante.</p>
                  </div>
                )}
              </div>
            )}

            {/* ÉTAPE 5: Primes spéciales */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <p className="text-sm text-slate-400 mb-4">Cochez les primes particulières qui s'appliquent à votre situation :</p>
                <div className="space-y-3">
                  {specialPrimesData.map((prime, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleToggleSpecialPrime(idx)}
                      className={`w-full p-4 rounded-xl text-left transition-all border glass-card ${
                        selectedSpecialPrimes.has(idx)
                          ? 'bg-orange-500/20 border-orange-400/60 shadow-lg'
                          : 'bg-slate-700/30 border-slate-600/20 hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                            selectedSpecialPrimes.has(idx) ? 'bg-orange-500 border-orange-400' : 'border-slate-500'
                          }`}>
                            {selectedSpecialPrimes.has(idx) && <span className="text-white text-sm">✓</span>}
                          </div>
                          <div>
                            <p className="text-white font-medium">{prime.name}</p>
                            <p className="text-xs text-slate-400">{prime.desc}</p>
                          </div>
                        </div>
                        <span className="text-orange-300 font-bold text-lg">{prime.amount}€</span>
                      </div>
                    </button>
                  ))}
                </div>
                
                {specialPrimesAmount > 0 && (
                  <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl text-center glass-card">
                    <p className="text-orange-300">Total primes spéciales : <strong className="text-xl">{specialPrimesAmount}€/mois</strong></p>
                  </div>
                )}
              </div>
            )}

            {/* ÉTAPE 6: Résultat */}
            {currentStep === 6 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-center mb-6">
                  <Sparkles className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <h3 className="text-2xl font-bold text-white">Votre estimation</h3>
                  <p className="text-slate-400">Récapitulatif de vos primes mensuelles</p>
                  <p className="text-base font-bold text-yellow-400 text-center mt-2">
                    ⚠️ ATTENTION : si vous avez un montant réel supérieur, vous avez sans doute une IFSE 4 (avantage acquis / négociation)
                  </p>
                </div>

                <div className="space-y-3">
                  {ifse1Amount > 0 && (
                    <div className="flex justify-between items-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                      <div>
                        <p className="text-blue-300 font-medium">IFSE 1 - Prime de fonction</p>
                        <p className="text-xs text-slate-400">{selectedFunctionIndex !== null ? ifse1Data[selectedFunctionIndex].function : ''}</p>
                      </div>
                      <span className="text-2xl font-bold text-blue-300">{ifse1Amount}€</span>
                    </div>
                  )}
                  
                  {ifse2Amount > 0 && (
                    <div className="flex justify-between items-center p-4 bg-teal-500/10 rounded-xl border border-teal-500/30">
                      <div>
                        <p className="text-teal-300 font-medium">IFSE 2 - Primes de sujétion</p>
                        <p className="text-xs text-slate-400">{selectedIFSE2.size} prime(s) sélectionnée(s)</p>
                      </div>
                      <span className="text-2xl font-bold text-teal-300">{ifse2Amount}€</span>
                    </div>
                  )}
                  
                  {ifse3Total > 0 && (
                    <div className="flex justify-between items-center p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
                      <div>
                        <p className="text-purple-300 font-medium">IFSE 3 - Week-ends</p>
                        <p className="text-xs text-slate-400">{weekendSaturdays} sam. + {weekendSundays} dim.</p>
                      </div>
                      <span className="text-2xl font-bold text-purple-300">{ifse3Total}€</span>
                    </div>
                  )}
                  
                  {specialPrimesAmount > 0 && (
                    <div className="flex justify-between items-center p-4 bg-orange-500/10 rounded-xl border border-orange-500/30">
                      <div>
                        <p className="text-orange-300 font-medium">Primes particulières</p>
                        <p className="text-xs text-slate-400">{selectedSpecialPrimes.size} prime(s)</p>
                      </div>
                      <span className="text-2xl font-bold text-orange-300">{specialPrimesAmount}€</span>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border-2 border-green-400/50 shadow-xl">
                  <div className="text-center">
                    <p className="text-green-300/70 text-sm mb-1">TOTAL MENSUEL ESTIMÉ</p>
                    <p className="text-5xl font-bold text-green-300">{totalMonthly.toLocaleString('fr-FR')}€</p>
                    <p className="text-slate-400 text-sm mt-2">Soit environ <strong className="text-green-300">{(totalMonthly * 12).toLocaleString('fr-FR')}€</strong> par an</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={resetCalculator}
                    className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all"
                  >
                    Recommencer
                  </button>
                  {onClose && (
                    <button
                      onClick={onClose}
                      className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition-all"
                    >
                      Terminer
                    </button>
                  )}
                </div>

                <p className="text-base font-bold text-yellow-400 text-center mt-4">
                  ⚠️ Ce calcul est indicatif. Pour une estimation précise, contactez le service RH.
                </p>
              </div>
            )}
          </div>

          {/* Boutons de navigation */}
          {currentStep < 6 && (
            <div ref={navigationSectionRef} className="flex justify-between mt-6 gap-4">
              <button
                onClick={goPrev}
                disabled={!canGoPrev()}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  canGoPrev()
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Précédent
              </button>
              
              <button
                onClick={goNext}
                disabled={!canGoNext()}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  canGoNext()
                    ? `bg-gradient-to-r ${stepColor.bg} hover:opacity-90 text-white shadow-lg`
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                {currentStep === 5 ? 'Voir le résultat' : 'Suivant'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Skip pour les étapes optionnelles */}
          {(currentStep === 3 || currentStep === 4 || currentStep === 5) && (
            <div className="text-center mt-4">
              <button
                onClick={goNext}
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
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
