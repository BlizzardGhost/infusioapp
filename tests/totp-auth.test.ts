/**
 * File: tests/totp-auth.test.ts
 * Purpose: Automated verification test suite for RFC 6238 Authenticator (TOTP) first-login setup & verification.
 * Spec: specs/001-totp-authenticator-login/spec.md (AC-1, AC-2, AC-3, AC-4, AC-5)
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  getUserTotpSecret,
  generateTotpCode,
  verifyTotpCode,
  getAuthenticatorSetupForUser,
  verifyAuthenticatorOrChallenge,
  createEnrollmentToken,
  verifyEnrollmentToken,
} from '../cms/auth/tokens.ts';
import { getUserByIdentifier } from '../cms/auth/users.ts';

console.log('=== Running Spec 001 TOTP Authenticator Test Suite ===');

// 1. Verify User Directory & Deterministic TOTP Secret (FR-001)
const boris = getUserByIdentifier('boris@computacionintegral.com');
assert.ok(boris, 'Superadmin boris@computacionintegral.com must exist');

const sperling = getUserByIdentifier('test@sperling');
assert.ok(sperling, 'Client test@sperling must exist');

const borisSecret1 = getUserTotpSecret(boris);
const borisSecret2 = getUserTotpSecret(boris);
assert.equal(borisSecret1, borisSecret2, 'TOTP secret must be deterministic across stateless calls');
assert.match(borisSecret1, /^[A-Z2-7]{32}$/, 'TOTP secret must be valid 32-char RFC 4648 Base32');

// 2. Verify First-Login Enrollment Payload & QR Code SVG (AC-1, FR-002)
const setupPayload = getAuthenticatorSetupForUser('boris@computacionintegral.com', false);
assert.equal(setupPayload.success, true, 'Setup payload should succeed for valid user');
assert.equal(setupPayload.firstLogin, true, 'Unenrolled user should receive firstLogin: true');
assert.ok(setupPayload.otpauthUrl?.startsWith('otpauth://totp/Infusio%20CMS:'), 'otpauth URI must be formatted for Microsoft Authenticator');
assert.ok(setupPayload.qrSvg?.startsWith('<svg') && setupPayload.qrSvg?.endsWith('</svg>'), 'QR code must be valid inline SVG');
assert.equal(setupPayload.manualSecret, borisSecret1, 'Manual secret must match user Base32 secret');

// 3. Verify RFC 6238 6-Digit Code Generation & Verification + Clock Skew Window (AC-2, FR-001)
const fixedTimeMs = 1730000000000;
const currentCode = generateTotpCode(borisSecret1, fixedTimeMs);
assert.match(currentCode, /^[0-9]{6}$/, 'Generated TOTP code must be 6 digits');

// Exact time match
assert.equal(verifyTotpCode(borisSecret1, currentCode, fixedTimeMs), true, 'Current step TOTP code must verify');
// +30s window match (clock drift tolerance)
assert.equal(verifyTotpCode(borisSecret1, currentCode, fixedTimeMs + 30_000), true, '+1 step window must verify');
// -30s window match (clock drift tolerance)
assert.equal(verifyTotpCode(borisSecret1, currentCode, fixedTimeMs - 30_000), true, '-1 step window must verify');
// Expired (+90s outside window) must fail
assert.equal(verifyTotpCode(borisSecret1, currentCode, fixedTimeMs + 90_000), false, 'Code outside ±1 step window must be rejected');

// Verify unified auth helper for live timestamp
const liveBorisCode = generateTotpCode(borisSecret1);
const verifyRes = verifyAuthenticatorOrChallenge('boris@computacionintegral.com', liveBorisCode);
assert.equal(verifyRes.valid, true, 'Live TOTP code for boris@computacionintegral.com must pass verification');
assert.equal(verifyRes.user?.id, 'usr_admin_boris');

// 4. Verify Subsequent Login Enrollment Cookie State (AC-3, FR-003)
const enrollToken = createEnrollmentToken(boris.id);
assert.equal(verifyEnrollmentToken(boris.id, enrollToken), true, 'Signed enrollment cookie token must verify');
assert.equal(verifyEnrollmentToken('usr_client_sperling', enrollToken), false, 'Enrollment token for another user must fail');

const enrolledPayload = getAuthenticatorSetupForUser('boris@computacionintegral.com', true);
assert.equal(enrolledPayload.success, true);
assert.equal(enrolledPayload.firstLogin, false, 'Enrolled user must receive firstLogin: false');
assert.equal(enrolledPayload.qrSvg, undefined, 'Enrolled user response must not expose QR SVG unless requested');

// 5. Verify Client test@sperling Authenticator + Admin Dispatch Code Support (AC-4, FR-004)
const sperlingSecret = getUserTotpSecret(sperling);
const sperlingTotp = generateTotpCode(sperlingSecret);
const sperlingVerify = verifyAuthenticatorOrChallenge('test@sperling', sperlingTotp);
assert.equal(sperlingVerify.valid, true, 'test@sperling must be able to log in with 6-digit Authenticator code');

// 6. Verify Login UI Contains Zero Credential Examples in Placeholders (AC-5, FR-005)
const loginAstroSource = fs.readFileSync(new URL('../src/pages/admin/login.astro', import.meta.url), 'utf-8');
assert.equal(loginAstroSource.includes('e.g. boris@'), false, 'Login page must never show example email');
assert.equal(loginAstroSource.includes('INF-ADMIN'), false, 'Login page must never show example token');

console.log('✅ All Spec 001 Acceptance Criteria (AC-1 through AC-5) verified successfully!');
