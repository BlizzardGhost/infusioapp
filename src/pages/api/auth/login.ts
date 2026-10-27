import type { APIRoute } from 'astro';
import { authenticateWithToken } from '../../../../cms/auth/users';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { identifier, token } = body;

    if (!identifier || !token) {
      return new Response(
        JSON.stringify({ error: 'Both Account Identifier and Security Token are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = authenticateWithToken(identifier, token);

    if (!user) {
      return new Response(
        JSON.stringify({
          error: 'Access denied: Invalid identifier or security token. Please verify with your Infusio administrator.',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Set secure authentication cookie
    cookies.set('infusio_auth_token', user.token, {
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
          identifier: user.identifier,
          displayName: user.displayName,
          role: user.role,
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
