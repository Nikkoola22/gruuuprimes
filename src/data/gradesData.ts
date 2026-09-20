import type { CadreEmploiDefinition } from "../types/career";

// Valeurs réglementaires officielles (Décret n° 2023-519 du 28 juin 2023 portant majoration de la rémunération)
// Valeur annuelle du traitement correspondant à l indice majoré 100 = 5 907,34 €
// Valeur mensuelle d un point d indice = 5 907,34 / 1 200 = 4,922783 € / mois (59,0734 € / an)
export const VALEUR_POINT_INDICE_MENSUEL = 4.92278; 
export const VALEUR_POINT_INDICE_ANNUEL = VALEUR_POINT_INDICE_MENSUEL * 12; // 59,07336 €
export const INDICE_MINIMUM_TRAITEMENT_GARANTI = 366; // Minimum garanti SMIC Fonction Publique (au 01/01/2024)

const CADRES_EMPLOIS_RAW: CadreEmploiDefinition[] = [
  // =========================================================================
  // FILIÈRE ADMINISTRATIVE
  // =========================================================================
  {
    id: "adjoint_administratif",
    nom: "Adjoint administratif territorial",
    filiere: "Administrative",
    categorie: "C",
    decretReference: "Décret n° 2006-1690 du 22 décembre 2006 modifié et Décret n° 2016-596 modifié par décret n° 2021-1818",
    grades: [
      {
        id: "adjoint_adm",
        nom: "Adjoint administratif (C1)",
        filiere: "Administrative",
        categorie: "C",
        descriptionGrade: "Grade d entrée sans concours en catégorie C (Échelle C1). Fonctions d accueil, de secrétariat et d exécution administrative.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 367, indiceMajore: 366, description: "Minimum de traitement garanti dans la fonction publique" },
          { numero: 2, dureeAnnees: 1, indiceBrut: 368, indiceMajore: 367 },
          { numero: 3, dureeAnnees: 1, indiceBrut: 370, indiceMajore: 368 },
          { numero: 4, dureeAnnees: 1, indiceBrut: 371, indiceMajore: 369 },
          { numero: 5, dureeAnnees: 1, indiceBrut: 374, indiceMajore: 370 },
          { numero: 6, dureeAnnees: 1, indiceBrut: 378, indiceMajore: 371 },
          { numero: 7, dureeAnnees: 3, indiceBrut: 381, indiceMajore: 372 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 387, indiceMajore: 373 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 401, indiceMajore: 376 },
          { numero: 10, dureeAnnees: 4, indiceBrut: 419, indiceMajore: 377 },
          { numero: 11, dureeAnnees: 0, indiceBrut: 432, indiceMajore: 387, description: "Sommet C1" }
        ],
        perspectives: [
          {
            gradeCibleId: "adjoint_adm_principal_2cl",
            nomGradeCible: "Adjoint administratif principal de 2e classe (C2)",
            categorieCible: "C",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Taux voté par la collectivité après avis du CST.",
            modaliteReclassement: "Reclassement à échelon d indice équivalent ou immédiatement supérieur avec report d ancienneté.",
            explicationReclassement: "Accès à l échelle C2.",
            conditions: [
              {
                typeVoie: "examen_professionnel",
                descriptionVoie: "Examen professionnel C1 -> C2",
                echelonMinimum: 4,
                ancienneteEchelonAnnees: 0,
                ancienneteGradeAnnees: 3,
                examenProfessionnelRequis: true,
                piecesRequises: ["Attestation de réussite examen C2 délivrée par le CDG", "Évaluations annuelles"],
                actesAdministratifs: ["Tableau annuel d avancement", "Arrêté individuel de nomination"]
              },
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 5,
                ancienneteEchelonAnnees: 0,
                ancienneteGradeAnnees: 5,
                examenProfessionnelRequis: false,
                piecesRequises: ["Au moins 5 ans de services effectifs dans le grade C1", "Dossier professionnel valorisant les acquis"],
                actesAdministratifs: ["Inscription tableau d avancement selon critères LDG", "Arrêté individuel"]
              }
            ]
          },
          {
            gradeCibleId: "redacteur_classe_normale",
            nomGradeCible: "Rédacteur territorial (Catégorie B)",
            categorieCible: "B",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Quotas promotion interne C vers B gérés par le CDG.",
            modaliteReclassement: "Reclassement en B1 avec garantie indiciaire.",
            explicationReclassement: "Changement de catégorie C vers B (responsabilités de coordination et d encadrement).",
            conditions: [
              {
                typeVoie: "examen_professionnel",
                descriptionVoie: "Promotion interne C vers B par Examen Professionnel",
                echelonMinimum: 4,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 7,
                examenProfessionnelRequis: true,
                piecesRequises: ["Examen pro Rédacteur", "7 ans de services publics dont au moins 4 ans en C"],
                actesAdministratifs: ["Liste aptitude CDG", "Arrêté de nomination stagiaire B"]
              }
            ]
          }
        ]
      },
      {
        id: "adjoint_adm_principal_2cl",
        nom: "Adjoint administratif principal de 2e classe (C2)",
        filiere: "Administrative",
        categorie: "C",
        descriptionGrade: "Deuxième grade de catégorie C (Échelle C2). Accès par concours ou avancement de grade.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 368, indiceMajore: 367 },
          { numero: 2, dureeAnnees: 1, indiceBrut: 371, indiceMajore: 369 },
          { numero: 3, dureeAnnees: 1, indiceBrut: 376, indiceMajore: 370 },
          { numero: 4, dureeAnnees: 1, indiceBrut: 387, indiceMajore: 373 },
          { numero: 5, dureeAnnees: 1, indiceBrut: 396, indiceMajore: 374 },
          { numero: 6, dureeAnnees: 1, indiceBrut: 404, indiceMajore: 376, description: "Accès promouvabilité C3" },
          { numero: 7, dureeAnnees: 2, indiceBrut: 416, indiceMajore: 377 },
          { numero: 8, dureeAnnees: 2, indiceBrut: 430, indiceMajore: 385 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 446, indiceMajore: 397 },
          { numero: 10, dureeAnnees: 3, indiceBrut: 461, indiceMajore: 409 },
          { numero: 11, dureeAnnees: 4, indiceBrut: 473, indiceMajore: 417 },
          { numero: 12, dureeAnnees: 0, indiceBrut: 486, indiceMajore: 425, description: "Sommet C2" }
        ],
        perspectives: [
          {
            gradeCibleId: "adjoint_adm_principal_1cl",
            nomGradeCible: "Adjoint administratif principal de 1re classe (C3)",
            categorieCible: "C",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Taux d avancement fixé par l assemblée délibérante.",
            modaliteReclassement: "Reclassement en échelle C3 à indice égal ou immédiatement supérieur.",
            explicationReclassement: "Grade sommital de catégorie C.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 6,
                ancienneteEchelonAnnees: 1,
                ancienneteGradeAnnees: 5,
                examenProfessionnelRequis: false,
                piecesRequises: ["Justificatif de 5 ans de services effectifs en C2", "Dossier d entretien annuel"],
                actesAdministratifs: ["Inscription au tableau d avancement", "Arrêté individuel"]
              }
            ]
          },
          {
            gradeCibleId: "redacteur_classe_normale",
            nomGradeCible: "Rédacteur territorial (Catégorie B)",
            categorieCible: "B",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Listes d aptitude du CDG.",
            modaliteReclassement: "Reclassement indiciaire en B avec clause de sauvegarde.",
            explicationReclassement: "Passage en catégorie B administrative.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Promotion interne B au choix",
                echelonMinimum: 5,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 8,
                examenProfessionnelRequis: false,
                piecesRequises: ["8 ans de services publics", "Rapport hiérarchique valorisant"],
                actesAdministratifs: ["Liste aptitude CDG", "Arrêté individuel"]
              }
            ]
          }
        ]
      },
      {
        id: "adjoint_adm_principal_1cl",
        nom: "Adjoint administratif principal de 1re classe (C3)",
        filiere: "Administrative",
        categorie: "C",
        descriptionGrade: "Grade sommital de la catégorie C administrative (Échelle C3). Coordination d équipe et gestion de dossiers administratifs complexes.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 388, indiceMajore: 373 },
          { numero: 2, dureeAnnees: 1, indiceBrut: 397, indiceMajore: 375 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 412, indiceMajore: 376 },
          { numero: 4, dureeAnnees: 2, indiceBrut: 430, indiceMajore: 385 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 448, indiceMajore: 398 },
          { numero: 6, dureeAnnees: 2, indiceBrut: 460, indiceMajore: 408 },
          { numero: 7, dureeAnnees: 3, indiceBrut: 478, indiceMajore: 420 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 499, indiceMajore: 435 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 525, indiceMajore: 455 },
          { numero: 10, dureeAnnees: 0, indiceBrut: 558, indiceMajore: 478, description: "Sommet C3 (IM 478)" }
        ],
        perspectives: [
          {
            gradeCibleId: "redacteur_classe_normale",
            nomGradeCible: "Rédacteur territorial (Catégorie B)",
            categorieCible: "B",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Listes d aptitude établies par le CDG.",
            modaliteReclassement: "Reclassement en B avec garantie du traitement.",
            explicationReclassement: "Évolution de carrière vers la catégorie B.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Promotion interne B au choix",
                echelonMinimum: 4,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 8,
                examenProfessionnelRequis: false,
                piecesRequises: ["8 ans de services publics", "Dossier EPA", "Attestations CNFPT"],
                actesAdministratifs: ["Liste aptitude CDG", "Arrêté individuel"]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "redacteur_territorial",
    nom: "Rédacteur territorial",
    filiere: "Administrative",
    categorie: "B",
    decretReference: "Décrets n° 2012-924, n° 2010-329, n° 2022-1200 et n° 2022-1201 (revalorisation B)",
    grades: [
      {
        id: "redacteur_classe_normale",
        nom: "Rédacteur (Classe normale - B1)",
        filiere: "Administrative",
        categorie: "B",
        descriptionGrade: "Premier grade du cadre d emplois des rédacteurs (Catégorie B - NES B1). Fonctions de gestion administrative, budgétaire, juridique et d encadrement de proximité.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 389, indiceMajore: 373, description: "Stage probatoire avant titularisation" },
          { numero: 2, dureeAnnees: 1, indiceBrut: 395, indiceMajore: 374 },
          { numero: 3, dureeAnnees: 1, indiceBrut: 397, indiceMajore: 375 },
          { numero: 4, dureeAnnees: 1, indiceBrut: 401, indiceMajore: 376 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 415, indiceMajore: 377 },
          { numero: 6, dureeAnnees: 2, indiceBrut: 431, indiceMajore: 386, description: "Accès examen pro Rédacteur Principal 2e cl." },
          { numero: 7, dureeAnnees: 2, indiceBrut: 452, indiceMajore: 401 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 478, indiceMajore: 420, description: "Accès au choix Rédacteur Principal 2e cl. après 1 an" },
          { numero: 9, dureeAnnees: 3, indiceBrut: 500, indiceMajore: 436 },
          { numero: 10, dureeAnnees: 3, indiceBrut: 513, indiceMajore: 446 },
          { numero: 11, dureeAnnees: 3, indiceBrut: 538, indiceMajore: 462 },
          { numero: 12, dureeAnnees: 4, indiceBrut: 563, indiceMajore: 482 },
          { numero: 13, dureeAnnees: 0, indiceBrut: 597, indiceMajore: 508, description: "Sommet de la classe normale B1" }
        ],
        perspectives: [
          {
            gradeCibleId: "redacteur_principal_2cl",
            nomGradeCible: "Rédacteur principal de 2e classe (B2)",
            categorieCible: "B",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Taux fixé par délibération de la collectivité après avis du CST. Souvent compris entre 30% et 60% des agents promouvables.",
            modaliteReclassement: "Reclassement à l échelon comportant un indice égal ou immédiatement supérieur avec conservation d ancienneté si le gain indiciaire est inférieur à un avancement d échelon.",
            explicationReclassement: "Par exemple, un agent au 8e échelon (IM 420) est reclassé au 6e échelon de 2e classe (IM 421) avec conservation de son ancienneté acquise.",
            conditions: [
              {
                typeVoie: "examen_professionnel",
                descriptionVoie: "Examen professionnel",
                echelonMinimum: 6,
                ancienneteEchelonAnnees: 0,
                ancienneteCadreAnnees: 3,
                examenProfessionnelRequis: true,
                piecesRequises: [
                  "Attestation de réussite à l examen professionnel organisée par le Centre de Gestion (CDG)",
                  "Rapports d entretien professionnel annuel (EPA)",
                  "Attestation de suivi des formations d intégration et de professionnalisation obligatoire (CNFPT)"
                ],
                actesAdministratifs: [
                  "Consultation des Lignes Directrices de Gestion (LDG)",
                  "Arrêté portant tableau annuel d avancement signé par l autorité territoriale",
                  "Arrêté individuel de nomination et reclassement indiciaire"
                ]
              },
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 8,
                ancienneteEchelonAnnees: 1,
                ancienneteCadreAnnees: 5,
                examenProfessionnelRequis: false,
                piecesRequises: [
                  "Justificatif d 1 an au moins dans le 8e échelon et 5 ans de services effectifs accomplis en catégorie B",
                  "Comptes-rendus d entretien professionnel",
                  "Dossier professionnel valorisant les acquis de l expérience"
                ],
                actesAdministratifs: [
                  "Inscription au tableau annuel selon les critères LDG",
                  "Application du ratio promus/promouvables",
                  "Arrêté individuel de nomination au grade supérieur"
                ]
              }
            ]
          },
          {
            gradeCibleId: "attache_grade_normal",
            nomGradeCible: "Attaché territorial (Catégorie A)",
            categorieCible: "A",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Quotas départementaux stricts de promotion interne : 1 nomination pour 3 recrutements externes au niveau du CDG.",
            modaliteReclassement: "Reclassement en catégorie A avec conservation du traitement indiciaire (clause de sauvegarde indiciaire).",
            explicationReclassement: "Passage du cadre de catégorie B vers la catégorie A (fonctions de direction, stratégie et encadrement supérieur).",
            conditions: [
              {
                typeVoie: "examen_professionnel",
                descriptionVoie: "Promotion interne B -> A par Examen Professionnel",
                echelonMinimum: 6,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 8,
                examenProfessionnelRequis: true,
                piecesRequises: [
                  "Lauréat de l examen professionnel Attaché du CDG",
                  "Au moins 8 ans de services publics dont 4 ans en catégorie B"
                ],
                actesAdministratifs: ["Inscription sur liste d aptitude CDG", "Arrêté individuel de nomination stagiaire A"]
              }
            ]
          }
        ]
      },
      {
        id: "redacteur_principal_2cl",
        nom: "Rédacteur principal de 2e classe (B2)",
        filiere: "Administrative",
        categorie: "B",
        descriptionGrade: "Deuxième grade du cadre d emplois des rédacteurs (NES B2). Responsabilités d encadrement de secteur ou d expertise renforcée.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 401, indiceMajore: 376 },
          { numero: 2, dureeAnnees: 1, indiceBrut: 415, indiceMajore: 377 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 429, indiceMajore: 384 },
          { numero: 4, dureeAnnees: 2, indiceBrut: 444, indiceMajore: 395 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 458, indiceMajore: 406 },
          { numero: 6, dureeAnnees: 2, indiceBrut: 480, indiceMajore: 421, description: "Accès examen pro Rédacteur Principal 1re cl. après 1 an" },
          { numero: 7, dureeAnnees: 3, indiceBrut: 506, indiceMajore: 441, description: "Accès au choix Rédacteur Principal 1re cl. après 1 an" },
          { numero: 8, dureeAnnees: 3, indiceBrut: 528, indiceMajore: 457 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 542, indiceMajore: 466 },
          { numero: 10, dureeAnnees: 3, indiceBrut: 567, indiceMajore: 485 },
          { numero: 11, dureeAnnees: 4, indiceBrut: 599, indiceMajore: 509 },
          { numero: 12, dureeAnnees: 0, indiceBrut: 638, indiceMajore: 539, description: "Sommet B2" }
        ],
        perspectives: [
          {
            gradeCibleId: "redacteur_principal_1cl",
            nomGradeCible: "Rédacteur principal de 1re classe (B3)",
            categorieCible: "B",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Taux fixé par l assemblée délibérante.",
            modaliteReclassement: "Reclassement à indice égal ou immédiatement supérieur.",
            explicationReclassement: "Accès au grade sommital de catégorie B.",
            conditions: [
              {
                typeVoie: "examen_professionnel",
                descriptionVoie: "Examen professionnel 1re classe",
                echelonMinimum: 6,
                ancienneteEchelonAnnees: 1,
                ancienneteGradeAnnees: 3,
                examenProfessionnelRequis: true,
                piecesRequises: ["Certificat de réussite examen pro CDG", "Entretiens pro", "Attestation formation"],
                actesAdministratifs: ["Tableau annuel d avancement", "Arrêté individuel"]
              },
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 7,
                ancienneteEchelonAnnees: 1,
                ancienneteGradeAnnees: 5,
                examenProfessionnelRequis: false,
                piecesRequises: ["1 an au 7e échelon et 5 ans de services effectifs accomplis en B", "Évaluations annuelles"],
                actesAdministratifs: ["Inscription tableau d avancement", "Arrêté individuel"]
              }
            ]
          },
          {
            gradeCibleId: "attache_grade_normal",
            nomGradeCible: "Attaché territorial (Catégorie A)",
            categorieCible: "A",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Promotion interne sur liste d aptitude CDG.",
            modaliteReclassement: "Reclassement en A avec garantie de traitement.",
            explicationReclassement: "Passage vers l encadrement supérieur.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Promotion interne B -> A au choix",
                echelonMinimum: 6,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 10,
                examenProfessionnelRequis: false,
                piecesRequises: ["Au moins 10 ans de services effectifs dont 5 ans en catégorie B", "Dossier professionnel"],
                actesAdministratifs: ["Inscription liste aptitude CDG", "Arrêté individuel"]
              }
            ]
          }
        ]
      },
      {
        id: "redacteur_principal_1cl",
        nom: "Rédacteur principal de 1re classe (B3)",
        filiere: "Administrative",
        categorie: "B",
        descriptionGrade: "Grade sommital de la catégorie B administrative (NES B3). Encadrement supérieur de service et expertise complexe.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 446, indiceMajore: 397 },
          { numero: 2, dureeAnnees: 2, indiceBrut: 461, indiceMajore: 409 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 484, indiceMajore: 424 },
          { numero: 4, dureeAnnees: 2, indiceBrut: 513, indiceMajore: 446 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 547, indiceMajore: 470 },
          { numero: 6, dureeAnnees: 3, indiceBrut: 573, indiceMajore: 489 },
          { numero: 7, dureeAnnees: 3, indiceBrut: 604, indiceMajore: 513 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 638, indiceMajore: 539 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 660, indiceMajore: 556 },
          { numero: 10, dureeAnnees: 3, indiceBrut: 684, indiceMajore: 574 },
          { numero: 11, dureeAnnees: 0, indiceBrut: 707, indiceMajore: 592, description: "Sommet Catégorie B (IM 592)" }
        ],
        perspectives: [
          {
            gradeCibleId: "attache_grade_normal",
            nomGradeCible: "Attaché territorial (Catégorie A)",
            categorieCible: "A",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Promotion interne sur liste d aptitude CDG.",
            modaliteReclassement: "Reclassement avec reprise d indice en catégorie A.",
            explicationReclassement: "Passage vers l encadrement supérieur en catégorie A.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Promotion interne au choix vers Attaché (Catégorie A)",
                echelonMinimum: 4,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 10,
                examenProfessionnelRequis: false,
                piecesRequises: [
                  "Justificatif de 10 ans de services effectifs dans un corps/cadre d emplois de catégorie B",
                  "Avis circonstancié de l autorité territoriale",
                  "Attestations de formation CNFPT"
                ],
                actesAdministratifs: [
                  "Inscription sur la liste d aptitude établie par le Président du Centre de Gestion",
                  "Arrêté de nomination en qualité d Attaché stagiaire"
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "attache_territorial",
    nom: "Attaché territorial",
    filiere: "Administrative",
    categorie: "A",
    decretReference: "Décret n° 87-1099 du 30 décembre 1987 portant statut particulier du cadre d emplois des attachés et décret n° 2006-1695",
    grades: [
      {
        id: "attache_grade_normal",
        nom: "Attaché territorial",
        filiere: "Administrative",
        categorie: "A",
        descriptionGrade: "Grade d entrée en catégorie A administrative. Fonctions de conception, de direction et de pilotage stratégique.",
        echelons: [
          { numero: 1, dureeAnnees: 1.5, indiceBrut: 444, indiceMajore: 395, description: "Stage probatoire avant titularisation" },
          { numero: 2, dureeAnnees: 2, indiceBrut: 469, indiceMajore: 415 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 499, indiceMajore: 435 },
          { numero: 4, dureeAnnees: 2, indiceBrut: 525, indiceMajore: 455 },
          { numero: 5, dureeAnnees: 2.5, indiceBrut: 567, indiceMajore: 485, description: "Accès examen pro Attaché Principal" },
          { numero: 6, dureeAnnees: 3, indiceBrut: 611, indiceMajore: 518 },
          { numero: 7, dureeAnnees: 3, indiceBrut: 653, indiceMajore: 550, description: "Accès au choix Attaché Principal" },
          { numero: 8, dureeAnnees: 3, indiceBrut: 693, indiceMajore: 580 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 732, indiceMajore: 610 },
          { numero: 10, dureeAnnees: 4, indiceBrut: 778, indiceMajore: 645 },
          { numero: 11, dureeAnnees: 0, indiceBrut: 821, indiceMajore: 678, description: "Sommet grade Attaché (IM 678)" }
        ],
        perspectives: [
          {
            gradeCibleId: "attache_principal",
            nomGradeCible: "Attaché principal",
            categorieCible: "A",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Taux fixé par la collectivité.",
            modaliteReclassement: "Reclassement à indice égal ou immédiatement supérieur avec conservation de l ancienneté acquise.",
            explicationReclassement: "Accès aux fonctions de direction de service, chargé de mission stratégique ou sous-direction.",
            conditions: [
              {
                typeVoie: "examen_professionnel",
                descriptionVoie: "Examen professionnel Attaché Principal",
                echelonMinimum: 5,
                ancienneteEchelonAnnees: 0,
                ancienneteCadreAnnees: 3,
                examenProfessionnelRequis: true,
                piecesRequises: [
                  "Réussite à l examen professionnel organisé par le CNFPT / CDG",
                  "Dossier RAEP et comptes-rendus d entretien",
                  "Formations obligatoires validées"
                ],
                actesAdministratifs: [
                  "Tableau d avancement annuel établi par l autorité",
                  "Arrêté de nomination au grade d Attaché Principal"
                ]
              },
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 7,
                ancienneteEchelonAnnees: 0,
                ancienneteCadreAnnees: 7,
                examenProfessionnelRequis: false,
                piecesRequises: [
                  "Avoir atteint au moins le 7e échelon d attaché",
                  "Justifier d au moins 7 ans de services effectifs dans un cadre de catégorie A",
                  "Avis très circonstancié de la Direction Générale"
                ],
                actesAdministratifs: [
                  "Inscription au Tableau d avancement au choix",
                  "Arrêté individuel de l autorité territoriale"
                ]
              }
            ]
          }
        ]
      },
      {
        id: "attache_principal",
        nom: "Attaché principal",
        filiere: "Administrative",
        categorie: "A",
        descriptionGrade: "Deuxième grade du cadre d attachés. Direction de grands services et pilotage opérationnel.",
        echelons: [
          { numero: 1, dureeAnnees: 2, indiceBrut: 593, indiceMajore: 505 },
          { numero: 2, dureeAnnees: 2, indiceBrut: 639, indiceMajore: 540 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 693, indiceMajore: 580 },
          { numero: 4, dureeAnnees: 2, indiceBrut: 732, indiceMajore: 610 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 791, indiceMajore: 655, description: "Accès Attaché hors classe" },
          { numero: 6, dureeAnnees: 2.5, indiceBrut: 843, indiceMajore: 695 },
          { numero: 7, dureeAnnees: 2.5, indiceBrut: 896, indiceMajore: 735 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 946, indiceMajore: 773 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 995, indiceMajore: 811 },
          { numero: 10, dureeAnnees: 0, indiceBrut: 1015, indiceMajore: 826, description: "Sommet Attaché Principal (IM 826)" }
        ],
        perspectives: [
          {
            gradeCibleId: "attache_hors_classe",
            nomGradeCible: "Attaché hors classe",
            categorieCible: "A",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Grade à accès fonctionnel ou à haute responsabilité dans les collectivités de plus de 10 000 habitants.",
            modaliteReclassement: "Reclassement à indice égal ou immédiatement supérieur.",
            explicationReclassement: "Accès au sommet de la filière administrative territoriale.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 5,
                ancienneteEchelonAnnees: 0,
                ancienneteGradeAnnees: 6,
                examenProfessionnelRequis: false,
                piecesRequises: [
                  "Justificatif d occupation de fonctions de direction ou d expertise pendant 6 ans",
                  "Avis du Maire / Président",
                  "Inscription au tableau annuel d avancement"
                ],
                actesAdministratifs: [
                  "Arrêté portant tableau d avancement d attaché hors classe",
                  "Arrêté individuel de nomination"
                ]
              }
            ]
          }
        ]
      },
      {
        id: "attache_hors_classe",
        nom: "Attaché hors classe",
        filiere: "Administrative",
        categorie: "A",
        descriptionGrade: "Grade sommital des attachés territoriaux. Fonctions de direction générale et responsabilités de haut niveau (communes de plus de 10 000 hab).",
        echelons: [
          { numero: 1, dureeAnnees: 2, indiceBrut: 797, indiceMajore: 660 },
          { numero: 2, dureeAnnees: 2, indiceBrut: 850, indiceMajore: 700 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 896, indiceMajore: 735 },
          { numero: 4, dureeAnnees: 2.5, indiceBrut: 946, indiceMajore: 773 },
          { numero: 5, dureeAnnees: 3, indiceBrut: 995, indiceMajore: 811 },
          { numero: 6, dureeAnnees: 0, indiceBrut: 1027, indiceMajore: 835, description: "Sommet Attaché Hors Classe (IM 835)" }
        ],
        perspectives: []
      }
    ]
  },

  // =========================================================================
  // FILIÈRE TECHNIQUE
  // =========================================================================
  {
    id: "adjoint_technique",
    nom: "Adjoint technique territorial",
    filiere: "Technique",
    categorie: "C",
    decretReference: "Décret n° 2006-1691 du 22 décembre 2006 et Décret n° 2016-596 modifié (organisation des carrières de catégorie C)",
    grades: [
      {
        id: "adjoint_technique_c1",
        nom: "Adjoint technique territorial (C1)",
        filiere: "Technique",
        categorie: "C",
        descriptionGrade: "Grade d entrée sans concours en catégorie C (Échelle C1). Travaux d exécution technique, entretien des bâtiments, voirie, espaces verts, propreté et restauration collective.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 367, indiceMajore: 366, description: "Minimum de traitement garanti" },
          { numero: 2, dureeAnnees: 1, indiceBrut: 368, indiceMajore: 367 },
          { numero: 3, dureeAnnees: 1, indiceBrut: 370, indiceMajore: 368 },
          { numero: 4, dureeAnnees: 1, indiceBrut: 371, indiceMajore: 369 },
          { numero: 5, dureeAnnees: 1, indiceBrut: 374, indiceMajore: 370 },
          { numero: 6, dureeAnnees: 1, indiceBrut: 378, indiceMajore: 371 },
          { numero: 7, dureeAnnees: 3, indiceBrut: 381, indiceMajore: 372 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 387, indiceMajore: 373 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 401, indiceMajore: 376 },
          { numero: 10, dureeAnnees: 4, indiceBrut: 419, indiceMajore: 377 },
          { numero: 11, dureeAnnees: 0, indiceBrut: 432, indiceMajore: 387, description: "Sommet de l échelle C1" }
        ],
        perspectives: [
          {
            gradeCibleId: "adjoint_technique_principal_2cl",
            nomGradeCible: "Adjoint technique principal de 2e classe (C2)",
            categorieCible: "C",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Taux d avancement fixé par délibération de la collectivité après avis du CST.",
            modaliteReclassement: "Reclassement à échelon d indice équivalent ou immédiatement supérieur.",
            explicationReclassement: "Accès à l échelle C2 avec déroulement jusqu à l échelon 12.",
            conditions: [
              {
                typeVoie: "examen_professionnel",
                descriptionVoie: "Examen professionnel C1 -> C2",
                echelonMinimum: 4,
                ancienneteEchelonAnnees: 0,
                ancienneteGradeAnnees: 3,
                examenProfessionnelRequis: true,
                piecesRequises: ["Attestation de réussite examen C2 délivrée par le CDG", "Comptes-rendus EPA"],
                actesAdministratifs: ["Inscription tableau annuel d avancement", "Arrêté individuel"]
              },
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 5,
                ancienneteEchelonAnnees: 0,
                ancienneteGradeAnnees: 5,
                examenProfessionnelRequis: false,
                piecesRequises: ["Au moins 5 ans de services effectifs dans le grade C1", "Évaluations professionnelles"],
                actesAdministratifs: ["Inscription tableau annuel d avancement", "Arrêté individuel"]
              }
            ]
          },
          {
            gradeCibleId: "agent_maitrise_grade_initial",
            nomGradeCible: "Agent de maîtrise territorial (Catégorie C+)",
            categorieCible: "C",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Nomination sur liste d aptitude établie par le Centre de Gestion.",
            modaliteReclassement: "Reclassement dans la grille des agents de maîtrise avec prise en compte des fonctions d encadrement.",
            explicationReclassement: "Passage aux fonctions d encadrement d équipes et de chantiers techniques.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Promotion interne vers Agent de Maîtrise",
                echelonMinimum: 4,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 7,
                examenProfessionnelRequis: false,
                piecesRequises: ["Justificatif de 7 ans de services effectifs dans la filière technique", "Rapport hiérarchique"],
                actesAdministratifs: ["Inscription liste aptitude CDG", "Arrêté de nomination stagiaire"]
              }
            ]
          }
        ]
      },
      {
        id: "adjoint_technique_principal_2cl",
        nom: "Adjoint technique principal de 2e classe (C2)",
        filiere: "Technique",
        categorie: "C",
        descriptionGrade: "Deuxième grade de catégorie C (Échelle C2). Missions d exécution qualifiée, conduite d engins, travaux spécialisés ou encadrement de proximité.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 368, indiceMajore: 367 },
          { numero: 2, dureeAnnees: 1, indiceBrut: 371, indiceMajore: 369 },
          { numero: 3, dureeAnnees: 1, indiceBrut: 376, indiceMajore: 370 },
          { numero: 4, dureeAnnees: 1, indiceBrut: 387, indiceMajore: 373 },
          { numero: 5, dureeAnnees: 1, indiceBrut: 396, indiceMajore: 374 },
          { numero: 6, dureeAnnees: 1, indiceBrut: 404, indiceMajore: 376, description: "Accès promouvabilité C3" },
          { numero: 7, dureeAnnees: 2, indiceBrut: 416, indiceMajore: 377 },
          { numero: 8, dureeAnnees: 2, indiceBrut: 430, indiceMajore: 385 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 446, indiceMajore: 397 },
          { numero: 10, dureeAnnees: 3, indiceBrut: 461, indiceMajore: 409 },
          { numero: 11, dureeAnnees: 4, indiceBrut: 473, indiceMajore: 417 },
          { numero: 12, dureeAnnees: 0, indiceBrut: 486, indiceMajore: 425, description: "Sommet échelle C2" }
        ],
        perspectives: [
          {
            gradeCibleId: "adjoint_technique_principal_1cl",
            nomGradeCible: "Adjoint technique principal de 1re classe (C3)",
            categorieCible: "C",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Taux d avancement fixé par la collectivité.",
            modaliteReclassement: "Reclassement à l échelon d indice équivalent dans l échelle C3.",
            explicationReclassement: "Accès au grade sommital ouvrier (Échelle C3 jusqu à l IM 478).",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 6,
                ancienneteEchelonAnnees: 1,
                ancienneteGradeAnnees: 5,
                examenProfessionnelRequis: false,
                piecesRequises: ["Justificatif d 1 an au moins au 6e échelon", "Justificatif de 5 ans en C2", "Comptes-rendus EPA"],
                actesAdministratifs: ["Inscription tableau d avancement", "Arrêté individuel"]
              }
            ]
          },
          {
            gradeCibleId: "agent_maitrise_grade_initial",
            nomGradeCible: "Agent de maîtrise territorial (Catégorie C+)",
            categorieCible: "C",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Promotion interne sur liste d aptitude CDG.",
            modaliteReclassement: "Reclassement avec reprise d indice.",
            explicationReclassement: "Encadrement technique de secteur.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Promotion interne Agent de Maîtrise au choix",
                echelonMinimum: 4,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 7,
                examenProfessionnelRequis: false,
                piecesRequises: ["7 ans de services dans la filière technique", "Avis hiérarchique"],
                actesAdministratifs: ["Liste aptitude CDG", "Arrêté individuel"]
              }
            ]
          }
        ]
      },
      {
        id: "adjoint_technique_principal_1cl",
        nom: "Adjoint technique principal de 1re classe (C3)",
        filiere: "Technique",
        categorie: "C",
        descriptionGrade: "Grade sommital de catégorie C technique (Échelle C3). Encadrement opérationnel d équipe et travaux à haute technicité.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 388, indiceMajore: 373 },
          { numero: 2, dureeAnnees: 1, indiceBrut: 397, indiceMajore: 375 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 412, indiceMajore: 376 },
          { numero: 4, dureeAnnees: 2, indiceBrut: 430, indiceMajore: 385 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 448, indiceMajore: 398 },
          { numero: 6, dureeAnnees: 2, indiceBrut: 460, indiceMajore: 408 },
          { numero: 7, dureeAnnees: 3, indiceBrut: 478, indiceMajore: 420 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 499, indiceMajore: 435 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 525, indiceMajore: 455 },
          { numero: 10, dureeAnnees: 0, indiceBrut: 558, indiceMajore: 478, description: "Sommet C3 (IM 478)" }
        ],
        perspectives: [
          {
            gradeCibleId: "technicien_classe_normale",
            nomGradeCible: "Technicien territorial (Catégorie B)",
            categorieCible: "B",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Quotas CDG pour l accès à la catégorie B.",
            modaliteReclassement: "Reclassement indiciaire en B avec garantie du traitement antérieur.",
            explicationReclassement: "Reclassement de catégorie C vers la catégorie B.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Promotion interne Technicien B au choix",
                echelonMinimum: 4,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 8,
                examenProfessionnelRequis: false,
                piecesRequises: ["8 ans de services publics", "Rapport hiérarchique"],
                actesAdministratifs: ["Liste aptitude CDG", "Arrêté individuel"]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "agent_maitrise",
    nom: "Agent de maîtrise territorial",
    filiere: "Technique",
    categorie: "C",
    decretReference: "Décret n° 88-547 du 6 mai 1988 modifié et Décret n° 2016-596",
    grades: [
      {
        id: "agent_maitrise_grade_initial",
        nom: "Agent de maîtrise",
        filiere: "Technique",
        categorie: "C",
        descriptionGrade: "Grade d encadrement de proximité des agents d exécution technique et de conduite de chantiers.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 372, indiceMajore: 370 },
          { numero: 2, dureeAnnees: 1, indiceBrut: 379, indiceMajore: 371 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 388, indiceMajore: 373 },
          { numero: 4, dureeAnnees: 2, indiceBrut: 397, indiceMajore: 375, description: "Accès examen pro Agent de maîtrise principal" },
          { numero: 5, dureeAnnees: 2, indiceBrut: 415, indiceMajore: 377, description: "Accès au choix Agent de maîtrise principal" },
          { numero: 6, dureeAnnees: 2, indiceBrut: 431, indiceMajore: 386 },
          { numero: 7, dureeAnnees: 2, indiceBrut: 452, indiceMajore: 401 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 478, indiceMajore: 420 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 500, indiceMajore: 436 },
          { numero: 10, dureeAnnees: 0, indiceBrut: 541, indiceMajore: 464, description: "Sommet Agent de maîtrise (IM 464)" }
        ],
        perspectives: [
          {
            gradeCibleId: "agent_maitrise_principal",
            nomGradeCible: "Agent de maîtrise principal",
            categorieCible: "C",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Taux fixé par la collectivité.",
            modaliteReclassement: "Reclassement à échelon d indice équivalent ou immédiatement supérieur.",
            explicationReclassement: "Accès au grade supérieur d agent de maîtrise.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 5,
                ancienneteEchelonAnnees: 0,
                ancienneteGradeAnnees: 6,
                examenProfessionnelRequis: false,
                piecesRequises: ["Justificatif de 6 ans de services en qualité d agent de maîtrise", "Évaluations EPA"],
                actesAdministratifs: ["Tableau annuel d avancement", "Arrêté individuel"]
              }
            ]
          },
          {
            gradeCibleId: "technicien_classe_normale",
            nomGradeCible: "Technicien territorial (Catégorie B)",
            categorieCible: "B",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Promotion interne sur liste d aptitude CDG.",
            modaliteReclassement: "Reclassement en B1 avec garantie indiciaire.",
            explicationReclassement: "Passage en catégorie B technique.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Promotion interne Technicien B au choix",
                echelonMinimum: 4,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 7,
                examenProfessionnelRequis: false,
                piecesRequises: ["7 ans de services publics dont 4 ans en C", "Dossier professionnel"],
                actesAdministratifs: ["Liste aptitude CDG", "Arrêté individuel"]
              }
            ]
          }
        ]
      },
      {
        id: "agent_maitrise_principal",
        nom: "Agent de maîtrise principal",
        filiere: "Technique",
        categorie: "C",
        descriptionGrade: "Grade sommital des agents de maîtrise. Encadrement général d ateliers, de régies ou de chantiers complexes.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 390, indiceMajore: 373 },
          { numero: 2, dureeAnnees: 1.5, indiceBrut: 405, indiceMajore: 376 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 420, indiceMajore: 379 },
          { numero: 4, dureeAnnees: 2, indiceBrut: 440, indiceMajore: 392 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 460, indiceMajore: 408 },
          { numero: 6, dureeAnnees: 2.5, indiceBrut: 485, indiceMajore: 425 },
          { numero: 7, dureeAnnees: 3, indiceBrut: 513, indiceMajore: 446 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 538, indiceMajore: 462 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 563, indiceMajore: 482 },
          { numero: 10, dureeAnnees: 0, indiceBrut: 597, indiceMajore: 508, description: "Sommet Agent de maîtrise principal (IM 508)" }
        ],
        perspectives: [
          {
            gradeCibleId: "technicien_classe_normale",
            nomGradeCible: "Technicien territorial (Catégorie B)",
            categorieCible: "B",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Listes d aptitude établies par le CDG.",
            modaliteReclassement: "Reclassement en B avec garantie du traitement.",
            explicationReclassement: "Passage en catégorie B.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Promotion interne Technicien au choix",
                echelonMinimum: 4,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 8,
                examenProfessionnelRequis: false,
                piecesRequises: ["8 ans de services publics", "Dossier professionnel"],
                actesAdministratifs: ["Liste aptitude CDG", "Arrêté individuel"]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "technicien_territorial",
    nom: "Technicien territorial",
    filiere: "Technique",
    categorie: "B",
    decretReference: "Décrets n° 2010-1357, n° 2010-329, n° 2022-1200 et n° 2022-1201 (revalorisation B)",
    grades: [
      {
        id: "technicien_classe_normale",
        nom: "Technicien (Classe normale - B1)",
        filiere: "Technique",
        categorie: "B",
        descriptionGrade: "Grade d entrée de la filière technique catégorie B (NES B1). Conduite de chantiers, urbanisme, réseaux, bâtiments et informatique.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 389, indiceMajore: 373, description: "Stage probatoire avant titularisation" },
          { numero: 2, dureeAnnees: 1, indiceBrut: 395, indiceMajore: 374 },
          { numero: 3, dureeAnnees: 1, indiceBrut: 397, indiceMajore: 375 },
          { numero: 4, dureeAnnees: 1, indiceBrut: 401, indiceMajore: 376 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 415, indiceMajore: 377 },
          { numero: 6, dureeAnnees: 2, indiceBrut: 431, indiceMajore: 386, description: "Accès examen pro Technicien Principal 2e cl." },
          { numero: 7, dureeAnnees: 2, indiceBrut: 452, indiceMajore: 401 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 478, indiceMajore: 420, description: "Accès au choix Technicien Principal 2e cl. après 1 an" },
          { numero: 9, dureeAnnees: 3, indiceBrut: 500, indiceMajore: 436 },
          { numero: 10, dureeAnnees: 3, indiceBrut: 513, indiceMajore: 446 },
          { numero: 11, dureeAnnees: 3, indiceBrut: 538, indiceMajore: 462 },
          { numero: 12, dureeAnnees: 4, indiceBrut: 563, indiceMajore: 482 },
          { numero: 13, dureeAnnees: 0, indiceBrut: 597, indiceMajore: 508, description: "Sommet B1 (IM 508)" }
        ],
        perspectives: [
          {
            gradeCibleId: "technicien_principal_2cl",
            nomGradeCible: "Technicien principal de 2e classe (B2)",
            categorieCible: "B",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Taux fixé par la collectivité après avis du CST.",
            modaliteReclassement: "Reclassement à indice égal ou immédiatement supérieur avec conservation d ancienneté.",
            explicationReclassement: "Accès au grade B2.",
            conditions: [
              {
                typeVoie: "examen_professionnel",
                descriptionVoie: "Examen professionnel",
                echelonMinimum: 6,
                ancienneteEchelonAnnees: 0,
                ancienneteCadreAnnees: 3,
                examenProfessionnelRequis: true,
                piecesRequises: ["Attestation de réussite examen pro CDG", "Comptes-rendus EPA", "Attestation CNFPT"],
                actesAdministratifs: ["Tableau annuel d avancement", "Arrêté individuel"]
              },
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 8,
                ancienneteEchelonAnnees: 1,
                ancienneteCadreAnnees: 5,
                examenProfessionnelRequis: false,
                piecesRequises: ["1 an au 8e échelon et 5 ans de services effectifs en B", "Dossier professionnel"],
                actesAdministratifs: ["Inscription tableau d avancement", "Arrêté individuel"]
              }
            ]
          },
          {
            gradeCibleId: "ingenieur_normal",
            nomGradeCible: "Ingénieur territorial (Catégorie A)",
            categorieCible: "A",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Promotion interne sur liste d aptitude CDG (quotas stricts 1 pour 3).",
            modaliteReclassement: "Reclassement en catégorie A avec sauvegarde indiciaire.",
            explicationReclassement: "Passage vers l encadrement supérieur technique.",
            conditions: [
              {
                typeVoie: "examen_professionnel",
                descriptionVoie: "Promotion interne B -> A par Examen Professionnel",
                echelonMinimum: 6,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 8,
                examenProfessionnelRequis: true,
                piecesRequises: ["Examen professionnel Ingénieur territorial", "8 ans de services publics dont 4 ans en B"],
                actesAdministratifs: ["Inscription liste aptitude CDG", "Arrêté de nomination stagiaire A"]
              }
            ]
          }
        ]
      },
      {
        id: "technicien_principal_2cl",
        nom: "Technicien principal de 2e classe (B2)",
        filiere: "Technique",
        categorie: "B",
        descriptionGrade: "Deuxième grade des techniciens territoriaux (NES B2). Encadrement de secteur technique et direction de chantiers importants.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 401, indiceMajore: 376 },
          { numero: 2, dureeAnnees: 1, indiceBrut: 415, indiceMajore: 377 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 429, indiceMajore: 384 },
          { numero: 4, dureeAnnees: 2, indiceBrut: 444, indiceMajore: 395 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 458, indiceMajore: 406 },
          { numero: 6, dureeAnnees: 2, indiceBrut: 480, indiceMajore: 421, description: "Accès examen pro Technicien Principal 1re cl. après 1 an" },
          { numero: 7, dureeAnnees: 3, indiceBrut: 506, indiceMajore: 441, description: "Accès au choix Technicien Principal 1re cl. après 1 an" },
          { numero: 8, dureeAnnees: 3, indiceBrut: 528, indiceMajore: 457 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 542, indiceMajore: 466 },
          { numero: 10, dureeAnnees: 3, indiceBrut: 567, indiceMajore: 485 },
          { numero: 11, dureeAnnees: 4, indiceBrut: 599, indiceMajore: 509 },
          { numero: 12, dureeAnnees: 0, indiceBrut: 638, indiceMajore: 539, description: "Sommet B2 (IM 539)" }
        ],
        perspectives: [
          {
            gradeCibleId: "technicien_principal_1cl",
            nomGradeCible: "Technicien principal de 1re classe (B3)",
            categorieCible: "B",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Taux fixé par délibération après avis CST.",
            modaliteReclassement: "Reclassement à indice égal ou immédiatement supérieur.",
            explicationReclassement: "Accès au grade sommital de la catégorie B technique.",
            conditions: [
              {
                typeVoie: "examen_professionnel",
                descriptionVoie: "Examen professionnel",
                echelonMinimum: 6,
                ancienneteEchelonAnnees: 1,
                ancienneteGradeAnnees: 3,
                examenProfessionnelRequis: true,
                piecesRequises: ["Réussite examen pro CDG", "Entretiens professionnels", "Attestations de formation"],
                actesAdministratifs: ["Tableau annuel d avancement", "Arrêté individuel"]
              },
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 7,
                ancienneteEchelonAnnees: 1,
                ancienneteGradeAnnees: 5,
                examenProfessionnelRequis: false,
                piecesRequises: ["1 an au 7e échelon et 5 ans de services effectifs en B", "Évaluations annuelles"],
                actesAdministratifs: ["Inscription tableau d avancement", "Arrêté individuel"]
              }
            ]
          },
          {
            gradeCibleId: "ingenieur_normal",
            nomGradeCible: "Ingénieur territorial (Catégorie A)",
            categorieCible: "A",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Listes d aptitude du CDG.",
            modaliteReclassement: "Reclassement en A avec garantie indiciaire.",
            explicationReclassement: "Passage vers l encadrement supérieur.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Promotion interne au choix vers Ingénieur (Catégorie A)",
                echelonMinimum: 6,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 10,
                examenProfessionnelRequis: false,
                piecesRequises: ["10 ans de services effectifs dont 5 ans en catégorie B", "Dossier professionnel"],
                actesAdministratifs: ["Inscription liste aptitude CDG", "Arrêté individuel"]
              }
            ]
          }
        ]
      },
      {
        id: "technicien_principal_1cl",
        nom: "Technicien principal de 1re classe (B3)",
        filiere: "Technique",
        categorie: "B",
        descriptionGrade: "Grade sommital des techniciens territoriaux (NES B3). Encadrement de services techniques et conduite de grands projets communaux.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 446, indiceMajore: 397 },
          { numero: 2, dureeAnnees: 2, indiceBrut: 461, indiceMajore: 409 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 484, indiceMajore: 424 },
          { numero: 4, dureeAnnees: 2, indiceBrut: 513, indiceMajore: 446 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 547, indiceMajore: 470 },
          { numero: 6, dureeAnnees: 3, indiceBrut: 573, indiceMajore: 489 },
          { numero: 7, dureeAnnees: 3, indiceBrut: 604, indiceMajore: 513 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 638, indiceMajore: 539 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 660, indiceMajore: 556 },
          { numero: 10, dureeAnnees: 3, indiceBrut: 684, indiceMajore: 574 },
          { numero: 11, dureeAnnees: 0, indiceBrut: 707, indiceMajore: 592, description: "Sommet Catégorie B technique (IM 592)" }
        ],
        perspectives: [
          {
            gradeCibleId: "ingenieur_normal",
            nomGradeCible: "Ingénieur territorial (Catégorie A)",
            categorieCible: "A",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Promotion interne sur liste d aptitude CDG.",
            modaliteReclassement: "Reclassement en catégorie A.",
            explicationReclassement: "Accès à la catégorie A technique.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Promotion interne au choix vers Ingénieur",
                echelonMinimum: 4,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 10,
                examenProfessionnelRequis: false,
                piecesRequises: ["10 ans de services effectifs dont 5 ans en catégorie B", "Rapport circonstancié"],
                actesAdministratifs: ["Inscription liste d aptitude CDG", "Arrêté de nomination"]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "ingenieur_territorial",
    nom: "Ingénieur territorial",
    filiere: "Technique",
    categorie: "A",
    decretReference: "Décret n° 2016-201 du 26 février 2016 portant statut particulier du cadre d emplois des ingénieurs territoriaux",
    grades: [
      {
        id: "ingenieur_normal",
        nom: "Ingénieur territorial",
        filiere: "Technique",
        categorie: "A",
        descriptionGrade: "Grade d entrée de la filière technique catégorie A. Conduite de projets techniques, aménagement, informatique et ingénierie.",
        echelons: [
          { numero: 1, dureeAnnees: 1.5, indiceBrut: 444, indiceMajore: 395, description: "Stage probatoire" },
          { numero: 2, dureeAnnees: 2, indiceBrut: 484, indiceMajore: 424 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 518, indiceMajore: 450 },
          { numero: 4, dureeAnnees: 2.5, indiceBrut: 565, indiceMajore: 483 },
          { numero: 5, dureeAnnees: 3, indiceBrut: 611, indiceMajore: 518, description: "Accès Ingénieur Principal" },
          { numero: 6, dureeAnnees: 4, indiceBrut: 646, indiceMajore: 545 },
          { numero: 7, dureeAnnees: 4, indiceBrut: 697, indiceMajore: 583 },
          { numero: 8, dureeAnnees: 4, indiceBrut: 739, indiceMajore: 615 },
          { numero: 9, dureeAnnees: 4, indiceBrut: 774, indiceMajore: 642 },
          { numero: 10, dureeAnnees: 0, indiceBrut: 821, indiceMajore: 678, description: "Sommet grade Ingénieur (IM 678)" }
        ],
        perspectives: [
          {
            gradeCibleId: "ingenieur_principal",
            nomGradeCible: "Ingénieur principal",
            categorieCible: "A",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Taux fixé par la collectivité après avis CST.",
            modaliteReclassement: "Reclassement à indice égal ou immédiatement supérieur.",
            explicationReclassement: "Accès aux fonctions de direction technique de grands services.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 5,
                ancienneteEchelonAnnees: 0,
                ancienneteCadreAnnees: 5,
                examenProfessionnelRequis: false,
                piecesRequises: [
                  "Au moins 5e échelon d ingénieur",
                  "Justificatif de 5 ans de services effectifs dans un corps/cadre de catégorie A",
                  "Comptes-rendus d entretien professionnel"
                ],
                actesAdministratifs: [
                  "Inscription au tableau annuel d avancement",
                  "Arrêté individuel de nomination au grade d Ingénieur Principal"
                ]
              }
            ]
          }
        ]
      },
      {
        id: "ingenieur_principal",
        nom: "Ingénieur principal",
        filiere: "Technique",
        categorie: "A",
        descriptionGrade: "Deuxième grade des ingénieurs. Direction des services techniques et pilotage de projets complexes d ingénierie.",
        echelons: [
          { numero: 1, dureeAnnees: 2, indiceBrut: 619, indiceMajore: 524 },
          { numero: 2, dureeAnnees: 2.5, indiceBrut: 665, indiceMajore: 560 },
          { numero: 3, dureeAnnees: 3, indiceBrut: 721, indiceMajore: 602 },
          { numero: 4, dureeAnnees: 3, indiceBrut: 791, indiceMajore: 655 },
          { numero: 5, dureeAnnees: 3, indiceBrut: 837, indiceMajore: 690, description: "Accès Ingénieur hors classe" },
          { numero: 6, dureeAnnees: 3, indiceBrut: 896, indiceMajore: 735 },
          { numero: 7, dureeAnnees: 3, indiceBrut: 946, indiceMajore: 773 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 995, indiceMajore: 811 },
          { numero: 9, dureeAnnees: 0, indiceBrut: 1015, indiceMajore: 826, description: "Sommet Ingénieur Principal (IM 826)" }
        ],
        perspectives: [
          {
            gradeCibleId: "ingenieur_hors_classe",
            nomGradeCible: "Ingénieur hors classe",
            categorieCible: "A",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Avancement réservé aux postes à forte responsabilité ou direction générale technique.",
            modaliteReclassement: "Reclassement à indice égal ou immédiatement supérieur.",
            explicationReclassement: "Grade sommital de la filière technique territoriale.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 5,
                ancienneteEchelonAnnees: 0,
                ancienneteGradeAnnees: 6,
                examenProfessionnelRequis: false,
                piecesRequises: [
                  "Justificatif d occupation de fonctions de direction générale technique pendant 6 ans",
                  "Avis du Maire / Président",
                  "Rapports d entretien professionnel"
                ],
                actesAdministratifs: [
                  "Arrêté portant tableau d avancement",
                  "Arrêté individuel de nomination"
                ]
              }
            ]
          }
        ]
      },
      {
        id: "ingenieur_hors_classe",
        nom: "Ingénieur hors classe",
        filiere: "Technique",
        categorie: "A",
        descriptionGrade: "Grade sommital des ingénieurs territoriaux. Direction générale des services techniques de grandes collectivités (> 10 000 hab).",
        echelons: [
          { numero: 1, dureeAnnees: 2, indiceBrut: 850, indiceMajore: 700 },
          { numero: 2, dureeAnnees: 2, indiceBrut: 896, indiceMajore: 735 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 946, indiceMajore: 773 },
          { numero: 4, dureeAnnees: 2.5, indiceBrut: 995, indiceMajore: 811 },
          { numero: 5, dureeAnnees: 0, indiceBrut: 1027, indiceMajore: 835, description: "Sommet Ingénieur Hors Classe (IM 835)" }
        ],
        perspectives: []
      }
    ]
  },

  // =========================================================================
  // FILIÈRE MÉDICO-SOCIALE
  // =========================================================================
  {
    id: "atsem",
    nom: "ATSEM (Agent spécialisé des écoles maternelles)",
    filiere: "Médico-sociale",
    categorie: "C",
    decretReference: "Décret n° 92-850 du 28 août 1992 modifié par décret n° 2018-152 et décret n° 2021-1818",
    grades: [
      {
        id: "atsem_principal_2cl",
        nom: "ATSEM principal de 2e classe (C2)",
        filiere: "Médico-sociale",
        categorie: "C",
        descriptionGrade: "Grade de recrutement initial par concours (Échelle C2). Assistance éducative et pédagogique auprès des enseignants d école maternelle, soins d hygiène et de sécurité des enfants.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 368, indiceMajore: 367, description: "Recrutement concours direct C2" },
          { numero: 2, dureeAnnees: 1, indiceBrut: 371, indiceMajore: 369 },
          { numero: 3, dureeAnnees: 1, indiceBrut: 376, indiceMajore: 370 },
          { numero: 4, dureeAnnees: 1, indiceBrut: 387, indiceMajore: 373 },
          { numero: 5, dureeAnnees: 1, indiceBrut: 396, indiceMajore: 374 },
          { numero: 6, dureeAnnees: 1, indiceBrut: 404, indiceMajore: 376, description: "Seuil de promouvabilité au grade C3" },
          { numero: 7, dureeAnnees: 2, indiceBrut: 416, indiceMajore: 377 },
          { numero: 8, dureeAnnees: 2, indiceBrut: 430, indiceMajore: 385 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 446, indiceMajore: 397 },
          { numero: 10, dureeAnnees: 3, indiceBrut: 461, indiceMajore: 409 },
          { numero: 11, dureeAnnees: 4, indiceBrut: 473, indiceMajore: 417 },
          { numero: 12, dureeAnnees: 0, indiceBrut: 486, indiceMajore: 425, description: "Sommet échelle C2" }
        ],
        perspectives: [
          {
            gradeCibleId: "atsem_principal_1cl",
            nomGradeCible: "ATSEM principal de 1re classe (C3)",
            categorieCible: "C",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Taux d avancement fixé par délibération après avis du CST.",
            modaliteReclassement: "Reclassement à l échelon d indice équivalent dans l échelle C3 avec conservation de l ancienneté acquise.",
            explicationReclassement: "Accès au grade sommital C3 (indice majoré jusqu à 478).",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 6,
                ancienneteEchelonAnnees: 1,
                ancienneteGradeAnnees: 5,
                examenProfessionnelRequis: false,
                piecesRequises: [
                  "Justificatif d 1 an au moins d ancienneté au 6e échelon de C2",
                  "Justificatif de 5 ans de services effectifs dans le grade d ATSEM principal de 2e classe",
                  "Comptes-rendus d entretien professionnel annuel (EPA)",
                  "Attestation de suivi des formations statutaires CNFPT"
                ],
                actesAdministratifs: [
                  "Inscription au tableau annuel d avancement selon critères LDG",
                  "Arrêté individuel de nomination et de reclassement signé par le Maire"
                ]
              }
            ]
          },
          {
            gradeCibleId: "auxiliaire_puericulture_classe_normale",
            nomGradeCible: "Auxiliaire de puériculture (Catégorie B)",
            categorieCible: "B",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Promotion interne sur liste d aptitude CDG avec diplôme requis.",
            modaliteReclassement: "Reclassement en B avec sauvegarde de traitement.",
            explicationReclassement: "Évolution de carrière vers la catégorie B médico-sociale.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Promotion interne B au choix",
                echelonMinimum: 5,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 7,
                examenProfessionnelRequis: false,
                piecesRequises: ["Diplôme d État d Auxiliaire de Puériculture (DEAP)", "7 ans de services publics"],
                actesAdministratifs: ["Inscription liste aptitude CDG", "Arrêté individuel"]
              }
            ]
          }
        ]
      },
      {
        id: "atsem_principal_1cl",
        nom: "ATSEM principal de 1re classe (C3)",
        filiere: "Médico-sociale",
        categorie: "C",
        descriptionGrade: "Grade sommital des ATSEM territoriales (Échelle C3). Accompagnement des enfants à besoins éducatifs particuliers, tutorat et coordination d école.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 388, indiceMajore: 373 },
          { numero: 2, dureeAnnees: 1, indiceBrut: 397, indiceMajore: 375 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 412, indiceMajore: 376 },
          { numero: 4, dureeAnnees: 2, indiceBrut: 430, indiceMajore: 385 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 448, indiceMajore: 398 },
          { numero: 6, dureeAnnees: 2, indiceBrut: 460, indiceMajore: 408 },
          { numero: 7, dureeAnnees: 3, indiceBrut: 478, indiceMajore: 420 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 499, indiceMajore: 435 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 525, indiceMajore: 455 },
          { numero: 10, dureeAnnees: 0, indiceBrut: 558, indiceMajore: 478, description: "Sommet ATSEM (IM 478)" }
        ],
        perspectives: [
          {
            gradeCibleId: "educateur_jeunes_enfants_normal",
            nomGradeCible: "Éducateur de jeunes enfants (Catégorie A)",
            categorieCible: "A",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Listes d aptitude du CDG.",
            modaliteReclassement: "Reclassement en catégorie A.",
            explicationReclassement: "Passage en catégorie A de la petite enfance.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Promotion interne vers EJE (Diplôme d État requis)",
                echelonMinimum: 5,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 8,
                examenProfessionnelRequis: false,
                piecesRequises: ["Diplôme d État d Éducateur de Jeunes Enfants (DEEJE)", "8 ans de services publics"],
                actesAdministratifs: ["Liste aptitude CDG", "Arrêté de nomination stagiaire"]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "auxiliaire_puericulture",
    nom: "Auxiliaire de puériculture territorial",
    filiere: "Médico-sociale",
    categorie: "B",
    decretReference: "Décret n° 2021-1882 du 29 décembre 2021 portant statut particulier du cadre d emplois des auxiliaires de puériculture territoriaux",
    grades: [
      {
        id: "auxiliaire_puericulture_classe_normale",
        nom: "Auxiliaire de puériculture (Classe normale)",
        filiere: "Médico-sociale",
        categorie: "B",
        descriptionGrade: "Grade d entrée en catégorie B médico-sociale. Accueil, soins quotidiens, développement et éveil des enfants en crèches et structures d accueil.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 389, indiceMajore: 373, description: "Stage probatoire" },
          { numero: 2, dureeAnnees: 1, indiceBrut: 395, indiceMajore: 374 },
          { numero: 3, dureeAnnees: 1.5, indiceBrut: 401, indiceMajore: 376 },
          { numero: 4, dureeAnnees: 1.5, indiceBrut: 415, indiceMajore: 377 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 431, indiceMajore: 386 },
          { numero: 6, dureeAnnees: 2, indiceBrut: 452, indiceMajore: 401, description: "Accès classe supérieure après 1 an" },
          { numero: 7, dureeAnnees: 3, indiceBrut: 478, indiceMajore: 420 },
          { numero: 8, dureeAnnees: 2.5, indiceBrut: 500, indiceMajore: 436 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 528, indiceMajore: 457 },
          { numero: 10, dureeAnnees: 3, indiceBrut: 563, indiceMajore: 482 },
          { numero: 11, dureeAnnees: 4, indiceBrut: 599, indiceMajore: 509 },
          { numero: 12, dureeAnnees: 0, indiceBrut: 638, indiceMajore: 539, description: "Sommet Classe normale (IM 539)" }
        ],
        perspectives: [
          {
            gradeCibleId: "auxiliaire_puericulture_classe_sup",
            nomGradeCible: "Auxiliaire de puériculture (Classe supérieure)",
            categorieCible: "B",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Taux voté par la collectivité après avis CST.",
            modaliteReclassement: "Reclassement à l échelon d indice équivalent ou immédiatement supérieur.",
            explicationReclassement: "Accès au grade supérieur de la filière paramédicale.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 6,
                ancienneteEchelonAnnees: 1,
                ancienneteGradeAnnees: 5,
                examenProfessionnelRequis: false,
                piecesRequises: ["1 an au 6e échelon et 5 ans de services en classe normale", "Dossier d entretien pro"],
                actesAdministratifs: ["Inscription tableau annuel d avancement", "Arrêté individuel"]
              }
            ]
          },
          {
            gradeCibleId: "educateur_jeunes_enfants_normal",
            nomGradeCible: "Éducateur de jeunes enfants (Catégorie A)",
            categorieCible: "A",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Promotion interne sur liste d aptitude CDG avec diplôme DEEJE.",
            modaliteReclassement: "Reclassement en catégorie A.",
            explicationReclassement: "Passage vers la conception de projets éducatifs et direction de structure.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Promotion interne B -> A au choix",
                echelonMinimum: 5,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 8,
                examenProfessionnelRequis: false,
                piecesRequises: ["Diplôme d État d Éducateur de Jeunes Enfants", "8 ans de services publics"],
                actesAdministratifs: ["Liste aptitude CDG", "Arrêté individuel"]
              }
            ]
          }
        ]
      },
      {
        id: "auxiliaire_puericulture_classe_sup",
        nom: "Auxiliaire de puériculture (Classe supérieure)",
        filiere: "Médico-sociale",
        categorie: "B",
        descriptionGrade: "Grade supérieur des auxiliaires de puériculture. Encadrement de sections en crèche, tutorat et protocoles de soins.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 446, indiceMajore: 397 },
          { numero: 2, dureeAnnees: 2, indiceBrut: 461, indiceMajore: 409 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 484, indiceMajore: 424 },
          { numero: 4, dureeAnnees: 2, indiceBrut: 513, indiceMajore: 446 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 547, indiceMajore: 470 },
          { numero: 6, dureeAnnees: 3, indiceBrut: 573, indiceMajore: 489 },
          { numero: 7, dureeAnnees: 3, indiceBrut: 604, indiceMajore: 513 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 638, indiceMajore: 539 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 660, indiceMajore: 556 },
          { numero: 10, dureeAnnees: 3, indiceBrut: 684, indiceMajore: 574 },
          { numero: 11, dureeAnnees: 0, indiceBrut: 707, indiceMajore: 592, description: "Sommet Classe supérieure (IM 592)" }
        ],
        perspectives: [
          {
            gradeCibleId: "educateur_jeunes_enfants_normal",
            nomGradeCible: "Éducateur de jeunes enfants (Catégorie A)",
            categorieCible: "A",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Listes d aptitude CDG.",
            modaliteReclassement: "Reclassement en catégorie A.",
            explicationReclassement: "Passage en catégorie A.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Promotion interne vers EJE",
                echelonMinimum: 4,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 8,
                examenProfessionnelRequis: false,
                piecesRequises: ["Diplôme DEEJE", "8 ans de services publics"],
                actesAdministratifs: ["Liste aptitude CDG", "Arrêté de nomination"]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "educateur_jeunes_enfants",
    nom: "Éducateur territorial de jeunes enfants (EJE)",
    filiere: "Médico-sociale",
    categorie: "A",
    decretReference: "Décret n° 2017-902 du 9 mai 2017 portant statut particulier du cadre d emplois des éducateurs territoriaux de jeunes enfants (revalorisation A)",
    grades: [
      {
        id: "educateur_jeunes_enfants_normal",
        nom: "Éducateur de jeunes enfants",
        filiere: "Médico-sociale",
        categorie: "A",
        descriptionGrade: "Grade d entrée en catégorie A socio-éducative. Conception et conduite du projet éducatif en établissement d accueil du jeune enfant (EAJE), coordination d équipes.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 444, indiceMajore: 395, description: "Stage probatoire" },
          { numero: 2, dureeAnnees: 1, indiceBrut: 469, indiceMajore: 415 },
          { numero: 3, dureeAnnees: 1.5, indiceBrut: 499, indiceMajore: 435 },
          { numero: 4, dureeAnnees: 1.5, indiceBrut: 525, indiceMajore: 455 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 567, indiceMajore: 485 },
          { numero: 6, dureeAnnees: 2, indiceBrut: 611, indiceMajore: 518, description: "Accès Classe exceptionnelle après 1 an" },
          { numero: 7, dureeAnnees: 2, indiceBrut: 653, indiceMajore: 550 },
          { numero: 8, dureeAnnees: 2.5, indiceBrut: 693, indiceMajore: 580 },
          { numero: 9, dureeAnnees: 2.5, indiceBrut: 732, indiceMajore: 610 },
          { numero: 10, dureeAnnees: 3, indiceBrut: 758, indiceMajore: 630 },
          { numero: 11, dureeAnnees: 3, indiceBrut: 778, indiceMajore: 645 },
          { numero: 12, dureeAnnees: 3, indiceBrut: 798, indiceMajore: 660 },
          { numero: 13, dureeAnnees: 3, indiceBrut: 810, indiceMajore: 670 },
          { numero: 14, dureeAnnees: 0, indiceBrut: 821, indiceMajore: 678, description: "Sommet EJE (IM 678)" }
        ],
        perspectives: [
          {
            gradeCibleId: "educateur_jeunes_enfants_classe_exc",
            nomGradeCible: "Éducateur de jeunes enfants de classe exceptionnelle",
            categorieCible: "A",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Taux fixé par délibération après avis du CST.",
            modaliteReclassement: "Reclassement à indice égal ou immédiatement supérieur.",
            explicationReclassement: "Accès aux fonctions de direction d EAJE et de coordination petite enfance.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 6,
                ancienneteEchelonAnnees: 1,
                ancienneteGradeAnnees: 5,
                examenProfessionnelRequis: false,
                piecesRequises: ["1 an au 6e échelon d EJE et 5 ans en catégorie A", "Comptes-rendus d entretien professionnel"],
                actesAdministratifs: ["Inscription tableau d avancement", "Arrêté individuel"]
              }
            ]
          }
        ]
      },
      {
        id: "educateur_jeunes_enfants_classe_exc",
        nom: "Éducateur de jeunes enfants de classe exceptionnelle",
        filiere: "Médico-sociale",
        categorie: "A",
        descriptionGrade: "Grade supérieur des EJE. Direction d établissements d accueil du jeune enfant (crèches de plus de 40 places) et coordination municipale petite enfance.",
        echelons: [
          { numero: 1, dureeAnnees: 2, indiceBrut: 593, indiceMajore: 505 },
          { numero: 2, dureeAnnees: 2, indiceBrut: 639, indiceMajore: 540 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 693, indiceMajore: 580 },
          { numero: 4, dureeAnnees: 2, indiceBrut: 732, indiceMajore: 610 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 791, indiceMajore: 655 },
          { numero: 6, dureeAnnees: 2.5, indiceBrut: 843, indiceMajore: 695 },
          { numero: 7, dureeAnnees: 2.5, indiceBrut: 896, indiceMajore: 735 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 946, indiceMajore: 773 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 995, indiceMajore: 811 },
          { numero: 10, dureeAnnees: 3, indiceBrut: 1005, indiceMajore: 818 },
          { numero: 11, dureeAnnees: 0, indiceBrut: 1015, indiceMajore: 826, description: "Sommet EJE Classe exceptionnelle (IM 826)" }
        ],
        perspectives: []
      }
    ]
  },
  {
    id: "assistant_socio_educatif",
    nom: "Assistant territorial socio-éducatif (ASE)",
    filiere: "Médico-sociale",
    categorie: "A",
    decretReference: "Décret n° 2017-901 du 9 mai 2017 portant statut particulier du cadre d emplois des assistants territoriaux socio-éducatifs",
    grades: [
      {
        id: "assistant_socio_educatif_normal",
        nom: "Assistant socio-éducatif",
        filiere: "Médico-sociale",
        categorie: "A",
        descriptionGrade: "Grade d entrée en catégorie A (Assistants de service social, CESF, Éducateurs spécialisés). Aide personnalisée, insertion, médiation sociale et protection de l enfance.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 444, indiceMajore: 395, description: "Stage probatoire" },
          { numero: 2, dureeAnnees: 1, indiceBrut: 469, indiceMajore: 415 },
          { numero: 3, dureeAnnees: 1.5, indiceBrut: 499, indiceMajore: 435 },
          { numero: 4, dureeAnnees: 1.5, indiceBrut: 525, indiceMajore: 455 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 567, indiceMajore: 485 },
          { numero: 6, dureeAnnees: 2, indiceBrut: 611, indiceMajore: 518, description: "Accès Classe exceptionnelle après 1 an" },
          { numero: 7, dureeAnnees: 2, indiceBrut: 653, indiceMajore: 550 },
          { numero: 8, dureeAnnees: 2.5, indiceBrut: 693, indiceMajore: 580 },
          { numero: 9, dureeAnnees: 2.5, indiceBrut: 732, indiceMajore: 610 },
          { numero: 10, dureeAnnees: 3, indiceBrut: 758, indiceMajore: 630 },
          { numero: 11, dureeAnnees: 3, indiceBrut: 778, indiceMajore: 645 },
          { numero: 12, dureeAnnees: 3, indiceBrut: 798, indiceMajore: 660 },
          { numero: 13, dureeAnnees: 3, indiceBrut: 810, indiceMajore: 670 },
          { numero: 14, dureeAnnees: 0, indiceBrut: 821, indiceMajore: 678, description: "Sommet ASE (IM 678)" }
        ],
        perspectives: [
          {
            gradeCibleId: "assistant_socio_educatif_classe_exc",
            nomGradeCible: "Assistant socio-éducatif de classe exceptionnelle",
            categorieCible: "A",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Taux fixé par l assemblée territoriale après avis CST.",
            modaliteReclassement: "Reclassement à indice égal ou immédiatement supérieur.",
            explicationReclassement: "Accès à la classe supérieure pour expertise sociale et coordination de projets.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 6,
                ancienneteEchelonAnnees: 1,
                ancienneteGradeAnnees: 5,
                examenProfessionnelRequis: false,
                piecesRequises: ["1 an au 6e échelon et 5 ans de services effectifs dans un corps/cadre de catégorie A", "Évaluations professionnelles"],
                actesAdministratifs: ["Inscription tableau d avancement", "Arrêté individuel"]
              }
            ]
          }
        ]
      },
      {
        id: "assistant_socio_educatif_classe_exc",
        nom: "Assistant socio-éducatif de classe exceptionnelle",
        filiere: "Médico-sociale",
        categorie: "A",
        descriptionGrade: "Grade supérieur des assistants socio-éducatifs. Coordination de pôle social, gestion de dispositifs d action sociale complexes et tutorat.",
        echelons: [
          { numero: 1, dureeAnnees: 2, indiceBrut: 593, indiceMajore: 505 },
          { numero: 2, dureeAnnees: 2, indiceBrut: 639, indiceMajore: 540 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 693, indiceMajore: 580 },
          { numero: 4, dureeAnnees: 2, indiceBrut: 732, indiceMajore: 610 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 791, indiceMajore: 655 },
          { numero: 6, dureeAnnees: 2.5, indiceBrut: 843, indiceMajore: 695 },
          { numero: 7, dureeAnnees: 2.5, indiceBrut: 896, indiceMajore: 735 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 946, indiceMajore: 773 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 995, indiceMajore: 811 },
          { numero: 10, dureeAnnees: 3, indiceBrut: 1005, indiceMajore: 818 },
          { numero: 11, dureeAnnees: 0, indiceBrut: 1015, indiceMajore: 826, description: "Sommet ASE Classe exceptionnelle (IM 826)" }
        ],
        perspectives: []
      }
    ]
  },
  {
    id: "infirmier_territorial",
    nom: "Infirmier territorial en soins généraux (ISGS)",
    filiere: "Médico-sociale",
    categorie: "A",
    decretReference: "Décret n° 2012-1420 du 18 décembre 2012 modifié portant statut particulier du cadre d emplois des infirmiers territoriaux en soins généraux",
    grades: [
      {
        id: "infirmier_classe_normale",
        nom: "Infirmier en soins généraux (Classe normale)",
        filiere: "Médico-sociale",
        categorie: "A",
        descriptionGrade: "Grade d entrée en catégorie A de santé. Soins infirmiers, prévention, santé scolaire, médecine préventive et PMI.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 444, indiceMajore: 395, description: "Stage probatoire" },
          { numero: 2, dureeAnnees: 1.5, indiceBrut: 469, indiceMajore: 415 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 499, indiceMajore: 435 },
          { numero: 4, dureeAnnees: 2, indiceBrut: 525, indiceMajore: 455 },
          { numero: 5, dureeAnnees: 2.5, indiceBrut: 567, indiceMajore: 485, description: "Accès Classe supérieure" },
          { numero: 6, dureeAnnees: 3, indiceBrut: 611, indiceMajore: 518 },
          { numero: 7, dureeAnnees: 3, indiceBrut: 653, indiceMajore: 550 },
          { numero: 8, dureeAnnees: 3.5, indiceBrut: 693, indiceMajore: 580 },
          { numero: 9, dureeAnnees: 4, indiceBrut: 732, indiceMajore: 610 },
          { numero: 10, dureeAnnees: 4, indiceBrut: 778, indiceMajore: 645 },
          { numero: 11, dureeAnnees: 0, indiceBrut: 821, indiceMajore: 678, description: "Sommet Classe normale (IM 678)" }
        ],
        perspectives: [
          {
            gradeCibleId: "infirmier_classe_sup",
            nomGradeCible: "Infirmier en soins généraux (Classe supérieure)",
            categorieCible: "A",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Taux voté par la collectivité.",
            modaliteReclassement: "Reclassement à l échelon d indice équivalent ou immédiatement supérieur.",
            explicationReclassement: "Accès au grade sommital infirmier.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 5,
                ancienneteEchelonAnnees: 0,
                ancienneteCadreAnnees: 9,
                examenProfessionnelRequis: false,
                piecesRequises: ["Au moins 5e échelon et 9 ans de services effectifs dans un corps de catégorie A", "Évaluations professionnelles"],
                actesAdministratifs: ["Inscription tableau d avancement", "Arrêté individuel"]
              }
            ]
          }
        ]
      },
      {
        id: "infirmier_classe_sup",
        nom: "Infirmier en soins généraux (Classe supérieure)",
        filiere: "Médico-sociale",
        categorie: "A",
        descriptionGrade: "Grade supérieur des infirmiers en soins généraux. Coordination de centres de santé, encadrement de protocoles de soins et missions d expertise santé publique.",
        echelons: [
          { numero: 1, dureeAnnees: 2, indiceBrut: 593, indiceMajore: 505 },
          { numero: 2, dureeAnnees: 2, indiceBrut: 639, indiceMajore: 540 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 693, indiceMajore: 580 },
          { numero: 4, dureeAnnees: 2, indiceBrut: 732, indiceMajore: 610 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 791, indiceMajore: 655 },
          { numero: 6, dureeAnnees: 2.5, indiceBrut: 843, indiceMajore: 695 },
          { numero: 7, dureeAnnees: 2.5, indiceBrut: 896, indiceMajore: 735 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 946, indiceMajore: 773 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 995, indiceMajore: 811 },
          { numero: 10, dureeAnnees: 3, indiceBrut: 1005, indiceMajore: 818 },
          { numero: 11, dureeAnnees: 0, indiceBrut: 1015, indiceMajore: 826, description: "Sommet Infirmier Classe supérieure (IM 826)" }
        ],
        perspectives: []
      }
    ]
  },

  // =========================================================================
  // FILIÈRE CULTURELLE
  // =========================================================================
  {
    id: "adjoint_patrimoine",
    nom: "Adjoint territorial du patrimoine",
    filiere: "Culturelle",
    categorie: "C",
    decretReference: "Décret n° 2006-1692 du 22 décembre 2006 modifié et Décret n° 2016-596 (organisation des carrières de catégorie C)",
    grades: [
      {
        id: "adjoint_patrimoine_c1",
        nom: "Adjoint du patrimoine (C1)",
        filiere: "Culturelle",
        categorie: "C",
        descriptionGrade: "Grade d entrée sans concours en catégorie C culturelle (Échelle C1). Accueil du public, surveillance, conservation des collections en bibliothèques, musées et archives.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 367, indiceMajore: 366, description: "Minimum de traitement garanti" },
          { numero: 2, dureeAnnees: 1, indiceBrut: 368, indiceMajore: 367 },
          { numero: 3, dureeAnnees: 1, indiceBrut: 370, indiceMajore: 368 },
          { numero: 4, dureeAnnees: 1, indiceBrut: 371, indiceMajore: 369 },
          { numero: 5, dureeAnnees: 1, indiceBrut: 374, indiceMajore: 370 },
          { numero: 6, dureeAnnees: 1, indiceBrut: 378, indiceMajore: 371 },
          { numero: 7, dureeAnnees: 3, indiceBrut: 381, indiceMajore: 372 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 387, indiceMajore: 373 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 401, indiceMajore: 376 },
          { numero: 10, dureeAnnees: 4, indiceBrut: 419, indiceMajore: 377 },
          { numero: 11, dureeAnnees: 0, indiceBrut: 432, indiceMajore: 387, description: "Sommet C1" }
        ],
        perspectives: [
          {
            gradeCibleId: "adjoint_patrimoine_principal_2cl",
            nomGradeCible: "Adjoint du patrimoine principal de 2e classe (C2)",
            categorieCible: "C",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Taux fixé par la collectivité après avis du CST.",
            modaliteReclassement: "Reclassement à échelon d indice équivalent ou immédiatement supérieur.",
            explicationReclassement: "Accès à l échelle C2 avec déroulement jusqu à l échelon 12.",
            conditions: [
              {
                typeVoie: "examen_professionnel",
                descriptionVoie: "Examen professionnel C1 -> C2",
                echelonMinimum: 4,
                ancienneteEchelonAnnees: 0,
                ancienneteGradeAnnees: 3,
                examenProfessionnelRequis: true,
                piecesRequises: ["Attestation de réussite examen C2 délivrée par le CDG", "Évaluations annuelles"],
                actesAdministratifs: ["Tableau d avancement annuel", "Arrêté individuel"]
              },
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 5,
                ancienneteEchelonAnnees: 0,
                ancienneteGradeAnnees: 5,
                examenProfessionnelRequis: false,
                piecesRequises: ["5 ans de services effectifs accomplis en C1", "Dossier professionnel"],
                actesAdministratifs: ["Inscription tableau d avancement", "Arrêté individuel"]
              }
            ]
          },
          {
            gradeCibleId: "assistant_conservation_classe_normale",
            nomGradeCible: "Assistant de conservation du patrimoine (Catégorie B)",
            categorieCible: "B",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Promotion interne sur liste d aptitude CDG (quotas catégorie B).",
            modaliteReclassement: "Reclassement en catégorie B avec clause de sauvegarde indiciaire.",
            explicationReclassement: "Passage vers les fonctions d encadrement et d animation culturelle.",
            conditions: [
              {
                typeVoie: "examen_professionnel",
                descriptionVoie: "Promotion interne B par Examen Professionnel",
                echelonMinimum: 4,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 7,
                examenProfessionnelRequis: true,
                piecesRequises: ["Réussite examen pro Assistant de conservation CDG", "7 ans de services publics dont 4 ans en C"],
                actesAdministratifs: ["Inscription liste d aptitude CDG", "Arrêté individuel de nomination stagiaire"]
              }
            ]
          }
        ]
      },
      {
        id: "adjoint_patrimoine_principal_2cl",
        nom: "Adjoint du patrimoine principal de 2e classe (C2)",
        filiere: "Culturelle",
        categorie: "C",
        descriptionGrade: "Deuxième grade de catégorie C culturelle (Échelle C2). Traitement matériel des collections, gestion de prêt, médiation et encadrement d agents de surveillance.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 368, indiceMajore: 367 },
          { numero: 2, dureeAnnees: 1, indiceBrut: 371, indiceMajore: 369 },
          { numero: 3, dureeAnnees: 1, indiceBrut: 376, indiceMajore: 370 },
          { numero: 4, dureeAnnees: 1, indiceBrut: 387, indiceMajore: 373 },
          { numero: 5, dureeAnnees: 1, indiceBrut: 396, indiceMajore: 374 },
          { numero: 6, dureeAnnees: 1, indiceBrut: 404, indiceMajore: 376, description: "Accès promouvabilité C3" },
          { numero: 7, dureeAnnees: 2, indiceBrut: 416, indiceMajore: 377 },
          { numero: 8, dureeAnnees: 2, indiceBrut: 430, indiceMajore: 385 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 446, indiceMajore: 397 },
          { numero: 10, dureeAnnees: 3, indiceBrut: 461, indiceMajore: 409 },
          { numero: 11, dureeAnnees: 4, indiceBrut: 473, indiceMajore: 417 },
          { numero: 12, dureeAnnees: 0, indiceBrut: 486, indiceMajore: 425, description: "Sommet C2 (IM 425)" }
        ],
        perspectives: [
          {
            gradeCibleId: "adjoint_patrimoine_principal_1cl",
            nomGradeCible: "Adjoint du patrimoine principal de 1re classe (C3)",
            categorieCible: "C",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Taux fixé par l assemblée délibérante.",
            modaliteReclassement: "Reclassement à échelon d indice équivalent dans l échelle C3.",
            explicationReclassement: "Grade sommital de catégorie C culturelle.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 6,
                ancienneteEchelonAnnees: 1,
                ancienneteGradeAnnees: 5,
                examenProfessionnelRequis: false,
                piecesRequises: ["1 an au 6e échelon et 5 ans de services effectifs en C2", "Évaluations annuelles"],
                actesAdministratifs: ["Inscription tableau d avancement", "Arrêté individuel"]
              }
            ]
          },
          {
            gradeCibleId: "assistant_conservation_classe_normale",
            nomGradeCible: "Assistant de conservation du patrimoine (Catégorie B)",
            categorieCible: "B",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Listes d aptitude CDG.",
            modaliteReclassement: "Reclassement en B avec garantie du traitement.",
            explicationReclassement: "Évolution vers la catégorie B.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Promotion interne B au choix",
                echelonMinimum: 5,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 8,
                examenProfessionnelRequis: false,
                piecesRequises: ["8 ans de services effectifs", "Dossier EPA", "Attestations de formation CNFPT"],
                actesAdministratifs: ["Liste aptitude CDG", "Arrêté individuel"]
              }
            ]
          }
        ]
      },
      {
        id: "adjoint_patrimoine_principal_1cl",
        nom: "Adjoint du patrimoine principal de 1re classe (C3)",
        filiere: "Culturelle",
        categorie: "C",
        descriptionGrade: "Grade sommital de la catégorie C culturelle (Échelle C3). Encadrement d équipes d accueil, gestion des réserves et animation d ateliers patrimoniaux.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 388, indiceMajore: 373 },
          { numero: 2, dureeAnnees: 1, indiceBrut: 397, indiceMajore: 375 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 412, indiceMajore: 376 },
          { numero: 4, dureeAnnees: 2, indiceBrut: 430, indiceMajore: 385 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 448, indiceMajore: 398 },
          { numero: 6, dureeAnnees: 2, indiceBrut: 460, indiceMajore: 408 },
          { numero: 7, dureeAnnees: 3, indiceBrut: 478, indiceMajore: 420 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 499, indiceMajore: 435 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 525, indiceMajore: 455 },
          { numero: 10, dureeAnnees: 0, indiceBrut: 558, indiceMajore: 478, description: "Sommet C3 (IM 478)" }
        ],
        perspectives: [
          {
            gradeCibleId: "assistant_conservation_classe_normale",
            nomGradeCible: "Assistant de conservation du patrimoine (Catégorie B)",
            categorieCible: "B",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Listes d aptitude CDG.",
            modaliteReclassement: "Reclassement en B avec garantie du traitement.",
            explicationReclassement: "Passage en catégorie B culturelle.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Promotion interne B au choix",
                echelonMinimum: 4,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 8,
                examenProfessionnelRequis: false,
                piecesRequises: ["8 ans de services effectifs", "Dossier professionnel"],
                actesAdministratifs: ["Liste aptitude CDG", "Arrêté individuel"]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "assistant_conservation",
    nom: "Assistant territorial de conservation du patrimoine et des bibliothèques (ASEPB)",
    filiere: "Culturelle",
    categorie: "B",
    decretReference: "Décret n° 2011-1642 du 23 novembre 2011 modifié portant statut particulier du cadre d emplois des assistants territoriaux de conservation (revalorisation B)",
    grades: [
      {
        id: "assistant_conservation_classe_normale",
        nom: "Assistant de conservation (Classe normale - B1)",
        filiere: "Culturelle",
        categorie: "B",
        descriptionGrade: "Premier grade du cadre d emplois (NES B1). Traitement documentaire, conservation, valorisation des fonds, accueil du public et animation d activités culturelles.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 389, indiceMajore: 373, description: "Stage probatoire" },
          { numero: 2, dureeAnnees: 1, indiceBrut: 395, indiceMajore: 374 },
          { numero: 3, dureeAnnees: 1, indiceBrut: 397, indiceMajore: 375 },
          { numero: 4, dureeAnnees: 1, indiceBrut: 401, indiceMajore: 376 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 415, indiceMajore: 377 },
          { numero: 6, dureeAnnees: 2, indiceBrut: 431, indiceMajore: 386, description: "Accès examen pro Assistant Principal 2e cl." },
          { numero: 7, dureeAnnees: 2, indiceBrut: 452, indiceMajore: 401 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 478, indiceMajore: 420, description: "Accès au choix Assistant Principal 2e cl. après 1 an" },
          { numero: 9, dureeAnnees: 3, indiceBrut: 500, indiceMajore: 436 },
          { numero: 10, dureeAnnees: 3, indiceBrut: 513, indiceMajore: 446 },
          { numero: 11, dureeAnnees: 3, indiceBrut: 538, indiceMajore: 462 },
          { numero: 12, dureeAnnees: 4, indiceBrut: 563, indiceMajore: 482 },
          { numero: 13, dureeAnnees: 0, indiceBrut: 597, indiceMajore: 508, description: "Sommet B1 (IM 508)" }
        ],
        perspectives: [
          {
            gradeCibleId: "assistant_conservation_principal_2cl",
            nomGradeCible: "Assistant de conservation principal de 2e classe (B2)",
            categorieCible: "B",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Taux fixé par la collectivité après avis CST.",
            modaliteReclassement: "Reclassement à indice égal ou immédiatement supérieur.",
            explicationReclassement: "Accès au grade B2.",
            conditions: [
              {
                typeVoie: "examen_professionnel",
                descriptionVoie: "Examen professionnel",
                echelonMinimum: 6,
                ancienneteEchelonAnnees: 0,
                ancienneteCadreAnnees: 3,
                examenProfessionnelRequis: true,
                piecesRequises: ["Attestation de réussite examen pro CDG", "Entretiens professionnels"],
                actesAdministratifs: ["Tableau annuel d avancement", "Arrêté individuel"]
              },
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 8,
                ancienneteEchelonAnnees: 1,
                ancienneteCadreAnnees: 5,
                examenProfessionnelRequis: false,
                piecesRequises: ["1 an au 8e échelon et 5 ans de services effectifs en catégorie B", "Comptes-rendus EPA"],
                actesAdministratifs: ["Inscription tableau d avancement", "Arrêté individuel"]
              }
            ]
          },
          {
            gradeCibleId: "bibliothecaire_territorial_normal",
            nomGradeCible: "Bibliothécaire territorial (Catégorie A)",
            categorieCible: "A",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Quotas CDG promotion interne B -> A.",
            modaliteReclassement: "Reclassement en catégorie A avec clause de sauvegarde indiciaire.",
            explicationReclassement: "Direction de médiathèque et pilotage de la politique documentaire.",
            conditions: [
              {
                typeVoie: "examen_professionnel",
                descriptionVoie: "Promotion interne B -> A par Examen Professionnel",
                echelonMinimum: 6,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 8,
                examenProfessionnelRequis: true,
                piecesRequises: ["Examen pro Bibliothécaire CDG", "8 ans de services publics dont 4 ans en B"],
                actesAdministratifs: ["Liste aptitude CDG", "Arrêté individuel de nomination"]
              }
            ]
          },
          {
            gradeCibleId: "attache_conservation_normal",
            nomGradeCible: "Attaché de conservation du patrimoine (Catégorie A)",
            categorieCible: "A",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Quotas CDG promotion interne B -> A.",
            modaliteReclassement: "Reclassement en A.",
            explicationReclassement: "Conservation et valorisation scientifique du patrimoine.",
            conditions: [
              {
                typeVoie: "examen_professionnel",
                descriptionVoie: "Promotion interne B -> A par Examen Professionnel",
                echelonMinimum: 6,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 8,
                examenProfessionnelRequis: true,
                piecesRequises: ["Examen pro Attaché de conservation CDG", "8 ans de services publics dont 4 ans en B"],
                actesAdministratifs: ["Liste aptitude CDG", "Arrêté individuel"]
              }
            ]
          }
        ]
      },
      {
        id: "assistant_conservation_principal_2cl",
        nom: "Assistant de conservation principal de 2e classe (B2)",
        filiere: "Culturelle",
        categorie: "B",
        descriptionGrade: "Deuxième grade du cadre d emplois (NES B2). Coordination d équipes d adjoints, responsabilité de secteur de médiathèque ou de fonds d archives.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 401, indiceMajore: 376 },
          { numero: 2, dureeAnnees: 1, indiceBrut: 415, indiceMajore: 377 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 429, indiceMajore: 384 },
          { numero: 4, dureeAnnees: 2, indiceBrut: 444, indiceMajore: 395 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 458, indiceMajore: 406 },
          { numero: 6, dureeAnnees: 2, indiceBrut: 480, indiceMajore: 421, description: "Accès examen pro Assistant Principal 1re cl. après 1 an" },
          { numero: 7, dureeAnnees: 3, indiceBrut: 506, indiceMajore: 441, description: "Accès au choix Assistant Principal 1re cl. après 1 an" },
          { numero: 8, dureeAnnees: 3, indiceBrut: 528, indiceMajore: 457 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 542, indiceMajore: 466 },
          { numero: 10, dureeAnnees: 3, indiceBrut: 567, indiceMajore: 485 },
          { numero: 11, dureeAnnees: 4, indiceBrut: 599, indiceMajore: 509 },
          { numero: 12, dureeAnnees: 0, indiceBrut: 638, indiceMajore: 539, description: "Sommet B2 (IM 539)" }
        ],
        perspectives: [
          {
            gradeCibleId: "assistant_conservation_principal_1cl",
            nomGradeCible: "Assistant de conservation principal de 1re classe (B3)",
            categorieCible: "B",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Taux fixé par la collectivité.",
            modaliteReclassement: "Reclassement à indice égal ou immédiatement supérieur.",
            explicationReclassement: "Accès au grade sommital de catégorie B culturelle.",
            conditions: [
              {
                typeVoie: "examen_professionnel",
                descriptionVoie: "Examen professionnel",
                echelonMinimum: 6,
                ancienneteEchelonAnnees: 1,
                ancienneteGradeAnnees: 3,
                examenProfessionnelRequis: true,
                piecesRequises: ["Réussite examen pro CDG", "Évaluations annuelles"],
                actesAdministratifs: ["Tableau annuel d avancement", "Arrêté individuel"]
              },
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 7,
                ancienneteEchelonAnnees: 1,
                ancienneteGradeAnnees: 5,
                examenProfessionnelRequis: false,
                piecesRequises: ["1 an au 7e échelon et 5 ans en catégorie B", "Comptes-rendus EPA"],
                actesAdministratifs: ["Inscription tableau d avancement", "Arrêté individuel"]
              }
            ]
          },
          {
            gradeCibleId: "bibliothecaire_territorial_normal",
            nomGradeCible: "Bibliothécaire territorial (Catégorie A)",
            categorieCible: "A",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Promotion interne sur liste d aptitude CDG.",
            modaliteReclassement: "Reclassement en catégorie A.",
            explicationReclassement: "Passage vers l encadrement supérieur en bibliothèque.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Promotion interne au choix vers Bibliothécaire",
                echelonMinimum: 6,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 10,
                examenProfessionnelRequis: false,
                piecesRequises: ["10 ans de services effectifs dont 5 ans en catégorie B", "Dossier professionnel"],
                actesAdministratifs: ["Inscription liste d aptitude CDG", "Arrêté individuel"]
              }
            ]
          }
        ]
      },
      {
        id: "assistant_conservation_principal_1cl",
        nom: "Assistant de conservation principal de 1re classe (B3)",
        filiere: "Culturelle",
        categorie: "B",
        descriptionGrade: "Grade sommital des assistants de conservation (NES B3). Responsabilité d un établissement culturel communal, gestion de projets patrimoniaux d envergure.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 446, indiceMajore: 397 },
          { numero: 2, dureeAnnees: 2, indiceBrut: 461, indiceMajore: 409 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 484, indiceMajore: 424 },
          { numero: 4, dureeAnnees: 2, indiceBrut: 513, indiceMajore: 446 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 547, indiceMajore: 470 },
          { numero: 6, dureeAnnees: 3, indiceBrut: 573, indiceMajore: 489 },
          { numero: 7, dureeAnnees: 3, indiceBrut: 604, indiceMajore: 513 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 638, indiceMajore: 539 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 660, indiceMajore: 556 },
          { numero: 10, dureeAnnees: 3, indiceBrut: 684, indiceMajore: 574 },
          { numero: 11, dureeAnnees: 0, indiceBrut: 707, indiceMajore: 592, description: "Sommet B3 (IM 592)" }
        ],
        perspectives: [
          {
            gradeCibleId: "bibliothecaire_territorial_normal",
            nomGradeCible: "Bibliothécaire territorial (Catégorie A)",
            categorieCible: "A",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Promotion interne sur liste d aptitude CDG.",
            modaliteReclassement: "Reclassement en catégorie A.",
            explicationReclassement: "Passage en catégorie A culturelle.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Promotion interne au choix vers Bibliothécaire",
                echelonMinimum: 4,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 10,
                examenProfessionnelRequis: false,
                piecesRequises: ["10 ans de services effectifs dont 5 ans en catégorie B", "Rapport hiérarchique"],
                actesAdministratifs: ["Inscription liste aptitude CDG", "Arrêté individuel"]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "bibliothecaire_territorial",
    nom: "Bibliothécaire territorial",
    filiere: "Culturelle",
    categorie: "A",
    decretReference: "Décret n° 91-845 du 2 septembre 1991 modifié portant statut particulier du cadre d emplois des bibliothécaires territoriaux",
    grades: [
      {
        id: "bibliothecaire_territorial_normal",
        nom: "Bibliothécaire territorial",
        filiere: "Culturelle",
        categorie: "A",
        descriptionGrade: "Grade d entrée en catégorie A de la lecture publique. Direction de médiathèques, conception et mise en œuvre de la politique de lecture publique et numérique.",
        echelons: [
          { numero: 1, dureeAnnees: 1.5, indiceBrut: 444, indiceMajore: 395, description: "Stage probatoire" },
          { numero: 2, dureeAnnees: 2, indiceBrut: 469, indiceMajore: 415 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 499, indiceMajore: 435 },
          { numero: 4, dureeAnnees: 2, indiceBrut: 525, indiceMajore: 455 },
          { numero: 5, dureeAnnees: 2.5, indiceBrut: 567, indiceMajore: 485, description: "Accès examen pro Bibliothécaire Principal" },
          { numero: 6, dureeAnnees: 3, indiceBrut: 611, indiceMajore: 518 },
          { numero: 7, dureeAnnees: 3, indiceBrut: 653, indiceMajore: 550, description: "Accès au choix Bibliothécaire Principal" },
          { numero: 8, dureeAnnees: 3, indiceBrut: 693, indiceMajore: 580 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 732, indiceMajore: 610 },
          { numero: 10, dureeAnnees: 4, indiceBrut: 778, indiceMajore: 645 },
          { numero: 11, dureeAnnees: 0, indiceBrut: 821, indiceMajore: 678, description: "Sommet grade Bibliothécaire (IM 678)" }
        ],
        perspectives: [
          {
            gradeCibleId: "bibliothecaire_territorial_principal",
            nomGradeCible: "Bibliothécaire principal",
            categorieCible: "A",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Taux fixé par la collectivité après avis du CST.",
            modaliteReclassement: "Reclassement à indice égal ou immédiatement supérieur.",
            explicationReclassement: "Accès au grade supérieur pour direction de réseaux de médiathèques.",
            conditions: [
              {
                typeVoie: "examen_professionnel",
                descriptionVoie: "Examen professionnel",
                echelonMinimum: 5,
                ancienneteEchelonAnnees: 0,
                ancienneteCadreAnnees: 3,
                examenProfessionnelRequis: true,
                piecesRequises: ["Réussite examen pro CDG", "Dossier RAEP", "Évaluations EPA"],
                actesAdministratifs: ["Tableau annuel d avancement", "Arrêté individuel"]
              },
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 7,
                ancienneteEchelonAnnees: 0,
                ancienneteCadreAnnees: 7,
                examenProfessionnelRequis: false,
                piecesRequises: ["Au moins 7e échelon et 7 ans de services effectifs en catégorie A", "Comptes-rendus EPA"],
                actesAdministratifs: ["Inscription tableau d avancement", "Arrêté individuel"]
              }
            ]
          }
        ]
      },
      {
        id: "bibliothecaire_territorial_principal",
        nom: "Bibliothécaire principal",
        filiere: "Culturelle",
        categorie: "A",
        descriptionGrade: "Deuxième grade des bibliothécaires. Direction de réseaux de lecture publique, pilotage de grands projets culturels territoriaux.",
        echelons: [
          { numero: 1, dureeAnnees: 2, indiceBrut: 593, indiceMajore: 505 },
          { numero: 2, dureeAnnees: 2, indiceBrut: 639, indiceMajore: 540 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 693, indiceMajore: 580 },
          { numero: 4, dureeAnnees: 2, indiceBrut: 732, indiceMajore: 610 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 791, indiceMajore: 655 },
          { numero: 6, dureeAnnees: 2.5, indiceBrut: 843, indiceMajore: 695 },
          { numero: 7, dureeAnnees: 2.5, indiceBrut: 896, indiceMajore: 735 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 946, indiceMajore: 773 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 995, indiceMajore: 811 },
          { numero: 10, dureeAnnees: 0, indiceBrut: 1015, indiceMajore: 826, description: "Sommet Bibliothécaire Principal (IM 826)" }
        ],
        perspectives: []
      }
    ]
  },
  {
    id: "attache_conservation",
    nom: "Attaché territorial de conservation du patrimoine",
    filiere: "Culturelle",
    categorie: "A",
    decretReference: "Décret n° 91-843 du 2 septembre 1991 modifié portant statut particulier du cadre d emplois des attachés territoriaux de conservation du patrimoine",
    grades: [
      {
        id: "attache_conservation_normal",
        nom: "Attaché de conservation du patrimoine",
        filiere: "Culturelle",
        categorie: "A",
        descriptionGrade: "Grade d entrée en catégorie A de la conservation patrimoniale. Étude, classement, conservation et mise en valeur des collections de musées, monuments et archives.",
        echelons: [
          { numero: 1, dureeAnnees: 1.5, indiceBrut: 444, indiceMajore: 395, description: "Stage probatoire" },
          { numero: 2, dureeAnnees: 2, indiceBrut: 469, indiceMajore: 415 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 499, indiceMajore: 435 },
          { numero: 4, dureeAnnees: 2, indiceBrut: 525, indiceMajore: 455 },
          { numero: 5, dureeAnnees: 2.5, indiceBrut: 567, indiceMajore: 485, description: "Accès examen pro Attaché Principal" },
          { numero: 6, dureeAnnees: 3, indiceBrut: 611, indiceMajore: 518 },
          { numero: 7, dureeAnnees: 3, indiceBrut: 653, indiceMajore: 550, description: "Accès au choix Attaché Principal" },
          { numero: 8, dureeAnnees: 3, indiceBrut: 693, indiceMajore: 580 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 732, indiceMajore: 610 },
          { numero: 10, dureeAnnees: 4, indiceBrut: 778, indiceMajore: 645 },
          { numero: 11, dureeAnnees: 0, indiceBrut: 821, indiceMajore: 678, description: "Sommet Attaché de conservation (IM 678)" }
        ],
        perspectives: [
          {
            gradeCibleId: "attache_conservation_principal",
            nomGradeCible: "Attaché principal de conservation du patrimoine",
            categorieCible: "A",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Taux fixé par la collectivité après avis CST.",
            modaliteReclassement: "Reclassement à indice égal ou immédiatement supérieur.",
            explicationReclassement: "Accès aux fonctions de direction d établissements patrimoniaux et muséaux.",
            conditions: [
              {
                typeVoie: "examen_professionnel",
                descriptionVoie: "Examen professionnel",
                echelonMinimum: 5,
                ancienneteEchelonAnnees: 0,
                ancienneteCadreAnnees: 3,
                examenProfessionnelRequis: true,
                piecesRequises: ["Réussite examen pro CDG", "Dossier scientifique et professionnel", "Comptes-rendus EPA"],
                actesAdministratifs: ["Tableau annuel d avancement", "Arrêté individuel"]
              },
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 7,
                ancienneteEchelonAnnees: 0,
                ancienneteCadreAnnees: 7,
                examenProfessionnelRequis: false,
                piecesRequises: ["Au moins 7e échelon et 7 ans de services effectifs en catégorie A", "Évaluations annuelles"],
                actesAdministratifs: ["Inscription tableau d avancement", "Arrêté individuel"]
              }
            ]
          }
        ]
      },
      {
        id: "attache_conservation_principal",
        nom: "Attaché principal de conservation du patrimoine",
        filiere: "Culturelle",
        categorie: "A",
        descriptionGrade: "Deuxième grade des attachés de conservation. Direction scientifique de musées, d archives ou de services patrimoniaux.",
        echelons: [
          { numero: 1, dureeAnnees: 2, indiceBrut: 593, indiceMajore: 505 },
          { numero: 2, dureeAnnees: 2, indiceBrut: 639, indiceMajore: 540 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 693, indiceMajore: 580 },
          { numero: 4, dureeAnnees: 2, indiceBrut: 732, indiceMajore: 610 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 791, indiceMajore: 655 },
          { numero: 6, dureeAnnees: 2.5, indiceBrut: 843, indiceMajore: 695 },
          { numero: 7, dureeAnnees: 2.5, indiceBrut: 896, indiceMajore: 735 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 946, indiceMajore: 773 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 995, indiceMajore: 811 },
          { numero: 10, dureeAnnees: 0, indiceBrut: 1015, indiceMajore: 826, description: "Sommet Attaché Principal de conservation (IM 826)" }
        ],
        perspectives: []
      }
    ]
  },
  // =========================================================================
  // FILIÈRE ANIMATION
  // =========================================================================
  {
    id: "adjoint_animation",
    nom: "Adjoint territorial d'animation",
    filiere: "Animation",
    categorie: "C",
    decretReference: "Décret n° 2006-1693 du 22 décembre 2006 modifié portant statut particulier du cadre d emplois des adjoints territoriaux d animation et Décret n° 2016-596",
    grades: [
      {
        id: "adjoint_animation_c1",
        nom: "Adjoint d'animation (C1)",
        filiere: "Animation",
        categorie: "C",
        descriptionGrade: "Grade d entrée sans concours en catégorie C animation (Échelle C1). Accueil périscolaire, encadrement des activités de loisirs et surveillance de la jeunesse.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 367, indiceMajore: 366, description: "Minimum de traitement garanti" },
          { numero: 2, dureeAnnees: 1, indiceBrut: 368, indiceMajore: 367 },
          { numero: 3, dureeAnnees: 1, indiceBrut: 370, indiceMajore: 368 },
          { numero: 4, dureeAnnees: 1, indiceBrut: 371, indiceMajore: 369 },
          { numero: 5, dureeAnnees: 1, indiceBrut: 374, indiceMajore: 370 },
          { numero: 6, dureeAnnees: 1, indiceBrut: 378, indiceMajore: 371 },
          { numero: 7, dureeAnnees: 3, indiceBrut: 381, indiceMajore: 372 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 387, indiceMajore: 373 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 401, indiceMajore: 376 },
          { numero: 10, dureeAnnees: 4, indiceBrut: 419, indiceMajore: 377 },
          { numero: 11, dureeAnnees: 0, indiceBrut: 432, indiceMajore: 387, description: "Sommet C1" }
        ],
        perspectives: [
          {
            gradeCibleId: "adjoint_animation_principal_2cl",
            nomGradeCible: "Adjoint d'animation principal de 2e classe (C2)",
            categorieCible: "C",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Taux fixé par la collectivité après avis du CST.",
            modaliteReclassement: "Reclassement à échelon d indice équivalent ou immédiatement supérieur.",
            explicationReclassement: "Accès à l échelle C2 avec déroulement jusqu à l échelon 12.",
            conditions: [
              {
                typeVoie: "examen_professionnel",
                descriptionVoie: "Examen professionnel C1 -> C2",
                echelonMinimum: 4,
                ancienneteEchelonAnnees: 0,
                ancienneteGradeAnnees: 3,
                examenProfessionnelRequis: true,
                piecesRequises: ["Attestation de réussite examen C2 délivrée par le CDG", "Évaluations annuelles"],
                actesAdministratifs: ["Tableau d avancement annuel", "Arrêté individuel"]
              },
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 5,
                ancienneteEchelonAnnees: 0,
                ancienneteGradeAnnees: 5,
                examenProfessionnelRequis: false,
                piecesRequises: ["5 ans de services effectifs accomplis en C1", "Dossier professionnel"],
                actesAdministratifs: ["Inscription tableau d avancement", "Arrêté individuel"]
              }
            ]
          },
          {
            gradeCibleId: "animateur_classe_normale",
            nomGradeCible: "Animateur territorial (Catégorie B)",
            categorieCible: "B",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Promotion interne sur liste d aptitude CDG (quotas catégorie B).",
            modaliteReclassement: "Reclassement en catégorie B avec clause de sauvegarde indiciaire.",
            explicationReclassement: "Passage vers les fonctions d encadrement, de conception pédagogique et d animation de projets.",
            conditions: [
              {
                typeVoie: "examen_professionnel",
                descriptionVoie: "Promotion interne B par Examen Professionnel",
                echelonMinimum: 4,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 7,
                examenProfessionnelRequis: true,
                piecesRequises: ["Réussite examen pro Animateur CDG", "7 ans de services publics dont 4 ans en C"],
                actesAdministratifs: ["Inscription liste d aptitude CDG", "Arrêté individuel de nomination stagiaire"]
              },
              {
                typeVoie: "au_choix",
                descriptionVoie: "Promotion interne B au choix",
                echelonMinimum: 5,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 9,
                examenProfessionnelRequis: false,
                piecesRequises: ["9 ans de services effectifs", "Dossier EPA", "Attestations de formation CNFPT"],
                actesAdministratifs: ["Liste aptitude CDG", "Arrêté individuel"]
              }
            ]
          }
        ]
      },
      {
        id: "adjoint_animation_principal_2cl",
        nom: "Adjoint d'animation principal de 2e classe (C2)",
        filiere: "Animation",
        categorie: "C",
        descriptionGrade: "Deuxième grade de catégorie C animation (Échelle C2). Organisation d activités périscolaires et de loisirs, encadrement d animateurs vacataires ou C1.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 368, indiceMajore: 367 },
          { numero: 2, dureeAnnees: 1, indiceBrut: 371, indiceMajore: 369 },
          { numero: 3, dureeAnnees: 1, indiceBrut: 376, indiceMajore: 370 },
          { numero: 4, dureeAnnees: 1, indiceBrut: 387, indiceMajore: 373 },
          { numero: 5, dureeAnnees: 1, indiceBrut: 396, indiceMajore: 374 },
          { numero: 6, dureeAnnees: 1, indiceBrut: 404, indiceMajore: 376, description: "Accès promouvabilité C3" },
          { numero: 7, dureeAnnees: 2, indiceBrut: 416, indiceMajore: 377 },
          { numero: 8, dureeAnnees: 2, indiceBrut: 430, indiceMajore: 385 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 446, indiceMajore: 397 },
          { numero: 10, dureeAnnees: 3, indiceBrut: 461, indiceMajore: 409 },
          { numero: 11, dureeAnnees: 4, indiceBrut: 473, indiceMajore: 417 },
          { numero: 12, dureeAnnees: 0, indiceBrut: 486, indiceMajore: 425, description: "Sommet C2 (IM 425)" }
        ],
        perspectives: [
          {
            gradeCibleId: "adjoint_animation_principal_1cl",
            nomGradeCible: "Adjoint d'animation principal de 1re classe (C3)",
            categorieCible: "C",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Taux fixé par l assemblée délibérante.",
            modaliteReclassement: "Reclassement à échelon d indice équivalent dans l échelle C3.",
            explicationReclassement: "Grade sommital de catégorie C animation.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 6,
                ancienneteEchelonAnnees: 1,
                ancienneteGradeAnnees: 5,
                examenProfessionnelRequis: false,
                piecesRequises: ["1 an au 6e échelon et 5 ans de services effectifs en C2", "Évaluations annuelles"],
                actesAdministratifs: ["Inscription tableau d avancement", "Arrêté individuel"]
              }
            ]
          },
          {
            gradeCibleId: "animateur_classe_normale",
            nomGradeCible: "Animateur territorial (Catégorie B)",
            categorieCible: "B",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Listes d aptitude CDG.",
            modaliteReclassement: "Reclassement en B avec garantie du traitement.",
            explicationReclassement: "Évolution vers la catégorie B.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Promotion interne B au choix",
                echelonMinimum: 5,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 8,
                examenProfessionnelRequis: false,
                piecesRequises: ["8 ans de services effectifs", "Dossier EPA", "Attestations de formation CNFPT"],
                actesAdministratifs: ["Liste aptitude CDG", "Arrêté individuel"]
              }
            ]
          }
        ]
      },
      {
        id: "adjoint_animation_principal_1cl",
        nom: "Adjoint d'animation principal de 1re classe (C3)",
        filiere: "Animation",
        categorie: "C",
        descriptionGrade: "Grade sommital de la catégorie C animation (Échelle C3). Encadrement et coordination d équipes périscolaires ou de structures d accueil de loisirs.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 388, indiceMajore: 373 },
          { numero: 2, dureeAnnees: 1, indiceBrut: 397, indiceMajore: 375 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 412, indiceMajore: 376 },
          { numero: 4, dureeAnnees: 2, indiceBrut: 430, indiceMajore: 385 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 448, indiceMajore: 398 },
          { numero: 6, dureeAnnees: 2, indiceBrut: 460, indiceMajore: 408 },
          { numero: 7, dureeAnnees: 3, indiceBrut: 478, indiceMajore: 420 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 499, indiceMajore: 435 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 525, indiceMajore: 455 },
          { numero: 10, dureeAnnees: 0, indiceBrut: 558, indiceMajore: 478, description: "Sommet C3 (IM 478)" }
        ],
        perspectives: [
          {
            gradeCibleId: "animateur_classe_normale",
            nomGradeCible: "Animateur territorial (Catégorie B)",
            categorieCible: "B",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Listes d aptitude CDG.",
            modaliteReclassement: "Reclassement en B avec garantie du traitement.",
            explicationReclassement: "Passage en catégorie B animation.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Promotion interne B au choix",
                echelonMinimum: 4,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 8,
                examenProfessionnelRequis: false,
                piecesRequises: ["8 ans de services effectifs", "Dossier professionnel"],
                actesAdministratifs: ["Liste aptitude CDG", "Arrêté individuel"]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "animateur_territorial",
    nom: "Animateur territorial",
    filiere: "Animation",
    categorie: "B",
    decretReference: "Décret n° 2011-558 du 20 mai 2011 modifié portant statut particulier du cadre d emplois des animateurs territoriaux et Décrets n° 2010-329, n° 2022-1200 et n° 2022-1201 (revalorisation B)",
    grades: [
      {
        id: "animateur_classe_normale",
        nom: "Animateur (Classe normale - B1)",
        filiere: "Animation",
        categorie: "B",
        descriptionGrade: "Premier grade du cadre d emplois des animateurs (Catégorie B - NES B1). Conception, coordination et mise en œuvre des activités éducatives, de loisirs, de médiation sociale et de développement des quartiers.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 389, indiceMajore: 373, description: "Stage probatoire avant titularisation" },
          { numero: 2, dureeAnnees: 1, indiceBrut: 395, indiceMajore: 374 },
          { numero: 3, dureeAnnees: 1, indiceBrut: 397, indiceMajore: 375 },
          { numero: 4, dureeAnnees: 1, indiceBrut: 401, indiceMajore: 376 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 415, indiceMajore: 377 },
          { numero: 6, dureeAnnees: 2, indiceBrut: 431, indiceMajore: 386, description: "Accès examen pro Animateur Principal 2e cl." },
          { numero: 7, dureeAnnees: 2, indiceBrut: 452, indiceMajore: 401 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 478, indiceMajore: 420, description: "Accès au choix Animateur Principal 2e cl. après 1 an" },
          { numero: 9, dureeAnnees: 3, indiceBrut: 500, indiceMajore: 436 },
          { numero: 10, dureeAnnees: 3, indiceBrut: 513, indiceMajore: 446 },
          { numero: 11, dureeAnnees: 3, indiceBrut: 538, indiceMajore: 462 },
          { numero: 12, dureeAnnees: 4, indiceBrut: 563, indiceMajore: 482 },
          { numero: 13, dureeAnnees: 0, indiceBrut: 597, indiceMajore: 508, description: "Sommet de la classe normale B1" }
        ],
        perspectives: [
          {
            gradeCibleId: "animateur_principal_2cl",
            nomGradeCible: "Animateur principal de 2e classe (B2)",
            categorieCible: "B",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Taux fixé par délibération de la collectivité après avis du CST. Souvent compris entre 30% et 60% des agents promouvables.",
            modaliteReclassement: "Reclassement à l échelon comportant un indice égal ou immédiatement supérieur avec conservation d ancienneté si le gain indiciaire est inférieur à un avancement d échelon.",
            explicationReclassement: "Par exemple, un agent au 8e échelon (IM 420) est reclassé au 6e échelon de 2e classe (IM 421) avec conservation de son ancienneté acquise.",
            conditions: [
              {
                typeVoie: "examen_professionnel",
                descriptionVoie: "Examen professionnel",
                echelonMinimum: 6,
                ancienneteEchelonAnnees: 0,
                ancienneteCadreAnnees: 3,
                examenProfessionnelRequis: true,
                piecesRequises: [
                  "Attestation de réussite à l examen professionnel organisée par le Centre de Gestion (CDG)",
                  "Rapports d entretien professionnel annuel (EPA)",
                  "Attestation de suivi des formations d intégration et de professionnalisation obligatoire (CNFPT)"
                ],
                actesAdministratifs: [
                  "Consultation des Lignes Directrices de Gestion (LDG)",
                  "Arrêté portant tableau annuel d avancement signé par l autorité territoriale",
                  "Arrêté individuel de nomination et reclassement indiciaire"
                ]
              },
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 8,
                ancienneteEchelonAnnees: 1,
                ancienneteCadreAnnees: 5,
                examenProfessionnelRequis: false,
                piecesRequises: [
                  "Justificatif d 1 an au moins dans le 8e échelon et 5 ans de services effectifs accomplis en catégorie B",
                  "Comptes-rendus d entretien professionnel",
                  "Dossier professionnel valorisant les acquis de l expérience"
                ],
                actesAdministratifs: [
                  "Inscription au tableau annuel selon les critères LDG",
                  "Application du ratio promus/promouvables",
                  "Arrêté individuel de nomination au grade supérieur"
                ]
              }
            ]
          },
          {
            gradeCibleId: "attache_grade_normal",
            nomGradeCible: "Attaché territorial (Catégorie A)",
            categorieCible: "A",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Quotas départementaux stricts de promotion interne gérés au niveau du CDG.",
            modaliteReclassement: "Reclassement en catégorie A avec conservation du traitement indiciaire (clause de sauvegarde indiciaire).",
            explicationReclassement: "Passage du cadre de catégorie B vers la catégorie A (fonctions de direction, conception de politiques publiques et encadrement supérieur).",
            conditions: [
              {
                typeVoie: "examen_professionnel",
                descriptionVoie: "Promotion interne B -> A par Examen Professionnel",
                echelonMinimum: 6,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 8,
                examenProfessionnelRequis: true,
                piecesRequises: [
                  "Lauréat de l examen professionnel Attaché du CDG",
                  "Au moins 8 ans de services publics dont 4 ans en catégorie B"
                ],
                actesAdministratifs: ["Inscription sur liste d aptitude CDG", "Arrêté individuel de nomination stagiaire A"]
              }
            ]
          }
        ]
      },
      {
        id: "animateur_principal_2cl",
        nom: "Animateur principal de 2e classe (B2)",
        filiere: "Animation",
        categorie: "B",
        descriptionGrade: "Deuxième grade du cadre d emplois des animateurs territoriaux (NES B2). Coordination d équipements socio-culturels ou de jeunesse, pilotage de projets territoriaux et encadrement d équipes.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 401, indiceMajore: 376 },
          { numero: 2, dureeAnnees: 1, indiceBrut: 415, indiceMajore: 377 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 429, indiceMajore: 384 },
          { numero: 4, dureeAnnees: 2, indiceBrut: 444, indiceMajore: 395 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 458, indiceMajore: 406 },
          { numero: 6, dureeAnnees: 2, indiceBrut: 480, indiceMajore: 421, description: "Accès examen pro Animateur Principal 1re cl. après 1 an" },
          { numero: 7, dureeAnnees: 3, indiceBrut: 506, indiceMajore: 441, description: "Accès au choix Animateur Principal 1re cl. après 1 an" },
          { numero: 8, dureeAnnees: 3, indiceBrut: 528, indiceMajore: 457 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 542, indiceMajore: 466 },
          { numero: 10, dureeAnnees: 3, indiceBrut: 567, indiceMajore: 485 },
          { numero: 11, dureeAnnees: 4, indiceBrut: 599, indiceMajore: 509 },
          { numero: 12, dureeAnnees: 0, indiceBrut: 638, indiceMajore: 539, description: "Sommet B2" }
        ],
        perspectives: [
          {
            gradeCibleId: "animateur_principal_1cl",
            nomGradeCible: "Animateur principal de 1re classe (B3)",
            categorieCible: "B",
            typePerspective: "avancement_grade",
            ratioPromusPromouvablesExplication: "Taux fixé par l assemblée délibérante.",
            modaliteReclassement: "Reclassement à indice égal ou immédiatement supérieur.",
            explicationReclassement: "Accès au grade sommital du cadre d emplois.",
            conditions: [
              {
                typeVoie: "examen_professionnel",
                descriptionVoie: "Examen professionnel 1re classe",
                echelonMinimum: 6,
                ancienneteEchelonAnnees: 1,
                ancienneteGradeAnnees: 3,
                examenProfessionnelRequis: true,
                piecesRequises: ["Certificat de réussite examen pro CDG", "Entretiens pro", "Attestation formation"],
                actesAdministratifs: ["Tableau annuel d avancement", "Arrêté individuel"]
              },
              {
                typeVoie: "au_choix",
                descriptionVoie: "Au choix",
                echelonMinimum: 7,
                ancienneteEchelonAnnees: 1,
                ancienneteGradeAnnees: 5,
                examenProfessionnelRequis: false,
                piecesRequises: ["1 an au 7e échelon et 5 ans de services effectifs accomplis en B", "Évaluations annuelles"],
                actesAdministratifs: ["Inscription tableau d avancement", "Arrêté individuel"]
              }
            ]
          },
          {
            gradeCibleId: "attache_grade_normal",
            nomGradeCible: "Attaché territorial (Catégorie A)",
            categorieCible: "A",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Promotion interne sur liste d aptitude CDG.",
            modaliteReclassement: "Reclassement en A avec garantie de traitement.",
            explicationReclassement: "Passage vers l encadrement supérieur.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Promotion interne B -> A au choix",
                echelonMinimum: 6,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 10,
                examenProfessionnelRequis: false,
                piecesRequises: ["Au moins 10 ans de services effectifs dont 5 ans en catégorie B", "Dossier professionnel"],
                actesAdministratifs: ["Inscription liste aptitude CDG", "Arrêté individuel"]
              }
            ]
          }
        ]
      },
      {
        id: "animateur_principal_1cl",
        nom: "Animateur principal de 1re classe (B3)",
        filiere: "Animation",
        categorie: "B",
        descriptionGrade: "Grade sommital du cadre d emplois des animateurs territoriaux (NES B3). Direction de structures d animation importantes, conception et pilotage de politiques jeunesse et socio-éducatives à l échelle communale ou intercommunale.",
        echelons: [
          { numero: 1, dureeAnnees: 1, indiceBrut: 446, indiceMajore: 397 },
          { numero: 2, dureeAnnees: 2, indiceBrut: 461, indiceMajore: 409 },
          { numero: 3, dureeAnnees: 2, indiceBrut: 484, indiceMajore: 424 },
          { numero: 4, dureeAnnees: 2, indiceBrut: 513, indiceMajore: 446 },
          { numero: 5, dureeAnnees: 2, indiceBrut: 547, indiceMajore: 470 },
          { numero: 6, dureeAnnees: 3, indiceBrut: 573, indiceMajore: 489 },
          { numero: 7, dureeAnnees: 3, indiceBrut: 604, indiceMajore: 513 },
          { numero: 8, dureeAnnees: 3, indiceBrut: 638, indiceMajore: 539 },
          { numero: 9, dureeAnnees: 3, indiceBrut: 660, indiceMajore: 556 },
          { numero: 10, dureeAnnees: 3, indiceBrut: 684, indiceMajore: 574 },
          { numero: 11, dureeAnnees: 0, indiceBrut: 707, indiceMajore: 592, description: "Sommet Catégorie B (IM 592)" }
        ],
        perspectives: [
          {
            gradeCibleId: "attache_grade_normal",
            nomGradeCible: "Attaché territorial (Catégorie A)",
            categorieCible: "A",
            typePerspective: "promotion_interne",
            ratioPromusPromouvablesExplication: "Promotion interne sur liste d aptitude CDG.",
            modaliteReclassement: "Reclassement avec reprise d indice en catégorie A.",
            explicationReclassement: "Passage vers l encadrement supérieur en catégorie A.",
            conditions: [
              {
                typeVoie: "au_choix",
                descriptionVoie: "Promotion interne au choix vers Attaché (Catégorie A)",
                echelonMinimum: 4,
                ancienneteEchelonAnnees: 0,
                ancienneteServicesPublicsAnnees: 10,
                examenProfessionnelRequis: false,
                piecesRequises: [
                  "Justificatif de 10 ans de services effectifs dans un corps/cadre d emplois de catégorie B",
                  "Avis circonstancié de l autorité territoriale",
                  "Attestations de formation CNFPT"
                ],
                actesAdministratifs: [
                  "Inscription sur la liste d aptitude établie par le Président du Centre de Gestion",
                  "Arrêté de nomination en qualité d Attaché stagiaire"
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

export const CADRES_EMPLOIS: CadreEmploiDefinition[] = [
  CADRES_EMPLOIS_RAW.find(c => c.id === "adjoint_administratif")!,
  ...CADRES_EMPLOIS_RAW.filter(c => c.id !== "adjoint_administratif")
];

export const MOTIFS_DISPONIBILITE = [
  {
    code: "convenance_personnelle_avec_activite",
    libelle: "Disponibilité pour convenance personnelle avec activité professionnelle (> 600h/an)",
    maintienAvancementMaxAnnees: 5,
    justificatifs: [
      "Contrat de travail ou bulletins de paie justifiant d au moins 600 heures de travail annuel",
      "Pour activité indépendante : déclaration URSSAF attestant d un revenu brut annuel suffisant",
      "Attestation sur l honneur transmise chaque année avant le 31 décembre à la DRH"
    ],
    explication: "Décret n° 2019-234 du 27 mars 2019 : L agent conserve ses droits à l avancement d échelon et de grade pendant une durée maximale de 5 ans sur l ensemble de sa carrière."
  },
  {
    code: "convenance_personnelle_sans_activite",
    libelle: "Disponibilité pour convenance personnelle sans activité professionnelle",
    maintienAvancementMaxAnnees: 0,
    justificatifs: [
      "Arrêté de mise en disponibilité signé par l autorité",
      "Demande de réintégration formulée 3 mois au moins avant le terme"
    ],
    explication: "Règle générale : suspension totale de la rémunération et interruption de l ancienneté pour l avancement d échelon et de grade. La date du prochain échelon est décalée d autant de mois que la durée de la disponibilité."
  },
  {
    code: "elever_enfant",
    libelle: "Disponibilité pour élever un enfant de moins de 12 ans",
    maintienAvancementMaxAnnees: 5,
    justificatifs: [
      "Copie intégrale du livret de famille ou extrait d acte de naissance",
      "Demande de renouvellement annuel"
    ],
    explication: "Accordée de droit. L agent conserve ses droits à l avancement d échelon et de grade pendant une durée maximale de 5 ans sur l ensemble de la carrière (CGFP art. L514-2)."
  },
  {
    code: "suivre_conjoint",
    libelle: "Disponibilité pour suivre son conjoint ou partenaire de PACS",
    maintienAvancementMaxAnnees: 0,
    justificatifs: [
      "Justificatif professionnel du conjoint (mutation, nouveau contrat)",
      "Attestation de vie commune (PACS, certificat de mariage, bail)"
    ],
    explication: "Accordée de droit sans limitation de durée. Suspension de l avancement sauf si l agent exerce une activité professionnelle d au moins 600h/an."
  }
];
