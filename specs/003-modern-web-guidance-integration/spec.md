# Spec 003: Integration of Google Chrome Modern Web Guidance

## 1. What & Why
Integrate **Google Chrome's Modern Web Guidance** (`GoogleChrome/modern-web-guidance`) as an agentic skill available across:
1. The **current workspace** (`.agents/skills/modern-web-guidance/`).
2. All **global/machine-level Antigravity & AI agent sessions** (`~/.gemini/config/skills/modern-web-guidance/` and `~/.agents/skills/modern-web-guidance/`), ensuring any current or future project can leverage these standards.
3. Apply and test the guidance across the Infusio Headless CMS codebase (Accessibility, Core Web Vitals, Forms, and Modern CSS Layouts).

## 2. Root Cause & Modern Web Baseline Analysis
- **Root Cause 1 (Legacy Input & Form Patterns):** Sign-in forms without explicit `spellcheck="false"`, `autocapitalize="none"`, `autocorrect="off"`, or `enterkeyhint` lead to mobile input quirks, keyboard mismatches, and browser autofill friction.
- **Root Cause 2 (Viewport Unit Layout Jitter):** Standard `100vh` on mobile causes layout shifts when address bars expand/collapse. Modern Web Guidance mandates dynamic viewport units (`100dvh` with `100vh` fallback).
- **Root Cause 3 (LCP & Layout Shifts):** Missing `fetchpriority="high"` on critical brand logo / banner assets delays Largest Contentful Paint (LCP), while missing dimensions cause Cumulative Layout Shift (CLS).
- **Root Cause 4 (Screen Reader Disconnects):** Dynamic login alerts without `aria-live="polite"` or `role="alert"` leave screen-reader users unaware of error/status feedback.

## 3. Functional Requirements
- **FR-001 (Universal Skill Availability):**
  - Install and configure `modern-web-guidance` in both project `.agents/skills/` and global `~/.gemini/config/skills/` + `~/.agents/skills/`.
  - Provide an automated test verifying skill discovery and CLI command readiness (`modern-web-guidance search`).
- **FR-002 (Modern Accessible Forms - `autofill-sign-in-form` & `forms`):**
  - Upgrade `/admin/login` (`login.astro`):
    - Explicit `for` / `id` label associations.
    - Add `name="identifier"`, `autocomplete="username"`, `spellcheck="false"`, `autocapitalize="none"`, `autocorrect="off"`, and `enterkeyhint="next"`.
    - TOTP code input with `name="code"`, `inputmode="numeric"`, `autocomplete="one-time-code"`, `enterkeyhint="done"`, and `pattern="[0-9]{6}"`.
    - Live alert banner equipped with `aria-live="polite"` and `role="alert"`.
    - Secondary buttons explicitly marked with `type="button"`.
- **FR-003 (Core Web Vitals & Image Optimization - `optimize-image-priority`):**
  - Upgrade `BrandLogo.tsx`: Apply `fetchpriority="high"` to primary LCP brand asset, with explicit width/height ratios to eliminate CLS.
- **FR-004 (CSS Layout & Viewport Resilience - `css-layout` & `responsive-design`):**
  - Adopt dynamic viewport units (`min-height: 100dvh; min-height: 100vh;`).
  - Introduce `<meta name="color-scheme" content="dark" />` for native dark-mode scrollbars and system UI adaptation.
  - Implement `flex-wrap: balance` on quick-preset button rows.
- **FR-005 (Legacy Web Pattern Cleanliness):**
  - Run `modern-web-guidance legacy-scan .` to guarantee 0 legacy pattern violations.

## 4. Acceptance Criteria
- **AC-1:** Skill exists and is fully discoverable in both `.agents/skills/modern-web-guidance` and `~/.gemini/config/skills/modern-web-guidance`.
- **AC-2:** `tests/modern-web-guidance.test.ts` passes 100%, verifying global skill registration, modern form attributes, dynamic viewport units, and image priority rules.
- **AC-3:** `npx -y modern-web-guidance legacy-scan .` passes with 0 legacy platform findings.
- **AC-4:** `npm run type-check` and `npm run build` succeed with 0 errors.
- **AC-5:** Commit references `specs/003-modern-web-guidance-integration`, is pushed to `origin/main`, and deployed to live production Vercel (`https://infusioapp.vercel.app`).
