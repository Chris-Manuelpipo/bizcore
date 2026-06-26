import { API_BASE } from "./config";

export interface GuideStep {
  title: string;
  content: string;
  code?: { lang: string; filename?: string; body: string };
  tip?: string;
  warning?: string;
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  difficulty: "Débutant" | "Intermédiaire" | "Avancé";
  tags: string[];
  steps: GuideStep[];
}

export const GUIDE_CATEGORIES = ["Démarrage", "Authentification", "Multi-tenant", "Workflow", "Intégration"] as const;

const API_KEY_HEADER = '-H "X-Api-Key: <VOTRE_CLE_API>"';

// Les guides décrivent l'intégration applicative via clés API (portail développeur).
export const GUIDES: Guide[] = [
  {
    slug: "premier-appel-api",
    title: "Démarrer en tant que développeur",
    description: "Créez votre compte, générez une clé API (tenant inclus) et effectuez votre premier appel depuis votre application.",
    category: "Démarrage",
    duration: "10 min",
    difficulty: "Débutant",
    tags: ["Développeur", "Clé API", "Tenant"],
    steps: [
      {
        title: "Créer un compte développeur",
        content: "Inscrivez-vous sur le portail BizCore (/register). Ce compte sert à gérer tenants et clés API.",
      },
      {
        title: "Générer une clé API et créer le tenant",
        content: "Dashboard → Nouvelle clé API. Renseignez le nom de la clé et les informations du tenant (nom, domaine). Le tenant est créé automatiquement avec la clé.",
        warning: "Copiez la clé bcs_live_… immédiatement — elle ne sera plus affichée. Stockez-la dans une variable d'environnement, jamais dans le code source.",
      },
      {
        title: "Copier l'ID tenant",
        content: "Après génération de la clé, copiez l'ID tenant depuis le dashboard (tableau des clés ou liste des tenants). Vous en aurez besoin pour inscrire des utilisateurs métier.",
      },
      {
        title: "Appeler l'API depuis votre app",
        content: "Utilisez l'en-tête X-Api-Key. Le tenant est résolu automatiquement.",
        code: {
          lang: "typescript",
          filename: "app.ts",
          body: `const res = await fetch("${API_BASE}/api/businesses", {
  headers: { "X-Api-Key": process.env.BIZCORE_API_KEY! },
});
const data = await res.json();`,
        },
      },
    ],
  },
  // ── 1bis. Workflow tenant détaillé ───────────────────────────────────────
  {
    slug: "workflow-tenant-detail",
    title: "Workflow complet d'un tenant",
    description: "Avec une clé API : utilisateurs, acteurs PROVIDER/CONSUMER et première demande de service.",
    category: "Démarrage",
    duration: "15 min",
    difficulty: "Intermédiaire",
    tags: ["Tenant", "Actor", "Isolation"],
    steps: [
      {
        title: "Prérequis",
        content: "Compte développeur et clé API avec tenant (voir « Démarrer en tant que développeur »).",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl ${API_BASE}/actuator/health`
        },
        tip: "Si le port ou l'hôte diffère, définissez NEXT_PUBLIC_API_URL dans votre .env.local (frontend)."
      },
      {
        title: "Créer le tenant via la clé API",
        content: "Renseignez les informations du tenant (nom, domaine) lors de la génération de la clé API depuis le tableau de bord.",
      },
      {
        title: "Rattacher un utilisateur au tenant",
        content: "Depuis votre application, inscrivez un utilisateur métier avec le tenantId copié depuis le dashboard.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl -X POST ${API_BASE}/api/auth/register \\
  -H "X-Api-Key: <VOTRE_CLE_API>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "marie@pharmacie.cm",
    "password": "secret123",
    "firstName": "Marie",
    "lastName": "Curie",
    "tenantId": "<VOTRE_TENANT_ID>"
  }'`
        },
        tip: "Remplacez <VOTRE_TENANT_ID> par l'UUID affiché dans le dashboard (bouton copier à côté de chaque tenant).",
        warning: "Avec une clé API, le tenant de la clé doit correspondre au tenantId fourni."
      },
      {
        title: "Récupérer l'identifiant de l'utilisateur",
        content: "Pour créer un acteur, il faut l'id de l'utilisateur. On le récupère par son email.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl ${API_BASE}/api/users/email/marie@pharmacie.cm \\
  -H "X-Api-Key: <VOTRE_CLE_API>"

# Réponse : { "id": "<USER_ID>", "email": "marie@pharmacie.cm", ... }`
        }
      },
      {
        title: "Créer un acteur PROVIDER",
        content: "Un PROVIDER offre des services (ex : le pharmacien). On crée l'acteur en l'associant à un utilisateur existant via /api/actors/user/{userId}.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl -X POST ${API_BASE}/api/actors/user/<USER_ID> \\
  ${API_KEY_HEADER} \\
  -H "Content-Type: application/json" \\
  -d '{
    "role": "PROVIDER",
    "bio": "Pharmacien titulaire"
  }'`
        }
      },
      {
        title: "Créer un acteur CONSUMER",
        content: "Un CONSUMER consomme des services. Inscrivez un second utilisateur (avec le même tenantId), récupérez son id, puis créez l'acteur CONSUMER.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `# 1. Inscrire l'utilisateur consumer (avec tenantId)
curl -X POST ${API_BASE}/api/auth/register \\
  ${API_KEY_HEADER} \\
  -H "Content-Type: application/json" \\
  -d '{ "email": "paul@client.cm", "password": "secret123",
        "firstName": "Paul", "lastName": "Martin",
        "tenantId": "<VOTRE_TENANT_ID>" }'

