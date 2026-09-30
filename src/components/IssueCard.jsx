import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { SeverityBadge } from './SeverityBadge';
import { PriorityBadge } from './PriorityBadge';
import { formatRelativeTime } from '../utils/formatters';

export const IssueCard = ({ issue }) => {
  if (!issue) return null;

  const isResolved = issue.status === 'Resolved';

  return (
    <div className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Card Image / Preview */}
      <div
        style={{
          height: '180px',
          width: '100%',
          borderRadius: 'calc(var(--radius-lg) - 6px)',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#e2e8f0',
          marginBottom: '1rem',
        }}
      >
        {issue.reported_image_url ? (
          <img
            src={issue.reported_image_url}
            alt={`Reported photo for ${issue.title}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              backgroundColor: '#f1f5f9',
            }}
          >
            <MapPin size={32} strokeWidth={1.5} />
            <span style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>No photo attached</span>
          </div>
        )}

        {/* Status Badge Overlay */}
        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
          <StatusBadge status={issue.status} />
        </div>

        {/* Resolved Proof Badge if available */}
        {isResolved && issue.resolution_image_url && (
          <div
            style={{
              position: 'absolute',
              bottom: '0.5rem',
              right: '0.5rem',
              backgroundColor: 'rgba(16, 185, 129, 0.95)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              backdropFilter: 'blur(2px)',
            }}
          >
            <CheckCircle2 size={12} />
            Proof Attached
          </div>
        )}
      </div>

      {/* Meta tags */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '0.5rem',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--primary-600)',
            backgroundColor: 'var(--primary-50)',
            padding: '0.2rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {issue.category}
        </span>
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          <SeverityBadge severity={issue.severity} />
          <PriorityBadge score={issue.priority_score} />
        </div>
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          lineHeight: 1.35,
          marginBottom: '0.5rem',
          color: 'var(--text-main)',
        }}
      >
        <Link to={`/issues/${issue.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          {issue.title}
        </Link>
      </h3>

      {/* Description Snippet */}
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.45,
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flexGrow: 1,
        }}
      >
        {issue.description}
      </p>

      {/* Location */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          marginBottom: '0.75rem',
        }}
      >
        <MapPin size={14} style={{ flexShrink: 0, color: '#e11d48' }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {issue.location}
        </span>
      </div>

      {/* Footer / CTA */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-light)',
          paddingTop: '0.75rem',
          marginTop: 'auto',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Clock size={13} />
          <span>{formatRelativeTime(issue.created_at)}</span>
        </div>
        <Link
          to={`/issues/${issue.id}`}
          className="btn btn-outline btn-sm"
          style={{ padding: '0.25rem 0.6rem', fontSize: '0.8125rem' }}
        >
          View Details
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
};
