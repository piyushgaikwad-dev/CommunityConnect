import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Navigation, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

export const LeafletMap = ({
  issues = [],
  center = [12.971598, 77.594562], // Default civic locality center
  zoom = 13,
  height = '500px',
  interactive = true,
  onMarkerClick,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: interactive,
        dragging: interactive,
        touchZoom: interactive,
        scrollWheelZoom: interactive,
      });

      // OpenStreetMap Tile Layer (Free, Standard)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when issues change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const validIssues = issues.filter(
      (issue) =>
        issue.latitude !== null &&
        issue.latitude !== undefined &&
        issue.longitude !== null &&
        issue.longitude !== undefined &&
        !isNaN(Number(issue.latitude)) &&
        !isNaN(Number(issue.longitude))
    );

    if (validIssues.length === 0) return;

    const bounds = L.latLngBounds();

    validIssues.forEach((issue) => {
      const lat = Number(issue.latitude);
      const lng = Number(issue.longitude);
      bounds.extend([lat, lng]);

      let colorClass = 'marker-pending';
      let pinColor = '#f59e0b';
      if (issue.status === 'Resolved') {
        colorClass = 'marker-resolved';
        pinColor = '#10b981';
      } else if (issue.status === 'In Progress') {
        colorClass = 'marker-progress';
        pinColor = '#2563eb';
      }

      // Custom Circular Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-leaflet-div-icon',
        html: `
          <div class="custom-map-marker ${colorClass}" style="width: 32px; height: 32px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <div style="width: 12px; height: 12px; background-color: #ffffff; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Popup Content
      const popupHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 200px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 700; color: #2563eb; text-transform: uppercase;">${issue.category}</span>
            <span style="font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 10px; background: ${pinColor}20; color: ${pinColor};">${issue.status}</span>
          </div>
          <h4 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0; line-height: 1.3;">${issue.title}</h4>
          <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0; line-height: 1.3;">📍 ${issue.location}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 6px;">
            <span style="font-size: 11px; font-weight: 700; color: #475569;">CPI Score: ${issue.priority_score || 0}</span>
            <a href="/issues/${issue.id}" style="font-size: 12px; font-weight: 700; color: #2563eb; text-decoration: none;">View Issue &rarr;</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(issue));
      }

      markersLayerRef.current.addLayer(marker);
    });

    // If valid bounds exist and multiple markers present, fit bounds
    if (validIssues.length > 1) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    } else if (validIssues.length === 1) {
      mapInstanceRef.current.setView([validIssues[0].latitude, validIssues[0].longitude], 14);
    }
  }, [issues, onMarkerClick]);

  // Geolocation Handler
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 15);

          // User Marker
          const userIcon = L.divIcon({
            className: 'user-loc-icon',
            html: `
              <div style="width: 20px; height: 20px; background-color: #2563eb; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 0 4px rgba(37,99,235,0.4);"></div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          L.marker([latitude, longitude], { icon: userIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup('<b>Your Current Location</b>')
            .openPopup();
        }
      },
      (err) => {
        setLocating(false);
        console.warn('Geolocation error:', err);
        alert('Unable to retrieve your location. Please check browser permissions.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
      {/* Map Target */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Controls / Locate Me */}
      {interactive && (
        <button
          onClick={handleLocateMe}
          disabled={locating}
          className="btn btn-secondary btn-sm"
          style={{
            position: 'absolute',
            bottom: '1.25rem',
            right: '1.25rem',
            zIndex: 400,
            boxShadow: 'var(--shadow-md)',
            backgroundColor: '#ffffff',
          }}
          title="Center map on current location"
        >
          <Navigation size={14} className={locating ? 'spin-slow' : ''} />
          {locating ? 'Locating...' : 'Locate Me'}
        </button>
      )}

      {/* Legend Badge */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 400,
          backgroundColor: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(4px)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '0.5rem 0.75rem',
          fontSize: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <span style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>
          Issue Status
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
          <span>Pending Review</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
          <span>In Progress</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span>Resolved &amp; Verified</span>
        </div>
      </div>
    </div>
  );
};
