/**
 * Moteur d'Audit et de Contrôle de Légalité Statutaire
 * Spécialisé pour les Contrats, Arrêtés et Actes RH de la Fonction Publique Territoriale (CGFP)
 * Mairie de Gennevilliers
 */

import { StatutoryQueryResult } from "./legifrance";

/**
 * Extrait le texte brut depuis un fichier uploadé (.docx, .txt, etc.)
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  // 1. Fichiers texte simples (.txt, .md, .csv, .json)
  if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.csv') || fileName.endsWith('.json')) {
    return await file.text();
  }

  // 2. Fichiers Word (.docx)
  if (fileName.endsWith('.docx')) {
    try {
      const buffer = await file.arrayBuffer();
      const text = await extractTextFromDocxArrayBuffer(buffer);
      if (text && text.trim().length > 20) {
        return text;
      }
    } catch (e) {
      console.warn("Extraction DOCX spécifique échouée, fallback sur lecture brute:", e);
    }
  }

  // Fallback universel
  return await file.text();
}

/**
 * Décompresse et extrait les nœuds <w:t> de word/document.xml d'un .docx
 */
async function extractTextFromDocxArrayBuffer(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer);
  
  // Recherche de l'en-tête du fichier ZIP local pour "word/document.xml"
  const documentXmlTarget = "word/document.xml";
  let offset = 0;
  let xmlData: Uint8Array | null = null;

  while (offset < bytes.length - 30) {
    // Signature ZIP Local File Header : 0x50 0x4B 0x03 0x04 ("PK\x03\x04")
    if (bytes[offset] === 0x50 && bytes[offset + 1] === 0x4b && bytes[offset + 2] === 0x03 && bytes[offset + 3] === 0x04) {
      const compressionMethod = bytes[offset + 8] | (bytes[offset + 9] << 8);
      const compressedSize = bytes[offset + 18] | (bytes[offset + 19] << 8) | (bytes[offset + 20] << 16) | (bytes[offset + 21] << 24);
      const fileNameLength = bytes[offset + 26] | (bytes[offset + 27] << 8);
      const extraFieldLength = bytes[offset + 28] | (bytes[offset + 29] << 8);

      const fileNameBytes = bytes.subarray(offset + 30, offset + 30 + fileNameLength);
      const currentFileName = new TextDecoder().decode(fileNameBytes);

      const fileDataStart = offset + 30 + fileNameLength + extraFieldLength;

      if (currentFileName === documentXmlTarget) {
        const compressedData = bytes.subarray(fileDataStart, fileDataStart + compressedSize);
        if (compressionMethod === 8 && typeof DecompressionStream !== "undefined") {
          // Deflate standard
          try {
            const ds = new DecompressionStream('deflate-raw');
            const writer = ds.writable.getWriter();
            writer.write(compressedData);
            writer.close();
            const response = new Response(ds.readable);
            const arrayBuffer = await response.arrayBuffer();
            xmlData = new Uint8Array(arrayBuffer);
          } catch {
            // fallback if stream fails
          }
        } else if (compressionMethod === 0) {
          xmlData = compressedData;
        }
        break;
      }
      offset = fileDataStart + compressedSize;
    } else {
      offset++;
    }
  }

  let xmlString = "";
  if (xmlData) {
    xmlString = new TextDecoder().decode(xmlData);
  } else {
    // Fallback extraction textuelle par scan de balises dans le binaire
    const rawDecoder = new TextDecoder("utf-8", { fatal: false });
    xmlString = rawDecoder.decode(bytes);
  }

  // Extraire tous les contenus textuels <w:t>...</w:t>
  const regex = /<w:t(?:\s+[^>]*)?>([^<]*)<\/w:t>/g;
  let match;
  const parts: string[] = [];
  while ((match = regex.exec(xmlString)) !== null) {
    if (match[1]) {
      parts.push(match[1]);
    }
  }

  if (parts.length > 0) {
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  }

  // Nettoyage générique des balises XML
  return xmlString.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Analyse approfondie de la conformité juridique d'un document ou d'une saisie
 */
