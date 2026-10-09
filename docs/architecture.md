# Architecture de Duper

## Vue d'ensemble

```
┌──────────── apps/web (PWA) ────────────┐        ┌──────────── apps/api ────────────┐
│ LocationSource (GPS réel | simulé)     │  HTTP  │ auth  (argon2, cookie httpOnly)  │
│   → file hors ligne (IndexedDB)        │ ─────▶ │ fog   (positions → cellules H3,  │
│ MapLibre (OpenFreeMap)                 │ cookie │        anti-triche)              │
│   couche brouillard = monde − cellules │ ◀───── │ places (pins, contrôle zone)     │
│   couche pins                          │        │ photos (sharp : type, taille,    │
└────────────────────────────────────────┘        │         ré-encodage, sans EXIF)  │
                 ▲                                 │ SQLite + Drizzle                 │
                 └──── @duper/shared ─────────────▶└──────────────────────────────────┘
                   (Zod, résolution H3, Paris)
```

## Flux « je marche »

1. `LocationSource` émet une position `{lat, lng, accuracy, timestamp}`.
2. Le front l'envoie à `POST /api/maps/:mapId/positions` (ou la met en file si hors ligne).
3. Le serveur vérifie : position dans Paris (polygones des arrondissements), précision
   acceptable, vitesse plausible depuis la dernière position (sauf `ALLOW_SIMULATION=true`).
4. Il calcule `latLngToCell(lat, lng, H3_RESOLUTION)` et insère la cellule si elle est nouvelle.
5. Il renvoie les nouvelles cellules ; le front met à jour la couche brouillard.

## Flux « j'épingle un lieu »

1. Le formulaire n'est proposé que sur une cellule dévoilée (confort).
2. `POST /api/maps/:mapId/places` : le serveur recalcule la cellule du point et refuse (403) si
   elle n'est pas dévoilée dans cette carte.
3. La photo est envoyée en multipart et traitée par sharp avant d'être écrite sur disque.

## Modèle de données (prévu)

| Table         | Colonnes principales                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| `users`       | id, email (unique), password_hash, created_at                                                         |
| `sessions`    | id, user_id, expires_at                                                                               |
| `maps`        | id, name, owner_id, is_personal, created_at                                                           |
| `map_members` | map_id, user_id, role (`owner` \| `member`) — PK (map_id, user_id)                                    |
| `cells`       | map_id, h3_index, first_seen_at, first_seen_by — PK (map_id, h3_index)                                |
| `positions`   | id, user_id, map_id, lat, lng, accuracy, recorded_at (pour l'anti-triche)                             |
| `places`      | id, map_id, author_id, h3_index, lat, lng, category, name, rating 1–5, review, photo_path, created_at |

Phase 1 : chaque utilisateur n'utilise que sa carte personnelle (créée à l'inscription).
Phase 2 : cartes partagées, sans migration destructive.

## Décisions

Voir `docs/decisions/`.
