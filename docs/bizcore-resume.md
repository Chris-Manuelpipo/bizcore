# Résumé — Projet BizCore (3GI Semestre 2)

## Contexte

Projet académique 3ème année Génie Informatique — Semestre 2 2025-2026. Groupe de 3+. Application **Business as a Service (BaaS)** — plateforme générique de gestion des métiers basée sur l'analogie réseau émetteur/récepteur/protocole.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Backend | Spring Boot 3.5.12 · Java 21 |
| Base de données | PostgreSQL 16 · Liquibase |
| Sécurité | Spring Security · JWT (jjwt 0.12.6) |
| Documentation | SpringDoc OpenAPI 2.8.6 (Swagger) |
| Build | Maven |
| Frontend (à venir) | Next.js · React Native |
| Infra | Docker |

---

## Architecture

- **Monorepo GitHub** : `bizcore/backend/` + `bizcore/frontend/`
- **Architecture Hexagonale** avec DDD
- **Pattern** : `domain` → `repository` → `service` → `controller` → `dto`
- **Package de base** : `com.bizcore.bizcore_backend`

---

## Structure des dossiers backend

```
src/main/java/com/bizcore/bizcore_backend/
├── auth/              ← AuthController, AuthRequest, AuthResponse
├── config/            ← SecurityConfig, OpenApiConfig
├── controller/        ← Un controller par entité
├── domain/            ← Entités JPA + SupportedCurrency
├── dto/               ← PersonDTO, BusinessDTO, ActorDTO, ServiceRequestDTO
├── exception/         ← GlobalExceptionHandler, ResourceNotFoundException, ApiError
├── repository/        ← Interfaces JpaRepository
├── security/          ← JwtService, JwtAuthFilter, UserDetailsServiceImpl
└── service/           ← Logique métier

src/main/resources/
├── application.properties
└── db/changelog/
    ├── db.changelog-master.xml
    └── migrations/
        ├── 001-create-persons.xml
        ├── 002-create-businesses.xml
        ├── 003-create-actors.xml
        ├── 004-create-portfolios.xml
        ├── 005-create-business-rules.xml
        ├── 006-create-service-catalogues.xml
        ├── 007-create-resources.xml
        ├── 008-create-service-requests.xml
        ├── 009-create-invoices.xml
        ├── 010-create-users.xml
        └── 011-create-user-roles.xml
```

---

## Sprint 1 — Terminé ✅

### Entités JPA

| Entité | Relations clés |
|---|---|
| `Person` | Base de tout acteur humain |
| `Actor` | ManyToOne → Person |
| `Portfolio` | OneToOne → Actor · ManyToMany → Business |
| `Business` | Entité métier générique |
| `BusinessRule` | ManyToOne → Business |
| `ServiceCatalogue` | ManyToOne → Business |
| `Resource` | ManyToOne → Business |
| `ServiceRequest` | ManyToOne → Actor (consumer) · ManyToOne → Actor (provider) · ManyToOne → Business |
| `Invoice` | OneToOne → ServiceRequest |

### Autres réalisations

- 13 migrations Liquibase versionnées et tracées
- 16 tests unitaires Mockito + JUnit 5 — 0 échecs
- Swagger UI : `http://localhost:8080/swagger-ui/index.html`

---

## Sprint 2 — Terminé ✅

### Sécurité JWT

