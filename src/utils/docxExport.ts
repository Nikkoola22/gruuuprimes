/**
 * Générateur et Exportateur officiel de documents .DOCX
 * Conforme à la Charte Bureautique de la Ville de Gennevilliers
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber
} from 'docx';
import { saveAs } from 'file-saver';

export interface DocxGenerationOptions {
  title: string;
  category?: string;
  content: string;
  rawText: string;
  docType?: 'arrete' | 'decision' | 'contrat' | 'circulaire' | 'deliberation';
}

/**
 * Détecte la typologie de l'acte administratif
 */
export function detectDocumentType(rawText: string): 'arrete' | 'decision' | 'contrat' | 'circulaire' | 'deliberation' {
  if (rawText.includes("NOTE DE SERVICE") || rawText.includes("CIRCULAIRE")) return 'circulaire';
  if (rawText.includes("CONTRAT D'ENGAGEMENT") || rawText.includes("CONTRAT")) return 'contrat';
  if (rawText.includes("DÉLIBÉRATION") || rawText.includes("CONSEIL MUNICIPAL")) return 'deliberation';
  if (rawText.includes("DÉCISION DU MAIRE") || rawText.includes("DÉCIDE :")) return 'decision';
  return 'arrete';
}

/**
 * Génère et télécharge un fichier .docx officiel mis en page selon la charte bureautique
 */
