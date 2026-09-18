import React from 'react';
import MacMenuBar from "./MacMenuBar.tsx";
import { Toaster } from "sonner";
import { OrangeGeometricBackground } from "./ui/OrangeGeometricBackground.tsx";

interface MainLayoutProps {
  children: React.ReactNode;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  showMacMenuBar: boolean;
  setShowMacMenuBar: (show: boolean) => void;
  currentView?: string;
  setView?: (view: string) => void;
  openCalculator?: (calc: 'primes' | 'cia' | '13eme') => void;
}

/**
 * MainLayout englobe la structure commune de l'application (barre de menu, notifications, fond d'écran).
 */
export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  theme,
  toggleTheme,
  showMacMenuBar,
  setShowMacMenuBar,
  currentView,
  setView,
  openCalculator
}) => {
  return (
    <div className={`min-h-screen font-sans ${theme === 'dark' ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-300`}>
      <Toaster position="top-right" richColors theme={theme} />
      
      {/* Background décoratif optionnel, géré globalement */}
      <OrangeGeometricBackground />

      {/* Menu Mac-like Optionnel */}
      {showMacMenuBar && (
        <div className="sticky top-0 z-[100] w-full">
          <MacMenuBar 
            theme={theme} 
            toggleTheme={toggleTheme} 
            currentView={currentView}
            setView={setView || (() => {})} 
            openCalculator={openCalculator || (() => {})} 
            onClose={() => setShowMacMenuBar(false)} 
          />
        </div>
      )}

      {/* Bouton pour réafficher le menu si caché */}
      {!showMacMenuBar && (
        <button 
          onClick={() => setShowMacMenuBar(true)}
          className="fixed top-2 left-2 z-[100] bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-md shadow-sm hover:bg-white/20 transition-all text-xs"
        >
          Afficher le menu
        </button>
      )}

      {/* Contenu de la page (Routage interne) */}
      <main className="relative z-10 w-full max-w-7xl mx-auto flex flex-col min-h-screen">
        {children}
      </main>
    </div>
  );
};
