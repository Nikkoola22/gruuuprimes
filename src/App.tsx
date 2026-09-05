import React, { useState, useRef, useEffect, lazy, Suspense } from "react"
import { ArrowLeft, Rss, Calculator, DollarSign, TrendingUp, Landmark, Eye, Laptop } from "lucide-react"

// --- IMPORTATIONS DES DONNÉES ---
import { searchFAQ } from "./data/FAQdata.ts"
import { infoItems } from "./data/info-data.ts"
import { incrementWeeklyStat } from "./lib/adminStats.ts"
import { Toaster } from "sonner"
import { OrangeGeometricBackground } from "./components/ui/OrangeGeometricBackground.tsx"
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
const VeilleCdgPage = lazy(() => import("./components/VeilleCdgPage.tsx"))
const EspacePodcastsFigurines = lazy(() => import("./components/EspacePodcastsFigurines.tsx"))
const DessineMoiLeStatut = lazy(() => import("./components/DessineMoiLeStatut.tsx"))
const DocuthequeRAG = lazy(() => import("./components/DocuthequeRAG").then(m => ({ default: m.DocuthequeRAG })))
const CoinRH = lazy(() => import("./components/CoinRH.tsx"))
const MemoireJuridiqueGenerator = lazy(() => import("./components/MemoireJuridiqueGenerator").then(m => ({ default: m.MemoireJuridiqueGenerator })))
const HomeMenu = lazy(() => import("./components/HomeMenu.tsx"))
// Modules rarity chargés à la demande (admin, chat) pour alléger le bundle initial
const LuxuryChat = lazy(() => import("./components/ui/LuxuryChat.tsx").then(m => ({ default: m.LuxuryChat })))
const AdminPanel = lazy(() => import("./components/AdminPanel.tsx"))
const AdminLogin = lazy(() => import("./components/AdminLogin.tsx"))
import MacMenuBar from "./components/MacMenuBar.tsx"

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
    <section role="region" aria-label="Actualités France Info défilantes" className="relative bg-gradient-to-r from-orange-600/60 via-amber-500/60 to-orange-600/60 text-orange-950 overflow-hidden w-full shadow-lg border-b border-orange-500/30 z-50 glass-banner marquee-pausable">
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
export interface ChatbotState {
  currentView: "menu" | "chat" | "calculators" | "metiers" | "faq" | "jeux" | "actualites" | "veille" | "veille-cdg" | "memoire-juridique" | "podcasts" | "dessine-moi-le-statut" | "docutheque-rag" | "coin-rh"
  selectedDomain: number | null
  messages: ChatMessage[]
  isProcessing: boolean
}