export async function exportToOfficialDocx(options: DocxGenerationOptions): Promise<void> {
  const { title, rawText } = options;
  const docType = options.docType || detectDocumentType(rawText);

  const lines = rawText.split('\n');
  const docParagraphs: Paragraph[] = [];

  // 1. EN-TÊTE OFFICIEL DE LA VILLE DE GENNEVILLIERS
  docParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: "RÉPUBLIQUE FRANÇAISE",
          bold: true,
          size: 20,
          color: "666666",
          font: "Arial"
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: "VILLE DE GENNEVILLIERS",
          bold: true,
          size: 28,
          color: "0B3C5D", // Bleu institutionnel Gennevilliers
          font: "Arial"
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: "DIRECTION GÉNÉRALE DES SERVICES  •  DIRECTION DES RESSOURCES HUMAINES",
          bold: true,
          size: 16,
          color: "4A6984",
          font: "Arial"
        })
      ],
      border: {
        bottom: {
          color: "0B3C5D",
          space: 6,
          style: BorderStyle.SINGLE,
          size: 12
        }
      }
    }),
    new Paragraph({ spacing: { after: 180 }, children: [] })
  );

  // 2. PARCOURS DES LIGNES DU TEXTE POUR APPLIQUER LA MISE EN PAGE OFFICIELLE
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) {
      docParagraphs.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
      continue;
    }

    // Titre d'acte (ex: ARRÊTÉ DU MAIRE, DÉCISION DU MAIRE, CONTRAT, NOTE DE SERVICE)
    if (
      rawLine.startsWith("ARRÊTÉ DU MAIRE") ||
      rawLine.startsWith("DÉCISION DU MAIRE") ||
      rawLine.startsWith("CONTRAT D'ENGAGEMENT") ||
      rawLine.startsWith("NOTE DE SERVICE") ||
      rawLine.startsWith("EXTRAIT DU REGISTRE")
    ) {
      docParagraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 140 },
          children: [
            new TextRun({
              text: rawLine,
              bold: true,
              size: 24,
              color: "0B3C5D",
              font: "Arial"
            })
          ]
        })
      );
      continue;
    }

    // Portant ... (Objet)
    if (rawLine.startsWith("Portant ") || rawLine.startsWith("OBJET :") || rawLine.startsWith("Objet :")) {
      docParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: rawLine,
              bold: true,
              italics: true,
              size: 21,
              color: "1A202C",
              font: "Arial"
            })
          ]
        })
      );
      continue;
    }

    // Le Maire de Gennevilliers / Les soussignés
    if (
      rawLine === "Le Maire de Gennevilliers," ||
      rawLine === "Le Maire de Gennevilliers" ||
      rawLine.startsWith("Entre les soussignés")
    ) {
      docParagraphs.push(
        new Paragraph({
          spacing: { before: 180, after: 120 },
          children: [
            new TextRun({
              text: rawLine,
              bold: true,
              size: 21,
              font: "Arial"
            })
          ]
        })
      );
      continue;
    }

    // Visas (Vu ..., Considérant ...)
    if (rawLine.startsWith("Vu ") || rawLine.startsWith("Considérant ")) {
      docParagraphs.push(
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 360 },
          children: [
            new TextRun({
              text: rawLine.substring(0, rawLine.indexOf(" ") + 1),
              bold: true,
              size: 20,
              font: "Arial"
            }),
            new TextRun({
              text: rawLine.substring(rawLine.indexOf(" ") + 1),
              size: 20,
              font: "Arial"
            })
          ]
        })
      );
      continue;
    }

    // Mot d'action (ARRÊTE :, DÉCIDE :, IL EST CONVENU CE QUI SUIT :)
    if (
      rawLine === "ARRÊTE :" ||
      rawLine === "DÉCIDE :" ||
      rawLine === "IL EST CONVENU CE QUI SUIT :" ||
      rawLine.includes("DÉCIDE :")
    ) {
      docParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 200 },
          children: [
            new TextRun({
              text: rawLine,
              bold: true,
              size: 22,
              color: "0B3C5D",
              font: "Arial"
            })
          ]
        })
      );
      continue;
    }

    // Articles (ARTICLE 1 ..., Article 2 ..., etc.)
    if (/^(ARTICLE|Article)\s+\d+/i.test(rawLine)) {
      const match = rawLine.match(/^(ARTICLE|Article)\s+\d+[^:]*:/i);
      if (match) {
        const prefix = match[0];
        const rest = rawLine.substring(prefix.length);
        docParagraphs.push(
          new Paragraph({
            spacing: { before: 160, after: 100 },
            children: [
              new TextRun({
                text: prefix + " ",
                bold: true,
                size: 20,
                color: "0B3C5D",
                font: "Arial"
              }),
              new TextRun({
                text: rest.trim(),
                size: 20,
                font: "Arial"
              })
            ]
          })
        );
        continue;
      }
    }

    // Signature Block (Fait à Gennevilliers, Pour le Maire...)
    if (rawLine.startsWith("Fait à Gennevilliers") || rawLine.startsWith("Pour le Maire")) {
      docParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 200, after: 60 },
          children: [
            new TextRun({
              text: rawLine,
              bold: rawLine.startsWith("Pour le Maire") || rawLine.startsWith("Pierric ANNOOT"),
              size: 20,
              font: "Arial"
            })
          ]
        })
      );
      continue;
    }

    // Ligne standard
    docParagraphs.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: rawLine,
            size: 20,
            font: "Arial"
          })
        ]
      })
    );
  }

  // 3. CONSTRUCTION DU DOCUMENT DOCX AVEC PIED DE PAGE CHARTE
  const doc = new Document({
    title: title,
    description: `Acte administratif officiel généré - Ville de Gennevilliers (${docType})`,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 2.5 cm (1 inch = 1440 twips)
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "Mairie de Gennevilliers • Document Officiel RH",
                    size: 16,
                    color: "888888",
                    font: "Arial"
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Hôtel de Ville de Gennevilliers — 177, avenue Gabriel-Péri, 92230 Gennevilliers  •  Page ",
                    size: 16,
                    color: "888888",
                    font: "Arial"
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: "888888",
                    font: "Arial"
                  })
                ]
              })
            ]
          })
        },
        children: docParagraphs
      }
    ]
  });

  // 4. GÉNÉRATION DU FICHIER ET TÉLÉCHARGEMENT
  const blob = await Packer.toBlob(doc);
  const cleanFileName = `Gennevilliers_${docType.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.docx`;
  saveAs(blob, cleanFileName);
}

/**
 * Raccourci pour exporter directement un StatutoryQueryResult au format .docx
 */
export async function exportStatutoryActToDocx(result: { title: string; category?: string; sampleDocument?: string; content?: string }): Promise<void> {
  return exportToOfficialDocx({
    title: result.title,
    category: result.category,
    content: result.content || result.title,
    rawText: result.sampleDocument || result.content || result.title
  });
}

