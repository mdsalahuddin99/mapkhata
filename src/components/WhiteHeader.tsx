import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

/**
 * Full-width white header bar with a bottom hairline (prototype v4) —
 * used by the বকেয়া / কারিগর screens. Flat, no shadow. `right` is an
 * optional action slot (Package D: কারিগর tab's "+ নতুন কারিগর").
 */
export function WhiteHeader({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.bar}>
      <Text style={styles.title}>{title}</Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 10,
  },
  title: { ...typography.screenTitle, color: colors.ink },
});
