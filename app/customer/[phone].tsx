import { useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton, SecondaryButton } from '../../src/components/Buttons';
import { BackHeader } from '../../src/components/CustomerBits';
import { LedgerPanel, LedgerRow } from '../../src/components/LedgerRow';
import { SummaryPanel } from '../../src/components/SummaryPanel';
import {
  deliveryLabel,
  dueOf,
  findCustomerByPhone,
  garmentDefs,
  toBnDigits,
} from '../../src/data/mock';
import { useOrders } from '../../src/store/orders';
import {
  colors,
  fontFamily,
  formatTaka,
  radius,
  spacing,
  typography,
} from '../../src/theme';

const takaBn = (amount: number) => toBnDigits(formatTaka(amount));
const digitsOnly = (s: string) => s.replace(/[^0-9]/g, '');

/**
 * কাস্টমার বিস্তারিত — one customer's whole page in the khata: summary,
 * saved measurements per garment, and full order history from the store.
 * Keyed by phone (the stable customer key in the mock data). Reached
 * from the মাপ tab, the customer list, and বকেয়া rows.
 */
export default function CustomerDetailScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const orders = useOrders();

  const customer = phone ? findCustomerByPhone(phone) : undefined;

  const mine = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.status !== 'cancelled' &&
          phone &&
          digitsOnly(o.customerPhone) === digitsOnly(phone),
      ),
    [orders, phone],
  );

  const name = customer?.name ?? mine[0]?.customerName ?? 'কাস্টমার';
  const totalDue = mine.reduce((sum, o) => sum + dueOf(o), 0);
  const totalAdvance = mine.reduce((sum, o) => sum + o.advance, 0);

  const garments = garmentDefs
    .map((def) => ({ def, values: customer?.measurements[def.key] }))
    .filter((g) => g.values && Object.keys(g.values).length > 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title={name} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <SummaryPanel
            label="মোট বকেয়া"
            value={takaBn(totalDue)}
            valueColor={totalDue > 0 ? colors.amber : colors.ink}
            stats={[
              { value: phone ? toBnDigits(phone) : '', label: 'মোবাইল' },
              { value: `${toBnDigits(mine.length)}টি`, label: 'মোট অর্ডার' },
              { value: takaBn(totalAdvance), label: 'মোট জমা' },
            ]}
          />

          {/* ------------ মাপ ------------ */}
          <Text style={styles.sectionTitle}>মাপ</Text>
          {garments.length === 0 ? (
            <Text style={styles.empty}>কোনো মাপ সেভ নেই।</Text>
          ) : (
            garments.map(({ def, values }) => {
              const fields = def.fields.filter(
                (f) => values && values[f.key] !== undefined,
              );
              const pairs: (typeof fields)[] = [];
              for (let i = 0; i < fields.length; i += 2) {
                pairs.push(fields.slice(i, i + 2));
              }
              return (
                <View key={def.key} style={styles.panel}>
                  <View style={styles.panelHeader}>
                    <Text style={styles.panelTitle}>{def.label}</Text>
                    {/* Visual for now — prefilled edit flow is a later package. */}
                    <SecondaryButton compact label="মাপ সম্পাদনা" />
                  </View>
                  {pairs.map((pair, pi) => (
                    <View
                      key={pi}
                      style={[
                        styles.measureRow,
                        pi > 0 && styles.measureDivider,
                      ]}
                    >
                      {pair.map((f) => (
                        <View key={f.key} style={styles.measureCell}>
                          <Text style={styles.measureLabel}>{f.label}</Text>
                          <Text style={styles.measureValue}>
                            {toBnDigits(values?.[f.key] ?? '')}
                          </Text>
                        </View>
                      ))}
                      {pair.length === 1 && <View style={styles.measureCell} />}
                    </View>
                  ))}
                </View>
              );
            })
          )}

          {/* ------------ অর্ডার ইতিহাস ------------ */}
          <Text style={styles.sectionTitle}>অর্ডার ইতিহাস</Text>
          {mine.length === 0 ? (
            <Text style={styles.empty}>এখনো কোনো অর্ডার নেই।</Text>
          ) : (
            <LedgerPanel>
              {mine.map((order, i) => {
                const due = dueOf(order);
                return (
                  <LedgerRow
                    key={order.id}
                    status={order.status}
                    title={`${order.code} · ${order.garment}`}
                    meta={`ডেলিভারি ${deliveryLabel(order.deliveryInDays)}`}
                    rightValue={takaBn(order.total)}
                    rightLabel={due > 0 ? `বকেয়া ${takaBn(due)}` : 'পরিশোধ'}
                    last={i === mine.length - 1}
                  />
                );
              })}
            </LedgerPanel>
          )}

          {/* Visual for now — Package C builds the collection screen. */}
          {totalDue > 0 && (
            <View style={styles.collectWrap}>
              <PrimaryButton label="টাকা জমা নিন" />
            </View>
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
    marginTop: spacing.lg,
    marginBottom: 7,
    marginHorizontal: 2,
  },
  panel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  panelTitle: { ...typography.bodySemiBold, color: colors.ink },
  measureRow: { flexDirection: 'row', paddingVertical: 6 },
  measureDivider: { borderTopWidth: 1, borderTopColor: colors.hairline },
  measureCell: { flex: 1, gap: 1 },
  measureLabel: { ...typography.label, color: colors.textSecondary },
  measureValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.ink,
  },
  collectWrap: { marginTop: spacing.lg },
  empty: { ...typography.body, color: colors.textSecondary },
  footerSpace: { height: spacing.lg },
});
