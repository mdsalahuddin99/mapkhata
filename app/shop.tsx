import { useRouter } from 'expo-router';
import {
  Bell,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LogOut,
  Shield,
  Store,
  Users,
} from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackHeader } from '../src/components/CustomerBits';
import { LedgerPanel } from '../src/components/LedgerRow';
import { shop, toBnDigits } from '../src/data/mock';
import {
  colors,
  fontFamily,
  radius,
  spacing,
  typography,
} from '../src/theme';

interface SettingsItem {
  label: string;
  meta: string;
  tint: string;
  icon: React.ReactNode;
  route?: string;
}

const ICON_SIZE = 19;
const ICON_STROKE = 1.9;

const items: SettingsItem[] = [
  {
    label: 'দোকানের প্রোফাইল',
    meta: 'নাম, ঠিকানা, যোগাযোগ',
    tint: colors.primaryTint,
    icon: <Store size={ICON_SIZE} color={colors.primary} strokeWidth={ICON_STROKE} />,
    route: '/shop/profile',
  },
  {
    label: 'স্টাফ',
    meta: 'ম্যানেজার, কাটিং মাস্টার, সহকারী',
    tint: colors.slateTint,
    icon: <Users size={ICON_SIZE} color={colors.slateBlue} strokeWidth={ICON_STROKE} />,
    route: '/shop/staff',
  },
  {
    label: 'সাবস্ক্রিপশন ও SMS',
    meta: 'প্রো প্ল্যান · SMS ব্যালেন্স',
    tint: colors.mustardTint,
    icon: <CreditCard size={ICON_SIZE} color={colors.mustard} strokeWidth={ICON_STROKE} />,
    route: '/shop/subscription',
  },
  {
    label: 'নোটিফিকেশন',
    meta: 'ডেলিভারি, বকেয়া ও সিস্টেমের খবর',
    tint: colors.slateNeutralTint,
    icon: <Bell size={ICON_SIZE} color={colors.slate} strokeWidth={ICON_STROKE} />,
    route: '/notifications',
  },
  {
    label: 'সাহায্য',
    meta: 'ব্যবহারের নির্দেশনা ও যোগাযোগ',
    tint: colors.roseTint,
    icon: <HelpCircle size={ICON_SIZE} color={colors.rose} strokeWidth={ICON_STROKE} />,
  },
];

/**
 * দোকান — settings hub (Package G). Shop identity panel on top, then
 * one ledger-style settings list; footer carries the app version and
 * the লগআউট text button. Reached from the dashboard grid's দোকান and
 * সেটিংস cells.
 */
export default function ShopHubScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="দোকান" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          {/* Shop identity */}
          <View style={styles.identityPanel}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>{shop.name.charAt(0)}</Text>
            </View>
            <View style={styles.identityMain}>
              <View style={styles.nameRow}>
                <Text style={styles.shopName} numberOfLines={1}>
                  {shop.name}
                </Text>
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>প্রো</Text>
                </View>
              </View>
              <Text style={styles.identityMeta} numberOfLines={1}>
                মালিক: {shop.ownerName}
              </Text>
              <Text style={styles.identityMeta} numberOfLines={1}>
                {toBnDigits(shop.phone)} · {shop.area}
              </Text>
            </View>
          </View>

          {/* Settings list */}
          <LedgerPanel>
            {items.map((item, i) => (
              <Pressable
                key={item.label}
                onPress={
                  item.route
                    ? () => router.push(item.route as never)
                    : undefined
                }
                style={({ pressed }) => [
                  styles.row,
                  i < items.length - 1 && styles.divider,
                  pressed && item.route && styles.pressed,
                ]}
                accessibilityLabel={item.label}
              >
                <View
                  style={[styles.iconCircle, { backgroundColor: item.tint }]}
                >
                  {item.icon}
                </View>
                <View style={styles.rowMain}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {item.meta}
                  </Text>
                </View>
                {item.route && (
                  <ChevronRight
                    size={18}
                    color={colors.textFaint}
                    strokeWidth={2}
                  />
                )}
              </Pressable>
            ))}
          </LedgerPanel>

          {/* Footer */}
          <Text style={styles.version}>মাপখাতা v0.1.0</Text>
          <Pressable
            onPress={() => router.replace('/login' as never)}
            style={({ pressed }) => [
              styles.logout,
              pressed && styles.pressed,
            ]}
            accessibilityLabel="লগআউট"
          >
            <LogOut size={16} color={colors.danger} strokeWidth={2} />
            <Text style={styles.logoutText}>লগআউট</Text>
          </Pressable>

          {/* Operator (superadmin) preview entry — Package I. PREVIEW
              ONLY: shops never see this in production; it exists so the
              owner can open his own /admin panel from the demo build. */}
          <Pressable
            onPress={() => router.push('/admin' as never)}
            style={({ pressed }) => [
              styles.operatorRow,
              pressed && styles.pressed,
            ]}
            accessibilityLabel="অপারেটর প্যানেল"
          >
            <Shield size={14} color={colors.textFaint} strokeWidth={2} />
            <Text style={styles.operatorText}>অপারেটর প্যানেল</Text>
          </Pressable>

          <View style={styles.footerSpace} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.md },
  identityPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.primary,
  },
  identityMain: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  shopName: {
    ...typography.bandGreeting,
    color: colors.ink,
    flexShrink: 1,
  },
  planBadge: {
    backgroundColor: colors.mustardTint,
    borderRadius: radius.chip,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  planBadgeText: {
    ...typography.chip,
    color: colors.mustard,
  },
  identityMeta: { ...typography.label, color: colors.textSecondary },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 60,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  pressed: { backgroundColor: colors.background },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowMain: { flex: 1, gap: 2 },
  rowLabel: { ...typography.bodySemiBold, color: colors.ink },
  rowMeta: { ...typography.label, color: colors.textSecondary },
  version: {
    ...typography.label,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm - 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  logoutText: { ...typography.bodySemiBold, color: colors.danger },
  operatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
    alignSelf: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  operatorText: { ...typography.label, color: colors.textFaint },
  footerSpace: { height: spacing.lg },
});
