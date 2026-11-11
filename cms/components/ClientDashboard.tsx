/**
 * File: cms/components/ClientDashboard.tsx
 * Purpose: Scoped Client Control Plane for test@sperling (managing camp-david-mvp) with the
 *          Conversational Natural Language Site Assistant.
 * Spec: specs/002-agentic-cms-engine/spec.md (FR-005, AC-1, AC-3, AC-5)
 *
 * Operator Notes:
 * - What/Why: Enables clients to update their live website copy, headings, and promo cards
 *   in seconds by typing natural language instructions without breaking layouts or contacting devs.
 * - Plan Boundaries: Enforces plan tier restrictions while offering automated agent assistance.
 */

import React, { useState, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
import type { UserAccount, ClientFeature, ClientChangeRequest } from '../auth/users';

export interface ClientDashboardProps {
  user: UserAccount;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ user }) => {
  const site = user.assignedSite || {
    id: 'camp-david-mvp',
    name: 'Camp David MVP',
    url: 'https://camp-david-mvp.vercel.app/',
    repo: 'https://github.com/BlizzardGhost/camp-david-mvp',
    plan: 'Growth Agency Tier',
    features: [],
    changeRequests: [],
  };

  const [features, setFeatures] = useState<ClientFeature[]>(site.features);
  const [changeRequests, setChangeRequests] = useState<ClientChangeRequest[]>(site.changeRequests);

  // Live content state
  const [siteContent, setSiteContent] = useState({
    siteName: 'Camp David MVP',
    heroHeading: 'Experience Camp David: Luxury Cabins & Nature Retreat',
    heroSubheading:
      'Handcrafted accommodations, peaceful alpine environments, and five-star hospitality nestled in pristine mountain wilderness.',
    promoBanner: 'Summer Getaway: Book 3 Nights, Get 1 Complimentary',
  });

  // Agent prompt state
  const [promptInput, setPromptInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [agentFeedback, setAgentFeedback] = useState<{
    success: boolean;
    message: string;
    executionMs?: number;
    diffs?: Array<{ field: string; before: any; after: any }>;
  } | null>(null);

  useEffect(() => {
    fetchLiveSiteState();
  }, []);

  const fetchLiveSiteState = async () => {
    try {
      const res = await fetch(`/api/agent/v1/sites?siteId=camp-david-mvp`);
      const data = await res.json();
      if (data.success && data.site?.data) {
        const d = data.site.data;
        setSiteContent({
          siteName: d.siteName || site.name,
          heroHeading: d.heroHeading || siteContent.heroHeading,
          heroSubheading: d.heroSubheading || siteContent.heroSubheading,
          promoBanner: d.promoBanner || siteContent.promoBanner,
        });
      }
    } catch {
      // Offline fallback
    }
  };

  const handleExecuteAgentPrompt = async (e?: React.FormEvent, customPrompt?: string) => {
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
          siteId: 'camp-david-mvp',
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

        if (data.updatedData) {
          const d = data.updatedData;
          setSiteContent({
            siteName: d.siteName || siteContent.siteName,
            heroHeading: d.heroHeading || siteContent.heroHeading,
            heroSubheading: d.heroSubheading || siteContent.heroSubheading,
            promoBanner: d.promoBanner || siteContent.promoBanner,
          });
        }

        // Add to recent request log
        const newReq: ClientChangeRequest = {
          id: `cr_${Date.now()}`,
          title: promptToRun.slice(0, 48),
          description: data.message,
          category: 'content',
          status: 'completed',
          createdAt: new Date().toISOString(),
        };
        setChangeRequests((prev) => [newReq, ...prev]);
        setPromptInput('');
      } else {
        setAgentFeedback({
          success: false,
          message: data.error || 'Agent prompt could not be completed.',
        });
      }
    } catch {
      setAgentFeedback({
        success: false,
        message: 'Network communication error with Infusio Agent.',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleToggleFeature = (featureId: string) => {
    setFeatures((prev) =>
      prev.map((f) => {
        if (f.id === featureId) {
          if (!f.includedInPlan) {
            alert(`This feature is available in the Enterprise Tier. Contact your administrator to upgrade.`);
            return f;
          }
          return { ...f, enabled: !f.enabled };
        }
        return f;
      })
    );
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0e1113',
        color: '#e8eef7',
        fontFamily: "'Quicksand', system-ui, -apple-system, sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Client Header */}
      <header
        style={{
          height: '70px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(11, 15, 17, 0.9)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <BrandLogo size="md" />
          <span
            style={{
              fontSize: '0.8rem',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(19, 194, 150, 0.15)',
              color: '#13c296',
              fontWeight: 700,
            }}
          >
            Client Workspace
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e8eef7' }}>
              {user.identifier}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#2dd4bf' }}>{site.plan}</div>
          </div>

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
              fontFamily: 'Quicksand, sans-serif',
            }}
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '36px 24px' }}>
        {/* Banner with Live Site Link */}
        <div
          style={{
            padding: '28px 32px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(19, 194, 150, 0.15) 0%, rgba(45, 212, 191, 0.05) 100%)',
            border: '1px solid rgba(19, 194, 150, 0.3)',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2dd4bf' }}>
              Managed Application • Agentic Control Active
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '4px 0 8px 0', color: '#e8eef7' }}>
              {siteContent.siteName}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: '#a8b1c1' }}>
              <span>Live Environment:</span>
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#13c296', fontWeight: 700, textDecoration: 'underline' }}
              >
                {site.url} ↗
              </a>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 22px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #13c296, #2dd4bf)',
                color: '#0b0f11',
                fontWeight: 800,
                fontSize: '0.875rem',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(19, 194, 150, 0.3)',
              }}
            >
              Open Live Site ↗
            </a>
          </div>
        </div>

        {/* SECTION 1: CONVERSATIONAL NATURAL LANGUAGE ASSISTANT */}
        <div
          style={{
            padding: '28px',
            borderRadius: '16px',
            background: '#14191d',
            border: '1px solid rgba(19, 194, 150, 0.35)',
            marginBottom: '32px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#2dd4bf' }}>
                ⚡ Conversational Site Assistant
              </span>
              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(19,194,150,0.15)', color: '#13c296', fontWeight: 700 }}>
                Instant Execution
              </span>
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '4px 0', color: '#e8eef7' }}>
              Update Your Site in Seconds
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#a8b1c1' }}>
              Prompt changes to headlines, seasonal promos, or cabin copy. The Infusio agent validates design tokens and updates the site automatically.
            </p>
          </div>

          <form onSubmit={handleExecuteAgentPrompt} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder='e.g. Update hero headline to "Luxury Mountain Cabins & Alpine Retreat"'
              disabled={isExecuting}
              style={{
                flex: 1,
                minWidth: '280px',
                padding: '13px 18px',
                borderRadius: '10px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(19, 194, 150, 0.4)',
                color: '#e8eef7',
                fontSize: '0.925rem',
                fontFamily: 'Quicksand, sans-serif',
                outline: 'none',
              }}
            />

            <button
              type="submit"
              disabled={isExecuting || !promptInput.trim()}
              style={{
                padding: '13px 24px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #13c296, #2dd4bf)',
                color: '#0b0f11',
                fontWeight: 800,
                fontSize: '0.875rem',
                border: 'none',
                cursor: isExecuting || !promptInput.trim() ? 'not-allowed' : 'pointer',
                opacity: isExecuting || !promptInput.trim() ? 0.6 : 1,
                fontFamily: 'Quicksand, sans-serif',
                boxShadow: '0 4px 14px rgba(19, 194, 150, 0.3)',
              }}
            >
              {isExecuting ? '⚡ Updating Site...' : '⚡ Apply Update'}
            </button>
          </form>

          {/* Prompt Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}>
            <span style={{ fontSize: '0.72rem', color: '#717d91', fontWeight: 700, textTransform: 'uppercase' }}>
              Quick Presets:
            </span>
            <button
              type="button"
              onClick={() => handleExecuteAgentPrompt(undefined, 'Update hero headline to "Luxury Mountain Cabins & Alpine Retreat"')}
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
              onClick={() => handleExecuteAgentPrompt(undefined, 'Update promo banner to "Autumn Special: 20% Off All Cabins"')}
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
              + Promo: "Autumn Special - 20% Off"
            </button>
          </div>

          {/* Agent Execution Feedback */}
          {agentFeedback && (
            <div
              style={{
                marginTop: '16px',
                padding: '14px 16px',
                borderRadius: '10px',
                background: agentFeedback.success ? 'rgba(19, 194, 150, 0.14)' : 'rgba(239, 68, 68, 0.14)',
                border: `1px solid ${agentFeedback.success ? 'rgba(19, 194, 150, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: agentFeedback.success ? '#2dd4bf' : '#f87171' }}>
                  {agentFeedback.success ? '✓ ' : '✕ '} {agentFeedback.message}
                </span>
                {agentFeedback.executionMs && (
                  <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', color: '#13c296', fontFamily: 'monospace' }}>
                    {agentFeedback.executionMs}ms
                  </span>
                )}
              </div>

              {agentFeedback.diffs && agentFeedback.diffs.length > 0 && (
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {agentFeedback.diffs.map((d, idx) => (
                    <div key={idx} style={{ padding: '6px 10px', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', fontSize: '0.78rem' }}>
                      <strong style={{ color: '#2dd4bf' }}>{d.field}</strong>: updated to <span style={{ color: '#13c296', fontWeight: 600 }}>"{String(d.after)}"</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 2: LIVE SITE CONTENT CARD */}
        <div
          style={{
            padding: '24px 28px',
            borderRadius: '16px',
            background: 'rgba(0,0,0,0.25)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '32px',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#717d91', marginBottom: '8px' }}>
            Live Preview State
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#e8eef7', marginBottom: '6px' }}>
            {siteContent.heroHeading}
          </div>
          <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#a8b1c1', lineHeight: 1.5 }}>
            {siteContent.heroSubheading}
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '8px', background: 'rgba(19, 194, 150, 0.15)', border: '1px solid rgba(19, 194, 150, 0.3)', color: '#2dd4bf', fontSize: '0.8rem', fontWeight: 700 }}>
            <span>Promo:</span> {siteContent.promoBanner}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
          {/* Section 3: Features & Plan Management */}
          <div
            style={{
              padding: '28px',
              borderRadius: '16px',
              background: '#14191d',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px 0', color: '#e8eef7' }}>
                Plan Capabilities & Feature Controls
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#a8b1c1' }}>
                Toggle active capabilities acquired under your <strong>{site.plan}</strong>.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {features.map((feat) => (
                <div
                  key={feat.id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#e8eef7' }}>
                        {feat.name}
                      </span>
                      {!feat.includedInPlan && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(236, 72, 153, 0.15)',
                            color: '#f472b6',
                            fontWeight: 700,
                          }}
                        >
                          UPGRADE REQUIRED
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#717d91', marginTop: '3px' }}>
                      {feat.description}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleFeature(feat.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      background: feat.enabled ? '#13c296' : 'rgba(255, 255, 255, 0.1)',
                      color: feat.enabled ? '#0b0f11' : '#a8b1c1',
                      transition: 'all 0.2s',
                    }}
                  >
                    {feat.enabled ? 'ACTIVE' : 'DISABLED'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Change Requests History */}
          <div
            style={{
              padding: '28px',
              borderRadius: '16px',
              background: '#14191d',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px 0', color: '#e8eef7' }}>
                Agentic Update History
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#a8b1c1' }}>
                Audit trail of changes executed on Camp David MVP.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {changeRequests.map((cr) => (
                <div
                  key={cr.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#e8eef7' }}>{cr.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#717d91', marginTop: '2px' }}>
                      {new Date(cr.createdAt).toLocaleDateString()} • {cr.category}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: cr.status === 'completed' ? 'rgba(19, 194, 150, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: cr.status === 'completed' ? '#13c296' : '#f59e0b',
                    }}
                  >
                    {cr.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
