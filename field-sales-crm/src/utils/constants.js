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
  primary: '#7f68ea',        // Purple - main brand color
  primaryDark: '#6952d1',    // Darker purple for hover/active states
  primaryLight: '#9b87f0',   // Lighter purple for backgrounds
  secondary: '#eceff8',      // Light gray - secondary color
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  background: '#eceff8',     // Light gray background
  white: '#ffffff',
  black: '#000000',
  gray: {
    100: '#f8f9fc',
    200: '#eceff8',          // Secondary color
    300: '#d4d9e8',
    400: '#a8b0c8',
    500: '#7c85a0',
    600: '#5a6278',
    700: '#3f4555',
    800: '#2a2e3a',
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

