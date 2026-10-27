import React from 'react';
import { BrandLogo } from './BrandLogo';

export interface CustomNavProps {
  currentPath?: string;
}

export const CustomNav: React.FC<CustomNavProps> = ({
  currentPath = '/admin',
}) => {
  const managedRepos = [
    { id: 'hero-wall-mvp', label: 'Hero Wall MVP', repo: 'BlizzardGhost/hero-wall-mvp', tag: 'Test Active', icon: '⚡' },
    { id: 'infusio-site', label: 'Infusio Live Site', repo: 'BlizzardGhost/infusio-site', tag: 'Astro SSR', icon: '🌐' },
    { id: 'camp-david-mvp', label: 'Camp David MVP', repo: 'BlizzardGhost/camp-david-mvp', tag: 'App', icon: '🏕️' },
    { id: 'kidslab-lat', label: 'KidsLab LAT', repo: 'BlizzardGhost/kidslab-lat-website', tag: 'Web', icon: '🧪' },
  ];

  return (
    <aside
      className="infusio-admin-nav"
      style={{
        width: '280px',
        minHeight: '100vh',
        background: 'var(--bg-2, #0b0f11)',
        borderRight: '1px solid var(--surface-2, rgba(255, 255, 255, 0.08))',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        boxSizing: 'border-box',
      }}
    >
      {/* Brand Header */}
      <div style={{ paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <a href="/admin" style={{ textDecoration: 'none' }}>
          <BrandLogo size="md" />
        </a>
      </div>

      {/* Antigravity Agent Connection Badge */}
      <div
        style={{
          marginTop: '16px',
          padding: '10px 12px',
          borderRadius: '10px',
          background: 'rgba(19, 194, 150, 0.08)',
          border: '1px solid rgba(19, 194, 150, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a8b1c1' }}>
            Agent Control Plane
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2dd4bf' }}>
            Antigravity Online
          </span>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.65rem',
            padding: '2px 8px',
            borderRadius: '999px',
            background: '#13c296',
            color: '#0b0f11',
            fontWeight: 800,
          }}
        >
          CONNECTED
        </span>
      </div>

      {/* Navigation Groups */}
      <div style={{ marginTop: '24px', flex: 1 }}>
        {/* Managed GitHub Repos Section */}
        <div
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#717d91',
            marginBottom: '10px',
            paddingLeft: '8px',
          }}
        >
          Managed Repositories
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {managedRepos.map((item) => (
            <a
              key={item.id}
              href={`/admin/repos/${item.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.825rem',
                fontWeight: 500,
                transition: 'all 0.15s ease',
                background: item.id === 'hero-wall-mvp' ? 'rgba(19, 194, 150, 0.12)' : 'transparent',
                color: item.id === 'hero-wall-mvp' ? '#2dd4bf' : '#a8b1c1',
                borderLeft: item.id === 'hero-wall-mvp' ? '3px solid #13c296' : '3px solid transparent',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: item.id === 'hero-wall-mvp' ? '#13c296' : 'rgba(255,255,255,0.06)',
                  color: item.id === 'hero-wall-mvp' ? '#0b0f11' : '#717d91',
                  fontWeight: 700,
                }}
              >
                {item.tag}
              </span>
            </a>
          ))}
        </nav>

        {/* Core Collections */}
        <div
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#717d91',
            marginTop: '24px',
            marginBottom: '10px',
            paddingLeft: '8px',
          }}
        >
          Content & Data Schemas
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <a
            href="/admin/collections/hero-wall"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '9px 12px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.825rem',
              fontWeight: 600,
              color: '#e8eef7',
              background: 'rgba(255, 255, 255, 0.04)',
            }}
          >
            <span>🛡️ Hero Wall Profile</span>
            <span style={{ fontSize: '0.7rem', color: '#13c296' }}>RASS v38.7</span>
          </a>

          <a
            href="/admin/collections/articles"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '9px 12px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.825rem',
              fontWeight: 500,
              color: '#a8b1c1',
            }}
          >
            <span>📝 Articles & Posts</span>
            <span style={{ fontSize: '0.7rem', color: '#717d91' }}>AI Hooked</span>
          </a>

          <a
            href="/admin/collections/pages"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '9px 12px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.825rem',
              fontWeight: 500,
              color: '#a8b1c1',
            }}
          >
            <span>📄 Landing Pages</span>
          </a>
        </nav>
      </div>

      {/* GitHub Account Badge */}
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
            background: 'linear-gradient(135deg, #13c296, #2dd4bf)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.85rem',
            color: '#0b0f11',
          }}
        >
          BG
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e8eef7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            BlizzardGhost
          </span>
          <span style={{ fontSize: '0.7rem', color: '#717d91', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            github.com/BlizzardGhost
          </span>
        </div>
      </div>
    </aside>
  );
};

export default CustomNav;
