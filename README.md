# BetterPost — Claude Code plugin

Write **timely, well-sourced content** — newsletters, blog posts, LinkedIn posts,
tweets, and Bluesky posts — grounded in current sources across news, social, and the
open web. BetterPost finds recent sources relevant to your product and audience,
ranks them by relevance, and writes human-sounding content with real citations and
publication dates.

Works in the agents you already use, through a single [MCP](https://modelcontextprotocol.io)
server. **Free to try** — the first call issues a demo token; no signup or API key
needed to start.

## Install (Claude Code)

```
/plugin marketplace add betterpost/betterpost-plugin
/plugin install betterpost@betterpost
```

That installs the `betterpost` skill and registers the BetterPost MCP server. Ask
your agent to write a newsletter or post about what's happening in your space and it
will set up a project and generate content grounded in current sources.

## What's in here

- `skills/betterpost/SKILL.md` — the skill your agent invokes.
- `.mcp.json` — registers the hosted BetterPost MCP server.
- `.claude-plugin/` — the plugin manifest and self-listed marketplace.

## Using the server directly

Any MCP client can connect to `https://betterpost.ai` (Streamable HTTP). No key is
required to start — the first call issues a demo token. Persist that token and send
it back as the `token` argument (or, for paid keys, via `?key=…` or an
`Authorization: Bearer` header).

## Links

- Website: https://betterpost.ai
- Contact: hello@betterpost.ai

## License

MIT
