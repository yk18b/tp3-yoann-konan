# Harness Claude Code

## Composants

| Fichier                            | Déclencheur                                       | Effet                                                                                     |
| ---------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `.claude/hooks/guard-paths.mjs`    | PreToolUse `Edit\|Write\|MultiEdit\|NotebookEdit` | Refuse (code 2) les écritures hors du périmètre du rôle et sur les fichiers protégés      |
| `.claude/hooks/guard-bash.mjs`     | PreToolUse `Bash`                                 | Refuse les commandes dangereuses et applique la liste blanche du rôle                     |
| `.claude/hooks/format-on-edit.mjs` | PostToolUse `Edit\|Write\|MultiEdit`              | Prettier + `eslint --fix` sur le fichier modifié ; renvoie les erreurs restantes à Claude |
| `.claude/hooks/stop-check.mjs`     | Stop (session et agents dev/tester)               | `npm run check` doit être vert si l'arbre de travail est modifié                          |
| `.claude/hooks/lib/policy.mjs`     | —                                                 | Règles pures, testées par `policy.test.mjs` (projet Vitest `harness`)                     |

Le rôle est déterminé ainsi : argument passé par le hook du frontmatter de l'agent
(`.claude/agents/*.md`), sinon le champ `agent_type` de l'entrée du hook, sinon la session
principale. Les deux mécanismes coexistent volontairement : un refus de l'un suffit.

## Périmètres

| Rôle     | Écriture                                                                   | Bash                                                                           |
| -------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| main     | tout sauf fichiers protégés                                                | tout sauf commandes interdites                                                 |
| planner  | `docs/plans/*.md`                                                          | aucun (pas d'outil Bash)                                                       |
| dev      | `apps/*/src`, `packages/*/src`, `apps/*/public`, configs d'app, hors tests | tout sauf commandes interdites, écritures shell et git d'historique            |
| tester   | `*.test.*`, `e2e/**`, `test-utils/`, `__fixtures__/`                       | `npm run test\|e2e\|check…`, `npx vitest\|playwright test`, `git diff\|status` |
| reviewer | rien (pas d'Edit/Write)                                                    | `git diff\|log\|show\|status`, `npm run check`                                 |

Fichiers protégés pour tous : `.env*` (sauf `.env.example`), `apps/api/drizzle/**`,
`package-lock.json`. Commandes interdites pour tous : push forcé, `--no-verify`,
`git reset --hard`, `rm -r` sur `/`, `~`, `.` ou `*`, `curl | sh`, accès aux `.env`,
`drizzle-kit push`, `npm publish`.

## Limites connues

- La détection des écritures shell du dev est heuristique (`sed -i`, `tee`, `>`, `cp`, `mv`…) :
  elle bloque les contournements évidents, pas un script déterminé. Le reviewer reste le filet.
- Les refus visent les chemins relatifs au projet ; les liens symboliques ne sont pas résolus.

## Vérification manuelle (après toute modification du harness)

Dans une session Claude Code ouverte à la racine du projet (relancer la session pour recharger
les agents) :

1. `/agents` : les quatre agents apparaissent avec leurs outils.
2. Demander au **reviewer** de corriger une faute dans `README.md` → refus (il n'a pas Write).
   Lui demander `npm install left-pad` → refus du hook Bash.
3. Demander au **planner** d'écrire `docs/architecture.md` → refus ; `docs/plans/000-essai.md` →
   accepté (supprimer ensuite).
4. Demander au **dev** de créer `apps/api/src/essai.test.ts` → refus ; de le faire via
   `echo … > apps/api/src/essai.test.ts` → refus ; de créer `apps/api/src/essai.ts` → accepté,
   fichier reformaté par Prettier (supprimer ensuite).
5. Demander au **tester** de modifier `apps/api/src/app.ts` → refus.
6. Session principale : écrire du code avec une erreur ESLint (`any`) → message ESLint renvoyé
   après l'écriture ; laisser un test cassé et finir le tour → le hook Stop force la correction.
7. Session principale : demander un push forcé ou `cat .env` → refus.
