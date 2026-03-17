/**
 * BIP Local Data Loader
 * Carrega dados dos arquivos JSONL locais em vez de URLs externas
 */

import { bipIndex } from './bip-index'
import { BIP_FILE_CATEGORIES } from './bip-files'

export interface BipFiche {
  code: string;
  titre: string;
  content: string;
  timestamp: string;
  source: string;
  type: string;
  section: string;
  chapitre?: string;
  sousPartie?: string;
  localPath?: string;
}

// Cache de dados carregados
let bipCache: BipFiche[] | null = null;
let bipCachePromise: Promise<BipFiche[]> | null = null;
const markdownContentCache = new Map<string, string>();

const BASE_URL = import.meta.env.BASE_URL || '/';

function normalizeForCategoryMatching(path: string): string {
  let normalized = path;

  if (/^https?:\/\//i.test(normalized)) {
    try {
      normalized = new URL(normalized).pathname;
    } catch {
      return path;
    }
  }

  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }

  if (BASE_URL !== '/' && normalized.startsWith(BASE_URL)) {
    normalized = normalized.slice(BASE_URL.length - 1);
  }

  return normalized;
}

function mapIndexEntryToFiche(entry: typeof bipIndex[number], content?: string): BipFiche {
  return {
    code: entry.code,
    titre: entry.titre,
    content: content && content.length > 0 ? content : entry.content,
    timestamp: entry.timestamp,
    source: entry.source,
    type: entry.type,
    section: entry.section,
    chapitre: (entry as { chapitre?: string }).chapitre,
    sousPartie: (entry as { sousPartie?: string }).sousPartie,
    localPath: entry.localPath,
  };
}

function normalizeMarkdownForSearch(markdown: string): string {
  const withoutFrontMatter = markdown.replace(/^---[\s\S]*?---\s*/m, '');

  return withoutFrontMatter
    .replace(/^\*\*URL:\*\*.*$/gim, '')
    .replace(/^\*\*Section:\*\*.*$/gim, '')
    .replace(/^\*\*Date:\*\*.*$/gim, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+[.)]\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/^\s*---\s*$/gm, '')
    .replace(/Fiches en référence[\s\S]*$/i, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function fetchFullMarkdownContent(localPath?: string): Promise<string | undefined> {
  if (!localPath) return undefined;

  if (markdownContentCache.has(localPath)) {
    return markdownContentCache.get(localPath);
  }

  try {
    const normalizedPath = localPath.startsWith('/') ? localPath.slice(1) : localPath;
    const requestPath = `${BASE_URL}${normalizedPath}`;
    const response = await fetch(requestPath, { cache: 'force-cache' });
    if (!response.ok) return undefined;
    const markdown = await response.text();
    const normalized = normalizeMarkdownForSearch(markdown);
    if (!normalized) return undefined;
    markdownContentCache.set(localPath, normalized);
    return normalized;
  } catch {
    return undefined;
  }
}

async function loadBipDataFromMarkdownAsync(entries = bipIndex): Promise<BipFiche[]> {
  const batchSize = 12;
  const fiches: BipFiche[] = [];

  for (let cursor = 0; cursor < entries.length; cursor += batchSize) {
    const batch = entries.slice(cursor, cursor + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (entry) => {
        const fullContent = await fetchFullMarkdownContent(entry.localPath);
        return mapIndexEntryToFiche(entry, fullContent);
      }),
    );

    fiches.push(...batchResults);
  }

  return fiches.filter(f => f.titre && f.content);
}

function getEntriesFromCategoryPaths(filePaths: string[]): typeof bipIndex {
  const normalizedPaths = filePaths.map(normalizeForCategoryMatching);

  const targetDirectories = BIP_FILE_CATEGORIES
    .filter(category => category.path && normalizedPaths.includes(category.path))
    .map(category => category.directory);

  if (targetDirectories.length === 0) {
    return bipIndex;
  }

  return bipIndex.filter(entry =>
    targetDirectories.some(directory =>
      entry.localPath.includes(`/bip_fiches_rag_${directory}_`),
    ),
  );
}

/**
 * Carrega dados BIP apenas dos arquivos selecionados (otimizado para buscas específicas)
 */
async function loadSelectiveBipDataAsync(filePaths: string[]): Promise<BipFiche[]> {
  try {
    const selectedEntries = getEntriesFromCategoryPaths(filePaths);
    const markdownFiches = await loadBipDataFromMarkdownAsync(selectedEntries);
    console.log(`✅ Carregados ${markdownFiches.length} fiches BIP via arquivos .md (${selectedEntries.length} entrada(s) do índice)`);
    return markdownFiches;
  } catch (error) {
    console.error('Erro ao carregar dados BIP seletivamente:', error);
    return [];
  }
}

/**
 * Carrega todos os dados BIP dos arquivos JSONL locais (assincronamente)
 */
