# 📋 Documentation Technique — Business Core

> **Projet** : Business Core (Projet 3 du Semestre 2 — 3GI)  
> **Version** : 0.0.1-SNAPSHOT  
> **Dernière mise à jour** : Mars 2026  
> **Statut** : En développement

---

## 📑 Table des Matières

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Analyse de l'existant](#2-analyse-de-lexistant)
3. [Évaluation de la conformité](#3-évaluation-de-la-conformité)
4. [Niveau actuel d'avancement](#4-niveau-actuel-davancement)
5. [Roadmap — Ce qui reste à faire](#5-roadmap--ce-qui-reste-à-faire)
6. [Recommandations](#6-recommandations)
7. [Annexes](#7-annexes)

---

## 1. Vue d'ensemble du projet

### 1.1 Description

**Business Core** est une plateforme de **Gestion Générique des Métiers** implémentant le concept **BaaS (Business as a Service)**. Le projet vise à créer une infrastructure centralisée permettant de gérer, standardiser et orchestrer les différents métiers (Business) avec leurs règles métier, services, ressources et processus associés.

### 1.2 Objectifs Principaux

| Objectif | Description |
|----------|-------------|
| **BaaS** | Offrir une plateforme générique de gestion des métiers |
| **Interopérabilité** | Permettre la communication entre consommateurs et fournisseurs de services |
| **Standardisation** | Définir des règles métier transversales et configurables |
| **Modularité** | Architecture extensible pour l'ajout de nouveaux métiers |
| **Traçabilité** | Gestion complète des demandes de services et facturation |

### 1.3 Architecture Cible

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (À développer)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              BACKEND — BUSINESS CORE (Actuel)            │    │
│  │                                                          │    │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────────────┐  │    │
│  │  │  APIs    │  │ Services │  │   Domain Entities     │  │    │
│  │  │(REST)    │  │ Business  │  │   (12 entités)       │  │    │
│  │  └──────────┘  └──────────┘  └───────────────────────┘  │    │
│  │                                                          │    │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────────────┐  │    │
│  │  │ Security │  │  Data    │  │   Migrations         │  │    │
│  │  │ (JWT)    │  │ JPA/Hibernate│ (Liquibase)        │  │    │
│  │  └──────────┘  └──────────┘  └───────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                    │
├──────────────────────────────┼───────────────────────────────────┤
│                              │                                    │
│  ┌──────────┐  ┌──────────┐  │  ┌───────────────────────┐       │
│  │PostgreSQL│  │  Redis   │  │  │  Kafka (à intégrer)   │       │
│  │ (OK)     │  │(À intégr.)│  │  │  (À intégrer)         │       │
└───────────────────────────────────────────────────────────────────────┘
```

### 1.4 Stack Technique Actuel

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Framework | Spring Boot | 3.5.12 |
| Langage | Java | 21 |
| Base de données | PostgreSQL | - |
| ORM | Spring Data JPA / Hibernate | - |
| Migrations | Liquibase | - |
| Sécurité | JWT (jjwt) | 0.12.6 |
| API Documentation | SpringDoc OpenAPI | 2.8.6 |
| Build | Maven | - |
| Tests | JUnit 5 + Mockito | - |

---

## 2. Analyse de l'existant

### 2.1 Entités Métier Créées

Le domaine comprend **12 entités** principales :

| Entité | Fichier | Description | Relations |
|--------|---------|-------------|-----------|
| **Person** | [`Person.java`](src/main/java/com/bizcore/bizcore_backend/domain/Person.java) | Personne physique (contact) | 1:N → Actor |
| **Actor** | [`Actor.java`](src/main/java/com/bizcore/bizcore_backend/domain/Actor.java) | Acteur (Consommateur/Fournisseur) | N:1 → Person, 1:1 → Portfolio |
| **Business** | [`Business.java`](src/main/java/com/bizcore/bizcore_backend/domain/Business.java) | Métier (ex: Pharmacien, Avocat) | 1:N → Actor, BusinessRule, Resource, ServiceCatalogue |
| **BusinessRule** | [`BusinessRule.java`](src/main/java/com/bizcore/bizcore_backend/domain/BusinessRule.java) | Règle métier configurable | N:1 → Business |
| **Portfolio** | [`Portfolio.java`](src/main/java/com/bizcore/bizcore_backend/domain/Portfolio.java) | Portfolio d'un acteur | 1:1 → Actor, N:N → Business |
| **Resource** | [`Resource.java`](src/main/java/com/bizcore/bizcore_backend/domain/Resource.java) | Ressource associée à un métier | N:1 → Business |
| **ServiceCatalogue** | [`ServiceCatalogue.java`](src/main/java/com/bizcore/bizcore_backend/domain/ServiceCatalogue.java) | Catalogue de services proposés | N:1 → Business |
| **ServiceRequest** | [`ServiceRequest.java`](src/main/java/com/bizcore/bizcore_backend/domain/ServiceRequest.java) | Demande de service (CdS → FdS) | N:1 → Actor (consumer), Actor (provider), Business |
| **Invoice** | [`Invoice.java`](src/main/java/com/bizcore/bizcore_backend/domain/Invoice.java) | Facture pour une demande | 1:1 → ServiceRequest |
| **AppUser** | [`AppUser.java`](src/main/java/com/bizcore/bizcore_backend/domain/AppUser.java) | Utilisateur de l'application | Roles: USER, ADMIN, PROVIDER, CONSUMER |
| **SupportedCurrency** | [`SupportedCurrency.java`](src/main/java/com/bizcore/bizcore_backend/domain/SupportedCurrency.java) | Devises supportées | - |

### 2.2 Architecture Actuelle

```
📦 bizcore_backend/
├── 📂 controller/          # 10 contrôleurs REST
│   ├── ActorController.java
│   ├── BusinessController.java
│   ├── BusinessRuleController.java
│   ├── CurrencyController.java
│   ├── InvoiceController.java
│   ├── PersonController.java
│   ├── PortfolioController.java
│   ├── ResourceController.java
│   ├── ServiceCatalogueController.java
│   └── ServiceRequestController.java
│
├── 📂 service/            # 9 services métier
│   ├── ActorService.java
│   ├── BusinessService.java
│   ├── BusinessRuleService.java
│   ├── InvoiceService.java
│   ├── PersonService.java
│   ├── PortfolioService.java
│   ├── ResourceService.java
│   ├── ServiceCatalogueService.java
│   └── ServiceRequestService.java
│
├── 📂 repository/         # 10 repositories JPA
│   ├── ActorRepository.java
│   ├── AppUserRepository.java
│   ├── BusinessRepository.java
│   ├── BusinessRuleRepository.java
│   ├── InvoiceRepository.java
│   ├── PersonRepository.java
│   ├── PortfolioRepository.java
│   ├── ResourceRepository.java
│   ├── ServiceCatalogueRepository.java
│   └── ServiceRequestRepository.java
│
├── 📂 domain/             # 11 entités JPA
│   └── (cf. section 2.1)
│
├── 📂 dto/                # 4 DTOs
│   ├── ActorDTO.java
│   ├── BusinessDTO.java
│   ├── PersonDTO.java
│   └── ServiceRequestDTO.java
│
├── 📂 security/           # Sécurité JWT
│   ├── JwtAuthFilter.java
│   ├── JwtService.java
│   └── UserDetailsServiceImpl.java
│
├── 📂 auth/               # Authentification
│   ├── AuthController.java
│   ├── AuthRequest.java
│   └── AuthResponse.java
│
├── 📂 config/             # Configuration
│   ├── JwtConfig.java
│   ├── OpenApiConfig.java
│   └── SecurityConfig.java
│
├── 📂 exception/          # Gestion d'erreurs
│   ├── ApiError.java
│   ├── GlobalExceptionHandler.java
│   └── ResourceNotFoundException.java
│
└── 📂 resources/
    └── db/changelog/       # 11 migrations Liquibase
```

### 2.3 API Endpoints Disponibles

#### Authentification (`/api/auth`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Connexion (JWT) |
| PATCH | `/api/auth/users/{id}/roles` | Ajouter un rôle |
| DELETE | `/api/auth/users/{id}/roles` | Retirer un rôle |

#### Ressources Métier

| Ressource | Endpoints Principaux |
|-----------|---------------------|
| **Businesses** | GET `/api/businesses`, POST, PUT `/{id}`, DELETE, GET `/domain/{domain}`, GET `/search` |
| **Persons** | GET `/api/persons`, POST, PUT `/{id}`, DELETE, GET `/search` |
| **Actors** | GET `/api/actors`, POST, PUT `/{id}`, DELETE, GET `/role/{role}` |
| **Portfolios** | GET `/api/portfolios`, POST, PUT `/{id}`, DELETE |
| **BusinessRules** | GET `/api/business-rules`, POST, PUT `/{id}`, DELETE |
| **Resources** | GET `/api/resources`, POST, PUT `/{id}`, DELETE |
| **ServiceCatalogues** | GET `/api/service-catalogues`, POST, PUT `/{id}`, DELETE, GET `/business/{id}` |
| **ServiceRequests** | GET `/api/service-requests`, POST, PATCH `/{id}/fulfill`, PATCH `/{id}/cancel` |
| **Invoices** | GET `/api/invoices`, POST, PATCH `/{id}/pay`, PATCH `/{id}/cancel` |
| **Currencies** | GET `/api/currencies` |

### 2.4 Sécurité Implémentée

| Composant | État | Description |
|-----------|------|-------------|
| **JWT Authentication** | ✅ OK | Token JWT avec expiration (24h) |
| **Password Encoding** | ✅ OK | BCrypt avec force par défaut |
| **Role-Based Access** | ✅ OK | 4 rôles: USER, ADMIN, PROVIDER, CONSUMER |
| **Stateless Sessions** | ✅ OK | Configuration Spring Security |
| **Public Endpoints** | ✅ OK | `/api/auth/**`, `/swagger-ui/**`, `/actuator/health` |
| **Role-based Routes** | ✅ OK | `/api/admin/**` nécessite rôle ADMIN |

### 2.5 Base de Données et Migrations

| Aspect | Détail |
|--------|--------|
| **SGBD** | PostgreSQL |
| **ORM** | Spring Data JPA / Hibernate |
| **Migrations** | Liquibase (11 fichiers XML) |
| **Stratégie DDL** | `ddl-auto: none` (Liquibase contrôle) |

#### Migrations Disponibles

| Fichier | Contenu |
|---------|---------|
| 001-create-persons.xml | Table `persons` |
| 002-create-businesses.xml | Table `businesses` |
| 003-create-actors.xml | Table `actors` |
| 004-create-portfolios.xml | Table `portfolios` + `portfolio_businesses` |
| 005-create-business-rules.xml | Table `business_rules` |
| 006-create-service-catalogues.xml | Table `service_catalogues` |
| 007-create-resources.xml | Table `resources` |
| 008-create-service-requests.xml | Table `service_requests` |
| 009-create-invoices.xml | Table `invoices` |
| 010-create-users.xml | Table `app_users` |
| 011-create-user-roles.xml | Table `user_roles` |

### 2.6 Tests Unitaires

| Fichier | Couverture |
|---------|------------|
| `BusinessServiceTest.java` | ✅ Tests complets (save, findAll, delete) |
| `PersonServiceTest.java` | ⚠️ Squelette uniquement |
| `ServiceRequestServiceTest.java` | ✅ Tests complets (CRUD + fulfill + cancel) |

---

## 3. Évaluation de la Conformité

### 3.1 Tableau de Conformité

| Exigence | Status | Commentaire |
|----------|--------|-------------|
| **Spring Boot** | ✅ | Version 3.5.12 |
| **PostgreSQL** | ✅ | Configuré, migrations OK |
| **PostGIS** | ❌ | Non implémenté (géolocalisation) |
| **Kafka** | ❌ | Non configuré (messaging asynchrone) |
| **Redis** | ❌ | Non configuré (caching) |
| **Docker** | ❌ | Non créé |
| **JWT** | ✅ | Implémenté maison |
| **OAuth2** | ⚠️ | JWT maison ≠ OAuth2 complet |
| **2FA** | ❌ | Non implémenté |
| **Architecture DDD** | ⚠️ | Partiel (domaines ok, pas hexagonal) |
| **Architecture Hexagonale** | ❌ | Pas de Ports/Adapters |
| **Multi-tenant** | ❌ | Non implémenté |
| **Temps réel** | ❌ | WebSocket non configuré |
| **Frontend** | ❌ | Non commencé |

### 3.2 Légende des Status

| Symbole | Signification |
|---------|---------------|
| ✅ | Complètement implémenté |
| ⚠️ | Partiellement implémenté / En cours |
| ❌ | Non implémenté / Manquant |

### 3.3 Points Forts de l'Implémentation

- ✅ Structure de domaine cohérente avec 12 entités
- ✅ API REST complète avec documentation OpenAPI
- ✅ Sécurité JWT fonctionnelle
- ✅ Gestion des rôles et permissions
- ✅ Migrations Liquibase en place
- ✅ Gestion d'erreurs centralisée
- ✅ Tests unitaires pour les services critiques

### 3.4 Points à Améliorer

- ⚠️ Multi-tenant absent (isolation par tenant)
- ⚠️ Pas de géolocalisation (PostGIS)
- ⚠️ Architecture non hexagonale
- ❌ Pas de messaging asynchrone (Kafka)
- ❌ Pas de cache (Redis)
- ❌ Pas de Docker
- ❌ Pas de 2FA
- ❌ Pas de WebSocket (temps réel)
- ❌ Frontend non développé

---

## 4. Niveau Actuel d'Avancement

### 4.1 Avancement Global

```
██████████████████████░░░░░░░░░░░░░░░░░  50%
```

| Domaine | Avancement | Description |
|---------|------------|-------------|
| **Backend Core** | 75% | Entités, Services, API fonctionnels |
| **Sécurité & Auth** | 60% | JWT OK, 2FA manquant |
| **Infrastructure & DevOps** | 10% | Docker absent, CI/CD manquant |
| **Architecture DDD/Hexagonale** | 25% | DDD partial, Hexagonale absente |
| **Temps Réel & Multi-tenant** | 0% | Non commencé |
| **Frontend** | 0% | Non commencé |
| **Tests** | 30% | Unitaires partiels |

### 4.2 Répartition Détaillée

| Module | Fichiers | Status |
|--------|----------|--------|
| Entités Domaine | 11 | ✅ Complet |
| Repositories | 10 | ✅ Complet |
| Services | 9 | ✅ Complet |
| Controllers | 10 | ✅ Complet |
| DTOs | 4 | ⚠️ Partiel |
| Sécurité JWT | 4 | ✅ Complet |
| Configuration | 3 | ✅ Complet |
| Migrations | 11 | ✅ Complet |
| Tests Unitaires | 3 | ⚠️ Partiel |
| Tests d'Intégration | 0 | ❌ Manquant |

### 4.3 Estimation du Temps Restant

| Tâche | Complexité | Estimation |
|-------|------------|------------|
| 2FA | Moyenne | 1-2 semaines |
| PostGIS | Moyenne | 1 semaine |
| Multi-tenant | Haute | 3-4 semaines |
| Architecture Hexagonale | Haute | 4-6 semaines |
| Kafka | Moyenne | 2-3 semaines |
| Redis/Cache | Faible | 1 semaine |
| Docker/Infra | Moyenne | 1-2 semaines |
| WebSocket | Moyenne | 2 semaines |
| Frontend | Haute | 8-12 semaines |
| Tests Complets | Moyenne | 3-4 semaines |

**Total estimé** : ~6-8 mois (temps plein)

---

## 5. Roadmap — Ce qui Reste à Faire

### 5.1 Court Terme (Immédiat)

| Priorité | Tâche | Détail |
|----------|-------|--------|
| 🔴 P0 | **Docker** | Créer Dockerfile et docker-compose.yml |
| 🔴 P0 | **Configuration Production** | Variables d'environnement, profiles Spring |
| 🟠 P1 | **Multi-tenant** | Ajouter champ `tenant_id` aux entités |
| 🟠 P1 | **Tests d'Intégration** | Couverture API complète |
| 🟡 P2 | **DTOs Complets** | Mapper toutes les entités → DTOs |

### 5.2 Moyen Terme

| Priorité | Tâche | Détail |
|----------|-------|--------|
| 🟠 P1 | **Architecture Hexagonale** | Refactorer en Ports/Adapters |
| 🟠 P1 | **PostGIS** | Ajouter géolocalisation aux Business/Actors |
| 🟡 P2 | **Redis Cache** | Cache des queries fréquentes |
| 🟡 P2 | **Kafka** | Événements asynchrones (ServiceRequest) |
| 🟡 P2 | **2FA** | Authentification à deux facteurs |

### 5.3 Long Terme

| Priorité | Tâche | Détail |
|----------|-------|--------|
| 🟡 P2 | **WebSocket** | Notifications temps réel |
| 🟡 P2 | **OAuth2 Provider** | Fédération d'identités |
| 🟢 P3 | **Microservices** | Extraction des modules (optionnel) |
| 🟢 P3 | **Frontend** | Application React/Vue complète |

---

## 6. Recommandations

### 6.1 Priorités Immédiates

1. **Finaliser le Backend Core** avant d'ajouter des fonctionnalités
   - Compléter les DTOs manquants
   - Ajouter validation et documentation
   - Tests d'intégration

2. **Dockeriser l'Application**
   ```dockerfile
   # Exemple structure à créer
   FROM eclipse-temurin:21-jdk-alpine
   EXPOSE 8080
   CMD ["java", "-jar", "app.jar"]
   ```

3. **Ajouter Multi-tenant**
   - Ajouter `tenant_id` à toutes les tables
   - Configurer JPA Auditing
   - Filtrer les queries par tenant

### 6.2 Architecture Future

```
📦 Architecture Hexagonale Cible
├── 📂 domain/
│   ├── 📂 model/          # Entités pures
│   ├── 📂 port/           # Interfaces (Inbound/Outbound)
│   └── 📂 service/        # Services métier
├── 📂 application/
│   └── 📂 usecase/        # Cas d'utilisation
├── 📂 adapter/
│   ├── 📂 inbound/        # Controllers REST, WebSocket
│   └── 📂 outbound/       # Repositories, External APIs
└── 📂 config/            # Configuration
```

### 6.3 Points de Vigilance

| Point | Recommandation |
|-------|----------------|
| **Sécurité** | Renforcer JWT avec refresh tokens, audit logs |
| **Performance** | Ajouter Redis pour caching, optimiser queries |
| **Scalabilité** | Prévoir partitionnement horizontal |
| **Tests** | Atteindre 80% coverage minimum |
| **Documentation** | Garder cette DOC à jour |

### 6.4 Ressources à Explorer

- **PostGIS** : [Hibernate Spatial](https://hibernate.org/spatial/)
- **Kafka** : [Spring Kafka](https://spring.io/projects/spring-kafka)
- **Redis** : [Spring Data Redis](https://spring.io/projects/spring-data-redis)
- **Hexagonal Architecture** : [Ports & Adapters pattern](https://alistair.cockburn.us/hexagonal-architecture/)

---

## 7. Annexes

### 7.1 Variables d'Environnement

```bash
# Application
SPRING_APPLICATION_NAME=bizcore-backend
SERVER_PORT=8080

# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/bizcore
SPRING_DATASOURCE_USERNAME=bizcore
SPRING_DATASOURCE_PASSWORD=bizcore123

# JWT
JWT_SECRET=votre_secret_256_bits
JWT_EXPIRATION=86400000

# OpenAPI
SPRINGDOC_SWAGGER_UI_PATH=/swagger-ui.html
```

### 7.2 Commandes Utiles

```bash
# Build
./mvnw clean package

# Run
./mvnw spring-boot:run

# Tests
./mvnw test

# Generate Docker
docker build -t bizcore-backend .
```

### 7.3 URLs de l'Application

| Service | URL |
|---------|-----|
| API | http://localhost:8080/api |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| API Docs JSON | http://localhost:8080/v3/api-docs |
| Health Check | http://localhost:8080/actuator/health |

### 7.4 Glossaire

| Terme | Définition |
|-------|------------|
| **CdS** | Cahier des Charges (Consumer → Provider) |
| **FdS** | Feuille de Service (Provider → Consumer) |
| **Actor** | Utilisateur du système (Consommateur ou Fournisseur) |
| **Business** | Métier/Profession (ex: Pharmacien, Plombier) |
| **BusinessRule** | Règle métier associée à un Business |
| **BaaS** | Business as a Service |

---

> **Note** : Ce document est vivant et doit être mis à jour au fur et à mesure de l'avancement du projet.
