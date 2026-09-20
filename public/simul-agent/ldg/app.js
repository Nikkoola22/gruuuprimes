/**
 * SIMULATEUR PÉDAGOGIQUE PROMOTION INTERNE (LDG-PI)
 * Mairie de Gennevilliers & CIG Petite Couronne
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const selectCategoryTarget = document.getElementById('selectCategoryTarget');
  const selectAccessWay = document.getElementById('selectAccessWay');
  const headerScoreValue = document.getElementById('headerScoreValue');
  const headerCategoryPill = document.getElementById('headerCategoryPill');
  const scoreCircle = document.getElementById('scoreCircle');
  const btnReset = document.getElementById('btnReset');
  const categoryHintText = document.getElementById('categoryHintText');
  const accessWayHintText = document.getElementById('accessWayHintText');

  // Mini-breakdown spans
  const miniL1 = document.getElementById('miniL1');
  const miniL2 = document.getElementById('miniL2');
  const miniL3 = document.getElementById('miniL3');
  const miniL4 = document.getElementById('miniL4');
  const miniL5 = document.getElementById('miniL5');
  const miniL6 = document.getElementById('miniL6');

  // Subtotals
  const subtotalLdg1 = document.getElementById('subtotalLdg1');
  const subtotalLdg2 = document.getElementById('subtotalLdg2');
  const subtotalLdg3 = document.getElementById('subtotalLdg3');
  const subtotalLdg4 = document.getElementById('subtotalLdg4');
  const subtotalLdg5 = document.getElementById('subtotalLdg5');
  const subtotalLdg6 = document.getElementById('subtotalLdg6');

  const maitriseSansQuotaBanner = document.getElementById('maitriseSansQuotaBanner');

  // Specific inputs
  const checkSyndicalLdg1 = document.getElementById('checkSyndicalLdg1');
  const crepCriteriaContainer = document.getElementById('crepCriteriaContainer');
  const crepSelects = document.querySelectorAll('.select-score[data-ldg="1"]');
  const ldg1MaxLabel = document.getElementById('ldg1MaxLabel');
  const ldg1NotApplicableNotice = document.getElementById('ldg1NotApplicableNotice');

  const selectLdg2Hierarchy = document.getElementById('selectLdg2Hierarchy');
  const selectLdg2Seniority = document.getElementById('selectLdg2Seniority');
  const selectLdg2Team = document.getElementById('selectLdg2Team');
  const ldg2MaxLabel = document.getElementById('ldg2MaxLabel');
  const ldg2NotApplicableNotice = document.getElementById('ldg2NotApplicableNotice');
  const ldg2InputsGroup = document.getElementById('ldg2InputsGroup');

  const selectLdg3Years = document.getElementById('selectLdg3Years');
  const selectLdg3Months = document.getElementById('selectLdg3Months');
  const ldg3MaxLabel = document.getElementById('ldg3MaxLabel');
  const ldg3NotApplicableNotice = document.getElementById('ldg3NotApplicableNotice');
  const ldg3InputsGroup = document.getElementById('ldg3InputsGroup');

  const selectLdg4Concours = document.getElementById('selectLdg4Concours');
  const selectLdg4Exam = document.getElementById('selectLdg4Exam');
  const ldg4MaxLabel = document.getElementById('ldg4MaxLabel');
  const ldg4NotApplicableNotice = document.getElementById('ldg4NotApplicableNotice');
  const ldg4InputsGroup = document.getElementById('ldg4InputsGroup');

  const selectLdg5Days = document.getElementById('selectLdg5Days');
  const selectLdg5Prep = document.getElementById('selectLdg5Prep');
  const ldg5DaysLabel = document.getElementById('ldg5DaysLabel');
  const ldg5DaysPeriodDesc = document.getElementById('ldg5DaysPeriodDesc');
  const ldg5MaxLabel = document.getElementById('ldg5MaxLabel');
  const ldg5NotApplicableNotice = document.getElementById('ldg5NotApplicableNotice');
  const ldg5InputsGroup = document.getElementById('ldg5InputsGroup');

  const selectLdg6Diploma = document.getElementById('selectLdg6Diploma');
  const ldg6MaxLabel = document.getElementById('ldg6MaxLabel');
  const ldg6NotApplicableNotice = document.getElementById('ldg6NotApplicableNotice');
  const ldg6InputsGroup = document.getElementById('ldg6InputsGroup');

  // Maximum badges & indicators
  const headerScoreMax = document.getElementById('headerScoreMax');
  const headerMaxBadge = document.getElementById('headerMaxBadge');

  // Modal elements
  const recapModal = document.getElementById('recapModal');
  const btnPrintModal = document.getElementById('btnPrintModal');
  const btnBottomModal = document.getElementById('btnBottomModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnCloseModalSecondary = document.getElementById('btnCloseModalSecondary');
  const btnPrintActual = document.getElementById('btnPrintActual');
  const recapCategory = document.getElementById('recapCategory');
  const recapAccessWay = document.getElementById('recapAccessWay');
  const recapDate = document.getElementById('recapDate');
  const recapScoreValue = document.getElementById('recapScoreValue');
  const recapScoreMaxValue = document.getElementById('recapScoreMaxValue');
  const recapProgressBar = document.getElementById('recapProgressBar');
  const recapPercent = document.getElementById('recapPercent');
  const recapTableBody = document.getElementById('recapTableBody');
  const recapTableFoot = document.getElementById('recapTableFoot');
  const recapChecklist = document.getElementById('recapChecklist');

  // Populate dynamic select options
  function initDynamicOptions() {
    // LDG 3 Years: 0 to 45 years
    selectLdg3Years.innerHTML = '';
    for (let i = 0; i <= 45; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${i} an${i > 1 ? 's' : ''} (${i} pt${i > 1 ? 's' : ''})`;
      if (i === 10) opt.selected = true;
      selectLdg3Years.appendChild(opt);
    }

    // LDG 5 Days: 0 to 15 days
    selectLdg5Days.innerHTML = '';
    for (let i = 0; i <= 15; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${i} jour${i > 1 ? 's' : ''} de formation (${i} pt${i > 1 ? 's' : ''})`;
      if (i === 6) opt.selected = true;
      selectLdg5Days.appendChild(opt);
    }
  }

  initDynamicOptions();

  // Pre-populate values from URL parameters if passed from career simulator
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('target')) {
      const t = urlParams.get('target').toUpperCase();
      if (['A', 'B', 'C'].includes(t)) {
        selectCategoryTarget.value = t;
      }
    }
    if (urlParams.has('way')) {
      const w = urlParams.get('way').toLowerCase();
      if (['choix', 'examen'].includes(w)) {
        selectAccessWay.value = w;
      }
    }
    if (urlParams.has('years')) {
      const y = parseInt(urlParams.get('years'), 10);
      if (!isNaN(y) && y >= 0 && y <= 45) {
        selectLdg3Years.value = String(y);
      }
    }
  } catch (err) {
    console.warn("URL params parsing error:", err);
  }

  // Helper pour calculer les plafonds théoriques selon le profil
  function getMaxScores(category, accessWay, examValue) {
    let max1 = 45;
    let max2 = (category === 'A') ? 35 : (category === 'B' ? 30 : 0);
    let max3 = 45;
    let max4 = (examValue && examValue.startsWith('exception_')) ? 45 : 35;
    let max5 = (category === 'C' || accessWay === 'examen') ? 0 : 17;
    let max6 = (category === 'C') ? 0 : 3;

    if (category === 'C') {
      max2 = 0;
      max5 = 0;
      max6 = 0;
      if (accessWay === 'choix') {
        // Agent de maîtrise au choix est sans quota : aucune LDG n'attribue de points
        max1 = 0;
        max3 = 0;
        max4 = 0;
      }
    }
    if (category === 'B' && accessWay === 'examen') {
      max2 = 0;
    }

    const grandMax = max1 + max2 + max3 + max4 + max5 + max6;
    return { max1, max2, max3, max4, max5, max6, grandMax };
  }

  // Pulse animation on score update
  function triggerPulse() {
    scoreCircle.classList.remove('pulse');
    void scoreCircle.offsetWidth; // force reflow
    scoreCircle.classList.add('pulse');
  }

  // Update profile texts & rules
  function handleProfileChange() {
    const cat = selectCategoryTarget.value;
    const way = selectAccessWay.value;

    headerCategoryPill.textContent = `Catégorie ${cat} (${way === 'choix' ? 'Au choix' : 'Exam. Pro'})`;

    if (cat === 'A') {
      categoryHintText.textContent = "Pour les agents B visant un cadre d'emplois A (Attaché, Ingénieur, Conseiller...).";
      ldg4MaxLabel.textContent = "/ 35 pts";
      ldg5DaysLabel.textContent = "Jours de formations suivies au cours des 5 dernières années (2022-2026)";
      ldg5DaysPeriodDesc.textContent = "Formations suivies entre le 01/01/2022 et le 31/12/2026 (5 ans) : 1 pt par jour, 0,5 pt par demi-journée (Max 15 pts).";

      // Ensure Stratégique option is visible & available in LDG 2
      let hasStrat = false;
      for (const opt of selectLdg2Hierarchy.options) {
        if (opt.value === '30') hasStrat = true;
      }
      if (!hasStrat) {
        const opt = new Option("Niveau Stratégique : Pilotage direct avec DGS/DGA, direction plusieurs services (30 pts)", "30");
        selectLdg2Hierarchy.add(opt, 0);
      }
    } else if (cat === 'B') {
      categoryHintText.textContent = "Pour les agents C visant un cadre d'emplois B (Rédacteur, Technicien, Animateur...).";
      ldg4MaxLabel.textContent = "/ 35 pts";
      ldg5DaysLabel.textContent = "Jours de formations suivies au cours des 10 dernières années (2017-2026)";
      ldg5DaysPeriodDesc.textContent = "Formations suivies entre le 01/01/2017 et le 31/12/2026 (10 ans) : 1 pt par jour, 0,5 pt par demi-journée (Max 15 pts).";

      // Stratégique is not applicable in B
      for (let i = 0; i < selectLdg2Hierarchy.options.length; i++) {
        if (selectLdg2Hierarchy.options[i].value === '30') {
          selectLdg2Hierarchy.remove(i);
          break;
        }
      }
    } else if (cat === 'C') {
      categoryHintText.textContent = "Accès au cadre d'emplois des Agents de maîtrise (Catégorie C).";
    }

    if (way === 'examen') {
      accessWayHintText.textContent = "Voie spécifique pour les lauréats de l'examen professionnel réglementaire.";
    } else {
      accessWayHintText.textContent = "Voie d'accès au choix sur appréciation de la valeur professionnelle et des acquis.";
    }

    // Calcul des plafonds selon le profil
    const maxScores = getMaxScores(cat, way, selectLdg4Exam.value);

    // Mise à jour dynamique des libellés de plafonds de sous-totaux
    if (ldg1MaxLabel) ldg1MaxLabel.textContent = `/ ${maxScores.max1} pt${maxScores.max1 > 1 ? 's' : ''}`;
    if (ldg2MaxLabel) ldg2MaxLabel.textContent = `/ ${maxScores.max2} pt${maxScores.max2 > 1 ? 's' : ''}`;
    if (ldg3MaxLabel) ldg3MaxLabel.textContent = `/ ${maxScores.max3} pt${maxScores.max3 > 1 ? 's' : ''}`;
    if (ldg4MaxLabel) ldg4MaxLabel.textContent = `/ ${maxScores.max4} pt${maxScores.max4 > 1 ? 's' : ''}`;
    if (ldg5MaxLabel) ldg5MaxLabel.textContent = `/ ${maxScores.max5} pt${maxScores.max5 > 1 ? 's' : ''}`;
    if (ldg6MaxLabel) ldg6MaxLabel.textContent = `/ ${maxScores.max6} pt${maxScores.max6 > 1 ? 's' : ''}`;

    // Affichage du bandeau informatif spécial pour Agent de maîtrise au choix (sans quota)
    if (maitriseSansQuotaBanner) {
      maitriseSansQuotaBanner.style.display = (cat === 'C' && way === 'choix') ? 'block' : 'none';
    }

    // Gestion de l'inapplicabilité et des bandeaux par ligne :
    // LDG 1
    if (cat === 'C' && way === 'choix') {
      if (ldg1NotApplicableNotice) ldg1NotApplicableNotice.style.display = 'block';
      if (crepCriteriaContainer) {
        crepCriteriaContainer.style.opacity = '0.35';
        crepCriteriaContainer.style.pointerEvents = 'none';
      }
      if (checkSyndicalLdg1) checkSyndicalLdg1.disabled = true;
    } else {
      if (ldg1NotApplicableNotice) ldg1NotApplicableNotice.style.display = 'none';
      if (checkSyndicalLdg1) checkSyndicalLdg1.disabled = false;
      if (!checkSyndicalLdg1.checked && crepCriteriaContainer) {
        crepCriteriaContainer.style.opacity = '1';
        crepCriteriaContainer.style.pointerEvents = 'auto';
      }
    }

    // LDG 2
    if (cat === 'C') {
      if (ldg2NotApplicableNotice) {
        ldg2NotApplicableNotice.style.display = 'block';
        ldg2NotApplicableNotice.textContent = "ℹ️ Pour l'accès au cadre d'emplois des Agents de maîtrise (Catégorie C), la LDG 2 ne s'applique pas selon les règles statutaires du CIG.";
      }
      if (ldg2InputsGroup) {
        ldg2InputsGroup.style.opacity = '0.35';
        ldg2InputsGroup.style.pointerEvents = 'none';
      }
    } else if (cat === 'B' && way === 'examen') {
      if (ldg2NotApplicableNotice) {
        ldg2NotApplicableNotice.style.display = 'block';
        ldg2NotApplicableNotice.textContent = "ℹ️ Pour la voie après examen professionnel en catégorie B, la LDG 2 ne s'applique pas selon le barème officiel CIG.";
      }
      if (ldg2InputsGroup) {
        ldg2InputsGroup.style.opacity = '0.35';
        ldg2InputsGroup.style.pointerEvents = 'none';
      }
    } else {
      if (ldg2NotApplicableNotice) ldg2NotApplicableNotice.style.display = 'none';
      if (ldg2InputsGroup) {
        ldg2InputsGroup.style.opacity = '1';
        ldg2InputsGroup.style.pointerEvents = 'auto';
      }
    }

    // LDG 3
    if (cat === 'C' && way === 'choix') {
      if (ldg3NotApplicableNotice) ldg3NotApplicableNotice.style.display = 'block';
      if (ldg3InputsGroup) {
        ldg3InputsGroup.style.opacity = '0.35';
        ldg3InputsGroup.style.pointerEvents = 'none';
      }
    } else {
      if (ldg3NotApplicableNotice) ldg3NotApplicableNotice.style.display = 'none';
      if (ldg3InputsGroup) {
        ldg3InputsGroup.style.opacity = '1';
        ldg3InputsGroup.style.pointerEvents = 'auto';
      }
    }

    // LDG 4
    if (cat === 'C' && way === 'choix') {
      if (ldg4NotApplicableNotice) ldg4NotApplicableNotice.style.display = 'block';
      if (ldg4InputsGroup) {
        ldg4InputsGroup.style.opacity = '0.35';
        ldg4InputsGroup.style.pointerEvents = 'none';
      }
    } else {
      if (ldg4NotApplicableNotice) ldg4NotApplicableNotice.style.display = 'none';
      if (ldg4InputsGroup) {
        ldg4InputsGroup.style.opacity = '1';
        ldg4InputsGroup.style.pointerEvents = 'auto';
      }
    }

    // LDG 5
    if (cat === 'C') {
      if (ldg5NotApplicableNotice) {
        ldg5NotApplicableNotice.style.display = 'block';
        ldg5NotApplicableNotice.textContent = "ℹ️ Pour l'accès au grade d'Agent de maîtrise (Catégorie C), la LDG 5 ne s'applique pas selon les règles statutaires du CIG.";
      }
      if (ldg5InputsGroup) {
        ldg5InputsGroup.style.opacity = '0.35';
        ldg5InputsGroup.style.pointerEvents = 'none';
      }
    } else if (way === 'examen') {
      if (ldg5NotApplicableNotice) {
        ldg5NotApplicableNotice.style.display = 'block';
        ldg5NotApplicableNotice.textContent = "ℹ️ Pour la voie « après examen professionnel », la LDG 5 ne s'applique pas (sauf exceptions spécifiques Ingénieur et Chef de police).";
      }
      if (ldg5InputsGroup) {
        ldg5InputsGroup.style.opacity = '0.35';
        ldg5InputsGroup.style.pointerEvents = 'none';
      }
    } else {
      if (ldg5NotApplicableNotice) ldg5NotApplicableNotice.style.display = 'none';
      if (ldg5InputsGroup) {
        ldg5InputsGroup.style.opacity = '1';
        ldg5InputsGroup.style.pointerEvents = 'auto';
      }
    }

    // LDG 6
    if (cat === 'C') {
      if (ldg6NotApplicableNotice) {
        ldg6NotApplicableNotice.style.display = 'block';
        ldg6NotApplicableNotice.textContent = "ℹ️ Pour l'accès au cadre d'emplois des Agents de maîtrise (Catégorie C), la LDG 6 ne s'applique pas selon les règles statutaires du CIG.";
      }
      if (ldg6InputsGroup) {
        ldg6InputsGroup.style.opacity = '0.35';
        ldg6InputsGroup.style.pointerEvents = 'none';
      }
    } else {
      if (ldg6NotApplicableNotice) ldg6NotApplicableNotice.style.display = 'none';
      if (ldg6InputsGroup) {
        ldg6InputsGroup.style.opacity = '1';
        ldg6InputsGroup.style.pointerEvents = 'auto';
      }
    }

    calculateAll();
  }

  // Handle Syndical Checkbox
  function handleSyndicalChange() {
    if (checkSyndicalLdg1.checked) {
      crepCriteriaContainer.style.opacity = '0.4';
      crepCriteriaContainer.style.pointerEvents = 'none';
    } else {
      crepCriteriaContainer.style.opacity = '1';
      crepCriteriaContainer.style.pointerEvents = 'auto';
    }
    calculateAll();
  }

  // Calculate scores
  function calculateAll() {
    const cat = selectCategoryTarget.value;
    const way = selectAccessWay.value;
    const examVal = selectLdg4Exam ? selectLdg4Exam.value : '';

    // --- LDG 1 : Valeur Pro ---
    let ptsLdg1 = 0;
    if (cat === 'C' && way === 'choix') {
      // Agent de maîtrise au choix is sans quota and no LDG points
      ptsLdg1 = 0;
    } else if (checkSyndicalLdg1.checked) {
      ptsLdg1 = 30;
    } else {
      crepSelects.forEach(sel => {
        ptsLdg1 += parseInt(sel.value, 10) || 0;
      });
    }
    ptsLdg1 = Math.min(ptsLdg1, (cat === 'C' && way === 'choix') ? 0 : 45);

    // --- LDG 2 : Fonctions exercées ---
    let ptsLdg2 = 0;
    if (cat === 'C') {
      ptsLdg2 = 0;
    } else {
      const hierPts = parseInt(selectLdg2Hierarchy.value, 10) || 0;
      const senPts = parseInt(selectLdg2Seniority.value, 10) || 0;
      let teamPts = parseInt(selectLdg2Team.value, 10) || 0;

      // Majoration encadrement applies only if hierarchy level is not "sans encadrement" (15)
      if (hierPts <= 15) {
        teamPts = 0;
      }

      ptsLdg2 = hierPts + senPts + teamPts;
      const maxLdg2 = (cat === 'A') ? 35 : 30;
      ptsLdg2 = Math.min(ptsLdg2, maxLdg2);
    }

    // --- LDG 3 : Ancienneté ---
    let ptsLdg3 = 0;
    if (cat === 'C' && way === 'choix') {
      ptsLdg3 = 0;
    } else {
      const years = parseInt(selectLdg3Years.value, 10) || 0;
      const months = parseFloat(selectLdg3Months.value) || 0;
      ptsLdg3 = years + months;
      ptsLdg3 = Math.min(ptsLdg3, 45);
    }

    // --- LDG 4 : Concours et Examens ---
    let ptsLdg4 = 0;
    if (cat === 'C' && way === 'choix') {
      ptsLdg4 = 0;
    } else {
      const concoursPts = parseInt(selectLdg4Concours.value, 10) || 0;
      let examPts = 0;

      if (examVal === '10') {
        examPts = 10;
      } else if (examVal === '20_reg') {
        examPts = 20;
      } else if (examVal === '15_reg') {
        examPts = 15;
      } else if (examVal === '10_reg') {
        examPts = 10;
      } else if (examVal === 'exception_20') {
        examPts = 20;
      } else if (examVal === 'exception_15') {
        examPts = 15;
      } else if (examVal === 'exception_10') {
        examPts = 10;
      }

      ptsLdg4 = concoursPts + examPts;

      // Exception rédacteur can reach 45 pts, otherwise standard max 35 pts
      if (examVal.startsWith('exception_')) {
        ptsLdg4 = Math.min(ptsLdg4, 45);
      } else {
        ptsLdg4 = Math.min(ptsLdg4, 35);
      }
    }

    // --- LDG 5 : Formations pro ---
    let ptsLdg5 = 0;
    if (cat === 'C' || way === 'examen') {
      ptsLdg5 = 0;
    } else {
      const daysPts = parseInt(selectLdg5Days.value, 10) || 0;
      const prepPts = parseInt(selectLdg5Prep.value, 10) || 0;
      ptsLdg5 = Math.min(daysPts, 15) + prepPts;
      ptsLdg5 = Math.min(ptsLdg5, 17);
    }

    // --- LDG 6 : Diplôme ---
    let ptsLdg6 = 0;
    if (cat === 'C') {
      ptsLdg6 = 0;
    } else {
      ptsLdg6 = parseInt(selectLdg6Diploma.value, 10) || 0;
      ptsLdg6 = Math.min(ptsLdg6, 3);
    }

    // Total general
    const grandTotal = ptsLdg1 + ptsLdg2 + ptsLdg3 + ptsLdg4 + ptsLdg5 + ptsLdg6;
    const maxScores = getMaxScores(cat, way, examVal);

    // Formatting
    const formatPts = (num) => {
      return num % 1 === 0 ? num.toString() : num.toFixed(2);
    };

    // Update Subtotals UI
    subtotalLdg1.textContent = formatPts(ptsLdg1);
    subtotalLdg2.textContent = formatPts(ptsLdg2);
    subtotalLdg3.textContent = formatPts(ptsLdg3);
    subtotalLdg4.textContent = formatPts(ptsLdg4);
    subtotalLdg5.textContent = formatPts(ptsLdg5);
    subtotalLdg6.textContent = formatPts(ptsLdg6);

    // Update Mini-breakdown (if present)
    if (miniL1) miniL1.textContent = formatPts(ptsLdg1);
    if (miniL2) miniL2.textContent = formatPts(ptsLdg2);
    if (miniL3) miniL3.textContent = formatPts(ptsLdg3);
    if (miniL4) miniL4.textContent = formatPts(ptsLdg4);
    if (miniL5) miniL5.textContent = formatPts(ptsLdg5);
    if (miniL6) miniL6.textContent = formatPts(ptsLdg6);

    // Update Sticky Header & trigger pulse
    const oldScore = headerScoreValue.textContent;
    const newScoreStr = formatPts(grandTotal);
    headerScoreValue.textContent = newScoreStr;

    if (headerScoreMax) {
      headerScoreMax.textContent = maxScores.grandMax;
    }
    if (headerMaxBadge) {
      headerMaxBadge.textContent = `Plafond théorique : ${maxScores.grandMax} pts`;
    }

    if (oldScore !== newScoreStr) {
      triggerPulse();
    }
  }

  // Reset to default
  function resetAll() {
    selectCategoryTarget.value = 'B';
    selectAccessWay.value = 'choix';

    checkSyndicalLdg1.checked = false;
    crepCriteriaContainer.style.opacity = '1';
    crepCriteriaContainer.style.pointerEvents = 'auto';

    // Set default CREP selects
    const defaults = ['9', '6', '9', '6', '9'];
    crepSelects.forEach((sel, idx) => {
      sel.value = defaults[idx] || '6';
    });

    selectLdg2Hierarchy.value = '25';
    selectLdg2Seniority.value = '2';
    selectLdg2Team.value = '0';

    selectLdg3Years.value = '10';
    selectLdg3Months.value = '0';

    selectLdg4Concours.value = '15';
    selectLdg4Exam.value = '10';

    selectLdg5Days.value = '6';
    selectLdg5Prep.value = '2';

    selectLdg6Diploma.value = '2';

    handleProfileChange();
  }

  // Populate & Open Modal
  function openRecapModal() {
    const cat = selectCategoryTarget.value;
    const way = selectAccessWay.value;

    const catLabels = {
      'A': 'Accès en Catégorie A (Attaché, Ingénieur, Conseiller...)',
      'B': 'Accès en Catégorie B (Rédacteur, Technicien, Animateur...)',
      'C': 'Accès en Catégorie C (Agent de maîtrise)'
    };

    const wayLabels = {
      'choix': 'Voie au choix (dossier & valeur professionnelle)',
      'examen': 'Voie après examen professionnel réglementaire'
    };

    recapCategory.textContent = catLabels[cat] || `Catégorie ${cat}`;
    recapAccessWay.textContent = wayLabels[way] || way;

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    recapDate.textContent = dateFormatted;

    // Calcul des plafonds selon profil
    const maxScores = getMaxScores(cat, way, selectLdg4Exam.value);
    const curTotal = parseFloat(headerScoreValue.textContent) || 0;

    recapScoreValue.textContent = headerScoreValue.textContent;
    if (recapScoreMaxValue) {
      recapScoreMaxValue.textContent = maxScores.grandMax;
    }

    if (recapProgressBar) {
      const pct = maxScores.grandMax > 0 ? Math.min(100, Math.round((curTotal / maxScores.grandMax) * 100)) : 0;
      recapProgressBar.style.width = `${pct}%`;
      if (recapPercent) {
        recapPercent.textContent = `${pct}% du barème maximal possible (${maxScores.grandMax} pts)`;
      }
    }

    // Populate rows
    recapTableBody.innerHTML = '';
    const checklistItems = new Set();

    // Ligne 1
    let l1Details = '';
    if (cat === 'C' && way === 'choix') {
      l1Details = "Promotion au choix sans quota réglementaire (aucun point barème CIG)";
    } else if (checkSyndicalLdg1.checked) {
      l1Details = "Forfait mandat syndical >= 70% sans CREP ces 2 dernières années";
    } else {
      l1Details = `Croix de votre entretien professionnel (CREP) transformées en points (${subtotalLdg1.textContent}/${maxScores.max1} pts)`;
    }
    appendRecapRow("Ligne 1 : Valeur Professionnelle", l1Details, subtotalLdg1.textContent, `${maxScores.max1} pts`);
    if (cat !== 'C' || way !== 'choix') {
      checklistItems.add("CREP N-1 ou N-2 dûment signé par l'agent et son supérieur hiérarchique direct.");
      checklistItems.add("Grille d'évaluation LDG 1 visée par la collectivité de Gennevilliers.");
    }

    // Ligne 2
    let l2Details = '';
    if (cat === 'C' || maxScores.max2 === 0) {
      l2Details = "Non prise en compte pour ce cadre d'emplois / voie";
    } else {
      const hierText = selectLdg2Hierarchy.options[selectLdg2Hierarchy.selectedIndex]?.text.split('(')[0] || '';
      const senText = selectLdg2Seniority.value === '2' ? 'Plus de 3 ans dans la fonction' : 'Moins de 3 ans';
      l2Details = `${hierText.trim()} • ${senText}`;
      if (selectLdg2Team.value !== '0' && parseInt(selectLdg2Hierarchy.value, 10) > 15) {
        l2Details += ` • Évalue et encadre une équipe (${selectLdg2Team.options[selectLdg2Team.selectedIndex]?.text})`;
      }
      checklistItems.add("Fiche de poste à jour détaillée et signée (positionnement, encadrement, missions).");
      checklistItems.add("Arrêté ou décision d'affectation attestant de la prise de fonctions.");
      checklistItems.add("Organigramme officiel du service ou du secteur.");
    }
    appendRecapRow("Ligne 2 : Fonctions Exercées", l2Details, subtotalLdg2.textContent, `${maxScores.max2} pts`);

    // Ligne 3
    let l3Details = '';
    if (cat === 'C' && way === 'choix') {
      l3Details = "Promotion au choix sans quota réglementaire (aucun point barème CIG)";
    } else {
      const years = selectLdg3Years.value;
      const months = selectLdg3Months.options[selectLdg3Months.selectedIndex]?.text.split('(')[0] || '';
      l3Details = `${years} an(s) et ${months.trim()} dans la catégorie actuelle (calcul arrêté au 01/01/2027)`;
    }
    appendRecapRow("Ligne 3 : Ancienneté dans la Catégorie", l3Details, subtotalLdg3.textContent, `${maxScores.max3} pts`);
    if (cat !== 'C' || way !== 'choix') {
      checklistItems.add("Arrêté de nomination en qualité de stagiaire ou de titulaire dans la catégorie actuelle (avec reprise de services éventuelle).");
    } else {
      checklistItems.add("Arrêté de nomination justifiant d'au moins 9 ans de services effectifs dans un cadre technique ou ATSEM.");
    }

    // Ligne 4
    let l4Details = '';
    if (cat === 'C' && way === 'choix') {
      l4Details = "Promotion au choix sans quota réglementaire (aucun point barème CIG)";
    } else {
      const concText = selectLdg4Concours.value === '15' ? 'Recruté sur concours (+15 pts)' : 'Sans concours';
      const examText = selectLdg4Exam.options[selectLdg4Exam.selectedIndex]?.text.split('(')[0] || '';
      l4Details = `${concText} • ${examText.trim()}`;
    }
    appendRecapRow("Ligne 4 : Concours et Examens Professionnels", l4Details, subtotalLdg4.textContent, `${maxScores.max4} pts`);
    if (cat !== 'C' || way !== 'choix') {
      if (selectLdg4Concours.value === '15') {
        checklistItems.add("Arrêté de nomination mentionnant le visa du concours + attestation de réussite au concours ou liste d'aptitude.");
      }
      if (selectLdg4Exam.value !== '0') {
        checklistItems.add("Attestation officielle de réussite à l'examen professionnel ou arrêté de nomination correspondant.");
      }
    }

    // Ligne 5
    let l5Details = '';
    if (cat === 'C' || maxScores.max5 === 0) {
      l5Details = "Non applicable selon votre profil / voie";
    } else {
      const daysText = `${selectLdg5Days.value} jour(s) de formation hors FSO (${cat === 'A' ? '2022-2026' : '2017-2026'})`;
      const prepText = selectLdg5Prep.value === '2' ? 'Avec préparation concours/examen (2022-2026)' : 'Sans prépa concours';
      l5Details = `${daysText} • ${prepText}`;
      checklistItems.add("<strong>Pensez à transmettre toutes vos attestations à la DCRH</strong> (attestations de présence CNFPT ou d'organismes de formation externes indiquant la durée, hors jours FSO).");
      if (selectLdg5Prep.value === '2') {
        checklistItems.add("Attestation de présence pour la préparation au concours ou examen professionnel.");
      }
    }
    appendRecapRow("Ligne 5 : Formations Professionnelles", l5Details, subtotalLdg5.textContent, `${maxScores.max5} pts`);

    // Ligne 6
    let l6Details = '';
    if (cat === 'C' || maxScores.max6 === 0) {
      l6Details = "Non prise en compte pour ce cadre d'emplois";
    } else {
      l6Details = selectLdg6Diploma.options[selectLdg6Diploma.selectedIndex]?.text || 'Aucun';
      if (selectLdg6Diploma.value !== '0') {
        checklistItems.add("<strong>À transmettre à la GCR :</strong> Copie du diplôme le plus élevé certifié au RNCP ou attestation officielle de réussite.");
      }
    }
    appendRecapRow("Ligne 6 : Diplôme le Plus Élevé", l6Details, subtotalLdg6.textContent, `${maxScores.max6} pts`);

    // Total Foot
    if (recapTableFoot) {
      recapTableFoot.innerHTML = `
        <tr>
          <td><strong>TOTAL GÉNÉRAL</strong></td>
          <td>Synthèse globale des 6 Lignes Directrices de Gestion</td>
          <td class="text-right"><strong>${curTotal} pt${curTotal > 1 ? 's' : ''}</strong></td>
          <td class="text-right col-max"><strong>${maxScores.grandMax} pts max</strong></td>
        </tr>
      `;
    }

    // Checklist render
    recapChecklist.innerHTML = '';
    // Always add FSO
    const fsoItem = document.createElement('li');
    fsoItem.innerHTML = "<strong>Attestations de suivi de vos Formations Statutaires Obligatoires (FSO / CNFPT)</strong> pour toutes les périodes révolues (condition indispensable de recevabilité).";
    recapChecklist.appendChild(fsoItem);

    checklistItems.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = item;
      recapChecklist.appendChild(li);
    });

    // Open modal
    recapModal.classList.add('open');
    recapModal.setAttribute('aria-hidden', 'false');
  }

  function appendRecapRow(title, details, points, maxPts) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${title}</strong></td>
      <td>${details}</td>
      <td class="text-right">${points} pt${parseFloat(points) > 1 ? 's' : ''}</td>
      <td class="text-right col-max">${maxPts}</td>
    `;
    recapTableBody.appendChild(tr);
  }

  function closeModal() {
    recapModal.classList.remove('open');
    recapModal.setAttribute('aria-hidden', 'true');
  }

  // =========================================================
  // GESTION BULLE D'INFORMATION (I) ET GRILLE CIG LIGNE 2
  // =========================================================
  const ldg2InfoWrapper = document.getElementById('ldg2InfoWrapper');
  const btnInfoLdg2 = document.getElementById('btnInfoLdg2');
  const popoverLdg2 = document.getElementById('popoverLdg2');
  const btnCloseLdg2Popover = document.getElementById('btnCloseLdg2Popover');
  const btnFooterCloseLdg2 = document.getElementById('btnFooterCloseLdg2');
  const tabBtnCatA = document.getElementById('tabBtnCatA');
  const tabBtnCatB = document.getElementById('tabBtnCatB');
  const panelCatA = document.getElementById('panelCatA');
  const panelCatB = document.getElementById('panelCatB');
  const popoverCurrentCatLabel = document.getElementById('popoverCurrentCatLabel');

  let popoverHideTimer = null;
  let isPinnedOpen = false;

  function setLdg2ActiveTab(tab) {
    if (!tabBtnCatA || !tabBtnCatB || !panelCatA || !panelCatB) return;
    if (tab === 'A') {
      tabBtnCatA.classList.add('active');
      tabBtnCatA.setAttribute('aria-selected', 'true');
      tabBtnCatB.classList.remove('active');
      tabBtnCatB.setAttribute('aria-selected', 'false');
      panelCatA.style.display = 'block';
      panelCatB.style.display = 'none';
    } else {
      tabBtnCatB.classList.add('active');
      tabBtnCatB.setAttribute('aria-selected', 'true');
      tabBtnCatA.classList.remove('active');
      tabBtnCatA.setAttribute('aria-selected', 'false');
      panelCatB.style.display = 'block';
      panelCatA.style.display = 'none';
    }
  }

  function syncLdg2PopoverCategory(cat) {
    if (popoverCurrentCatLabel) {
      popoverCurrentCatLabel.textContent = (cat === 'A') ? 'Catégorie A' : (cat === 'C' ? 'Catégorie C' : 'Catégorie B');
    }
    setLdg2ActiveTab(cat === 'A' ? 'A' : 'B');
  }

  function showLdg2Popover() {
    if (popoverHideTimer) {
      clearTimeout(popoverHideTimer);
      popoverHideTimer = null;
    }
    if (!popoverLdg2) return;
    syncLdg2PopoverCategory(selectCategoryTarget.value);
    popoverLdg2.classList.add('show');
    if (ldg2InfoWrapper) ldg2InfoWrapper.classList.add('is-open');
    if (btnInfoLdg2) btnInfoLdg2.setAttribute('aria-expanded', 'true');
  }

  function hideLdg2Popover(force = false) {
    if (isPinnedOpen && !force) return;
    if (popoverHideTimer) clearTimeout(popoverHideTimer);
    popoverHideTimer = setTimeout(() => {
      if (!isPinnedOpen || force) {
        if (popoverLdg2) popoverLdg2.classList.remove('show');
        if (ldg2InfoWrapper) ldg2InfoWrapper.classList.remove('is-open');
        if (btnInfoLdg2) btnInfoLdg2.setAttribute('aria-expanded', 'false');
        isPinnedOpen = false;
      }
    }, force ? 0 : 250);
  }

  function initLdg2InfoBubble() {
    if (!btnInfoLdg2 || !popoverLdg2 || !ldg2InfoWrapper) return;

    // Survol souris (desktop)
    btnInfoLdg2.addEventListener('mouseenter', () => {
      showLdg2Popover();
    });
    btnInfoLdg2.addEventListener('mouseleave', () => {
      hideLdg2Popover(false);
    });

    popoverLdg2.addEventListener('mouseenter', () => {
      if (popoverHideTimer) {
        clearTimeout(popoverHideTimer);
        popoverHideTimer = null;
      }
    });
    popoverLdg2.addEventListener('mouseleave', () => {
      hideLdg2Popover(false);
    });

    // Clic pour épingler / basculer (mobile ou tactile)
    btnInfoLdg2.addEventListener('click', (e) => {
      e.stopPropagation();
      if (popoverLdg2.classList.contains('show') && isPinnedOpen) {
        isPinnedOpen = false;
        hideLdg2Popover(true);
      } else {
        isPinnedOpen = true;
        showLdg2Popover();
      }
    });

    // Fermeture par bouton croix ou bouton footer
    if (btnCloseLdg2Popover) {
      btnCloseLdg2Popover.addEventListener('click', (e) => {
        e.stopPropagation();
        isPinnedOpen = false;
        hideLdg2Popover(true);
      });
    }
    if (btnFooterCloseLdg2) {
      btnFooterCloseLdg2.addEventListener('click', (e) => {
        e.stopPropagation();
        isPinnedOpen = false;
        hideLdg2Popover(true);
      });
    }

    // Onglets internes du popover
    if (tabBtnCatA) {
      tabBtnCatA.addEventListener('click', (e) => {
        e.stopPropagation();
        setLdg2ActiveTab('A');
      });
    }
    if (tabBtnCatB) {
      tabBtnCatB.addEventListener('click', (e) => {
        e.stopPropagation();
        setLdg2ActiveTab('B');
      });
    }

    // Fermeture au clic à l'extérieur
    document.addEventListener('click', (e) => {
      if (ldg2InfoWrapper && !ldg2InfoWrapper.contains(e.target)) {
        isPinnedOpen = false;
        hideLdg2Popover(true);
      }
    });

    // Touche Echap
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        isPinnedOpen = false;
        hideLdg2Popover(true);
      }
    });
  }

  // Event Listeners
  selectCategoryTarget.addEventListener('change', () => {
    handleProfileChange();
    syncLdg2PopoverCategory(selectCategoryTarget.value);
  });
  selectAccessWay.addEventListener('change', handleProfileChange);
  checkSyndicalLdg1.addEventListener('change', handleSyndicalChange);

  document.querySelectorAll('.select-score').forEach(sel => {
    sel.addEventListener('change', calculateAll);
  });

  if (btnReset) btnReset.addEventListener('click', resetAll);

  btnPrintModal.addEventListener('click', openRecapModal);
  btnBottomModal.addEventListener('click', openRecapModal);
  btnCloseModal.addEventListener('click', closeModal);
  btnCloseModalSecondary.addEventListener('click', closeModal);

  // Close modal when clicking on backdrop
  recapModal.addEventListener('click', (e) => {
    if (e.target === recapModal) closeModal();
  });

  // Print
  btnPrintActual.addEventListener('click', () => {
    window.print();
  });

  // Initialisation de la bulle d'information Ligne 2
  initLdg2InfoBubble();

  // =========================================================
  // MEMENTORH DRAWER LOGIC
  // =========================================================
  const btnOpenMementoDrawer = document.getElementById('btnOpenMementoDrawer');
  const btnCloseMementoDrawer = document.getElementById('btnCloseMementoDrawer');
  const mementoDrawerOverlay = document.getElementById('mementoDrawerOverlay');
  const mementoDrawer = document.getElementById('mementoDrawer');
  
  const btnRoleGestionnaire = document.getElementById('btnRoleGestionnaire');
  const btnRoleAgent = document.getElementById('btnRoleAgent');
  const gestionnaireOnlyElements = document.querySelectorAll('[data-vue-only="gestionnaire"]');

  function openMementoDrawer() {
    mementoDrawerOverlay.classList.remove('hidden');
    mementoDrawer.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }

  function closeMementoDrawer() {
    mementoDrawerOverlay.classList.add('hidden');
    mementoDrawer.classList.add('hidden');
    document.body.style.overflow = '';
  }

  if (btnOpenMementoDrawer) {
    btnOpenMementoDrawer.addEventListener('click', openMementoDrawer);
  }
  
  if (btnCloseMementoDrawer) {
    btnCloseMementoDrawer.addEventListener('click', closeMementoDrawer);
  }
  
  if (mementoDrawerOverlay) {
    mementoDrawerOverlay.addEventListener('click', closeMementoDrawer);
  }

  function setMementoRole(role) {
    if (role === 'gestionnaire') {
      btnRoleGestionnaire.classList.add('active');
      btnRoleAgent.classList.remove('active');
      gestionnaireOnlyElements.forEach(el => el.classList.remove('vue-hidden'));
    } else {
      btnRoleAgent.classList.add('active');
      btnRoleGestionnaire.classList.remove('active');
      gestionnaireOnlyElements.forEach(el => el.classList.add('vue-hidden'));
    }
  }

  if (btnRoleGestionnaire) {
    btnRoleGestionnaire.addEventListener('click', () => setMementoRole('gestionnaire'));
  }
  
  if (btnRoleAgent) {
    btnRoleAgent.addEventListener('click', () => setMementoRole('agent'));
  }

  // Initial calculation
  handleProfileChange();
});
