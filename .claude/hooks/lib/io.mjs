import { readFileSync } from 'node:fs';
import path from 'node:path';

/** Lit l'entrée JSON envoyée par Claude Code sur stdin. */
export function readHookInput() {
  const raw = readFileSync(0, 'utf8');
  return raw.trim() === '' ? {} : JSON.parse(raw);
}

export function projectDir(input) {
  return process.env.CLAUDE_PROJECT_DIR ?? input.cwd ?? process.cwd();
}

/** Chemin relatif au projet, ou null s'il en sort. */
export function toProjectPath(root, filePath) {
  const rel = path.relative(root, path.resolve(root, filePath)).split(path.sep).join('/');
  return rel === '' || rel.startsWith('..') || path.isAbsolute(rel) ? null : rel;
}

/** Refus : le message sur stderr est renvoyé à Claude (code de sortie 2). */
export function deny(reason) {
  process.stderr.write(`Refusé par le harness Duper : ${reason}\n`);
  process.exit(2);
}
