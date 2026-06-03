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

// NOTE : les exemples interpolent API_BASE (= NEXT_PUBLIC_API_URL, sinon
// l'URL de prod Render) — voir src/lib/config.ts.
// Le tenant n'est JAMAIS passé en en-tête : il est embarqué dans le JWT
// (claim "tenantId") au moment de l'inscription de l'utilisateur, puis
// appliqué automatiquement par le backend à chaque requête authentifiée.
export const GUIDES: Guide[] = [
  // ── 1. Premier appel API ────────────────────────────────────────────────
  {
    slug: "premier-appel-api",
    title: "Votre premier appel API",
    description: "Démarrez avec BizCore en 5 minutes : vérifiez l'API, créez un compte, obtenez un token JWT et faites votre premier appel authentifié.",
    category: "Démarrage",
    duration: "5 min",
    difficulty: "Débutant",
    tags: ["JWT", "Auth", "cURL"],
    steps: [
      {
        title: "Prérequis",
        content: "Assurez-vous que le backend BizCore tourne. Par défaut il écoute sur le port 8080. Vérifiez sa disponibilité via l'endpoint de santé (public).",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `# Vérifier que l'API répond
curl ${API_BASE}/actuator/health

# Réponse attendue
# {"status":"UP"}`
        },
        tip: "Si le port ou l'hôte diffère, définissez NEXT_PUBLIC_API_URL dans votre .env.local (frontend)."
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

  // ── 2. Créer et configurer un tenant ───────────────────────────────────
  {
    slug: "creer-configurer-tenant",
    title: "Créer et configurer un tenant",
    description: "Créez un tenant isolé, rattachez-y des utilisateurs, puis créez des acteurs PROVIDER et CONSUMER. L'isolation est automatique via le JWT.",
    category: "Multi-tenant",
    duration: "10 min",
    difficulty: "Débutant",
    tags: ["Tenant", "Actor", "Isolation"],
    steps: [
      {
        title: "Créer le tenant",
        content: "Un tenant représente une instance métier indépendante, avec son espace de données isolé. La création se fait sur /api/tenants/register (public).",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl -X POST ${API_BASE}/api/tenants/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Pharmacie Centrale",
    "domain": "pharmacie-centrale"
  }'

# Réponse
# {
#   "id": "550e8400-e29b-41d4-a716-446655440000",
#   "name": "Pharmacie Centrale",
#   "domain": "pharmacie-centrale"
# }`
        },
        tip: "Notez le champ id du tenant : vous le passerez à l'inscription des utilisateurs pour les rattacher à ce tenant."
      },
      {
        title: "Rattacher un utilisateur au tenant",
        content: "Inscrivez un utilisateur en précisant tenantId. Son token JWT portera ce tenant, et toutes ses requêtes seront automatiquement limitées aux données du tenant.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl -X POST ${API_BASE}/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "marie@pharmacie.cm",
    "password": "secret123",
    "firstName": "Marie",
    "lastName": "Curie",
    "tenantId": "550e8400-e29b-41d4-a716-446655440000"
  }'`
        },
        warning: "Le tenant provient EXCLUSIVEMENT du JWT (claim tenantId). Il n'existe pas d'en-tête X-Tenant-Id : inutile de l'envoyer, le backend l'ignore."
      },
      {
        title: "Récupérer l'identifiant de l'utilisateur",
        content: "Pour créer un acteur, il faut l'id de l'utilisateur. On le récupère par son email.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl ${API_BASE}/api/users/email/marie@pharmacie.cm \\
  -H "Authorization: Bearer <TOKEN>"

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
  -H "Authorization: Bearer <TOKEN>" \\
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
  -H "Content-Type: application/json" \\
  -d '{ "email": "paul@client.cm", "password": "secret123",
        "firstName": "Paul", "lastName": "Martin",
        "tenantId": "550e8400-e29b-41d4-a716-446655440000" }'

# 2. Récupérer son id
curl ${API_BASE}/api/users/email/paul@client.cm \\
  -H "Authorization: Bearer <TOKEN>"

# 3. Créer l'acteur CONSUMER
curl -X POST ${API_BASE}/api/actors/user/<USER_ID_PAUL> \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{ "role": "CONSUMER", "bio": "Client régulier" }'`
        },
        tip: "Notez les id des acteurs PROVIDER et CONSUMER : ils servent à créer et faire transiter les ServiceRequests."
      },
      {
        title: "Vérifier l'isolation",
        content: "Listez les acteurs avec le token : vous ne voyez que ceux de votre tenant. Un utilisateur d'un autre tenant obtiendra une liste vide — l'isolation est appliquée automatiquement à partir du JWT, sans aucun en-tête à gérer.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl "${API_BASE}/api/actors?page=0&size=10" \\
  -H "Authorization: Bearer <TOKEN>"
# → { "content": [{ "id": "...", "role": "PROVIDER" }, ...] }`
        }
      },
    ],
  },

  // ── 3. Workflow ServiceRequest complet ─────────────────────────────────
  {
    slug: "workflow-service-request",
    title: "Workflow ServiceRequest de bout en bout",
    description: "Suivez le cycle de vie complet d'une demande : catalogue, création, acceptation, exécution, accomplissement (facture auto) puis paiement.",
    category: "Workflow",
    duration: "15 min",
    difficulty: "Intermédiaire",
    tags: ["ServiceRequest", "Invoice", "Workflow", "États"],
    steps: [
      {
        title: "Créer un business puis un service au catalogue",
        content: "Un service de catalogue appartient à un business. Créez d'abord le business, puis le service (basePrice + currency).",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `# 1. Créer le business
curl -X POST ${API_BASE}/api/businesses \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "Officine", "domain": "Santé",
        "description": "Pharmacie", "neededEducation": "Doctorat",
        "neededTraining": "Stage",
        "tenantId": "550e8400-e29b-41d4-a716-446655440000" }'
# → { "id": "<BUSINESS_ID>", ... }

# 2. Ajouter un service à ce business
curl -X POST ${API_BASE}/api/service-catalogues/business/<BUSINESS_ID> \\
  -H "Authorization: Bearer <TOKEN>" \\
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
  -H "Authorization: Bearer <TOKEN>" \\
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
        content: "Le provider accepte la demande. L'acteur agissant est déduit du token JWT (pas de paramètre actorId) : il faut donc être authentifié en tant que provider de la demande. Le filtre par statut utilise un segment d'URL.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `# Voir les demandes PENDING
curl ${API_BASE}/api/service-requests/status/PENDING \\
  -H "Authorization: Bearer <TOKEN_PROVIDER>"

# Accepter (authentifié en tant que provider de la demande)
curl -X PATCH ${API_BASE}/api/service-requests/<SR_ID>/accept \\
  -H "Authorization: Bearer <TOKEN_PROVIDER>"

# Réponse : { "status": "ACCEPTED" }`
        }
      },
      {
        title: "PROVIDER — Démarrer l'exécution (IN_PROGRESS)",
        content: "Le provider démarre l'exécution. La demande passe à IN_PROGRESS. Toujours sans actorId : l'acteur vient du token.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl -X PATCH ${API_BASE}/api/service-requests/<SR_ID>/start \\
  -H "Authorization: Bearer <TOKEN_PROVIDER>"

# Réponse : { "status": "IN_PROGRESS" }`
        }
      },
      {
        title: "PROVIDER — Accomplir le service (FULFILLED + Invoice)",
        content: "Le provider marque le service accompli. BizCore génère automatiquement une Invoice PENDING. L'endpoint fulfill ne prend PAS de actorId.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl -X PATCH ${API_BASE}/api/service-requests/<SR_ID>/fulfill \\
  -H "Authorization: Bearer <TOKEN>"

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
  -H "Authorization: Bearer <TOKEN>"

# Payer la facture
curl -X PATCH ${API_BASE}/api/invoices/<INVOICE_ID>/pay \\
  -H "Authorization: Bearer <TOKEN>"

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
    description: "Consommez BizCore depuis JavaScript/TypeScript avec fetch. Le token JWT porte déjà le tenant — aucun en-tête de tenant à gérer.",
    category: "Intégration",
    duration: "10 min",
    difficulty: "Intermédiaire",
    tags: ["JavaScript", "TypeScript", "fetch"],
    steps: [
      {
        title: "Client API minimal",
        content: "Un client réutilisable qui injecte automatiquement le token JWT. Le tenant est déjà dans le token : pas d'en-tête X-Tenant-Id.",
        code: {
          lang: "typescript",
          filename: "bizcore-client.ts",
          body: `const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "${API_BASE}";

class BizCoreClient {
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
    // 204 No Content → pas de corps
    return res.status === 204 ? (undefined as T) : res.json();
  }

  get<T>(path: string) { return this.request<T>("GET", path); }
  post<T>(path: string, body?: unknown) { return this.request<T>("POST", path, body); }
  patch<T>(path: string, body?: unknown) { return this.request<T>("PATCH", path, body); }
  delete<T>(path: string) { return this.request<T>("DELETE", path); }
}`
        }
      },
      {
        title: "Authentification",
        content: "Fonction d'authentification qui retourne un client prêt à l'emploi. Le tenant n'est pas passé ici : il est déjà encodé dans le token renvoyé par le backend.",
        code: {
          lang: "typescript",
          filename: "auth.ts",
          body: `async function login(email: string, password: string): Promise<BizCoreClient> {
  const res = await fetch(\`\${API_URL}/api/auth/login\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Authentification échouée");

  const { token } = await res.json();
  return new BizCoreClient(token);
}

// Utilisation
const client = await login("admin@bizcore.io", "secret123");`
        }
      },
      {
        title: "Workflow ServiceRequest complet",
        content: "Création (IDs dans l'URL) puis transitions. Aucune transition ne prend de actorId : l'acteur est déduit du token. accept/start doivent donc être appelés avec le token du provider.",
        code: {
          lang: "typescript",
          filename: "service-requests.ts",
          body: `// providerClient et consumerClient sont obtenus via login() avec
// les comptes respectifs (l'acteur agissant est déduit du token).
async function fullWorkflow(
  consumerClient: BizCoreClient,
  providerClient: BizCoreClient,
  consumerId: string,
  providerId: string,
  catalogueId: string
) {
  // Le consumer crée la demande
  const sr = await consumerClient.post<{ id: string; status: string }>(
    \`/api/service-requests/consumer/\${consumerId}/provider/\${providerId}/catalogue/\${catalogueId}\`,
    { serviceName: "Consultation urgente", description: "Douleur thoracique" }
  );
  console.log(\`ServiceRequest \${sr.id} [\${sr.status}]\`);

  // Le provider accepte, démarre puis accomplit (acteur déduit du token)
  await providerClient.patch(\`/api/service-requests/\${sr.id}/accept\`);
  await providerClient.patch(\`/api/service-requests/\${sr.id}/start\`);
  const result = await providerClient.patch<{ invoice: { id: string } }>(
    \`/api/service-requests/\${sr.id}/fulfill\`
  );

  // Le consumer paie la facture générée
  await consumerClient.patch(\`/api/invoices/\${result.invoice.id}/pay\`);
  console.log("Workflow terminé — facture payée.");
}`
        },
        tip: "Une transition invalide renvoie 400 : prévoyez l'affichage de l'erreur ou un état désactivé côté UI."
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
  -H "Authorization: Bearer <TOKEN>" \\
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
  -H "Authorization: Bearer <TOKEN>"

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
