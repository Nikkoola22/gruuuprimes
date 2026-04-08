import React, { useState, useRef, useEffect, useMemo, lazy, Suspense } from "react"
import { Phone, Mail, MapPin, ArrowRight, Send, ArrowLeft, Search, Rss, Calculator, TrendingUp, DollarSign, LayoutGrid, HelpCircle, ChevronLeft, ChevronRight, Newspaper, Link2, Scale, Landmark, GraduationCap, Coins } from "lucide-react"

// --- IMPORTATIONS DES DONNÉES ---
import { infoItems } from "./data/info-data.ts"
import { franceInfoRss } from "./data/rss-data.ts"
import AdminPanel from "./components/AdminPanel.tsx"
import AdminLogin from "./components/AdminLogin.tsx"

const CalculateurCIAV2 = lazy(() => import("./components/CalculateurCIAV2.tsx"))
const CalculateurPrimesV2 = lazy(() => import("./components/CalculateurPrimesV2.tsx"))
const Calculateur13emeV2 = lazy(() => import("./components/Calculateur13emeV2.tsx"))
const Metiers = lazy(() => import("./components/Metiers.tsx"))
const FAQ = lazy(() => import("./components/FAQ.tsx"))
const LandingPage = lazy(() => import("./components/LandingPage.tsx"))


// --- CONFIGURATION BASE URL POUR GITHUB PAGES ---
const BASE_URL = import.meta.env.BASE_URL

// --- CONFIGURATION API PERPLEXITY ---
const BACKEND_API_URL = import.meta.env.DEV 
  ? "http://localhost:3001/api/completions" 
  : "/api/completions"

// --- RSS ITEM TYPE ---
interface RssItem {
  title: string
  link: string
  pubDate: string
}

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
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
    <div className="px-4 py-3 rounded-xl border border-purple-400/30 bg-slate-900/60 text-purple-100/90 backdrop-blur-md">
      Chargement en cours...
    </div>
  </div>
)

