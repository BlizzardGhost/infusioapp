import type { APIRoute } from 'astro';
import { verifyChallengeToken } from '../../../../cms/auth/tokens';
import { createSessionToken } from '../../../../cms/auth/users';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { identifier, code, token, challengeToken: bodyChallenge } = body;
    const submittedCode = code || token;

    if (!identifier || !submittedCode) {
      return new Response(
        JSON.stringify({ error: 'Both account identifier and 4-digit security code are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const challenge = cookies.get('infusio_otp_challenge')?.value || bodyChallenge;
    const verification = verifyChallengeToken(identifier, submittedCode, challenge);

    if (!verification.valid || !verification.user) {
      return new Response(
        JSON.stringify({
          error: verification.error || 'Access denied: Invalid or expired 4-digit security code.',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    cookies.delete('infusio_otp_challenge', { path: '/' });

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
