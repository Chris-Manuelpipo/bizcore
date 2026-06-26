# BizCore — Design (portail développeur)

## Scene

Développeur backend intègre BizCore depuis son IDE, bureau éclairé le jour ou écran seul le soir.

## Color strategy

Restrained : neutres teintés indigo (OKLCH) + accent indigo ≤10 % des surfaces. Vert émeraude réservé succès / usage API.

## Theme

Dark + light via `next-themes` (classe `.light` sur html).

## Typography

- UI : Geist Sans
- Code : Geist Mono
- Pas de Syne dans le portail

## Tokens (sémantiques)

Voir `frontend/src/app/globals.css` : `--color-bg`, `--color-surface`, `--color-primary`, etc.

## Components

Panel (`.panel`), Button (`.btn`, `.btn-primary`, `.btn-danger`), Input (`.input`), Label (`.label`), Badge (`.badge`).

## Bans

Side-stripe borders, gradient text, hero metrics, identical card grids, modals as first thought.
