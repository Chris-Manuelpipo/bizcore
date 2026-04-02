# BizCore Backend

> API REST complète pour la gestion des services métier et des demandes de services

![Java](https://img.shields.io/badge/Java-21-blue.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.x-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-orange.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## 📋 Table des matières

- [Description](#-description)
- [Prérequis](#-prérequis)
- [Installation et démarrage rapide](#-installation-et-démarrage-rapide)
- [Architecture](#-architecture)
- [API Endpoints](#-api-endpoints)
- [Authentification JWT](#-authentification-jwt)
- [Variables d'environnement](#-variables-denvironnement)
- [Profiles Spring](#-profiles-spring)
- [Tests](#-tests)
- [Docker](#-docker)
- [Documentation API](#-documentation-api)
- [Structure du projet](#-structure-du-projet)
- [Auteurs et licence](#-auteurs-et-licence)

---

## 📝 Description

BizCore Backend est une API REST conçue pour la gestion des services métier d'une entreprise. Elle permet de :

- Gérer les **entreprises**, **personnes** et **acteurs**
- Administrer les **portfolios** et **catalogues de services**
- Créer et suivre les **demandes de services** (Service Requests)
- Définir des **règles métier** automatisées
- Gérer les **ressources** et **devises** supportées
- Générer des **factures** liées aux services rendus

L'API utilise une architecture **JWT** (JSON Web Token) pour l'authentification et l'autorisation.

---

## 🔧 Prérequis

| Outil | Version minimale | Description |
|-------|-----------------|-------------|
| **Java** | 21 | JDK requis pour la compilation et l'exécution |
| **Maven** | 3.8+ | Gestionnaire de dépendances et outil de build |
| **PostgreSQL** | 15+ | Base de données relationnelle |
| **Docker** | 20+ | (Optionnel) Conteneurisation |
| **Docker Compose** | 2.0+ | (Optionnel) Orchestration de conteneurs |

---

## 🚀 Installation et démarrage rapide

### Option 1 : Démarrage classique avec Maven

```bash
# 1. Cloner le projet
git clone https://github.com/your-org/bizcore-backend.git
cd bizcore-backend

# 2. Compiler le projet
./mvnw clean install

# 3. Configurer la base de données (voir section Variables d'environnement)
# Créer une base PostgreSQL nommée 'bizcore_db'

# 4. Démarrer l'application
./mvnw spring-boot:run
```

L'application sera accessible sur : `http://localhost:8080`

### Option 2 : Avec Docker Compose (recommandé)

```bash
# Démarrer tous les services (application + base de données)
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

### Option 3 : Build Docker standalone

```bash
# Construire l'image
docker build -t bizcore-backend .

# Exécuter le conteneur
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DATABASE_URL=jdbc:postgresql://host:5432/bizcore_db \
  -e DATABASE_USERNAME=postgres \
  -e DATABASE_PASSWORD=secret \
  bizcore-backend
```

---

## 🏗 Architecture

L'application suit une architecture **layered** (en couches) classique avec Spring Boot :

```
┌─────────────────────────────────────────────────────────────┐
│                    API REST (Controllers)                   │
│              @RestController - Points d'entrée              │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Services                               │
│              @Service - Logique métier                       │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Repositories                             │
│           @Repository - Accès aux données                   │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database                               │
│                    PostgreSQL 15+                           │
│              Liquibase (Migrations SQL)                     │
└─────────────────────────────────────────────────────────────┘
```

### Flux d'une requête

```
Client → JWT Filter → Security Config → Controller → Service → Repository → Database
         (Auth)         (Autorisation)  (REST)     (Métier)   (Data)
```

---

## 📡 API Endpoints

### 🔐 Authentification (`/api/auth`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/api/auth/register` | Inscription d'un nouvel utilisateur | Non |
| `POST` | `/api/auth/login` | Connexion et obtention du JWT | Non |

**Exemple de login :**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

### 🏢 Entreprises (`/api/businesses`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/businesses` | Liste toutes les entreprises |
| `GET` | `/api/businesses/{id}` | Récupère une entreprise par ID |
| `POST` | `/api/businesses` | Crée une nouvelle entreprise |
| `PUT` | `/api/businesses/{id}` | Met à jour une entreprise |
| `DELETE` | `/api/businesses/{id}` | Supprime une entreprise |

### 👤 Personnes (`/api/persons`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/persons` | Liste toutes les personnes |
| `GET` | `/api/persons/{id}` | Récupère une personne par ID |
| `POST` | `/api/persons` | Crée une nouvelle personne |
| `PUT` | `/api/persons/{id}` | Met à jour une personne |
| `DELETE` | `/api/persons/{id}` | Supprime une personne |

### 🎭 Acteurs (`/api/actors`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/actors` | Liste tous les acteurs |
| `GET` | `/api/actors/{id}` | Récupère un acteur par ID |
| `POST` | `/api/actors` | Crée un nouvel acteur |
| `PUT` | `/api/actors/{id}` | Met à jour un acteur |
| `DELETE` | `/api/actors/{id}` | Supprime un acteur |

### 💼 Portfolios (`/api/portfolios`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/portfolios` | Liste tous les portfolios |
| `GET` | `/api/portfolios/{id}` | Récupère un portfolio par ID |
| `POST` | `/api/portfolios` | Crée un nouveau portfolio |
| `PUT` | `/api/portfolios/{id}` | Met à jour un portfolio |
| `DELETE` | `/api/portfolios/{id}` | Supprime un portfolio |

### 📋 Règles Métier (`/api/business-rules`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/business-rules` | Liste toutes les règles |
| `GET` | `/api/business-rules/{id}` | Récupère une règle par ID |
| `POST` | `/api/business-rules` | Crée une nouvelle règle |
| `PUT` | `/api/business-rules/{id}` | Met à jour une règle |
| `DELETE` | `/api/business-rules/{id}` | Supprime une règle |

### 📦 Catalogue de Services (`/api/service-catalogues`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/service-catalogues` | Liste tous les services |
| `GET` | `/api/service-catalogues/{id}` | Récupère un service par ID |
| `POST` | `/api/service-catalogues` | Crée un nouveau service |
| `PUT` | `/api/service-catalogues/{id}` | Met à jour un service |
| `DELETE` | `/api/service-catalogues/{id}` | Supprime un service |

### 🔧 Ressources (`/api/resources`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/resources` | Liste toutes les ressources |
| `GET` | `/api/resources/{id}` | Récupère une ressource par ID |
| `POST` | `/api/resources` | Crée une nouvelle ressource |
| `PUT` | `/api/resources/{id}` | Met à jour une ressource |
| `DELETE` | `/api/resources/{id}` | Supprime une ressource |

### 📝 Demandes de Services (`/api/service-requests`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/service-requests` | Liste toutes les demandes |
| `GET` | `/api/service-requests/{id}` | Récupère une demande par ID |
| `POST` | `/api/service-requests` | Crée une nouvelle demande |
| `PUT` | `/api/service-requests/{id}` | Met à jour une demande |
| `DELETE` | `/api/service-requests/{id}` | Supprime une demande |
| `PATCH` | `/api/service-requests/{id}/submit` | Soumet la demande |
| `PATCH` | `/api/service-requests/{id}/evaluate` | Évalue la demande |
| `PATCH` | `/api/service-requests/{id}/approve` | Approuve la demande |
| `PATCH` | `/api/service-requests/{id}/reject` | Rejette la demande |
| `PATCH` | `/api/service-requests/{id}/fulfill` | Traite la demande |
| `PATCH` | `/api/service-requests/{id}/close` | Ferme la demande |

**Cycle de vie d'une Service Request :**
```
DRAFT → SUBMITTED → EVALUATING → APPROVED/REJECTED → IN_PROGRESS → COMPLETED → CLOSED
                              ↓
                         ON_HOLD
```

### 💰 Devises (`/api/currencies`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/currencies` | Liste toutes les devises |
| `GET` | `/api/currencies/{code}` | Récupère une devise par code |
| `POST` | `/api/currencies` | Ajoute une nouvelle devise |

### 🧾 Factures (`/api/invoices`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/invoices` | Liste toutes les factures |
| `GET` | `/api/invoices/{id}` | Récupère une facture par ID |
| `POST` | `/api/invoices` | Crée une nouvelle facture |
| `PUT` | `/api/invoices/{id}` | Met à jour une facture |
| `DELETE` | `/api/invoices/{id}` | Supprime une facture |

---

## 🔒 Authentification JWT

### Obtention du token

```bash
# Connexion
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

**Réponse :**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "username": "admin",
  "expiresIn": 86400
}
```

### Utilisation du token

Ajoutez le token dans l'en-tête `Authorization` de vos requêtes :

```bash
# Exemple : Liste des entreprises avec authentification
curl -X GET http://localhost:8080/api/businesses \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Format du header Authorization

```
Authorization: Bearer <votre_token_jwt>
```

---

## 🔧 Variables d'environnement

| Variable | Description | Défaut | Requis |
|----------|-------------|--------|--------|
| `SPRING_PROFILES_ACTIVE` | Profile Spring (dev/prod) | `dev` | Non |
| `DATABASE_URL` | URL de connexion JDBC | `jdbc:postgresql://localhost:5432/bizcore_db` | Oui |
| `DATABASE_USERNAME` | Nom d'utilisateur PostgreSQL | `postgres` | Oui |
| `DATABASE_PASSWORD` | Mot de passe PostgreSQL | `postgres` | Oui |
| `JWT_SECRET` | Clé secrète pour les tokens JWT | - | Oui |
| `JWT_EXPIRATION` | Durée de validité du token (ms) | `86400000` | Non |
| `SERVER_PORT` | Port du serveur | `8080` | Non |

### Exemple de configuration .env

```bash
# .env
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=jdbc:postgresql://db:5432/bizcore_db
DATABASE_USERNAME=bizcore
DATABASE_PASSWORD=secure_password_here
JWT_SECRET=votre_cle_secrete_minimum_32_caracteres
JWT_EXPIRATION=86400000
```

---

## ⚙️ Profiles Spring

### Profile `dev` (développement)

- Base de données H2 en mémoire (par défaut pour les tests)
- Logging détaillé
- Swagger UI accessible
- Données de démonstration préchargées

**Activation :**
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Profile `prod` (production)

- Base de données PostgreSQL requise
- Logging minimal
- Documentation Swagger désactivée par défaut
- Aucune donnée préchargée

**Activation :**
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod
```

---

## 🧪 Tests

### Exécuter tous les tests

```bash
./mvnw test
```

### Exécuter un test spécifique

```bash
# Tests d'un service
./mvnw test -Dtest=BusinessServiceTest

# Tests d'intégration
./mvnw verify -Dspring.profiles.active=test
```

### Couverture de code

```bash
# Générer le rapport de couverture JaCoCo
./mvnw test jacoco:report

# Le rapport est disponible dans : target/site/jacoco/index.html
```

---

## ✅ Vérification

Cette section vous permet de vérifier rapidement que le backend fonctionne correctement.

### Vérification Automatique (Script)

Le script [`verify-backend.sh`](verify-backend.sh) automatise la vérification complète :

```bash
# Rendre le script exécutable
chmod +x verify-backend.sh

# Exécuter la vérification complète
./verify-backend.sh

# Avec test de démarrage de l'application
./verify-backend.sh --with-startup-test

# Avec instructions Docker
./verify-backend.sh --with-docker-test
```

**Le script vérifie automatiquement :**
- ✅ Prérequis système (Java 21, Maven, Docker)
- ✅ Compilation Maven
- ✅ Exécution des tests (31 tests)
- ✅ Packaging de l'application
- ✅ (Optionnel) Démarrage et health check
- ✅ (Optionnel) Configuration Docker

### Vérification Rapide

```bash
# Compilation
mvn clean compile

# Tests unitaires
mvn clean test

# Démarrage rapide
mvn spring-boot:run

# Health check
curl http://localhost:8080/actuator/health
```

### Guide de Test Manuel

Pour les tests manuels complets (workflow ServiceRequest, curl commands, Docker), consultez [TESTING.md](TESTING.md).

### Checklist Rapide

```
☐ Compilation Maven réussie
☐ Tests unitaires passent (31/31)
☐ Application démarre
☐ Swagger UI accessible (http://localhost:8080/swagger-ui/index.html)
☐ Endpoint health check OK
☐ CRUD Business fonctionne
☐ CRUD Actor fonctionne
☐ Cycle de vie ServiceRequest complet
☐ Factures créées automatiquement
```

---

## 🐳 Docker

### Structure Docker Compose

```yaml
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DATABASE_URL=jdbc:postgresql://db:5432/bizcore_db
      - DATABASE_USERNAME=postgres
      - DATABASE_PASSWORD=postgres
      - JWT_SECRET=your-secret-key
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=bizcore_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### Commandes utiles

```bash
# Démarrer en arrière-plan
docker-compose up -d

# Voir les logs
docker-compose logs -f app

# Redémarrer
docker-compose restart

# Reconstruire l'image
docker-compose build --no-cache

# Supprimer tout
docker-compose down -v
```

---

## 📖 Documentation API

### Swagger UI

Une interface interactive est disponible pour explorer et tester l'API :

```
http://localhost:8080/swagger-ui.html
```

### OpenAPI JSON

Le fichier de spécification OpenAPI 3.0 est disponible :

```
http://localhost:8080/v3/api-docs
```

### Postman Collection

Une collection Postman est disponible dans le dossier `docs/` pour importer et tester les endpoints.

---

## 📁 Structure du projet

```
bizcore-backend/
├── pom.xml                                    # Configuration Maven
├── README.md                                  # Ce fichier
├── Dockerfile                                 # Image Docker
├── docker-compose.yml                         # Docker Compose
│
├── src/
│   ├── main/
│   │   ├── java/com/bizcore/bizcore_backend/
│   │   │   ├── BizcoreBackendApplication.java # Point d'entrée
│   │   │   │
│   │   │   ├── auth/                         # Authentification
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── AuthRequest.java
│   │   │   │   └── AuthResponse.java
│   │   │   │
│   │   │   ├── config/                       # Configuration
│   │   │   │   ├── SecurityConfig.java       # Sécurité Spring
│   │   │   │   ├── OpenApiConfig.java        # Swagger/OpenAPI
│   │   │   │   └── JwtConfig.java
│   │   │   │
│   │   │   ├── controller/                   # REST Controllers
│   │   │   │   ├── ActorController.java
│   │   │   │   ├── BusinessController.java
│   │   │   │   ├── BusinessRuleController.java
│   │   │   │   ├── CurrencyController.java
│   │   │   │   ├── InvoiceController.java
│   │   │   │   ├── PersonController.java
│   │   │   │   ├── PortfolioController.java
│   │   │   │   ├── ResourceController.java
│   │   │   │   ├── ServiceCatalogueController.java
│   │   │   │   └── ServiceRequestController.java
│   │   │   │
│   │   │   ├── domain/                       # Entités JPA
│   │   │   │   ├── Actor.java
│   │   │   │   ├── AppUser.java
│   │   │   │   ├── Business.java
│   │   │   │   ├── BusinessRule.java
│   │   │   │   ├── Invoice.java
│   │   │   │   ├── Person.java
│   │   │   │   ├── Portfolio.java
│   │   │   │   ├── Resource.java
│   │   │   │   ├── ServiceCatalogue.java
│   │   │   │   ├── ServiceRequest.java
│   │   │   │   └── SupportedCurrency.java
│   │   │   │
│   │   │   ├── dto/                          # Data Transfer Objects
│   │   │   │   ├── ActorDTO.java
│   │   │   │   ├── BusinessDTO.java
│   │   │   │   ├── BusinessRuleDTO.java
│   │   │   │   ├── FulfillResponseDTO.java
│   │   │   │   ├── InvoiceDTO.java
│   │   │   │   ├── PersonDTO.java
│   │   │   │   ├── PortfolioDTO.java
│   │   │   │   ├── ResourceDTO.java
│   │   │   │   ├── ServiceCatalogueDTO.java
│   │   │   │   ├── ServiceRequestDTO.java
│   │   │   │   └── SupportedCurrencyDTO.java
│   │   │   │
│   │   │   ├── exception/                    # Gestion des erreurs
│   │   │   │   ├── ApiError.java
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   └── ResourceNotFoundException.java
│   │   │   │
│   │   │   ├── repository/                   # Repositories JPA
│   │   │   │   ├── ActorRepository.java
│   │   │   │   ├── AppUserRepository.java
│   │   │   │   ├── BusinessRepository.java
│   │   │   │   ├── BusinessRuleRepository.java
│   │   │   │   ├── InvoiceRepository.java
│   │   │   │   ├── PersonRepository.java
│   │   │   │   ├── PortfolioRepository.java
│   │   │   │   ├── ResourceRepository.java
│   │   │   │   ├── ServiceCatalogueRepository.java
│   │   │   │   └── ServiceRequestRepository.java
│   │   │   │
│   │   │   ├── security/                     # Sécurité JWT
│   │   │   │   ├── JwtAuthFilter.java
│   │   │   │   ├── JwtService.java
│   │   │   │   └── UserDetailsServiceImpl.java
│   │   │   │
│   │   │   └── service/                      # Logique métier
│   │   │       ├── ActorService.java
│   │   │       ├── BusinessRuleService.java
│   │   │       ├── BusinessService.java
│   │   │       ├── InvoiceService.java
│   │   │       ├── PersonService.java
│   │   │       ├── PortfolioService.java
│   │   │       ├── ResourceService.java
│   │   │       ├── ServiceCatalogueService.java
│   │   │       └── ServiceRequestService.java
│   │   │
│   │   └── resources/
│   │       ├── application.properties         # Configuration
│   │       ├── application-dev.yml            # Dev profile
│   │       ├── application-prod.yml           # Prod profile
│   │       └── db/changelog/                  # Migrations Liquibase
│   │           ├── db.changelog-master.xml
│   │           └── migrations/
│   │               ├── 001-create-persons.xml
│   │               ├── 002-create-businesses.xml
│   │               ├── 003-create-actors.xml
│   │               ├── 004-create-portfolios.xml
│   │               ├── 005-create-business-rules.xml
│   │               ├── 006-create-service-catalogues.xml
│   │               ├── 007-create-resources.xml
│   │               ├── 008-create-service-requests.xml
│   │               ├── 009-create-invoices.xml
│   │               ├── 010-create-users.xml
│   │               └── 011-create-user-roles.xml
│   │
│   └── test/
│       └── java/com/bizcore/bizcore_backend/
│           ├── BizcoreBackendApplicationTests.java
│           └── service/
│               ├── BusinessServiceTest.java
│               ├── PersonServiceTest.java
│               └── ServiceRequestServiceTest.java
│
└── docs/                                      # Documentation technique
    ├── CAHIER_DES_CHARGES.md
    ├── DIAGRAMMES_UML.md
    ├── MCD.md
    ├── MLD.md
    ├── MODELISATION_MATHEMATIQUE.md
    └── README_DOCUMENTATION.md
```

---

## 👥 Auteurs et licence

### Auteurs

- **Chris Manuel** - Développeur principal

### Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

<p align="center">
  <strong>BizCore Backend</strong> - Construisez vos services métier avec confiance
</p>
