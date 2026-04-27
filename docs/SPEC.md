# BIZCORE - Business Core as a Service

**Version** : 1.0  
**Date** : Avril 2026  
**Projet** : 3GI Semestre 2 - Projet 3

---

## 1. QU'EST-CE QUE BIZCORE ?

BizCore est une **plateforme BaaS (Business as a Service)** — un noyau métier générique, multi-tenant et configurable.

```
┌─────────────────────────────────────────────────────────────────────┐
│                          BIZCORE                                     │
│                                                                     │
│   "Une plateforme de communication pour gérer N'IMPORTE QUEL        │
│    métier, basée sur l'analogie réseau émetteur/récepteur/protocole" │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Analogie réseau appliquée

| Concept Réseau | Concept BizCore | Description |
|----------------|-----------------|-------------|
| Émetteur (source) | **Consumer (CdS)** | Acteur qui initie la demande de service |
| Récepteur (destination) | **Provider (FdS)** | Acteur qui exécute le service |
| Protocole | **BusinessRule** | Règles métier qui gouvernent les échanges |
| Message/Requête | **ServiceRequest** | Demande de service (CdS → FdS) |
| ACK / Confirmation | **Invoice** | Facture = accusé de réception du service rendu |
| Canal | **API REST** | Communication HTTP sécurisée JWT |
| Adresse IP | **UUID** | Identifiant unique de chaque entité |
| Headers IP | **Headers BizCore** | tenant_id, trace_id, actor_id, etc. |

### Pile protocolaire (5 couches)

```
┌─────────────────────────────────────────────────────────────────┐
│  5. Business Capabilities    │ Acteurs, Ressources, Workflow    │
├─────────────────────────────────────────────────────────────────┤
│  4. Context & Policy          │ Identité, Permissions, SLA       │
├─────────────────────────────────────────────────────────────────┤
│  3. Tenant & Routing          │ Résolution tenant, Discovery     │
├─────────────────────────────────────────────────────────────────┤
│  2. Transport & Messaging     │ REST, Retry, Timeout, Idempotence│
├─────────────────────────────────────────────────────────────────┤
│  1. Infrastructure            │ PostgreSQL, Cache, Observabilité │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. POUR QUI EST BIZCORE ?

### 2.1 Vous (Équipe BizCore)

Vous construisez **la plateforme** — backend + frontend de démonstration.

### 2.2 Les autres groupes (Business Core Instances)

Chaque groupe configure BizCore pour un métier spécifique :

| Instance | Groupe | Configuration |
|----------|--------|----------------|
| **Pharmacie** | Projet 2 | Métier "Pharmacie", services Pharma, rules spécifiques |
| **Bookstore** | Projet 5 | Métier "Librairie", services Livraison, rules Stock |
| **Assurance** | Projet 9 | Métier "Assurance", services Contrat, rules Sinistre |
| **Tourisme** | Projet 10 | Métier "Tourisme", services Réservation, rules Guide |

Chaque instance = **1 Tenant** différent dans la même base de données.

---

## 3. ARCHITECTURE

### 3.1 Vue d'ensemble

```
                    ┌─────────────────────────────────────────┐
                    │           INTERNET / CLIENTS            │
                    └─────────────────┬───────────────────────┘
                                      │
                    ┌─────────────────┴───────────────────────┐
                    │              FRONTEND (Next.js)           │
                    │         PWA • i18n • Offline-first       │
                    └─────────────────┬───────────────────────┘
                                      │ HTTP + JWT
                    ┌─────────────────┴───────────────────────┐
                    │             API GATEWAY                  │
                    │   (Spring Boot - BizCore Backend)        │
                    │                                         │
                    │   ┌─────────────────────────────────┐  │
                    │   │  Headers Protocolaires           │  │
                    │   │  tenant_id • trace_id • role    │  │
                    │   └─────────────────────────────────┘  │
                    │                 │                       │
                    │   ┌─────────────┴─────────────┐       │
                    │   │   Couche Multi-Tenant     │       │
                    │   │   (Isolation par tenant)  │       │
                    │   └─────────────┬─────────────┘       │
                    └─────────────────┼─────────────────────┘
                                      │
                    ┌─────────────────┴───────────────────────┐
                    │         BASE DE DONNÉES                  │
                    │           (PostgreSQL)                   │
                    │                                         │
                    │  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
                    │  │ Tenant   │ │ Tenant   │ │ Tenant   │ │
                    │  │Pharmacie │ │Bookstore │ │ Assur.   │ │
                    │  └──────────┘ └──────────┘ └──────────┘ │
                    └─────────────────────────────────────────┘
```

