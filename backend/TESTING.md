# Guide de Test Manuel - BizCore Backend

Ce guide vous permet de vérifier manuellement que toutes les fonctionnalités du backend fonctionnent correctement.

## Table des Matières

1. [Vérification Rapide (5 minutes)](#vérification-rapide-5-minutes)
2. [Test du Workflow ServiceRequest Complet](#test-du-workflow-servicerequest-complet)
3. [Commandes curl pour Tests Manuels](#commandes-curl-pour-tests-manuels)
4. [Test avec Docker](#test-avec-docker)
5. [Dépannage](#dépannage)

---

## Vérification Rapide (5 minutes)

### Checklist de Validation

```
☐ Compilation Maven réussie
☐ Tests unitaires passent (31/31)
☐ Application démarre
☐ Swagger UI accessible
☐ Endpoint health check OK
☐ Authentification JWT fonctionne
☐ CRUD Business fonctionne
☐ CRUD Actor fonctionne
☐ CRUD ServiceRequest fonctionne
```

### Commandes Rapides

```bash
# 1. Compilation
mvn clean compile

# 2. Tests
mvn test

# 3. Démarrage
mvn spring-boot:run

# 4. Vérification santé (dans un autre terminal)
curl http://localhost:8080/actuator/health
```

### Points de Vérification

| Élément | Attendu | Commande de Test |
|---------|---------|------------------|
| Health | `{"status":"UP"}` | `curl localhost:8080/actuator/health` |
| Swagger | Page HTML | `curl localhost:8080/swagger-ui/index.html` |
| API Docs | JSON | `curl localhost:8080/v3/api-docs` |

---

## Test du Workflow ServiceRequest Complet

Ce test valide le cycle de vie complet d'une demande de service.

### Prérequis

- Application démarrée (`mvn spring-boot:run`)
- Base de données initialisée
- Accès à Swagger UI: http://localhost:8080/swagger-ui/index.html

### Étapes du Workflow

#### Étape 1: Inscription et Connexion

```bash
# Inscription utilisateur
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Connexion (récupérer le token)
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

**Note:** Sauvegardez le token JWT retourné pour les requêtes suivantes.

#### Étape 2: Créer un Business

```bash
curl -X POST http://localhost:8080/api/businesses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -d '{
    "name": "Ma Société Test",
    "description": "Société pour tester le workflow complet",
    "address": "123 Rue de Test, 75001 Paris",
    "phone": "+33123456789",
    "email": "contact@test.com",
    "currencyCode": "EUR"
  }'
```

**✓ Vérification:** Réponse 201 Created avec l'ID du business créé.

#### Étape 3: Créer un Consumer (Actor)

```bash
curl -X POST http://localhost:8080/api/businesses/{BUSINESS_ID}/actors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -d '{
    "type": "CONSUMER",
    "personId": 1,
    "businessRole": "CLIENT_PREMIUM",
    "isActive": true
  }'
```

**✓ Vérification:** Réponse 201 Created avec l'ID de l'actor Consumer.

#### Étape 4: Créer un Provider (Actor)

```bash
curl -X POST http://localhost:8080/api/businesses/{BUSINESS_ID}/actors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -d '{
    "type": "PROVIDER",
    "personId": 2,
    "businessRole": "FOURNISSEUR",
    "isActive": true
  }'
```

**✓ Vérification:** Réponse 201 Created avec l'ID de l'actor Provider.

#### Étape 5: Créer une ServiceCatalogue (Service)

```bash
curl -X POST http://localhost:8080/api/businesses/{BUSINESS_ID}/catalogues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -d '{
    "name": "Consultation Technique",
    "description": "Consultation de 2 heures avec un expert technique",
    "category": "CONSULTATION",
    "basePrice": 150.00,
    "currencyCode": "EUR",
    "estimatedDurationMinutes": 120,
    "isActive": true
  }'
```

**✓ Vérification:** Réponse 201 Created avec l'ID du catalogue.

#### Étape 6: Créer une ServiceRequest

```bash
curl -X POST http://localhost:8080/api/businesses/{BUSINESS_ID}/service-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -d '{
    "catalogueId": {CATALOGUE_ID},
    "consumerId": {CONSUMER_ID},
    "title": "Demande de Consultation",
    "description": "J\'ai besoin d\'une consultation technique pour mon projet",
    "quantity": 1,
    "desiredDate": "2026-04-01T10:00:00"
  }'
```

**✓ Vérification:** 
- Réponse 201 Created
- Status initial: `CREATED`
- Récupérer le `requestId`

#### Étape 7: Accepter la Demande (Provider)

```bash
curl -X POST "http://localhost:8080/api/service-requests/{REQUEST_ID}/accept" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -d '{
    "providerId": {PROVIDER_ID},
    "proposedPrice": 140.00,
    "comment": "Je suis disponible pour cette consultation"
  }'
