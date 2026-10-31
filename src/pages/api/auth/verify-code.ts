/**
 * File: src/pages/api/auth/verify-code.ts
 * Purpose: Verifies the 6-digit RFC 6238 Authenticator (TOTP) code (or admin dispatch token),
 *          marks first-login Authenticator enrollment complete, and issues a 30-day session cookie.
 * Spec: specs/001-totp-authenticator-login/spec.md (FR-001, FR-002, FR-003, AC-2, AC-3)
 */

import type { APIRoute } from 'astro';
import {
  verifyAuthenticatorOrChallenge,
  createEnrollmentToken,
} from '../../../../cms/auth/tokens';
import { createSessionToken } from '../../../../cms/auth/users';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { identifier, code, challengeToken: bodyChallenge } = body;

    if (!identifier || !code) {
      return new Response(
        JSON.stringify({ error: 'Both account identifier and 6-digit Authenticator code are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const challenge = cookies.get('infusio_otp_challenge')?.value || bodyChallenge;
    const verification = verifyAuthenticatorOrChallenge(identifier, String(code), challenge);

    if (!verification.valid || !verification.user) {
      return new Response(
        JSON.stringify({
          error:
            verification.error ||
            'Invalid 6-digit code. Please verify the current code in Microsoft Authenticator.',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Clear temporary challenge cookie
    cookies.delete('infusio_otp_challenge', { path: '/' });

    // Persist first-login Authenticator enrollment cookie (365 days) so future logins skip QR setup
    const enrollToken = createEnrollmentToken(verification.user.id);
    cookies.set(`infusio_totp_enrolled_${verification.user.id}`, enrollToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    // Issue authenticated session cookie (30 days)
    const sessionToken = createSessionToken(verification.user);
    cookies.set('infusio_auth_token', sessionToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          identifier: verification.user.identifier,
          displayName: verification.user.displayName,
          role: verification.user.role,
        },
        redirect: '/admin',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Server authentication error', details: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
