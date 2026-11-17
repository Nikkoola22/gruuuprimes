import React, { useMemo, useState } from 'react';
import { faqData, FAQItem } from '../data/FAQdata';
import { Search, ChevronDown, ChevronUp, Tag, ArrowLeft, X, Bot, FileSearch, Calculator } from 'lucide-react';

interface Props {
  onBack?: () => void;
  onAskAI?: () => void;
  onOpenDocutheque?: () => void;
  onOpenCalculators?: () => void;
}

const categories = Array.from(new Set(faqData.map((f) => f.category)));

const CATEGORY_STYLES: Record<string, { btnActive: string; btnInactive: string; badge: string; border: string; icon: string }> = {
  'temps-travail': {
    btnActive: 'bg-orange-600 text-white',
    btnInactive: 'bg-white dark:bg-slate-800 text-orange-700 dark:text-orange-300 shadow-sm border border-orange-200/60 dark:border-orange-500/30',
    badge: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200/50 dark:border-orange-500/30',
    border: 'border-orange-400 dark:border-orange-500',
    icon: 'text-orange-500'
  },
  formation: {
    btnActive: 'bg-purple-600 text-white',
    btnInactive: 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-sm border border-purple-200/60 dark:border-purple-500/30',
    badge: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-500/30',
    border: 'border-purple-400 dark:border-purple-500',
    icon: 'text-purple-500'
  },
  conges: {
    btnActive: 'bg-green-600 text-white',
    btnInactive: 'bg-white dark:bg-slate-800 text-green-700 dark:text-green-300 shadow-sm border border-green-200/60 dark:border-green-500/30',
    badge: 'bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300 border border-green-200/50 dark:border-green-500/30',
    border: 'border-green-400 dark:border-green-500',
    icon: 'text-green-500'
  },
  absences: {
    btnActive: 'bg-red-600 text-white',
    btnInactive: 'bg-white dark:bg-slate-800 text-red-700 dark:text-red-300 shadow-sm border border-red-200/60 dark:border-red-500/30',
    badge: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200/50 dark:border-red-500/30',
    border: 'border-red-400 dark:border-red-500',
    icon: 'text-red-500'
  },
  general: {
    btnActive: 'bg-slate-600 text-white',
    btnInactive: 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200/60 dark:border-slate-700',
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700',
    border: 'border-slate-400 dark:border-slate-500',
    icon: 'text-slate-500'
  }
};