### 3.2 Flux d'une requête

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Client   │────▶│ Gateway  │────▶│ Tenant   │────▶│ Service  │
│          │     │ (Auth)   │     │ Filter   │     │ Métier   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                      │                │                │
                      │ JWT valide      │ Extract        │ Logique
                      │                 │ tenant_id      │ métier
                      ▼                ▼                ▼
                 ┌──────────┐     ┌──────────┐     ┌──────────┐
                 │ Response │◀────│ Response │◀────│ Response │
                 │ + Headers│     │ + Headers│     │ + Data   │
                 └──────────┘     └──────────┘     └──────────┘
```

---

## 4. FORMAT DES HEADERS PROTOCOLAIRES

### 4.1 Headers obligatoires

Toutes les requêtes doivent inclure :

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### 4.2 Headers multi-tenant

```http
X-Tenant-Id: <uuid>           # Identifiant du tenant (instance)
X-Trace-Id: <uuid>           # Identifiant de traçabilité (optionnel, auto-généré)
X-Correlation-Id: <uuid>     # ID pour corréler les appels (optionnel)
X-Locale: fr-FR              # Langue de l'utilisateur (optionnel)
```

### 4.3 Headers de réponse

```http
X-Trace-Id: <uuid>           # Retourne le trace_id utilisé
X-Tenant-Id: <uuid>          # Confirme le tenant resolu
X-Response-Time: 45ms        # Temps de traitement
```

### 4.4 Exemple de requête

```http
POST /api/service-requests/consumer/{id}/provider/{id}/business/{id}
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000
X-Trace-Id: 123e4567-e89b-12d3-a456-426614174000

{
  "serviceName": "Consultation médicale",
  "description": "RDV pour renouvellement ordonnance"
}
```

---

## 5. SPÉCIFICATION API

### 5.1 Endpoints globaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Créer un compte utilisateur |
| POST | `/api/auth/login` | Connexion, retourne JWT |
| GET | `/api/currencies` | Liste des devises supportées |
| GET | `/api/health` | Santé de l'API |

### 5.2 Gestion des Tenants

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/tenants` | Créer un nouveau tenant (instance) |
| GET | `/api/tenants` | Lister les tenants |
| GET | `/api/tenants/{id}` | Détails d'un tenant |
| PATCH | `/api/tenants/{id}` | Modifier un tenant |

**Exemple : Créer un tenant "Pharmacie"**

```bash
curl -X POST http://localhost:8080/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pharmacie Centrale",
    "domain": "pharmacie",
    "description": "Instance Pharmacie - Gestion officine"
  }'
```

**Réponse :**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Pharmacie Centrale",
  "domain": "pharmacie",
  "isActive": true,
  "createdAt": "2026-04-05T10:00:00Z"
}
```

### 5.3 Gestion des Persons

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/persons` | Créer une personne |
| GET | `/api/persons` | Lister (pagination) |
| GET | `/api/persons/{id}` | Détails |
| PUT | `/api/persons/{id}` | Modifier |
| DELETE | `/api/persons/{id}` | Supprimer (soft delete) |

**Exemple :**

```bash
curl -X POST http://localhost:8080/api/persons \
  -H "Authorization: Bearer <token>" \
  -H "X-Tenant-Id: <tenant_id>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@example.com",
    "phone": "+237612345678",
    "country": "CM"
  }'
```

