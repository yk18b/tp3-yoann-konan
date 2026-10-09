# apps/api — conventions back

- `src/app.ts` exporte `buildApp()` sans écouter de port ; `src/server.ts` est le seul point
  d'entrée qui appelle `listen`. Les tests utilisent `app.inject()`, jamais un vrai port.
- Organisation par module métier : `src/modules/<module>/{routes.ts,service.ts,*.test.ts}`.
  Les routes valident (Zod) et délèguent ; la logique vit dans `service.ts`, testable sans HTTP.
- Base : SQLite via Drizzle. Le schéma vit dans `src/db/schema.ts` ; après une modification,
  `npm run db:generate -w @duper/api` produit la migration dans `drizzle/` (ne jamais l'éditer).
- Tests : base SQLite `:memory:` avec les migrations appliquées, une base neuve par fichier de test.
- Toute requête sur `cells` ou `places` filtre par `map_id` **et** vérifie l'appartenance de
  l'utilisateur à la carte (`map_members`).
- Erreurs : codes HTTP explicites (400 validation, 401 non connecté, 403 hors carte ou zone non
  dévoilée, 413 photo trop lourde, 415 type non supporté, 422 vitesse irréaliste).
- Variables d'environnement lues une seule fois dans `src/config.ts` et validées par Zod.
- Fichiers uploadés : noms générés côté serveur (UUID), jamais le nom fourni par le client.
