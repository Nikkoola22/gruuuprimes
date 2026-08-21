import React, { useRef, useEffect, useState } from 'react';
import { Send, ArrowLeft, Bot, Sparkles, Scale, Check, Copy, MessageSquareText } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ChatMessage {
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface LuxuryChatProps {
  messages: ChatMessage[];
  inputValue: string;
  isProcessing: boolean;
  showExpandSearch: boolean;
  onInputChange: (val: string) => void;
  onSendMessage: () => void;
  onReturnToMenu: () => void;
  onExpandSearch: () => void;
  onDeclineSearch: () => void;
  theme?: 'light' | 'dark';
}

export const LuxuryChat: React.FC<LuxuryChatProps> = ({
  messages,
  inputValue,
  isProcessing,
  showExpandSearch,
  onInputChange,
  onSendMessage,
  onReturnToMenu,
  onExpandSearch,
  onDeclineSearch,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesListRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Centrer le scroll juste au-dessous du header à l'arrivée sur la vue
  useEffect(() => {
    const timer = setTimeout(() => {
      if (chatContainerRef.current) {
        const headerElement = document.querySelector('header');
        const headerHeight = headerElement ? headerElement.getBoundingClientRect().height : 80;
        const elementTop = chatContainerRef.current.getBoundingClientRect().top + window.pageYOffset;

        window.scrollTo({
          top: Math.max(0, elementTop - headerHeight - 12),
          behavior: 'smooth',
        });
      }
    }, 80);

    return () => clearTimeout(timer);
  }, []);

  // Défilement fluide interne de la liste des messages
  useEffect(() => {
    if (messagesListRef.current) {
      messagesListRef.current.scrollTo({
        top: messagesListRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isProcessing]);

  useEffect(() => {
    // Focus sans déclencher de saut de défilement natif du navigateur
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const suggestions = [
    "Congé maladie ordinaire (CMO 90%)",
    "Jours pour mariage ou PACS",
    "Règles télétravail 2026",
    "Calcul IFSE & CIA",
    "Congé enfant malade",
    "Temps partiel thérapeutique",
    "Prime de fin d'année",
  ];

  return (
    <div ref={chatContainerRef} className="relative max-w-4xl mx-auto w-full px-2 sm:px-6 py-1 sm:py-4 z-30 animate-chat-enter">
      {/* Luxury Chat Window adaptée à l'écran */}
      <div className={`rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[calc(100dvh-115px)] sm:h-[calc(100vh-170px)] min-h-[350px] sm:min-h-[500px] max-h-[850px] transition-all duration-300 ${
        isLight
          ? 'bg-white/95 hairline-border-light shadow-slate-300/50'
          : 'bg-[#0B0E17]/95 hairline-border shadow-black/90'
      }`}>
        
        {/* Header Épuré Style Luxe */}
        <div className={`px-3 sm:px-6 py-2.5 sm:py-4 flex items-center justify-between border-b transition-colors ${
          isLight ? 'bg-slate-50/90 border-slate-200' : 'bg-[#101422]/90 border-white/[0.08]'
        }`}>
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="relative p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20 shrink-0">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className={`text-sm sm:text-base font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Assistant IA « Oracle »
                </h3>
                <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Statutaire RH
                </span>
              </div>
              <p className={`text-[10px] sm:text-xs font-medium truncate max-w-[200px] sm:max-w-none ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                CGFP, Légifrance & Règlements Gennevilliers
              </p>
            </div>
          </div>

          <button
            onClick={onReturnToMenu}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shrink-0 ${
              isLight
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                : 'bg-white/10 hover:bg-white/15 text-slate-200'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Fermer</span>
          </button>
        </div>

        {/* Message Thread */}
        <div ref={messagesListRef} className={`flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-5 custom-scrollbar ${
          isLight ? 'bg-slate-50/40' : 'bg-[#080B12]/60'
        }`}>
          {messages.map((msg, i) => {
            const isUser = msg.type === 'user';
            return (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                key={i}
                className={`flex gap-2 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                )}

                <div className={`group relative max-w-[92%] sm:max-w-[75%] rounded-2xl px-3.5 py-2.5 sm:px-5 sm:py-3.5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium shadow-md shadow-orange-500/15'
                    : isLight
                      ? 'bg-white text-slate-800 border border-slate-200 shadow-sm'
                      : 'bg-[#121624] text-slate-100 border border-white/[0.08] chat-bubble-ai'
                }`}>
                  <div className="whitespace-pre-wrap break-words">{msg.content}</div>

                  {/* Message Footer & Copier */}
                  <div className="flex items-center justify-between gap-3 mt-2 pt-1 border-t border-black/5 dark:border-white/5">
                    <span className={`text-[10px] font-medium ${isUser ? 'text-white/80' : isLight ? 'text-slate-400' : 'text-slate-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.content, i)}
                        className={`opacity-80 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded text-xs flex items-center gap-1 ${
                          isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-white/10 text-slate-300'
                        }`}
                        title="Copier la réponse"
                      >
                        {copiedIndex === i ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] font-bold text-emerald-400">Copié</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="text-[10px] font-medium">Copier</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Indicateur de frappe à 3 points pulsants avec message de statut */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 sm:gap-3"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
              </div>
              <div className={`px-3.5 py-2 sm:px-4 sm:py-3 rounded-2xl border flex items-center gap-2 ${
                isLight ? 'bg-white border-slate-200 text-slate-700 shadow-sm' : 'bg-[#121624] border-white/[0.08] text-slate-300'
              }`}>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[11px] sm:text-xs font-semibold ml-1">Analyse des textes statutaires...</span>
              </div>
            </motion.div>
          )}

          {/* Option Élargir Recherche Légifrance */}
          {showExpandSearch && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 sm:p-5 rounded-2xl border text-center my-3 sm:my-4 ${
                isLight ? 'bg-amber-50/80 border-amber-200 shadow-sm' : 'bg-amber-500/10 border-amber-500/20'
              }`}
            >
              <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 mx-auto mb-2" />
              <h5 className={`text-xs sm:text-sm font-bold mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Élargir la recherche au Code Général de la Fonction Publique ?
              </h5>
              <p className={`text-[11px] sm:text-xs mb-3 sm:mb-4 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                Interroger le service officiel Légifrance PISTE pour les décrets et circulaires nationaux.
              </p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                <button
                  onClick={onExpandSearch}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  Oui, interroger Légifrance
                </button>
                <button
                  onClick={onDeclineSearch}
                  className="px-3.5 py-2 rounded-xl bg-slate-600 hover:bg-slate-700 text-white text-xs font-bold transition-all active:scale-95"
                >
                  Non, retour au menu
                </button>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Pilules de suggestions rapides en un clic */}
        <div className={`px-3 sm:px-6 py-2 sm:py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar border-t ${
          isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-[#0E121E] border-white/[0.06]'
        }`}>
          <span className={`text-[10px] sm:text-[11px] font-bold flex items-center gap-1 shrink-0 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            <MessageSquareText className="w-3.5 h-3.5 text-amber-500" />
            Suggestions :
          </span>
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => onInputChange(s)}
              className={`text-[11px] sm:text-xs font-medium px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border whitespace-nowrap transition-all duration-150 hover:scale-105 active:scale-95 shrink-0 ${
                isLight
                  ? 'bg-white hover:bg-amber-50 hover:border-amber-300 border-slate-200 text-slate-700 shadow-xs'
                  : 'bg-white/[0.05] hover:bg-amber-500/15 hover:border-amber-500/40 border-white/[0.08] text-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Champ de prompt flottant */}
        <div className={`p-2.5 sm:p-4 border-t ${isLight ? 'bg-white border-slate-200' : 'bg-[#0B0E17] border-white/[0.08]'}`}>
          <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border transition-all duration-200 ${
            isLight
              ? 'bg-slate-50 border-slate-200 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/20'
              : 'bg-[#121624] border-white/[0.12] focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20'
          }`}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
              placeholder="Ex: Jours pour un mariage ? RIFSEEP ? Télétravail ?"
              className={`flex-1 bg-transparent border-none outline-none text-xs sm:text-sm font-medium ${
                isLight ? 'text-slate-900 placeholder-slate-400' : 'text-white placeholder-slate-400'
              }`}
              disabled={isProcessing}
            />

            <button
              onClick={onSendMessage}
              disabled={!inputValue.trim() || isProcessing}
              className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all shadow-md shadow-orange-500/20 shrink-0"
              title="Envoyer votre message"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
