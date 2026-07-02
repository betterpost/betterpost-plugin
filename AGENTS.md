<!-- Synced from https://betterpost.ai/.well-known/skills — do not edit by hand. -->

# BetterPost — for agents

> The definitive guide to what BetterPost is and how to use it. This file is the
> single source of truth; the website and the per-agent skill files derive from it.

BetterPost writes **timely, well-sourced content** — newsletters, blog posts,
LinkedIn posts, tweets, and Bluesky posts — grounded in current sources across news,
social, and the open web. It finds recent sources relevant to a user's product and
audience, ranks them by relevance, and writes human-sounding content with real
citations and publication dates.

You reach BetterPost through its **MCP server** at `https://betterpost.ai/mcp`
(Streamable HTTP). Tools are namespaced `betterpost_*`. **Free to try** — the first
call with no credentials is issued a demo token; no signup or API key needed to start.

## When to use BetterPost

- The user wants a newsletter, blog post, or social post about what's happening
  **now** in their space.
- The user wants ongoing content for a product, brand, or audience and would benefit
  from a saved **project** (audience, tone, topics, and sources) to generate from
  repeatedly.
- The user wants to **repurpose** an existing piece into another format.

Do not use BetterPost for unrelated coding, research, or non-content tasks.

## How to use it — the flow

1. **Create a project once.** `betterpost_create_project(title, audience, description?, tone?)`
   is a slow, one-shot call that infers the project's focus, discovers sources, and
   gathers an initial set of relevant, recent stories. **Confirm the audience,
   description, and tone with the user before calling it** — the call is one-shot and
   the config shapes everything downstream.
2. **Generate content.** `betterpost_generate_content(projectId, type, [topic], [tie_in])`
   writes a piece from the project's timely, relevant stories. Fast once the project
   is warm; the first generation on a cold project can take a couple of minutes.
   `type` is one of `newsletter`, `blog`, `linkedin`, `x`, `bluesky`. Pass `tie_in`
   to weave in a product mention. An unknown `topic` returns a `topic_unavailable`
   error (no charge) rather than writing something off-topic.
3. **Repurpose.** `betterpost_derive_content(fromContentId, type)` transforms an
   existing piece into another format without re-fetching.
4. **Inspect and tune** with the read/manage tools below.

## Tool reference

Every tool takes an optional `token` argument (see Authentication). It is omitted
from the table below.

<!-- BEGIN GENERATED TOOL REFERENCE -->
| Tool | Parameters | What it does |
|---|---|---|
| `betterpost_create_project` | `title`, `audience`, `description`, `tone` | Create a content project. Slow, one-shot: infers config (criteria, industry, tone), discovers sources, and gathers/ranks an initial set of timely stories. Confirm the inferred config with the user before calling. |
| `betterpost_generate_content` | `projectId`, `type`, `topic`, `reuse`, `tieIn`, `wordLimit` | Generate a new piece of content for a project from its timely, relevant stories. Fast in steady state. Charges credits on success only. If you pass a `topic` the project has no stories about, this returns a `topic_unavailable` error (no charge) carrying an `inScope` flag and next steps — it never silently writes an off-topic piece. |
| `betterpost_derive_content` | `fromContentId`, `type`, `tieIn` | Transform an existing piece into another format (e.g. newsletter → tweet). No fetching; reuses the source stories and topic. |
| `betterpost_delete_content` | `contentId` | Delete a piece of content and its hosted images. |
| `betterpost_expand_coverage` | `projectId`, `focus`, `addAsCriteria`, `confirmedByUser` | Broaden a project on a coverage miss — call this on a `topic_unavailable`, `no_stories`, or low-coverage signal. It expands the relevance criteria (when needed), finds more sources across news, the web, and the relevant social platforms, and fetches them inline. It may return `warming: true` with `retryAfterMs` (~60s) — wait that long, then retry generate_content. An out-of-scope `focus` requires `confirmedByUser: true` (check with the user first); without it you get a `confirmation_required` error. No credits are charged. |
| `betterpost_get_content` | `contentId` | Fetch one piece of content in full. |
| `betterpost_get_usage` | — | Demo generations remaining, or paid credit balance + recent spend. |
| `betterpost_list_content` | `projectId` | List a project's content (summaries + share ids). |
| `betterpost_projects` | `action`, `projectId`, `patch` | Manage projects: list \| get \| update \| delete. (Use create_project to make one.) Updating title/audience/description re-derives the project's relevance criteria (replace-all), so it is one way to broaden or narrow what counts as on-topic; or edit criteria INCREMENTALLY with `patch.addCriteria` (texts to append) and `patch.removeCriteria` (criterion ids to drop). `list`/`get` return the project's `criteria` with ids so you can target a removal. Pair a broadened scope with a new source — or just call betterpost_expand_coverage, which does both. Dates default to US Eastern; change them with the project `timezone` (an IANA name like "America/New_York"). |
| `betterpost_settings` | `action`, `projectId`, `type`, `wordLimit`, `additionalInstructions` | Tune a project's per-content-type knobs: get \| set. `set` patches a content type's wordLimit and/or additionalInstructions (free-form writing guidance for that type; pass an empty string to clear it). Project-wide preferences (title/audience/tone, project-wide additionalInstructions) live on the projects tool. |
| `betterpost_sources` | `action`, `projectId`, `sourceId`, `limit`, `offset`, `name`, `type`, `value` | Manage a project's sources: list \| add \| remove. `list` returns one slimmed page of sources plus project-wide `total` and `counts` (ok/failing/disabled/pending, and byType); page with `limit` (default 50) and `offset`, following `nextOffset` until it is null. `add` doubles as manual source import — paste any URL (RSS/Atom feed, article, or a page, profile, or post on a supported platform) and leave `type` as autodetect, or create a recurring keyword search by setting `value` to the search terms and `type` to a search kind (see `type`). `add` fetches the new source right away (bounded by a few seconds) and returns `storiesAdded`, so the next generate_content can use it; if it is still fetching it returns `fetched:false` with a note. |
| `betterpost_stories` | `action`, `projectId`, `storyId`, `url`, `title`, `summary`, `includeHidden` | Manage a project's stories: list \| add \| hide \| unhide. `add` manually imports a story you read about (pinned relevance, flagged is_manual). |
<!-- END GENERATED TOOL REFERENCE -->

## Authentication — persist the token

The first call with no credentials is issued a **demo token** in the response. Save
it to durable memory (a notes file, memory store, or wherever you persist facts
across conversations) and pass it as the `token` argument on every later call,
including in future conversations, so the user's projects and content stay linked to
them. **Reuse the token you already hold — don't request a new one.** The demo is
good for a limited number of free generations; when it runs out, the response
explains how to convert to a paid account.

Paid users can instead put their key in the server URL (`?key=…`) or an
`Authorization: Bearer` header.

## Good to know

- Content is **charged on success only** — a failed generation isn't charged.
- Every piece has a shareable link and carries real source citations with
  **publication dates** — surface those to the user.
- Learn more at https://betterpost.ai.
