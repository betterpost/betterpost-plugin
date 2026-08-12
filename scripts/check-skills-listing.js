#!/usr/bin/env node
/**
 * Guard the public skills.sh listing for this repo.
 *
 * `npx skills add betterpost/betterpost-plugin` is an advertised install path, so
 * the set of skills the skills CLI discovers here is public API. This check runs
 * the real CLI against the checkout and asserts the discovered set is exactly what
 * we intend:
 *
 *   - default discovery  -> `betterpost` only
 *   - INSTALL_INTERNAL_SKILLS=1 -> `betterpost` + `using-betterpost`
 *
 * `using-betterpost` is a bootstrap pointer skill. It is marked
 * `metadata.internal: true` so it stays out of the public listing, but it is still
 * loaded by the per-agent bootstrap paths (hooks, GEMINI.md, the OpenCode and Pi
 * extensions), which read its file directly.
 *
 * Telemetry is disabled on every invocation. Install counts are the skills.sh
 * ranking signal; CI must never inflate ours.
 *
 * Usage: node scripts/check-skills-listing.js
 */

import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const PUBLIC_SKILLS = ['betterpost'];
const INTERNAL_SKILLS = ['using-betterpost'];

function listSkills({ includeInternal }) {
  const env = {
    ...process.env,
    // Never send install/usage telemetry from CI.
    DISABLE_TELEMETRY: '1',
    DO_NOT_TRACK: '1',
    // Keep the CLI from trying to be interactive on a TTY-less runner.
    CI: '1',
  };
  if (includeInternal) env.INSTALL_INTERNAL_SKILLS = '1';
  else delete env.INSTALL_INTERNAL_SKILLS;

  const raw = execFileSync('npx', ['-y', 'skills@latest', 'add', repoRoot, '--list'], {
    cwd: repoRoot,
    env,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
    timeout: 5 * 60 * 1000,
  });

  // Strip ANSI, then pick the lines that hold a bare skill name. The CLI prints
  // each name alone on its own line; description lines are prose and never match.
  const clean = raw.replace(/\x1B\[[0-9;?]*[A-Za-z]/g, '');
  const names = [...clean.matchAll(/^\s*│\s{2,8}([a-z0-9][a-z0-9._-]*)\s*$/gm)].map((m) => m[1]);
  return [...new Set(names)].sort();
}

function assertSet(label, actual, expected) {
  const want = [...expected].sort();
  const ok = actual.length === want.length && actual.every((n, i) => n === want[i]);
  console.log(`${label}: ${actual.length ? actual.join(', ') : '(none)'}`);
  if (!ok) {
    console.error(`\nSkill listing drift in ${label}.`);
    console.error(`  expected: ${want.join(', ')}`);
    console.error(`  actual:   ${actual.join(', ') || '(none)'}`);
    console.error('\nWhat to do next:');
    console.error('  - Added a skill on purpose? Update PUBLIC_SKILLS/INTERNAL_SKILLS in');
    console.error('    scripts/check-skills-listing.js and say so in the pull request.');
    console.error('  - Did not mean to change the listing? A skill directory was added,');
    console.error('    removed, or renamed under skills/, or a SKILL.md frontmatter');
    console.error('    `metadata.internal` flag was changed. Revert it.');
    console.error('  - Listing empty or unparseable? The skills CLI output format may have');
    console.error('    changed; rerun locally with:');
    console.error('    DISABLE_TELEMETRY=1 npx -y skills@latest add . --list');
    process.exitCode = 1;
    return false;
  }
  return true;
}

const publicOk = assertSet('public listing', listSkills({ includeInternal: false }), PUBLIC_SKILLS);
const internalOk = assertSet(
  'listing with INSTALL_INTERNAL_SKILLS=1',
  listSkills({ includeInternal: true }),
  [...PUBLIC_SKILLS, ...INTERNAL_SKILLS],
);

if (publicOk && internalOk) console.log('\nSkill listing matches the intended set.');
