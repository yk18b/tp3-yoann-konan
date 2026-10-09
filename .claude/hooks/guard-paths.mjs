// PreToolUse (Edit|Write|MultiEdit|NotebookEdit) : impose le périmètre d'écriture du rôle.
// Usage : node guard-paths.mjs [rôle]   (sans rôle : agent_type de l'entrée, sinon session principale)
import { checkWrite, resolveRole } from './lib/policy.mjs';
import { deny, projectDir, readHookInput, toProjectPath } from './lib/io.mjs';

const input = readHookInput();
const filePath = input.tool_input?.file_path ?? input.tool_input?.notebook_path;
if (typeof filePath !== 'string') process.exit(0);

const role = resolveRole(process.argv[2], input.agent_type);
const result = checkWrite(role, toProjectPath(projectDir(input), filePath));
if (!result.allowed) deny(result.reason);
