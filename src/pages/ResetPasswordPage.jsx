import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, AlertCircle, Loader2, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { updatePassword } from '../services/authService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useToast } from '../context/ToastContext';
import { useSEO } from '../hooks/useSEO';

export const ResetPasswordPage = () => {
  useSEO({
    title: 'Set New Password',
    description: 'Set a new secure password for your CommunityConnect account.',
    canonical: 'https://communityconnect.app/reset-password',
  });

  const navigate = useNavigate();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRecoveryActive, setIsRecoveryActive] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if recovery session is active or hash contains error
    const hash = window.location.hash;
    if (hash && hash.includes('error=')) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const errorDesc = params.get('error_description') || 'Password reset link is invalid or has expired.';
      setError(errorDesc);
      setIsRecoveryActive(false);
      return;
    }

    if (isSupabaseConfigured() && supabase) {
      // Listen for PASSWORD_RECOVERY auth event
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsRecoveryActive(true);
          setError(null);
        }
      });

      // Also verify current session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session && !window.location.hash.includes('access_token')) {
          // If no session and no access token in hash, link might be visited directly
          // Still permit entering password in case session is already initialized
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password) {
      setError('Please enter your new password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your new password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await updatePassword(password);

      setSuccess(true);
      showToast('Password updated successfully! You can now sign in.', 'success');

      // Redirect to login after a brief pause
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      console.error('Error updating password:', err);
      setError(err.message || 'Failed to update password. Your recovery link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-narrow" style={{ paddingTop: '2.5rem' }}>
      <Breadcrumbs items={[{ label: 'Reset Password', path: '/reset-password' }]} />

      <div className="card" style={{ padding: '2.5rem 2rem', maxWidth: '480px', margin: '0 auto' }}>
        {!success ? (
          <>
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
                <Lock size={24} />
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                Set New Password
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                Enter and confirm your new account password below.
              </p>
            </div>

            {error && (
              <div
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  border: '1px solid #fca5a5',
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  marginBottom: '1.5rem',
                  lineHeight: 1.5,
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div>{error}</div>
                  <Link
                    to="/forgot-password"
                    style={{
                      display: 'inline-block',
                      marginTop: '0.5rem',
                      fontWeight: 700,
                      color: '#b91c1c',
                      textDecoration: 'underline',
                      fontSize: '0.8125rem',
                    }}
                  >
                    Request a new password reset link &rarr;
                  </Link>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="new-password">
                  <span>New Password</span>
                  <span className="form-hint">Min 6 characters</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" htmlFor="confirm-new-password">
                  Confirm New Password
                </label>
                <input
                  id="confirm-new-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginBottom: '1.5rem',
                }}
              >
                <ShieldCheck size={14} color="#10b981" />
                <span>Encrypted and secured directly with Supabase Authentication.</span>
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
                    Updating Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <ArrowLeft size={14} />
                Back to Sign In
              </Link>
            </div>
          </>
        ) : (
          /* Success Screen */
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                backgroundColor: '#dcfce7',
                color: '#166534',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
              }}
            >
              <CheckCircle2 size={32} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Password Reset Successful!
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              Your password has been securely updated. Redirecting you to the sign-in page...
            </p>

            <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Proceed to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
