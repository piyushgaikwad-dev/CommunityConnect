import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Clock,
  Share2,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Info,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Copy,
  Check,
} from 'lucide-react';
import { getIssueById } from '../services/issueService';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { BeforeAfterView } from '../components/BeforeAfterView';
import { LeafletMap } from '../components/LeafletMap';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useToast } from '../context/ToastContext';
import { useSEO } from '../hooks/useSEO';
import { formatDate, formatRelativeTime } from '../utils/formatters';
import { calculatePriorityScore, getPriorityLevel } from '../utils/priorityCalculator';

export const IssueDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        setLoading(true);
        const data = await getIssueById(id);
        setIssue(data);
      } catch (err) {
        console.error('Error loading issue detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [id]);

  useSEO({
    title: issue ? issue.title : 'Issue Details',
    description: issue
      ? `${issue.category} issue reported at ${issue.location}. Status: ${issue.status}. ${issue.description.substring(0, 150)}`
      : 'View community issue report details and resolution status.',
    canonical: `https://communityconnect.app/issues/${id}`,
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    showToast('Direct link to this issue copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '3rem', textAlign: 'center' }}>
        <div style={{ padding: '4rem 1rem' }}>
          <div className="skeleton" style={{ height: '32px', width: '300px', margin: '0 auto 1.5rem auto' }} />
          <div className="skeleton" style={{ height: '240px', width: '100%', maxWidth: '800px', margin: '0 auto 1.5rem auto' }} />
          <div className="skeleton" style={{ height: '120px', width: '100%', maxWidth: '800px', margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem 2rem' }}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Issue Not Found
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
            The community report you are looking for may have been archived or removed.
          </p>
          <Link to="/issues" className="btn btn-primary">
            <ArrowLeft size={16} />
            Back to Community Issues
          </Link>
        </div>
      </div>
    );
  }

  const priorityMeta = calculatePriorityScore({
    severity: issue.severity,
    category: issue.category,
    createdAt: issue.created_at,
  });
  const priorityLevel = getPriorityLevel(issue.priority_score || priorityMeta.totalScore);

  const hasCoords =
    issue.latitude !== null &&
    issue.longitude !== null &&
    !isNaN(Number(issue.latitude)) &&
    !isNaN(Number(issue.longitude));

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <Breadcrumbs
        items={[
          { label: 'Community Issues', path: '/issues' },
          { label: issue.title, path: `/issues/${issue.id}` },
        ]}
      />

      {/* Top Header & Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ maxWidth: '800px' }}>
          {/* Tag and Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--primary-600)',
                backgroundColor: 'var(--primary-50)',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {issue.category}
            </span>
            <StatusBadge status={issue.status} />
            <SeverityBadge severity={issue.severity} />
          </div>

          {/* Issue Title H1 */}
          <h1
            style={{
              fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
              fontWeight: 800,
              color: 'var(--text-main)',
              lineHeight: 1.25,
              marginBottom: '0.75rem',
            }}
          >
            {issue.title}
          </h1>

          {/* Location & Reported Meta */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.25rem',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={16} color="#e11d48" />
              <span>{issue.location}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={15} />
              <span>Reported: {formatDate(issue.created_at)}</span>
            </div>
            {issue.resolved_at && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#166534', fontWeight: 600 }}>
                <CheckCircle2 size={15} />
                <span>Resolved: {formatDate(issue.resolved_at)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={handleShare} className="btn btn-secondary btn-sm" title="Share Issue Link">
            {copied ? <Check size={14} color="#10b981" /> : <Share2 size={14} />}
            {copied ? 'Copied' : 'Share Issue'}
          </button>
          <Link to="/report" className="btn btn-primary btn-sm">
            <PlusCircle size={14} />
            Report Similar
          </Link>
        </div>
      </div>

      {/* Main Grid: Left Details & Right Sidebars */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          gap: '2rem',
          alignItems: 'start',
        }}
        className="issue-detail-layout"
      >
        {/* Left Column: Description, Before/After Proof */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Description Card */}
          <div className="card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Issue Description &amp; Context
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
              {issue.description}
            </p>
          </div>

          {/* Photographic Evidence / Before-After Proof (Requirement 10 & 12) */}
          <BeforeAfterView issue={issue} />

          {/* Location Map Section */}
          {hasCoords && (
            <div className="card">
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} color="#e11d48" />
                <span>Exact Geotagged Location</span>
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Coordinates: {Number(issue.latitude).toFixed(6)}, {Number(issue.longitude).toFixed(6)}
              </p>
              <LeafletMap
                issues={[issue]}
                center={[Number(issue.latitude), Number(issue.longitude)]}
                zoom={15}
                height="280px"
              />
            </div>
          )}
        </div>

        {/* Right Sidebar: Timeline, Priority Index, Reporter info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Resolution Lifecycle Timeline Card */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Resolution Lifecycle
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingLeft: '1.5rem' }}>
              {/* Vertical line connecting nodes */}
              <div
                style={{
                  position: 'absolute',
                  left: '7px',
                  top: '6px',
                  bottom: '6px',
                  width: '2px',
                  backgroundColor: 'var(--border-light)',
                }}
              />

              {/* Node 1: Reported */}
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '-1.5rem',
                    top: '2px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#2563eb',
                    border: '3px solid #ffffff',
                    boxShadow: '0 0 0 2px #bfdbfe',
                  }}
                />
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                  Issue Reported &amp; Registered
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {formatDate(issue.created_at)}
                </div>
              </div>

              {/* Node 2: Reviewed / In Progress */}
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '-1.5rem',
                    top: '2px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: issue.status === 'Pending' ? '#cbd5e1' : '#0284c7',
                    border: '3px solid #ffffff',
                    boxShadow: issue.status !== 'Pending' ? '0 0 0 2px #bae6fd' : 'none',
                  }}
                />
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: issue.status === 'Pending' ? 'var(--text-muted)' : 'var(--text-main)' }}>
                  Municipal Inspection &amp; Crew Assignment
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {issue.status === 'Pending' ? 'Awaiting administrative triage' : 'Assigned to field maintenance unit'}
                </div>
              </div>

              {/* Node 3: Resolved */}
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '-1.5rem',
                    top: '2px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: issue.status === 'Resolved' ? '#10b981' : '#cbd5e1',
                    border: '3px solid #ffffff',
                    boxShadow: issue.status === 'Resolved' ? '0 0 0 2px #bbf7d0' : 'none',
                  }}
                />
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: issue.status === 'Resolved' ? '#166534' : 'var(--text-muted)' }}>
                  Resolution Verified &amp; Proof Logged
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {issue.status === 'Resolved' ? formatDate(issue.resolved_at) : 'Pending field verification'}
                </div>
              </div>
            </div>
          </div>

          {/* Community Priority Index (CPI) Breakdown Card */}
          <div
            className="card"
            style={{
              backgroundColor: '#f8fafc',
              border: `1px solid ${priorityLevel.color}30`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={16} fill={priorityLevel.color} color={priorityLevel.color} />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, margin: 0 }}>
                  Community Priority Index
                </h3>
              </div>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 800,
                  fontSize: '1.125rem',
                  color: priorityLevel.color,
                }}
              >
                {issue.priority_score || priorityMeta.totalScore}/100
              </span>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
              Transparent triage score calculated from hazard severity, category health risk, and queue age.
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-sm)',
                padding: '0.6rem 0.75rem',
                border: '1px solid var(--border-light)',
                fontSize: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Base ({issue.severity} Severity):</span>
                <strong>+{priorityMeta.breakdown.baseScore} pts</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Category Boost ({issue.category}):</span>
                <strong>+{priorityMeta.breakdown.categoryBoost} pts</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Queue Age ({priorityMeta.breakdown.ageDays}d old):</span>
                <strong>+{priorityMeta.breakdown.ageBonus} pts</strong>
              </div>
            </div>
          </div>

          {/* Quick Info & Guidelines */}
          <div className="card" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Info size={14} color="#2563eb" />
              Civic Engagement Note
            </div>
            <p style={{ margin: 0, lineHeight: 1.5 }}>
              All reports are logged on the Supabase database. Verified resolutions require photo proof uploaded by authorized ward administrators.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .issue-detail-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
