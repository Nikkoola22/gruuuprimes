import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Apple, Wifi, Battery, Search, Sliders, Bell, 
  Calculator, Gamepad2, Info, Moon, Sun, Clock,
  BookOpen, HelpCircle, CheckCircle, RefreshCw, X,
  ChevronRight, Volume2, Laptop, ShieldCheck, Share2, Eye
} from 'lucide-react';
import { faqData, FAQItem } from '../data/FAQdata';

interface Props {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentView: string;
  setView: (view: "menu" | "chat" | "calculators" | "metiers" | "faq" | "jeux" | "actualites" | "veille" | "podcasts") => void;
  openCalculator: (calc: 'primes' | 'cia' | '13eme') => void;
  onClose: () => void;
}

export default function MacMenuBar({
  theme,
  toggleTheme,
  currentView,
  setView,
  openCalculator,
  onClose
}: Props) {
  // Navigation & Dropdown State
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // Custom Controls State (macOS widgets)
  const [climatSocial, setClimatSocial] = useState(88); // Battery-like indicator
  const [brightness, setBrightness] = useState(100); // UI visual glow
  const [wifiConnected, setWifiConnected] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  
  // Spotlight Search State
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FAQItem[]>([]);
  const [selectedResult, setSelectedResult] = useState<FAQItem | null>(null);
  
  // About / Preferences Modals State
  const [showAbout, setShowAbout] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Time & Date State
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  // DOM Refs for closing dropdowns on click outside
  const menuBarRef = useRef<HTMLDivElement>(null);
  const spotlightInputRef = useRef<HTMLInputElement>(null);

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle Spotlight Search Shortcut (⌘K or ⌘Space or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === ' ' || e.key === 'k')) {
        e.preventDefault();
        setShowSpotlight(prev => !prev);
      } else if (e.key === 'Escape') {
        setShowSpotlight(false);
        setActiveDropdown(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus Spotlight Input when shown
  useEffect(() => {
    if (showSpotlight && spotlightInputRef.current) {
      setTimeout(() => spotlightInputRef.current?.focus(), 150);
      setSearchQuery('');
      setSearchResults([]);
      setSelectedResult(null);
    }
  }, [showSpotlight]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search FAQ logic
  const handleSearch = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      setSelectedResult(null);
      return;
    }
    const matches = faqData.filter(item => 
      item.question.toLowerCase().includes(val.toLowerCase()) || 
      item.answer.toLowerCase().includes(val.toLowerCase()) ||
      item.category.toLowerCase().includes(val.toLowerCase())
    ).slice(0, 5);
    setSearchResults(matches);
    if (matches.length > 0) {
      setSelectedResult(matches[0]);
    } else {
      setSelectedResult(null);
    }
  };

  const handleDropdownClick = (menu: string) => {
    setActiveDropdown(prev => prev === menu ? null : menu);
  };

  const selectView = (view: any) => {
    setView(view);
    setActiveDropdown(null);
  };

  const selectCalculator = (calc: 'primes' | 'cia' | '13eme') => {
    openCalculator(calc);
    setActiveDropdown(null);
  };

  // Reset application mockup
  const handleResetApp = () => {
    localStorage.clear();
    setActiveDropdown(null);
    window.location.reload();
  };

  // Custom visual brightness screen filter style
  const screenOverlayStyle = focusMode ? {
    filter: `brightness(${Math.max(brightness, 40)}%) saturate(60%)`
  } : {
    filter: `brightness(${Math.max(brightness, 40)}%)`
  };

  // Inject visual screen adjustment styles dynamically
  useEffect(() => {
    const mainEl = document.querySelector('main');
    const headerEl = document.querySelector('header');
    if (mainEl) {
      mainEl.style.transition = 'filter 0.3s ease';
      mainEl.style.filter = screenOverlayStyle.filter;
    }
    if (headerEl) {
      headerEl.style.transition = 'filter 0.3s ease';
      headerEl.style.filter = screenOverlayStyle.filter;
    }
  }, [brightness, focusMode]);

  return (
    <>
      {/* 1. THE MENUBAR BASE */}
      <div 
        ref={menuBarRef}
        className="fixed top-0 left-0 w-full h-7 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/50 dark:border-slate-800/80 z-[100] flex justify-between items-center px-4 select-none font-sans text-xs text-slate-800 dark:text-slate-200 shadow-sm"
      >
        {/* Left Side: Native menus */}
        <div className="flex items-center gap-4">
          {/* Apple Menu */}
          <div className="relative">
            <button 
              onClick={() => handleDropdownClick('apple')}
              className={`px-2 py-0.5 rounded transition-colors flex items-center ${activeDropdown === 'apple' ? 'bg-blue-600 text-white' : 'hover:bg-slate-200/60 dark:hover:bg-slate-800/60'}`}
            >
              <Apple className="w-3.5 h-3.5" />
            </button>
            
            <AnimatePresence>
              {activeDropdown === 'apple' && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.1 }}
                  className="absolute left-0 mt-1 w-52 bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/80 rounded-lg shadow-2xl p-1 z-[110] text-slate-800 dark:text-slate-200"
                >
                  <button 
                    onClick={() => { setShowAbout(true); setActiveDropdown(null); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white rounded-md flex items-center justify-between"
                  >
                    <span>À propos d'ATLAS</span>
                    <Info className="w-3.5 h-3.5 opacity-60" />
                  </button>
                  <button 
                    onClick={() => { setShowPreferences(true); setActiveDropdown(null); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white rounded-md flex items-center justify-between"
                  >
                    <span>Réglages Système...</span>
                    <Sliders className="w-3.5 h-3.5 opacity-60" />
                  </button>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
                  <button 
                    onClick={() => selectView('menu')}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white rounded-md"
                  >
                    Aller au Tableau de Bord
                  </button>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
                  <button 
                    onClick={handleResetApp}
                    className="w-full text-left px-3 py-1.5 hover:bg-red-650 hover:text-white rounded-md flex items-center justify-between text-red-600 dark:text-red-400"
                  >
                    <span>Forcer à Redémarrer</span>
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={onClose}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white rounded-md text-slate-500"
                  >
                    Quitter Mode Bureau
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* App Title */}
          <div className="font-bold tracking-tight px-1 cursor-default text-[13px] text-orange-650 dark:text-orange-400">
            ATLAS
          </div>

          {/* Menu: Simulate Fichier / Navigation */}
          <div className="relative">
            <button 
              onClick={() => handleDropdownClick('views')}
              className={`px-2 py-0.5 rounded transition-colors hidden sm:block ${activeDropdown === 'views' ? 'bg-blue-600 text-white' : 'hover:bg-slate-200/60 dark:hover:bg-slate-800/60'}`}
            >
              Navigation
            </button>
            <AnimatePresence>
              {activeDropdown === 'views' && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.1 }}
                  className="absolute left-0 mt-1 w-48 bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/80 rounded-lg shadow-2xl p-1 z-[110]"
                >
                  <button onClick={() => selectView('menu')} className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white rounded-md">Tableau de Bord</button>
                  <button onClick={() => selectView('chat')} className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white rounded-md">Chatbot ATLAS</button>
                  <button onClick={() => selectView('metiers')} className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white rounded-md">Grilles Indiciaires</button>
                  <button onClick={() => selectView('faq')} className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white rounded-md">Questions Fréquentes</button>
                  <button onClick={() => selectView('actualites')} className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white rounded-md">Actualités Syndicales</button>
                  <button onClick={() => selectView('veille')} className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white rounded-md">Veille Juridique</button>
                  <button onClick={() => selectView('podcasts')} className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white rounded-md text-amber-500 font-bold">Podcasts RH 🎧</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Menu: Calculateurs */}
          <div className="relative">
            <button 
              onClick={() => handleDropdownClick('calcs')}
              className={`px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${activeDropdown === 'calcs' ? 'bg-blue-600 text-white' : 'hover:bg-slate-200/60 dark:hover:bg-slate-800/60'}`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Calculateurs</span>
            </button>
            <AnimatePresence>
              {activeDropdown === 'calcs' && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.1 }}
                  className="absolute left-0 mt-1 w-56 bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/80 rounded-lg shadow-2xl p-1 z-[110]"
                >
                  <button onClick={() => selectCalculator('primes')} className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white rounded-md flex justify-between items-center">
                    <span>Calculateur RIFSEEP (Primes)</span>
                    <span className="text-[10px] opacity-40">⌘P</span>
                  </button>
                  <button onClick={() => selectCalculator('cia')} className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white rounded-md flex justify-between items-center">
                    <span>Calculateur CIA</span>
                    <span className="text-[10px] opacity-40">⌘C</span>
                  </button>
                  <button onClick={() => selectCalculator('13eme')} className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white rounded-md flex justify-between items-center">
                    <span>Calculateur 13ème Mois</span>
                    <span className="text-[10px] opacity-40">⌘D</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Menu: Jeux */}
          <div className="relative">
            <button 
              onClick={() => handleDropdownClick('games')}
              className={`px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${activeDropdown === 'games' ? 'bg-blue-600 text-white' : 'hover:bg-slate-200/60 dark:hover:bg-slate-800/60'}`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Jeux RH</span>
            </button>
            <AnimatePresence>
              {activeDropdown === 'games' && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.1 }}
                  className="absolute left-0 mt-1 w-56 bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/80 rounded-lg shadow-2xl p-1 z-[110]"
                >
                  <button onClick={() => selectView('jeux')} className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white rounded-md flex items-center gap-2">
                    <Gamepad2 className="w-3.5 h-3.5 text-pink-500" />
                    <span>Ouvrir l'Espace Jeux</span>
                  </button>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
                  <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase">Sélection rapide</div>
                  <button onClick={() => selectView('jeux')} className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white rounded-md pl-6">Tycoon Collectivité</button>
                  <button onClick={() => selectView('jeux')} className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white rounded-md pl-6">Frogger Contractuel</button>
                  <button onClick={() => selectView('jeux')} className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white rounded-md pl-6">Casse-Brique RH</button>
                  <button onClick={() => selectView('jeux')} className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white rounded-md pl-6">Memory RH</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Status Widgets (WiFi, Battery, Control Center, Clock, Search) */}
        <div className="flex items-center gap-3">
          {/* Spotlight Search Toggle */}
          <button 
            onClick={() => setShowSpotlight(true)}
            className="p-1 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 rounded transition-colors"
            title="Recherche Spotlight (⌘Space)"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* WiFi Widget */}
          <div className="relative">
            <button 
              onClick={() => handleDropdownClick('wifi')}
              className={`p-1 rounded transition-colors ${activeDropdown === 'wifi' ? 'bg-blue-600 text-white' : 'hover:bg-slate-200/60 dark:hover:bg-slate-800/60'}`}
            >
              <Wifi className={`w-3.5 h-3.5 ${wifiConnected ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`} />
            </button>
            <AnimatePresence>
              {activeDropdown === 'wifi' && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 mt-1 w-64 bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/80 rounded-lg shadow-2xl p-3 z-[110]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">Wi-Fi</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={wifiConnected}
                        onChange={() => setWifiConnected(prev => !prev)}
                        className="sr-only peer"
                      />
                      <div className="w-7 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-slate-600 peer-checked:bg-blue-650"></div>
                    </label>
                  </div>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
                  <div className="text-[11px] text-slate-500 mb-1">RÉSEAU CONNECTÉ</div>
                  <div className="flex items-center justify-between text-xs font-semibold p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                    <span className="text-blue-600 dark:text-blue-400">CFDT_Mairie_Gennevilliers</span>
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-2">IP Locale : 192.168.10.42</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Battery Status (represented as Social Climate / QVT Meter) */}
          <div className="relative">
            <button 
              onClick={() => handleDropdownClick('battery')}
              className={`p-1 rounded transition-colors flex items-center gap-1 ${activeDropdown === 'battery' ? 'bg-blue-600 text-white' : 'hover:bg-slate-200/60 dark:hover:bg-slate-800/60'}`}
            >
              <span className="text-[10px] font-semibold">{climatSocial}%</span>
              <Battery className="w-4 h-4 text-emerald-500" />
            </button>
            <AnimatePresence>
              {activeDropdown === 'battery' && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 mt-1 w-60 bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/80 rounded-lg shadow-2xl p-3 z-[110]"
                >
                  <div className="font-bold mb-1">Qualité de Vie au Travail (QVT)</div>
                  <div className="text-[11px] text-slate-500 mb-2">Simulateur d'indicateur social</div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${climatSocial}%` }}
                      />
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{climatSocial}%</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span>Source CFDT : En charge (Climat positif)</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Control Center Toggle */}
          <div className="relative">
            <button 
              onClick={() => handleDropdownClick('controlcenter')}
              className={`p-1 rounded transition-colors ${activeDropdown === 'controlcenter' ? 'bg-blue-600 text-white' : 'hover:bg-slate-200/60 dark:hover:bg-slate-800/60'}`}
              title="Centre de Contrôle"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
            
            <AnimatePresence>
              {activeDropdown === 'controlcenter' && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 mt-1 w-80 bg-white/95 dark:bg-slate-900/95 border border-slate-200/85 dark:border-slate-800/85 rounded-2xl shadow-2xl p-4 z-[110] text-slate-800 dark:text-slate-200 grid grid-cols-2 gap-3"
                >
                  {/* Left Column: Quick Toggles (Wi-Fi, AirDrop, DND) */}
                  <div className="bg-slate-100/50 dark:bg-slate-800/50 p-2.5 rounded-2xl col-span-2 flex justify-around gap-2 border border-slate-200/30 dark:border-slate-700/30">
                    <button 
                      onClick={() => setWifiConnected(p => !p)}
                      className="flex flex-col items-center gap-1.5 text-center group cursor-pointer"
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${wifiConnected ? 'bg-blue-600 text-white shadow' : 'bg-slate-300 dark:bg-slate-700 text-slate-500'}`}>
                        <Wifi className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold">Wi-Fi</span>
                    </button>
                    
                    <button 
                      className="flex flex-col items-center gap-1.5 text-center group cursor-pointer border-0 bg-transparent"
                      onClick={() => alert("Simulé: AirDrop de fiches syndicales CFDT activé !")}
                    >
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white shadow flex items-center justify-center">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold">AirDrop</span>
                    </button>

                    <button 
                      onClick={() => setFocusMode(p => !p)}
                      className="flex flex-col items-center gap-1.5 text-center group cursor-pointer"
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${focusMode ? 'bg-purple-600 text-white shadow' : 'bg-slate-300 dark:bg-slate-700 text-slate-500'}`}>
                        <Moon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold">Focus</span>
                    </button>
                  </div>

                  {/* Dark Mode Control Widget */}
                  <div 
                    onClick={toggleTheme}
                    className="bg-slate-100/50 dark:bg-slate-800/50 p-3 rounded-2xl flex flex-col justify-between border border-slate-200/30 dark:border-slate-700/30 cursor-pointer hover:bg-slate-200/40 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      {theme === 'dark' ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-orange-500" />}
                      <span className="text-[10px] font-bold text-slate-400">Thème</span>
                    </div>
                    <div className="mt-3">
                      <div className="font-bold text-xs">Mode Sombre</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{theme === 'dark' ? 'Activé' : 'Désactivé'}</div>
                    </div>
                  </div>

                  {/* QVT Motivation Widget */}
                  <div className="bg-slate-100/50 dark:bg-slate-800/50 p-3 rounded-2xl flex flex-col justify-between border border-slate-200/30 dark:border-slate-700/30">
                    <div className="flex items-center justify-between">
                      <Laptop className="w-5 h-5 text-emerald-500" />
                      <span className="text-[10px] font-bold text-slate-400">Ressources</span>
                    </div>
                    <div className="mt-3">
                      <div className="font-bold text-xs">Climat Social</div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{climatSocial}% (Optimisé)</div>
                    </div>
                  </div>

                  {/* UI Brightness Slider */}
                  <div className="bg-slate-100/50 dark:bg-slate-800/50 p-3 rounded-2xl col-span-2 border border-slate-200/30 dark:border-slate-700/30">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[10px] text-slate-400 uppercase">Éclat de l'interface</span>
                      <span className="text-xs font-bold">{brightness}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-slate-400" />
                      <input 
                        type="range" 
                        min="50" 
                        max="100" 
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  </div>

                  {/* Simulated Social Climate Slider */}
                  <div className="bg-slate-100/50 dark:bg-slate-800/50 p-3 rounded-2xl col-span-2 border border-slate-200/30 dark:border-slate-700/30">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[10px] text-slate-400 uppercase">Indicateur Climat Social</span>
                      <span className="text-xs font-bold">{climatSocial}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-slate-400" />
                      <input 
                        type="range" 
                        min="20" 
                        max="100" 
                        value={climatSocial}
                        onChange={(e) => setClimatSocial(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>
                  </div>
                  
                  {/* Union status footer */}
                  <div className="col-span-2 text-center text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-200/40 dark:border-slate-800/40">
                    CFDT ATLAS v2.4.0 (Sequoia Style)
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Clock & Notifications Drawer */}
          <div className="relative">
            <button 
              onClick={() => handleDropdownClick('clock')}
              className={`px-2 py-0.5 rounded font-semibold text-[11px] transition-colors flex items-center gap-1.5 ${activeDropdown === 'clock' ? 'bg-blue-600 text-white' : 'hover:bg-slate-200/60 dark:hover:bg-slate-800/60'}`}
            >
              <span>{dateStr}</span>
              <span>{timeStr}</span>
            </button>
            <AnimatePresence>
              {activeDropdown === 'clock' && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 mt-1 w-72 bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/80 rounded-lg shadow-2xl p-3 z-[110] text-slate-800 dark:text-slate-200"
                >
                  <div className="font-bold border-b border-slate-200/50 dark:border-slate-800 pb-1.5 mb-2 flex items-center justify-between">
                    <span>Notifications ATLAS</span>
                    <Bell className="w-3.5 h-3.5 text-orange-500 animate-bounce" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="p-2 bg-orange-50 dark:bg-orange-950/20 border border-orange-200/30 rounded-lg">
                      <div className="font-semibold text-xs text-orange-700 dark:text-orange-400 flex items-center justify-between">
                        <span>Calculateur de CIA à Jour</span>
                        <span className="text-[9px] font-normal text-slate-400">10m ago</span>
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">Le barème CIA de la filière administrative a été mis en conformité avec les délibérations.</div>
                    </div>
                    
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200/30 rounded-lg">
                      <div className="font-semibold text-xs text-blue-700 dark:text-blue-400 flex items-center justify-between">
                        <span>Actualités Syndicales</span>
                        <span className="text-[9px] font-normal text-slate-400">2h ago</span>
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">Nouveau guide sur le droit de grève et le statut général de la Fonction Publique Territoriale.</div>
                    </div>
                  </div>
                  
                  <div className="h-px bg-slate-200 dark:bg-slate-800 my-2.5" />
                  <button 
                    onClick={() => selectView('actualites')}
                    className="w-full text-center py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-[11px] font-bold transition-colors"
                  >
                    Voir toutes les actualités
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 2. THE SPOTLIGHT OVERLAY */}
      <AnimatePresence>
        {showSpotlight && (
          <div className="fixed inset-0 bg-slate-900/30 dark:bg-black/50 z-[200] flex justify-center pt-24 px-4">
            {/* Click backdrop to close */}
            <div className="absolute inset-0 z-0" onClick={() => setShowSpotlight(false)} />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.3)] overflow-hidden relative z-10 h-fit"
            >
              {/* Search Bar Input */}
              <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 mr-3" />
                <input 
                  ref={spotlightInputRef}
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Recherche Spotlight (ex: RIFSEEP, CIA, congés, syndicat...)"
                  className="w-full bg-transparent border-0 outline-none text-slate-800 dark:text-slate-100 text-sm placeholder-slate-400"
                />
                <button 
                  onClick={() => setShowSpotlight(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 border-0 bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Spotlight Content Area (Left search results, Right preview panel) */}
              <div className="grid grid-cols-1 md:grid-cols-2 min-h-[300px] max-h-[450px]">
                {/* Search Results List */}
                <div className="border-r border-slate-200 dark:border-slate-800 p-2 overflow-y-auto max-h-[450px] custom-scrollbar">
                  {searchQuery === '' ? (
                    <div className="p-4 text-xs text-slate-400 text-center">
                      <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Saisissez des termes pour lancer la recherche Spotlight dans la FAQ CFDT.</p>
                      <div className="mt-3 flex justify-center gap-1.5 flex-wrap">
                        {['RIFSEEP', 'Congés', 'Temps de travail', 'CIA'].map(tag => (
                          <button 
                            key={tag} 
                            onClick={() => handleSearch(tag)}
                            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-semibold text-slate-500 dark:text-slate-400 rounded transition-colors border-0"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      Aucun résultat trouvé pour "{searchQuery}"
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {searchResults.map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => setSelectedResult(item)}
                          onMouseEnter={() => setSelectedResult(item)}
                          className={`p-2 rounded-lg cursor-pointer transition-all flex items-center justify-between text-xs ${selectedResult?.id === item.id ? 'bg-blue-650 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350'}`}
                        >
                          <div className="flex flex-col pr-2">
                            <span className="font-semibold line-clamp-1">{item.question}</span>
                            <span className={`text-[10px] font-bold ${selectedResult?.id === item.id ? 'text-white/80' : 'text-orange-600 dark:text-orange-400'} mt-0.5`}>
                              {item.category}
                            </span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Side: Preview Panel */}
                <div className="bg-slate-50/50 dark:bg-slate-900/50 p-4 overflow-y-auto max-h-[450px] custom-scrollbar text-xs text-slate-700 dark:text-slate-300">
                  {selectedResult ? (
                    <div>
                      <div className="font-bold text-slate-800 dark:text-white mb-2 text-sm border-b border-slate-200 dark:border-slate-800 pb-2">
                        {selectedResult.question}
                      </div>
                      <div className="space-y-2 leading-relaxed whitespace-pre-line text-[11px] max-h-[300px] overflow-y-auto">
                        {selectedResult.answer}
                      </div>
                      <button 
                        onClick={() => {
                          setShowSpotlight(false);
                          setView('faq');
                        }}
                        className="mt-4 w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-center transition-colors cursor-pointer border-0"
                      >
                        Ouvrir dans la FAQ ATLAS
                      </button>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-center text-slate-400">
                      <div>
                        <Laptop className="w-12 h-12 mx-auto mb-2 opacity-25" />
                        <p>Sélectionnez un résultat pour voir son aperçu.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Spotlight Shortcut Footer */}
              <div className="bg-slate-100 dark:bg-slate-950 px-4 py-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between items-center font-mono">
                <span>Navigation : ↑↓ Entrer</span>
                <span>Fermer : Échap</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. ABOUT MODAL */}
      <AnimatePresence>
        {showAbout && (
          <div className="fixed inset-0 bg-slate-950/40 z-[210] flex items-center justify-center p-4">
            <div className="absolute inset-0 z-0" onClick={() => setShowAbout(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-80 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-center text-slate-800 dark:text-slate-200 relative z-10"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg mx-auto mb-4 logo-glow-ambient">
                CFDT
              </div>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">ATLAS</h3>
              <p className="text-xs text-orange-650 dark:text-orange-400 font-bold uppercase tracking-wider mt-0.5">Assistant Syndical CFDT</p>
              <p className="text-[10px] text-slate-400 mt-1">Version 2.4.0 (Build Sequoia)</p>

              <div className="my-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850 text-left space-y-1">
                <p>💻 **Design** : macOS Menu Bar Inspired.</p>
                <p>📍 **Section** : Ville de Gennevilliers.</p>
                <p>⚖️ **Droit** : Statut de la FPT.</p>
                <p>🔥 **Dev** : Pair programmed with Antigravity AI.</p>
              </div>

              <p className="text-[10px] text-slate-400 mb-5">© 2026 CFDT Gennevilliers. Tous droits réservés.</p>

              <button 
                onClick={() => setShowAbout(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-colors text-xs cursor-pointer border-0"
              >
                Fermer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. PREFERENCES MODAL */}
      <AnimatePresence>
        {showPreferences && (
          <div className="fixed inset-0 bg-slate-950/40 z-[210] flex items-center justify-center p-4">
            <div className="absolute inset-0 z-0" onClick={() => setShowPreferences(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-[450px] bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-800 dark:text-slate-200 relative z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-orange-500" />
                  <span>Réglages Système ATLAS</span>
                </h3>
                <button 
                  onClick={() => setShowPreferences(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 border-0 bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Preferences Settings Form */}
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-2 items-center bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="font-bold col-span-2">Mode Sombre Global</span>
                  <div className="text-right">
                    <button 
                      onClick={toggleTheme}
                      className="px-3 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-750 rounded-lg font-bold transition-colors cursor-pointer border-0"
                    >
                      {theme === 'dark' ? 'Mode Sombre' : 'Mode Clair'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 items-center bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="font-bold col-span-2">Filtre Écran Focus (Réduction Éclat)</span>
                  <div className="flex justify-end">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={focusMode}
                        onChange={() => setFocusMode(p => !p)}
                        className="sr-only peer"
                      />
                      <div className="w-7 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-slate-600 peer-checked:bg-purple-655"></div>
                    </label>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span>Ajustement Climat Social (Simulateur)</span>
                    <span className="text-emerald-500">{climatSocial}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="20" 
                    max="100" 
                    value={climatSocial}
                    onChange={(e) => setClimatSocial(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="text-[10px] text-slate-400">Ce curseur influe fictivement sur le niveau d'énergie QVT de l'assistant.</div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                  <ShieldCheck className="w-8 h-8 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Sécurité & RGPD</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Vos données de calculs restent entièrement locales dans le navigateur. CFDT ATLAS ne transmet aucune coordonnée financière à un serveur externe.</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 text-right">
                <button 
                  onClick={() => setShowPreferences(false)}
                  className="px-4 py-2 bg-blue-650 hover:bg-blue-755 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer border-0"
                >
                  Appliquer les réglages
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
