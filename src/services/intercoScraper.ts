import type { IntercoNewsItem } from '../hooks/useNewsFeeds.ts';
import { getFallbackIntercoImage } from '../hooks/useNewsFeeds.ts';

const CACHE_KEY = 'cfdt_interco_scraped_9_cards_v1';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes de cache

interface CacheData {
  timestamp: number;
  items: IntercoNewsItem[];
}

/**
 * Scrape les 9 cartes d'actualités réelles depuis https://interco.cfdt.fr/actualites/
 * Exécuté au démarrage de l'application ATLAS.
 */
export async function scrapeInterco9Cards(baseUrl = ''): Promise<IntercoNewsItem[]> {
  // 1. Vérification du cache local instantané
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed: CacheData = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS && Array.isArray(parsed.items) && parsed.items.length >= 9) {
        console.log(`[ATLAS Scraper] ⚡ 9 cartes CFDT Interco chargées depuis le cache (${Math.round((Date.now() - parsed.timestamp)/1000)}s)`);
        return parsed.items.slice(0, 9);
      }
    }
  } catch {
    // Continuer vers le scraping direct
  }

  // 2. Récupération via la route backend same-origin (/api/interco-rss) conforme à la politique CSP (connect-src 'self')
  try {
    const res = await fetch('/api/interco-rss', { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items) && data.items.length > 0) {
        const fromApi: IntercoNewsItem[] = data.items.slice(0, 9).map((it: {
          title?: string;
          link?: string;
          pubDate?: string;
          category?: string;
          categories?: string[];
          description?: string;
          imageUrl?: string;
          thumbnail?: string;
          enclosure?: { link?: string };
        }) => {
          const title = (it.title || '').replace(/^•\s*/, '').trim();
          const category = it.category || (it.categories && it.categories[0]) || 'Actu générale';
          const rawImg = it.imageUrl || it.thumbnail || it.enclosure?.link;
          const img = rawImg && !rawImg.includes('logo-cfdt')
            ? rawImg
            : getFallbackIntercoImage(title, category, baseUrl);
          return {
            title,
            link: it.link || 'https://interco.cfdt.fr/actualites/',
            pubDate: it.pubDate || new Date().toISOString(),
            category,
            description: (it.description || '').replace(/<[^>]*>/g, '').trim().substring(0, 150),
            imageUrl: img
          };
        });

        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), items: fromApi }));
        } catch {
          // Ignorer si localStorage plein
        }
        return fromApi.slice(0, 9);
      }
    }
  } catch {
    // Passer au fallback certifié si l'API locale n'est pas joignable
  }

  // 3. Si hors-ligne ou flux indisponible : retour aux 9 cartes certifiées officielles
  return [];
}