```

**✓ Vérification:** 
- Status changé en: `PENDING_ACCEPTANCE`
- Provider assigné

#### Étape 8: Confirmer la Demande (Consumer)

```bash
curl -X POST "http://localhost:8080/api/service-requests/{REQUEST_ID}/confirm" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -d '{
    "consumerId": {CONSUMER_ID}
  }'
```

**✓ Vérification:** Status changé en: `IN_PROGRESS`

#### Étape 9: Démarrer le Service

```bash
curl -X POST "http://localhost:8080/api/service-requests/{REQUEST_ID}/start" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -d '{
    "providerId": {PROVIDER_ID}
  }'
```

**✓ Vérification:** 
- Status changé en: `IN_PROGRESS`
- `startedAt` défini

#### Étape 10: Finaliser le Service (Fulfill)

```bash
curl -X POST "http://localhost:8080/api/service-requests/{REQUEST_ID}/fulfill" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -d '{
    "providerId": {PROVIDER_ID},
    "actualPrice": 140.00,
    "notes": "Consultation terminée avec succès"
  }'
```

**✓ Vérification:** 
- Status changé en: `FULFILLED`
- **Invoice créée automatiquement**
- Réponse inclut `invoiceId`

#### Étape 11: Vérifier la Facture Créée

```bash
curl -X GET "http://localhost:8080/api/invoices/{INVOICE_ID}" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

**✓ Vérification:**
```json
{
  "id": 1,
  "invoiceNumber": "INV-2026-001",
  "amount": 140.00,
  "currencyCode": "EUR",
  "status": "PENDING",
  "serviceRequestId": {REQUEST_ID},
  "consumerId": {CONSUMER_ID},
  "providerId": {PROVIDER_ID},
  "createdAt": "2026-03-24T...",
  "dueDate": "2026-04-07T..."
}
```

---

## Commandes curl pour Tests Manuels

### Authentification

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","email":"user1@test.com","password":"pass123","firstName":"John","lastName":"Doe"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"pass123"}'

# Get profile (requires auth)
curl http://localhost:8080/api/auth/me -H "Authorization: Bearer TOKEN"
```

### Business Operations

```bash
# Create business
curl -X POST http://localhost:8080/api/businesses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"TestCorp","description":"Test Company","address":"123 Test St","phone":"+123","email":"test@test.com","currencyCode":"USD"}'

# Get all businesses
curl http://localhost:8080/api/businesses -H "Authorization: Bearer TOKEN"

# Get business by ID
curl http://localhost:8080/api/businesses/1 -H "Authorization: Bearer TOKEN"

# Update business
curl -X PUT http://localhost:8080/api/businesses/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"UpdatedCorp","description":"Updated","address":"456 New St","phone":"+456","email":"new@test.com","currencyCode":"EUR"}'
```

### Actor Operations

```bash
# Create actor
curl -X POST http://localhost:8080/api/businesses/1/actors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"type":"CONSUMER","personId":1,"businessRole":"CLIENT","isActive":true}'

# Get all actors for business
curl http://localhost:8080/api/businesses/1/actors -H "Authorization: Bearer TOKEN"

# Get actor by ID
curl http://localhost:8080/api/businesses/1/actors/1 -H "Authorization: Bearer TOKEN"

# Update actor
curl -X PUT http://localhost:8080/api/businesses/1/actors/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"type":"PROVIDER","personId":1,"businessRole":"SUPPLIER","isActive":true}'
```

### ServiceCatalogue Operations

```bash
# Create catalogue
curl -X POST http://localhost:8080/api/businesses/1/catalogues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"Consulting","description":"Consulting Service","category":"CONSULTATION","basePrice":100,"currencyCode":"EUR","estimatedDurationMinutes":60,"isActive":true}'

# Get all catalogues
curl http://localhost:8080/api/businesses/1/catalogues -H "Authorization: Bearer TOKEN"

# Get catalogue by ID
curl http://localhost:8080/api/businesses/1/catalogues/1 -H "Authorization: Bearer TOKEN"
```

### ServiceRequest Operations

```bash
# Create service request
curl -X POST http://localhost:8080/api/businesses/1/service-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"catalogueId":1,"consumerId":1,"title":"Test Request","description":"Description","quantity":1}'

# Get all service requests
curl http://localhost:8080/api/service-requests -H "Authorization: Bearer TOKEN"

# Get service request by ID
curl http://localhost:8080/api/service-requests/1 -H "Authorization: Bearer TOKEN"

# Accept request
curl -X POST http://localhost:8080/api/service-requests/1/accept \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"providerId":2,"proposedPrice":90}'

# Confirm request
curl -X POST http://localhost:8080/api/service-requests/1/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"consumerId":1}'

# Start request
curl -X POST http://localhost:8080/api/service-requests/1/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"providerId":2}'

