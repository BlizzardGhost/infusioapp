# Tasks — Spec 003: Modern Web Guidance Integration

- [x] **T1: Verification & Test Suite Setup**
  - [x] Create `specs/003-modern-web-guidance-integration/{spec,plan,tasks}.md`.
  - [x] Write `tests/modern-web-guidance.test.ts` to test AC-1 through AC-5.
- [x] **T2: Global & Workspace Skill Integration**
  - [x] Install skill in `.agents/skills/modern-web-guidance/`.
  - [x] Install skill globally in `~/.gemini/config/skills/modern-web-guidance/` and `~/.agents/skills/modern-web-guidance/`.
- [x] **T3: Apply Modern Web Guidance to Forms & Login Portal**
  - [x] Update `src/pages/admin/login.astro` with `autofill-sign-in-form` rules (`name`, `spellcheck`, `autocapitalize`, `autocorrect`, `enterkeyhint`, `aria-live`, `dvh`).
- [x] **T4: Apply Modern Web Guidance to LCP Media & Layouts**
  - [x] Update `cms/components/BrandLogo.tsx` with `optimize-image-priority` (`fetchpriority="high"`, width/height).
  - [x] Update `src/layouts/Layout.astro` with `dark-mode` (`color-scheme: dark`) and viewport resilience.
  - [x] Update `cms/styles/admin-theme.css` and `src/styles/global.css` with `color-scheme: dark`.
- [x] **T5: Validation & Deployment**
  - [x] Run `npx -y modern-web-guidance legacy-scan .`.
  - [x] Run `node --experimental-strip-types tests/modern-web-guidance.test.ts`.
  - [x] Run `npm run type-check` and `npm run build`.
  - [x] Stage, commit referencing `specs/003-modern-web-guidance-integration`, push to `origin/main`, and deploy to production Vercel (`https://infusioapp.vercel.app`).
