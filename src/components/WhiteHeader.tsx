import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

/**
 * Full-width white header bar with a bottom hairline (prototype v4) —
 * used by the বকেয়া / কারিগর screens. Flat, no shadow.
 */
export function WhiteHeader({ title }: { title: string }) {
  return (
    <View style={styles.bar}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 10,
  },
  title: { ...typography.screenTitle, color: colors.ink },
});
