import React, { useState } from "react";
import { ArrowLeft, Newspaper, ArrowRight, Rss, BookOpen, FileText, Sparkles, Layers, Eye } from "lucide-react";
import { SpotlightCard } from "./ui/SpotlightCard.tsx";
import { BorderGlow } from "./ui/BorderGlow.tsx";
import { CFDT_JOURNAUX, type CFDTJournal } from "../data/cfdtJournaux.ts";
import { KiosqueJournauxModal } from "./KiosqueJournauxModal.tsx";
import { getFallbackIntercoImage, resolveIntercoImageUrl } from "../hooks/useNewsFeeds.ts";

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
  onNavigateToJuridique?: () => void;
  onNavigateToNosCom?: () => void;
}

const Actualites: React.FC<ActualitesProps> = ({ news, onClose, baseUrl, onNavigateToVeille, onNavigateToJuridique, onNavigateToNosCom }) => {
  const [showJournauxModal, setShowJournauxModal] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<CFDTJournal>(CFDT_JOURNAUX[0]);

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto overflow-x-hidden overscroll-contain bg-[#F8F9FA] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-700">
      {/* Top Header Banner */}
      <section className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/90 backdrop-blur-3xl py-3 text-center border-b border-slate-200/60 dark:border-white/10 shadow-sm transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-3.5 mb-2">
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onClose();
                }}
                className="relative z-50 pointer-events-auto inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-red-500/30 transition-all duration-200 group shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Retour</span>
              </button>
              <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
                  <Newspaper className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
                </div>
                Actualités <span className="text-blue-600 dark:text-blue-400">CFDT & Statut RH</span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onNavigateToVeille && (
                <button
                  type="button"
                  onClick={onNavigateToVeille}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  <span>Veille CDG & CIG</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {onNavigateToJuridique && (
                <button
                  type="button"
                  onClick={onNavigateToJuridique}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  <span>Veille Juridique</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {onNavigateToNosCom && (
                <button
                  type="button"
                  onClick={onNavigateToNosCom}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  <span>Tracts & Guides CFDT</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed text-left font-medium max-w-3xl">
            Restez informés en temps réel avec les toutes dernières publications syndicales, décisions d&apos;actualité et droits des agents.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

          {/* Left Main Column: Articles */}
          <div className="lg:col-span-3 double-bezel-outer">
            <div className="double-bezel-inner p-4 sm:p-5 h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20">
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-wide">
                  À la Une — Statut & Actualités
                </h3>
              </div>

              {/* --- FEATURED CIG CARD --- */}
              <BorderGlow glowColor="from-blue-500 via-cyan-400 to-blue-600" className="mb-6">
                <div className="p-4 flex flex-col md:flex-row gap-4 items-center bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-white/5">
                  <div className="relative w-full md:w-64 h-40 overflow-hidden rounded-xl shrink-0 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                    <img
                      src="https://www.cig929394.fr/wp-content/uploads/2026/08/FOCUS-BIP_Actu-aout2026.png"
                      alt="Retraites, congés de maladie et temps partiel thérapeutique"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex flex-col justify-between h-full">
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-snug mb-3">
                        <a
                          href="https://www.cig929394.fr/actualites/retraites-conges-de-maladie-et-temps-partiel-therapeutique-de-nouvelles-regles/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Retraites, congés de maladie et temps partiel thérapeutique : de nouvelles règles
                        </a>
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        Plusieurs mesures entrant en vigueur en août et septembre 2026 modifient le temps partiel thérapeutique (délai 30j, refus motivé), les congés maladie (plafond 31j initial / 62j prolongation, contrôle à domicile) et la retraite (bonification 1 trimestre accouchement).
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span className="text-blue-700 dark:text-blue-400 font-bold">CIG Petite Couronne</span>
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
              <div className="flex items-center gap-2 mt-4 mb-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20">
                  <Rss className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">
                  En direct de la CFDT Interco
                </h4>
              </div>

              {news.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between h-64">
                      <div className="w-full h-32 bg-slate-200 dark:bg-slate-800 rounded-xl mb-3" />
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-4/6" />
                      </div>
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between mt-2">
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        className="w-full flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg p-0 group/card transition-all duration-500 hover:-translate-y-1"
                      >
                        <a
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col h-full p-5"
                        >
                          {/* Image de l'article */}
                          <div className="relative w-full h-44 overflow-hidden rounded-xl bg-slate-900 mb-4 border border-slate-100 dark:border-slate-800">
                            <img
                              src={resolveIntercoImageUrl(article.imageUrl, article.title, article.category, baseUrl)}
                              alt=""
                              className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = getFallbackIntercoImage(article.title, article.category, baseUrl);
                              }}
                            />
                            {article.category && (
                              <span className="absolute top-3 left-3 inline-block text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm">
                                {article.category}
                              </span>
                            )}
                          </div>

                          {/* Contenu textuel haute visibilité */}
                          <div className="flex flex-col justify-between flex-grow">
                            <div>
                              <h4 className="text-slate-900 dark:text-white font-bold text-base leading-snug group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors duration-150 mb-2 line-clamp-2">
                                {article.title}
                              </h4>
                              {article.description && (
                                <p className="text-slate-600 dark:text-slate-300 text-xs font-medium line-clamp-3 mb-4 leading-relaxed">
                                  {article.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
                              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{date}</span>
                              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 opacity-90 group-hover/card:opacity-100 transition-opacity">
                                Lire l&apos;article <ArrowRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        </a>
                      </SpotlightCard>
                    );
                  })}
                </div>
              )}
            </div> {/* close inner */}
          </div> {/* close outer */}

          {/* Right Column: Publications & Journal */}
          <div className="lg:col-span-1 double-bezel-outer">
            <div className="double-bezel-inner p-6 flex flex-col h-full">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-200 dark:border-indigo-500/20">
                    <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-wide">
                      À Télécharger
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Kiosque municipal CFDT
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowJournauxModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-100 dark:bg-orange-950/60 hover:bg-orange-200 dark:hover:bg-orange-900/60 text-orange-700 dark:text-orange-300 font-bold text-xs border border-orange-200 dark:border-orange-800 transition-colors cursor-pointer"
                  title="Voir toutes les éditions"
                >
                  <Layers className="w-3.5 h-3.5 text-orange-500" />
                  <span>Kiosque</span>
                </button>
              </div>

              {/* Sélecteur rapide des éditions */}
              <div className="grid grid-cols-2 gap-1.5 mb-4 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                {CFDT_JOURNAUX.map((journal) => {
                  const isActive = selectedJournal.id === journal.id;
                  return (
                    <button
                      key={journal.id}
                      type="button"
                      onClick={() => setSelectedJournal(journal)}
                      className={`text-xs font-bold py-1.5 px-2 rounded-lg transition-all text-center truncate cursor-pointer ${
                        isActive
                          ? 'bg-orange-500 text-white shadow-xs font-extrabold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-orange-600'
                      }`}
                    >
                      {journal.tabLabel || journal.badge}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-6 flex-grow">
                <SpotlightCard spotlightColor="rgba(249, 115, 22, 0.15)" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-md flex flex-col">
                  <div className="flex flex-col h-full">
                    <div
                      onClick={() => setShowJournauxModal(true)}
                      className="overflow-hidden rounded-xl shadow-xs mb-4 relative min-h-[11rem] max-h-[13rem] border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-center cursor-pointer group"
                      title="Cliquez pour ouvrir le kiosque des journaux"
                    >
                      <img
                        key={selectedJournal.id}
                        src={`${baseUrl}${selectedJournal.coverImage}`}
                        alt={`${selectedJournal.title} - ${selectedJournal.badge}`}
                        className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = `${baseUrl}journal-rentree-2026.png`;
                        }}
                      />
                      <div className="absolute top-2 right-2 bg-orange-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
                        {selectedJournal.badge}
                      </div>
                      <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-orange-500" />
                          Consulter les éditions
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col shrink-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-slate-900 dark:text-white text-base font-bold flex items-center gap-2">
                          <FileText className="w-4 h-4 text-orange-500 shrink-0" />
                          Journal · {selectedJournal.tabLabel || selectedJournal.badge}
                        </h4>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {selectedJournal.fileSize}
                        </span>
                      </div>

                      <p className="text-slate-600 dark:text-slate-300 text-xs mb-4 leading-relaxed font-medium">
                        {selectedJournal.subtitle}
                      </p>

                      <button
                        type="button"
                        onClick={() => setShowJournauxModal(true)}
                        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-3 rounded-xl shadow-md transition-all text-xs text-center cursor-pointer"
                        title="Consulter le kiosque complet avec toutes les éditions"
                      >
                        <Layers className="w-4 h-4" />
                        <span>Kiosque des journaux</span>
                        <ArrowRight className="w-4 h-4 ml-0.5 shrink-0" />
                      </button>
                    </div>
                  </div>
                </SpotlightCard>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* MODAL DU KIOSQUE MULTI-JOURNAUX */}
      <KiosqueJournauxModal
        isOpen={showJournauxModal}
        onClose={() => setShowJournauxModal(false)}
        baseUrl={baseUrl}
        selectedJournalId={selectedJournal.id}
        onSelectJournal={(j) => setSelectedJournal(j)}
      />
    </div>
  );
};

export default Actualites;
