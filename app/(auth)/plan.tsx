import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SelectChips } from '../../src/components/AuthBits';
import { PrimaryButton } from '../../src/components/Buttons';
import { BackHeader } from '../../src/components/CustomerBits';
import { toBnDigits } from '../../src/data/mock';
import {
  colors,
  fontFamily,
  formatTaka,
  radius,
  spacing,
  typography,
} from '../../src/theme';

const takaBn = (amount: number) => toBnDigits(formatTaka(amount));

const PERIODS = ['মাসিক', 'বার্ষিক'] as const;
type Period = (typeof PERIODS)[number];

interface PlanDef {
  key: 'free' | 'pro';
  name: string;
  monthly: number;
  yearly: number;
  periodNote: { monthly: string; yearly: string };
  features: string[];
  badge?: string;
}

const PLANS: PlanDef[] = [
  {
    key: 'free',
    name: 'ফ্রি (শুরু)',
    monthly: 0,
    yearly: 0,
    periodNote: { monthly: 'সবসময় ফ্রি', yearly: 'সবসময় ফ্রি' },
    features: ['মাসে ৩০টি অর্ডার', 'মাপের খাতা', 'বকেয়া তালিকা'],
  },
  {
    key: 'pro',
    name: 'প্রো',
    monthly: 499,
    yearly: 4990,
    periodNote: {
      monthly: 'প্রতি মাসে',
      yearly: 'প্রতি বছরে — ২ মাস ফ্রি',
    },
    features: [
      'অসীম অর্ডার',
      'SMS নোটিফিকেশন',
      'কারিগর হিসাব',
      'রিপোর্ট',
    ],
    badge: 'জনপ্রিয়',
  },
];

/**
 * প্ল্যান বাছাই (Package F — UI only). Two plan panels in the DESIGN
 * style; the selected one gets the primary border + tint. The
 * মাসিক/বার্ষিক toggle switches the প্রো price (বার্ষিক ৳৪,৯৯০ — ২ মাস
 * ফ্রি). No payment is taken; "শুরু করুন" lands on the tabs home.
 */
export default function PlanScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>('মাসিক');
  const [selected, setSelected] = useState<'free' | 'pro'>('pro');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="প্ল্যান বাছাই" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <View style={styles.toggleRow}>
            <SelectChips
              options={PERIODS}
              value={period}
              onChange={(v) => setPeriod(v as Period)}
            />
          </View>

          {PLANS.map((plan) => {
            const isSelected = selected === plan.key;
            const price = period === 'মাসিক' ? plan.monthly : plan.yearly;
            return (
              <Pressable
                key={plan.key}
                onPress={() => setSelected(plan.key)}
                style={[
                  styles.planCard,
                  isSelected && styles.planCardSelected,
                ]}
              >
                <View style={styles.planHead}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  {plan.badge ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeLabel}>{plan.badge}</Text>
                    </View>
                  ) : null}
                  <View
                    style={[
                      styles.radio,
                      isSelected && styles.radioSelected,
                    ]}
                  >
                    {isSelected ? <View style={styles.radioDot} /> : null}
                  </View>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>{takaBn(price)}</Text>
                  <Text style={styles.periodNote}>
                    {period === 'মাসিক'
                      ? plan.periodNote.monthly
                      : plan.periodNote.yearly}
                  </Text>
                </View>
                <View style={styles.featureList}>
                  {plan.features.map((f) => (
                    <View key={f} style={styles.featureRow}>
                      <Check size={15} color={colors.primary} strokeWidth={2.4} />
                      <Text style={styles.featureText}>{f}</Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            );
          })}

          <Text style={styles.trialNote}>
            প্রথম ১ মাস ফ্রি — কার্ড লাগবে না।
          </Text>

          <View style={styles.buttonGap}>
            <PrimaryButton
              label="শুরু করুন"
              onPress={() => router.replace('/(tabs)' as never)}
            />
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
  toggleRow: { marginBottom: spacing.md },
  planCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },
  planHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  planName: { ...typography.bodySemiBold, color: colors.ink, fontSize: 15 },
  badge: {
    backgroundColor: colors.mustardTint,
    borderRadius: radius.chip,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    lineHeight: 14,
    color: colors.mustard,
  },
  radio: {
    marginLeft: 'auto',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  price: { ...typography.statNumber, color: colors.ink },
  periodNote: { ...typography.label, color: colors.textSecondary },
  featureList: { marginTop: spacing.md, gap: spacing.sm },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  featureText: { ...typography.body, color: colors.ink },
  trialNote: {
    ...typography.label,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  buttonGap: { marginTop: spacing.md },
  footerSpace: { height: spacing.lg },
});
