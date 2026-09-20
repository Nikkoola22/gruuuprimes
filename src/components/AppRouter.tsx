import React, { Suspense, lazy } from 'react';

// Importation des composants (lazy load pour la performance)
const CalculateurCIAV2 = lazy(() => import("./CalculateurCIAV2.tsx"));
const CalculateurPrimesV2 = lazy(() => import("./CalculateurPrimesV2.tsx"));
const Calculateur13emeV2 = lazy(() => import("./Calculateur13emeV2.tsx"));
const Metiers = lazy(() => import("./Metiers.tsx"));
const FAQ = lazy(() => import("./FAQ.tsx"));
const EspaceJeux = lazy(() => import("./EspaceJeux.tsx"));
const Actualites = lazy(() => import("./Actualites.tsx"));
const VeilleJuridique = lazy(() => import("./VeilleJuridique.tsx"));
const VeilleCdgPage = lazy(() => import("./VeilleCdgPage.tsx"));
const EspacePodcastsFigurines = lazy(() => import("./EspacePodcastsFigurines.tsx"));
const DessineMoiLeStatut = lazy(() => import("./DessineMoiLeStatut.tsx"));
const DocuthequeRAG = lazy(() => import("./DocuthequeRAG").then(m => ({ default: m.DocuthequeRAG })));
const CoinRH = lazy(() => import("./CoinRH.tsx"));
const SimulateurCarriere = lazy(() => import("./SimulateurCarriere.tsx"));

// Composant de chargement global
const ViewLoader = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
  </div>
);

interface AppRouterProps {
  currentView: string;
  activeCalculator: 'primes' | 'cia' | '13eme' | null;
  setActiveCalculator: (calc: 'primes' | 'cia' | '13eme' | null) => void;
  onNavigate: (view: string) => void;
  news?: { title: string; link: string; pubDate: string; category: string; description: string; imageUrl?: string }[];
  baseUrl?: string;
}

/**
 * AppRouter gère le changement de vues (sans react-router-dom pour l'instant)
 * en se basant sur l'état global de l'application.
 */
export const AppRouter: React.FC<AppRouterProps> = ({ currentView, activeCalculator, setActiveCalculator, onNavigate, news = [], baseUrl = "" }) => {
  const handleClose = () => onNavigate('menu');
  return (
    <Suspense fallback={<ViewLoader />}>
      {currentView === 'calculators' && (
        <div className="p-4">
          <div className="flex gap-4 mb-6">
            <button onClick={() => setActiveCalculator('primes')} className={`px-4 py-2 rounded-lg font-bold ${activeCalculator === 'primes' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>Simulateur de Primes</button>
            <button onClick={() => setActiveCalculator('cia')} className={`px-4 py-2 rounded-lg font-bold ${activeCalculator === 'cia' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>Calculateur CIA</button>
            <button onClick={() => setActiveCalculator('13eme')} className={`px-4 py-2 rounded-lg font-bold ${activeCalculator === '13eme' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>Calculateur 13ème Mois</button>
          </div>
          {activeCalculator === 'primes' && <CalculateurPrimesV2 onClose={handleClose} />}
          {activeCalculator === 'cia' && <CalculateurCIAV2 onClose={handleClose} />}
          {activeCalculator === '13eme' && <Calculateur13emeV2 onClose={handleClose} />}
        </div>
      )}
      {currentView === 'metiers' && <Metiers onClose={handleClose} onOpenCalculator={() => {}} />}
      {currentView === 'faq' && <FAQ />}
      {currentView === 'jeux' && <EspaceJeux onClose={handleClose} />}
      {currentView === 'actualites' && <Actualites news={news} onClose={handleClose} baseUrl={baseUrl} />}
      {currentView === 'veille' && <VeilleJuridique onClose={handleClose} />}
      {currentView === 'veille-cdg' && <VeilleCdgPage onClose={handleClose} />}
      {currentView === 'podcasts' && <EspacePodcastsFigurines onClose={handleClose} />}
      {currentView === 'dessine-moi-le-statut' && <DessineMoiLeStatut onClose={handleClose} />}
      {currentView === 'docutheque-rag' && <DocuthequeRAG onBack={handleClose} />}
      {currentView === 'coin-rh' && <CoinRH onClose={handleClose} />}
      {currentView === 'simul-agent' && <SimulateurCarriere onClose={handleClose} />}
      
      {/* Ajoutez ici d'autres vues comme "chat" ou "menu" qui étaient dans App.tsx */}
    </Suspense>
  );
};
