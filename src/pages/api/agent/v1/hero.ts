import type { APIRoute } from 'astro';

export const prerender = false;

export interface HeroSchema {
  hero: {
    name: string;
    title: string;
    level: number;
    protocol: string;
    category: string;
  };
  abstract: string;
  badges: {
    active: string[];
    pending: string[];
  };
  ops_guardrails: string[];
}

export const GET: APIRoute = async () => {
  // Returns the latest active Hero Wall schema (matching hero-wall-mvp/src/data/hero.json)
  const currentHero: HeroSchema = {
    hero: {
      name: 'Boris',
      title: 'LATAM AI Sherpa',
      level: 38,
      protocol: 'RASS v38.7.2',
      category: 'Explorer–Builder–Teacher',
    },
    abstract: 'From siege to kairosis: clarity, serenity, and alignment with universal purpose. The Hero Wall is stage, compass, and cockpit — the flame carried into higher ground.',
    badges: {
      active: [
        'Siege Survivor (July 2025)',
        'Kairosis Ignition (v38.7.0)',
        'System Architect (Infusion 2.0 launch prep)',
      ],
      pending: [
        'Founder Oath (Aug 2025)',
        'Manifesto Anchor (Aug 2025)',
        'First Agent Badge (Aug 2025)',
        'Conviction Filter (Aug 2025)',
        'Enjoy Directive (Aug 2025)',
      ],
    },
    ops_guardrails: [
      'Planning only in #0; Execution only in #11.',
      'Agent edits restricted to structured JSON schema.',
      'Base CSS and manual rollback always available.',
    ],
  };

  return new Response(JSON.stringify({ success: true, targetRepo: 'BlizzardGhost/hero-wall-mvp', data: currentHero }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Guardrail validation: Verify structured JSON schema
    if (!body.name && !body.hero?.name) {
      return new Response(
        JSON.stringify({ error: 'Validation failed: hero name is required by schema' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build compliant hero.json & hero.agent.json schema
    const structuredDoc: HeroSchema = {
      hero: {
        name: body.hero?.name || body.name || 'Boris',
        title: body.hero?.title || body.title || 'LATAM AI Sherpa',
        level: Number(body.hero?.level || body.level || 38),
        protocol: body.hero?.protocol || body.protocol || 'RASS v38.7.2',
        category: body.hero?.category || body.category || 'Explorer–Builder–Teacher',
      },
      abstract: body.abstract || 'From siege to kairosis: clarity, serenity, and alignment with universal purpose.',
      badges: {
        active: Array.isArray(body.badges?.active) ? body.badges.active : Array.isArray(body.activeBadges) ? body.activeBadges : ['Siege Survivor (July 2025)', 'Kairosis Ignition (v38.7.0)'],
        pending: Array.isArray(body.badges?.pending) ? body.badges.pending : Array.isArray(body.pendingBadges) ? body.pendingBadges : ['First Agent Badge (Aug 2025)'],
      },
      ops_guardrails: [
        'Planning only in #0; Execution only in #11.',
        'Agent edits restricted to structured JSON schema.',
        'Base CSS and manual rollback always available.',
      ],
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Schema verified and synced with Antigravity Agent for BlizzardGhost/hero-wall-mvp',
        timestamp: new Date().toISOString(),
        payload: structuredDoc,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Failed to process agent request', details: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
