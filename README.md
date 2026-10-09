# Duper

Une carte de Paris recouverte de brouillard, qui se dévoile là où l'on passe réellement
(GPS, cellules hexagonales H3). On y épingle des lieux (restaurant, parc, monument) avec une
note de 1 à 5, un avis et une photo, uniquement dans une zone déjà dévoilée.

> **État :** mise en place du harness (outillage, règles, agents, CI). Le code applicatif
> n'est pas encore écrit ; les sections marquées _(à venir)_ seront complétées au fil des
> fonctionnalités.

## Stack

| Côté    | Technologies                                                        |
| ------- | ------------------------------------------------------------------- |
| Front   | React, TypeScript, Vite, MapLibre GL (tuiles OpenFreeMap), h3-js, PWA |
| Back    | Node 24, Fastify, TypeScript, SQLite + Drizzle, argon2, sharp       |
| Tests   | Vitest (unitaires, API), Playwright (e2e)                           |

## Prérequis

- Node.js 24 (`nvm use` lit `.nvmrc`)
- npm 11

## Installation

```bash
npm install
cp .env.example apps/api/.env
```

## Lancement _(à venir)_

```bash
npm run dev        # API sur :3000 + front sur :5173
```

## Mode simulation GPS _(à venir)_

Pour la démo, sans se déplacer : ouvrir `http://localhost:5173/?sim=1` (ou lancer avec
`VITE_GPS_MODE=sim`). La position se pilote au clavier, au clic sur la carte, ou en rejouant
un tracé de `apps/web/public/sim-routes/`. Côté API, `ALLOW_SIMULATION=true` désactive le
rejet des vitesses irréalistes.

## Compte de démo _(à venir)_

Créé par `npm run db:seed` — identifiants documentés ici une fois le seed en place.

## Structure

```
apps/web         front React (PWA)
apps/api         API Fastify + SQLite
packages/shared  schémas, constantes H3, frontières de Paris (partagés front/back)
e2e/             tests Playwright
docs/            architecture, décisions (ADR), plans de fonctionnalités
captures/        captures d'écran de l'application
```

## Licence

Projet pédagogique.
