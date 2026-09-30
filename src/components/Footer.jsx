import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Shield, Database, ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        borderTop: '1px solid #1e293b',
        marginTop: 'auto',
        paddingTop: '3.5rem',
        paddingBottom: '2rem',
      }}
    >
      <div className="container">
        <div className="grid-4" style={{ gap: '2.5rem', marginBottom: '3rem' }}>
          {/* Brand Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #3b82f6, #10b981)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <MapPin size={20} strokeWidth={2.5} />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                }}
              >
                Community<span style={{ color: '#38bdf8' }}>Connect</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              Hyperlocal Community Issue Mapping &amp; Resolution Portal. Empowering neighborhood residents to report civic problems and verify photographic resolution proof.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
              <Database size={13} color="#38bdf8" />
              <span>Supabase Free Tier Architecture</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4
              style={{
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: '#f1f5f9',
                marginBottom: '1rem',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              Platform Navigation
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li>
                <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Homepage &amp; Impact
                </Link>
              </li>
              <li>
                <Link to="/issues" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Explore Community Issues
                </Link>
              </li>
              <li>
                <Link to="/map" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Geospatial Issue Map
                </Link>
              </li>
              <li>
                <Link to="/report" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Report a Neighborhood Issue
                </Link>
              </li>
            </ul>
          </div>

          {/* Civic Priorities */}
          <div>
            <h4
              style={{
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: '#f1f5f9',
                marginBottom: '1rem',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              Issue Categories
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li>
                <Link to="/issues?category=Roads+%26+Potholes" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Roads &amp; Potholes
                </Link>
              </li>
              <li>
                <Link to="/issues?category=Street+Lighting" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Street Lighting
                </Link>
              </li>
              <li>
                <Link to="/issues?category=Waste+%26+Garbage" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Waste &amp; Solid Garbage
                </Link>
              </li>
              <li>
                <Link to="/issues?category=Water+%26+Leakage" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Water &amp; Municipal Leakage
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic CEP Purpose */}
          <div>
            <h4
              style={{
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: '#f1f5f9',
                marginBottom: '1rem',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              CEP Project Context
            </h4>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
              Developed as a student <strong>Community Engagement Project (CEP)</strong> demonstrating full-stack civic technology, verified photo evidence accountability, and transparent Community Priority Index (CPI) scoring.
            </p>
            <div style={{ marginTop: '1rem' }}>
              <Link
                to="/admin"
                className="btn btn-outline btn-sm"
                style={{ color: '#e2e8f0', borderColor: '#334155', fontSize: '0.75rem' }}
              >
                <Shield size={13} />
                Admin Portal
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid #1e293b',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8125rem',
            color: '#64748b',
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} CommunityConnect. Built for Community Engagement &amp; Civic Governance.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/issues" style={{ color: '#64748b' }}>Public Issues</Link>
            <span>•</span>
            <Link to="/map" style={{ color: '#64748b' }}>OpenStreetMap</Link>
            <span>•</span>
            <a href="/llms.txt" target="_blank" rel="noreferrer" style={{ color: '#64748b' }}>llms.txt</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
