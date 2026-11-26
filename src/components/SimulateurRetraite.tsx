import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Landmark,
  Briefcase,
  ExternalLink,
  Info,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Printer,
  TrendingUp,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  simulerRetraiteFonctionnaire,
  simulerRetraiteContractuel,
  projeterIndice6DerniersMois,
  GRILLES_INDICIAIRES_FPT,
  RETRAITE_CONSTANTS_2026,
  TAUX_PRELEVEMENTS_SOCIAUX,
  type CategorieFpt,
  type GrilleFptId,
  type TauxPrelevementsSociaux,
} from '../services/retraiteEngine';

interface SimulateurRetraiteProps {
  onClose?: () => void;
}

const fmtEuro = (val: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(val);

const fmtEuroPrecis = (val: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);

const fmtAge = (ans: number, mois: number) =>
  mois > 0 ? `${ans} ans et ${mois} mois` : `${ans} ans`;

const PRIMES_DEFAUT_PAR_CATEGORIE: Record<CategorieFpt, number> = {
  C: 450,
  B: 620,
  A: 920,
};

export const SimulateurRetraite: React.FC<SimulateurRetraiteProps> = ({ onClose }) => {
  const [statut, setStatut] = useState<'fonctionnaire' | 'contractuel'>('fonctionnaire');
  const [showOptionsAvancees, setShowOptionsAvancees] = useState<boolean>(false);

  // ───────────────────────────────────────────────────────────────────────────
  // ÉTAT SIMPLIFIÉ FONCTIONNAIRE (4 CHAMPS CLÉS + OPTIONS AVANCÉES)
  // ───────────────────────────────────────────────────────────────────────────
  const [anneeNaissanceFonc, setAnneeNaissanceFonc] = useState<number>(1974);
  const [categorieFonc, setCategorieFonc] = useState<CategorieFpt>('C');
  const [grilleIdFonc, setGrilleIdFonc] = useState<GrilleFptId>('auto');
  const [indiceActuelFonc, setIndiceActuelFonc] = useState<number>(397);
  const [inclureAvancementGrade, setInclureAvancementGrade] = useState<boolean>(false);
  const [modeIndiceFinal, setModeIndiceFinal] = useState<'auto' | 'manuel'>('auto');
  const [indiceFinalManuel, setIndiceFinalManuel] = useState<number>(425);

  const [categorieService, setCategorieService] = useState<'sedentaire' | 'active'>('sedentaire');
  const [ageDepartFoncAns, setAgeDepartFoncAns] = useState<number>(64);
  const [ageDepartFoncMois, setAgeDepartFoncMois] = useState<number>(0);

  // Trimestres : mode automatique (âge début carrière) par défaut pour simplifier !
  const [modeTrimestresFonc, setModeTrimestresFonc] = useState<'auto' | 'manuel'>('auto');
  const [ageDebutCarriereFonc, setAgeDebutCarriereFonc] = useState<number>(22);
  const [trimestresCnraclManuel, setTrimestresCnraclManuel] = useState<number>(172);
  const [trimestresAutresFonc, setTrimestresAutresFonc] = useState<number>(0);

  // Options complémentaires fonctionnaire
  const [nbEnfantsFonc, setNbEnfantsFonc] = useState<number>(2);
  const [pointsNbi, setPointsNbi] = useState<number>(0);
  const [anneesNbi, setAnneesNbi] = useState<number>(0);
  const [modeRafp, setModeRafp] = useState<'estimer' | 'points'>('estimer');
  const [primesMensuellesFonc, setPrimesMensuellesFonc] = useState<number>(450);
  const [pointsRafpSaisis, setPointsRafpSaisis] = useState<number>(6200);
  const [psFonc, setPsFonc] = useState<TauxPrelevementsSociaux>('normal_9_1');

  // ───────────────────────────────────────────────────────────────────────────
  // PROJECTION AUTOMATIQUE DE L'INDICE MAJORÉ DES 6 DERNIERS MOIS
  // ───────────────────────────────────────────────────────────────────────────
  const projectionIm = useMemo(
    () =>
      projeterIndice6DerniersMois({
        anneeNaissance: anneeNaissanceFonc,
        categorie: categorieFonc,
        grilleId: grilleIdFonc,
        imActuel: indiceActuelFonc,
        ageDepartAnnees: ageDepartFoncAns,
        ageDepartMois: ageDepartFoncMois,
        inclureAvancementGrade,
      }),
    [
      anneeNaissanceFonc,
      categorieFonc,
      grilleIdFonc,
      indiceActuelFonc,
      ageDepartFoncAns,
      ageDepartFoncMois,
      inclureAvancementGrade,
    ]
  );

  const imRetenu6DerniersMois =
    modeIndiceFinal === 'auto' ? projectionIm.imProjete6DerniersMois : indiceFinalManuel;

  const trimestresCnraclCalcules = useMemo(() => {
    if (modeTrimestresFonc === 'manuel') return trimestresCnraclManuel;
    const ageDepartDec = ageDepartFoncAns + ageDepartFoncMois / 12;
    const dureeAns = Math.max(0, ageDepartDec - ageDebutCarriereFonc);
    return Math.round(dureeAns * 4);
  }, [
    modeTrimestresFonc,
    trimestresCnraclManuel,
    ageDepartFoncAns,
    ageDepartFoncMois,
    ageDebutCarriereFonc,
  ]);

  const anneesCotiseesRafpAuto = useMemo(() => {
    const anneeDebutCarriere = anneeNaissanceFonc + ageDebutCarriereFonc;
    const anneeDebutRafp = Math.max(2005, anneeDebutCarriere); // RAFP créé en 2005
    return Math.max(0, Math.min(42, projectionIm.anneeDepart - anneeDebutRafp));
  }, [anneeNaissanceFonc, ageDebutCarriereFonc, projectionIm.anneeDepart]);

  const foncResult = useMemo(
    () =>
      simulerRetraiteFonctionnaire({
        anneeNaissance: anneeNaissanceFonc,
        categorieService,
        ageDepartAnnees: ageDepartFoncAns,
        ageDepartMois: ageDepartFoncMois,
        indiceMajore: imRetenu6DerniersMois,
        pointsNbi,
        anneesPerceptionNbi: anneesNbi,
        trimestresCnracl: trimestresCnraclCalcules,
        trimestresAutresRegimes: trimestresAutresFonc,
        nbEnfantsEleves: nbEnfantsFonc,
        modeRafp,
        primesMensuellesBrutes: primesMensuellesFonc,
        anneesCotiseesRafp: anneesCotiseesRafpAuto,
        pointsRafpSaisis,
        prelevementsSociaux: psFonc,
      }),
    [
      anneeNaissanceFonc,
      categorieService,
      ageDepartFoncAns,
      ageDepartFoncMois,
      imRetenu6DerniersMois,
      pointsNbi,
      anneesNbi,
      trimestresCnraclCalcules,
      trimestresAutresFonc,
      nbEnfantsFonc,
      modeRafp,
      primesMensuellesFonc,
      anneesCotiseesRafpAuto,
      pointsRafpSaisis,
      psFonc,
    ]
  );

  // ───────────────────────────────────────────────────────────────────────────
  // ÉTAT SIMPLIFIÉ CONTRACTUEL (CNAV + IRCANTEC)
  // ───────────────────────────────────────────────────────────────────────────
  const [anneeNaissanceCont, setAnneeNaissanceCont] = useState<number>(1976);
  const [categorieCont, setCategorieCont] = useState<CategorieFpt>('B');
  const [modeRemuCont, setModeRemuCont] = useState<'brut' | 'indice'>('indice');
  const [indiceActuelCont, setIndiceActuelCont] = useState<number>(420);
  const [primesMensuellesCont, setPrimesMensuellesCont] = useState<number>(500);
  const [salaireBrutContManuel, setSalaireBrutContManuel] = useState<number>(2650);

  const [ageDepartContAns, setAgeDepartContAns] = useState<number>(64);
  const [ageDepartContMois, setAgeDepartContMois] = useState<number>(0);

  const [modeTrimestresCont, setModeTrimestresCont] = useState<'auto' | 'manuel'>('auto');
  const [ageDebutCarriereCont, setAgeDebutCarriereCont] = useState<number>(22);
  const [trimestresRgManuel, setTrimestresRgManuel] = useState<number>(172);
  const [trimestresAutresCont, setTrimestresAutresCont] = useState<number>(0);

  const [modeSam, setModeSam] = useState<'auto' | 'manuel'>('auto');
  const [samAnnuelManuel, setSamAnnuelManuel] = useState<number>(29200);
  const [nbEnfantsCont, setNbEnfantsCont] = useState<number>(2);
  const [modeIrcantec, setModeIrcantec] = useState<'estimer' | 'points'>('estimer');
  const [anneesPublicCont, setAnneesPublicCont] = useState<number>(25);
  const [pointsIrcantecSaisis, setPointsIrcantecSaisis] = useState<number>(7400);
  const [renteAgircArrco, setRenteAgircArrco] = useState<number>(0);
  const [psCont, setPsCont] = useState<TauxPrelevementsSociaux>('normal_9_1');

  // Projection indiciaire si le contractuel saisit son indice actuel !
  const projectionImCont = useMemo(
    () =>
      projeterIndice6DerniersMois({
        anneeNaissance: anneeNaissanceCont,
        categorie: categorieCont,
        grilleId: 'auto',
        imActuel: indiceActuelCont,
        ageDepartAnnees: ageDepartContAns,
        ageDepartMois: ageDepartContMois,
        inclureAvancementGrade: false,
      }),
    [anneeNaissanceCont, categorieCont, indiceActuelCont, ageDepartContAns, ageDepartContMois]
  );

  const salaireBrutFinCarriereCont = useMemo(() => {
    if (modeRemuCont === 'brut') return salaireBrutContManuel;
    return (
      projectionImCont.imProjete6DerniersMois * RETRAITE_CONSTANTS_2026.VALEUR_POINT_INDICE_MENSUEL +
      primesMensuellesCont
    );
  }, [modeRemuCont, salaireBrutContManuel, projectionImCont.imProjete6DerniersMois, primesMensuellesCont]);

  const trimestresRgCalcules = useMemo(() => {
    if (modeTrimestresCont === 'manuel') return trimestresRgManuel;
    const ageDepartDec = ageDepartContAns + ageDepartContMois / 12;
    return Math.round(Math.max(0, ageDepartDec - ageDebutCarriereCont) * 4);
  }, [modeTrimestresCont, trimestresRgManuel, ageDepartContAns, ageDepartContMois, ageDebutCarriereCont]);

  const contResult = useMemo(
    () =>
      simulerRetraiteContractuel({
        anneeNaissance: anneeNaissanceCont,
        ageDepartAnnees: ageDepartContAns,
        ageDepartMois: ageDepartContMois,
        salaireBrutMensuelActuel: salaireBrutFinCarriereCont,
        modeSam,
        samAnnuelManuel,
        trimestresRegimeGeneral: trimestresRgCalcules,
        trimestresAutresRegimes: trimestresAutresCont,
        nbEnfantsEleves: nbEnfantsCont,
        modeIrcantec,
        anneesContractuelPublic: anneesPublicCont,
        pointsIrcantecSaisis,
        renteAgircArrcoMensuelle: renteAgircArrco,
        prelevementsSociaux: psCont,
      }),
    [
      anneeNaissanceCont,
      ageDepartContAns,
      ageDepartContMois,
      salaireBrutFinCarriereCont,
      modeSam,
      samAnnuelManuel,
      trimestresRgCalcules,
      trimestresAutresCont,
      nbEnfantsCont,
      modeIrcantec,
      anneesPublicCont,
      pointsIrcantecSaisis,
      renteAgircArrco,
      psCont,
    ]
  );

  // Changement rapide de catégorie Fonctionnaire : ajuste des valeurs cohérentes
  const handleChangeCategorieFonc = (cat: CategorieFpt) => {
    setCategorieFonc(cat);
    setGrilleIdFonc('auto');
    setPrimesMensuellesFonc(PRIMES_DEFAUT_PAR_CATEGORIE[cat]);
    if (cat === 'C' && indiceActuelFonc > 519) setIndiceActuelFonc(397);
    if (cat === 'B' && (indiceActuelFonc < 373 || indiceActuelFonc > 592)) setIndiceActuelFonc(436);
    if (cat === 'A' && indiceActuelFonc < 395) setIndiceActuelFonc(518);
  };

  // --- PRESETS FONCTIONNAIRES ---
  const appliquerPresetFonctionnaire = (preset: 'cat_c' | 'cat_b' | 'cat_a' | 'cat_active') => {
    setModeIndiceFinal('auto');
    setModeTrimestresFonc('auto');
    setGrilleIdFonc('auto');
    if (preset === 'cat_c') {
      setAnneeNaissanceFonc(1975);
      setCategorieFonc('C');
      setCategorieService('sedentaire');
      setIndiceActuelFonc(397);
      setAgeDepartFoncAns(64);
      setAgeDepartFoncMois(0);
      setAgeDebutCarriereFonc(21);
      setPrimesMensuellesFonc(450);
      setInclureAvancementGrade(true);
    } else if (preset === 'cat_b') {
      setAnneeNaissanceFonc(1974);
      setCategorieFonc('B');
      setCategorieService('sedentaire');
      setIndiceActuelFonc(446);
      setAgeDepartFoncAns(64);
      setAgeDepartFoncMois(0);
      setAgeDebutCarriereFonc(22);
      setPrimesMensuellesFonc(650);
      setInclureAvancementGrade(true);
    } else if (preset === 'cat_a') {
      setAnneeNaissanceFonc(1972);
      setCategorieFonc('A');
      setCategorieService('sedentaire');
      setIndiceActuelFonc(550);
      setAgeDepartFoncAns(64);
      setAgeDepartFoncMois(0);
      setAgeDebutCarriereFonc(23);
      setPrimesMensuellesFonc(950);
      setInclureAvancementGrade(false);
    } else if (preset === 'cat_active') {
      setAnneeNaissanceFonc(1976);
      setCategorieFonc('C');
      setCategorieService('active');
      setIndiceActuelFonc(397);
      setAgeDepartFoncAns(59);
      setAgeDepartFoncMois(0);
      setAgeDebutCarriereFonc(20);
      setPrimesMensuellesFonc(440);
      setInclureAvancementGrade(false);
    }
    toast.success('Exemple appliqué avec projection automatique de l’indice !');
  };

  // --- PRESETS CONTRACTUELS ---
  const appliquerPresetContractuel = (preset: 'cont_c' | 'cont_b' | 'cont_a' | 'mixte') => {
    setModeTrimestresCont('auto');
    if (preset === 'cont_c') {
      setAnneeNaissanceCont(1976);
      setCategorieCont('C');
      setModeRemuCont('indice');
      setIndiceActuelCont(385);
      setPrimesMensuellesCont(350);
      setAgeDepartContAns(64);
      setAgeDepartContMois(0);
      setAgeDebutCarriereCont(21);
      setAnneesPublicCont(25);
      setRenteAgircArrco(0);
    } else if (preset === 'cont_b') {
      setAnneeNaissanceCont(1975);
      setCategorieCont('B');
      setModeRemuCont('indice');
      setIndiceActuelCont(436);
      setPrimesMensuellesCont(550);
      setAgeDepartContAns(64);
      setAgeDepartContMois(0);
      setAgeDebutCarriereCont(22);
      setAnneesPublicCont(24);
      setRenteAgircArrco(0);
    } else if (preset === 'cont_a') {
      setAnneeNaissanceCont(1973);
      setCategorieCont('A');
      setModeRemuCont('indice');
      setIndiceActuelCont(580);
      setPrimesMensuellesCont(900);
      setAgeDepartContAns(64);
      setAgeDepartContMois(0);
      setAgeDebutCarriereCont(23);
      setAnneesPublicCont(22);
      setRenteAgircArrco(0);
    } else if (preset === 'mixte') {
      setAnneeNaissanceCont(1970);
      setCategorieCont('B');
      setModeRemuCont('brut');
      setSalaireBrutContManuel(2900);
      setAgeDepartContAns(64);
      setAgeDepartContMois(0);
      setAgeDebutCarriereCont(22);
      setAnneesPublicCont(14);
      setRenteAgircArrco(290);
    }
    toast.success('Profil type contractuel appliqué');
  };

  const copierSynthese = () => {
    const texte =
      statut === 'fonctionnaire'
        ? `SIMULATION RETRAITE FONCTIONNAIRE FPT (CNRACL + RAFP) — ATLAS CFDT GENNEVILLIERS
• Année de naissance : ${anneeNaissanceFonc} (Catégorie ${categorieFonc} — ${categorieService === 'active' ? 'Service actif' : 'Sédentaire'})
• Âge de départ souhaité : ${fmtAge(ageDepartFoncAns, ageDepartFoncMois)} en ${projectionIm.anneeDepart} (âge légal : ${fmtAge(foncResult.rules.ageLegalAnnees, foncResult.rules.ageLegalMois)})
• Indice Majoré actuel : IM ${indiceActuelFonc} ➔ Indice projeté des 6 derniers mois : IM ${imRetenu6DerniersMois} (${fmtEuroPrecis(foncResult.tibMensuelRef)} brut/mois)
• Trimestres retenus : ${trimestresCnraclCalcules} CNRACL / ${foncResult.rules.trimestresRequis} requis
• Pension CNRACL brute : ${fmtEuroPrecis(foncResult.pensionCnraclTotaleBruteMensuelle)} / mois (Taux effectif : ${foncResult.tauxLiquidationEffectifPct.toFixed(2)} %)
• Retraite additionnelle RAFP : ${foncResult.rafpEnRente ? `${fmtEuroPrecis(foncResult.rafpRenteBruteMensuelle)} / mois (${foncResult.pointsRafpRetenus} pts)` : `Capital unique estimé de ${fmtEuro(foncResult.rafpCapitalBrutUnique)} (${foncResult.pointsRafpRetenus} pts)`}
• TOTAL PENSION BRUTE MENSUELLE : ${fmtEuroPrecis(foncResult.totalBrutMensuel)} / mois
• TOTAL NET ESTIMÉ (avant IR) : ${fmtEuroPrecis(foncResult.totalNetMensuelAvantIr)} / mois
Simulation indicative — Vérifiez votre relevé officiel sur https://www.cnracl.retraites.fr`
        : `SIMULATION RETRAITE CONTRACTUEL PUBLIC (CNAV + IRCANTEC) — ATLAS CFDT GENNEVILLIERS
• Année de naissance : ${anneeNaissanceCont} (Catégorie ${categorieCont})
• Âge de départ souhaité : ${fmtAge(ageDepartContAns, ageDepartContMois)} (âge légal : ${fmtAge(contResult.rules.ageLegalAnnees, contResult.rules.ageLegalMois)})
• Salaire Annuel Moyen retenu (25 meilleures années) : ${fmtEuro(contResult.samRetenuAnnuel)} / an
• Trimestres Régime Général : ${trimestresRgCalcules} / ${contResult.rules.trimestresRequis} requis
• Retraite de base (Assurance Retraite CNAV) : ${fmtEuroPrecis(contResult.pensionCnavTotaleBruteMensuelle)} / mois (Taux : ${contResult.tauxCnavPct.toFixed(2)} %)
• Retraite complémentaire Ircantec : ${contResult.ircantecEnCapital ? `Capital unique de ${fmtEuro(contResult.ircantecCapitalBrutUnique)}` : `${fmtEuroPrecis(contResult.ircantecRenteBruteMensuelle)} / mois (${contResult.pointsIrcantecApresModulation} pts)`}
• TOTAL PENSION BRUTE MENSUELLE : ${fmtEuroPrecis(contResult.totalBrutMensuel)} / mois
• TOTAL NET ESTIMÉ (avant IR) : ${fmtEuroPrecis(contResult.totalNetMensuelAvantIr)} / mois
Simulation indicative — Vérifiez vos droits sur https://www.ircantec.retraites.fr`;

    navigator.clipboard.writeText(texte);
    toast.success('Synthèse copiée dans le presse-papiers !');
  };

  const activeTotalBrut =
    statut === 'fonctionnaire' ? foncResult.totalBrutMensuel : contResult.totalBrutMensuel;
  const activeTotalNet =
    statut === 'fonctionnaire'
      ? foncResult.totalNetMensuelAvantIr
      : contResult.totalNetMensuelAvantIr;
  const activeRemplacement =
    statut === 'fonctionnaire'
      ? foncResult.tauxRemplacementBrutPct
      : contResult.tauxRemplacementBrutPct;
  const activeAvantAgeLegal =
    statut === 'fonctionnaire' ? foncResult.avantAgeLegal : contResult.avantAgeLegal;
  const activeRules = statut === 'fonctionnaire' ? foncResult.rules : contResult.rules;

  const grillesDisponiblesCat = useMemo(
    () => Object.values(GRILLES_INDICIAIRES_FPT).filter((g) => g.categorie === categorieFonc),
    [categorieFonc]
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* EN-TÊTE */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-amber-200/80 dark:border-amber-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {onClose && (
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shrink-0 mt-0.5"
                title="Retour à la Boîte à outils"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300/60 dark:border-amber-500/30">
                  <Wand2 className="w-3.5 h-3.5" /> Calcul simplifié • Projection auto des 6 derniers mois
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">
                  LFSS 2026 • CNRACL • Ircantec
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Simulateur de Pension de Retraite
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Indiquez simplement votre <strong>année de naissance</strong>, votre <strong>indice actuel</strong>, votre{' '}
                <strong>catégorie</strong> et l'<strong>âge de départ souhaité</strong> : l'indice des 6 derniers mois est calculé automatiquement.
              </p>
            </div>
          </div>

          {/* Boutons d'accès direct CNRACL & IRCANTEC dès l'en-tête */}
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="https://www.cnracl.retraites.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
            >
              <Landmark className="w-4 h-4" />
              <span>Site officiel CNRACL</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
            <a
              href="https://www.ircantec.retraites.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              <span>Site officiel Ircantec</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>

        {/* SÉLECTEUR DE STATUT */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setStatut('fonctionnaire')}
            className={`flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all ${
              statut === 'fonctionnaire'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Landmark className="w-5 h-5 shrink-0" />
            <div className="text-left">
              <div>Fonctionnaire Territorial</div>
              <div
                className={`text-[11px] font-medium ${
                  statut === 'fonctionnaire' ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                CNRACL (≥ 28h/sem.) + Retraite additionnelle RAFP
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setStatut('contractuel')}
            className={`flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all ${
              statut === 'contractuel'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Briefcase className="w-5 h-5 shrink-0" />
            <div className="text-left">
              <div>Agent Contractuel de Droit Public</div>
              <div
                className={`text-[11px] font-medium ${
                  statut === 'contractuel' ? 'text-teal-100' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Assurance Retraite (CNAV/CARSAT) + Complémentaire Ircantec
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* PROFILS TYPES RAPIDES */}
      <div className="bg-white/90 dark:bg-slate-900/85 rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
          Exemples rapides :
        </span>
        {statut === 'fonctionnaire' ? (
          <>
            <button
              type="button"
              onClick={() => appliquerPresetFonctionnaire('cat_c')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:hover:bg-blue-500/25 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 transition-colors"
            >
              Agent Cat. C né en 1975 (IM actuel 397)
            </button>
            <button
              type="button"
              onClick={() => appliquerPresetFonctionnaire('cat_b')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 transition-colors"
            >
              Agent Cat. B né en 1974 (IM actuel 446)
            </button>
            <button
              type="button"
              onClick={() => appliquerPresetFonctionnaire('cat_a')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-50 hover:bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:hover:bg-violet-500/25 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30 transition-colors"
            >
              Agent Cat. A né en 1972 (IM actuel 550)
            </button>
            <button
              type="button"
              onClick={() => appliquerPresetFonctionnaire('cat_active')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 transition-colors"
            >
              Cat. Active — Départ anticipé 59 ans
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => appliquerPresetContractuel('cont_c')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:hover:bg-teal-500/25 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30 transition-colors"
            >
              Contractuel Cat. C (IM actuel 385)
            </button>
            <button
              type="button"
              onClick={() => appliquerPresetContractuel('cont_b')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 transition-colors"
            >
              Contractuel Cat. B (IM actuel 436)
            </button>
            <button
              type="button"
              onClick={() => appliquerPresetContractuel('cont_a')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-50 hover:bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:hover:bg-cyan-500/25 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 transition-colors"
            >
              Contractuel Cat. A (IM actuel 580)
            </button>
            <button
              type="button"
              onClick={() => appliquerPresetContractuel('mixte')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 transition-colors"
            >
              Carrière mixte Privé + FPT
            </button>
          </>
        )}
      </div>

      {/* GRILLE PRINCIPALE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLONNE GAUCHE : SAISIE SIMPLIFIÉE */}
        <div className="lg:col-span-7 space-y-5">
          {statut === 'fonctionnaire' ? (
            <>
              {/* BLOC PRINCIPAL ULTRA-SIMPLE : LES 4 INFORMATIONS CLÉS */}
              <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl p-6 shadow-md border-2 border-blue-200/80 dark:border-blue-500/30 space-y-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Vos 4 informations clés aujourd'hui
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                    Âge actuel : {projectionIm.ageActuel} ans
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 1. Année de naissance */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      1. Votre année de naissance
                    </label>
                    <input
                      type="number"
                      min={1955}
                      max={2008}
                      value={anneeNaissanceFonc}
                      onChange={(e) => {
                        const an = Number(e.target.value);
                        setAnneeNaissanceFonc(an);
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base font-extrabold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                      Âge légal : <strong>{fmtAge(foncResult.rules.ageLegalAnnees, foncResult.rules.ageLegalMois)}</strong> ({foncResult.rules.trimestresRequis} trim. requis)
                    </span>
                  </div>

                  {/* 2. Catégorie hiérarchique */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      2. Votre catégorie FPT
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['C', 'B', 'A'] as CategorieFpt[]).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleChangeCategorieFonc(cat)}
                          className={`py-3 rounded-xl font-extrabold text-sm border transition-all ${
                            categorieFonc === cat
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          Cat. {cat}
                        </button>
                      ))}
                    </div>
                    <div className="mt-1.5 flex items-center gap-3 text-[11px]">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300 font-semibold">
                        <input
                          type="checkbox"
                          checked={categorieService === 'active'}
                          onChange={(e) => {
                            const isAct = e.target.checked;
                            setCategorieService(isAct ? 'active' : 'sedentaire');
                            if (isAct && ageDepartFoncAns > 60) {
                              setAgeDepartFoncAns(59);
                              setAgeDepartFoncMois(0);
                            } else if (!isAct && ageDepartFoncAns < 62) {
                              setAgeDepartFoncAns(64);
                              setAgeDepartFoncMois(0);
                            }
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>Emploi en catégorie active (départ anticipé)</span>
                      </label>
                    </div>
                  </div>

                  {/* 3. Indice Majoré ACTUEL */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      3. Votre Indice Majoré actuel (sur fiche de paie)
                    </label>
                    <input
                      type="number"
                      min={366}
                      max={1500}
                      value={indiceActuelFonc}
                      onChange={(e) => {
                        setIndiceActuelFonc(Number(e.target.value));
                        setModeIndiceFinal('auto');
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base font-extrabold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                      Traitement actuel : <strong>{fmtEuroPrecis(indiceActuelFonc * RETRAITE_CONSTANTS_2026.VALEUR_POINT_INDICE_MENSUEL)}</strong> brut/mois
                    </span>
                  </div>

                  {/* 4. Âge de départ souhaité */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      4. Âge de départ souhaité
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      <input
                        type="number"
                        min={52}
                        max={70}
                        value={ageDepartFoncAns}
                        onChange={(e) => setAgeDepartFoncAns(Number(e.target.value))}
                        className="col-span-4 px-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base font-extrabold focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <select
                        value={ageDepartFoncMois}
                        onChange={(e) => setAgeDepartFoncMois(Number(e.target.value))}
                        className="col-span-3 px-2.5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold"
                      >
                        <option value={0}>+ 0 mois</option>
                        <option value={3}>+ 3 mois</option>
                        <option value={6}>+ 6 mois</option>
                        <option value={9}>+ 9 mois</option>
                      </select>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                      Départ en <strong>{projectionIm.anneeDepart}</strong> (dans {projectionIm.anneesRestantesTotales.toFixed(1).replace('.0', '')} ans)
                    </span>
                  </div>
                </div>

                {/* ENCART MAGIQUE : RÉSULTAT DE LA PROJECTION AUTOMATIQUE DE L'INDICE DES 6 DERNIERS MOIS */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50/70 to-white dark:from-blue-950/50 dark:via-indigo-950/40 dark:to-slate-900 border border-blue-200 dark:border-blue-500/40 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      Indice Majoré calculé pour vos 6 derniers mois
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (modeIndiceFinal === 'auto') {
                          setIndiceFinalManuel(projectionIm.imProjete6DerniersMois);
                          setModeIndiceFinal('manuel');
                        } else {
                          setModeIndiceFinal('auto');
                        }
                      }}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {modeIndiceFinal === 'auto' ? 'Forcer un indice manuellement' : '↺ Revenir au calcul auto'}
                    </button>
                  </div>

                  {modeIndiceFinal === 'auto' ? (
                    <>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <div className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                            Aujourd'hui ({projectionIm.ageActuel} ans)
                          </div>
                          <div className="text-lg font-black text-slate-800 dark:text-slate-100">
                            IM {projectionIm.imActuel}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {projectionIm.grilleDepart.id} • éch. {projectionIm.echelonDepart}
                          </div>
                        </div>

                        <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />

                        <div className="flex-1 min-w-[180px] px-3.5 py-2 rounded-xl bg-blue-600 text-white shadow-sm">
                          <div className="text-[10px] uppercase font-bold text-blue-100">
                            6 derniers mois ({projectionIm.anneeDepart})
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black">
                              IM {projectionIm.imProjete6DerniersMois}
                            </span>
                            {projectionIm.gainPointsIm > 0 && (
                              <span className="text-xs font-extrabold px-1.5 py-0.5 rounded bg-emerald-400/25 text-emerald-100">
                                +{projectionIm.gainPointsIm} pts (+{fmtEuro(projectionIm.gainBrutMensuel)}/mois)
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-blue-100">
                            {projectionIm.grilleFinale.shortLabel} • éch. {projectionIm.echelonFinal} (TIB : {fmtEuroPrecis(foncResult.tibMensuelRef)})
                          </div>
                        </div>
                      </div>

                      {/* Contrôles rapides de la projection : échelle + option avancement de grade */}
                      <div className="pt-2 border-t border-blue-200/60 dark:border-blue-800/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-600 dark:text-slate-300">Grille :</span>
                          <select
                            value={grilleIdFonc}
                            onChange={(e) => setGrilleIdFonc(e.target.value as GrilleFptId)}
                            className="px-2.5 py-1 rounded-lg border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs"
                          >
                            <option value="auto">
                              Auto ({projectionIm.grilleDepart.shortLabel})
                            </option>
                            {grillesDisponiblesCat.map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.shortLabel}
                              </option>
                            ))}
                          </select>
                        </div>

                        {projectionIm.grilleDepart.gradeSuperieurId && (
                          <label className="inline-flex items-center gap-1.5 cursor-pointer font-bold text-indigo-700 dark:text-indigo-300">
                            <input
                              type="checkbox"
                              checked={inclureAvancementGrade}
                              onChange={(e) => setInclureAvancementGrade(e.target.checked)}
                              className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>
                              Simuler un avancement vers {projectionIm.grilleDepart.gradeSuperieurId}
                            </span>
                          </label>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Indice Majoré forcé pour les 6 derniers mois :
                        </label>
                        <input
                          type="number"
                          min={366}
                          max={1500}
                          value={indiceFinalManuel}
                          onChange={(e) => setIndiceFinalManuel(Number(e.target.value))}
                          className="w-full px-3.5 py-2 rounded-xl border border-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Durée de carrière ultra-simple : âge de début de carrière OU trimestres directs */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Durée de carrière estimée ({trimestresCnraclCalcules + trimestresAutresFonc} trimestres retenus sur {foncResult.rules.trimestresRequis} requis)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (modeTrimestresFonc === 'auto') {
                          setTrimestresCnraclManuel(trimestresCnraclCalcules);
                          setModeTrimestresFonc('manuel');
                        } else {
                          setModeTrimestresFonc('auto');
                        }
                      }}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {modeTrimestresFonc === 'auto'
                        ? 'Saisir mes trimestres exacts'
                        : '↺ Calculer via mon âge de début'}
                    </button>
                  </div>

                  {modeTrimestresFonc === 'auto' ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs text-slate-600 dark:text-slate-300">
                        J'ai commencé à travailler à
                      </span>
                      <input
                        type="number"
                        min={16}
                        max={45}
                        value={ageDebutCarriereFonc}
                        onChange={(e) => setAgeDebutCarriereFonc(Number(e.target.value))}
                        className="w-20 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-center"
                      />
                      <span className="text-xs text-slate-600 dark:text-slate-300">
                        ans ➔ <strong>{trimestresCnraclCalcules} trimestres</strong> à {fmtAge(ageDepartFoncAns, ageDepartFoncMois)}
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Trimestres CNRACL au départ
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={200}
                          value={trimestresCnraclManuel}
                          onChange={(e) => setTrimestresCnraclManuel(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Trimestres autres régimes (privé...)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={180}
                          value={trimestresAutresFonc}
                          onChange={(e) => setTrimestresAutresFonc(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ACCORDÉON OPTIONS AVANCÉES (Primes RAFP, Enfants, NBI, CSG) */}
              <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowOptionsAvancees(!showOptionsAvancees)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <span className="text-sm font-bold text-slate-800 dark:text-white">
                        Affiner (primes RAFP, enfants, NBI, prélèvements sociaux)
                      </span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                        Actuellement : Primes {primesMensuellesFonc} €/mois • {nbEnfantsFonc} enfant(s) •{' '}
                        {TAUX_PRELEVEMENTS_SOCIAUX[psFonc].label}
                      </span>
                    </div>
                  </div>
                  {showOptionsAvancees ? (
                    <ChevronUp className="w-5 h-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                  )}
                </button>

                {showOptionsAvancees && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Primes brutes / mois (IFSE, CIA, 13e mois)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={5000}
                          step={25}
                          value={primesMensuellesFonc}
                          onChange={(e) => {
                            setPrimesMensuellesFonc(Number(e.target.value));
                            setModeRafp('estimer');
                          }}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Nombre d'enfants élevés (≥ 9 ans)
                        </label>
                        <select
                          value={nbEnfantsFonc}
                          onChange={(e) => setNbEnfantsFonc(Number(e.target.value))}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                        >
                          {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                            <option key={n} value={n}>
                              {n} {n <= 1 ? 'enfant' : 'enfants'}{' '}
                              {n >= 3 ? `(+${10 + (n - 3) * 5} % sur pension)` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Points de NBI éventuels
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={pointsNbi}
                          onChange={(e) => setPointsNbi(Number(e.target.value))}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Durée de perception NBI (années)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={42}
                          value={anneesNbi}
                          onChange={(e) => setAnneesNbi(Number(e.target.value))}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Vous connaissez déjà votre solde exact de points RAFP ?
                      </span>
                      <button
                        type="button"
                        onClick={() => setModeRafp(modeRafp === 'estimer' ? 'points' : 'estimer')}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {modeRafp === 'estimer' ? 'Saisir mes points RAFP' : '↺ Estimer via mes primes'}
                      </button>
                    </div>
                    {modeRafp === 'points' && (
                      <input
                        type="number"
                        min={0}
                        max={60000}
                        step={100}
                        value={pointsRafpSaisis}
                        onChange={(e) => setPointsRafpSaisis(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-xl border border-indigo-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                        placeholder="Total points RAFP à la liquidation"
                      />
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Taux de prélèvements sociaux (CSG / CRDS / CASA)
                      </label>
                      <select
                        value={psFonc}
                        onChange={(e) => setPsFonc(e.target.value as TauxPrelevementsSociaux)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold"
                      >
                        {Object.entries(TAUX_PRELEVEMENTS_SOCIAUX).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v.label} — {v.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ─── MODE CONTRACTUEL SIMPLIFIÉ (CNAV + IRCANTEC) ─── */
            <>
              <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl p-6 shadow-md border-2 border-teal-200/80 dark:border-teal-500/30 space-y-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    Vos 4 informations clés (Contractuel)
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
                    Âge actuel : {projectionImCont.ageActuel} ans
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 1. Année de naissance */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      1. Votre année de naissance
                    </label>
                    <input
                      type="number"
                      min={1955}
                      max={2008}
                      value={anneeNaissanceCont}
                      onChange={(e) => setAnneeNaissanceCont(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base font-extrabold"
                    />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                      Âge légal : <strong>{fmtAge(contResult.rules.ageLegalAnnees, contResult.rules.ageLegalMois)}</strong> ({contResult.rules.trimestresRequis} trim. requis)
                    </span>
                  </div>

                  {/* 2. Catégorie */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      2. Votre catégorie d'emploi
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['C', 'B', 'A'] as CategorieFpt[]).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setCategorieCont(cat);
                            setPrimesMensuellesCont(PRIMES_DEFAUT_PAR_CATEGORIE[cat]);
                          }}
                          className={`py-3 rounded-xl font-extrabold text-sm border transition-all ${
                            categorieCont === cat
                              ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          Cat. {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Indice actuel OU Salaire brut */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        3. {modeRemuCont === 'indice' ? 'Votre Indice Majoré actuel' : 'Votre Brut mensuel actuel'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setModeRemuCont(modeRemuCont === 'indice' ? 'brut' : 'indice')}
                        className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline"
                      >
                        {modeRemuCont === 'indice' ? 'Saisir en € brut' : 'Saisir en Indice'}
                      </button>
                    </div>
                    {modeRemuCont === 'indice' ? (
                      <>
                        <input
                          type="number"
                          min={366}
                          max={1500}
                          value={indiceActuelCont}
                          onChange={(e) => setIndiceActuelCont(Number(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base font-extrabold"
                        />
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                          Projeté fin de carrière : <strong>IM {projectionImCont.imProjete6DerniersMois}</strong> (+ primes {primesMensuellesCont} €)
                        </span>
                      </>
                    ) : (
                      <>
                        <input
                          type="number"
                          min={500}
                          max={15000}
                          step={50}
                          value={salaireBrutContManuel}
                          onChange={(e) => setSalaireBrutContManuel(Number(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base font-extrabold"
                        />
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                          Traitement + primes brutes soumis à CNAV & Ircantec
                        </span>
                      </>
                    )}
                  </div>

                  {/* 4. Âge de départ souhaité */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      4. Âge de départ souhaité
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      <input
                        type="number"
                        min={58}
                        max={70}
                        value={ageDepartContAns}
                        onChange={(e) => setAgeDepartContAns(Number(e.target.value))}
                        className="col-span-4 px-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base font-extrabold"
                      />
                      <select
                        value={ageDepartContMois}
                        onChange={(e) => setAgeDepartContMois(Number(e.target.value))}
                        className="col-span-3 px-2.5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold"
                      >
                        <option value={0}>+ 0 mois</option>
                        <option value={3}>+ 3 mois</option>
                        <option value={6}>+ 6 mois</option>
                        <option value={9}>+ 9 mois</option>
                      </select>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                      Départ en <strong>{projectionImCont.anneeDepart}</strong> • SAM estimé : {fmtEuro(contResult.samRetenuAnnuel)}/an
                    </span>
                  </div>
                </div>

                {/* Durée de carrière contractuel */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Trimestres validés au départ ({trimestresRgCalcules + trimestresAutresCont} / {contResult.rules.trimestresRequis} requis)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (modeTrimestresCont === 'auto') {
                          setTrimestresRgManuel(trimestresRgCalcules);
                          setModeTrimestresCont('manuel');
                        } else {
                          setModeTrimestresCont('auto');
                        }
                      }}
                      className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      {modeTrimestresCont === 'auto' ? 'Saisir mes trimestres exacts' : '↺ Calculer via mon âge de début'}
                    </button>
                  </div>

                  {modeTrimestresCont === 'auto' ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs text-slate-600 dark:text-slate-300">
                        Début de carrière à
                      </span>
                      <input
                        type="number"
                        min={16}
                        max={45}
                        value={ageDebutCarriereCont}
                        onChange={(e) => setAgeDebutCarriereCont(Number(e.target.value))}
                        className="w-20 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-center"
                      />
                      <span className="text-xs text-slate-600 dark:text-slate-300">
                        ans (dont
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={45}
                        value={anneesPublicCont}
                        onChange={(e) => setAnneesPublicCont(Number(e.target.value))}
                        className="w-20 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-center"
                      />
                      <span className="text-xs text-slate-600 dark:text-slate-300">
                        ans contractuel public Ircantec)
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Trimestres Régime Général (CNAV)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={200}
                          value={trimestresRgManuel}
                          onChange={(e) => setTrimestresRgManuel(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Années contractuel public (Ircantec)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={45}
                          value={anneesPublicCont}
                          onChange={(e) => setAnneesPublicCont(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ACCORDÉON OPTIONS AVANCÉES CONTRACTUEL */}
              <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowOptionsAvancees(!showOptionsAvancees)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <SlidersHorizontal className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <div>
                      <span className="text-sm font-bold text-slate-800 dark:text-white">
                        Affiner (primes, points Ircantec connus, Agirc-Arrco, enfants, SAM)
                      </span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                        {nbEnfantsCont} enfant(s) • Agirc-Arrco : {renteAgircArrco} €/mois
                      </span>
                    </div>
                  </div>
                  {showOptionsAvancees ? (
                    <ChevronUp className="w-5 h-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                  )}
                </button>

                {showOptionsAvancees && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {modeRemuCont === 'indice' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Primes brutes / mois (IFSE, 13e mois...)
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={5000}
                            step={25}
                            value={primesMensuellesCont}
                            onChange={(e) => setPrimesMensuellesCont(Number(e.target.value))}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Nombre d'enfants élevés
                        </label>
                        <select
                          value={nbEnfantsCont}
                          onChange={(e) => setNbEnfantsCont(Number(e.target.value))}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                        >
                          {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
                            <option key={n} value={n}>
                              {n} {n <= 1 ? 'enfant' : 'enfants'}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Rente privée Agirc-Arrco brute / mois
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={4000}
                          step={25}
                          value={renteAgircArrco}
                          onChange={(e) => setRenteAgircArrco(Number(e.target.value))}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Saisir directement vos points Ircantec ou votre SAM ?
                      </span>
                      <div className="flex gap-3 text-xs font-bold text-teal-600 dark:text-teal-400">
                        <button
                          type="button"
                          onClick={() => setModeIrcantec(modeIrcantec === 'estimer' ? 'points' : 'estimer')}
                          className="hover:underline"
                        >
                          {modeIrcantec === 'estimer' ? 'Points Ircantec connus' : '↺ Estimer points auto'}
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => setModeSam(modeSam === 'auto' ? 'manuel' : 'auto')}
                          className="hover:underline"
                        >
                          {modeSam === 'auto' ? 'Forcer le SAM' : '↺ SAM auto'}
                        </button>
                      </div>
                    </div>

                    {modeIrcantec === 'points' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Total des points Ircantec
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100000}
                          step={100}
                          value={pointsIrcantecSaisis}
                          onChange={(e) => setPointsIrcantecSaisis(Number(e.target.value))}
                          className="w-full px-3.5 py-2 rounded-xl border border-teal-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                        />
                      </div>
                    )}

                    {modeSam === 'manuel' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Salaire Annuel Moyen (25 meilleures années, max PASS 48 060 €)
                        </label>
                        <input
                          type="number"
                          min={1000}
                          max={48060}
                          step={200}
                          value={samAnnuelManuel}
                          onChange={(e) => setSamAnnuelManuel(Number(e.target.value))}
                          className="w-full px-3.5 py-2 rounded-xl border border-teal-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Prélèvements sociaux (CSG / CRDS / CASA)
                      </label>
                      <select
                        value={psCont}
                        onChange={(e) => setPsCont(e.target.value as TauxPrelevementsSociaux)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold"
                      >
                        {Object.entries(TAUX_PRELEVEMENTS_SOCIAUX).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v.label} — {v.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* COLONNE DROITE : RÉSULTATS EN TEMPS RÉEL */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-6">
          {activeAvantAgeLegal && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-400 dark:border-amber-500/60 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                <strong className="block mb-0.5">Âge inférieur à l'âge légal ({fmtAge(activeRules.ageLegalAnnees, activeRules.ageLegalMois)})</strong>
                Un départ avant cet âge nécessite d'être éligible au dispositif <strong>Carrière longue</strong>,{' '}
                <strong>Handicap</strong> ou <strong>Invalidité</strong>.
              </div>
            </div>
          )}

          {/* CARTE PRINCIPALE DU RÉSULTAT */}
          <div
            className={`rounded-2xl p-6 text-white shadow-xl ${
              statut === 'fonctionnaire'
                ? 'bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900'
                : 'bg-gradient-to-br from-teal-700 via-emerald-700 to-slate-900'
            }`}
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-wider font-bold opacity-90 mb-2">
              <span>
                {statut === 'fonctionnaire'
                  ? 'Pension Totale Estimée (CNRACL + RAFP)'
                  : 'Pension Totale Estimée (CNAV + Ircantec)'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20">Mensuel</span>
            </div>

            <div className="text-4xl sm:text-5xl font-black tracking-tight">
              {fmtEuroPrecis(activeTotalNet)}
              <span className="text-base font-semibold opacity-80 ml-1.5">net / mois*</span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold opacity-95">
              <span>Brut : {fmtEuroPrecis(activeTotalBrut)} / mois</span>
              <span>•</span>
              <span>Soit {fmtEuro(activeTotalBrut * 12)} brut / an</span>
            </div>

            <div className="mt-5 pt-4 border-t border-white/20">
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span>Taux de remplacement brut estimé</span>
                <span>{activeRemplacement.toFixed(1)} % du revenu de fin de carrière</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-black/30 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-300 transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(5, activeRemplacement))}%` }}
                />
              </div>
              <p className="text-[11px] opacity-80 mt-2">
                * Net avant prélèvement à la source de l'impôt sur le revenu (€ constants 2026).
              </p>
            </div>
          </div>

          {/* DÉCOMPOSITION LIGNE PAR LIGNE */}
          <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl p-6 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-4">
            <h4 className="text-base font-extrabold text-slate-800 dark:text-white">
              Détail du calcul réglementaire
            </h4>

            {statut === 'fonctionnaire' ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-100">
                      Pension principale CNRACL (sur IM {imRetenu6DerniersMois})
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Taux : <strong>{foncResult.tauxLiquidationEffectifPct.toFixed(2)} %</strong>{' '}
                      {foncResult.trimestresDecote > 0 && (
                        <span className="text-rose-600 dark:text-rose-400">
                          (décote -{foncResult.trimestresDecote} trim.)
                        </span>
                      )}
                      {foncResult.trimestresSurcote > 0 && (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          (surcote +{foncResult.trimestresSurcote} trim.)
                        </span>
                      )}
                      {foncResult.trimestresDecote === 0 && foncResult.trimestresSurcote === 0 && (
                        <span className="text-emerald-600 dark:text-emerald-400">(taux plein)</span>
                      )}
                    </div>
                  </div>
                  <div className="font-extrabold text-slate-900 dark:text-white">
                    {fmtEuroPrecis(foncResult.pensionCnraclHorsOptionsMensuelle)}
                  </div>
                </div>

                {foncResult.minimumGarantiApplique && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      <strong>Minimum garanti CNRACL appliqué</strong> : plus favorable que la formule indiciaire ({fmtEuroPrecis(foncResult.pensionBaseHorsMgMensuelle)}).
                    </span>
                  </div>
                )}

                {foncResult.supplementNbiMensuel > 0 && (
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-300">
                      Supplément NBI ({pointsNbi} pts × {anneesNbi} ans)
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      + {fmtEuroPrecis(foncResult.supplementNbiMensuel)}
                    </span>
                  </div>
                )}

                {foncResult.majorationEnfantsMensuelle > 0 && (
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-300">
                      Majoration pour {nbEnfantsFonc} enfants
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      + {fmtEuroPrecis(foncResult.majorationEnfantsMensuelle)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-100">
                      Retraite additionnelle RAFP
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {foncResult.pointsRafpRetenus.toLocaleString('fr-FR')} pts × coeff. âge {foncResult.coeffAgeRafp.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    {foncResult.rafpEnRente ? (
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                        + {fmtEuroPrecis(foncResult.rafpRenteBruteMensuelle)}
                      </span>
                    ) : (
                      <span className="inline-block text-xs font-bold px-2 py-1 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                        Capital unique : {fmtEuro(foncResult.rafpCapitalBrutUnique)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-100">
                      Retraite de base (CNAV / CARSAT)
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Taux : <strong>{contResult.tauxCnavPct.toFixed(2)} %</strong> • Prorata RG :{' '}
                      {Math.round(contResult.prorataRegimeGeneral * 100)} %
                      {contResult.trimestresDecote > 0 && (
                        <span className="text-rose-600 dark:text-rose-400">
                          {' '}(décote -{contResult.trimestresDecote} trim.)
                        </span>
                      )}
                      {contResult.trimestresSurcote > 0 && (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {' '}(surcote +{contResult.trimestresSurcote} trim.)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="font-extrabold text-slate-900 dark:text-white">
                    {fmtEuroPrecis(contResult.pensionCnavHorsEnfantsMensuelle)}
                  </div>
                </div>

                {contResult.majorationEnfantsCnavMensuelle > 0 && (
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-300">
                      Majoration CNAV (+10 % pour ≥ 3 enfants)
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      + {fmtEuroPrecis(contResult.majorationEnfantsCnavMensuelle)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-100">
                      Complémentaire publique Ircantec
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {contResult.pointsIrcantecApresModulation.toLocaleString('fr-FR')} points retenus (0,56053 €/pt/an)
                    </div>
                  </div>
                  <div className="text-right">
                    {contResult.ircantecEnCapital ? (
                      <span className="inline-block text-xs font-bold px-2 py-1 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                        Capital unique : {fmtEuro(contResult.ircantecCapitalBrutUnique)}
                      </span>
                    ) : (
                      <span className="font-extrabold text-teal-600 dark:text-teal-400">
                        + {fmtEuroPrecis(contResult.ircantecRenteBruteMensuelle)}
                      </span>
                    )}
                  </div>
                </div>

                {contResult.renteAgircArrcoMensuelle > 0 && (
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-300">
                      Complémentaire secteur privé (Agirc-Arrco)
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      + {fmtEuroPrecis(contResult.renteAgircArrcoMensuelle)}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copierSynthese}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>Copier la synthèse</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION OFFICIELLE D'INFORMATION & REDIRECTION VERS CNRACL ET IRCANTEC */}
      <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-blue-200/80 dark:border-blue-500/30 space-y-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 shrink-0">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Pour aller plus loin : consultez les caisses officielles CNRACL & Ircantec
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Ce simulateur fournit une estimation pédagogique basée sur la réglementation 2026. Pour consulter votre{' '}
              <strong>Relevé Individuel de Situation (RIS)</strong> exact, vérifier vos trimestres validés et effectuer
              votre demande officielle de liquidation, rendez-vous sur les portails officiels de vos caisses de retraite :
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="https://www.cnracl.retraites.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-indigo-50/70 dark:from-slate-800 dark:via-slate-800/90 dark:to-blue-950/40 border border-blue-200 dark:border-blue-500/30 hover:border-blue-500 dark:hover:border-blue-400 shadow-sm hover:shadow-md transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black uppercase bg-blue-600 text-white">
                  <Landmark className="w-3.5 h-3.5" /> CNRACL
                </span>
                <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Caisse Nationale de Retraites des Agents des Collectivités Locales
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Pour les <strong>fonctionnaires territoriaux et hospitaliers</strong> affiliés (durée hebdomadaire ≥ 28h) :
                réglementation complète, catégorie active, rachat d'années d'études, retraite progressive et espace{' '}
                <em>Ma retraite publique</em>.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-blue-100 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-300">
              <span>Accéder à www.cnracl.retraites.fr</span>
              <span>→</span>
            </div>
          </a>

          <a
            href="https://www.ircantec.retraites.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-br from-teal-50 via-white to-emerald-50/70 dark:from-slate-800 dark:via-slate-800/90 dark:to-teal-950/40 border border-teal-200 dark:border-teal-500/30 hover:border-teal-500 dark:hover:border-teal-400 shadow-sm hover:shadow-md transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black uppercase bg-teal-600 text-white">
                  <Briefcase className="w-3.5 h-3.5" /> IRCANTEC
                </span>
                <ExternalLink className="w-4 h-4 text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Retraite complémentaire des agents non titulaires de la Fonction Publique
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Pour les <strong>agents contractuels de droit public</strong> (et fonctionnaires &lt; 28h/sem.) : relevé
                de points acquis, valeur du point, règles de majoration familiale et démarches de liquidation.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-teal-100 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-teal-700 dark:text-teal-300">
              <span>Accéder à www.ircantec.retraites.fr</span>
              <span>→</span>
            </div>
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-600 dark:text-slate-400">
          <span>
            💡 <strong>Astuce CFDT Gennevilliers :</strong> vérifiez votre relevé tous régimes dès 55 ans et demandez un entretien information retraite gratuit.
          </span>
          <div className="flex flex-wrap items-center gap-3 font-bold">
            <a
              href="https://www.info-retraite.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <span>Portail commun Info-Retraite.fr</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <a
              href="https://www.rafp.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <span>RAFP.fr</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulateurRetraite;
