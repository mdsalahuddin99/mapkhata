import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  AdminPlan,
  AdminShop,
  adminStatusMeta,
  planMeta,
} from '../data/admin';
import { colors, radius, spacing, typography } from '../theme';
import { CustomerAvatar } from './CustomerBits';

/* ------------------------------------------------------------------ */
/* PlanChip — 4px tint chip with a 6px dot, same build as StatusChip   */
/* but for a shop's plan (প্রো / ফ্রি / ট্রায়াল).                        */
/* ------------------------------------------------------------------ */

export function PlanChip({ plan }: { plan: AdminPlan }) {
  const meta = planMeta[plan];
  return (
    <View style={[styles.chip, { backgroundColor: meta.tint }]}>
      <View style={[styles.chipDot, { backgroundColor: meta.color }]} />
      <Text style={[styles.chipLabel, { color: meta.color }]}>
        {meta.label}
      </Text>
    </View>
  );
}

/** Small status line: 6px dot + label (সক্রিয় / ট্রায়ালে / মেয়াদ শেষ). */
export function AdminStatusLine({ shop }: { shop: AdminShop }) {
  const meta = adminStatusMeta[shop.status];
  return (
    <View style={styles.statusLine}>
      <View style={[styles.chipDot, { backgroundColor: meta.color }]} />
      <Text style={[styles.statusLabel, { color: meta.color }]}>
        {meta.label}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* AdminShopRow — one shop inside a LedgerPanel: avatar, name, one     */
/* meta line (জেলা · মালিক), and a caller-supplied right column.        */
/* ------------------------------------------------------------------ */

interface AdminShopRowProps {
  shop: AdminShop;
  /** Avatar tint rotation index (list position). */
  index?: number;
  /** Overrides the default "জেলা · মালিক" meta line. */
  meta?: string;
  right?: React.ReactNode;
  last?: boolean;
  onPress?: () => void;
}

export function AdminShopRow({
  shop,
  index = 0,
  meta,
  right,
  last,
  onPress,
}: AdminShopRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !last && styles.divider,
        pressed && styles.pressed,
      ]}
    >
      <CustomerAvatar name={shop.name} index={index} />
      <View style={styles.main}>
        <Text style={styles.name} numberOfLines={1}>
          {shop.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {meta ?? `${shop.district} · ${shop.owner}`}
        </Text>
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </Pressable>
  );
}

/** Centred content column for the admin (operator, desktop-web) pages. */
export const adminColumnStyle = {
  width: '100%',
  maxWidth: 720,
  alignSelf: 'center',
} as const;

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.chip,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 6,
  },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipLabel: { ...typography.chip },
  statusLine: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusLabel: { ...typography.chip },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 64,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  pressed: { backgroundColor: colors.background },
  main: { flex: 1, gap: 2 },
  name: { ...typography.bodySemiBold, color: colors.ink },
  meta: { ...typography.label, color: colors.textSecondary },
  right: { alignItems: 'flex-end', gap: 4 },
});
