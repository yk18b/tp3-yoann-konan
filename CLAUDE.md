# Duper

PWA : une carte de Paris recouverte de brouillard qui se dévoile là où l'utilisateur passe
réellement (GPS → cellules H3). L'utilisateur y épingle des lieux (restaurant, parc, monument)
avec une note de 1 à 5, un avis et une photo, **uniquement dans une zone déjà dévoilée**.

Monorepo npm workspaces : `apps/web` (React + Vite + MapLibre), `apps/api` (Fastify + SQLite/Drizzle),
`packages/shared` (schémas Zod, constantes H3, frontières de Paris). Détails : `docs/architecture.md`.

## Commandes

| Commande                | Rôle                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| `npm run check`         | format + lint + typecheck + tests unitaires — **doit être vert avant de rendre la main** |
| `npm run e2e`           | Playwright (lance l'API et le front)                                                     |
| `npm run dev`           | API :3000 + front :5173                                                                  |
| `npm run lint:fix`      | corrections ESLint automatiques                                                          |
| `npm run format`        | Prettier                                                                                 |
| `npx vitest run <path>` | un seul fichier de test                                                                  |

## Invariants métier (non négociables)

1. **Le serveur fait autorité sur le brouillard.** Le client envoie des positions ; le serveur
   calcule les cellules, applique l'anti-triche et les enregistre. Le front ne fait que refléter.
2. **Un pin n'est accepté que si sa cellule est dévoilée** dans la carte ciblée — vérifié côté
   serveur. Le contrôle côté client n'est qu'un confort d'interface.
3. **Résolution H3 unique**, exportée par `@duper/shared`. Ne jamais écrire la résolution en dur.
4. **Paris = GeoJSON officiel des arrondissements** (dans `shared`), jamais une bounding box.
5. **Anti-triche** : une vitesse irréaliste entre deux positions est rejetée, sauf si
   `ALLOW_SIMULATION=true` (dev et démo uniquement).
6. **Cartes multiples dès le schéma** : tables `maps` et `map_members` ; `map_id` sur les cellules
   et les pins ; chaque utilisateur a une carte personnelle créée à l'inscription.
7. **Photos** : ne jamais faire confiance au client. Côté serveur, avec sharp : détection du type
   réel par les octets, taille maximale, ré-encodage, suppression de toutes les métadonnées
   (EXIF, position GPS).
8. **Auth** : email + mot de passe, hachage argon2, session en cookie `httpOnly` (`SameSite=Lax`,
   `Secure` en production). Jamais de mot de passe ni de hash dans une réponse ou un log.

## Conventions de code

- TypeScript strict ; `any` interdit ; pas d'`enum` ni de `namespace` (`erasableSyntaxOnly` :
  l'API tourne directement sous Node 24 sans build).
- Imports relatifs **avec l'extension** `.ts`/`.tsx` ; `import type` pour les types.
- Toute entrée HTTP est validée par un schéma Zod de `@duper/shared` ; les types en découlent
  (`z.infer`), on ne les redéclare pas.
- Le front n'importe jamais `apps/api` : seulement `@duper/shared`.
- Un test à côté de chaque module (`foo.ts` → `foo.test.ts`).
- Désactiver une règle ESLint exige un commentaire `-- raison`.
- Code, noms et commits en anglais ou en français, mais cohérents dans un même fichier ;
  messages utilisateur en français.

## Interdits

- Éditer `apps/api/drizzle/**` à la main (migrations générées par `drizzle-kit generate`).
- Lire ou modifier `.env*` (sauf `.env.example`), éditer `package-lock.json` à la main.
- `git push --force`, `git commit --no-verify`, contourner un hook.
- Affaiblir un test ou une règle pour faire passer `check`.

## Workflow avec les subagents

`planner` → `dev` → `tester` → `reviewer`, une étape de plan à la fois.

- **planner** écrit le plan dans `docs/plans/NNN-slug.md` (étapes, fichiers, critères d'acceptation,
  tests attendus). Il ne touche pas au code.
- **dev** implémente une étape, sans écrire de tests, puis lance `npm run check`.
- **tester** écrit et lance les tests (`*.test.ts`, `e2e/**`), sans modifier le code source. Un bug
  trouvé est rapporté, pas corrigé.
- **reviewer** relit le diff (`git diff`) en lecture seule et rend un verdict OK / KO avec la liste
  des problèmes.

Les périmètres sont imposés par des hooks (`.claude/hooks/`) : un refus de hook est une règle, pas
un obstacle à contourner (pas de `sed -i`, de `cat >` ni de `tee` pour écrire hors périmètre).

## Documentation

- Tenir `README.md` à jour (installation, lancement, mode simulation, compte de démo) dès qu'une
  fonctionnalité change l'un de ces points.
- Une décision structurante = un ADR court dans `docs/decisions/`.
- Captures d'écran de l'application dans `captures/`.
