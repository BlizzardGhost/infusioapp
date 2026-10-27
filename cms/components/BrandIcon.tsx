import React from 'react';

export interface BrandIconProps {
  className?: string;
  size?: number;
}

export const BrandIcon: React.FC<BrandIconProps> = ({
  className = '',
  size = 32,
}) => {
  return (
    <div
      className={`infusio-brand-icon ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.round(size * 0.28)}px`,
        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.35)',
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
      <img
        src="/assets/brand-logo-dark.png"
        alt="Infusio Icon Asset"
        style={{ display: 'none' }}
        aria-hidden="true"
      />
    </div>
  );
};

export default BrandIcon;