const FAQ: React.FC<Props> = ({ onBack, onAskAI, onOpenDocutheque, onOpenCalculators }) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openIds, setOpenIds] = useState<Record<number, boolean>>({});

  const highlightText = (text: string, q: string) => {
    if (!q) return text;
    try {
      const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")})`, 'ig'));
      return parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      );
    } catch {
      return text;
    }
  };

  // Render simple inline markdown (**bold**) + preserve highlights
  const formatInline = (text: string, q: string) => {
    // Split by **bold** markers
    const parts: Array<{ bold: boolean; text: string }> = [];
    const regex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
      if (m.index > lastIndex) {
        parts.push({ bold: false, text: text.slice(lastIndex, m.index) });
      }
      parts.push({ bold: true, text: m[1] });
      lastIndex = m.index + m[0].length;
    }
    if (lastIndex < text.length) parts.push({ bold: false, text: text.slice(lastIndex) });

    // Map to React nodes applying highlight inside each segment
    return parts.map((p, i) => {
      const highlighted = highlightText(p.text, q);
      return p.bold ? (
        <strong key={i} className="font-semibold">{highlighted}</strong>
      ) : (
        <span key={i}>{highlighted}</span>
      );
    });
  };

  // Format answer text into paragraphs and simple bullet lists, applying inline formatting
  const renderFormattedAnswer = (text: string, q: string) => {
    const lines = text.split(/\r?\n/);
    const nodes: React.ReactNode[] = [];
    let listBuffer: { indent: number; content: string }[] = [];

    const flushList = () => {
      if (!listBuffer.length) return;
      // group by indent (simple handling)
      const groups: Record<number, string[]> = {};
      listBuffer.forEach((l) => {
        (groups[l.indent] ||= []).push(l.content);
      });
      // render groups in order of indent (lowest first)
      Object.keys(groups)
        .sort((a, b) => Number(a) - Number(b))
        .forEach((indent) => {
          const items = groups[Number(indent)];
          nodes.push(
            <ul key={`ul-${nodes.length}`} className={Number(indent) > 0 ? 'ml-6 list-disc' : 'list-disc'}>
              {items.map((it, idx) => (
                <li key={idx} className="mb-1 text-sm text-slate-700 dark:text-slate-200">{formatInline(it.trim().replace(/^[-*]\s?/, ''), q)}</li>
              ))}
            </ul>
          );
        });
      listBuffer = [];
    };

    for (const line of lines) {
      if (!line.trim()) {
        flushList();
        nodes.push(<div key={`br-${nodes.length}`} className="my-2" />);
        continue;
      }

      const matchList = line.match(/^(\s*)[-*]\s+(.*)$/);
      if (matchList) {
        const indent = matchList[1].length;
        listBuffer.push({ indent, content: matchList[0] });
        continue;
      }

      // normal paragraph
      flushList();
      nodes.push(
        <p key={`p-${nodes.length}`} className="text-sm text-slate-700 dark:text-slate-200 mb-2">
          {formatInline(line, q)}
        </p>
      );
    }

    flushList();
    return <div className="prose prose-sm max-w-full dark:prose-invert">{nodes}</div>;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqData.filter((item) => {
      if (activeCategory && item.category !== activeCategory) return false;
      if (!q) return true;
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
      );
    });
  }, [query, activeCategory]);

  const toggle = (id: number) => setOpenIds((s) => ({ ...s, [id]: !s[id] }));

  return (
    <div className="relative z-30 isolate min-h-screen overflow-x-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8 sm:py-12 px-2 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Top bar: Back button + Quick cross-navigation links */}
        <div className="relative z-40 mb-6 flex flex-wrap items-center justify-between gap-3">
          {onBack && (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onBack();
              }}
              aria-label="Retour"
              className="relative z-50 pointer-events-auto inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-red-500/30 transition-all duration-200 group shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Retour</span>
            </button>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {onAskAI && (
              <button
                type="button"
                onClick={onAskAI}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Assistant IA</span>
              </button>
            )}
            {onOpenDocutheque && (
              <button
                type="button"
                onClick={onOpenDocutheque}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <FileSearch className="w-3.5 h-3.5" />
                <span>Docuthèque RH (111 docs)</span>
              </button>
            )}
            {onOpenCalculators && (
              <button
                type="button"
                onClick={onOpenCalculators}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Boîte à Outils</span>
              </button>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">FAQ</h1>
            <p className="mt-2 text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300">Questions fréquentes — guide rapide pour les agents</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-4 sm:mb-8 space-y-4 animate-slide-up">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000" />
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-1 shadow-lg">
              <div className="flex items-center bg-blue-50/90 dark:bg-slate-950 px-4 py-3.5 rounded-xl border-2 border-blue-400 dark:border-blue-500/70 shadow-inner focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 shrink-0 font-bold" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher une question ou un mot-clé..."
                  className="w-full bg-transparent outline-none text-base font-semibold text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="p-1 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-200/80 dark:bg-slate-800 transition-colors cursor-pointer shrink-0 ml-2"
                    title="Effacer la recherche"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2 p-4 bg-white dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-lg">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Filtrer par:</span>
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 transform cursor-pointer ${activeCategory === null ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
              ✓ Tous
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory((c) => (c === cat ? null : cat))}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 transform flex items-center gap-2 cursor-pointer ${
                  activeCategory === cat 
                    ? `${CATEGORY_STYLES[cat].btnActive} shadow-lg scale-105` 
                    : `${CATEGORY_STYLES[cat].btnInactive} hover:shadow-md`
                }`}
              >
                <Tag className="w-4 h-4" />
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="text-center py-12 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="text-slate-500 dark:text-slate-400 text-lg font-semibold">🔍 Aucun résultat trouvé</div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">pour « {query} »</p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                {onAskAI && (
                  <button
                    type="button"
                    onClick={onAskAI}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Poser la question à l&apos;Assistant IA</span>
                  </button>
                )}
                {onOpenDocutheque && (
                  <button
                    type="button"
                    onClick={onOpenDocutheque}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    <FileSearch className="w-4 h-4" />
                    <span>Chercher dans la Docuthèque RH</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {filtered.map((item: FAQItem, index: number) => (
            <article 
              key={item.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <button
                onClick={() => toggle(item.id)}
                className={`w-full text-left transition-all duration-300 transform rounded-xl overflow-hidden border-l-4 cursor-pointer ${CATEGORY_STYLES[item.category].border}`}
              >
                <div className={`bg-white dark:bg-slate-900/95 border border-slate-200/70 dark:border-slate-800 shadow-md hover:shadow-xl p-5 sm:p-6 transform transition-all duration-300 ${openIds[item.id] ? 'ring-2 ring-blue-400/50' : 'hover:scale-[1.01]'}`}>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Category Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${CATEGORY_STYLES[item.category].badge}`}>
                          {item.category}
                        </span>
                      </div>
                      
                      {/* Question */}
                      <h3 className={`text-lg sm:text-xl font-bold transition-colors duration-200 ${openIds[item.id] ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-100'}`}>
                        {highlightText(item.question, query)}
                      </h3>
                    </div>

                    {/* Chevron Icon */}
                    <div className={`flex-shrink-0 p-2 rounded-full transition-all duration-300 ${openIds[item.id] ? `${CATEGORY_STYLES[item.category].btnActive} text-white shadow-lg` : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                      {openIds[item.id] ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>

                  {/* Answer - Collapsible */}
                  <div className={`overflow-hidden transition-all duration-300 ${openIds[item.id] ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                      <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-200">
                        {renderFormattedAnswer(item.answer, query)}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </article>
          ))}
        </div>

        {/* CSS Animations */}
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slide-up {
            from { 
              opacity: 0; 
              transform: translateY(20px);
            }
            to { 
              opacity: 1; 
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.6s ease-out forwards;
            opacity: 0;
          }
          .animate-slide-up {
            animation: slide-up 0.5s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default FAQ;
