import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Right-side action, e.g. a compact PrimaryButton. */
  action?: React.ReactNode;
}

/** In-screen header: 20/Bold title, optional 12px secondary subtitle. */
export function ScreenHeader({ title, subtitle, action }: ScreenHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  textBlock: { flex: 1, gap: 2 },
  title: { ...typography.screenTitle, color: colors.ink },
  subtitle: { ...typography.label, color: colors.textSecondary },
});
