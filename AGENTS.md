# BetterPost — for agents

> The definitive guide to what BetterPost is and how to use it. This file is the
> single source of truth; the per-agent skill files and the website derive from it.

BetterPost writes **timely, well-sourced content** — newsletters, blog posts,
LinkedIn posts, tweets, and Bluesky posts — grounded in current sources across news,
social, and the open web. It finds recent sources relevant to a user's product and
audience, ranks them by relevance, and writes human-sounding content with real
citations and publication dates.

You reach BetterPost through its **MCP server** at `https://betterpost.ai/mcp`
(Streamable HTTP). This plugin registers that server for you. **Free to try** — the
first call with no credentials is issued a demo token; no signup or API key needed.

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

| Tool | Purpose |
|---|---|
| `betterpost_create_project` | Create a project; infer config, discover sources, gather initial stories. Slow, one-shot. |
| `betterpost_generate_content` | Write a new piece from the project's timely, relevant stories. Charges on success only. |
| `betterpost_derive_content` | Transform an existing piece into another format. No fetching. |
| `betterpost_expand_coverage` | Gather more stories for a project that's short on a topic. |
| `betterpost_projects` | List / get / update / delete projects. |
| `betterpost_settings` | Get / set generation settings and project preferences. |
| `betterpost_sources` | List / add / remove a project's sources (add doubles as manual source import). |
| `betterpost_stories` | List / add / hide / unhide stories (add manually imports a story you read about). |
| `betterpost_list_content` | List a project's content (summaries + share ids). |
| `betterpost_get_content` | Fetch one piece of content in full. |
| `betterpost_delete_content` | Delete a piece of content and its hosted images. |
| `betterpost_get_usage` | Demo generations remaining, or paid credit balance + recent spend. |

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
