import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, spacing } from '../theme';

export interface SummaryStat {
  value: string;
  label: string;
}

interface SummaryPanelProps {
  label: string;
  value: string;
  /** Big-number colour — amber for বকেয়া, ink elsewhere (prototype v4). */
  valueColor?: string;
  stats: SummaryStat[];
}

/**
 * One white panel: small label, one big number, then a hairline row of
 * up to 3 supporting stats (prototype v4 summary blocks). No shadow.
 */
export function SummaryPanel({
  label,
  value,
  valueColor = colors.ink,
  stats,
}: SummaryPanelProps) {
  return (
    <View style={styles.panel}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
      <View style={styles.statRow}>
        {stats.map((s) => (
          <View key={s.label} style={styles.stat}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.card,
    paddingHorizontal: 14,
    paddingTop: spacing.md,
    paddingBottom: 10,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  value: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    lineHeight: 32,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    paddingTop: 7,
  },
  stat: { gap: 1 },
  statValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.ink,
  },
  statLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    lineHeight: 14,
    color: colors.textSecondary,
  },
});
