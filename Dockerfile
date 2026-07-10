# Stdio entry point for MCP registry inspectors (e.g. Glama's health check).
#
# BetterPost is a HOSTED remote MCP server (Streamable HTTP at
# https://betterpost.ai/mcp) — there is no server implementation in this repo.
# This container simply bridges stdio to the hosted endpoint via mcp-remote so
# an inspector can start it and introspect (initialize + tools/list, which the
# endpoint serves anonymously; tool calls require OAuth sign-in).
#
# Real installs should NOT use this image — add the server URL directly to
# your client instead. See README.md or https://betterpost.ai/docs.
FROM node:22-alpine
RUN npm install -g mcp-remote@0.1.38
CMD ["mcp-remote", "https://betterpost.ai/mcp", "--transport", "http-only"]
