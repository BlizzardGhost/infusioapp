# Implementation Plan — Spec 001: Authenticator (TOTP) Setup on First Login

## 1. Technical Approach & Evidence
- **Zero-Dependency RFC 6238 TOTP + Pure SVG QR Code Generator:**
  - Rather than relying on external SMTP servers or brittle native modules on Vercel serverless, we implement RFC 4648 Base32 encoding/decoding and RFC 6238 TOTP (`HMAC-SHA1`, 30-second time step, 6 digits, `[-1, 0, +1]` step window for ±30s clock skew) directly in `cms/auth/tokens.ts` using Node's built-in `crypto`.
  - For QR code rendering on first login, we provide a deterministic, self-contained ISO/IEC 18004 QR Code SVG generator in `cms/auth/qrcode.ts` (zero external runtime dependencies required, works offline and in Vercel serverless functions).
- **Stateless Enrollment Tracking:**
  - Each user's TOTP secret is deterministically derived via `HMAC-SHA256(SECRET, "totp-v1:" + user.id + ":" + user.identifier)` (20 bytes -> 32-character Base32 string).
  - First-login completion is tracked via an HMAC-signed cookie `infusio_totp_enrolled_<user.id>` (valid for 365 days). On first login (cookie absent), `POST /api/auth/request-code` returns `firstLogin: true` along with `qrSvg`, `otpauthUrl`, and `manualSecret`. After the user verifies their first 6-digit code in `POST /api/auth/verify-code`, the server sets `infusio_totp_enrolled_<user.id>` and `infusio_auth_token`.

## 2. Files to Create / Modify
1. `cms/auth/qrcode.ts` (New): Self-contained ISO/IEC 18004 QR code matrix & inline SVG generator for `otpauth://` URIs.
2. `cms/auth/tokens.ts` (Modify):
   - Add `getUserTotpSecret(user)`, `generateTotpCode(secretBase32, timestamp)`, `verifyTotpCode(secretBase32, code, timestamp)`, `getEnrollmentPayload(identifier, isEnrolled)`, `createEnrollmentCookieValue(userId)`, and `verifyEnrollmentCookieValue(userId, cookieVal)`.
   - Retain 10-minute signed challenge token support so admin-generated codes for `test@sperling` also work seamlessly alongside 6-digit Authenticator codes.
3. `src/pages/api/auth/request-code.ts` (Modify):
   - Check `infusio_totp_enrolled_<user.id>` cookie (and optional `forceSetup` flag).
   - Return Authenticator setup payload (`firstLogin: true`, `qrSvg`, `manualSecret`, `otpauthUrl`) on first login, or `firstLogin: false` on subsequent logins.
4. `src/pages/api/auth/verify-code.ts` (Modify):
   - Verify 6-digit TOTP code against the user's Authenticator secret (or 4/6-digit signed admin challenge token).
   - Set `infusio_totp_enrolled_<user.id>` (365d) and `infusio_auth_token` (30d) cookies.
5. `src/pages/admin/login.astro` (Modify):
   - Step 1: Enter Account Identifier (`Continue →`).
   - Step 2A (First Login — Authenticator Setup): Render the scannable QR code SVG, formatted manual setup key with Copy button, instructions for Microsoft Authenticator, and the 6-digit verification code input.
   - Step 2B (Subsequent Logins): Render only the 6-digit Microsoft Authenticator code input (with a subtle link to view setup QR if switching phones).
6. `cms/components/AdminDashboard.tsx` (Modify):
   - In the Client Access Management card for `test@sperling`, display the client's Authenticator Setup Key and live/on-demand access token generator so Boris can share either with the client.
7. `tests/totp-auth.test.mjs` (New):
   - Automated verification script testing AC-1 through AC-5 (TOTP secret derivation, RFC 6238 code generation & verification, ±1 step window, QR SVG generation, and enrollment token verification).

## 3. Risks & Mitigations
- **Clock Skew Between Phone & Vercel Lambda:** Mitigated by checking `counter - 1`, `counter`, and `counter + 1` (±30 seconds tolerance).
- **Phone Replacement / Lost Authenticator Entry:** Include a "Set up Authenticator on a new device" toggle on Step 2 so the user can view the QR code again if they reset their phone.
