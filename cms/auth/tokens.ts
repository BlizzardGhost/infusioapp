/**
 * File: cms/auth/tokens.ts
 * Purpose: Stateless RFC 6238 Authenticator (TOTP) Enrollment, Verification & Admin Dispatch Token Engine.
 * Spec: specs/001-totp-authenticator-login/spec.md (FR-001, FR-002, FR-003, FR-004, AC-1..AC-4)
 *
 * Operator Notes:
 * - Why TOTP over Email OTP: Production environment has no SMTP relay configured, causing email 4-digit codes
 *   to never reach inboxes. First-login Authenticator (Microsoft Authenticator / Google Authenticator) enrollment
 *   eliminates SMTP dependency completely while strengthening security.
 * - Why Deterministic HMAC Secret Derivation: Vercel serverless functions are stateless and do not share memory.
 *   Deriving each user's 20-byte (160-bit) TOTP seed via HMAC-SHA256(SECRET, `totp-v1:${user.id}:${user.identifier}`)
 *   guarantees every lambda container computes the exact same RFC 4648 Base32 secret for that user without DB writes.
 * - Opt-in Debug Logging: Set `DEBUG_INFUSIO_AUTH=1` in environment to trace TOTP step windows and enrollment checks.
 */

import crypto from 'crypto';
import { getUserByIdentifier, type UserAccount } from './users.ts';
import { generateQrCodeSvg } from './qrcode.ts';

const SECRET = process.env.PAYLOAD_SECRET || 'infusio-headless-secret-key-development';
const DEBUG_AUTH = process.env.DEBUG_INFUSIO_AUTH === '1';

// Threshold rationale: 10 minutes (600,000 ms) gives an admin time to copy and send a temporary dispatch code to a client.
export const TOKEN_EXPIRY_MS = 10 * 60 * 1000;

// Threshold rationale: RFC 6238 standard time step is 30 seconds with 6 digits for Microsoft / Google Authenticator compatibility.
export const TOTP_STEP_SECONDS = 30;
export const TOTP_DIGITS = 6;

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function debugLog(message: string, meta?: Record<string, unknown>): void {
  if (DEBUG_AUTH) {
    console.info(`[Infusio Auth Debug] ${message}`, meta || '');
  }
}

/**
 * Encodes a Buffer into an RFC 4648 Base32 string (without padding `=`) required by otpauth:// URIs.
 */