### 5.4 Gestion des Actors

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/actors/person/{personId}` | Créer un acteur |
| GET | `/api/actors` | Lister (pagination, filtre par rôle) |
| GET | `/api/actors/{id}` | Détails |
| PATCH | `/api/actors/{id}` | Modifier bio, isActive |
| DELETE | `/api/actors/{id}` | Supprimer |

**Rôles d'un Actor :** `CONSUMER` ou `PROVIDER`

### 5.5 Gestion des Businesses (Métiers)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/businesses` | Créer un métier |
| GET | `/api/businesses` | Lister (pagination, filtre par domaine) |
| GET | `/api/businesses/{id}` | Détails |
| PUT | `/api/businesses/{id}` | Modifier |
| DELETE | `/api/businesses/{id}` | Supprimer |

**Exemple :**

```bash
curl -X POST http://localhost:8080/api/businesses \
  -H "Authorization: Bearer <token>" \
  -H "X-Tenant-Id: <tenant_id>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pharmacien",
    "domain": "Santé",
    "description": "Professionnel de la santé en officine",
    "neededEducation": "Diplôme Pharmacien",
    "neededTraining": "Formation continue obligatoire"
  }'
```

### 5.6 Gestion des Portfolios

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/portfolios/actor/{actorId}` | Créer portfolio |
| GET | `/api/portfolios` | Lister |
| GET | `/api/portfolios/{id}` | Détails |
| PUT | `/api/portfolios/{id}` | Modifier |
| PATCH | `/api/portfolios/{id}/businesses/{businessId}` | Ajouter métier |
| DELETE | `/api/portfolios/{id}/businesses/{businessId}` | Retirer métier |

### 5.7 Gestion des Services Catalogues

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/service-catalogues/business/{businessId}` | Créer service |
| GET | `/api/service-catalogues` | Lister |
| GET | `/api/service-catalogues/{id}` | Détails |
| PUT | `/api/service-catalogues/{id}` | Modifier |
| DELETE | `/api/service-catalogues/{id}` | Supprimer |

### 5.8 Gestion des ServiceRequests (CdS → FdS)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/service-requests/consumer/{cId}/provider/{pId}/business/{bId}` | Créer demande |
| GET | `/api/service-requests` | Lister (pagination) |
| GET | `/api/service-requests/{id}` | Détails |
| GET | `/api/service-requests/consumer/{id}` | Demandes envoyées |
| GET | `/api/service-requests/provider/{id}` | Demandes reçues |
| GET | `/api/service-requests/status/{status}` | Par statut |
| PATCH | `/api/service-requests/{id}/accept` | Accepter (→ ACCEPTED) |
| PATCH | `/api/service-requests/{id}/start` | Démarrer (→ IN_PROGRESS) |
| PATCH | `/api/service-requests/{id}/fulfill` | Accomplir (→ FULFILLED + Invoice) |
| PATCH | `/api/service-requests/{id}/cancel` | Annuler |

**Cycle de vie :**

```
PENDING ──accept──▶ ACCEPTED ──start──▶ IN_PROGRESS ──fulfill──▶ FULFILLED
    │                  │                 │                         │
    └──cancel──▶ CANCELLED        └──cancel──▶ CANCELLED
```

### 5.9 Gestion des Invoices

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/invoices/service-request/{srId}` | Créer facture |
| GET | `/api/invoices` | Lister |
| GET | `/api/invoices/{id}` | Détails |
| PATCH | `/api/invoices/{id}/pay` | Marquer payée (→ PAID) |
| PATCH | `/api/invoices/{id}/cancel` | Annuler |

**Cycle de vie :**

```
PENDING ──pay──▶ PAID
    │
    └──cancel──▶ CANCELLED
```

### 5.10 Gestion des BusinessRules

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/business-rules/business/{businessId}` | Créer règle |
| GET | `/api/business-rules` | Lister |
| GET | `/api/business-rules/{id}` | Détails |
| PUT | `/api/business-rules/{id}` | Modifier |
| DELETE | `/api/business-rules/{id}` | Supprimer |

