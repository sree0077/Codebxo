import { Platform, Linking } from 'react-native';
import logger from './logger';

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Format date to readable string
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format date with time
export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Make phone call
export const makePhoneCall = async (phoneNumber) => {
  const url = Platform.select({
    ios: `telprompt:${phoneNumber}`,
    android: `tel:${phoneNumber}`,
    web: `tel:${phoneNumber}`,
  });

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      return true;
    } else {
      logger.warn("Phone calls not supported on this device");
      return false;
    }
  } catch (error) {
    logger.error('Error making phone call:', error);
    return false;
  }
};

// Send SMS
export const sendSMS = async (phoneNumber, message = '') => {
  const separator = Platform.OS === 'ios' ? '&' : '?';
  const url = `sms:${phoneNumber}${separator}body=${encodeURIComponent(message)}`;

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      return true;
    } else {
      logger.warn("SMS not supported on this device");
      return false;
    }
  } catch (error) {
    logger.error('Error sending SMS:', error);
    return false;
  }
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '??';
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

// Get potential color
export const getPotentialColor = (potential) => {
  switch (potential) {
    case 'high':
      return '#22c55e';
    case 'medium':
      return '#f59e0b';
    case 'low':
      return '#ef4444';
    default:
      return '#64748b';
  }
};

// Get interaction type icon
export const getInteractionIcon = (type) => {
  switch (type) {
    case 'call':
      return '📞';
    case 'message':
      return '💬';
    case 'meeting':
      return '🤝';
    default:
      return '📝';
  }
};

// Get business type icon
export const getBusinessTypeIcon = (businessType) => {
  switch (businessType) {
    case 'retail':
      return '🏪'; // Store/Shop
    case 'wholesale':
      return '📦'; // Package/Warehouse
    case 'manufacturing':
      return '🏭'; // Factory
    case 'services':
      return '🛠️'; // Tools/Services
    case 'technology':
      return '💻'; // Computer/Tech
    case 'healthcare':
      return '🏥'; // Hospital/Healthcare
    case 'education':
      return '🎓'; // Graduation Cap/Education
    case 'real_estate':
      return '🏢'; // Building/Real Estate
    case 'finance':
      return '💰'; // Money Bag/Finance
    case 'other':
      return '🏪'; // Generic Business
    default:
      return '🏢'; // Default Business Building
  }
};

// Debounce function
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

