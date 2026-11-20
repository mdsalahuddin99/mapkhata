import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../src/components/Buttons';
import { BackHeader } from '../../../src/components/CustomerBits';
import { toBnDigits } from '../../../src/data/mock';
import {
  addKarigarPayment,
  karigarTotals,
  useKarigars,
} from '../../../src/store/karigars';
import {
  colors,
  controlHeight,
  fontFamily,
  formatTaka,
  radius,
  spacing,
  typography,
} from '../../../src/theme';

const takaBn = (amount: number) => toBnDigits(formatTaka(amount));

const METHODS = ['নগদ', 'বিকাশ', 'নাগদ'] as const;

const parseMoney = (s: string): number => {
  const n = Number(s.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

/**
 * কারিগর পেমেন্ট — pay one karigar against their open পাওনা. Mirrors
 * the টাকা জমা (collect) screen, with one deliberate difference: this
 * due is the shop's own payable, so the big number stays ink — amber
 * is reserved for customer dues (DESIGN.md v1.3). On save the store
 * records the payment, so the detail and the কারিগর tab update.
 */
export default function KarigarPaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const entries = useKarigars();
  const entry = entries.find((e) => e.id === id);

  const due = entry ? karigarTotals(entry).due : 0;
  const [amountText, setAmountText] = useState<string | null>(null);
  const [method, setMethod] = useState<(typeof METHODS)[number]>('নগদ');
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!entry) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <BackHeader title="কারিগর পেমেন্ট" />
        <Text style={styles.empty}>কারিগরকে পাওয়া যায়নি।</Text>
      </SafeAreaView>
    );
  }

  const amount = amountText === null ? due : parseMoney(amountText);
  const remaining = Math.max(0, due - amount);

  const quickChips: { label: string; value: number }[] = [
    { label: 'পুরোটা', value: due },
    { label: '৫০০', value: 500 },
    { label: '১,০০০', value: 1000 },
  ];

  const onSave = () => {
    if (amount <= 0) {
      setError('পেমেন্টের পরিমাণ দিন।');
      return;
    }
    if (amount > due) {
      setError('পাওনার চেয়ে বেশি পেমেন্ট দেওয়া যাবে না।');
      return;
    }
    addKarigarPayment(entry.id, amount, method);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="কারিগর পেমেন্ট" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          {/* কারিগর */}
          <View style={styles.panel}>
            <Text style={styles.karigarName}>{entry.name}</Text>
            <Text style={styles.meta}>
              {entry.skill}
              {entry.phone ? ` · ${toBnDigits(entry.phone)}` : ''}
            </Text>
          </View>

          {due <= 0 ? (
            <Text style={styles.empty}>এই কারিগরের কোনো পাওনা নেই।</Text>
          ) : (
            <>
              {/* পাওনা — ink, not amber: this is the shop's payable. */}
              <View style={[styles.panel, styles.duePanel]}>
                <Text style={styles.dueLabel}>পাওনা</Text>
                <Text style={styles.dueValue}>{takaBn(due)}</Text>
              </View>

              {/* পরিমাণ */}
              <Text style={styles.sectionTitle}>পেমেন্টের পরিমাণ</Text>
              <View style={styles.panel}>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: focused ? colors.primary : colors.hairline },
                  ]}
                  value={amountText === null ? String(due) : amountText}
                  onChangeText={(t) => {
                    setAmountText(t);
                    setError(null);
                  }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  keyboardType="numeric"
                  placeholder="০"
                  placeholderTextColor={colors.textFaint}
                />
                <View style={styles.chipWrap}>
                  {quickChips.map((chip) => {
                    const selected = amount === chip.value;
                    return (
                      <Pressable
                        key={chip.label}
                        onPress={() => {
                          setAmountText(String(chip.value));
                          setError(null);
                        }}
                        style={[styles.chip, selected && styles.chipSelected]}
                      >
                        <Text
                          style={[
                            styles.chipLabel,
                            selected && styles.chipLabelSelected,
                          ]}
                        >
                          {chip.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={[styles.fieldLabel, styles.fieldGap]}>
                  মাধ্যম
                </Text>
                <View style={styles.chipWrap}>
                  {METHODS.map((m) => {
                    const selected = method === m;
                    return (
                      <Pressable
                        key={m}
                        onPress={() => setMethod(m)}
                        style={[styles.chip, selected && styles.chipSelected]}
                      >
                        <Text
                          style={[
                            styles.chipLabel,
                            selected && styles.chipLabelSelected,
                          ]}
                        >
                          {m}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.remainRow}>
                  <Text style={styles.remainLabel}>পেমেন্টের পর পাওনা থাকবে</Text>
                  <Text style={styles.remainValue}>{takaBn(remaining)}</Text>
                </View>
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}
              <View style={styles.saveWrap}>
                <PrimaryButton label="পেমেন্ট করুন" onPress={onSave} />
              </View>
            </>
          )}

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
  karigarName: { ...typography.bodySemiBold, color: colors.ink },
  meta: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: 2,
  },
  duePanel: { marginTop: spacing.md },
  dueLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  dueValue: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    lineHeight: 32,
    color: colors.ink,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.ink,
    marginTop: spacing.lg,
    marginBottom: 7,
    marginHorizontal: 2,
  },
  input: {
    ...typography.body,
    height: controlHeight,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.control,
    paddingHorizontal: spacing.md,
    color: colors.ink,
    paddingVertical: 0,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  chip: {
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.ink,
  },
  chipLabelSelected: { color: '#FFFFFF' },
  fieldLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs + 2,
  },
  fieldGap: { marginTop: spacing.lg },
  remainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  remainLabel: { ...typography.body, color: colors.ink },
  remainValue: { ...typography.statNumber, color: colors.ink },
  errorText: {
    ...typography.label,
    color: colors.danger,
    marginTop: spacing.md,
  },
  saveWrap: { marginTop: spacing.md },
  empty: { ...typography.body, color: colors.textSecondary, marginTop: spacing.lg },
  footerSpace: { height: spacing.lg },
});
