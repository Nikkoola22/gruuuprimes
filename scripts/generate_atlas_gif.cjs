const fs = require('fs');
const path = require('path');
const { GifWriter } = require('omggif');

// Dimensions du GIF (format bannière email / carte d'aperçu dynamique)
const width = 640;
const height = 360;

// Palette 256 couleurs (RGB entiers 0xRRGGBB)
// On construit une palette soignée autour de la charte ATLAS / CFDT :
// Fond sombre (#0f172a, #1e293b), Blanc (#ffffff), Orange (#ea580c, #f97316, #fb923c), 
// Émeraude (#10b981), Bleu (#3b82f6), Violet (#8b5cf6), Ambre (#f59e0b), Gris (#64748b, #94a3b8, #e2e8f0)
const palette = [];
const colorMap = new Map();

function colorIndex(r, g, b) {
  // Quantifier sur 5 bits pour trouver ou insérer dans la palette
  const qr = Math.round(r / 8) * 8;
  const qg = Math.round(g / 8) * 8;
  const qb = Math.round(b / 8) * 8;
  const key = (qr << 16) | (qg << 8) | qb;
  
  if (colorMap.has(key)) {
    return colorMap.get(key);
  }
  if (palette.length < 255) {
    const idx = palette.length;
    palette.push(key);
    colorMap.set(key, idx);
    return idx;
  }
  // Trouver la couleur la plus proche si palette pleine
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < palette.length; i++) {
    const pr = (palette[i] >> 16) & 0xff;
    const pg = (palette[i] >> 8) & 0xff;
    const pb = palette[i] & 0xff;
    const d = (pr - r) * (pr - r) + (pg - g) * (pg - g) + (pb - b) * (pb - b);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }
  return bestIdx;
}

// Initialiser couleurs clés
const COLOR_BG_DARK = colorIndex(15, 23, 42);      // #0f172a
const COLOR_HEADER = colorIndex(30, 41, 59);       // #1e293b
const COLOR_WHITE = colorIndex(255, 255, 255);
const COLOR_TEXT_MUTED = colorIndex(148, 163, 184); // #94a3b8
const COLOR_ORANGE = colorIndex(234, 88, 12);      // #ea580c
const COLOR_ORANGE_LIGHT = colorIndex(249, 115, 22); // #f97316
const COLOR_AMBER = colorIndex(245, 158, 11);
const COLOR_EMERALD = colorIndex(16, 185, 129);
const COLOR_BLUE = colorIndex(59, 130, 246);
const COLOR_PURPLE = colorIndex(139, 92, 246);
const COLOR_BORDER = colorIndex(51, 65, 85);       // #334155
const COLOR_CARD_BG = colorIndex(30, 41, 59);      // #1e293b
const COLOR_CARD_HOVER = colorIndex(45, 55, 72);

