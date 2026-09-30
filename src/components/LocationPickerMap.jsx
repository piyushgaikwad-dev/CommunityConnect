import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Navigation, MapPin } from 'lucide-react';

export const LocationPickerMap = ({
  latitude,
  longitude,
  onChange,
  height = '280px',
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [locating, setLocating] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialLat = latitude ? Number(latitude) : 12.971598;
    const initialLng = longitude ? Number(longitude) : 77.594562;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Create draggable picker pin
      const pinIcon = L.divIcon({
        className: 'picker-pin-icon',
        html: `
          <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center;">
            <div style="background-color: #e11d48; color: #ffffff; padding: 4px; border-radius: 50%; box-shadow: 0 4px 10px rgba(225,29,72,0.4); border: 2px solid #ffffff;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div style="width: 2px; height: 6px; background-color: #e11d48;"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      if (latitude && longitude) {
        markerRef.current = L.marker([initialLat, initialLng], {
          icon: pinIcon,
          draggable: true,
        }).addTo(map);

        markerRef.current.on('dragend', (e) => {
          const pos = e.target.getLatLng();
          if (onChange) onChange(pos.lat.toFixed(6), pos.lng.toFixed(6));
        });
      }

      // Click to pick location
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (!markerRef.current) {
          markerRef.current = L.marker([lat, lng], {
            icon: pinIcon,
            draggable: true,
          }).addTo(map);

          markerRef.current.on('dragend', (ev) => {
            const pos = ev.target.getLatLng();
            if (onChange) onChange(pos.lat.toFixed(6), pos.lng.toFixed(6));
          });
        } else {
          markerRef.current.setLatLng([lat, lng]);
        }

        if (onChange) {
          onChange(lat.toFixed(6), lng.toFixed(6));
        }
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker if lat/lng props change externally
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (latitude && longitude && !isNaN(Number(latitude)) && !isNaN(Number(longitude))) {
      const lat = Number(latitude);
      const lng = Number(longitude);

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
      mapInstanceRef.current.setView([lat, lng], 15);
    }
  }, [latitude, longitude]);

  const handleUseCurrentLocation = (e) => {
    e.preventDefault();
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);

        if (onChange) onChange(lat, lng);
      },
      (err) => {
        setLocating(false);
        alert('Could not retrieve GPS coordinates. Please click on the map to place a pin.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height }} />

      {/* Action Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: '0.75rem',
          left: '0.75rem',
          right: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          zIndex: 400,
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 500,
            padding: '0.35rem 0.65rem',
            borderRadius: 'var(--radius-sm)',
            backdropFilter: 'blur(2px)',
          }}
        >
          {latitude && longitude
            ? `Pin: ${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}`
            : 'Click map to place exact GPS pin'}
        </span>

        <button
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="btn btn-secondary btn-sm"
          style={{
            pointerEvents: 'auto',
            backgroundColor: '#ffffff',
            boxShadow: 'var(--shadow-md)',
            fontSize: '0.75rem',
            padding: '0.35rem 0.75rem',
          }}
          type="button"
        >
          <Navigation size={13} className={locating ? 'spin-slow' : ''} />
          {locating ? 'Locating...' : 'Use My GPS'}
        </button>
      </div>
    </div>
  );
};