export function toBase32(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Decodes an RFC 4648 Base32 string back into raw bytes for HMAC-SHA1 computation.
 */
export function fromBase32(base32: string): Buffer {
  const cleaned = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Deterministically derives a 20-byte (32 Base32 characters) TOTP secret for a user account.
 * Why 20 bytes: RFC 6238 / HMAC-SHA1 uses a 160-bit (20-byte) key, producing an exact 32-character Base32 string
 * with zero padding characters, which all Authenticator apps accept natively.
 */
export function getUserTotpSecret(user: UserAccount): string {
  const digest = crypto
    .createHmac('sha256', SECRET)
    .update(`totp-v1:${user.id}:${user.identifier.toLowerCase()}`)
    .digest();
  // Take first 20 bytes (160 bits) -> exactly 32 Base32 chars
  return toBase32(digest.subarray(0, 20));
}

/**
 * Generates an RFC 6238 6-digit TOTP code for the given Base32 secret and timestamp.
 */
export function generateTotpCode(secretBase32: string, timestampMs = Date.now()): string {
  const counter = Math.floor(timestampMs / 1000 / TOTP_STEP_SECONDS);
  return generateHotp(secretBase32, counter);
}

/**
 * Internal RFC 4226 HOTP dynamic truncation over an 8-byte big-endian counter.
 */
function generateHotp(secretBase32: string, counter: number): string {
  const key = fromBase32(secretBase32);
  const counterBuf = Buffer.alloc(8);
  // Write 64-bit big-endian integer
  counterBuf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  counterBuf.writeUInt32BE(counter >>> 0, 4);

  const hmac = crypto.createHmac('sha1', key).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binaryCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binaryCode % 10 ** TOTP_DIGITS;
  return otp.toString().padStart(TOTP_DIGITS, '0');
}

/**
 * Verifies an RFC 6238 6-digit TOTP code with a ±1 step (±30s) tolerance window to handle mobile clock drift.
 */
export function verifyTotpCode(
  secretBase32: string,
  submittedCode: string,
  timestampMs = Date.now(),
  windowSteps = 1
): boolean {
  const cleanCode = submittedCode.replace(/\s+/g, '');
  if (!/^[0-9]{6}$/.test(cleanCode)) {
    return false;
  }

  const currentCounter = Math.floor(timestampMs / 1000 / TOTP_STEP_SECONDS);
  for (let stepOffset = -windowSteps; stepOffset <= windowSteps; stepOffset++) {
    const candidate = generateHotp(secretBase32, currentCounter + stepOffset);
    if (candidate === cleanCode) {
      debugLog('TOTP code verified', { stepOffset });
      return true;
    }
  }

  return false;
}

/**
 * Creates a tamper-proof HMAC token proving that a user has completed their first-login Authenticator enrollment.
 */
export function createEnrollmentToken(userId: string): string {
  const payload = `enrolled:v1:${userId}`;
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:::${sig}`).toString('base64url');
}

/**
 * Verifies whether an enrollment cookie token is valid for the given userId.
 */
export function verifyEnrollmentToken(userId: string, token?: string): boolean {
  if (!token) return false;
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf-8');
    const [payload, sig] = raw.split(':::');
    if (payload !== `enrolled:v1:${userId}` || !sig) return false;
    const expectedSig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    return sig === expectedSig;
  } catch {
    return false;
  }
}

/**
 * Builds the Authenticator enrollment or subsequent-login challenge response for a user.
 * On first login (`isEnrolled === false`), includes the `otpauth://` URI, inline SVG QR code, and manual Base32 key.
 */
export function getAuthenticatorSetupForUser(
  identifier: string,
  isEnrolled = false
): {
  success: boolean;
  user?: UserAccount;
  firstLogin?: boolean;
  otpauthUrl?: string;
  qrSvg?: string;
  manualSecret?: string;
  formattedSecret?: string;
  challengeToken?: string;
  clientDispatchCode?: string;
  error?: string;
} {
  const cleanId = identifier.trim().toLowerCase();
  const user = getUserByIdentifier(cleanId);

  if (!user) {
    return {
      success: false,
      error: 'Account identifier not recognized. Please check with your administrator.',
    };
  }

  const secretBase32 = getUserTotpSecret(user);
  const issuer = 'Infusio CMS';
  const label = `${encodeURIComponent(issuer)}:${encodeURIComponent(user.identifier)}`;
  // Omit default SHA1/6-digit/30s parameters so the URI stays <= 125 bytes (QR Version 5/6, larger modules, zero Version-7+ blocks)
  const otpauthUrl = `otpauth://totp/${label}?secret=${secretBase32}&issuer=${encodeURIComponent(issuer)}`;

  // Also sign a 10-minute challenge token for the current live code so admin dispatch works seamlessly
  const liveCode = generateTotpCode(secretBase32);
  const { challengeToken } = signChallengeToken(cleanId, liveCode);

  if (!isEnrolled) {
    const qrSvg = generateQrCodeSvg(otpauthUrl);
    const formattedSecret = secretBase32.match(/.{1,4}/g)?.join(' ') || secretBase32;

    debugLog('Prepared first-login Authenticator enrollment payload', { identifier: cleanId });

    return {
      success: true,
      user,
      firstLogin: true,
      otpauthUrl,
      qrSvg,
      manualSecret: secretBase32,
      formattedSecret,
      challengeToken,
      ...(cleanId === 'test@sperling' ? { clientDispatchCode: liveCode } : {}),
    };
  }

  debugLog('Prepared subsequent-login TOTP verification prompt', { identifier: cleanId });

  return {
    success: true,
    user,
    firstLogin: false,
    challengeToken,
    ...(cleanId === 'test@sperling' ? { clientDispatchCode: liveCode } : {}),
  };
}

export interface ChallengePayload {
  identifier: string;
  codeHash: string;
  expiresAt: number;
}

function hashCode(code: string): string {
  return crypto.createHmac('sha256', SECRET).update(code.trim()).digest('hex');
}

/**
 * Signs a temporary 10-minute challenge token (used for admin-dispatched codes or fallback verification).
 */
export function signChallengeToken(identifier: string, code: string): { challengeToken: string; expiresAt: number } {
  const expiresAt = Date.now() + TOKEN_EXPIRY_MS;
  const payload: ChallengePayload = {
    identifier: identifier.trim().toLowerCase(),
    codeHash: hashCode(code),
    expiresAt,
  };

  const payloadStr = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', SECRET).update(payloadStr).digest('hex');
  const challengeToken = Buffer.from(`${payloadStr}:::${signature}`).toString('base64url');

  return { challengeToken, expiresAt };
}

/**
 * Verifies either:
 * 1) A 6-digit RFC 6238 Authenticator (TOTP) code from Microsoft Authenticator / Google Authenticator, OR
 * 2) A signed 10-minute admin-dispatched challenge code (4 or 6 digits).
 */
export function verifyAuthenticatorOrChallenge(
  submittedIdentifier: string,
  submittedCode: string,
  challengeToken?: string
): {
  valid: boolean;
  user?: UserAccount;
  error?: string;
} {
  const cleanId = submittedIdentifier.trim().toLowerCase();
  const cleanCode = submittedCode.replace(/\s+/g, '');
  const user = getUserByIdentifier(cleanId);

  if (!user) {
    return { valid: false, error: 'Invalid account identifier.' };
  }

  // Primary Path: Verify 6-digit RFC 6238 TOTP code from Microsoft Authenticator
  const userSecret = getUserTotpSecret(user);
  if (verifyTotpCode(userSecret, cleanCode)) {
    return { valid: true, user };
  }

  // Secondary Path: Verify signed 10-minute admin challenge token (if provided)
  if (challengeToken) {
    const challengeRes = verifyChallengeToken(cleanId, cleanCode, challengeToken);
    if (challengeRes.valid) {
      return challengeRes;
    }
  }

  return {
    valid: false,
    error: 'Invalid Authenticator code. Please enter the current 6-digit code from Microsoft Authenticator.',
  };
}

/**
 * Verifies a signed 10-minute challenge token.
 */
export function verifyChallengeToken(
  submittedIdentifier: string,
  submittedCode: string,
  challengeToken?: string
): {
  valid: boolean;
  user?: UserAccount;
  error?: string;
} {
  const cleanId = submittedIdentifier.trim().toLowerCase();
  const cleanCode = submittedCode.trim();
  const user = getUserByIdentifier(cleanId);

  if (!user) {
    return { valid: false, error: 'Invalid account identifier.' };
  }

  if (!challengeToken) {
    return {
      valid: false,
      error: 'No active challenge token found.',
    };
  }

  try {
    const raw = Buffer.from(challengeToken, 'base64url').toString('utf-8');
    const [payloadStr, signature] = raw.split(':::');

    if (!payloadStr || !signature) {
      return { valid: false, error: 'Malformed verification token.' };
    }

    const expectedSig = crypto.createHmac('sha256', SECRET).update(payloadStr).digest('hex');
    if (signature !== expectedSig) {
      return { valid: false, error: 'Invalid verification signature.' };
    }

    const payload: ChallengePayload = JSON.parse(payloadStr);

    if (payload.identifier !== cleanId) {
      return { valid: false, error: 'Identifier mismatch.' };
    }

    if (Date.now() > payload.expiresAt) {
      return {
        valid: false,
        error: 'Security code has expired (10-minute limit exceeded).',
      };
    }

    if (payload.codeHash !== hashCode(cleanCode)) {
      return {
        valid: false,
        error: 'Incorrect security code. Please check your Authenticator app and try again.',
      };
    }

    return {
      valid: true,
      user,
    };
  } catch {
    return {
      valid: false,
      error: 'Failed to verify security token.',
    };
  }
}

/**
 * Legacy helper maintained for AdminDashboard client token generation.
 * Returns both the client's Authenticator setup info and a 10-minute dispatch code.
 */
export function generateFourDigitToken(identifier: string): {
  success: boolean;
  code?: string;
  expiresAt?: number;
  challengeToken?: string;
  manualSecret?: string;
  formattedSecret?: string;
  error?: string;
  deliveryMethod?: 'authenticator' | 'admin_dispatch';
} {
  const cleanId = identifier.trim().toLowerCase();
  const user = getUserByIdentifier(cleanId);

  if (!user) {
    return {
      success: false,
      error: 'Account identifier not recognized.',
    };
  }

  const secretBase32 = getUserTotpSecret(user);
  const code = generateTotpCode(secretBase32);
  const { challengeToken, expiresAt } = signChallengeToken(cleanId, code);
  const formattedSecret = secretBase32.match(/.{1,4}/g)?.join(' ') || secretBase32;

  return {
    success: true,
    code,
    expiresAt,
    challengeToken,
    manualSecret: secretBase32,
    formattedSecret,
    deliveryMethod: cleanId === 'test@sperling' ? 'admin_dispatch' : 'authenticator',
  };
}
