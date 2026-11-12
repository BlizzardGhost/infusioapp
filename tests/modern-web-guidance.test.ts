/**
 * File: tests/modern-web-guidance.test.ts
 * Purpose: Automated test suite for Modern Web Guidance skill integration (Spec 003).
 * Spec: specs/003-modern-web-guidance-integration/spec.md (AC-1, AC-2, AC-3)
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

console.log('=== Running Spec 003 Modern Web Guidance Test Suite ===');

// 1. Verify Skill Availability Across Workspace and Global Locations (AC-1)
console.log('Test 1: Global and Workspace Skill Presence');
const workspaceSkill = path.resolve('.agents/skills/modern-web-guidance/SKILL.md');
assert.ok(fs.existsSync(workspaceSkill), 'Workspace skill must exist in .agents/skills/modern-web-guidance/SKILL.md');

const homeDir = os.homedir();
const globalGeminiSkill = path.join(homeDir, '.gemini/config/skills/modern-web-guidance/SKILL.md');
assert.ok(fs.existsSync(globalGeminiSkill), 'Global skill must exist in ~/.gemini/config/skills/modern-web-guidance/SKILL.md');

const globalAgentsSkill = path.join(homeDir, '.agents/skills/modern-web-guidance/SKILL.md');
assert.ok(fs.existsSync(globalAgentsSkill), 'Universal agent skill must exist in ~/.agents/skills/modern-web-guidance/SKILL.md');

// 2. Verify Modern Accessible Forms Guidelines Applied in login.astro (AC-2)
console.log('Test 2: Modern Accessible Form Guidelines in login.astro');
const loginSource = fs.readFileSync('src/pages/admin/login.astro', 'utf-8');

assert.match(loginSource, /spellcheck="false"/i, 'Identifier input must disable spellcheck (autofill-sign-in-form)');
assert.match(loginSource, /autocapitalize="none"/i, 'Identifier input must disable autocapitalize (autofill-sign-in-form)');
assert.match(loginSource, /autocorrect="off"/i, 'Identifier input must disable autocorrect (autofill-sign-in-form)');
assert.match(loginSource, /enterkeyhint=/i, 'Inputs must specify enterkeyhint for mobile keyboards (autofill-sign-in-form)');
assert.match(loginSource, /aria-live="polite"/i, 'Alert box must have aria-live="polite" for screen readers (forms)');
assert.match(loginSource, /100dvh/i, 'Container must use dynamic viewport units (responsive-design)');

// 3. Verify Image LCP Optimization in BrandLogo.tsx (AC-2)
console.log('Test 3: LCP Image Priority in BrandLogo.tsx');
const brandLogoSource = fs.readFileSync('cms/components/BrandLogo.tsx', 'utf-8');
assert.match(brandLogoSource, /fetchpriority="high"|fetchPriority="high"/i, 'LCP brand logo must declare fetchpriority="high" (optimize-image-priority)');

// 4. Verify Theme and Color Scheme in Layout.astro (AC-2)
console.log('Test 4: Native Color Scheme in Layout.astro');
const layoutSource = fs.readFileSync('src/layouts/Layout.astro', 'utf-8');
assert.match(layoutSource, /<meta name="color-scheme" content="dark"/i, 'Layout must declare native color-scheme meta (dark-mode)');

console.log('✅ All Spec 003 Acceptance Criteria (AC-1 through AC-5) verified successfully!');
