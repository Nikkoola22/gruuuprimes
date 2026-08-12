import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Rss, ExternalLink } from 'lucide-react'

interface IntercoArticle {
  title: string
  link: string
  pubDate: string
  category?: string
  description?: string
  imageUrl?: string
}

export default function IntercoCarousel() {
  const [articles, setArticles] = useState<IntercoArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  useEffect(() => {
    const fetchIntercoArticles = async () => {
      try {
        const apiUrl = import.meta.env.DEV ? 'http://localhost:3001/api/interco-rss' : '/api/interco-rss'
        const response = await fetch(apiUrl)
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des actualités')
        }

        const data = await response.json()
        setArticles(data.items || [])
        setError(null)
      } catch (err) {
        console.error('Erreur Interco Carousel:', err)
        setError('Impossible de charger les actualités')
        setArticles([])
      } finally {
        setLoading(false)
      }
    }

    fetchIntercoArticles()

    // Rafraîchir toutes les 15 minutes
    const interval = setInterval(fetchIntercoArticles, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return

    const scrollAmount = 400
    const newScrollPosition =
      scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)

    scrollContainerRef.current.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth'
    })
  }

  const handleScroll = () => {
    if (!scrollContainerRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      // Vérifier l'état initial
      handleScroll()
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [articles])

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Rss className="w-8 h-8 text-indigo-400" />
          </div>
          <p className="text-slate-300">Chargement des actualités...</p>
        </div>
      </div>
    )
  }

  if (error || articles.length === 0) {
    return (
      <div className="w-full bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl p-8 text-center">
        <p className="text-slate-400">{error || 'Aucune actualité disponible'}</p>
      </div>
    )
  }

  return (
    <section className="w-full mt-12 mb-8">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        {/* Titre */}
        <div className="flex items-center gap-3 mb-6">
          <Rss className="w-6 h-6 text-indigo-400 animate-pulse" />
          <h3 className="text-2xl sm:text-3xl font-light text-white">
            Actualités Interco CFDT
          </h3>
        </div>

        {/* Carrousel avec boutons de navigation */}
        <div className="relative">
          {/* Bouton gauche */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white p-2 rounded-full shadow-lg transition-all duration-150 hover:scale-110 -ml-4"
              aria-label="Défiler vers la gauche"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Conteneur de défilement */}
          <div
            ref={scrollContainerRef}
            className="interco-carousel-track flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2"
          >
            {articles.map((article, index) => (
              <a
                key={`${article.link}-${index}`}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group snap-start flex-shrink-0 w-52 sm:w-60 flex flex-col rounded-xl bg-gradient-to-br from-slate-800/50 via-indigo-900/40 to-slate-800/50 border border-indigo-500/30 hover:border-indigo-400/60 overflow-hidden transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-1 backdrop-blur glass-card"
              >
                {/* Image de l'article avec zoom au survol et fallback sur logo CFDT */}
                <div className="relative w-full h-28 overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950 border-b border-indigo-500/30 flex-shrink-0">
                  <img
                    src={article.imageUrl || `${import.meta.env.BASE_URL}logo-cfdt.jpg`}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = `${import.meta.env.BASE_URL}logo-cfdt.jpg`;
                    }}
                  />
                  {article.category && (
                    <span className="absolute top-2 left-2 inline-block px-2 py-0.5 bg-slate-950/85 backdrop-blur border border-amber-500/40 rounded-full text-[10px] font-bold text-amber-300 shadow-sm">
                      {article.category}
                    </span>
                  )}
                </div>

                {/* Contenu */}
                <div className="p-3 flex flex-col justify-between flex-grow">
                  <div>
                    <h4 className="text-xs font-semibold text-white leading-snug mb-1.5 line-clamp-2 group-hover:text-indigo-300 transition-colors">
                      {article.title}
                    </h4>
                    {article.description && (
                      <p className="text-[11px] text-slate-300 line-clamp-2 mb-2">
                        {article.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-700/40">
                    <span className="text-xs text-slate-400 font-light">
                      {new Date(article.pubDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    <div className="flex items-center gap-2 text-indigo-400 group-hover:text-indigo-300 transition-colors">
                      <span className="text-sm font-medium">Lire l'article</span>
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Bouton droit */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white p-2 rounded-full shadow-lg transition-all duration-150 hover:scale-110 -mr-4"
              aria-label="Défiler vers la droite"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Info */}
        <p className="text-center text-xs text-slate-500 mt-4">
          Actualités de <a href="https://interco.cfdt.fr/actualites/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">interco.cfdt.fr</a>
        </p>
      </div>
    </section>
  )
}
