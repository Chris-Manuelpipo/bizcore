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

export const GUIDES: Guide[] = [
  // ── 1. Premier appel API ────────────────────────────────────────────────
  {
    slug: "premier-appel-api",
    title: "Votre premier appel API",
    description: "Démarrez avec BizCore en 5 minutes : installez les prérequis, obtenez un token JWT et faites votre premier appel.",
    category: "Démarrage",
    duration: "5 min",
    difficulty: "Débutant",
    tags: ["JWT", "Auth", "cURL"],
    steps: [
      {
        title: "Prérequis",
        content: "Assurez-vous que le backend BizCore tourne localement. Par défaut il écoute sur le port 8080. Vous pouvez vérifier la disponibilité de l'API avec une simple requête ping.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `# Vérifier que l'API répond
curl http://localhost:8080/actuator/health

# Réponse attendue
# {"status":"UP"}`
        },
        tip: "Si le port est différent, modifiez NEXT_PUBLIC_API_URL dans votre .env.local."
      },
      {
        title: "Créer un compte",
        content: "Avant toute chose, créez un compte utilisateur. L'endpoint /api/auth/register ne nécessite pas d'authentification.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl -X POST http://localhost:8080/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "admin@bizcore.io",
    "password": "secret123",
    "firstName": "Jean",
    "lastName": "Dupont"
  }'`
        }
      },
      {
        title: "Obtenir un token JWT",
        content: "Authentifiez-vous pour obtenir votre token JWT. Ce token devra être inclus dans tous les appels suivants via le header Authorization.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl -X POST http://localhost:8080/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "admin@bizcore.io",
    "password": "secret123"
  }'

