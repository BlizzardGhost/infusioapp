import type { APIRoute } from 'astro';
import { generateFourDigitToken } from '../../../../cms/auth/tokens';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { identifier } = body;

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return new Response(
        JSON.stringify({ error: 'Please enter a valid account email or client identifier.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = generateFourDigitToken(identifier);

    if (!result.success || !result.challengeToken) {
      return new Response(
        JSON.stringify({ error: result.error || 'Account identifier not found.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Set secure challenge cookie valid for 10 minutes (stateless across Vercel serverless nodes)
    cookies.set('infusio_otp_challenge', result.challengeToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    });

    const isTestClient = identifier.toLowerCase().includes('sperling');

    return new Response(
      JSON.stringify({
        success: true,
        message: result.deliveryMethod === 'email'
          ? `A 4-digit security code has been dispatched to ${identifier}. It is valid for 10 minutes.`
          : 'A 4-digit security code has been generated. Valid for 10 minutes.',
        expiresAt: result.expiresAt,
        challengeToken: result.challengeToken,
        deliveryMethod: result.deliveryMethod,
        ...(isTestClient ? { clientDispatchCode: result.code } : {}),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Failed to process security code request', details: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
