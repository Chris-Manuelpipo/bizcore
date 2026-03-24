# DOCUMENTATION DE CONCEPTION - BIZCORE

## 📋 Vue d'Ensemble

### Présentation du Projet

**BizCore** est une plateforme de **Gestion Générique des Métiers** implémentant le concept **BaaS (Business as a Service)**. Développée dans un contexte économique africain en pleine transformation digitale, cette infrastructure centralisée permet de gérer, standardiser et orchestrer différents métiers avec leurs règles métier, services, ressources et processus associés.

Le projet répond à la problématique de la gestion décentralisée et non standardisée des activités professionnelles, où chaque métier utilise des outils disparates sans interopérabilité ni traçabilité des échanges.

### Objectifs Principaux

| Objectif | Description | Priorité |
|----------|-------------|----------|
| **Standardisation** | Définir un cadre commun pour tous les métiers | P0 |
| **Interopérabilité** | Permettre la communication fluide entre consommateurs et fournisseurs | P0 |
| **Traçabilité** | Gérer le cycle de vie complet des demandes de services | P0 |
| **Scalabilité** | Architecture extensible pour l'ajout de nouveaux métiers | P1 |
| **Sécurité** | Protection des données et authentification robuste | P0 |

### Architecture de la Documentation

La documentation de conception de BizCore est structurée en 5 documents complémentaires, chacun répondant à une phase spécifique du processus de conception :

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DOCUMENTATION DE CONCEPTION BIZCORE                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐      │
│  │   CAHIER DES    │───→│   MODÉLISATION  │───→│      MCD        │      │
│  │    CHARGES      │    │   MATHÉMATIQUE  │    │  (Conceptuel)   │      │
│  │                 │    │                 │    │                 │      │
│  │ • Besoins métier│    │ • Formalisation │    │ • Entités       │      │
│  │ • Exigences     │    │ • Contraintes   │    │ • Associations  │      │
│  │ • Périmètre     │    │ • Cardinalités  │    │ • Dictionnaire  │      │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘      │
│           │                                           │                  │
│           ↓                                           ↓                  │
│  ┌─────────────────┐                         ┌─────────────────┐        │
│  │  DIAGRAMMES UML │←───────────────────────→│      MLD        │        │
│  │                 │    (Validation visuelle)│  (Logique)      │        │
│  │ • Cas d'usage   │                         │                 │        │
│  │ • Classes       │                         │ • Tables SQL    │        │
│  │ • Séquences     │                         │ • Contraintes   │        │
│  │ • États         │                         │ • Index         │        │
│  └─────────────────┘                         └─────────────────┘        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Guide des Documents

### 1. Cahier des Charges

**Fichier** : [`CAHIER_DES_CHARGES.md`](CAHIER_DES_CHARGES.md)

**Contenu** : Document fondamental définissant l'ensemble des exigences fonctionnelles et non-fonctionnelles du projet. Il présente le contexte, la problématique, les besoins des utilisateurs et le périmètre du projet.

**Sections clés** :
- **Présentation du projet** : Contexte économique africain et justification de BizCore
- **Problématique** : Problèmes identifiés (fragmentation, absence de standardisation, difficulté de mise en relation)
- **Analyse des besoins** : Besoins des Consommateurs, Prestataires et Administrateurs
- **Spécifications fonctionnelles** : Cas d'utilisation détaillés
- **Spécifications techniques** : Stack technique et contraintes
- **Périmètre** : Éléments inclus et hors scope

**Quand le consulter ?** : Pour comprendre le "pourquoi" du projet et les besoins métier fondamentaux.

---

### 2. Modélisation Mathématique

**Fichier** : [`MODELISATION_MATHEMATIQUE.md`](MODELISATION_MATHEMATIQUE.md)

**Contenu** : Formalisation mathématique rigoureuse du système BizCore utilisant la théorie des ensembles, les relations et les contraintes mathématiques pour définir précisément les entités et leurs interactions.

**Sections clés** :
- **Définition des ensembles** : P (Personnes), A (Acteurs), B (Businesses), S (Services), etc.
- **Décomposition des Acteurs** : A = A_consumer ∪ A_provider
- **Attributs formels** : Définition mathématique de chaque entité
- **Variables de décision** : Variables binaires de matching et de sélection
- **Fonction objectif** : Maximisation des transactions réussies
- **Contraintes mathématiques** : Unicité, auto-référencement, intégrité référentielle

**Quand le consulter ?** : Pour comprendre la logique formelle et les contraintes strictes du système.

---

### 3. Modèle Conceptuel de Données (MCD)

**Fichier** : [`MCD.md`](MCD.md)

**Contenu** : Représentation Merise du système d'information identifiant les entités métier, leurs attributs, les associations et les cardinalités. Sert de fondement pour la conception de la base de données.

