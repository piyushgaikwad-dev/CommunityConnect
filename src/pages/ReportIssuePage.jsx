import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Camera,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Upload,
  X,
  Loader2,
  Zap,
  Info,
  Sparkles,
} from 'lucide-react';
import { createIssue } from '../services/issueService';
import { validateImageFile } from '../services/storageService';
import { LocationPickerMap } from '../components/LocationPickerMap';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSEO } from '../hooks/useSEO';
import { ISSUE_CATEGORIES, SEVERITY_LEVELS } from '../utils/formatters';
import { calculatePriorityScore, getPriorityLevel } from '../utils/priorityCalculator';

export const ReportIssuePage = () => {
  useSEO({
    title: 'Report a Community Issue',
    description: 'Submit a neighborhood defect, hazard, or infrastructure problem with photo evidence and exact GPS pin.',
    canonical: 'https://communityconnect.app/report',
  });

  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Roads & Potholes');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('12.971598');
  const [longitude, setLongitude] = useState('77.594562');
  const [severity, setSeverity] = useState('Medium');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successIssue, setSuccessIssue] = useState(null);

  // Live Priority Score Calculation
  const priorityPreview = calculatePriorityScore({
    severity,
    category,
    createdAt: new Date().toISOString(),
  });
  const priorityLevel = getPriorityLevel(priorityPreview.totalScore);

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

  const handleDemoFill = () => {
    setTitle('Broken Manhole Cover exposing drain cavity');
    setCategory('Drainage');
    setDescription('Cracked concrete manhole slab on the pedestrian footpath right outside the grocery store. High hazard for elderly pedestrians and children at night.');
    setLocation('Near Reliance Fresh, 4th Cross Road, Ward 14');
    setLatitude('12.973400');
    setLongitude('77.596800');
    setSeverity('High');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!title.trim() || title.trim().length < 5) {
      setError('Please provide a descriptive title (at least 5 characters).');
      return;
    }

    if (!description.trim() || description.trim().length < 15) {
      setError('Please provide a detailed description (at least 15 characters).');
      return;
    }

    if (!location.trim()) {
      setError('Please enter the street address or landmark location.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const created = await createIssue(
        {
          title: title.trim(),
          category,
          description: description.trim(),
          location: location.trim(),
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
          severity,
        },
        imageFile,
        user
      );

      setSuccessIssue(created);
      showToast('Community issue reported successfully!', 'success');
    } catch (err) {
      console.error('Error reporting issue:', err);
      setError(err.message || 'Failed to submit report. Please verify connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <Breadcrumbs items={[{ label: 'Report Issue', path: '/report' }]} />

      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Report a Community Issue
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', margin: 0 }}>
              Submit a geotagged hazard or infrastructure problem for municipal review and field repair.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDemoFill}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.8125rem', gap: '0.35rem' }}
          >
            <Sparkles size={14} color="#2563eb" />
            Quick Demo Auto-Fill
          </button>
        </div>

        {/* Success Modal Confirmation */}
        {successIssue && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Report Successfully Logged!
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Your issue <strong>"{successIssue.title}"</strong> has been saved with priority index score <strong>CPI {successIssue.priority_score}</strong> and assigned to the municipal queue.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <Link to={`/issues/${successIssue.id}`} className="btn btn-primary">
                  View Issue Details
                </Link>
                <Link to="/issues" className="btn btn-secondary">
                  Community Feed
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #fca5a5',
              padding: '0.875rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
          {/* Category & Severity Grid */}
          <div className="grid-2" style={{ gap: '1.25rem' }}>
            {/* Category */}
            <div className="form-group">
              <label className="form-label" htmlFor="category">
                <span>Issue Category *</span>
              </label>
              <select
                id="category"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {ISSUE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div className="form-group">
              <label className="form-label" htmlFor="severity">
                <span>Severity Level *</span>
                <span className="form-hint">{severity === 'High' ? 'Safety risk' : severity === 'Medium' ? 'Moderate' : 'Routine'}</span>
              </label>
              <select
                id="severity"
                className="form-control"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                required
              >
                {SEVERITY_LEVELS.map((sev) => (
                  <option key={sev} value={sev}>
                    {sev} Severity
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              <span>Issue Title *</span>
              <span className="form-hint">{title.length}/100 chars</span>
            </label>
            <input
              id="title"
              type="text"
              className="form-control"
              placeholder="e.g. Deep Pothole cluster near 5th Cross Junction"
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">
              <span>Detailed Description *</span>
              <span className="form-hint">{description.length}/1000 chars</span>
            </label>
            <textarea
              id="description"
              rows={4}
              className="form-control"
              placeholder="Describe the exact issue, hazard level, how long it has existed, and safety risks to pedestrians or vehicles..."
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Location Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="location">
              <span>Location / Landmark / Street Address *</span>
            </label>
            <input
              id="location"
              type="text"
              className="form-control"
              placeholder="e.g. Opposite Community Park Gate 2, Rosewood Avenue, Ward 14"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          {/* Interactive GPS Pin Drop on Leaflet Map */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">
              <span>Geotag Map Pin (Click to Set Exact Coordinates)</span>
              <span className="form-hint">Latitude: {latitude}, Longitude: {longitude}</span>
            </label>
            <LocationPickerMap
              latitude={latitude}
              longitude={longitude}
              onChange={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
              height="260px"
            />
          </div>

          {/* Photo Evidence Upload */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">
              <span>Photo Evidence (Recommended)</span>
              <span className="form-hint">JPEG, PNG, WebP (Max 5MB)</span>
            </label>

            {imagePreview ? (
              <div
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '2px solid var(--primary-500)',
                  height: '200px',
                }}
              >
                <img
                  src={imagePreview}
                  alt="Reported issue preview"
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
                  title="Remove image"
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
                  padding: '2rem',
                  border: '2px dashed var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-subtle)',
                }}
              >
                <Camera size={32} color="#2563eb" style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Click or drag photo of the problem
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Clear photographic evidence accelerates field verification
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

          {/* Live Community Priority Index (CPI) Preview Card */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: `1px solid ${priorityLevel.color}30`,
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  backgroundColor: `${priorityLevel.color}15`,
                  color: priorityLevel.color,
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <Zap size={20} fill={priorityLevel.color} />
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Projected Priority Index (CPI):{' '}
                  <span style={{ color: priorityLevel.color, fontFamily: 'monospace' }}>
                    {priorityPreview.totalScore}/100
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Base Severity: +{priorityPreview.breakdown.baseScore} | Category Boost: +{priorityPreview.breakdown.categoryBoost} ({priorityLevel.label})
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Transparent Viva Algorithm
            </span>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Link to="/issues" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ minWidth: '180px' }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spin-slow" />
                  Submitting Report...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Submit Community Issue
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
