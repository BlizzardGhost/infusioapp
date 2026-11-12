# Implementation Plan — Spec 003: Modern Web Guidance Integration

## 1. Technical Approach & Architecture
We integrate `GoogleChrome/modern-web-guidance` across global and workspace configurations following Antigravity's progressive disclosure customization model:
- **Global Deployment:** Placed in `~/.gemini/config/skills/modern-web-guidance/` and `~/.agents/skills/modern-web-guidance/`, making it available to all current and future chats/projects on this system.
- **Project Deployment:** Committed to `.agents/skills/modern-web-guidance/` for version-controlled repository team access.
- **Application on Infusio CMS:**
  - Retrieve guidance for `autofill-sign-in-form`, `forms`, `optimize-image-priority`, `responsive-design`, and `css-layout`.
  - Update `src/pages/admin/login.astro`, `cms/components/BrandLogo.tsx`, `src/layouts/Layout.astro`, `cms/components/AdminDashboard.tsx`, and `cms/styles/admin-theme.css`.

## 2. Files to Create / Modify
1. `.agents/skills/modern-web-guidance/` & `~/.gemini/config/skills/modern-web-guidance/`: Main skill instruction and reference guides.
2. `tests/modern-web-guidance.test.ts` (New): Automated verification testing global skill existence, form attributes, LCP priority, and viewport resilience.
3. `src/pages/admin/login.astro` (Modify): Accessible forms, `spellcheck="false"`, `autocapitalize="none"`, `autocorrect="off"`, `enterkeyhint`, `aria-live="polite"`, `dvh` units.
4. `cms/components/BrandLogo.tsx` (Modify): `fetchpriority="high"`, explicit dimensions to prevent CLS.
5. `src/layouts/Layout.astro` (Modify): `<meta name="color-scheme" content="dark" />` and theme-aware viewport configuration.
6. `cms/components/AdminDashboard.tsx` & `cms/components/ClientDashboard.tsx` (Modify): `flex-wrap: balance` and safe alignment on tag/preset rows.

## 3. Risks & Mitigations
- **Risk:** Incompatible attributes causing React / Astro JSX warnings.
  - **Mitigation:** Use valid standard HTML attributes supported across modern browser baselines, verified via `npm run type-check`.
