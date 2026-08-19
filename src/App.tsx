import React, { useState, useRef, useEffect, lazy, Suspense } from "react"
import { Phone, Bot, Mail, MapPin, ArrowRight, ArrowLeft, Rss, Radio, Calculator, DollarSign, TrendingUp, LayoutGrid, HelpCircle, ChevronLeft, ChevronRight, Newspaper, Link2, BookOpen, Scale, Landmark, GraduationCap, Gamepad2, FileText, Clock, Eye, Briefcase, ExternalLink as ExternalLinkIcon, PlayCircle, Sparkles, Laptop } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

// --- IMPORTATIONS DES DONNÉES ---
import { searchFAQ } from "./data/FAQdata.ts"
import { infoItems } from "./data/info-data.ts"
import AdminPanel from "./components/AdminPanel.tsx"
import AdminLogin from "./components/AdminLogin.tsx"
import { incrementWeeklyStat } from "./lib/adminStats.ts"
import { BorderBeam } from "./components/ui/BorderBeam.tsx"
import { Toaster, toast } from "sonner"
import { OrangeGeometricBackground } from "./components/ui/OrangeGeometricBackground.tsx"
import { queryPisteLegifrance } from "./services/legifrance.ts"
import { useNewsFeeds, type RssItem } from "./hooks/useNewsFeeds.ts"


const CalculateurCIAV2 = lazy(() => import("./components/CalculateurCIAV2.tsx"))
const CalculateurPrimesV2 = lazy(() => import("./components/CalculateurPrimesV2.tsx"))
const Calculateur13emeV2 = lazy(() => import("./components/Calculateur13emeV2.tsx"))
const Metiers = lazy(() => import("./components/Metiers.tsx"))
const FAQ = lazy(() => import("./components/FAQ.tsx"))
const LandingPage = lazy(() => import("./components/LandingPage.tsx"))
const EspaceJeux = lazy(() => import("./components/EspaceJeux.tsx"))
const Actualites = lazy(() => import("./components/Actualites.tsx"))
const VeilleJuridique = lazy(() => import("./components/VeilleJuridique.tsx"))
const EspacePodcastsFigurines = lazy(() => import("./components/EspacePodcastsFigurines.tsx"))
import MacMenuBar from "./components/MacMenuBar.tsx"
import { LuxuryChat } from "./components/ui/LuxuryChat.tsx"

// --- CONFIGURATION BASE URL POUR GITHUB PAGES ---
const BASE_URL = import.meta.env.BASE_URL

// --- CONFIGURATION API PERPLEXITY & RSS ---
const getApiEndpoint = (endpoint: string) => {
  if (import.meta.env.DEV) {
    return `http://localhost:3001/api/${endpoint}`;
  }
  return `/api/${endpoint}`;
};

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || getApiEndpoint("completions");

const MARQUEE_SPEED = 80

const updateMarqueeDuration = (el: HTMLDivElement | null) => {
  if (!el) return
  const width = el.scrollWidth / 2
  if (!width || Number.isNaN(width)) return
  const duration = Math.min(120, Math.max(20, width / MARQUEE_SPEED))
  el.style.setProperty("--marquee-duration", `${duration}s`)
  el.style.animation = "none"
  void el.offsetHeight
  el.style.animation = ""
}

const ViewLoader = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
  </div>
)

type SearchDeps = {
  chapitres: Record<number, string>
  formation: string
  rifseepData: string
  teletravailData: unknown
  sommaireUnifie: Array<{
    id: string
    titre: string
    resume?: string
    motsCles: string[]
    source: string
    chapitre?: number
    article?: number
  }>
  rechercherAvecPriorite: (query: string, maxResults?: number) => Array<{ id: string }>
  searchFichesByKeywordsAsync: (keywords: string[]) => Promise<{ results?: unknown[] }>
}

let searchDepsPromise: Promise<SearchDeps> | null = null

const loadSearchDeps = async (): Promise<SearchDeps> => {
  if (!searchDepsPromise) {
    searchDepsPromise = Promise.all([
      import("./data/temps.ts"),
      import("./data/formation.ts"),
      import("./data/rifseep-data.ts"),
      import("./data/teletravail.ts"),
      import("./data/sommaireUnifie.ts"),
      import("./utils/ficheSearch.ts"),
    ]).then(([tempsModule, formationModule, rifseepModule, teletravailModule, sommaireModule, ficheSearchModule]) => ({
      chapitres: tempsModule.chapitres as Record<number, string>,
      formation: formationModule.formation as string,
      rifseepData: rifseepModule.rifseepData as string,
      teletravailData: teletravailModule.teletravailData,
      sommaireUnifie: sommaireModule.sommaireUnifie,
      rechercherAvecPriorite: sommaireModule.rechercherAvecPriorite,
      searchFichesByKeywordsAsync: ficheSearchModule.searchFichesByKeywordsAsync,
    }))
  }

  return searchDepsPromise
}

// --- COMPOSANT RSS BANDEAU (mémorisé pour éviter les re-renders) ---
const RssBandeau = React.memo(({ rssItems, rssLoading, marqueeRef }: { rssItems: RssItem[], rssLoading: boolean, marqueeRef: React.RefObject<HTMLDivElement> }) => {
  // Générer le contenu des items
  const renderItems = (keyPrefix: string) => {
    if (rssItems.length === 0) {
      return (
        <span className="text-base mx-8 font-semibold text-orange-950">
          {rssLoading ? "Chargement des articles..." : "Aucun article disponible"}
        </span>
      )
    }
    return rssItems.map((item, index) => (
      <React.Fragment key={`${keyPrefix}-${index}`}>
        <span className={`marquee-diamond${index % 3 === 0 ? ' marquee-diamond-twinkle' : ''}`} aria-hidden="true" />
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm sm:text-lg font-semibold mx-3 sm:mx-6 hover:text-orange-855 cursor-pointer text-orange-950 transition-colors duration-100 inline-block"
        >
          {item.title}
        </a>
      </React.Fragment>
    ))
  }

  return (
    <section className="relative bg-gradient-to-r from-orange-600/60 via-amber-500/60 to-orange-600/60 text-orange-950 overflow-hidden w-full shadow-lg border-b border-orange-500/30 z-50 glass-banner marquee-pausable">
      <div className="relative h-11 sm:h-14 flex items-center overflow-hidden">
        {/* Label ACTU fixe à gauche */}
        <div className="absolute left-0 top-0 h-full w-20 sm:w-36 flex items-center justify-center bg-gradient-to-r from-amber-400 to-orange-300 z-20 shadow-lg glass-pill actu-pill-glow">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Rss className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-950 animate-pulse" />
            <span className="text-xs sm:text-base font-bold tracking-wide text-orange-950">ACTU:</span>
          </div>
        </div>
        {/* Container du défilement - 2 copies pour boucle infinie */}
        <div ref={marqueeRef} className="marquee-track animate-marquee ml-24 sm:ml-40">
          <div className="marquee-group">
            {renderItems('a')}
          </div>
          <div className="marquee-group">
            {renderItems('b')}
          </div>
        </div>
      </div>
    </section>
  )
})
RssBandeau.displayName = 'RssBandeau'

// --- TYPES ---
interface ChatMessage {
  type: "user" | "assistant"
  content: string
  timestamp: Date
}
interface InfoItem {
  id: number
  title: string
  content: string
}
interface ChatbotState {
  currentView: "menu" | "chat" | "calculators" | "metiers" | "faq" | "jeux" | "actualites" | "veille" | "podcasts"
  selectedDomain: number | null
  messages: ChatMessage[]
  isProcessing: boolean
}

