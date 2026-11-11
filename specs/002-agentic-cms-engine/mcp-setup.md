# Agentic MCP Integration Guide — Astro & Vercel Ecosystem

This guide details the Model Context Protocol (MCP) configuration connecting AI agents (Antigravity, Claude Code, Cursor, Windsurf) to the official Astro and Vercel ecosystems.

---

## 1. Official Astro Docs MCP (`withastro/docs-mcp`)
- **Remote Endpoint:** `https://mcp.docs.astro.build/mcp`
- **Transport:** Streamable HTTP
- **Purpose:** Bridges real-time official Astro knowledge (Content Layer, Server Islands, Content Collections, component props, and routing) directly to the AI agent.
- **Why this prevents site breakage:** AI agents modifying Astro sites without real-time docs often hallucinate deprecated APIs (e.g. Astro 2/3 patterns) or try to generate invalid `.astro` frontmatter. Connecting to `withastro/docs-mcp` grounds the agent in the latest Astro 5 architecture.

### Configuration in AI Assistants (`~/.gemini/antigravity/mcp/` or `claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "astro-docs": {
      "type": "http",
      "url": "https://mcp.docs.astro.build/mcp"
    }
  }
}
```

---

## 2. Vercel MCP (`https://vercel.com/docs/agent-resources/vercel-mcp`)
- **Remote Endpoint:** `https://mcp.vercel.com`
- **Transport:** Streamable HTTP (OAuth authenticated)
- **CLI Setup:** `vercel mcp`
- **Capabilities:**
  - `list_deployments`: Inspects active builds and production URLs.
  - `get_runtime_logs` & `get_runtime_errors`: Validates that new deployments execute without serverless exceptions.
  - `request_rollback`: Executes 1-click instantaneous production rollbacks if any regression is detected.

---

## 3. The `wp-astro-mcp` Headless CMS Architectural Pattern
From Varun Dubey's `wp-astro-mcp`, our Agentic CMS adopts the key pattern of **Content Layer Isolation**:
1. Presentation code (Astro templates, CSS layouts, design tokens, serverless routes) is isolated from content mutations.
2. Natural language updates are parsed into structured JSON schemas (`src/data/hero.json`, `src/data/site.json`).
3. Diffs are calculated deterministically before committing to Git or triggering Vercel webhooks.
4. Security guardrails strip HTML tags, script injection, and invalid frontmatter, guaranteeing that prompt-driven edits take place in milliseconds without layout or security compromises.
