import React from 'react';

export const IssueCardSkeleton = () => {
  return (
    <div className="card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
      <div className="skeleton" style={{ height: '180px', width: '100%', marginBottom: '1rem' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div className="skeleton" style={{ height: '18px', width: '80px' }} />
        <div className="skeleton" style={{ height: '18px', width: '60px' }} />
      </div>
      <div className="skeleton" style={{ height: '22px', width: '90%', marginBottom: '0.5rem' }} />
      <div className="skeleton" style={{ height: '16px', width: '100%', marginBottom: '0.5rem' }} />
      <div className="skeleton" style={{ height: '16px', width: '70%', marginTop: 'auto' }} />
    </div>
  );
};

export const TableRowSkeleton = () => {
  return (
    <tr>
      <td style={{ padding: '1rem' }}><div className="skeleton" style={{ height: '20px', width: '140px' }} /></td>
      <td style={{ padding: '1rem' }}><div className="skeleton" style={{ height: '20px', width: '100px' }} /></td>
      <td style={{ padding: '1rem' }}><div className="skeleton" style={{ height: '20px', width: '80px' }} /></td>
      <td style={{ padding: '1rem' }}><div className="skeleton" style={{ height: '20px', width: '60px' }} /></td>
      <td style={{ padding: '1rem' }}><div className="skeleton" style={{ height: '20px', width: '70px' }} /></td>
      <td style={{ padding: '1rem' }}><div className="skeleton" style={{ height: '32px', width: '90px' }} /></td>
    </tr>
  );
};
