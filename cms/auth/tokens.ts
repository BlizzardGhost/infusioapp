import crypto from 'crypto';
import { getUserByIdentifier, type UserAccount } from './users';

export interface ActiveTokenRecord {
  code: string;
  identifier: string;
  expiresAt: number; // Unix timestamp ms
  createdAt: number;
  consumed: boolean;
  deliveryMethod: 'email' | 'authenticator' | 'admin_dispatch';
}

// Global in-memory cache of active OTP challenges across requests
// In serverless, persists in the function instance; also stored in shared memory/KV
const tokenStore = new Map<string, ActiveTokenRecord>();

// Expiration time: exactly 10 minutes (600,000 ms)
export const TOKEN_EXPIRY_MS = 10 * 60 * 1000;

/**
 * Generate a cryptographically secure 4-digit numeric code valid for 10 minutes
 */
export function generateFourDigitToken(identifier: string): {
  success: boolean;
  code?: string;
  expiresAt?: number;
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
  const now = Date.now();
  const expiresAt = now + TOKEN_EXPIRY_MS;

  const deliveryMethod = cleanId.includes('@') && !cleanId.includes('@sperling')
    ? 'email'
    : 'admin_dispatch';

  const record: ActiveTokenRecord = {
    code,
    identifier: cleanId,
    expiresAt,
    createdAt: now,
    consumed: false,
    deliveryMethod,
  };

  tokenStore.set(cleanId, record);

  console.info(
    `[Infusio Auth] Generated 10-minute 4-digit code for [${cleanId}]: **** (delivery: ${deliveryMethod})`
  );

  return {
    success: true,
    code,
    expiresAt,
    deliveryMethod,
  };
}

/**
 * Verify submitted 4-digit code
 */
export function verifyFourDigitToken(identifier: string, submittedCode: string): {
  valid: boolean;
  user?: UserAccount;
  error?: string;
} {
  const cleanId = identifier.trim().toLowerCase();
  const cleanCode = submittedCode.trim();
  const user = getUserByIdentifier(cleanId);

  if (!user) {
    return { valid: false, error: 'Invalid account identifier.' };
  }

  const record = tokenStore.get(cleanId);

  if (!record) {
    return {
      valid: false,
      error: 'No active access code requested for this account. Please request a new code.',
    };
  }

  if (record.consumed) {
    return {
      valid: false,
      error: 'This security code has already been used. Please request a new one.',
    };
  }

  if (Date.now() > record.expiresAt) {
    tokenStore.delete(cleanId);
    return {
      valid: false,
      error: 'Security code has expired (10-minute limit exceeded). Please request a fresh code.',
    };
  }

  // Validate exact 4-digit match
  if (record.code !== cleanCode) {
    return {
      valid: false,
      error: 'Incorrect 4-digit security code. Please check and try again.',
    };
  }

  // Mark token as consumed (single-use)
  record.consumed = true;
  tokenStore.set(cleanId, record);

  return {
    valid: true,
    user,
  };
}

/**
 * Get active token for admin inspection / delivery (e.g. for client accounts without email)
 */
export function getActiveTokenForUser(identifier: string): ActiveTokenRecord | null {
  const cleanId = identifier.trim().toLowerCase();
  const record = tokenStore.get(cleanId);

  if (!record || record.consumed || Date.now() > record.expiresAt) {
    return null;
  }

  return record;
}
