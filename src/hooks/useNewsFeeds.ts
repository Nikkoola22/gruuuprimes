import { scrapeInterco9Cards } from '../services/intercoScraper.ts';
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
  return `/api/${endpoint}`;
};

export const resolveIntercoImageUrl = (imageUrl: string | undefined, title = '', category = '', baseUrl = ''): string => {
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : (baseUrl ? baseUrl + '/' : '');
  
  if (imageUrl && !imageUrl.includes('logo-cfdt')) {
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    if (cleanBase && imageUrl.startsWith(cleanBase)) {
      return imageUrl;
    }
    const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
    return `${cleanBase}${cleanPath}`;
  }

  return getFallbackIntercoImage(title, category, cleanBase);
};

const FP_FALLBACK_IMAGES = [
  'https://medias.amf.asso.fr/thumbmails/A201800_51669cc5038acfa94a807572d0caecfa.png',
  'https://medias.amf.asso.fr/thumbmails/A201800_a9cf9553a2c7b7854febe18c29f31cac.jpg',
  'https://medias.amf.asso.fr/thumbmails/A201800_8682724a3eeffad2d6c0257f80cd0c79.jpeg',
  'https://medias.amf.asso.fr/thumbmails/A201800_655f278d01c9fa1ee41be4b9ae003e03.jpg',
  'https://medias.amf.asso.fr/thumbmails/A201800_ac1af4d2d15a96f22f55c4c901a5e458.jpg',
  'https://medias.amf.asso.fr/thumbmails/A201800_aece564ffa162fa73837292979bb1363.jpeg',
  'https://medias.amf.asso.fr/thumbmails/A201800_538b359a3c70272e64a3cc79c1cf2313.jpg',
  'https://medias.amf.asso.fr/thumbmails/A201800_1bd1bf7205fd5a581141413c1c542443.jpg',
  'https://medias.amf.asso.fr/thumbmails/A201800_3e64b82aa977c5d3eb0f4d32494894a5.jpg',
  'https://medias.amf.asso.fr/thumbmails/A201800_5cae11b03e2eef2601c1f8d884c6434f.jpg',
  'https://www.lettreducadre.fr/mediatheque/5/2/6/000032625_210x140_c.jpeg',
  'https://www.lettreducadre.fr/mediatheque/0/2/6/000032620_210x140_c.jpeg',
];