async function loadBipDataAsync(): Promise<BipFiche[]> {
  if (bipCache) {
    return bipCache;
  }

  if (bipCachePromise) {
    return bipCachePromise;
  }

  bipCachePromise = (async () => {
    try {
      const allFiches = await loadBipDataFromMarkdownAsync();
      console.log(`✅ Carregados ${allFiches.length} fiches BIP via arquivos .md`);

      bipCache = allFiches;
      console.log(`✅ Carregados ${allFiches.length} fiches BIP de dados locais`);
      return allFiches;
    } catch (error) {
      console.error('Erro ao carregar dados BIP:', error);
      return [];
    }
  })();

  return bipCachePromise;
}

/**
 * Carrega todos os dados BIP dos arquivos JSONL locais (sincronamente, retorna cache ou vazio)
 */
export function loadBipData(): BipFiche[] {
  if (bipCache) {
    return bipCache;
  }

  // Inicia carregamento em background se ainda não foi feito
  if (!bipCachePromise) {
    loadBipDataAsync().catch(err => console.error('Erro ao carregar BIP em background:', err));
  }

  return [];
}

/**
 * Busca fiches por palavras-chave no conteúdo local (assincronamente)
 */
export async function searchBipByKeywords(keywords: string[]): Promise<BipFiche[]> {
  const fiches = await loadBipDataAsync();
  
  if (!keywords || keywords.length === 0) {
    return [];
  }

  const normalizedKeywords = keywords
    .map(k => k.toLowerCase().trim())
    .filter(k => k.length > 0);

  const scored = fiches.map(fiche => {
    let score = 0;

    // Matchs no título (peso: 3)
    const titleLower = fiche.titre.toLowerCase();
    normalizedKeywords.forEach(keyword => {
      if (titleLower.includes(keyword)) score += 3;
    });

    // Matchs na seção (peso: 2)
    const sectionLower = fiche.section.toLowerCase();
    normalizedKeywords.forEach(keyword => {
      if (sectionLower.includes(keyword)) score += 2;
    });

    // Matchs no conteúdo (peso: 1)
    const contentLower = fiche.content.toLowerCase();
    normalizedKeywords.forEach(keyword => {
      if (contentLower.includes(keyword)) score += 1;
    });

    const chapitreLower = (fiche.chapitre || '').toLowerCase();
    normalizedKeywords.forEach(keyword => {
      if (chapitreLower.includes(keyword)) score += 2;
    });

    const sousPartieLower = (fiche.sousPartie || '').toLowerCase();
    normalizedKeywords.forEach(keyword => {
      if (sousPartieLower.includes(keyword)) score += 2;
    });

    return { fiche, score };
  });

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ fiche }) => fiche);
}

/**
 * Obtem todas as fiches (assincronamente)
 */
export async function getAllBipFiches(): Promise<BipFiche[]> {
  return loadBipDataAsync();
}

/**
 * Obtem categorias únicas (assincronamente)
 */
export async function getAllBipCategories(): Promise<string[]> {
  const fiches = await loadBipDataAsync();
  const categories = new Set(fiches.map(f => f.section));
  return Array.from(categories).sort();
}

/**
 * Busca fiches por categoria (assincronamente)
 */
export async function getBipFichesByCategory(category: string): Promise<BipFiche[]> {
  const fiches = await loadBipDataAsync();
  return fiches.filter(f => f.section === category);
}

/**
 * Obtem uma fiche específica pelo código (assincronamente)
 */
export async function getBipFicheByCode(code: string): Promise<BipFiche | undefined> {
  const fiches = await loadBipDataAsync();
  return fiches.find(f => f.code === code);
}

/**
 * Carrega e busca fiches apenas em arquivos selecionados
 * Útil para otimizar buscas quando você sabe quais catégories procurar
 */
export async function searchSelectiveBipByFileAndKeywords(
  filePaths: string[],
  keywords: string[]
): Promise<BipFiche[]> {
  const fiches = await loadSelectiveBipDataAsync(filePaths);
  
  if (!keywords || keywords.length === 0) {
    return [];
  }

  const normalizedKeywords = keywords
    .map(k => k.toLowerCase().trim())
    .filter(k => k.length > 0);

  const scored = fiches.map(fiche => {
    let score = 0;

    // Matchs no título (peso: 3)
    const titleLower = fiche.titre.toLowerCase();
    normalizedKeywords.forEach(keyword => {
      if (titleLower.includes(keyword)) score += 3;
    });

    // Matchs na seção (peso: 2)
    const sectionLower = fiche.section.toLowerCase();
    normalizedKeywords.forEach(keyword => {
      if (sectionLower.includes(keyword)) score += 2;
    });

    // Matchs no conteúdo (peso: 1)
    const contentLower = fiche.content.toLowerCase();
    normalizedKeywords.forEach(keyword => {
      if (contentLower.includes(keyword)) score += 1;
    });

    return { fiche, score };
  });

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ fiche }) => fiche);
}