# Fulfill request
curl -X POST http://localhost:8080/api/service-requests/1/fulfill \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"providerId":2,"actualPrice":90,"notes":"Done"}'

# Cancel request
curl -X POST http://localhost:8080/api/service-requests/1/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"reason":"Cancelled by user"}'
```

### Invoice Operations

```bash
# Get all invoices
curl http://localhost:8080/api/invoices -H "Authorization: Bearer TOKEN"

# Get invoice by ID
curl http://localhost:8080/api/invoices/1 -H "Authorization: Bearer TOKEN"

# Get invoices by service request
curl http://localhost:8080/api/service-requests/1/invoices -H "Authorization: Bearer TOKEN"

# Update invoice status
curl -X PUT http://localhost:8080/api/invoices/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"status":"PAID"}'
```

### Portfolio Operations

```bash
# Create portfolio
curl -X POST http://localhost:8080/api/businesses/1/portfolios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"My Portfolio","description":"Portfolio Description","actorId":1}'

# Get all portfolios
curl http://localhost:8080/api/businesses/1/portfolios -H "Authorization: Bearer TOKEN"

# Get portfolio by ID
curl http://localhost:8080/api/businesses/1/portfolios/1 -H "Authorization: Bearer TOKEN"
```

### Resource Operations

```bash
# Create resource
curl -X POST http://localhost:8080/api/businesses/1/resources \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"Test Resource","type":"EQUIPMENT","quantity":10,"unit":"UNITS"}'

# Get all resources
curl http://localhost:8080/api/businesses/1/resources -H "Authorization: Bearer TOKEN"
```

### BusinessRule Operations

```bash
# Create business rule
curl -X POST http://localhost:8080/api/businesses/1/rules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"Max Discount","ruleExpression":"discount <= 0.5","description":"Max 50% discount"}'

# Get all rules
curl http://localhost:8080/api/businesses/1/rules -H "Authorization: Bearer TOKEN"
```

---

## Test avec Docker

### Validation de la Configuration

```bash
# Vérifier la syntaxe docker-compose.yml
docker-compose config

# Lister les services
docker-compose ps
```

### Démarrage Complet

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f app
docker-compose logs -f db

# Vérifier le statut
docker-compose ps
```

### Test des Endpoints dans Docker

```bash
# Health check
docker-compose exec app curl http://localhost:8080/actuator/health

# Swagger UI (via le navigateur)
# http://localhost:8080/swagger-ui/index.html

# Test API
docker-compose exec app curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Arrêt et Nettoyage

```bash
# Arrêter les services
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v

# Arrêter et supprimer tout (y compris images)
docker-compose down --rmi all
```

---

## Dépannage

### Problèmes Courants

#### L'application ne démarre pas

```bash
# Vérifier les logs
tail -f target/app.log

# Vérifier le port
lsof -i :8080

# Vérifier la configuration
cat src/main/resources/application-dev.yml
```

#### Erreur de connexion à la base de données

```bash
# Vérifier que PostgreSQL est démarré
docker-compose ps db

# Vérifier les logs de la base
docker-compose logs db

# Tester la connexion
docker-compose exec db psql -U bizcore -d bizcore
```

#### Tests qui échouent

```bash
# Exécuter un test spécifique
mvn test -Dtest=ServiceRequestServiceTest

# Mode debug
mvn test -X

# Voir les logs de test
mvn test 2>&1 | tail -100
```

#### JWT Token invalide

```bash
# Vérifier la configuration JWT
grep -r "jwt" src/main/resources/

# Vérifier l'expiration du token
# Le token expire après 24h par défaut
```

#### CORS errors

```bash
# Vérifier la configuration CORS
grep -A 20 "cors" src/main/java/com/bizcore/bizcore_backend/config/SecurityConfig.java
```

### Commandes Utiles

```bash
# Nettoyer et recompiler
mvn clean compile

# Réinstaller les dépendances
mvn dependency:resolve

# Voir la version de Java
java -version

# Voir la version de Maven
mvn -version

# Forcer le rechargement du profil
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Obtenir de l'Aide

1. **Swagger UI**: http://localhost:8080/swagger-ui/index.html
2. **API Docs**: http://localhost:8080/v3/api-docs
3. **Actuator**: http://localhost:8080/actuator

---

## Checklist Finale

Après avoir complété tous les tests, vérifiez:

```
☐ Tous les tests unitaires passent
☐ L'application démarre sans erreur
☐ Le health check retourne UP
☐ Swagger UI est accessible
☐ L'authentification JWT fonctionne
☐ CRUD pour toutes les entités fonctionne
☐ Le workflow ServiceRequest est complet
☐ Les factures sont créées automatiquement
☐ Docker compose fonctionne
☐ Aucune erreur dans les logs
```

---

*Dernière mise à jour: Mars 2026*
