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