# Réponse
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "expiresIn": 86400
# }`
        },
        tip: "Copiez la valeur du champ token — vous en aurez besoin pour toutes les étapes suivantes."
      },
      {
        title: "Votre premier appel authentifié",
        content: "Utilisez votre token pour récupérer la liste des tenants. Remplacez <VOTRE_TOKEN> par la valeur obtenue à l'étape précédente.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl http://localhost:8080/api/tenants \\
  -H "Authorization: Bearer <VOTRE_TOKEN>"

# Réponse
# []  ← liste vide pour l'instant, c'est normal`
        }
      },
    ],
  },

  // ── 2. Créer et configurer un tenant ───────────────────────────────────
  {
    slug: "creer-configurer-tenant",
    title: "Créer et configurer un tenant",
    description: "Apprenez à créer un espace tenant isolé, y configurer des acteurs PROVIDER et CONSUMER, puis vérifier l'isolation des données.",
    category: "Multi-tenant",
    duration: "10 min",
    difficulty: "Débutant",
    tags: ["Tenant", "Actor", "Isolation"],
    steps: [
      {
        title: "Créer le tenant",
        content: "Un tenant représente une instance métier indépendante sur BizCore. Chaque tenant dispose de son propre espace de données totalement isolé.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl -X POST http://localhost:8080/api/tenants \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Pharmacie Centrale",
    "domain": "pharmacie-centrale"
  }'

# Réponse
# {
#   "id": "550e8400-e29b-41d4-a716-446655440000",
#   "name": "Pharmacie Centrale",
#   "domain": "pharmacie-centrale",
#   "createdAt": "2025-04-28T..."
# }`
        },
        tip: "Sauvegardez le champ id — c'est votre X-Tenant-Id pour tous les appels suivants."
      },
      {
        title: "Créer une personne",
        content: "Avant de créer un acteur, vous devez créer une personne (entité physique). Une personne peut ensuite jouer différents rôles (acteurs) dans le tenant.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl -X POST http://localhost:8080/api/persons \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000" \\
  -H "Content-Type: application/json" \\
  -d '{
    "firstName": "Marie",
    "lastName": "Curie",
    "email": "marie@pharmacie.cm",
    "phone": "+237600000001"
  }'`
        }
      },
      {
        title: "Créer un acteur PROVIDER",
        content: "Un PROVIDER est une entité qui offre des services. Dans une pharmacie, ce serait le pharmacien. Associez la personne créée à ce rôle dans le tenant.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl -X POST http://localhost:8080/api/actors \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000" \\
  -H "Content-Type: application/json" \\
  -d '{
    "personId": "<ID_PERSONNE>",
    "role": "PROVIDER"
  }'`
        }
      },
      {
        title: "Créer un acteur CONSUMER",
        content: "Un CONSUMER est une entité qui consomme des services. Créez une deuxième personne et assignez-lui le rôle CONSUMER.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `# 1. Créer la personne consumer
curl -X POST http://localhost:8080/api/persons \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "X-Tenant-Id: 550e8400-..." \\
  -H "Content-Type: application/json" \\
  -d '{ "firstName": "Paul", "lastName": "Martin", "email": "paul@client.cm" }'

# 2. Créer l'acteur CONSUMER
curl -X POST http://localhost:8080/api/actors \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "X-Tenant-Id: 550e8400-..." \\
  -H "Content-Type: application/json" \\
  -d '{ "personId": "<ID_PAUL>", "role": "CONSUMER" }'`
        },
        tip: "Un même utilisateur peut être PROVIDER dans un tenant et CONSUMER dans un autre."
      },
      {
        title: "Vérifier l'isolation",
        content: "Essayez d'accéder aux acteurs avec un X-Tenant-Id différent. BizCore retournera une liste vide — les données sont strictement isolées par tenant.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `# Avec le bon tenant → vos acteurs
curl http://localhost:8080/api/actors \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000"
# → [{ "id": "...", "role": "PROVIDER" }, ...]

# Avec un autre tenant → liste vide
curl http://localhost:8080/api/actors \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "X-Tenant-Id: 660e8400-0000-0000-0000-000000000000"
# → []`
        },
        warning: "Ne jamais exposer le X-Tenant-Id côté client sans validation. Il doit être injecté par votre backend ou récupéré depuis le token JWT."
      },
    ],
  },

  // ── 3. Workflow ServiceRequest complet ─────────────────────────────────
  {
    slug: "workflow-service-request",
    title: "Workflow ServiceRequest de bout en bout",
    description: "Suivez le cycle de vie complet d'une demande de service : création, acceptation, exécution, accomplissement et paiement de la facture.",
    category: "Workflow",
    duration: "15 min",
    difficulty: "Intermédiaire",
    tags: ["ServiceRequest", "Invoice", "Workflow", "États"],
    steps: [
      {
        title: "Créer un service au catalogue",
        content: "Avant de pouvoir créer une demande, le PROVIDER doit d'abord ajouter un service au catalogue du tenant.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl -X POST http://localhost:8080/api/service-catalogue \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "X-Tenant-Id: <TENANT_ID>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Consultation médicale",
    "description": "Consultation généraliste 30 minutes",
    "price": 25000,
    "currency": "XAF",
    "providerId": "<ID_PROVIDER>"
  }'

# Notez le serviceId retourné`
        }
      },
      {
        title: "CONSUMER — Créer la demande (PENDING)",
        content: "Le CONSUMER soumet une demande pour un service du catalogue. La demande est créée à l'état PENDING et attend l'acceptation du PROVIDER.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl -X POST http://localhost:8080/api/service-requests \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "X-Tenant-Id: <TENANT_ID>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "serviceId": "<SERVICE_ID>",
    "consumerId": "<ID_CONSUMER>",
    "notes": "Consultation urgente pour douleur thoracique"
  }'

