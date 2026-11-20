import { useRouter } from 'expo-router';
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
import { PrimaryButton } from '../../src/components/Buttons';
import { BackHeader } from '../../src/components/CustomerBits';
import { addKarigar } from '../../src/store/karigars';
import {
  colors,
  controlHeight,
  fontFamily,
  radius,
  spacing,
  typography,
} from '../../src/theme';

const ROLES = [
  'সেলাই মাস্টার',
  'কাটিং মাস্টার',
  'সেলাই',
  'ফিনিশিং',
  'অন্যান্য',
] as const;

/** Default piece rates (৳) — the rates already used in the mock work. */
const RATE_FIELDS: { label: string; value: number }[] = [
  { label: 'পাঞ্জাবি', value: 300 },
  { label: 'কামিজ', value: 250 },
  { label: 'কাটিং', value: 150 },
  { label: 'ব্লাউজ', value: 180 },
];

const parseMoney = (s: string): number => {
  const n = Number(s.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

/**
 * নতুন কারিগর — name, role, optional phone, and the default piece
 * rates this karigar is paid at. Saving writes to the karigar store,
 * so the new karigar is on the কারিগর tab as soon as we go back.
 */
export default function NewKarigarScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [role, setRole] = useState<(typeof ROLES)[number]>('সেলাই');
  const [phone, setPhone] = useState('');
  const [rates, setRates] = useState<Record<string, string>>(() =>
    Object.fromEntries(RATE_FIELDS.map((f) => [f.label, String(f.value)])),
  );
  const [focused, setFocused] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputBorder = (key: string) => ({
    borderColor: focused === key ? colors.primary : colors.hairline,
  });

  const onSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('কারিগরের নাম দিন।');
      return;
    }
    const pieceRates: Record<string, number> = {};
    for (const f of RATE_FIELDS) {
      const v = parseMoney(rates[f.label] ?? '');
      if (v > 0) pieceRates[f.label] = Math.round(v);
    }
    addKarigar({
      name: trimmed,
      role,
      phone: phone.trim() ? phone.trim() : undefined,
      pieceRates: Object.keys(pieceRates).length ? pieceRates : undefined,
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="নতুন কারিগর" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <View style={styles.panel}>
            <Text style={styles.fieldLabel}>নাম</Text>
            <TextInput
              style={[styles.input, inputBorder('name')]}
              value={name}
              onChangeText={(t) => {
                setName(t);
                setError(null);
              }}
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused(null)}
              placeholder="কারিগরের নাম"
              placeholderTextColor={colors.textFaint}
            />

            <Text style={[styles.fieldLabel, styles.fieldGap]}>ভূমিকা</Text>
            <View style={styles.chipWrap}>
              {ROLES.map((r) => {
                const selected = role === r;
                return (
                  <Pressable
                    key={r}
                    onPress={() => setRole(r)}
                    style={[styles.chip, selected && styles.chipSelected]}
                  >
                    <Text
                      style={[
                        styles.chipLabel,
                        selected && styles.chipLabelSelected,
                      ]}
                    >
                      {r}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.fieldLabel, styles.fieldGap]}>
              মোবাইল নম্বর (ঐচ্ছিক)
            </Text>
            <TextInput
              style={[styles.input, inputBorder('phone')]}
              value={phone}
              onChangeText={setPhone}
              onFocus={() => setFocused('phone')}
              onBlur={() => setFocused(null)}
              keyboardType="phone-pad"
              placeholder="01XXXXXXXXX"
              placeholderTextColor={colors.textFaint}
            />
          </View>

          <Text style={styles.sectionTitle}>পিস-রেট (ডিফল্ট)</Text>
          <View style={styles.panel}>
            {RATE_FIELDS.map((f, i) => (
              <View
                key={f.label}
                style={[styles.rateRow, i > 0 && styles.rateDivider]}
              >
                <Text style={styles.rateLabel}>{f.label}</Text>
                <View style={styles.rateInputWrap}>
                  <Text style={styles.takaMark}>৳</Text>
                  <TextInput
                    style={[styles.rateInput, inputBorder(f.label)]}
                    value={rates[f.label]}
                    onChangeText={(t) =>
                      setRates((prev) => ({ ...prev, [f.label]: t }))
                    }
                    onFocus={() => setFocused(f.label)}
                    onBlur={() => setFocused(null)}
                    keyboardType="numeric"
                    placeholder="০"
                    placeholderTextColor={colors.textFaint}
                  />
                </View>
              </View>
            ))}
            <Text style={styles.rateNote}>
              এই রেটগুলো এই কারিগরের ডিফল্ট — কাজ দেওয়ার সময় বদলানো যাবে।
            </Text>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}
          <View style={styles.saveWrap}>
            <PrimaryButton label="সেভ করুন" onPress={onSave} />
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
  fieldLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs + 2,
  },
  fieldGap: { marginTop: spacing.lg },
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
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.ink,
    marginTop: spacing.lg,
    marginBottom: 7,
    marginHorizontal: 2,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rateDivider: { borderTopWidth: 1, borderTopColor: colors.hairline },
  rateLabel: { ...typography.body, color: colors.ink },
  rateInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  takaMark: { ...typography.body, color: colors.textSecondary },
  rateInput: {
    ...typography.body,
    width: 96,
    height: 38,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.control,
    paddingHorizontal: spacing.sm + 2,
    color: colors.ink,
    paddingVertical: 0,
    textAlign: 'right',
  },
  rateNote: {
    ...typography.label,
    color: colors.textFaint,
    marginTop: spacing.sm,
  },
  errorText: {
    ...typography.label,
    color: colors.danger,
    marginTop: spacing.md,
  },
  saveWrap: { marginTop: spacing.md },
  footerSpace: { height: spacing.lg },
});
