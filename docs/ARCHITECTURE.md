# ARCHITECTURE BIZCORE - Diagrammes

## 1. Architecture Système Complète

```mermaid
flowchart TB
    subgraph Clients["👥 CLIENTS"]
        WEB["🌐 Frontend Web<br/>(Next.js PWA)"]
        MOBILE["📱 Frontend Mobile<br/>(React Native)"]
        API_CLIENTS["⚙️ Applications tierces<br/>(autres instances)"]
    end

    subgraph BizCore["🟢 BIZCORE PLATFORM"]
        subgraph Frontend_B["FRONTEND (Démonstration)"]
            NEXT["Next.js<br/>PWA + i18n<br/>Offline-first"]
        end

        subgraph Gateway["🔒 API GATEWAY / SECURITY"]
            JWT["JWT Auth<br/>Filter"]
            CORS["CORS<br/>Configuration"]
        end

        subgraph Backend["⚙️ BACKEND (Spring Boot)"]
            subgraph Controllers["CONTROLLERS"]
                AUTH_C["Auth"]
                TENANT_C["Tenant"]
                PERSON_C["Person"]
                ACTOR_C["Actor"]
                BUSINESS_C["Business"]
                PORTFOLIO_C["Portfolio"]
                SERVICE_C["ServiceCatalogue"]
                REQUEST_C["ServiceRequest"]
                INVOICE_C["Invoice"]
                RULE_C["BusinessRule"]
            end

            subgraph Services["SERVICES"]
                AUTH_S["AuthService"]
                TENANT_S["TenantService"]
                CORE_S["Business<br/>Services"]
            end

            subgraph MultiTenant["🔀 MULTI-TENANT LAYER"]
                TF["TenantFilter"]
                TC["TenantContext"]
                TR["TenantResolver"]
            end
        end

        subgraph Infrastructure["🗄️ INFRASTRUCTURE"]
            DB["PostgreSQL<br/>(Multi-tenant)"]
            CACHE["Redis<br/>(Cache)"]
            BUS["Apache Kafka<br/>(Event Bus)"]
        end
    end

    subgraph Instances["🏢 BUSINESS CORE INSTANCES"]
        PHARMACIE["💊 Pharmacie<br/>(Groupe 2)"]
        BOOKSTORE["📚 Bookstore<br/>(Groupe 5)"]
        ASSURANCE["🏥 Assurance<br/>(Groupe 9)"]
        TOURISM["✈️ Tourisme<br/>(Groupe 10)"]
    end

    %% Connections
    WEB --> NEXT
    MOBILE --> NEXT
    API_CLIENTS --> NEXT

    NEXT --> JWT
    PHARMACIE --> JWT
    BOOKSTORE --> JWT
    ASSURANCE --> JWT
    TOURISM --> JWT

    JWT --> CORS
    CORS --> TF
    TF --> TR
    TR --> Controllers

    Controllers --> Services
    Services --> CORE_S

    CORE_S --> DB
    CORE_S --> CACHE
    CORE_S --> BUS

    PHARMACIE -.->|"Configure son<br/>tenant"| DB
    BOOKSTORE -.->|"Configure son<br/>tenant"| DB
    ASSURANCE -.->|"Configure son<br/>tenant"| DB
    TOURISM -.->|"Configure son<br/>tenant"| DB
```

## 2. Flux d'une Requête CdS → FdS

```mermaid
sequenceDiagram
    participant C as 👤 Consumer
    participant API as 🟢 BizCore API
    participant DB as 🗄️ PostgreSQL
    participant P as 🔧 Provider

    Note over C,P: PHASE 1: Création de la demande
    
    C->>API: POST /api/service-requests<br/>Headers: JWT, X-Tenant-Id
    API->>API: JwtAuthFilter validate JWT
    API->>API: TenantFilter extract tenant_id
    API->>DB: INSERT ServiceRequest (PENDING)
    API-->>C: 201 + ServiceRequest {status: PENDING}

    Note over C,P: PHASE 2: Acceptation
    
    P->>API: PATCH /api/service-requests/{id}/accept
    API->>DB: UPDATE status = ACCEPTED
    API-->>P: 200 + ServiceRequest {status: ACCEPTED}

    Note over C,P: PHASE 3: Exécution
    
    P->>API: PATCH /api/service-requests/{id}/start
    API->>DB: UPDATE status = IN_PROGRESS
    API-->>P: 200 + ServiceRequest {status: IN_PROGRESS}

    Note over C,P: PHASE 4: Finalisation + Facture
    
    P->>API: PATCH /api/service-requests/{id}/fulfill
    API->>DB: UPDATE status = FULFILLED
    API->>DB: INSERT Invoice (PENDING)
    API-->>P: 200 + {ServiceRequest, Invoice}

    Note over C,P: PHASE 5: Paiement
    
    C->>API: PATCH /api/invoices/{id}/pay
    API->>DB: UPDATE Invoice status = PAID
    API-->>C: 200 + Invoice {status: PAID}
```

