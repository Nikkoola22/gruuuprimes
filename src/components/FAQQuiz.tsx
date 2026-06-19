import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Trophy,
  Award,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  BookOpen
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// ─── Effets Spéciaux (Canvas) ─────────────────────────────────────────────────
interface SpecialEffectsCanvasProps {
  type: "win" | "lose";
}

const SpecialEffectsCanvas: React.FC<SpecialEffectsCanvasProps> = ({ type }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.offsetWidth || 600);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || 400);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.offsetWidth || 600;
      height = canvas.height = canvas.parentElement?.offsetHeight || 400;
    };
    window.addEventListener("resize", handleResize);

    interface Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      emoji?: string;
    }

    const particles: Particle[] = [];
    const colors = ["#FFC107", "#FF5722", "#E91E63", "#9C27B0", "#3F51B5", "#00BCD4", "#4CAF50", "#8BC34A"];
    const emojis = ["📚", "❓", "💡", "🧠", "✍️"];

    if (type === "win") {
      // Confetti burst from bottom-left
      for (let i = 0; i < 60; i++) {
        particles.push({
          x: 0,
          y: height,
          size: Math.random() * 8 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: Math.random() * 10 + 4,
          speedY: -(Math.random() * 14 + 10),
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() * 10 - 5,
          opacity: 1,
        });
      }
      // Confetti burst from bottom-right
      for (let i = 0; i < 60; i++) {
        particles.push({
          x: width,
          y: height,
          size: Math.random() * 8 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: -(Math.random() * 10 + 4),
          speedY: -(Math.random() * 14 + 10),
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() * 10 - 5,
          opacity: 1,
        });
      }
      // Falling confetti from the top
      for (let i = 0; i < 40; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * -100 - 10,
          size: Math.random() * 6 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: Math.random() * 2 - 1,
          speedY: Math.random() * 3 + 2,
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() * 4 - 2,
          opacity: 1,
        });
      }
    } else {
      // Floating study icons
      for (let i = 0; i < 20; i++) {
        particles.push({
          x: Math.random() * width,
          y: height + Math.random() * 100,
          size: Math.random() * 16 + 14,
          color: "",
          speedX: Math.random() * 1 - 0.5,
          speedY: -(Math.random() * 1.5 + 0.8),
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() * 2 - 1,
          opacity: 0.8,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
        });
      }
    }

    const gravity = 0.3;
    const friction = 0.98;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      let active = false;

      particles.forEach((p) => {
        if (type === "win") {
          p.speedY += gravity;
          p.speedX *= friction;
          p.speedY *= friction;
          p.y += p.speedY;
          p.x += p.speedX;
          p.rotation += p.rotationSpeed;
        } else {
          p.y += p.speedY;
          p.x += p.speedX;
          p.rotation += p.rotationSpeed;
          if (p.y < height * 0.4) {
            p.opacity -= 0.008;
          }
        }

        if (p.opacity > 0 && p.y < height + 50 && p.x > -50 && p.x < width + 50) {
          active = true;
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);

          if (type === "win") {
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          } else if (p.emoji) {
            ctx.font = `${p.size}px sans-serif`;
            ctx.fillText(p.emoji, -p.size / 2, p.size / 2);
          }
          ctx.restore();
        }
      });

      if (active) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [type]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none w-full h-full rounded-3xl z-0"
    />
  );
};

const QUIZ_LENGTH = 10;

