import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  Eye,
  Code2,
  Building2,
  Stamp,
  ShieldCheck
} from 'lucide-react';
import { exportToOfficialDocx, detectDocumentType } from '../utils/docxExport';

interface OfficialDocumentPreviewProps {
  title: string;
  category?: string;
  documentText: string;
}

export const OfficialDocumentPreview: React.FC<OfficialDocumentPreviewProps> = ({
  title,
  category,
  documentText
}) => {
  const [viewMode, setViewMode] = useState<'a4' | 'raw'>('a4');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const docType = detectDocumentType(documentText);

  let docTypeBadge = "Arrêté Municipal du Maire";
  let docBadgeColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
  let officialTemplateUrl = "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/arrete.docx";
  let officialTemplateLabel = "Trame arrete.docx";

  if (documentText.includes("RAPPORT HIÉRARCHIQUE") || documentText.includes("RAPPORT") && documentText.includes("disciplinaire")) {
    docTypeBadge = "Rapport Hiérarchique Circonstancié";
    docBadgeColor = "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800";
    officialTemplateUrl = "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_humaines/procedure_disciplinaire/modele_rapport_hierarchique_2024.docx";
    officialTemplateLabel = "Trame rapport_hierarchique.docx";
  } else if (docType === 'circulaire') {
    docTypeBadge = "Note de Service / Circulaire Interne";
    docBadgeColor = "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800";
    officialTemplateUrl = "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/circulaire.docx";
    officialTemplateLabel = "Trame circulaire.docx";
  } else if (docType === 'contrat') {
    docTypeBadge = "Contrat d'Engagement de Droit Public (CDD)";
    docBadgeColor = "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800";
    officialTemplateUrl = "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/courrier.doc";
    officialTemplateLabel = "Trame courrier.doc";
  } else if (docType === 'deliberation') {
    docTypeBadge = "Délibération du Conseil Municipal / CST";
    docBadgeColor = "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800";
    officialTemplateUrl = "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/decision_municipale.docx";
    officialTemplateLabel = "Trame decision_municipale.docx";
  } else if (docType === 'decision') {
    docTypeBadge = "Décision Administrative Individuelle";
    docBadgeColor = "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800";
    officialTemplateUrl = "https://intranet.ville-gennevilliers.fr/Statics/Docutheque/ressources_et_moyens_generaux/charte_bureautique/decision_municipale.docx";
    officialTemplateLabel = "Trame decision_municipale.docx";
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(documentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDocx = async () => {
    setIsExporting(true);
    try {
      await exportToOfficialDocx({
        title,
        category,
        content: documentText,
        rawText: documentText,
        docType
      });
    } catch (e) {
      console.error("Erreur lors de l'export DOCX:", e);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mt-4 flex flex-col gap-3.5 min-w-0">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 sm:p-4 bg-slate-900 text-white rounded-2xl shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black tracking-wide flex items-center gap-2">
              <span>Trame Officielle Mairie de Gennevilliers</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border ${docBadgeColor}`}>
                {docTypeBadge}
              </span>
            </span>
            <span className="text-[10px] text-slate-400">Charte Bureautique & Visas Juridiques Validés</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode('a4')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'a4'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Mise en page A4</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'raw'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Texte Brut</span>
            </button>
          </div>

          {/* Download Generated Filled DOCX */}
          <button
            onClick={handleDownloadDocx}
            disabled={isExporting}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Télécharger le document prêt à l'emploi en format Word .DOCX"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? "Génération .DOCX..." : "Télécharger .DOCX"}</span>
          </button>

          {/* Download Official Blank Template (.docx / .doc) */}
          <a
            href={officialTemplateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            title={`Télécharger la trame officielle vierge (${officialTemplateLabel})`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{officialTemplateLabel}</span>
          </a>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Imprimer ou exporter en PDF officiel"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Imprimer / PDF</span>
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copié !" : "Copier"}</span>
          </button>
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER */}
      {viewMode === 'a4' ? (
        <div className="relative bg-slate-200/70 dark:bg-slate-950 p-3 sm:p-8 rounded-2xl sm:rounded-3xl flex justify-center border border-slate-300 dark:border-slate-800 overflow-x-auto">
          {/* Authentic A4 Sheet */}
          <div className="relative w-full max-w-[820px] bg-white text-slate-900 p-8 sm:p-14 shadow-2xl rounded-sm sm:rounded-md border border-slate-300/80 font-sans leading-relaxed min-h-[950px] print:m-0 print:p-8 print:shadow-none">
            
            {/* Watermark Filigrane Mairie de Gennevilliers */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.035] overflow-hidden select-none">
              <div className="text-center font-serif text-[120px] font-black uppercase tracking-widest -rotate-45 leading-none">
                GENNEVILLIERS
              </div>
            </div>

            {/* HEADER OFFICIEL - CHARTE BUREAUTIQUE */}
            <div className="relative border-b-2 border-[#0B3C5D] pb-5 mb-6 text-center">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">
                RÉPUBLIQUE FRANÇAISE
              </p>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0B3C5D] uppercase">
                VILLE DE GENNEVILLIERS
              </h1>
              <p className="text-[11px] font-bold text-[#4A6984] uppercase tracking-wider mt-1">
                DIRECTION GÉNÉRALE DES SERVICES • DIRECTION DES RESSOURCES HUMAINES
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Hôtel de Ville • 177, avenue Gabriel-Péri, 92230 Gennevilliers
              </p>
            </div>

            {/* CONTENU OFFICIEL PARAGRAPHE PAR PARAGRAPHE */}
            <div className="relative flex flex-col gap-3.5 text-[12.5px] sm:text-[13px] text-slate-800 leading-normal">
              {documentText.split('\n').map((line, idx) => {
                const trimmed = line.trim();
                if (!trimmed) {
                  return <div key={idx} className="h-2" />;
                }

                // Titre principal de l'acte (ex: ARRÊTÉ DU MAIRE, DÉCISION DU MAIRE)
                if (
                  trimmed.startsWith("ARRÊTÉ DU MAIRE") ||
                  trimmed.startsWith("DÉCISION DU MAIRE") ||
                  trimmed.startsWith("CONTRAT D'ENGAGEMENT") ||
                  trimmed.startsWith("NOTE DE SERVICE") ||
                  trimmed.startsWith("EXTRAIT DU REGISTRE")
                ) {
                  return (
                    <div key={idx} className="text-center my-3">
                      <h2 className="text-base sm:text-lg font-black text-[#0B3C5D] uppercase tracking-wide bg-slate-50 py-2 px-4 rounded-xl border border-slate-200/80 inline-block shadow-2xs">
                        {trimmed}
                      </h2>
                    </div>
                  );
                }

                // Objet / Portant ...
                if (trimmed.startsWith("Portant ") || trimmed.startsWith("OBJET :") || trimmed.startsWith("Objet :")) {
                  return (
                    <p key={idx} className="text-center font-bold italic text-slate-900 text-[13.5px] sm:text-[14px] mb-3 px-4">
                      {trimmed}
                    </p>
                  );
                }

                // Le Maire de Gennevilliers / Les soussignés
                if (
                  trimmed === "Le Maire de Gennevilliers," ||
                  trimmed === "Le Maire de Gennevilliers" ||
                  trimmed.startsWith("Entre les soussignés")
                ) {
                  return (
                    <p key={idx} className="font-extrabold text-slate-900 text-[13.5px] mt-2 mb-1">
                      {trimmed}
                    </p>
                  );
                }

                // Visas juridiques (Vu ..., Considérant ...)
                if (trimmed.startsWith("Vu ") || trimmed.startsWith("Considérant ")) {
                  const spaceIdx = trimmed.indexOf(" ");
                  const prefix = trimmed.substring(0, spaceIdx);
                  const text = trimmed.substring(spaceIdx + 1);
                  return (
                    <p key={idx} className="pl-4 text-slate-700 text-[12px] sm:text-[12.5px] leading-snug border-l-2 border-slate-200">
                      <span className="font-bold text-slate-900">{prefix}</span> {text}
                    </p>
                  );
                }

                // ARRÊTE : / DÉCIDE : / IL EST CONVENU CE QUI SUIT :
                if (
                  trimmed === "ARRÊTE :" ||
                  trimmed === "DÉCIDE :" ||
                  trimmed === "IL EST CONVENU CE QUI SUIT :" ||
                  trimmed.includes("DÉCIDE :")
                ) {
                  return (
                    <div key={idx} className="text-center my-3">
                      <span className="font-black text-[14px] text-[#0B3C5D] tracking-widest border-y-2 border-[#0B3C5D] py-1 px-8 inline-block">
                        {trimmed}
                      </span>
                    </div>
                  );
                }

                // Articles numérotés
                if (/^(ARTICLE|Article)\s+\d+/i.test(trimmed)) {
                  const match = trimmed.match(/^(ARTICLE|Article)\s+\d+[^:]*:/i);
                  if (match) {
                    const prefix = match[0];
                    const rest = trimmed.substring(prefix.length);
                    return (
                      <div key={idx} className="mt-2 mb-1 p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
                        <span className="font-black text-[#0B3C5D] mr-1.5">{prefix}</span>
                        <span className="text-slate-800">{rest.trim()}</span>
                      </div>
                    );
                  }
                }

                // Voies et délais de recours
                if (trimmed.includes("Tribunal Administratif de Cergy") || trimmed.includes("Voies de recours") || trimmed.includes("Voies et délais")) {
                  return (
                    <div key={idx} className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200/60 text-[11.5px] text-amber-950 mt-3">
                      <span className="font-bold flex items-center gap-1 text-amber-900 mb-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        Voies et Délais de Recours :
                      </span>
                      <span>{trimmed}</span>
                    </div>
                  );
                }

                // Bloc de signatures officielles
                if (trimmed.startsWith("Fait à Gennevilliers") || trimmed.startsWith("Pour le Maire") || trimmed.startsWith("Pierric ANNOOT") || trimmed.startsWith("Soraya FONTAINE")) {
                  return (
                    <div key={idx} className="text-right mt-3 font-medium text-slate-900">
                      <p className="font-bold text-[13px]">{trimmed}</p>
                    </div>
                  );
                }

                // Ligne normale
                return (
                  <p key={idx} className="text-slate-800">
                    {trimmed}
                  </p>
                );
              })}
            </div>

            {/* CACHET & STAMP OFFICIEL */}
            <div className="mt-12 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-[10px] text-slate-400">
              <div className="flex items-center gap-2">
                <Stamp className="w-4 h-4 text-[#0B3C5D]" />
                <span>Acte certifié exécutoire • Télétransmis en Préfecture des Hauts-de-Seine</span>
              </div>
              <div>
                <span>Document officiel généré conforme CGFP • Mairie de Gennevilliers</span>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* RAW MONOSPACE VIEW */
        <pre className="text-[11px] sm:text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto max-w-full leading-relaxed shadow-xs">
          {documentText}
        </pre>
      )}
    </div>
  );
};
