/**
 * Community Priority Index (CPI) Calculator
 * 
 * Transparent, deterministic rule-based prioritization algorithm:
 * 1. Base Severity Weight:
 *    - High: 60 points (immediate safety hazard / critical outage)
 *    - Medium: 35 points (disruption of regular access or infrastructure)
 *    - Low: 15 points (aesthetic or minor maintenance)
 * 2. Category Hazard Boost:
 *    - Water & Leakage / Drainage / Stagnant Water / Waste: +10 pts (public health / vector disease / sanitation)
 *    - Roads & Potholes / Street Lighting: +5 pts (transit & pedestrian safety)
 *    - Other: 0 pts
 * 3. Age Factor (Aging Queue Penalty):
 *    - +2 points for each day since submission (capped at +30 pts)
 * 
 * Maximum Possible Score: 100 points
 */

export const calculatePriorityScore = ({ severity, category, createdAt }) => {
  // 1. Base Severity
  let baseScore = 15;
  if (severity === 'High') baseScore = 60;
  else if (severity === 'Medium') baseScore = 35;
  else baseScore = 15;

  // 2. Category Hazard Boost
  let categoryBoost = 0;
  const healthHazards = ['Water & Leakage', 'Drainage', 'Stagnant Water', 'Waste & Garbage'];
  const transitHazards = ['Roads & Potholes', 'Street Lighting'];

  if (healthHazards.includes(category)) {
    categoryBoost = 10;
  } else if (transitHazards.includes(category)) {
    categoryBoost = 5;
  }

  // 3. Age Bonus (2 pts/day, max 30)
  let ageDays = 0;
  if (createdAt) {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.max(0, now - createdDate);
    ageDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
  const ageBonus = Math.min(30, ageDays * 2);

  const totalScore = Math.min(100, baseScore + categoryBoost + ageBonus);

  return {
    totalScore,
    breakdown: {
      baseScore,
      severity,
      categoryBoost,
      category,
      ageDays,
      ageBonus,
    },
  };
};

export const getPriorityLevel = (score) => {
  if (score >= 75) return { label: 'Critical Priority', color: '#dc2626', bg: '#fee2e2' };
  if (score >= 50) return { label: 'Elevated Priority', color: '#ea580c', bg: '#ffedd5' };
  if (score >= 30) return { label: 'Standard Priority', color: '#2563eb', bg: '#dbeafe' };
  return { label: 'Routine Priority', color: '#4b5563', bg: '#f3f4f6' };
};