---

## 6. EXEMPLE COMPLET DE FLUX CdS → FdS

### Scénario : Un client (Consumer) demande une consultation à une pharmacie (Provider)

```bash
# 1. Consumer crée une demande
curl -X POST http://localhost:8080/api/service-requests \
  /consumer/111/provider/222/business/333 \
  -H "Authorization: Bearer <token>" \
  -H "X-Tenant-Id: <tenant_id>" \
  -H "X-Trace-Id: abc-123" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "Consultation médicale",
    "description": "Renouvellement ordonnance hipertensión"
  }'

# Réponse : ServiceRequest au statut PENDING
```

```bash
# 2. Provider accepte la demande
curl -X PATCH http://localhost:8080/api/service-requests/{id}/accept \
  -H "Authorization: Bearer <token>" \
  -d "actorId=222"

# Réponse : statut → ACCEPTED
```

```bash
# 3. Provider démarre le travail
curl -X PATCH http://localhost:8080/api/service-requests/{id}/start \
  -H "Authorization: Bearer <token>" \
  -d "actorId=222"

# Réponse : statut → IN_PROGRESS
```

```bash
# 4. Provider accomplit le service (génère automatiquement la facture)
curl -X PATCH http://localhost:8080/api/service-requests/{id}/fulfill \
  -H "Authorization: Bearer <token>"

# Réponse : 
# - statut → FULFILLED
# - Invoice créée automatiquement
```

```bash
# 5. Consumer consulte la facture
curl http://localhost:8080/api/invoices/{invoiceId} \
  -H "Authorization: Bearer <token>"

# Réponse :
{
  "id": "...",
  "amount": 5000,
  "currency": "XAF",
  "status": "PENDING",
  "serviceRequest": {...}
}
```

```bash
# 6. Consumer marque payée
curl -X PATCH http://localhost:8080/api/invoices/{invoiceId}/pay \
  -H "Authorization: Bearer <token>"

# Réponse : statut → PAID
```

---

## 7. COMMENT UNE INSTANCE S'ENREGISTRE

### 7.1 Étape 1 : Créer un Tenant

```bash
POST /api/tenants
{
  "name": "Ma Pharmacie",
  "domain": "pharmacie"
}
```

Réponse : `{ "id": "<tenant_uuid>", ... }`

### 7.2 Étape 2 : Configurer les métadonnées (Optionnel)

```bash
# Définir le nom de l'entreprise
PATCH /api/tenants/{id}
{
  "name": "Pharmacie Centrale Yaoundé",
  "description": "Officine de quartier"
}
```

### 7.3 Étape 3 : Ajouter les Businesses (Métiers)

```bash
POST /api/businesses
{
  "name": "Pharmacien",
  "domain": "Santé"
}
```

### 7.4 Étape 4 : Ajouter les Services au Catalogue

```bash
POST /api/service-catalogues/business/{businessId}
{
  "name": "Consultation médicale",
  "description": "Consultation standard",
  "basePrice": 5000,
  "currency": "XAF"
}
```

### 7.5 Étape 5 : Les Actors utilisent la plateforme

- Créer des Persons
- Créer des Actors (CONSUMER ou PROVIDER)
- Créer des Portfolios
- Faire des ServiceRequests

---

## 8. FONCTIONNEMENT MULTI-TENANT

### 8.1 Isolation des données

