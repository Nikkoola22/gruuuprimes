import React from "react";
import { ArrowLeft, Newspaper, ArrowRight, Rss, BookOpen, ExternalLink, FileText, Sparkles } from "lucide-react";
import { SpotlightCard } from "./ui/SpotlightCard.tsx";
import { BorderGlow } from "./ui/BorderGlow.tsx";

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
  onNavigateToVeille?: () => void;
}

const Actualites: React.FC<ActualitesProps> = ({ news, onClose, baseUrl, onNavigateToVeille }) => {
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto overflow-x-hidden overscroll-contain bg-slate-100 text-slate-900 font-sans">
      {/* Top Header Banner */}
      <section className="relative z-40 bg-white py-10 text-center border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 flex items-center gap-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl">
                <Newspaper className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              Actualités <span className="text-blue-600">CFDT & Statut RH</span>
            </h2>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onClose();
              }}
              className="relative z-50 pointer-events-auto inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-red-500/30 transition-all duration-200 group shrink-0"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Retour</span>
            </button>
          </div>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed text-left font-medium max-w-3xl">
            Restez informés en temps réel avec les toutes dernières publications syndicales, décisions d'actualité et droits des agents.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Left Main Column: Articles */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-wide">
                À la Une — Statut & Actualités
              </h3>
            </div>

            {/* --- FEATURED CIG CARD --- */}
            <BorderGlow glowColor="from-blue-500 via-cyan-400 to-blue-600" className="mb-10">
              <div className="p-6 flex flex-col md:flex-row gap-6 items-center bg-white rounded-2xl">
                <div className="relative w-full md:w-72 h-48 overflow-hidden rounded-xl shrink-0 border border-slate-200 bg-slate-50">
                  <img
                    src="https://www.cig929394.fr/wp-content/uploads/2026/08/FOCUS-BIP_Actu-aout2026.png"
                    alt="Retraites, congés de maladie et temps partiel thérapeutique"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 inline-block text-xs font-bold px-3 py-1 rounded-full bg-white/90 backdrop-blur text-red-600 border border-red-200 shadow-md">
                    Statutaire CIG (Août 2026)
                  </span>
                </div>
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors leading-snug mb-3">
                      <a
                        href="https://www.cig929394.fr/actualites/retraites-conges-de-maladie-et-temps-partiel-therapeutique-de-nouvelles-regles/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Retraites, congés de maladie et temps partiel thérapeutique : de nouvelles règles
                      </a>
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      Plusieurs mesures entrant en vigueur en août et septembre 2026 modifient le temps partiel thérapeutique (délai 30j, refus motivé), les congés maladie (plafond 31j initial / 62j prolongation, contrôle à domicile) et la retraite (bonification 1 trimestre accouchement).
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span className="text-blue-700 font-bold">CIG Petite Couronne</span>
                    {onNavigateToVeille ? (
                      <button
                        type="button"
                        onClick={onNavigateToVeille}
                        className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        Toutes les actus CIG & CDG <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <a
                        href="https://www.cig929394.fr/actualites/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        Toutes les actus CIG <ArrowRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </BorderGlow>

            {/* --- ACTUALITÉS CFDT INTERCO --- */}
            <div className="flex items-center gap-3 mt-10 mb-6">
              <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200">
                <Rss className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 tracking-wide">
                En direct de la CFDT Interco
              </h4>
            </div>

            {news.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-pulse">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between h-72">
                    <div className="w-full h-36 bg-slate-200 rounded-xl mb-4" />
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-5/6" />
                      <div className="h-3 bg-slate-200 rounded w-full" />
                      <div className="h-3 bg-slate-200 rounded w-4/6" />
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex justify-between">
                      <div className="h-3 bg-slate-200 rounded w-20" />
                      <div className="h-3 bg-slate-200 rounded w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {news.map((article, i) => {
                  const date = article.pubDate
                    ? new Date(article.pubDate).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                    : "";

                  return (
                    <SpotlightCard
                      key={i}
                      spotlightColor="rgba(37, 99, 235, 0.12)"
                      className="w-full flex flex-col justify-between bg-white border border-slate-200/90 hover:border-blue-500 rounded-2xl overflow-hidden shadow-md hover:shadow-xl p-0 group/card transition-all duration-300 hover:-translate-y-1"
                    >
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col h-full p-5"
                      >
                        {/* Image de l'article */}
                        <div className="relative w-full h-40 overflow-hidden rounded-xl bg-slate-50 mb-4 border border-slate-100">
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
                            <span className="absolute top-3 left-3 inline-block text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/95 backdrop-blur text-blue-700 border border-blue-200 shadow-sm">
                              {article.category}
                            </span>
                          )}
                        </div>

                        {/* Contenu textuel haute visibilité */}
                        <div className="flex flex-col justify-between flex-grow">
                          <div>
                            <h4 className="text-slate-900 font-bold text-base leading-snug group-hover/card:text-blue-600 transition-colors duration-150 mb-2 line-clamp-2">
                              {article.title}
                            </h4>
                            {article.description && (
                              <p className="text-slate-600 text-xs font-medium line-clamp-3 mb-4 leading-relaxed">
                                {article.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                            <span className="text-xs text-slate-500 font-medium">{date}</span>
                            <span className="text-xs font-bold text-blue-600 flex items-center gap-1 opacity-90 group-hover/card:opacity-100 transition-opacity">
                              Lire l'article <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </a>
                    </SpotlightCard>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Publications & Journal */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-200">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-wide">
                À Télécharger
              </h3>
            </div>

            <div className="flex flex-col gap-6 flex-grow">
              <SpotlightCard spotlightColor="rgba(249, 115, 22, 0.15)" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md flex flex-col">
                <a
                  href="https://intranet.ville-gennevilliers.fr/Statics/media/syndicats/cfdt/journaux/journal-gennevilliers-printemps-2026.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col h-full"
                >
                  <div className="overflow-hidden rounded-xl shadow-xs mb-4 relative min-h-[11rem] max-h-[13rem] border border-slate-100 bg-slate-50 flex items-center justify-center">
                    <img
                      src={`${baseUrl}journal-2026.png`}
                      alt="Journal CFDT Printemps 2026"
                      className="w-full h-full object-contain transform hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex flex-col shrink-0">
                    <h4 className="text-slate-900 text-base font-bold mb-1 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-500 shrink-0" />
                      Journal - Printemps 2026
                    </h4>
                    <p className="text-slate-600 text-xs mb-4 leading-relaxed font-medium">
                      Écho et dossier d'actualité de la CFDT Gennevilliers.
                    </p>
                    <div className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all text-xs">
                      Télécharger (PDF)
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </a>
              </SpotlightCard>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Actualites;
