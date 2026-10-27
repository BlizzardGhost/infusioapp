import React from 'react';
import { CustomNav } from './CustomNav';
import { CustomFooter } from './CustomFooter';

export interface AdminDashboardProps {
  user?: {
    name?: string;
    email?: string;
  };
  metrics?: {
    totalArticles?: number;
    publishedPages?: number;
    aiGenerationsThisMonth?: number;
    gitSyncStatus?: 'synchronized' | 'pending' | 'syncing';
  };
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user = { name: 'Lead Architect', email: 'architect@infusio.studio' },
  metrics = {
    totalArticles: 24,
    publishedPages: 8,
    aiGenerationsThisMonth: 142,
    gitSyncStatus: 'synchronized',
  },
}) => {
  return (
    <div
      className="infusio-dashboard-root"
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--theme-bg, #0B0F19)',
        color: 'var(--theme-text, #F8FAFC)',
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
            borderBottom: '1px solid var(--theme-elevation-150, rgba(255, 255, 255, 0.08))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            backgroundColor: 'rgba(11, 15, 25, 0.8)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img
              src="/assets/brand-logo.png"
              alt="Infusio Studio"
              style={{
                height: '32px',
                width: 'auto',
                borderRadius: '6px',
                objectFit: 'contain',
              }}
            />
            <span
              style={{
                fontSize: '0.85rem',
                color: '#64748B',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                paddingLeft: '16px',
              }}
            >
              Enterprise White-Label Management
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 600,
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#34D399',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#34D399',
                }}
              />
              Git Synced: Main
            </span>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.8125rem',
                color: '#94A3B8',
                textDecoration: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s',
              }}
            >
              View Astro Frontend ↗
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
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 50%, rgba(236, 72, 153, 0.05) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              marginBottom: '32px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ maxWidth: '680px' }}>
              <div
                style={{
                  display: 'inline-block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#A5B4FC',
                  marginBottom: '8px',
                }}
              >
                White-Label Agency CMS Suite
              </div>
              <h1
                style={{
                  fontSize: '1.85rem',
                  fontWeight: 800,
                  margin: '0 0 10px 0',
                  letterSpacing: '-0.02em',
                }}
              >
                Welcome back, {user.name}
              </h1>
              <p
                style={{
                  margin: 0,
                  color: '#94A3B8',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                }}
              >
                Your Git-backed headless repository is operating synchronously with the Astro SSR engine on Vercel. Automated generative AI hooks are primed for collection pipelines.
              </p>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '20px',
              marginBottom: '36px',
            }}
          >
            {/* Metric 1 */}
            <div
              style={{
                padding: '24px',
                borderRadius: '12px',
                background: 'var(--theme-elevation-100, #131A2B)',
                border: '1px solid var(--theme-elevation-150, rgba(255, 255, 255, 0.08))',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Articles & Insights
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px', color: '#FFFFFF' }}>
                {metrics.totalArticles}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#34D399', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>↑ 4 added this week</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div
              style={{
                padding: '24px',
                borderRadius: '12px',
                background: 'var(--theme-elevation-100, #131A2B)',
                border: '1px solid var(--theme-elevation-150, rgba(255, 255, 255, 0.08))',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Landing Pages
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px', color: '#FFFFFF' }}>
                {metrics.publishedPages}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#818CF8', marginTop: '6px' }}>
                Live in Astro Routes
              </div>
            </div>

            {/* Metric 3 */}
            <div
              style={{
                padding: '24px',
                borderRadius: '12px',
                background: 'var(--theme-elevation-100, #131A2B)',
                border: '1px solid var(--theme-elevation-150, rgba(255, 255, 255, 0.08))',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AI Meta Generations
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px', color: '#F472B6' }}>
                {metrics.aiGenerationsThisMonth}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#F472B6', marginTop: '6px' }}>
                Lifecycle Hook active via PROCESS_AI_SECRET_KEY
              </div>
            </div>

            {/* Metric 4 */}
            <div
              style={{
                padding: '24px',
                borderRadius: '12px',
                background: 'var(--theme-elevation-100, #131A2B)',
                border: '1px solid var(--theme-elevation-150, rgba(255, 255, 255, 0.08))',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Vercel SSR Status
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '14px', color: '#38BDF8' }}>
                Edge Deployed
              </div>
              <div style={{ fontSize: '0.75rem', color: '#34D399', marginTop: '8px' }}>
                Zero-cold-start function routes
              </div>
            </div>
          </div>

          {/* Quick Collection Actions */}
          <div
            style={{
              padding: '28px',
              borderRadius: '16px',
              background: 'var(--theme-elevation-50, #0E1424)',
              border: '1px solid var(--theme-elevation-150, rgba(255, 255, 255, 0.08))',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px 0' }}>
                  Manage Content Schemas
                </h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
                  Code-first collections with automated AI lifecycle enrichment
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <a
                  href="/admin/collections/articles/create"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  + New Article
                </a>
              </div>
            </div>

            <div
              style={{
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  padding: '12px 20px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#64748B',
                  letterSpacing: '0.05em',
                }}
              >
                <div>Collection Name</div>
                <div>Schema Type</div>
                <div>AI Hook State</div>
                <div style={{ textAlign: 'right' }}>Actions</div>
              </div>

              {/* Row 1 */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  padding: '16px 20px',
                  alignItems: 'center',
                  borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                  fontSize: '0.875rem',
                }}
              >
                <div style={{ fontWeight: 600, color: '#F1F5F9' }}>
                  Articles & Posts
                </div>
                <div style={{ color: '#94A3B8', fontSize: '0.8rem' }}>
                  Git-Markdown / JSON
                </div>
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#A5B4FC',
                    }}
                  >
                    beforeChange (Active)
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <a
                    href="/admin/collections/articles"
                    style={{ color: '#8B5CF6', textDecoration: 'none', fontWeight: 600, fontSize: '0.8rem' }}
                  >
                    Configure →
                  </a>
                </div>
              </div>

              {/* Row 2 */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  padding: '16px 20px',
                  alignItems: 'center',
                  borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                  fontSize: '0.875rem',
                }}
              >
                <div style={{ fontWeight: 600, color: '#F1F5F9' }}>
                  Landing Pages
                </div>
                <div style={{ color: '#94A3B8', fontSize: '0.8rem' }}>
                  Block Layouts
                </div>
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#A5B4FC',
                    }}
                  >
                    beforeChange (Active)
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <a
                    href="/admin/collections/pages"
                    style={{ color: '#8B5CF6', textDecoration: 'none', fontWeight: 600, fontSize: '0.8rem' }}
                  >
                    Configure →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Custom White-Labeled Footer Override */}
        <CustomFooter />
      </div>
    </div>
  );
};

export default AdminDashboard;
