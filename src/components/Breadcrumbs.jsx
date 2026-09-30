import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs = ({ items = [] }) => {
  if (!items || items.length === 0) return null;

  const breadcrumbsList = [
    { label: 'Home', path: '/' },
    ...items,
  ];

  // Schema.org Structured Data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbsList.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.path ? `https://communityconnect.app${item.path}` : undefined,
    })),
  };

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.4rem',
        fontSize: '0.875rem',
        color: 'var(--text-muted)',
        marginBottom: '1.25rem',
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {breadcrumbsList.map((crumb, idx) => {
        const isLast = idx === breadcrumbsList.length - 1;

        return (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight size={14} color="#94a3b8" />}
            {isLast ? (
              <span
                aria-current="page"
                style={{
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  maxWidth: '300px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                }}
              >
                {idx === 0 && <Home size={14} />}
                <span>{crumb.label}</span>
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
