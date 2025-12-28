// Business Type Options
export const BUSINESS_TYPES = [
  { label: 'Select Business Type', value: '' },
  { label: 'Retail', value: 'retail' },
  { label: 'Wholesale', value: 'wholesale' },
  { label: 'Manufacturing', value: 'manufacturing' },
  { label: 'Services', value: 'services' },
  { label: 'Technology', value: 'technology' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Education', value: 'education' },
  { label: 'Real Estate', value: 'real_estate' },
  { label: 'Finance', value: 'finance' },
  { label: 'Other', value: 'other' },
];

// Customer Potential Options
export const CUSTOMER_POTENTIAL = [
  { label: 'Select Potential', value: '' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

// Currently Using System Options
export const USING_SYSTEM_OPTIONS = [
  { label: 'Select Option', value: '' },
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
];

// Interaction Types
export const INTERACTION_TYPES = [
  { label: 'Select Type', value: '' },
  { label: 'Call', value: 'call' },
  { label: 'Message', value: 'message' },
  { label: 'Meeting', value: 'meeting' },
];

// Storage Keys
export const STORAGE_KEYS = {
  USER: '@user',
  CLIENTS: '@clients',
  INTERACTIONS: '@interactions',
  AUTH_TOKEN: '@auth_token',
};

// Colors
export const COLORS = {
  primary: '#3b82f6',
  primaryDark: '#1d4ed8',
  secondary: '#64748b',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  background: '#f8fafc',
  white: '#ffffff',
  black: '#000000',
  gray: {
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
  },
};

// Screen Names
export const SCREENS = {
  LOGIN: 'Login',
  CLIENT_LIST: 'ClientList',
  CLIENT_DETAIL: 'ClientDetail',
  ADD_CLIENT: 'AddClient',
  EDIT_CLIENT: 'EditClient',
  INTERACTIONS: 'Interactions',
  ADD_INTERACTION: 'AddInteraction',
  MAP_VIEW: 'MapView',
};

