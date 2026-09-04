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
  Clock,
  User,
  Briefcase,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  RotateCcw
} from 'lucide-react'

interface Calculateur13emeProps {
  onClose?: () => void
}

type AgentType = 'indiciaire' | 'horaire' | ''
type IndiciaireProfile = 'permanent' | 'medecin' | 'assistante' | ''
type HoraireBase = 'indice' | 'taux' | ''
type HorairePeriode = 'juin' | 'novembre'

// Constantes
const HOURS_CAP = 910
const HOURS_MIN = 455
const SMIC_MENSUEL = 1867.06
const INDICE_POINT_VALUE = 4.92278
const IR_RATE = 0.03

const INDICIAIRE_SCHEDULE: Record<string, { month: string; part: number; note?: string }[]> = {
  permanent: [
    { month: 'Juin', part: 6, note: 'Versement principal (6/12)' },
    { month: 'Novembre', part: 5, note: 'Complément (5/12)' },
    { month: 'Décembre', part: 1, note: 'Solde de régularisation (1/12)' },
  ],
  medecin: [
    { month: 'Juin', part: 6, note: 'Versement principal (6/12)' },
    { month: 'Novembre', part: 6, note: 'Versement complémentaire (6/12)' },
  ],
  assistante: [
    { month: 'Juin', part: 6, note: 'Calendrier spécifique assistantes' },
    { month: 'Novembre', part: 6 },
  ],
}

// Définition des étapes du wizard
const STEPS_INDICIAIRE = [
  { id: 1, title: 'Mode de paie', icon: User, description: 'Statut et rémunération' },
  { id: 2, title: 'Profil RH', icon: Briefcase, description: 'Métier et calendrier' },
  { id: 3, title: 'Indices & NBI', icon: Calculator, description: 'Fiche de paie' },
  { id: 4, title: 'Quotité', icon: Clock, description: 'Temps de travail et mois' },
  { id: 5, title: 'Résultat', icon: Euro, description: 'Estimation globale' },
]

const STEPS_HORAIRE = [
  { id: 1, title: 'Mode de paie', icon: User, description: 'Statut et rémunération' },
  { id: 2, title: 'Mode calcul', icon: Calculator, description: 'Indice ou taux horaire' },
  { id: 3, title: 'Période', icon: CalendarDays, description: 'Échéance de versement' },
  { id: 4, title: 'Heures', icon: Clock, description: 'Heures et taux brut' },
  { id: 5, title: 'Résultat', icon: Euro, description: 'Estimation globale' },
]

// Utilitaires
const formatEUR = (value: number) =>
  value.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  })

const sanitizeNumber = (value: string | number) => {
  if (typeof value === 'number') return value
  if (!value) return 0
  return Number(value.replace(',', '.')) || 0
}

const indiceToEuro = (indice: string) => sanitizeNumber(indice) * INDICE_POINT_VALUE

// Tips pour chaque étape
const getTip = (step: number, agentType: AgentType) => {
  if (agentType === 'indiciaire') {
    switch (step) {
      case 1:
        return "Le mode indiciaire concerne les agents sur emploi permanent rémunérés sur la base d'un indice majoré (IM)."
      case 2:
        return "Votre profil détermine le calendrier d'échéances de versement de votre 13ème mois."
      case 3:
        return "Retrouvez votre Indice Majoré (IM) et NBI sur votre bulletin de salaire. La valeur du point d'indice est fixée à 4,92278€."
      case 4:
        return "Le 13ème mois est proratisé selon votre quotité de travail (temps complet/partiel) et le nombre de mois travaillés sur l'année."
      case 5:
        return "Ce montant constitue une estimation indicative. Seuls les bulletins émis par la GCR font foi."
      default:
        return ""
    }
  } else {
    switch (step) {
      case 1:
        return "Le mode horaire concerne les animateurs, vacataires, personnels des écoles et crèches..."
      case 2:
        return "Choisissez si votre rémunération s'appuie sur un indice de référence ou un taux horaire brut direct."
      case 3:
        return "Le versement de Juin prend en compte les heures de Nov à Avril. Celui de Novembre prend en compte les heures de Mai à Octobre."
      case 4:
        return "Un minimum de 455h sur le semestre est requis. Le nombre d'heures retenu est plafonné à 910h."
      case 5:
        return "Ce montant constitue une estimation indicative. Seuls les bulletins émis par la GCR font foi."
      default:
        return ""
    }
  }
}

