import React, { useState } from 'react';
import { CustomNav } from './CustomNav';
import { CustomFooter } from './CustomFooter';

export interface AdminDashboardProps {
  user?: {
    name?: string;
    handle?: string;
  };
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user = { name: 'Boris', handle: 'BlizzardGhost' },
}) => {
  // Hero Wall test profile state directly matching hero-wall-mvp
  const [heroProfile, setHeroProfile] = useState({
    name: 'Boris',
    title: 'LATAM AI Sherpa',
    level: 38,
    protocol: 'RASS v38.7.2',
    category: 'Explorer–Builder–Teacher',
    abstract: 'From siege to kairosis: clarity, serenity, and alignment with universal purpose. The Hero Wall is stage, compass, and cockpit — the flame carried into higher ground.',
    activeBadges: ['Siege Survivor (July 2025)', 'Kairosis Ignition (v38.7.0)', 'System Architect (Infusion 2.0 launch prep)'],
    pendingBadges: ['Founder Oath (Aug 2025)', 'Manifesto Anchor (Aug 2025)', 'First Agent Badge (Aug 2025)', 'Conviction Filter (Aug 2025)', 'Enjoy Directive (Aug 2025)'],
    guardrails: [
      'Planning only in #0; Execution only in #11.',
      'Agent edits restricted to structured JSON schema.',
      'Base CSS and manual rollback always available.'
    ],
    lastSynced: 'Just now',
    status: 'SYNCHRONIZED',
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleTriggerAgentSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await fetch('/api/agent/v1/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroProfile),
      });
      const data = await res.json();
      setSyncFeedback(data.message || 'Antigravity agent synchronized Hero Wall schema successfully.');
      setHeroProfile((prev) => ({ ...prev, lastSynced: 'Just now', status: 'SYNCHRONIZED' }));
    } catch {
      setSyncFeedback('Local mock sync executed. Ready to commit to GitHub.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div
      className="infusio-dashboard-root"
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--bg, #0e1113)',
        color: 'var(--ink, #e8eef7)',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Side Navigation Override */}
      <CustomNav />

      {/* Main Administrative View */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {/* Top Header Bar */}
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
              style={{ height: '30px', width: 'auto', objectFit: 'contain' }}
            />
            <span
              style={{
                fontSize: '0.85rem',
                color: '#717d91',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                paddingLeft: '16px',
              }}
            >
              Multi-Repo Headless Control Plane
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
              Target Repo: infusioapp.git
            </span>

            <a
              href="https://github.com/BlizzardGhost"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.8125rem',
                color: '#a8b1c1',
                textDecoration: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s',
              }}
            >
              GitHub / BlizzardGhost ↗
            </a>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <main style={{ flex: 1, padding: '36px 32px', maxWidth: '1400px' }}>
          {/* Welcome Banner */}
          <div
            style={{
              padding: '32px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(19, 194, 150, 0.15) 0%, rgba(45, 212, 191, 0.08) 50%, rgba(14, 17, 19, 0.8) 100%)',
              border: '1px solid rgba(19, 194, 150, 0.3)',
              marginBottom: '32px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ maxWidth: '680px' }}>
                <div
                  style={{
                    display: 'inline-block',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: '#2dd4bf',
                    marginBottom: '8px',
                  }}
                >
                  Agentic Content Engineering • Multi-Repo Hub
                </div>
                <h1
                  style={{
                    fontSize: '1.9rem',
                    fontWeight: 800,
                    margin: '0 0 10px 0',
                    letterSpacing: '-0.02em',
                    color: '#e8eef7',
                  }}
                >
                  Welcome, {user.name} (@{user.handle})
                </h1>
                <p style={{ margin: 0, color: '#a8b1c1', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  This CMS is configured to orchestrate all GitHub repositories under your account, interfaced directly with the Antigravity agent. First live integration test is configured with <strong>hero-wall-mvp</strong>.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={handleTriggerAgentSync}
                  disabled={isSyncing}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #13c296, #2dd4bf)',
                    color: '#0b0f11',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(19, 194, 150, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {isSyncing ? 'Syncing...' : '⚡ Sync hero-wall-mvp'}
                </button>
              </div>
            </div>

            {syncFeedback && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: 'rgba(19, 194, 150, 0.15)',
                  border: '1px solid rgba(19, 194, 150, 0.3)',
                  color: '#2dd4bf',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                }}
              >
                ✓ {syncFeedback}
              </div>
            )}
          </div>

          {/* TEST INTEGRATION: HERO WALL MVP LIVE INSPECTION & EDITING */}
          <div
            style={{
              padding: '28px',
              borderRadius: '16px',
              background: '#14191d',
              border: '1px solid rgba(19, 194, 150, 0.25)',
              marginBottom: '32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#e8eef7' }}>
                    Active Integration Test: Hero Wall MVP
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
                  Target: <code>https://github.com/BlizzardGhost/hero-wall-mvp</code>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
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
            </div>

            {/* Profile Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.75rem', color: '#717d91', textTransform: 'uppercase', fontWeight: 700 }}>
                  Hero Identity
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '4px', color: '#e8eef7' }}>
                  {heroProfile.name}
                </div>
                <div style={{ fontSize: '0.825rem', color: '#13c296', marginTop: '2px' }}>
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
                  Pending Badges ({heroProfile.pendingBadges.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {heroProfile.pendingBadges.slice(0, 3).map((badge, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#a8b1c1',
                      }}
                    >
                      {badge}
                    </span>
                  ))}
                  {heroProfile.pendingBadges.length > 3 && (
                    <span style={{ fontSize: '0.72rem', color: '#717d91' }}>
                      +{heroProfile.pendingBadges.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Abstract Box */}
            <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.75rem', color: '#717d91', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                Abstract Statement
              </div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#a8b1c1', lineHeight: 1.6 }}>
                "{heroProfile.abstract}"
              </p>
            </div>
          </div>

          {/* Managed GitHub Repositories Matrix */}
          <div
            style={{
              padding: '28px',
              borderRadius: '16px',
              background: '#0e1113',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px 0', color: '#e8eef7' }}>
              Connected GitHub Ecosystem Matrix
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '20px', borderRadius: '12px', background: '#14191d', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#e8eef7' }}>hero-wall-mvp</span>
                  <span style={{ fontSize: '0.7rem', color: '#13c296', fontWeight: 700 }}>ACTIVE TEST</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#717d91', marginTop: '4px' }}>
                  Astro 5 SSR • Hero Wall cockpit
                </div>
                <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#2dd4bf' }}>
                  Schema: hero.json & hero.agent.json
                </div>
              </div>

              <div style={{ padding: '20px', borderRadius: '12px', background: '#14191d', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#e8eef7' }}>infusio-site</span>
                  <span style={{ fontSize: '0.7rem', color: '#38BDF8', fontWeight: 700 }}>PRODUCTION</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#717d91', marginTop: '4px' }}>
                  Main Infusio Studio Platform
                </div>
                <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#a8b1c1' }}>
                  Branding Origin & Design System
                </div>
              </div>

              <div style={{ padding: '20px', borderRadius: '12px', background: '#14191d', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#e8eef7' }}>infusioapp</span>
                  <span style={{ fontSize: '0.7rem', color: '#C084FC', fontWeight: 700 }}>THIS CMS REPO</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#717d91', marginTop: '4px' }}>
                  Centralized Headless Architecture & Agent API
                </div>
                <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#a8b1c1' }}>
                  Connected to Antigravity
                </div>
              </div>
            </div>
          </div>
        </main>

        <CustomFooter />
      </div>
    </div>
  );
};

export default AdminDashboard;