export const getFallbackFpImage = (title = '', categoryOrIndex: string | number = '', baseUrl = ''): string => {
  const categoryStr = typeof categoryOrIndex === 'string' ? categoryOrIndex : '';
  const indexNum = typeof categoryOrIndex === 'number' ? categoryOrIndex : 0;
  const t = (title + ' ' + categoryStr).toLowerCase();
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : (baseUrl ? baseUrl + '/' : '');

  // 1. Rénovation énergétique, Climat, Transition écologique, Biodiversité, Chaleur
  if (t.includes('rénovation') || t.includes('renovation') || t.includes('énergie') || t.includes('energie') || 
      t.includes('écolog') || t.includes('ecolog') || t.includes('climat') || t.includes('biodiversité') || 
      t.includes('biodiversite') || t.includes('chaleur') || t.includes('environnement') || t.includes('vivant')) {
    return `${cleanBase}images/chanteraines.png`;
  }

  // 2. Commerce, Artisanat, Proximité, Économie locale
  if (t.includes('commerce') || t.includes('artisanat') || t.includes('proximité') || t.includes('proximite') || 
      t.includes('boutique') || t.includes('marché') || t.includes('marche')) {
    return `${cleanBase}images/marche_village.png`;
  }

  // 3. Sécurité, Police municipale, Gendarmerie, Gend'élus
  if (t.includes('gend') || t.includes('police') || t.includes('sécurité') || t.includes('securite') || 
      t.includes('gendarme') || t.includes('tranquillité') || t.includes('tranquillite')) {
    return `${cleanBase}interco/actu-cfdt-police.svg`;
  }

  // 4. Élus, Maires, Congrès des maires, Intercommunalité, Statut de l'élu
  if (t.includes('élu') || t.includes('elu') || t.includes('maire') || t.includes('intercommunalité') || 
      t.includes('intercommunalite') || t.includes('congres') || t.includes('congrès') || t.includes('commune') || 
      t.includes('amf') || t.includes('agglo')) {
    return `${cleanBase}interco/actu-soutien-collectivites.svg`;
  }

  // 5. Salaires, Rémunération, Primes, Pouvoir d'achat, Budget, Masse salariale, Grilles
  if (t.includes('salaire') || t.includes('remuneration') || t.includes('rémunération') || t.includes('prime') || 
      t.includes('budget') || t.includes('smic') || t.includes('masse salariale') || t.includes('financ')) {
    return `${cleanBase}images/primes_lien.png`;
  }

  // 6. Santé au travail, Absentéisme, Usure professionnelle, Santé mentale, Prévention
  if (t.includes('santé') || t.includes('sante') || t.includes('absentéisme') || t.includes('absenteisme') || 
      t.includes('usure') || t.includes('bipolaire') || t.includes('psych') || t.includes('handicap') || t.includes('inapt')) {
    return `${cleanBase}interco/actu-sante-social.svg`;
  }

  // 7. Statut, Loi, Décret, Juridique, Reclassement, Carrière
  if (t.includes('statut') || t.includes('carrière') || t.includes('carriere') || t.includes('reclassement') || 
      t.includes('contrat') || t.includes('décret') || t.includes('decret') || t.includes('jurid')) {
    return `${cleanBase}images/legal_news_illustration.png`;
  }

  // 8. Formation, CNFPT, Concours, Écoles
  if (t.includes('formation') || t.includes('cnfpt') || t.includes('concours') || t.includes('école') || t.includes('ecole')) {
    return `${cleanBase}images/formation_lien.png`;
  }

  // 9. AMF media fallbacks if index is provided
  if (FP_FALLBACK_IMAGES.length > 0 && typeof categoryOrIndex === 'number') {
    const hash = (title || '').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), indexNum);
    return FP_FALLBACK_IMAGES[Math.abs(hash) % FP_FALLBACK_IMAGES.length];
  }

  // 10. Par défaut : Mairie de Gennevilliers
  return `${cleanBase}images/mairie.png`;
};

export const resolveFpImageUrl = (
  imageUrl: string | undefined,
  title = '',
  categoryOrIndex: string | number = '',
  baseUrl = ''
): string => {
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : (baseUrl ? baseUrl + '/' : '');

  if (imageUrl && typeof imageUrl === 'string') {
    const trimmed = imageUrl.trim();
    if (!trimmed.includes('632d07975d58b7f5e93d98577155bfa6')) {
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
      }
      if (trimmed.startsWith('//')) {
        return `https:${trimmed}`;
      }
      if (trimmed.startsWith('thumbmails/')) {
        return `https://medias.amf.asso.fr/${trimmed}`;
      }
      if (trimmed.startsWith('A201800_')) {
        return `https://medias.amf.asso.fr/thumbmails/${trimmed}`;
      }
      if (trimmed.startsWith('/')) {
        return `https://www.amf.asso.fr${trimmed}`;
      }
      if (cleanBase && trimmed.startsWith(cleanBase)) {
        return trimmed;
      }
    }
  }

  return getFallbackFpImage(title, categoryOrIndex, cleanBase);
};

