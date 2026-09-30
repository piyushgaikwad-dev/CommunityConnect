import React, { useState } from 'react';
import { X, CheckCircle2, Upload, Camera, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { validateImageFile } from '../services/storageService';

export const ResolveModal = ({ issue, onClose, onResolve }) => {
  const [resolutionNote, setResolutionNote] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!issue) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Require resolution note AND/OR resolution proof image
    if (!resolutionNote.trim() && !imageFile) {
      setError('Please provide an official resolution note or upload a resolution-proof photo.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onResolve({
        issueId: issue.id,
        newStatus: 'Resolved',
        resolutionNote: resolutionNote.trim(),
        resolutionImageFile: imageFile,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to resolve issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                backgroundColor: '#dcfce7',
                color: '#166534',
                padding: '0.4rem',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Complete Issue Resolution</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                Upload photographic verification and official field notes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-outline btn-sm"
            style={{ padding: '0.35rem', border: 'none' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Issue Target Info */}
        <div
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.875rem',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
            {issue.title}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            📍 {issue.location} • Category: {issue.category}
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

        <form onSubmit={handleSubmit}>
          {/* Resolution Photo Upload */}
          <div className="form-group">
            <label className="form-label">
              <span>Resolution Proof Image (Required Evidence)</span>
              <span className="form-hint">JPEG, PNG, WebP (Max 5MB)</span>
            </label>

            {imagePreview ? (
              <div
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '2px solid #10b981',
                  height: '180px',
                  marginBottom: '0.5rem',
                }}
              >
                <img
                  src={imagePreview}
                  alt="Resolution proof preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '50%',
                    padding: '0.35rem',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.5rem',
                  border: '2px dashed var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-subtle)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Camera size={28} color="#2563eb" style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Click to upload AFTER resolution photo
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Demonstrate the resolved condition (e.g. repaved road, fixed light)
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

          {/* Official Resolution Note */}
          <div className="form-group">
            <label className="form-label" htmlFor="resolutionNote">
              <span>Official Action / Resolution Note</span>
              <span className="form-hint">Describe repair action taken</span>
            </label>
            <textarea
              id="resolutionNote"
              rows={3}
              className="form-control"
              placeholder="e.g. Cleared 1.2 tons of solid waste and disinfected the area with lime powder on Sept 28..."
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              required
            />
          </div>

          {/* Modal Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '1.5rem',
              borderTop: '1px solid var(--border-light)',
              paddingTop: '1rem',
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-accent"
              disabled={loading}
              style={{ minWidth: '160px' }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin-slow" />
                  Saving Resolution...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Mark as Resolved
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
