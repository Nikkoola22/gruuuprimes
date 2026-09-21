import React, { useEffect, useRef } from "react"
import { Bot, ArrowRight, Rss, Radio, Calculator, LayoutGrid, HelpCircle, ChevronLeft, ChevronRight, Newspaper, Link2, BookOpen, Scale, Landmark, GraduationCap, Gamepad2, FileText, Clock, Briefcase, ExternalLink as ExternalLinkIcon, PlayCircle, Sparkles, Laptop, Palette, FileSignature, Award, TrendingUp, CheckCircle2, Zap, Download, Eye } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { BorderBeam } from "./ui/BorderBeam.tsx"
import type { ChatbotState } from "../App.tsx"
import type { IntercoNewsItem } from "../hooks/useNewsFeeds.ts"

// --- TYPES ---
// Lien utile affiché dans la fenêtre « Liens Utiles » du menu d'accueil
export interface UsefulLink {
  label: string
  href: string
  imageSrc: string
}

// --- PROPS ---
interface HomeMenuProps {
  // État global du chatbot (utilisé pour les redirections depuis le menu)
  chatState: ChatbotState
  setChatState: React.Dispatch<React.SetStateAction<ChatbotState>>
  // Handlers de navigation définis dans App.tsx
  handleDomainSelection: (domainId: number) => void
  openCalculatorsLanding: () => void
  openMetiersView: () => void
  // Surbrillance de la barre d'accès rapide
  hoveredQuickAccessIndex: number | null
  setHoveredQuickAccessIndex: React.Dispatch<React.SetStateAction<number | null>>
  // Flux d'actualités alimentant les carrousels
  intercoNews: IntercoNewsItem[]
  intercoLoading: boolean
  fpNews: IntercoNewsItem[]
  fpLoading: boolean
  // Données statiques
  usefulLinks: UsefulLink[]
  baseUrl: string
}

