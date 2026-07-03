---
name: betterpost
description: Use when the user wants to write timely, well-sourced content — a newsletter, blog post, LinkedIn post, tweet, or Bluesky post — grounded in current news, social, and web sources relevant to their product, audience, or industry. BetterPost finds recent sources, ranks them by relevance, and writes human-sounding content with real citations and publication dates. Also use to keep an ongoing content project (audience, tone, topics, sources) and generate or repurpose posts from it on demand. Free to try — the first call issues a demo token; no signup or API key needed to start.
---

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
   To pick a `topic`, you can first call `betterpost_suggest_topics(projectId, type)`
   for a few candidate angles from the project's current stories, then ask the user
   whether they want one of those or just the latest news (omit `topic`).
3. **Repurpose.** `betterpost_derive_content(fromContentId, type)` transforms an
   existing piece into another format without re-fetching.
4. **Inspect and tune** with the read/manage tools below.

## Tool reference

Every tool takes an optional `token` argument (see Configuration). It is omitted
from the table below.

<!-- BEGIN GENERATED TOOL REFERENCE -->
| Tool | Parameters | What it does |
|---|---|---|
| `betterpost_create_project` | `title`, `audience`, `description`, `tone` | Create a content project. Slow, one-shot: infers config (criteria, industry, tone), discovers sources, and gathers/ranks an initial set of timely stories. Confirm the inferred config with the user before calling. |
| `betterpost_generate_content` | `projectId`, `type`, `topic`, `reuse`, `tieIn`, `wordLimit` | Generate a new piece of content for a project from its timely, relevant stories. Fast in steady state. Charges credits on success only. If you pass a `topic` the project has no stories about, this returns a `topic_unavailable` error (no charge) carrying an `inScope` flag and next steps — it never silently writes an off-topic piece. |
| `betterpost_derive_content` | `fromContentId`, `type`, `tieIn` | Transform an existing piece into another format (e.g. newsletter → tweet). No fetching; reuses the source stories and topic. |
| `betterpost_add_source` | `projectId`, `value`, `name`, `type` | Adds a source to a project and fetches it immediately (bounded by a few seconds), returning `storiesAdded` so the next generate_content can use it; if it is still fetching it returns `fetched:false` with a note. Doubles as manual source import: paste any URL (RSS/Atom feed, article, or a page, profile, or post on a supported platform) and leave `type` as autodetect, or create a recurring keyword search by setting `value` to the search terms and `type` to a search kind (see `type`). |
| `betterpost_add_story` | `projectId`, `url`, `title`, `summary` | Manually imports a story you read about from its URL (pinned relevance, flagged is_manual) so generation can draw on it. |
| `betterpost_delete_content` | `contentId` | Delete a piece of content and its hosted images. |
| `betterpost_delete_project` | `projectId` | Permanently deletes a project and everything in it — its sources, stories, and content. Cannot be undone. |
| `betterpost_expand_coverage` | `projectId`, `focus`, `addAsCriteria`, `confirmedByUser` | Broadens a project's coverage: expands the relevance criteria (when needed), finds more sources across news, the web, and the relevant social platforms, and fetches them inline. Applies on a `topic_unavailable`, `no_stories`, or low-coverage signal. May return `warming: true` with `retryAfterMs` (~60s), meaning the newly gathered stories are still landing. An out-of-scope `focus` requires `confirmedByUser: true`; without it, it returns a `confirmation_required` error. No credits are charged. |
| `betterpost_get_content` | `contentId` | Fetch one piece of content in full. |
| `betterpost_get_project` | `projectId` | Returns one project with its relevance `criteria` (each with an id, so a criterion can be targeted for removal via betterpost_update_project). |
| `betterpost_get_settings` | `projectId` | Returns a project's per-content-type settings (wordLimit and additionalInstructions for each channel). |
| `betterpost_get_usage` | — | Demo generations remaining, or paid credit balance + recent spend. |
| `betterpost_hide_story` | `storyId` | Hides a story so generation ignores it. Reversible with unhide_story. |
| `betterpost_list_content` | `projectId` | List a project's content (summaries + share ids). |
| `betterpost_list_projects` | — | Returns your projects, each with its relevance `criteria` (with ids) that define what counts as on-topic. |
| `betterpost_list_sources` | `projectId`, `limit`, `offset` | Returns one slimmed page of a project's sources plus project-wide `total` and `counts` (ok/failing/disabled/pending, and byType). Page with `limit` (default 50) and `offset`, following the returned `nextOffset` until it is null. |
| `betterpost_list_stories` | `projectId`, `includeHidden` | Returns a project's gathered stories, each with `title`, `url`, `summary`, `relevancy`, `publicationDate`, and `isManual`/`isHidden` flags. Pass includeHidden to include hidden ones. |
| `betterpost_remove_source` | `sourceId` | Removes a source from a project. Its already-gathered stories stay; the source is no longer fetched. |
| `betterpost_suggest_topics` | `projectId`, `type`, `count` | Clusters a project's current stories into a few candidate angles — each with a label, how many stories back it, and example headlines — and warms the project (gathers and ranks fresh stories) in the process. Returns topics you can offer the user before generate_content. |
| `betterpost_unhide_story` | `storyId` | Unhides a previously hidden story so generation can use it again. |
| `betterpost_update_project` | `projectId`, `patch` | Updates a project's title, audience, description, tone, freshness window, timezone, or relevance criteria, and returns the updated project with its criteria. Changing title/audience/description re-derives the relevance criteria (replace-all), which broadens or narrows what counts as on-topic. To edit criteria incrementally instead, pass `patch.addCriteria` (texts to append) and/or `patch.removeCriteria` (criterion ids from get_project/list_projects). Dates default to US Eastern unless a `timezone` (an IANA name like "America/New_York") is set. |
| `betterpost_update_settings` | `projectId`, `type`, `wordLimit`, `additionalInstructions` | Patches one content type's wordLimit and/or additionalInstructions (free-form writing guidance for that type; pass an empty string to clear it). Project-wide preferences (title/audience/tone, project-wide additionalInstructions) live on betterpost_update_project. |
<!-- END GENERATED TOOL REFERENCE -->

## Configuration — authentication and tokens

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
