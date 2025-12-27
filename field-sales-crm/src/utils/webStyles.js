import { Platform } from 'react-native';

/**
 * Web-specific style utilities
 * These styles only apply on web platform to improve UX
 * On non-web platforms, these return empty objects to avoid any issues
 */

// Add cursor pointer for clickable elements on web
export const webCursor = (cursorType = 'pointer') => {
  if (Platform.OS === 'web') {
    return { cursor: cursorType };
  }
  return null; // Return null instead of {} for better performance
};

// Common web styles for interactive elements
export const webInteractive = Platform.OS === 'web' ? {
  cursor: 'pointer',
  userSelect: 'none',
  WebkitTapHighlightColor: 'transparent',
} : null;

// Web styles for text inputs
export const webInput = Platform.OS === 'web' ? {
  outlineStyle: 'none',
} : null;

// Web styles for disabled elements
export const webDisabled = Platform.OS === 'web' ? {
  cursor: 'not-allowed',
} : null;

// Web styles for draggable elements
export const webDraggable = Platform.OS === 'web' ? {
  cursor: 'grab',
} : null;

// Web styles for text selection
export const webTextSelectable = Platform.OS === 'web' ? {
  userSelect: 'text',
} : null;

// Web styles for non-selectable text
export const webTextNonSelectable = Platform.OS === 'web' ? {
  userSelect: 'none',
} : null;

export default {
  webCursor,
  webInteractive,
  webInput,
  webDisabled,
  webDraggable,
  webTextSelectable,
  webTextNonSelectable,
};

