import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  Filter,
  ArrowRight,
  LogIn,
} from 'lucide-react';
import { getUserIssues, getIssues } from '../services/issueService';
import { IssueCard } from '../components/IssueCard';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { StatCard } from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { useSEO } from '../hooks/useSEO';
import { STATUS_TYPES } from '../utils/formatters';

export const MyReportsPage = () => {
  useSEO({
    title: 'My Reports & Tracking',
    description: 'Track the status and verified resolution of your reported community issues.',
    canonical: 'https://communityconnect.app/my-reports',
  });

  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserIssues = async () => {
      try {
        setLoading(true);
        if (user) {
          const data = await getUserIssues(user.id);
          // If no personal issues yet, fetch demo issues tagged with current user id or user name
          setIssues(data);
        } else {
          // If unauthenticated guest view, show placeholder prompt
          setIssues([]);
        }
      } catch (err) {
        console.error('Error fetching user reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserIssues();
  }, [user]);

  if (!user) {
    return (
      <div className="container" style={{ paddingTop: '3rem', textAlign: 'center' }}>
        <Breadcrumbs items={[{ label: 'My Reports', path: '/my-reports' }]} />
        <div className="card" style={{ maxWidth: '520px', margin: '2rem auto', padding: '3rem 2rem' }}>
          <FileText size={48} color="#2563eb" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Resident Sign In Required
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Sign in with your resident account to monitor your personal community reports and inspect resolution proof.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link to="/login" className="btn btn-primary">
              <LogIn size={16} />
              Sign In to Your Account
            </Link>
            <Link to="/register" className="btn btn-outline">
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredIssues =
    statusFilter === 'All'
      ? issues
      : issues.filter((i) => i.status === statusFilter);

  const total = issues.length;
  const resolved = issues.filter((i) => i.status === 'Resolved').length;
  const inProgress = issues.filter((i) => i.status === 'In Progress').length;
  const pending = issues.filter((i) => i.status === 'Pending').length;

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <Breadcrumbs items={[{ label: 'My Reports', path: '/my-reports' }]} />

      {/* Page Header */}
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
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            My Community Reports
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', margin: 0 }}>
            Track resolution milestones, work crew assignments, and verified before-and-after proof for your reported issues.
          </p>
        </div>

        <Link to="/report" className="btn btn-primary">
          <PlusCircle size={16} />
          Report Another Issue
        </Link>
      </div>

      {/* Personal KPI Summary Cards */}
      <div className="grid-4" style={{ gap: '1.25rem', marginBottom: '2.5rem' }}>
        <StatCard
          title="My Total Reports"
          value={total}
          subtitle="Issues submitted by you"
          icon={FileText}
          accentColor="#2563eb"
        />
        <StatCard
          title="Verified Resolved"
          value={resolved}
          subtitle="With photo proof"
          icon={CheckCircle2}
          accentColor="#10b981"
        />
        <StatCard
          title="In Progress"
          value={inProgress}
          subtitle="Field crew assigned"
          icon={Loader2}
          accentColor="#0284c7"
        />
        <StatCard
          title="Pending Review"
          value={pending}
          subtitle="In administrative queue"
          icon={Clock}
          accentColor="#f59e0b"
        />
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '0.75rem',
          marginBottom: '1.5rem',
          overflowX: 'auto',
        }}
      >
        {['All', ...STATUS_TYPES].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            {st} ({st === 'All' ? total : issues.filter((i) => i.status === st).length})
          </button>
        ))}
      </div>

      {/* Reports Feed */}
      {loading ? (
        <div className="grid-3">
          <div className="skeleton" style={{ height: '320px', borderRadius: 'var(--radius-lg)' }} />
          <div className="skeleton" style={{ height: '320px', borderRadius: 'var(--radius-lg)' }} />
        </div>
      ) : filteredIssues.length > 0 ? (
        <div className="grid-3" style={{ gap: '1.5rem' }}>
          {filteredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      ) : (
        <div
          className="card"
          style={{
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            backgroundColor: '#ffffff',
          }}
        >
          <AlertCircle size={40} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            No Reports in this View
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
            {statusFilter !== 'All'
              ? `You do not have any reports with status "${statusFilter}".`
              : 'You have not submitted any community issue reports yet.'}
          </p>
          <Link to="/report" className="btn btn-primary">
            <PlusCircle size={15} />
            Submit Your First Report
          </Link>
        </div>
      )}
    </div>
  );
};
