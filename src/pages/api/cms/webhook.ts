import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get('authorization');
    const secretKey = process.env.PROCESS_AI_SECRET_KEY || process.env.CMS_WEBHOOK_SECRET;

    if (secretKey && authHeader !== `Bearer ${secretKey}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid authentication header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const payload = await request.json().catch(() => ({}));

    // Perform validation or ISR revalidation
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Infusio CMS Webhook processed successfully',
        timestamp: new Date().toISOString(),
        event: payload.event || 'content_updated',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
