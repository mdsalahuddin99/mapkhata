import { Bell, Search } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, spacing, typography } from '../theme';

interface BandHeaderProps {
  /** Shop name shown next to the avatar, e.g. "নিউ স্টার টেইলার্স" */
  shopName: string;
  /** Sub-line under the shop name, e.g. "এলিফ্যান্ট রোড, ঢাকা" */
  shopSub: string;
  /** Single Bengali initial inside the circular avatar. */
  avatarInitial: string;
  /** Balance panel (revealed state) — the one big number, balance-style. */
  balanceLabel: string;
  balanceValue: string;
  /** Quieter side number inside the same panel. */
  sideLabel: string;
  sideValue: string;
  /** Optional — makes the avatar a button (Package F: entry to /login). */
  onAvatarPress?: () => void;
}

/**
 * v1.2 bKash-style band: flat primary green, no gradient, no shadow.
 * Top row — circular shop-initial avatar, shop name + area, two circular
 * translucent icon buttons (search, notifications). Below it, figures are
 * hidden by default behind a white pill ("আজকের হিসাব দেখুন"), exactly
 * like bKash's "ব্যালেন্স দেখুন": tapping the pill reveals the v1.1
 * balance panel (মোট বকেয়া big, আজকের আদায় side); tapping the panel
 * hides the figures again.
 */
export function BandHeader({
  shopName,
  shopSub,
  avatarInitial,
  balanceLabel,
  balanceValue,
  sideLabel,
  sideValue,
  onAvatarPress,
}: BandHeaderProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={styles.band}>
      <View style={styles.topRow}>
        {onAvatarPress ? (
          <Pressable
            onPress={onAvatarPress}
            style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}
            accessibilityLabel="লগইন"
          >
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </Pressable>
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>
        )}
        <View style={styles.shopBlock}>
          <Text style={styles.shopName} numberOfLines={1}>
            {shopName}
          </Text>
          <Text style={styles.shopSub} numberOfLines={1}>
            {shopSub}
          </Text>
        </View>
        <View style={styles.iconRow}>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            accessibilityLabel="খুঁজুন"
          >
            <Search size={17} color={colors.onPrimary} strokeWidth={2} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            accessibilityLabel="নোটিফিকেশন"
          >
            <Bell size={17} color={colors.onPrimary} strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      {revealed ? (
        <Pressable
          onPress={() => setRevealed(false)}
          style={({ pressed }) => [styles.panel, pressed && styles.pressed]}
          accessibilityLabel="হিসাব লুকান"
        >
          <View style={styles.balanceBlock}>
            <Text style={styles.balanceLabel}>{balanceLabel}</Text>
            <Text style={styles.balanceValue}>{balanceValue}</Text>
          </View>
          <View style={styles.sideBlock}>
            <Text style={styles.sideLabel}>{sideLabel}</Text>
            <Text style={styles.sideValue}>{sideValue}</Text>
          </View>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => setRevealed(true)}
          style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
          accessibilityLabel="আজকের হিসাব দেখুন"
        >
          <Text style={styles.pillMark}>৳</Text>
          <Text style={styles.pillLabel}>আজকের হিসাব দেখুন</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    // Extra bottom room: the white sheet overlaps the band by 10px (v1.2).
    paddingBottom: spacing.xxl,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: fontFamily.bold,
    color: colors.primary,
  },
  shopBlock: { flex: 1, gap: 1 },
  shopName: { ...typography.bandShopName, color: colors.onPrimary },
  shopSub: { ...typography.bandShopSub, color: colors.onPrimarySoft },
  iconRow: { flexDirection: 'row', gap: spacing.sm },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.bandPanelBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.75 },
  pill: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm - 1,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: spacing.md + 1,
    paddingVertical: spacing.xs + 1,
  },
  pillPressed: { opacity: 0.85 },
  pillMark: { ...typography.balancePill, color: colors.primary, fontSize: 14 },
  pillLabel: { ...typography.balancePill, color: colors.primary },
  panel: {
    marginTop: spacing.md,
    backgroundColor: colors.bandPanelBg,
    borderWidth: 1,
    borderColor: colors.bandPanelBorder,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  balanceBlock: { gap: 2 },
  balanceLabel: { ...typography.balanceLabel, color: colors.onPrimarySoft },
  balanceValue: { ...typography.balanceValue, color: colors.onPrimary },
  sideBlock: { alignItems: 'flex-end', gap: 2 },
  sideLabel: { ...typography.balanceSideLabel, color: colors.onPrimarySoft },
  sideValue: { ...typography.balanceSideValue, color: colors.onPrimary },
});