## 3. Pile Protocolaire (5 Couches)

```mermaid
flowchart LR
    subgraph Pile["Pile Protocolaire BizCore"]
        C5["5️⃣ Business Capabilities<br/>─────────────<br/>Actors • Resources<br/>Workflow • Audit<br/>Documents"]
        C4["4️⃣ Context & Policy<br/>─────────────<br/>Identity • Permissions<br/>SLA • Session<br/>Saga"]
        C3["3️⃣ Tenant & Routing<br/>─────────────<br/>Tenant Resolution<br/>Discovery • Routing<br/>Versioning"]
        C2["2️⃣ Transport & Messaging<br/>─────────────<br/>REST/gRPC<br/>Retry • Timeout<br/>Idempotence"]
        C1["1️⃣ Infrastructure<br/>─────────────<br/>DB • Cache<br/>Bus • Storage<br/>Observability"]
    end

    C1 --> C2
    C2 --> C3
    C3 --> C4
    C4 --> C5
```

## 4. Encapsulation des Headers

```mermaid
flowchart LR
    subgraph Paquet["📦 Paquet Métier"]
        H_NET["Header Réseau<br/>─────────────<br/>IP: source/dest<br/>Port<br/>Protocol"]
        
        H_BIZ["Header BizCore<br/>─────────────<br/>X-Tenant-Id<br/>X-Trace-Id<br/>X-Correlation-Id<br/>X-Locale<br/>X-Actor-Id<br/>X-Role"]
        
        PAYLOAD["Payload Métier<br/>─────────────<br/>{<br/>  \"serviceName\": \"...\",<br/>  \"description\": \"...\"<br/>}"]
    end

    style H_NET fill:#e1e5e8
    style H_BIZ fill:#ffd966
    style PAYLOAD fill:#b4d7a4
```

## 5. Multi-Tenant Isolation

```mermaid
flowchart TB
    subgraph Database["🗄️ PostgreSQL - bizcore"]
        
        subgraph Tenants["Table: tenants"]
            T1["id: 550e...<br/>name: Pharmacie"]
            T2["id: 660e...<br/>name: Bookstore"]
            T3["id: 770e...<br/>name: Assurance"]
        end

        subgraph Actors["Table: actors"]
            A1["id: 111<br/>tenant_id: 550e...<br/>role: PROVIDER"]
            A2["id: 222<br/>tenant_id: 550e...<br/>role: CONSUMER"]
            A3["id: 333<br/>tenant_id: 660e...<br/>role: PROVIDER"]
            A4["id: 444<br/>tenant_id: 660e...<br/>role: CONSUMER"]
        end

        subgraph Businesses["Table: businesses"]
            B1["id: b01<br/>tenant_id: 550e...<br/>name: Pharmacien"]
            B2["id: b02<br/>tenant_id: 660e...<br/>name: Libraire"]
            B3["id: b03<br/>tenant_id: 770e...<br/>name: Assureur"]
        end
    end

    T1 --- A1
    T1 --- A2
    T1 --- B1
    T2 --- A3
    T2 --- B2
    T3 --- B3

    style T1 fill:#ffd966
    style T2 fill:#ffd966
    style T3 fill:#ffd966
```

## 6. Cycle de Vie ServiceRequest

