/**
 * File: cms/components/AdminDashboard.tsx
 * Purpose: Master Superadmin Control Plane for boris@computacionintegral.com with the
 *          Agentic Copilot Console for natural language multi-site management.
 * Spec: specs/002-agentic-cms-engine/spec.md (FR-004, AC-1, AC-2, AC-4)
 *
 * Operator Notes:
 * - What/Why: Replaces static mock sync with a real-time natural language agent console.
 *   Operators can prompt changes to hero-wall-mvp or camp-david-mvp in plain English,
 *   inspect generated field-level diffs, and perform instant rollbacks.
 * - Guardrail Protection: Guarantees zero layout corruption by enforcing Astro Content Layer schemas.
 */

import React, { useState, useEffect } from 'react';
import { CustomNav } from './CustomNav';
import { CustomFooter } from './CustomFooter';
import { INITIAL_USERS } from '../auth/users';

export interface AdminDashboardProps {
  user?: {
    name?: string;
    handle?: string;
    identifier?: string;
  };
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user = { name: 'Boris', handle: 'BlizzardGhost', identifier: 'boris@computacionintegral.com' },
}) => {
  // Target site selection
  const [selectedSiteId, setSelectedSiteId] = useState<'hero-wall-mvp' | 'camp-david-mvp'>('hero-wall-mvp');

  // Agent console state
  const [promptInput, setPromptInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [agentFeedback, setAgentFeedback] = useState<{
    success: boolean;
    message: string;
    executionMs?: number;
    diffs?: Array<{ field: string; before: any; after: any }>;
  } | null>(null);

  // Live site state
  const [heroProfile, setHeroProfile] = useState({
    name: 'Boris',
    title: 'LATAM AI Sherpa',
    level: 38,
    protocol: 'RASS v38.7.2',
    category: 'Explorer–Builder–Teacher',
    abstract:
      'From siege to kairosis: clarity, serenity, and alignment with universal purpose. The Hero Wall is stage, compass, and cockpit — the flame carried into higher ground.',
    activeBadges: ['Siege Survivor (July 2025)', 'Kairosis Ignition (v38.7.0)', 'System Architect (Infusion 2.0 launch prep)'],
    pendingBadges: ['Founder Oath (Aug 2025)', 'Manifesto Anchor (Aug 2025)', 'First Agent Badge (Aug 2025)', 'Conviction Filter (Aug 2025)', 'Enjoy Directive (Aug 2025)'],
    lastSynced: 'Live',
  });

  const [campSiteData, setCampSiteData] = useState({
    siteName: 'Camp David MVP',
    heroHeading: 'Experience Camp David: Luxury Cabins & Nature Retreat',
    heroSubheading: 'Handcrafted accommodations, peaceful alpine environments, and five-star hospitality.',
    promoBanner: 'Summer Getaway: Book 3 Nights, Get 1 Complimentary',
  });

  // Client Authenticator & Dispatch Code state
  const [generatedClientCodes, setGeneratedClientCodes] = useState<
    Record<string, { code: string; setupSecret?: string; expiresAt: number }>
  >({});
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const clients = INITIAL_USERS.filter((u) => u.role === 'client');

  // Load latest site data from API on mount
  useEffect(() => {
    fetchSiteState('hero-wall-mvp');
    fetchSiteState('camp-david-mvp');
  }, []);

  const fetchSiteState = async (siteId: string) => {
    try {
      const res = await fetch(`/api/agent/v1/sites?siteId=${siteId}`);
      const data = await res.json();
      if (data.success && data.site?.data) {
        if (siteId === 'hero-wall-mvp') {
          const d = data.site.data;
          setHeroProfile({
            name: d.hero?.name || 'Boris',
            title: d.hero?.title || 'LATAM AI Sherpa',
            level: d.hero?.level || 38,
            protocol: d.hero?.protocol || 'RASS v38.7.2',
            category: d.hero?.category || 'Explorer–Builder–Teacher',
            abstract: d.abstract || '',
            activeBadges: d.badges?.active || [],
            pendingBadges: d.badges?.pending || [],
            lastSynced: 'Just now',
          });
        } else if (siteId === 'camp-david-mvp') {
          const d = data.site.data;
          setCampSiteData({
            siteName: d.siteName || 'Camp David MVP',
            heroHeading: d.heroHeading || '',
            heroSubheading: d.heroSubheading || '',
            promoBanner: d.promoBanner || '',
          });
        }
      }
    } catch {
      // Offline fallback
    }
  };

  const handleExecutePrompt = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToRun = customPrompt || promptInput;
    if (!promptToRun.trim()) return;

    setIsExecuting(true);
    setAgentFeedback(null);

    try {
      const res = await fetch('/api/agent/v1/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: selectedSiteId,
          prompt: promptToRun.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAgentFeedback({
          success: true,
          message: data.message,
          executionMs: data.executionMs,
          diffs: data.diffs,
        });

        // Update local views immediately
        if (selectedSiteId === 'hero-wall-mvp' && data.updatedData) {
          const d = data.updatedData;
          setHeroProfile((prev) => ({
            ...prev,
            name: d.hero?.name || prev.name,
            title: d.hero?.title || prev.title,
            level: d.hero?.level || prev.level,
            abstract: d.abstract || prev.abstract,
            activeBadges: d.badges?.active || prev.activeBadges,
            lastSynced: 'Just now',
          }));
        } else if (selectedSiteId === 'camp-david-mvp' && data.updatedData) {
          const d = data.updatedData;
          setCampSiteData({
            siteName: d.siteName || campSiteData.siteName,
            heroHeading: d.heroHeading || campSiteData.heroHeading,
            heroSubheading: d.heroSubheading || campSiteData.heroSubheading,
            promoBanner: d.promoBanner || campSiteData.promoBanner,
          });
        }

        setPromptInput('');
      } else {
        setAgentFeedback({
          success: false,
          message: data.error || 'Agent prompt failed to execute.',
        });
      }
    } catch {
      setAgentFeedback({
        success: false,
        message: 'Network error communicating with Agentic CMS Engine.',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRollback = async () => {
    setIsExecuting(true);
    try {
      const res = await fetch('/api/agent/v1/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rollback',
          siteId: selectedSiteId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAgentFeedback({
          success: true,
          message: `↺ Rollback successful: Restored previous snapshot for ${selectedSiteId}.`,
        });
        fetchSiteState(selectedSiteId);
      } else {
        setAgentFeedback({
          success: false,
          message: data.error || 'Failed to rollback snapshot.',
        });
      }
    } catch {
      setAgentFeedback({
        success: false,
        message: 'Network error performing rollback.',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleGenerateCodeForClient = async (identifier: string) => {
    try {
      const res = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, adminDispatch: true }),
      });
      const data = await res.json();
      if (data.clientDispatchCode) {
        setGeneratedClientCodes((prev) => ({
          ...prev,
          [identifier]: {
            code: data.clientDispatchCode,
            setupSecret: data.clientSetupSecret,
            expiresAt: Date.now() + 10 * 60 * 1000,
          },
        }));
      }
    } catch {
      // Fallback
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 3000);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  return (
    <div
      className="infusio-dashboard-root"
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#0e1113',
        color: '#e8eef7',
        fontFamily: "'Quicksand', system-ui, -apple-system, sans-serif",
      }}
    >
      <CustomNav />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header
          style={{
            height: '70px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            backgroundColor: 'rgba(11, 15, 17, 0.85)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img
              src="/assets/brand-logo.webp"
              alt="Infusio"
              style={{ height: '28px', width: 'auto', objectFit: 'contain' }}
            />
            <span
              style={{
                fontSize: '0.85rem',
                color: '#717d91',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                paddingLeft: '16px',
              }}
            >
              Master Agentic Control Plane
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                background: 'rgba(19, 194, 150, 0.12)',
                color: '#13c296',
                border: '1px solid rgba(19, 194, 150, 0.3)',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#13c296',
                  boxShadow: '0 0 8px #13c296',
                }}
              />
              Superadmin: {user.identifier}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                borderRadius: '999px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: 'transparent',
                color: '#a8b1c1',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'Quicksand, sans-serif',
              }}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Dashboard Main View */}
        <main style={{ flex: 1, padding: '36px 32px', maxWidth: '1400px' }}>
          {/* SECTION 1: AGENTIC COPILOT CONSOLE */}
          <div
            style={{
              padding: '30px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, rgba(19, 194, 150, 0.14) 0%, rgba(45, 212, 191, 0.05) 50%, rgba(14, 17, 19, 0.85) 100%)',
              border: '1px solid rgba(19, 194, 150, 0.35)',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
              marginBottom: '32px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: '#2dd4bf',
                    }}
                  >
                    ⚡ Autonomous Agentic Copilot
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(19, 194, 150, 0.2)',
                      color: '#13c296',
                      fontWeight: 700,
                    }}
                  >
                    Astro Content Layer Guardrails
                  </span>
                </div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '6px 0 4px 0', color: '#e8eef7' }}>
                  Natural Language Website Orchestrator
                </h1>
                <p style={{ margin: 0, color: '#a8b1c1', fontSize: '0.875rem' }}>
                  Prompt in plain English to build, manage, and update websites in seconds. Zero layout, CSS, or backend breakage guaranteed.
                </p>
              </div>

              {/* Target Site Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: '#717d91', fontWeight: 700 }}>TARGET SITE:</span>
                <select
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value as any)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: '#0e1113',
                    border: '1px solid rgba(19, 194, 150, 0.4)',
                    color: '#2dd4bf',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Quicksand, sans-serif',
                  }}
                >
                  <option value="hero-wall-mvp">Hero Wall MVP (hero-wall-mvp)</option>
                  <option value="camp-david-mvp">Camp David MVP (camp-david-mvp)</option>
                </select>
              </div>
            </div>

            {/* Prompt Form */}
            <form onSubmit={handleExecutePrompt} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder={
                  selectedSiteId === 'hero-wall-mvp'
                    ? 'e.g. Update title to "Global AI Sherpa & Agent Architect" and add badge "Agentic CMS v2"'
                    : 'e.g. Update hero headline to "Luxury Mountain Cabins & Alpine Retreat"'
                }
                disabled={isExecuting}
                style={{
                  flex: 1,
                  minWidth: '280px',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: 'rgba(0, 0, 0, 0.45)',
                  border: '1px solid rgba(19, 194, 150, 0.4)',
                  color: '#e8eef7',
                  fontSize: '0.95rem',
                  fontFamily: 'Quicksand, sans-serif',
                  outline: 'none',
                }}
              />

              <button
                type="submit"
                disabled={isExecuting || !promptInput.trim()}
                style={{
                  padding: '14px 26px',
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, #13c296, #2dd4bf)',
                  color: '#0b0f11',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: isExecuting || !promptInput.trim() ? 'not-allowed' : 'pointer',
                  opacity: isExecuting || !promptInput.trim() ? 0.6 : 1,
                  fontFamily: 'Quicksand, sans-serif',
                  boxShadow: '0 4px 14px rgba(19, 194, 150, 0.3)',
                  whiteSpace: 'nowrap',
                }}
              >
                {isExecuting ? '⚡ Executing in Agent...' : '⚡ Run Agentic Update'}
              </button>

              <button
                type="button"
                onClick={handleRollback}
                disabled={isExecuting}
                title="Roll back to previous snapshot"
                style={{
                  padding: '14px 18px',
                  borderRadius: '999px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#a8b1c1',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: isExecuting ? 'not-allowed' : 'pointer',
                  fontFamily: 'Quicksand, sans-serif',
                }}
              >
                ↺ Rollback
              </button>
            </form>

            {/* Quick Presets */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}>
              <span style={{ fontSize: '0.72rem', color: '#717d91', fontWeight: 700, textTransform: 'uppercase' }}>
                Quick Presets:
              </span>
              {selectedSiteId === 'hero-wall-mvp' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleExecutePrompt(undefined, 'Update title to "Global AI Sherpa & Agent Architect"')}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '999px',
                      padding: '4px 12px',
                      fontSize: '0.74rem',
                      color: '#2dd4bf',
                      cursor: 'pointer',
                    }}
                  >
                    + Title: "Global AI Sherpa"
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecutePrompt(undefined, 'Add badge "Autonomous Agentic CMS v2"')}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '999px',
                      padding: '4px 12px',
                      fontSize: '0.74rem',
                      color: '#2dd4bf',
                      cursor: 'pointer',
                    }}
                  >
                    + Badge: "Agentic CMS v2"
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecutePrompt(undefined, 'Level to 40')}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '999px',
                      padding: '4px 12px',
                      fontSize: '0.74rem',
                      color: '#2dd4bf',
                      cursor: 'pointer',
                    }}
                  >
                    + Level to 40
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleExecutePrompt(undefined, 'Update hero headline to "Luxury Mountain Cabins & Alpine Retreat"')}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '999px',
                      padding: '4px 12px',
                      fontSize: '0.74rem',
                      color: '#2dd4bf',
                      cursor: 'pointer',
                    }}
                  >
                    + Headline: "Luxury Mountain Cabins"
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecutePrompt(undefined, 'Update promo banner to "Winter Retreat: 25% Off 3+ Nights"')}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '999px',
                      padding: '4px 12px',
                      fontSize: '0.74rem',
                      color: '#2dd4bf',
                      cursor: 'pointer',
                    }}
                  >
                    + Promo: "Winter Retreat - 25% Off"
                  </button>
                </>
              )}
            </div>

            {/* Execution Feedback & Before/After Diffs */}
            {agentFeedback && (
              <div
                style={{
                  marginTop: '18px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: agentFeedback.success ? 'rgba(19, 194, 150, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  border: `1px solid ${agentFeedback.success ? 'rgba(19, 194, 150, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: agentFeedback.success ? '#2dd4bf' : '#f87171',
                    }}
                  >
                    {agentFeedback.success ? '✓ ' : '✕ '} {agentFeedback.message}
                  </span>
                  {agentFeedback.executionMs && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        color: '#13c296',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                      }}
                    >
                      {agentFeedback.executionMs}ms
                    </span>
                  )}
                </div>

                {/* Diff Viewer */}
                {agentFeedback.diffs && agentFeedback.diffs.length > 0 && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#717d91' }}>
                      Field Diffs Applied:
                    </div>
                    {agentFeedback.diffs.map((d, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          background: 'rgba(0, 0, 0, 0.35)',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <code style={{ color: '#2dd4bf', fontWeight: 700 }}>{d.field}</code>:
                        <span style={{ color: '#f87171', textDecoration: 'line-through' }}>
                          {typeof d.before === 'object' ? JSON.stringify(d.before) : String(d.before)}
                        </span>
                        <span>→</span>
                        <span style={{ color: '#13c296', fontWeight: 700 }}>
                          {typeof d.after === 'object' ? JSON.stringify(d.after) : String(d.after)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 2: LIVE SITE PREVIEW (HERO WALL MVP) */}
          <div
            style={{
              padding: '28px',
              borderRadius: '16px',
              background: '#14191d',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#e8eef7' }}>
                    Live Profile: Hero Wall MVP
                  </h2>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: 'rgba(19, 194, 150, 0.2)',
                      color: '#13c296',
                      fontWeight: 700,
                    }}
                  >
                    src/data/hero.json
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#717d91' }}>
                  Target: <a href="https://github.com/BlizzardGhost/hero-wall-mvp" target="_blank" rel="noreferrer" style={{ color: '#2dd4bf' }}>BlizzardGhost/hero-wall-mvp ↗</a>
                </p>
              </div>

              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#a8b1c1',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                }}
              >
                Protocol: <strong style={{ color: '#2dd4bf' }}>{heroProfile.protocol}</strong>
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
              }}
            >
              <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.75rem', color: '#717d91', textTransform: 'uppercase', fontWeight: 700 }}>
                  Hero Identity & Title
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '4px', color: '#e8eef7' }}>
                  {heroProfile.name}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#13c296', marginTop: '2px', fontWeight: 600 }}>
                  {heroProfile.title} (Level {heroProfile.level})
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.75rem', color: '#717d91', textTransform: 'uppercase', fontWeight: 700 }}>
                  Active Badges ({heroProfile.activeBadges.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {heroProfile.activeBadges.map((badge, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: 'rgba(19, 194, 150, 0.15)',
                        color: '#2dd4bf',
                        fontWeight: 600,
                      }}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.75rem', color: '#717d91', textTransform: 'uppercase', fontWeight: 700 }}>
                  Abstract & Directive
                </div>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: '#a8b1c1', lineHeight: 1.5 }}>
                  {heroProfile.abstract}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 3: CLIENT ACCESS & SECURITY MANAGEMENT */}
          <div
            style={{
              padding: '28px',
              borderRadius: '16px',
              background: '#14191d',
              border: '1px solid rgba(19, 194, 150, 0.3)',
              marginBottom: '32px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px 0', color: '#e8eef7' }}>
                  Client Access Management (Authenticator & Admin Dispatch)
                </h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#a8b1c1' }}>
                  Retrieve live 6-digit Authenticator codes or Base32 setup keys for client accounts without email.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {clients.map((client) => {
                const active = generatedClientCodes[client.identifier];
                const isCodeLive = active && Date.now() < active.expiresAt;

                return (
                  <div
                    key={client.id}
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#e8eef7' }}>
                          {client.displayName}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'rgba(19, 194, 150, 0.15)',
                            color: '#13c296',
                            fontWeight: 700,
                          }}
                        >
                          {client.assignedSite?.plan || 'Client Tier'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.825rem', color: '#a8b1c1' }}>
                        Login Identifier: <strong style={{ color: '#e8eef7' }}>{client.identifier}</strong> (no email required)
                      </div>

                      {client.assignedSite && (
                        <div style={{ fontSize: '0.8rem', color: '#717d91' }}>
                          Scoped Site: <a href={client.assignedSite.url} target="_blank" rel="noopener noreferrer" style={{ color: '#2dd4bf', textDecoration: 'underline' }}>{client.assignedSite.url} ↗</a>
                        </div>
                      )}
                    </div>

                    {/* Token Generator Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      {isCodeLive ? (
                        <>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div
                              style={{
                                padding: '10px 18px',
                                borderRadius: '8px',
                                background: '#0e1113',
                                border: '1px solid #13c296',
                                fontFamily: 'monospace',
                                fontSize: '1.25rem',
                                fontWeight: 800,
                                color: '#13c296',
                                letterSpacing: '0.2em',
                              }}
                            >
                              {active.code}
                            </div>
                            {active.setupSecret && (
                              <div style={{ fontSize: '0.7rem', color: '#a8b1c1', fontFamily: 'monospace' }}>
                                Setup Key: {active.setupSecret}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyCode(active.code, client.id)}
                            style={{
                              padding: '10px 18px',
                              borderRadius: '999px',
                              background: copiedToken === client.id ? '#13c296' : 'rgba(255, 255, 255, 0.08)',
                              color: copiedToken === client.id ? '#0b0f11' : '#e8eef7',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              border: 'none',
                              cursor: 'pointer',
                              fontFamily: 'Quicksand, sans-serif',
                            }}
                          >
                            {copiedToken === client.id ? '✓ Copied!' : 'Copy 6-Digit Code'}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleGenerateCodeForClient(client.identifier)}
                          style={{
                            padding: '10px 20px',
                            borderRadius: '999px',
                            background: 'linear-gradient(135deg, #13c296, #2dd4bf)',
                            color: '#0b0f11',
                            fontWeight: 800,
                            fontSize: '0.825rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontFamily: 'Quicksand, sans-serif',
                            boxShadow: '0 4px 12px rgba(19, 194, 150, 0.25)',
                          }}
                        >
                          View Client Code & Setup Key
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        <CustomFooter />
      </div>
    </div>
  );
};

export default AdminDashboard;
