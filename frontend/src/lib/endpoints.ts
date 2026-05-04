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
  requiresTenant: boolean;
}

export const API_CATEGORIES = [
  "Auth",
  "Tenant",
  "Person",
  "Actor",
  "Business",
  "Portfolio",
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
    description: "Crée un nouveau compte utilisateur et retourne un token JWT valide immédiatement.",
    category: "Auth",
    requiresAuth: false,
    requiresTenant: false,
    params: [],
    requestBody: JSON.stringify({ email: "user@example.com", password: "secret123", firstName: "Jean", lastName: "Dupont" }, null, 2),
    responses: [
      { status: 201, description: "Utilisateur créé", example: JSON.stringify({ token: "eyJhbGci...", userId: "uuid" }, null, 2) },
      { status: 400, description: "Données invalides ou email déjà utilisé" },
    ],
  },
  {
    id: "auth-login",
    method: "POST",
    path: "/api/auth/login",
    summary: "Authentification",
    description: "Authentifie un utilisateur et retourne un token JWT à inclure dans tous les appels suivants.",
    category: "Auth",
    requiresAuth: false,
    requiresTenant: false,
    params: [],
    requestBody: JSON.stringify({ email: "user@example.com", password: "secret123" }, null, 2),
    responses: [
      { status: 200, description: "Token JWT retourné", example: JSON.stringify({ token: "eyJhbGci...", expiresIn: 86400 }, null, 2) },
      { status: 401, description: "Identifiants incorrects" },
    ],
  },
  // ── TENANT ────────────────────────────────────────────
  {
    id: "tenant-create",
    method: "POST",
    path: "/api/tenants",
    summary: "Créer un tenant",
    description: "Crée un nouvel espace tenant isolé. Chaque tenant représente une instance métier indépendante sur la plateforme.",
    category: "Tenant",
    requiresAuth: true,
    requiresTenant: false,
    params: [],
    requestBody: JSON.stringify({ name: "Pharmacie Centrale", domain: "pharmacie-centrale", plan: "STANDARD" }, null, 2),
    responses: [
      { status: 201, description: "Tenant créé", example: JSON.stringify({ id: "550e8400-e29b-41d4", name: "Pharmacie Centrale", domain: "pharmacie-centrale" }, null, 2) },
      { status: 409, description: "Domain déjà utilisé" },
    ],
  },
  {
    id: "tenant-get",
    method: "GET",
    path: "/api/tenants/{id}",
    summary: "Récupérer un tenant",
    description: "Retourne les informations complètes d'un tenant par son identifiant UUID.",
    category: "Tenant",
    requiresAuth: true,
    requiresTenant: false,
    params: [{ name: "id", in: "path", required: true, type: "UUID", description: "Identifiant du tenant", example: "550e8400-e29b-41d4" }],
    responses: [
      { status: 200, description: "Tenant trouvé" },
      { status: 404, description: "Tenant introuvable" },
    ],
  },
  // ── ACTOR ─────────────────────────────────────────────
  {
    id: "actor-create",
    method: "POST",
    path: "/api/actors",
    summary: "Créer un acteur",
    description: "Crée un acteur (PROVIDER ou CONSUMER) dans le tenant courant. Un acteur est associé à une personne et à un rôle métier.",
    category: "Actor",
    requiresAuth: true,
    requiresTenant: true,
    params: [
      { name: "X-Tenant-Id", in: "header", required: true, type: "UUID", description: "Identifiant du tenant", example: "550e8400-e29b-41d4" },
    ],
    requestBody: JSON.stringify({ personId: "uuid", role: "PROVIDER", businessId: "uuid" }, null, 2),
    responses: [
      { status: 201, description: "Acteur créé avec succès" },
      { status: 400, description: "Rôle invalide ou personne introuvable" },
    ],
  },
  {
    id: "actor-list",
    method: "GET",
    path: "/api/actors",
    summary: "Lister les acteurs",
    description: "Retourne la liste paginée de tous les acteurs du tenant courant, avec filtrage optionnel par rôle.",
    category: "Actor",
    requiresAuth: true,
    requiresTenant: true,
    params: [
      { name: "X-Tenant-Id", in: "header", required: true, type: "UUID", description: "Identifiant du tenant", example: "550e8400" },
      { name: "role", in: "query", required: false, type: "string", description: "Filtrer par rôle (PROVIDER, CONSUMER)", example: "PROVIDER" },
      { name: "page", in: "query", required: false, type: "integer", description: "Numéro de page (défaut: 0)", example: "0" },
      { name: "size", in: "query", required: false, type: "integer", description: "Taille de page (défaut: 20)", example: "20" },
    ],
    responses: [
      { status: 200, description: "Liste paginée d'acteurs" },
    ],
  },
  // ── SERVICE REQUEST ───────────────────────────────────
  {
    id: "sr-create",
    method: "POST",
    path: "/api/service-requests",
    summary: "Créer une demande de service",
    description: "Crée une nouvelle demande de service (CdS → FdS). La demande est initialisée à l'état PENDING et attend l'acceptation du provider.",
    category: "ServiceRequest",
    requiresAuth: true,
    requiresTenant: true,
    params: [
      { name: "Authorization", in: "header", required: true, type: "string", description: "Bearer JWT token", example: "Bearer eyJhbGci..." },
      { name: "X-Tenant-Id", in: "header", required: true, type: "UUID", description: "Identifiant du tenant", example: "550e8400-e29b-41d4" },
    ],
    requestBody: JSON.stringify({ serviceId: "uuid", consumerId: "uuid", notes: "Demande de consultation urgente", scheduledAt: "2025-05-01T10:00:00Z" }, null, 2),
    responses: [
      { status: 201, description: "ServiceRequest créé", example: JSON.stringify({ id: "uuid", status: "PENDING", serviceId: "uuid", consumerId: "uuid", createdAt: "2025-04-28T..." }, null, 2) },
      { status: 400, description: "Données invalides" },
      { status: 401, description: "Token JWT manquant ou invalide" },
      { status: 403, description: "Accès refusé — rôle insuffisant" },
    ],
  },
  {
    id: "sr-accept",
    method: "PATCH",
    path: "/api/service-requests/{id}/accept",
    summary: "Accepter une demande",
    description: "Le provider accepte une demande en attente. La demande passe de PENDING à ACCEPTED.",
    category: "ServiceRequest",
    requiresAuth: true,
    requiresTenant: true,
    params: [
      { name: "id", in: "path", required: true, type: "UUID", description: "Identifiant de la demande" },
      { name: "X-Tenant-Id", in: "header", required: true, type: "UUID", description: "Identifiant du tenant" },
    ],
    responses: [
      { status: 200, description: "Demande acceptée", example: JSON.stringify({ id: "uuid", status: "ACCEPTED" }, null, 2) },
      { status: 404, description: "Demande introuvable" },
      { status: 409, description: "Transition d'état invalide" },
    ],
  },
  {
    id: "sr-start",
    method: "PATCH",
    path: "/api/service-requests/{id}/start",
    summary: "Démarrer l'exécution",
    description: "Le provider démarre l'exécution du service. La demande passe de ACCEPTED à IN_PROGRESS.",
    category: "ServiceRequest",
    requiresAuth: true,
    requiresTenant: true,
    params: [{ name: "id", in: "path", required: true, type: "UUID", description: "Identifiant de la demande" }],
    responses: [
      { status: 200, description: "Service en cours", example: JSON.stringify({ id: "uuid", status: "IN_PROGRESS" }, null, 2) },
      { status: 409, description: "Transition invalide — doit être ACCEPTED" },
    ],
  },
  {
    id: "sr-fulfill",
    method: "PATCH",
    path: "/api/service-requests/{id}/fulfill",
    summary: "Accomplir le service",
    description: "Le provider marque le service comme accompli. La demande passe à FULFILLED et une facture est automatiquement générée.",
    category: "ServiceRequest",
    requiresAuth: true,
    requiresTenant: true,
    params: [{ name: "id", in: "path", required: true, type: "UUID", description: "Identifiant de la demande" }],
    responses: [
      { status: 200, description: "Service accompli + facture créée", example: JSON.stringify({ serviceRequest: { status: "FULFILLED" }, invoice: { id: "uuid", status: "PENDING", amount: 150.00 } }, null, 2) },
    ],
  },
  {
    id: "sr-cancel",
    method: "PATCH",
    path: "/api/service-requests/{id}/cancel",
    summary: "Annuler une demande",
    description: "Annule une demande de service. Possible depuis PENDING, ACCEPTED ou IN_PROGRESS.",
    category: "ServiceRequest",
    requiresAuth: true,
    requiresTenant: true,
    params: [{ name: "id", in: "path", required: true, type: "UUID", description: "Identifiant de la demande" }],
    responses: [
      { status: 200, description: "Demande annulée", example: JSON.stringify({ id: "uuid", status: "CANCELLED" }, null, 2) },
      { status: 409, description: "Annulation impossible — service déjà accompli ou payé" },
    ],
  },
  // ── INVOICE ───────────────────────────────────────────
  {
    id: "invoice-list",
    method: "GET",
    path: "/api/invoices",
    summary: "Lister les factures",
    description: "Retourne la liste paginée des factures du tenant courant, filtrables par statut.",
    category: "Invoice",
    requiresAuth: true,
    requiresTenant: true,
    params: [
      { name: "status", in: "query", required: false, type: "string", description: "PENDING | PAID | CANCELLED", example: "PENDING" },
      { name: "page", in: "query", required: false, type: "integer", description: "Page (défaut: 0)", example: "0" },
    ],
    responses: [{ status: 200, description: "Liste paginée de factures" }],
  },
  {
    id: "invoice-pay",
    method: "PATCH",
    path: "/api/invoices/{id}/pay",
    summary: "Payer une facture",
    description: "Enregistre le paiement d'une facture. La facture passe de PENDING à PAID et le ServiceRequest associé est mis à jour.",
    category: "Invoice",
    requiresAuth: true,
    requiresTenant: true,
    params: [{ name: "id", in: "path", required: true, type: "UUID", description: "Identifiant de la facture" }],
    responses: [
      { status: 200, description: "Facture payée", example: JSON.stringify({ id: "uuid", status: "PAID", paidAt: "2025-04-28T..." }, null, 2) },
      { status: 409, description: "Facture déjà payée ou annulée" },
    ],
  },
  // ── BUSINESS ──────────────────────────────────────────
  {
    id: "business-create",
    method: "POST",
    path: "/api/businesses",
    summary: "Créer une entreprise",
    description: "Crée une entreprise/entité métier dans le tenant courant.",
    category: "Business",
    requiresAuth: true,
    requiresTenant: true,
    params: [],
    requestBody: JSON.stringify({ name: "Pharmacie du Centre", type: "PHARMACY", description: "Pharmacie principale" }, null, 2),
    responses: [
      { status: 201, description: "Business créé" },
      { status: 400, description: "Données invalides" },
    ],
  },
  // ── SERVICE CATALOGUE ─────────────────────────────────
  {
    id: "service-create",
    method: "POST",
    path: "/api/service-catalogue",
    summary: "Créer un service",
    description: "Ajoute un service au catalogue du tenant. Les consumers pourront ensuite créer des demandes pour ce service.",
    category: "ServiceCatalogue",
    requiresAuth: true,
    requiresTenant: true,
    params: [],
    requestBody: JSON.stringify({ name: "Consultation médicale", description: "Consultation généraliste 30min", price: 25000, currency: "XAF", providerId: "uuid" }, null, 2),
    responses: [
      { status: 201, description: "Service créé et disponible au catalogue" },
    ],
  },
  {
    id: "service-list",
    method: "GET",
    path: "/api/service-catalogue",
    summary: "Lister le catalogue",
    description: "Retourne tous les services disponibles dans le catalogue du tenant courant.",
    category: "ServiceCatalogue",
    requiresAuth: true,
    requiresTenant: true,
    params: [
      { name: "providerId", in: "query", required: false, type: "UUID", description: "Filtrer par provider" },
    ],
    responses: [{ status: 200, description: "Liste des services du catalogue" }],
  },
  // ── BUSINESS RULE ─────────────────────────────────────
  {
    id: "rule-create",
    method: "POST",
    path: "/api/business-rules",
    summary: "Créer une règle métier",
    description: "Définit une règle métier configurable pour le tenant, sans modifier le code source de la plateforme.",
    category: "BusinessRule",
    requiresAuth: true,
    requiresTenant: true,
    params: [],
    requestBody: JSON.stringify({ name: "MAX_DAILY_REQUESTS", value: "10", description: "Limite de demandes par jour par consumer", type: "INTEGER" }, null, 2),
    responses: [
      { status: 201, description: "Règle créée" },
      { status: 409, description: "Règle avec ce nom déjà existante" },
    ],
  },
];
