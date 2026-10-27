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
        background: 'linear-gradient(135deg, #13c296 0%, #2dd4bf 100%)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 10px rgba(19, 194, 150, 0.35)',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <img
        src="/assets/brand-icon.svg"
        alt="Infusio Emblem"
        style={{ width: '70%', height: '70%', objectFit: 'contain' }}
      />
    </div>
  );
};

export default BrandIcon;
