import {
  BadgePercent,
  BarChart3,
  ChevronDown,
  ChevronUp,
  HandCoins,
  HelpCircle,
  MessageSquare,
  Plus,
  Ruler,
  Settings,
  Store,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface GridItem {
  label: string;
  tint: string;
  iconColor: string;
  icon: React.ReactNode;
}

const ICON_SIZE = 21;
const ICON_STROKE = 1.9;

const mainItems: GridItem[] = [
  {
    label: 'নতুন অর্ডার',
    tint: colors.primaryTint,
    iconColor: colors.primary,
    icon: <Plus size={ICON_SIZE} color={colors.primary} strokeWidth={2.2} />,
  },
  {
    label: 'মাপ খুঁজুন',
    tint: colors.slateTint,
    iconColor: colors.slateBlue,
    icon: <Ruler size={ICON_SIZE} color={colors.slateBlue} strokeWidth={ICON_STROKE} />,
  },
  {
    label: 'বকেয়া',
    tint: colors.amberTint,
    iconColor: colors.amber,
    icon: <Wallet size={ICON_SIZE} color={colors.amber} strokeWidth={ICON_STROKE} />,
  },
  {
    label: 'কারিগর',
    tint: colors.mustardTint,
    iconColor: colors.mustard,
    icon: <Users size={ICON_SIZE} color={colors.mustard} strokeWidth={ICON_STROKE} />,
  },
  {
    label: 'কাস্টমার',
    tint: colors.slateNeutralTint,
    iconColor: colors.slate,
    icon: <UserPlus size={ICON_SIZE} color={colors.slate} strokeWidth={ICON_STROKE} />,
  },
  {
    label: 'টাকা জমা',
    tint: colors.primaryTint,
    iconColor: colors.primary,
    icon: <HandCoins size={ICON_SIZE} color={colors.primary} strokeWidth={ICON_STROKE} />,
  },
  {
    label: 'রিপোর্ট',
    tint: colors.slateTint,
    iconColor: colors.slateBlue,
    icon: <BarChart3 size={ICON_SIZE} color={colors.slateBlue} strokeWidth={ICON_STROKE} />,
  },
  {
    label: 'দোকান',
    tint: colors.roseTint,
    iconColor: colors.rose,
    icon: <Store size={ICON_SIZE} color={colors.rose} strokeWidth={ICON_STROKE} />,
  },
];

const moreItems: GridItem[] = [
  {
    label: 'SMS ব্যালেন্স',
    tint: colors.slateTint,
    iconColor: colors.slateBlue,
    icon: <MessageSquare size={ICON_SIZE} color={colors.slateBlue} strokeWidth={ICON_STROKE} />,
  },
  {
    label: 'অফার/নোটিশ',
    tint: colors.amberTint,
    iconColor: colors.amber,
    icon: <BadgePercent size={ICON_SIZE} color={colors.amber} strokeWidth={ICON_STROKE} />,
  },
  {
    label: 'সাহায্য',
    tint: colors.slateNeutralTint,
    iconColor: colors.slate,
    icon: <HelpCircle size={ICON_SIZE} color={colors.slate} strokeWidth={ICON_STROKE} />,
  },
  {
    label: 'সেটিংস',
    tint: colors.primaryTint,
    iconColor: colors.primary,
    icon: <Settings size={ICON_SIZE} color={colors.primary} strokeWidth={ICON_STROKE} />,
  },
];

function GridCell({ item }: { item: GridItem }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.cell, pressed && styles.cellPressed]}
      accessibilityLabel={item.label}
    >
      <View style={[styles.circle, { backgroundColor: item.tint }]}>{item.icon}</View>
      <Text style={styles.label} numberOfLines={1}>
        {item.label}
      </Text>
    </Pressable>
  );
}

/**
 * v1.2 home action grid (DESIGN.md v1.2 — the owner's limited exception to
 * the no-icon-grid rule, home screen only): 4 columns of 48px circular
 * tint-backed icon buttons with short Bangla labels, in the muted palette.
 * Items are visual for now — no navigation targets exist yet. The
 * "আরো দেখুন" pill expands a second row of placeholder actions.
 */
export function ActionGrid() {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {mainItems.slice(0, 4).map((item) => (
          <GridCell key={item.label} item={item} />
        ))}
      </View>
      <View style={styles.row}>
        {mainItems.slice(4).map((item) => (
          <GridCell key={item.label} item={item} />
        ))}
      </View>
      {expanded && (
        <View style={styles.row}>
          {moreItems.map((item) => (
            <GridCell key={item.label} item={item} />
          ))}
        </View>
      )}
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={({ pressed }) => [styles.morePill, pressed && styles.cellPressed]}
        accessibilityLabel={expanded ? 'কম দেখুন' : 'আরো দেখুন'}
      >
        <Text style={styles.moreLabel}>{expanded ? 'কম দেখুন' : 'আরো দেখুন'}</Text>
        {expanded ? (
          <ChevronUp size={14} color={colors.primary} strokeWidth={2.2} />
        ) : (
          <ChevronDown size={14} color={colors.primary} strokeWidth={2.2} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md + 2,
  },
  row: { flexDirection: 'row' },
  cell: { flex: 1, alignItems: 'center', gap: spacing.xs + 1 },
  cellPressed: { opacity: 0.6 },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { ...typography.gridLabel, color: colors.ink },
  morePill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  moreLabel: { ...typography.morePill, color: colors.primary },
});
