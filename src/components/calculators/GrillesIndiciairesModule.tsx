import React from "react";
import { ArrowLeft, Palette, Crown, FileText, Wrench, Users, Activity, Heart, LayoutGrid } from "lucide-react";

interface MetierCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  filiere: string;
}

const MetierCard: React.FC<MetierCardProps> = ({ icon, title, description, filiere }) => {
  const handleNavigate = () => {
    const urls: Record<string, string> = {
      'culturelle': 'https://interco.cfdt.fr/vos-metiers/fonction-publique-territoriale/filiere-culturelle/',
      'emplois-fonctionnels': 'https://interco.cfdt.fr/vos-metiers/fonction-publique-territoriale/metiers-de-direction/',
      'administrative': 'https://interco.cfdt.fr/vos-metiers/fonction-publique-territoriale/filiere-administrative/',
      'technique': 'https://interco.cfdt.fr/vos-metiers/fonction-publique-territoriale/filiere-technique/',
      'animation': 'https://interco.cfdt.fr/vos-metiers/fonction-publique-territoriale/filiere-animation/',
      'sportive': 'https://interco.cfdt.fr/vos-metiers/fonction-publique-territoriale/filiere-sportive/',
      'medico-sociale': 'https://interco.cfdt.fr/vos-metiers/fonction-publique-territoriale/filiere-medico-sociale/'
    };
    
    if (urls[filiere]) {
      window.open(urls[filiere], '_blank');
    }
  };

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-5 sm:p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border-2 border-transparent hover:border-emerald-400 cursor-pointer"
      onClick={handleNavigate}
    >
      <div className="text-6xl mb-6 w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">{description}</p>
      <button className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform group-hover:scale-105">
        <span>Voir les grilles</span>
        <ArrowLeft className="w-4 h-4 rotate-180" />
      </button>
    </div>
  );
};

export const GrillesIndiciairesModule: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12 w-full">
      <div className="bg-white/80 dark:bg-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Grilles Indiciaires</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Consultez les grilles par métier et catégorie</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <MetierCard
            icon={<Palette className="w-full h-full" />}
            title="Filière Culturelle"
            description="Professionnels de la culture, du patrimoine, des bibliothèques, des musées et des activités artistiques."
            filiere="culturelle"
          />
          <MetierCard
            icon={<Crown className="w-full h-full" />}
            title="Emplois Fonctionnels et Experts"
            description="Postes de direction, d'encadrement supérieur et d'expertise technique de haut niveau."
            filiere="emplois-fonctionnels"
          />
          <MetierCard
            icon={<FileText className="w-full h-full" />}
            title="Filière Administrative"
            description="Administrateurs, attachés, rédacteurs et adjoints administratifs territoriaux."
            filiere="administrative"
          />
          <MetierCard
            icon={<Wrench className="w-full h-full" />}
            title="Filière Technique"
            description="Ingénieurs, techniciens et agents techniques spécialisés dans les infrastructures et l'environnement."
            filiere="technique"
          />
          <MetierCard
            icon={<Users className="w-full h-full" />}
            title="Filière Animation"
            description="Animateurs territoriaux, coordinateurs d'activités socio-éducatives et culturelles."
            filiere="animation"
          />
          <MetierCard
            icon={<Activity className="w-full h-full" />}
            title="Filière Sportive"
            description="Conseillers et éducateurs territoriaux des activités physiques et sportives."
            filiere="sportive"
          />
          <MetierCard
            icon={<Heart className="w-full h-full" />}
            title="Filière Médico-Sociale"
            description="Professionnels de la santé, du social et de l'aide à la personne dans les collectivités."
            filiere="medico-sociale"
          />
        </div>
      </div>
    </div>
  );
};
