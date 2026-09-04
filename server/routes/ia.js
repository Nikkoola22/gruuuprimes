import express from 'express';
import { sanitizeCompletionRequest, summarizeCompletionRequest } from '../../api/_security.js';
import { generateLocalStatutoryResponse } from '../services/statutory.js';

const router = express.Router();

router.post('/completions', async (req, res) => {
  const completionBody = sanitizeCompletionRequest(req.body);

  if (!completionBody) {
    return res.status(400).json({ error: 'Invalid completion payload' });
  }

  console.log('📝 Requête IA reçue:', summarizeCompletionRequest(completionBody));
  
  // Générer une réponse synthétique locale basée sur la documentation et Légifrance si la clé Perplexity est absente
  if (!process.env.PERPLEXITY_API_KEY) {
    console.log('ℹ️ PERPLEXITY_API_KEY absente - Génération d\'une réponse synthétique basée sur le fonds statutaire et Légifrance PISTE');

    const messages = completionBody.messages || [];
    const userMsgObj = messages.find(m => m.role === 'user') || {};
    const systemMsgObj = messages.find(m => m.role === 'system') || {};
    const userPrompt = userMsgObj.content || '';
    const docContext = systemMsgObj.content || '';

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
    
    // Modifier la requête pour limiter les recherches externes
    const modifiedBody = {
      model: completionBody.model || "sonar",
      messages: completionBody.messages,
      return_images: false,
      return_related_questions: false,
      max_tokens: 1500,
      temperature: 0.0
    };
    
    // --- TIMEOUT: 30 secondes ---
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(modifiedBody),
      signal: controller.signal // Ajoute le timeout
    });

    clearTimeout(timeoutId);
    console.log('📡 Statut réponse Perplexity:', response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error('❌ Erreur Perplexity:', text);
      
      if (response.status === 401) {
        return res.status(401).json({ 
          error: "Erreur d'authentification", 
          details: "La clé API Perplexity est invalide ou expirée. Veuillez vérifier votre clé API dans les variables d'environnement.",
          hint: "Assurez-vous que la clé commence par 'pplx-' et qu'elle est correctement configurée."
        });
      }
      
      try {
        const errorJson = JSON.parse(text);
        return res.status(response.status).json({
          error: errorJson.error || `Erreur API Perplexity (${response.status})`,
          details: errorJson.message || response.statusText,
        });
      } catch {
        return res.status(response.status).json({ 
          error: `Erreur API Perplexity (${response.status})`, 
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
              content: "Le service IA externe a expiré. Je peux néanmoins vous aider à partir des contenus internes disponibles dans l'application."
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
            content: "Le service IA externe est temporairement indisponible. Réessayez plus tard ou configurez la clé Perplexity pour activer les réponses externes."
          },
          finish_reason: 'stop'
        }
      ]
    });
  }
});

export default router;
