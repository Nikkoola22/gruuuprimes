const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { GifWriter } = require('omggif');

const uploadedDir = 'C:\\Users\\nicolas.garnier\\.gemini\\antigravity\\brain\\6b2cac28-d86e-4705-ae1f-31612a245cb1\\.user_uploaded';

// Configuration de cadrage par image pour un rendu parfait :
// L'image 6 fait 796px de haut et son contenu important (Espace Jeux + titre) est en haut !
const screenshotsConfig = [
  { file: 'media_1794838985557_3b1e4158.png', position: 'top' },    // 1. Hero
  { file: 'media_1794839018471_69c05b5b.png', position: 'center' }, // 2. Fiche de paie
  { file: 'media_1794839039445_7d2b8271.png', position: 'top' },    // 3. Heures sup
  { file: 'media_1794839066904_3359dcce.png', position: 'top' },    // 4. RTT
  { file: 'media_1794839091318_c8ed1a61.png', position: 'top' },    // 5. Carrière
  { file: 'media_1794839121367_fcced359.png', position: 'top' }     // 6. Espace Jeux cadré en haut (titre + cartes)
];

const TARGET_WIDTH = 600;
const TARGET_HEIGHT = 340;

async function generateGif() {
  console.log('Recadrage haute précision des captures d\'écran...');

  const framesData = [];

  for (let i = 0; i < screenshotsConfig.length; i++) {
    const item = screenshotsConfig[i];
    const filePath = path.join(uploadedDir, item.file);

    let transformer = sharp(filePath);

    // Pour l'image 6 (796px), rogner spécifiquement la partie haute utile (jeux + laptop)
    if (item.file === 'media_1794839121367_fcced359.png') {
      transformer = transformer.extract({
        left: 0,
        top: 0,
        width: 1024,
        height: 580 // garde le haut (Espace jeux + Gennevilliers City + Défi etc.)
      });
    }

    const rawRgba = await transformer
      .resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: 'cover',
        position: item.position
      })
      .removeAlpha()
      .raw()
      .toBuffer();

    framesData.push(rawRgba);
  }

  console.log('Construction de la palette et réencodage du GIF...');

  const colorMap = new Map();
  const palette = [];

  function getOrAddColor(r, g, b) {
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

    let bestDist = Infinity;
    let bestIdx = 0;
    for (let c = 0; c < palette.length; c++) {
      const pr = (palette[c] >> 16) & 0xff;
      const pg = (palette[c] >> 8) & 0xff;
      const pb = palette[c] & 0xff;
      const d = (pr - r) * (pr - r) + (pg - g) * (pg - g) + (pb - b) * (pb - b);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = c;
      }
    }
    return bestIdx;
  }

  for (const buf of framesData) {
    const step = 64;
    for (let p = 0; p < buf.length; p += 3 * step) {
      getOrAddColor(buf[p], buf[p + 1], buf[p + 2]);
      if (palette.length >= 250) break;
    }
    if (palette.length >= 250) break;
  }

  while (palette.length < 256) {
    palette.push(0x000000);
  }

  const maxBytes = TARGET_WIDTH * TARGET_HEIGHT * 6 * 2;
  const gifBuffer = Buffer.alloc(maxBytes);
  const gifWriter = new GifWriter(gifBuffer, TARGET_WIDTH, TARGET_HEIGHT, { loop: 0 });

  for (let f = 0; f < framesData.length; f++) {
    const rawRgb = framesData[f];
    const indexedPixels = new Uint8Array(TARGET_WIDTH * TARGET_HEIGHT);

    for (let p = 0; p < TARGET_WIDTH * TARGET_HEIGHT; p++) {
      const r = rawRgb[p * 3];
      const g = rawRgb[p * 3 + 1];
      const b = rawRgb[p * 3 + 2];
      indexedPixels[p] = getOrAddColor(r, g, b);
    }

    // 190 centièmes = 1.9s par slide
    gifWriter.addFrame(0, 0, TARGET_WIDTH, TARGET_HEIGHT, indexedPixels, {
      palette: palette,
      delay: 190
    });
  }

  const finalLength = gifWriter.end();
  const outputGif = gifBuffer.slice(0, finalLength);

  const outputPath = path.join(__dirname, '..', 'public', 'images', 'atlas-presentation.gif');
  fs.writeFileSync(outputPath, outputGif);
  console.log(`✅ GIF recadré avec succès (${outputGif.length} octets) : ${outputPath}`);

  // Mise à jour Base64
  const b64 = outputGif.toString('base64');
  let mailHtml = fs.readFileSync(path.join(__dirname, '..', 'mail-atlas-cfdt.html'), 'utf8');
  mailHtml = mailHtml.replace(/data:image\/gif;base64,[A-Za-z0-9+/=]+/g, 'data:image/gif;base64,' + b64);
  fs.writeFileSync(path.join(__dirname, '..', 'mail-atlas-cfdt.html'), mailHtml, 'utf8');
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'mail-preview.html'), mailHtml, 'utf8');

  console.log('✅ Pages HTML actualisées !');
}

generateGif().catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