# 2. Récupérer son id
curl ${API_BASE}/api/users/email/paul@client.cm \\
  ${API_KEY_HEADER}

# 3. Créer l'acteur CONSUMER
curl -X POST ${API_BASE}/api/actors/user/<USER_ID_PAUL> \\
  ${API_KEY_HEADER} \\
  -H "Content-Type: application/json" \\
  -d '{ "role": "CONSUMER", "bio": "Client régulier" }'`
        },
        tip: "Notez les id des acteurs PROVIDER et CONSUMER : ils servent à créer et faire transiter les ServiceRequests."
      },
      {
        title: "Vérifier l'isolation",
        content: "Listez les acteurs avec la clé API : vous ne voyez que ceux du tenant lié à la clé. L'isolation est appliquée automatiquement — pas d'en-tête X-Tenant-Id. Pour une app mobile/web avec login utilisateur, le JWT utilisateur offre le même isolement via le claim tenantId.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl "${API_BASE}/api/actors?page=0&size=10" \\
  ${API_KEY_HEADER}
# → { "content": [{ "id": "...", "role": "PROVIDER" }, ...] }`
        }
      },
    ],
  },

  // ── 2. Création/Authentification d'un utilisateur ────────────────────────
  {
    slug: "creation-authentification-utilisateur",
    title: "Auth utilisateur métier (JWT)",
    description: "Authentifiez un utilisateur final avec un token JWT — pour apps mobile/web avec login. Pour intégrer depuis votre backend, préférez le guide « Démarrer en tant que développeur » (clé API).",
    category: "Authentification",
    duration: "5 min",
    difficulty: "Débutant",
    tags: ["JWT", "Auth", "cURL"],
    steps: [
      {
        title: "Quand utiliser ce guide",
        content: "Ce flux convient aux applications où l'utilisateur final se connecte (mobile, SPA). Pour une intégration serveur-to-serveur, utilisez plutôt une clé API bcs_live_… obtenue depuis le Dashboard développeur.",
        warning: "Ne confondez pas le JWT portail développeur (gestion des clés API) et le JWT utilisateur métier décrit ici."
      },
      {
        title: "Créer un compte",
        content: "Créez un utilisateur via /api/auth/register (public). Si vous ne précisez pas de tenantId, le compte est rattaché au tenant par défaut de la plateforme.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl -X POST ${API_BASE}/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "admin@bizcore.io",
    "password": "secret123",
    "firstName": "Jean",
    "lastName": "Dupont"
  }'

# Réponse (201) — un token est renvoyé immédiatement
# {
#   "token": "eyJhbGciOiJIUzUxMiJ9...",
#   "email": "admin@bizcore.io",
#   "firstName": "Jean",
#   "lastName": "Dupont",
#   "roles": ["USER"]
# }`
        },
        tip: "register exige firstName, lastName, email et password. La connexion (login), elle, ne demande qu'email + password."
      },
      {
        title: "Obtenir un token JWT",
        content: "Authentifiez-vous pour obtenir un token. Il devra être inclus dans tous les appels protégés via le header Authorization. Le tenant de l'utilisateur est embarqué dans ce token.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl -X POST ${API_BASE}/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "admin@bizcore.io",
    "password": "secret123"
  }'

