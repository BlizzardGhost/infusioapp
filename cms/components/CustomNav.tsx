import React from 'react';
import { BrandLogo } from './BrandLogo';

export interface CustomNavProps {
  currentPath?: string;
  collections?: Array<{
    slug: string;
    label: string;
    count?: number;
    icon?: string;
  }>;
}

export const CustomNav: React.FC<CustomNavProps> = ({
  currentPath = '/admin',
  collections = [
    { slug: 'articles', label: 'Articles & Insights', count: 12, icon: 'document' },
    { slug: 'pages', label: 'Landing Pages', count: 4, icon: 'layers' },
    { slug: 'media', label: 'Asset Library', count: 28, icon: 'image' },
  ],
}) => {
  return (
    <aside
      className="infusio-admin-nav"
      style={{
        width: '280px',
        minHeight: '100vh',
        background: 'var(--theme-elevation-50, #0B0F19)',
        borderRight: '1px solid var(--theme-elevation-150, rgba(255, 255, 255, 0.08))',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        boxSizing: 'border-box',
      }}
    >
      {/* Brand Header */}
      <div style={{ paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <a href="/admin" style={{ textDecoration: 'none' }}>
          <BrandLogo size="md" />
        </a>
      </div>

      {/* Workspace Indicator */}
      <div
        style={{
          marginTop: '16px',
          padding: '8px 12px',
          borderRadius: '8px',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8' }}>
            Environment
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#A5B4FC' }}>
            Production (Vercel)
          </span>
        </div>
        <span
          style={{
            fontSize: '0.65rem',
            padding: '2px 6px',
            borderRadius: '4px',
            background: '#10B981',
            color: '#FFFFFF',
            fontWeight: 700,
          }}
        >
          LIVE
        </span>
      </div>

      {/* Navigation Groups */}
      <div style={{ marginTop: '28px', flex: 1 }}>
        <div
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#64748B',
            marginBottom: '10px',
            paddingLeft: '8px',
          }}
        >
          Content Collections
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {collections.map((col) => {
            const isActive = currentPath.includes(col.slug);
            return (
              <a
                key={col.slug}
                href={`/admin/collections/${col.slug}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'all 0.15s ease',
                  background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  borderLeft: isActive ? '3px solid #6366F1' : '3px solid transparent',
                }}
              >
                <span>{col.label}</span>
                {col.count !== undefined && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: isActive ? '#6366F1' : 'rgba(255,255,255,0.06)',
                      color: isActive ? '#FFFFFF' : '#64748B',
                      fontWeight: 600,
                    }}
                  >
                    {col.count}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        <div
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#64748B',
            marginTop: '28px',
            marginBottom: '10px',
            paddingLeft: '8px',
          }}
        >
          Automations & AI
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <a
            href="/admin/ai-pipeline"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#C084FC',
              background: 'rgba(192, 132, 252, 0.08)',
            }}
          >
            <span>⚡ AI Meta Generator</span>
          </a>
          <a
            href="/admin/github-sync"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#94A3B8',
            }}
          >
            <span>🐙 GitHub Sync Status</span>
          </a>
        </nav>
      </div>

      {/* User Info / Agency Profile */}
      <div
        style={{
          paddingTop: '16px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.85rem',
            color: '#FFFFFF',
          }}
        >
          AD
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#F1F5F9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Agency Administrator
          </span>
          <span style={{ fontSize: '0.7rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            admin@infusio.studio
          </span>
        </div>
      </div>
    </aside>
  );
};

export default CustomNav;
