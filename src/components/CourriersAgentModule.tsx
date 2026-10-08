import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Mail,
  Download,
  Printer,
  Copy,
  Check,
  Edit3,
  User,
  Save,
  RotateCcw,
  Search,
  ArrowLeft,
  Clock,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import {
  COURRIERS_REGISTRY,
  COURRIER_CATEGORIES,
  DEFAULT_AGENT_PROFILE,
  type AgentProfile,
  type CourrierTemplate,
  generateFullCourrierText
} from '../data/courriersAgentRegistry';
import { exportCourrierAgentToDocx } from '../utils/docxExport';

interface CourriersAgentModuleProps {
  onClose?: () => void;
}

const STORAGE_KEY_PROFILE = 'agent_profile_gennevilliers_v2';

export default function CourriersAgentModule({ onClose }: CourriersAgentModuleProps) {
  // Profil de l'agent persistant en LocalStorage
  const [profile, setProfile] = useState<AgentProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) return JSON.parse(saved);
      // Migration éventuelle si l'ancien profil stocké était l'exemple DUPONT par défaut
      const oldSaved = localStorage.getItem('agent_profile_gennevilliers_v1');
      if (oldSaved) {
        const parsed = JSON.parse(oldSaved);
        if (parsed.nom === 'DUPONT' && parsed.prenom === 'Marie') {
          return DEFAULT_AGENT_PROFILE;
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_AGENT_PROFILE;
  });

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempProfile, setTempProfile] = useState<AgentProfile>(profile);

  // Recherche & Catégorie
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modèle actif
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    COURRIERS_REGISTRY[0]?.id || 'courrier_temps_partiel_autorisation'
  );

  // Valeurs des variables du modèle actif
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  // Mode d'envoi et pièces jointes personnalisées
  const [modeEnvoi, setModeEnvoi] = useState<string>('');
  const [customPj, setCustomPj] = useState<string[]>([]);
  const [newPjInput, setNewPjInput] = useState<string>('');

  // Mode d'affichage (Prévisualisation directe vs Édition manuelle du corps)
  const [isDirectTextEdit, setIsDirectTextEdit] = useState(false);
  const [customizedBodyText, setCustomizedBodyText] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');

  // Référence pour le conteneur de prévisualisation (impression), racine et section variables
  const previewRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const variablesSectionRef = useRef<HTMLDivElement>(null);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setTimeout(() => {
      variablesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Forcer l'affichage immédiat du haut de la page dès l'ouverture du module
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const scrollContainer = document.querySelector('section.fixed.inset-0.overflow-y-auto') as HTMLElement;
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
      scrollContainer.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    rootRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });

    const rafId = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
      rootRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
    });

    return () => cancelAnimationFrame(rafId);
  }, []);

  // Trouver le modèle actif
  const currentTemplate = useMemo(() => {
    return (
      COURRIERS_REGISTRY.find((t) => t.id === selectedTemplateId) ||
      COURRIERS_REGISTRY[0]
    );
  }, [selectedTemplateId]);

  // Initialisation des champs du modèle lors du changement de sélection
  useEffect(() => {
    if (!currentTemplate) return;
    const initialValues: Record<string, string> = {};
    currentTemplate.fields.forEach((field) => {
      initialValues[field.id] = field.defaultValue || '';
    });
    setFormValues(initialValues);
    setModeEnvoi(currentTemplate.modeEnvoiDefaut);
    setCustomPj([...currentTemplate.piecesJointesDefaut]);
    setIsDirectTextEdit(false);
    setCustomizedBodyText('');
    setMobileTab('form');
  }, [currentTemplate]);

  // Modèles filtrés par catégorie et recherche
  const filteredTemplates = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return COURRIERS_REGISTRY.filter((tpl) => {
      const matchCat =
        selectedCategory === 'all' || tpl.category === selectedCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        tpl.title.toLowerCase().includes(q) ||
        tpl.summary.toLowerCase().includes(q) ||
        tpl.cgfpRef.toLowerCase().includes(q) ||
        tpl.categoryLabel.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, searchQuery]);

  // Génération du corps dynamique
  const dynamicBodyText = useMemo(() => {
    if (isDirectTextEdit && customizedBodyText) {
      return customizedBodyText;
    }
    return currentTemplate.generateBody(profile, formValues);
  }, [currentTemplate, profile, formValues, isDirectTextEdit, customizedBodyText]);

  // Génération du texte complet prêt pour le presse-papier / impression
  const fullLetterText = useMemo(() => {
    return generateFullCourrierText(
      {
        ...currentTemplate,
        modeEnvoiDefaut: (modeEnvoi || currentTemplate.modeEnvoiDefaut) as CourrierTemplate['modeEnvoiDefaut'],
        piecesJointesDefaut: customPj,
        generateBody: () => dynamicBodyText
      },
      profile,
      { _modeEnvoi: modeEnvoi }
    );
  }, [currentTemplate, profile, modeEnvoi, customPj, dynamicBodyText]);

  // Sauvegarde du profil
  const handleSaveProfile = () => {
    setProfile(tempProfile);
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(tempProfile));
      toast.success("Profil agent enregistré avec succès !");
    } catch {
      toast.error("Impossible d'enregistrer dans le stockage local.");
    }
    setShowProfileModal(false);
  };

  const handleResetProfile = () => {
    setTempProfile(DEFAULT_AGENT_PROFILE);
    setProfile(DEFAULT_AGENT_PROFILE);
    try {
      localStorage.removeItem(STORAGE_KEY_PROFILE);
      toast.info("Profil réinitialisé aux valeurs par défaut de Gennevilliers.");
    } catch {
      // ignore
    }
    setShowProfileModal(false);
  };

  // Copier le texte
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullLetterText);
      setIsCopied(true);
      toast.success("Courrier complet copié dans le presse-papier !");
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      toast.error("Erreur lors de la copie.");
    }
  };

  // Export .DOCX
  const handleExportDocx = async () => {
    try {
      toast.loading("Génération du fichier .DOCX en cours...", { id: 'docx' });
      await exportCourrierAgentToDocx({
        title: currentTemplate.title,
        agent: profile,
        cgfpRef: currentTemplate.cgfpRef,
        modeEnvoi: modeEnvoi || currentTemplate.modeEnvoiDefaut,
        bodyText: dynamicBodyText,
        piecesJointes: customPj,
        filename: `Courrier_${profile.nom}_${currentTemplate.title.slice(0, 30)}`
      });
      toast.success("Document .DOCX téléchargé avec succès !", { id: 'docx' });
    } catch (err) {
      console.error(err);
      toast.error("Échec de la génération du document .DOCX", { id: 'docx' });
    }
  };

  // Impression
  const handlePrint = () => {
    window.print();
  };

  // Gestion des pièces jointes
  const handleAddPj = () => {
    if (!newPjInput.trim()) return;
    setCustomPj((prev) => [...prev, newPjInput.trim()]);
    setNewPjInput('');
  };

  const handleRemovePj = (idx: number) => {
    setCustomPj((prev) => prev.filter((_, i) => i !== idx));
  };

  const todayFormatted = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div ref={rootRef} className="w-full max-w-7xl mx-auto space-y-6 pb-16 print:p-0 print:m-0 print:max-w-none">
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. EN-TÊTE DU MODULE
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {onClose && (
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-red-500/30 transition-all duration-200 group shrink-0 cursor-pointer"
                title="Retour à la boîte à outils"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Retour aux outils</span>
              </button>
            )}
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-md">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
                  Courriers & Requêtes de l'Agent
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  CGFP & Décrets
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Modèles officiels pré-remplis pour formaliser vos demandes auprès du Maire et de la DRH.
              </p>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────
            2. RECHERCHE & CATÉGORIES
        ───────────────────────────────────────────────────────────────────────────── */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700/60 flex flex-col md:flex-row gap-4">
          {/* Barre de recherche */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une demande (ex: temps partiel, télétravail, CET, recours, rupture, retraite...)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Effacer
              </button>
            )}
          </div>
        </div>

        {/* Onglets de catégories */}
        <div className="flex gap-2 overflow-x-auto pb-1 mt-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
          {COURRIER_CATEGORIES.map((cat) => {
            const count =
              cat.id === 'all'
                ? COURRIERS_REGISTRY.length
                : COURRIERS_REGISTRY.filter((t) => t.category === cat.id).length;
            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[11px] ${
                    isActive
                      ? 'bg-indigo-700 text-indigo-100'
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Boutons d'onglet mobile (Formulaire / Visualisation A4) */}
      <div className="flex lg:hidden bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 print:hidden">
        <button
          onClick={() => setMobileTab('form')}
          className={`flex-1 py-2 text-center rounded-lg text-sm font-medium transition-colors ${
            mobileTab === 'form'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          1. Personnaliser la demande
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 text-center rounded-lg text-sm font-medium transition-colors ${
            mobileTab === 'preview'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          2. Aperçu & Exporter ({currentTemplate.title.slice(0, 18)}...)
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          3. CONTENU PRINCIPAL (2 COLONNES)
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLONNE GAUCHE (5/12) : SÉLECTION DU MODÈLE & FORMULAIRE */}
        <div
          className={`lg:col-span-5 space-y-6 ${
            mobileTab === 'preview' ? 'hidden lg:block' : 'block'
          } print:hidden`}
        >
          {/* Carte récapitulative Émetteur Actif */}
          <div className="bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/70 dark:from-slate-800 dark:via-slate-800/90 dark:to-indigo-950/40 rounded-2xl p-4 shadow-sm border-2 border-indigo-200/90 dark:border-indigo-700/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  Émetteur actif / Signataire
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {profile.civilite} {profile.prenom} {profile.nom}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 truncate">
                  {profile.grade}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {profile.direction} {profile.matricule ? `• Matr. ${profile.matricule}` : ''}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setTempProfile(profile);
                setShowProfileModal(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-600 text-indigo-700 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Modifier vos nom, prénom, grade, direction, adresse..."
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Modifier</span>
            </button>
          </div>

          {/* Liste déroulante / Cards de sélection rapide */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Choisir le modèle ({filteredTemplates.length})
              </label>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                {currentTemplate.categoryLabel}
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
              {filteredTemplates.map((tpl) => {
                const isSelected = tpl.id === selectedTemplateId;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-600 text-indigo-900 dark:text-indigo-200 shadow-sm'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-xl shrink-0 mt-0.5">{tpl.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate leading-tight">
                        {tpl.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {tpl.cgfpRef}
                      </div>
                      {tpl.delaiRecommande && (
                        <div className="inline-flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded mt-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{tpl.delaiRecommande}</span>
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Formulaire des paramètres du modèle actif */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentTemplate.icon}</span>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
                    {currentTemplate.title}
                  </h2>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                    {currentTemplate.cgfpRef}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                {currentTemplate.summary}
              </p>
            </div>

            {/* Champs dynamiques du modèle */}
            <div ref={variablesSectionRef} className="space-y-4 scroll-mt-6">
              <div className="flex items-center justify-between pb-1 border-b border-indigo-100 dark:border-indigo-900/50">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                    <Edit3 className="w-3.5 h-3.5" />
                  </span>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                    Variables du courrier
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                  ✏️ Champs modifiables
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ajustez les paramètres ci-dessous : le texte de la lettre s'actualise automatiquement en direct.
              </p>

              {currentTemplate.fields.map((field) => {
                const val = formValues[field.id] || '';

                return (
                  <div key={field.id} className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {field.label}
                    </label>

                    {field.type === 'select' && (
                      <select
                        value={val}
                        onChange={(e) =>
                          setFormValues({ ...formValues, [field.id]: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm cursor-pointer"
                      >
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === 'textarea' && (
                      <textarea
                        rows={3}
                        value={val}
                        onChange={(e) =>
                          setFormValues({ ...formValues, [field.id]: e.target.value })
                        }
                        placeholder={field.placeholder}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm leading-relaxed"
                      />
                    )}

                    {field.type === 'date' && (
                      <input
                        type="date"
                        value={val}
                        onChange={(e) =>
                          setFormValues({ ...formValues, [field.id]: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      />
                    )}

                    {field.type === 'number' && (
                      <input
                        type="number"
                        value={val}
                        onChange={(e) =>
                          setFormValues({ ...formValues, [field.id]: e.target.value })
                        }
                        placeholder={field.placeholder}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      />
                    )}

                    {field.type === 'text' && (
                      <input
                        type="text"
                        value={val}
                        onChange={(e) =>
                          setFormValues({ ...formValues, [field.id]: e.target.value })
                        }
                        placeholder={field.placeholder}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      />
                    )}

                    {field.helperText && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {field.helperText}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mode d'envoi */}
            <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Mode d'acheminement recommandé
                </label>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                  Sélection modifiable
                </span>
              </div>
              <select
                value={modeEnvoi}
                onChange={(e) => setModeEnvoi(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm cursor-pointer"
              >
                <option value="Lettre recommandée avec avis de réception (LRAR)">
                  Lettre recommandée avec avis de réception (LRAR)
                </option>
                <option value="Voie hiérarchique avec accusé de réception">
                  Voie hiérarchique avec accusé de réception
                </option>
                <option value="Lettre remise en main propre contre décharge">
                  Lettre remise en main propre contre décharge
                </option>
              </select>
            </div>

            {/* Pièces jointes */}
            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Pièces jointes fournies ({customPj.length})
                </label>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                  Modifiable / Ajout libre
                </span>
              </div>
              <div className="space-y-1.5">
                {customPj.map((pj, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs"
                  >
                    <span className="truncate pr-2 font-medium text-slate-800 dark:text-slate-200">• {pj}</span>
                    <button
                      onClick={() => handleRemovePj(idx)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 p-1 rounded-md font-bold shrink-0 cursor-pointer transition-colors"
                      title="Supprimer cette pièce jointe"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newPjInput}
                  onChange={(e) => setNewPjInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPj()}
                  placeholder="Ajouter une pièce justificative..."
                  className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleAddPj}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer shrink-0"
                >
                  Ajouter
                </button>
              </div>
            </div>

            {/* Bascule vers vue aperçu sur mobile */}
            <div className="pt-3 block lg:hidden">
              <button
                onClick={() => setMobileTab('preview')}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm text-sm"
              >
                <span>Voir l'aperçu du courrier A4</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────
            COLONNE DROITE (7/12) : APERÇU A4 AUTHENTIQUE & ACTIONS
        ───────────────────────────────────────────────────────────────────────────── */}
        <div
          className={`lg:col-span-7 space-y-4 ${
            mobileTab === 'form' ? 'hidden lg:block' : 'block'
          } print:block print:w-full print:p-0`}
        >
          {/* Barre d'actions rapides au-dessus de la lettre */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Aperçu officiel
              </span>
              <button
                onClick={() => {
                  if (!isDirectTextEdit) {
                    setCustomizedBodyText(dynamicBodyText);
                  }
                  setIsDirectTextEdit(!isDirectTextEdit);
                }}
                className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-colors cursor-pointer ${
                  isDirectTextEdit
                    ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700'
                    : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
                }`}
                title="Modifier le corps directement à la volée"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isDirectTextEdit ? "Mode édition actif" : "Modifier le texte"}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Copier */}
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copier le texte brut"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier</span>
                  </>
                )}
              </button>

              {/* Imprimer */}
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Imprimer au format A4 ou enregistrer en PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer / PDF</span>
              </button>

              {/* Télécharger .DOCX */}
              <button
                onClick={handleExportDocx}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer"
                title="Télécharger le fichier Word .docx officiel"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exporter en Word (.docx)</span>
              </button>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────────────────────
              FEUILLE BLANCHE A4 (MISE EN PAGE COURRIER OFFICIEL FRANÇAIS)
          ───────────────────────────────────────────────────────────────────────────── */}
          <div
            ref={previewRef}
            className="bg-white text-slate-900 rounded-2xl shadow-md border border-slate-200/80 p-8 sm:p-12 font-sans relative print:shadow-none print:border-none print:p-0 print:m-0 print:text-black"
            style={{ minHeight: '840px' }}
          >
            {/* Ligne 1 : Expéditeur (gauche) & Destinataire (droite) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              {/* Expéditeur avec affordance de modification */}
              <div
                onClick={() => {
                  setTempProfile(profile);
                  setShowProfileModal(true);
                }}
                className="group relative text-xs sm:text-sm space-y-1 text-slate-800 p-2.5 -m-2.5 rounded-xl hover:bg-indigo-50/70 border border-transparent hover:border-indigo-200/80 transition-all cursor-pointer"
                title="Cliquer pour modifier les coordonnées de l'émetteur"
              >
                <div className="flex items-center gap-2">
                  <div className="font-bold text-slate-950 text-sm sm:text-base">
                    {profile.civilite} {profile.prenom} {profile.nom}
                  </div>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded print:hidden">
                    <Edit3 className="w-3 h-3" />
                    Modifier l'émetteur
                  </span>
                </div>
                <div className="font-medium text-slate-700">{profile.grade}</div>
                <div className="text-slate-600">
                  {profile.direction}
                  {profile.matricule && (
                    <span className="text-slate-500"> • Matr. {profile.matricule}</span>
                  )}
                </div>
                <div className="text-slate-600">{profile.adresse}</div>
                <div className="text-slate-600">
                  {profile.codePostal} {profile.ville}
                </div>
                <div className="text-slate-500 text-xs pt-1">
                  Tél. : {profile.telephone} • Courriel : {profile.email}
                </div>
              </div>

              {/* Destinataire */}
              <div className="text-xs sm:text-sm text-right space-y-1.5 self-start sm:justify-self-end max-w-xs">
                <div className="font-bold text-slate-950 leading-snug">
                  {profile.destinataireTitre}
                </div>
                {profile.destinataireSousCouvert.split('\n').map((line, i) => (
                  <div key={i} className="italic text-slate-700 text-xs leading-tight">
                    {line}
                  </div>
                ))}
                {profile.destinataireAdresse.split('\n').map((line, i) => (
                  <div key={i} className="text-slate-600 text-xs leading-tight">
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Fait à Gennevilliers, le ... */}
            <div className="text-right text-xs sm:text-sm text-slate-600 italic mb-6">
              Fait à Gennevilliers, le {todayFormatted}
            </div>

            {/* Mode d'envoi */}
            <div className="text-xs font-semibold text-indigo-900 bg-indigo-50/80 px-3 py-1.5 rounded-lg border border-indigo-200/60 inline-block mb-6 print:bg-transparent print:border-none print:p-0 print:text-black">
              Mode d'envoi : {modeEnvoi || currentTemplate.modeEnvoiDefaut}
            </div>

            {/* Cadre Objet & Références */}
            <div className="border-y border-slate-300 py-3.5 mb-8 space-y-1.5">
              <div className="text-xs sm:text-sm font-bold text-slate-950">
                <span className="text-indigo-900 font-extrabold print:text-black">OBJET : </span>
                <span>{currentTemplate.title}</span>
              </div>
              <div className="text-xs text-slate-600 font-mono">
                <span className="font-bold text-slate-700">RÉF. JURIDIQUES : </span>
                <span>{currentTemplate.cgfpRef}</span>
              </div>
            </div>

            {/* Corps du courrier */}
            {isDirectTextEdit ? (
              <div className="mb-8">
                <label className="block text-xs font-bold text-amber-700 mb-1">
                  Édition directe du corps du courrier :
                </label>
                <textarea
                  rows={14}
                  value={customizedBodyText}
                  onChange={(e) => setCustomizedBodyText(e.target.value)}
                  className="w-full p-4 border border-amber-300 rounded-xl bg-amber-50/30 text-slate-900 font-sans text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed space-y-4 mb-10 text-justify">
                {dynamicBodyText.split(/\n\s*\n/).map((para, idx) => (
                  <p key={idx} className="indent-4">
                    {para}
                  </p>
                ))}
              </div>
            )}

            {/* Bloc de signature */}
            <div className="flex justify-end pt-4 mb-10">
              <div className="text-right space-y-2">
                <div className="font-bold text-sm sm:text-base text-slate-950">
                  {profile.prenom} {profile.nom}
                </div>
                <div className="text-xs text-slate-400 italic">(Signature)</div>
                <div className="h-16 w-36 border-b border-dashed border-slate-300 ml-auto"></div>
              </div>
            </div>

            {/* Pièces jointes en bas de page */}
            {customPj.length > 0 && (
              <div className="border-t border-slate-200 pt-4 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-700">Pièces jointes fournies ({customPj.length}) :</div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                  {customPj.map((pj, i) => (
                    <li key={i}>{pj}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Filigrane discret Ville de Gennevilliers */}
            <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
              Document officiel rédigé conformément aux dispositions du Code Général de la Fonction Publique • Ville de Gennevilliers
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          4. MODAL PARAMÉTRAGE PROFIL AGENT
      ───────────────────────────────────────────────────────────────────────────── */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in print:hidden">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    Paramètres de l'Agent Territorial
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ces informations pré-remplissent automatiquement l'en-tête de vos courriers.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Civilité
                </label>
                <select
                  value={tempProfile.civilite}
                  onChange={(e) =>
                    setTempProfile({ ...tempProfile, civilite: e.target.value as AgentProfile['civilite'] })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                >
                  <option value="Mme">Mme</option>
                  <option value="M.">M.</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Matricule RH
                </label>
                <input
                  type="text"
                  value={tempProfile.matricule || ''}
                  onChange={(e) =>
                    setTempProfile({ ...tempProfile, matricule: e.target.value })
                  }
                  placeholder="Ex: 10482"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Prénom
                </label>
                <input
                  type="text"
                  value={tempProfile.prenom}
                  onChange={(e) =>
                    setTempProfile({ ...tempProfile, prenom: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nom d'usage
                </label>
                <input
                  type="text"
                  value={tempProfile.nom}
                  onChange={(e) =>
                    setTempProfile({ ...tempProfile, nom: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Grade statutaire
                </label>
                <input
                  type="text"
                  value={tempProfile.grade}
                  onChange={(e) =>
                    setTempProfile({ ...tempProfile, grade: e.target.value })
                  }
                  placeholder="Ex: Adjoint Administratif Principal de 2e classe"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Direction / Service d'affectation
                </label>
                <input
                  type="text"
                  value={tempProfile.direction}
                  onChange={(e) =>
                    setTempProfile({ ...tempProfile, direction: e.target.value })
                  }
                  placeholder="Ex: Direction de l'Enfance et de la Petite Enfance"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Adresse personnelle
                </label>
                <input
                  type="text"
                  value={tempProfile.adresse}
                  onChange={(e) =>
                    setTempProfile({ ...tempProfile, adresse: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Code Postal
                </label>
                <input
                  type="text"
                  value={tempProfile.codePostal}
                  onChange={(e) =>
                    setTempProfile({ ...tempProfile, codePostal: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ville
                </label>
                <input
                  type="text"
                  value={tempProfile.ville}
                  onChange={(e) =>
                    setTempProfile({ ...tempProfile, ville: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Téléphone
                </label>
                <input
                  type="text"
                  value={tempProfile.telephone}
                  onChange={(e) =>
                    setTempProfile({ ...tempProfile, telephone: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Courriel
                </label>
                <input
                  type="email"
                  value={tempProfile.email}
                  onChange={(e) =>
                    setTempProfile({ ...tempProfile, email: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Destinataire officiel */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 dark:text-white">
                Destinataires officiels de la Ville de Gennevilliers
              </h4>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Autorité territoriale
                </label>
                <input
                  type="text"
                  value={tempProfile.destinataireTitre}
                  onChange={(e) =>
                    setTempProfile({ ...tempProfile, destinataireTitre: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Voie hiérarchique ("Sous couvert de...")
                </label>
                <textarea
                  rows={2}
                  value={tempProfile.destinataireSousCouvert}
                  onChange={(e) =>
                    setTempProfile({ ...tempProfile, destinataireSousCouvert: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={handleResetProfile}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réinitialiser aux valeurs d'origine</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer mon profil</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
