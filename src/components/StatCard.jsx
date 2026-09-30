import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, accentColor = '#2563eb', trend }) => {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        borderTop: `4px solid ${accentColor}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text-muted)',
          }}
        >
          {title}
        </span>
        {Icon && (
          <div
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: `${accentColor}15`,
              color: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <div>
        <div
          style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-main)',
            lineHeight: 1.1,
            marginBottom: '0.25rem',
          }}
        >
          {value !== undefined && value !== null ? value : '--'}
        </div>
        {subtitle && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
