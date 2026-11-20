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
  BackHeader,
  CustomerAvatar,
  SearchField,
} from '../src/components/CustomerBits';
import { LedgerPanel } from '../src/components/LedgerRow';
import {
  Customer,
  customers,
  dueOf,
  toBnDigits,
} from '../src/data/mock';
import { useOrders } from '../src/store/orders';
import { colors, fontFamily, formatTaka, spacing, typography } from '../src/theme';

const takaBn = (amount: number) => toBnDigits(formatTaka(amount));
const digitsOnly = (s: string) => s.replace(/[^0-9]/g, '');

/**
 * কাস্টমার তালিকা — every customer of the shop (stack screen, reached
 * from the dashboard grid). Right side shows the customer's total due in
 * amber when they owe anything, otherwise their order count. Due and
 * counts derive live from the orders store, matched by phone.
 *
 * Note: customers stay mock for now — someone added through the নতুন
 * অর্ডার form appears in Orders immediately, but joins this list only
 * when a real customers store replaces the mock list.
 */
export default function CustomersScreen() {
  const router = useRouter();
  const orders = useOrders();
  const [query, setQuery] = useState('');

  const rows = useMemo(
    () =>
      customers.map((customer, index) => {
        const mine = orders.filter(
          (o) =>
            o.status !== 'cancelled' &&
            digitsOnly(o.customerPhone) === digitsOnly(customer.phone),
        );
        return {
          customer,
          index,
          orderCount: mine.length,
          totalDue: mine.reduce((sum, o) => sum + dueOf(o), 0),
        };
      }),
    [orders],
  );

  const visible = useMemo(() => {
    const q = query.trim();
    if (!q) return rows;
    const qDigits = digitsOnly(q);
    return rows.filter(
      (r) =>
        r.customer.name.includes(q) ||
        (qDigits.length > 0 && digitsOnly(r.customer.phone).includes(qDigits)),
    );
  }, [rows, query]);

  const openCustomer = (customer: Customer) =>
    router.push({
      pathname: '/customer/[phone]',
      params: { phone: customer.phone },
    } as never);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="কাস্টমার" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <SearchField value={query} onChangeText={setQuery} />

          <Text style={styles.sectionTitle}>
            সব কাস্টমার — {toBnDigits(visible.length)} জন
          </Text>

          {visible.length === 0 ? (
            <Text style={styles.empty}>কোনো কাস্টমার পাওয়া যায়নি।</Text>
          ) : (
            <LedgerPanel>
              {visible.map((row, i) => (
                <Pressable
                  key={row.customer.phone}
                  onPress={() => openCustomer(row.customer)}
                  style={({ pressed }) => [
                    styles.row,
                    i < visible.length - 1 && styles.divider,
                    pressed && styles.pressed,
                  ]}
                >
                  <CustomerAvatar name={row.customer.name} index={row.index} />
                  <View style={styles.main}>
                    <Text style={styles.name} numberOfLines={1}>
                      {row.customer.name}
                    </Text>
                    <Text style={styles.meta} numberOfLines={1}>
                      {toBnDigits(row.customer.phone)}
                    </Text>
                  </View>
                  <View style={styles.right}>
                    {row.totalDue > 0 ? (
                      <>
                        <Text style={styles.dueAmount}>
                          {takaBn(row.totalDue)}
                        </Text>
                        <Text style={styles.rightLabel}>বকেয়া</Text>
                      </>
                    ) : (
                      <Text style={styles.orderCount}>
                        {row.orderCount > 0
                          ? `${toBnDigits(row.orderCount)}টি অর্ডার`
                          : 'নতুন কাস্টমার'}
                      </Text>
                    )}
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
  right: { alignItems: 'flex-end', gap: 1 },
  dueAmount: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.amber,
  },
  rightLabel: { ...typography.label, color: colors.textFaint },
  orderCount: { ...typography.bodySemiBold, color: colors.textSecondary },
  empty: { ...typography.body, color: colors.textSecondary },
  footerSpace: { height: spacing.lg },
});
