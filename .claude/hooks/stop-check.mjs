// Stop / SubagentStop : `npm run check` doit être vert avant de rendre la main,
// dès que l'arbre de travail contient des modifications.
import { spawnSync } from 'node:child_process';
import { projectDir, readHookInput } from './lib/io.mjs';

const input = readHookInput();
// Déjà relancé par ce hook : ne pas boucler indéfiniment.
if (input.stop_hook_active === true) process.exit(0);

const root = projectDir(input);
const status = spawnSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
if (status.status !== 0 || status.stdout.trim() === '') process.exit(0);

const check = spawnSync('npm', ['run', 'check', '--silent'], { cwd: root, encoding: 'utf8' });
if (check.status !== 0) {
  const output = `${check.stdout}${check.stderr}`.trim().split('\n').slice(-60).join('\n');
  process.stderr.write(`npm run check échoue, corrige avant de terminer :\n${output}\n`);
  process.exit(2);
}
