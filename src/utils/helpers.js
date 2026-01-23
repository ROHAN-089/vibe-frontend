/**
 * Format time remaining to human-readable string
 * @param {Date|string} expiresAt 
 * @returns {string} "2h 15m" or "45m" or "expired"
 */
export const formatTimeRemaining = (expiresAt) => {
  const now = Date.now();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;

  if (diff <= 0) return 'expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Format timestamp to time string
 * @param {Date|string} timestamp 
 * @returns {string} "2:34 PM"
 */
export const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Validate room title
 */
export const validateRoomTitle = (title) => {
  if (!title || title.trim().length === 0) {
    return 'Title is required';
  }
  if (title.length < 3) {
    return 'Title must be at least 3 characters';
  }
  if (title.length > 60) {
    return 'Title must be 60 characters or less';
  }
  return null;
};

/**
 * Validate room description
 */
export const validateRoomDescription = (description) => {
  if (description && description.length > 120) {
    return 'Description must be 120 characters or less';
  }
  return null;
};

/**
 * Debounce function for input handlers
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