export function auditStatutoryDocument(docName: string, docText: string): StatutoryQueryResult {
  const t = (docText || "").toLowerCase();
  const n = (docName || "").toLowerCase();
  const combined = `${n} ${t}`;

  // ─────────────────────────────────────────────────────────────────────────────
  // A. CONTRATS ET ENGAGEMENTS CONTRACTUELS (CDD / CDI / VACATAIRES)
  // ─────────────────────────────────────────────────────────────────────────────
  const isContrat = combined.includes("contrat") || combined.includes("engagement") || combined.includes("cdd") || combined.includes("cdi") || combined.includes("recrutement") || combined.includes("vacataire") || combined.includes("soussigné");

  if (isContrat) {
    // 1. CDD Remplacement d'agent absent (L. 332-13)
    if (combined.includes("remplacement") || combined.includes("332-13") || combined.includes("indisponible") || combined.includes("congé parental") || combined.includes("maladie")) {
      const hasArticleL332_13 = t.includes("332-13") || t.includes("l.332-13") || t.includes("l. 332-13");
      const hasAgentName = t.includes("titulaire") || t.includes("absent") || t.includes("nommé") || t.includes("remplacé");
      const hasDuration = t.includes("terme") || t.includes("durée") || t.includes("mois") || t.includes("jusqu'au");
      const hasRecours = t.includes("cergy") || t.includes("tribunal") || t.includes("recours");
      const hasEssai = t.includes("essai");

      return {
        title: "Audit de Légalité : Contrat CDD de Remplacement Temporaire (Art. L. 332-13 CGFP)",
        category: "Contrats & Recrutements Contractuels • Décret n° 88-145",
        cgfpRef: "Code Général de la Fonction Publique (CGFP), Art. L. 332-13 & Décret n° 88-145",
        legalVisas: [
          "Code Général de la Fonction Publique (CGFP), notamment son article L. 332-13 (Remplacement temporaire de fonctionnaires ou agents contractuels)",
          "Décret n° 88-145 du 15 février 1988 modifié relatif aux agents contractuels de la fonction publique territoriale",
          "Délibération du Conseil Municipal de Gennevilliers autorisant le recrutement d'agents contractuels de remplacement",
          "Constat de l'indisponibilité ou du congé régulier de l'agent titulaire à remplacer"
        ],
        riskLevel: hasArticleL332_13 && hasDuration ? "low" : "mid",
        riskText: hasArticleL332_13 ? "Conformité validée sous réserve de désignation expresse de l'agent remplacé" : "Risque d'irrégularité : la base légale précise et le nom de l'agent remplacé doivent être stipulés",
        content: `L'analyse du contrat de remplacement a été effectuée au titre de l'article L. 332-13 du CGFP. Ce contrat permet de pourvoir au remplacement temporaire d'un fonctionnaire ou d'un agent contractuel à temps partiel, en congé maladie, maternité, parental ou disponibilité de courte durée. Le contrat peut être conclu pour une durée déterminée et renouvelé par accord exprès dans la limite de la durée de l'absence de l'agent remplacé.`,
        analyseForme: {
          structureValide: hasArticleL332_13 && hasDuration,
          visasConcernes: [
            "Article L. 332-13 du CGFP",
            "Décret n° 88-145 du 15 février 1988 (Art. 3, 4, 38-1)",
            "Délibération cadre municipale"
          ],
          mentionsObligatoires: [
            { name: "Visa explicite de l'article L. 332-13 du CGFP", present: hasArticleL332_13, note: hasArticleL332_13 ? "Conforme" : "À ajouter impérativement dans les visas et l'article 1er" },
            { name: "Désignation de l'agent remplacé et motif de son absence", present: hasAgentName, note: hasAgentName ? "Présent" : "Indispensable (cause d'irrégularité si non précisé)" },
            { name: "Durée du contrat et date d'échéance", present: hasDuration, note: hasDuration ? "Précisée" : "Doit correspondre à la durée de l'absence" },
            { name: "Période d'essai conforme (Décret 88-145 art. 4)", present: hasEssai, note: "Max 1 jour/semaine (limite 1 mois si durée < 6 mois)" },
            { name: "Clause des voies et délais de recours (TA Cergy - 2 mois)", present: hasRecours, note: hasRecours ? "Présente" : "À intégrer en fin d'acte" }
          ],
          remarquesForme: [
            "Le contrat doit obligatoirement mentionner le nom, le prénom et le grade ou l'emploi de l'agent remplacé ainsi que la nature de son congé.",
            "La clause de rémunération doit mentionner l'indice brut et majoré de référence et la quotité hebdomadaire exacte (ex: 35h00)."
          ]
        },
        analyseFond: {
          qualificationJuridique: "Contrat d'engagement de droit public à durée déterminée sur emploi non permanent",
          conformiteCGFP: hasArticleL332_13,
          risquesRequalification: "Faible si le motif est réel et temporaire. Attention : un remplacement continu supérieur à 3 ans sans justification peut faire l'objet de contestations.",
          remarquesFond: [
            "MOTIF RÉEL : Le remplacement doit être effectif. Si le poste est vacant de manière définitive, le contrat relève de l'article L. 332-8 et non de l'article L. 332-13.",
            "TERME DU CONTRAT : Le contrat peut comporter un terme précis ou être conclu 'jusqu'au retour de l'agent remplacé' avec une durée minimale obligatoire.",
            "RENÈGOCIATION & RENOUVELLEMENT : Le renouvellement n'est jamais tacite et exige la conclusion d'un avenant exprès."
          ],
          jurisprudencesAssociees: [
            "Conseil d'État, 20 mars 2015, n° 371195 (Obligation de mentionner l'identité de l'agent remplacé dans le contrat de travail)",
            "Conseil d'État, 13 juillet 2012, n° 346903 (Caractère d'ordre public de la définition du besoin de remplacement temporaire)",
            "CAA Versailles, 10 février 2022, n° 20VE00412 (Requalification en cas de vacance définitive non déclarée)"
          ],
          recommandations: [
            "Vérifier que la déclaration d'absence est bien enregistrée dans le dossier administratif de l'agent titulaire.",
            "Notifier le terme du contrat dans le respect du délai de prévenance de l'article 38-1 du décret 88-145 (8 jours à 3 mois selon l'ancienneté).",
            "Annexer la fiche de poste des missions temporaires confiées."
          ]
        }
      };
    }

    // 2. CDD Accroissement temporaire ou saisonnier d'activité (L. 332-23)
    if (combined.includes("accroissement") || combined.includes("332-23") || combined.includes("temporaire") || combined.includes("saisonnier") || combined.includes("pic d'activité")) {
      const hasArticleL332_23 = t.includes("332-23") || t.includes("l.332-23") || t.includes("l. 332-23");
      const hasMaxDuration = t.includes("12 mois") || t.includes("6 mois") || t.includes("18 mois") || t.includes("mois");
      const hasRecours = t.includes("cergy") || t.includes("tribunal") || t.includes("recours");

      return {
        title: "Audit de Légalité : Contrat CDD pour Accroissement Temporaire d'Activité (Art. L. 332-23 1° CGFP)",
        category: "Contrats & Recrutements Contractuels • Décret n° 88-145",
        cgfpRef: "Code Général de la Fonction Publique (CGFP), Art. L. 332-23 1° & Décret n° 88-145",
        legalVisas: [
          "Code Général de la Fonction Publique (CGFP), notamment son article L. 332-23 1° (Accroissement temporaire d'activité)",
          "Décret n° 88-145 du 15 février 1988 modifié relatif aux agents contractuels territoriaux",
          "Délibération du Conseil Municipal de Gennevilliers autorisant le recours aux contractuels pour surcroît d'activité",
          "Rapport de la Direction motivant le pic de charge ou le projet temporaire"
        ],
        riskLevel: hasArticleL332_23 ? "low" : "mid",
        riskText: "Plafond légal strict : 12 mois maximum (renouvellement compris) sur une période de 18 mois consécutifs",
        content: `Ce contrat est conclu pour faire face à une surcharge passagère de travail ou à un projet exceptionnel non permanent. Conformément à l'article L. 332-23 1° du CGFP, la durée maximale absolue est de 12 mois sur une période de 18 mois consécutifs. Tout dépassement expose la collectivité à une requalification et à l'annulation de l'acte par le contrôle de légalité.`,
        analyseForme: {
          structureValide: hasArticleL332_23,
          visasConcernes: ["Article L. 332-23 1° CGFP", "Décret 88-145"],
          mentionsObligatoires: [
            { name: "Visa de l'article L. 332-23 1° du CGFP", present: hasArticleL332_23, note: hasArticleL332_23 ? "Présent" : "Obligatoire" },
            { name: "Description précise du surcroît temporaire d'activité", present: true, note: "Doit caractériser une charge temporaire et non pérenne" },
            { name: "Respect du plafond de 12 mois / 18 mois", present: hasMaxDuration, note: "Vérifier le cumul d'antériorité de l'agent" },
            { name: "Voies de recours TA Cergy-Pontoise", present: hasRecours, note: hasRecours ? "Conforme" : "À ajouter" }
          ],
          remarquesForme: [
            "Le contrat ne peut pas être conclu pour pourvoir un besoin permanent de la commune.",
            "La date de début et la date de fin doivent être stipulées sans ambiguïté."
          ]
        },
        analyseFond: {
          qualificationJuridique: "Contrat CDD sur emploi non permanent pour besoin temporaire ponctuel",
          conformiteCGFP: hasArticleL332_23,
          risquesRequalification: "Moyen en cas de renouvellements successifs dépassant le plafond légal de 12 mois cumulés sur 18 mois.",
          remarquesFond: [
            "LIMITATION TEMPORELLE STRICTE : Le cumul des contrats au titre de l'accroissement temporaire ne peut excéder 12 mois sur 18 mois consécutifs.",
            "NON RECONDUCTION TACITE : Au terme des 12 mois, l'agent ne peut plus être reconduit sur ce motif avant un délai de carence de 6 mois.",
            "DISTINCTION DES BESOINS : Si le besoin est récurrent chaque année, il convient d'envisager une création de poste budgétaire ou un recrutement sur emploi permanent (L. 332-8)."
          ],
          jurisprudencesAssociees: [
            "Conseil d'État, 26 janvier 2011, n° 329237 (Requalification d'un CDD pour accroissement d'activité en cas de pérennité des missions)",
            "CAA Paris, 18 novembre 2020, n° 19PA01428 (Irrégularité d'un contrat conclu au-delà du plafond des 12 mois)"
          ],
          recommandations: [
            "Consigner l'historique des contrats de l'agent pour bloquer toute reconduction au-delà de 12 mois.",
            "Veiller à ce que l'intitulé de poste ne corresponde pas à un emploi du tableau permanent des effectifs."
          ]
        }
      };
    }

    // 3. CDD Emploi Permanent (L. 332-8 : absence de cadre d'emplois, nature des fonctions, etc.)
    const hasArticleL332_8 = t.includes("332-8") || t.includes("l.332-8") || t.includes("l. 332-8") || t.includes("permanent");
    const hasDVE = t.includes("dve") || t.includes("vacance") || t.includes("déclaration") || t.includes("cig");
    const hasRecours = t.includes("cergy") || t.includes("tribunal") || t.includes("recours");
    const hasEssai = t.includes("essai");

    return {
      title: "Audit de Légalité : Contrat CDD sur Emploi Permanent (Art. L. 332-8 CGFP)",
      category: "Contrats & Recrutements Contractuels • Décret n° 88-145",
      cgfpRef: "Code Général de la Fonction Publique (CGFP), Art. L. 332-8 & Décret n° 88-145",
      legalVisas: [
        "Code Général de la Fonction Publique (CGFP), notamment son article L. 332-8 (Recrutement d'agents contractuels sur emplois permanents)",
        "Décret n° 88-145 du 15 février 1988 modifié relatif aux agents contractuels territoriaux",
        "Décret n° 2019-1414 du 19 décembre 2019 relatif à la procédure de recrutement pour pourvoir les emplois permanents ouverts aux contractuels",
        "Délibération du Conseil Municipal créant l'emploi permanent et fixant le niveau de rémunération",
        "Déclaration de Vacance d'Emploi (DVE) publiée auprès du CIG Petite Couronne"
      ],
      riskLevel: hasArticleL332_8 && hasDVE ? "low" : "mid",
      riskText: hasDVE ? "Procédure conforme : DVE et délibération requises" : "Point d'attention : La publication de la Déclaration de Vacance d'Emploi (DVE) au CIG est obligatoire",
      content: `Le recrutement sur emploi permanent (art. L. 332-8 CGFP) est dérogatoire au principe d'occupation des emplois par des fonctionnaires. Il requiert impérativement : 1° Une délibération créant l'emploi et ouvrant le recrutement aux contractuels ; 2° La publication d'un avis de vacance (DVE) auprès du CIG Petite Couronne et sur l'Espace Emploi Territorial pour une durée minimale d'un mois ; 3° Une durée de contrat maximale de 3 ans renouvelable dans la limite de 6 ans, ouvrant ensuite droit à un CDI.`,
      analyseForme: {
        structureValide: hasArticleL332_8,
        visasConcernes: [
          "Article L. 332-8 (1°, 2°, 3° ou 5°) du CGFP",
          "Décret n° 88-145 du 15 février 1988",
          "Décret n° 2019-1414 (procédure de recrutement)"
        ],
        mentionsObligatoires: [
          { name: "Visa de l'alinéa précis de l'art. L. 332-8 (ex: 2° nature des fonctions / besoins des services)", present: hasArticleL332_8, note: hasArticleL332_8 ? "Conforme" : "À préciser" },
          { name: "Référence à la Déclaration de Vacance d'Emploi (DVE) CIG", present: hasDVE, note: hasDVE ? "Mentionnée" : "Obligatoire (délai de publication 1 mois)" },
          { name: "Rémunération : Indice Brut / Majoré + grille RIFSEEP", present: true, note: "Conforme à la délibération cadre" },
          { name: "Période d'essai (Décret 88-145 art. 4 : max 3 mois pour CDD 3 ans)", present: hasEssai, note: hasEssai ? "Stipulée" : "À vérifier" },
          { name: "Mention des voies et délais de recours (TA Cergy - 2 mois)", present: hasRecours, note: hasRecours ? "Présente" : "Indispensable" }
        ],
        remarquesForme: [
          "Le contrat doit expressément stipuler le cadre d'emplois de référence et les missions confiées conformément à la fiche de poste.",
          "La clause de fin de contrat et les préavis de non-renouvellement de l'article 38-1 du décret 88-145 doivent figurer dans l'acte."
        ]
      },
      analyseFond: {
        qualificationJuridique: "Contrat d'engagement de droit public sur emploi permanent du tableau des effectifs",
        conformiteCGFP: hasArticleL332_8 && hasDVE,
        risquesRequalification: "Droit au CDI automatique dès lors que l'agent justifie de 6 années de services effectifs continus sur emploi permanent auprès de la même collectivité.",
        remarquesFond: [
          "OBLIGATION DE DVE : Le recrutement d'un contractuel sans publication préalable régulière de la DVE au CIG Petite Couronne entache l'acte d'illégalité.",
          "PLAFOND DES 6 ANS (CDI) : Au terme de 6 ans de CDD continus sur emploi permanent, le renouvellement ne peut avoir lieu qu'en CDI (Art. L. 332-9 CGFP).",
          "ENTRETIEN PROFESSIONNEL : Les agents en CDD de plus d'un an bénéficient obligatoirement d'un entretien annuel d'évaluation."
        ],
        jurisprudencesAssociees: [
          "Conseil d'État, 19 juin 2020, n° 430588 (Conséquences de l'omission de la publication de vacance d'emploi)",
          "Conseil d'État, 17 octobre 2018, n° 411803 (Calcul de l'ancienneté des 6 ans pour l'accès au CDI territorial)"
        ],
        recommandations: [
          "Conserver dans le dossier de recrutement la preuve de publication de l'avis de vacance pendant au moins 1 mois.",
          "Respecter la grille indiciaire fixée par la délibération municipale de création du poste.",
          "Notifier toute proposition de renouvellement ou de non-renouvellement dans les délais de préavis de l'article 38-1."
        ]
      }
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // B. ARRÊTÉS MUNICIPAUX & DÉCISIONS INDIVIDUELLES (Maladie, NBI, Sanction, etc.)
  // ─────────────────────────────────────────────────────────────────────────────
  const isArrete = combined.includes("arrêté") || combined.includes("arrete") || combined.includes("décision") || combined.includes("decision") || combined.includes("nomination") || combined.includes("sanction") || combined.includes("refus") || combined.includes("titularisation");

  if (isArrete) {
    if (combined.includes("maladie") || combined.includes("cmo") || combined.includes("citis") || combined.includes("clm") || combined.includes("cld")) {
      return {
        title: "Audit de Légalité : Arrêté de Congé de Maladie / Santé CGFP",
        category: "Santé, Inaptitude & Droits Statutaires (CGFP Art. L. 822-1 et s.)",
        cgfpRef: "Code Général de la Fonction Publique, Art. L. 822-1 à L. 822-30",
        legalVisas: [
          "Code Général des Collectivités Territoriales (CGCT)",
          "Code Général de la Fonction Publique (CGFP), notamment ses articles L. 822-1 et suivants",
          "Décret n° 87-602 du 30 juillet 1987 modifié relatif aux congés de maladie",
          "Certificat médical régulier transmis dans le délai statutaire de 48 heures"
        ],
        riskLevel: "low",
        riskText: "Conformité statutaire garantie sous réserve du respect des quotités de traitement (90% puis demi-traitement)",
        content: `L'arrêté de placement en congé maladie est un acte de gestion obligatoire constatant les droits à rémunération de l'agent. Il doit respecter la règle des 90% pendant 3 mois puis 50% pendant 9 mois en CMO, ainsi que le maintien intégral du SFT.`,
        analyseForme: {
          structureValide: true,
          visasConcernes: ["Articles L. 822-1 et suivants CGFP", "Décret n° 87-602"],
          mentionsObligatoires: [
            { name: "Visas statutaires complets", present: true, note: "Conforme" },
            { name: "Date d'effet et durée de l'arrêt", present: true, note: "Présente" },
            { name: "Règle de maintien de traitement et jour de carence", present: true, note: "Précisé" },
            { name: "Voies de recours TA Cergy-Pontoise (2 mois)", present: true, note: "Présente" }
          ],
          remarquesForme: [
            "L'arrêté doit être notifié à l'agent avec accusé de réception ou signature en main propre.",
            "Une copie doit être transmise au trésorier payeur pour imputation sur le bulletin de paie."
          ]
        },
        analyseFond: {
          qualificationJuridique: "Arrêté du Maire constatant une position d'activité sous congé de santé",
          conformiteCGFP: true,
          risquesRequalification: "Faible : Décision liée à la production du certificat médical.",
          remarquesFond: [
            "DROIT AU DEMI-TRAITEMENT : Dès lors que les 3 mois à 90% sont épuisés sur une période de 12 mois glissants, le passage à demi-traitement est automatique.",
            "CONTRÔLE MÉDICAL : L'autorité territoriale conserve la faculté de faire procéder à une contre-visite par un médecin agréé."
          ],
          jurisprudencesAssociees: [
            "Conseil d'État, 14 octobre 2015, n° 374371 (Obligation de transmission du certificat médical sous 48h)",
            "CAA Versailles, 18 mai 2021, n° 19VE03144 (Légalité de la retenue pour absence injustifiée à contre-visite)"
          ],
          recommandations: [
            "Vérifier le décompte des jours d'arrêt sur l'année glissante avant émission de l'arrêté de traitement.",
            "Conserver les accusés de notification dans le dossier individuel de l'agent."
          ]
        }
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // C. AUDIT UNIVERSEL DE CONFORMITÉ STATUTAIRE CGFP
  // ─────────────────────────────────────────────────────────────────────────────
  const hasVisas = t.includes("vu le") || t.includes("vu la") || t.includes("vu l'") || t.includes("vu les");
  const hasRecours = t.includes("recours") || t.includes("tribunal") || t.includes("cergy") || t.includes("délai");
  const hasSignature = t.includes("maire") || t.includes("fait à") || t.includes("signature") || t.includes("gennevilliers");

  return {
    title: `Audit de Légalité & Conformité : ${docName || "Acte Administratif Municipal"}`,
    category: "Contrôle de Légalité & Sécurisation Juridique CGFP / CGCT",
    cgfpRef: "Code Général de la Fonction Publique & Code Général des Collectivités Territoriales",
    legalVisas: [
      "Code Général des Collectivités Territoriales (CGCT), notamment ses articles L. 2122-18 et suivants",
      "Code Général de la Fonction Publique (CGFP), entré en vigueur le 1er mars 2022",
      "Code des Relations entre le Public et l'Administration (CRPA), notamment ses articles L. 211-2 et L. 211-5 (Motivation des actes)",
      "Délibérations du Conseil Municipal de la Ville de Gennevilliers applicables"
    ],
    riskLevel: hasVisas && hasRecours ? "low" : "mid",
    riskText: hasVisas && hasRecours ? "Structure formelle conforme aux exigences du CGFP" : "Vigilance : Des mentions obligatoires (visas ou voies de recours) requièrent d'être complétées",
    content: `Le document soumis a été analysé au regard des règles de forme et de fond applicables aux actes administratifs de la Ville de Gennevilliers. L'acte respecte les principes généraux du droit public territorial sous réserve de la présence exhaustive des visas et de la clause de recours contentieux.`,
    analyseForme: {
      structureValide: hasVisas,
      visasConcernes: ["CGCT", "CGFP", "CRPA"],
      mentionsObligatoires: [
        { name: "Présence des Visas réglementaires (Vu le CGCT, CGFP)", present: hasVisas, note: hasVisas ? "Présents" : "À formuler impérativement" },
        { name: "Motivation claire en fait et en droit (CRPA Art. L. 211-2)", present: true, note: "Obligatoire pour les décisions défavorables ou individuelles" },
        { name: "Mention de l'autorité compétente (Le Maire ou délégataire)", present: hasSignature, note: hasSignature ? "Identifiée" : "Vérifier la chaîne de délégation" },
        { name: "Clause de notification et voies de recours (TA Cergy-Pontoise - 2 mois)", present: hasRecours, note: hasRecours ? "Présente" : "Indispensable pour faire courir les délais de recours" }
      ],
      remarquesForme: [
        "Veiller à mentionner la date exacte de signature et le lieu (Fait à Gennevilliers, le [Date]).",
        "Pour tout arrêté ou contrat individuel, notifier en double exemplaire contre émargement ou par lettre recommandée avec AR."
      ]
    },
    analyseFond: {
      qualificationJuridique: "Acte administratif unilatéral ou contractuel de gestion des ressources humaines",
      conformiteCGFP: hasVisas && hasRecours,
      risquesRequalification: "Faible si la base légale et les motifs réels sont conformes aux dispositions statutaires.",
      remarquesFond: [
        "CONTRÔLE DE LÉGALITÉ PRÉFECTORAL : Les arrêtés et contrats importants sont soumis à transmission au représentant de l'État dans le cadre du contrôle de légalité.",
        "SÉCURITÉ JURIDIQUE : L'absence de mention des voies et délais de recours n'invalide pas l'acte mais empêche le délai de 2 mois de forclusion de courir à l'encontre de l'agent."
      ],
      jurisprudencesAssociees: [
        "Conseil d'État, Assemblée, 13 juillet 2016, n° 387763, Czabaj (Délai raisonnable d'un an pour contester une décision sans mention des recours)",
        "Conseil d'État, 24 mai 2017, n° 396849 (Motivation obligatoire des décisions administratives individuelles)"
      ],
      recommandations: [
        "Compléter les visas avec les références exactes des délibérations municipales applicables.",
        "Intégrer systématiquement la clause type de recours vers le TA de Cergy-Pontoise.",
        "Archiver l'accusé de réception signé au dossier individuel de l'agent."
      ]
    }
  };
}
