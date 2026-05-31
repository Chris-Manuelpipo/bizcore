export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface EndpointParam {
  name: string;
  in: "header" | "path" | "query" | "body";
  required: boolean;
  type: string;
  description: string;
  example?: string;
}

export interface EndpointResponse {
  status: number;
  description: string;
  example?: string;
}

export interface Endpoint {
  id: string;
  method: HttpMethod;
  path: string;
  summary: string;
  description: string;
  category: string;
  params: EndpointParam[];
  requestBody?: string;
  responses: EndpointResponse[];
  requiresAuth: boolean;
  // Le tenant est porté par le JWT (claim "tenantId"), jamais par un en-tête.
  // Ce champ reste à false : aucun X-Tenant-Id n'est attendu par l'API.
  requiresTenant: boolean;
}

export const API_CATEGORIES = [
  "Auth",
  "Tenant",
  "Actor",
  "Business",
  "ServiceCatalogue",
  "ServiceRequest",
  "Invoice",
  "BusinessRule",
] as const;

export const ENDPOINTS: Endpoint[] = [
  // ── AUTH ──────────────────────────────────────────────
  {
    id: "auth-register",
    method: "POST",
    path: "/api/auth/register",
    summary: "Enregistrer un nouvel utilisateur",
    description: "Crée un compte utilisateur et retourne immédiatement un token JWT. Si tenantId est fourni, l'utilisateur est rattaché à ce tenant ; sinon au tenant par défaut. firstName, lastName, email et password sont obligatoires.",
    category: "Auth",
    requiresAuth: false,
    requiresTenant: false,
    params: [],
    requestBody: JSON.stringify({ email: "user@example.com", password: "secret123", firstName: "Jean", lastName: "Dupont", tenantId: "550e8400-e29b-41d4-a716-446655440000" }, null, 2),
    responses: [
      { status: 201, description: "Utilisateur créé", example: JSON.stringify({ token: "eyJhbGci...", email: "user@example.com", firstName: "Jean", lastName: "Dupont", roles: ["USER"] }, null, 2) },
      { status: 409, description: "Email déjà utilisé" },
    ],
  },
  {
    id: "auth-login",
    method: "POST",
    path: "/api/auth/login",
    summary: "Authentification",
    description: "Authentifie un utilisateur (email + password uniquement) et retourne un token JWT à inclure dans tous les appels protégés. Le tenant de l'utilisateur est encodé dans le token.",
    category: "Auth",
    requiresAuth: false,
    requiresTenant: false,
    params: [],
    requestBody: JSON.stringify({ email: "user@example.com", password: "secret123" }, null, 2),
    responses: [
      { status: 200, description: "Token JWT retourné", example: JSON.stringify({ token: "eyJhbGci...", email: "user@example.com", firstName: "Jean", lastName: "Dupont", roles: ["USER"] }, null, 2) },
      { status: 401, description: "Identifiants incorrects" },
    ],
  },
  // ── TENANT ────────────────────────────────────────────
  {
    id: "tenant-create",
    method: "POST",
    path: "/api/tenants/register",
    summary: "Créer un tenant",
    description: "Crée un espace tenant isolé (public, aucun token requis). Chaque tenant représente une instance métier indépendante. Rattachez ensuite des utilisateurs en passant son id à /api/auth/register.",
    category: "Tenant",
    requiresAuth: false,
    requiresTenant: false,
    params: [],
    requestBody: JSON.stringify({ name: "Pharmacie Centrale", domain: "pharmacie-centrale" }, null, 2),
    responses: [
      { status: 201, description: "Tenant créé", example: JSON.stringify({ id: "550e8400-e29b-41d4-a716-446655440000", name: "Pharmacie Centrale", domain: "pharmacie-centrale" }, null, 2) },
      { status: 400, description: "Nom de tenant déjà utilisé ou données invalides" },
    ],
  },
  {
    id: "tenant-get",
    method: "GET",
    path: "/api/tenants/{id}",
    summary: "Récupérer un tenant",
    description: "Retourne les informations d'un tenant par son UUID (endpoint public).",
    category: "Tenant",
    requiresAuth: false,
    requiresTenant: false,
    params: [{ name: "id", in: "path", required: true, type: "UUID", description: "Identifiant du tenant", example: "550e8400-e29b-41d4-a716-446655440000" }],
    responses: [
      { status: 200, description: "Tenant trouvé" },
      { status: 404, description: "Tenant introuvable" },
    ],
  },
  // ── ACTOR ─────────────────────────────────────────────
  {
    id: "actor-create",
    method: "POST",
    path: "/api/actors/user/{userId}",
    summary: "Créer un acteur",
    description: "Crée un acteur (PROVIDER ou CONSUMER) associé à un utilisateur existant. Récupérez d'abord l'id de l'utilisateur via GET /api/users/email/{email}.",
    category: "Actor",
    requiresAuth: true,
    requiresTenant: false,
    params: [
      { name: "userId", in: "path", required: true, type: "UUID", description: "Identifiant de l'utilisateur à associer", example: "550e8400-e29b-41d4-a716-446655440000" },
    ],
    requestBody: JSON.stringify({ role: "PROVIDER", bio: "Pharmacien titulaire" }, null, 2),
    responses: [
      { status: 201, description: "Acteur créé avec succès" },
      { status: 404, description: "Utilisateur introuvable" },
    ],
  },
  {
    id: "actor-list",
    method: "GET",
    path: "/api/actors",
    summary: "Lister les acteurs",
    description: "Retourne la liste paginée des acteurs du tenant courant (déduit du JWT). Pour filtrer par rôle, utilisez plutôt GET /api/actors/role/{role}.",
    category: "Actor",
    requiresAuth: true,
    requiresTenant: false,
    params: [
      { name: "page", in: "query", required: false, type: "integer", description: "Numéro de page (défaut: 0)", example: "0" },
      { name: "size", in: "query", required: false, type: "integer", description: "Taille de page (défaut: 10)", example: "10" },
    ],
    responses: [
      { status: 200, description: "Page d'acteurs (Page<ActorDTO>)" },
    ],
  },
  // ── SERVICE REQUEST ───────────────────────────────────
  {
    id: "sr-create",
    method: "POST",
    path: "/api/service-requests/consumer/{consumerId}/provider/{providerId}/catalogue/{serviceCatalogueId}",
    summary: "Créer une demande de service",
    description: "Crée une demande (CdS → FdS) via les ID d'acteurs et de service de catalogue passés dans l'URL. La demande naît à l'état PENDING et attend l'acceptation du provider.",
    category: "ServiceRequest",
    requiresAuth: true,
    requiresTenant: false,
    params: [
      { name: "consumerId", in: "path", required: true, type: "UUID", description: "Id de l'acteur CONSUMER" },
      { name: "providerId", in: "path", required: true, type: "UUID", description: "Id de l'acteur PROVIDER" },
      { name: "serviceCatalogueId", in: "path", required: true, type: "UUID", description: "Id du service de catalogue" },
    ],
    requestBody: JSON.stringify({ serviceName: "Consultation urgente", description: "Douleur thoracique" }, null, 2),
    responses: [
      { status: 201, description: "ServiceRequest créé", example: JSON.stringify({ id: "uuid", status: "PENDING", serviceName: "Consultation urgente" }, null, 2) },
      { status: 400, description: "Données invalides" },
      { status: 401, description: "Token JWT manquant ou invalide" },
    ],
  },
  {
    id: "sr-accept",
    method: "PATCH",
    path: "/api/service-requests/{id}/accept",
    summary: "Accepter une demande",
    description: "Le provider accepte une demande PENDING (→ ACCEPTED). L'acteur agissant est déduit de l'utilisateur authentifié (JWT) : seul le provider de la demande peut accepter.",
    category: "ServiceRequest",
    requiresAuth: true,
    requiresTenant: false,
    params: [
      { name: "id", in: "path", required: true, type: "UUID", description: "Identifiant de la demande" },
    ],
    responses: [
      { status: 200, description: "Demande acceptée", example: JSON.stringify({ id: "uuid", status: "ACCEPTED" }, null, 2) },
      { status: 400, description: "Transition d'état invalide" },
      { status: 404, description: "Demande introuvable" },
    ],
  },
  {
    id: "sr-start",
    method: "PATCH",
    path: "/api/service-requests/{id}/start",
    summary: "Démarrer l'exécution",
    description: "Le provider démarre l'exécution (ACCEPTED → IN_PROGRESS). L'acteur agissant est déduit du JWT : seul le provider de la demande peut démarrer.",
    category: "ServiceRequest",
    requiresAuth: true,
    requiresTenant: false,
    params: [
      { name: "id", in: "path", required: true, type: "UUID", description: "Identifiant de la demande" },
    ],
    responses: [
      { status: 200, description: "Service en cours", example: JSON.stringify({ id: "uuid", status: "IN_PROGRESS" }, null, 2) },
      { status: 400, description: "Transition invalide — doit être ACCEPTED" },
    ],
  },
  {
    id: "sr-fulfill",
    method: "PATCH",
    path: "/api/service-requests/{id}/fulfill",
    summary: "Accomplir le service",
    description: "Le provider marque le service accompli (→ FULFILLED). Une facture PENDING est générée automatiquement. Cet endpoint ne prend pas de actorId.",
    category: "ServiceRequest",
    requiresAuth: true,
    requiresTenant: false,
    params: [{ name: "id", in: "path", required: true, type: "UUID", description: "Identifiant de la demande" }],
    responses: [
      { status: 200, description: "Service accompli + facture créée", example: JSON.stringify({ serviceRequest: { status: "FULFILLED" }, invoice: { id: "uuid", status: "PENDING", amount: 25000, currency: "XAF" } }, null, 2) },
    ],
  },
  {
    id: "sr-cancel",
    method: "PATCH",
    path: "/api/service-requests/{id}/cancel",
    summary: "Annuler une demande",
    description: "Annule une demande (depuis PENDING, ACCEPTED ou IN_PROGRESS). L'acteur agissant est déduit du JWT : le consumer ou le provider de la demande peut annuler.",
    category: "ServiceRequest",
    requiresAuth: true,
    requiresTenant: false,
    params: [
      { name: "id", in: "path", required: true, type: "UUID", description: "Identifiant de la demande" },
    ],
    responses: [
      { status: 200, description: "Demande annulée", example: JSON.stringify({ id: "uuid", status: "CANCELLED" }, null, 2) },
      { status: 400, description: "Annulation impossible — service déjà accompli" },
    ],
  },
  // ── INVOICE ───────────────────────────────────────────
  {
    id: "invoice-list",
    method: "GET",
    path: "/api/invoices",
    summary: "Lister les factures",
    description: "Retourne toutes les factures du tenant courant. Pour filtrer par statut, utilisez GET /api/invoices/status/{status} (PENDING | PAID | CANCELLED).",
    category: "Invoice",
    requiresAuth: true,
    requiresTenant: false,
    params: [],
    responses: [{ status: 200, description: "Liste des factures" }],
  },
  {
    id: "invoice-pay",
    method: "PATCH",
    path: "/api/invoices/{id}/pay",
    summary: "Payer une facture",
    description: "Enregistre le paiement d'une facture (PENDING → PAID).",
    category: "Invoice",
    requiresAuth: true,
    requiresTenant: false,
    params: [{ name: "id", in: "path", required: true, type: "UUID", description: "Identifiant de la facture" }],
    responses: [
      { status: 200, description: "Facture payée", example: JSON.stringify({ id: "uuid", status: "PAID" }, null, 2) },
      { status: 400, description: "Facture déjà payée ou annulée" },
    ],
  },
  // ── BUSINESS ──────────────────────────────────────────
  {
    id: "business-create",
    method: "POST",
    path: "/api/businesses",
    summary: "Créer une entreprise",
    description: "Crée une entité métier (business) dans le tenant courant.",
    category: "Business",
    requiresAuth: true,
    requiresTenant: false,
    params: [],
    requestBody: JSON.stringify({ name: "Pharmacie du Centre", domain: "Santé", description: "Pharmacie principale", neededEducation: "Doctorat en pharmacie", neededTraining: "Stage hospitalier", tenantId: "550e8400-e29b-41d4-a716-446655440000" }, null, 2),
    responses: [
      { status: 201, description: "Business créé" },
      { status: 400, description: "Données invalides" },
    ],
  },
  // ── SERVICE CATALOGUE ─────────────────────────────────
  {
    id: "service-create",
    method: "POST",
    path: "/api/service-catalogues/business/{businessId}",
    summary: "Créer un service",
    description: "Ajoute un service au catalogue, rattaché à un business. Les consumers pourront créer des demandes pour ce service.",
    category: "ServiceCatalogue",
    requiresAuth: true,
    requiresTenant: false,
    params: [
      { name: "businessId", in: "path", required: true, type: "UUID", description: "Id du business propriétaire du service" },
    ],
    requestBody: JSON.stringify({ name: "Consultation médicale", description: "Consultation généraliste 30min", basePrice: 25000, currency: "XAF" }, null, 2),
    responses: [
      { status: 201, description: "Service créé et disponible au catalogue" },
    ],
  },
  {
    id: "service-list",
    method: "GET",
    path: "/api/service-catalogues",
    summary: "Lister le catalogue",
    description: "Retourne tous les services du catalogue. Variantes : /available (services disponibles), /business/{businessId}, /search?name=...",
    category: "ServiceCatalogue",
    requiresAuth: true,
    requiresTenant: false,
    params: [],
    responses: [{ status: 200, description: "Liste des services du catalogue" }],
  },
  // ── BUSINESS RULE ─────────────────────────────────────
  {
    id: "rule-create",
    method: "POST",
    path: "/api/business-rules/business/{businessId}",
    summary: "Créer une règle métier",
    description: "Définit une règle métier (clé/valeur) rattachée à un business, sans modifier le code source.",
    category: "BusinessRule",
    requiresAuth: true,
    requiresTenant: false,
    params: [
      { name: "businessId", in: "path", required: true, type: "UUID", description: "Id du business" },
    ],
    requestBody: JSON.stringify({ ruleKey: "MAX_DAILY_REQUESTS", ruleValue: "10", description: "Limite de demandes par jour par consumer" }, null, 2),
    responses: [
      { status: 201, description: "Règle créée" },
    ],
  },
];