export const getFallbackIntercoImage = (title = '', category = '', baseUrl = ''): string => {
  const t = (title + ' ' + category).toLowerCase();
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : (baseUrl ? baseUrl + '/' : '');

  // 1. CFDT Police
  if (t.includes('police')) {
    return `${cleanBase}interco/card-1-police.png`;
  }
  // 2. Mobilisation du 5 novembre
  if (t.includes('5 novembre') || t.includes('grève') || t.includes('greve') || t.includes('préavis') || t.includes('preavis')) {
    return `${cleanBase}interco/card-2-greve5nov.png`;
  }
  // 3. Émeutes et dégradations du 17 octobre
  if (t.includes('émeute') || t.includes('emeute') || t.includes('17 octobre') || t.includes('dégradation') || t.includes('degradation') || t.includes('saccage')) {
    return `${cleanBase}interco/card-3-emeutes17oct.png`;
  }
  // 4. Réformes, référés et dématérialisation
  if (t.includes('réforme') || t.includes('reforme') || t.includes('référé') || t.includes('refere') || t.includes('dématérialisation') || t.includes('dematerialisation')) {
    return `${cleanBase}interco/card-4-reformes-dsj.png`;
  }
  // 5. Les promesses n'engagent que ceux qui y croient
  if (t.includes('promesse') || t.includes('dsj') || t.includes('vieil adage')) {
    return `${cleanBase}interco/card-5-promesses-dsj.png`;
  }
  // 6. Mobilisations lycéennes : Jeunesse engagée / plutôt que réprimer
  if (t.includes('jeunesse') || t.includes('engagée') || t.includes('engagee') || t.includes('réprimer') || t.includes('reprimer') || t.includes('plutôt que')) {
    return `${cleanBase}interco/card-6-jeunesse-engagee.png`;
  }
  // 7. À la PJJ, des équipes sous forte tension
  if (t.includes('pjj') || t.includes('forte tension') || t.includes('milieu ouvert') || t.includes('tension')) {
    return `${cleanBase}interco/card-7-pjj-tension.png`;
  }
  // 8. Manifestations lycéennes : soutien mouvements pacifiques (6 octobre)
  if (t.includes('pacifique') || t.includes('lycéen') || t.includes('lyceen') || t.includes('6 octobre')) {
    return `${cleanBase}interco/card-8-manif-lyceens-6oct.png`;
  }
  // 9. Mobilisation du 29 septembre 2026
  if (t.includes('29 septembre')) {
    return `${cleanBase}interco/card-9-greve-29sept.png`;
  }

  // Fallback déterministe sur les 9 vraies cartes
  const fallbackList = [
    'interco/card-1-police.png',
    'interco/card-2-greve5nov.png',
    'interco/card-3-emeutes17oct.png',
    'interco/card-4-reformes-dsj.png',
    'interco/card-5-promesses-dsj.png',
    'interco/card-6-jeunesse-engagee.png',
    'interco/card-7-pjj-tension.png',
    'interco/card-8-manif-lyceens-6oct.png',
    'interco/card-9-greve-29sept.png'
  ];
  const idx = Math.abs((title || '').length) % fallbackList.length;
  return `${cleanBase}${fallbackList[idx]}`;
};



