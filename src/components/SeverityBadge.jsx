import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

export const SeverityBadge = ({ severity }) => {
  if (severity === 'High') {
    return (
      <span className="badge badge-sev-high" title="High severity hazard">
        <AlertCircle size={13} />
        High Severity
      </span>
    );
  }

  if (severity === 'Medium') {
    return (
      <span className="badge badge-sev-med" title="Medium severity issue">
        <AlertTriangle size={13} />
        Medium Severity
      </span>
    );
  }

  return (
    <span className="badge badge-sev-low" title="Low severity / routine maintenance">
      <Info size={13} />
      Low Severity
    </span>
  );
};
