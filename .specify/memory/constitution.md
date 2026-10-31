# Infusio Headless CMS — Project Constitution

## 1. Purpose & Architecture
- **Multi-Repo Control Plane:** Centralized, white-labeled, Git-based headless CMS integrated into an Astro SSR (`@astrojs/vercel`) frontend on Vercel (`https://infusioapp.vercel.app`).
- **No Public Root Page:** The root route `/` must redirect (`HTTP 302`) to `/admin`, which gates unauthenticated sessions to `/admin/login`.
- **Visual Identity:** Strictly adhere to the `infusio-site` design language (`Quicksand` typography, Matcha Jade `#13c296`, Mint Foam `#2dd4bf`, Obsidian `#0e1113` background, glassmorphic cards, pill buttons).

## 2. Security & Authentication Principles
- **Zero-Password, Zero-Signup:** Public registration and passwords are permanently disabled. Access is restricted to provisioned accounts (`boris@computacionintegral.com` as Superadmin; `test@sperling` as Scoped Client for `https://camp-david-mvp.vercel.app/`).
- **No Credential / Identifier Leakage:** The login interface must never display example emails, client IDs, or sample tokens in placeholders or helper text.
- **Stateless Serverless Resilience:** All cryptographic secrets, TOTP verification, and session cookies must function deterministically across stateless Vercel serverless functions without relying on volatile in-memory Maps.

## 3. Engineering Standards (Global Build Guidelines)
- **Spec Kit Process:** Every feature or bug fix follows `constitution.md` -> `spec.md` -> `plan.md` -> `tasks.md` -> tests -> implementation -> verification -> commit referencing the spec folder.
- **Operator-Grade Inline Comments:** Every modified file includes a file header (path, purpose, spec reference), block explanations (what/why), threshold/timing rationale, and opt-in debug logging (`DEBUG_INFUSIO_AUTH=1`).
- **Evidence Over Guessing:** Prove root causes and verify every Acceptance Criterion (`AC-x`) via automated tests and production build checks before declaring completion.
