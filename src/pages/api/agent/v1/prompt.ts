/**
 * File: src/pages/api/agent/v1/prompt.ts
 * Purpose: API Endpoint for executing natural language website updates via the Agentic CMS Engine.
 * Spec: specs/002-agentic-cms-engine/spec.md (FR-001, FR-002, AC-1, AC-2, AC-3)
 *
 * Operator Notes:
 * - What/Why: Receives natural language prompts from authenticated dashboards and applies schema-safe mutations.
 * - Security: Requires active `infusio_auth_token` cookie. Enforces role scope (clients only edit their site).
 * - Guardrails: Evaluates content against XSS patterns and rejects unauthorized layout key modifications.
 */

import type { APIRoute } from 'astro';
import { getUserBySession } from '@cms/auth/users';
import { processAgentPrompt } from '@cms/agent/engine';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // 1. Session Authentication Gate
    const sessionToken = cookies.get('infusio_auth_token')?.value;
    if (!sessionToken) {
      return new Response(
        JSON.stringify({ error: 'Authentication required. Please sign in to the Infusio Portal.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = getUserBySession(sessionToken);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session. Please sign in again.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Body Payload Parsing
    const body = await request.json().catch(() => ({}));
    const { siteId, prompt } = body;

    if (!siteId || typeof siteId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid target siteId.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return new Response(
        JSON.stringify({ error: 'Please enter a natural language instruction or prompt.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Execution via Agentic Engine
    const result = processAgentPrompt({
      userId: user.id,
      userRole: user.role,
      siteId: siteId.trim(),
      prompt: prompt.trim(),
    });

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    const isForbidden = err?.message?.includes('Access Forbidden');
    const isGuardrail = err?.message?.includes('Guardrail Alert');

    const statusCode = isForbidden ? 403 : isGuardrail ? 400 : 500;

    return new Response(
      JSON.stringify({
        error: err?.message || 'Agentic prompt execution failed',
      }),
      { status: statusCode, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
