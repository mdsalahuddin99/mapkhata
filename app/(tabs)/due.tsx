import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
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
import { LedgerPanel } from '../../src/components/LedgerRow';
import { SummaryPanel } from '../../src/components/SummaryPanel';
import { WhiteHeader } from '../../src/components/WhiteHeader';
import {
  dashboardStats,
  deliveryLabel,
  dueOf,
  fullDateLabel,
  Order,
  toBnDigits,
} from '../../src/data/mock';
import { useOrders, useSessionCollections } from '../../src/store/orders';
import {
  colors,
  controlHeight,
  fontFamily,
  formatTaka,
  radius,
  spacing,
  typography,
} from '../../src/theme';

/** Amounts on this screen use Bengali digits (prototype v4). */
const takaBn = (amount: number) => toBnDigits(formatTaka(amount));

const digitsOnly = (s: string) => s.replace(/[^0-9]/g, '');

function metaOf(order: Order): string {
  if (order.dueNote) return `${order.garment} · ${order.dueNote}`;
  if (order.deliveryInDays < 0) {
    return `${order.garment} · ডেলিভারি ${fullDateLabel(order.deliveryInDays)}`;
  }
  return `${order.garment} · ডেলিভারি ${deliveryLabel(order.deliveryInDays)}`;
}

function ageOf(order: Order): string {
  if (order.deliveryInDays < 0) {
    return `${toBnDigits(-order.deliveryInDays)} দিন`;
  }
  return deliveryLabel(order.deliveryInDays);
}

export default function DueScreen() {
  const router = useRouter();
  const orders = useOrders();
  const sessionCollected = useSessionCollections();
  const [query, setQuery] = useState('');

  // Package C: the বকেয়া book now derives from the live orders store
  // (same derivations the static mock constants used), so a collection
  // taken on the টাকা জমা screen shrinks this list and the totals at once.
  const { entries, stats } = useMemo(() => {
    const list = orders
      .filter((o) => o.status !== 'cancelled' && dueOf(o) > 0)
      .sort((a, b) => a.deliveryInDays - b.deliveryInDays);
    return {
      entries: list,
      stats: {
        totalDue: list.reduce((sum, o) => sum + dueOf(o), 0),
        customerCount: new Set(list.map((o) => o.customerName)).size,
        over30Due: list
          .filter((o) => o.deliveryInDays < -30)
          .reduce((sum, o) => sum + dueOf(o), 0),
        todayCollection: dashboardStats.todayCollection + sessionCollected,
      },
    };
  }, [orders, sessionCollected]);

  const visible = useMemo(() => {
    const q = query.trim();
    if (!q) return entries;
    const qDigits = digitsOnly(q);
    return entries.filter(
      (o) =>
        o.customerName.includes(q) ||
        (qDigits.length > 0 && digitsOnly(o.customerPhone).includes(qDigits)),
    );
  }, [query, entries]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <WhiteHeader title="বকেয়া" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <SummaryPanel
            label="মোট বকেয়া"
            value={takaBn(stats.totalDue)}
            valueColor={colors.amber}
            stats={[
              { value: `${toBnDigits(stats.customerCount)} জন`, label: 'কাস্টমারের কাছে' },
              { value: takaBn(stats.over30Due), label: '৩০ দিনের বেশি পুরনো' },
              { value: takaBn(stats.todayCollection), label: 'আজ আদায়' },
            ]}
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

          <Text style={styles.sectionTitle}>সবচেয়ে পুরনো আগে</Text>

          {visible.length === 0 ? (
            <Text style={styles.empty}>কোনো বকেয়া পাওয়া যায়নি।</Text>
          ) : (
            <LedgerPanel>
              {visible.map((order, i) => (
                <Pressable
                  key={order.id}
                  onPress={() =>
                    router.push({
                      pathname: '/customer/[phone]',
                      params: { phone: order.customerPhone },
                    } as never)
                  }
                  style={({ pressed }) => [
                    styles.row,
                    i < visible.length - 1 && styles.divider,
                    pressed && styles.rowPressed,
                  ]}
                >
                  <View style={styles.main}>
                    <Text style={styles.name} numberOfLines={1}>
                      {order.customerName}
                    </Text>
                    <Text style={styles.meta} numberOfLines={1}>
                      {metaOf(order)}
                    </Text>
                  </View>
                  <View style={styles.right}>
                    <Text style={styles.amount}>{takaBn(dueOf(order))}</Text>
                    <Text style={styles.age}>{ageOf(order)}</Text>
                  </View>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push({
                        pathname: '/collect/[id]',
                        params: { id: order.id },
                      } as never);
                    }}
                    style={({ pressed }) => [
                      styles.payButton,
                      pressed && styles.payButtonPressed,
                    ]}
                  >
                    <Text style={styles.payLabel}>জমা নিন</Text>
                  </Pressable>
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
    marginTop: 10,
  },
  searchInput: {
    ...typography.body,
    flex: 1,
    color: colors.ink,
    padding: 0,
  },
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
    minHeight: 58,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  rowPressed: { backgroundColor: colors.background },
  main: { flex: 1, gap: 2 },
  name: { ...typography.bodySemiBold, color: colors.ink },
  meta: { ...typography.label, color: colors.textSecondary },
  right: { alignItems: 'flex-end', gap: 1 },
  amount: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.amber,
  },
  age: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    lineHeight: 14,
    color: colors.textFaint,
  },
  payButton: {
    marginLeft: spacing.sm + 1,
    height: 32,
    borderRadius: radius.control,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonPressed: { backgroundColor: colors.primaryPressed },
  payLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.onPrimary,
  },
  empty: { ...typography.body, color: colors.textSecondary },
  footerSpace: { height: spacing.lg },
});
