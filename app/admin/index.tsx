import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AdminShopRow,
  PlanChip,
  adminColumnStyle,
} from '../../src/components/AdminBits';
import { LedgerPanel } from '../../src/components/LedgerRow';
import { SummaryPanel } from '../../src/components/SummaryPanel';
import { WhiteHeader } from '../../src/components/WhiteHeader';
import {
  AdminShop,
  SMS_INCOME_THIS_MONTH,
  adminShops,
  expiringShops,
  joinedLabel,
  lowSmsShops,
  payingShops,
  recentShops,
  renewalLabel,
  subscriptionMrr,
  trialShops,
} from '../../src/data/admin';
import { toBnDigits } from '../../src/data/mock';
import { colors, fontFamily, formatTaka, spacing, typography } from '../../src/theme';

const takaBn = (amount: number) => toBnDigits(formatTaka(amount));

/**
 * মাপখাতা অ্যাডমিন — the SaaS operator's dashboard (Package I).
 * DEMO panel for the MapKhata owner himself: every figure derives
 * from src/data/admin.ts (MRR = paying shops × ৳৪৯৯; SMS pack income
 * is the one seeded constant, labelled as such). No auth gating.
 * Reached by URL (/admin) and the preview link on the shop hub.
 */
export default function AdminDashboardScreen() {
  const router = useRouter();

  const mrr = subscriptionMrr();
  const expiring = expiringShops();
  const lowSms = lowSmsShops();
  const recent = recentShops().slice(0, 5);

  const openShop = (shop: AdminShop) =>
    router.push({
      pathname: '/admin/shop/[id]',
      params: { id: shop.id },
    } as never);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <WhiteHeader title="মাপখাতা অ্যাডমিন" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <View style={adminColumnStyle}>
            <Text style={styles.demoNote}>
              অপারেটর প্যানেল — এই মুহূর্তে সব তথ্য ডেমো।
            </Text>

            {/* Platform summary */}
            <SummaryPanel
              label="এই মাসের আয় (সাবস্ক্রিপশন)"
              value={takaBn(mrr)}
              stats={[
                { value: `${toBnDigits(adminShops.length)}টি`, label: 'মোট দোকান' },
                { value: `${toBnDigits(payingShops().length)}টি`, label: 'সক্রিয় প্রো' },
                { value: `${toBnDigits(trialShops().length)}টি`, label: 'ট্রায়ালে' },
              ]}
            />

            {/* SMS pack income — the one seeded figure, kept separate */}
            <View style={styles.incomePanel}>
              <View style={styles.incomeRow}>
                <Text style={styles.incomeLabel}>SMS প্যাক বিক্রি (এই মাস)</Text>
                <Text style={styles.incomeValue}>
                  {takaBn(SMS_INCOME_THIS_MONTH)}
                </Text>
              </View>
              <View style={[styles.incomeRow, styles.incomeDivider]}>
                <Text style={styles.incomeLabel}>সর্বমোট আয় (এই মাস)</Text>
                <Text style={[styles.incomeValue, styles.incomeTotal]}>
                  {takaBn(mrr + SMS_INCOME_THIS_MONTH)}
                </Text>
              </View>
            </View>

            {/* Expiring within 7 days */}
            <Text style={styles.sectionTitle}>মেয়াদ শেষ হচ্ছে — ৭ দিনের মধ্যে</Text>
            {expiring.length === 0 ? (
              <Text style={styles.empty}>কোনো দোকানের মেয়াদ শেষ হচ্ছে না।</Text>
            ) : (
              <LedgerPanel>
                {expiring.map((shop, i) => (
                  <AdminShopRow
                    key={shop.id}
                    shop={shop}
                    index={i}
                    last={i === expiring.length - 1}
                    onPress={() => openShop(shop)}
                    right={
                      <>
                        <PlanChip plan={shop.plan} />
                        <Text
                          style={[
                            styles.renewalText,
                            shop.renewalInDays < 0 && styles.renewalExpired,
                          ]}
                        >
                          {renewalLabel(shop)}
                        </Text>
                      </>
                    }
                  />
                ))}
              </LedgerPanel>
            )}

            {/* Low SMS balance */}
            <Text style={styles.sectionTitle}>SMS ব্যালেন্স কম</Text>
            {lowSms.length === 0 ? (
              <Text style={styles.empty}>সবার SMS ব্যালেন্স ঠিক আছে।</Text>
            ) : (
              <LedgerPanel>
                {lowSms.map((shop, i) => (
                  <AdminShopRow
                    key={shop.id}
                    shop={shop}
                    index={i}
                    last={i === lowSms.length - 1}
                    onPress={() => openShop(shop)}
                    right={
                      <Text style={styles.smsLow}>
                        {toBnDigits(shop.smsBalance)}টি SMS
                      </Text>
                    }
                  />
                ))}
              </LedgerPanel>
            )}

            {/* Recent shops */}
            <Text style={styles.sectionTitle}>নতুন দোকান</Text>
            <LedgerPanel>
              {recent.map((shop, i) => (
                <AdminShopRow
                  key={shop.id}
                  shop={shop}
                  index={i}
                  meta={`${shop.district} · ${joinedLabel(shop.joinedDaysAgo)}`}
                  last={i === recent.length - 1}
                  onPress={() => openShop(shop)}
                  right={<PlanChip plan={shop.plan} />}
                />
              ))}
            </LedgerPanel>

            <Pressable
              onPress={() => router.push('/admin/shops' as never)}
              style={({ pressed }) => [
                styles.allShops,
                pressed && styles.pressed,
              ]}
              accessibilityLabel="সব দোকান দেখুন"
            >
              <Text style={styles.allShopsText}>সব দোকান দেখুন</Text>
              <ChevronRight size={17} color={colors.primary} strokeWidth={2} />
            </Pressable>

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
  demoNote: {
    ...typography.label,
    color: colors.textFaint,
    marginBottom: spacing.md,
  },
  incomePanel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginTop: spacing.md,
  },
  incomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
  },
  incomeDivider: { borderTopWidth: 1, borderTopColor: colors.hairline },
  incomeLabel: { ...typography.body, color: colors.textSecondary },
  incomeValue: { ...typography.bodySemiBold, color: colors.ink },
  incomeTotal: { fontFamily: fontFamily.bold },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.ink,
    marginTop: spacing.xl,
    marginBottom: 7,
    marginHorizontal: 2,
  },
  renewalText: {
    ...typography.chip,
    color: colors.amber,
  },
  renewalExpired: { color: colors.danger },
  smsLow: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.amber,
  },
  allShops: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  allShopsText: { ...typography.bodySemiBold, color: colors.primary },
  pressed: { opacity: 0.6 },
  empty: { ...typography.body, color: colors.textSecondary },
  footerSpace: { height: spacing.lg },
});
