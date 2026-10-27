import React from 'react';

export interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  darkMode?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const heightMap = {
    sm: 28,
    md: 38,
    lg: 48,
  };

  const currentHeight = heightMap[size] || 38;

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
      {/* Official Infusio WebP Logo Asset */}
      <img
        src="/assets/brand-logo.webp"
        alt="Infusio"
        style={{
          height: `${currentHeight}px`,
          width: 'auto',
          objectFit: 'contain',
        }}
        onError={(e) => {
          // If webp fails to render in any specific environment, display fallback SVG badge
          const target = e.currentTarget as HTMLElement;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'flex';
        }}
      />

      {/* Fallback & Monogram Badge (Matcha Jade & Mint Foam) */}
      <div
        className="infusio-brand-fallback"
        style={{
          display: 'none',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: `${currentHeight}px`,
            height: `${currentHeight}px`,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #13c296 0%, #2dd4bf 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(19, 194, 150, 0.35)',
          }}
        >
          <img
            src="/assets/brand-icon.svg"
            alt="Infusio Icon"
            style={{ width: '65%', height: '65%' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span
            style={{
              fontSize: size === 'sm' ? '1rem' : size === 'lg' ? '1.4rem' : '1.18rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#e8eef7',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            INFUSIO
          </span>
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#2dd4bf',
            }}
          >
            ENTERPRISE CMS
          </span>
        </div>
      </div>
    </div>
  );
};

export default BrandLogo;