type SearchDeps = {
  chapitres: Record<number, string>
  formation: string
  teletravailData: unknown
  sommaireUnifie: Array<{
    id: string
    titre: string
    resume?: string
    motsCles: string[]
    source: string
    chapitre?: number
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
      import("./data/teletravail.ts"),
      import("./data/sommaireUnifie.ts"),
      import("./utils/ficheSearch.ts"),
    ]).then(([tempsModule, formationModule, teletravailModule, sommaireModule, ficheSearchModule]) => ({
      chapitres: tempsModule.chapitres as Record<number, string>,
      formation: formationModule.formation as string,
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
        <span className="text-base mx-8 font-light text-slate-100">
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
          className="text-lg font-light mx-6 hover:text-cyan-300 cursor-pointer text-white transition-colors duration-100 inline-block"
        >
          {item.title}
        </a>
      </React.Fragment>
    ))
  }

  return (
    <section className="relative bg-gradient-to-r from-blue-600/60 via-indigo-600/60 to-blue-600/60 backdrop-blur-md text-white overflow-hidden w-full shadow-lg border-b border-blue-500/30 z-50 glass-banner marquee-pausable">
      <div className="relative h-16 flex items-center overflow-hidden">
        {/* Label ACTU fixe à gauche */}
        <div className="absolute left-0 top-0 h-full w-40 flex items-center justify-center bg-gradient-to-r from-indigo-700 to-blue-700 backdrop-blur z-20 shadow-lg glass-pill actu-pill-glow">
          <div className="flex items-center gap-2">
            <Rss className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span className="text-base font-light tracking-wide text-white">ACTU:</span>
          </div>
        </div>
        {/* Container du défilement - 2 copies pour boucle infinie */}
        <div ref={marqueeRef} className="marquee-track animate-marquee ml-44">
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
  currentView: "menu" | "chat" | "calculators" | "metiers" | "faq"
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
  const [selectedInfo, setSelectedInfo] = useState<InfoItem | null>(null)
  const [rssItems, setRssItems] = useState<RssItem[]>([])
  const [rssLoading, setRssLoading] = useState(false)

  // --- ACTUALITÉS INTERCO CFDT ---
  interface IntercoNewsItem {
    title: string
    link: string
    pubDate: string
    category: string
    description: string
  }
  const [intercoNews, setIntercoNews] = useState<IntercoNewsItem[]>([])
  const [intercoLoading, setIntercoLoading] = useState(true)
  const intercoCarouselRef = useRef<HTMLDivElement>(null)





  const [activeCalculator, setActiveCalculator] = useState<'primes' | 'cia' | '13eme' | null>(null)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [showExpandSearch, setShowExpandSearch] = useState(false)
  const [showUsefulLinks, setShowUsefulLinks] = useState(false)
  const [lastQuestion, setLastQuestion] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const newsMarqueeRef = useRef<HTMLDivElement>(null)
  const rssMarqueeRef = useRef<HTMLDivElement>(null)
  const bipMarkdownCacheRef = useRef<Map<string, string>>(new Map())

  // --- EFFETS ---
  useEffect(() => {
    if (chatState.currentView === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatState.messages, chatState.currentView])

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


  // --- CHARGER LES ARTICLES RSS ---
  useEffect(() => {
    const fetchRssFeeds = async () => {
      try {
        setRssLoading(true)
        
        // Sur GitHub Pages, utiliser les données par défaut
        if (BASE_URL !== '/') {
          setRssItems(franceInfoRss)
          setRssLoading(false)
          return
        }
        
        // Construire l'URL de l'API selon l'environnement
        const apiUrl = import.meta.env.DEV && BASE_URL === '/' 
          ? '/api/rss' 
          : `${window.location.origin}${BASE_URL}api/rss`
        const response = await fetch(apiUrl)
        
        if (!response.ok) {
          console.warn(`Erreur backend: ${response.status}`)
          throw new Error(`Erreur serveur: ${response.status}`)
        }
        
        const data = await response.json()
        const items = data.items || []
        
        if (items.length > 0) {
          // Formater les articles (sans bullet, ajouté au rendu)
          const formattedItems = items.slice(0, 5).map((item: { title?: string; link?: string; pubDate?: string }) => ({
            title: (item.title || '').replace(/^•\s*/, '').trim(),
            link: item.link || '#',
            pubDate: item.pubDate || new Date().toISOString()
          }))
          setRssItems(formattedItems)
        } else {
          throw new Error('Aucun article trouvé')
        }
      } catch (error) {
        console.warn('Impossible de récupérer les flux RSS via le backend, utilisation des données par défaut', error)
        setRssItems(franceInfoRss)
      } finally {
        setRssLoading(false)
      }
    }
    
    fetchRssFeeds()
    
    // Rafraîchir tous les 30 minutes
    const interval = setInterval(fetchRssFeeds, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // --- ACTUALITÉS STATIQUES CFDT INTERCO (fallback) ---
  const intercoFallbackNews = useMemo<IntercoNewsItem[]>(() => [
    { title: "8 mars, Journée internationale des droits des femmes : la France doit s'engager pour l'égalité !", link: "https://interco.cfdt.fr/8-mars-journee-internationale-des-droits-des-femmes-la-france-doit-sengager-pour-legalite/", pubDate: "Sat, 08 Mar 2026 00:00:00 +0000", category: "Actu générale", description: "Communiqué intersyndical pour la Journée internationale des droits des femmes." },
    { title: "La CFDT réagit à l'annonce de la création de 150 postes en milieu ouvert à la PJJ", link: "https://interco.cfdt.fr/quand-la-protection-judiciaire-de-la-jeunesse-entend-reinventer-le-placement/", pubDate: "Fri, 20 Feb 2026 00:00:00 +0000", category: "Protection judiciaire", description: "Quand la protection judiciaire de la jeunesse entend réinventer le placement." },
    { title: "Défendre l'autonomie et les moyens du CNFPT", link: "https://interco.cfdt.fr/defendre-lautonomie-et-les-moyens-du-cnfpt/", pubDate: "Thu, 12 Feb 2026 00:00:00 +0000", category: "Territoriale", description: "Déclaration CFDT pour défendre l'autonomie et les moyens du CNFPT." },
    { title: "Comment valoriser l'implication des agents et des magistrats ?", link: "https://interco.cfdt.fr/comment-valoriser-limplication-des-agents-et-des-magistrats-et-leur-determination-a-rendre-la-meilleure-justice/", pubDate: "Tue, 10 Feb 2026 00:00:00 +0000", category: "Services judiciaires", description: "Déclaration liminaire Formation spécialisée CSA des services judiciaires." },
    { title: "Se donner l'ambition et les moyens — CSA PJJ du 5 février 2026", link: "https://interco.cfdt.fr/se-donner-lambition-et-les-moyens/", pubDate: "Thu, 05 Feb 2026 00:00:00 +0000", category: "Actu générale", description: "Déclaration préliminaire de la CFDT au CSA PJJ du 5 février 2026." },
    { title: "Un changement de cap clair et concret est demandé !", link: "https://interco.cfdt.fr/un-changement-de-cap-clair-et-concret-est-demande/", pubDate: "Sun, 26 Jan 2026 00:00:00 +0000", category: "Affaires sociales", description: "Déclaration liminaire de la CFDT lors de la rencontre avec la ministre de la Santé." },
    { title: "Déclaration liminaire CFDT au CSA services judiciaires du 19 février", link: "https://interco.cfdt.fr/lacte-de-juger-ne-se-reduit-pas-au-rendu-dune-decision/", pubDate: "Wed, 19 Feb 2026 00:00:00 +0000", category: "Services judiciaires", description: "L'absence de réflexion transverse sur le sens des missions de chacun." },
  ], [])

  // --- CHARGER LES ACTUALITÉS INTERCO CFDT ---
  useEffect(() => {
    const fetchIntercoNews = async () => {
      try {
        setIntercoLoading(true)
        const apiUrl = import.meta.env.DEV
          ? '/api/interco-rss'
          : `${window.location.origin}${BASE_URL === '/' ? '' : BASE_URL}/api/interco-rss`
        const response = await fetch(apiUrl)
        if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`)
        const data = await response.json()
        const items = (data.items || []).map((item: IntercoNewsItem) => ({
          ...item,
          title: item.title.replace(/^•\s*/, '').trim()
        }))
        if (items.length > 0) {
          setIntercoNews(items)
        } else {
          setIntercoNews(intercoFallbackNews)
        }
      } catch (error) {
        console.warn('Impossible de récupérer les actualités Interco CFDT, utilisation des données par défaut', error)
        setIntercoNews(intercoFallbackNews)
      } finally {
        setIntercoLoading(false)
      }
    }
    fetchIntercoNews()
    const interval = setInterval(fetchIntercoNews, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [intercoFallbackNews])

  // --- FONCTIONS DE GESTION ---
  const handleInfoClick = (info: InfoItem) => setSelectedInfo(info)

  const handleDomainSelection = (domainId: number) => {
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

    setTimeout(() => {
      if (chatContainerRef.current) {
        const headerHeight = 200 // Approximate header height
        const chatPosition = chatContainerRef.current.offsetTop
        const scrollPosition = Math.max(0, chatPosition - headerHeight)

        window.scrollTo({
          top: scrollPosition,
          behavior: "smooth",
        })
      }
      inputRef.current?.focus()
    }, 100)
  }

  const returnToMenu = () => {
    setChatState({ currentView: "menu", selectedDomain: null, messages: [], isProcessing: false })
    setInputValue("")
    setSelectedInfo(null)
  }

  const usefulLinks: { label: string; href: string; Icon: React.ComponentType<{ className?: string }> }[] = [
    { label: "Jurisprudences", href: "https://www.conseil-etat.fr/actualites", Icon: Scale },
    { label: "Legifrance", href: "https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070633/", Icon: Landmark },
    { label: "Formation", href: "https://www.cnfpt.fr/catalogue/catalogues/region84/#page/1", Icon: GraduationCap },
    { label: "Primes", href: "https://www.cdg31.fr/sites/default/files/guide_des_primes_2025.pdf", Icon: Coins },
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
      { role: "user", content: `FONCTION PUBLIQUE TERRITORIALE UNIQUEMENT.
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

  const chargerContenuSections = async (sectionIds: string[]): Promise<string> => {
    const { sommaireUnifie, chapitres, formation, teletravailData } = await loadSearchDeps()
    const chapitresACharger = new Set<number>()
    let chargerFormation = false
    let chargerTeletravail = false

    sectionIds.forEach(id => {
      const section = sommaireUnifie.find(s => s.id === id)
      if (section) {
        if (section.source === 'temps' && section.chapitre) {
          chapitresACharger.add(section.chapitre)
        } else if (section.source === 'formation') {
          chargerFormation = true
        } else if (section.source === 'teletravail') {
          chargerTeletravail = true
        }
      }
    })

    let contenu = ''
    if (chapitresACharger.size > 0) {
      const titres = ['', 'LE TEMPS DE TRAVAIL', 'LES CONGÉS', "AUTORISATIONS SPÉCIALES D'ABSENCE", 'LES ABSENCES POUR MALADIES ET ACCIDENTS']
      chapitresACharger.forEach(ch => {
        contenu += `\n\n=== ${titres[ch] || 'CHAPITRE ' + ch} ===\n${(chapitres as Record<number, string>)[ch] || ''}`
      })
    }
    if (chargerFormation) {
      contenu += `\n\n=== RÈGLEMENT FORMATION ===\n${formation || ''}`
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

  const traiterQuestion = async (question: string) => {
    const {
      sommaireUnifie,
      rechercherAvecPriorite,
      chapitres,
      formation,
      teletravailData,
    } = await loadSearchDeps()

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

    const idsExtraits = (responseClean === 'aucune' || responseClean.includes('aucune section'))
      ? []
      : tokens.filter((token: string) => knownIdsSet.has(token))

    // Fallback déterministe local si le modèle n'a pas renvoyé d'IDs exploitables
    const idsLocaux = rechercherAvecPriorite(question, 4).map(section => section.id)
    const idsFinals = Array.from(new Set([...idsExtraits, ...idsLocaux]))
    
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

PROTOCOLE TÉLÉTRAVAIL :\n${typeof teletravailData === 'string' ? teletravailData : JSON.stringify(teletravailData)}`
    } else {
      // ÉTAPE 2 : Charger uniquement les sections identifiées
      contenuCible = await chargerContenuSections(idsFinals)
    }

    const systemPromptSommaire = `
Tu es un assistant CFDT pour la Mairie de Gennevilliers.

RÈGLES STRICTES :
1. Réponds UNIQUEMENT en utilisant les documents ci-dessous
2. Ne cherche JAMAIS sur internet, n'utilise JAMAIS tes connaissances externes
3. Sois précis sur les chiffres et délais mentionnés dans les documents
4. Réponds comme un collègue syndical bienveillant
5. Ne mentionne JAMAIS [CHAPITRE X - ARTICLE Y] dans ta réponse. Réponds naturellement.

⚠️ RÈGLE CRITIQUE - INTERPRÈTE LA QUESTION :
- Si l'utilisateur demande "congés bonifiés" → cherche "congé bonifié" dans les documents
- Si l'utilisateur demande "école grève" → cherche "garde d'enfant", "école fermée", "grève"
- Fais des correspondances intelligentes entre les termes utilisés et le contenu des documents

⚠️ RÈGLE CRITIQUE - SI TU TROUVES L'INFO :
- Donne directement la réponse, sans dire "Je ne trouve pas"
- Cite les détails précis des documents
- Même si la question est mal formulée, tente de comprendre et répondre si possible

⚠️ RÈGLE CRITIQUE - SI TU NE TROUVES PAS L'INFO :
- Réponds UNIQUEMENT : "Je ne trouve pas cette information dans nos documents internes. Contactez la CFDT au 01 40 85 64 64."
- ARRÊTE-TOI IMMÉDIATEMENT après cette phrase
- N'ajoute AUCUNE information supplémentaire
- Ne commence JAMAIS par "Je ne trouve pas" puis donne une réponse ensuite

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
      return reponseCore
    }

    const bipContexte = await genererContexteBip(question)
    if (!bipContexte) {
      return reponseCore
    }

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

    return reponseBip
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
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // --- RENDU DU COMPOSANT ---
  if (showLanding) {
    return (
      <Suspense fallback={<ViewLoader />}>
        <LandingPage
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
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a0022 0%, #2a0033 40%, #3a0055 80%, #FF1C74 100%)',
      }}
    >
      {/* Background image with transparency */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 pointer-events-none"
        style={{ backgroundImage: `url('${BASE_URL}unnamed.jpg')`, opacity: 0.3 }}
      ></div>

      {/* Subtle overlay for better text readability */}
      <div className="fixed inset-0 bg-black/20 z-0 pointer-events-none"></div>

      {/* Couches de fond supplémentaires — supprimées (GPU layers plein écran) */}

      {/* HEADER PROFESSIONNEL */}
      <header className="relative bg-gradient-to-r from-slate-900/95 via-purple-900/90 to-slate-900/95 shadow-lg z-10 bg-cover bg-center glass-banner header-bottom-glow" style={{ backgroundImage: `url('${BASE_URL}mairie.jpeg')`, backgroundBlendMode: 'overlay' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-purple-900/80 to-slate-900/80 z-0"></div>
        {/* Scan line traversant le header */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
          <div
            className="absolute top-0 left-0 h-full w-20"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.07), transparent)',
              animation: 'header-scan 12s ease-in-out 3s infinite',
              willChange: 'transform',
            }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 relative z-10">
          <div className="flex items-center justify-between gap-2 sm:gap-5">
            {/* Logo et texte à gauche */}
            <div className="flex items-center gap-3 group">
              <div className="relative logo-glow-ambient">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <img
                  src={`${BASE_URL}logo-cfdt.jpg`}
                  alt="Logo CFDT"
                  className="w-14 h-14 sm:w-24 sm:h-24 object-contain relative transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-shimmer">Atlas</h1>
                <p className="text-xs sm:text-sm text-slate-300 font-light">Assistant syndical CFDT</p>
              </div>
            </div>
            
            {/* Texte centre — masqué sur mobile */}
            <div className="hidden sm:block text-center flex-grow">
              <h2 className="text-xl font-light text-slate-100 tracking-tight">Mairie de Gennevilliers</h2>
              <p className="text-sm text-slate-400 mt-1 font-light">Chatbot d'assistance pour les agents municipaux</p>
            </div>
            
            {/* Contact à droite */}
            <div className="flex items-center gap-4 text-right">
            </div>
          </div>
        </div>
      </header>

      {/* Bandeau NEWS FPT - Pleine largeur sous le header */}
      <section className="relative bg-gradient-to-r from-orange-600/90 via-red-600/90 to-pink-600/90 text-white overflow-hidden w-full shadow-lg border-b border-orange-400/30 z-10 glass-banner marquee-pausable banner-top-streak">
      <div className="relative h-16 flex items-center overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-32 flex items-center justify-center bg-gradient-to-r from-orange-700 to-red-700 z-20 shadow-lg glass-pill news-pill-glow">
          <span className="text-base font-light tracking-wide text-white">NEWS:</span>
        </div>
        <div ref={newsMarqueeRef} className="marquee-track animate-marquee pl-36">
          <div className="marquee-group">
            {infoItems.map((info, index) => (
              <React.Fragment key={`news-a-${info.id}-${index}`}>
                <span className={`marquee-diamond${index % 3 === 0 ? ' marquee-diamond-twinkle' : ''}`} aria-hidden="true" />
                <button
                  onClick={() => handleInfoClick(info)}
                  className="text-lg font-light mx-4 hover:text-amber-200 cursor-pointer hover:scale-105 text-white transition-transform duration-100"
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
                  className="text-lg font-light mx-4 hover:text-amber-200 cursor-pointer hover:scale-105 text-white transition-transform duration-100"
                >
                  {info.title}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
        </div>
      </section>

      <main className="relative max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 z-10">
        {chatState.currentView === "menu" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
              {/* Colonne principale - pleine largeur */}
              <div className="lg:col-span-1">
                {selectedInfo && (
                  <section className="info-detail bg-gradient-to-br from-slate-800/80 via-purple-900/80 to-slate-800/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-purple-500/30 mb-8 max-w-4xl mx-auto hover:shadow-2xl transition-shadow glass-card">
                    <h3 className="text-3xl font-light bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">{selectedInfo.title}</h3>
                    <p className="text-slate-200 leading-relaxed">{selectedInfo.content}</p>
                    <button
                      onClick={() => setSelectedInfo(null)}
                      className="mt-6 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Fermer
                    </button>
                  </section>
                )}

                <div className="flex flex-col md:flex-row justify-center items-center mb-1 gap-8">
                  <button
                    onClick={() => handleDomainSelection(0)}
                    className="group relative overflow-hidden bg-gradient-to-br from-slate-800/70 via-purple-900/70 to-slate-800/70 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 md:p-10 hover:border-pink-500/50 hover:shadow-2xl hover:-translate-y-1 w-full max-w-sm md:w-80 h-auto md:h-96 transition-transform duration-150 glass-card animate-card-enter-1 card-border-sweep btn-ripple"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>
                    <div className="relative z-10 flex flex-col items-center gap-6 h-full justify-between">
                      <div className="relative">
                        <span className="absolute -inset-3 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg group-hover:scale-110 transition-opacity duration-150"></span>
                        <div className="relative p-4 md:p-6 bg-gradient-to-br from-purple-500/80 to-pink-500/80 backdrop-blur rounded-2xl shadow-2xl icon-box-spring">
                          <Search className="w-12 h-12 md:w-16 md:h-16 text-white" />
                        </div>
                      </div>
                      <h4 className="text-2xl font-light tracking-tight text-white card-title-purple">
                        Recherche Unifiée
                      </h4>
                      <p className="text-center text-slate-300 font-light text-sm">
                        Temps de travail, formation, télétravail - Recherche dans tous les documents
                      </p>
                      <div className="flex items-center gap-2 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <span className="font-light text-sm">Accéder à l&apos;assistant</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setChatState({ ...chatState, currentView: 'calculators' })}
                    className="group relative overflow-hidden bg-gradient-to-br from-slate-800/70 via-blue-900/70 to-slate-800/70 backdrop-blur-md border border-blue-500/30 rounded-2xl p-6 md:p-10 hover:border-cyan-500/50 hover:shadow-2xl hover:-translate-y-1 w-full max-w-sm md:w-80 h-auto md:h-96 transition-transform duration-150 glass-card animate-card-enter-2 card-border-sweep btn-ripple"
                  >
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative z-10 flex flex-col items-center gap-6 h-full justify-between">
                      <div className="relative">
                        <span className="absolute -inset-3 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg group-hover:scale-110 transition-opacity duration-150"></span>
                        <div className="relative p-4 md:p-6 bg-gradient-to-br from-blue-500/80 to-cyan-500/80 backdrop-blur rounded-2xl shadow-2xl icon-box-spring">
                          <Calculator className="w-12 h-12 md:w-16 md:h-16 text-white" />
                        </div>
                      </div>
                      <h4 className="text-2xl font-light tracking-tight text-white card-title-blue">
                        Calculateurs
                      </h4>
                      <p className="text-center text-slate-300 font-light text-sm">
                        Primes IFSE - Calcul CIA - Outils de simulation
                      </p>
                      <div className="flex items-center gap-2 text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <span className="font-light text-sm">Accéder aux calculateurs</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>

                  {/* Carte Grilles Indiciaires */}
                  <button
                    onClick={() => setChatState({ ...chatState, currentView: 'metiers' })}
                    className="group relative overflow-hidden bg-gradient-to-br from-slate-800/70 via-emerald-900/70 to-slate-800/70 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-6 md:p-10 hover:border-green-500/50 hover:shadow-2xl hover:-translate-y-1 w-full max-w-sm md:w-80 h-auto md:h-96 transition-transform duration-150 glass-card animate-card-enter-3 card-border-sweep card-border-sweep-green btn-ripple"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>
                    <div className="relative z-10 flex flex-col items-center gap-6 h-full justify-between">
                      <div className="relative">
                        <span className="absolute -inset-3 bg-gradient-to-br from-emerald-400/30 to-green-400/30 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg group-hover:scale-110 transition-opacity duration-150"></span>
                        <div className="relative p-4 md:p-6 bg-gradient-to-br from-emerald-500/80 to-green-500/80 backdrop-blur rounded-2xl shadow-2xl icon-box-spring">
                          <LayoutGrid className="w-12 h-12 md:w-16 md:h-16 text-white" />
                        </div>
                      </div>
                      <h4 className="text-2xl font-light tracking-tight text-white card-title-green">
                        Grilles Indiciaires
                      </h4>
                      <p className="text-center text-slate-300 font-light text-sm">
                        Filières, métiers et grilles de rémunération FPT
                      </p>
                      <div className="flex items-center gap-2 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <span className="font-light text-sm">Voir les grilles</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                </div>

                <div className="flex flex-col items-center mt-8 gap-4">
                  <div className="flex flex-wrap justify-center items-center gap-4">
                    <button
                      onClick={() => setChatState({ ...chatState, currentView: 'faq' })}
                      className="group flex items-center gap-3 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-500 hover:via-amber-500 hover:to-yellow-600 text-slate-900 font-medium px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:shadow-yellow-500/30 transition-all duration-150 hover:scale-105 btn-cta animate-cta-enter btn-shine"
                    >
                      <HelpCircle className="w-6 h-6" />
                      <span className="text-lg">Questions Fréquentes</span>
                      <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                    </button>

                    <button
                      onClick={() => setShowUsefulLinks((prev) => !prev)}
                      className="group flex items-center gap-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 hover:from-blue-600 hover:via-indigo-600 hover:to-blue-700 text-white font-medium px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-150 hover:scale-105 btn-cta animate-cta-enter btn-shine"
                    >
                      <Link2 className="w-6 h-6" />
                      <span className="text-lg">Liens utiles</span>
                      <ArrowRight className={`w-5 h-5 transition-all duration-150 ${showUsefulLinks ? 'opacity-100 rotate-90' : 'opacity-0 group-hover:opacity-100'}`} />
                    </button>
                  </div>

                  {showUsefulLinks && (
                    <div className="flex flex-wrap justify-center gap-4 animate-cta-enter">
                      {usefulLinks.map(({ label, href, Icon }) => (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-3 bg-slate-800/80 border border-blue-500/30 rounded-full px-6 py-3 text-slate-100 hover:border-blue-400/60 hover:bg-slate-700/80 transition-all duration-150"
                        >
                          <Icon className="w-5 h-5 text-blue-300" />
                          <span className="font-light">{label}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* --- CARROUSEL ACTUALITÉS INTERCO CFDT --- */}
                {(
                <div className="mt-12 mb-4">
                  <div className="flex items-center gap-3 mb-5 justify-center">
                    <Newspaper className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-light text-white tracking-wide">Actualités <span className="text-blue-300 font-normal">CFDT Interco</span></h3>
                    <a
                      href="https://interco.cfdt.fr/actualites/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-xs text-slate-400 hover:text-blue-300 transition-colors duration-150 underline underline-offset-2"
                    >
                      Voir toutes les actualités →
                    </a>
                  </div>

                  {intercoLoading ? (
                    <div className="flex gap-4 overflow-hidden">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex-none w-72 h-44 bg-slate-800/50 rounded-2xl animate-pulse border border-slate-700/40" />
                      ))}
                    </div>
                  ) : (
                    <div className="relative group/carousel">
                      {/* Flèche gauche */}
                      <button
                        onClick={() => {
                          if (intercoCarouselRef.current) {
                            intercoCarouselRef.current.scrollBy({ left: -320, behavior: 'smooth' })
                          }
                        }}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 rounded-full bg-slate-800/90 border border-slate-600/50 flex items-center justify-center text-white shadow-lg opacity-0 group-hover/carousel:opacity-100 hover:bg-slate-700 transition-all duration-150"
                        aria-label="Défiler à gauche"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {/* Flèche droite */}
                      <button
                        onClick={() => {
                          if (intercoCarouselRef.current) {
                            intercoCarouselRef.current.scrollBy({ left: 320, behavior: 'smooth' })
                          }
                        }}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 rounded-full bg-slate-800/90 border border-slate-600/50 flex items-center justify-center text-white shadow-lg opacity-0 group-hover/carousel:opacity-100 hover:bg-slate-700 transition-all duration-150"
                        aria-label="Défiler à droite"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>

                      {/* Dégradés latéraux */}
                      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900/80 to-transparent z-[1] pointer-events-none rounded-l-2xl" />
                      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900/80 to-transparent z-[1] pointer-events-none rounded-r-2xl" />

                      {/* Scrollable track */}
                      <div
                        ref={intercoCarouselRef}
                        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth interco-carousel-track"
                        style={{ scrollbarWidth: 'none' }}
                      >
                        {intercoNews.map((article, i) => {
                          const date = article.pubDate ? new Date(article.pubDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
                          return (
                            <a
                              key={i}
                              href={article.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/card flex-none w-72 flex flex-col justify-between bg-gradient-to-br from-slate-800/80 via-blue-950/60 to-slate-800/80 backdrop-blur-md border border-blue-500/20 rounded-2xl p-5 hover:border-blue-400/50 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-150 glass-card"
                            >
                              <div>
                                {article.category && (
                                  <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-3">
                                    {article.category}
                                  </span>
                                )}
                                <p className="text-white font-light text-sm leading-snug group-hover/card:text-blue-200 transition-colors duration-150 line-clamp-3">
                                  {article.title}
                                </p>
                              </div>
                              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/40">
                                <span className="text-xs text-slate-400 font-light">{date}</span>
                                <span className="text-xs text-blue-400 flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity duration-150">
                                  Lire <ArrowRight className="w-3 h-3" />
                                </span>
                              </div>
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
                )}
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

      {/* --- SECTION CALCULATEURS FULL-WIDTH --- */}
      {chatState.currentView === 'calculators' && (
      <section className="fixed inset-0 z-[60] overflow-y-auto overflow-x-hidden overscroll-contain bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-800/95 to-blue-900/95 backdrop-blur-md border-b border-blue-500/30 z-30">
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
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-100 font-light"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{activeCalculator ? 'Retour aux calculateurs' : 'Retour au menu'}</span>
              </button>
              <h2 className="text-xl font-light text-white">Calculateurs CFDT</h2>
            </div>
          </div>
        </div>

        {/* Page d'accueil avec les 3 icônes */}
        {!activeCalculator && (
          <div className="max-w-6xl mx-auto px-4 py-12 calc-landing-enter">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-light text-white mb-4">Choisissez un calculateur</h3>
              <p className="text-slate-400 font-light">Cliquez sur une icône pour accéder au calculateur</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Carte Primes IFSE */}
              <button
                onClick={() => setActiveCalculator('primes')}
                className="group relative bg-gradient-to-br from-slate-800/80 to-cyan-900/50 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 hover:scale-105 hover:-translate-y-2 transition-transform duration-150 glass-card"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-2xl"></div>
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="p-6 bg-gradient-to-br from-cyan-500/80 to-blue-500/80 rounded-2xl shadow-2xl group-hover:scale-110 transition-transform duration-150">
                    <TrendingUp className="w-16 h-16 text-white" />
                  </div>
                  <h4 className="text-2xl font-light text-white group-hover:text-cyan-200 transition-colors duration-100">Primes IFSE</h4>
                  <p className="text-center text-slate-400 font-light text-sm">Calculez vos primes IFSE 1 et IFSE 2 selon votre grade et direction</p>
                </div>
              </button>

              {/* Carte CIA */}
              <button
                onClick={(e) => e.preventDefault()}
                disabled
                className="group relative bg-gradient-to-br from-slate-800/80 to-orange-900/50 backdrop-blur-md border border-orange-500/30 rounded-2xl p-8 shadow-xl transition-transform duration-150 glass-card opacity-50 cursor-not-allowed pointer-events-none"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/10 rounded-2xl"></div>
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="p-6 bg-gradient-to-br from-orange-500/80 to-amber-500/80 rounded-2xl shadow-2xl">
                    <Calculator className="w-16 h-16 text-white" />
                  </div>
                  <h4 className="text-2xl font-light text-white">CIA</h4>
                  <p className="text-center text-slate-400 font-light text-sm">Complément Indemnitaire Annuel - Simulez votre prime CIA</p>
                  <div className="flex items-center gap-2 text-orange-300/90">
                    <span className="font-light text-sm">Bientôt disponible</span>
                  </div>
                </div>
              </button>

              {/* Carte 13ème Mois */}
              <button
                onClick={(e) => e.preventDefault()}
                disabled
                className="group relative bg-gradient-to-br from-slate-800/80 to-green-900/50 backdrop-blur-md border border-green-500/30 rounded-2xl p-8 shadow-xl transition-transform duration-150 glass-card opacity-50 cursor-not-allowed pointer-events-none"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/10 rounded-2xl"></div>
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="p-6 bg-gradient-to-br from-green-500/80 to-emerald-500/80 rounded-2xl shadow-2xl">
                    <DollarSign className="w-16 h-16 text-white" />
                  </div>
                  <h4 className="text-2xl font-light text-white">13ème Mois</h4>
                  <p className="text-center text-slate-400 font-light text-sm">Calculez votre prime de 13ème mois selon votre situation</p>
                  <div className="flex items-center gap-2 text-green-300/90">
                    <span className="font-light text-sm">Bientôt disponible</span>
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

      <main className={
        chatState.currentView === "chat"
            ? "fixed inset-0 z-[60] overflow-y-auto overflow-x-hidden overscroll-contain bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 px-4 sm:px-6 lg:px-8 py-4"
          : "relative max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-2 z-10"
      }>
        {chatState.currentView === "chat" && (
          <div
            ref={chatContainerRef}
            className="bg-gradient-to-br from-slate-800/80 via-purple-900/80 to-slate-800/80 backdrop-blur-md border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 glass-card animate-chat-enter"
          >
            <div className="bg-gradient-to-r from-purple-600/70 via-pink-600/70 to-purple-600/70 backdrop-blur text-white p-6 glass-banner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Search className="w-7 h-7 text-pink-200" />
                  <div>
                    <h3 className="text-lg font-light tracking-tight">
                      Assistant CFDT Unifié
                    </h3>
                    <p className="text-purple-100 text-xs font-light">CFDT Gennevilliers</p>
                  </div>
                </div>
                <button
                  onClick={returnToMenu}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm font-light glass-pill"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">Retour</span>
                </button>
              </div>
            </div>
            <div className="min-h-[400px] max-h-[700px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-800/40 to-purple-900/40 glass-card">
              {chatState.messages.map((message, index) => (
                <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl backdrop-blur-sm font-light glass-card ${message.type === "user" ? "bg-gradient-to-r from-purple-600/70 to-pink-600/70 text-white shadow-lg" : "bg-slate-700/70 text-slate-100 border border-purple-500/30"}`}
                  >
                    <div className="whitespace-pre-wrap break-words text-sm">{message.content}</div>
                    <div className={`text-xs mt-2 ${message.type === "user" ? "text-purple-100" : "text-slate-400"}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
              {chatState.isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-slate-700/70 backdrop-blur-sm border border-purple-500/30 px-4 py-3 rounded-xl glass-card">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full typing-dot-1"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full typing-dot-2"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full typing-dot-3"></div>
                      <span className="text-slate-200 ml-2 text-sm font-light">L&apos;assistant réfléchit...</span>
                    </div>
                  </div>
                </div>
              )}
              {/* Boutons Oui/Non pour élargir la recherche */}
              {showExpandSearch && !chatState.isProcessing && (
                <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4 mt-4 mb-2">
                  <button
                    onClick={handleExpandSearch}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center justify-center gap-2 btn-cta"
                  >
                    <span>✅ Oui, rechercher sur Légifrance</span>
                  </button>
                  <button
                    onClick={handleDeclineSearch}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center justify-center gap-2 glass-pill"
                  >
                    <span>❌ Non, retour à l'accueil</span>
                  </button>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t border-purple-500/30 bg-gradient-to-r from-slate-800/80 to-purple-900/80 backdrop-blur-md p-4 glass-banner">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ex: Combien de jours de congés ? Comment utiliser mon CPF ? Télétravail possible ?"
                  className="flex-1 min-w-0 px-3 sm:px-4 py-3 border border-purple-500/30 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 outline-none transition-all duration-200 bg-slate-700/70 backdrop-blur-sm text-base sm:text-sm font-normal text-white placeholder-slate-300"
                  disabled={chatState.isProcessing}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || chatState.isProcessing}
                  className={`shrink-0 px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl font-semibold${inputValue.trim() && !chatState.isProcessing ? ' send-btn-pulse' : ''}`}
                >
                  <Send className="w-4 h-4" />
                  <span className="text-sm">Envoyer</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* --- BANDEAU RSS DÉFILANT --- */}
      <RssBandeau rssItems={rssItems} rssLoading={rssLoading} marqueeRef={rssMarqueeRef} />

      <footer 
        className="relative text-slate-400 text-center py-3 mt-0 z-10 border-t border-purple-500/20 glass-banner footer-glass"
        style={{
          backgroundImage: `
            linear-gradient(to right, 
              rgba(15, 23, 42, 0.85), 
              rgba(88, 28, 135, 0.85), 
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
          <div className="flex justify-center items-center gap-2 mb-3">
            <span className="text-pink-400 font-light text-base tracking-wide">CFDT Gennevilliers</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-5 mb-3">
            <a
              href="tel:0140856464"
              className="flex items-center gap-2 text-pink-400/90 hover:text-pink-300 transition-all duration-200 hover:scale-110 font-light text-sm"
            >
              <Phone className="w-5 h-5" />
              <span>01 40 85 64 64</span>
            </a>
            <a
              href="mailto:cfdt-interco@ville-gennevilliers.fr"
              className="flex items-center gap-2 text-pink-400/90 hover:text-pink-300 transition-all duration-200 hover:scale-110 font-light text-sm"
            >
              <Mail className="w-5 h-5" />
              <span>cfdt-interco@ville-gennevilliers.fr</span>
            </a>
            <div className="flex items-center gap-2 text-pink-400/90 font-light text-sm">
              <MapPin className="w-5 h-5" />
              <span>177 av. Gabriel-Péri</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-light leading-tight">
            92237 Gennevilliers Cedex
          </p>
          
          {/* Bouton Admin */}
          <div className="mt-4 pt-4 border-t border-purple-500/20">
            <button
              onClick={() => {
                // Vérifier si déjà authentifié
                const isAuth = localStorage.getItem('admin_authenticated') === 'true';
                if (isAuth) {
                  setShowAdminPanel(true);
                } else {
                  setShowAdminLogin(true);
                }
              }}
              className="px-4 py-2 bg-purple-600/50 border border-purple-500/50 text-purple-300 rounded-lg hover:bg-purple-600/70 transition-all duration-200 font-light text-xs glass-pill"
            >
              Accès Administrateur
            </button>
          </div>
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
