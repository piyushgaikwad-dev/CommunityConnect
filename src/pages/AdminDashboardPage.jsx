import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  CheckCircle2,
  Clock,
  Loader2,
  AlertTriangle,
  Trash2,
  Upload,
  Search,
  Filter,
  TrendingUp,
  FileText,
  Zap,
  Layers,
  Sparkles,
  ExternalLink,
  Lock,
  ArrowRight,
} from 'lucide-react';
import {
  getIssues,
  getImpactStats,
  updateIssueStatus,
  deleteIssue,
} from '../services/issueService';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { ResolveModal } from '../components/ResolveModal';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSEO } from '../hooks/useSEO';
import { ISSUE_CATEGORIES, SEVERITY_LEVELS, STATUS_TYPES, formatDate } from '../utils/formatters';

export const AdminDashboardPage = () => {
  useSEO({
    title: 'Admin Resolution Portal & Dashboard',
    description: 'Municipal administrative dashboard for issue triage, work crew status updates, and resolution proof verification.',
    canonical: 'https://communityconnect.app/admin',
  });

  const { user, isAdmin, quickDemoLogin } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'manage' | 'viva'
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    inProgress: 0,
    pending: 0,
    resolutionRate: 0,
    avgResolutionDays: null,
    categoryCounts: {},
    severityCounts: {},
  });
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Management Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  // Modal State
  const [resolvingIssue, setResolvingIssue] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, issuesData] = await Promise.all([
        getImpactStats(),
        getIssues({ sort: 'priority' }), // Sort by highest priority by default
      ]);
      setStats(statsData);
      setIssues(issuesData);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handler for Quick Status Change (e.g. to 'In Progress' or 'Pending')
  const handleQuickStatusChange = async (issueId, newStatus) => {
    if (newStatus === 'Resolved') {
      // Must open modal to capture photo proof & notes (Requirement 11 & 40)
      const target = issues.find((i) => i.id === issueId);
      setResolvingIssue(target);
      return;
    }

    try {
      await updateIssueStatus({
        issueId,
        newStatus,
        user,
      });
      showToast(`Status updated to "${newStatus}"`, 'success');
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Handler for Resolution Confirmation from ResolveModal
  const handleResolveSubmit = async (payload) => {
    await updateIssueStatus({
      ...payload,
      user,
    });
    showToast('Resolution proof and verified status saved!', 'success');
    fetchDashboardData();
  };

  // Handler for Issue Deletion (Admin only)
  const handleDelete = async (issueId, title) => {
    if (window.confirm(`Are you sure you want to delete report "${title}"? This cannot be undone.`)) {
      try {
        await deleteIssue(issueId);
        showToast('Report deleted successfully', 'success');
        fetchDashboardData();
      } catch (err) {
        showToast('Failed to delete report', 'error');
      }
    }
  };

  // Non-Admin Access Gate
  if (!isAdmin) {
    return (
      <div className="container" style={{ paddingTop: '3rem' }}>
        <div className="card" style={{ maxWidth: '580px', margin: '2rem auto', padding: '3rem 2rem', textAlign: 'center' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
            }}
          >
            <Lock size={30} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Restricted Administrator Access
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            The Administration Dashboard is protected by Supabase Row Level Security (RLS) policies and is only accessible to users with the <code>admin</code> database role.
          </p>

          <div
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              textAlign: 'left',
            }}
          >
            <div style={{ fontWeight: 700, color: '#1e40af', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
              🎓 CEP Viva &amp; Examination Evaluation:
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#1e3a8a', lineHeight: 1.5 }}>
              Faculty evaluators and examiners can click below to simulate an authenticated Ward Administrator session with full resolution proof capabilities.
            </div>
          </div>

          <button
            onClick={() => quickDemoLogin('admin')}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Shield size={16} />
            Switch to Admin Role (Evaluator Demo)
          </button>
        </div>
      </div>
    );
  }

  // Filtered issues for the management table
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      !searchTerm.trim() ||
      issue.title.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      issue.location.toLowerCase().includes(searchTerm.toLowerCase().trim());
    const matchesCat = categoryFilter === 'All' || issue.category === categoryFilter;
    const matchesStat = statusFilter === 'All' || issue.status === statusFilter;
    const matchesSev = severityFilter === 'All' || issue.severity === severityFilter;
    return matchesSearch && matchesCat && matchesStat && matchesSev;
  });

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <Breadcrumbs items={[{ label: 'Admin Portal', path: '/admin' }]} />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                letterSpacing: '0.04em',
              }}
            >
              ADMINISTRATOR
            </span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Logged in as {user.name} ({user.email})
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
            Civic Issue Management &amp; Triage Portal
          </h1>
        </div>

        <Link to="/report" className="btn btn-primary" style={{ gap: '0.4rem' }}>
          + New Field Report
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '0.75rem',
          marginBottom: '2rem',
          overflowX: 'auto',
        }}
      >
        <button
          onClick={() => setActiveTab('overview')}
          className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
        >
          <TrendingUp size={15} />
          Overview &amp; Analytics
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`btn btn-sm ${activeTab === 'manage' ? 'btn-primary' : 'btn-outline'}`}
        >
          <Layers size={15} />
          Issue Management ({issues.length})
        </button>
        <button
          onClick={() => setActiveTab('viva')}
          className={`btn btn-sm ${activeTab === 'viva' ? 'btn-primary' : 'btn-outline'}`}
        >
          <Zap size={15} />
          CPI Formula &amp; Architecture (Viva)
        </button>
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW & ANALYTICS
          ========================================================================= */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Top KPI Metric Cards */}
          <div className="grid-4" style={{ gap: '1.25rem' }}>
            <StatCard
              title="Total Issues"
              value={stats.total}
              subtitle="Registered in database"
              icon={Layers}
              accentColor="#2563eb"
            />
            <StatCard
              title="Pending Triage"
              value={stats.pending}
              subtitle="Awaiting field crew"
              icon={Clock}
              accentColor="#f59e0b"
            />
            <StatCard
              title="In Progress"
              value={stats.inProgress}
              subtitle="Work ongoing"
              icon={Loader2}
              accentColor="#0284c7"
            />
            <StatCard
              title="Resolved with Proof"
              value={stats.resolved}
              subtitle={`${stats.resolutionRate}% resolution rate`}
              icon={CheckCircle2}
              accentColor="#10b981"
            />
          </div>

          {/* Breakdown Grid: Category Distribution & High Priority Queue */}
          <div className="grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
            {/* Category Breakdown Card */}
            <div className="card">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>
                Issues by Municipal Domain
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {ISSUE_CATEGORIES.map((cat) => {
                  const count = stats.categoryCounts?.[cat] || 0;
                  const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={cat}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cat}</span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div
                        style={{
                          height: '8px',
                          backgroundColor: '#f1f5f9',
                          borderRadius: 'var(--radius-full)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${percentage}%`,
                            backgroundColor: '#2563eb',
                            borderRadius: 'var(--radius-full)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* High Community Priority (CPI) Action Queue */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Zap size={18} color="#ea580c" />
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>
                    High Priority Action Queue
                  </h3>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Ranked by CPI
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {issues
                  .filter((i) => i.status !== 'Resolved')
                  .slice(0, 4)
                  .map((topIssue) => (
                    <div
                      key={topIssue.id}
                      style={{
                        padding: '0.875rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                          <Link to={`/issues/${topIssue.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {topIssue.title}
                          </Link>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          📍 {topIssue.location} • {topIssue.category}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PriorityBadge score={topIssue.priority_score} />
                        <button
                          onClick={() => setResolvingIssue(topIssue)}
                          className="btn btn-accent btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  ))}

                {issues.filter((i) => i.status !== 'Resolved').length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 0.5rem auto' }} />
                    All reported community issues are currently resolved!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: ISSUE MANAGEMENT TABLE & WORKFLOW
          ========================================================================= */}
      {activeTab === 'manage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Search & Filter Bar */}
          <div
            className="card"
            style={{
              padding: '1rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
            }}
          >
            <div style={{ gridColumn: 'span 2', position: 'relative' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.25rem', fontSize: '0.875rem' }}
                placeholder="Search issues by title or street address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="form-control"
              style={{ fontSize: '0.875rem' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              {ISSUE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              className="form-control"
              style={{ fontSize: '0.875rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {STATUS_TYPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              className="form-control"
              style={{ fontSize: '0.875rem' }}
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="All">All Severities</option>
              {SEVERITY_LEVELS.map((sv) => (
                <option key={sv} value={sv}>
                  {sv}
                </option>
              ))}
            </select>
          </div>

          {/* Full Issues Table */}
          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.875rem 1.25rem' }}>Issue &amp; Location</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Severity</th>
                  <th style={{ padding: '0.875rem 1rem' }}>CPI Score</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Current Status</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Status Action</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    style={{ borderBottom: '1px solid var(--border-light)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '1rem 1.25rem', maxWidth: '280px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                        <Link to={`/issues/${issue.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {issue.title}
                        </Link>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        📍 {issue.location}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                        Reported: {formatDate(issue.created_at)}
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-600)', backgroundColor: 'var(--primary-50)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                        {issue.category}
                      </span>
                    </td>

                    <td style={{ padding: '1rem 1rem' }}>
                      <SeverityBadge severity={issue.severity} />
                    </td>

                    <td style={{ padding: '1rem 1rem' }}>
                      <PriorityBadge score={issue.priority_score} />
                    </td>

                    <td style={{ padding: '1rem 1rem' }}>
                      <StatusBadge status={issue.status} />
                    </td>

                    {/* Status Dropdown Trigger */}
                    <td style={{ padding: '1rem 1rem' }}>
                      <select
                        className="form-control"
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.3rem 1.5rem 0.3rem 0.5rem',
                          width: 'auto',
                          minWidth: '125px',
                        }}
                        value={issue.status}
                        onChange={(e) => handleQuickStatusChange(issue.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved (With Proof)</option>
                      </select>
                    </td>

                    {/* Action Buttons */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        {issue.status !== 'Resolved' && (
                          <button
                            onClick={() => setResolvingIssue(issue)}
                            className="btn btn-accent btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                            title="Upload Resolution Proof and Note"
                          >
                            <Upload size={13} />
                            Resolve
                          </button>
                        )}
                        <Link
                          to={`/issues/${issue.id}`}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(issue.id, issue.title)}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#e11d48', borderColor: '#fecdd3', padding: '0.25rem 0.5rem' }}
                          title="Delete invalid/spam report"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: CEP VIVA & METHODOLOGY EXPLAINER
          ========================================================================= */}
      {activeTab === 'viva' && (
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              🎓 Academic Architecture &amp; Viva Examination Guide
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Comprehensive technical overview designed for faculty examination and CEP project demonstration.
            </p>
          </div>

          <div className="grid-2" style={{ gap: '1.5rem' }}>
            {/* Formula Card */}
            <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={16} color="#ea580c" />
                Community Priority Index (CPI) Algorithm
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Deterministic, rule-based prioritization score (0 to 100) calculated transparently:
              </p>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <li><strong>Base Severity:</strong> High = 60 pts, Medium = 35 pts, Low = 15 pts.</li>
                <li><strong>Hazard Category Boost:</strong> +10 pts for Water/Drainage/Waste, +5 pts for Roads/Lighting.</li>
                <li><strong>Aging Penalty:</strong> +2 pts per elapsed day (capped at +30 pts) to prevent backlog stagnation.</li>
              </ul>
            </div>

            {/* Supabase Free Tier Architecture */}
            <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Shield size={16} color="#2563eb" />
                Supabase Free-Tier Security &amp; RLS Model
              </h4>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <li><strong>PostgreSQL Database:</strong> Schema defined in <code>supabase_schema.sql</code> with indexed fields.</li>
                <li><strong>Row-Level Security:</strong> Authenticated residents can only modify their own pending reports; admin role enforced in SQL.</li>
                <li><strong>Storage Buckets:</strong> <code>reported-images</code> and <code>resolution-images</code> (max 5MB, strict MIME check).</li>
                <li><strong>Zero-Cost Compliance:</strong> 100% free-tier compliant with zero paid add-ons.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Proof Modal */}
      {resolvingIssue && (
        <ResolveModal
          issue={resolvingIssue}
          onClose={() => setResolvingIssue(null)}
          onResolve={handleResolveSubmit}
        />
      )}
    </div>
  );
};
