# 007 — Scripts d'installation des dépendances (`allowScripts`)

- **Statut :** accepté
- **Contexte :** npm 11 n'exécute en confiance que les scripts d'installation (`preinstall`,
  `install`, `postinstall`) des paquets listés dans le champ `allowScripts` de `package.json`.
  Aujourd'hui, un paquet non relu est seulement signalé ; une prochaine version de npm (ou
  `strict-allow-scripts=true`) le bloquera. Le back dépend de deux paquets natifs : argon2 et sharp.
- **Décision :**
  - **argon2** a un script `install` (`node-gyp-build`) qui choisit le binaire précompilé de la
    plateforme, ou le compile à défaut. Il est approuvé par `npm approve-scripts argon2`, qui écrit
    une entrée **épinglée** (`argon2@<version>`) : une nouvelle version devra être relue et
    réapprouvée.
  - **sharp** (≥ 0.33) n'a plus de script d'installation : ses binaires arrivent par des
    dépendances optionnelles par plateforme (`@img/sharp-*`). Rien à autoriser ; ne pas l'ajouter
    à `allowScripts`.
  - Jamais `--dangerously-allow-all-scripts` ni `ignore-scripts` global pour contourner la règle.
- **Conséquences :** la CI (`npm ci`) installe les mêmes binaires que le poste local. Une montée de
  version d'argon2 fait réapparaître l'avertissement tant qu'elle n'est pas réapprouvée.
  `unrs-resolver` (dépendance d'outillage ESLint) reste à trancher : son `postinstall` ne sert
  qu'à récupérer un binaire manquant.
