import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export interface MiniStat {
  value: string;
  label: string;
}

/**
 * v1.1 slim stat strip: up to 3 numbers in ONE hairline-divided white
 * panel — replaces the denser 2×2 StatPanel on the dashboard so the
 * screen's numbers stay glanceable (DESIGN.md v1.1 rule 3: ≤4 numbers).
 */
export function MiniStatStrip({ stats }: { stats: MiniStat[] }) {
  return (
    <View style={styles.panel}>
      {stats.slice(0, 3).map((stat, i) => (
        <View key={stat.label} style={[styles.cell, i > 0 && styles.cellDivider]}>
          <Text style={styles.value}>{stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    gap: 2,
  },
  cellDivider: {
    borderLeftWidth: 1,
    borderLeftColor: colors.hairline,
  },
  value: { ...typography.miniStatValue, color: colors.ink },
  label: { ...typography.miniStatLabel, color: colors.textSecondary },
});
