import React from 'react';

export const CustomFooter: React.FC = () => {
  return (
    <footer
      className="infusio-custom-admin-footer"
      style={{
        padding: '20px 24px',
        borderTop: '1px solid var(--theme-elevation-150, rgba(255, 255, 255, 0.08))',
        background: 'var(--theme-bg, #0B0F19)',
        color: 'var(--theme-elevation-500, #94A3B8)',
        fontSize: '0.8125rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#10B981',
            boxShadow: '0 0 8px #10B981',
          }}
        />
        <span>Infusio Headless CMS • Git-Engine Connected</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ opacity: 0.8 }}>Vercel SSR Edge Active</span>
        <span style={{ opacity: 0.4 }}>|</span>
        <span style={{ color: '#8B5CF6', fontWeight: 600 }}>v1.0.0-PRO</span>
      </div>
    </footer>
  );
};

export default CustomFooter;
