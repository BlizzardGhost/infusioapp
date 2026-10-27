import React from 'react';

export interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  darkMode?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  darkMode = true,
}) => {
  const heightMap = {
    sm: '28px',
    md: '38px',
    lg: '48px',
  };

  const currentHeight = heightMap[size] || '38px';

  return (
    <div
      className={`infusio-brand-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        userSelect: 'none',
        textDecoration: 'none',
      }}
    >
      {/* Primary Brand Graphic Override */}
      <div
        style={{
          width: currentHeight,
          height: currentHeight,
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
          flexShrink: 0,
        }}
      >
        <svg
          width="60%"
          height="60%"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span
          style={{
            fontSize: size === 'sm' ? '1rem' : size === 'lg' ? '1.4rem' : '1.18rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: darkMode ? '#F8FAFC' : '#0F172A',
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          INFUSIO
        </span>
        <span
          style={{
            fontSize: size === 'sm' ? '0.62rem' : '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#8B5CF6',
            marginTop: '2px',
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          STUDIO CMS
        </span>
      </div>

      {/* Hidden fallback image referencing public asset path for CMS asset inspection */}
      <img
        src="/assets/brand-logo.png"
        alt="Infusio Brand Logo"
        style={{ display: 'none' }}
        aria-hidden="true"
      />
    </div>
  );
};

export default BrandLogo;
