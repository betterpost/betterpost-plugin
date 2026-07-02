/**
 * BetterPost plugin for OpenCode.ai
 *
 * Registers the BetterPost skills directory and injects a lightweight
 * capability note so the agent knows BetterPost is available for content tasks.
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple frontmatter stripping (no external dependency for bootstrap).
const stripFrontmatter = (content) => {
  const match = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return (match ? match[1] : content).trim();
};

// Module-level cache: the SKILL.md doesn't change during a session.
let _bootstrapCache = undefined; // undefined = not loaded, null = missing

export const BetterPostPlugin = async () => {
  const skillsDir = path.resolve(__dirname, '../../skills');

  const getBootstrapContent = () => {
    if (_bootstrapCache !== undefined) return _bootstrapCache;

    const skillPath = path.join(skillsDir, 'using-betterpost', 'SKILL.md');
    if (!fs.existsSync(skillPath)) {
      _bootstrapCache = null;
      return null;
    }

    const body = stripFrontmatter(fs.readFileSync(skillPath, 'utf8'));

    const toolMapping = `**Tool mapping for OpenCode:** use OpenCode's native \`skill\` tool to load the \`betterpost\` skill when a content task calls for it.`;

    _bootstrapCache = `<betterpost-available>
BetterPost is installed for writing timely, well-sourced content. The note below
tells you when and how to reach for it. Only use it when the user actually wants
content grounded in current sources — ignore it otherwise.

${body}

${toolMapping}
</betterpost-available>`;

    return _bootstrapCache;
  };

  return {
    // Register the skills path so OpenCode discovers the betterpost skills
    // without manual symlinks or config edits.
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(skillsDir)) {
        config.skills.paths.push(skillsDir);
      }
    },

    // Inject the capability note into the first user message of a session.
    'experimental.chat.messages.transform': async (_input, output) => {
      const bootstrap = getBootstrapContent();
      if (!bootstrap || !output.messages.length) return;
      const firstUser = output.messages.find((m) => m.info.role === 'user');
      if (!firstUser || !firstUser.parts.length) return;
      // Guard against double injection.
      if (firstUser.parts.some((p) => p.type === 'text' && p.text.includes('betterpost-available'))) return;
      const ref = firstUser.parts[0];
      firstUser.parts.unshift({ ...ref, type: 'text', text: bootstrap });
    },
  };
};