```
┌─────────────────────────────────────────────────────────┐
│                   BASE DE DONNÉES                        │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ TABLE tenants                                    │   │
│  │ ┌──────────┐ ┌──────────┐ ┌──────────┐        │   │
│  │ │ Pharmacie│ │Bookstore │ │Assurance │        │   │
│  │ │ ID: ...  │ │ ID: ...  │ │ ID: ...  │        │   │
│  │ └──────────┘ └──────────┘ └──────────┘        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ TABLE actors (avec tenant_id)                   │   │
│  │ ┌────────────────┐ ┌────────────────┐          │   │
│  │ │ Actor A        │ │ Actor B        │          │   │
│  │ │ tenant:Pharmac │ │ tenant:Booksto │          │   │
│  │ └────────────────┘ └────────────────┘          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 8.2 Requête filtrée par tenant

```java
// Exemple dans un repository
@Query("SELECT a FROM Actor a WHERE a.tenant.id = :tenantId")
List<Actor> findByTenantId(UUID tenantId);
```

### 8.3 Comment le tenant est résolu

1. **Header X-Tenant-Id** (priorité haute)
2. **JWT token** (contient le tenant_id)
3. **Sous-domaine** (ex: `pharmacie.bizcore.com`)

---

## 9. FONCTIONNEMENT MULTI-FRONTEND

### 9.1 Frontend de l'équipe BizCore (vous)

```
frontend/
├── src/
│   ├── pages/           # Pages de démo
│   ├── components/      # Composants réutilisables
│   ├── services/        # Appels API
│   ├── i18n/           # Traductions (fr, en)
│   └── PWA/            # Service worker, offline
```

### 9.2 Frontend des instances (autres groupes)

```
┌─────────────────────────────────────────────────────────┐
│                    AUTRES GROUPES                        │
│                                                          │
│  Projet Pharmacie (Groupe 2)                            │
│  ├── Frontend React Native                              │
│  ├── App spécifique Pharma                              │
│  └── Appelle /api/* de BizCore                         │
│                                                          │
│  Projet Bookstore (Groupe 5)                            │
│  ├── Frontend Next.js                                   │
│  ├── App spécifique Librairie                          │
│  └── Appelle /api/* de BizCore                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 9.3 Différence entre vos frontends

| Votre Frontend (BizCore) | Frontend des Instances |
|--------------------------|----------------------|
| Démonstration de l'API | Application métier |
| Configurable pour test | Spécifique Pharma/Bookstore/etc |
| Mono-tenant (votre instance) | Multi-tenant (leurs instances) |

---

## 10. DEVISE ET SUPPORT MULTI-PAYS

### 10.1 Devises supportées

| Code | Devise | Région |
|------|--------|--------|
| XAF | Franc CFA BEAC | Cameroun, Congo, Gabon |
| XOF | Franc CFA BCEAO | Sénégal, Côte d'Ivoire |
| NGN | Naira | Nigeria |
| KES | Shilling Kenyan | Kenya |
| GHS | Cedi | Ghana |
| USD | Dollar | International |
| EUR | Euro | International |
| GBP | Livre Sterling | UK |

### 10.2 Conversion de devises (Future)

```bash
GET /api/currencies/convert?from=XAF&to=EUR&amount=10000
```

---

## 11. FONCTIONNEMENT OFFLINE (PWA)

### 11.1 Stratégie

- **Cache First** : Assets statiques
- **Network First** : API calls
- **Stale While Revalidate** : Données semi-statiques

### 11.2 Endpoints cachables

```
GET /api/businesses        # Oui (rare modification)
GET /api/service-catalogues # Oui (modifications rares)
GET /api/currencies        # Oui (quasi-statique)
POST /api/service-requests # Non (toujours online)
```

---

## 12. ÉTAT DU DÉVELOPPEMENT

| Sprint | Contenu | Status |
|--------|---------|--------|
| Sprint 1 | Entités, Repositories, Services, Migrations | ✅ Terminé |
| Sprint 2 | Auth JWT, DTOs, Pagination, Gestion erreurs | ✅ Terminé |
| Sprint 3 | Frontend Next.js, PWA, i18n, Offline-first | ⏳ En cours |
| Sprint 4 | Kafka, Redis, PostGIS, Démo Pharmacie | ⏳ À faire |

---

## 13. CONTACT API

```
Base URL : http://localhost:8080/api
Swagger UI : http://localhost:8080/swagger-ui.html
API Docs : http://localhost:8080/v3/api-docs
```

---

*Document généré pour BizCore - Business Core as a Service*