**Sections clés** :
- **Dictionnaire de données** : Définition complète des 11 entités avec attributs et contraintes
- **Types de données** : UUID, VARCHAR, TEXT, DECIMAL, BOOLEAN, TIMESTAMP, ENUM
- **Contraintes d'intégrité** : PK, FK, NOT NULL, UNIQUE, CHECK, DEFAULT
- **Diagramme MCD** : Représentation graphique Merise des entités et associations
- **Cardinalités** : Relations 1:1, 1:N, N:M entre entités

**Quand le consulter ?** : Pour comprendre la structure informationnelle et les relations métier.

---

### 4. Modèle Logique de Données (MLD)

**Fichier** : [`MLD.md`](MLD.md)

**Contenu** : Transformation du MCD en structure relationnelle PostgreSQL. Définit les tables, colonnes, types de données, clés étrangères et index pour l'implémentation physique.

**Sections clés** :
- **Règles de transformation** : Entité → Table, Association → Clé étrangère ou table de jointure
- **Diagramme MLD** : Schéma ER complet avec types PostgreSQL
- **Schéma des tables** : Définition détaillée des 11 tables
- **Contraintes référentielles** : Intégrité référentielle entre tables
- **Index recommandés** : Optimisation des performances
- **Mapping JPA** : Correspondance avec les entités Java

**Quand le consulter ?** : Pour l'implémentation de la base de données et la configuration JPA/Hibernate.

---

### 5. Diagrammes UML

**Fichier** : [`DIAGRAMMES_UML.md`](DIAGRAMMES_UML.md)

**Contenu** : Ensemble des diagrammes UML pour la modélisation visuelle du système. Fournit une vue dynamique et structurelle du comportement du système.

**Sections clés** :
- **Diagramme de cas d'utilisation** : 37 cas d'utilisation répartis entre 4 acteurs (Guest, Consumer, Provider, Admin)
- **Diagramme de classes** : Structure complète des classes du domaine avec attributs et méthodes
- **Diagrammes de séquence** : Flux d'exécution des processus clés (création de demande, facturation, etc.)
- **Diagramme d'états** : Cycle de vie des entités (ServiceRequest, Invoice)
- **Diagramme de composants** : Architecture technique du backend

**Quand le consulter ?** : Pour la conception orientée objet, les interactions système et la validation visuelle.

---

## 🔄 Flux de Conception

### Du Besoin à l'Implémentation

Le processus de conception suit une progression logique des besoins métier vers l'implémentation technique :

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FLUX DE CONCEPTION BIZCORE                            │
└─────────────────────────────────────────────────────────────────────────────┘

PHASE 1 : EXPRESSION DU BESOIN
┌──────────────────────────────────────┐
│     CAHIER DES CHARGES               │
│                                      │
│  • Contexte économique africain      │
│  • Problèmes identifiés              │
│  • Besoins des parties prenantes     │
│  • Périmètre fonctionnel             │
└──────────────┬───────────────────────┘
               │
               ▼
PHASE 2 : FORMALISATION
┌──────────────────────────────────────┐
│   MODÉLISATION MATHÉMATIQUE          │
│                                      │
│  • Définition formelle des ensembles │
│  • Cardinalités mathématiques        │
│  • Contraintes d'intégrité           │
│  • Fonction objectif                 │
└──────────────┬───────────────────────┘
               │
               ▼
PHASE 3 : CONCEPTION CONCEPTUELLE
┌──────────────────────────────────────┐
│            MCD                       │
│                                      │
│  • 11 entités métier identifiées     │
│  • Dictionnaire de données complet   │
│  • Associations et cardinalités      │
│  • Contraintes métier                │
└──────────────┬───────────────────────┘
               │
               ▼
PHASE 4 : CONCEPTION LOGIQUE
┌──────────────────────────────────────┐
│            MLD                       │
│                                      │
│  • Schéma PostgreSQL complet         │
│  • Tables et colonnes définies       │
│  • Clés étrangères et contraintes    │
│  • Index pour optimisation           │
└──────────────┬───────────────────────┘
               │
               ▼
