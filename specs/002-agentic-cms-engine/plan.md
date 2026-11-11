# Implementation Plan — Spec 002: Agentic CMS Engine

## 1. Technical Architecture & Principles
Drawing directly from the research on `withastro/docs-mcp`, `wp-astro-mcp`, `morinokami/astro-mcp`, and `vercel-mcp`:

```
[ User / Client Prompt in Natural Language ]
                    │
                    ▼
   [ Authentication & Scoped Permission Check ]
                    │
                    ▼
     [ Agentic Prompt Parsing & Intent Engine ]
   (Maps prompt to target site, category, and fields)
                    │
                    ▼
    [ Layout & Security Guardrails Verification ]
 (Sanitizes content, verifies Zod/JSON schema, guards CSS)
                    │
                    ▼
     [ Schema State Mutation & Diff Synthesis ]
   (Generates Before/After diff, updates site data layer)
                    │
                    ▼
  [ Instant Deployment / Sync to GitHub & Vercel ]
                    │
                    ▼
 [ Visual Operator Transparency & Rollback Snapshot ]
```

## 2. Component Design & Files to Create / Modify
1. `cms/agent/guardrails.ts` (New):
   - Strict content sanitization (strips `<script>`, `onerror`, `javascript:`, iframe injections).
   - Layout protection: verifies that core design tokens, responsive layout slots, and Astro Content Layer formats are strictly preserved.
2. `cms/agent/sitesStore.ts` (New):
   - Central state store for managed site definitions and live schemas:
     - `hero-wall-mvp` (`src/data/hero.json` schema): hero profile, title, level, abstract, active/pending badges, ops guardrails.
     - `camp-david-mvp` (`src/data/site.json` schema): hero heading, subheadline, promo banner, pricing tier, cabin listings, feature flags.
   - Snapshot history engine enabling 1-click instantaneous rollback.
3. `cms/agent/engine.ts` (New):
   - Natural language intent parser for website operations:
     - Handles copy changes, headline revisions, badge updates, feature enablement, and promotional banners.
     - Computes clean field-level diffs (`field`, `before`, `after`, `timestamp`).
     - Optional generative AI enrichment using Gemini API (`GEMINI_API_KEY`) when creative rewriting or SEO meta generation is requested.
4. `src/pages/api/agent/v1/prompt.ts` (New):
   - Unified API endpoint for natural language prompt execution with session authentication, role checks, and guardrails.
5. `src/pages/api/agent/v1/sites.ts` (New):
   - API endpoint for retrieving managed site states, diff history, and triggering rollbacks.
6. `cms/components/AdminDashboard.tsx` (Update):
   - Embeds the **Interactive Agentic Copilot Console**:
     - Natural language prompt bar with sample suggestions ("Update Hero abstract with autonomous agency focus", "Add Kairosis v2 badge", "Update Camp David promo banner").
     - Site selector dropdown (`hero-wall-mvp` vs `camp-david-mvp`).
     - Live Visual Diff modal/preview showing exactly what will change.
     - Live execution status, timing benchmark (e.g. `Updated in 0.42s`), and Rollback button.
7. `cms/components/ClientDashboard.tsx` (Update):
   - Upgrades the Client Workspace with a live **Conversational Site Assistant**:
     - Real-time natural language updates directly updating the Camp David MVP live site data.
     - Instant visual confirmation and change history.
8. `specs/002-agentic-cms-engine/mcp-setup.md` (New):
   - Complete operational documentation on configuring `withastro/docs-mcp` and `vercel-mcp` with Antigravity / Claude Code / Cursor.
9. `tests/agent-engine.test.ts` (New):
   - Unit and integration tests covering prompt parsing, guardrails validation, security sanitization, role enforcement, and rollback mechanics.

## 3. Risks & Mitigations
- **Risk:** Malicious prompt injection attempting to modify system files or execute scripts.
  - **Mitigation:** Strict schema guardrail filter in `cms/agent/guardrails.ts` that enforces typed JSON fields and rejects raw code/script injection.
- **Risk:** Client accessing another client's or superadmin's repo.
  - **Mitigation:** Authenticated session gate in `src/pages/api/agent/v1/prompt.ts` strictly restricting `test@sperling` to `camp-david-mvp`.
