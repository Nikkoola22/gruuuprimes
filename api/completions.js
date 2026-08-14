import dotenv from 'dotenv';
import { handleCors, sanitizeCompletionRequest, summarizeCompletionRequest } from './_security.js';

// Support local runs (e.g. vercel dev) by loading .env and .env.local.
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

export default async function handler(req, res) {
  if (!handleCors(req, res, ['POST', 'OPTIONS'])) {
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const completionBody = sanitizeCompletionRequest(req.body);

  if (!completionBody) {
    return res.status(400).json({ error: 'Invalid completion payload' });
  }

  console.log('📝 Requête IA reçue:', summarizeCompletionRequest(completionBody));
  
  // Générer une réponse synthétique locale basée sur la documentation si la clé API Perplexity est absente
  if (!process.env.PERPLEXITY_API_KEY) {
    console.log('ℹ️ PERPLEXITY_API_KEY absente - Génération d\'une réponse synthétique basée sur le fonds statutaire local');

    const messages = completionBody.messages || [];
    const userMsgObj = messages.find(m => m.role === 'user') || {};
    const systemMsgObj = messages.find(m => m.role === 'system') || {};
    const userPrompt = userMsgObj.content || '';
    const docContext = systemMsgObj.content || '';

    const generateLocalStatutoryResponse = (prompt, context) => {
      const promptNorm = prompt
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

      // 1. MARIAGE OU PACS
      if (promptNorm.includes('mariage') || promptNorm.includes('pacs') || promptNorm.includes('se marier') || promptNorm.includes('epouser')) {
        return `### 💍 Autorisation Spéciale d'Absence - Mariage & PACS (Mairie de Gennevilliers / CGFP)\n\nSelon le règlement du temps de travail de la Mairie de Gennevilliers (Chapitre 3 - Article 6) :\n\n• **Mariage ou PACS de l'agent** : **7 jours ouvrés**\n• **Mariage ou PACS d'un enfant de l'agent** : **3 jours ouvrés**\n• **Mariage ou PACS d'un proche** (ascendant, descendant, frère, sœur, beau-frère, belle-sœur, oncle, tante, neveu, nièce) : **1 jour ouvré**\n\nℹ️ *Conditions statutaires* :\n- Les jours accordés au titre d'un PACS ne peuvent pas être réattribués en cas de mariage pour la même personne.\n- Ces jours sont consécutifs, non fractionnables et doivent obligatoirement encadrer ou inclure la date de la célébration.\n- Justificatif : Présentation d'un acte de mariage ou de déclaration de PACS obligatoire.`;
      }

      // 2. DÉMÉNAGEMENT
      if (promptNorm.includes('demenag') || promptNorm.includes('déménag') || promptNorm.includes('changement d\'adresse')) {
        return `### 🚚 Autorisation Spéciale d'Absence - Déménagement (Mairie de Gennevilliers)\n\nSelon le règlement interne de la Mairie de Gennevilliers (Chapitre 3 - Article 10) :\n\n• **Durée** : **1 journée d'autorisation d'absence**\n• **Période** : À prendre au choix au cours de la semaine précédant ou de la semaine suivant le déménagement.\n• **Justificatif** : Présentation obligatoire d'un justificatif de changement d'adresse (contrat de bail, acte d'achat, facture d'énergie).`;
      }

      // 3. DÉCÈS / OBSÈQUES
      if (promptNorm.includes('deces') || promptNorm.includes('obseque') || promptNorm.includes('deuil') || promptNorm.includes('enterrement')) {
        return `### 🕊️ Autorisation Spéciale d'Absence - Décès d'un proche (Mairie de Gennevilliers)\n\nSelon le règlement interne de la Mairie de Gennevilliers (Chapitre 3 - Article 5) :\n\n• **Conjoint, partenaire de PACS ou concubin** : **5 jours ouvrés**\n• **Père ou mère de l'agent / du conjoint** : **5 jours ouvrés**\n• **Enfant de moins de 25 ans** : **14 jours ouvrables** (+ 8 jours complémentaires)\n• **Enfant de plus de 25 ans** : **12 jours ouvrables**\n• **Grands-parents, frères, sœurs** : **3 jours ouvrés**\n• **Oncle, tante, neveu, nièce** : **1 jour ouvré**`;
      }

      // 4. RENTRÉE SCOLAIRE
      if (promptNorm.includes('rentree') || promptNorm.includes('ecole') || promptNorm.includes('scolaire')) {
        return `### 🎒 Facilités Horaires - Rentrée Scolaire (Mairie de Gennevilliers)\n\nSelon le règlement de la Mairie de Gennevilliers (Chapitre 3 - Article 9) :\n\n• **Durée** : Facilités horaires dans la limite d'**1 heure** dans la journée pour accompagner ou aller chercher son enfant.\n• **Public concerné** : Enfants scolarisés en maternelle, primaire et entrée en classe de 6ème.\n• **Sous réserve des nécessités de service**.`;
      }

      // 5. GARDE D'ENFANT MALADE
      if (promptNorm.includes('enfant malade') || promptNorm.includes('soigner enfant') || promptNorm.includes('garde d\'enfant')) {
        return `### 🩺 Autorisation Spéciale d'Absence - Garde d'Enfant Malade (Mairie de Gennevilliers)\n\nSelon le règlement de la Mairie de Gennevilliers (Chapitre 3 - Article 2) :\n\n• **Conditions** : Accordée pour soigner un enfant malade ou en assurer momentanément la garde lors d'un événement imprévu.\n• **Justificatif** : Certificat médical obligatoire attestant de la présence nécessaire du parent.`;
      }

      // 6. DON DU SANG
      if (promptNorm.includes('don du sang') || promptNorm.includes('plaquette')) {
        return `### 🩸 Autorisation d'Absence - Don du Sang & Plaquettes\n\nSelon le règlement de la Mairie de Gennevilliers (Chapitre 3) :\n\n• **Autorisation** : Les agents sont autorisés à s'absenter pour le don du sang ou de plaquettes.\n• **Conditions** : Demande préalable auprès du responsable hiérarchique et production d'un justificatif au retour.`;
      }

      // 7. TEMPS PARTIEL THÉRAPEUTIQUE (Réforme 2026)
      if (promptNorm.includes('temps partiel therapeutique') || promptNorm.includes('tpt') || promptNorm.includes('reprise therapeutique')) {
        return `### 🩺 Temps Partiel Thérapeutique (TPT) - Nouvelles Règles 2026 (CIG / CGFP)\n\n• **Durée** : Accordé dans la limite d'**1 an**.\n• **Délai de réponse employeur** : L'employeur a **30 jours** pour répondre à la demande (sauf CLM, CLD, CITIS : décision au plus tard le jour de la reprise).\n• **Refus motivé** : Obligation de motiver le refus (entretien obligatoire si motif de service ; avis d'un médecin agréé si motif médical).\n• **Contrôle** : Possibilité pour l'employeur de diligenter un contrôle médical dès le dépôt de la demande.`;
      }

      // 8. CONGÉS MALADIE & CONTRÔLE A DOMICILE (Réforme 2026)
      if (promptNorm.includes('arret maladie') || promptNorm.includes('conge maladie') || promptNorm.includes('controle a domicile') || promptNorm.includes('prolongation')) {
        return `### 🏥 Congés Maladie & Contrôle d'Absence - Règles 2026 (Décrets du 30 juil. 1987 et 15 févr. 1988)\n\n• **Plafonnement** : Durée limitée à **31 jours** pour un premier arrêt et à **62 jours** pour une prolongation.\n• **Prescripteur obligatoire** : Maintien de salaire en prolongation uniquement si l'arrêt est délivré par le médecin traitant ou le prescripteur initial.\n• **Contrôle à domicile** : L'employeur peut diligenter un contrôle administratif pour vérifier la présence au domicile (heures obligatoires / sorties).\n• **Formation** : Possibilité pour l'agent en arrêt d'effectuer une formation ou un bilan de compétences sur avis médical.`;
      }

      // 9. RETRAITE & BONIFICATION ENFANTS (Réforme 2026)
      if (promptNorm.includes('retraite') || promptNorm.includes('bonification') || promptNorm.includes('pension') || promptNorm.includes('carriere longue')) {
        return `### 🌴 Retraite FPT - Bonification Enfants & Carrières Longues (Au 1er sept. 2026)\n\n• **Bonification enfants** : **1 trimestre supplémentaire** accordé aux femmes fonctionnaires pour chaque enfant né à compter du 1er janvier 2004 postérieurement à leur recrutement (Décret n°2003-1306).\n• **Carrières longues** : Prise en compte des bonifications et majorations pour enfants dans la période réputée cotisée (art. D. 16-2 CPCMR).`;
      }

      // 7. SMART TF-IDF EXTRACTION SUR DOCUMENTATION INTERNE
      const STOP_WORDS = new Set([
        'pour', 'mon', 'ma', 'mes', 'du', 'des', 'le', 'la', 'les', 'un', 'une',
        'et', 'ou', 'dans', 'en', 'par', 'sur', 'avec', 'sans', 'sous', 'combien',
        'droit', 'droits', 'jour', 'jours', 'avez', 'vous', 'dans', 'sont', 'est',
        'avoir', 'etre', 'faire', 'plus', 'moins', 'quel', 'quelle', 'quels', 'quelles'
      ]);

      const highSignalKeywords = promptNorm
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 3 && !STOP_WORDS.has(w));

      if (highSignalKeywords.length > 0 && context) {
        const blocks = context.split(/\n\n+/).filter(b => b.trim().length > 20);
        const scoredBlocks = blocks.map(block => {
          const lower = block.toLowerCase();
          let score = 0;
          highSignalKeywords.forEach(kw => {
            if (lower.includes(kw)) score += 10;
          });
          const uniqueHits = highSignalKeywords.filter(kw => lower.includes(kw)).length;
          if (uniqueHits > 1) score += uniqueHits * 15;
          return { block, score };
        });

        const bestMatches = scoredBlocks
          .filter(b => b.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map(b => b.block.replace(/^[-*•]\s*/, ''));

        if (bestMatches.length > 0) {
          return `### Synthèse Réglementaire & Statutaire (Mairie de Gennevilliers)\n\nVoici les éléments d'information issus des textes statutaires :\n\n` +
            bestMatches.map(m => `• ${m}`).join('\n\n');
        }
      }

      return `### Synthèse Statutaire CGFP & Mairie de Gennevilliers\n\nVotre demande a été analysée au regard des règles du Code Général de la Fonction Publique (CGFP).\n\nPour une analyse personnalisée de votre dossier individuel ou des détails sur l'application locale, vous pouvez contacter directement vos délégués syndicaux CFDT au **01 40 85 64 64**.`;
    };

    const generatedContent = generateLocalStatutoryResponse(userPrompt, docContext);

    return res.status(200).json({
      id: 'synth-local-' + Date.now(),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'local-statutory-engine',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: generatedContent
          },
          finish_reason: 'stop'
        }
      ]
    });
  }
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    const modifiedBody = {
      model: completionBody.model || "sonar",
      messages: completionBody.messages,
      return_images: false,
      return_related_questions: false,
      max_tokens: 2000,
      temperature: 0.0,
      search_recency_filter: "month",
      return_citations: true,
      search_domain_filter: ["ville-gennevilliers.fr", "cfdt.fr", "legifrance.gouv.fr"]
    };
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(modifiedBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log('📡 Statut réponse Perplexity:', response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error('❌ Erreur Perplexity:', text);

      try {
        const errorJson = JSON.parse(text);
        return res.status(response.status).json({
          error: errorJson.error || 'Perplexity API error',
          details: errorJson.message || response.statusText,
        });
      } catch {
        return res.status(response.status).json({
          error: 'Perplexity API error',
          details: response.statusText,
        });
      }
    }

    const data = await response.json();
    console.log('✅ Réponse Perplexity reçue');
    res.status(200).json(data);

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error("⏱️ Timeout: Requête Perplexity dépassée (30s)");
      return res.status(200).json({
        id: 'fallback-timeout',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: completionBody.model || 'fallback-local',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: "Le service IA externe a dépassé le délai. Réessayez dans un instant."
            },
            finish_reason: 'stop'
          }
        ]
      });
    }
    console.error("💥 Erreur serveur:", error);
    res.status(200).json({
      id: 'fallback-server-error',
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: completionBody.model || 'fallback-local',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: "Le service IA externe est temporairement indisponible."
          },
          finish_reason: 'stop'
        }
      ]
    });
  }
}