/**
 * Générateur officiel du Formulaire de Temps Partiel (De Droit & Sur Autorisation)
 * Conforme CGFP Art. L. 612-1 à L. 612-14 et Décret n° 2004-777
 */
export async function exportTempsPartielFormDocx(variant: 'de_droit' | 'autorisation' = 'de_droit'): Promise<void> {
  const isDroit = variant === 'de_droit';
  const title = isDroit 
    ? "Formulaire de Demande de Temps Partiel de Droit - Ville de Gennevilliers"
    : "Formulaire de Demande de Temps Partiel sur Autorisation - Ville de Gennevilliers";

  const rawText = isDroit ? `VILLE DE GENNEVILLIERS - DIRECTION DES RESSOURCES HUMAINES
FORMULAIRE OFFICIEL : DEMANDE D'EXERCICE DES FONCTIONS À TEMPS PARTIEL DE DROIT
(Code Général de la Fonction Publique, Art. L. 612-2 à L. 612-4 & Décret n° 2004-777 du 29 juillet 2004)

1. IDENTIFICATION DE L'AGENT(E)
Nom de naissance : ___________________________   Nom d'usage : ___________________________
Prénom : _____________________________________   Matricule RH : ___________________________
Direction / Pôle : ___________________________   Service : _______________________________
Grade / Emploi : _____________________________   Fonctions exercées : ____________________
Téléphone pro : ______________________________   Courriel : ______________________________

2. MOTIF LÉGAL DE LA DEMANDE (TEMPS PARTIEL DE DROIT)
Cocher le motif justifiant le bénéfice du temps partiel de droit :
[  ] À l'occasion de chaque naissance (jusqu'aux 3 ans de l'enfant) ou d'une adoption (délai de 3 ans)
     Nom et prénom de l'enfant : _______________________   Date de naissance/arrivée : ___/___/______
[  ] Pour donner des soins au conjoint, partenaire de PACS ou concubin atteint d'un handicap ou maladie grave
[  ] Pour donner des soins à un enfant à charge atteint d'un handicap ou victime d'un accident/maladie grave
[  ] Pour donner des soins à un ascendant (père, mère) atteint d'un handicap ou perte d'autonomie
[  ] En qualité de travailleur handicapé (bénéficiaire de l'art. L. 351-1 du CGFP)

3. MODALITÉS & QUOTITÉ DU TEMPS DE TRAVAIL SOLLICITÉ
Quotité souhaitée :
[  ] 50 % d'un temps plein (17h30 hebdomadaires)
[  ] 60 % d'un temps plein (21h00 hebdomadaires)
[  ] 70 % d'un temps plein (24h30 hebdomadaires)
[  ] 80 % d'un temps plein (28h00 hebdomadaires — Rémunération avantageuse à 85,7% soit 6/7e)

Période d'effet demandée :
Du ___ / ___ / 202___ au ___ / ___ / 202___ (Période comprise entre 6 mois et 1 an renouvelable)

Répartition hebdomadaire proposée des journées / demi-journées non travaillées :
- Lundi :    [  ] Matin   [  ] Après-midi   [  ] Journée entière
- Mardi :    [  ] Matin   [  ] Après-midi   [  ] Journée entière
- Mercredi : [  ] Matin   [  ] Après-midi   [  ] Journée entière
- Jeudi :    [  ] Matin   [  ] Après-midi   [  ] Journée entière
- Vendredi : [  ] Matin   [  ] Après-midi   [  ] Journée entière

4. RÈGLES STATUTAIRES & IMPACTS SUR LA CARRIÈRE
- Rémunération : Traitement indiciaire brut, NBI et régime indemnitaire (IFSE) proratisés. Règle dérogatoire des 6/7e pour la quotité de 80% (rémunéré à 85,71%). Le SFT ne peut être inférieur au montant minimum légal.
- Droits à avancement & retraite : Les périodes de temps partiel sont assimilées à du temps plein pour l'avancement d'échelon et de grade, ainsi que pour la constitution des droits à pension CNRACL.
- Congés annuels : Proratisés au nombre de jours travaillés par semaine (ex: 20 jours ouvrés pour 4 jours/semaine).

5. SIGNATURES & VISAS HIÉRARCHIQUES

Date de la demande : ___ / ___ / 202___
Signature de l'agent(e) :


AVIS MOTIVÉ DU CHEF DE SERVICE / DIRECTEUR :
[  ] Favorable
[  ] Organisation du planning validée
Observations : _________________________________________________________________
Date : ___ / ___ / 202___
Signature et cachet du Chef de service :


DÉCISION DE LA DIRECTION DES RESSOURCES HUMAINES :
[  ] Demande enregistrée et transmise pour établissement de l'arrêté municipal
Date : ___ / ___ / 202___
Pour le Maire de Gennevilliers et par délégation, la Direction des Ressources Humaines :`
  : `VILLE DE GENNEVILLIERS - DIRECTION DES RESSOURCES HUMAINES
FORMULAIRE OFFICIEL : DEMANDE D'EXERCICE DES FONCTIONS À TEMPS PARTIEL SUR AUTORISATION
(Code Général de la Fonction Publique, Art. L. 612-1 & Décret n° 2004-777 du 29 juillet 2004)

1. IDENTIFICATION DE L'AGENT(E)
Nom de naissance : ___________________________   Nom d'usage : ___________________________
Prénom : _____________________________________   Matricule RH : ___________________________
Direction / Pôle : ___________________________   Service : _______________________________
Grade / Emploi : _____________________________   Fonctions exercées : ____________________
Téléphone pro : ______________________________   Courriel : ______________________________

2. OBJET DE LA DEMANDE (CONVENANCES PERSONNELLES)
[  ] Première demande de temps partiel sur autorisation
[  ] Renouvellement d'une période de temps partiel en cours
[  ] Modification de la quotité de travail en cours

3. MODALITÉS & QUOTITÉ DU TEMPS DE TRAVAIL SOLLICITÉ
Quotité demandée (accordée sous réserve des nécessités du service) :
[  ] 50 % d'un temps plein
[  ] 60 % d'un temps plein
[  ] 70 % d'un temps plein
[  ] 80 % d'un temps plein (Rémunéré à 85,7 % soit 6/7e du traitement)
[  ] 90 % d'un temps plein (Rémunéré à 91,4 % soit 32/35e du traitement)

Modalité d'organisation :
[  ] Dans un cadre hebdomadaire
[  ] Dans un cadre mensuel
[  ] Dans un cadre annualisé (rythme scolaire / périscolaire)

Période souhaitée :
Du ___ / ___ / 202___ au ___ / ___ / 202___
(Rappel : La demande doit être déposée au moins 2 mois avant la date d'effet souhaitée).

Répartition hebdomadaire proposée des journées / demi-journées non travaillées :
- Lundi :    [  ] Matin   [  ] Après-midi   [  ] Journée entière
- Mardi :    [  ] Matin   [  ] Après-midi   [  ] Journée entière
- Mercredi : [  ] Matin   [  ] Après-midi   [  ] Journée entière
- Jeudi :    [  ] Matin   [  ] Après-midi   [  ] Journée entière
- Vendredi : [  ] Matin   [  ] Après-midi   [  ] Journée entière

4. SIGNATURES & VISAS HIÉRARCHIQUES

Date de la demande : ___ / ___ / 202___
Signature de l'agent(e) :


AVIS MOTIVÉ DU CHEF DE SERVICE / DIRECTEUR :
[  ] Avis Favorable
[  ] Avis Défavorable (Motif circonstancié lié à la continuité et l'organisation du service requis) :
Observations : _________________________________________________________________
Date : ___ / ___ / 202___
Signature et cachet du Chef de service :


DÉCISION DE LA DIRECTION DES RESSOURCES HUMAINES :
[  ] Autorisation accordée — Arrêté municipal en cours d'établissement
[  ] Rejet motivé après saisine de la CAP le cas échéant
Date : ___ / ___ / 202___
Pour le Maire de Gennevilliers et par délégation, la DRH :`;

  return exportToOfficialDocx({
    title,
    category: "Temps de Travail & Absences CGFP",
    content: title,
    rawText,
    docType: 'circulaire'
  });
}


