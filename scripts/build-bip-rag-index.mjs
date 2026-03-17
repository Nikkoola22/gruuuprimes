import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT_DIR = path.resolve('public', 'bip', 'output');
const OUTPUT_FILE = path.join(ROOT_DIR, 'bip-rag-index.json');
const OUTPUT_JSONL_FILE = path.join(ROOT_DIR, 'bip-rag-index.jsonl');
const OUTPUT_FILE_NAME = 'bip-rag-index.json';

function toDisplayLabel(segment) {
  return segment
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractHierarchyFromSourceName(sourceName) {
  const parts = sourceName.split('_').filter(Boolean);
  if (parts.length <= 1) {
    return { chapitre: '', sousPartie: '' };
  }

  const withoutCode = parts.slice(0, -1);
  const chapitre = toDisplayLabel(withoutCode[0] || '');
  const sousPartie = withoutCode.length > 1
    ? toDisplayLabel(withoutCode.slice(1).join(' > ')).replace(/\s>\s/g, ' > ')
    : '';

  return { chapitre, sousPartie };
}

function extractTitleAndSectionFromChunkText(content) {
  const lines = content.split('\n').map((line) => line.trim()).filter(Boolean);
  const title = lines[0] || '';
  const sectionLine = lines.find((line) => /^Section:\s*/i.test(line));
  const section = sectionLine ? sectionLine.replace(/^Section:\s*/i, '').trim() : '';
  return { title, section };
}

async function walkJsonFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkJsonFiles(fullPath)));
      continue;
    }

    if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.json')) {
      continue;
    }

    if (entry.name === OUTPUT_FILE_NAME) {
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

function toWebPath(filePath) {
  const relative = path.relative(path.resolve('public'), filePath);
  return `/${relative.split(path.sep).join('/')}`;
}

async function main() {
  const jsonFiles = await walkJsonFiles(ROOT_DIR);
  const aggregated = [];
  let globalId = 1;

  for (const filePath of jsonFiles) {
    const raw = await fs.readFile(filePath, 'utf8');
    let chunks;

    try {
      chunks = JSON.parse(raw);
    } catch {
      continue;
    }

    if (!Array.isArray(chunks)) {
      continue;
    }

    const sourcePath = toWebPath(filePath);
    const sourceName = path.basename(filePath, '.json');
    const hierarchy = extractHierarchyFromSourceName(sourceName);
    let fileLevelTitle = '';
    let fileLevelSection = '';

    for (const chunk of chunks) {
      if (!chunk || typeof chunk.content !== 'string') {
        continue;
      }

      const content = chunk.content.trim();
      if (!content) {
        continue;
      }

      const extracted = extractTitleAndSectionFromChunkText(content);
      if (!fileLevelTitle && extracted.title) {
        fileLevelTitle = extracted.title;
      }
      if (!fileLevelSection && extracted.section) {
        fileLevelSection = extracted.section;
      }

      aggregated.push({
        id: globalId,
        sourceFile: sourcePath,
        sourceName,
        title: fileLevelTitle || extracted.title,
        section: fileLevelSection || extracted.section,
        chapitre: hierarchy.chapitre,
        sousPartie: hierarchy.sousPartie,
        chunkId: typeof chunk.id === 'number' ? chunk.id : null,
        content,
        length: content.length,
      });
      globalId += 1;
    }
  }

  await fs.writeFile(OUTPUT_FILE, `${JSON.stringify(aggregated, null, 2)}\n`, 'utf8');
  const jsonl = aggregated.map((entry) => JSON.stringify(entry)).join('\n');
  await fs.writeFile(OUTPUT_JSONL_FILE, `${jsonl}\n`, 'utf8');
  console.log(`Indexed ${aggregated.length} chunks from ${jsonFiles.length} files into ${OUTPUT_FILE} and ${OUTPUT_JSONL_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
