/**
 * File: cms/agent/sitesStore.ts
 * Purpose: Centralized state store and historical snapshot engine for managed multi-site schemas.
 * Spec: specs/002-agentic-cms-engine/spec.md (FR-003, AC-1, AC-4, AC-5)
 *
 * Operator Notes:
 * - What/Why: Maintains structured content models for each client/internal site (`hero-wall-mvp`, `camp-david-mvp`).
 * - Why Snapshots: Every natural language mutation pushes a deep copy onto a history stack, enabling
 *   instant 1-click rollbacks if a change is deemed unsatisfactory by the operator.
 * - Opt-in Debug Logging: Set `DEBUG_SITES_STORE=1` to trace mutations and rollbacks.
 */

import { enforceLayoutIntegrity, validateContentSecurity } from './guardrails.ts';

const DEBUG_STORE = process.env.DEBUG_SITES_STORE === '1';

function debugLog(message: string, meta?: Record<string, unknown>): void {
  if (DEBUG_STORE) {
    console.info(`[Sites Store Debug] ${message}`, meta || '');
  }
}

export interface ManagedSiteDefinition {
  id: string;
  name: string;
  repo: string;
  url: string;
  framework: string;
  dataPath: string;
  data: Record<string, any>;
  history: Array<{
    timestamp: string;
    prompt: string;
    userId: string;
    dataSnapshot: Record<string, any>;
  }>;
}

/**
 * Initial canonical state for BlizzardGhost/hero-wall-mvp (matching src/data/hero.json)
 */