// ─── Pool de questions ───────────────────────────────────────────────────────
const ALL_QUESTIONS: Question[] = [
  // Questions issues des fiches BIP
  {
    question: "Qu'est-ce qu'un agent contractuel de droit public ?",
    options: [
      "Un agent recruté par une entreprise privée, ou semi-privée",
      "Un agent non titulaire recruté par une collectivité ou un établissement public",
      "Un agent titulaire de la fonction publique avec un contrat specifique",
      "Un agent en intérim dans le secteur privé avec une mission de service public",
    ],
    correctIndex: 1,
    explanation: "Un agent contractuel de droit public est recruté par une collectivité ou un établissement public, sans être titulaire.",
  },
  {
    question: "Quelle est la durée maximale d'un congé maladie ordinaire (CMO) ?",
    options: [
      "3 mois",
      "6 mois",
      "1 an",
      "3 ans",
    ],
    correctIndex: 2,
    explanation: "Le CMO peut durer jusqu'à 1 an : 3 mois à 90% du traitement puis 9 mois à demi-traitement.",
  },
  {
    question: "Qu'est-ce que la disponibilité dans la fonction publique ?",
    options: [
      "Une période d'attente avant une nouvelle affectation dans une autre collectivité",
      "Une position hors cadres permettant à l'agent de cesser temporairement ses fonctions sans rémunération",
      "Un congé exceptionnel accordé par l'administration avant le depart pour la retraite",
      "Une période de formation longue durée rémunérée afin de se réorienter dans le privée",
    ],
    correctIndex: 1,
    explanation: "La disponibilité place l'agent hors de son administration d'origine : il cesse ses fonctions et n'est plus rémunéré pendant cette période.",
  },
  {
    question: "Qu'est-ce qu'un détachement dans la fonction publique ?",
    options: [
      "Un congé maladie de longue durée pour un agent hors de son administration",
      "La possibilité pour un agent d'exercer temporairement dans une autre administration ou organisme",
      "Un départ définitif de la fonction publique pour tavailler dans une entreprise privée",
      "Un congé pour formation professionnelle permetant d'etre détaché auprès de l organisme de formation",
    ],
    correctIndex: 1,
    explanation: "Le détachement permet à un agent d'exercer temporairement dans une autre administration ou organisme tout en conservant ses droits à l'avancement.",
  },
  {
    question: "Qu'est-ce que la NBI (Nouvelle Bonification Indiciaire) ?",
    options: [
      "Une prime liée aux résultats individuels pour certaines fonctions particulières",
      "Des points d'indice supplémentaires attribués pour certaines fonctions particulières",
      "Une nouvelle grille de rémunération nationale pour certains métiers particulièrs",
      "Un bonus annuel exceptionnel pour certaines fonctions particulières",
    ],
    correctIndex: 1,
    explanation: "La NBI est un supplément de points d'indice attribué aux agents exerçant certaines fonctions comportant une responsabilité ou une technicité particulière.",
  },
  {
    question: "Qu'est-ce que le RIFSEEP ?",
    options: [
      "Un régime de retraite complémentaire selon l'ancienneté et la valeur professionnelle",
      "Un régime indemnitaire tenant compte des fonctions, sujétions, expertise et engagement professionnel",
      "Une prime exceptionnelle annuelle pour certaines fonctions particulières",
      "Un dispositif de formation professionnelle tenant compte des fonctions, sujétions, expertise et engagement professionnel",
    ],
    correctIndex: 1,
    explanation: "Le RIFSEEP est le régime indemnitaire principal dans la fonction publique territoriale depuis 2016.",
  },
  {
    question: "Qu'est-ce que le CIA dans le RIFSEEP ?",
    options: [
      "Complément Indemnitaire Annuel versé selon l'engagement professionnel et les résultats",
      "Commission d'Inspection Administrative pour l'agent victime d'attaques dans l'exercice de ses fonctions",
      "Compte Individuel d'Activité de formation professionnelle tenant compte des fonctions, sujétions, expertise et engagement professionnel",
      "Comité d'Intervention Administrative pour certaines fonctions particulières",
    ],
    correctIndex: 0,
    explanation: "Le CIA (Complément Indemnitaire Annuel) est la part variable du RIFSEEP, versée en fonction des résultats et de l'engagement professionnel de l'agent.",
  },
  {
    question: "Qu'est-ce qu'une promotion de grade dans la FPT ?",
    options: [
      "Un changement de corps ou de cadre d'emplois selon l'ancienneté et la valeur professionnelle",
      "Une progression à l'intérieur du même cadre d'emplois selon l'ancienneté et la valeur professionnelle",
      "Une augmentation de salaire sans changement de grade versé selon l'engagement professionnel et les résultats",
      "Un simple changement de poste selon l'engagement professionnel et les résultats",
    ],
    correctIndex: 1,
    explanation: "La promotion de grade permet à un agent de progresser au sein de son cadre d'emplois, en fonction de son ancienneté et de sa valeur professionnelle reconnue.",
  },
  {
    question: "Qu'est-ce que la protection fonctionnelle ?",
    options: [
      "Une assurance professionnelle personnelle souscrite par l'agent victime d'attaques dans l'exercice de ses fonctions",
      "La protection accordée par l'employeur à l'agent victime d'attaques dans l'exercice de ses fonctions",
      "Un dispositif de protection des données personnelles de l'employeur victime d'attaques",
      "Un système de protection contre le licenciement abusif de l'employeur",
    ],
    correctIndex: 1,
    explanation: "La protection fonctionnelle est l'obligation pour l'employeur de protéger et défendre l'agent victime d'attaques, menaces ou poursuites dans l'exercice de ses fonctions.",
  },
  {
    question: "Qu'est-ce que le compte épargne-temps (CET) ?",
    options: [
      "Un compte bancaire dédié aux primes versé selon l'engagement professionnel et les résultats",
      "Un dispositif permettant d'épargner des jours de congés non pris pour les utiliser ultérieurement ou les monétiser",
      "Un compte de formation professionnelle tenant compte des fonctions, sujétions, expertise et engagement professionnel",
      "Un système d'épargne retraite complémentaire permettant d'épargner des jours de congés non pris",
    ],
    correctIndex: 1,
    explanation: "Le CET permet d'accumuler des jours de congés non pris (plafond 60 jours) pour les utiliser ultérieurement ou les monétiser.",
  },
  {
    question: "Qu'est-ce que le temps partiel thérapeutique ?",
    options: [
      "Un temps partiel choisi par l'agent pour convenance personnelle",
      "Un temps partiel accordé après maladie pour favoriser la reprise progressive du travail",
      "Un temps partiel imposé par l'employeur après une longue absence",
      "Un temps partiel lié à une formation longue durée",
    ],
    correctIndex: 1,
    explanation: "Le temps partiel thérapeutique est accordé après un congé maladie pour permettre une reprise progressive et sécurisée du travail.",
  },
  {
    question: "Qu'est-ce que le droit de retrait ?",
    options: [
      "Le droit de prendre sa retraite anticipée pour un motif raisonnable",
      "Le droit de quitter son poste en cas de danger grave et imminent pour sa vie ou sa santé",
      "Le droit de refuser une mutation  un motif raisonnable",
      "Le droit de demander un congé sans solde  un motif raisonnable",
    ],
    correctIndex: 1,
    explanation: "Le droit de retrait permet à un agent de quitter son poste s'il a un motif raisonnable de penser qu'il se trouve dans une situation de danger grave et imminent.",
  },
  {
    question: "Qu'est-ce que le conseil de discipline des agents contractuels ?",
    options: [
      "Un organe chargé d'attribuer des primes et donne un avis sur les augmentations",
      "Un organe qui examine les situations disciplinaires et donne un avis sur les sanctions",
      "Un comité de recrutement pour le changement de poste au sein d'une même collectivité ou vers une autre collectivité",
      "Un service de gestion des congés",
    ],
    correctIndex: 1,
    explanation: "Le conseil de discipline examine les situations disciplinaires et donne un avis sur les sanctions à appliquer aux agents contractuels.",
  },
  {
    question: "Qu'est-ce que la mobilité dans la fonction publique territoriale ?",
    options: [
      "Le changement de poste au sein d'une même collectivité ou vers une autre collectivité",
      "Le passage du secteur public au secteur privé avec un contrat spécifique",
      "Un congé pour formation professionnelle au sein d'une autre collectivité",
      "Un détachement à l'étranger uniquement pour les fonctionaires de nationalité européenne ",
    ],
    correctIndex: 0,
    explanation: "La mobilité permet à un agent de changer de poste au sein de la même collectivité ou vers une autre, pour favoriser l'évolution professionnelle.",
  },
  {
    question: "Combien de jours de télétravail par semaine sont autorisés par défaut à Gennevilliers ?",
    options: [
      "1 jour par semaine",
      "2 jours par semaine",
      "3 jours par semaine",
      "4 jours par semaine",
    ],
    correctIndex: 1,
    explanation: "Le télétravail est autorisé jusqu'à 2 jours par semaine par défaut à Gennevilliers.",
  },
  {
    question: "Quel est le délai de prévenance pour annuler une journée de télétravail ?",
    options: [
      "24 heures",
      "48 heures",
      "72 heures",
      "1 semaine",
    ],
    correctIndex: 1,
    explanation: "Le délai de prévenance est de 48 heures pour annuler une journée de télétravail.",
  },
  {
    question: "Quelle est la durée légale annuelle du temps de travail dans la fonction publique ?",
    options: [
      "1 500 heures par an",
      "1 607 heures par an",
      "1 650 heures par an",
      "1 750 heures par an",
    ],
    correctIndex: 1,
    explanation: "La durée légale du temps de travail est de 1 607 heures par an, soit 35 heures par semaine.",
  },
  {
    question: "Combien de jours de congés annuels a-t-on droit à Gennevilliers sur 5 jours de travail par semaine ?",
    options: [
      "20 jours ouvrés",
      "22 jours ouvrés",
      "25 jours ouvrés",
      "28 jours ouvrés",
    ],
    correctIndex: 2,
    explanation: "Un agent travaillant 5 jours par semaine a droit à 25 jours ouvrés de congés annuels.",
  },
  {
    question: "Comment sont rémunérées les heures supplémentaires dans la fonction publique territoriale ?",
    options: [
      "Elles sont automatiquement payées en fin de mois mais sur 10 mois seulement",
      "Elles sont toujours récupérées en temps de repos uniquement",
      "Elles peuvent être indemnisées (IHTS) ou récupérées en repos si demandées par la hiérarchie",
      "Elles ne sont jamais rémunérées sauf si l'agent le demande a sa hierarchie ",
    ],
    correctIndex: 2,
    explanation: "Les heures supplémentaires peuvent être indemnisées via les IHTS ou compensées par du repos compensateur, à condition d'avoir été demandées par la hiérarchie.",
  },
  {
    question: "Quelle est la durée journalière de travail pour un agent à temps plein sur 5 jours ?",
    options: [
      "7 heures par jour",
      "7h12 par jour",
      "7h30 par jour",
      "8 heures par jour",
    ],
    correctIndex: 1,
    explanation: "Sur 5 jours, la durée journalière standard est de 7h12 (1607h / 52 semaines / 5 jours ≈ 7h12).",
  },
  {
    question: "Qu'est-ce que le COS (Comité des Œuvres Sociales) ?",
    options: [
      "Un syndicat professionnel proposant des services juridiques",
      "Un organisme qui gère les activités sociales et culturelles des agents",
      "Un comité de sécurité au travail avec une aide de l assistante sociale",
      "Une caisse de retraite complémentaire pour agents avec de petites pensions",
    ],
    correctIndex: 1,
    explanation: "Le COS gère les activités sociales et culturelles proposées aux agents (loisirs, vacances, culture, etc.).",
  },
  {
    question: "Qu'est-ce que le temps partiel dans la fonction publique ?",
    options: [
      "Un temps partiel uniquement imposé par l'employeur pour certaines fonctions particulières",
      "Le temps partiel peut être accordé de droit (naissance, adoption, handicap) ou sur autorisation selon les besoins du service",
      "Un temps partiel réservé aux agents de catégorie C accordé de droit (naissance, adoption, handicap) ou sur autorisation selon les besoins du service",
      "Un temps partiel uniquement thérapeutique sur autorisation selon les besoins du service",
    ],
    correctIndex: 1,
    explanation: "Le temps partiel peut être de droit (pour élever un enfant, en cas de handicap) ou sur autorisation selon les nécessités de service.",
  },
  {
    question: "Quel est le délai pour contester une sanction disciplinaire devant le tribunal administratif ?",
    options: [
      "15 jours",
      "1 mois",
      "2 mois",
      "3 mois",
    ],
    correctIndex: 2,
    explanation: "L'agent dispose de 2 mois pour contester une sanction disciplinaire devant le tribunal administratif.",
  },
  {
    question: "Qu'est-ce que le CST (Comité Social Territorial) ?",
    options: [
      "Comité des Salaires et Traitements remplaçant le CHSCT et le CT depuis 2023",
      "Instance de dialogue social remplaçant le CHSCT et le CT depuis 2023",
      "Conseil Supérieur du Travail remplaçant le CHSCT et le CT depuis 2023",
      "Commission de Suivi des Titulaires remplaçant le CHSCT et le CT depuis 2023",
    ],
    correctIndex: 1,
    explanation: "Le CST (Comité Social Territorial) est la nouvelle instance de dialogue social qui a fusionné le Comité Technique (CT) et le CHSCT depuis la réforme de 2023.",
  },
  {
    question: "Quelle est la durée du congé maternité pour un premier enfant ?",
    options: [
      "10 semaines",
      "14 semaines",
      "16 semaines",
      "26 semaines",
    ],
    correctIndex: 2,
    explanation: "Le congé maternité pour un premier enfant est de 16 semaines (6 semaines avant + 10 semaines après l'accouchement).",
  },
  {
    question: "Qu'est-ce que le CAP (Conseil d'Administration Paritaire) ?",
    options: [
      "Une instance composée de représentants de l'administration et des personnels qui examine les situations individuelles des agents",
      "Un comité de pilotage administratif permanent composée de représentants de l'administration et des personnels qui examine les situations individuelles des agents",
      "Une commission d'attribution des primes composée de représentants de l'administration et des personnels qui examine les situations individuelles des agents",
      "Un conseil d'administration des projets composée de représentants de l'administration et des personnels qui examine les situations individuelles des agents",
    ],
    correctIndex: 0,
    explanation: "Le CAP est une instance paritaire qui examine les situations individuelles des agents (avancements, mutations, sanctions, etc.).",
  },
  {
    question: "Combien de jours de congés pour événements familiaux lors d'un mariage ou PACS ?",
    options: [
      "1 jour",
      "3 jours",
      "5 jours",
      "7 jours",
    ],
    correctIndex: 2,
    explanation: "L'agent a droit à 5 jours de congés spéciaux lors de son propre mariage ou PACS.",
  },
  {
    question: "Quel est le nombre de jours de congés supplémentaires accordés pour fractionnement ?",
    options: [
      "1 ou 2 jours selon les conditions",
      "3 jours automatiquement",
      "5 jours maximum selon les conditions",
      "Aucun jour supplémentaire",
    ],
    correctIndex: 0,
    explanation: "Des jours supplémentaires (1 ou 2 jours) peuvent être accordés si l'agent prend une partie de ses congés en dehors de la période principale (1er mai – 31 octobre).",
  },
  {
    question: "Quelle est la durée maximale de télétravail hebdomadaire pour un agent à temps plein ?",
    options: [
      "2 jours par semaine",
      "3 jours par semaine",
      "4 jours par semaine",
      "5 jours par semaine",
    ],
    correctIndex: 1,
    explanation: "Le plafond réglementaire est de 3 jours de télétravail par semaine pour un agent à temps plein.",
  },
  {
    question: "Quelles sont les catégories hiérarchiques de la fonction publique territoriale ?",
    options: [
      "Catégorie A, B et D uniquement",
      "Catégorie A (cadres), B (techniciens/agents de maîtrise) et C (agents d'exécution)",
      "Catégorie 1, 2 et 3",
      "Catégorie junior, senior et expert",
    ],
    correctIndex: 1,
    explanation: "La FPT est organisée en trois catégories : A (cadres et dirigeants), B (techniciens et agents de maîtrise) et C (agents d'exécution).",
  },
  {
    question: "Qu'est-ce que le droit syndical dans la fonction publique ?",
    options: [
      "Le droit de grève uniquement",
      "Le droit de se syndiquer, participer à des réunions syndicales et bénéficier de décharges d'activité de service",
      "Le droit de négocier son salaire individuellement",
      "Le droit de refuser toute affectation",
    ],
    correctIndex: 1,
    explanation: "Le droit syndical comprend : se syndiquer, assister à des réunions, bénéficier de décharges d'activité et d'un local syndical.",
  },
  {
    question: "Quelle est la durée du stage pour un fonctionnaire stagiaire dans la FPT ?",
    options: [
      "3 mois",
      "6 mois",
      "1 an",
      "2 ans",
    ],
    correctIndex: 2,
    explanation: "La durée du stage est généralement d'1 an pour un fonctionnaire stagiaire dans la fonction publique territoriale avant titularisation.",
  },
  {
    question: "Combien de jours de congés spéciaux lors du décès d'un parent proche ?",
    options: [
      "1 jour",
      "2 jours",
      "3 jours",
      "5 jours",
    ],
    correctIndex: 2,
    explanation: "L'agent a droit à 3 jours de congés spéciaux lors du décès d'un parent proche (père, mère, conjoint, enfant).",
  },
  {
    question: "Qu'est-ce que le droit à la déconnexion ?",
    options: [
      "Le droit de ne pas avoir de téléphone professionnel pendant son télétravail",
      "Le droit de ne pas être contacté professionnellement en dehors des heures de travail",
      "Le droit de refuser l'accès à internet pendant son télétravail",
      "Le droit de désactiver son badge professionnel pendant son congés",
    ],
    correctIndex: 1,
    explanation: "Le droit à la déconnexion est le droit pour l'agent de ne pas répondre aux sollicitations professionnelles en dehors de ses horaires de travail.",
  },
  {
    question: "Qu'est-ce que le télétravail flottant ?",
    options: [
      "Des jours de télétravail non fixes, choisis librement dans un crédit mensuel défini",
      "Du télétravail uniquement les jours fériés dans un crédit mensuel défini",
      "Du télétravail depuis la province",
      "Du télétravail partagé entre deux agents sur un même poste",
    ],
    correctIndex: 0,
    explanation: "Le télétravail flottant consiste en des jours de télétravail non prédéterminés, piochés librement dans un crédit mensuel accordé.",
  },
  {
    question: "Qu'est-ce que l'entretien professionnel annuel ?",
    options: [
      "Un entretien médical obligatoire avec la médecine du travail évaluant la santé et fixant les objectifs",
      "Un entretien entre l'agent et son supérieur hiérarchique direct évaluant le travail et fixant les objectifs",
      "Un entretien de recrutement interne évaluant le travail et fixant les objectifs",
      "Un entretien syndical annuel obligatoire avec le DRH évaluant le travail et fixant les objectifs",
    ],
    correctIndex: 1,
    explanation: "L'entretien professionnel annuel est conduit par le N+1 ; il évalue la manière de servir, fait le bilan de l'année et fixe les objectifs de l'année suivante.",
  },
  {
    question: "Qu'est-ce que le congé de longue maladie (CLM) ?",
    options: [
      "Un congé de 6 mois maximum (3 mois plein traitement + 3 mois demi-traitement)",
      "Un congé de 3 ans pour une affection grave (1 an plein traitement + 2 ans demi-traitement)",
      "Un congé équivalent au CMO mais sans limite de durée",
      "Un congé accordé uniquement pour accident du travail (1 an plein traitement + 2 ans demi-traitement)",
    ],
    correctIndex: 1,
    explanation: "Le CLM est accordé pour des affections graves : 1 an à plein traitement puis 2 ans à demi-traitement, soit 3 ans au total.",
  },
  {
    question: "Qu'est-ce que le régime de travail en cycle ?",
    options: [
      "Un travail uniquement de nuit en rotation hebdomadaire sur une période de référence",
      "Une organisation du temps de travail sur une période de référence supérieure à la semaine",
      "Un travail alterné entre télétravail et présentiel sur une période de référence supérieure à la semaine",
      "Un système de rotation des postes entre collègues à l'intérieur du même cadre d'emplois",
    ],
    correctIndex: 1,
    explanation: "Le cycle de travail est une organisation sur une période > à la semaine, permettant de moduler les horaires tout en respectant les 1607h annuelles.",
  },
  {
    question: "Qu'est-ce que le CNAS ?",
    options: [
      "Caisse Nationale d'Action Sociale — organisme proposant des prestations sociales et culturelles aux agents territoriaux",
      "Comité National d'Administration Syndicale — organisme proposant des prestations sociales et culturelles aux agents territoriaux",
      "Centre National d'Appui et de Soutien aux agents — organisme proposant des prestations sociales et culturelles aux agents territoriaux",
      "Commission Nationale d'Avancement et de Salaire — organisme proposant des prestations sociales et culturelles aux agents territoriaux",
    ],
    correctIndex: 0,
    explanation: "Le CNAS propose des prestations sociales, culturelles et de loisirs aux agents de la fonction publique territoriale.",
  },
  {
    question: "Quel est le délai de réponse de l'administration à une demande de télétravail ?",
    options: [
      "15 jours",
      "1 mois",
      "2 mois",
      "3 mois",
    ],
    correctIndex: 2,
    explanation: "L'administration dispose de 2 mois pour répondre à une demande de télétravail. Passé ce délai, le silence vaut acceptation.",
  },
  {
    question: "Combien de jours maximum peuvent être épargnés dans le CET par an ?",
    options: [
      "10 jours par an",
      "15 jours par an",
      "20 jours par an",
      "30 jours par an",
    ],
    correctIndex: 0,
    explanation: "Un agent peut épargner jusqu'à 10 jours par an dans son CET, dans la limite d'un plafond total de 60 jours.",
  },
  {
    question: "Qu'est-ce que le congé parental ?",
    options: [
      "Un congé de maternité prolongé rémunéré jusqu'à ses 3 ans",
      "Un congé non rémunéré permettant d'élever son enfant jusqu'à ses 3 ans",
      "Un congé payé pour s'occuper d'un enfant malade pendant 3 mois",
      "Un congé accordé uniquement au père après la naissance du 2ème enfants",
    ],
    correctIndex: 1,
    explanation: "Le congé parental est non rémunéré ; il permet à l'agent de cesser temporairement de travailler pour élever son enfant jusqu'au 3e anniversaire de celui-ci.",
  },
  {
    question: "Combien d'heures de CPF (Compte Personnel de Formation) sont créditées par an pour un temps plein ?",
    options: [
      "10 heures par an",
      "20 heures par an",
      "24 heures par an",
      "50 heures par an",
    ],
    correctIndex: 1,
    explanation: "Le CPF est crédité de 20 heures par an pour un agent à temps plein, plafonné à 150 heures.",
  },
  {
    question: "Qu'est-ce que le PPCR (Parcours Professionnels, Carrières et Rémunérations) ?",
    options: [
      "Un programme de prévention contre les risques professionnels dans la fonction publique depuis 2015",
      "Une réforme restructurant les grilles indiciaires et les carrières dans la fonction publique depuis 2016",
      "Un plan de formation professionnelle continue dans la fonction publique depuis 2008",
      "Un protocole de protection et de conseil des représentants syndicaux",
    ],
    correctIndex: 1,
    explanation: "Le PPCR est une réforme mise en place depuis 2016 qui a revu les grilles indiciaires, la structure des carrières et les modalités d'avancement.",
  },
  {
    question: "Qu'est-ce qu'une grève et quelles en sont les modalités dans la FPT ?",
    options: [
      "Une absence injustifiée passible de sanction disciplinaire sauf pour les syndiqués",
      "Une cessation collective du travail nécessitant un préavis de 5 jours francs déposé par un syndicat représentatif",
      "Un arrêt de travail individuel autorisé sans préavis seulement pendant 3 heures",
      "Une manifestation extérieure sans impact sur la rémunération pour une cause nationale",
    ],
    correctIndex: 1,
    explanation: "La grève dans la FPT nécessite un préavis de 5 jours francs déposé par un syndicat représentatif. Chaque journée de grève entraîne une retenue de 1/30e du traitement mensuel.",
  },
  {
    question: "La suspension d'un agent constitue-t-elle une sanction disciplinaire ?",
    options: [
      "Oui, toujours",
      "Oui, mais seulement pour les fonctionnaires titulaires",
      "Non, c'est une mesure conservatoire prise dans l'intérêt du service",
      "Non, sauf si elle dure plus de 4 mois",
    ],
    correctIndex: 2,
    explanation: "La suspension n'est pas une sanction disciplinaire : c'est une mesure conservatoire destinée à écarter temporairement l'agent du service en cas de faute grave vraisemblable.",
  },
  {
    question: "Avant une suspension conservatoire, le conseil de discipline doit-il être consulté ?",
    options: [
      "Oui, obligatoirement",
      "Oui, sauf pour les agents contractuels",
      "Non, la suspension n'est pas soumise à la procédure disciplinaire",
      "Non, mais uniquement avec l'accord de l'agent",
    ],
    correctIndex: 2,
    explanation: "La suspension n'étant pas une sanction disciplinaire, elle n'impose pas la consultation préalable du conseil de discipline ni la communication obligatoire du dossier avant décision.",
  },
  {
    question: "Quel est le délai maximal pour régler définitivement la situation d'un agent suspendu lorsqu'une action disciplinaire est engagée ?",
    options: [
      "1 mois",
      "2 mois",
      "4 mois",
      "6 mois",
    ],
    correctIndex: 2,
    explanation: "Lorsque l'autorité prononce une suspension et engage l'action disciplinaire, la situation de l'agent doit être définitivement réglée dans un délai de 4 mois, faute de quoi il est rétabli dans ses fonctions.",
  },
  {
    question: "Après combien de temps un blâme peut-il être effacé automatiquement du dossier de l'agent s'il n'y a pas eu d'autre sanction ?",
    options: [
      "1 an",
      "2 ans",
      "3 ans",
      "5 ans",
    ],
    correctIndex: 2,
    explanation: "Le blâme peut être effacé automatiquement du dossier après 3 ans si aucune autre sanction n'a été prononcée pendant cette période.",
  },
  {
    question: "Dans quel cas un agent peut-il refuser un ordre hiérarchique sans s'exposer à une sanction disciplinaire ?",
    options: [
      "Quand l'ordre lui semble inutile et contredit l'ordre d'un elu",
      "Quand l'ordre est manifestement illégal et compromet gravement un intérêt public",
      "Quand l'ordre est donné oralement et compromet gravement un intérêt public",
      "Quand l'ordre modifie ses horaires de travail sans le préavis obligatoire de 15 jours",
    ],
    correctIndex: 1,
    explanation: "Un agent ne peut refuser d'obéir que si l'ordre est manifestement illégal et de nature à compromettre gravement un intérêt public. Les deux conditions sont cumulatives.",
  },
  {
    question: "Des publications Facebook publiques d'un agent peuvent-elles être utilisées dans une procédure disciplinaire ?",
    options: [
      "Non, jamais",
      "Oui, si elles sont publiquement accessibles et obtenues loyalement",
      "Oui, mais seulement avec l'accord écrit de l'agent",
      "Non, sauf en cas de faute pénale",
    ],
    correctIndex: 1,
    explanation: "Des publications publiquement accessibles peuvent être retenues comme preuve disciplinaire si elles n'ont pas été obtenues par un procédé déloyal ou intrusif.",
  },
  {
    question: "Une simple insuffisance professionnelle peut-elle justifier à elle seule une suspension conservatoire ?",
    options: [
      "Oui, si elle perturbe le service",
      "Oui, après un entretien professionnel",
      "Non, la suspension suppose des faits relevant d'une faute disciplinaire grave",
      "Non, sauf pour les agents stagiaires",
    ],
    correctIndex: 2,
    explanation: "Une suspension ne peut pas être fondée sur la seule insuffisance professionnelle. Elle suppose des faits présentant le caractère d'une faute disciplinaire grave et vraisemblable.",
  },
  {
    question: "Quel délai l'agent doit-il respecter pour transmettre son certificat médical en cas de congé de maladie ordinaire ?",
    options: [
      "24 heures",
      "48 heures",
      "72 heures",
      "8 jours",
    ],
    correctIndex: 1,
    explanation: "Pour être placé en congé de maladie ordinaire, l'agent doit transmettre son certificat médical à l'autorité territoriale dans un délai de 48 heures.",
  },
  {
    question: "En principe, quel délai de carence s'applique au congé de maladie ordinaire ?",
    options: [
      "Aucun délai de carence",
      "Un demi-jour",
      "1 jour",
      "3 jours",
    ],
    correctIndex: 2,
    explanation: "En principe, un délai de carence d'un jour s'applique au congé de maladie ordinaire, avec plusieurs exceptions prévues par les textes.",
  },
  {
    question: "Après les 3 premiers mois d'un congé de maladie ordinaire, quel niveau de traitement l'agent perçoit-il en principe ?",
    options: [
      "100 % du traitement",
      "90 % du traitement",
      "75 % du traitement",
      "50 % du traitement",
    ],
    correctIndex: 3,
    explanation: "Après les 3 premiers mois de CMO, l'agent passe en principe à demi-traitement pendant les 9 mois suivants, tout en conservant intégralement le supplément familial et l'indemnité de résidence.",
  },
  {
    question: "À partir de combien de mois consécutifs de congé de maladie ordinaire une visite de contrôle doit-elle avoir lieu au moins une fois ?",
    options: [
      "3 mois",
      "6 mois",
      "9 mois",
      "12 mois",
    ],
    correctIndex: 1,
    explanation: "Au-delà de 6 mois consécutifs de congé de maladie ordinaire, une visite de contrôle doit avoir lieu au moins une fois.",
  },
  {
    question: "Quelles affections ouvrent droit au congé de longue durée (CLD) ?",
    options: [
      "Toute maladie reconnue en ALD et qui sont inscrites aux tableaux de la sécu",
      "Tuberculose, maladie mentale, affection cancéreuse, poliomyélite et déficit immunitaire grave et acquis",
      "Uniquement les cancers et les maladies professionnelles qui se sont declarées pendant les heures ou sur le lieu de travail",
      "Toute pathologie ayant entraîné un arrêt supérieur à 6 mois",
    ],
    correctIndex: 1,
    explanation: "Le CLD n'est ouvert qu'à cinq catégories d'affections : tuberculose, maladie mentale, affection cancéreuse, poliomyélite et déficit immunitaire grave et acquis.",
  },
  {
    question: "Les droits à congé de longue durée se reconstituent-ils après une reprise de fonctions pour la même affection ?",
    options: [
      "Oui, immédiatement",
      "Oui, après 1 an de reprise",
      "Non, les droits à CLD ne se reconstituent pas pour la même catégorie d'affection",
      "Non, sauf en cas de changement de collectivité",
    ],
    correctIndex: 2,
    explanation: "Les droits à CLD ne se reconstituent pas, même après une reprise de fonctions. Une fois épuisés pour une même catégorie d'affection, ils ne se rouvrent pas.",
  },
  {
    question: "Comment se compose le conseil médical en formation restreinte ?",
    options: [
      "3 médecins, 2 représentants de la collectivité et 2 représentants du personnel",
      "3 médecins titulaires uniquement, avec éventuellement des suppléants",
      "1 médecin, 1 élu et 1 représentant syndical",
      "2 médecins et 1 représentant du centre de gestion",
    ],
    correctIndex: 1,
    explanation: "En formation restreinte, le conseil médical est composé uniquement de trois médecins titulaires, avec un ou plusieurs suppléants.",
  },
  {
    question: "Quand un accident est-il présumé imputable au service ?",
    options: [
      "Dès qu'il survient pendant une pause déjeuner, quel que soit le lieu meme si le lieu est hors de la collectivité",
      "Lorsqu'il survient dans le temps et le lieu du service, dans l'exercice ou à l'occasion des fonctions, sans faute personnelle ni circonstance détachant l'accident du service",
      "Uniquement s'il entraîne une hospitalisation",
      "Seulement s'il est reconnu par un supérieur hiérarchique sans témoin des faits et sans faute personnelle ni circonstance détachant l'accident du service",
    ],
    correctIndex: 1,
    explanation: "L'accident est présumé imputable au service lorsqu'il survient dans le temps et le lieu du service, dans l'exercice ou à l'occasion des fonctions, sauf faute personnelle ou circonstance particulière détachant l'accident du service.",
  },
  {
    question: "Une cure thermale préventive peut-elle ouvrir droit à un congé de maladie ordinaire ?",
    options: [
      "Non, jamais",
      "Oui, uniquement si l'agent a plus de 10 ans d'ancienneté",
      "Oui, si l'absence de traitement en temps utile mettrait l'agent dans l'impossibilité d'exercer ses fonctions",
      "Oui, mais seulement pendant les congés annuels",
    ],
    correctIndex: 2,
    explanation: "Une cure thermale préventive peut justifier un congé de maladie ordinaire si la pathologie constatée mettrait l'agent dans l'impossibilité d'exercer ses fonctions sans ce traitement effectué en temps utile.",
  },
];