```mermaid
stateDiagram-v2
    [*] --> PENDING: Création CdS
    PENDING --> ACCEPTED: Provider accepte
    PENDING --> CANCELLED: Annulation
    
    ACCEPTED --> IN_PROGRESS: Provider démarre
    ACCEPTED --> CANCELLED: Annulation
    
    IN_PROGRESS --> FULFILLED: Provider accomplit<br/>→ Invoice créée
    IN_PROGRESS --> CANCELLED: Annulation
    
    FULFILLED --> PAID: Paiement reçu
    FULFILLED --> CANCELLED: Annulation (rare)
    
    PAID --> [*]
    CANCELLED --> [*]
    PENDING --> [*]: Timeout
```

## 6bis. Cycle de Vie d'une Facture (Invoice)

```mermaid
stateDiagram-v2
    [*] --> PENDING: ServiceRequest FULFILLED
    
    PENDING --> PAID: Consumer paie
    PENDING --> CANCELLED: Annulation
    
    PAID --> [*]
    CANCELLED --> [*]
```

## 7. Architecture Détaillée du Backend

```mermaid
flowchart TB
    subgraph Client["🌐 CLIENT"]
        REQ["Request<br/>Headers: JWT, X-Tenant-Id<br/>Body: JSON"]
    end

    subgraph FilterChain["🔒 FILTER CHAIN"]
        CORS_F["CorsFilter"]
        JWT_F["JwtAuthFilter"]
        TENANT_F["TenantFilter"]
        LOG_F["LoggingFilter"]
    end

    subgraph Controller["🎮 CONTROLLERS"]
        REST["@RestController<br/>@RequestMapping"]
        SWAGGER["@Operation<br/>Swagger Annotations"]
    end

    subgraph Service["⚙️ SERVICES"]
        CORE["Business Logic"]
        VALIDATOR["Bean Validation"]
        MAPPER["DTO ↔ Entity"]
    end

    subgraph Repository["💾 REPOSITORIES"]
        JPA["JpaRepository<br/>@Query"]
        PAGINATION["Pageable"]
    end

    subgraph Database["🗄️ DATABASE"]
        CONN["HikariCP Pool"]
        LIQUIBASE["Liquibase<br/>Migrations"]
        POSTGRES["PostgreSQL"]
    end

    REQ --> FilterChain
    FilterChain --> Controller
    Controller --> Service
    Service --> Repository
    Repository --> Database

    style Client fill:#e3f2fd
    style FilterChain fill:#fff3e0
    style Controller fill:#e8f5e9
    style Service fill:#f3e5f5
    style Repository fill:#fce4ec
    style Database fill:#eceff1
```

## 8. Comparaison BizCore vs Instances

```mermaid
flowchart LR
    subgraph BizCore["🟢 BIZCORE (Votre Projet)"]
        BE["Backend API<br/>Spring Boot"]
        FE["Frontend Demo<br/>Next.js"]
        DB["PostgreSQL<br/>Multi-tenant"]
    end

    subgraph Instance_Pharmacie["💊 INSTANCE: PHARMACIE (Groupe 2)"]
        FE_P["Frontend Pharma<br/>React Native"]
        DATA_P["Configure son<br/>tenant"]
    end

    subgraph Instance_Bookstore["📚 INSTANCE: BOOKSTORE (Groupe 5)"]
        FE_B["Frontend Librairie<br/>Next.js"]
        DATA_B["Configure son<br/>tenant"]
    end

    FE_P --> BE
    FE_B --> BE
    DATA_P --> DB
    DATA_B --> DB
```

## 9. Diagramme de Déploiement