# Réponse (200)
# {
#   "token": "eyJhbGciOiJIUzUxMiJ9...",
#   "email": "admin@bizcore.io",
#   "firstName": "Jean",
#   "lastName": "Dupont",
#   "roles": ["USER"]
# }`
        },
        tip: "Copiez la valeur du champ token — vous en aurez besoin pour tous les appels authentifiés."
      },
      {
        title: "Votre premier appel authentifié",
        content: "Utilisez votre token pour appeler un endpoint protégé, par exemple la liste des businesses. Remplacez <VOTRE_TOKEN> par la valeur obtenue.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl ${API_BASE}/api/businesses \\
  -H "Authorization: Bearer <VOTRE_TOKEN>"

# Réponse : page Spring Data
# { "content": [], "totalElements": 0, ... }`
        },
        warning: "Sans token (ou token expiré/invalide), l'API répond 401 Unauthorized. Un token valide mais un rôle insuffisant renvoie 403 Forbidden."
      },
    ],
  },

  // ── 3. Workflow ServiceRequest complet ─────────────────────────────────
  {
    slug: "workflow-service-request",
    title: "Workflow ServiceRequest de bout en bout",
    description: "Suivez le cycle de vie complet d'une demande avec une clé API : catalogue, création, acceptation, exécution, accomplissement (facture auto) puis paiement.",
    category: "Workflow",
    duration: "15 min",
    difficulty: "Intermédiaire",
    tags: ["ServiceRequest", "Invoice", "Workflow", "États"],
    steps: [
      {
        title: "Prérequis",
        content: "Clé API bcs_live_… avec tenant (voir « Démarrer en tant que développeur »). Tous les exemples utilisent X-Api-Key. En scénario JWT utilisateur, remplacez par Authorization: Bearer <token> — les transitions provider impliquent alors le token du provider concerné.",
      },
      {
        title: "Créer un business puis un service au catalogue",
        content: "Un service de catalogue appartient à un business. Créez d'abord le business, puis le service (basePrice + currency).",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `# 1. Créer le business
curl -X POST ${API_BASE}/api/businesses \\
  ${API_KEY_HEADER} \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "Officine", "domain": "Santé",
        "description": "Pharmacie", "neededEducation": "Doctorat",
        "neededTraining": "Stage",
        "tenantId": "<VOTRE_TENANT_ID>" }'
# → { "id": "<BUSINESS_ID>", ... }

# 2. Ajouter un service à ce business
curl -X POST ${API_BASE}/api/service-catalogues/business/<BUSINESS_ID> \\
  ${API_KEY_HEADER} \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Consultation médicale",
    "description": "Consultation 30 minutes",
    "basePrice": 25000,
    "currency": "XAF"
  }'
# → notez le id du service (CATALOGUE_ID)`
        }
      },
      {
        title: "CONSUMER — Créer la demande (PENDING)",
        content: "La création passe les identifiants dans l'URL : consumer, provider et service de catalogue. Le corps ne contient que les détails de la demande. Elle naît à l'état PENDING.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl -X POST \\
  "${API_BASE}/api/service-requests/consumer/<CONSUMER_ID>/provider/<PROVIDER_ID>/catalogue/<CATALOGUE_ID>" \\
  ${API_KEY_HEADER} \\
  -H "Content-Type: application/json" \\
  -d '{
    "serviceName": "Consultation urgente",
    "description": "Douleur thoracique"
  }'

# Réponse : { "id": "<SR_ID>", "status": "PENDING", "serviceName": "Consultation urgente", ... }`
        },
        tip: "Les ID consumer/provider sont ceux des ACTEURS (pas des utilisateurs). Sauvegardez le SR_ID."
      },
      {
        title: "PROVIDER — Accepter la demande (ACCEPTED)",
        content: "Le provider accepte la demande. Avec une clé API, votre backend agit au nom du tenant. En scénario JWT utilisateur, l'acteur agissant est déduit du token (pas de paramètre actorId) — il faut être authentifié en tant que provider de la demande.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `# Voir les demandes PENDING
curl ${API_BASE}/api/service-requests/status/PENDING \\
  ${API_KEY_HEADER}

# Accepter
curl -X PATCH ${API_BASE}/api/service-requests/<SR_ID>/accept \\
  ${API_KEY_HEADER}

# Réponse : { "status": "ACCEPTED" }`
        }
      },
      {
        title: "PROVIDER — Démarrer l'exécution (IN_PROGRESS)",
        content: "Le provider démarre l'exécution. La demande passe à IN_PROGRESS.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl -X PATCH ${API_BASE}/api/service-requests/<SR_ID>/start \\
  ${API_KEY_HEADER}

# Réponse : { "status": "IN_PROGRESS" }`
        }
      },
      {
        title: "PROVIDER — Accomplir le service (FULFILLED + Invoice)",
        content: "Le provider marque le service accompli. BizCore génère automatiquement une Invoice PENDING.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl -X PATCH ${API_BASE}/api/service-requests/<SR_ID>/fulfill \\
  ${API_KEY_HEADER}

# Réponse
# {
#   "serviceRequest": { "status": "FULFILLED" },
#   "invoice": {
#     "id": "<INVOICE_ID>",
#     "status": "PENDING",
#     "amount": 25000,
#     "currency": "XAF"
#   }
# }`
        },
        tip: "La facture est créée automatiquement (ACK du service rendu) — inutile de la créer à la main."
      },
      {
        title: "CONSUMER — Payer la facture (PAID)",
        content: "Le consumer paie la facture, qui passe à PAID.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `# Voir les factures en attente
curl ${API_BASE}/api/invoices/status/PENDING \\
  ${API_KEY_HEADER}

# Payer la facture
curl -X PATCH ${API_BASE}/api/invoices/<INVOICE_ID>/pay \\
  ${API_KEY_HEADER}

# Réponse : { "status": "PAID", ... }`
        },
        warning: "Les transitions invalides (ex : payer une facture déjà payée, accepter une demande FULFILLED) renvoient 400. Gérez ces cas côté client."
      },
    ],
  },

  // ── 4. Intégration JavaScript ───────────────────────────────────────────
  {
    slug: "integration-javascript",
    title: "Intégrer BizCore en JavaScript",
    description: "Consommez BizCore depuis JavaScript/TypeScript : clé API pour l'intégration backend (recommandé), JWT utilisateur pour les apps avec login.",
    category: "Intégration",
    duration: "10 min",
    difficulty: "Intermédiaire",
    tags: ["JavaScript", "TypeScript", "fetch"],
    steps: [
      {
        title: "Client API avec clé API (recommandé)",
        content: "Client réutilisable pour l'intégration serveur. Le tenant est résolu automatiquement depuis la clé bcs_live_… — pas d'en-tête X-Tenant-Id.",
        code: {
          lang: "typescript",
          filename: "bizcore-api-key-client.ts",
          body: `const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "${API_BASE}";

class BizCoreApiKeyClient {
  constructor(private apiKey: string) {}

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(\`\${API_URL}\${path}\`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": this.apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(\`[\${res.status}] \${err.message ?? res.statusText}\`);
    }
    return res.status === 204 ? (undefined as T) : res.json();
  }

  get<T>(path: string) { return this.request<T>("GET", path); }
  post<T>(path: string, body?: unknown) { return this.request<T>("POST", path, body); }
  patch<T>(path: string, body?: unknown) { return this.request<T>("PATCH", path, body); }
  delete<T>(path: string) { return this.request<T>("DELETE", path); }
}

// Utilisation — clé obtenue depuis le Dashboard développeur
const client = new BizCoreApiKeyClient(process.env.BIZCORE_API_KEY!);
const businesses = await client.get("/api/businesses");`
        }
      },
      {
        title: "Workflow ServiceRequest avec clé API",
        content: "Création puis transitions depuis votre backend. Avec une clé API, un seul client suffit pour orchestrer le workflow au nom du tenant.",
        code: {
          lang: "typescript",
          filename: "service-requests.ts",
          body: `async function fullWorkflow(
  client: BizCoreApiKeyClient,
  consumerId: string,
  providerId: string,
  catalogueId: string
) {
  const sr = await client.post<{ id: string; status: string }>(
    \`/api/service-requests/consumer/\${consumerId}/provider/\${providerId}/catalogue/\${catalogueId}\`,
    { serviceName: "Consultation urgente", description: "Douleur thoracique" }
  );
  console.log(\`ServiceRequest \${sr.id} [\${sr.status}]\`);

  await client.patch(\`/api/service-requests/\${sr.id}/accept\`);
  await client.patch(\`/api/service-requests/\${sr.id}/start\`);
  const result = await client.patch<{ invoice: { id: string } }>(
    \`/api/service-requests/\${sr.id}/fulfill\`
  );

  await client.patch(\`/api/invoices/\${result.invoice.id}/pay\`);
  console.log("Workflow terminé — facture payée.");
}`
        },
        tip: "Une transition invalide renvoie 400 : prévoyez l'affichage de l'erreur ou un état désactivé côté UI."
      },
      {
        title: "Client JWT utilisateur (apps avec login)",
        content: "Pour une app mobile ou SPA où l'utilisateur final se connecte. Le tenant est encodé dans le token — pas d'en-tête X-Tenant-Id.",
        code: {
          lang: "typescript",
          filename: "bizcore-jwt-client.ts",
          body: `class BizCoreClient {
  constructor(private token: string) {}

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(\`\${API_URL}\${path}\`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": \`Bearer \${this.token}\`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(\`[\${res.status}] \${err.message ?? res.statusText}\`);
    }
    return res.status === 204 ? (undefined as T) : res.json();
  }

  get<T>(path: string) { return this.request<T>("GET", path); }
  post<T>(path: string, body?: unknown) { return this.request<T>("POST", path, body); }
  patch<T>(path: string, body?: unknown) { return this.request<T>("PATCH", path, body); }
  delete<T>(path: string) { return this.request<T>("DELETE", path); }
}

async function login(email: string, password: string): Promise<BizCoreClient> {
  const res = await fetch(\`\${API_URL}/api/auth/login\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Authentification échouée");
  const { token } = await res.json();
  return new BizCoreClient(token);
}`
        },
        tip: "En scénario JWT, les transitions provider/consumer nécessitent le token de l'utilisateur concerné (deux clients distincts)."
      },
    ],
  },

  // ── 5. Règles métier ────────────────────────────────────────────────────
  {
    slug: "regles-metier",
    title: "Configurer des règles métier",
    description: "Définissez des règles métier par business (clé/valeur) pour adapter le comportement sans modifier le code.",
    category: "Multi-tenant",
    duration: "8 min",
    difficulty: "Avancé",
    tags: ["BusinessRule", "Configuration"],
    steps: [
      {
        title: "Comprendre les règles métier",
        content: "Les BusinessRules sont des paires clé/valeur attachées à un business, consultées à l'exécution. Elles permettent d'ajuster le comportement sans redéploiement.",
        tip: "Chaque business porte ses propres règles — principe control plane vs data plane."
      },
      {
        title: "Créer une règle",
        content: "Une règle se crée sur un business donné via /api/business-rules/business/{businessId}. Elle est constituée d'une ruleKey, d'une ruleValue et d'une description.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl -X POST ${API_BASE}/api/business-rules/business/<BUSINESS_ID> \\
  ${API_KEY_HEADER} \\
  -H "Content-Type: application/json" \\
  -d '{
    "ruleKey": "MAX_CONCURRENT_REQUESTS",
    "ruleValue": "3",
    "description": "Nombre max de demandes actives par consumer"
  }'`
        }
      },
      {
        title: "Lister les règles d'un business",
        content: "Consultez toutes les règles d'un business, ou récupérez-en une par son id.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `# Toutes les règles d'un business
curl ${API_BASE}/api/business-rules/business/<BUSINESS_ID> \\
  ${API_KEY_HEADER}

# Réponse
# [
#   { "ruleKey": "MAX_CONCURRENT_REQUESTS", "ruleValue": "3",
#     "description": "Nombre max de demandes actives par consumer" }
# ]`
        },
        warning: "Les ruleKey sont sensibles à la casse. Utilisez des constantes côté code pour éviter les fautes de frappe."
      },
    ],
  },
];
