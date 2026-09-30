import React from 'react';
import { Zap } from 'lucide-react';
import { getPriorityLevel } from '../utils/priorityCalculator';

export const PriorityBadge = ({ score, showLabel = false }) => {
  const level = getPriorityLevel(score || 0);

  return (
    <span
      className="badge"
      style={{
        backgroundColor: level.bg,
        color: level.color,
        border: `1px solid ${level.color}30`,
        fontFamily: 'monospace',
        fontWeight: 700,
        gap: '0.25rem',
      }}
      title={`Community Priority Index (CPI): ${score}/100 - ${level.label}`}
    >
      <Zap size={12} fill={level.color} />
      CPI {score || 0}
      {showLabel && <span style={{ fontWeight: 600 }}>• {level.label}</span>}
    </span>
  );
};