const DEFAULT_HERO_WALL_DATA = {
  hero: {
    name: 'Boris',
    title: 'LATAM AI Sherpa',
    level: 38,
    protocol: 'RASS v38.7.2',
    category: 'Explorer–Builder–Teacher',
  },
  abstract:
    'From siege to kairosis: clarity, serenity, and alignment with universal purpose. The Hero Wall is stage, compass, and cockpit — the flame carried into higher ground.',
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

/**
 * Initial canonical state for BlizzardGhost/camp-david-mvp (matching client workspace)
 */
const DEFAULT_CAMP_DAVID_DATA = {
  siteName: 'Camp David MVP',
  heroHeading: 'Experience Camp David: Luxury Cabins & Nature Retreat',
  heroSubheading:
    'Handcrafted accommodations, peaceful alpine environments, and five-star hospitality nestled in pristine mountain wilderness.',
  promoBanner: 'Summer Getaway: Book 3 Nights, Get 1 Complimentary',
  planTier: 'Growth Agency Tier',
  contactEmail: 'concierge@campdavidretreat.com',
  cabins: [
    { id: 'pine-ridge', name: 'Pine Ridge Lodge', guests: 6, rate: 380, available: true },
    { id: 'aspen-haven', name: 'Aspen Haven Cabin', guests: 4, rate: 290, available: true },
    { id: 'cedar-crest', name: 'Cedar Crest Suite', guests: 2, rate: 195, available: false },
  ],
  features: [
    { id: 'content_editor', name: 'Hero & Content Editor', enabled: true },
    { id: 'ai_seo', name: 'AI Generative SEO', enabled: true },
    { id: 'custom_domain', name: 'Custom Domain SSL', enabled: false },
    { id: 'ai_chat_agent', name: 'Autonomous Concierge Agent', enabled: false },
  ],
};

// In-memory store initialized with canonical snapshots
const SITES_REGISTRY: Record<string, ManagedSiteDefinition> = {
  'hero-wall-mvp': {
    id: 'hero-wall-mvp',
    name: 'Hero Wall MVP',
    repo: 'https://github.com/BlizzardGhost/hero-wall-mvp',
    url: 'https://hero-wall-mvp.vercel.app/',
    framework: 'Astro SSR / Vercel',
    dataPath: 'src/data/hero.json',
    data: JSON.parse(JSON.stringify(DEFAULT_HERO_WALL_DATA)),
    history: [],
  },
  'camp-david-mvp': {
    id: 'camp-david-mvp',
    name: 'Camp David MVP',
    repo: 'https://github.com/BlizzardGhost/camp-david-mvp',
    url: 'https://camp-david-mvp.vercel.app/',
    framework: 'Astro SSR / Vercel',
    dataPath: 'src/data/site.json',
    data: JSON.parse(JSON.stringify(DEFAULT_CAMP_DAVID_DATA)),
    history: [],
  },
};

/**
 * Retrieve current site record with live data
 */
export function getSiteData(siteId: string): ManagedSiteDefinition {
  const site = SITES_REGISTRY[siteId];
  if (!site) {
    throw new Error(`Managed site '${siteId}' not found in registry.`);
  }
  return JSON.parse(JSON.stringify(site));
}

/**
 * Retrieve list of all registered managed sites
 */
export function listManagedSites(): Array<Omit<ManagedSiteDefinition, 'history'>> {
  return Object.values(SITES_REGISTRY).map(({ id, name, repo, url, framework, dataPath, data }) => ({
    id,
    name,
    repo,
    url,
    framework,
    dataPath,
    data,
  }));
}

/**
 * Applies a verified mutation to the site data and pushes the prior state to history.
 */
export function updateSiteData({
  siteId,
  newData,
  prompt,
  userId,
}: {
  siteId: string;
  newData: Record<string, any>;
  prompt: string;
  userId: string;
}): {
  success: boolean;
  siteId: string;
  timestamp: string;
  data: Record<string, any>;
} {
  const site = SITES_REGISTRY[siteId];
  if (!site) {
    throw new Error(`Managed site '${siteId}' not found.`);
  }

  // 1. Guardrail validation
  validateContentSecurity(prompt);
  enforceLayoutIntegrity(siteId, newData);

  // 2. Snapshot previous state into history stack
  site.history.push({
    timestamp: new Date().toISOString(),
    prompt,
    userId,
    dataSnapshot: JSON.parse(JSON.stringify(site.data)),
  });

  // Limit history stack to 20 snapshots to prevent unbounded growth
  if (site.history.length > 20) {
    site.history.shift();
  }

  // 3. Deep merge new data
  site.data = JSON.parse(JSON.stringify(newData));

  debugLog('Site data updated successfully', { siteId, prompt, historyDepth: site.history.length });

  return {
    success: true,
    siteId,
    timestamp: new Date().toISOString(),
    data: JSON.parse(JSON.stringify(site.data)),
  };
}

/**
 * Rollbacks the site data to the most recent historical snapshot.
 */
export function rollbackSiteData(siteId: string): {
  success: boolean;
  siteId: string;
  restoredData?: Record<string, any>;
  error?: string;
} {
  const site = SITES_REGISTRY[siteId];
  if (!site) {
    return { success: false, siteId, error: `Site '${siteId}' not found.` };
  }

  if (site.history.length === 0) {
    return { success: false, siteId, error: `No previous snapshots available to roll back '${siteId}'.` };
  }

  const previousSnapshot = site.history.pop()!;
  site.data = JSON.parse(JSON.stringify(previousSnapshot.dataSnapshot));

  debugLog('Site data rolled back', { siteId, restoredPrompt: previousSnapshot.prompt });

  return {
    success: true,
    siteId,
    restoredData: JSON.parse(JSON.stringify(site.data)),
  };
}

/**
 * Resets site data to factory canonical defaults (useful for test isolation).
 */
export function resetSiteData(siteId: string): void {
  if (siteId === 'hero-wall-mvp') {
    SITES_REGISTRY['hero-wall-mvp'].data = JSON.parse(JSON.stringify(DEFAULT_HERO_WALL_DATA));
    SITES_REGISTRY['hero-wall-mvp'].history = [];
  } else if (siteId === 'camp-david-mvp') {
    SITES_REGISTRY['camp-david-mvp'].data = JSON.parse(JSON.stringify(DEFAULT_CAMP_DAVID_DATA));
    SITES_REGISTRY['camp-david-mvp'].history = [];
  }
}
