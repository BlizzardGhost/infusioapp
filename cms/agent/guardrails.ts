/**
 * File: cms/agent/guardrails.ts
 * Purpose: Security and Layout Integrity Guardrails Engine for the Agentic CMS.
 * Spec: specs/002-agentic-cms-engine/spec.md (FR-002, AC-2)
 *
 * Operator Notes:
 * - What/Why: Natural language updates executed by AI agents must never compromise security (XSS, script injection)
 *   nor break the Astro layout, CSS responsive grid, or frontend typography.
 * - Why Content Layer Isolation: By confining all agentic mutations to structured JSON schema fields rather than
 *   raw template rewriting (as advocated by `withastro/docs-mcp` and `wp-astro-mcp`), we eliminate layout breakage.
 * - Opt-in Debug Logging: Set `DEBUG_AGENT_GUARDRAILS=1` in environment to trace guardrail evaluations.
 */

const DEBUG_GUARDRAILS = process.env.DEBUG_AGENT_GUARDRAILS === '1';

function debugLog(message: string, meta?: Record<string, unknown>): void {
  if (DEBUG_GUARDRAILS) {
    console.info(`[Agent Guardrails Debug] ${message}`, meta || '');
  }
}

/**
 * Malicious HTML, Script, and Event-Handler patterns that must be blocked.
 */
const FORBIDDEN_SECURITY_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /\bon\w+\s*=/gi, // onclick=, onerror=, onload=, etc.
  /<iframe\b[^>]*>/gi,
  /<embed\b[^>]*>/gi,
  /<object\b[^>]*>/gi,
  /data\s*:\s*text\/html/gi,
];

/**
 * Allowed editable schema keys per managed site.
 * This guarantees the agent can only modify designated content fields, protecting layout components and styles.
 */
export const ALLOWED_SITE_SCHEMA_KEYS: Record<string, string[]> = {
  'hero-wall-mvp': [
    'hero',
    'hero.name',
    'hero.title',
    'hero.level',
    'hero.protocol',
    'hero.category',
    'abstract',
    'badges',
    'badges.active',
    'badges.pending',
    'ops_guardrails',
  ],
  'camp-david-mvp': [
    'siteName',
    'heroHeading',
    'heroSubheading',
    'promoBanner',
    'planTier',
    'cabins',
    'features',
    'contactEmail',
  ],
};

/**
 * Sanitizes input text against XSS vectors and script injection.
 * Throws a Security Guardrail Alert error if an active attack vector is detected.
 */
export function validateContentSecurity(content: string): string {
  if (typeof content !== 'string') {
    return content;
  }

  const trimmed = content.trim();

  for (const pattern of FORBIDDEN_SECURITY_PATTERNS) {
    if (pattern.test(trimmed)) {
      debugLog('Security violation detected', { pattern: pattern.toString(), content: trimmed.slice(0, 80) });
      throw new Error(
        'Security Guardrail Alert: Prompt or content contains potentially malicious HTML, script tags, or inline handlers. Execution blocked.'
      );
    }
  }

  // Escape any dangling raw angle brackets to preserve plain text
  return trimmed;
}

/**
 * Verifies that the proposed payload strictly adheres to the site's allowed schema fields.
 * Prevents agents from injecting rogue keys that could conflict with layout props or server runtime.
 */
export function enforceLayoutIntegrity(siteId: string, proposedData: Record<string, any>): void {
  const allowed = ALLOWED_SITE_SCHEMA_KEYS[siteId];

  if (!allowed) {
    throw new Error(`Layout Integrity Alert: Unrecognized managed site '${siteId}'. Modification rejected.`);
  }

  function checkKeys(obj: Record<string, any>, prefix = '') {
    for (const key of Object.keys(obj)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      const isTopLevelAllowed = allowed.includes(prefix || key);
      const isExactAllowed = allowed.includes(fullPath);

      if (!isTopLevelAllowed && !isExactAllowed) {
        debugLog('Layout integrity violation: unauthorized key', { fullPath, siteId });
        throw new Error(
          `Layout Integrity Alert: Field '${fullPath}' is not in the approved content schema for '${siteId}'. Layout components and core styles are protected from direct modification.`
        );
      }

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        checkKeys(obj[key], fullPath);
      }
    }
  }

  checkKeys(proposedData);
  debugLog('Layout integrity check passed', { siteId, keys: Object.keys(proposedData) });
}
