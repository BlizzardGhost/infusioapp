import crypto from 'crypto';
import { getUserByIdentifier, type UserAccount } from './users';

const SECRET = process.env.PAYLOAD_SECRET || 'infusio-headless-secret-key-development';

export const TOKEN_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export interface ChallengePayload {
  identifier: string;
  codeHash: string;
  expiresAt: number;
}

/**
 * Creates an HMAC hash of the 4-digit code
 */
function hashCode(code: string): string {
  return crypto.createHmac('sha256', SECRET).update(code.trim()).digest('hex');
}

/**
 * Signs the challenge payload into an encrypted tamper-proof token
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
 * Verifies the challenge token against the submitted 4-digit code
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
      error: 'No active access code requested for this account. Please request a new code.',
    };
  }

  try {
    const raw = Buffer.from(challengeToken, 'base64url').toString('utf-8');
    const [payloadStr, signature] = raw.split(':::');

    if (!payloadStr || !signature) {
      return { valid: false, error: 'Malformed verification token. Please request a new code.' };
    }

    // Verify HMAC signature
    const expectedSig = crypto.createHmac('sha256', SECRET).update(payloadStr).digest('hex');
    if (signature !== expectedSig) {
      return { valid: false, error: 'Invalid verification signature. Please request a new code.' };
    }

    const payload: ChallengePayload = JSON.parse(payloadStr);

    // Verify identifier match
    if (payload.identifier !== cleanId) {
      return { valid: false, error: 'Identifier mismatch. Please request a new code for this account.' };
    }

    // Verify 10-minute expiry
    if (Date.now() > payload.expiresAt) {
      return {
        valid: false,
        error: 'Security code has expired (10-minute limit exceeded). Please request a fresh code.',
      };
    }

    // Verify code match
    if (payload.codeHash !== hashCode(cleanCode)) {
      return {
        valid: false,
        error: 'Incorrect 4-digit security code. Please check and try again.',
      };
    }

    return {
      valid: true,
      user,
    };
  } catch (err) {
    return {
      valid: false,
      error: 'Failed to verify security token. Please request a new code.',
    };
  }
}

/**
 * Generate a cryptographically secure 4-digit numeric code valid for 10 minutes
 */
export function generateFourDigitToken(identifier: string): {
  success: boolean;
  code?: string;
  expiresAt?: number;
  challengeToken?: string;
  error?: string;
  deliveryMethod?: 'email' | 'authenticator' | 'admin_dispatch';
} {
  const cleanId = identifier.trim().toLowerCase();
  const user = getUserByIdentifier(cleanId);

  if (!user) {
    return {
      success: false,
      error: 'Account identifier not recognized. Please check with your administrator.',
    };
  }

  // Generate 4-digit random number (1000 to 9999)
  const code = crypto.randomInt(1000, 10000).toString();
  const { challengeToken, expiresAt } = signChallengeToken(cleanId, code);

  const deliveryMethod = cleanId.includes('@') && !cleanId.includes('@sperling')
    ? 'email'
    : 'admin_dispatch';

  console.info(
    `[Infusio Auth] Generated 10-minute 4-digit code for [${cleanId}]: **** (delivery: ${deliveryMethod})`
  );

  return {
    success: true,
    code,
    expiresAt,
    challengeToken,
    deliveryMethod,
  };
}