// Mini bitmap 5x7 pour texte lisible sans dépendance de police
const FONT = {
  'A': [0x70,0x88,0x88,0xF8,0x88,0x88,0x88],
  'B': [0xF0,0x88,0x88,0xF0,0x88,0x88,0xF0],
  'C': [0x78,0x88,0x80,0x80,0x80,0x88,0x78],
  'D': [0xF0,0x88,0x88,0x88,0x88,0x88,0xF0],
  'E': [0xF8,0x80,0x80,0xF0,0x80,0x80,0xF8],
  'F': [0xF8,0x80,0x80,0xF0,0x80,0x80,0x80],
  'G': [0x78,0x88,0x80,0xB8,0x88,0x88,0x78],
  'H': [0x88,0x88,0x88,0xF8,0x88,0x88,0x88],
  'I': [0xF8,0x20,0x20,0x20,0x20,0x20,0xF8],
  'J': [0x38,0x10,0x10,0x10,0x10,0x90,0x60],
  'K': [0x88,0x90,0xA0,0xC0,0xA0,0x90,0x88],
  'L': [0x80,0x80,0x80,0x80,0x80,0x80,0xF8],
  'M': [0x88,0xD8,0xA8,0x88,0x88,0x88,0x88],
  'N': [0x88,0xC8,0xA8,0x98,0x88,0x88,0x88],
  'O': [0x70,0x88,0x88,0x88,0x88,0x88,0x70],
  'P': [0xF0,0x88,0x88,0xF0,0x80,0x80,0x80],
  'Q': [0x70,0x88,0x88,0x88,0xA8,0x98,0x68],
  'R': [0xF0,0x88,0x88,0xF0,0xA0,0x90,0x88],
  'S': [0x78,0x88,0x80,0x70,0x08,0x88,0x78],
  'T': [0xF8,0x20,0x20,0x20,0x20,0x20,0x20],
  'U': [0x88,0x88,0x88,0x88,0x88,0x88,0x70],
  'V': [0x88,0x88,0x88,0x88,0x88,0x50,0x20],
  'W': [0x88,0x88,0x88,0x88,0xA8,0xD8,0x88],
  'X': [0x88,0x88,0x50,0x20,0x50,0x88,0x88],
  'Y': [0x88,0x88,0x50,0x20,0x20,0x20,0x20],
  'Z': [0xF8,0x08,0x10,0x20,0x40,0x80,0xF8],
  '0': [0x70,0x88,0x98,0xA8,0xC8,0x88,0x70],
  '1': [0x20,0x60,0x20,0x20,0x20,0x20,0x70],
  '2': [0x70,0x88,0x08,0x30,0x40,0x80,0xF8],
  '3': [0xF8,0x08,0x10,0x30,0x08,0x88,0x70],
  '4': [0x10,0x30,0x50,0x90,0xF8,0x10,0x10],
  '5': [0xF8,0x80,0xF0,0x08,0x08,0x88,0x70],
  '6': [0x38,0x40,0x80,0xF0,0x88,0x88,0x70],
  '7': [0xF8,0x08,0x10,0x20,0x40,0x40,0x40],
  '8': [0x70,0x88,0x88,0x70,0x88,0x88,0x70],
  '9': [0x70,0x88,0x88,0x78,0x08,0x10,0x60],
  ' ': [0x00,0x00,0x00,0x00,0x00,0x00,0x00],
  '-': [0x00,0x00,0x00,0xF8,0x00,0x00,0x00],
  ':': [0x00,0x60,0x60,0x00,0x60,0x60,0x00],
  '.': [0x00,0x00,0x00,0x00,0x00,0x60,0x60],
  '/': [0x08,0x10,0x10,0x20,0x40,0x40,0x80],
  '>': [0x80,0x40,0x20,0x10,0x20,0x40,0x80],
  '+': [0x00,0x20,0x20,0xF8,0x20,0x20,0x00],
  '(': [0x10,0x20,0x40,0x40,0x40,0x20,0x10],
  ')': [0x40,0x20,0x10,0x10,0x10,0x20,0x40],
  '%': [0xC8,0xC8,0x10,0x20,0x40,0x98,0x98]
};

function drawChar(pixels, char, x, y, color, scale = 1) {
  const glyph = FONT[char.toUpperCase()] || FONT[' '];
  for (let r = 0; r < 7; r++) {
    const row = glyph[r];
    for (let c = 0; c < 5; c++) {
      if ((row & (0x80 >> c)) !== 0) {
        for (let dy = 0; dy < scale; dy++) {
          for (let dx = 0; dx < scale; dx++) {
            const px = x + c * scale + dx;
            const py = y + r * scale + dy;
            if (px >= 0 && px < width && py >= 0 && py < height) {
              pixels[py * width + px] = color;
            }
          }
        }
      }
    }
  }
}

