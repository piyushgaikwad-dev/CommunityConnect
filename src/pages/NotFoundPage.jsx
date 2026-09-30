import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Home, Layers, Compass, ArrowLeft } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

export const NotFoundPage = () => {
  useSEO({
    title: '404 - Page Not Found',
    description: 'The requested CommunityConnect civic portal page was not found.',
    canonical: 'https://communityconnect.app/404',
  });

  return (
    <div className="container-narrow" style={{ paddingTop: '5rem', textAlign: 'center' }}>
      <div className="card" style={{ padding: '3.5rem 2rem', maxWidth: '560px', margin: '0 auto', boxShadow: 'var(--shadow-xl)' }}>
        {/* Brand Icon */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #2563eb, #0d9488)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            margin: '0 auto 1.5rem auto',
            boxShadow: '0 8px 16px rgba(37,99,235,0.25)',
          }}
        >
          <MapPin size={32} />
        </div>

        <div
          style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: 'var(--primary-500)',
            lineHeight: 1,
            marginBottom: '0.5rem',
          }}
        >
          404
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
          Civic Page Not Found
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '420px', margin: '0 auto 2rem auto' }}>
          The requested page or neighborhood issue report could not be found or has been moved to another location.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">
            <Home size={16} />
            Back to Home
          </Link>
          <Link to="/issues" className="btn btn-secondary">
            <Layers size={16} />
            Explore Community Issues
          </Link>
        </div>
      </div>
    </div>
  );
};
