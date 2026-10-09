// Règles de périmètre des agents Duper. Module pur (aucune E/S) : testé par policy.test.mjs.

/** @typedef {'main' | 'planner' | 'dev' | 'tester' | 'reviewer'} Role */

const ROLES = new Set(['planner', 'dev', 'tester', 'reviewer']);

/**
 * Rôle effectif : celui passé par le hook du frontmatter de l'agent, sinon le type d'agent
 * transmis par Claude Code, sinon la session principale.
 * @param {string | undefined} argRole
 * @param {string | undefined} agentType
 * @returns {Role}
 */
export function resolveRole(argRole, agentType) {
  const candidate = argRole ?? agentType;
  return candidate !== undefined && ROLES.has(candidate) ? /** @type {Role} */ (candidate) : 'main';
}

const TEST_FILE = /\.test\.[cm]?[jt]sx?$/;

/** Interdit à tous, session principale comprise. */
const PROTECTED = [
  { re: /(^|\/)\.env(\.(?!example$)[^/]+)?$/, why: 'les fichiers .env contiennent des secrets' },
  { re: /^apps\/api\/drizzle\//, why: 'les migrations sont générées par drizzle-kit generate' },
  { re: /(^|\/)package-lock\.json$/, why: 'le lockfile se modifie via npm install' },
];

/** Écritures autorisées par rôle (chemins relatifs à la racine du projet). */
const WRITE_SCOPES = {
  planner: [/^docs\/plans\/[^/]+\.md$/],
  dev: [
    /^apps\/[^/]+\/src\//,
    /^packages\/[^/]+\/src\//,
    /^apps\/[^/]+\/public\//,
    /^apps\/[^/]+\/[^/]+\.config\.ts$/,
    /^apps\/[^/]+\/index\.html$/,
    /^(apps|packages)\/[^/]+\/package\.json$/,
  ],
  tester: [TEST_FILE, /^e2e\//, /(^|\/)test-utils\//, /(^|\/)__fixtures__\//],
  reviewer: [],
};

/**
 * @param {Role} role
 * @param {string | null} relPath chemin relatif au projet, ou null s'il est hors du projet
 * @returns {{ allowed: true } | { allowed: false, reason: string }}
 */
export function checkWrite(role, relPath) {
  if (relPath === null) {
    return role === 'main'
      ? { allowed: true }
      : { allowed: false, reason: `l'agent ${role} ne peut pas écrire hors du projet` };
  }

  for (const { re, why } of PROTECTED) {
    if (re.test(relPath)) return { allowed: false, reason: `${relPath} est protégé : ${why}` };
  }

  if (role === 'main') return { allowed: true };

  if (role === 'dev' && TEST_FILE.test(relPath)) {
    return {
      allowed: false,
      reason: `le dev n'écrit pas de tests (${relPath}) : c'est le rôle du tester`,
    };
  }

  const allowed = WRITE_SCOPES[role].some((re) => re.test(relPath));
  return allowed
    ? { allowed: true }
    : { allowed: false, reason: `${relPath} est hors du périmètre d'écriture de l'agent ${role}` };
}

/** Commandes interdites à tous. */
const FORBIDDEN_COMMANDS = [
  { re: /\bgit\s+push\b.*(\s-f\b|--force)/, why: 'push forcé' },
  { re: /--no-verify\b/, why: 'contournement des hooks git' },
  { re: /\bgit\s+reset\s+--hard\b/, why: 'perte de travail non commité' },
  {
    re: /\brm\s+-[a-zA-Z]*[rR][a-zA-Z]*\s+(-\S+\s+)*("|')?(\/|~|\*|\.{1,2})("|')?(\s|$)/,
    why: 'suppression récursive dangereuse',
  },
  { re: /\b(curl|wget)\b[^|]*\|\s*(sudo\s+)?(ba|z)?sh\b/, why: 'exécution de script distant' },
  { re: /(^|[\s/'"])\.env(\.(?!example\b)[\w.-]+)?(?=$|[\s'"])/, why: 'accès aux fichiers .env' },
  { re: /\bdrizzle-kit\s+push\b/, why: 'drizzle-kit push contourne les migrations' },
  { re: /\bnpm\s+publish\b/, why: 'publication npm' },
];

/** Métacaractères shell : chaînage, redirections, substitutions. */
const SHELL_META = /[;&|<>`]|\$\(/;

const ALLOWED_COMMANDS = {
  planner: [],
  reviewer: [/^git (diff|log|show|status)(\s.*)?$/, /^npm run check$/],
  tester: [
    /^npm run (test|test:coverage|e2e|check|lint|typecheck)$/,
    /^npx (vitest|playwright test)(\s.*)?$/,
    /^git (diff|status)(\s.*)?$/,
  ],
};

/** Écritures de fichiers via le shell : le dev doit passer par Edit/Write, qui sont contrôlés. */
const SHELL_WRITES =
  /(\bsed\s+(-\S*\s+)*-i|\bperl\s+-\S*i|\btee\b|(^|[^0-9&])>(?!\s*\/dev\/null)|\b(cp|mv|truncate|dd)\s)/;

/**
 * @param {Role} role
 * @param {string} command
 * @returns {{ allowed: true } | { allowed: false, reason: string }}
 */
export function checkBash(role, command) {
  const cmd = command.trim();

  for (const { re, why } of FORBIDDEN_COMMANDS) {
    if (re.test(cmd)) return { allowed: false, reason: `commande interdite (${why}) : ${cmd}` };
  }

  if (role === 'main') return { allowed: true };

  if (/\bgit\s+(commit|push|rebase|merge|checkout|switch|stash|reset|tag)\b/.test(cmd)) {
    return {
      allowed: false,
      reason: `les opérations git qui modifient l'historique sont réservées à la session principale`,
    };
  }

  if (role === 'dev') {
    return SHELL_WRITES.test(cmd)
      ? {
          allowed: false,
          reason: `le dev écrit les fichiers avec Edit/Write, pas via le shell : ${cmd}`,
        }
      : { allowed: true };
  }

  if (SHELL_META.test(cmd)) {
    return {
      allowed: false,
      reason: `l'agent ${role} ne peut pas chaîner ni rediriger de commandes : ${cmd}`,
    };
  }
  return ALLOWED_COMMANDS[role].some((re) => re.test(cmd))
    ? { allowed: true }
    : {
        allowed: false,
        reason: `commande hors de la liste autorisée pour l'agent ${role} : ${cmd}`,
      };
}
