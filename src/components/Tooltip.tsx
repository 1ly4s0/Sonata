import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts, Spacing } from '../theme';

interface TooltipProps {
  text: string;
  position?: 'top' | 'bottom';
  visible: boolean;
  onDismiss: () => void;
  /** Auto-dismiss delay in ms (default: 3000) */
  delay?: number;
}

export default function Tooltip({
  text,
  position = 'bottom',
  visible,
  onDismiss,
  delay = 3000,
}: TooltipProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onDismiss, delay);
      return () => clearTimeout(timer);
    }
  }, [visible, delay, onDismiss]);

  if (!visible) return null;

  const isBottom = position === 'bottom';

  return (
    <View style={[styles.container, isBottom ? styles.bottom : styles.top]}>
      {isBottom && <View style={styles.arrowUp} />}

      <TouchableOpacity onPress={onDismiss} activeOpacity={0.9} style={styles.bubble}>
        <Text style={styles.text}>{text}</Text>
      </TouchableOpacity>

      {!isBottom && <View style={styles.arrowDown} />}
    </View>
  );
}

const ARROW_SIZE = 8;
const BUBBLE_BG = '#1E1E1E';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  top: {
    bottom: '100%',
    marginBottom: 4,
  },
  bottom: {
    top: '100%',
    marginTop: 4,
  },
  bubble: {
    backgroundColor: BUBBLE_BG,
    borderRadius: 10,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    maxWidth: 220,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  text: {
    fontSize: Fonts.sizes.sm,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 18,
  },
  arrowUp: {
    width: 0,
    height: 0,
    borderLeftWidth: ARROW_SIZE,
    borderRightWidth: ARROW_SIZE,
    borderBottomWidth: ARROW_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: BUBBLE_BG,
  },
  arrowDown: {
    width: 0,
    height: 0,
    borderLeftWidth: ARROW_SIZE,
    borderRightWidth: ARROW_SIZE,
    borderTopWidth: ARROW_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: BUBBLE_BG,
  },
});
