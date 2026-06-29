# BizCore — BCaaS Platform

**Business Core as a Service** — Plateforme multi-tenant qui modélise les interactions métier sous forme de protocoles réseau.

- **Backend** : Spring Boot 3.5 (Java 21), PostgreSQL, Redis
- **Frontend** : Next.js 16, React 19, Tailwind CSS
- **API** : RESTful, JSON, clés API `bcs_live_…`

## Architecture

```
Émetteur (Consumer) → Requête → Récepteur (Provider)
                                      ↓
                                 Business Rules (protocole)
                                      ↓
                                 Invoice (ACK automatique)
```

## Workflow ServiceRequest

```
PENDING → ACCEPTED → IN_PROGRESS → FULFILLED → PAID
                                              ↓
                                        Invoice créée
```

## Walkthrough Postman

### 1. Inscription via le frontend

Ouvre le frontend → inscription → token JWT portail.

### 2. Générer une clé API (crée aussi un tenant)

```
POST /api/developer/api-keys
Authorization: Bearer <token_portail>
```

```json
{
  "name": "Ma clé Postman",
  "tenantName": "Pharmacie Centrale",
  "tenantDomain": "sante",
  "tenantDescription": "Instance de test"
}
```

> ⚠️ Copie immédiatement le `secretKey` — affiché une seule fois.

### 3. Créer un utilisateur métier

```
POST /api/auth/register
X-Api-Key: bcs_live_xxxxx...
```

```json
{
  "email": "marie@pharmacie.cm",
  "password": "secret123",
  "firstName": "Marie",
  "lastName": "Curie",
  "tenantId": "<tenant_id>"
}
```

Récupère son ID : `GET /api/users/email/marie@pharmacie.cm`

### 4. Créer un acteur PROVIDER

```
POST /api/actors/user/<USER_ID>
X-Api-Key: bcs_live_xxxxx...
```

```json
{ "role": "PROVIDER", "bio": "Pharmacien titulaire" }
```

### 5. Créer un second utilisateur + acteur CONSUMER

Idem étape 3 avec `paul@client.cm`, puis :

```
POST /api/actors/user/<USER_ID_PAUL>
```

```json
{ "role": "CONSUMER", "bio": "Client régulier" }
```

### 6. Créer un business

```
POST /api/businesses
```

```json
{
  "name": "Officine du Centre",
  "domain": "Santé",
  "description": "Pharmacie principale",
  "neededEducation": "Doctorat en pharmacie",
  "tenantId": "<tenant_id>"
}
```

### 7. Ajouter un service au catalogue

```
POST /api/service-catalogues/business/<BUSINESS_ID>
```

```json
{
  "name": "Consultation médicale",
  "description": "Consultation 30 minutes",
  "basePrice": 25000,
  "currency": "XAF",
  "isAvailable": true
}
```

### 8. Créer une demande de service

```
POST /api/service-requests/consumer/<CONSUMER_ID>/provider/<PROVIDER_ID>/catalogue/<CATALOGUE_ID>
```

```json
{
  "serviceName": "Consultation urgente",
  "description": "Douleur thoracique"
}
```

Statut : **PENDING**

### 9. Transitions d'état

| Action | Method | URL | Statut |
|---|---|---|---|
| Accepter | PATCH | `/api/service-requests/<SR_ID>/accept` | ACCEPTED |
| Démarrer | PATCH | `/api/service-requests/<SR_ID>/start` | IN_PROGRESS |
| Accomplir | PATCH | `/api/service-requests/<SR_ID>/fulfill` | FULFILLED |
| Payer | PATCH | `/api/invoices/<INVOICE_ID>/pay` | PAID |

## Documentation

- **Swagger UI** : `https://bizcore-api.onrender.com/swagger-ui.html`
- **Base API** : `https://bizcore-api.onrender.com`

## Démarrage

```bash
# Backend
cd backend
./mvnw spring-boot:run

# Frontend
cd frontend
npm install
npm run dev
```