function drawText(pixels, text, x, y, color, scale = 1, letterSpacing = 1) {
  let cx = x;
  for (let i = 0; i < text.length; i++) {
    drawChar(pixels, text[i], cx, y, color, scale);
    cx += (5 * scale) + letterSpacing;
  }
}

function fillRect(pixels, rx, ry, rw, rh, color) {
  const x0 = Math.max(0, rx);
  const y0 = Math.max(0, ry);
  const x1 = Math.min(width, rx + rw);
  const y1 = Math.min(height, ry + rh);
  for (let y = y0; y < y1; y++) {
    const row = y * width;
    for (let x = x0; x < x1; x++) {
      pixels[row + x] = color;
    }
  }
}

function drawCard(pixels, rx, ry, rw, rh, title, subtitle, iconChar, tag, isHighlight, accentColor) {
  const bg = isHighlight ? COLOR_CARD_HOVER : COLOR_CARD_BG;
  const border = isHighlight ? accentColor : COLOR_BORDER;
  
  // Fond et bordure
  fillRect(pixels, rx, ry, rw, rh, bg);
  // Bordure
  fillRect(pixels, rx, ry, rw, 1, border);
  fillRect(pixels, rx, ry + rh - 1, rw, 1, border);
  fillRect(pixels, rx, ry, 1, rh, border);
  fillRect(pixels, rx + rw - 1, ry, 1, rh, border);
  
  if (isHighlight) {
    fillRect(pixels, rx, ry, rw, 3, accentColor);
  }
  
  // Icone / Carré
  fillRect(pixels, rx + 10, ry + 10, 22, 22, accentColor);
  drawText(pixels, iconChar, rx + 16, ry + 13, COLOR_WHITE, 2);
  
  // Badge Tag
  if (tag) {
    fillRect(pixels, rx + rw - 70, ry + 10, 60, 14, border);
    drawText(pixels, tag, rx + rw - 65, ry + 13, COLOR_TEXT_MUTED, 1);
  }
  
  // Textes
  drawText(pixels, title, rx + 38, ry + 14, COLOR_WHITE, 1.8, 1);
  drawText(pixels, subtitle, rx + 12, ry + 42, isHighlight ? COLOR_WHITE : COLOR_TEXT_MUTED, 1.2, 1);
}

// S'assurer que la palette fait exactement 256 entrées (puissance de 2)
while (palette.length < 256) {
  palette.push(0x000000);
}

