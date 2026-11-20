import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, controlHeight, radius, typography } from '../theme';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  /** Compact = auto width for headers; otherwise full width. */
  compact?: boolean;
}

/** Flat deep-green button, 44px, 6px radius, no shadow, no gradient. */
export function PrimaryButton({ label, onPress, icon, compact }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles.primary,
        compact && styles.compact,
        pressed && styles.primaryPressed,
      ]}
    >
      {icon}
      <Text style={styles.primaryLabel}>{label}</Text>
    </Pressable>
  );
}

/** White button with 1px hairline border and ink text. */
export function SecondaryButton({ label, onPress, icon, compact }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles.secondary,
        compact && styles.compact,
        pressed && styles.secondaryPressed,
      ]}
    >
      {icon}
      <Text style={styles.secondaryLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: controlHeight,
    borderRadius: radius.control,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  compact: { alignSelf: 'flex-start', paddingHorizontal: 12 },
  primary: { backgroundColor: colors.primary },
  primaryPressed: { backgroundColor: colors.primaryPressed },
  primaryLabel: { ...typography.bodySemiBold, color: '#FFFFFF' },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  secondaryPressed: { backgroundColor: colors.background },
  secondaryLabel: { ...typography.bodySemiBold, color: colors.ink },
});
