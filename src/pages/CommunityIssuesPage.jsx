import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Layers,
  LayoutGrid,
  List,
  PlusCircle,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { getIssues } from '../services/issueService';
import { IssueCard } from '../components/IssueCard';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { IssueCardSkeleton, TableRowSkeleton } from '../components/LoadingSkeleton';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useSEO } from '../hooks/useSEO';
import { ISSUE_CATEGORIES, SEVERITY_LEVELS, STATUS_TYPES, formatDate } from '../utils/formatters';

export const CommunityIssuesPage = () => {
  useSEO({
    title: 'Community Issues Directory',
    description: 'Explore live community reports, filter by category or severity, and track municipal resolution progress.',
    canonical: 'https://communityconnect.app/issues',
  });

  const [searchParams, setSearchParams] = useSearchParams();

  // Filters State
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [severity, setSeverity] = useState(searchParams.get('severity') || 'All');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state with URL params
  useEffect(() => {
    const fetchFilteredIssues = async () => {
      try {
        setLoading(true);
        const data = await getIssues({
          search: searchTerm,
          category,
          status,
          severity,
          sort,
        });
        setIssues(data);
      } catch (err) {
        console.error('Error fetching issues:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredIssues();
  }, [searchTerm, category, status, severity, sort]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategory('All');
    setStatus('All');
    setSeverity('All');
    setSort('newest');
    setSearchParams({});
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    category !== 'All' ||
    status !== 'All' ||
    severity !== 'All' ||
    sort !== 'newest';

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <Breadcrumbs items={[{ label: 'Community Issues', path: '/issues' }]} />

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
            Community Issues Directory
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', margin: 0 }}>
            Public repository of verified neighborhood reports, repair logs, and civic resolutions.
          </p>
        </div>

        <Link to="/report" className="btn btn-primary" style={{ gap: '0.4rem' }}>
          <PlusCircle size={16} />
          Report New Issue
        </Link>
      </div>

      {/* Filter & Search Toolbar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '2rem',
          backgroundColor: '#ffffff',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            alignItems: 'center',
          }}
        >
          {/* Search Input */}
          <div style={{ position: 'relative', gridColumn: 'span 2' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by keyword, street, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              className="form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="All">All Categories</option>
              {ISSUE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="form-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="All">All Statuses</option>
              {STATUS_TYPES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              className="form-control"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              aria-label="Filter by severity"
            >
              <option value="All">All Severities</option>
              {SEVERITY_LEVELS.map((sev) => (
                <option key={sev} value={sev}>
                  {sev} Severity
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <select
              className="form-control"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort issues"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="priority">Sort: Highest CPI Score</option>
            </select>
          </div>
        </div>

        {/* Toolbar Sub-bar: Active filters & View Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginTop: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-light)',
            fontSize: '0.875rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
            <span>
              Showing <strong>{issues.length}</strong> {issues.length === 1 ? 'issue' : 'issues'}
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', height: 'auto' }}
              >
                <X size={12} />
                Clear Filters
              </button>
            )}
          </div>

          {/* Grid vs Table View Mode Switcher */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '2px',
              border: '1px solid var(--border-light)',
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '0.35rem 0.6rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: viewMode === 'grid' ? 700 : 500,
                color: viewMode === 'grid' ? 'var(--primary-600)' : 'var(--text-muted)',
                boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none',
              }}
              title="Grid View"
            >
              <LayoutGrid size={14} />
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                background: viewMode === 'table' ? '#ffffff' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '0.35rem 0.6rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: viewMode === 'table' ? 700 : 500,
                color: viewMode === 'table' ? 'var(--primary-600)' : 'var(--text-muted)',
                boxShadow: viewMode === 'table' ? 'var(--shadow-sm)' : 'none',
              }}
              title="Table View"
            >
              <List size={14} />
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Issues Content Display */}
      {loading ? (
        <div className="grid-3">
          <IssueCardSkeleton />
          <IssueCardSkeleton />
          <IssueCardSkeleton />
        </div>
      ) : issues.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid-3" style={{ gap: '1.5rem' }}>
            {issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        ) : (
          /* Table View */
          <div
            className="card"
            style={{
              padding: 0,
              overflowX: 'auto',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.875rem',
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderBottom: '1px solid var(--border-light)',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.8125rem',
                  }}
                >
                  <th style={{ padding: '0.875rem 1.25rem' }}>Issue Title</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Location</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Severity</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.875rem 1rem' }}>CPI Score</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Date Reported</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr
                    key={issue.id}
                    style={{
                      borderBottom: '1px solid var(--border-light)',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>
                      <Link to={`/issues/${issue.id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                        {issue.title}
                      </Link>
                    </td>
                    <td style={{ padding: '1rem 1rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--primary-600)',
                          backgroundColor: 'var(--primary-50)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {issue.category}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      📍 {issue.location}
                    </td>
                    <td style={{ padding: '1rem 1rem' }}>
                      <SeverityBadge severity={issue.severity} />
                    </td>
                    <td style={{ padding: '1rem 1rem' }}>
                      <StatusBadge status={issue.status} />
                    </td>
                    <td style={{ padding: '1rem 1rem' }}>
                      <PriorityBadge score={issue.priority_score} />
                    </td>
                    <td style={{ padding: '1rem 1rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                      {formatDate(issue.created_at)}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <Link to={`/issues/${issue.id}`} className="btn btn-outline btn-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* Empty State */
        <div
          className="card"
          style={{
            padding: '4rem 1.5rem',
            textAlign: 'center',
            backgroundColor: '#ffffff',
          }}
        >
          <AlertCircle size={44} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            No Matching Community Issues Found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
            {hasActiveFilters
              ? 'Try relaxing your filter criteria or search query to see more results.'
              : 'No community issues have been reported yet in this category.'}
          </p>
          {hasActiveFilters ? (
            <button onClick={handleResetFilters} className="btn btn-secondary">
              <RefreshCw size={15} />
              Reset All Filters
            </button>
          ) : (
            <Link to="/report" className="btn btn-primary">
              <PlusCircle size={15} />
              Be the First to Report
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