- Entité `AppUser` avec table `user_roles` (collection d'enums)
- 4 rôles : `USER`, `ADMIN`, `PROVIDER`, `CONSUMER`
- Un utilisateur peut avoir plusieurs rôles simultanément
- Token JWT embarque les rôles et le `fullName`

**Endpoints auth :**
```
POST /api/auth/register   ← inscription avec rôles optionnels
POST /api/auth/login      ← connexion, retourne le token JWT
PATCH /api/auth/users/{id}/roles  ← ajouter un rôle (ADMIN)
DELETE /api/auth/users/{id}/roles ← retirer un rôle (ADMIN)
```

**Exemple de token JWT décodé :**
```json
{
  "roles": ["PROVIDER", "CONSUMER"],
  "fullName": "Jean Pharmacien",
  "sub": "pharmacien@bizcore.com",
  "iat": 1774214667,
  "exp": 1774301067
}
```

### DTOs

| DTO | Entité source |
|---|---|
| `PersonDTO` | Person |
| `BusinessDTO` | Business |
| `ActorDTO` | Actor (inclut personFullName, personEmail) |
| `ServiceRequestDTO` | ServiceRequest (inclut consumerName, providerName, businessName) |

Chaque DTO expose `fromEntity()` et `toEntity()`.

### Pagination

Tous les endpoints GET principaux supportent :
```
GET /api/businesses?page=0&size=10&sortBy=name
```

Réponse paginée :
```json
{
  "content": [...],
  "totalElements": 42,
  "totalPages": 5,
  "number": 0,
  "size": 10
}
```

### Gestion des erreurs

- `GlobalExceptionHandler` avec `@RestControllerAdvice`
- `ResourceNotFoundException` personnalisée
- `ApiError` : status + message + timestamp + errors

**Format de réponse d'erreur :**
```json
{
  "status": 404,
  "message": "Business non trouvé(e) avec l'id : ...",
  "timestamp": "2026-03-22T23:00:00",
  "errors": null
}
```

### Devises supportées

Enum `SupportedCurrency` avec validation dans `ServiceCatalogueService` et `InvoiceService` :

| Code | Devise | Région |
|---|---|---|
| XAF | Franc CFA BEAC | Cameroun, Congo, Gabon... |
| XOF | Franc CFA BCEAO | Sénégal, Côte d'Ivoire... |
| NGN | Naira | Nigeria |
| KES | Shilling kenyan | Kenya |
| GHS | Cedi | Ghana |
| USD | Dollar américain | International |
| EUR | Euro | International |
| GBP | Livre sterling | Royaume-Uni |

**Endpoints devises :**
```
GET /api/currencies                  ← lister toutes les devises
GET /api/currencies/validate/{code}  ← valider une devise
```

---

## Base de données

**Configuration locale :**
```
Host     : localhost:5432
Base     : bizcore
User     : bizcore
Password : bizcore123
```

**Tables créées :**
`persons` · `businesses` · `actors` · `portfolios` · `portfolio_businesses` · `business_rules` · `service_catalogues` · `resources` · `service_requests` · `invoices` · `app_users` · `user_roles`

---

## Configuration — application.properties

```properties
spring.application.name=bizcore-backend

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/bizcore
spring.datasource.username=bizcore
spring.datasource.password=bizcore123
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.open-in-view=false

# Liquibase
spring.liquibase.enabled=true
spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.xml

# Server
server.port=8080

# Swagger
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.api-docs.path=/v3/api-docs

# Security
spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration

# JWT
jwt.secret=bizcore_secret_key_must_be_at_least_256_bits_long_for_hmac_sha
jwt.expiration=86400000
```

---

## Analogie réseau — rappel pédagogique

| Concept réseau | Concept BizCore |
|---|---|
| Émetteur (source) | `Actor` consommateur de service (CdS) |
| Récepteur (destination) | `Actor` fournisseur de service (FdS) |
| Protocole | `BusinessRule` — règles du métier |
| Message / Requête | `ServiceRequest` — demande de service |
| ACK | `Invoice` — facture = confirmation |
| Canal | API REST sécurisée JWT |
| Adresse IP | UUID de l'acteur |

---

## Workflow complet

```
1. Inscription     POST /api/auth/register   → token JWT
2. Créer Person    POST /api/persons
3. Créer Actor     POST /api/actors/person/{id}
4. Créer Portfolio POST /api/portfolios/actor/{id}
5. Ajouter métier  PATCH /api/portfolios/{id}/businesses/{id}
6. Créer service   POST /api/service-catalogues/business/{id}
7. Demande service POST /api/service-requests/consumer/{id}/provider/{id}/business/{id}
8. Fulfil          PATCH /api/service-requests/{id}/fulfill
9. Facture         POST /api/invoices/service-request/{id}
10. Paiement       PATCH /api/invoices/{id}/pay
```

---

## Sprints restants

| Sprint | Contenu | Statut |
|---|---|---|
| Sprint 3 | Frontend Next.js — PWA, i18n, offline-first | ⏳ À faire |
| Sprint 4 | Kafka · Redis · PostGIS · Démo instance Pharmacie | ⏳ À faire |
| Optionnel | Conversion devises · 2FA | 🔵 Bonus |

---

## Repo GitHub

```
https://github.com/TON_USERNAME/bizcore
```

**Branches :**
```
main    ← code stable
dev     ← intégration
feat/*  ← nouvelles fonctionnalités
fix/*   ← corrections
```