// ─── Tirage aléatoire de N questions uniques ──────────────────────────────────
function getRandomQuestions(pool: Question[], count = QUIZ_LENGTH): Question[] {
  const uniqueQuestions: Question[] = [];
  const seenQuestions = new Set<string>();

  for (const item of pool) {
    const key = item.question.trim().toLowerCase();
    if (seenQuestions.has(key)) continue;
    seenQuestions.add(key);
    uniqueQuestions.push(item);
  }

  const shuffled = [...uniqueQuestions];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, Math.min(count, shuffled.length));
}

const BASE_URL = import.meta.env.BASE_URL;

interface FAQQuizProps {
  onClose?: () => void;
}

// ─── Composant FAQQuiz ────────────────────────────────────────────────────────
const FAQQuiz: React.FC<FAQQuizProps> = ({ onClose }) => {
  const quizTopRef = useRef<HTMLDivElement | null>(null);
  const [questions, setQuestions] = useState<Question[]>(() =>
    getRandomQuestions(ALL_QUESTIONS, QUIZ_LENGTH)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUIZ_LENGTH).fill(null));

  const current = questions[currentIndex];

  const handleSelect = useCallback(
    (index: number) => {
      if (answered) return;
      setSelectedOption(index);
      setAnswered(true);
      const newAnswers = [...answers];
      newAnswers[currentIndex] = index;
      setAnswers(newAnswers);
      if (index === current.correctIndex) {
        setScore((s) => s + 1);
      }
    },
    [answered, answers, currentIndex, current]
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      setShowResult(true);
    }
  }, [currentIndex, questions.length]);

  const handleRestart = useCallback(() => {
    setQuestions(getRandomQuestions(ALL_QUESTIONS, QUIZ_LENGTH));
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setShowResult(false);
    setAnswered(false);
    setAnswers(Array(QUIZ_LENGTH).fill(null));

    window.setTimeout(() => {
      quizTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }, []);

  const hasWon = score >= 7;

  const renderContent = () => {
    if (showResult) {
      const percentage = Math.round((score / questions.length) * 100);
      const strokeDashoffset = 251.2 - (251.2 * percentage) / 100;

      return (
        <div
          ref={quizTopRef}
          className={`bg-gradient-to-br from-slate-800/80 via-purple-900/40 to-slate-800/80 backdrop-blur border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all duration-300 card-border-sweep card-border-sweep-orange ${!hasWon ? "animate-shake-card" : ""
            }`}
        >
          <SpecialEffectsCanvas type={hasWon ? "win" : "lose"} />

          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="relative inline-block mb-4">
                <svg className="w-32 h-32 transform -rotate-90 mx-auto" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-slate-800"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="url(#scoreGrad)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-slate-100">{score} / {questions.length}</span>
                  <span className="text-xs font-medium text-slate-400">{percentage}%</span>
                </div>
              </div>

              <div className="flex justify-center mb-3">
                {hasWon ? (
                  <Trophy className="w-12 h-12 text-yellow-500 animate-bounce" />
                ) : (
                  <BookOpen className="w-12 h-12 text-orange-400" />
                )}
              </div>

              <h2 className="text-2xl font-bold text-slate-100 mb-2">
                {hasWon ? "Félicitations !" : "Entraînez-vous encore !"}
              </h2>
              <p className="text-slate-400 max-w-sm mx-auto text-sm font-light">
                {hasWon
                  ? "Excellent travail ! Vous maîtrisez parfaitement les sujets de la fonction publique."
                  : "Ne vous découragez pas. Relisez nos fiches pratiques pour parfaire vos connaissances !"
                }
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Récapitulatif de vos réponses</h3>
              {questions.map((q, i) => {
                const userAnswer = answers[i];
                const isCorrect = userAnswer === q.correctIndex;
                return (
                  <div
                    key={i}
                    className={`p-4 rounded-2xl border transition-all duration-200 text-sm font-light ${isCorrect
                        ? "border-green-500/20 bg-green-950/20"
                        : "border-red-500/20 bg-red-950/20"
                      }`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <div className="font-medium text-slate-100 leading-snug">{q.question}</div>
                    </div>

                    <div className="pl-8 space-y-1 text-xs">
                      {!isCorrect && (
                        <p className="text-red-300">
                          <span className="font-medium text-red-400">Votre réponse :</span> {userAnswer !== null ? q.options[userAnswer] : "Sans réponse"}
                        </p>
                      )}
                      <p className="text-green-300">
                        <span className="font-medium text-green-400">Bonne réponse :</span> {q.options[q.correctIndex]}
                      </p>
                      {q.explanation && (
                        <p className="text-slate-400 mt-2 italic leading-relaxed">
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleRestart}
              className="w-full  bg-gradient-to-r from-orange-500 via-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:opacity-95 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50 hover:scale-[1.01] active:scale-[0.99] btn-shine"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Nouveau quiz (10 questions aléatoires)</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={quizTopRef}
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-700/50 relative overflow-hidden transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3  rounded-full shadow-sm">
            Question {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 px-3  rounded-full shadow-sm">
            Score : {score}
          </span>
        </div>

        {/* Visual Timeline of previous/upcoming questions */}
        <div className="flex gap-1.5 justify-center mb-6">
          {questions.map((_, idx) => {
            const isPast = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const answer = answers[idx];
            const isCorrect = answer === questions[idx].correctIndex;

            let bg = "bg-slate-700/60";
            if (isCurrent) bg = "bg-blue-500 ring-4 ring-blue-500/30 scale-110";
            else if (isPast) bg = isCorrect ? "bg-emerald-500" : "bg-red-500";

            return (
              <div
                key={idx}
                className={`h-2.5 rounded-full transition-all duration-300 ${bg}`}
                style={{ width: isCurrent ? "1.5rem" : "0.625rem" }}
              />
            );
          })}
        </div>

        <h3 className="text-lg sm:text-xl font-medium text-slate-800 dark:text-slate-100 mb-6 flex items-start gap-3 relative z-10">
          <HelpCircle className="w-6 h-6 text-orange-400 shrink-0 mt-0.5" />
          <span className="leading-snug font-light">{current.question}</span>
        </h3>

        <div className="space-y-3 mb-6">
          {current.options.map((option, i) => {
            const isCorrect = i === current.correctIndex;
            const isSelected = i === selectedOption;

            let btnClass = "w-full text-left px-5  rounded-2xl border-2 font-light transition-all duration-200 flex items-center group relative overflow-hidden ";
            let badgeClass = "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4 shrink-0 transition-all duration-200 ";

            if (!answered) {
              btnClass += "border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer";
              badgeClass += "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-blue-500 group-hover:text-white";
            } else {
              if (isCorrect) {
                btnClass += "border bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm animate-pulse-green";
                badgeClass += "bg-emerald-500 text-white";
              } else if (isSelected) {
                btnClass += "border bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300 shadow-sm animate-shake";
                badgeClass += "bg-red-500 text-white";
              } else {
                btnClass += "border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-400 opacity-60 cursor-default";
                badgeClass += "bg-slate-200 dark:bg-slate-800 text-slate-400";
              }
            }

            return (
              <button
                key={i}
                className={btnClass}
                onClick={() => handleSelect(i)}
                disabled={answered}
              >
                <span className={badgeClass}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1 leading-snug">{option}</span>
              </button>
            );
          })}
        </div>

        {answered && (
          <div
            className={`p-5 rounded-2xl mb-6 text-sm border transition-all duration-300 animate-slide-in font-light ${selectedOption === current.correctIndex
                ? "bg-green-950/30 border-green-500/30 text-green-200"
                : "bg-orange-950/30 border-orange-500/30 text-orange-200"
              }`}
          >
            <div className="flex items-center gap-2 font-medium mb-2 text-base">
              {selectedOption === current.correctIndex ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                  <span>Excellent !</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-orange-400 shrink-0" />
                  <span>Bon à savoir</span>
                </>
              )}
            </div>
            <p className="leading-relaxed pl-7">{current.explanation}</p>
          </div>
        )}

        {answered && (
          <button
            onClick={handleNext}
            className="w-full  bg-gradient-to-r from-orange-500 via-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:opacity-95 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50 hover:scale-[1.01] active:scale-[0.99] btn-shine"
          >
            <span>
              {currentIndex + 1 < questions.length
                ? "Question suivante"
                : "Voir les résultats"}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="relative z-30 isolate min-h-screen flex flex-col pt-6 sm:pt-10 overflow-x-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-500  sm: px-4 sm:px-6 lg:px-8 font-sans text-slate-800 dark:text-slate-100">
      {/* Soft background glow */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 800, height: 800, borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(148,163,184,0.1) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <div className="max-w-2xl mx-auto relative z-10">

        {/* Retour button */}
        {onClose && (
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50">
          <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 px-4  bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-all text-sm shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
          </div>
        )}

        {/* Title */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl sm:text-5xl font-light tracking-tight mb-2 text-slate-800 dark:text-slate-100">
            Quiz FAQ
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-light max-w-lg mx-auto">
            Mettez au défi vos connaissances de la fonction publique avec notre quiz de 10 questions.
          </p>
        </div>

        {renderContent()}

      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        @keyframes shake-card {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes pulse-green {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          50% { transform: scale(1.01); box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        .animate-shake-card {
          animation: shake-card 0.5s ease-in-out;
        }
        .animate-pulse-green {
          animation: pulse-green 1s infinite ease-in-out;
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default FAQQuiz;
