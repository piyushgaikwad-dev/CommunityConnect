import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Map, Filter, Layers, PlusCircle, AlertCircle } from 'lucide-react';
import { getIssues } from '../services/issueService';
import { LeafletMap } from '../components/LeafletMap';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useSEO } from '../hooks/useSEO';
import { ISSUE_CATEGORIES, STATUS_TYPES } from '../utils/formatters';

export const CommunityMapPage = () => {
  useSEO({
    title: 'Community Issue Map',
    description: 'Interactive geospatial map displaying verified hyperlocal civic issues, street defects, and resolved neighborhood repairs.',
    canonical: 'https://communityconnect.app/map',
  });

  const [issues, setIssues] = useState([]);
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMapIssues = async () => {
      try {
        setLoading(true);
        const data = await getIssues({
          category,
          status,
        });
        setIssues(data);
      } catch (err) {
        console.error('Error fetching map issues:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMapIssues();
  }, [category, status]);

  const validCount = issues.filter(
    (i) => i.latitude !== null && i.longitude !== null && !isNaN(Number(i.latitude))
  ).length;

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <Breadcrumbs items={[{ label: 'Community Map', path: '/map' }]} />

      {/* Header */}
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
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Geospatial Community Issue Map
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', margin: 0 }}>
            Geotagged neighborhood issues mapped with OpenStreetMap. Showing <strong>{validCount}</strong> active coordinates.
          </p>
        </div>

        <Link to="/report" className="btn btn-primary">
          <PlusCircle size={16} />
          Report at Current Location
        </Link>
      </div>

      {/* Filter Bar */}
      <div
        className="card"
        style={{
          padding: '1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <Filter size={16} />
            <span>Filters:</span>
          </div>

          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '160px', padding: '0.4rem 2rem 0.4rem 0.75rem', fontSize: '0.875rem' }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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
            style={{ width: 'auto', minWidth: '140px', padding: '0.4rem 2rem 0.4rem 0.75rem', fontSize: '0.875rem' }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            {STATUS_TYPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Click on any marker pin to view photos, CPI score, and details.
        </div>
      </div>

      {/* Map Element */}
      <div style={{ position: 'relative' }}>
        <LeafletMap
          issues={issues}
          height="620px"
          onMarkerClick={(issue) => setSelectedIssue(issue)}
        />
      </div>
    </div>
  );
};
