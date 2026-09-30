import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Compass,
  Map,
  CheckCircle2,
  Clock,
  Loader2,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Camera,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import { getImpactStats, getRecentlyResolvedIssues, getIssues } from '../services/issueService';
import { StatCard } from '../components/StatCard';
import { IssueCard } from '../components/IssueCard';
import { LeafletMap } from '../components/LeafletMap';
import { BeforeAfterView } from '../components/BeforeAfterView';
import { useSEO } from '../hooks/useSEO';
import { ISSUE_CATEGORIES, getCategoryIconName } from '../utils/formatters';

export const HomePage = () => {
  useSEO({
    title: 'Report & Track Neighborhood Issues',
    description: 'Hyperlocal Community Issue Mapping & Resolution Portal. Report civic problems, track municipal resolution in real-time, and verify photographic resolution proof.',
    canonical: 'https://communityconnect.app/',
  });

  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    inProgress: 0,
    pending: 0,
    resolutionRate: 0,
    avgResolutionDays: null,
  });
  const [recentlyResolved, setRecentlyResolved] = useState([]);
  const [mapIssues, setMapIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [statsData, resolvedData, allIssuesData] = await Promise.all([
          getImpactStats(),
          getRecentlyResolvedIssues(2),
          getIssues({ sort: 'newest' }),
        ]);

        setStats(statsData);
        setRecentlyResolved(resolvedData);
        setMapIssues(allIssuesData);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
      {/* =========================================================================
          1. HERO SECTION
          ========================================================================= */}
      <section
        style={{
          position: 'relative',
          padding: '4.5rem 0 3.5rem 0',
          background: 'radial-gradient(circle at 10% 20%, #eff6ff 0%, #ffffff 70%, #f0fdf4 100%)',
          borderBottom: '1px solid var(--border-light)',
          overflow: 'hidden',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            {/* Tagline Badge */}
            <div
              className="badge"
              style={{
                backgroundColor: '#dbeafe',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                fontSize: '0.8125rem',
                padding: '0.35rem 0.85rem',
                marginBottom: '1.25rem',
              }}
            >
              <Sparkles size={14} />
              Hyperlocal Civic Issue Management &amp; Impact Tracking
            </div>

            {/* Primary H1 */}
            <h1
              style={{
                fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
                fontWeight: 800,
                color: 'var(--text-main)',
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                marginBottom: '1.25rem',
              }}
            >
              Report. Track.{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #0d9488)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Improve your community.
              </span>
            </h1>

            {/* Subheading */}
            <p
              style={{
                fontSize: 'clamp(1.0625rem, 2vw, 1.25rem)',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '2rem',
                maxWidth: '680px',
                marginRight: 'auto',
                marginLeft: 'auto',
              }}
            >
              A transparent civic portal where residents report neighborhood hazards, track real-time municipal resolution, and verify measurable community impact with before-and-after photo proof.
            </p>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <Link to="/report" className="btn btn-primary btn-lg" style={{ boxShadow: 'var(--shadow-lg)' }}>
                <PlusCircle size={18} />
                Report an Issue
              </Link>
              <Link to="/issues" className="btn btn-secondary btn-lg">
                <Compass size={18} />
                Explore Community Issues
              </Link>
              <Link to="/map" className="btn btn-outline btn-lg">
                <Map size={18} />
                Live Issue Map
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. DYNAMIC COMMUNITY IMPACT STATISTICS (Fetched from Supabase)
          ========================================================================= */}
      <section className="container">
        <div className="section-header" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
          <div className="section-tag">
            <TrendingUp size={14} />
            Measurable Civic Impact
          </div>
          <h2 className="section-title">Live Resolution Metrics</h2>
          <p className="section-subtitle">
            Real-time statistics dynamically calculated from verified community reports and municipal resolutions.
          </p>
        </div>

        <div className="grid-4" style={{ gap: '1.25rem' }}>
          <StatCard
            title="Total Issues Reported"
            value={stats.total}
            subtitle="Civic reports registered"
            icon={AlertTriangle}
            accentColor="#2563eb"
          />
          <StatCard
            title="Resolved with Proof"
            value={stats.resolved}
            subtitle="Verified field repairs"
            icon={CheckCircle2}
            accentColor="#10b981"
          />
          <StatCard
            title="In Active Progress"
            value={stats.inProgress}
            subtitle="Work crews dispatched"
            icon={Loader2}
            accentColor="#0284c7"
          />
          <StatCard
            title="Resolution Rate"
            value={`${stats.resolutionRate}%`}
            subtitle={stats.avgResolutionDays ? `Avg. ${stats.avgResolutionDays} days turnaround` : 'Calculated in real-time'}
            icon={TrendingUp}
            accentColor="#8b5cf6"
          />
        </div>
      </section>

      {/* =========================================================================
          3. RECENTLY RESOLVED ISSUES & BEFORE/AFTER EVIDENCE (Requirement 14)
          ========================================================================= */}
      <section className="container">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <div className="section-tag" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
              <ShieldCheck size={14} />
              Verified Resolutions
            </div>
            <h2 className="section-title">Recently Resolved Issues</h2>
            <p className="section-subtitle">
              Inspect photographic before-and-after evidence demonstrating field resolution.
            </p>
          </div>
          <Link to="/issues?status=Resolved" className="btn btn-outline">
            View All Resolved Issues
            <ArrowRight size={15} />
          </Link>
        </div>

        {recentlyResolved && recentlyResolved.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {recentlyResolved.map((resolvedIssue) => (
              <div key={resolvedIssue.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    <Link to={`/issues/${resolvedIssue.id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                      {resolvedIssue.title}
                    </Link>
                  </h3>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    📍 {resolvedIssue.location}
                  </span>
                </div>
                <BeforeAfterView issue={resolvedIssue} />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="card"
            style={{
              padding: '3rem 1.5rem',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
            }}
          >
            <CheckCircle2 size={40} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              No Resolved Issues Yet
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
              As municipal administrators inspect and resolve reported issues with photographic evidence, they will appear here.
            </p>
            <Link to="/report" className="btn btn-primary btn-sm">
              <PlusCircle size={14} />
              Report First Community Issue
            </Link>
          </div>
        )}
      </section>

      {/* =========================================================================
          4. INTERACTIVE ISSUE CATEGORIES
          ========================================================================= */}
      <section className="container">
        <div className="section-header" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
          <div className="section-tag">
            <MapPin size={14} />
            Locality Focus Areas
          </div>
          <h2 className="section-title">Common Issue Categories</h2>
          <p className="section-subtitle">
            Filter community reports by municipal domain and hazard type.
          </p>
        </div>

        <div className="grid-4" style={{ gap: '1rem' }}>
          {ISSUE_CATEGORIES.map((cat) => {
            const count = stats.categoryCounts?.[cat] || 0;
            return (
              <Link
                key={cat}
                to={`/issues?category=${encodeURIComponent(cat)}`}
                className="card card-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem',
                  textDecoration: 'none',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9375rem', marginBottom: '0.2rem' }}>
                    {cat}
                  </div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {count} {count === 1 ? 'report' : 'reports'}
                  </span>
                </div>
                <div
                  style={{
                    backgroundColor: 'var(--primary-50)',
                    color: 'var(--primary-600)',
                    padding: '0.4rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                  }}
                >
                  <ArrowRight size={14} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          5. COMMUNITY MAP PREVIEW
          ========================================================================= */}
      <section className="container">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <div className="section-tag">
              <Map size={14} />
              Geospatial Intelligence
            </div>
            <h2 className="section-title">Live Community Issue Map</h2>
            <p className="section-subtitle">
              Explore geotagged reports with status-colored pins and exact GPS coordinates.
            </p>
          </div>
          <Link to="/map" className="btn btn-primary">
            Open Fullscreen Map
            <ArrowRight size={15} />
          </Link>
        </div>

        <LeafletMap issues={mapIssues} height="420px" />
      </section>

      {/* =========================================================================
          6. HOW IT WORKS (The 4-Step Lifecycle)
          ========================================================================= */}
      <section
        style={{
          backgroundColor: 'var(--bg-subtle)',
          padding: '4rem 0',
          borderTop: '1px solid var(--border-light)',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            <div className="section-tag">
              <Sparkles size={14} />
              Workflow Transparency
            </div>
            <h2 className="section-title">How CommunityConnect Works</h2>
            <p className="section-subtitle">
              A continuous, accountable civic lifecycle from problem detection to verified proof.
            </p>
          </div>

          <div className="grid-4" style={{ gap: '1.5rem' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#dbeafe',
                  color: '#2563eb',
                  fontWeight: 800,
                  fontSize: '1.125rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Report Issue</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Resident snaps a photo, sets the GPS pin, selects severity, and submits the civic issue.
              </p>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#fef3c7',
                  color: '#d97706',
                  fontWeight: 800,
                  fontSize: '1.125rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Admin Review</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                System computes the Community Priority Index (CPI) and administrators dispatch field crews.
              </p>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#e0f2fe',
                  color: '#0284c7',
                  fontWeight: 800,
                  fontSize: '1.125rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Resolution &amp; Proof</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Crew repairs the defect. Admin uploads mandatory AFTER resolution photo and logs notes.
              </p>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  fontWeight: 800,
                  fontSize: '1.125rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                4
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Verify Impact</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Homepage statistics update automatically and residents view verified before-and-after results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. COMMUNITY ENGAGEMENT CTA BANNER
          ========================================================================= */}
      <section className="container">
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
            Notice a hazard in your street?
          </h2>
          <p style={{ fontSize: '1.0625rem', color: '#cbd5e1', maxWidth: '580px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
            Submit a geotagged report in under 60 seconds. Help keep our roads safe, streets lit, and surroundings clean.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/report" className="btn btn-primary btn-lg" style={{ backgroundColor: '#2563eb' }}>
              <PlusCircle size={18} />
              Report Issue Now
            </Link>
            <Link to="/issues" className="btn btn-secondary btn-lg" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
              Browse Public Feed
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
