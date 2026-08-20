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

export const FALLBACK_FP_NEWS: IntercoNewsItem[] = [
  {
    title: "Masse salariale : l'heure des choix dans les collectivités",
    link: "https://www.lettreducadre.fr/article/masse-salariale-l-heure-des-choix.55534",
    pubDate: "2026-07-10T08:00:00.000Z",
    category: "Ressources & Gestion",
    description: "Contraintes budgétaires, arbitrages RH et pilotage de la masse salariale territoriale.",
    imageUrl: "https://www.lettreducadre.fr/mediatheque/5/2/6/000032625_210x140_c.jpeg"
  },
  {
    title: "Absentéisme : l’usure professionnelle a changé de visage",
    link: "https://www.lettreducadre.fr/article/absenteisme-l-usure-professionnelle-a-change-de-visage.55537",
    pubDate: "2026-07-10T06:00:00.000Z",
    category: "Santé au travail",
    description: "Nouveaux facteurs d'usure, santé mentale et démarches de prévention pour les agents publics.",
    imageUrl: "https://www.lettreducadre.fr/mediatheque/1/2/6/000032621_210x140_c.jpeg"
  },
  {
    title: "L'absurdité invisible des grilles salariales",
    link: "https://www.lettreducadre.fr/article/l-absurdite-invisible-des-grilles-salariales.55535",
    pubDate: "2026-07-10T06:00:00.000Z",
    category: "Salaire & Primes",
    description: "Tassement des grilles, perte de repères d'avancement et défis d'attractivité de la territoriale.",
    imageUrl: "https://www.lettreducadre.fr/mediatheque/2/2/6/000032622_210x140_c.jpeg"
  },
  {
    title: "Reclassement : sortir de la gestion de crise",
    link: "https://www.lettreducadre.fr/article/reclassement-sortir-de-la-gestion-de-crise.55533",
    pubDate: "2026-07-10T06:00:00.000Z",
    category: "Carrière & Mobilité",
    description: "Accompagnement des agents inaptes, reconversion et sécurisation des parcours professionnels.",
    imageUrl: "https://www.lettreducadre.fr/mediatheque/3/2/6/000032623_210x140_c.jpeg"
  },
  {
    title: "8 chantiers RH prioritaires pour la fonction publique territoriale",
    link: "https://www.lettreducadre.fr/article/8-chantiers-rh-pour-la-territoriale.55532",
    pubDate: "2026-07-10T06:00:00.000Z",
    category: "Ressources RH",
    description: "Panorama des transformations majeures : management, attractivité, formation et conditions de travail.",
    imageUrl: "https://www.lettreducadre.fr/mediatheque/9/1/6/000032619_210x140_c.jpeg"
  },
  {
    title: "Rémunération : la FPT au bout du rouleau",
    link: "https://www.lettreducadre.fr/article/remuneration-la-fpt-au-bout-du-rouleau.55529",
    pubDate: "2026-07-08T06:00:00.000Z",
    category: "Salaire & Primes",
    description: "Grilles indiciaires décrochées, RIFSEEP au plafond et tensions salariales persistantes.",
    imageUrl: "https://www.lettreducadre.fr/mediatheque/0/2/6/000032620_210x140_c.jpeg"
  },
  {
    title: "Comment accompagner un agent bipolaire au sein de son équipe ?",
    link: "https://www.lettreducadre.fr/article/comment-accompagner-un-agent-bipolaire-au-sein-de-son-equipe.55515",
    pubDate: "2026-06-17T08:11:00.000Z",
    category: "Santé au travail",
    description: "Conseils pratiques et dialogue managérial face aux handicaps invisibles en collectivité.",
    imageUrl: "https://www.lettreducadre.fr/mediatheque/7/9/5/000032597_210x140_c.jpeg"
  },
  {
    title: "Une fresque pour parler de santé mentale au travail",
    link: "https://www.lettreducadre.fr/article/une-fresque-pour-parler-de-sante-mentale-au-travail.55522",
    pubDate: "2026-06-26T09:26:00.000Z",
    category: "Santé au travail",
    description: "Sensibilisation des managers et formation aux premiers secours en santé mentale.",
    imageUrl: "https://www.lettreducadre.fr/mediatheque/4/0/6/000032604_210x140_c.jpeg"
  },
  {
    title: "La Cour des comptes acte une mutation durable de la place des contractuels",
    link: "https://www.lettreducadre.fr/article/la-cour-des-comptes-acte-une-mutation-durable-de-la-place-des-contractuels-dans-la-territoriale.55517",
    pubDate: "2026-06-19T12:23:00.000Z",
    category: "Statut & Contrats",
    description: "L'irruption en masse des contractuels et les préconisations de la Cour des comptes.",
    imageUrl: "https://www.lettreducadre.fr/mediatheque/9/9/5/000032599_210x140_c.jpeg"
  },
  {
    title: "Ce qui change dans le statut des administrateurs territoriaux et emplois de direction",
    link: "https://www.lettreducadre.fr/article/ce-qui-change-dans-le-statut-des-administrateurs-territoriaux-et-emplois-de-direction.55528",
    pubDate: "2026-07-06T06:00:00.000Z",
    category: "Statut",
    description: "Transposition de la réforme de la haute fonction publique d'État à la territoriale.",
    imageUrl: "https://www.lettreducadre.fr/mediatheque/5/1/6/000032615_210x140_c.jpeg"
  },
  {
    title: "Charge de travail des cadres : retour d'expérience et leviers d'action",
    link: "https://www.lettreducadre.fr/article/comment-rennes-a-planche-sur-la-charge-de-travail-de-ses-cadres-et-mis-au-jour-leurs-irritants-du-quotidien.55073",
    pubDate: "2026-05-14T10:01:00.000Z",
    category: "Management",
    description: "Identifier et gommer les irritants du quotidien pour les cadres territoriaux.",
    imageUrl: "https://www.lettreducadre.fr/mediatheque/7/3/0/000032037_210x140_c.jpeg"
  },
  {
    title: "La smicardisation en marche des agents publics",
    link: "https://www.lettreducadre.fr/article/la-smicardisation-en-marche-des-agents-publics.55495",
    pubDate: "2026-06-04T06:00:00.000Z",
    category: "Salaire & Primes",
    description: "L'impact de la revalorisation du SMIC sur l'échelle indiciaire de la fonction publique.",
    imageUrl: "https://www.lettreducadre.fr/mediatheque/4/8/5/000032584_210x140_c.jpeg"
  },
  {
    title: "Douze conseils pour une fin de carrière (presque) sereine…",
    link: "https://www.lettreducadre.fr/article/douze-conseils-pour-une-fin-de-carriere-presque-sereine.55343",
    pubDate: "2026-01-22T06:00:00.000Z",
    category: "Carrière",
    description: "Anticiper et réussir sa seconde partie de carrière professionnelle.",
    imageUrl: "https://www.lettreducadre.fr/mediatheque/0/7/3/000032370_210x140_c.jpeg"
  },
  {
    title: "La décroissance démographique, une question taboue pour les territoires",
    link: "https://www.lettreducadre.fr/article/la-decroissance-demographique-une-question-largement-taboue.55474",
    pubDate: "2026-05-19T06:01:00.000Z",
    category: "Territoires",
    description: "Nouvelle ère démographique et défis d'organisation pour les services publics territoriaux.",
    imageUrl: "https://www.lettreducadre.fr/mediatheque/3/5/5/000032553_210x140_c.jpeg"
  }
];

export function useNewsFeeds() {
  const [rssItems, setRssItems] = useState<RssItem[]>([]);
  const [rssLoading, setRssLoading] = useState(true);

  const [intercoNews, setIntercoNews] = useState<IntercoNewsItem[]>([]);
  const [intercoLoading, setIntercoLoading] = useState(true);

  const [fpNews, setFpNews] = useState<IntercoNewsItem[]>([]);
  const [fpLoading, setFpLoading] = useState(true);

  const fallbackInterco = useMemo(() => FALLBACK_INTERCO_NEWS, []);
  const fallbackFp = useMemo(() => FALLBACK_FP_NEWS, []);

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

  // 3. FP News (Lettre du Cadre & AMF)
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
          setFpNews(data.items && data.items.length > 0 ? data.items : fallbackFp);
        }
      } catch {
        if (isMounted) setFpNews(fallbackFp);
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
  }, [fallbackFp]);

  return {
    rssItems,
    rssLoading,
    intercoNews,
    intercoLoading,
    fpNews,
    fpLoading,
  };
}
