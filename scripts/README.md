# scripts

## sync.js — sync skill docs from betterpost.ai

The BetterPost skill docs in this repo are **synced automatically** from the
canonical copies BetterPost serves at
[betterpost.ai/.well-known/skills](https://betterpost.ai/.well-known/skills/index.json).
Do not hand-edit the synced files — edit the source at betterpost.ai instead.

**Sync-managed files** (overwritten on every sync):

- `skills/betterpost/SKILL.md`
- `AGENTS.md` (the frontmatter-free body of the betterpost `SKILL.md`)

**Not** touched by the sync: the hand-maintained `skills/using-betterpost/SKILL.md`
bootstrap skill and the per-agent manifest dirs (`.claude-plugin`, `.codex-plugin`,
`.cursor-plugin`, `.kimi-plugin`, `.opencode`, `.pi`, `.agents`).

### Run it manually

```
node scripts/sync.js
# or
npm run sync
```

Set `BETTERPOST_BASE_URL` to sync from a different host (defaults to
`https://betterpost.ai`):

```
BETTERPOST_BASE_URL=https://staging.betterpost.ai node scripts/sync.js
```

The script is zero-dependency (pure Node 18+ with global `fetch`). It exits
non-zero with a clear message if the served endpoint is unreachable.

### Automation

The [`sync-skills`](../.github/workflows/sync-skills.yml) GitHub Actions workflow
runs this daily (06:00 UTC) and on manual dispatch, committing any changes back to
the default branch. The [`guard-skills`](../.github/workflows/guard-skills.yml)
workflow fails any pull request that hand-edits the sync-managed files.
