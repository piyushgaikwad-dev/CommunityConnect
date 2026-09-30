import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { sendPasswordResetEmail } from '../services/authService';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useSEO } from '../hooks/useSEO';

export const ForgotPasswordPage = () => {
  useSEO({
    title: 'Forgot Password',
    description: 'Request a secure password reset link for your CommunityConnect account.',
    canonical: 'https://communityconnect.app/forgot-password',
  });

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await sendPasswordResetEmail(email.trim());
      setSubmitted(true);
    } catch (err) {
      console.error('Password reset request error:', err);
      setError(err.message || 'Failed to send password reset email. Please verify the address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-narrow" style={{ paddingTop: '2.5rem' }}>
      <Breadcrumbs items={[{ label: 'Forgot Password', path: '/forgot-password' }]} />

      <div className="card" style={{ padding: '2.5rem 2rem', maxWidth: '480px', margin: '0 auto' }}>
        {!submitted ? (
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
                <KeyRound size={24} />
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                Reset Your Password
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0, lineHeight: 1.5 }}>
                Enter your registered email address and we will send you a secure recovery link.
              </p>
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

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" htmlFor="reset-email">
                  Registered Email Address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  className="form-control"
                  placeholder="e.g. resident@communityconnect.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    Sending Recovery Link...
                  </>
                ) : (
                  <>
                    <Mail size={16} />
                    Send Reset Instructions
                  </>
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
              Check Your Email
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              We have sent a secure password reset link to <strong>{email}</strong>. Click the link in the email to set your new password.
            </p>

            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem 1rem',
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                marginBottom: '1.75rem',
                textAlign: 'left',
                lineHeight: 1.5,
              }}
            >
              💡 <strong>Tip:</strong> If you don't see the email within a few minutes, please check your spam or junk folder.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-primary" style={{ justifyContent: 'center' }}>
                Return to Sign In
              </Link>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="btn btn-outline"
                style={{ justifyContent: 'center' }}
              >
                Resend or Try Another Email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
