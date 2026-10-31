/**
 * File: src/pages/api/auth/request-code.ts
 * Purpose: Initiates passwordless login — returns Microsoft Authenticator QR enrollment on first login,
 *          or prompts for the 6-digit Authenticator TOTP code on subsequent logins.
 * Spec: specs/001-totp-authenticator-login/spec.md (FR-002, FR-003, FR-004, AC-1, AC-3, AC-4)
 */

import type { APIRoute } from 'astro';
import {
  getAuthenticatorSetupForUser,
  verifyEnrollmentToken,
} from '../../../../cms/auth/tokens';
import { getUserByIdentifier, getUserBySession } from '../../../../cms/auth/users';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { identifier, forceSetup = false, adminDispatch = false } = body;

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return new Response(
        JSON.stringify({ error: 'Please enter a valid account email or client identifier.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = getUserByIdentifier(identifier);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Account identifier not recognized. Please check with your administrator.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check whether this user has already completed first-login Authenticator setup on this browser
    const enrollCookieName = `infusio_totp_enrolled_${user.id}`;
    const enrollCookieVal = cookies.get(enrollCookieName)?.value;
    const isAlreadyEnrolled = !forceSetup && verifyEnrollmentToken(user.id, enrollCookieVal);

    const result = getAuthenticatorSetupForUser(identifier, isAlreadyEnrolled);

    if (!result.success || !result.challengeToken) {
      return new Response(
        JSON.stringify({ error: result.error || 'Account identifier not found.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Set 10-minute challenge cookie for stateless verification fallback across Vercel serverless invocations
    cookies.set('infusio_otp_challenge', result.challengeToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10,
    });

    // Only expose clientDispatchCode if requested by an authenticated Superadmin session in AdminDashboard
    const currentSession = cookies.get('infusio_auth_token')?.value;
    const sessionUser = currentSession ? getUserBySession(currentSession) : null;
    const canViewAdminDispatch = Boolean(adminDispatch && sessionUser?.role === 'superadmin');

    return new Response(
      JSON.stringify({
        success: true,
        firstLogin: result.firstLogin,
        message: result.firstLogin
          ? 'First login detected. Scan the QR code with Microsoft Authenticator to activate your token generator.'
          : 'Open Microsoft Authenticator and enter your 6-digit security code.',
        otpauthUrl: result.otpauthUrl,
        qrSvg: result.qrSvg,
        manualSecret: result.manualSecret,
        formattedSecret: result.formattedSecret,
        challengeToken: result.challengeToken,
        ...(canViewAdminDispatch
          ? {
              clientDispatchCode: result.clientDispatchCode,
              clientSetupSecret: result.formattedSecret || getAuthenticatorSetupForUser(identifier, false).formattedSecret,
            }
          : {}),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Failed to initialize Authenticator session', details: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
