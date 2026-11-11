/**
 * File: src/pages/api/agent/v1/sites.ts
 * Purpose: API Endpoint for retrieving managed site schemas and triggering 1-click rollbacks.
 * Spec: specs/002-agentic-cms-engine/spec.md (FR-003, AC-4, AC-5)
 *
 * Operator Notes:
 * - What/Why: Enables dashboards to inspect live site content models and perform instantaneous rollbacks.
 * - Security: Scoped by role. Clients only receive and roll back their assigned site.
 */

import type { APIRoute } from 'astro';
import { getUserBySession } from '@cms/auth/users';
import { getSiteData, listManagedSites, rollbackSiteData, type ManagedSiteDefinition } from '@cms/agent/sitesStore';

export const prerender = false;

export const GET: APIRoute = async ({ url, cookies }) => {
  const sessionToken = cookies.get('infusio_auth_token')?.value;
  if (!sessionToken) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const user = getUserBySession(sessionToken);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const siteId = url.searchParams.get('siteId');

  if (siteId) {
    if (user.role === 'client' && siteId !== 'camp-david-mvp') {
      return new Response(JSON.stringify({ error: 'Access forbidden for this site' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const site = getSiteData(siteId);
      return new Response(JSON.stringify({ success: true, site }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // List all sites available for user's scope
  const all = listManagedSites();
  const filtered =
    user.role === 'client' ? all.filter((s: Omit<ManagedSiteDefinition, 'history'>) => s.id === 'camp-david-mvp') : all;

  return new Response(JSON.stringify({ success: true, sites: filtered }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const sessionToken = cookies.get('infusio_auth_token')?.value;
  if (!sessionToken) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const user = getUserBySession(sessionToken);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json().catch(() => ({}));
  const { action, siteId } = body;

  if (action === 'rollback') {
    if (!siteId) {
      return new Response(JSON.stringify({ error: 'Missing siteId for rollback' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (user.role === 'client' && siteId !== 'camp-david-mvp') {
      return new Response(JSON.stringify({ error: 'Access forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const rollbackRes = rollbackSiteData(siteId);
    if (!rollbackRes.success) {
      return new Response(JSON.stringify({ error: rollbackRes.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(rollbackRes), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Unsupported action' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
};
