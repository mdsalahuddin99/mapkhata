import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AdminStatusLine,
  PlanChip,
  adminColumnStyle,
} from '../../../src/components/AdminBits';
import { PrimaryButton, SecondaryButton } from '../../../src/components/Buttons';
import {
  BackHeader,
  CustomerAvatar,
} from '../../../src/components/CustomerBits';
import {
  findAdminShop,
  joinedLabel,
  lastActiveLabel,
  planMeta,
  renewalLabel,
} from '../../../src/data/admin';
import { fullDateLabel, toBnDigits } from '../../../src/data/mock';
import { colors, fontFamily, radius, spacing, typography } from '../../../src/theme';

interface InfoRowProps {
  label: string;
  value: string;
  /** Colour override for the value (amber low SMS, danger expired). */
  valueColor?: string;
  last?: boolean;
}

/** One label/value line inside a panel, hairline-divided. */
function InfoRow({ label, value, valueColor, last }: InfoRowProps) {
  return (
    <View style={[styles.infoRow, !last && styles.infoDivider]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={[styles.infoValue, valueColor ? { color: valueColor } : null]}
      >
        {value}
      </Text>
    </View>
  );
}

/**
 * দোকান বিস্তারিত — the operator's page for one shop (Package I):
 * identity, subscription + usage figures, and the operator actions.
 * All actions are VISUAL in this demo build (press states only) —
 * extending validity, topping up SMS and suspending a shop land with
 * the platform backend.
 */
export default function AdminShopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const shop = id ? findAdminShop(id) : undefined;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title={shop ? shop.name : 'দোকান বিস্তারিত'} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <View style={adminColumnStyle}>
            {!shop ? (
              <View style={styles.panel}>
                <Text style={styles.empty}>
                  এই দোকানটি পাওয়া যায়নি — তালিকা থেকে আবার বেছে নিন।
                </Text>
              </View>
            ) : (
              <>
                {/* Identity */}
                <View style={styles.identityPanel}>
                  <CustomerAvatar name={shop.name} size={56} />
                  <View style={styles.identityMain}>
                    <Text style={styles.shopName} numberOfLines={1}>
                      {shop.name}
                    </Text>
                    <Text style={styles.identityMeta} numberOfLines={1}>
                      মালিক: {shop.owner}
                    </Text>
                    <Text style={styles.identityMeta} numberOfLines={1}>
                      {toBnDigits(shop.phone)} · {shop.district}
                    </Text>
                    <View style={styles.identityChips}>
                      <PlanChip plan={shop.plan} />
                      <AdminStatusLine shop={shop} />
                    </View>
                  </View>
                </View>

                {/* Subscription + usage */}
                <Text style={styles.sectionTitle}>সাবস্ক্রিপশন ও ব্যবহার</Text>
                <View style={styles.panel}>
                  <InfoRow label="প্ল্যান" value={planMeta[shop.plan].label} />
                  <InfoRow
                    label="শুরু"
                    value={`${fullDateLabel(-shop.joinedDaysAgo)} (${joinedLabel(shop.joinedDaysAgo)})`}
                  />
                  <InfoRow
                    label="নবায়ন বাকি"
                    value={renewalLabel(shop)}
                    valueColor={
                      shop.renewalInDays < 0
                        ? colors.danger
                        : shop.renewalInDays <= 7
                          ? colors.amber
                          : undefined
                    }
                  />
                  <InfoRow
                    label="এই মাসের অর্ডার"
                    value={`${toBnDigits(shop.ordersThisMonth)}টি`}
                  />
                  <InfoRow
                    label="SMS ব্যালেন্স"
                    value={`${toBnDigits(shop.smsBalance)}টি`}
                    valueColor={shop.smsBalance < 30 ? colors.amber : undefined}
                  />
                  <InfoRow
                    label="শেষ সক্রিয়"
                    value={lastActiveLabel(shop.lastActiveDaysAgo)}
                    last
                  />
                </View>

                {/* Operator actions (visual in the demo) */}
                <View style={styles.actions}>
                  <PrimaryButton label="মেয়াদ বাড়ান" />
                  <SecondaryButton label="SMS যোগ করুন" />
                  <Pressable
                    style={({ pressed }) => [
                      styles.suspend,
                      pressed && styles.pressed,
                    ]}
                    accessibilityLabel="দোকান বন্ধ করুন"
                  >
                    <Text style={styles.suspendText}>দোকান বন্ধ করুন</Text>
                  </Pressable>
                </View>
              </>
            )}

            <View style={styles.footerSpace} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.lg },
  panel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
  },
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
  },
  identityMain: { flex: 1, gap: 2 },
  shopName: { ...typography.bandGreeting, color: colors.ink },
  identityMeta: { ...typography.label, color: colors.textSecondary },
  identityChips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm - 2,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.ink,
    marginTop: spacing.xl,
    marginBottom: 7,
    marginHorizontal: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: 10,
  },
  infoDivider: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  infoLabel: { ...typography.body, color: colors.textSecondary },
  infoValue: {
    ...typography.bodySemiBold,
    color: colors.ink,
    textAlign: 'right',
    flexShrink: 1,
  },
  actions: { gap: spacing.sm, marginTop: spacing.xl },
  suspend: {
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  suspendText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.danger,
  },
  pressed: { opacity: 0.6 },
  empty: { ...typography.body, color: colors.textSecondary, paddingVertical: spacing.lg },
  footerSpace: { height: spacing.lg },
});
