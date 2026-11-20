import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  colors,
  controlHeight,
  OrderStatusKey,
  radius,
  spacing,
  statusMeta,
  typography,
} from '../theme';
import { StatusChip } from './StatusChip';

interface LedgerRowProps {
  status: OrderStatusKey;
  title: string;
  /** Second line, e.g. "পাঞ্জাবি · আব্দুল করিম" */
  meta: string;
  /** Right-aligned primary value, e.g. a taka amount. */
  rightValue?: string;
  /** Right-aligned secondary line under the value, e.g. "বকেয়া" or a date. */
  rightLabel?: string;
  /** Colour the right value amber (due amounts). */
  rightValueAmber?: boolean;
  /**
   * Show the status chip next to the meta line (default true).
   * v1.1 clean rows turn this off and use `rightChip` or no chip at all,
   * so the row carries at most one meta line of content.
   */
  chipInMeta?: boolean;
  /** Show the status chip in the right column instead of a value. */
  rightChip?: boolean;
  /** Rendered inside a LedgerPanel — the panel draws the outer border. */
  last?: boolean;
  onPress?: () => void;
}

/**
 * One ledger line: 3px status strip on the left, name + meta in the middle,
 * right-aligned amount. Rows are divided by hairlines inside a LedgerPanel —
 * never floated as separate cards (DESIGN.md).
 */
export function LedgerRow({
  status,
  title,
  meta,
  rightValue,
  rightLabel,
  rightValueAmber,
  chipInMeta = true,
  rightChip = false,
  last,
  onPress,
}: LedgerRowProps) {
  const stripColor = statusMeta[status].color;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !last && styles.divider,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.strip, { backgroundColor: stripColor }]} />
      <View style={styles.main}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta} numberOfLines={1}>
            {meta}
          </Text>
          {chipInMeta && <StatusChip status={status} />}
        </View>
      </View>
      {(rightValue || rightLabel || rightChip) && (
        <View style={styles.right}>
          {rightChip && <StatusChip status={status} />}
          {rightValue ? (
            <Text
              style={[
                styles.rightValue,
                rightValueAmber && { color: colors.amber },
              ]}
            >
              {rightValue}
            </Text>
          ) : null}
          {rightLabel ? <Text style={styles.rightLabel}>{rightLabel}</Text> : null}
        </View>
      )}
    </Pressable>
  );
}

/** The single white panel that holds a run of ledger rows. */
export function LedgerPanel({ children }: { children: React.ReactNode }) {
  return <View style={styles.panel}>{children}</View>;
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 64,
    backgroundColor: colors.surface,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  pressed: { backgroundColor: colors.background },
  strip: { width: 3 },
  main: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    gap: 4,
  },
  title: { ...typography.bodySemiBold, color: colors.ink },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  meta: { ...typography.label, color: colors.textSecondary, flexShrink: 1 },
  right: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  rightValue: { ...typography.bodySemiBold, color: colors.ink },
  rightLabel: { ...typography.label, color: colors.textFaint },
});

// Re-exported so screens keep control-height import sites simple.
export { controlHeight };
