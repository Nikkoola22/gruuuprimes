import { useState, useEffect, useMemo } from 'react';
import { franceInfoRss } from '../data/rss-data.ts';

export interface RssItem {
  title: string;
  link: string;
  pubDate: string;
}

export interface IntercoNewsItem {
  title: string;
  link: string;
  pubDate: string;
  category: string;
  description: string;
  imageUrl?: string;
}

const BASE_URL = import.meta.env.BASE_URL;

const getApiEndpoint = (endpoint: string) => {
  if (import.meta.env.DEV) {
    return `http://localhost:3001/api/${endpoint}`;
  }
  return `/api/${endpoint}`;
};

export const FALLBACK_INTERCO_NEWS: IntercoNewsItem[] = [
  { title: "8 mars, Journée internationale des droits des femmes : la France doit s'engager pour l'égalité !", link: "https://interco.cfdt.fr/8-mars-journee-internationale-des-droits-des-femmes-la-france-doit-sengager-pour-legalite/", pubDate: "Sat, 08 Mar 2026 00:00:00 +0000", category: "Actu générale", description: "Communiqué intersyndical pour la Journée internationale des droits des femmes." },
  { title: "La CFDT réagit à l'annonce de la création de 150 postes en milieu ouvert à la PJJ", link: "https://interco.cfdt.fr/quand-la-protection-judiciaire-de-la-jeunesse-entend-reinventer-le-placement/", pubDate: "Fri, 20 Feb 2026 00:00:00 +0000", category: "Protection judiciaire", description: "Quand la protection judiciaire de la jeunesse entend réinventer le placement." },
  { title: "Défendre l'autonomie et les moyens du CNFPT", link: "https://interco.cfdt.fr/defendre-lautonomie-et-les-moyens-du-cnfpt/", pubDate: "Thu, 12 Feb 2026 00:00:00 +0000", category: "Territoriale", description: "Déclaration CFDT pour défendre l'autonomie et les moyens du CNFPT." },
  { title: "Comment valoriser l'implication des agents et des magistrats ?", link: "https://interco.cfdt.fr/comment-valoriser-limplication-des-agents-et-des-magistrats-et-leur-determination-a-rendre-la-meilleure-justice/", pubDate: "Tue, 10 Feb 2026 00:00:00 +0000", category: "Services judiciaires", description: "Déclaration liminaire Formation spécialisée CSA des services judiciaires." },
  { title: "Se donner l'ambition et les moyens — CSA PJJ du 5 février 2026", link: "https://interco.cfdt.fr/se-donner-lambition-et-les-moyens/", pubDate: "Thu, 05 Feb 2026 00:00:00 +0000", category: "Actu générale", description: "Déclaration préliminaire de la CFDT au CSA PJJ du 5 février 2026." },
  { title: "Un changement de cap clair et concret est demandé !", link: "https://interco.cfdt.fr/un-changement-de-cap-clair-et-concret-est-demande/", pubDate: "Sun, 26 Jan 2026 00:00:00 +0000", category: "Affaires sociales", description: "Déclaration liminaire de la CFDT lors de la rencontre avec la ministre de la Santé." },
  { title: "Déclaration liminaire CFDT au CSA services judiciaires du 19 février", link: "https://interco.cfdt.fr/lacte-de-juger-ne-se-reduit-pas-au-rendu-dune-decision/", pubDate: "Wed, 19 Feb 2026 00:00:00 +0000", category: "Services judiciaires", description: "L'absence de réflexion transverse sur le sens des missions de chacun." },
];

export function useNewsFeeds() {
  const [rssItems, setRssItems] = useState<RssItem[]>([]);
  const [rssLoading, setRssLoading] = useState(true);

  const [intercoNews, setIntercoNews] = useState<IntercoNewsItem[]>([]);
  const [intercoLoading, setIntercoLoading] = useState(true);

  const [fpNews, setFpNews] = useState<IntercoNewsItem[]>([]);
  const [fpLoading, setFpLoading] = useState(true);

  const fallbackInterco = useMemo(() => FALLBACK_INTERCO_NEWS, []);

  // 1. General RSS
  useEffect(() => {
    let isMounted = true;
    const fetchRssFeeds = async () => {
      try {
        setRssLoading(true);
        if (BASE_URL !== '/') {
          if (isMounted) {
            setRssItems(franceInfoRss);
            setRssLoading(false);
          }
          return;
        }

        const apiUrl = getApiEndpoint('rss');
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`);
        const data = await response.json();
        const items = data.items || [];

        if (isMounted) {
          if (items.length > 0) {
            const formattedItems = items.slice(0, 5).map((item: { title?: string; link?: string; pubDate?: string }) => ({
              title: (item.title || '').replace(/^•\s*/, '').trim(),
              link: item.link || '#',
              pubDate: item.pubDate || new Date().toISOString(),
            }));
            setRssItems(formattedItems);
          } else {
            setRssItems(franceInfoRss);
          }
        }
      } catch {
        if (isMounted) setRssItems(franceInfoRss);
      } finally {
        if (isMounted) setRssLoading(false);
      }
    };

    fetchRssFeeds();
    const interval = setInterval(fetchRssFeeds, 30 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // 2. CFDT Interco News
  useEffect(() => {
    let isMounted = true;
    const fetchIntercoNews = async () => {
      try {
        setIntercoLoading(true);
        const apiUrl = getApiEndpoint('interco-rss');
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`);
        const data = await response.json();
        const items = (data.items || []).map((item: IntercoNewsItem) => ({
          ...item,
          title: item.title.replace(/^•\s*/, '').trim(),
        }));

        if (isMounted) {
          setIntercoNews(items.length > 0 ? items : fallbackInterco);
        }
      } catch {
        if (isMounted) setIntercoNews(fallbackInterco);
      } finally {
        if (isMounted) setIntercoLoading(false);
      }
    };

    fetchIntercoNews();
    const interval = setInterval(fetchIntercoNews, 30 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fallbackInterco]);

  // 3. FP News (AMF)
  useEffect(() => {
    let isMounted = true;
    const fetchFpNews = async () => {
      try {
        setFpLoading(true);
        const apiUrl = getApiEndpoint('fp-rss');
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`);
        const data = await response.json();
        if (isMounted) {
          setFpNews(data.items || []);
        }
      } catch {
        // Fallback handled on backend
      } finally {
        if (isMounted) setFpLoading(false);
      }
    };

    fetchFpNews();
    const interval = setInterval(fetchFpNews, 30 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return {
    rssItems,
    rssLoading,
    intercoNews,
    intercoLoading,
    fpNews,
    fpLoading,
  };
}
