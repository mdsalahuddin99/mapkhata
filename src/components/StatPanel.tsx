import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export interface StatItem {
  label: string;
  value: string;
  /** Amber value — reserved for due / urgent figures only. */
  accentAmber?: boolean;
}

/**
 * Dashboard numbers as ONE white panel divided 2×2 by hairlines —
 * a ledger block, not a grid of floating cards (DESIGN.md).
 * Pass exactly 4 stats.
 */
export function StatPanel({ stats }: { stats: StatItem[] }) {
  const cells = stats.slice(0, 4);
  return (
    <View style={styles.panel}>
      {cells.map((stat, i) => (
        <View
          key={stat.label}
          style={[
            styles.cell,
            i % 2 === 0 && styles.cellRightBorder,
            i < 2 && styles.cellBottomBorder,
          ]}
        >
          <Text style={styles.label}>{stat.label}</Text>
          <Text
            style={[styles.value, stat.accentAmber && { color: colors.amber }]}
          >
            {stat.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  cell: {
    width: '50%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: 2,
  },
  cellRightBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.hairline,
  },
  cellBottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  label: { ...typography.label, color: colors.textSecondary },
  value: { ...typography.statNumber, color: colors.ink },
});
