# BizCore Frontend

Interface de démonstration pour la plateforme BizCore - Business as a Service.

## Installation

```bash
npm install
```

## Lancement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## Pages

- `/` - Page de connexion
- `/dashboard` - Tableau de bord principal
- `/dashboard/businesses` - Gestion des métiers (Business)
- `/dashboard/actors` - Gestion des acteurs (Consumer/Provider)
- `/dashboard/services` - Catalogue de services
- `/dashboard/requests` - Demandes de services (CdS → FdS)
- `/dashboard/invoices` - Factures (ACK)
- `/dashboard/settings` - Paramètres du tenant

## Fonctionnalités démontrées

- Authentification JWT (simulée)
- Interface multi-tenant
- Flux CdS → FdS complet
- Gestion des statuts (PENDING → ACCEPTED → IN_PROGRESS → FULFILLED)
- Génération automatique de factures
- Analogie réseau visible dans l'UI

## Demo

Utilisez n'importe quel email et mot de passe pour vous connecter.

## Stack technique

- Next.js 14 (App Router)
- Tailwind CSS
- Lucide Icons
- TypeScript
