import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Shield, User, AlertCircle, Loader2, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useSEO } from '../hooks/useSEO';

export const LoginPage = () => {
  useSEO({
    title: 'Sign In',
    description: 'Sign in to CommunityConnect to report issues and track municipal resolutions.',
    canonical: 'https://communityconnect.app/login',
  });

  const navigate = useNavigate();
  const { login, quickDemoLogin } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login({ email, password });
      showToast('Successfully signed in!', 'success');
      navigate('/issues');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    try {
      setLoading(true);
      setError(null);
      await quickDemoLogin(role);
      showToast(`Signed in as ${role === 'admin' ? 'Ward Administrator' : 'Resident'}!`, 'success');
      navigate(role === 'admin' ? '/admin' : '/issues');
    } catch (err) {
      setError('Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-narrow" style={{ paddingTop: '2.5rem' }}>
      <Breadcrumbs items={[{ label: 'Sign In', path: '/login' }]} />

      <div className="card" style={{ padding: '2.5rem 2rem', maxWidth: '480px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'var(--primary-50)',
              color: 'var(--primary-600)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}
          >
            <LogIn size={24} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Resident &amp; Admin Sign In
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
            Access your civic dashboard and manage neighborhood reports
          </p>
        </div>

        {/* Demo Fast Login for Viva Examiners */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={12} color="#2563eb" />
            <span>Examiner / Evaluator Fast Sign In</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleDemo('resident')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', justifyContent: 'center' }}
              disabled={loading}
            >
              <User size={13} />
              Resident Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemo('admin')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', justifyContent: 'center', color: '#dc2626', borderColor: '#fca5a5' }}
              disabled={loading}
            >
              <Shield size={13} />
              Admin Demo
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #fca5a5',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="e.g. resident@communityconnect.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <label className="form-label" htmlFor="password" style={{ margin: 0 }}>
                Password
              </label>
              <Link
                to="/forgot-password"
                style={{ fontSize: '0.8125rem', color: 'var(--primary-600)', fontWeight: 600, textDecoration: 'none' }}
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin-slow" />
                Signing In...
              </>
            ) : (
              'Sign In to Account'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Create Resident Account
          </Link>
        </div>
      </div>
    </div>
  );
};