export default function Calculateur13emeV2({ onClose }: Calculateur13emeProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [agentType, setAgentType] = useState<AgentType>('')
  
  // State indiciaire
  const [indiciaireProfile, setIndiciaireProfile] = useState<IndiciaireProfile>('')
  const [im, setIm] = useState('')
  const [nbi, setNbi] = useState('')
  const [tempsEmploi, setTempsEmploi] = useState(100)
  const [monthsWorked, setMonthsWorked] = useState(12)
  const [rubrique7587, setRubrique7587] = useState('')
  
  // State horaire
  const [horaireBaseType, setHoraireBaseType] = useState<HoraireBase>('')
  const [horaireIM, setHoraireIM] = useState('')
  const [horaireTaux, setHoraireTaux] = useState('')
  const [horaireConges, setHoraireConges] = useState(10)
  const [horaireHours, setHoraireHours] = useState(HOURS_MIN)
  const [horairePeriode, setHorairePeriode] = useState<HorairePeriode>('juin')
  const [horaireAnciennete, setHoraireAnciennete] = useState(6)

  // Calculations
  const indiciaireTI = indiceToEuro(im)
  const indiciaireNBIValue = indiceToEuro(nbi)
  const indiciaireIRValue = (indiciaireTI + indiciaireNBIValue) * IR_RATE
  const horaireTI = indiceToEuro(horaireIM)
  const horaireIRValue = horaireTI * IR_RATE

  const STEPS = agentType === 'horaire' ? STEPS_HORAIRE : STEPS_INDICIAIRE

  const computeIndiciaire = useMemo(() => {
    if (agentType !== 'indiciaire' || !indiciaireProfile) return null;

    const tiValue = indiciaireTI;
    const nbiValue = indiciaireNBIValue;
    const irValue = indiciaireIRValue;
    const baseRub = sanitizeNumber(rubrique7587);

    const base = indiciaireProfile === 'assistante' ? baseRub : tiValue + nbiValue;
    if (base <= 0) return null;
    if (monthsWorked < 3) return null;

    let total, breakdown, compRem, primeSem;
    const tempsRatio = Math.max(0, Math.min(1, tempsEmploi / 100));
    const prorataAnnee = Math.max(0, Math.min(1, monthsWorked / 12));
    const prorataGlobal = tempsRatio * prorataAnnee;

    if (indiciaireProfile === 'medecin') {
      const COEF_SMIC = 1.94;
      const COEF_INDICIAIRE = 0.1707;
      const primeSmic = (SMIC_MENSUEL / 12) * 3 * (tempsEmploi / 100) * COEF_SMIC;
      const primeIndiciaire = (tiValue + nbiValue + irValue) * COEF_INDICIAIRE;
      const montantVersement = +(primeSmic + primeIndiciaire).toFixed(2);
      total = montantVersement * 2;
      compRem = primeSmic;
      primeSem = primeIndiciaire;
      breakdown = [
        { month: 'Juin', ratio: 0.5, note: 'Prime SMIC + Prime indiciaire', amount: montantVersement, details: { primeSmic: +primeSmic.toFixed(2), primeIndiciaire: +primeIndiciaire.toFixed(2) } },
        { month: 'Novembre', ratio: 0.5, note: 'Prime SMIC + Prime indiciaire', amount: montantVersement, details: { primeSmic: +primeSmic.toFixed(2), primeIndiciaire: +primeIndiciaire.toFixed(2) } }
      ];
    } else {
      const remunerationBase = indiciaireProfile === 'assistante'
        ? (baseRub / 2)
        : (tiValue + nbiValue + irValue);
      const fixedPart = prorataGlobal * SMIC_MENSUEL;
      const smicVerse = prorataGlobal * SMIC_MENSUEL;
      const remunerationProratisee = prorataGlobal * remunerationBase;
      const variableBase = remunerationProratisee - smicVerse;
      const variablePart = variableBase > 0 ? variableBase : 0;
      total = fixedPart + variablePart;
      compRem = fixedPart;
      primeSem = variablePart;
      const schedule = INDICIAIRE_SCHEDULE[indiciaireProfile];
      const parts = schedule.reduce((sum, item) => sum + item.part, 0);
      breakdown = schedule.map(item => ({
        month: item.month,
        ratio: item.part / parts,
        note: item.note,
        amount: +(total * (item.part / parts)).toFixed(2),
      }));
    }

    return {
      total,
      compRem,
      primeSem,
      breakdown,
      context: {
        baseMensuelle: tiValue + nbiValue + irValue,
        tempsRatio,
        prorataAnnee,
        prorataGlobal,
        tiValue,
        nbiValue,
        irValue,
      },
    };
  }, [agentType, indiciaireProfile, indiciaireTI, indiciaireNBIValue, indiciaireIRValue, rubrique7587, tempsEmploi, monthsWorked])

  const computeHoraire = useMemo(() => {
    if (agentType !== 'horaire' || !horaireBaseType) return null
    if (horaireHours < HOURS_MIN) return null
    if (horaireAnciennete < 3) return null
    if (horaireBaseType === 'indice' && horaireTI <= 0) return null
    if (horaireBaseType === 'taux' && sanitizeNumber(horaireTaux) === 0) return null

    const heuresRetenues = Math.min(horaireHours, HOURS_CAP)
    const ratioHeures = heuresRetenues / HOURS_CAP
    const tiHoraire = horaireTI
    const autoIRHoraire = horaireIRValue
    const tauxHoraire = sanitizeNumber(horaireTaux)

    let baseReference = 0
    let total = 0
    let compRem = 0
    let primeSem = 0
    let baseSixMois = 0
    let basePS = 0
    const crBase = SMIC_MENSUEL / 2

    if (horaireBaseType === 'indice') {
      baseReference = tiHoraire + autoIRHoraire
      baseSixMois = baseReference / 2
      basePS = Math.max(baseSixMois - crBase, 0)
      compRem = ratioHeures * crBase
      primeSem = ratioHeures * basePS
      total = compRem + primeSem
    } else {
      const tauxMajore = tauxHoraire * (1 + horaireConges / 100)
      baseReference = tauxMajore
      const mensualise = tauxMajore * 151.67
      baseSixMois = mensualise / 2
      basePS = Math.max(baseSixMois - crBase, 0)
      compRem = ratioHeures * crBase
      primeSem = ratioHeures * basePS
      total = compRem + primeSem
    }

    return {
      total,
      compRem,
      primeSem,
      breakdown: [
        {
          month: horairePeriode === 'juin' ? 'Versement de Juin' : 'Versement de Novembre',
          ratio: ratioHeures,
          amount: total,
          note: `${horaireHours}h déclarées / ${HOURS_CAP}h max`,
        },
      ],
      context: {
        ratioHeures,
        baseReference,
        heuresRetenues,
        periode: horairePeriode === 'juin' ? 'Nov → Avril' : 'Mai → Octobre',
      },
    }
  }, [agentType, horaireBaseType, horaireHours, horaireAnciennete, horaireTI, horaireIRValue, horaireTaux, horaireConges, horairePeriode])

  const result = agentType === 'indiciaire' ? computeIndiciaire : computeHoraire
  const totalEstime = result?.total || 0

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return agentType !== ''
      case 2:
        if (agentType === 'indiciaire') return indiciaireProfile !== ''
        return horaireBaseType !== ''
      case 3:
        if (agentType === 'indiciaire') {
          if (indiciaireProfile === 'assistante') return sanitizeNumber(rubrique7587) > 0
          return indiciaireTI > 0
        }
        return true
      case 4:
        if (agentType === 'horaire') {
          if (horaireBaseType === 'indice') return horaireTI > 0 && horaireHours >= HOURS_MIN
          return sanitizeNumber(horaireTaux) > 0 && horaireHours >= HOURS_MIN
        }
        return monthsWorked >= 3
      default:
        return true
    }
  }

  const goNext = () => {
    if (currentStep < 5 && canGoNext()) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const goPrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleReset = () => {
    setCurrentStep(1)
    setAgentType('')
    setIndiciaireProfile('')
    setIm('')
    setNbi('')
    setTempsEmploi(100)
    setMonthsWorked(12)
    setRubrique7587('')
    setHoraireBaseType('')
    setHoraireIM('')
    setHoraireTaux('')
    setHoraireConges(10)
    setHoraireHours(HOURS_MIN)
    setHorairePeriode('juin')
    setHoraireAnciennete(6)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderStepType()
      case 2:
        return agentType === 'indiciaire' ? renderStepProfile() : renderStepHoraireMode()
      case 3:
        return agentType === 'indiciaire' ? renderStepDonnees() : renderStepPeriode()
      case 4:
        return agentType === 'indiciaire' ? renderStepTemps() : renderStepHeures()
      case 5:
        return renderStepResultat()
      default:
        return null
    }
  }

  // Étape 1 : Type d'agent
  const renderStepType = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          Quel est votre mode de rémunération ?
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
          Sélectionnez le mode correspondant à votre statut RH
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <button
          onClick={() => setAgentType('indiciaire')}
          className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl lg:rounded-3xl border-2 transition-all duration-300 text-left relative overflow-hidden group ${
            agentType === 'indiciaire'
              ? 'border-emerald-500 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/10 shadow-[0_0_30px_rgba(16,185,129,0.2)] dark:bg-emerald-950/40'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-emerald-300 dark:hover:border-emerald-700/60 shadow-sm hover:shadow-md'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-4 rounded-xl sm:rounded-2xl transition-transform group-hover:scale-110 ${
              agentType === 'indiciaire'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}>
              <Briefcase className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-bold mb-1 ${agentType === 'indiciaire' ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-800 dark:text-white'}`}>
                Agent Indiciaire
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Emploi permanent titulaire ou contractuel rémunéré selon un Indice Majoré (IM).
              </p>
            </div>
            {agentType === 'indiciaire' && (
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            )}
          </div>
        </button>

        <button
          onClick={() => setAgentType('horaire')}
          className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl lg:rounded-3xl border-2 transition-all duration-300 text-left relative overflow-hidden group ${
            agentType === 'horaire'
              ? 'border-purple-500 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-indigo-500/10 shadow-[0_0_30px_rgba(168,85,247,0.2)] dark:bg-purple-950/40'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-purple-300 dark:hover:border-purple-700/60 shadow-sm hover:shadow-md'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-4 rounded-xl sm:rounded-2xl transition-transform group-hover:scale-110 ${
              agentType === 'horaire'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/40'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}>
              <Clock className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-bold mb-1 ${agentType === 'horaire' ? 'text-purple-900 dark:text-purple-300' : 'text-slate-800 dark:text-white'}`}>
                Agent Horaire
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Animateurs, personnels d'écoles, crèches, vacataires rémunérés à l'heure ou sur indice.
              </p>
            </div>
            {agentType === 'horaire' && (
              <CheckCircle2 className="w-6 h-6 text-purple-500 shrink-0" />
            )}
          </div>
        </button>
      </div>
    </div>
  )

  // Étape 2 Indiciaire : Profil
  const renderStepProfile = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          Sélectionnez votre profil RH
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
          Chaque profil possède un calendrier de versement spécifique
        </p>
      </div>

      <div className="space-y-3.5">
        {[
          { id: 'permanent', label: 'Agent permanent', desc: 'Versement étalé en 3 échéances : Juin (6/12), Novembre (5/12) et Solde en Décembre (1/12)' },
          { id: 'medecin', label: 'Médecin', desc: 'Versement équilibré en 2 échéances : Juin (50%) et Novembre (50%)' },
          { id: 'assistante', label: 'Assistante maternelle', desc: 'Calcul spécifique sur la rubrique 7587 de votre bulletin de solde' },
        ].map(profile => {
          const isSelected = indiciaireProfile === profile.id
          return (
            <button
              key={profile.id}
              onClick={() => setIndiciaireProfile(profile.id as IndiciaireProfile)}
              className={`w-full p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-md ring-1 ring-emerald-500/30 dark:bg-emerald-950/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className={`font-bold text-base ${isSelected ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-800 dark:text-white'}`}>
                    {profile.label}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">{profile.desc}</p>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  // Étape 2 Horaire : Mode de calcul
  const renderStepHoraireMode = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          Mode de calcul horaire
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
          Indiquez la référence inscrite sur votre contrat de travail
        </p>
      </div>

      <div className="space-y-3.5">
        {[
          { id: 'indice', label: 'En référence à un indice (IM)', desc: 'Calcul basé sur un indice de référence (ex: IM 366) proratisé' },
          { id: 'taux', label: 'Sur la base d\'un taux horaire brut', desc: 'Calcul basé sur votre taux horaire brut en euros (ex: 11,50 €/h)' },
        ].map(mode => {
          const isSelected = horaireBaseType === mode.id
          return (
            <button
              key={mode.id}
              onClick={() => setHoraireBaseType(mode.id as HoraireBase)}
              className={`w-full p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-purple-500 bg-purple-500/10 shadow-md ring-1 ring-purple-500/30 dark:bg-purple-950/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className={`font-bold text-base ${isSelected ? 'text-purple-900 dark:text-purple-300' : 'text-slate-800 dark:text-white'}`}>
                    {mode.label}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{mode.desc}</p>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-6 h-6 text-purple-500 shrink-0" />
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  // Étape 3 Indiciaire : Données
  const renderStepDonnees = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          Vos données indiciaires
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
          Informations disponibles sur le haut de votre bulletin de paie
        </p>
      </div>

      {indiciaireProfile === 'assistante' ? (
        <div className="bg-white dark:bg-slate-900/90 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <label className="block text-sm font-bold text-emerald-800 dark:text-emerald-400">
            Montant de la rubrique 7587 (Brut)
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={rubrique7587}
              onChange={(e) => setRubrique7587(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl sm:rounded-2xl text-slate-900 dark:text-white font-bold text-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              placeholder="ex: 1250.00"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">€</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Calcul assistantes : 13ème mois = Rubrique / 2 (proratisé)
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-5">
          {/* Indice Majoré */}
          <div className="bg-white dark:bg-slate-900/90 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md">
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 bg-emerald-500 text-white rounded-full text-xs font-black">1</span>
                Indice Majoré (IM)
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-normal">Point = {INDICE_POINT_VALUE}€</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={im}
              onChange={(e) => setIm(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl sm:rounded-2xl text-slate-900 dark:text-white font-bold text-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              placeholder="ex: 366"
            />
            {indiciaireTI > 0 && (
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2.5 flex items-center gap-1.5 font-mono">
                <TrendingUp className="w-3.5 h-3.5" /> Traitement indiciaire brut : {formatEUR(indiciaireTI)}/mois
              </p>
            )}
          </div>

          {/* NBI */}
          <div className="bg-white dark:bg-slate-900/90 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md">
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 bg-emerald-500 text-white rounded-full text-xs font-black">2</span>
              Nouvelle Bonification Indiciaire (NBI)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={nbi}
              onChange={(e) => setNbi(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl sm:rounded-2xl text-slate-900 dark:text-white font-bold text-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              placeholder="ex: 10 (0 si aucune)"
            />
            {indiciaireNBIValue > 0 && (
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2.5 flex items-center gap-1.5 font-mono">
                <TrendingUp className="w-3.5 h-3.5" /> NBI brute : {formatEUR(indiciaireNBIValue)}/mois
              </p>
            )}
          </div>

          {/* Live Breakdown Box */}
          {indiciaireTI > 0 && (
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/60 dark:to-teal-950/60 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-5 border border-emerald-500/30 shadow-md">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2 font-mono">
                <BarChart3 className="w-4 h-4" /> Base de calcul mensuelle
              </p>
              <div className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Traitement Indiciaire (TI)</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{formatEUR(indiciaireTI)}</span>
                </div>
                <div className="flex justify-between">
                  <span>NBI</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{formatEUR(indiciaireNBIValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Indemnité de Résidence (3%)</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{formatEUR(indiciaireIRValue)}</span>
                </div>
                <div className="border-t border-emerald-500/20 pt-2.5 mt-2 flex justify-between font-black text-sm">
                  <span className="text-slate-900 dark:text-white">Total Base Mensuelle</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono">{formatEUR(indiciaireTI + indiciaireNBIValue + indiciaireIRValue)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )

  // Étape 3 Horaire : Période
  const renderStepPeriode = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          Période de versement
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
          Chaque versement porte sur un semestre d'heures travaillées
        </p>
      </div>

      <div className="space-y-3.5">
        {[
          { id: 'juin', label: 'Versement de Juin', desc: 'Prend en compte les heures effectuées de Novembre à Avril' },
          { id: 'novembre', label: 'Versement de Novembre', desc: 'Prend en compte les heures effectuées de Mai à Octobre' },
        ].map(p => {
          const isSelected = horairePeriode === p.id
          return (
            <button
              key={p.id}
              onClick={() => setHorairePeriode(p.id as HorairePeriode)}
              className={`w-full p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-purple-500 bg-purple-500/10 shadow-md ring-1 ring-purple-500/30 dark:bg-purple-950/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className={`font-bold text-base ${isSelected ? 'text-purple-900 dark:text-purple-300' : 'text-slate-800 dark:text-white'}`}>
                    {p.label}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{p.desc}</p>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-6 h-6 text-purple-500 shrink-0" />
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  // Étape 4 Indiciaire : Temps de travail
  const renderStepTemps = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          Temps de travail et ancienneté
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
          Proratisation selon votre quotité de travail et mois effectifs
        </p>
      </div>

      <div className="space-y-3 sm:space-y-5">
        {/* Slider Quotité */}
        <div className="bg-white dark:bg-slate-900/90 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Quotité de temps de travail
            </label>
            <span className="px-3.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-black rounded-full text-xs font-mono">
              {tempsEmploi}%
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={100}
            value={tempsEmploi}
            onChange={(e) => setTempsEmploi(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between items-center mt-3 text-xs font-mono text-slate-400">
            <span>50% (Temps partiel)</span>
            <span>100% (Temps complet)</span>
          </div>
        </div>

        {/* Counter Mois */}
        <div className="bg-white dark:bg-slate-900/90 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md">
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">
            Nombre de mois travaillés dans l'année
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMonthsWorked(prev => Math.max(0, prev - 1))}
              className="w-14 h-14 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xl sm:text-2xl font-black border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center active:scale-95"
            >
              -
            </button>
            <div className="flex-1 text-center py-2 bg-slate-50 dark:bg-slate-950 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-4xl font-black text-slate-900 dark:text-white font-mono">{monthsWorked}</span>
              <span className="text-base text-slate-400 font-bold ml-1">/ 12 mois</span>
            </div>
            <button
              onClick={() => setMonthsWorked(prev => Math.min(12, prev + 1))}
              className="w-14 h-14 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xl sm:text-2xl font-black border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center active:scale-95"
            >
              +
            </button>
          </div>
          {monthsWorked < 3 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-3 flex items-center gap-1.5 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
              <Info className="w-4 h-4 shrink-0" />
              Minimum 3 mois de présence requis dans l'année pour l'éligibilité au 13ème mois.
            </p>
          )}
        </div>

        {/* Total Ratio Badge */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl sm:rounded-2xl p-4 flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold text-xs">
          <span className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            Taux de proratisation global :
          </span>
          <span className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400">
            {((tempsEmploi / 100) * (monthsWorked / 12) * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  )

  // Étape 4 Horaire : Heures
  const renderStepHeures = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          Heures travaillées sur le semestre
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
          Période : {horairePeriode === 'juin' ? 'Novembre → Avril' : 'Mai → Octobre'}
        </p>
      </div>

      <div className="space-y-3 sm:space-y-5">
        <div className="bg-white dark:bg-slate-900/90 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md">
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
            Nombre d'heures rémunérées sur la période
          </label>
          <input
            type="number"
            min={0}
            value={horaireHours}
            onChange={(e) => setHoraireHours(Math.max(0, Number(e.target.value) || 0))}
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl sm:rounded-2xl text-slate-900 dark:text-white font-bold text-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-mono"
          />
          <div className="flex justify-between mt-3 text-xs text-slate-400 font-mono">
            <span>Minimum : {HOURS_MIN}h</span>
            <span>Plafond : {HOURS_CAP}h</span>
          </div>
        </div>

        {horaireBaseType === 'indice' ? (
          <div className="bg-white dark:bg-slate-900/90 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md">
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
              Indice Majoré de référence (IM)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={horaireIM}
              onChange={(e) => setHoraireIM(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl sm:rounded-2xl text-slate-900 dark:text-white font-bold text-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-mono"
              placeholder="ex: 366"
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900/90 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
                Taux horaire brut (€/h)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={horaireTaux}
                  onChange={(e) => setHoraireTaux(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl sm:rounded-2xl text-slate-900 dark:text-white font-bold text-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-mono"
                  placeholder="ex: 11.85"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">€/h</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Majoration Congés Payés (CP)
                </label>
                <span className="px-2.5 py-0.5 bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold rounded-lg text-xs font-mono">
                  +{horaireConges}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={15}
                value={horaireConges}
                onChange={(e) => setHoraireConges(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Étape 5 : Résultat Dashboard
  const renderStepResultat = () => {
    if (!result) {
      return (
        <div className="text-center py-14">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl sm:rounded-2xl lg:rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Données insuffisantes</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-6">
            Veuillez compléter les informations des étapes précédentes pour obtenir votre estimation.
          </p>
          <button
            onClick={() => setCurrentStep(1)}
            className="px-6 py-3 bg-slate-800 text-white rounded-xl sm:rounded-2xl font-bold hover:bg-slate-700 transition-all text-sm"
          >
            Recommencer
          </button>
        </div>
      )
    }

    const isIndiciaire = agentType === 'indiciaire'
    const themeColor = isIndiciaire ? 'emerald' : 'purple'

    return (
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        
        {/* Main Result Hero Card */}
        <div className={`p-5 sm:p-8 rounded-xl sm:rounded-2xl lg:rounded-3xl relative overflow-hidden text-center border shadow-[0_0_50px_rgba(0,0,0,0.3)] ${
          isIndiciaire
            ? 'bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 border-emerald-500/40'
            : 'bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950 border-purple-500/40'
        }`}>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-white mb-4 border border-white/15 uppercase tracking-wider font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              13ème mois annuel estimé (Brut)
            </div>

            <h2 className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-emerald-300 font-mono tracking-tight mb-2">
              {formatEUR(result.total)}
            </h2>

            <p className="text-xs text-slate-400 font-medium font-mono mb-6">
              Soit environ <b className="text-emerald-400 font-bold">{formatEUR(result.total * 0.82)}</b> en net estimé (-18% cotisations)
            </p>

            {/* Sub-breakdown Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
              <div className="bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl sm:rounded-2xl border border-slate-800 text-left">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Part Fixe (Compl. Rémunération)</span>
                <span className="text-lg font-black text-emerald-400 font-mono">{formatEUR(result.compRem)}</span>
              </div>
              <div className="bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl sm:rounded-2xl border border-slate-800 text-left">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Part Variable (Prime Semestrielle)</span>
                <span className="text-lg font-black text-teal-400 font-mono">{formatEUR(result.primeSem)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Breakdown */}
        <div className="bg-white dark:bg-slate-900/90 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-emerald-500" />
            Échéancier de versement théorique
          </h3>

          <div className="space-y-3">
            {result.breakdown.map((item: any, idx: number) => {
              return (
                <div key={idx} className="p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.month}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{item.note || `Prorata : ${(item.ratio * 100).toFixed(0)}%`}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono block">
                      {formatEUR(item.amount)}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ~{formatEUR(item.amount * 0.82)} net
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl sm:rounded-2xl p-4 flex items-start gap-3 text-amber-800 dark:text-amber-300 text-xs leading-relaxed font-medium">
          <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <b>Avertissement :</b> Cet outil propose un calcul indicatif basé sur le statut RH et les paramètres réglementaires en vigueur. Seul le décompte officiel établi par la Gestion Collective de la Rémunération (GCR) fait foi.
          </div>
        </div>

        <button
          onClick={handleReset}
          className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl sm:rounded-2xl transition-all text-sm flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.99]"
        >
          <RotateCcw className="w-4 h-4" />
          Faire une nouvelle simulation
        </button>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-800 dark:text-slate-100">
      
      {/* Top Banner Header */}
      <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-2xl py-6 border-b border-slate-200 dark:border-slate-800 shadow-md sticky top-0 z-30">
        <div className="px-4 sm:px-8 max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {onClose && (
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-red-500/30 transition-all duration-200 group shrink-0"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Retour</span>
              </button>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Euro className="w-6 h-6 text-emerald-500" />
                Calculateur 13ème Mois
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Simulation pas à pas selon la réglementation RH
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-xl sm:rounded-2xl text-xs font-bold font-mono">
            <Calculator className="w-4 h-4" /> Version 2.0
          </div>
        </div>
      </div>

      {/* Stepper Bar */}
      <div className="bg-white dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 py-4 px-4 sm:px-8 shadow-sm">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between overflow-x-auto pb-1">
            {STEPS.map((step, idx) => {
              const StepIcon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              const isHoraire = agentType === 'horaire'

              return (
                <div key={step.id} className="flex items-center shrink-0">
                  <button
                    onClick={() => isCompleted && setCurrentStep(step.id)}
                    disabled={!isCompleted}
                    className={`flex flex-col items-center gap-1.5 transition-all ${
                      isCompleted ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-sm transition-all ${
                      isActive
                        ? isHoraire ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-110' : 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-110'
                        : isCompleted
                          ? isHoraire ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                    </div>
                    <span className={`text-[11px] hidden sm:block ${
                      isActive ? 'font-black text-slate-900 dark:text-white' : 'font-medium text-slate-400'
                    }`}>
                      {step.title}
                    </span>
                  </button>

                  {idx < STEPS.length - 1 && (
                    <div className={`w-6 sm:w-12 h-0.5 mx-2 transition-all ${
                      currentStep > step.id
                        ? isHoraire ? 'bg-purple-500' : 'bg-emerald-500'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Tip Box */}
          {currentStep < 5 && (
            <div className="mb-6 p-4 rounded-xl sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-300 text-xs font-medium flex items-start gap-2.5">
              <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p>{getTip(currentStep, agentType)}</p>
            </div>
          )}

          {/* Step Card */}
          <div className="bg-white dark:bg-slate-900/90 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-200 dark:border-slate-800 shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
            {renderStep()}
          </div>

          {/* Navigation Controls */}
          {currentStep < 5 && (
            <div className="flex items-center justify-between gap-4 mt-6">
              <button
                onClick={goPrev}
                disabled={currentStep === 1}
                className={`px-6 py-3.5 rounded-xl sm:rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                  currentStep === 1
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                    : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </button>

              <button
                onClick={goNext}
                disabled={!canGoNext()}
                className={`px-8 py-3.5 rounded-xl sm:rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md ${
                  canGoNext()
                    ? agentType === 'horaire'
                      ? 'bg-purple-500 hover:bg-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-105 active:scale-95'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95'
                    : 'opacity-40 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {currentStep === 4 ? 'Résultat' : 'Suivant'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Floating Estimated Total Bar (Steps 1-4) */}
      {totalEstime > 0 && currentStep < 5 && (
        <div className="sticky bottom-4 px-4 pointer-events-none z-20">
          <div className="max-w-2xl mx-auto bg-slate-900/95 backdrop-blur-2xl border border-slate-800 text-white p-4 rounded-xl sm:rounded-2xl shadow-2xl flex items-center justify-between gap-4 pointer-events-auto">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono block">Estimation en direct</span>
              <span className="text-xl font-black text-emerald-400 font-mono">{formatEUR(totalEstime)}</span>
            </div>
            <button
              onClick={() => setCurrentStep(5)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md"
            >
              Voir détail <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
