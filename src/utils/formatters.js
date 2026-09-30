/**
 * Formatting and Helper Utilities
 */

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const diffInSeconds = Math.floor((now - d) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return formatDate(dateString);
};

export const ISSUE_CATEGORIES = [
  'Waste & Garbage',
  'Roads & Potholes',
  'Street Lighting',
  'Water & Leakage',
  'Drainage',
  'Public Infrastructure',
  'Stagnant Water',
  'Other',
];

export const SEVERITY_LEVELS = ['Low', 'Medium', 'High'];
export const STATUS_TYPES = ['Pending', 'In Progress', 'Resolved'];

export const getCategoryIconName = (category) => {
  switch (category) {
    case 'Waste & Garbage': return 'Trash2';
    case 'Roads & Potholes': return 'AlertTriangle';
    case 'Street Lighting': return 'Lightbulb';
    case 'Water & Leakage': return 'Droplets';
    case 'Drainage': return 'Waves';
    case 'Public Infrastructure': return 'Building2';
    case 'Stagnant Water': return 'Biohazard';
    default: return 'HelpCircle';
  }
};
