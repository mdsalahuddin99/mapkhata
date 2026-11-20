import { useRouter } from 'expo-router';
import { ArrowLeftRight, ChevronRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SelectChips } from '../../src/components/AuthBits';
import { PrimaryButton } from '../../src/components/Buttons';
import { BackHeader } from '../../src/components/CustomerBits';
import { LedgerPanel } from '../../src/components/LedgerRow';
import { SummaryPanel } from '../../src/components/SummaryPanel';
import { fullDateLabel, toBnDigits } from '../../src/data/mock';
import { useOrders } from '../../src/store/orders';
import {
  colors,
  formatTaka,
  radius,
  spacing,
  typography,
} from '../../src/theme';

const takaBn = (amount: number) => toBnDigits(formatTaka(amount));

/** Free-plan monthly order limit — the প্রো bar is read against it. */
const FREE_ORDER_LIMIT = 30;

const SMS_PACKS = ['১০০টি · ৳৬০', '৫০০টি · ৳২৭৫', '১০০০টি · ৳৫০০'] as const;

/**
 * সাবস্ক্রিপশন ও SMS (Package G) — current প্রো plan with this month's
 * order usage, the SMS balance, and the pack shop. Buying is visual:
 * the payment gateway is not wired yet, so কিনুন shows an inline note.
 * Order usage is live from the orders store (this month's delivery
 * window, same derivation as the reports screen).
 */
export default function SubscriptionScreen() {
  const router = useRouter();
  const orders = useOrders();
  const [pack, setPack] = useState<string>(SMS_PACKS[1]);
  const [buyNote, setBuyNote] = useState(false);

  const usedThisMonth = orders.filter(
    (o) =>
      o.status !== 'cancelled' &&
      o.deliveryInDays <= 0 &&
      o.deliveryInDays >= -29,
  ).length;
  const barRatio = Math.min(1, usedThisMonth / FREE_ORDER_LIMIT);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="সাবস্ক্রিপশন ও SMS" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          {/* Current plan */}
          <View style={styles.panel}>
            <View style={styles.planHead}>
              <Text style={styles.planName}>প্রো প্ল্যান</Text>
              <Text style={styles.planPrice}>{takaBn(499)}/মাস</Text>
            </View>
            <Text style={styles.planMeta}>
              মেয়াদ শেষ: {fullDateLabel(18)}
            </Text>
            <View style={styles.usageHead}>
              <Text style={styles.usageLabel}>এই মাসে ব্যবহৃত অর্ডার</Text>
              <Text style={styles.usageValue}>
                {toBnDigits(usedThisMonth)}টি
              </Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${Math.round(barRatio * 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.planNote}>
              ফ্রি প্ল্যানের সীমা মাসে {toBnDigits(FREE_ORDER_LIMIT)}টি
              অর্ডার — প্রো-তে অসীম।
            </Text>
          </View>

          {/* SMS balance */}
          <View style={styles.smsWrap}>
            <SummaryPanel
              label="SMS ব্যালেন্স"
              value={`${toBnDigits(120)}টি`}
              stats={[
                { value: `${toBnDigits(46)}টি`, label: 'এই মাসে পাঠানো' },
                { value: `${toBnDigits(28)}টি`, label: 'কনফার্ম SMS' },
                { value: `${toBnDigits(18)}টি`, label: 'রেডি SMS' },
              ]}
            />
            <Text style={styles.smsNote}>
              অর্ডার কনফার্ম ও রেডি হলে কাস্টমারের কাছে SMS অটো যায়।
              প্রতি SMS-এর খরচ প্যাক অনুযায়ী — ছোট প্যাকে ৳০.৬০, বড়
              প্যাকে ৳০.৫০।
            </Text>
          </View>

          {/* Buy a pack */}
          <Text style={styles.sectionTitle}>SMS প্যাক কিনুন</Text>
          <SelectChips
            options={SMS_PACKS}
            value={pack}
            onChange={(v) => {
              setPack(v);
              setBuyNote(false);
            }}
          />
          <View style={styles.buyWrap}>
            <PrimaryButton label="কিনুন" onPress={() => setBuyNote(true)} />
          </View>
          {buyNote && (
            <View style={styles.noteBox}>
              <Text style={styles.noteText}>
                পেমেন্ট গেটওয়ে শীঘ্রই আসছে — আপাতত প্যাক কিনতে সাপোর্টে
                যোগাযোগ করুন।
              </Text>
            </View>
          )}

          {/* Change plan */}
          <View style={styles.planRowWrap}>
            <LedgerPanel>
              <Pressable
                onPress={() => router.push('/plan' as never)}
                style={({ pressed }) => [
                  styles.planRow,
                  pressed && styles.pressed,
                ]}
                accessibilityLabel="প্ল্যান বদলান"
              >
                <View style={styles.planRowIcon}>
                  <ArrowLeftRight
                    size={18}
                    color={colors.primary}
                    strokeWidth={1.9}
                  />
                </View>
                <Text style={styles.planRowLabel}>প্ল্যান বদলান</Text>
                <ChevronRight
                  size={18}
                  color={colors.textFaint}
                  strokeWidth={2}
                />
              </Pressable>
            </LedgerPanel>
          </View>

          <View style={styles.footerSpace} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.md },
  panel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  planHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  planName: { ...typography.bandGreeting, color: colors.ink },
  planPrice: { ...typography.bodySemiBold, color: colors.primary },
  planMeta: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: 2,
  },
  usageHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: spacing.md,
  },
  usageLabel: { ...typography.label, color: colors.textSecondary },
  usageValue: { ...typography.bodySemiBold, color: colors.ink },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryTint,
    marginTop: spacing.sm - 2,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  planNote: {
    ...typography.label,
    color: colors.textFaint,
    marginTop: spacing.sm,
  },
  smsWrap: { marginTop: spacing.md },
  smsNote: {
    ...typography.label,
    color: colors.textFaint,
    marginTop: spacing.sm,
    marginHorizontal: 2,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.ink,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginHorizontal: 2,
  },
  buyWrap: { marginTop: spacing.md },
  noteBox: {
    backgroundColor: colors.primaryTint,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginTop: spacing.md,
  },
  noteText: { ...typography.label, color: colors.primary },
  planRowWrap: { marginTop: spacing.lg },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  pressed: { backgroundColor: colors.background },
  planRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planRowLabel: { ...typography.bodySemiBold, color: colors.ink, flex: 1 },
  footerSpace: { height: spacing.lg },
});
