import { promises as fs } from 'node:fs';
import path from 'node:path';

const DEFAULT_ROOT = path.resolve('public', 'bip', 'output');
const CHUNK_SIZE = 4000;

function stripMarkdown(markdown) {
  return markdown
    .replace(/^---[\s\S]*?---\s*/m, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+[.)]\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/^\s*---\s*$/gm, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function splitIntoChunks(text, maxLen = CHUNK_SIZE) {
  const chunks = [];
  let cursor = 0;

  while (cursor < text.length) {
    const remaining = text.length - cursor;
    if (remaining <= maxLen) {
      chunks.push(text.slice(cursor).trim());
      break;
    }

    const window = text.slice(cursor, cursor + maxLen);
    let cut = Math.max(
      window.lastIndexOf('\n\n'),
      window.lastIndexOf('\n'),
      window.lastIndexOf('. '),
      window.lastIndexOf('; '),
      window.lastIndexOf(', '),
      window.lastIndexOf(' ')
    );

    if (cut < Math.floor(maxLen * 0.6)) {
      cut = maxLen;
    }

    const part = text.slice(cursor, cursor + cut).trim();
    if (part.length > 0) {
      chunks.push(part);
    }

    cursor += cut;
    while (cursor < text.length && /\s/.test(text[cursor])) {
      cursor += 1;
    }
  }

  return chunks;
}

async function walkMarkdownFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkMarkdownFiles(fullPath)));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

async function convertFile(mdPath) {
  const raw = await fs.readFile(mdPath, 'utf8');
  const plain = stripMarkdown(raw);
  const chunks = splitIntoChunks(plain, CHUNK_SIZE).map((content, index) => ({
    id: index + 1,
    content,
    length: content.length,
  }));

  const jsonPath = mdPath.replace(/\.md$/i, '.json');
  await fs.writeFile(jsonPath, `${JSON.stringify(chunks, null, 2)}\n`, 'utf8');
}

async function main() {
  const root = path.resolve(process.argv[2] || DEFAULT_ROOT);
  const mdFiles = await walkMarkdownFiles(root);

  for (const mdFile of mdFiles) {
    await convertFile(mdFile);
  }

  console.log(`Converted ${mdFiles.length} markdown files to JSON in ${root}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
