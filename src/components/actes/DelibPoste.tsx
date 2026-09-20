import React, { useState } from "react";
import { FileText, Plus, Trash2, Download, Building2, User, Users, Calendar, Gavel, Scale } from "lucide-react";
import { CADRES_EMPLOIS } from "../../data/gradesData";

export const DelibPoste: React.FC = () => {
  const [collectivite, setCollectivite] = useState("");
  
  // Structures
  const [structures, setStructures] = useState<string[]>([""]);

  const addStructure = () => setStructures([...structures, ""]);
  const updateStructure = (index: number, value: string) => {
    const newStructures = [...structures];
    newStructures[index] = value;
    setStructures(newStructures);
  };
  const removeStructure = (index: number) => {
    setStructures(structures.filter((_, i) => i !== index));
  };

  // Poste
  const [numPoste, setNumPoste] = useState("");
  const [quotite, setQuotite] = useState(100);
  const [libelle, setLibelle] = useState("");
  
  const [cadreId, setCadreId] = useState("");
  const [gradeId, setGradeId] = useState("");

  const selectedCadre = CADRES_EMPLOIS.find(c => c.id === cadreId);

  // Séance
  const [organe, setOrgane] = useState("");
  const [dateSeance, setDateSeance] = useState("");
  const [heureSeance, setHeureSeance] = useState("");
  const [president, setPresident] = useState("");
  const [secretaire, setSecretaire] = useState("");

  // Quorum
  const [membres, setMembres] = useState("");
  const [presents, setPresents] = useState("");
  const [representes, setRepresentes] = useState("");
  const [pour, setPour] = useState("");
  const [contre, setContre] = useState("");
  const [abstentions, setAbstentions] = useState("");

  const handleDownload = () => {
    // Dans un environnement de production, on utiliserait une librairie comme docx.js ou une API.
    // Ici, on simule l'action pour le frontend.
    alert("Le fichier Word (Délibération.docx) serait généré et téléchargé ici !");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl text-rose-600 dark:text-rose-400">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Délibération de création de poste</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Renseignez les caractéristiques du poste et les informations de séance pour générer la délibération de création à soumettre à l'organe délibérant. Le document Word est téléchargeable directement.</p>
          </div>
        </div>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span><strong>Base légale :</strong> Art. 34 loi n°84-53 du 26 janvier 1984</span>
          <span className="text-rose-500">* Champs obligatoires</span>
        </p>
      </div>

      <div className="space-y-6">
        
        {/* 1. COLLECTIVITÉ */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center text-sm">1</span>
            COLLECTIVITÉ
          </h4>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Nom de la collectivité <span className="text-rose-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-4 w-4 text-slate-400" />
              </div>
              <input type="text" value={collectivite} onChange={(e) => setCollectivite(e.target.value)} placeholder="Ex: Mairie de Gennevilliers" className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl pl-10 px-4 py-2.5 text-sm text-slate-900 dark:text-white" />
            </div>
          </div>
        </div>

        {/* 2. DIRECTION / SERVICE */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center text-sm">2</span>
            DIRECTION / SERVICE
          </h4>
          <div className="space-y-3">
            {structures.map((struct, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Structure {index + 1} {index === 0 && <span className="text-rose-500">*</span>}</label>
                  <input type="text" value={struct} onChange={(e) => updateStructure(index, e.target.value)} placeholder={index === 0 ? "Ex: Direction Générale des Services" : "Ex: Service RH"} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white" />
                </div>
                {index > 0 && (
                  <button onClick={() => removeStructure(index)} className="self-end mb-1 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button onClick={addStructure} className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Ajouter un niveau de structure
            </button>
          </div>
        </div>

        {/* 3. IDENTIFICATION DU POSTE */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center text-sm">3</span>
            IDENTIFICATION DU POSTE
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Numéro de poste <span className="text-rose-500">*</span></label>
              <input type="text" value={numPoste} onChange={(e) => setNumPoste(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Quotité horaire <span className="text-rose-500">*</span></label>
              <div className="relative">
                <input type="number" min="0" max="100" value={quotite} onChange={(e) => setQuotite(Number(e.target.value))} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white" />
                <span className="absolute right-4 top-2 text-slate-400 text-sm">%</span>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Libellé du poste <span className="text-rose-500">*</span></label>
              <input type="text" value={libelle} onChange={(e) => setLibelle(e.target.value)} placeholder="Ex: Chargé(e) de mission RH" className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Cadre d'emplois <span className="text-rose-500">*</span></label>
              <select value={cadreId} onChange={(e) => { setCadreId(e.target.value); setGradeId(""); }} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white">
                <option value="">— sélectionner —</option>
                {CADRES_EMPLOIS.map(c => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Grade (facultatif)</label>
              <select value={gradeId} onChange={(e) => setGradeId(e.target.value)} disabled={!cadreId} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white disabled:opacity-50">
                <option value="">{cadreId ? "— aucun grade particulier —" : "— choisir d'abord un cadre —"}</option>
                {selectedCadre?.grades.map(g => (
                  <option key={g.id} value={g.id}>{g.nom}</option>
                ))}
              </select>
            </div>
            
            {/* Auto-filled Filière & Catégorie */}
            {selectedCadre && (
              <div className="md:col-span-2 flex gap-4 mt-2">
                <div className="flex-1 bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Filière</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedCadre.filiere}</span>
                </div>
                <div className="flex-1 bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Catégorie</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedCadre.categorie}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. SÉANCE */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center text-sm">4</span>
            SÉANCE
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Organe délibérant <span className="text-rose-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Gavel className="h-4 w-4 text-slate-400" />
                </div>
                <input type="text" value={organe} onChange={(e) => setOrgane(e.target.value)} placeholder="Ex: Le Conseil Municipal" className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl pl-10 px-4 py-2 text-sm text-slate-900 dark:text-white" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Date de la séance <span className="text-rose-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-slate-400" />
                </div>
                <input type="date" value={dateSeance} onChange={(e) => setDateSeance(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl pl-10 px-4 py-2 text-sm text-slate-900 dark:text-white" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Heure</label>
              <input type="time" value={heureSeance} onChange={(e) => setHeureSeance(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Président(e) de séance <span className="text-rose-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input type="text" value={president} onChange={(e) => setPresident(e.target.value)} placeholder="Ex: M. le Maire" className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl pl-10 px-4 py-2 text-sm text-slate-900 dark:text-white" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Secrétaire de séance</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input type="text" value={secretaire} onChange={(e) => setSecretaire(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl pl-10 px-4 py-2 text-sm text-slate-900 dark:text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* 5. QUORUM & VOTE */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center text-sm">5</span>
            QUORUM & VOTE
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="col-span-2">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Membres en exercice</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-4 w-4 text-slate-400" />
                </div>
                <input type="number" min="0" value={membres} onChange={(e) => setMembres(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl pl-10 pr-2 py-2 text-sm text-center font-semibold text-slate-900 dark:text-white" />
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Présents</label>
              <input type="number" min="0" value={presents} onChange={(e) => setPresents(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-2 py-2 text-sm text-center font-semibold text-slate-900 dark:text-white" />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Représentés</label>
              <input type="number" min="0" value={representes} onChange={(e) => setRepresentes(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-2 py-2 text-sm text-center font-semibold text-slate-900 dark:text-white" />
            </div>
            
            <div className="col-span-2 mt-2">
              <label className="block text-[10px] uppercase font-bold text-emerald-500 mb-1">Pour</label>
              <input type="number" min="0" value={pour} onChange={(e) => setPour(e.target.value)} className="w-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-2 py-2 text-sm text-center font-bold text-emerald-700 dark:text-emerald-400" />
            </div>
            <div className="col-span-2 mt-2">
              <label className="block text-[10px] uppercase font-bold text-red-500 mb-1">Contre</label>
              <input type="number" min="0" value={contre} onChange={(e) => setContre(e.target.value)} className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-2 py-2 text-sm text-center font-bold text-red-700 dark:text-red-400" />
            </div>
            <div className="col-span-2 mt-2">
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Abstention(s)</label>
              <input type="number" min="0" value={abstentions} onChange={(e) => setAbstentions(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-sm text-center font-bold text-slate-700 dark:text-slate-300" />
            </div>
          </div>
        </div>

      </div>

      {/* Footer & CTA */}
      <div className="bg-slate-800 text-white p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <FileText className="w-32 h-32" />
        </div>
        
        <div className="relative z-10 space-y-1 text-center md:text-left">
          <h3 className="font-bold text-lg">Délibération de création de poste</h3>
          <p className="text-slate-400 text-sm">Document Word, Art. 34 loi n°84-53 du 26 janvier 1984</p>
        </div>

        <button 
          onClick={handleDownload}
          className="relative z-10 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 w-full md:w-auto"
        >
          <Download className="w-5 h-5" />
          Télécharger la délibération
        </button>
      </div>

    </div>
  );
};
