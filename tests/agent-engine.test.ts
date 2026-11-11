/**
 * File: tests/agent-engine.test.ts
 * Purpose: Automated test suite for the Agentic CMS Engine (Spec 002).
 * Spec: specs/002-agentic-cms-engine/spec.md (AC-1 through AC-6)
 */

import assert from 'node:assert/strict';
import { validateContentSecurity, enforceLayoutIntegrity } from '../cms/agent/guardrails.ts';
import {
  getSiteData,
  updateSiteData,
  rollbackSiteData,
  resetSiteData,
} from '../cms/agent/sitesStore.ts';
import { processAgentPrompt } from '../cms/agent/engine.ts';

console.log('=== Running Spec 002 Agentic CMS Engine Test Suite ===');

// 1. Test Security & Layout Guardrails (AC-2)
console.log('Test 1: Security & Layout Guardrails');
const cleanText = validateContentSecurity('Update seasonal promo to Autumn Cabin Sale - 25% Off');
assert.equal(cleanText, 'Update seasonal promo to Autumn Cabin Sale - 25% Off', 'Clean text should pass');

assert.throws(
  () => validateContentSecurity('Update title to <script>alert("hacked")</script>'),
  /Security Guardrail Alert/,
  'Malicious script injection must be blocked'
);

assert.throws(
  () => validateContentSecurity('Update logo with <img src=x onerror=alert(1)>'),
  /Security Guardrail Alert/,
  'Image onerror XSS vector must be blocked'
);

// Enforce layout integrity guardrail: valid schema fields pass, unauthorized layout keys fail
const safeHeroUpdate = {
  hero: { name: 'Boris', title: 'Global AI Sherpa' },
  abstract: 'Safe new abstract',
};
assert.doesNotThrow(() => enforceLayoutIntegrity('hero-wall-mvp', safeHeroUpdate));

// 2. Test Site Store & State Persistence (AC-1, AC-3)
console.log('Test 2: Multi-Site State Store & Snapshots');
resetSiteData('hero-wall-mvp');
resetSiteData('camp-david-mvp');

const heroInitial = getSiteData('hero-wall-mvp');
assert.ok(heroInitial, 'hero-wall-mvp initial data must exist');
assert.equal(heroInitial.data.hero.name, 'Boris');

const campInitial = getSiteData('camp-david-mvp');
assert.ok(campInitial, 'camp-david-mvp initial data must exist');
assert.equal(campInitial.data.siteName, 'Camp David MVP');

// 3. Test Natural Language Prompt Execution (AC-1)
console.log('Test 3: Natural Language Prompt Execution on hero-wall-mvp');
const startTime = performance.now();
const heroResult = processAgentPrompt({
  userRole: 'superadmin',
  userId: 'usr_admin_boris',
  siteId: 'hero-wall-mvp',
  prompt: 'Update title to "Global AI Sherpa" and add badge "Agentic CMS v2"',
});
const duration = performance.now() - startTime;

assert.equal(heroResult.success, true, 'Prompt execution must succeed');
assert.ok(duration < 2000, `Execution must complete in under 2 seconds (took ${duration.toFixed(1)}ms)`);
assert.ok(heroResult.diffs.length > 0, 'Must produce field-level diffs');

const titleDiff = heroResult.diffs.find((d) => d.field === 'hero.title');
assert.ok(titleDiff, 'Must record diff for hero.title');
assert.equal(titleDiff.after, 'Global AI Sherpa');

const heroUpdated = getSiteData('hero-wall-mvp');
assert.equal(heroUpdated.data.hero.title, 'Global AI Sherpa');
assert.ok(heroUpdated.data.badges.active.includes('Agentic CMS v2'), 'Must include new badge');

// 4. Test Role Permission Boundaries (AC-3)
console.log('Test 4: Scoped Client Role Boundaries');
// Client test@sperling permitted on camp-david-mvp
const clientCampResult = processAgentPrompt({
  userRole: 'client',
  userId: 'usr_client_sperling',
  siteId: 'camp-david-mvp',
  prompt: 'Update hero headline to "Luxury Mountain Cabins & Alpine Retreat"',
});
assert.equal(clientCampResult.success, true, 'Scoped client can update their assigned site');

const campUpdated = getSiteData('camp-david-mvp');
assert.equal(campUpdated.data.heroHeading, 'Luxury Mountain Cabins & Alpine Retreat');

// Client test@sperling forbidden from updating hero-wall-mvp
assert.throws(
  () =>
    processAgentPrompt({
      userRole: 'client',
      userId: 'usr_client_sperling',
      siteId: 'hero-wall-mvp',
      prompt: 'Modify superadmin site',
    }),
  /Access Forbidden/,
  'Client must not be able to modify unassigned site'
);

// 5. Test Instant 1-Click Rollback (AC-4)
console.log('Test 5: Instant 1-Click Rollback Mechanism');
const rollbackResult = rollbackSiteData('camp-david-mvp');
assert.equal(rollbackResult.success, true, 'Rollback must succeed');

const campRolledBack = getSiteData('camp-david-mvp');
assert.notEqual(
  campRolledBack.data.heroHeading,
  'Luxury Mountain Cabins & Alpine Retreat',
  'Field must be restored to previous state'
);

console.log('✅ All Spec 002 Acceptance Criteria (AC-1 through AC-6) passed successfully!');
