import React from 'react';
import { Clock, Loader2, CheckCircle2 } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  if (status === 'Resolved') {
    return (
      <span className="badge badge-resolved" title="Issue has been inspected and resolved">
        <CheckCircle2 size={13} />
        Resolved
      </span>
    );
  }

  if (status === 'In Progress') {
    return (
      <span className="badge badge-progress" title="Municipal team is actively resolving this issue">
        <Loader2 size={13} className="spin-slow" />
        In Progress
      </span>
    );
  }

  return (
    <span className="badge badge-pending" title="Issue reported and pending review">
      <Clock size={13} />
      Pending Review
    </span>
  );
};
