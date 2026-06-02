import { writeFileSync } from "fs";

const API_BASE = "http://localhost:8080";

const CATEGORIES = [
  "Auth", "Tenant", "User", "Actor", "Business", "ServiceCatalogue",
  "ServiceRequest", "Invoice", "BusinessRule", "Portfolio", "Media",
  "Resource", "Message", "Notification", "Audit", "Analytics", "Currency",
];

const endpoints = [
  { method: "POST", path: "/api/auth/register", tags: ["Auth"], summary: "Enregistrer un nouvel utilisateur", desc: "Crée un compte utilisateur et retourne immédiatement un token JWT.", reqBody: { email: "user@example.com", password: "secret123", firstName: "Jean", lastName: "Dupont" }, auth: false },
  { method: "POST", path: "/api/auth/login", tags: ["Auth"], summary: "Authentification", desc: "Authentifie un utilisateur et retourne un token JWT.", reqBody: { email: "user@example.com", password: "secret123" }, auth: false },
  { method: "PATCH", path: "/api/auth/users/{id}/roles", tags: ["Auth"], summary: "Ajouter un rôle", desc: "Ajoute un rôle à un utilisateur.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }, { name: "role", in: "query", schema: { type: "string", enum: ["USER", "ADMIN"] } }], auth: true },
  { method: "DELETE", path: "/api/auth/users/{id}/roles", tags: ["Auth"], summary: "Retirer un rôle", desc: "Retire un rôle d'un utilisateur.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }, { name: "role", in: "query", schema: { type: "string", enum: ["USER", "ADMIN"] } }], auth: true },
  { method: "GET", path: "/api/tenants", tags: ["Tenant"], summary: "Lister les tenants", desc: "Liste des tenants actifs.", auth: true },
  { method: "POST", path: "/api/tenants/register", tags: ["Tenant"], summary: "Créer un tenant", desc: "Crée un espace tenant isolé (public).", reqBody: { name: "Pharmacie Centrale", domain: "pharmacie-centrale" }, auth: false },
  { method: "GET", path: "/api/tenants/{id}", tags: ["Tenant"], summary: "Récupérer un tenant", desc: "Retourne un tenant par son UUID.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "PUT", path: "/api/tenants/{id}", tags: ["Tenant"], summary: "Mettre à jour un tenant", desc: "Met à jour un tenant.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], reqBody: { name: "Pharmacie", domain: "pharmacie", isActive: true }, auth: true },
  { method: "DELETE", path: "/api/tenants/{id}", tags: ["Tenant"], summary: "Désactiver un tenant", desc: "Désactive (soft delete) un tenant.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/users", tags: ["User"], summary: "Lister les utilisateurs", desc: "Liste paginée des utilisateurs.", params: [{ name: "page", in: "query", schema: { type: "integer" } }, { name: "size", in: "query", schema: { type: "integer" } }], auth: true },
  { method: "GET", path: "/api/users/{id}", tags: ["User"], summary: "Récupérer un utilisateur", desc: "Retourne un utilisateur par son UUID.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/users/email/{email}", tags: ["User"], summary: "Utilisateur par email", desc: "Retourne un utilisateur par email.", params: [{ name: "email", in: "path", schema: { type: "string", format: "email" } }], auth: true },
  { method: "GET", path: "/api/actors", tags: ["Actor"], summary: "Lister les acteurs", desc: "Liste paginée des acteurs.", params: [{ name: "page", in: "query", schema: { type: "integer" } }, { name: "size", in: "query", schema: { type: "integer" } }], auth: true },
  { method: "GET", path: "/api/actors/{id}", tags: ["Actor"], summary: "Récupérer un acteur", desc: "Retourne un acteur par UUID.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/actors/user/{userId}", tags: ["Actor"], summary: "Acteurs d'un utilisateur", desc: "Acteurs associés à un utilisateur.", params: [{ name: "userId", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/actors/role/{role}", tags: ["Actor"], summary: "Acteurs par rôle", desc: "Acteurs par rôle (PROVIDER/CONSUMER).", params: [{ name: "role", in: "path", schema: { type: "string" } }], auth: true },
  { method: "POST", path: "/api/actors/user/{userId}", tags: ["Actor"], summary: "Créer un acteur", desc: "Crée un acteur associé à un utilisateur.", params: [{ name: "userId", in: "path", schema: { type: "string", format: "uuid" } }], reqBody: { role: "PROVIDER" }, auth: true },
  { method: "DELETE", path: "/api/actors/{id}", tags: ["Actor"], summary: "Supprimer un acteur", desc: "Supprime un acteur.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/businesses", tags: ["Business"], summary: "Lister les entreprises", desc: "Liste paginée des businesses.", params: [{ name: "page", in: "query", schema: { type: "integer" } }, { name: "size", in: "query", schema: { type: "integer" } }, { name: "sortBy", in: "query", schema: { type: "string" } }], auth: true },
  { method: "GET", path: "/api/businesses/{id}", tags: ["Business"], summary: "Récupérer une entreprise", desc: "Retourne un business par UUID.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/businesses/domain/{domain}", tags: ["Business"], summary: "Entreprises par domaine", desc: "Businesses d'un domaine.", params: [{ name: "domain", in: "path", schema: { type: "string" } }], auth: true },
  { method: "GET", path: "/api/businesses/search", tags: ["Business"], summary: "Rechercher une entreprise", desc: "Recherche par nom.", params: [{ name: "name", in: "query", schema: { type: "string" } }], auth: true },
  { method: "POST", path: "/api/businesses", tags: ["Business"], summary: "Créer une entreprise", desc: "Crée un business.", reqBody: { name: "Pharmacie", domain: "Santé" }, auth: true },
  { method: "PUT", path: "/api/businesses/{id}", tags: ["Business"], summary: "Mettre à jour", desc: "Met à jour un business.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], reqBody: { name: "Pharmacie", domain: "Santé" }, auth: true },
  { method: "DELETE", path: "/api/businesses/{id}", tags: ["Business"], summary: "Supprimer", desc: "Supprime un business.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/service-catalogues", tags: ["ServiceCatalogue"], summary: "Lister le catalogue", desc: "Tous les services.", auth: true },
  { method: "GET", path: "/api/service-catalogues/{id}", tags: ["ServiceCatalogue"], summary: "Récupérer un service", desc: "Service par UUID.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/service-catalogues/business/{businessId}", tags: ["ServiceCatalogue"], summary: "Services d'un business", desc: "Services d'une entreprise.", params: [{ name: "businessId", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/service-catalogues/available", tags: ["ServiceCatalogue"], summary: "Services disponibles", desc: "Services marqués disponibles.", auth: true },
  { method: "GET", path: "/api/service-catalogues/search", tags: ["ServiceCatalogue"], summary: "Rechercher un service", desc: "Recherche par nom.", params: [{ name: "name", in: "query", schema: { type: "string" } }], auth: true },
  { method: "POST", path: "/api/service-catalogues/business/{businessId}", tags: ["ServiceCatalogue"], summary: "Créer un service", desc: "Ajoute un service au catalogue.", params: [{ name: "businessId", in: "path", schema: { type: "string", format: "uuid" } }], reqBody: { name: "Consultation", basePrice: 25000, currency: "XAF" }, auth: true },
  { method: "PUT", path: "/api/service-catalogues/{id}", tags: ["ServiceCatalogue"], summary: "Mettre à jour un service", desc: "Met à jour un service.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], reqBody: { name: "Consultation", basePrice: 30000 }, auth: true },
  { method: "DELETE", path: "/api/service-catalogues/{id}", tags: ["ServiceCatalogue"], summary: "Supprimer", desc: "Supprime un service.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/service-requests", tags: ["ServiceRequest"], summary: "Lister les demandes", desc: "Liste paginée des demandes.", params: [{ name: "page", in: "query", schema: { type: "integer" } }, { name: "size", in: "query", schema: { type: "integer" } }], auth: true },
  { method: "GET", path: "/api/service-requests/{id}", tags: ["ServiceRequest"], summary: "Récupérer une demande", desc: "Demande par UUID.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/service-requests/consumer/{consumerId}", tags: ["ServiceRequest"], summary: "Demandes d'un consumer", desc: "Demandes d'un acteur CONSUMER.", params: [{ name: "consumerId", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/service-requests/provider/{providerId}", tags: ["ServiceRequest"], summary: "Demandes d'un provider", desc: "Demandes d'un acteur PROVIDER.", params: [{ name: "providerId", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/service-requests/status/{status}", tags: ["ServiceRequest"], summary: "Demandes par statut", desc: "Filtre par statut (PENDING, ACCEPTED, etc.).", params: [{ name: "status", in: "path", schema: { type: "string" } }], auth: true },
  { method: "POST", path: "/api/service-requests/consumer/{consumerId}/provider/{providerId}/catalogue/{serviceCatalogueId}", tags: ["ServiceRequest"], summary: "Créer une demande", desc: "Crée une demande de service.", params: [{ name: "consumerId", in: "path", schema: { type: "string", format: "uuid" } }, { name: "providerId", in: "path", schema: { type: "string", format: "uuid" } }, { name: "serviceCatalogueId", in: "path", schema: { type: "string", format: "uuid" } }], reqBody: { serviceName: "Consultation" }, auth: true },
  { method: "PATCH", path: "/api/service-requests/{id}/accept", tags: ["ServiceRequest"], summary: "Accepter une demande", desc: "PENDING → ACCEPTED.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "PATCH", path: "/api/service-requests/{id}/start", tags: ["ServiceRequest"], summary: "Démarrer", desc: "ACCEPTED → IN_PROGRESS.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "PATCH", path: "/api/service-requests/{id}/fulfill", tags: ["ServiceRequest"], summary: "Accomplir", desc: "→ FULFILLED. Facture générée.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "PATCH", path: "/api/service-requests/{id}/cancel", tags: ["ServiceRequest"], summary: "Annuler", desc: "Annule une demande.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "DELETE", path: "/api/service-requests/{id}", tags: ["ServiceRequest"], summary: "Supprimer", desc: "Supprime une demande.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/invoices", tags: ["Invoice"], summary: "Lister les factures", desc: "Toutes les factures du tenant.", auth: true },
  { method: "GET", path: "/api/invoices/{id}", tags: ["Invoice"], summary: "Récupérer une facture", desc: "Facture par UUID.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/invoices/status/{status}", tags: ["Invoice"], summary: "Factures par statut", desc: "Filtre par statut (PENDING, PAID, CANCELLED).", params: [{ name: "status", in: "path", schema: { type: "string" } }], auth: true },
  { method: "GET", path: "/api/invoices/service-request/{serviceRequestId}", tags: ["Invoice"], summary: "Facture d'une demande", desc: "Facture liée à une demande.", params: [{ name: "serviceRequestId", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "POST", path: "/api/invoices/service-request/{serviceRequestId}", tags: ["Invoice"], summary: "Créer une facture", desc: "Crée une facture pour une demande.", params: [{ name: "serviceRequestId", in: "path", schema: { type: "string", format: "uuid" } }], reqBody: { amount: 25000, currency: "XAF" }, auth: true },
  { method: "PATCH", path: "/api/invoices/{id}/pay", tags: ["Invoice"], summary: "Payer", desc: "PENDING → PAID.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "PATCH", path: "/api/invoices/{id}/cancel", tags: ["Invoice"], summary: "Annuler une facture", desc: "Annule une facture.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "DELETE", path: "/api/invoices/{id}", tags: ["Invoice"], summary: "Supprimer", desc: "Supprime une facture.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/business-rules", tags: ["BusinessRule"], summary: "Lister les règles", desc: "Toutes les règles métier.", auth: true },
  { method: "GET", path: "/api/business-rules/{id}", tags: ["BusinessRule"], summary: "Récupérer une règle", desc: "Règle par UUID.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/business-rules/business/{businessId}", tags: ["BusinessRule"], summary: "Règles d'un business", desc: "Règles d'une entreprise.", params: [{ name: "businessId", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "POST", path: "/api/business-rules/business/{businessId}", tags: ["BusinessRule"], summary: "Créer une règle", desc: "Définit une règle métier.", params: [{ name: "businessId", in: "path", schema: { type: "string", format: "uuid" } }], reqBody: { ruleKey: "MAX_DAILY", ruleValue: "10" }, auth: true },
  { method: "PUT", path: "/api/business-rules/{id}", tags: ["BusinessRule"], summary: "Mettre à jour", desc: "Met à jour une règle.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], reqBody: { ruleKey: "MAX_DAILY", ruleValue: "20" }, auth: true },
  { method: "DELETE", path: "/api/business-rules/{id}", tags: ["BusinessRule"], summary: "Supprimer", desc: "Supprime une règle.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/portfolios", tags: ["Portfolio"], summary: "Lister les portfolios", desc: "Tous les portfolios.", auth: true },
  { method: "GET", path: "/api/portfolios/{id}", tags: ["Portfolio"], summary: "Récupérer un portfolio", desc: "Portfolio par UUID.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/portfolios/actor/{actorId}", tags: ["Portfolio"], summary: "Portfolio d'un acteur", desc: "Portfolio par acteur.", params: [{ name: "actorId", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "POST", path: "/api/portfolios/actor/{actorId}", tags: ["Portfolio"], summary: "Créer un portfolio", desc: "Crée un portfolio.", params: [{ name: "actorId", in: "path", schema: { type: "string", format: "uuid" } }], reqBody: { title: "Mon portfolio" }, auth: true },
  { method: "PATCH", path: "/api/portfolios/{portfolioId}/businesses/{businessId}", tags: ["Portfolio"], summary: "Ajouter un business", desc: "Rattache un business.", params: [{ name: "portfolioId", in: "path", schema: { type: "string", format: "uuid" } }, { name: "businessId", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "DELETE", path: "/api/portfolios/{portfolioId}/businesses/{businessId}", tags: ["Portfolio"], summary: "Retirer un business", desc: "Détache un business.", params: [{ name: "portfolioId", in: "path", schema: { type: "string", format: "uuid" } }, { name: "businessId", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "DELETE", path: "/api/portfolios/{id}", tags: ["Portfolio"], summary: "Supprimer", desc: "Supprime un portfolio.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/media", tags: ["Media"], summary: "Lister les médias", desc: "Tous les médias.", auth: true },
  { method: "GET", path: "/api/media/{id}", tags: ["Media"], summary: "Récupérer un média", desc: "Média par UUID.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/media/business/{businessId}", tags: ["Media"], summary: "Médias d'un business", desc: "Médias d'une entreprise.", params: [{ name: "businessId", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/media/type/{type}", tags: ["Media"], summary: "Médias par type", desc: "Filtre par type (IMAGE, VIDEO...).", params: [{ name: "type", in: "path", schema: { type: "string" } }], auth: true },
  { method: "POST", path: "/api/media/business/{businessId}", tags: ["Media"], summary: "Ajouter un média", desc: "Ajoute un média.", params: [{ name: "businessId", in: "path", schema: { type: "string", format: "uuid" } }], reqBody: { name: "Logo", url: "https://...", type: "IMAGE" }, auth: true },
  { method: "PUT", path: "/api/media/{id}", tags: ["Media"], summary: "Mettre à jour", desc: "Met à jour un média.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], reqBody: { name: "Logo", type: "IMAGE" }, auth: true },
  { method: "DELETE", path: "/api/media/{id}", tags: ["Media"], summary: "Supprimer", desc: "Supprime un média.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/resources", tags: ["Resource"], summary: "Lister les ressources", desc: "Toutes les ressources.", auth: true },
  { method: "GET", path: "/api/resources/{id}", tags: ["Resource"], summary: "Récupérer une ressource", desc: "Ressource par UUID.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/resources/business/{businessId}", tags: ["Resource"], summary: "Ressources d'un business", desc: "Ressources d'une entreprise.", params: [{ name: "businessId", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "POST", path: "/api/resources/business/{businessId}", tags: ["Resource"], summary: "Créer une ressource", desc: "Ajoute une ressource.", params: [{ name: "businessId", in: "path", schema: { type: "string", format: "uuid" } }], reqBody: { name: "Salle", type: "ROOM" }, auth: true },
  { method: "PUT", path: "/api/resources/{id}", tags: ["Resource"], summary: "Mettre à jour", desc: "Met à jour une ressource.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], reqBody: { name: "Salle", quantityAvailable: 5 }, auth: true },
  { method: "DELETE", path: "/api/resources/{id}", tags: ["Resource"], summary: "Supprimer", desc: "Supprime une ressource.", params: [{ name: "id", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/service-requests/{requestId}/messages", tags: ["Message"], summary: "Messages d'une demande", desc: "Messages échangés (paginés).", params: [{ name: "requestId", in: "path", schema: { type: "string", format: "uuid" } }, { name: "page", in: "query", schema: { type: "integer" } }, { name: "size", in: "query", schema: { type: "integer" } }], auth: true },
  { method: "GET", path: "/api/service-requests/{requestId}/messages/unread-count", tags: ["Message"], summary: "Messages non lus", desc: "Compte les messages non lus.", params: [{ name: "requestId", in: "path", schema: { type: "string", format: "uuid" } }, { name: "actorId", in: "query", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "POST", path: "/api/service-requests/{requestId}/messages", tags: ["Message"], summary: "Envoyer un message", desc: "Envoie un message texte.", params: [{ name: "requestId", in: "path", schema: { type: "string", format: "uuid" } }, { name: "actorId", in: "query", schema: { type: "string", format: "uuid" } }], reqBody: "Bonjour, votre commande est prête.", auth: true },
  { method: "PATCH", path: "/api/service-requests/{requestId}/messages/read-all", tags: ["Message"], summary: "Marquer tout lu", desc: "Marque tous les messages comme lus.", params: [{ name: "requestId", in: "path", schema: { type: "string", format: "uuid" } }, { name: "actorId", in: "query", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "DELETE", path: "/api/service-requests/{requestId}/messages/{messageId}", tags: ["Message"], summary: "Supprimer un message", desc: "Supprime un message.", params: [{ name: "requestId", in: "path", schema: { type: "string", format: "uuid" } }, { name: "messageId", in: "path", schema: { type: "string", format: "uuid" } }, { name: "actorId", in: "query", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/notifications", tags: ["Notification"], summary: "Mes notifications", desc: "Notifications de l'utilisateur (paginées).", params: [{ name: "page", in: "query", schema: { type: "integer" } }, { name: "size", in: "query", schema: { type: "integer" } }], auth: true },
  { method: "GET", path: "/api/notifications/unread-count", tags: ["Notification"], summary: "Non lues", desc: "Compte les notifications non lues.", auth: true },
  { method: "PATCH", path: "/api/notifications/{notificationId}/read", tags: ["Notification"], summary: "Marquer lue", desc: "Marque une notification comme lue.", params: [{ name: "notificationId", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "PATCH", path: "/api/notifications/read-all", tags: ["Notification"], summary: "Tout marquer lu", desc: "Marque tout comme lu.", auth: true },
  { method: "DELETE", path: "/api/notifications/{notificationId}", tags: ["Notification"], summary: "Supprimer", desc: "Supprime une notification.", params: [{ name: "notificationId", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/audit/service-requests/{serviceRequestId}", tags: ["Audit"], summary: "Audit d'une demande", desc: "Événements d'audit d'une demande.", params: [{ name: "serviceRequestId", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/audit/actors/{actorId}", tags: ["Audit"], summary: "Audit d'un acteur", desc: "Événements d'audit d'un acteur.", params: [{ name: "actorId", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/audit/trace/{traceId}", tags: ["Audit"], summary: "Audit par traceId", desc: "Événements d'audit corrélés.", params: [{ name: "traceId", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/audit/tenants/{tenantId}", tags: ["Audit"], summary: "Audit d'un tenant", desc: "Événements d'audit d'un tenant.", params: [{ name: "tenantId", in: "path", schema: { type: "string", format: "uuid" } }], auth: true },
  { method: "GET", path: "/api/analytics/tenants/{tenantId}/kpis", tags: ["Analytics"], summary: "KPIs d'un tenant", desc: "Indicateurs clés sur une période.", params: [{ name: "tenantId", in: "path", schema: { type: "string", format: "uuid" } }, { name: "from", in: "query", schema: { type: "string", format: "date-time" } }, { name: "to", in: "query", schema: { type: "string", format: "date-time" } }], auth: true },
  { method: "GET", path: "/api/currencies", tags: ["Currency"], summary: "Lister les devises", desc: "Devises supportées.", auth: true },
  { method: "GET", path: "/api/currencies/validate/{code}", tags: ["Currency"], summary: "Valider une devise", desc: "Vérifie si un code devise est supporté.", params: [{ name: "code", in: "path", schema: { type: "string" } }], auth: true },
  { method: "GET", path: "/actuator/health", tags: ["Tenant"], summary: "Health check", desc: "Vérifie l'état de l'API.", auth: false },
];

// --- Generate YAML ---

const indent = (n, s) => " ".repeat(n * 2) + s;

let yaml = `openapi: 3.0.3
info:
  title: BizCore API
  description: "Business as a Service — API générique de gestion des métiers"
  version: "1.0.0"
  contact:
    name: BizCore Team
    email: support@bizcore.com
servers:
  - url: http://localhost:8080
    description: Serveur de développement local
  - url: https://api.bizcore.com
    description: Serveur de production
security:
  - bearerAuth: []
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token obtenu via POST /api/auth/login
tags:
`;

for (const cat of CATEGORIES) {
  yaml += `  - name: "${cat}"\n`;
}

yaml += `paths:\n`;

const grouped = {};
for (const ep of endpoints) {
  if (!grouped[ep.path]) grouped[ep.path] = {};
  grouped[ep.path][ep.method.toLowerCase()] = ep;
}

for (const [path, methods] of Object.entries(grouped)) {
  yaml += `  "${path}":\n`;
  for (const [method, ep] of Object.entries(methods)) {
    yaml += `    ${method}:\n`;
    yaml += `      tags: [${ep.tags.map(t => `"${t}"`).join(", ")}]\n`;
    yaml += `      summary: "${ep.summary}"\n`;
    yaml += `      description: "${ep.desc}"\n`;
    if (!ep.auth) {
      yaml += `      security: []\n`;
    }
    if (ep.params?.length) {
      yaml += `      parameters:\n`;
      for (const p of ep.params) {
        yaml += `        - name: ${p.name}\n`;
        yaml += `          in: ${p.in}\n`;
        yaml += `          required: ${p.in === "path" ? "true" : "false"}\n`;
        yaml += `          schema:\n`;
        for (const [k, v] of Object.entries(p.schema)) {
          yaml += `            ${k}: "${v}"\n`;
        }
      }
    }
    if (ep.reqBody) {
      yaml += `      requestBody:\n`;
      yaml += `        required: true\n`;
      yaml += `        content:\n`;
      yaml += `          application/json:\n`;
      if (typeof ep.reqBody === "string") {
        yaml += `            example: "${ep.reqBody}"\n`;
      } else {
        yaml += `            example: ${JSON.stringify(ep.reqBody, null, 12)}\n`;
        // fix indentation for the example
        const raw = JSON.stringify(ep.reqBody, null, 2);
        const lines = raw.split("\n");
        yaml = yaml.slice(0, -1); // remove the trailing newline from the JSON.stringify
        yaml += lines.map((l, i) => i === 0 ? l : `${" ".repeat(14)}${l}`).join("\n") + "\n";
      }
    }
    yaml += `      responses:\n`;
    yaml += `        "200":\n`;
    yaml += `          description: Succès\n`;
    yaml += `        "400":\n`;
    yaml += `          description: Erreur de validation\n`;
    if (ep.auth) {
      yaml += `        "401":\n`;
      yaml += `          description: Token absent ou invalide\n`;
    }
  }
}

writeFileSync("public/openapi.yaml", yaml, "utf-8");
console.log("✓ openapi.yaml generated —", endpoints.length, "endpoints");