# Réponse : { "id": "<SR_ID>", "status": "PENDING", ... }`
        },
        tip: "Sauvegardez le SR_ID — vous en aurez besoin pour toutes les transitions suivantes."
      },
      {
        title: "PROVIDER — Accepter la demande (ACCEPTED)",
        content: "Le PROVIDER consulte les demandes en attente et accepte celle qui lui est destinée.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `# Voir les demandes PENDING
curl "http://localhost:8080/api/service-requests?status=PENDING" \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "X-Tenant-Id: <TENANT_ID>"

# Accepter la demande
curl -X PATCH http://localhost:8080/api/service-requests/<SR_ID>/accept \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "X-Tenant-Id: <TENANT_ID>"

# Réponse : { "status": "ACCEPTED" }`
        }
      },
      {
        title: "PROVIDER — Démarrer l'exécution (IN_PROGRESS)",
        content: "Le PROVIDER démarre l'exécution du service. La demande passe à IN_PROGRESS.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl -X PATCH http://localhost:8080/api/service-requests/<SR_ID>/start \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "X-Tenant-Id: <TENANT_ID>"

# Réponse : { "status": "IN_PROGRESS" }`
        }
      },
      {
        title: "PROVIDER — Accomplir le service (FULFILLED + Invoice)",
        content: "Le PROVIDER marque le service comme accompli. BizCore génère automatiquement une Invoice à l'état PENDING.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl -X PATCH http://localhost:8080/api/service-requests/<SR_ID>/fulfill \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "X-Tenant-Id: <TENANT_ID>"

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
        tip: "La facture est créée automatiquement — vous n'avez pas à la créer manuellement."
      },
      {
        title: "CONSUMER — Payer la facture (PAID)",
        content: "Le CONSUMER reçoit la facture et procède au paiement. La facture passe à PAID et le ServiceRequest est définitivement clôturé.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `# Voir les factures en attente
curl "http://localhost:8080/api/invoices?status=PENDING" \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "X-Tenant-Id: <TENANT_ID>"

# Payer la facture
curl -X PATCH http://localhost:8080/api/invoices/<INVOICE_ID>/pay \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "X-Tenant-Id: <TENANT_ID>"

# Réponse : { "status": "PAID", "paidAt": "2025-04-28T..." }`
        }
      },
    ],
  },

  // ── 4. Intégration JavaScript ───────────────────────────────────────────
  {
    slug: "integration-javascript",
    title: "Intégrer BizCore en JavaScript",
    description: "Utilisez BizCore depuis une application JavaScript/TypeScript avec fetch ou axios. Exemples complets avec gestion d'erreurs.",
    category: "Intégration",
    duration: "10 min",
    difficulty: "Intermédiaire",
    tags: ["JavaScript", "TypeScript", "fetch", "axios"],
    steps: [
      {
        title: "Client API minimal",
        content: "Créez un client API réutilisable qui injecte automatiquement le token JWT et le X-Tenant-Id dans chaque requête.",
        code: {
          lang: "typescript",
          filename: "bizcore-client.ts",
          body: `const API_URL = "http://localhost:8080";

class BizCoreClient {
  private token: string;
  private tenantId: string;

  constructor(token: string, tenantId: string) {
    this.token = token;
    this.tenantId = tenantId;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const res = await fetch(\`\${API_URL}\${path}\`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": \`Bearer \${this.token}\`,
        "X-Tenant-Id": this.tenantId,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(\`[\${res.status}] \${err.message ?? res.statusText}\`);
    }
    return res.json();
  }

  get<T>(path: string) { return this.request<T>("GET", path); }
  post<T>(path: string, body: unknown) { return this.request<T>("POST", path, body); }
  patch<T>(path: string, body?: unknown) { return this.request<T>("PATCH", path, body); }
  delete<T>(path: string) { return this.request<T>("DELETE", path); }
}`
        }
      },
      {
        title: "Authentification",
        content: "Fonction d'authentification qui retourne un client configuré prêt à l'emploi.",
        code: {
          lang: "typescript",
          filename: "auth.ts",
          body: `async function login(
  email: string,
  password: string,
  tenantId: string
): Promise<BizCoreClient> {
  const res = await fetch(\`\${API_URL}/api/auth/login\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Authentification échouée");

  const { token } = await res.json();
  return new BizCoreClient(token, tenantId);
}

// Utilisation
const client = await login(
  "admin@bizcore.io",
  "secret123",
  "550e8400-e29b-41d4-a716-446655440000"
);`
        }
      },
      {
        title: "Créer un ServiceRequest",
        content: "Exemple complet de création d'une demande de service avec gestion d'erreurs.",
        code: {
          lang: "typescript",
          filename: "service-requests.ts",
          body: `interface ServiceRequest {
  id: string;
  status: "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "FULFILLED" | "PAID" | "CANCELLED";
  serviceId: string;
  consumerId: string;
  notes?: string;
  createdAt: string;
}

async function createServiceRequest(
  client: BizCoreClient,
  serviceId: string,
  consumerId: string,
  notes?: string
): Promise<ServiceRequest> {
  try {
    const sr = await client.post<ServiceRequest>("/api/service-requests", {
      serviceId,
      consumerId,
      notes,
    });
    console.log(\`✅ ServiceRequest créé : \${sr.id} [\${sr.status}]\`);
    return sr;
  } catch (error) {
    console.error(\`❌ Erreur : \${error}\`);
    throw error;
  }
}

// Workflow complet
async function fullWorkflow(client: BizCoreClient) {
  const sr = await createServiceRequest(
    client, "<SERVICE_ID>", "<CONSUMER_ID>", "Consultation urgente"
  );

  // Accepter
  await client.patch(\`/api/service-requests/\${sr.id}/accept\`);
  // Démarrer
  await client.patch(\`/api/service-requests/\${sr.id}/start\`);
  // Accomplir (génère une Invoice)
  const result = await client.patch(\`/api/service-requests/\${sr.id}/fulfill\`);
  // Payer la facture
  await client.patch(\`/api/invoices/\${result.invoice.id}/pay\`);

  console.log("🎉 Workflow terminé — facture payée !");
}`
        },
        tip: "En production, gérez les erreurs de transition d'état (409 Conflict) avec une logique de retry ou d'affichage utilisateur."
      },
    ],
  },

  // ── 5. Règles métier ────────────────────────────────────────────────────
  {
    slug: "regles-metier",
    title: "Configurer des règles métier",
    description: "Définissez des règles métier personnalisées par tenant pour adapter le comportement de la plateforme sans modifier le code.",
    category: "Multi-tenant",
    duration: "8 min",
    difficulty: "Avancé",
    tags: ["BusinessRule", "Configuration", "Tenant"],
    steps: [
      {
        title: "Comprendre les règles métier",
        content: "Les BusinessRules permettent de configurer le comportement de BizCore par tenant sans redéploiement. Elles sont stockées en base et consultées à l'exécution.",
        tip: "Chaque tenant peut avoir ses propres règles indépendantes des autres tenants — c'est le principe du control plane vs data plane."
      },
      {
        title: "Créer une règle",
        content: "Créez une règle qui limite le nombre de demandes simultanées par consumer.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl -X POST http://localhost:8080/api/business-rules \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "X-Tenant-Id: <TENANT_ID>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "MAX_CONCURRENT_REQUESTS",
    "value": "3",
    "description": "Nombre max de demandes actives par consumer",
    "type": "INTEGER"
  }'`
        }
      },
      {
        title: "Lister les règles du tenant",
        content: "Consultez toutes les règles configurées pour le tenant courant.",
        code: {
          lang: "bash",
          filename: "terminal",
          body: `curl http://localhost:8080/api/business-rules \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "X-Tenant-Id: <TENANT_ID>"

# Réponse
# [
#   { "name": "MAX_CONCURRENT_REQUESTS", "value": "3", "type": "INTEGER" },
#   { "name": "REQUIRE_NOTES", "value": "true", "type": "BOOLEAN" }
# ]`
        },
        warning: "Les noms de règles sont sensibles à la casse et doivent être uniques par tenant. Utilisez des constantes dans votre code pour éviter les fautes de frappe."
      },
    ],
  },
];
