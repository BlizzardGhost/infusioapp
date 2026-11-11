# Spec 002: Agentic CMS Engine — Natural Language Multi-Site Orchestration

## 1. What & Why
Transform Infusio Headless CMS from a static dashboard shell into an **Agentic Control Plane** where both the Superadmin (`boris@computacionintegral.com`) and scoped clients (`test@sperling`) can build, manage, and update live websites in seconds using **natural language prompts**.

To ensure that natural language updates **never break layouts, design, backend functionality, or compromise security**, the architecture draws directly from the official patterns analyzed across the ecosystem:
1. **Astro Docs MCP (`withastro/docs-mcp` & `docs.astro.build/en/guides/build-with-ai/`)**: Real-time Astro documentation bridge via `https://mcp.docs.astro.build/mcp`, enforcing modern Astro patterns (Content Collections, Content Layer, Server Islands) over legacy or hallucinated code.
2. **`wp-astro-mcp` Architecture**: Decoupling the content layer from the presentation layer. Edits are confined to strictly typed, schema-validated JSON/Markdown data structures with automated Git commits, change detection, and rollback safety.
3. **`morinokami/astro-mcp` & `SandyYuan/astro_mcp`**: Runtime route and component introspection with domain-safe tool parameter enforcement.
4. **Vercel Agent Resources & MCP (`vercel-mcp`)**: Deployment orchestration, live status verification, and automated rollbacks via Vercel MCP and API.

## 2. Root Cause Analysis
- **Root Cause 1 (Mock State in UI):** The previous dashboard handled change requests and syncs via in-memory React state (`useState`), meaning no persistent updates were made to GitHub repositories or live Vercel deployments.
- **Root Cause 2 (Missing Natural Language Agent Pipeline):** There was no prompt-parsing agent pipeline capable of translating natural language intents into schema-safe mutations with layout integrity guardrails.
- **Root Cause 3 (Risk of Layout/Code Breakage from AI Hallucinations):** Direct arbitrary code generation by LLMs can corrupt CSS grid systems, responsive layouts, or Astro frontmatter. Confining agent mutations to strict Content Layer schemas (e.g. `src/data/*.json`, Content Collections, and typed props) guarantees 100% layout and backend integrity.

## 3. Functional Requirements
- **FR-001 (Agentic Prompt API - `/api/agent/v1/prompt`):**
  - Accepts natural language instructions (e.g. *"Update Boris's abstract to emphasize our autonomous agency and add a badge for 'Agentic CMS v2'"* or *"Update the headline on Camp David MVP to 'Luxury Mountain Lodging & Cabins'"*).
  - Authenticates the request via session cookie (`boris@computacionintegral.com` has global access; `test@sperling` is restricted to `camp-david-mvp`).
  - Evaluates plan boundaries (e.g. prevents non-enterprise clients from modifying locked tier features).
- **FR-002 (Layout & Security Guardrails Engine):**
  - Implements AST and schema-level validation before applying changes.
  - Strips any script injection, XSS vectors, or invalid frontmatter.
  - Verifies that design tokens, responsive breakpoints, and core CSS layout classes remain untouched.
- **FR-003 (Multi-Site Content Layer Store & Git Sync):**
  - Maintains persistent schema states for all managed sites (`hero-wall-mvp`, `camp-david-mvp`).
  - Produces structured diffs (Before vs After) for complete operator transparency.
  - Provides a Git commit & Vercel deployment trigger.
- **FR-004 (Master Admin Copilot UI in `AdminDashboard.tsx`):**
  - Real-time conversational agent terminal with prompt execution history.
  - Site selector (`hero-wall-mvp`, `camp-david-mvp`, etc.).
  - Visual Diff Viewer showing proposed vs applied changes.
  - 1-click Instant Rollback button.
- **FR-005 (Client Site Assistant in `ClientDashboard.tsx`):**
  - Conversational natural language input tailored for clients to update copy, seasonal promos, and feature toggles within seconds.
  - Instant live feedback showing updated fields and live preview links.
- **FR-006 (MCP Agent Ecosystem Integration):**
  - Document and configure the connection to `withastro/docs-mcp` (`https://mcp.docs.astro.build/mcp`) and Vercel MCP (`https://mcp.vercel.com`).

## 4. Acceptance Criteria
- **AC-1:** Natural language prompts sent to `POST /api/agent/v1/prompt` parse user intent, validate against target site schema guardrails, and return a structured diff with updated fields in under 2 seconds.
- **AC-2:** Security & layout guardrails reject any prompt that attempts to inject malicious HTML/script tags or violate schema constraints, returning an explicit guardrail violation error.
- **AC-3:** Scoped client permissions are strictly enforced: `test@sperling` can only update `camp-david-mvp`; attempts to update `hero-wall-mvp` return `403 Forbidden`.
- **AC-4:** `AdminDashboard.tsx` features an interactive Agentic Copilot Console with prompt input, quick-prompt presets, live diff preview, and rollback capability.
- **AC-5:** `ClientDashboard.tsx` features a real-time Conversational Site Assistant that updates `camp-david-mvp` content without requiring manual developer intervention.
- **AC-6:** Automated test suite (`tests/agent-engine.test.ts`) verifies prompt parsing, schema guardrails, role boundaries, and diff generation with 100% pass rate.
