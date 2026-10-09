// PreToolUse (Bash) : bloque les commandes dangereuses et impose la liste blanche du rôle.
// Usage : node guard-bash.mjs [rôle]
import { checkBash, resolveRole } from './lib/policy.mjs';
import { deny, readHookInput } from './lib/io.mjs';

const input = readHookInput();
const command = input.tool_input?.command;
if (typeof command !== 'string') process.exit(0);

const result = checkBash(resolveRole(process.argv[2], input.agent_type), command);
if (!result.allowed) deny(result.reason);
