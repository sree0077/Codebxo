import { Platform } from 'react-native';

/**
 * Web-specific style utilities
 * These styles only apply on web platform to improve UX
 */

// Add cursor pointer for clickable elements on web
export const webCursor = (cursorType = 'pointer') => {
  if (Platform.OS === 'web') {
    return { cursor: cursorType };
  }
  return {};
};

// Common web styles for interactive elements
export const webInteractive = {
  ...webCursor('pointer'),
  ...(Platform.OS === 'web' && {
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
  }),
};

// Web styles for text inputs
export const webInput = {
  ...(Platform.OS === 'web' && {
    outlineStyle: 'none',
  }),
};

// Web styles for disabled elements
export const webDisabled = {
  ...webCursor('not-allowed'),
};

// Web styles for draggable elements
export const webDraggable = {
  ...webCursor('grab'),
};

// Web styles for text selection
export const webTextSelectable = {
  ...(Platform.OS === 'web' && {
    userSelect: 'text',
  }),
};

// Web styles for non-selectable text
export const webTextNonSelectable = {
  ...(Platform.OS === 'web' && {
    userSelect: 'none',
  }),
};

export default {
  webCursor,
  webInteractive,
  webInput,
  webDisabled,
  webDraggable,
  webTextSelectable,
  webTextNonSelectable,
};

