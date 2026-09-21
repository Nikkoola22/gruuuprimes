import React from "react";
import { ArrowLeft, FileSignature, FileBadge, Baby, UserCheck, UserPlus, RefreshCw, Briefcase, PlusCircle, LayoutList } from "lucide-react";
import { SimulationActeModule } from "./SimulationActeModule";

interface ActeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  toolId: string;
  onOpen: (id: string) => void;
}

const ActeCard: React.FC<ActeCardProps> = ({ title, description, icon, toolId, onOpen }) => {
  return (
    <div 
      className="group bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-2 border-transparent hover:border-purple-400 cursor-pointer flex flex-col h-full"
      onClick={() => onOpen(toolId)}
    >
      <div className="text-4xl mb-4 w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 flex-grow">{description}</p>
      <button className="inline-flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        <span>Accéder au module</span>
        <ArrowLeft className="w-4 h-4 rotate-180" />
      </button>
    </div>
  );
};

const Metiers: React.FC<{ onClose: () => void; onOpenCalculator: (id: string) => void; theme?: 'light' | 'dark' }> = ({ onClose, onOpenCalculator, theme = 'dark' }) => {
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto overflow-x-hidden overscroll-contain bg-slate-50 dark:bg-slate-900">
      
      {/* HEADER GLOBAL OUTILS RH */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              <FileSignature className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Aides aux Gestionnaires</h1>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onClose();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Retour</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-16">
        
        {/* Module 1 : Actes RH (Arrêtés & Délibérations) */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
              <LayoutList className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Actes RH (Arrêtés & Délibérations)</h2>
              <p className="text-slate-500 dark:text-slate-400">Générez rapidement vos actes officiels pré-remplis</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <ActeCard
              title="Nomination stagiaire"
              description="Arrêté de mise en stage"
              icon={<UserPlus className="w-6 h-6" />}
              toolId="arr-nomination"
              onOpen={onOpenCalculator}
            />
            <ActeCard
              title="Titularisation"
              description="Arrêté de titularisation"
              icon={<FileBadge className="w-6 h-6" />}
              toolId="arr-titularisation"
              onOpen={onOpenCalculator}
            />
            <ActeCard
              title="Avancement d'échelon"
              description="Arrêté d'avancement d'échelon"
              icon={<ArrowLeft className="w-6 h-6 rotate-90" />}
              toolId="arr-echelon"
              onOpen={onOpenCalculator}
            />
            <ActeCard
              title="Télétravail"
              description="Arrêté portant autorisation de télétravail"
              icon={<Briefcase className="w-6 h-6" />}
              toolId="arr-teletravail"
              onOpen={onOpenCalculator}
            />
            <ActeCard
              title="Congé Parental"
              description="Arrêté de placement en congé parental"
              icon={<Baby className="w-6 h-6" />}
              toolId="arr-conge-parental"
              onOpen={onOpenCalculator}
            />
            <ActeCard
              title="Détachement"
              description="Arrêté de détachement entrant/sortant"
              icon={<RefreshCw className="w-6 h-6" />}
              toolId="arr-detachement"
              onOpen={onOpenCalculator}
            />
            <ActeCard
              title="Intégration après détachement"
              description="Arrêté d'intégration dans le grade"
              icon={<UserCheck className="w-6 h-6" />}
              toolId="arr-integration"
              onOpen={onOpenCalculator}
            />
            <ActeCard
              title="Mutation Externe"
              description="Arrêté portant mutation externe"
              icon={<RefreshCw className="w-6 h-6" />}
              toolId="arr-mutation-externe"
              onOpen={onOpenCalculator}
            />
            <ActeCard
              title="Mutation Interne"
              description="Changement d'affectation interne"
              icon={<RefreshCw className="w-6 h-6" />}
              toolId="arr-mutation-interne"
              onOpen={onOpenCalculator}
            />
            <ActeCard
              title="Création / Suppression de poste"
              description="Délibérations"
              icon={<PlusCircle className="w-6 h-6" />}
              toolId="delib-poste"
              onOpen={onOpenCalculator}
            />
          </div>
        </section>

        {/* Module 2 : Simulation d'Actes */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
              <FileSignature className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Simulation d'Actes (Non officiels)</h2>
              <p className="text-slate-500 dark:text-slate-400">Rédigez et simulez des actes complexes ou non-standard</p>
            </div>
          </div>
          <SimulationActeModule theme={theme} />
        </section>
        
      </div>
    </div>
  );
};

export default Metiers;
