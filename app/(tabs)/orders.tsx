import { Plus, Search } from 'lucide-react-native';
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
import { PrimaryButton } from '../../src/components/Buttons';
import { LedgerPanel, LedgerRow } from '../../src/components/LedgerRow';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { deliveryLabel, orders, toBnDigits } from '../../src/data/mock';
import {
  colors,
  controlHeight,
  fontFamily,
  formatTaka,
  OrderStatusKey,
  radius,
  spacing,
  typography,
} from '../../src/theme';

type FilterKey = 'all' | OrderStatusKey;

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'সব' },
  { key: 'ready', label: 'রেডি' },
  { key: 'sewing', label: 'সেলাই' },
  { key: 'cutting', label: 'কাটিং' },
  { key: 'measured', label: 'মাপ নেওয়া' },
];

const digitsOnly = (s: string) => s.replace(/[^0-9]/g, '');

export default function OrdersScreen() {
  const [active, setActive] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim();
    const qDigits = digitsOnly(q);
    return orders.filter((o) => {
      if (o.status === 'cancelled') return false;
      if (active !== 'all' && o.status !== active) return false;
      if (!q) return true;
      return (
        o.customerName.includes(q) ||
        o.code.toLowerCase().includes(q.toLowerCase()) ||
        (qDigits.length > 0 && digitsOnly(o.customerPhone).includes(qDigits))
      );
    });
  }, [active, query]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <ScreenHeader
          title="অর্ডার"
          subtitle={`মোট ${toBnDigits(visible.length)}টি অর্ডার`}
          action={
            <PrimaryButton
              compact
              label="নতুন অর্ডার"
              icon={<Plus size={18} color="#FFFFFF" strokeWidth={2.2} />}
            />
          }
        />

        <View style={styles.searchField}>
          <Search size={18} color={colors.textFaint} strokeWidth={1.8} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="নাম বা মোবাইল নম্বর"
            placeholderTextColor={colors.textFaint}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipRow}
        >
          {filters.map((f) => {
            const selected = active === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setActive(f.key)}
                style={[styles.filterChip, selected && styles.filterChipSelected]}
              >
                <Text style={[styles.filterLabel, selected && styles.filterLabelSelected]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {visible.length === 0 ? (
          <Text style={styles.empty}>
            {query.trim()
              ? 'কোনো অর্ডার পাওয়া যায়নি।'
              : 'এই অবস্থায় কোনো অর্ডার নেই।'}
          </Text>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <LedgerPanel>
              {visible.map((order, i) => (
                <LedgerRow
                  key={order.id}
                  status={order.status}
                  title={order.customerName}
                  meta={`${order.garment} · ${
                    order.deliveryInDays === 0
                      ? 'ডেলিভারি আজ'
                      : deliveryLabel(order.deliveryInDays)
                  }`}
                  chipInMeta={false}
                  rightValue={toBnDigits(formatTaka(order.total))}
                  last={i === visible.length - 1}
                />
              ))}
            </LedgerPanel>
            <View style={styles.footerSpace} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.lg, paddingBottom: 0 },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: controlHeight,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.control,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchInput: {
    ...typography.body,
    flex: 1,
    color: colors.ink,
    padding: 0,
  },
  chipScroll: { flexGrow: 0, marginBottom: spacing.md },
  chipRow: { gap: spacing.sm, paddingRight: spacing.sm },
  filterChip: {
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.ink,
  },
  filterLabelSelected: { color: '#FFFFFF' },
  empty: { ...typography.body, color: colors.textSecondary },
  footerSpace: { height: spacing.lg },
});