export const FALLBACK_INTERCO_NEWS: IntercoNewsItem[] = [
  {
    title: "Création du syndicat CFDT Police",
    link: "https://interco.cfdt.fr/creation-du-syndicat-cfdt-police/",
    pubDate: "2026-10-20T10:30:00.000Z",
    category: "Actu générale",
    description: "La CFDT se relance dans la police nationale avec la création du syndicat CFDT Police au sein de la fédération CFDT Interco",
    imageUrl: "interco/card-1-police.png"
  },
  {
    title: "Mobilisation du 5 novembre 2026 : préavis de grève",
    link: "https://interco.cfdt.fr/appel-a-la-greve-et-mobilisation-du-5-novembre-2026/",
    pubDate: "2026-10-24T08:00:00.000Z",
    category: "Actu générale",
    description: "La CFDT Fonctions publiques a écrit au ministre de la Fonction publique pour déposer un préavis de grève, qui couvre les agents des trois versants de la Fonction publique.",
    imageUrl: "interco/card-2-greve5nov.png"
  },
  {
    title: "Après les émeutes et dégradations du 17 octobre 2026",
    link: "https://interco.cfdt.fr/soutien-agents-collectivites-violences-urbaines/",
    pubDate: "2026-10-19T14:15:00.000Z",
    category: "Actu générale",
    description: "La fédération CFDT Interco condamne fermement les saccages, apporte sa solidarité aux agents touchés et s'interroge sur le sous-dimensionnement des dispositifs de maintien de l'ordre",
    imageUrl: "interco/card-3-emeutes17oct.png"
  },
  {
    title: "Réformes, référés et dématérialisation : où sont les moyens ?",
    link: "https://interco.cfdt.fr/reformes-referes-dematerialisation-ou-sont-les-moyens/",
    pubDate: "2026-10-15T09:00:00.000Z",
    category: "Protection judiciaire de la jeunesse",
    description: "Déclaration liminaire de la CFDT au CSA Services Judiciaires du 15 octobre 2026",
    imageUrl: "interco/card-4-reformes-dsj.png"
  },
  {
    title: "Les promesses n'engagent que ceux qui y croient, vieil adage remis au goût du jour à la DSJ",
    link: "https://interco.cfdt.fr/les-promesses-nengagent-que-ceux-qui-y-croient/",
    pubDate: "2026-09-17T09:00:00.000Z",
    category: "Protection judiciaire de la jeunesse",
    description: "Déclaration liminaire de la CFDT au CSA Services Judiciaires du 17 septembre 2026",
    imageUrl: "interco/card-5-promesses-dsj.png"
  },
  {
    title: "Mobilisations lycéennes : Écouter, dialoguer, construire des réponses PLUTÔT QUE RÉPRIMER !",
    link: "https://interco.cfdt.fr/mobilisations-lyceennes-ecouter-dialoguer/",
    pubDate: "2026-10-10T09:00:00.000Z",
    category: "Protection judiciaire de la jeunesse",
    description: "Pour garantir les droits et l'avenir de la jeunesse",
    imageUrl: "interco/card-6-jeunesse-engagee.png"
  },
  {
    title: "À la PJJ, des équipes sous forte tension",
    link: "https://interco.cfdt.fr/declaration-csa-pjj-octobre-2026/",
    pubDate: "2026-10-08T11:00:00.000Z",
    category: "Protection judiciaire de la jeunesse",
    description: "Déclaration préliminaire de la CFDT au CSA PJJ du 08 octobre 2026",
    imageUrl: "interco/card-7-pjj-tension.png"
  },
  {
    title: "Manifestations lycéennes : La fédération CFDT Interco soutient les mouvements pacifiques et dénonce les violences",
    link: "https://interco.cfdt.fr/manifestations-lyceennes-soutien-mouvements-pacifiques/",
    pubDate: "2026-10-06T10:00:00.000Z",
    category: "Actu générale",
    description: "La fédération CFDT Interco appelle aussi les pouvoirs publics à entendre les revendications des lycéens et à apporter une réponse prompte et significative",
    imageUrl: "interco/card-8-manif-lyceens-6oct.png"
  },
  {
    title: "Mobilisation du 29 septembre 2026 : la CFDT Interco dénonce dans la fonction publique des conditions de travail et d'emploi qui se dégradent",
    link: "https://interco.cfdt.fr/mobilisation-29-septembre-2026/",
    pubDate: "2026-09-29T08:00:00.000Z",
    category: "Actu générale",
    description: "À l'occasion de la mobilisation de ce jour, la CFDT Interco alerte sur la situation des agents de la fonction publique, confrontés à une dégradation continue de leurs conditions de travail et d'emploi.",
    imageUrl: "interco/card-9-greve-29sept.png"
  }
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

  // 2. CFDT Interco News : Scraping en direct des 9 cartes dès le démarrage de l'app ATLAS
  useEffect(() => {
    let isMounted = true;

    const startIntercoLiveScraping = async () => {
      try {
        setIntercoLoading(true);

        // Affichage immédiat des 9 cartes par défaut pour éviter tout temps d'attente
        if (isMounted) {
          setIntercoNews(fallbackInterco);
        }

        // Exécution du scraper au démarrage
        const scraped = await scrapeInterco9Cards(BASE_URL);

        if (isMounted && Array.isArray(scraped) && scraped.length > 0) {
          console.log(`[ATLAS Startup] ⚡ Mise à jour du carrousel avec les ${scraped.length} cartes fraîches scrapées !`);
          setIntercoNews(scraped.slice(0, 9));
        }
      } catch (err) {
        console.warn('[ATLAS Startup] Utilisation des 9 cartes certifiées:', err);
        if (isMounted) {
          setIntercoNews(fallbackInterco);
        }
      } finally {
        if (isMounted) {
          setIntercoLoading(false);
        }
      }
    };

    startIntercoLiveScraping();
    // Rafraîchissement automatique toutes les 15 minutes
    const interval = setInterval(startIntercoLiveScraping, 15 * 60 * 1000);
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
          const rawItems: IntercoNewsItem[] = data.items && data.items.length > 0 ? data.items : fallbackFp;
          const sanitizedItems = rawItems.map((item, idx) => ({
            ...item,
            imageUrl: resolveFpImageUrl(item.imageUrl, item.title, idx),
          }));
          setFpNews(sanitizedItems);
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
