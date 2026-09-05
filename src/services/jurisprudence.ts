/**
 * Client de recherche de jurisprudence judiciaire (fond JURI Légifrance — Cassation, CAA, TA, CE)
 * Canal PISTE côté serveur : /api/jurisprudence-search (Express dev : localhost:3001, Vercel : serverless)
 */

export interface JurisprudenceDecision {
  title: string;
  id?: string;
  juridiction: string;
  nature?: string;
  solution?: string;
  date?: string;
  summary?: string;
  excerpt?: string;
  link: string;
}

export interface JurisprudenceResult {
  success: boolean;
  results: JurisprudenceDecision[];
  totalCount?: number;
  message?: string;
}

export async function queryJurisprudence(query: string, pageSize = 5): Promise<JurisprudenceResult> {
  try {
    const isDev = import.meta.env.DEV;
    const endpoint = isDev ? "http://localhost:3001/api/jurisprudence-search" : "/api/jurisprudence-search";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, pageSize }),
    });

    if (!response.ok) {
      console.warn(`[JURISPRUDENCE] Réponse HTTP invalide: ${response.status}`);
      return { success: false, results: [], message: `Statut du service: ${response.status}` };
    }

    const data = await response.json();
    if (data && data.success && Array.isArray(data.results)) {
      return {
        success: true,
        results: data.results,
        totalCount: data.totalCount
      };
    }
    return { success: false, results: [], message: data?.error || "Recherche indisponible" };
  } catch (error) {
    console.warn("[JURISPRUDENCE] Erreur de connexion au service jurisprudence PISTE:", error);
    return { success: false, results: [], message: "Service jurisprudence injoignable" };
  }
}
