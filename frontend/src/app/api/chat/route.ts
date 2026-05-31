import dns from "node:dns";
import { NextRequest, NextResponse } from "next/server";
import { ENDPOINTS } from "@/lib/endpoints";
import { GUIDES } from "@/lib/guides";

// Certains environnements ont une connectivité IPv6 cassée : Node tente
// l'IPv6 en premier et expire (ETIMEDOUT) avant de relayer à Groq. On force
// la résolution IPv4 d'abord (reste valide en IPv6 sain).
dns.setDefaultResultOrder("ipv4first");

// Route Handler exécuté côté serveur : la clé GROQ_API_KEY n'est JAMAIS
// exposée au navigateur. Le client appelle /api/chat, ce handler relaie à Groq.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";

// Résumé compact des endpoints (une ligne chacun) pour rester sous la limite
// de tokens du modèle Groq. Le détail complet reste consultable sur /Reference-API.
const ENDPOINTS_DOCS = ENDPOINTS.map((e) => {
  const flags = [e.requiresAuth ? "auth" : null, e.requiresTenant ? "tenant" : null]
    .filter(Boolean)
    .join("+");
  return `${e.method} ${e.path} — ${e.summary} [${e.category}${flags ? ` | ${flags}` : ""}]`;
}).join("\n");

// Liste compacte des guides (titre + description) ; les étapes détaillées
// vivent dans /guides.
const GUIDES_DOCS = GUIDES.map(
  (g) => `${g.title} (${g.category}, ${g.difficulty}) : ${g.description}`,
).join("\n");

const SYSTEM_PROMPT = `Tu es BizCore AI, l'assistant expert de la plateforme BizCore — Business Core as a Service (BCaaS).

CONTEXTE BIZCORE :
BizCore est une plateforme API générique multi-tenant qui modélise les interactions métier sous forme de protocoles réseau :
• Émetteur = Consumer Actor (demandeur de service)
• Récepteur = Provider Actor (fournisseur de service)
• Protocole = Business Rules (règles métier configurables)
• Message/Requête = ServiceRequest (demande de service)
• ACK = Invoice (facture automatique)

ARCHITECTURE :
- Backend : Spring Boot 3.5.12 (Java 21), PostgreSQL, Redis, JWT
- Frontend : Next.js 16 avec React 19, Tailwind CSS, Zustand
- Multi-tenant : isolation totale des données par X-Tenant-Id
- Workflow ServiceRequest : PENDING → ACCEPTED → IN_PROGRESS → FULFILLED → PAID
- Facture auto-générée à FULFILLED
- Devises supportées : XAF, XOF, NGN, KES, GHS, USD, EUR, GBP

TOUS LES ENDPOINTS API (${ENDPOINTS.length} endpoints) :
${ENDPOINTS_DOCS}

GUIDES D'INTÉGRATION :
${GUIDES_DOCS}

TYPES D'ENTITÉS :
• Tenant : espace métier isolé (id, name, domain, plan)
• Person : personne physique (id, firstName, lastName, email, phone)
• Actor : rôle dans un tenant (PROVIDER ou CONSUMER lié à une Person)
• Business : entreprise métier (id, name, type, description)
• ServiceCatalogue : services disponibles (id, name, price, currency, providerId)
• ServiceRequest : demande de service (id, status, serviceId, consumerId, notes)
• Invoice : facture (id, status, amount, currency, serviceRequestId)
• BusinessRule : règle configurable (name, value, type, description)

RÈGLES DE RÉPONSE :
1. Toujours répondre en français, clairement et professionnellement
2. Donner des exemples concrets (curl, JSON, JavaScript/TypeScript)
3. Expliquer le concept réseau (émetteur/récepteur/protocole) quand pertinent
4. Préciser les headers requis (Authorization, X-Tenant-Id)
5. Si hors périmètre BizCore, expliquer poliment ta spécialisation
6. Pour les erreurs 409 (conflit), expliquer les transitions d'état valides
7. Utiliser des emojis pertinents pour structurer la réponse (📡, 🔐, 📋, ✅, ❌)`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Certains environnements ont une connectivité IPv6 instable : la première
// tentative de connexion peut échouer (ETIMEDOUT) avant qu'une route valide
// soit retenue. On réessaie quelques fois sur erreur réseau transitoire.
async function fetchWithRetry(url: string, init: RequestInit, retries = 4): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetch(url, init);
    } catch (error) {
      lastError = error;
      const cause = (error as { cause?: { code?: string } })?.cause?.code;
      console.warn(`[/api/chat] tentative ${attempt}/${retries} échouée (${cause ?? "?"}), nouvel essai…`);
      if (attempt < retries) await new Promise((r) => setTimeout(r, 300 * attempt));
    }
  }
  throw lastError;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY n'est pas configurée côté serveur. Ajoutez-la dans frontend/.env.local." },
      { status: 500 },
    );
  }

  let messages: ChatMessage[];
  try {
    const body = await request.json();
    messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Le champ 'messages' est requis." }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Corps de requête JSON invalide." }, { status: 400 });
  }

  const payload = JSON.stringify({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
    ],
    max_tokens: 1000,
    temperature: 0.7,
    stream: false,
  });

  try {
    const res = await fetchWithRetry(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: payload,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const message = errorData?.error?.message || `Erreur Groq ${res.status}`;
      return NextResponse.json({ error: message }, { status: res.status });
    }

    const data = await res.json();
    const reply =
      data.choices?.[0]?.message?.content || "Désolé, je n'ai pas pu générer de réponse.";
    return NextResponse.json({ reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    const cause = (error as { cause?: { code?: string } })?.cause?.code;
    console.error("[/api/chat] échec fetch Groq:", message, "cause:", cause);
    return NextResponse.json(
      { error: "Connexion à Groq impossible. Réessayez dans un instant." },
      { status: 502 },
    );
  }
}
