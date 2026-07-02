// Sync entry point for BetterPost's agent skill docs.
//
// These skill docs are maintained centrally by BetterPost and served from
// https://betterpost.ai/.well-known/skills. This script pulls the current
// copies down into the repo so the plugin ships the canonical instructions.
//
// Zero dependencies — pure Node 18+ (global `fetch`). Run it with:
//   node scripts/sync.js
// Override the source with BETTERPOST_BASE_URL (e.g. a staging host).
//
// Only the files listed in the served manifest are sync-managed. Hand-maintained
// files — the `using-betterpost` bootstrap skill and the per-agent manifest dirs
// (.claude-plugin, .codex-plugin, .cursor-plugin, .kimi-plugin, .opencode, .pi,
// .agents) — are never touched here.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE_URL = (
  process.env.BETTERPOST_BASE_URL || "https://betterpost.ai"
).replace(/\/$/, "");
const WELL_KNOWN = `${BASE_URL}/.well-known/skills`;

const REPO_ROOT = path.join(__dirname, "..");
const SKILLS_DIR = path.join(REPO_ROOT, "skills");

const SYNC_COMMENT = `<!-- Synced from https://betterpost.ai/.well-known/skills — do not edit by hand. -->`;

const fetchText = async (url) => {
  let res;
  try {
    res = await fetch(url, {
      headers: { "user-agent": "github.com/betterpost/betterpost-plugin sync" },
    });
  } catch (err) {
    throw new Error(`Failed to fetch ${url}: ${err.message}`);
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${res.status} ${res.statusText}`);
  }
  return res.text();
};

const fetchManifest = async () => {
  const text = await fetchText(`${WELL_KNOWN}/index.json`);
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Failed to parse manifest at ${WELL_KNOWN}/index.json: ${err.message}`);
  }
};

// Split a markdown doc into its leading `---...---` YAML frontmatter block and
// the body that follows. Returns { frontmatter, body }; frontmatter is "" when
// the doc has none.
const splitFrontmatter = (markdown) => {
  const match = markdown.match(/^---\n[\s\S]*?\n---\n?/);
  if (!match) return { frontmatter: "", body: markdown };
  return {
    frontmatter: match[0].replace(/\n?$/, "\n"),
    body: markdown.slice(match[0].length).replace(/^\n+/, ""),
  };
};

// SKILL.md keeps its frontmatter first (agents parse it), so the provenance
// comment goes right after the frontmatter block.
const withSyncComment = (markdown) => {
  const { frontmatter, body } = splitFrontmatter(markdown);
  if (frontmatter) {
    return `${frontmatter}\n${SYNC_COMMENT}\n\n${body}`;
  }
  return `${SYNC_COMMENT}\n\n${body}`;
};

const writeFile = async (filePath, content) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
  console.log(`  Written: ${path.relative(REPO_ROOT, filePath)}`);
};

const run = async () => {
  const manifest = await fetchManifest();
  const skills = manifest.skills || [];
  console.log(`Found ${skills.length} skill(s) at ${WELL_KNOWN}`);

  let betterpostSkillMarkdown = null;

  for (const skill of skills) {
    console.log(`Syncing skill: ${skill.name}`);
    for (const file of skill.files || []) {
      const url = `${WELL_KNOWN}/${skill.name}/${file}`;
      const raw = await fetchText(url);
      const outputPath = path.join(SKILLS_DIR, skill.name, file);
      await writeFile(outputPath, withSyncComment(raw));

      if (skill.name === "betterpost" && file === "SKILL.md") {
        betterpostSkillMarkdown = raw;
      }
    }
  }

  // AGENTS.md is the repo-root, frontmatter-free body of the betterpost SKILL.md.
  if (betterpostSkillMarkdown) {
    const { body } = splitFrontmatter(betterpostSkillMarkdown);
    const agentsMd = `${SYNC_COMMENT}\n\n${body}`;
    await writeFile(path.join(REPO_ROOT, "AGENTS.md"), agentsMd);
  } else {
    console.warn(
      "Warning: no `betterpost` SKILL.md in the manifest; AGENTS.md not regenerated.",
    );
  }

  console.log("Sync complete.");
};

run().catch((err) => {
  console.error(err.message);
  console.error(
    "Skills were not updated. Check that " +
      `${WELL_KNOWN}/index.json is reachable, then re-run \`node scripts/sync.js\` ` +
      "or trigger the sync-skills workflow manually.",
  );
  process.exit(1);
});