// Définition des scènes / étapes de l'animation (Slide 1 à 5)
const slides = [
  {
    category: "PORTAIL UNIFIE CFDT",
    mainTitle: "ATLAS - CFDT GENNEVILLIERS",
    highlight: 0,
    cards: [
      { t: "QUESTION IA", s: "REPONSES STATUTAIRES 24H/24 CGFP", icon: "?", tag: "IA LIVE", c: COLOR_PURPLE },
      { t: "FICHE DE PAIE", s: "DECRYPTAGE LIGNE PAR LIGNE OPENFISCA", icon: "$", tag: "NOUVEAU", c: COLOR_EMERALD },
      { t: "CARRIERE", s: "SIMULATEUR ECHELONS GRADES ET LDG", icon: ">", tag: "2027", c: COLOR_ORANGE },
      { t: "BOITE A OUTILS", s: "PRIMES IFSE CIA 13E MOIS ET NAVIGO", icon: "+", tag: "CALCULS", c: COLOR_BLUE }
    ]
  },
  {
    category: "MODULE 1 : SIMULATEURS DE PAIE",
    mainTitle: "AUDIT BULLETIN & PRIMES IFSE",
    highlight: 1,
    cards: [
      { t: "FICHE DE PAIE", s: "AUDIT OPENFISCA : RETENUES CSG RAFP", icon: "$", tag: "ACTIF", c: COLOR_EMERALD },
      { t: "PRIMES IFSE", s: "ESTIMEZ VOTRE REGIME INDEMNITAIRE", icon: "+", tag: "MENSUEL", c: COLOR_BLUE },
      { t: "13EME MOIS", s: "SIMULATION COMPLETE SELON LE GRADE", icon: "$", tag: "ANNUEL", c: COLOR_AMBER },
      { t: "CARTE NAVIGO", s: "REMBOURSEMENT 75% ET FRAIS MISSION", icon: ">", tag: "75 PCT", c: COLOR_ORANGE }
    ]
  },
  {
    category: "MODULE 2 : GESTION DE CARRIERE",
    mainTitle: "VOTRE PARCOURS PROFESSIONNEL",
    highlight: 2,
    cards: [
      { t: "ECHELON", s: "PROCHAIN AVANCEMENT DE CADENCE", icon: ">", tag: "DATE", c: COLOR_AMBER },
      { t: "GRADE", s: "VERIFIEZ VOS CONDITIONS CETTE ANNEE", icon: "+", tag: "QUOTAS", c: COLOR_EMERALD },
      { t: "PROMOTION LDG", s: "CALCUL DES POINTS BAREME CIG 175 PTS", icon: "$", tag: "ACTIF", c: COLOR_BLUE },
      { t: "CONCOURS", s: "RECLASSEMENT ET GAIN INDICIAIRE", icon: ">", tag: "EXAMENS", c: COLOR_PURPLE }
    ]
  },
  {
    category: "MODULE 3 : DROITS & DEMARCHES",
    mainTitle: "INTELLIGENCE ARTIFICIELLE & DOCS",
    highlight: 0,
    cards: [
      { t: "J AI UNE QUESTION", s: "ACCORDS VILLE + CGFP + LEGIFRANCE", icon: "?", tag: "ACTIF", c: COLOR_PURPLE },
      { t: "DOCUTHEQUE RH", s: "110+ FORMULAIRES DE LA VILLE", icon: "+", tag: "TELECHARGER", c: COLOR_BLUE },
      { t: "COURRIERS AGENT", s: "TEMPS PARTIEL TELETRAVAIL RECOURS", icon: ">", tag: "MODELES", c: COLOR_EMERALD },
      { t: "INFOGRAPHIES", s: "DESSINE MOI LE STATUT +100 SCHEMAS", icon: "$", tag: "VISUEL", c: COLOR_ORANGE }
    ]
  },
  {
    category: "ACCES GRATUIT & ANONYME",
    mainTitle: "ATLAS-CFDT.VERCEL.APP",
    highlight: 3,
    cards: [
      { t: "GRATUIT", s: "OUVERT A TOUS LES AGENTS DE LA MAIRIE", icon: "+", tag: "LIBRE", c: COLOR_EMERALD },
      { t: "ANONYME", s: "AUCUNE DONNEE PERSONNELLE STOCKEE", icon: "$", tag: "SECURISE", c: COLOR_BLUE },
      { t: "SUR MOBILE & PC", s: "ACCESSIBLE 24H/24 SUR TOUS ECRANS", icon: ">", tag: "RESPONSIVE", c: COLOR_PURPLE },
      { t: "OUVRIR ATLAS", s: "CLIQUEZ POUR OUVRIR LE PORTAIL", icon: ">", tag: "GO !", c: COLOR_ORANGE }
    ]
  }
];

// Créer le buffer GIF
const maxBytes = width * height * 50;
const buffer = Buffer.alloc(maxBytes);
const gifWriter = new GifWriter(buffer, width, height, { loop: 0 });

console.log("Génération des trames du GIF animé ATLAS...");

