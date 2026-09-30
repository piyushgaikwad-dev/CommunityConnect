import React, { useState } from 'react';
import { Database, CheckCircle, AlertTriangle, ExternalLink, Copy, Check, X, ShieldAlert } from 'lucide-react';
import { getSupabaseConfigStatus } from '../lib/supabase';

export const SupabaseStatusBanner = () => {
  const status = getSupabaseConfigStatus();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const envSample = `VITE_SUPABASE_URL=https://your-project-id.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`;

  const handleCopy = () => {
    navigator.clipboard.writeText(envSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn btn-sm"
        style={{
          fontSize: '0.75rem',
          padding: '0.25rem 0.6rem',
          borderRadius: 'var(--radius-full)',
          backgroundColor: status.isConfigured ? '#ecfdf5' : '#eff6ff',
          color: status.isConfigured ? '#065f46' : '#1e40af',
          border: `1px solid ${status.isConfigured ? '#a7f3d0' : '#bfdbfe'}`,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
        }}
        title="Click to view Supabase Connection & Free Tier Architecture"
      >
        <Database size={13} />
        <span>{status.isConfigured ? 'Supabase Connected' : 'Free-Tier Engine (Ready)'}</span>
      </button>

      {/* Connection Info Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid var(--border-light)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={20} color="#2563eb" />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>
                  Supabase Architecture &amp; Free-Tier Compliance
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-outline btn-sm"
                style={{ padding: '0.25rem', border: 'none' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              <p style={{ marginBottom: '0.75rem' }}>
                <strong>Current Status:</strong>{' '}
                <span
                  style={{
                    backgroundColor: status.isConfigured ? '#dcfce7' : '#e0f2fe',
                    color: status.isConfigured ? '#166534' : '#0369a1',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                  }}
                >
                  {status.mode}
                </span>
              </p>

              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  📌 Free-Tier Setup Instructions:
                </div>
                <ol style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <li>Create a free project at <a href="https://supabase.com" target="_blank" rel="noreferrer">supabase.com</a>.</li>
                  <li>Copy and execute the entire <code>supabase_schema.sql</code> script in the Supabase SQL Editor.</li>
                  <li>Add your project credentials to your <code>.env</code> file:</li>
                </ol>

                <div
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <code>{envSample}</code>
                  <button
                    onClick={handleCopy}
                    className="btn btn-sm"
                    style={{ backgroundColor: '#334155', color: '#ffffff', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                <strong>Strict Compliance Note:</strong> This application uses zero paid Supabase features or extensions. All queries, photo storage, and Row Level Security (RLS) policies are 100% compliant with the free plan.
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowModal(false)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
