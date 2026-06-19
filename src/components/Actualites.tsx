import React from "react";
import { ArrowLeft, Newspaper, ArrowRight, Rss, BookOpen } from "lucide-react";

interface IntercoNewsItem {
  title: string;
  link: string;
  pubDate: string;
  category: string;
  description: string;
  imageUrl?: string;
}

interface ActualitesProps {
  news: IntercoNewsItem[];
  onClose: () => void;
  baseUrl: string;
}

const Actualites: React.FC<ActualitesProps> = ({ news, onClose, baseUrl }) => {
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto overflow-x-hidden overscroll-contain bg-slate-50 dark:bg-slate-900">
      {/* Intro Section */}
      <section className="relative z-40 bg-white dark:bg-slate-800/95 dark:bg-slate-900/95 py-12 text-center border-b border-slate-200 shadow-sm glass-banner">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Newspaper className="w-8 h-8 text-blue-600" />
              Actualités CFDT
            </h2>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onClose();
              }}
              className="relative z-50 pointer-events-auto flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-full font-medium transition-all text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed text-left font-medium">
            Restez informés avec les dernières actualités syndicales et nos publications.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Colonne de gauche: Actualités */}
          <div className="lg:col-span-3 bg-gradient-to-br from-white/90 via-blue-50/40 to-white/90 backdrop-blur-xl rounded-3xl p-8 border border-blue-200 shadow-xl shadow-blue-100/50">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-blue-100/50 rounded-xl border border-blue-200 shadow-sm flex items-center justify-center">
                <Newspaper className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white tracking-wide">
                <span className="relative inline-block z-10">
                  <span className="relative z-20 text-slate-800 dark:text-white font-black tracking-tight">Actualités Syndicales & Statutaires</span>
                  <span className="absolute bottom-1 left-[-2%] w-[104%] h-3.5 bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-300 opacity-60 -skew-x-12 -rotate-2 z-0 rounded-sm"></span>
                </span>
              </h3>
            </div>
            
            {/* --- ACTUALITÉ STATUTAIRE CIG --- */}
            <div className="flex flex-col md:flex-row gap-6 mb-12 border-b border-slate-200 pb-10 group/card">
              <div className="relative w-full md:w-72 h-48 overflow-hidden rounded-xl shrink-0 border border-slate-200 bg-slate-50 dark:bg-slate-900">
                <img src="https://www.cig929394.fr/wp-content/uploads/2026/06/Emplois-superieurs-480x252.jpg" alt="Réforme encadrement" className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300" />
                <span className="absolute top-3 left-3 inline-block text-[11px] font-medium px-2.5 py-1 rounded-full bg-white dark:bg-slate-800/90 backdrop-blur text-red-600 border border-red-200 shadow-sm">
                  Statutaire
                </span>
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <h4 className="text-xl font-bold text-slate-800 dark:text-white mt-1 hover:text-blue-600 transition-colors leading-snug mb-3">
                    <a href="https://www.cig929394.fr/actualites/reforme-de-lencadrement-superieur-au-1er-juillet-2026/" target="_blank" rel="noopener noreferrer">
                      Réforme de l'encadrement supérieur au 1er juillet 2026
                    </a>
                  </h4>
                  <p className="text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    Retrouvez les détails de la réforme de l'encadrement supérieur de la fonction publique territoriale applicable au 1er juillet 2026 sur le site du CIG Petite Couronne.
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 font-medium">
                  <span>CIG Petite Couronne</span>
                  <a href="https://www.cig929394.fr/actualites/" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    Toutes les actus CIG <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* --- ACTUALITÉS CFDT INTERCO --- */}
            <div className="flex items-center gap-3 mt-12 mb-8">
              <div className="p-2.5 bg-blue-100/50 rounded-xl border border-blue-200 shadow-sm flex items-center justify-center">
                <Rss className="w-6 h-6 text-blue-500" />
              </div>
              <h4 className="text-2xl font-bold text-slate-800 dark:text-white tracking-wide">
                En direct de la CFDT Interco
              </h4>
            </div>

            {news.length === 0 ? (
              <div className="text-center text-slate-500 dark:text-slate-400 font-medium text-lg py-12">
                Aucune actualité disponible pour le moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center">
                {news.map((article, i) => {
                  const date = article.pubDate
                    ? new Date(article.pubDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "";

                  return (
                    <a
                      key={i}
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/card w-full flex flex-col bg-white dark:bg-slate-800 border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-md hover:-translate-y-1 transition-all duration-150 shadow-sm"
                    >
                      {/* Image de l'article avec zoom au survol et fallback sur logo CFDT */}
                      <div className="relative w-full h-40 overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                        <img
                          src={article.imageUrl || `${baseUrl}logo-cfdt.jpg`}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = `${baseUrl}logo-cfdt.jpg`;
                          }}
                        />
                        {article.category && (
                          <span className="absolute top-3 left-3 inline-block text-[11px] font-medium px-2.5 py-1 rounded-full bg-white dark:bg-slate-800/90 backdrop-blur text-blue-700 border border-blue-200 shadow-sm">
                            {article.category}
                          </span>
                        )}
                      </div>

                      {/* Détails de la carte */}
                      <div className="p-5 flex flex-col justify-between flex-grow">
                        <div>
                          <h4 className="text-slate-800 dark:text-white font-bold text-base leading-snug group-hover/card:text-blue-600 transition-colors duration-150 mb-2 line-clamp-3">
                            {article.title}
                          </h4>
                          {article.description && (
                            <p className="text-slate-600 dark:text-slate-300 text-sm font-medium line-clamp-3 mb-4">
                              {article.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{date}</span>
                          <span className="text-sm font-bold text-blue-600 flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity duration-150">
                            Lire la suite <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Colonne de droite: À lire */}
          <div className="lg:col-span-1 bg-gradient-to-br from-white/90 via-indigo-50/40 to-white/90 backdrop-blur-xl rounded-3xl p-8 border border-indigo-200 shadow-xl shadow-indigo-100/50 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-indigo-100/50 rounded-xl border border-indigo-200 shadow-sm flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-indigo-500" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white tracking-wide">
                <span className="relative inline-block z-10">
                  <span className="relative z-20 text-slate-800 dark:text-white font-black tracking-tight">À lire</span>
                  <span className="absolute bottom-1 left-[-4%] w-[108%] h-3.5 bg-gradient-to-r from-indigo-300 via-purple-200 to-indigo-300 opacity-60 -skew-x-12 -rotate-2 z-0 rounded-sm"></span>
                </span>
              </h3>
            </div>
            <div className="group bg-white/60 dark:bg-slate-800 border border-indigo-100 rounded-2xl p-6 shadow-sm hover:border-indigo-300 transition-all duration-300 hover:shadow-md flex-grow">
              <a 
                href="https://intranet.ville-gennevilliers.fr/Statics/media/syndicats/cfdt/journaux/journal-gennevilliers-printemps-2026.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col h-full"
              >
                <div className="overflow-hidden rounded-lg shadow-sm mb-4 relative flex-grow min-h-[16rem] border border-slate-100 bg-slate-50 dark:bg-slate-900">
                  <div className="absolute inset-0 bg-blue-50/50 group-hover:bg-transparent transition-colors duration-300 z-10 pointer-events-none rounded-lg"></div>
                  <img 
                    src={`${baseUrl}journal 2026.png`} 
                    alt="Journal CFDT" 
                    className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500 absolute inset-0 mix-blend-multiply" 
                  />
                </div>
                <div className="shrink-0 flex flex-col">
                  <h4 className="text-slate-800 dark:text-white text-lg font-bold mb-2">Le Journal de la CFDT</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 leading-relaxed font-medium line-clamp-2">
                    Découvrez la dernière édition de notre journal.
                  </p>
                  <div className="flex items-center justify-center gap-2 w-full bg-white dark:bg-slate-800 text-blue-700 border border-blue-200 font-bold py-2.5 px-4 rounded-xl shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 transform hover:-translate-y-0.5">
                    Télécharger
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </a>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Actualites;