// --- MENU D'ACCUEIL (vue « menu ») : barre d'accès rapide, actualités CIG/CDG & veille
// juridique, carrousels CFDT Interco / Fonction publique, blocs latéraux et fenêtres
// « À connaître / Liens Utiles / À voir » ---
const HomeMenu: React.FC<HomeMenuProps> = ({
  chatState,
  setChatState,
  handleDomainSelection,
  openCalculatorsLanding,
  openMetiersView,
  hoveredQuickAccessIndex,
  setHoveredQuickAccessIndex,
  intercoNews,
  intercoLoading,
  fpNews,
  fpLoading,
  usefulLinks,
  baseUrl: BASE_URL,
}) => {
  // Refs des carrousels CFDT Interco / Fonction publique — le drag et la molette
  // sont câblés ici même : l'effet se ré-exécute à chaque montage de la vue,
  // ce qui restaure le drag après un aller-retour menu → autre vue → menu.
  const intercoCarouselRef = useRef<HTMLDivElement>(null)
  const fpCarouselRef = useRef<HTMLDivElement>(null)

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
  return (
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
                className="relative flex flex-col items-center justify-start gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 group min-w-[105px] sm:min-w-[140px] p-2.5 sm:p-3.5 rounded-2xl hover:-translate-y-1 shrink-0 snap-center"
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
                <span className="relative z-10 text-xs sm:text-base font-extrabold text-center tracking-tight leading-tight min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center">J'ai une<br />question IA</span>
              </button>

              {/* 2. Spotlight Espace Jeux Button */}
              <button
                onClick={() => setChatState({ ...chatState, currentView: 'jeux' })}
                className="relative flex flex-col items-center justify-start gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-200 hover:text-pink-600 dark:hover:text-pink-400 transition-all duration-200 group min-w-[105px] sm:min-w-[140px] p-2.5 sm:p-3.5 rounded-2xl hover:-translate-y-1 shrink-0 snap-center"
                onMouseEnter={() => setHoveredQuickAccessIndex(1)}
                onMouseLeave={() => setHoveredQuickAccessIndex(null)}
              >
                <AnimatePresence>
                  {hoveredQuickAccessIndex === 1 && (
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
                <span className="relative z-10 text-xs sm:text-base font-extrabold text-center tracking-tight leading-tight min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center">Espace<br />Jeux</span>
              </button>

              {/* 3. Spotlight Calculators Button */}
              <button
                onClick={openCalculatorsLanding}
                className="relative flex flex-col items-center justify-start gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200 group min-w-[105px] sm:min-w-[140px] p-2.5 sm:p-3.5 rounded-2xl hover:-translate-y-1 shrink-0 snap-center"
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
                <span className="relative z-10 text-xs sm:text-base font-extrabold text-center tracking-tight leading-tight min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center">Boîte à<br />Outils</span>
              </button>

              {/* 4. Spotlight Metiers Button */}
              <button
                onClick={openMetiersView}
                className="relative flex flex-col items-center justify-start gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 group min-w-[105px] sm:min-w-[140px] p-2.5 sm:p-3.5 rounded-2xl hover:-translate-y-1 shrink-0 snap-center"
                onMouseEnter={() => setHoveredQuickAccessIndex(3)}
                onMouseLeave={() => setHoveredQuickAccessIndex(null)}
              >
                <AnimatePresence>
                  {hoveredQuickAccessIndex === 3 && (
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
                <span className="relative z-10 text-xs sm:text-base font-extrabold text-center tracking-tight leading-tight min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center">Aides aux<br />Gestionnaires</span>
              </button>

              {/* 5. Spotlight FAQ Button */}
              <button
                onClick={() => setChatState({ ...chatState, currentView: 'faq' })}
                className="relative flex flex-col items-center justify-start gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 transition-all duration-200 group min-w-[105px] sm:min-w-[140px] p-2.5 sm:p-3.5 rounded-2xl hover:-translate-y-1 shrink-0 snap-center"
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
                <span className="relative z-10 text-xs sm:text-base font-extrabold text-center tracking-tight leading-tight min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center">Questions<br />Fréquentes</span>
              </button>

              {/* 6. Spotlight Coin RH Button (Légalité & Actes) */}
              <button
                onClick={() => {
                  setChatState({ ...chatState, currentView: 'coin-rh' });
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                }}
                className="relative flex flex-col items-center justify-start gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 group min-w-[105px] sm:min-w-[140px] p-2.5 sm:p-3.5 rounded-2xl hover:-translate-y-1 shrink-0 snap-center"
                onMouseEnter={() => setHoveredQuickAccessIndex(66)}
                onMouseLeave={() => setHoveredQuickAccessIndex(null)}
              >
                <AnimatePresence>
                  {hoveredQuickAccessIndex === 66 && (
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
                  <FileSignature className="w-8 h-8 sm:w-11 sm:h-11" />
                </div>
                <span className="relative z-10 text-xs sm:text-base font-extrabold text-center tracking-tight leading-tight min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center">Coin du<br />Défenseur</span>
              </button>

              {/* 7. Spotlight Podcasts Button */}
              <button
                onClick={() => setChatState({ ...chatState, currentView: 'podcasts' })}
                className="relative flex flex-col items-center justify-start gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 group min-w-[105px] sm:min-w-[140px] p-2.5 sm:p-3.5 rounded-2xl hover:-translate-y-1 shrink-0 snap-center"
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
                <span className="relative z-10 text-xs sm:text-base font-extrabold text-center tracking-tight leading-tight min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center">Podcasts<br /><span className="opacity-0 select-none text-[0px] leading-none">&nbsp;</span></span>
              </button>

              {/* 7. Spotlight Bourse Emploi Anchor Link */}
              <a
                href="https://www.emploi-territorial.fr/emploi-mobilite/?search-col=99599"
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex flex-col items-center justify-start gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200 group min-w-[105px] sm:min-w-[140px] p-2.5 sm:p-3.5 rounded-2xl hover:-translate-y-1 shrink-0 snap-center"
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
                <span className="relative z-10 text-xs sm:text-base font-extrabold text-center tracking-tight leading-tight min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center">Bourse<br />Emploi</span>
              </a>

              {/* 8. Spotlight Concours Anchor Link */}
              <a
                href="https://www.concours-territorial.fr/Index.aspx"
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex flex-col items-center justify-start gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 group min-w-[105px] sm:min-w-[140px] p-2.5 sm:p-3.5 rounded-2xl hover:-translate-y-1 shrink-0 snap-center"
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
                <span className="relative z-10 text-xs sm:text-base font-extrabold text-center tracking-tight leading-tight min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center">Concours<br />FPT</span>
              </a>

            </div>
          </div>

        </div>

        {/* --- FENÊTRE UNIQUE COMBINÉE : ACTUALITÉS SYNDICALES & VEILLE JURIDIQUE CÔTE À CÔTE --- */}
        <div className="mt-8 mb-8">
          <div className="w-full bg-white/95 dark:bg-slate-900/95 rounded-3xl p-4 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative z-10 min-w-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800 min-w-0">

              {/* CÔTÉ GAUCHE : Actualités Syndicales & Statutaires */}
              <div className="lg:pr-8 flex flex-col justify-between min-w-0">
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-900/40 rounded-xl border border-blue-200 dark:border-blue-800 shadow-xs shrink-0">
                        <Newspaper className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-wide break-words">
                        Actualités <span className="text-blue-600 dark:text-blue-400">de tous les CIG/CDG</span>
                      </h3>
                    </div>
                  </div>

                  {/* Article principal Statutaire CIG */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 group/card min-w-0">
                    <div className="relative w-full sm:w-44 md:w-48 h-36 overflow-hidden rounded-2xl shrink-0 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                      <img loading="lazy" src="https://www.cig929394.fr/wp-content/uploads/2026/08/FOCUS-BIP_Actu-aout2026.png" alt="Retraites, congés de maladie et temps partiel thérapeutique" className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300" />
                      <span className="absolute top-2 left-2 inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 shadow-xs">
                        Statutaire CIG (Août 2026)
                      </span>
                    </div>
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <div className="min-w-0">
                        <h4 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors leading-snug mb-2 break-words">
                          <a href="https://www.cig929394.fr/actualites/retraites-conges-de-maladie-et-temps-partiel-therapeutique-de-nouvelles-regles/" target="_blank" rel="noopener noreferrer">
                            Retraites, congés de maladie et temps partiel thérapeutique : de nouvelles règles
                          </a>
                        </h4>
                        <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed break-words">
                          Nouvelles règles d'août et septembre 2026 : encadrement du temps partiel thérapeutique (réponse sous 30j, refus motivé), plafonnement des arrêts maladie (31j initial / 62j prolongation) et bonification retraite (1 trimestre/enfant).
                        </p>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                        <button
                          type="button"
                          onClick={() => setChatState({ ...chatState, currentView: 'veille-cdg' })}
                          className="inline-flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs sm:text-sm bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-3.5 py-1.5 rounded-full border border-blue-200/80 dark:border-blue-800/80 transition-all duration-200 shadow-2xs hover:scale-105 active:scale-95 group/cig cursor-pointer shrink-0"
                        >
                          TOUS LES CIG / CDG
                          <ArrowRight className="w-3.5 h-3.5 text-blue-500 group-hover/cig:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CÔTÉ DROIT : Veille Juridique */}
              <div
                onClick={() => setChatState({ ...chatState, currentView: 'veille' })}
                className="lg:pl-8 pt-6 lg:pt-0 flex flex-col justify-between cursor-pointer group/veille min-w-0"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6 min-w-0">
                    <div className="p-2.5 bg-purple-100/60 dark:bg-purple-900/40 rounded-xl border border-purple-200 dark:border-purple-800/60 shadow-sm flex items-center justify-center shrink-0">
                      <Scale className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-wide break-words">
                      Veille <span className="text-purple-600 dark:text-purple-400">Juridique & Statutaire</span>
                    </h3>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 mb-4 group/card min-w-0">
                    <div className="relative w-full sm:w-44 md:w-48 h-36 overflow-hidden rounded-2xl shrink-0 border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50">
                      <img loading="lazy" src="/images/legal_news_illustration.png" alt="Veille Juridique" className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300" />
                      <span className="absolute top-2 left-2 inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-900/80 text-purple-300 border border-purple-500/30">
                        Juridique
                      </span>
                    </div>
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <div className="min-w-0">
                        <h4 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 group-hover/veille:text-purple-600 dark:group-hover/veille:text-purple-400 transition-colors leading-snug mb-2 break-words">
                          Veille Juridique & Statutaire (« Vu cette semaine »)
                        </h4>
                        <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium break-words">
                          Découvrez notre veille juridique interactive. Explorez les dernières décisions des tribunaux administratifs et du Conseil d'État, ou testez vos connaissances dans notre Mode Défi Quiz !
                        </p>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                        <span className="font-semibold bg-purple-100/70 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs shrink-0">
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

        {/* --- SECTION VEDETTE : KIOSQUE SYNDICAL (À LIRE) & DESSINE-MOI LE STATUT (MIS EN VALEUR) --- */}
        <div className="mb-12">
          {/* Header de section élégant */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-orange-500 via-amber-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-orange-500/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                    À la Une · Kiosque & Infographies
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Vos lectures & vos repères en{' '}
                  <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-500 bg-clip-text text-transparent">
                    schémas visuels
                  </span>
                </h3>
              </div>
            </div>
          </div>

          {/* Grille des 2 cartes Vedettes 50% / 50% */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 sm:gap-8">

            {/* CARTE 1 : À LIRE - LE JOURNAL CFDT GENNEVILLIERS */}
            <div className="relative bg-gradient-to-br from-white via-orange-50/40 to-amber-50/30 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-orange-950/25 rounded-3xl p-6 sm:p-7 border-2 border-orange-200/90 dark:border-orange-500/30 shadow-2xl shadow-orange-500/10 dark:shadow-orange-950/30 transition-all duration-300 hover:border-orange-400 dark:hover:border-orange-400/60 overflow-hidden group flex flex-col justify-between">
              <BorderBeam size={220} duration={12} delay={0} colorFrom="#f97316" colorTo="#fbbf24" />
              
              {/* Lueur d'ambiance */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-orange-400/20 to-amber-400/10 dark:from-orange-500/15 dark:to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                {/* En-tête de carte */}
                <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-orange-100/80 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                        Kiosque Syndical
                      </span>
                      <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        À lire · Journal CFDT
                      </h4>
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-orange-700 dark:text-orange-300 bg-orange-100/80 dark:bg-orange-950/60 px-3 py-1 rounded-full border border-orange-300/70 dark:border-orange-800/70 shrink-0">
                    Rentrée 2026
                  </span>
                </div>

                {/* Corps de carte : disposition responsive Image + Contenu */}
                <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start mb-5">
                  {/* Aperçu Couverture Magazine 3D */}
                  <a
                    href="https://intranet.ville-gennevilliers.fr/Statics/media/syndicats/cfdt/journaux/Journal-Gennevilliers-rentree-2026.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative shrink-0 w-44 sm:w-48 h-60 sm:h-64 rounded-2xl overflow-hidden bg-slate-900 border-2 border-orange-300/80 dark:border-orange-600/40 shadow-xl shadow-orange-950/20 group-hover:scale-[1.03] transition-all duration-300 cursor-pointer block group/cover"
                  >
                    <img
                      src={`${BASE_URL}journal-rentree-2026.png`}
                      alt="Journal CFDT Rentrée 2026"
                      className="w-full h-full object-cover object-top group-hover/cover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = `${BASE_URL}journal-2026.png`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
                      <span className="text-[10px] font-black text-white bg-orange-600/90 backdrop-blur-xs px-2.5 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        Aperçu PDF
                      </span>
                    </div>
                  </a>

                  {/* Détails et dossiers */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                    <div>
                      <h5 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        Écho de la CFDT Gennevilliers
                      </h5>
                      <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
                        Le journal d'information et d'action de vos collègues territoriaux. Toutes les actualités locales, réformes statutaires et avancées concrètes.
                      </p>

                      {/* Dossiers phares */}
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                          <span className="font-semibold">Pouvoir d'achat :</span>
                          <span className="text-slate-500 dark:text-slate-400 truncate">RIFSEEP, CIA et revalorisations</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span className="font-semibold">Temps de travail :</span>
                          <span className="text-slate-500 dark:text-slate-400 truncate">Télétravail et forfaits RTT</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="font-semibold">Carrières & LDG :</span>
                          <span className="text-slate-500 dark:text-slate-400 truncate">Promotions et avancements 2026/2027</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-orange-100/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-orange-500" />
                      <span>Édition spéciale Ville de Gennevilliers · 32 pages</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bouton d'action principal */}
              <a
                href="https://intranet.ville-gennevilliers.fr/Statics/media/syndicats/cfdt/journaux/Journal-Gennevilliers-rentree-2026.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 flex items-center justify-center gap-2.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black py-3 px-4 rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all text-xs sm:text-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger le journal (PDF)</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </div>

            {/* CARTE 2 : DESSINE-MOI LE STATUT */}
            <div
              onClick={() => {
                setChatState({ ...chatState, currentView: 'dessine-moi-le-statut' });
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
              className="relative bg-gradient-to-br from-white via-indigo-50/40 to-purple-50/30 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-indigo-950/25 rounded-3xl p-6 sm:p-7 border-2 border-indigo-200/90 dark:border-indigo-500/30 shadow-2xl shadow-indigo-500/10 dark:shadow-indigo-950/30 transition-all duration-300 hover:border-indigo-400 dark:hover:border-indigo-400/60 overflow-hidden group cursor-pointer flex flex-col justify-between"
            >
              <BorderBeam size={220} duration={12} delay={6} colorFrom="#6366f1" colorTo="#a855f7" />

              {/* Lueur d'ambiance */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-indigo-400/20 to-purple-400/10 dark:from-indigo-500/15 dark:to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                {/* En-tête de carte */}
                <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-indigo-100/80 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl shadow-md shadow-indigo-500/20 flex items-center justify-center shrink-0">
                      <Palette className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Bibliothèque Visuelle RH
                      </span>
                      <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight flex items-center gap-1.5">
                        <span>Dessine-moi le statut</span>
                        <span className="text-base">🎨</span>
                      </h4>
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-300/70 dark:border-indigo-800/70 shrink-0">
                    +100 Schémas Clairs
                  </span>
                </div>

                {/* Corps de carte : disposition responsive Image + Contenu */}
                <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start mb-5">
                  {/* Aperçu Illustration Dessine-moi */}
                  <div className="relative shrink-0 w-44 sm:w-48 h-60 sm:h-64 rounded-2xl overflow-hidden bg-slate-900 border-2 border-indigo-300/80 dark:border-indigo-600/40 shadow-xl shadow-indigo-950/20 group-hover:scale-[1.03] transition-all duration-300 block group/cover">
                    <img
                      src="/images/dessine-moi-statut.jpg"
                      alt="Dessine-moi le statut"
                      className="w-full h-full object-cover object-top group-hover/cover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "https://www.cig929394.fr/wp-content/uploads/2025/09/info_ppr_2024_06_vf-179x252.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
                      <span className="text-[10px] font-black text-white bg-indigo-600/90 backdrop-blur-xs px-2.5 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Logigrammes RH
                      </span>
                    </div>
                  </div>

                  {/* Détails et thématiques */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                    <div>
                      <h5 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        Le Statut en Infographies & Parcours
                      </h5>
                      <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
                        Le droit de la fonction publique territoriale décrypté en logigrammes pas-à-pas. Tout comprendre de vos droits sans jargon administratif.
                      </p>

                      {/* 4 Thématiques cliquables */}
                      <div className="mt-3 grid grid-cols-2 gap-1.5">
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-indigo-100 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                          <span>🏥</span>
                          <span className="font-semibold truncate">Congés & Santé</span>
                        </div>
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-indigo-100 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                          <span>📈</span>
                          <span className="font-semibold truncate">Carrières & Grades</span>
                        </div>
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-indigo-100 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                          <span>⚖️</span>
                          <span className="font-semibold truncate">Discipline & Droits</span>
                        </div>
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-indigo-100 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                          <span>💰</span>
                          <span className="font-semibold truncate">Primes & RIFSEEP</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-indigo-100/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Fiches CIG & CDG officielles synthétisées · Accès libre</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bouton d'action principal */}
              <div className="relative z-10 flex items-center justify-center gap-2.5 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white font-black py-3 px-4 rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all text-xs sm:text-sm">
                <Palette className="w-4 h-4" />
                <span>Explorer les 100+ infographies</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </div>

        {/* --- SECTION FLUX & ACTUALITÉS : LES 2 CARROUSELS EN PLEINE LARGEUR --- */}
        <div className="flex flex-col gap-8 mb-12">

          {/* CARROUSEL 1 DÉTACHÉ : En direct de la CFDT Interco */}
          <div className="w-full bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative z-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Rss className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  En direct de la <span className="text-blue-600 dark:text-blue-400">CFDT Interco</span>
                </h4>
              </div>

              {intercoLoading ? (
                <div className="flex gap-4 overflow-hidden">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex-none w-56 h-32 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse border border-slate-200" />
                  ))}
                </div>
              ) : (
                <div className="relative group/carousel">
                  <button
                    type="button"
                    aria-label="Défiler vers la gauche"
                    onClick={() => {
                      if (intercoCarouselRef.current) {
                        intercoCarouselRef.current.scrollBy({ left: -280, behavior: 'smooth' })
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
                        intercoCarouselRef.current.scrollBy({ left: 280, behavior: 'smooth' })
                      }
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-slate-200 flex items-center justify-center text-slate-700 shadow-lg opacity-80 sm:opacity-0 sm:group-hover/carousel:opacity-100 hover:opacity-100 hover:bg-white hover:scale-110 active:scale-95 transition-all duration-150"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div
                    ref={intercoCarouselRef}
                    className="flex gap-3.5 overflow-x-auto pb-2 scroll-smooth interco-carousel-track cursor-grab active:cursor-grabbing select-none"
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
                          className="group/card flex-none w-56 sm:w-60 flex flex-col bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-xl overflow-hidden hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 shadow-xs"
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
          </div>

          {/* CARROUSEL 2 : Actualités de la Fonction Publique */}
          <div className="w-full bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative z-10 flex flex-col justify-between">
            <div>
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
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex-none w-56 h-32 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse border border-slate-200" />
                  ))}
                </div>
              ) : (
                <div className="relative group/carousel-fp">
                  <button
                    type="button"
                    aria-label="Défiler vers la gauche"
                    onClick={() => {
                      if (fpCarouselRef.current) {
                        fpCarouselRef.current.scrollBy({ left: -280, behavior: 'smooth' })
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
                        fpCarouselRef.current.scrollBy({ left: 280, behavior: 'smooth' })
                      }
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-slate-200 flex items-center justify-center text-slate-700 shadow-lg opacity-80 sm:opacity-0 sm:group-hover/carousel-fp:opacity-100 hover:opacity-100 hover:bg-white hover:scale-110 active:scale-95 transition-all duration-150"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div
                    ref={fpCarouselRef}
                    className="flex gap-3.5 overflow-x-auto pb-2 scroll-smooth interco-carousel-track cursor-grab active:cursor-grabbing select-none"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    {fpNews.map((article, i) => (
                      <a
                        key={i}
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/card flex-none w-56 sm:w-60 flex flex-col bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-xl overflow-hidden hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 shadow-xs"
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

        </div>

        {/* --- BLOC CARRIÈRE FULL-WIDTH : VOS COLLÈGUES DE LA CFDT DE GENNEVILLIERS VOUS AIDENT POUR VOTRE CARRIÈRE --- */}
        <div className="relative w-full bg-gradient-to-br from-white via-orange-50/40 to-amber-50/30 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-orange-950/20 rounded-3xl p-6 sm:p-8 border-2 border-orange-200/80 dark:border-orange-500/30 shadow-2xl shadow-orange-500/10 dark:shadow-orange-950/30 transition-all duration-300 hover:border-orange-400 dark:hover:border-orange-400/60 overflow-hidden group mb-12">
          {/* Lueur d'ambiance en arrière-plan */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-amber-400/10 dark:from-orange-500/15 dark:to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-gradient-to-tr from-amber-400/15 to-orange-500/10 dark:from-indigo-600/10 dark:to-transparent rounded-full blur-3xl pointer-events-none" />
          
          {/* Bordure lumineuse animée */}
          <BorderBeam size={260} duration={14} delay={0} colorFrom="#f97316" colorTo="#fbbf24" />

          <div className="relative z-10">
            {/* En-tête du bloc */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-5 border-b border-orange-100/80 dark:border-slate-800">
              <div className="flex items-start sm:items-center gap-4">
                <div className="p-3.5 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shrink-0">
                  <Briefcase className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                      Espace Carrière CFDT Gennevilliers
                    </span>
                    <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-xs">
                      Simulateur Interactif 2027
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    Vos collègues CFDT de Gennevilliers vous aident pour{' '}
                    <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                      votre carrière
                    </span>
                  </h3>
                </div>
              </div>

              {/* Bouton d'accès direct */}
              <button
                type="button"
                onClick={() => {
                  setChatState(prev => ({ ...prev, currentView: 'simul-agent' }))
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
                }}
                className="cursor-pointer self-start lg:self-center inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Lancer le simulateur</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-medium mb-6 leading-relaxed">
              Vous vous posez des questions sur votre avancement, vos points de promotion ou l'impact d'un concours ? Choisissez une situation ci-dessous pour ouvrir le <strong className="text-orange-600 dark:text-orange-400 font-bold">Simulateur Statutaire & LDG Interactif</strong> :
            </p>

            {/* Grille des 4 questions clés - 2 colonnes spacieuses pour une lisibilité optimale */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 mb-6">
              {/* Question 1 : Échelon */}
              <div
                onClick={() => {
                  setChatState(prev => ({ ...prev, currentView: 'simul-agent' }))
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
                }}
                className="group/card cursor-pointer relative bg-white/95 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 border-2 border-amber-200/70 hover:border-amber-400 dark:border-slate-700/80 dark:hover:border-amber-500/80 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover/card:bg-amber-500 group-hover/card:text-white transition-all duration-200 shrink-0 shadow-xs">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-slate-900 dark:text-white font-extrabold text-base sm:text-lg leading-snug group-hover/card:text-amber-600 dark:group-hover/card:text-amber-400 transition-colors">
                      Quand est mon prochain avancement d'échelon ?
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                      Dates d'ancienneté exactes, cadences statutaires et projection de votre indice majoré.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                  <span>Calculer ma date d'échelon</span>
                  <span className="inline-flex items-center gap-1 group-hover/card:translate-x-1 transition-transform">
                    <span>Ouvrir</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Question 2 : Grade */}
              <div
                onClick={() => {
                  setChatState(prev => ({ ...prev, currentView: 'simul-agent' }))
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
                }}
                className="group/card cursor-pointer relative bg-white/95 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 border-2 border-emerald-200/70 hover:border-emerald-400 dark:border-slate-700/80 dark:hover:border-emerald-500/80 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover/card:bg-emerald-500 group-hover/card:text-white transition-all duration-200 shrink-0 shadow-xs">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-slate-900 dark:text-white font-extrabold text-base sm:text-lg leading-snug group-hover/card:text-emerald-600 dark:group-hover/card:text-emerald-400 transition-colors">
                      Vais-je avoir un avancement de grade cette année ?
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                      Conditions statutaires : ancienneté minimale, échelon requis et quotas de promotion.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Tester mon éligibilité au grade</span>
                  <span className="inline-flex items-center gap-1 group-hover/card:translate-x-1 transition-transform">
                    <span>Ouvrir</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Question 3 : Promotion Interne LDG */}
              <div
                onClick={() => {
                  setChatState(prev => ({ ...prev, currentView: 'simul-agent' }))
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
                }}
                className="group/card cursor-pointer relative bg-white/95 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 border-2 border-blue-200/70 hover:border-blue-400 dark:border-slate-700/80 dark:hover:border-blue-500/80 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center group-hover/card:bg-blue-500 group-hover/card:text-white transition-all duration-200 shrink-0 shadow-xs">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-slate-900 dark:text-white font-extrabold text-base sm:text-lg leading-snug group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors">
                      Comment savoir mes points pour la promotion interne ?
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                      Simulateur pas-à-pas des 6 LDG-PI de Gennevilliers avec liste des justificatifs DRH.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                  <span>Simuler mon barème LDG-PI</span>
                  <span className="inline-flex items-center gap-1 group-hover/card:translate-x-1 transition-transform">
                    <span>Ouvrir</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Question 4 : Concours & Examens Pro */}
              <div
                onClick={() => {
                  setChatState(prev => ({ ...prev, currentView: 'simul-agent' }))
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
                }}
                className="group/card cursor-pointer relative bg-white/95 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 border-2 border-purple-200/70 hover:border-purple-400 dark:border-slate-700/80 dark:hover:border-purple-500/80 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center group-hover/card:bg-purple-500 group-hover/card:text-white transition-all duration-200 shrink-0 shadow-xs">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-slate-900 dark:text-white font-extrabold text-base sm:text-lg leading-snug group-hover/card:text-purple-600 dark:group-hover/card:text-purple-400 transition-colors">
                      Quel changement si je réussis mon examen pro ou concours ?
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                      Reclassement à l'échelon égal ou supérieur, reprise d'ancienneté et nouvelle rémunération.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
                  <span>Calculer mon reclassement</span>
                  <span className="inline-flex items-center gap-1 group-hover/card:translate-x-1 transition-transform">
                    <span>Ouvrir</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* Bandeau d'actions et garanties */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 border-t border-orange-100/80 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  100% Anonyme & Gratuit
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  Conforme CGFP & CIG Petite Couronne
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  Frise chronologique, LDG-PI & Fiche DRH
                </span>
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setChatState(prev => ({ ...prev, currentView: 'simul-agent' }))
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
                  }}
                  className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-extrabold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Accéder au Simulateur de Carrière</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href={`${BASE_URL}simul-agent/index.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Ouvrir dans un nouvel onglet"
                  className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-500 text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors shadow-xs shrink-0"
                >
                  <ExternalLinkIcon className="w-4 h-4" />
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

              {/* Action Button: Docuthèque RAG */}
              <button
                onClick={() => {
                  setChatState({ ...chatState, currentView: 'docutheque-rag' });
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                }}
                className="mt-4 flex items-center justify-center gap-2 w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-2.5 px-3 rounded-xl shadow-md hover:shadow-lg transition-all text-xs group-hover:scale-[1.02]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Rechercher dans les 111 docs RH (RAG)</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Pied de carte */}
            <div className="mt-4 pt-3 border-t border-rose-100/60 dark:border-rose-900/40 flex items-center justify-between text-xs sm:text-sm text-rose-700 dark:text-rose-400 font-extrabold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                111 documents certifiés RH
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
  )
}

export default HomeMenu