function App() {

  // --- CUSTOM HOOK SWIPE GESTURE ---
  // Suivi par refs : aucun re-render pendant le geste.
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number } | null>(null);

  const minSwipeDistance = 60;

  const onTouchStart = (e: React.TouchEvent) => {
    // Ne pas intercepter les gestes démarrés dans un vrai scroller horizontal
    // interactif (carrousels) : c'est un scroll, pas un swipe. On ignore en
    // revanche les débordements purement décoratifs (overflow hidden/clip).
    let el = e.target as HTMLElement | null;
    while (el) {
      const ox = getComputedStyle(el).overflowX;
      if (ox === 'auto' || ox === 'scroll') {
        touchStartRef.current = null;
        return;
      }
      el = el.parentElement;
    }
    touchEndRef.current = null;
    const t = e.targetTouches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const t = e.targetTouches[0];
    touchEndRef.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = () => {
    const start = touchStartRef.current;
    const end = touchEndRef.current;
    touchStartRef.current = null;
    touchEndRef.current = null;
    if (!start || !end) return;
    const dx = start.x - end.x;
    const dy = start.y - end.y;
    // Swipe vers la droite, franc et à dominante horizontale,
    // pour revenir au menu depuis n'importe quelle vue.
    if (dx < -minSwipeDistance && Math.abs(dx) > Math.abs(dy) * 1.5 && chatState.currentView !== "menu") {
      returnToMenu();
    }
  };
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

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }
  const [selectedInfo, setSelectedInfo] = useState<InfoItem | null>(null)

  // --- FLUX D'ACTUALITÉS (Hook optimisé) ---
  const { rssItems, rssLoading, intercoNews, intercoLoading, fpNews, fpLoading } = useNewsFeeds()

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
    // (import dynamique : legifrance.ts et ses données statutaires restent hors du bundle initial)
    const pistePromise = import("./services/legifrance.ts")
      .then(m => m.queryPisteLegifrance(question))
      .catch(err => {
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

    // ⚡ Recherche RAG dans la Docuthèque RH de Gennevilliers (111 formulaires & circulaires)
    const { searchDocuthequeRAG } = await import("./utils/docuthequeSearch.ts")
    const docuthequeRes = searchDocuthequeRAG(question)
    if (docuthequeRes.matchedDocuments.length > 0) {
      const docuthequeContext = `\n\n=== FORMULAIRES ET DOCUMENTS OFFICIELS VILLE DE GENNEVILLIERS (DOCUTHÈQUE RH) ===\n` +
        docuthequeRes.matchedDocuments.slice(0, 4).map(d =>
          `- [${d.type.toUpperCase()}] ${d.title} (${d.category}${d.subCategory ? ' > ' + d.subCategory : ''}) : ${d.summary}\n  Lien direct de téléchargement : ${d.url}`
        ).join('\n\n')

      contenuCible += docuthequeContext
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
5. Si des formulaires officiels de la Ville de Gennevilliers (Docuthèque RH) correspondent à la demande, cite-les expressément avec leur lien de téléchargement direct sous forme de lien markdown [Nom du Document](URL).

⚠️ RÈGLE CRITIQUE - INTERPRÈTE LA QUESTION :
- Si l'utilisateur demande "congés bonifiés" → cherche "congé bonifié" dans les documents
- Si l'utilisateur demande "école grève" → cherche "garde d'enfant", "école fermée", "grève"
- Si l'utilisateur demande "temps partiel" → explique la différence entre temps partiel de droit (naissance, soins) et sur autorisation, et fournis les liens directs des formulaires correspondants.
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
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
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
          <Suspense fallback={<ViewLoader />}>
            <HomeMenu
              chatState={chatState}
              setChatState={setChatState}
              handleDomainSelection={handleDomainSelection}
              openCalculatorsLanding={openCalculatorsLanding}
              openMetiersView={openMetiersView}
              hoveredQuickAccessIndex={hoveredQuickAccessIndex}
              setHoveredQuickAccessIndex={setHoveredQuickAccessIndex}
              intercoNews={intercoNews}
              intercoLoading={intercoLoading}
              fpNews={fpNews}
              fpLoading={fpLoading}
              usefulLinks={usefulLinks}
              baseUrl={BASE_URL}
            />
          </Suspense>
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
            onNavigateToVeille={() => setChatState({ ...chatState, currentView: 'veille-cdg' })}
          />
        </Suspense>
      )}

      {/* --- SECTION VEILLE CDG & CIG (ACTU-CIG) --- */}
      {chatState.currentView === 'veille-cdg' && (
        <Suspense fallback={<ViewLoader />}>
          <VeilleCdgPage
            onClose={() => setChatState({ ...chatState, currentView: 'menu' })}
            onNavigateToJuridique={() => setChatState({ ...chatState, currentView: 'veille' })}
            theme={theme}
          />
        </Suspense>
      )}

      {/* --- SECTION VEILLE JURIDIQUE --- */}
      {chatState.currentView === 'veille' && (
        <Suspense fallback={<ViewLoader />}>
          <VeilleJuridique
            onClose={() => setChatState({ ...chatState, currentView: 'menu' })}
            onNavigateToCdg={() => setChatState({ ...chatState, currentView: 'veille-cdg' })}
            onNavigateToMemoire={() => setChatState({ ...chatState, currentView: 'memoire-juridique' })}
            theme={theme}
          />
        </Suspense>
      )}

      {/* --- SECTION MÉMOIRE JURIDIQUE & OBSERVATIONS DISCIPLINAIRES --- */}
      {chatState.currentView === 'memoire-juridique' && (
        <Suspense fallback={<ViewLoader />}>
          <MemoireJuridiqueGenerator
            onClose={() => setChatState({ ...chatState, currentView: 'menu' })}
          />
        </Suspense>
      )}

      {/* --- SECTION DESSINE-MOI LE STATUT (INFOGRAPHIES) --- */}
      {chatState.currentView === 'dessine-moi-le-statut' && (
        <Suspense fallback={<ViewLoader />}>
          <DessineMoiLeStatut
            onClose={() => setChatState({ ...chatState, currentView: 'menu' })}
            theme={theme}
          />
        </Suspense>
      )}

      {/* --- SECTION DOCUTHÈQUE RH (RAG) --- */}
      {chatState.currentView === 'docutheque-rag' && (
        <Suspense fallback={<ViewLoader />}>
          <DocuthequeRAG
            onBack={() => setChatState({ ...chatState, currentView: 'menu' })}
            onOpenCalculator={(calc) => {
              setActiveCalculator(calc);
              setChatState({ ...chatState, currentView: 'calculators' });
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            theme={theme}
          />
        </Suspense>
      )}

      {/* --- SECTION COIN RH (ACTES & LÉGALITÉ) --- */}
      {chatState.currentView === 'coin-rh' && (
        <Suspense fallback={<ViewLoader />}>
          <CoinRH
            onClose={() => setChatState({ ...chatState, currentView: 'menu' })}
            theme={theme}
          />
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
          <Suspense fallback={<ViewLoader />}>
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
          </Suspense>
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
      <section role="region" aria-label="Actualités FPT défilantes" className="relative bg-gradient-to-r from-orange-600/90 via-red-600/90 to-pink-600/90 text-white overflow-hidden w-full shadow-lg border-b border-orange-400/30 z-10 glass-banner marquee-pausable banner-top-streak">
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

      <footer className="relative w-full overflow-hidden bg-slate-950/90 z-10 border-t border-orange-500/30">
        <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-4 flex justify-center items-center">
          <img
            src={`${BASE_URL}images/footer_banner.png`}
            alt="Votons CFDT ! S'engager pour chacun, agir pour tous - Élections professionnelles 10 décembre 2026 - Interco Gennevilliers"
            className="w-full h-auto object-contain rounded-xl sm:rounded-2xl shadow-2xl border border-orange-500/30 hover:border-orange-500/60 transition-all duration-300"
          />
        </div>
      </footer>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <Suspense fallback={null}>
          <AdminLogin
            onClose={() => setShowAdminLogin(false)}
            onSuccess={() => {
              setShowAdminLogin(false);
              setShowAdminPanel(true);
            }}
          />
        </Suspense>
      )}

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <Suspense fallback={null}>
          <AdminPanel onClose={() => setShowAdminPanel(false)} />
        </Suspense>
      )}
    </div>
  );
}


export default App;