PHASE 5 : IMPLÉMENTATION
┌──────────────────────────────────────┐
│         CODE SOURCE                  │
│                                      │
│  • Entités Java JPA                  │
│  • Repositories Spring Data          │
│  • Services métier                   │
│  • Controllers REST                  │
│  • Migrations Liquibase              │
└──────────────────────────────────────┘

                              ▲
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌───────────────────────┐               ┌───────────────────────┐
│   DIAGRAMMES UML      │◄─────────────►│   VALIDATION & TESTS  │
│                       │   (Itératif)  │                       │
│  • Validation visuelle│               │  • Tests unitaires    │
│  • Conception OO      │               │  • Tests d'intégration│
│  • Documentation dev  │               │  • Revue de code      │
└───────────────────────┘               └───────────────────────┘
```

### Relations entre Documents

| De | Vers | Nature de la relation |
|----|------|----------------------|
| Cahier des Charges | Modélisation Mathématique | Les besoins fonctionnels sont formalisés mathématiquement |
| Modélisation Mathématique | MCD | Les ensembles deviennent des entités, les relations deviennent des associations |
| MCD | MLD | Les entités deviennent des tables, les associations deviennent des FK ou tables de jointure |
| MLD | Code Source | Les tables sont implémentées en entités JPA avec migrations Liquibase |
| Diagrammes UML | Tous | Fournit une vue visuelle pour valider et documenter chaque phase |

---

## 📊 Résumé des Éléments Clés

### Entités Métier (11 entités)

| Entité | Description | Cardinalités principales |
|--------|-------------|-------------------------|
| **Person** | Identité physique | 1:N avec Actor |
| **Actor** | Rôle Consumer/Provider | 1:1 avec Portfolio, N:1 avec Person |
| **Business** | Métier/Activité professionnelle | 1:N avec Actor, BusinessRule, Resource, ServiceCatalogue |
| **Portfolio** | Portfolio professionnel d'un acteur | 1:1 avec Actor, N:M avec Business |
| **BusinessRule** | Règle métier configurable | N:1 avec Business |
| **Resource** | Ressource matérielle ou immatérielle | N:1 avec Business |
| **ServiceCatalogue** | Service proposé dans un métier | N:1 avec Business |
| **ServiceRequest** | Demande de service CdS → FdS | N:1 avec Actor (consumer), Actor (provider), Business |
| **Invoice** | Facture associée à une demande | 1:1 avec ServiceRequest |
| **AppUser** | Utilisateur de l'application | 1:N avec UserRoles |
| **SupportedCurrency** | Devise supportée par le système | Référentiel |

### Processus Métier Principaux

#### 1. Demande de Service

```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  PENDING │────→│ ACCEPTED │────→│IN_PROGRESS│────→│ FULFILLED │────→│ INVOICED │
└─────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                │                │
     │                │                │                │
     ▼                ▼                ▼                ▼
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│CANCELLED│     │CANCELLED │     │CANCELLED │     │CANCELLED │
└─────────┘     └──────────┘     └──────────┘     └──────────┘
```

**Déclencheur** : Un Consumer crée une demande de service
**Acteurs** : Consumer (initiateur), Provider (exécutant)
**Résultat** : Génération automatique d'une Invoice au statut FULFILLED

#### 2. Facturation Automatique

| Étape | Description | Condition |
|-------|-------------|-----------|
| 1 | Création de l'Invoice | ServiceRequest.status = FULFILLED |
| 2 | Calcul du montant | Basé sur ServiceCatalogue.basePrice |
| 3 | Émission | Invoice.status = PENDING |
| 4 | Paiement | Invoice.status = PAID, paidAt = now() |

#### 3. Gestion de Portfolio

Un Actor (principalement Provider) gère son Portfolio contenant :
- Un titre et une description
- Une liste de Businesses maîtrisés (relation N:M)
- Association unique 1:1 avec l'Actor

### Contraintes Critiques

| Contrainte | Type | Description |
|------------|------|-------------|
| Unicité des emails | UNIQUE | `Person.email` et `AppUser.email` doivent être uniques |
| Un seul Portfolio par Actor | 1:1 | `Portfolio.actor_id` possède une contrainte UNIQUE |
| Une seule Invoice par ServiceRequest | 1:1 | `Invoice.service_request_id` possède une contrainte UNIQUE |
| Auto-référencement interdit | CHECK | `ServiceRequest.consumer_id ≠ ServiceRequest.provider_id` |
| Clés étrangères obligatoires | NOT NULL | Toutes les relations principales sont obligatoires |
| Intégrité référentielle | FK | Suppression en cascade configurée sur les relations appropriées |

### Architecture Technique

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
│                    (React/Vue - À développer)                    │
├─────────────────────────────────────────────────────────────────┤
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    BACKEND SPRING BOOT                   │    │
│  │                                                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │    │
│  │  │ Controllers  │  │   Services   │  │ Repositories │   │    │
│  │  │    REST      │  │   Métier     │  │   JPA        │   │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │    │
│  │                                                         │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │    │
│  │  │    JWT       │  │    DTOs      │  │  Exception   │   │    │
│  │  │   Security   │  │  Validation  │  │   Handler    │   │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
├───────────────────────────┼──────────────────────────────────────┤
│                           ▼                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  PostgreSQL  │  │  Liquibase   │  │    Redis     │           │
│  │   (Données)  │  │ (Migrations) │  │  (Cache OK)  │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Prochaines Étapes

### Développement Backend

- [ ] Implémenter les endpoints de recherche avancée (filtres multi-critères)
- [ ] Ajouter la pagination sur toutes les listes
- [ ] Implémenter la validation métier avancée (règles de cohérence)
- [ ] Ajouter les tests d'intégration complets
- [ ] Configurer la sécurité avancée (RBAC, rate limiting)
- [ ] Intégrer Redis pour le cache et les sessions
- [ ] Ajouter la documentation OpenAPI complète
- [ ] Implémenter le système de notifications

### Développement Frontend

- [ ] Créer les maquettes UI/UX (Figma)
- [ ] Développer les composants React/Vue réutilisables
- [ ] Implémenter l'authentification JWT côté client
- [ ] Créer les tableaux de bord Consumer et Provider
- [ ] Développer le workflow de demande de service
- [ ] Intégrer l'API REST avec gestion d'erreurs
- [ ] Implémenter le responsive design
- [ ] Ajouter les tests E2E (Cypress/Playwright)

### DevOps & Déploiement

- [ ] Configurer CI/CD (GitHub Actions/GitLab CI)
- [ ] Containeriser avec Docker
- [ ] Préparer l'environnement de production (Cloud)
- [ ] Configurer PostgreSQL en haute disponibilité
- [ ] Mettre en place le monitoring (Prometheus/Grafana)
- [ ] Configurer les logs centralisés (ELK)
- [ ] Mettre en place les sauvegardes automatiques
- [ ] Effectuer les tests de charge

### Évolutions Futures (Hors scope actuel)

- [ ] Géolocalisation avancée (PostGIS)
- [ ] Messagerie temps réel (WebSocket)
- [ ] Paiement en ligne intégré (Mobile Money, Carte)
- [ ] Application mobile native (React Native/Flutter)
- [ ] Intelligence artificielle prédictive (recommandations)
- [ ] Système de notation et avis
- [ ] Tableau de bord analytique avancé

---

## 📚 Ressources Complémentaires

### Liens Utiles

| Ressource | Description | Chemin |
|-----------|-------------|--------|
| **Documentation Technique** | Documentation existante du projet | [`../DOCUMENTATION.MD`](../DOCUMENTATION.MD) |
| **Code Source** | Implémentation Java Spring Boot | [`../src/`](../src/) |
| **Entités Domaine** | Classes Java du modèle | [`../src/main/java/com/bizcore/bizcore_backend/domain/`](../src/main/java/com/bizcore/bizcore_backend/domain/) |
| **Controllers API** | Endpoints REST | [`../src/main/java/com/bizcore/bizcore_backend/controller/`](../src/main/java/com/bizcore/bizcore_backend/controller/) |
| **Services Métier** | Logique métier | [`../src/main/java/com/bizcore/bizcore_backend/service/`](../src/main/java/com/bizcore/bizcore_backend/service/) |
| **Migrations BDD** | Scripts Liquibase | [`../src/main/resources/db/changelog/`](../src/main/resources/db/changelog/) |
| **Tests** | Tests unitaires et d'intégration | [`../src/test/`](../src/test/) |
| **Configuration** | Fichiers de configuration | [`../src/main/resources/`](../src/main/resources/) |

### Stack Technique

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

### Glossaire

| Terme | Définition |
|-------|------------|
| **BaaS** | Business as a Service - Concept de plateforme générique de gestion des métiers |
| **CdS** | Consommateur de Service - Acteur demandeur de services |
| **FdS** | Fournisseur de Service - Acteur prestataire de services |
| **MCD** | Modèle Conceptuel de Données - Représentation des entités et associations |
| **MLD** | Modèle Logique de Données - Schéma relationnel de la base de données |
| **MPD** | Modèle Physique de Données - Implémentation physique de la BDD |
| **Merise** | Méthode de modélisation de systèmes d'information |
| **JPA** | Java Persistence API - API de persistance Java |
| **JWT** | JSON Web Token - Token signé pour l'authentification |
| **DTO** | Data Transfer Object - Objet de transfert de données |
| **Liquibase** | Outil de gestion des migrations de base de données |
| **UUID** | Universally Unique Identifier - Identifiant unique universel |

---

## 📞 Contact et Contribution

### Équipe de Développement

Ce projet est développé dans le cadre du **Projet 3 du Semestre 2 — 3GI**.

### Standards de Code

- **Java** : Convention Oracle/Java standard
- **Base de données** : snake_case pour les tables et colonnes
- **Git** : Convention de commits (feat:, fix:, docs:, refactor:)
- **Documentation** : Javadoc pour les classes publiques

---

*Documentation générée le 2026-03-23*  
*Version 1.0*  
*BizCore - Business as a Service Platform*
