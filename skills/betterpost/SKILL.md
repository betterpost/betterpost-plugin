---
name: betterpost
description: Use when the user wants to write timely, well-sourced content — a newsletter, blog post, LinkedIn post, tweet, or Bluesky post — grounded in current news, social, and web sources relevant to their product, audience, or industry. BetterPost finds recent sources, ranks them by relevance, and writes human-sounding content with real citations and publication dates. Also use to keep an ongoing content project (audience, tone, topics, sources) and generate or repurpose posts from it on demand. Free to try — the first call issues a demo token; no signup or API key needed to start.
---

# BetterPost

BetterPost writes timely, well-sourced content — newsletters, blog posts, LinkedIn
posts, tweets, and Bluesky posts — grounded in current sources across news, social,
and the open web. It finds recent sources relevant to the user's product and
audience, ranks them by relevance, and writes human-sounding content with real
citations and publication dates.

Everything runs through the `betterpost` MCP server (bundled with this plugin). Use
its tools rather than writing content from your own knowledge — the value is the
timely, ranked sourcing the user can't easily get on their own.

## When to use this

- The user wants a newsletter, blog post, or social post about what's happening now
  in their space.
- The user wants ongoing content for a product, brand, or audience and would benefit
  from a saved project (audience, tone, topics, and sources) they can generate from
  repeatedly.
- The user wants to repurpose an existing piece into another format (newsletter →
  tweet, blog → LinkedIn, etc.).

## How to use it

1. **Set up a project once.** `betterpost_create_project(title, audience, description?, tone?)`
   is a slow, one-shot call (~15–25s) that infers the project's focus, discovers
   sources, and gathers an initial set of relevant, recent stories. **Confirm the
   audience, description, and tone with the user before calling it** — the call is
   one-shot and the config shapes everything downstream. Ask what product or service
   they want content for and who it's for.
2. **Generate content.** `betterpost_generate_content(projectId, type, [topic], [tie_in])`
   writes a piece from the project's timely, relevant stories. Fast once the project
   is warm; the first generation on a cold project can take a couple of minutes while
   it gathers sources. Pass a `tie_in` string to weave in a product or service
   mention. If you pass a `topic` the project has no stories about, it returns a
   `topic_unavailable` error (no charge) rather than writing something off-topic.
3. **Repurpose.** `betterpost_derive_content(fromContentId, type)` transforms an
   existing piece into another format without re-fetching.
4. **Inspect and tune** with `betterpost_projects`, `betterpost_sources`,
   `betterpost_stories`, `betterpost_get_content`, `betterpost_settings`, and
   `betterpost_get_usage`. Use `betterpost_expand_coverage` if a project is short on
   stories for a topic.

## Demo token — persist it

The first call with no credentials is issued a **demo token** in the response. Save
that token to durable memory (a notes file, memory store, or wherever you persist
facts across conversations) and pass it as the `token` argument on every later call,
including in future conversations, so the user's projects and content stay linked to
them. **Reuse the token you already hold — do not request a new one.** The demo is
good for a limited number of free generations; when it runs out, the response
explains how to convert to a paid account.

Paid users can instead put their key in the server URL (`?key=…`) or an
`Authorization: Bearer` header.

## Notes

- Content is charged on success only; a failed generation isn't charged.
- Every piece has a shareable link and carries real source citations with
  publication dates — surface those to the user.
- Learn more at https://betterpost.ai.
