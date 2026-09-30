import React from 'react';
import { CheckCircle2, ArrowRight, ShieldCheck, Calendar, FileText } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export const BeforeAfterView = ({ issue }) => {
  if (!issue) return null;

  const isResolved = issue.status === 'Resolved';
  const hasResolutionImage = !!issue.resolution_image_url;
  const hasReportedImage = !!issue.reported_image_url;

  // If issue is not resolved, do NOT show an empty after block (Requirement 10)
  if (!isResolved) {
    if (!hasReportedImage) return null;

    return (
      <div className="card" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Photographic Evidence</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>(Reported Condition)</span>
        </h4>
        <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: '420px', backgroundColor: '#e2e8f0' }}>
          <img
            src={issue.reported_image_url}
            alt={`Reported photo evidence for ${issue.title}`}
            style={{ width: '100%', height: 'auto', maxHeight: '420px', objectFit: 'cover', display: 'block' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        border: '1px solid #bbf7d0',
        backgroundColor: '#f0fdf4',
        padding: '1.5rem',
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.25rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid #dcfce7',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              padding: '0.35rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#166534',
              color: '#ffffff',
              display: 'flex',
            }}
          >
            <ShieldCheck size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#14532d', margin: 0 }}>
              Verified Resolution Proof
            </h4>
            <span style={{ fontSize: '0.8125rem', color: '#166534' }}>
              Inspected &amp; confirmed by Ward Administration
            </span>
          </div>
        </div>

        {issue.resolved_at && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8125rem',
              color: '#166534',
              fontWeight: 600,
            }}
          >
            <Calendar size={14} />
            Resolved: {formatDate(issue.resolved_at)}
          </div>
        )}
      </div>

      {/* Before / After Photo Comparison Grid */}
      <div className="grid-2" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* BEFORE CONTAINER */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                letterSpacing: '0.05em',
              }}
            >
              BEFORE
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Reported Condition
            </span>
          </div>
          <div
            style={{
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              height: '240px',
              backgroundColor: '#e2e8f0',
              border: '1px solid #cbd5e1',
            }}
          >
            {hasReportedImage ? (
              <img
                src={issue.reported_image_url}
                alt={`Before resolution: ${issue.title}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  fontSize: '0.875rem',
                }}
              >
                No initial photo supplied
              </div>
            )}
          </div>
        </div>

        {/* AFTER CONTAINER */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                backgroundColor: '#dcfce7',
                color: '#166534',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                letterSpacing: '0.05em',
              }}
            >
              AFTER
            </span>
            <span style={{ fontSize: '0.8125rem', color: '#166534', fontWeight: 600 }}>
              Resolution Proof
            </span>
          </div>
          <div
            style={{
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              height: '240px',
              backgroundColor: '#e2e8f0',
              border: '2px solid #34d399',
            }}
          >
            {hasResolutionImage ? (
              <img
                src={issue.resolution_image_url}
                alt={`After resolution: ${issue.title}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#065f46',
                  backgroundColor: '#ecfdf5',
                  padding: '1rem',
                  textAlign: 'center',
                }}
              >
                <CheckCircle2 size={32} color="#10b981" />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: '0.5rem' }}>
                  Action Completed
                </span>
                <span style={{ fontSize: '0.75rem', color: '#047857' }}>
                  Verified via field resolution note below
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resolution Note */}
      {issue.resolution_note && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start',
          }}
        >
          <FileText size={18} color="#15803d" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Official Resolution Note:
            </span>
            <p style={{ fontSize: '0.9375rem', color: '#1e293b', marginTop: '0.25rem', margin: 0, lineHeight: 1.5 }}>
              {issue.resolution_note}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
