import type { APIRoute } from 'astro';
import { verifyChallengeToken } from '../../../../cms/auth/tokens';
import { createSessionToken } from '../../../../cms/auth/users';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { identifier, code, challengeToken: bodyChallenge } = body;

    if (!identifier || !code) {
      return new Response(
        JSON.stringify({ error: 'Both account identifier and 4-digit code are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Read challenge from cookie or request body
    const challenge = cookies.get('infusio_otp_challenge')?.value || bodyChallenge;

    const verification = verifyChallengeToken(identifier, code, challenge);

    if (!verification.valid || !verification.user) {
      return new Response(
        JSON.stringify({ error: verification.error || 'Invalid or expired 4-digit code.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Clear challenge cookie
    cookies.delete('infusio_otp_challenge', { path: '/' });

    // Set secure authentication session cookie
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
