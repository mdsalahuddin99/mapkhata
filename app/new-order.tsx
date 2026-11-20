import { useRouter } from 'expo-router';
import { BadgeCheck, ChevronLeft } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../src/components/Buttons';
import {
  Customer,
  findCustomerByPhone,
  fullDateLabel,
  garmentDef,
  garmentDefs,
  GarmentKey,
  hasSavedMeasurements,
  karigars,
  searchCustomers,
  toBnDigits,
} from '../src/data/mock';
import { addOrder, nextOrderCode, useOrders } from '../src/store/orders';
import {
  colors,
  controlHeight,
  fontFamily,
  formatTaka,
  radius,
  spacing,
  typography,
} from '../src/theme';

/** Amounts in summaries use Bengali digits, like the dashboard. */
const takaBn = (amount: number) => toBnDigits(formatTaka(amount));

const digitsOnly = (s: string) => s.replace(/[^0-9]/g, '');

const parseMoney = (s: string): number => {
  const n = Number(s.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const BN_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
];

const bnToLatinDigits = (s: string) =>
  s.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));

/**
 * Best-effort parse of a typed delivery date ("২৭ নভেম্বর") into a day
 * offset from today. Returns null when the text can't be understood —
 * the caller falls back to 7 days and says so.
 */
function parseCustomDateOffset(text: string): number | null {
  const latin = bnToLatinDigits(text);
  const dayMatch = /(\d{1,2})/.exec(latin);
  const monthIndex = BN_MONTHS.findIndex((m) => text.includes(m));
  if (!dayMatch || monthIndex < 0) return null;
  const day = Number(dayMatch[1]);
  if (day < 1 || day > 31) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let target = new Date(now.getFullYear(), monthIndex, day);
  if (target.getTime() < today.getTime()) {
    target = new Date(now.getFullYear() + 1, monthIndex, day);
  }
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

type DeliveryChoice = 3 | 5 | 7 | 'custom';

const deliveryOptions: { key: DeliveryChoice; label: string }[] = [
  { key: 3, label: '৩ দিনে' },
  { key: 5, label: '৫ দিনে' },
  { key: 7, label: '৭ দিনে' },
  { key: 'custom', label: 'তারিখ লিখুন' },
];

export default function NewOrderScreen() {
  const router = useRouter();
  const orders = useOrders();

  // কাস্টমার
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);

  // পোশাক ও মাপ
  const [garment, setGarment] = useState<GarmentKey>('panjabi');
  const [valuesByGarment, setValuesByGarment] = useState<
    Partial<Record<GarmentKey, Record<string, string>>>
  >({});
  const [designNote, setDesignNote] = useState('');

  // ডেলিভারি ও বিল
  const [deliveryChoice, setDeliveryChoice] = useState<DeliveryChoice>(5);
  const [customDateText, setCustomDateText] = useState('');
  const [totalText, setTotalText] = useState('');
  const [advanceText, setAdvanceText] = useState('');
  const [karigarName, setKarigarName] = useState<string | null>(null);

  const [focused, setFocused] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- customer lookup ---------------- */

  const suggestions = useMemo(() => {
    if (customer) return [];
    const fromPhone = searchCustomers(phone);
    const fromName = searchCustomers(name);
    const seen = new Set<string>();
    return [...fromPhone, ...fromName].filter((c) => {
      if (seen.has(c.phone)) return false;
      seen.add(c.phone);
      return true;
    }).slice(0, 4);
  }, [customer, phone, name]);

  const pickCustomer = (c: Customer) => {
    setCustomer(c);
    setPhone(c.phone);
    setName(c.name);
    setValuesByGarment({});
    setError(null);
  };

  const onPhoneChange = (text: string) => {
    setPhone(text);
    const found = findCustomerByPhone(text);
    if (found) {
      // পুরো নম্বর মিলে গেছে — নাম অটো বসবে, মাপ রেডি থাকবে।
      if (customer?.phone !== found.phone) {
        setCustomer(found);
        setName(found.name);
        setValuesByGarment({});
      }
    } else if (customer && digitsOnly(text) !== digitsOnly(customer.phone)) {
      setCustomer(null);
      setValuesByGarment({});
    }
  };

  /* ---------------- measurements ---------------- */

  /** Current garment's values: typed cache first, else the customer's saved মাপ. */
  const valuesFor = (g: GarmentKey): Record<string, string> =>
    valuesByGarment[g] ??
    (customer?.measurements[g] ? { ...customer.measurements[g] } : {});

  const setFieldValue = (fieldKey: string, value: string) => {
    setValuesByGarment((prev) => ({
      ...prev,
      [garment]: { ...valuesFor(garment), [fieldKey]: value },
    }));
  };

  const currentValues = valuesFor(garment);
  const seededFromSaved = Boolean(
    customer?.measurements[garment] && !valuesByGarment[garment],
  );

  /* ---------------- delivery & bill ---------------- */

  const customOffset =
    deliveryChoice === 'custom' ? parseCustomDateOffset(customDateText) : null;
  const deliveryOffset =
    deliveryChoice === 'custom' ? customOffset ?? 7 : deliveryChoice;

  const total = parseMoney(totalText);
  const advance = parseMoney(advanceText);
  const due = Math.max(0, total - advance);

  /* ---------------- save ---------------- */

  const onSave = () => {
    if (!name.trim() || total <= 0) {
      setError('কাস্টমারের নাম আর মোট টাকা (০-এর বেশি) দিতে হবে।');
      return;
    }
    const filledMeasurements = Object.fromEntries(
      Object.entries(currentValues).filter(([, v]) => v.trim() !== ''),
    );
    addOrder({
      customerName: name.trim(),
      customerPhone: phone.trim(),
      garment: garmentDef(garment).label,
      deliveryInDays: deliveryOffset,
      total,
      advance,
      karigarName: karigarName ?? '',
      measurements:
        Object.keys(filledMeasurements).length > 0
          ? filledMeasurements
          : undefined,
      designNote: designNote.trim() ? designNote.trim() : undefined,
    });
    router.replace('/(tabs)/orders' as never);
  };

  const inputBorder = (key: string) => ({
    borderColor: focused === key ? colors.primary : colors.hairline,
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header — white bar, back + title + next order code */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          accessibilityLabel="ফিরে যান"
        >
          <ChevronLeft size={24} color={colors.ink} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>নতুন অর্ডার</Text>
        <View style={styles.codeChip}>
          <Text style={styles.codeText}>{nextOrderCode(orders)}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ------------ কাস্টমার ------------ */}
        <Text style={styles.sectionTitle}>কাস্টমার</Text>
        <View style={styles.panel}>
          <Text style={styles.fieldLabel}>মোবাইল নম্বর</Text>
          <TextInput
            style={[styles.input, inputBorder('phone')]}
            value={phone}
            onChangeText={onPhoneChange}
            onFocus={() => setFocused('phone')}
            onBlur={() => setFocused(null)}
            placeholder="01XXXXXXXXX"
            placeholderTextColor={colors.textFaint}
            keyboardType="phone-pad"
          />
          <Text style={[styles.fieldLabel, styles.fieldGap]}>নাম</Text>
          <TextInput
            style={[styles.input, inputBorder('name')]}
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (customer && t.trim() !== customer.name) setCustomer(null);
            }}
            onFocus={() => setFocused('name')}
            onBlur={() => setFocused(null)}
            placeholder="কাস্টমারের নাম"
            placeholderTextColor={colors.textFaint}
          />

          {suggestions.length > 0 && (
            <View style={styles.suggestBox}>
              {suggestions.map((c, i) => (
                <Pressable
                  key={c.phone}
                  onPress={() => pickCustomer(c)}
                  style={({ pressed }) => [
                    styles.suggestRow,
                    i > 0 && styles.suggestDivider,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.suggestMain}>
                    <Text style={styles.suggestName}>{c.name}</Text>
                    <Text style={styles.suggestPhone}>
                      {toBnDigits(c.phone)}
                    </Text>
                  </View>
                  {hasSavedMeasurements(c) && (
                    <Text style={styles.savedTag}>মাপ আছে</Text>
                  )}
                </Pressable>
              ))}
            </View>
          )}

          {customer && hasSavedMeasurements(customer) && (
            <View style={styles.noteRow}>
              <BadgeCheck size={15} color={colors.primary} strokeWidth={2} />
              <Text style={styles.notePrimary}>
                আগের মাপ আছে — এই কাস্টমারের সেভ করা মাপ পাওয়া গেছে
              </Text>
            </View>
          )}
          {customer && !hasSavedMeasurements(customer) && (
            <Text style={styles.noteMuted}>
              এই কাস্টমারের আগের মাপ নেই — মাপ প্রথমবার নেওয়া হচ্ছে
            </Text>
          )}
        </View>

        {/* ------------ পোশাক ------------ */}
        <Text style={styles.sectionTitle}>পোশাক</Text>
        <View style={styles.chipWrap}>
          {garmentDefs.map((g) => {
            const selected = garment === g.key;
            return (
              <Pressable
                key={g.key}
                onPress={() => setGarment(g.key)}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    selected && styles.chipLabelSelected,
                  ]}
                >
                  {g.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ------------ মাপ ------------ */}
        <Text style={styles.sectionTitle}>মাপ (ইঞ্চি)</Text>
        <View style={styles.panel}>
          <View style={styles.measureGrid}>
            {garmentDef(garment).fields.map((f) => (
              <View key={f.key} style={styles.measureCell}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <TextInput
                  style={[styles.input, inputBorder(`m-${f.key}`)]}
                  value={currentValues[f.key] ?? ''}
                  onChangeText={(v) => setFieldValue(f.key, v)}
                  onFocus={() => setFocused(`m-${f.key}`)}
                  onBlur={() => setFocused(null)}
                  placeholder="—"
                  placeholderTextColor={colors.textFaint}
                  keyboardType="decimal-pad"
                />
              </View>
            ))}
          </View>
          {seededFromSaved && (
            <View style={styles.noteRow}>
              <BadgeCheck size={15} color={colors.primary} strokeWidth={2} />
              <Text style={styles.notePrimary}>
                আগের মাপ বসানো হয়েছে — দরকার হলে বদলে নিন
              </Text>
            </View>
          )}
          <Text style={[styles.fieldLabel, styles.fieldGap]}>ডিজাইন নোট</Text>
          <TextInput
            style={[
              styles.input,
              styles.noteInput,
              inputBorder('designNote'),
            ]}
            value={designNote}
            onChangeText={setDesignNote}
            onFocus={() => setFocused('designNote')}
            onBlur={() => setFocused(null)}
            placeholder="যেমন: গলায় ছোট ব্যান্ড, সামনে সাদা বোতাম…"
            placeholderTextColor={colors.textFaint}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* ------------ ডেলিভারি ও বিল ------------ */}
        <Text style={styles.sectionTitle}>ডেলিভারি ও বিল</Text>
        <View style={styles.panel}>
          <Text style={styles.fieldLabel}>ডেলিভারি</Text>
          <View style={styles.chipWrapInPanel}>
            {deliveryOptions.map((opt) => {
              const selected = deliveryChoice === opt.key;
              return (
                <Pressable
                  key={String(opt.key)}
                  onPress={() => setDeliveryChoice(opt.key)}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text
                    style={[
                      styles.chipLabel,
                      selected && styles.chipLabelSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {deliveryChoice === 'custom' && (
            <TextInput
              style={[styles.input, styles.fieldGap, inputBorder('customDate')]}
              value={customDateText}
              onChangeText={setCustomDateText}
              onFocus={() => setFocused('customDate')}
              onBlur={() => setFocused(null)}
              placeholder="যেমন: ২৭ নভেম্বর"
              placeholderTextColor={colors.textFaint}
            />
          )}
          <Text style={styles.deliveryLine}>
            ডেলিভারি: {fullDateLabel(deliveryOffset)}
            {deliveryOffset === 0
              ? ' · আজ'
              : ` · ${toBnDigits(deliveryOffset)} দিন পর`}
          </Text>
          {deliveryChoice === 'custom' &&
            customDateText.trim() !== '' &&
            customOffset === null && (
              <Text style={styles.warnLine}>
                তারিখটি বোঝা যায়নি — ৭ দিন ধরা হলো
              </Text>
            )}

          <View style={styles.billGrid}>
            <View style={styles.measureCell}>
              <Text style={styles.fieldLabel}>মোট টাকা</Text>
              <TextInput
                style={[styles.input, inputBorder('total')]}
                value={totalText}
                onChangeText={setTotalText}
                onFocus={() => setFocused('total')}
                onBlur={() => setFocused(null)}
                placeholder="০"
                placeholderTextColor={colors.textFaint}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.measureCell}>
              <Text style={styles.fieldLabel}>জমা (অগ্রিম)</Text>
              <TextInput
                style={[styles.input, inputBorder('advance')]}
                value={advanceText}
                onChangeText={setAdvanceText}
                onFocus={() => setFocused('advance')}
                onBlur={() => setFocused(null)}
                placeholder="০"
                placeholderTextColor={colors.textFaint}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.dueRow}>
            <Text style={styles.dueLabel}>বকেয়া থাকবে</Text>
            <Text
              style={[
                styles.dueValue,
                { color: due > 0 ? colors.amber : colors.textSecondary },
              ]}
            >
              {takaBn(due)}
            </Text>
          </View>

          <Text style={[styles.fieldLabel, styles.fieldGap]}>
            কারিগর (ঐচ্ছিক)
          </Text>
          <View style={styles.chipWrapInPanel}>
            <Pressable
              onPress={() => setKarigarName(null)}
              style={[styles.chip, karigarName === null && styles.chipSelected]}
            >
              <Text
                style={[
                  styles.chipLabel,
                  karigarName === null && styles.chipLabelSelected,
                ]}
              >
                পরে ঠিক করব
              </Text>
            </Pressable>
            {karigars.map((k) => {
              const selected = karigarName === k.name;
              return (
                <Pressable
                  key={k.id}
                  onPress={() => setKarigarName(k.name)}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text
                    style={[
                      styles.chipLabel,
                      selected && styles.chipLabelSelected,
                    ]}
                  >
                    {k.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.footerSpace} />
      </ScrollView>

      {/* Footer — validation message + save */}
      <View style={styles.footer}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <PrimaryButton label="অর্ডার সেভ করুন" onPress={onSave} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.sm,
  },
  pressed: { opacity: 0.6 },
  headerTitle: { ...typography.screenTitle, color: colors.ink, flex: 1 },
  codeChip: {
    backgroundColor: colors.slateNeutralTint,
    borderRadius: radius.chip,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  codeText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.slate,
  },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.sm },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.ink,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  panel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.card,
    padding: spacing.md,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs + 2,
  },
  fieldGap: { marginTop: spacing.md },
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
  noteInput: {
    height: 76,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  suggestBox: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.control,
    overflow: 'hidden',
  },
  suggestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surface,
  },
  suggestDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  suggestMain: { flex: 1, gap: 1 },
  suggestName: { ...typography.bodySemiBold, color: colors.ink },
  suggestPhone: { ...typography.label, color: colors.textSecondary },
  savedTag: {
    ...typography.chip,
    color: colors.primary,
    backgroundColor: colors.primaryTint,
    borderRadius: radius.chip,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginTop: spacing.md,
  },
  notePrimary: { ...typography.label, color: colors.primary, flex: 1 },
  noteMuted: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chipWrapInPanel: {
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
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.ink,
  },
  chipLabelSelected: { color: '#FFFFFF' },
  measureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  measureCell: { flexBasis: '47%', flexGrow: 1 },
  billGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  deliveryLine: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  warnLine: {
    ...typography.label,
    color: colors.amber,
    marginTop: spacing.xs,
  },
  dueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  dueLabel: { ...typography.body, color: colors.ink },
  dueValue: { ...typography.statNumber },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    padding: spacing.md,
    gap: spacing.sm,
  },
  errorText: { ...typography.label, color: colors.danger },
  footerSpace: { height: spacing.lg },
});
