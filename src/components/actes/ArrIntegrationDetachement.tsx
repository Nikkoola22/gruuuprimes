import React, { useState } from "react";
import { FileSignature, Copy, CheckCircle2, User, Building, Info, CornerDownRight } from "lucide-react";
import { fptCadres, echelonsList, getIndicesForGradeAndEchelon } from "../../utils/fptData";

export const ArrIntegrationDetachement: React.FC = () => {
  // 1. AUTORITÉ TERRITORIALE & SIGNATURE
  const [titreAutorite, setTitreAutorite] = useState("Le Maire");
  const [collectivite, setCollectivite] = useState("Commune de Gennevilliers");
  const [departement, setDepartement] = useState("Hauts-de-Seine");
  const [villeSignature, setVilleSignature] = useState("Gennevilliers");
  const [dateArrete, setDateArrete] = useState("");
  const [chargeExecution, setChargeExecution] = useState("La directrice générale des services");

  // 2. AGENT
  const [civilite, setCivilite] = useState("Monsieur");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [adminOrigine, setAdminOrigine] = useState("");
  
  // 3. INTÉGRATION (GRADE D'ACCUEIL)
  const [cadreEmplois, setCadreEmplois] = useState("");
  const [grade, setGrade] = useState("");
  
  const handleCadreChange = (cadreNom: string) => {
    setCadreEmplois(cadreNom);
    const cadre = fptCadres.find(c => c.nom === cadreNom);
    if (cadre) {
      setGrade(cadre.grades[0] || "");
    } else {
      setGrade("");
    }
    setEchelon("");
    setIndiceBrut("");
    setIndiceMajore("");
    setShowResult(false);
  };

  const handleGradeChange = (gradeNom: string) => {
    setGrade(gradeNom);
    setEchelon("");
    setIndiceBrut("");
    setIndiceMajore("");
    setShowResult(false);
  };

  const handleEchelonChange = (echelonNom: string) => {
    setEchelon(echelonNom);
    if (grade && echelonNom) {
      const indices = getIndicesForGradeAndEchelon(grade, echelonNom);
      if (indices) {
        setIndiceBrut(indices.ib);
        setIndiceMajore(indices.im);
      }
    }
    setShowResult(false);
  };

  const [echelon, setEchelon] = useState("");
  const [indiceBrut, setIndiceBrut] = useState("");
  const [indiceMajore, setIndiceMajore] = useState("");
  
  const [dateDebutDetachement, setDateDebutDetachement] = useState("");
  const [dateIntegration, setDateIntegration] = useState("");
  const [villeTA, setVilleTA] = useState("Nanterre");
  
  const [copied, setCopied] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleCopy = () => {
    const el = document.getElementById("arrete-content");
    if (el) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      selection?.removeAllRanges();
      selection?.addRange(range);
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
      selection?.removeAllRanges();
    }
  };

  const handleGenerate = () => {
    setShowResult(true);
  };

  const handleInputChange = <T,>(setter: (val: T) => void, value: T) => {
    setter(value);
    setShowResult(false);
  };

  const renderField = (value: string, placeholder: string) => {
    if (!value || value.trim() === "") {
      return <span className="text-orange-500 font-bold bg-orange-50 px-1 rounded">[{placeholder}]</span>;
    }
    if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(value).toLocaleDateString('fr-FR');
    }
    return <span className="font-semibold">{value}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl text-rose-600 dark:text-rose-400">
            <FileSignature className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Arrêté d'Intégration</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Suite à un détachement</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* 1. AUTORITÉ TERRITORIALE */}
          <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-400" /> Collectivité d'intégration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Titre de l'autorité</label>
                <input type="text" value={titreAutorite} onChange={(e) => handleInputChange(setTitreAutorite, e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nom de la collectivité</label>
                <input type="text" value={collectivite} onChange={(e) => handleInputChange(setCollectivite, e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Département (CDG)</label>
                <input type="text" value={departement} onChange={(e) => handleInputChange(setDepartement, e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Ville de signature</label>
                <input type="text" value={villeSignature} onChange={(e) => handleInputChange(setVilleSignature, e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Date de l'arrêté</label>
                <input type="date" value={dateArrete} onChange={(e) => handleInputChange(setDateArrete, e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Chargé(e) de l'exécution</label>
                <input type="text" value={chargeExecution} onChange={(e) => handleInputChange(setChargeExecution, e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white" />
              </div>
            </div>
          </div>

          {/* 2. AGENT */}
          <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" /> Informations de l'agent
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Civilité</label>
                <select value={civilite} onChange={(e) => handleInputChange(setCivilite, e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white">
                  <option value="Monsieur">Monsieur</option>
                  <option value="Madame">Madame</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nom</label>
                <input type="text" value={nom} onChange={(e) => handleInputChange(setNom, e.target.value)} placeholder="Nom" className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Prénom</label>
                <input type="text" value={prenom} onChange={(e) => handleInputChange(setPrenom, e.target.value)} placeholder="Prénom" className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Administration d'origine</label>
                <input type="text" value={adminOrigine} onChange={(e) => handleInputChange(setAdminOrigine, e.target.value)} placeholder="Ex: Préfecture du Rhône" className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white" />
              </div>
            </div>
          </div>

          {/* 3. INTÉGRATION */}
          <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <CornerDownRight className="w-4 h-4 text-slate-400" /> Modalités d'intégration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Cadre d'emplois d'accueil</label>
                <select value={cadreEmplois} onChange={(e) => handleCadreChange(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white">
                  <option value="">Sélectionnez un cadre d'emplois...</option>
                  {fptCadres.map(c => <option key={c.id} value={c.nom}>{c.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Grade d'intégration</label>
                <select value={grade} onChange={(e) => handleGradeChange(e.target.value)} disabled={!cadreEmplois} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white">
                  <option value="">Sélectionnez un grade...</option>
                  {cadreEmplois && fptCadres.find(c => c.nom === cadreEmplois)?.grades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Échelon</label>
                <select value={echelon} onChange={(e) => handleEchelonChange(e.target.value)} disabled={!grade} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white">
                  <option value="">Sélectionnez un échelon...</option>
                  {echelonsList.map(ech => <option key={ech} value={ech}>{ech}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Indice Brut (IB)</label>
                <input type="text" value={indiceBrut} onChange={(e) => handleInputChange(setIndiceBrut, e.target.value)} placeholder="IB" className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Indice Majoré (IM)</label>
                <input type="text" value={indiceMajore} onChange={(e) => handleInputChange(setIndiceMajore, e.target.value)} placeholder="IM" className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Date du détachement initial</label>
                <input type="date" value={dateDebutDetachement} onChange={(e) => handleInputChange(setDateDebutDetachement, e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Date d'intégration</label>
                <input type="date" value={dateIntegration} onChange={(e) => handleInputChange(setDateIntegration, e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Ville du Tribunal Administratif</label>
                <input type="text" value={villeTA} onChange={(e) => handleInputChange(setVilleTA, e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white" />
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-start gap-2.5 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-xs text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-orange-500" />
            <p>
              Les champs non renseignés apparaîtront en <strong>orange</strong> dans le document généré. Vous pourrez ainsi repérer facilement ce qu'il reste à compléter manuellement.
            </p>
          </div>

          <div className="pt-4 flex justify-center">
            <button onClick={handleGenerate} className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-rose-500/30 flex items-center gap-2">
              Générer l'arrêté (.docx via Copier/Coller)
            </button>
          </div>
        </div>

        <div className={`mt-8 transition-all duration-500 ${showResult ? 'opacity-100 transform-none' : 'opacity-0 translate-y-4 pointer-events-none hidden'}`}>
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Aperçu de l'arrêté
              </h3>
              <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors border border-slate-200 dark:border-slate-600 shadow-sm">
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copié !" : "Copier pour Word"}
              </button>
            </div>
            
            <div className="p-10 font-serif text-[13px] leading-relaxed text-slate-900 dark:text-slate-200 max-h-[600px] overflow-y-auto" id="arrete-content">
              
              <div className="flex justify-between items-start mb-12">
                <div className="w-1/2 text-center border-b border-slate-400 pb-2">
                  <img src="/images/gennevilliers_logo.svg" alt="Logo" className="h-16 mx-auto mb-4 object-contain" />
                  <p className="uppercase font-bold text-sm">{renderField(collectivite, "NOM DE LA COLLECTIVITÉ")}</p>
                  <p className="text-xs">{renderField(departement, "DÉPARTEMENT")}</p>
                </div>
                <div className="w-1/2 text-right">
                  <p>Arrêté n° {renderField("", "NUMÉRO")}</p>
                </div>
              </div>

              <h4 className="text-center font-bold text-lg mb-8 uppercase">
                ARRÊTÉ PORTANT INTÉGRATION APRÈS DÉTACHEMENT<br/>
                DE {civilite.toUpperCase()} {renderField(nom.toUpperCase(), "NOM")} {renderField(prenom, "PRÉNOM")}
              </h4>

              <div className="space-y-4 text-justify">
                <p><strong>{renderField(titreAutorite, "AUTORITÉ TERRITORIALE")}</strong> de {renderField(collectivite, "COLLECTIVITÉ")},</p>
                
                <p><strong>Vu</strong> le code général de la fonction publique,</p>
                <p><strong>Vu</strong> l'arrêté municipal du 30 mars 2026 portant délégation d'attribution de fonctions et de signature à Monsieur Pierric ANNOOT, 12ème adjoint au Maire délégué aux Ressources Humaines,</p>
                <p><strong>Vu</strong> le décret n°86-68 du 13 janvier 1986 modifié relatif aux positions de détachement, hors cadres, de disponibilité, de congé parental des fonctionnaires territoriaux et à l'intégration,</p>
                <p><strong>Vu</strong> l'arrêté en date du {renderField(dateDebutDetachement, "DATE DÉTACHEMENT INITIAL")} plaçant {civilite} {renderField(nom.toUpperCase(), "NOM")} {renderField(prenom, "PRÉNOM")} en position de détachement au sein de la collectivité,</p>
                <p><strong>Vu</strong> la demande écrite de l'agent sollicitant son intégration dans le cadre d'emplois des {renderField(cadreEmplois, "CADRE D'EMPLOIS")},</p>
                <p><strong>Vu</strong> l'accord de l'administration d'origine, à savoir {renderField(adminOrigine, "ADMINISTRATION D'ORIGINE")},</p>
                
                <div className="text-center font-bold mt-8 mb-6">ARRÊTE</div>

                <p><strong>ARTICLE 1 :</strong><br/>
                À compter du {renderField(dateIntegration, "DATE D'INTÉGRATION")}, {civilite} {renderField(nom.toUpperCase(), "NOM")} {renderField(prenom, "PRÉNOM")} est intégré(e) dans le cadre d'emplois des {renderField(cadreEmplois, "CADRE D'EMPLOIS")} au sein de {renderField(collectivite, "COLLECTIVITÉ")}.</p>

                <p><strong>ARTICLE 2 :</strong><br/>
                À cette même date, l'intéressé(e) est classé(e) au grade de {renderField(grade, "GRADE")}, au {renderField(echelon, "ÉCHELON")}, Indice Brut {renderField(indiceBrut, "IB")}, Indice Majoré {renderField(indiceMajore, "IM")}.</p>
                
                <p><strong>ARTICLE 3 :</strong><br/>
                Les services accomplis dans le corps ou cadre d'emplois d'origine sont assimilés à des services accomplis dans le cadre d'emplois d'intégration.</p>

                <p><strong>ARTICLE 4 :</strong><br/>
                Madame Soraya FONTAINE KESSAR, Directrice Générale des Services, et le Comptable Public sont chargés, chacun en ce qui le concerne, de l'exécution du présent arrêté qui sera notifié à l'intéressé(e).</p>

                <div className="text-[11px] italic mt-8 border-t border-slate-300 pt-4 space-y-2 text-justify">
                  <p>
                    Je soussigné-e reconnais avoir reçu un exemplaire du present arrêté et avoir été informé-e que je dois obligatoirement, dans un délai de deux mois à compter de sa notification, et avant de saisir le tribunal administratif, saisir le médiateur du Centre Interdépartemental de Gestion de la Petite Couronne soit par courrier postal à l'adresse suivante : « CIG Petite couronne - Recours à la médiation préalable obligatoire 1 rue Lucienne Gérain 93698 Pantin cedex », soit par message électronique à « mediateur@cig929394.fr » pour qu'il engage une médiation (décret n°2018-101 du 16 février 2018 et arrêté du 2 mars 2018). Une copie de cet arrêté doit être jointe à la demande.
                  </p>
                  <p>
                    Si cette médiation ne permet pas de parvenir à un accord, vous pourrez contester le présent arrêté devant le tribunal administratif de Cergy-Pontoise dans un délai de deux mois à compter de la fin de la médiation. Une copie de cet arrêté devra être jointe à votre recours.
                  </p>
                </div>

                <div className="mt-12 flex justify-between items-end">
                  <div className="w-1/2">
                    <p className="font-bold text-sm mb-12">Signature de l'intéressé(e)<br/><span className="text-xs font-normal italic">(précédée de la mention « lu et approuvé »)</span></p>
                  </div>
                  <div className="text-right w-1/2">
                    <p>Fait à {renderField(villeSignature, "VILLE")}, le {renderField(dateArrete, "DATE DE L'ARRÊTÉ")}</p>
                    <p className="mt-4 font-bold">Pour {renderField(titreAutorite, "AUTORITÉ TERRITORIALE")} et par délégation,</p>
                    <p className="font-bold">Monsieur Pierric ANNOOT</p>
                    <p className="italic text-xs mt-8">(Signature et cachet)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
