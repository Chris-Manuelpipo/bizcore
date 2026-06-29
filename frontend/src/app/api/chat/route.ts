import dns from "node:dns";
import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
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
// de tokens du modèle Groq.
const ENDPOINTS_DOCS = ENDPOINTS.map((e) => {
  let authFlag: string | null = null;
  if (e.requiresAuth) {
    authFlag = "api-key";
  }
  const flags = [authFlag, e.requiresTenant ? "tenant" : null].filter(Boolean).join("+");
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
- Backend : Spring Boot 3.5.12 (Java 21), PostgreSQL, Redis — URL API : ${API_BASE}
- Frontend : Next.js 16 avec React 19, Tailwind CSS — documentation, guides et assistant AI
- Multi-tenant : isolation totale des données par tenant — jamais d'en-tête X-Tenant-Id
- Workflow ServiceRequest : PENDING → ACCEPTED → IN_PROGRESS → FULFILLED → PAID
- Facture auto-générée à FULFILLED
- Devises supportées : XAF, XOF, NGN, KES, GHS, USD, EUR, GBP

AUTHENTIFICATION (3 modes distincts — ne pas les confondre) :

1. JWT portail développeur (Authorization: Bearer)
   - Routes : /api/dev-auth/register, /api/dev-auth/login, /api/developer/**
   - Usage : gestion du compte développeur, tenants et clés API depuis le portail web
   - Ne sert PAS aux appels métier (/api/businesses, /api/actors, etc.)

2. Clé API (X-Api-Key: bcs_live_…) — CHEMIN PRINCIPAL d'intégration backend
   - Obtenue via POST /api/developer/api-keys (JWT portail requis)
   - Le secret brut n'est affiché qu'une seule fois — à copier immédiatement dans une variable d'environnement
   - Le tenant est résolu automatiquement depuis la clé (pas de JWT requis sur les routes métier)
   - Alternative : la clé peut aussi être passée en Authorization: Bearer bcs_live_…

3. JWT utilisateur métier (Authorization: Bearer)
   - Routes : /api/auth/register, /api/auth/login puis appels métier
   - Usage : applications où l'utilisateur final se connecte (mobile, web client)
   - Le tenant est dans le claim tenantId du token ; l'acteur agissant est déduit du token pour les transitions ServiceRequest (accept, start, fulfill)

FLUX PORTAIL DÉVELOPPEUR (à recommander en priorité pour l'intégration serveur) :
1. Inscription : POST /api/dev-auth/register
2. Connexion : POST /api/dev-auth/login → JWT portail
3. Génération : POST /api/developer/api-keys → crée un tenant + clé bcs_live_… en une opération
4. Copier la clé et le tenantId (retournés une seule fois par l'API)
5. Appeler l'API métier avec X-Api-Key depuis votre backend

TOUS LES ENDPOINTS API (${ENDPOINTS.length} endpoints) :
${ENDPOINTS_DOCS}
(Légende auth : dev-jwt = JWT portail développeur, api-key = clé API bcs_live_…)

GUIDES D'INTÉGRATION :
${GUIDES_DOCS}

TYPES D'ENTITÉS :
• Developer : compte portail (id, firstName, lastName, email) — gère tenants et clés API
• ApiKey : clé d'intégration (id, keyPrefix, tenantId, developer) — secret bcs_live_… one-time
• Tenant : espace métier isolé (id, name, domain)
• User : compte utilisateur métier (id, firstName, lastName, email, roles, tenant)
• Actor : rôle dans un tenant (PROVIDER ou CONSUMER, lié à un User)
• Business : entité métier (id, name, domain, description, tenant)
• ServiceCatalogue : service du catalogue, rattaché à un Business (id, name, description, basePrice, currency)
• ServiceRequest : demande de service (id, status, serviceName, consumer, provider, serviceCatalogue)
• Invoice : facture (id, status, amount, currency, serviceRequest)
• BusinessRule : règle configurable rattachée à un Business (ruleKey, ruleValue, description)

RÈGLES DE RÉPONSE :
1. Toujours répondre en français, clairement et professionnellement
2. Donner des exemples concrets (curl, JSON, JavaScript/TypeScript) en utilisant l'URL ${API_BASE} — jamais localhost
3. Expliquer le concept réseau (émetteur/récepteur/protocole) quand pertinent
4. Pour l'intégration backend : recommander X-Api-Key (clé bcs_live_…) ; pour le portail : JWT développeur ; pour les apps utilisateur final : JWT via /api/auth/login — jamais d'en-tête X-Tenant-Id
5. Distinguer clairement « intégration serveur » (clé API) et « auth utilisateur final » (JWT utilisateur)
6. Si hors périmètre BizCore, expliquer poliment ta spécialisation
7. Pour les transitions d'état invalides (HTTP 400), expliquer les transitions valides du workflow
8. Réponses claires et structurées (titres, listes, blocs de code) sans emojis`;

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
