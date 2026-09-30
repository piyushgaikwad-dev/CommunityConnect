import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Shield, Mail, Calendar, FileText, LogOut, PlusCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useSEO } from '../hooks/useSEO';
import { formatDate } from '../utils/formatters';

export const ProfilePage = () => {
  useSEO({
    title: 'User Profile & Settings',
    description: 'Manage your CommunityConnect resident account and view submitted civic reports.',
    canonical: 'https://communityconnect.app/profile',
  });

  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="container" style={{ paddingTop: '3rem', textAlign: 'center' }}>
        <Breadcrumbs items={[{ label: 'Profile', path: '/profile' }]} />
        <div className="card" style={{ maxWidth: '480px', margin: '2rem auto', padding: '3rem 2rem' }}>
          <User size={48} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            No Active Session
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Please sign in to view your user profile and report activity.
          </p>
          <Link to="/login" className="btn btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-narrow" style={{ paddingTop: '2rem' }}>
      <Breadcrumbs items={[{ label: 'Profile', path: '/profile' }]} />

      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem' }}>
          User Account &amp; Profile
        </h1>

        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          {/* Top User Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: isAdmin ? '#fee2e2' : 'var(--primary-50)',
                color: isAdmin ? '#dc2626' : 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.5rem',
              }}
            >
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {user.name}
                </h2>
                <span
                  style={{
                    backgroundColor: isAdmin ? '#dc2626' : '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    textTransform: 'uppercase',
                  }}
                >
                  {user.role}
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={14} />
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          {/* Profile Details List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Account Identifier (UUID):</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{user.id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Assigned Access Tier:</span>
              <span style={{ fontWeight: 600, color: isAdmin ? '#dc2626' : 'var(--primary-600)' }}>
                {isAdmin ? 'Administrative Authority (Triage & Resolution)' : 'Verified Resident Reporter'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
              <span style={{ color: 'var(--text-muted)' }}>Database Security:</span>
              <span style={{ fontWeight: 600, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle2 size={14} />
                Supabase RLS Protected
              </span>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Link to="/my-reports" className="btn btn-secondary btn-sm" style={{ justifyContent: 'center' }}>
              <FileText size={14} />
              My Reports
            </Link>
            <Link to="/report" className="btn btn-primary btn-sm" style={{ justifyContent: 'center' }}>
              <PlusCircle size={14} />
              Report Issue
            </Link>
            {isAdmin && (
              <Link to="/admin" className="btn btn-outline btn-sm" style={{ justifyContent: 'center', color: '#dc2626', borderColor: '#fca5a5' }}>
                <Shield size={14} />
                Admin Dashboard
              </Link>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-danger btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <LogOut size={14} />
            Sign Out of Account
          </button>
        </div>
      </div>
    </div>
  );
};
