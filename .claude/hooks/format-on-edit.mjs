// PostToolUse (Edit|Write|MultiEdit) : Prettier + ESLint --fix sur le seul fichier modifié.
// Les erreurs ESLint restantes sont renvoyées à Claude (code 2) pour qu'il les corrige.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { projectDir, readHookInput, toProjectPath } from './lib/io.mjs';

const input = readHookInput();
const filePath = input.tool_input?.file_path;
if (typeof filePath !== 'string') process.exit(0);

const root = projectDir(input);
const rel = toProjectPath(root, filePath);
if (rel === null || rel.startsWith('node_modules/')) process.exit(0);

const bin = (name) => path.join(root, 'node_modules', '.bin', name);
const run = (cmd, args) => spawnSync(cmd, args, { cwd: root, encoding: 'utf8' });

if (/\.(m?[jt]sx?|json|md|css|html|ya?ml)$/.test(rel)) {
  run(bin('prettier'), ['--write', '--ignore-unknown', '--log-level=warn', rel]);
}

if (/\.(m?[jt]sx?)$/.test(rel)) {
  const lint = run(bin('eslint'), ['--fix', '--no-warn-ignored', '--max-warnings=0', rel]);
  if (lint.status !== 0) {
    process.stderr.write(
      `ESLint signale encore des problèmes dans ${rel} :\n${lint.stdout}${lint.stderr}`,
    );
    process.exit(2);
  }
}
