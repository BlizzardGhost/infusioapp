# Tasks — Spec 001: Authenticator (TOTP) Setup on First Login

- [x] **T1:** Create `.specify/memory/constitution.md` and `specs/001-totp-authenticator-login/{spec,plan,tasks}.md`.
- [x] **T2:** Write automated test suite `tests/totp-auth.test.ts` covering RFC 6238 TOTP generation/verification, Base32 encoding, QR SVG generation, and enrollment state signing (AC-1, AC-2, AC-3, AC-4, AC-5).
- [x] **T3:** Implement `cms/auth/qrcode.ts` (zero-dependency ISO/IEC 18004 QR code SVG generator) and update `cms/auth/tokens.ts` with RFC 6238 TOTP + enrollment verification and operator inline comments.
- [x] **T4:** Update `src/pages/api/auth/request-code.ts` and `src/pages/api/auth/verify-code.ts` for first-login Authenticator enrollment and 6-digit TOTP verification.
- [x] **T5:** Update `src/pages/admin/login.astro` with First-Login Microsoft Authenticator QR Setup + 6-digit verification UI (preserving `infusio-site` aesthetics and zero credential examples).
- [x] **T6:** Update `cms/components/AdminDashboard.tsx` so Superadmin (`boris@computacionintegral.com`) can view/copy `test@sperling`'s live Authenticator code & setup key.
- [x] **T7:** Run `node --experimental-strip-types tests/totp-auth.test.ts`, `npm run type-check`, and `npm run build`, then commit, push to `origin/main`, and deploy to `https://infusioapp.vercel.app`.