slides.forEach((slide, sIdx) => {
  // 12 trames par diapositive avec une légère pulsation / barre de progression
  const framesPerSlide = 8;
  
  for (let f = 0; f < framesPerSlide; f++) {
    const pixels = new Uint8Array(width * height);
    pixels.fill(COLOR_BG_DARK);
    
    // --- 1. BANDEAU HAUT (Header) ---
    fillRect(pixels, 0, 0, width, 56, COLOR_HEADER);
    fillRect(pixels, 0, 56, width, 2, COLOR_ORANGE);
    
    // Logo carré CFDT
    fillRect(pixels, 16, 10, 48, 36, COLOR_ORANGE);
    drawText(pixels, "CFDT", 23, 20, COLOR_WHITE, 1.8, 1);
    
    // Titres dans le header
    drawText(pixels, "ATLAS", 74, 14, COLOR_WHITE, 2.2, 1);
    drawText(pixels, "ASSISTANT TERRITORIAL GENNEVILLIERS", 74, 34, COLOR_ORANGE_LIGHT, 1, 1);
    
    // URL en haut à droite avec pastille verte pulsante
    const dotColor = (f % 2 === 0) ? COLOR_EMERALD : COLOR_WHITE;
    fillRect(pixels, width - 215, 22, 8, 8, dotColor);
    drawText(pixels, "ATLAS-CFDT.VERCEL.APP", width - 200, 21, COLOR_WHITE, 1.2, 1);
    
    // --- 2. BANDEAU DE STATUT / SOUS-TITRE ---
    fillRect(pixels, 16, 70, width - 32, 34, COLOR_CARD_BG);
    fillRect(pixels, 16, 70, 4, 34, COLOR_ORANGE);
    drawText(pixels, slide.category, 30, 75, COLOR_TEXT_MUTED, 1, 1);
    drawText(pixels, slide.mainTitle, 30, 88, COLOR_WHITE, 1.6, 1);
    
    // --- 3. GRILLE DES 4 CARTES ---
    const gridX = 16;
    const gridY = 116;
    const cardW = 296;
    const cardH = 88;
    const gapX = 16;
    const gapY = 14;
    
    slide.cards.forEach((card, cIdx) => {
      const col = cIdx % 2;
      const row = Math.floor(cIdx / 2);
      const cx = gridX + col * (cardW + gapX);
      const cy = gridY + row * (cardH + gapY);
      
      const isCardActive = (cIdx === slide.highlight);
      drawCard(pixels, cx, cy, cardW, cardH, card.t, card.s, card.icon, card.tag, isCardActive, card.c);
    });
    
    // --- 4. PIED DE PAGE : PROGRESSION ET BADGE FAVORIS ---
    const footerY = 320;
    fillRect(pixels, 0, footerY, width, 40, COLOR_HEADER);
    
    // Boutons de pagination / slides
    slides.forEach((_, pIdx) => {
      const px = 20 + pIdx * 24;
      const pColor = (pIdx === sIdx) ? COLOR_ORANGE : COLOR_BORDER;
      fillRect(pixels, px, footerY + 16, 16, 6, pColor);
    });
    
    // Message bas
    drawText(pixels, "SIMULATEURS PAIE * CARRIERE * ASSISTANT IA * CGFP", 160, footerY + 15, COLOR_TEXT_MUTED, 1, 1);
    
    // Bouton Découvrir à droite
    fillRect(pixels, width - 110, footerY + 8, 94, 24, COLOR_ORANGE);
    drawText(pixels, "OUVRIR >", width - 90, footerY + 15, COLOR_WHITE, 1.2, 1);
    
    // Ajouter la frame au GIF (délai en centièmes de seconde : 15 = 150ms)
    const delay = (f === framesPerSlide - 1) ? 80 : 18; // pause sur la dernière frame de chaque slide
    gifWriter.addFrame(0, 0, width, height, pixels, {
      palette: palette,
      delay: delay
    });
  }
});

const finalGifBuffer = buffer.slice(0, gifWriter.end());
const outputPath = path.join(__dirname, '..', 'public', 'images', 'atlas-presentation.gif');
fs.writeFileSync(outputPath, finalGifBuffer);

console.log(`✅ GIF animé généré avec succès (${finalGifBuffer.length} octets) : ${outputPath}`);
