import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  MapPin,
  PlusCircle,
  Shield,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  Map,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SupabaseStatusBanner } from './SupabaseStatusBanner';

export const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinkStyle = ({ isActive }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.9375rem',
    fontWeight: isActive ? 700 : 500,
    color: isActive ? 'var(--primary-600)' : 'var(--text-secondary)',
    textDecoration: 'none',
    padding: '0.4rem 0.6rem',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: isActive ? 'var(--primary-50)' : 'transparent',
    transition: 'all var(--transition-fast)',
  });

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            textDecoration: 'none',
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb, #0d9488)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 8px rgba(37,99,235,0.25)',
            }}
          >
            <MapPin size={22} strokeWidth={2.5} />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                display: 'block',
              }}
            >
              Community<span style={{ color: 'var(--primary-500)' }}>Connect</span>
            </span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
              CIVIC RESOLUTION PORTAL
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '0.5rem',
          }}
          className="desktop-nav"
        >
          <NavLink to="/" style={navLinkStyle}>
            Home
          </NavLink>
          <NavLink to="/issues" style={navLinkStyle}>
            <Layers size={16} />
            Community Issues
          </NavLink>
          <NavLink to="/map" style={navLinkStyle}>
            <Map size={16} />
            Live Map
          </NavLink>
          {user && (
            <NavLink to="/my-reports" style={navLinkStyle}>
              <FileText size={16} />
              My Reports
            </NavLink>
          )}
          {isAdmin && (
            <NavLink
              to="/admin"
              style={({ isActive }) => ({
                ...navLinkStyle({ isActive }),
                color: isActive ? '#dc2626' : '#991b1b',
                backgroundColor: isActive ? '#fee2e2' : '#fef2f2',
                border: '1px solid #fecaca',
              })}
            >
              <Shield size={16} />
              Admin Portal
            </NavLink>
          )}
        </nav>

        {/* Right CTA & Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <SupabaseStatusBanner />

          {/* Report CTA Button */}
          <Link
            to="/report"
            className="btn btn-primary btn-sm desktop-btn"
            style={{ display: 'none', gap: '0.35rem' }}
          >
            <PlusCircle size={15} />
            Report Issue
          </Link>

          {/* User Profile / Auth State */}
          {user ? (
            <div style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }} className="desktop-auth">
              <Link
                to="/profile"
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8125rem' }}
                title={`Logged in as ${user.name} (${user.role})`}
              >
                <User size={14} />
                <span>{user.name.split(' ')[0]}</span>
                {isAdmin && (
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      padding: '0.1rem 0.35rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    Admin
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
                style={{ padding: '0.35rem 0.5rem' }}
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }} className="desktop-auth">
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-outline btn-sm mobile-menu-btn"
            style={{ padding: '0.4rem' }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-light)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <NavLink
            to="/"
            style={navLinkStyle}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/issues"
            style={navLinkStyle}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Layers size={16} />
            Community Issues
          </NavLink>
          <NavLink
            to="/map"
            style={navLinkStyle}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Map size={16} />
            Live Map
          </NavLink>
          {user && (
            <NavLink
              to="/my-reports"
              style={navLinkStyle}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FileText size={16} />
              My Reports
            </NavLink>
          )}
          {isAdmin && (
            <NavLink
              to="/admin"
              style={navLinkStyle}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Shield size={16} />
              Admin Portal
            </NavLink>
          )}

          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link
              to="/report"
              className="btn btn-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              <PlusCircle size={16} />
              Report Issue
            </Link>

            {user ? (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <Link
                  to="/profile"
                  className="btn btn-secondary"
                  style={{ flexGrow: 1 }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={16} />
                  Profile ({user.name})
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <Link
                  to="/login"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Responsive Media Style */}
      <style>{`
        @media (min-width: 840px) {
          .desktop-nav { display: flex !important; }
          .desktop-btn { display: inline-flex !important; }
          .desktop-auth { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </header>
  );
};