function App() {
  // --- LANDING PAGE ---
  const [showLanding, setShowLanding] = useState(true)

  // --- ÉTATS & REFS ---
  const [chatState, setChatState] = useState<ChatbotState>({
    currentView: "menu",
    selectedDomain: null,
    messages: [],
    isProcessing: false,
  })
  const [inputValue, setInputValue] = useState("")
  const [hoveredQuickAccessIndex, setHoveredQuickAccessIndex] = useState<number | null>(null)

  // --- THEME STATE ---
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme')
    return (saved === 'dark' || saved === 'light') ? saved : 'light'
  })

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  // --- WELCOME TOAST EFFECT ---
  useEffect(() => {
    if (!showLanding) {
      toast.success("Bienvenue sur ATLAS !", {
        description: "Votre assistant statutaire et calculateur de primes.",
        duration: 4000,
      })
    }
  }, [showLanding])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }
  const [selectedInfo, setSelectedInfo] = useState<InfoItem | null>(null)

  // --- FLUX D'ACTUALITÉS (Hook optimisé) ---
  const { rssItems, rssLoading, intercoNews, intercoLoading, fpNews, fpLoading } = useNewsFeeds()
  const intercoCarouselRef = useRef<HTMLDivElement>(null)
  const fpCarouselRef = useRef<HTMLDivElement>(null)

  const [activeCalculator, setActiveCalculator] = useState<'primes' | 'cia' | '13eme' | null>(null)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [logoLoadError, setLogoLoadError] = useState(false)
  const [showExpandSearch, setShowExpandSearch] = useState(false)
  const [lastQuestion, setLastQuestion] = useState<string>("")
  const [showMacMenuBar, setShowMacMenuBar] = useState<boolean>(() => {
    const saved = localStorage.getItem('showMacMenuBar');
    return saved === null ? true : saved === 'true';
  })
  useEffect(() => {
    localStorage.setItem('showMacMenuBar', String(showMacMenuBar));
  }, [showMacMenuBar]);

  const newsMarqueeRef = useRef<HTMLDivElement>(null)
  const rssMarqueeRef = useRef<HTMLDivElement>(null)
  const bipMarkdownCacheRef = useRef<Map<string, string>>(new Map())

  // --- EFFETS ---
  useEffect(() => {
    const sync = () => {
      updateMarqueeDuration(newsMarqueeRef.current)
      updateMarqueeDuration(rssMarqueeRef.current)
    }
    const raf = requestAnimationFrame(sync)
    const handleResize = () => sync()
    window.addEventListener("resize", handleResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", handleResize)
    }
  }, [rssItems.length, rssLoading])

  // --- COMPATIBILITÉ FIREFOX WINDOWS : MOLETTE VERTICALE -> SCROLL HORIZONTAL & MOUSE DRAG ---
  useEffect(() => {
    const setupCarouselScroll = (ref: React.RefObject<HTMLDivElement | null>) => {
      const el = ref.current
      if (!el) return () => { }

      let isDown = false
      let startX = 0
      let scrollLeft = 0
      let isDragging = false

      const handleWheel = (e: WheelEvent) => {
        if (e.deltaY !== 0 && Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
          e.preventDefault()
          // Normalize deltaMode: Firefox uses DOM_DELTA_LINE (1) or DOM_DELTA_PAGE (2),
          // Chrome/Edge use DOM_DELTA_PIXEL (0).
          const lineHeight = 40
          const multiplier = e.deltaMode === 1 ? lineHeight : e.deltaMode === 2 ? el.clientWidth : 1
          el.scrollLeft += e.deltaY * multiplier * 1.2
        }
      }

      const handleMouseDown = (e: MouseEvent) => {
        if (e.button !== 0) return
        isDown = true
        isDragging = false
        startX = e.pageX - el.offsetLeft
        scrollLeft = el.scrollLeft
      }

      const handleMouseUp = () => {
        isDown = false
      }

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDown) return
        const x = e.pageX - el.offsetLeft
        const walk = (x - startX) * 1.5
        if (Math.abs(walk) > 4) {
          isDragging = true
          e.preventDefault()
          el.scrollLeft = scrollLeft - walk
        }
      }

      const handleClick = (e: MouseEvent) => {
        if (isDragging) {
          e.preventDefault()
          e.stopPropagation()
        }
      }

      el.addEventListener('wheel', handleWheel, { passive: false })
      el.addEventListener('mousedown', handleMouseDown)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('mousemove', handleMouseMove)
      el.addEventListener('click', handleClick, true)

      return () => {
        el.removeEventListener('wheel', handleWheel)
        el.removeEventListener('mousedown', handleMouseDown)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('mousemove', handleMouseMove)
        el.removeEventListener('click', handleClick, true)
      }
    }

    const cleanupInterco = setupCarouselScroll(intercoCarouselRef)
    const cleanupFp = setupCarouselScroll(fpCarouselRef)

    return () => {
      cleanupInterco()
      cleanupFp()
    }
  }, [intercoNews, fpNews, intercoLoading, fpLoading])

  // --- FONCTIONS DE GESTION ---
  const handleInfoClick = (info: InfoItem) => setSelectedInfo(info)

  const openCalculatorsLanding = () => {
    incrementWeeklyStat('home_calculators')
    setChatState({ ...chatState, currentView: 'calculators' })
  }

  const openMetiersView = () => {
    incrementWeeklyStat('home_metiers')
    setChatState({ ...chatState, currentView: 'metiers' })
  }

  const openCalculator = (calculator: 'primes' | 'cia' | '13eme') => {
    const keyByCalculator = {
      primes: 'calculator_primes',
      cia: 'calculator_cia',
      '13eme': 'calculator_13eme',
    } as const

    incrementWeeklyStat(keyByCalculator[calculator])
    setActiveCalculator(calculator)
  }

  const handleDomainSelection = (domainId: number) => {
    if (domainId === 0) {
      incrementWeeklyStat('home_question')
    }

    setChatState({
      currentView: "chat",
      selectedDomain: domainId,
      messages: [
        {
          type: "assistant",
          content: "Bonjour ! Je suis votre assistant CFDT unifié. Je peux vous aider avec toutes vos questions sur le temps de travail, la formation, le télétravail et bien plus encore. Que souhaitez-vous savoir ?",
          timestamp: new Date(),
        },
      ],
      isProcessing: false,
    })
  }

  const returnToMenu = () => {
    setChatState({ currentView: "menu", selectedDomain: null, messages: [], isProcessing: false })
    setInputValue("")
    setSelectedInfo(null)
  }

  const usefulLinks = [
    { label: "Jurisprudences", href: "https://www.conseil-etat.fr/actualites", imageSrc: "/images/jurisprudence.png" },
    { label: "Legifrance", href: "https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070633/", imageSrc: "/images/legifrance.png" },
    { label: "Catalogue CNFPT", href: "https://www.cnfpt.fr/catalogue/catalogues/region84/#page/1", imageSrc: "/images/formation_lien.png" },
    { label: "Primes", href: "https://www.cdg31.fr/sites/default/files/guide_des_primes_2025.pdf", imageSrc: "/images/primes_lien.png" },
  ]

  // --- LOGIQUE DU CALCULATEUR DE PRIMES ---
  const appelPerplexity = async (messages: { role: string; content: string }[], useExternalModel = false) => {
    try {
      // Utiliser "sonar" pour recherche externe (meilleur respect des instructions FPT)
      // Utiliser "sonar-pro" pour recherche interne
      const model = useExternalModel ? "sonar" : "sonar-pro"
      const data = { model, messages }
      const response = await fetch(BACKEND_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        console.error("Détail de l'erreur API:", errorBody)
        throw new Error(`Erreur API (${response.status}): ${response.statusText}`)
      }

      const result = await response.json()
      return result.choices[0].message.content
    } catch (error) {
      console.error("Erreur lors du traitement de la question:", error)
      return "Je ne trouve pas cette information dans nos documents internes. Contactez la CFDT au 01 40 85 64 64 pour plus de détails."
    }
  }

  // Fonction de recherche élargie sur Légifrance (Code général de la fonction publique)
  const rechercherLegifrance = async (question: string) => {
    const systemPrompt = `
🚨 INSTRUCTION CRITIQUE : Tu réponds UNIQUEMENT sur la FONCTION PUBLIQUE TERRITORIALE (FPT).
Si ta réponse contient "Code du travail" ou "L1226" ou "salarié" ou "employeur privé" = ERREUR GRAVE.

👤 CONTEXTE : Agent territorial (fonctionnaire ou contractuel) d'une MAIRIE française.

📚 SOURCES LÉGALES OBLIGATOIRES - RECHERCHE UNIQUEMENT DANS :

▶ FONCTIONNAIRES TERRITORIAUX :
• Code général de la fonction publique (CGFP) Articles L822-1 à L822-12 pour les congés maladie
  URL: https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000044416551
• Décret n°87-602 du 30 juillet 1987 (congés maladie fonctionnaires territoriaux)
  URL: https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000520911

▶ AGENTS CONTRACTUELS TERRITORIAUX :
• Décret n°88-145 du 15 février 1988 (agents non titulaires territoriaux)
  URL: https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000871608

📋 RÉPONSE STRUCTURÉE OBLIGATOIRE :

## Pour les FONCTIONNAIRES titulaires :
[Citer CGFP + Décret 87-602 avec articles précis]

## Pour les CONTRACTUELS :
[Citer Décret 88-145 avec articles précis]

💡 EXEMPLE - Congé Longue Maladie (CLM) fonctionnaire territorial :
- Durée : 3 ans maximum (Article 57 ancien statut → CGFP L822-4)
- Rémunération : 1 an plein traitement + 2 ans demi-traitement
- Conditions : Maladie rendant nécessaire un traitement et repos prolongés

Question : ${question}
`

    const apiMessages = [
      { role: "system", content: systemPrompt },
      {
        role: "user", content: `FONCTION PUBLIQUE TERRITORIALE UNIQUEMENT.
Question d'un agent territorial : ${question}

⚠️ INTERDIT : Code du travail, droit privé, convention collective.
✅ OBLIGATOIRE : CGFP, Décret 87-602, Décret 88-145.` },
    ]

    return await appelPerplexity(apiMessages, true) // true = recherche externe, utilise modèle "sonar"
  }

  // Gérer le clic sur "Oui" pour élargir la recherche
  const handleExpandSearch = async () => {
    setShowExpandSearch(false)
    if (!lastQuestion) return

    setChatState((prevState) => ({ ...prevState, isProcessing: true }))

    const searchingMessage: ChatMessage = {
      type: "assistant",
      content: "🔍 Je recherche dans le Code général de la fonction publique sur Légifrance...",
      timestamp: new Date(),
    }
    setChatState((prevState) => ({ ...prevState, messages: [...prevState.messages, searchingMessage] }))

    try {
      const reponse = await rechercherLegifrance(lastQuestion)
      const resultMessage: ChatMessage = {
        type: "assistant",
        content: `📚 **Résultat de la recherche Légifrance :**\n\n${reponse}`,
        timestamp: new Date(),
      }
      setChatState((prevState) => ({ ...prevState, messages: [...prevState.messages, resultMessage] }))
    } catch (error) {
      console.error("Erreur recherche Légifrance:", error)
      const errorMessage: ChatMessage = {
        type: "assistant",
        content: "Désolé, une erreur est survenue lors de la recherche sur Légifrance. Contactez la CFDT au 01 40 85 64 64.",
        timestamp: new Date(),
      }
      setChatState((prevState) => ({ ...prevState, messages: [...prevState.messages, errorMessage] }))
    } finally {
      setChatState((prevState) => ({ ...prevState, isProcessing: false }))
      setLastQuestion("")
    }
  }

  // Gérer le clic sur "Non" pour revenir à l'accueil
  const handleDeclineSearch = () => {
    setShowExpandSearch(false)
    setLastQuestion("")
    returnToMenu()
  }

  // --- RECHERCHE OPTIMISÉE EN 2 ÉTAPES ---
  // Étape 1 : Identifier les sections pertinentes via le sommaire léger (~500 tokens)
  // Étape 2 : Charger uniquement le contenu des sections identifiées
  // Économie : ~80% de tokens par requête

  const genererSommaireTexte = async () => {
    const { sommaireUnifie } = await loadSearchDeps()
    return sommaireUnifie.map(s =>
      `[${s.id}] ${s.titre} - ${s.resume || s.motsCles.join(', ')}`
    ).join('\n')
  }

  const extraireBlockArticle = (chapitreText: string, articleNum?: number, title?: string): string => {
    if (!chapitreText) return ''
    const lines = chapitreText.split('\n')

    if (articleNum) {
      const artHeaderRegex = new RegExp(`^ARTICLE\\s+${articleNum}\\b`, 'i')
      const startIdx = lines.findIndex(l => artHeaderRegex.test(l.trim()))
      if (startIdx !== -1) {
        let endIdx = lines.findIndex((l, idx) => idx > startIdx && /^ARTICLE\s+\d+\b/i.test(l.trim()))
        if (endIdx === -1) endIdx = Math.min(startIdx + 25, lines.length)
        return lines.slice(startIdx, endIdx).join('\n')
      }
    }

    if (title) {
      const normTitle = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      const startIdx = lines.findIndex(l => {
        const normL = l.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        return normL.includes(normTitle)
      })
      if (startIdx !== -1) {
        const start = Math.max(0, startIdx - 1)
        const end = Math.min(lines.length, startIdx + 15)
        return lines.slice(start, end).join('\n')
      }
    }

    return ''
  }

  const chargerContenuSections = async (sectionIds: string[]): Promise<string> => {
    const { sommaireUnifie, chapitres, formation, rifseepData, teletravailData } = await loadSearchDeps()
    const chapitresACharger = new Set<number>()
    const targetBlocks: string[] = []
    let chargerFormation = false
    let chargerRifseep = false
    let chargerTeletravail = false

    sectionIds.forEach(id => {
      const section = sommaireUnifie.find(s => s.id === id)
      if (section) {
        if (section.resume) {
          targetBlocks.push(`📌 [${section.titre}] ${section.resume}`)
        }
        if (section.source === 'temps' && section.chapitre) {
          chapitresACharger.add(section.chapitre)
          const fullText = (chapitres as Record<number, string>)[section.chapitre] || ''
          const articleExcerpt = extraireBlockArticle(fullText, section.article, section.titre)
          if (articleExcerpt) {
            targetBlocks.push(`=== EXTRAIT ARTICLE : ${section.titre} ===\n${articleExcerpt}`)
          }
        } else if (section.source === 'formation') {
          chargerFormation = true
        } else if (section.source === 'rifseep') {
          chargerRifseep = true
        } else if (section.source === 'teletravail') {
          chargerTeletravail = true
        }
      }
    })

    let contenu = ''
    if (targetBlocks.length > 0) {
      contenu += `=== DISPOSITIONS CIBLÉES DIRECTES POUR LA QUESTION ===\n${targetBlocks.join('\n\n')}\n\n`
    }

    if (chapitresACharger.size > 0) {
      const titres = ['', 'LE TEMPS DE TRAVAIL', 'LES CONGÉS', "AUTORISATIONS SPÉCIALES D'ABSENCE", 'LES ABSENCES POUR MALADIES ET ACCIDENTS']
      chapitresACharger.forEach(ch => {
        contenu += `\n\n=== ${titres[ch] || 'CHAPITRE ' + ch} ===\n${(chapitres as Record<number, string>)[ch] || ''}`
      })
    }
    if (chargerFormation) {
      contenu += `\n\n=== RÈGLEMENT FORMATION ===\n${formation || ''}`
    }
    if (chargerRifseep) {
      contenu += `\n\n=== RIFSEEP ET PRIMES ===\n${rifseepData || ''}`
    }
    if (chargerTeletravail) {
      contenu += `\n\n=== PROTOCOLE TÉLÉTRAVAIL ===\n${typeof teletravailData === 'string' ? teletravailData : JSON.stringify(teletravailData)}`
    }
    return contenu.trim()
  }

  const extraireMotsClesQuestion = (question: string): string[] => {
    const stopWords = new Set([
      "le", "la", "les", "de", "des", "du", "un", "une", "et", "ou", "en", "dans", "sur", "pour", "avec",
      "je", "tu", "il", "elle", "nous", "vous", "ils", "elles", "que", "qui", "quoi", "quel", "quelle", "quels",
      "quelles", "est", "sont", "a", "ai", "as", "au", "aux", "ce", "cet", "cette", "ces", "mon", "ma", "mes",
      "ton", "ta", "tes", "son", "sa", "ses", "notre", "nos", "votre", "vos", "leur", "leurs", "y", "ne", "pas",
      "plus", "moins", "combien", "type", "types"
    ])

    return question
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .map(token => token.trim())
      .filter(token => token.length >= 3 && !stopWords.has(token))
      .slice(0, 10)
  }

  const toPublicUrl = (path: string): string => {
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path
    const normalizedBase = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`
    return `${normalizedBase}${normalizedPath}`
  }

  const markdownToPlainText = (markdown: string): string => {
    return markdown
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/[>*_~]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const normalizeForSearch = (value: string): string =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

  const GENERIC_QUERY_TERMS = new Set([
    'combien', 'temps', 'duree', 'dure', 'durer', 'duree', 'maximum', 'minimum', 'quand', 'comment',
    'peut', 'etre', 'est', 'sont', 'dans', 'pour', 'avec', 'sans', 'quel', 'quelle', 'quels', 'quelles',
  ])

  const extraireMotsEntite = (motsCles: string[]): string[] => {
    return Array.from(new Set(
      motsCles
        .map(m => normalizeForSearch(m).trim())
        .filter(m => m.length >= 4 && !GENERIC_QUERY_TERMS.has(m)),
    ))
  }

  const construireExtraitPertinent = (
    contenu: string,
    motsCles: string[],
    maxLen = 2600,
    options?: { preferTemporalFacts?: boolean },
  ): string => {
    if (!contenu) return ''

    const normalizedContent = normalizeForSearch(contenu)
    const normalizedKeywords = Array.from(
      new Set(
        motsCles
          .map(m => normalizeForSearch(m).trim())
          .filter(m => m.length >= 3),
      ),
    )

    if (normalizedKeywords.length === 0) {
      return contenu.slice(0, maxLen)
    }

    const windows: Array<{ start: number; end: number }> = []

    normalizedKeywords.forEach((keyword) => {
      let fromIndex = 0
      let occurrences = 0

      while (occurrences < 2) {
        const idx = normalizedContent.indexOf(keyword, fromIndex)
        if (idx === -1) break

        windows.push({
          start: Math.max(0, idx - 240),
          end: Math.min(contenu.length, idx + 520),
        })

        fromIndex = idx + keyword.length
        occurrences += 1
      }
    })

    if (windows.length === 0) {
      return contenu.slice(0, maxLen)
    }

    windows.sort((a, b) => a.start - b.start)
    const merged: Array<{ start: number; end: number }> = []

    windows.forEach((window) => {
      const previous = merged[merged.length - 1]
      if (!previous || window.start > previous.end + 80) {
        merged.push({ ...window })
      } else {
        previous.end = Math.max(previous.end, window.end)
      }
    })

    let excerpt = ''
    for (const segment of merged) {
      const chunk = contenu.slice(segment.start, segment.end).trim()
      if (!chunk) continue

      const separator = excerpt.length > 0 ? '\n\n[...]\n\n' : ''
      const candidate = `${excerpt}${separator}${chunk}`

      if (candidate.length > maxLen) {
        const remaining = maxLen - excerpt.length - separator.length
        if (remaining > 120) {
          excerpt = `${excerpt}${separator}${chunk.slice(0, remaining).trim()}`
        }
        break
      }

      excerpt = candidate
    }

    const baseExcerpt = excerpt || contenu.slice(0, maxLen)

    if (!options?.preferTemporalFacts) {
      return baseExcerpt
    }

    const phrases = contenu
      .split(/(?<=[.;!?])\s+|\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length >= 30 && p.length <= 320)

    const temporalPatterns = /(duree|durée|renouvel|periode|période|delai|délai|an|ans|mois|jour|jours|semaine|semaines)/i

    const scoredFacts = phrases
      .map((phrase) => {
        const normalized = normalizeForSearch(phrase)
        const keywordHits = normalizedKeywords.filter((k) => normalized.includes(k)).length
        const hasTemporal = temporalPatterns.test(phrase)
        const hasNumber = /\d/.test(phrase)
        const score = keywordHits * 3 + (hasTemporal ? 4 : 0) + (hasNumber ? 3 : 0)
        return { phrase, score }
      })
      .filter((item) => item.score >= 6)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => item.phrase)

    if (scoredFacts.length === 0) {
      return baseExcerpt
    }

    const factsBlock = scoredFacts.join('\n')
    const enriched = `Extraits factuels prioritaires:\n${factsBlock}\n\n${baseExcerpt}`
    return enriched.slice(0, maxLen)
  }

  const chargerContenuBipComplet = async (localPath?: string): Promise<string | null> => {
    if (!localPath) return null

    const cache = bipMarkdownCacheRef.current
    if (cache.has(localPath)) {
      return cache.get(localPath) || null
    }

    try {
      const response = await fetch(toPublicUrl(localPath))
      if (!response.ok) return null

      const markdown = await response.text()
      const plain = markdownToPlainText(markdown)
      cache.set(localPath, plain)
      return plain
    } catch {
      return null
    }
  }

  const genererContexteBip = async (question: string): Promise<string> => {
    const motsCles = extraireMotsClesQuestion(question)
    if (motsCles.length === 0) return ""
    const { searchFichesByKeywordsAsync } = await loadSearchDeps()
    const motsEntite = extraireMotsEntite(motsCles)
    const questionNormalized = normalizeForSearch(question)
    const preferTemporalFacts = /(combien|duree|durée|dure|renouvel|periode|période|delai|délai|temps)/i.test(questionNormalized)
    const motsClesSpecifiques = Array.from(new Set(
      motsCles.filter((mot) => !GENERIC_QUERY_TERMS.has(normalizeForSearch(mot))),
    ))
    const termesRanking = motsClesSpecifiques.length > 0 ? motsClesSpecifiques : motsCles
    const termesExtrait = Array.from(new Set([
      ...motsEntite,
      ...termesRanking,
    ]))

    try {
      const searchResult = await searchFichesByKeywordsAsync(motsCles)
      if (!searchResult.results || searchResult.results.length === 0) return ""

      const resultsFiltres = [...searchResult.results]
        .sort((a, b) => {
          const aTitre = normalizeForSearch((a as { titre?: string }).titre || '')
          const bTitre = normalizeForSearch((b as { titre?: string }).titre || '')
          const aSection = normalizeForSearch((a as { section?: string }).section || '')
          const bSection = normalizeForSearch((b as { section?: string }).section || '')
          const aContent = normalizeForSearch((a as { content?: string }).content || '')
          const bContent = normalizeForSearch((b as { content?: string }).content || '')

          const scoreFor = (titre: string, section: string, content: string) => {
            const keywordScore = termesRanking.reduce((acc, kw) => {
              const k = normalizeForSearch(kw)
              return acc + (titre.includes(k) ? 4 : 0) + (section.includes(k) ? 2 : 0) + (content.includes(k) ? 1 : 0)
            }, 0)

            const entityBoost = motsEntite.reduce((acc, kw) => {
              return acc + (titre.includes(kw) ? 8 : 0) + (section.includes(kw) ? 4 : 0)
            }, 0)

            return keywordScore + entityBoost
          }

          const aScore = scoreFor(aTitre, aSection, aContent)
          const bScore = scoreFor(bTitre, bSection, bContent)
          return bScore - aScore
        })

      const resultsEntite = motsEntite.length > 0
        ? resultsFiltres.filter((result) => {
          const titre = normalizeForSearch((result as { titre?: string }).titre || '')
          const section = normalizeForSearch((result as { section?: string }).section || '')
          return motsEntite.some(entite => titre.includes(entite) || section.includes(entite))
        })
        : []

      const selectionSource = resultsEntite.length > 0 ? resultsEntite : resultsFiltres
      const maxResults = preferTemporalFacts ? 8 : 5
      const topResults = selectionSource.slice(0, maxResults)

      const blocs = await Promise.all(topResults.map(async (result, index) => {
        const titre = (result as { titre?: string; title?: string }).titre || (result as { titre?: string; title?: string }).title || "Fiche BIP"
        const section = (result as { section?: string; categorie?: string }).section || (result as { section?: string; categorie?: string }).categorie || "bip"
        const localPath = (result as { localPath?: string }).localPath
        const contenuIndex = ((result as { content?: string }).content || "")
        const contenuComplet = await chargerContenuBipComplet(localPath)
        const source = contenuComplet || contenuIndex
        const contenu = construireExtraitPertinent(source, termesExtrait, 2600, { preferTemporalFacts })
        return `### BIP ${index + 1} — ${titre}\nSection: ${section}\n${contenu}`
      }))

      return `\n\n=== FICHES BIP PERTINENTES ===\n${blocs.join("\n\n")}`
    } catch (error) {
      console.warn("[traiterQuestion] Erreur recherche BIP:", error)
      return ""
    }
  }

  const extraireIndicesFactuelsBip = (question: string, bipContexte: string): string => {
    if (!bipContexte) return ''

    const motsCles = extraireMotsClesQuestion(question)
    const motsEntite = extraireMotsEntite(motsCles)
    const termes = Array.from(new Set([
      ...motsEntite,
      ...motsCles.filter((mot) => !GENERIC_QUERY_TERMS.has(normalizeForSearch(mot))),
    ]))

    const lignes = bipContexte
      .split(/\n+/)
      .map((l) => l.trim())
      .filter((l) => l.length >= 20 && !/^###\s|^Section:/i.test(l))

    const scored = lignes.map((ligne) => {
      const normalized = normalizeForSearch(ligne)
      const keywordHits = termes.filter((t) => normalized.includes(normalizeForSearch(t))).length
      const hasDurationSignal = /(duree|renouvellement|an|ans|mois|jour|jours|semaine|semaines)/i.test(ligne)
      const hasNumericSignal = /\d/.test(ligne)
      const score = keywordHits * 4 + (hasDurationSignal ? 3 : 0) + (hasNumericSignal ? 2 : 0)
      return { ligne, score }
    })

    const lignesFactuelles = scored
      .filter((item) => item.score >= 3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)

    const fenetresFactuelles = Array.from(
      bipContexte.matchAll(/[^\n]{0,220}(?:duree|durée|renouvel|periode|période|delai|délai|ans?|mois|jours?|semaines?)[^\n]{0,260}/gi),
    )
      .map((m) => (m[0] || '').replace(/\s+/g, ' ').trim())
      .filter((m) => m.length >= 40)
      .slice(0, 6)

    const uniques = Array.from(new Set([
      ...lignesFactuelles.map((item) => item.ligne),
      ...fenetresFactuelles,
    ])).slice(0, 10)

    return uniques.map((ligne) => `- ${ligne}`).join('\n')
  }

  const genererContexteFAQ = (question: string): string => {
    const faqMatches = searchFAQ(question).slice(0, 3)
    if (faqMatches.length === 0) {
      return ''
    }

    return faqMatches
      .map((item, index) => `FAQ ${index + 1} — ${item.question}\n${item.answer}`)
      .join('\n\n')
  }

  const traiterQuestion = async (question: string) => {
    // ⚡ Interrogation transparente de l'API PISTE Légifrance en parallèle
    const pistePromise = queryPisteLegifrance(question).catch(err => {
      console.warn("[PISTE] Erreur transparente:", err)
      return []
    })

    const {
      sommaireUnifie,
      rechercherAvecPriorite,
      chapitres,
      formation,
      rifseepData,
      teletravailData,
    } = await loadSearchDeps()

    const idsLocaux = rechercherAvecPriorite(question, 4).map(section => section.id)
    const faqContexte = genererContexteFAQ(question)

    let idsFinals = idsLocaux

    if (idsFinals.length === 0) {
      // ÉTAPE 1 : Identifier les sections pertinentes avec le sommaire léger
      const sommaire = await genererSommaireTexte()
      const identificationPrompt = `Tu es un assistant qui identifie les sections pertinentes pour répondre à une question.

SOMMAIRE DES DOCUMENTS DISPONIBLES :
${sommaire}

QUESTION : ${question}

RÈGLES :
- Réponds UNIQUEMENT avec les IDs des sections pertinentes, séparés par des virgules
- Choisis 1 à 4 sections maximum, les plus pertinentes
- Si aucune section ne correspond, réponds "AUCUNE"
- Format attendu : temps_ch2_conges_annuels, temps_ch2_rtt

IDs des sections pertinentes :`

      const identificationResponse = await appelPerplexity([
        { role: "user", content: identificationPrompt }
      ])

      // Parser la réponse pour extraire les IDs (tolérant à la ponctuation et au texte parasite)
      const responseClean = identificationResponse
        .toLowerCase()
        .replace(/["']/g, '')
        .replace(/\[/g, '')
        .replace(/\]/g, '')
        .trim()

      // Extraire les IDs valides avec correspondance exacte sur tokens (évite les faux positifs type "bip_c")
      const knownIds = sommaireUnifie.map(s => s.id)
      const knownIdsSet = new Set(knownIds.map(id => id.toLowerCase()))
      const tokens: string[] = Array.from(new Set<string>(
        responseClean
          .split(/[^a-z0-9_:-]+/g)
          .map((token: string) => token.trim())
          .filter(Boolean),
      ))

      idsFinals = (responseClean === 'aucune' || responseClean.includes('aucune section'))
        ? []
        : tokens.filter((token: string) => knownIdsSet.has(token))
    }

    // Si aucun ID valide trouvé, fallback sur recherche complète (1 chapitre)
    let contenuCible: string
    if (idsFinals.length === 0) {
      // Fallback : charger tout (ancien comportement)
      contenuCible = `
CHAPITRE 1 - LE TEMPS DE TRAVAIL :\n${(chapitres as Record<number, string>)[1] || ''}

CHAPITRE 2 - LES CONGÉS :\n${(chapitres as Record<number, string>)[2] || ''}

CHAPITRE 3 - AUTORISATIONS SPÉCIALES D'ABSENCE :\n${(chapitres as Record<number, string>)[3] || ''}

CHAPITRE 4 - LES ABSENCES POUR MALADIES ET ACCIDENTS :\n${(chapitres as Record<number, string>)[4] || ''}

RÈGLEMENT FORMATION :\n${formation || ''}

RIFSEEP ET PRIMES :\n${rifseepData || ''}

PROTOCOLE TÉLÉTRAVAIL :\n${typeof teletravailData === 'string' ? teletravailData : JSON.stringify(teletravailData)}`
    } else {
      // ÉTAPE 2 : Charger uniquement les sections identifiées
      contenuCible = await chargerContenuSections(idsFinals)
    }

    if (faqContexte) {
      contenuCible = `${contenuCible}\n\n=== FAQ INTERNES PERTINENTES ===\n${faqContexte}`.trim()
    }

    // Attendre les résultats PISTE Légifrance
    const pisteResults = await pistePromise
    let pisteContexte = ""
    if (pisteResults && pisteResults.length > 0) {
      pisteContexte = `\n\n=== RÉSULTATS DIRECTS API PISTE LÉGIFRANCE (DILA - TEMPS RÉEL) ===\n` +
        pisteResults.map((item, idx) => `${idx + 1}. [${item.title}] ${item.num || ''} (${item.nature || 'Texte'}) - État: ${item.etat || 'VIGUEUR'}\nLien: ${item.link || 'https://www.legifrance.gouv.fr'}`).join('\n')

      contenuCible += pisteContexte
    }

    const systemPromptSommaire = `
Tu es un assistant CFDT pour la Mairie de Gennevilliers.

RÈGLES STRICTES :
1. Réponds en utilisant les documents internes et les données réglementaires Légifrance fournies.
2. Sois précis sur les chiffres, statuts CGFP et délais statutaires.
3. Réponds comme un collègue syndical bienveillant et professionnel.
4. Ne mentionne JAMAIS [CHAPITRE X - ARTICLE Y] de manière brute. Réponds naturellement.

⚠️ RÈGLE CRITIQUE - INTERPRÈTE LA QUESTION :
- Si l'utilisateur demande "congés bonifiés" → cherche "congé bonifié" dans les documents
- Si l'utilisateur demande "école grève" → cherche "garde d'enfant", "école fermée", "grève"
- Fais des correspondances intelligentes entre les termes utilisés et le contenu des documents

⚠️ RÈGLE CRITIQUE - SI TU TROUVES L'INFO :
- Donne directement la réponse, sans dire "Je ne trouve pas"
- Cite les détails précis des documents ou des textes CGFP / Légifrance.
- Même si la question est mal formulée, tente de comprendre et répondre si possible

⚠️ RÈGLE CRITIQUE - SI TU NE TROUVES PAS L'INFO INTERNE :
- Si l'information n'est pas présente dans les documents internes, tente d'utiliser la section PISTE Légifrance si disponible.
- Sinon réponds UNIQUEMENT : "Je ne trouve pas cette information dans nos documents internes. Contactez la CFDT au 01 40 85 64 64."

DOCUMENTATION :
${contenuCible}
    `

    const normalizeNotFoundText = (text: string): string =>
      text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[.,;:!?]/g, '')
        .replace(/\s+/g, ' ')
        .trim()

    const isInternalNotFound = (text: string): boolean => {
      const normalized = normalizeNotFoundText(text)

      return normalized === "je ne trouve pas cette information dans nos documents internes contactez la cfdt au 01 40 85 64 64" ||
        normalized === "je ne trouve pas cette information dans nos documents internes contactez la cfdt au 01 40 85 64 64 pour plus de details"
    }

    const buildMessages = (systemPrompt: string) => [
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ]

    const reponseCore = await appelPerplexity(buildMessages(systemPromptSommaire))
    if (!isInternalNotFound(reponseCore)) {
      if (pisteResults && pisteResults.length > 0) {
        return `${reponseCore}\n\n⚡ *Source : API PISTE Légifrance (DILA) & Fonds Statutaire CGFP*`
      }
      return reponseCore
    }

    if (faqContexte) {
      const [faqFallback] = searchFAQ(question)
      if (faqFallback) {
        return faqFallback.answer
      }
    }

    const bipContexte = await genererContexteBip(question)
    if (bipContexte) {
      const systemPromptBip = `
Tu es un assistant CFDT pour la Mairie de Gennevilliers.

RÈGLES STRICTES :
1. Réponds UNIQUEMENT à partir des fiches BIP ci-dessous
2. Ne cherche JAMAIS sur internet, n'utilise JAMAIS tes connaissances externes
3. Donne une réponse directe et précise quand l'information est présente
4. Si des éléments factuels partiels sont présents (durées, délais, montants, conditions), réponds avec ces éléments au lieu de conclure à une absence d'information
5. Si l'information n'est pas présente dans les fiches BIP, réponds UNIQUEMENT :
"Je ne trouve pas cette information dans nos documents internes. Contactez la CFDT au 01 40 85 64 64."

FICHES BIP :
${bipContexte}
      `

      const reponseBip = await appelPerplexity(buildMessages(systemPromptBip))
      if (!isInternalNotFound(reponseBip)) {
        return reponseBip
      }

      const indicesFactuels = extraireIndicesFactuelsBip(question, bipContexte)
      if (indicesFactuels) {
        const systemPromptBipRenforce = `
Tu es un assistant CFDT pour la Mairie de Gennevilliers.

RÈGLES STRICTES :
1. Réponds UNIQUEMENT à partir des indices factuels ci-dessous
2. Si des durées chiffrées sont présentes, donne-les clairement
3. N'invente rien, ne complète pas avec des connaissances externes
4. Si malgré ces indices l'information manque, réponds UNIQUEMENT :
"Je ne trouve pas cette information dans nos documents internes. Contactez la CFDT au 01 40 85 64 64."

INDICES FACTUELS BIP :
${indicesFactuels}
        `

        const reponseBipRenforcee = await appelPerplexity(buildMessages(systemPromptBipRenforce))
        if (!isInternalNotFound(reponseBipRenforcee)) {
          return reponseBipRenforcee
        }
      }
    }

    // ⚡ Interrogation transparente Légifrance statutaire directe si les documents internes n'ont pas trouvé la réponse
    try {
      const reponseLegifranceAutomatique = await rechercherLegifrance(question)
      if (reponseLegifranceAutomatique && reponseLegifranceAutomatique.length > 30) {
        return `${reponseLegifranceAutomatique}\n\n⚡ *Source : API PISTE Légifrance (DILA) & Code Général de la Fonction Publique*`
      }
    } catch (err) {
      console.warn("[Légifrance Auto] Erreur:", err)
    }

    return "Je ne trouve pas cette information dans nos documents internes ni dans les textes statutaires Légifrance. Contactez la CFDT au 01 40 85 64 64."
  }


  const handleSendMessage = async () => {
    const question = inputValue.trim()
    if (!question || chatState.isProcessing) return
    const userMessage: ChatMessage = { type: "user", content: question, timestamp: new Date() }
    setChatState((prevState) => ({ ...prevState, messages: [...prevState.messages, userMessage], isProcessing: true }))
    setInputValue("")
    setShowExpandSearch(false)
    try {
      const reponseContent = await traiterQuestion(question)

      // Détecter STRICTEMENT la réponse de non-trouvaille (évite les faux positifs)
      const normalizedResponse = reponseContent
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[.,;:!?]/g, '')
        .replace(/\s+/g, ' ')
        .trim()

      const isNotFound =
        normalizedResponse === "je ne trouve pas cette information dans nos documents internes contactez la cfdt au 01 40 85 64 64" ||
        normalizedResponse === "je ne trouve pas cette information dans nos documents internes contactez la cfdt au 01 40 85 64 64 pour plus de details"

      if (isNotFound) {
        // Proposer d'élargir la recherche
        const assistantMessage: ChatMessage = {
          type: "assistant",
          content: "🔎 Il ne semble pas y avoir cette information dans les documents INTERNES de Gennevilliers.\n\nVoulez-vous que j'élargisse ma recherche dans le Code général de la fonction publique (Légifrance) ?",
          timestamp: new Date(),
        }
        setChatState((prevState) => ({ ...prevState, messages: [...prevState.messages, assistantMessage] }))
        setShowExpandSearch(true)
        setLastQuestion(question)
      } else {
        const assistantMessage: ChatMessage = { type: "assistant", content: reponseContent, timestamp: new Date() }
        setChatState((prevState) => ({ ...prevState, messages: [...prevState.messages, assistantMessage] }))
      }
    } catch (error) {
      console.error("Erreur lors du traitement de la question:", error)
      const errorMessage: ChatMessage = {
        type: "assistant",
        content:
          "Désolé, une erreur est survenue. Veuillez réessayer ou contacter un représentant si le problème persiste.",
        timestamp: new Date(),
      }
      setChatState((prevState) => ({ ...prevState, messages: [...prevState.messages, errorMessage] }))
    } finally {
      setChatState((prevState) => ({ ...prevState, isProcessing: false }))
    }
  }

  // --- RENDU DU COMPOSANT ---
  if (showLanding) {
    return (
      <Suspense fallback={<ViewLoader />}>
        <LandingPage
          theme="light"
          onEnter={() => setShowLanding(false)}
          onQuizz={() => {
            setShowLanding(false)
            setChatState(s => ({ ...s, currentView: 'faq' }))
          }}
        />
      </Suspense>
    )
  }

  return (
    <div
      className="min-h-screen relative overflow-x-clip dark:bg-slate-950"
      style={{
        background: theme === 'dark' ? undefined : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
      }}
    >
      <Toaster richColors position="bottom-right" closeButton theme={theme} />
      {/* Dark mode background gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-blue-950 to-slate-950 opacity-0 dark:opacity-100 pointer-events-none z-0 transition-opacity duration-300"></div>

      {/* Background image with transparency */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 pointer-events-none opacity-15 dark:opacity-5 transition-opacity duration-300"
        style={{ backgroundImage: `url('${BASE_URL}unnamed.jpg')` }}
      ></div>

      {/* Subtle overlay for better text readability */}
      <div className="fixed inset-0 bg-white/40 dark:bg-transparent z-0 pointer-events-none transition-colors duration-300"></div>

      {/* Orange geometric background shapes */}
      <OrangeGeometricBackground />

      {/* Couches de fond supplémentaires — supprimées (GPU layers plein écran) */}

      {/* BARRE DE MENUS STYLE MAC OS (ACTIVÉE VIA L'ICÔNE ORDINATEUR) */}
      {showMacMenuBar && (
        <MacMenuBar
          theme={theme}
          toggleTheme={toggleTheme}
          currentView={chatState.currentView}
          setView={(v) => setChatState(s => ({ ...s, currentView: v }))}
          openCalculator={(calc) => setActiveCalculator(calc)}
          onClose={() => setShowMacMenuBar(false)}
        />
      )}

      {/* HEADER PROFESSIONNEL MODERNE & DYNAMIQUE */}
      <header className={`relative bg-white/75 dark:bg-slate-950/75 border-b border-slate-200/30 dark:border-slate-800/30 shadow-sm dark:shadow-blue-950/10 z-30 transition-all duration-300 ${showMacMenuBar ? 'mt-7' : ''}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3 relative z-10">
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            {/* Logo et titre (Gauche) */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 group cursor-pointer" onClick={() => setShowLanding(true)}>
              <div className="relative">
                {/* Glow effect on hover (supprimé) */}
                {logoLoadError ? (
                  <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-orange-650 border border-white/20 shadow-md flex items-center justify-center relative transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
                    <span className="text-white font-black tracking-wider text-xs sm:text-lg">CFDT</span>
                  </div>
                ) : (
                  <img
                    src={`${BASE_URL}images/cfdt_logo_texte.png`}
                    alt="Logo CFDT S'engager pour chacun, Agir pour tous"
                    className="h-14 sm:h-28 w-auto object-contain relative"
                    onError={() => setLogoLoadError(true)}
                  />
                )}
              </div>

              <div className="flex flex-col justify-center">
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 dark:from-white dark:via-blue-100 dark:to-white transition-colors duration-300">
                  ATLAS
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.7)]"></span>
                  <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase">
                    Assistant syndical CFDT
                  </p>
                </div>
              </div>
            </div>

            {/* Ville & Description (Centre) */}
            <div className="hidden md:flex flex-col items-center justify-center flex-grow">
              <div className="relative group/badge inline-flex items-center justify-center">
                {/* Halo lumineux dégradé au survol */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-orange-500 rounded-full blur-md opacity-25 group-hover/badge:opacity-60 transition-opacity duration-500 animate-pulse"></div>

                <div className="relative flex items-center gap-3 px-6 py-2 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/80 shadow-lg shadow-blue-500/5 transition-all duration-300 hover:scale-[1.02] hover:border-blue-400/50">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-[0.25em] bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-950 to-slate-800 dark:from-white dark:via-blue-100 dark:to-white">
                    Mairie de Gennevilliers
                  </h2>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" title="Portail en ligne"></span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-semibold tracking-wide flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                Portail d'assistance RH & Statutaire — Agents Municipaux
              </p>
            </div>

            {/* Actions / Toggles (Droite) */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <button
                onClick={() => setShowMacMenuBar(prev => !prev)}
                className={`p-2 sm:p-2.5 rounded-xl border shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 ${showMacMenuBar
                  ? 'bg-blue-600 border-blue-600 text-white shadow-blue-500/20'
                  : 'bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-250 hover:bg-slate-50 dark:hover:bg-slate-800/90'
                  }`}
                title={showMacMenuBar ? "Désactiver la barre de menus macOS" : "Activer la barre de menus macOS"}
              >
                <Laptop className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 sm:p-2.5 rounded-xl bg-white/85 dark:bg-slate-900/85 border border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-250 hover:bg-slate-50 dark:hover:bg-slate-800/90 shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 hover:rotate-12"
                title="Basculer le thème"
              >
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- BANDEAU RSS DÉFILANT / ACTU --- */}
      <RssBandeau rssItems={rssItems} rssLoading={rssLoading} marqueeRef={rssMarqueeRef} />

      <main className="relative max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-1 z-10">
        {chatState.currentView === "menu" && (
          <>
            <div className="grid grid-cols-1 gap-4">
              <div className="lg:col-span-1">

                {/* Barre d'accès rapide style GAFAM / Frosted Glass Dock Ajustée avec précision */}
                <div className="max-w-7xl mx-auto mt-3 sm:mt-5 mb-5 sm:mb-7 bg-white/85 dark:bg-[#0E121D]/90 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-2.5 sm:p-4.5 border border-slate-200/80 dark:border-white/[0.1] shadow-xl shadow-slate-200/50 dark:shadow-black/60 flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 sm:gap-4">

                  {/* Links & Quick Actions avec ajustement précis */}
                  <div className="flex flex-1 justify-start sm:justify-around items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-1 px-1 sm:py-1.5 sm:px-2 relative snap-x snap-mandatory">
                    
                    {/* 1. Spotlight Search Button */}
                    <button
                      onClick={() => handleDomainSelection(0)}
                      className="relative flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 group min-w-[105px] sm:min-w-[140px] p-2.5 sm:p-3.5 rounded-2xl hover:-translate-y-1 shrink-0 snap-center"
                      onMouseEnter={() => setHoveredQuickAccessIndex(0)}
                      onMouseLeave={() => setHoveredQuickAccessIndex(null)}
                    >
                      <AnimatePresence>
                        {hoveredQuickAccessIndex === 0 && (
                          <motion.span
                            className="absolute inset-0 h-full w-full bg-purple-500/10 dark:bg-purple-500/15 block rounded-2xl z-0 border border-purple-500/25 shadow-sm pointer-events-none"
                            layoutId="quickAccessHover"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 0.15 } }}
                            exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.1 } }}
                          />
                        )}
                      </AnimatePresence>
                      <div className="relative z-10 p-2.5 sm:p-4.5 rounded-2xl bg-gradient-to-br from-purple-500/15 to-indigo-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-purple-500/25 transition-all duration-200">
                        <Bot className="w-8 h-8 sm:w-11 sm:h-11" />
                      </div>
                      <span className="relative z-10 text-xs sm:text-base font-extrabold text-center tracking-tight leading-tight">J'ai une<br />question</span>
                    </button>

                    {/* 2. Spotlight Metiers Button */}
                    <button
                      onClick={openMetiersView}
                      className="relative flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 group min-w-[105px] sm:min-w-[140px] p-2.5 sm:p-3.5 rounded-2xl hover:-translate-y-1 shrink-0 snap-center"
                      onMouseEnter={() => setHoveredQuickAccessIndex(1)}
                      onMouseLeave={() => setHoveredQuickAccessIndex(null)}
                    >
                      <AnimatePresence>
                        {hoveredQuickAccessIndex === 1 && (
                          <motion.span
                            className="absolute inset-0 h-full w-full bg-emerald-500/10 dark:bg-emerald-500/15 block rounded-2xl z-0 border border-emerald-500/25 shadow-sm pointer-events-none"
                            layoutId="quickAccessHover"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 0.15 } }}
                            exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.1 } }}
                          />
                        )}
                      </AnimatePresence>
                      <div className="relative z-10 p-2.5 sm:p-4.5 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-emerald-500/25 transition-all duration-200">
                        <LayoutGrid className="w-8 h-8 sm:w-11 sm:h-11" />
                      </div>
                      <span className="relative z-10 text-xs sm:text-base font-extrabold text-center tracking-tight leading-tight">Grilles<br />Indiciaires</span>
                    </button>

                    {/* 3. Spotlight Calculators Button */}
                    <button
                      onClick={openCalculatorsLanding}
                      className="relative flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200 group min-w-[105px] sm:min-w-[140px] p-2.5 sm:p-3.5 rounded-2xl hover:-translate-y-1 shrink-0 snap-center"
                      onMouseEnter={() => setHoveredQuickAccessIndex(2)}
                      onMouseLeave={() => setHoveredQuickAccessIndex(null)}
                    >
                      <AnimatePresence>
                        {hoveredQuickAccessIndex === 2 && (
                          <motion.span
                            className="absolute inset-0 h-full w-full bg-orange-500/10 dark:bg-orange-500/15 block rounded-2xl z-0 border border-orange-500/25 shadow-sm pointer-events-none"
                            layoutId="quickAccessHover"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 0.15 } }}
                            exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.1 } }}
                          />
                        )}
                      </AnimatePresence>
                      <div className="relative z-10 p-2.5 sm:p-4.5 rounded-2xl bg-gradient-to-br from-orange-500/15 to-amber-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-orange-500/25 transition-all duration-200">
                        <Calculator className="w-8 h-8 sm:w-11 sm:h-11" />
                      </div>
                      <span className="relative z-10 text-xs sm:text-base font-extrabold text-center tracking-tight leading-tight">Calculateurs<br />Primes</span>
                    </button>

                    {/* 4. Spotlight Espace Jeux Button */}
                    <button
                      onClick={() => setChatState({ ...chatState, currentView: 'jeux' })}
                      className="relative flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-200 hover:text-pink-600 dark:hover:text-pink-400 transition-all duration-200 group min-w-[105px] sm:min-w-[140px] p-2.5 sm:p-3.5 rounded-2xl hover:-translate-y-1 shrink-0 snap-center"
                      onMouseEnter={() => setHoveredQuickAccessIndex(3)}
                      onMouseLeave={() => setHoveredQuickAccessIndex(null)}
                    >
                      <AnimatePresence>
                        {hoveredQuickAccessIndex === 3 && (
                          <motion.span
                            className="absolute inset-0 h-full w-full bg-pink-500/10 dark:bg-pink-500/15 block rounded-2xl z-0 border border-pink-500/25 shadow-sm pointer-events-none"
                            layoutId="quickAccessHover"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 0.15 } }}
                            exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.1 } }}
                          />
                        )}
                      </AnimatePresence>
                      <div className="relative z-10 p-2.5 sm:p-4.5 rounded-2xl bg-gradient-to-br from-pink-500/15 to-rose-500/15 text-pink-600 dark:text-pink-400 border border-pink-500/30 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-pink-500/25 transition-all duration-200">
                        <Gamepad2 className="w-8 h-8 sm:w-11 sm:h-11" />
                      </div>
                      <span className="relative z-10 text-xs sm:text-base font-extrabold text-center tracking-tight leading-tight">Espace<br />Jeux RH</span>
                    </button>

                    {/* 5. Spotlight FAQ Button */}
                    <button
                      onClick={() => setChatState({ ...chatState, currentView: 'faq' })}
                      className="relative flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 transition-all duration-200 group min-w-[105px] sm:min-w-[140px] p-2.5 sm:p-3.5 rounded-2xl hover:-translate-y-1 shrink-0 snap-center"
                      onMouseEnter={() => setHoveredQuickAccessIndex(4)}
                      onMouseLeave={() => setHoveredQuickAccessIndex(null)}
                    >
                      <AnimatePresence>
                        {hoveredQuickAccessIndex === 4 && (
                          <motion.span
                            className="absolute inset-0 h-full w-full bg-amber-500/10 dark:bg-amber-500/15 block rounded-2xl z-0 border border-amber-500/25 shadow-sm pointer-events-none"
                            layoutId="quickAccessHover"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 0.15 } }}
                            exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.1 } }}
                          />
                        )}
                      </AnimatePresence>
                      <div className="relative z-10 p-2.5 sm:p-4.5 rounded-2xl bg-gradient-to-br from-amber-500/15 to-yellow-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-amber-500/25 transition-all duration-200">
                        <HelpCircle className="w-8 h-8 sm:w-11 sm:h-11" />
                      </div>
                      <span className="relative z-10 text-xs sm:text-base font-extrabold text-center tracking-tight leading-tight">Questions<br />Fréquentes</span>
                    </button>

                    {/* 6. Spotlight Podcasts Button */}
                    <button
                      onClick={() => setChatState({ ...chatState, currentView: 'podcasts' })}
                      className="relative flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 group min-w-[105px] sm:min-w-[140px] p-2.5 sm:p-3.5 rounded-2xl hover:-translate-y-1 shrink-0 snap-center"
                      onMouseEnter={() => setHoveredQuickAccessIndex(99)}
                      onMouseLeave={() => setHoveredQuickAccessIndex(null)}
                    >
                      <AnimatePresence>
                        {hoveredQuickAccessIndex === 99 && (
                          <motion.span
                            className="absolute inset-0 h-full w-full bg-indigo-500/10 dark:bg-indigo-500/15 block rounded-2xl z-0 border border-indigo-500/25 shadow-md pointer-events-none"
                            layoutId="quickAccessHover"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 0.15 } }}
                            exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.1 } }}
                          />
                        )}
                      </AnimatePresence>
                      <div className="relative z-10 p-2.5 sm:p-4.5 rounded-2xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-indigo-500/25 transition-all duration-200">
                        <Radio className="w-8 h-8 sm:w-11 sm:h-11" />
                      </div>
                      <span className="relative z-10 text-xs sm:text-base font-extrabold text-center tracking-tight leading-tight">Podcasts<br />RH</span>
                    </button>

                    {/* 7. Spotlight Bourse Emploi Anchor Link */}
                    <a
                      href="https://www.emploi-territorial.fr/emploi-mobilite/?search-col=99599"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200 group min-w-[105px] sm:min-w-[140px] p-2.5 sm:p-3.5 rounded-2xl hover:-translate-y-1 shrink-0 snap-center"
                      onMouseEnter={() => setHoveredQuickAccessIndex(5)}
                      onMouseLeave={() => setHoveredQuickAccessIndex(null)}
                    >
                      <AnimatePresence>
                        {hoveredQuickAccessIndex === 5 && (
                          <motion.span
                            className="absolute inset-0 h-full w-full bg-orange-500/10 dark:bg-orange-500/15 block rounded-2xl z-0 border border-orange-500/25 shadow-md pointer-events-none"
                            layoutId="quickAccessHover"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 0.15 } }}
                            exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.1 } }}
                          />
                        )}
                      </AnimatePresence>
                      <div className="relative z-10 p-2.5 sm:p-4.5 rounded-2xl bg-gradient-to-br from-orange-500/15 to-amber-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-orange-500/25 transition-all duration-200">
                        <Briefcase className="w-8 h-8 sm:w-11 sm:h-11" />
                      </div>
                      <span className="relative z-10 text-xs sm:text-base font-extrabold text-center tracking-tight leading-tight">Bourse<br />Emploi</span>
                    </a>

                    {/* 8. Spotlight Concours Anchor Link */}
                    <a
                      href="https://www.concours-territorial.fr/Index.aspx"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 group min-w-[105px] sm:min-w-[140px] p-2.5 sm:p-3.5 rounded-2xl hover:-translate-y-1 shrink-0 snap-center"
                      onMouseEnter={() => setHoveredQuickAccessIndex(6)}
                      onMouseLeave={() => setHoveredQuickAccessIndex(null)}
                    >
                      <AnimatePresence>
                        {hoveredQuickAccessIndex === 6 && (
                          <motion.span
                            className="absolute inset-0 h-full w-full bg-cyan-500/10 dark:bg-cyan-500/15 block rounded-2xl z-0 border border-cyan-500/25 shadow-md pointer-events-none"
                            layoutId="quickAccessHover"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 0.15 } }}
                            exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.1 } }}
                          />
                        )}
                      </AnimatePresence>
                      <div className="relative z-10 p-2.5 sm:p-4.5 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-blue-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-cyan-500/25 transition-all duration-200">
                        <GraduationCap className="w-8 h-8 sm:w-11 sm:h-11" />
                      </div>
                      <span className="relative z-10 text-xs sm:text-base font-extrabold text-center tracking-tight leading-tight">Concours<br />FPT</span>
                    </a>

                  </div>
                </div>

              </div>

              {/* --- FENÊTRE UNIQUE COMBINÉE : ACTUALITÉS SYNDICALES & VEILLE JURIDIQUE CÔTE À CÔTE --- */}
              <div className="mt-8 mb-8">
                <div className="w-full bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative z-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">

                    {/* CÔTÉ GAUCHE : Actualités Syndicales & Statutaires */}
                    <div className="lg:pr-8 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-4 mb-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/40 rounded-xl border border-blue-200 dark:border-blue-800 shadow-xs">
                              <Newspaper className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-wide">
                              Actualités <span className="text-blue-600 dark:text-blue-400">de tous les CIG/CDG</span>
                            </h3>
                          </div>
                        </div>

                        {/* Article principal Statutaire CIG */}
                        <div className="flex flex-col sm:flex-row gap-5 group/card">
                          <div className="relative w-full sm:w-48 h-36 overflow-hidden rounded-xl shrink-0 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                            <img loading="lazy" src="https://www.cig929394.fr/wp-content/uploads/2026/08/FOCUS-BIP_Actu-aout2026.png" alt="Retraites, congés de maladie et temps partiel thérapeutique" className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300" />
                            <span className="absolute top-2 left-2 inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-red-600 dark:text-red-400 border border-red-200 shadow-xs">
                              Statutaire CIG (Août 2026)
                            </span>
                          </div>
                          <div className="flex flex-col justify-between flex-1">
                            <div>
                              <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors leading-snug mb-2">
                                <a href="https://www.cig929394.fr/actualites/retraites-conges-de-maladie-et-temps-partiel-therapeutique-de-nouvelles-regles/" target="_blank" rel="noopener noreferrer">
                                  Retraites, congés de maladie et temps partiel thérapeutique : de nouvelles règles
                                </a>
                              </h4>
                              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                Nouvelles règles d'août et septembre 2026 : encadrement du temps partiel thérapeutique (réponse sous 30j, refus motivé), plafonnement des arrêts maladie (31j initial / 62j prolongation) et bonification retraite (1 trimestre/enfant).
                              </p>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                              <a
                                href="https://actu-cig-blue.vercel.app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs sm:text-sm bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-3.5 py-1.5 rounded-full border border-blue-200/80 dark:border-blue-800/80 transition-all duration-200 shadow-2xs hover:scale-105 active:scale-95 group/cig"
                              >
                                TOUS LES GIC
                                <ArrowRight className="w-3.5 h-3.5 text-blue-500 group-hover/cig:translate-x-0.5 transition-transform" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CÔTÉ DROIT : Veille Juridique */}
                    <div
                      onClick={() => setChatState({ ...chatState, currentView: 'veille' })}
                      className="lg:pl-8 pt-6 lg:pt-0 flex flex-col justify-between cursor-pointer group/veille"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2.5 bg-purple-100/60 dark:bg-purple-900/40 rounded-xl border border-purple-200 dark:border-purple-800/60 shadow-sm flex items-center justify-center">
                            <Scale className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                          </div>
                          <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-wide">
                            Veille <span className="text-purple-600 dark:text-purple-400">Juridique & Statutaire</span>
                          </h3>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5 mb-4 group/card">
                          <div className="relative w-full sm:w-48 h-36 overflow-hidden rounded-xl shrink-0 border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50">
                            <img loading="lazy" src="/images/legal_news_illustration.png" alt="Veille Juridique" className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300" />
                            <span className="absolute top-2 left-2 inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-900/80 text-purple-300 border border-purple-500/30">
                              Juridique
                            </span>
                          </div>
                          <div className="flex flex-col justify-between flex-1">
                            <div>
                              <h4 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 group-hover/veille:text-purple-600 dark:group-hover/veille:text-purple-400 transition-colors leading-snug mb-2">
                                Veille Juridique & Statutaire (« Vu cette semaine »)
                              </h4>
                              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                Découvrez notre veille juridique interactive. Explorez les dernières décisions des tribunaux administratifs et du Conseil d'État, ou testez vos connaissances dans notre Mode Défi Quiz !
                              </p>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                              <span className="font-semibold bg-purple-100/70 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs">
                                Veille CFDT Interactive
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              {/* --- SECTION SECONDAIRE : CARROUSELS DÉTACHÉS ET JOURNAL --- */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">

                {/* COLONNE CARROUSELS (3/4 largeur) */}
                <div className="lg:col-span-3 space-y-8">

                  {/* CARROUSEL 1 DÉTACHÉ : En direct de la CFDT Interco */}
                  <div className="w-full bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <Rss className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        En direct de la <span className="text-blue-600 dark:text-blue-400">CFDT Interco</span>
                      </h4>
                    </div>

                    {intercoLoading ? (
                      <div className="flex gap-4 overflow-hidden">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex-none w-48 h-32 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse border border-slate-200" />
                        ))}
                      </div>
                    ) : (
                      <div className="relative group/carousel">
                        <button
                          type="button"
                          aria-label="Défiler vers la gauche"
                          onClick={() => {
                            if (intercoCarouselRef.current) {
                              intercoCarouselRef.current.scrollBy({ left: -220, behavior: 'smooth' })
                            }
                          }}
                          className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-slate-200 flex items-center justify-center text-slate-700 shadow-lg opacity-80 sm:opacity-0 sm:group-hover/carousel:opacity-100 hover:opacity-100 hover:bg-white hover:scale-110 active:scale-95 transition-all duration-150"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          aria-label="Défiler vers la droite"
                          onClick={() => {
                            if (intercoCarouselRef.current) {
                              intercoCarouselRef.current.scrollBy({ left: 220, behavior: 'smooth' })
                            }
                          }}
                          className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-slate-200 flex items-center justify-center text-slate-700 shadow-lg opacity-80 sm:opacity-0 sm:group-hover/carousel:opacity-100 hover:opacity-100 hover:bg-white hover:scale-110 active:scale-95 transition-all duration-150"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        <div
                          ref={intercoCarouselRef}
                          className="flex gap-3 overflow-x-auto pb-2 scroll-smooth interco-carousel-track cursor-grab active:cursor-grabbing select-none"
                          style={{ scrollbarWidth: 'none' }}
                        >
                          {intercoNews.map((article, i) => {
                            const date = article.pubDate ? new Date(article.pubDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''
                            return (
                              <a
                                key={i}
                                href={article.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group/card flex-none w-52 sm:w-56 flex flex-col bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-xl overflow-hidden hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 shadow-xs"
                              >
                                <div className="relative w-full h-24 overflow-hidden bg-slate-50 dark:bg-slate-900 flex-shrink-0 border-b border-slate-100 dark:border-slate-800">
                                  <img
                                    src={article.imageUrl || `${BASE_URL}logo-cfdt.jpg`}
                                    alt={article.title}
                                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.onerror = null;
                                      target.src = `${BASE_URL}logo-cfdt.jpg`;
                                    }}
                                  />
                                  {article.category && (
                                    <span className="absolute top-1.5 left-1.5 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/95 dark:bg-slate-900/90 text-blue-700 dark:text-blue-300 border border-blue-200 shadow-xs">
                                      {article.category}
                                    </span>
                                  )}
                                </div>

                                <div className="p-3.5 flex flex-col justify-between flex-grow bg-white dark:bg-slate-800">
                                  <p className="text-slate-900 dark:text-white font-bold text-sm leading-snug group-hover/card:text-blue-600 transition-colors duration-150 line-clamp-2">
                                    {article.title}
                                  </p>
                                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                                    <span className="text-xs text-slate-500 font-medium">{date}</span>
                                    <span className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-0.5 opacity-90 group-hover/card:opacity-100 transition-opacity duration-150">
                                      Lire <ArrowRight className="w-3 h-3" />
                                    </span>
                                  </div>
                                </div>
                              </a>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CARROUSEL 2 : Actualités de la Fonction Publique */}
                  <div className="w-full bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                        <Landmark className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-wide">
                        Actualités de la <span className="text-emerald-600 dark:text-emerald-400">Fonction Publique</span>
                      </h3>
                    </div>

                    {fpLoading ? (
                      <div className="flex gap-4 overflow-hidden">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex-none w-48 h-32 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse border border-slate-200" />
                        ))}
                      </div>
                    ) : (
                      <div className="relative group/carousel-fp">
                        <button
                          type="button"
                          aria-label="Défiler vers la gauche"
                          onClick={() => {
                            if (fpCarouselRef.current) {
                              fpCarouselRef.current.scrollBy({ left: -220, behavior: 'smooth' })
                            }
                          }}
                          className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-slate-200 flex items-center justify-center text-slate-700 shadow-lg opacity-80 sm:opacity-0 sm:group-hover/carousel-fp:opacity-100 hover:opacity-100 hover:bg-white hover:scale-110 active:scale-95 transition-all duration-150"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          aria-label="Défiler vers la droite"
                          onClick={() => {
                            if (fpCarouselRef.current) {
                              fpCarouselRef.current.scrollBy({ left: 220, behavior: 'smooth' })
                            }
                          }}
                          className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-slate-200 flex items-center justify-center text-slate-700 shadow-lg opacity-80 sm:opacity-0 sm:group-hover/carousel-fp:opacity-100 hover:opacity-100 hover:bg-white hover:scale-110 active:scale-95 transition-all duration-150"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        <div
                          ref={fpCarouselRef}
                          className="flex gap-3 overflow-x-auto pb-2 scroll-smooth interco-carousel-track cursor-grab active:cursor-grabbing select-none"
                          style={{ scrollbarWidth: 'none' }}
                        >
                          {fpNews.map((article, i) => (
                            <a
                              key={i}
                              href={article.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/card flex-none w-52 sm:w-56 flex flex-col bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-xl overflow-hidden hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 shadow-xs"
                            >
                              <div className="relative w-full h-24 overflow-hidden bg-slate-50 dark:bg-slate-900 flex-shrink-0 border-b border-slate-100 dark:border-slate-800 p-2 flex items-center justify-center">
                                {article.imageUrl ? (
                                  <img
                                    src={article.imageUrl}
                                    alt={article.title}
                                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300 absolute inset-0"
                                  />
                                ) : (
                                  <div className="text-emerald-500 opacity-50">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
                                  </div>
                                )}
                                <span className="absolute top-1.5 left-1.5 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/95 dark:bg-slate-900/90 text-emerald-700 dark:text-emerald-300 border border-emerald-200 shadow-xs z-10 max-w-[90%] truncate">
                                  {article.category || 'Actualité'}
                                </span>
                              </div>

                              <div className="p-3.5 flex flex-col justify-between flex-grow bg-white dark:bg-slate-800">
                                <p className="text-slate-900 dark:text-white font-bold text-sm leading-snug group-hover/card:text-emerald-600 transition-colors duration-150 line-clamp-2">
                                  {article.title}
                                </p>
                                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                                  <span className="text-xs text-slate-500 font-medium truncate pr-2">
                                    {new Date(article.pubDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                  </span>
                                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                                    Lire <ArrowRight className="w-3 h-3" />
                                  </span>
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* COLONNE DROITE (1/4 largeur) : LE JOURNAL CFDT (À LIRE) */}
                <div className="lg:col-span-1 bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative z-10 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-wide">
                        À lire
                      </h3>
                    </div>

                    <div className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-md hover:border-orange-400 transition-all duration-300 flex flex-col">
                      <a
                        href="https://intranet.ville-gennevilliers.fr/Statics/media/syndicats/cfdt/journaux/journal-gennevilliers-printemps-2026.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col h-full"
                      >
                        <div className="overflow-hidden rounded-xl shadow-sm mb-4 relative h-80 sm:h-[22rem] border border-slate-100 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                          <img
                            src={`${BASE_URL}journal-2026.png`}
                            alt="Journal CFDT Printemps 2026"
                            className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex flex-col shrink-0">
                          <h4 className="text-slate-900 dark:text-white text-base font-bold mb-1 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-orange-500 shrink-0" />
                          </h4>
                          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 leading-relaxed font-medium">
                            Découvrez la dernière édition de l'Écho de la CFDT.
                          </p>
                          <div className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all text-sm">
                            Télécharger (PDF)
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>

              </div>

              {/* --- SECTION DES 3 FENÊTRES : À CONNAÎTRE, LIENS UTILES, À VOIR --- */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 w-full mb-12">

                {/* Colonne 1 : À connaître (Docs de référence) */}
                <div className="w-full bg-gradient-to-br from-white/95 via-rose-50/50 to-pink-50/30 dark:from-slate-900/95 dark:via-rose-950/20 dark:to-slate-900/95 rounded-3xl p-6 border-2 border-rose-200/80 dark:border-rose-800/40 shadow-2xl shadow-rose-500/10 transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-rose-500/20 hover:border-rose-300 relative z-10 flex flex-col justify-between group">
                  <div>
                    {/* Header de la carte */}
                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-rose-100/80 dark:border-rose-900/40">
                      <div className="flex items-center gap-3.5">
                        <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-2xl shadow-lg shadow-rose-500/30 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">À connaître</h3>
                            <span className="bg-rose-500/10 border border-rose-400/30 text-rose-600 dark:text-rose-400 text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                              Docs Officiels
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Règlements & chartes de la collectivité</p>
                        </div>
                      </div>
                    </div>

                    {/* Liste des documents */}
                    <div className="flex flex-col gap-3.5">
                      {/* Document 1 : Temps de travail */}
                      <a
                        href="https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_humaines/temps_de_travail_conges_absences/reglement_temps_de_travail/reglement_du_temps_du_travail.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/item relative bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 border border-rose-100 dark:border-slate-700 hover:border-rose-300 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-rose-500 to-orange-400 opacity-80 group-hover/item:opacity-100 transition-opacity" />
                        <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 p-2 flex items-center justify-center shadow-inner border border-rose-100/60 dark:border-slate-700 relative group-hover/item:scale-105 transition-transform duration-300">
                          <Clock className="w-6 h-6 text-rose-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/40 px-2 py-0.5 rounded-md border border-rose-200/50 dark:border-rose-800/50">
                              1607H & Congés
                            </span>
                          </div>
                          <h4 className="font-black text-slate-900 dark:text-white text-base sm:text-lg leading-snug group-hover/item:text-rose-600 transition-colors truncate">
                            Temps de travail
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-1 font-medium">
                            Règlement complet sur le temps de travail.
                          </p>
                        </div>
                        <div className="flex-shrink-0 p-2 rounded-xl bg-rose-50 dark:bg-rose-900/40 group-hover/item:bg-rose-500 text-rose-500 group-hover/item:text-white transition-all shadow-sm">
                          <ExternalLinkIcon className="w-4 h-4" />
                        </div>
                      </a>

                      {/* Document 2 : Formation */}
                      <a
                        href="https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_humaines/formation/reglement_interieur_de_formation_juin_2025.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/item relative bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 border border-teal-100 dark:border-slate-700 hover:border-teal-300 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-teal-500 to-emerald-400 opacity-80 group-hover/item:opacity-100 transition-opacity" />
                        <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 p-2 flex items-center justify-center shadow-inner border border-teal-100/60 dark:border-slate-700 relative group-hover/item:scale-105 transition-transform duration-300">
                          <GraduationCap className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-black uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/40 px-2 py-0.5 rounded-md border border-teal-200/50 dark:border-teal-800/50">
                              Mise à jour Juin 2025
                            </span>
                          </div>
                          <h4 className="font-black text-slate-900 dark:text-white text-base sm:text-lg leading-snug group-hover/item:text-teal-600 transition-colors truncate">
                            Règlement Formation
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-1 font-medium">
                            Règlement intérieur des formations & CPF.
                          </p>
                        </div>
                        <div className="flex-shrink-0 p-2 rounded-xl bg-teal-50 dark:bg-teal-900/40 group-hover/item:bg-teal-600 text-teal-600 group-hover/item:text-white transition-all shadow-sm">
                          <ExternalLinkIcon className="w-4 h-4" />
                        </div>
                      </a>

                      {/* Document 3 : Télétravail */}
                      <a
                        href="https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_humaines/teletravail/circulaire_evolution_du_teletravail_juin_2023.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/item relative bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 border border-blue-100 dark:border-slate-700 hover:border-blue-300 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500 to-indigo-500 opacity-80 group-hover/item:opacity-100 transition-opacity" />
                        <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 p-2 flex items-center justify-center shadow-inner border border-blue-100/60 dark:border-slate-700 relative group-hover/item:scale-105 transition-transform duration-300">
                          <Laptop className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-md border border-blue-200/50 dark:border-blue-800/50">
                              Charte & Accords
                            </span>
                          </div>
                          <h4 className="font-black text-slate-900 dark:text-white text-base sm:text-lg leading-snug group-hover/item:text-blue-600 transition-colors truncate">
                            Charte Télétravail
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-1 font-medium">
                            Circulaire et évolutions du travail à distance.
                          </p>
                        </div>
                        <div className="flex-shrink-0 p-2 rounded-xl bg-blue-50 dark:bg-blue-900/40 group-hover/item:bg-blue-600 text-blue-600 group-hover/item:text-white transition-all shadow-sm">
                          <ExternalLinkIcon className="w-4 h-4" />
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* Pied de carte */}
                  <div className="mt-4 pt-3 border-t border-rose-100/60 dark:border-rose-900/40 flex items-center justify-between text-xs sm:text-sm text-rose-700 dark:text-rose-400 font-extrabold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                      Documents PDF certifiés RH
                    </span>
                    <span className="text-xs text-slate-400 font-normal">Intranet Ville</span>
                  </div>
                </div>

                {/* Colonne 3 : À voir (YouTube RH) */}
                <div className="w-full bg-gradient-to-br from-white/95 via-amber-50/50 to-yellow-50/30 dark:from-slate-900/95 dark:via-amber-950/20 dark:to-slate-900/95 rounded-3xl p-6 border-2 border-amber-200/80 dark:border-amber-800/40 shadow-2xl shadow-amber-500/10 transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-amber-500/20 hover:border-amber-300 relative z-10 flex flex-col justify-between group">
                  <div>
                    {/* Header de la carte */}
                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-amber-100/80 dark:border-amber-900/40">
                      <div className="flex items-center gap-3.5">
                        <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-500 text-slate-950 rounded-2xl shadow-lg shadow-amber-500/30 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                          <PlayCircle className="w-6 h-6 fill-current" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">À voir</h3>
                            <span className="bg-amber-500/10 border border-amber-400/30 text-amber-700 dark:text-amber-300 text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                              YouTube RH
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Vidéos & préparation aux concours FPT</p>
                        </div>
                      </div>
                    </div>

                    {/* Liste des vidéos */}
                    <div className="flex flex-col gap-3.5">
                      {/* Vidéo 1 */}
                      <a
                        href="https://youtu.be/7clMZoElV9o?si=tFlkNao1VyFKrDzC"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/item relative bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 border border-amber-100 dark:border-slate-700 hover:border-amber-300 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-3.5 overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-500 to-yellow-400 opacity-80 group-hover/item:opacity-100 transition-opacity" />
                        <div className="w-16 h-12 flex-shrink-0 rounded-xl bg-slate-900 overflow-hidden relative shadow-md border border-slate-200 dark:border-slate-700 group-hover/item:scale-105 transition-transform duration-300">
                          <img loading="lazy" src="https://img.youtube.com/vi/7clMZoElV9o/hqdefault.jpg" alt="Les 50 acronymes indispensables" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover/item:bg-black/20 transition-colors">
                            <PlayCircle className="w-5 h-5 text-white drop-shadow-lg group-hover/item:scale-110 transition-transform" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/40 px-2 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-800/50">
                              Sigles & Concours
                            </span>
                          </div>
                          <h4 className="font-black text-slate-900 dark:text-white text-base sm:text-lg leading-snug group-hover/item:text-amber-600 transition-colors truncate">
                            Les 50 acronymes
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-1 font-medium">
                            Décoder les sigles clés des concours.
                          </p>
                        </div>
                        <div className="flex-shrink-0 p-2 rounded-xl bg-amber-50 dark:bg-amber-900/40 group-hover/item:bg-amber-500 text-amber-600 group-hover/item:text-slate-950 transition-all shadow-sm">
                          <ExternalLinkIcon className="w-4 h-4" />
                        </div>
                      </a>

                      {/* Vidéo 2 */}
                      <a
                        href="https://www.youtube.com/watch?v=z0mVMJHO8GA"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/item relative bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 border border-amber-100 dark:border-slate-700 hover:border-amber-300 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-3.5 overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-500 to-yellow-400 opacity-80 group-hover/item:opacity-100 transition-opacity" />
                        <div className="w-16 h-12 flex-shrink-0 rounded-xl bg-slate-900 overflow-hidden relative shadow-md border border-slate-200 dark:border-slate-700 group-hover/item:scale-105 transition-transform duration-300">
                          <img loading="lazy" src="https://img.youtube.com/vi/z0mVMJHO8GA/hqdefault.jpg" alt="150 Questions-Réponses Oral" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover/item:bg-black/20 transition-colors">
                            <PlayCircle className="w-5 h-5 text-white drop-shadow-lg group-hover/item:scale-110 transition-transform" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/40 px-2 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-800/50">
                              Préparation Jury
                            </span>
                          </div>
                          <h4 className="font-black text-slate-900 dark:text-white text-base sm:text-lg leading-snug group-hover/item:text-amber-600 transition-colors truncate">
                            150 Questions Oral
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-1 font-medium">
                            Entraînement complet aux entretiens.
                          </p>
                        </div>
                        <div className="flex-shrink-0 p-2 rounded-xl bg-amber-50 dark:bg-amber-900/40 group-hover/item:bg-amber-500 text-amber-600 group-hover/item:text-slate-950 transition-all shadow-sm">
                          <ExternalLinkIcon className="w-4 h-4" />
                        </div>
                      </a>

                      {/* Vidéo 3 */}
                      <a
                        href="https://www.youtube.com/watch?v=m9Nirxu_wFk"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/item relative bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 border border-amber-100 dark:border-slate-700 hover:border-amber-300 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-3.5 overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-500 to-yellow-400 opacity-80 group-hover/item:opacity-100 transition-opacity" />
                        <div className="w-16 h-12 flex-shrink-0 rounded-xl bg-slate-900 overflow-hidden relative shadow-md border border-slate-200 dark:border-slate-700 group-hover/item:scale-105 transition-transform duration-300">
                          <img loading="lazy" src="https://img.youtube.com/vi/m9Nirxu_wFk/hqdefault.jpg" alt="30 Situations Oral" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover/item:bg-black/20 transition-colors">
                            <PlayCircle className="w-5 h-5 text-white drop-shadow-lg group-hover/item:scale-110 transition-transform" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/40 px-2 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-800/50">
                              Cas Pratiques
                            </span>
                          </div>
                          <h4 className="font-black text-slate-900 dark:text-white text-base sm:text-lg leading-snug group-hover/item:text-amber-600 transition-colors truncate">
                            30 Mises en situation
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-1 font-medium">
                            Cas pratiques et mises en situation.
                          </p>
                        </div>
                        <div className="flex-shrink-0 p-2 rounded-xl bg-amber-50 dark:bg-amber-900/40 group-hover/item:bg-amber-500 text-amber-600 group-hover/item:text-slate-950 transition-all shadow-sm">
                          <ExternalLinkIcon className="w-4 h-4" />
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* Pied de carte */}
                  <div className="mt-4 pt-3 border-t border-amber-100/60 dark:border-amber-900/40 flex items-center justify-between text-xs sm:text-sm text-amber-800 dark:text-amber-300 font-extrabold">
                    <a
                      href="https://www.youtube.com/results?search_query=fonction+publique+territoriale"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 hover:text-amber-900 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Voir plus sur YouTube
                    </a>
                    <ExternalLinkIcon className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                </div>

                {/* Colonne 2 : Liens utiles */}
                <div className="w-full bg-gradient-to-br from-white/95 via-cyan-50/50 to-sky-50/30 dark:from-slate-900/95 dark:via-cyan-950/20 dark:to-slate-900/95 rounded-3xl p-6 border-2 border-cyan-200/80 dark:border-cyan-800/40 shadow-2xl shadow-cyan-500/10 transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-cyan-500/20 hover:border-cyan-300 relative z-10 flex flex-col justify-between group overflow-hidden">
                  <BorderBeam size={160} duration={8} delay={0} colorFrom="#06b6d4" colorTo="#3b82f6" />
                  <div>
                    {/* Header de la carte */}
                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-cyan-100/80 dark:border-cyan-900/40">
                      <div className="flex items-center gap-3.5">
                        <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-2xl shadow-lg shadow-cyan-500/30 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                          <Link2 className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Liens Utiles</h3>
                            <span className="bg-cyan-500/10 border border-cyan-400/30 text-cyan-700 dark:text-cyan-400 text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                              Portails RH
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Bases de données & sites institutionnels</p>
                        </div>
                      </div>
                    </div>

                    {/* Liste des liens utiles */}
                    <div className="flex flex-col gap-3">
                      {usefulLinks.map(({ label, href, imageSrc }, idx) => {
                        const linkDetails = [
                          { tag: "DÉCISIONS & JURISPRUDENCE", desc: "Décisions et arrêts du Conseil d'État" },
                          { tag: "TEXTES & CODES DE LOI", desc: "Code Général de la Fonction Publique (CGFP)" },
                          { tag: "CATALOGUE RÉGIONAL", desc: "Offre complète de formation CNFPT" },
                          { tag: "RÉGIME INDEMNITAIRE", desc: "Guide récapitulatif des primes 2025" }
                        ][idx] || { tag: "PORTAIL OFFICIEL", desc: "Site institutionnel de référence" };

                        return (
                          <a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/item relative bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 border border-cyan-100 dark:border-slate-700 hover:border-cyan-300 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-3.5 overflow-hidden"
                          >
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-cyan-500 to-blue-500 opacity-80 group-hover/item:opacity-100 transition-opacity" />
                            <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-1 flex items-center justify-center shadow-inner border border-cyan-100/60 dark:border-slate-700 relative group-hover/item:scale-105 transition-transform duration-300">
                              <img loading="lazy" src={imageSrc} alt={label} className="w-full h-full object-contain rounded-lg" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-900/40 px-2 py-0.5 rounded-md border border-cyan-200/50 dark:border-cyan-800/50">
                                  {linkDetails.tag}
                                </span>
                              </div>
                              <h4 className="font-black text-slate-900 dark:text-white text-base sm:text-lg leading-snug group-hover/item:text-cyan-600 transition-colors truncate">
                                {label}
                              </h4>
                              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-1 font-medium">
                                {linkDetails.desc}
                              </p>
                            </div>
                            <div className="flex-shrink-0 p-2 rounded-xl bg-cyan-50 dark:bg-cyan-900/40 group-hover/item:bg-cyan-600 text-cyan-600 group-hover/item:text-white transition-all shadow-sm">
                              <ExternalLinkIcon className="w-4 h-4" />
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pied de carte */}
                  <div className="mt-4 pt-3 border-t border-cyan-100/60 dark:border-cyan-900/40 flex items-center justify-between text-xs sm:text-sm text-cyan-800 dark:text-cyan-300 font-extrabold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                      Accès direct sécurisé
                    </span>
                    <span className="text-xs text-slate-400 font-normal">Sites externes certifiés</span>
                  </div>
                </div>

              </div>

            </div>
          </>
        )}
      </main>

      {/* --- SECTION GRILLES INDICIAIRES / MÉTIERS --- */}
      {chatState.currentView === 'metiers' && (
        <Suspense fallback={<ViewLoader />}>
          <Metiers onClose={() => setChatState({ ...chatState, currentView: 'menu' })} />
        </Suspense>
      )}

      {/* --- SECTION FAQ --- */}
      {chatState.currentView === 'faq' && (
        <Suspense fallback={<ViewLoader />}>
          <FAQ onBack={() => setChatState({ ...chatState, currentView: 'menu' })} />
        </Suspense>
      )}

      {/* --- SECTION JEUX / PORTAIL ESPACE JEUX --- */}
      {chatState.currentView === 'jeux' && (
        <Suspense fallback={<ViewLoader />}>
          <EspaceJeux onClose={() => setChatState({ ...chatState, currentView: 'menu' })} theme={theme} />
        </Suspense>
      )}

      {/* --- SECTION ACTUALITES --- */}
      {chatState.currentView === 'actualites' && (
        <Suspense fallback={<ViewLoader />}>
          <Actualites
            news={intercoNews}
            onClose={() => setChatState({ ...chatState, currentView: 'menu' })}
            baseUrl={BASE_URL}
          />
        </Suspense>
      )}

      {/* --- SECTION VEILLE JURIDIQUE --- */}
      {chatState.currentView === 'veille' && (
        <Suspense fallback={<ViewLoader />}>
          <VeilleJuridique onClose={() => setChatState({ ...chatState, currentView: 'menu' })} />
        </Suspense>
      )}

      {chatState.currentView === 'podcasts' && (
        <Suspense fallback={<ViewLoader />}>
          <EspacePodcastsFigurines onClose={() => setChatState({ ...chatState, currentView: 'menu' })} theme={theme} />
        </Suspense>
      )}

      {/* --- SECTION CALCULATEURS FULL-WIDTH --- */}
      {chatState.currentView === 'calculators' && (
        <section className="fixed inset-0 z-[60] overflow-y-auto overflow-x-hidden overscroll-contain bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-950 dark:to-slate-900">
          {/* Header */}
          <div className="sticky top-0 bg-white/95 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700/50 shadow-sm z-30 glass-banner">
            <div className="max-w-6xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    if (activeCalculator) {
                      setActiveCalculator(null)
                    } else {
                      setChatState({ ...chatState, currentView: 'menu' })
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-red-500/30 transition-all duration-200 group shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>{activeCalculator ? 'Retour aux calculateurs' : 'Retour au menu'}</span>
                </button>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Calculateurs CFDT</h2>
              </div>
            </div>
          </div>

          {/* Page d'accueil avec les 3 icônes */}
          {!activeCalculator && (
            <div className="max-w-6xl mx-auto px-4 py-12 calc-landing-enter">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Choisissez un calculateur</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium dark:font-normal">Cliquez sur une icône pour accéder au calculateur</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Carte CIA */}
                <button
                  onClick={() => openCalculator('cia')}
                  className="group relative bg-white dark:bg-slate-800/80 border border-orange-200 dark:border-orange-500/20 rounded-2xl p-8 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg dark:hover:shadow-orange-500/10 hover:border-orange-300 dark:hover:border-orange-500/40"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 dark:from-orange-500/5 via-transparent to-amber-50/50 dark:to-amber-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="p-6 bg-gradient-to-br from-orange-100 dark:from-slate-900/80 to-amber-100 dark:to-slate-800/80 rounded-2xl shadow-sm border border-orange-200 dark:border-orange-500/30">
                      <Calculator className="w-16 h-16 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-800 dark:text-white">CIA</h4>
                    <p className="text-center text-slate-500 dark:text-slate-400 font-medium dark:font-normal text-sm">Complément Indemnitaire Annuel - Simulez votre prime CIA</p>
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-bold dark:font-semibold">
                      <span className="text-sm">Ouvrir le calculateur</span>
                    </div>
                  </div>
                </button>

                {/* Carte 13ème Mois */}
                <button
                  onClick={() => openCalculator('13eme')}
                  className="group relative bg-white dark:bg-slate-800/80 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-8 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg dark:hover:shadow-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-500/40"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 dark:from-emerald-500/5 via-transparent to-green-50/50 dark:to-green-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="p-6 bg-gradient-to-br from-emerald-100 dark:from-slate-900/80 to-green-100 dark:to-slate-800/80 rounded-2xl shadow-sm border border-emerald-200 dark:border-emerald-500/30">
                      <DollarSign className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-800 dark:text-white">13ème Mois</h4>
                    <p className="text-center text-slate-500 dark:text-slate-400 font-medium dark:font-normal text-sm">Calculez votre prime de 13ème mois selon votre situation</p>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold dark:font-semibold">
                      <span className="text-sm">Ouvrir le calculateur</span>
                    </div>
                  </div>
                </button>

                {/* Carte Primes IFSE */}
                <button
                  onClick={() => openCalculator('primes')}
                  className="group relative bg-white dark:bg-slate-800/80 border border-cyan-200 dark:border-cyan-500/20 rounded-2xl p-8 shadow-sm hover:shadow-lg dark:hover:shadow-cyan-500/10 hover:border-cyan-300 dark:hover:border-cyan-500/40 hover:scale-105 hover:-translate-y-2 transition-transform duration-150"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 dark:from-cyan-500/5 via-transparent to-blue-50/50 dark:to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-2xl"></div>
                  <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="p-6 bg-gradient-to-br from-cyan-100 dark:from-slate-900/80 to-blue-100 dark:to-slate-800/80 rounded-2xl shadow-sm border border-cyan-200 dark:border-cyan-500/30">
                      <TrendingUp className="w-16 h-16 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-800 dark:text-white">Primes IFSE</h4>
                    <p className="text-center text-slate-500 dark:text-slate-400 font-medium dark:font-normal text-sm">Estimez vos primes mensuelles avec l'IFSE</p>
                    <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold dark:font-semibold">
                      <span className="text-sm">Ouvrir le calculateur</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Contenu du calculateur sélectionné */}
          {activeCalculator === 'primes' && (
            <Suspense fallback={<ViewLoader />}>
              <div className="calc-tool-enter"><CalculateurPrimesV2 onClose={() => setActiveCalculator(null)} /></div>
            </Suspense>
          )}
          {activeCalculator === 'cia' && (
            <Suspense fallback={<ViewLoader />}>
              <div className="calc-tool-enter"><CalculateurCIAV2 onClose={() => setActiveCalculator(null)} /></div>
            </Suspense>
          )}
          {activeCalculator === '13eme' && (
            <Suspense fallback={<ViewLoader />}>
              <div className="calc-tool-enter"><Calculateur13emeV2 onClose={() => setActiveCalculator(null)} /></div>
            </Suspense>
          )}
        </section>
      )}

      <main className="relative max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-2 z-10">
        {chatState.currentView === "chat" && (
          <LuxuryChat
            theme={theme}
            messages={chatState.messages}
            inputValue={inputValue}
            isProcessing={chatState.isProcessing}
            showExpandSearch={showExpandSearch}
            onInputChange={(val) => setInputValue(val)}
            onSendMessage={handleSendMessage}
            onReturnToMenu={returnToMenu}
            onExpandSearch={handleExpandSearch}
            onDeclineSearch={handleDeclineSearch}
          />
        )}
      </main>

      {chatState.currentView === "menu" && selectedInfo && (
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 pb-6">
          <div className="max-w-full mx-auto">
            <section className="info-detail bg-gradient-to-br from-slate-800/80 via-purple-900/80 to-slate-800/80 p-8 rounded-2xl shadow-xl border border-purple-500/30 max-w-4xl mx-auto hover:shadow-xl transition-shadow glass-card">
              <h3 className="text-3xl font-light bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">{selectedInfo.title}</h3>
              <p className="text-slate-200 leading-relaxed">{selectedInfo.content}</p>
              <button
                onClick={() => setSelectedInfo(null)}
                className="mt-6 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Fermer
              </button>
            </section>
          </div>
        </section>
      )}

      {/* Bandeau NEWS FPT */}
      <section className="relative bg-gradient-to-r from-orange-600/90 via-red-600/90 to-pink-600/90 text-white overflow-hidden w-full shadow-lg border-b border-orange-400/30 z-10 glass-banner marquee-pausable banner-top-streak">
        <div className="relative h-11 sm:h-14 flex items-center overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-20 sm:w-32 flex items-center justify-center bg-gradient-to-r from-orange-700 to-red-700 z-20 shadow-lg glass-pill news-pill-glow">
            <span className="text-xs sm:text-base font-semibold tracking-wide text-white">NEWS:</span>
          </div>
          <div ref={newsMarqueeRef} className="marquee-track animate-marquee pl-24 sm:pl-36">
            <div className="marquee-group">
              {infoItems.map((info, index) => (
                <React.Fragment key={`news-a-${info.id}-${index}`}>
                  <span className={`marquee-diamond${index % 3 === 0 ? ' marquee-diamond-twinkle' : ''}`} aria-hidden="true" />
                  <button
                    onClick={() => handleInfoClick(info)}
                    className="text-xs sm:text-base font-medium mx-2.5 sm:mx-4 hover:text-amber-200 cursor-pointer hover:scale-105 text-white transition-transform duration-100"
                  >
                    {info.title}
                  </button>
                </React.Fragment>
              ))}
            </div>
            <div className="marquee-group">
              {infoItems.map((info, index) => (
                <React.Fragment key={`news-b-${info.id}-${index}`}>
                  <span className={`marquee-diamond${index % 3 === 0 ? ' marquee-diamond-twinkle' : ''}`} aria-hidden="true" />
                  <button
                    onClick={() => handleInfoClick(info)}
                    className="text-xs sm:text-base font-medium mx-2.5 sm:mx-4 hover:text-amber-200 cursor-pointer hover:scale-105 text-white transition-transform duration-100"
                  >
                    {info.title}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer
        className="relative text-slate-200 text-center py-3 mt-0 z-10 border-t border-orange-500/20 glass-banner footer-glass"
        style={{
          backgroundImage: `
            linear-gradient(to right, 
              rgba(15, 23, 42, 0.85), 
              rgba(194, 65, 12, 0.85), 
              rgba(15, 23, 42, 0.85)
            ),
            url('${BASE_URL}mairie.jpeg')
          `,
          backgroundPosition: 'center bottom',
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-center items-center gap-2 mb-4 mt-2">
            <img
              src={`${BASE_URL}images/votez_cfdt.png`}
              alt="Votre Voix Notre Action - Votez CFDT"
              className="h-24 sm:h-32 w-auto object-contain drop-shadow-lg"
            />
          </div>
          <div className="flex justify-center items-center gap-2 mb-3">
            <span className="text-orange-300 font-bold text-lg tracking-wide">CFDT Gennevilliers</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 mb-3">
            <a
              href="tel:0140856464"
              className="flex items-center gap-2 text-orange-200 hover:text-white transition-all duration-200 hover:scale-105 font-semibold text-base"
            >
              <Phone className="w-5 h-5 text-orange-300" />
              <span>01 40 85 64 64</span>
            </a>
            <a
              href="mailto:cfdt-interco@ville-gennevilliers.fr"
              className="flex items-center gap-2 text-orange-200 hover:text-white transition-all duration-200 hover:scale-105 font-semibold text-base"
            >
              <Mail className="w-5 h-5 text-orange-300" />
              <span>cfdt-interco@ville-gennevilliers.fr</span>
            </a>
            <div className="flex items-center gap-2 text-orange-200 font-semibold text-base">
              <MapPin className="w-5 h-5 text-orange-300" />
              <span>177 av. Gabriel-Péri</span>
            </div>
          </div>
          <p className="text-sm text-slate-300 font-medium leading-tight">
            92237 Gennevilliers Cedex
          </p>
        </div>
      </footer>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <AdminLogin
          onClose={() => setShowAdminLogin(false)}
          onSuccess={() => {
            setShowAdminLogin(false);
            setShowAdminPanel(true);
          }}
        />
      )}

      {/* Admin Panel Modal */}
      {showAdminPanel && <AdminPanel onClose={() => setShowAdminPanel(false)} />}
    </div>
  );
}


export default App;