```mermaid
flowchart TB
    subgraph DEV["💻 ENVIRONNEMENT DE DÉVELOPPEMENT"]
        LOCAL_DEV["Machine Développeur"]
        CODE["📄 Code Source<br/>Java + TypeScript"]
        MAVEN["📦 Maven Wrapper<br/>(./mvnw)"]
        NPM["📦 npm"]
    end

    subgraph GIT["🔗 GITHUB"]
        REPO["Dépôt Git"]
        ACTIONS["GitHub Actions<br/>(CI/CD)"]
    end

    subgraph CI_CD["🔄 PIPELINE CI/CD"]
        BUILD_TEST["Build + Tests<br/>mvnw verify"]
        IMG_BACKEND["Image Docker<br/>bizcore-backend"]
        DEPLOY_FE["Déploiement<br/>Vercel"]
    end

    subgraph VER["🌐 PRODUCTION - VERCEL"]
        NEXT_APP["📦 Next.js App<br/>(Static + Serverless)"]
        NEXT_ASSETS["Static Assets<br/>(HTML, CSS, JS, PWA)"]
        NEXT_API["API Routes<br/>(Serverless Functions)"]
    end

    subgraph RENDER["☁️ PRODUCTION - RENDER (PaaS)"]
        subgraph WEB_SVC["📡 Web Service (Free)"]
            SPRING_JAR["bizcore-backend.jar<br/>Spring Boot 3.5 + JDK 21"]
            JVM["JVM Options:<br/>-XX:+UseContainerSupport<br/>-XX:MaxRAMPercentage=75%"]
            ENTRY_POINT["docker-entrypoint.sh<br/>(conversion URL Render → JDBC)"]
        end

        subgraph DATA_SVC["🗄️ Data Services"]
            PG_RENDER["PostgreSQL 16<br/>(Multi-tenant, Free Tier)"]
            REDIS_RENDER["Redis 25MB<br/>(Cache + Bucket4j)"]
        end
    end

    subgraph DOCKER_LOCAL["🐳 DOCKER COMPOSE LOCAL (stack complète)"]
        PG_LOCAL["PostgreSQL 16<br/>port 5432"]
        REDIS_LOCAL["Redis 7<br/>port 6379"]
        ZK_LOCAL["ZooKeeper 7.6.0<br/>port 2181"]
        KAFKA_LOCAL["Kafka 7.6.0<br/>port 9092<br/>topic: bizcore.events"]
        APP_LOCAL["App Spring Boot<br/>port 8080"]
    end

    subgraph BROWSERS["🌍 CLIENTS"]
        NAV["Navigateur Web<br/>(Utilisateur final)"]
        THIRD_PARTY["App tierce<br/>(autres instances)"]
    end

    %% --- Relations Développement ---
    LOCAL_DEV --> CODE
    LOCAL_DEV --> MAVEN
    LOCAL_DEV --> NPM
    CODE -->|"git push"| REPO
    REPO -->|"déclenche"| ACTIONS
    ACTIONS -->|"lance"| CI_CD

    %% --- Pipeline CI/CD ---
    BUILD_TEST --> IMG_BACKEND
    BUILD_TEST --> DEPLOY_FE

    %% --- Déploiement Backend Render ---
    IMG_BACKEND -.->|"Docker Push → Render"| RENDER
    SPRING_JAR --> JVM
    SPRING_JAR --> ENTRY_POINT

    %% --- Déploiement Frontend Vercel ---
    DEPLOY_FE -.->|"Déploiement auto"| VER
    NEXT_APP --> NEXT_ASSETS
    NEXT_APP --> NEXT_API

    %% --- Connexions Production ---
    NAV -->|"HTTPS<br/>bizcore-liard.vercel.app"| VER
    THIRD_PARTY -->|"HTTPS"| VER
    NEXT_API -->|"HTTPS (REST API)<br/>bizcore-api.onrender.com"| SPRING_JAR
    SPRING_JAR -->|"JDBC (5432)"| PG_RENDER
    SPRING_JAR -->|"Redis Protocol (6379)"| REDIS_RENDER

    %% --- Connexions Locales ---
    NAV -->|"http://localhost:3000"| DOCKER_LOCAL
    APP_LOCAL -.- PG_LOCAL
    APP_LOCAL -.- REDIS_LOCAL
    ZK_LOCAL -.- KAFKA_LOCAL
    APP_LOCAL -.- KAFKA_LOCAL
```

---

## Légende

```mermaid
flowchart LR
    A["🟢 À faire / En cours"]:::todo
    B["✅ Terminé"]:::done
    C["🔵 Information"]:::info

    classDef todo fill:#fff3cd,stroke:#ffc107
    classDef done fill:#d4edda,stroke:#28a745
    classDef info fill:#d1ecf1,stroke:#17a2b8
```

## Commandes Utiles

```bash
# Démarrer le backend
cd backend && ./mvnw spring-boot:run

# Démarrer le frontend
cd frontend && npm run dev

# Voir la documentation API
open http://localhost:8080/swagger-ui.html

# Vérifier les migrations Liquibase
cd backend && ./mvnw liquibase:status
```

---

*Diagrammes générés pour BizCore - Business Core as a Service*
