import { Platform, View, StyleSheet } from 'react-native';
import React from 'react';

/**
 * Simple Background Component with Pattern
 * For web: Uses CSS background with geometric pattern
 * For mobile: Uses solid color background
 */
const AnimatedBackground = ({ children }) => {
  if (Platform.OS === 'web') {
    // For web, create a div with CSS background
    const BackgroundDiv = () => (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#eceff8',
          backgroundImage: `
            linear-gradient(135deg, #9b87f0 25%, transparent 25%),
            linear-gradient(225deg, #9b87f0 25%, transparent 25%),
            linear-gradient(45deg, #9b87f0 25%, transparent 25%),
            linear-gradient(315deg, #9b87f0 25%, #eceff8 25%)
          `,
          backgroundPosition: '20px 0, 20px 0, 0 0, 0 0',
          backgroundSize: '40px 40px',
          backgroundRepeat: 'repeat',
        }}
      />
    );

    return (
      <View style={styles.container}>
        <BackgroundDiv />
        <View style={styles.overlay} />
        {children}
      </View>
    );
  }

  // For mobile, use solid background
  return (
    <View style={styles.container}>
      <View style={styles.mobileBackground} />
      <View style={styles.overlay} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mobileBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#eceff8', // Light background color
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.7)', // Dark overlay for contrast
  },
});

export default AnimatedBackground;

