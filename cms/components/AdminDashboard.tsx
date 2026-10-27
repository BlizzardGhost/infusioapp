import React, { useState } from 'react';
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
    lastSynced: 'Just now',
    status: 'SYNCHRONIZED',
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Clients from directory
  const clients = INITIAL_USERS.filter((u) => u.role === 'client');

  const handleCopyToken = (token: string, id: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 3000);
  };

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
        backgroundColor: 'var(--bg, #0e1113)',
        color: 'var(--ink, #e8eef7)',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
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
              Master Admin Control Plane
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
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: 'transparent',
                color: '#a8b1c1',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Dashboard Main View */}
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
                  Master Agency Control • Token Auth Engine
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
                  Global Overview: {user.identifier}
                </h1>
                <p style={{ margin: 0, color: '#a8b1c1', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  You have full administrative jurisdiction over all client applications, security token generation, and the active <strong>hero-wall-mvp</strong> testing harness.
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

          {/* CLIENT ACCESS & SECURITY TOKENS PANEL */}
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
                  Client Management & Security Access Tokens
                </h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#a8b1c1' }}>
                  Passwordless tokens issued to clients to access and manage their designated applications.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {clients.map((client) => (
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
                      Login Identifier: <strong style={{ color: '#e8eef7' }}>{client.identifier}</strong> (No email required)
                    </div>

                    {client.assignedSite && (
                      <div style={{ fontSize: '0.8rem', color: '#717d91' }}>
                        Dedicated Site: <a href={client.assignedSite.url} target="_blank" rel="noopener noreferrer" style={{ color: '#2dd4bf', textDecoration: 'underline' }}>{client.assignedSite.url} ↗</a>
                      </div>
                    )}
                  </div>

                  {/* Token Delivery Box */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        background: '#0e1113',
                        border: '1px solid rgba(19, 194, 150, 0.4)',
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#13c296',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {client.token}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyToken(client.token, client.id)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        background: copiedToken === client.id ? '#13c296' : 'rgba(255, 255, 255, 0.08)',
                        color: copiedToken === client.id ? '#0b0f11' : '#e8eef7',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {copiedToken === client.id ? '✓ Copied Token!' : 'Copy Token for Client'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVE TEST: HERO WALL MVP */}
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
