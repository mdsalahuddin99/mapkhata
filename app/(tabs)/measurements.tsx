import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CustomerAvatar,
  SearchField,
} from '../../src/components/CustomerBits';
import { LedgerPanel } from '../../src/components/LedgerRow';
import { WhiteHeader } from '../../src/components/WhiteHeader';
import {
  Customer,
  customers,
  garmentDefs,
  hasSavedMeasurements,
  toBnDigits,
} from '../../src/data/mock';
import { colors, spacing, typography } from '../../src/theme';

const digitsOnly = (s: string) => s.replace(/[^0-9]/g, '');

/** "পাঞ্জাবি, শার্ট" — the garments this customer has saved measurements for. */
function garmentLabelsOf(customer: Customer): string {
  return garmentDefs
    .filter((def) => {
      const m = customer.measurements[def.key];
      return m && Object.keys(m).length > 0;
    })
    .map((def) => def.label)
    .join(', ');
}

/**
 * মাপের খাতা — the digital measurement book. The screen's one main job is
 * finding a customer's saved measurements fast (name or phone), like
 * flipping to a page in the paper khata. Only customers who HAVE saved
 * measurements appear here; everyone else lives on the customer list.
 */
export default function MeasurementsScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const entries = useMemo(
    () =>
      customers
        .map((customer, index) => ({ customer, index }))
        .filter((e) => hasSavedMeasurements(e.customer)),
    [],
  );

  const visible = useMemo(() => {
    const q = query.trim();
    if (!q) return entries;
    const qDigits = digitsOnly(q);
    return entries.filter(
      (e) =>
        e.customer.name.includes(q) ||
        (qDigits.length > 0 && digitsOnly(e.customer.phone).includes(qDigits)),
    );
  }, [entries, query]);

  const openCustomer = (customer: Customer) =>
    router.push({
      pathname: '/customer/[phone]',
      params: { phone: customer.phone },
    } as never);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <WhiteHeader title="মাপের খাতা" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <SearchField value={query} onChangeText={setQuery} prominent />

          <Text style={styles.sectionTitle}>
            মাপ সেভ আছে — {toBnDigits(visible.length)} জন
          </Text>

          {visible.length === 0 ? (
            <Text style={styles.empty}>
              এই নামে বা নম্বরে কারো মাপ পাওয়া যায়নি।
            </Text>
          ) : (
            <LedgerPanel>
              {visible.map(({ customer, index }, i) => (
                <Pressable
                  key={customer.phone}
                  onPress={() => openCustomer(customer)}
                  style={({ pressed }) => [
                    styles.row,
                    i < visible.length - 1 && styles.divider,
                    pressed && styles.pressed,
                  ]}
                >
                  <CustomerAvatar name={customer.name} index={index} />
                  <View style={styles.main}>
                    <Text style={styles.name} numberOfLines={1}>
                      {customer.name}
                    </Text>
                    <Text style={styles.meta} numberOfLines={1}>
                      {toBnDigits(customer.phone)} · {garmentLabelsOf(customer)}
                    </Text>
                  </View>
                  <ChevronRight
                    size={18}
                    color={colors.textFaint}
                    strokeWidth={1.8}
                  />
                </Pressable>
              ))}
            </LedgerPanel>
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
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.ink,
    marginTop: spacing.md,
    marginBottom: 7,
    marginHorizontal: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 64,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  pressed: { backgroundColor: colors.background },
  main: { flex: 1, gap: 2 },
  name: { ...typography.bodySemiBold, color: colors.ink },
  meta: { ...typography.label, color: colors.textSecondary },
  empty: { ...typography.body, color: colors.textSecondary },
  footerSpace: { height: spacing.lg },
});
