import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionGrid } from '../../src/components/ActionGrid';
import { BandHeader } from '../../src/components/BandHeader';
import { LedgerPanel, LedgerRow } from '../../src/components/LedgerRow';
import { MiniStatStrip } from '../../src/components/MiniStatStrip';
import {
  dashboardStats,
  deliveryLabel,
  dueOf,
  shop,
  toBnDigits,
} from '../../src/data/mock';
import { useOrders, useSessionCollections } from '../../src/store/orders';
import { colors, formatTaka, radius, spacing, typography } from '../../src/theme';

/** Amounts on this screen use Bengali digits, balance-style (prototype v1.1). */
const takaBn = (amount: number) => toBnDigits(formatTaka(amount));

export default function DashboardScreen() {
  const router = useRouter();
  const orders = useOrders();
  const sessionCollected = useSessionCollections();
  const openOrder = (orderId: string) =>
    router.push({
      pathname: '/order/[id]',
      params: { id: orderId },
    } as never);
  const active = orders.filter((o) => o.status !== 'cancelled');
  const todayOrders = active.filter((o) => o.deliveryInDays === 0);
  const upcomingByDay = [1, 2, 3]
    .map((offset) => ({
      offset,
      list: active.filter((o) => o.deliveryInDays === offset),
    }))
    .filter((group) => group.list.length > 0);
  const dueCustomerCount = new Set(
    active.filter((o) => dueOf(o) > 0).map((o) => o.customerName),
  ).size;
  // Stats recomputed from the live store list (same derivations as
  // mock.dashboardStats) so a newly added order moves the numbers at once.
  // আজকের আদায় = the shared mock constant + this session's collections
  // taken through the টাকা জমা screen (Package C store counter).
  const stats = {
    todayDeliveries: active.filter((o) => o.deliveryInDays === 0).length,
    runningOrders: active.filter(
      (o) => o.status !== 'delivered',
    ).length,
    totalDue: active.reduce((sum, o) => sum + dueOf(o), 0),
    todayCollection: dashboardStats.todayCollection + sessionCollected,
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BandHeader
          shopName={shop.name}
          shopSub={shop.area}
          avatarInitial={shop.name.charAt(0)}
          balanceLabel={`মোট বকেয়া (${toBnDigits(dueCustomerCount)} জন)`}
          balanceValue={takaBn(stats.totalDue)}
          sideLabel="আজকের আদায়"
          sideValue={takaBn(stats.todayCollection)}
        />

        {/* v1.2 white sheet over the band: 12px top corners, overlaps by 10px */}
        <View style={styles.sheet}>
          <ActionGrid />
        </View>

        <View style={styles.body}>
          <MiniStatStrip
            stats={[
              {
                value: `${toBnDigits(stats.todayDeliveries)}টি`,
                label: 'আজকের ডেলিভারি',
              },
              {
                value: `${toBnDigits(stats.runningOrders)}টি`,
                label: 'চলমান অর্ডার',
              },
              { value: takaBn(stats.totalDue), label: 'মোট বকেয়া' },
            ]}
          />

          {todayOrders.length > 0 && (
            <>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitleInRow}>আজকের ডেলিভারি</Text>
                <Text style={styles.sectionLink}>সব দেখুন</Text>
              </View>
              <LedgerPanel>
                {todayOrders.map((order, i) => (
                  <LedgerRow
                    key={order.id}
                    status={order.status}
                    title={order.customerName}
                    meta={`${order.garment} · ${order.code}`}
                    chipInMeta={false}
                    rightChip
                    last={i === todayOrders.length - 1}
                    onPress={() => openOrder(order.id)}
                  />
                ))}
              </LedgerPanel>
            </>
          )}

          {upcomingByDay.map((group) => (
            <View key={group.offset}>
              <Text style={styles.sectionTitle}>
                {deliveryLabel(group.offset)}
              </Text>
              <LedgerPanel>
                {group.list.map((order, i) => (
                  <LedgerRow
                    key={order.id}
                    status={order.status}
                    title={order.customerName}
                    meta={`${order.garment} · ${order.code}`}
                    chipInMeta={false}
                    rightValue={takaBn(order.total)}
                    last={i === group.list.length - 1}
                    onPress={() => openOrder(order.id)}
                  />
                ))}
              </LedgerPanel>
            </View>
          ))}

          <View style={styles.footerSpace} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  sheet: {
    marginTop: -10,
    borderTopLeftRadius: radius.sheetTop,
    borderTopRightRadius: radius.sheetTop,
    overflow: 'hidden',
  },
  body: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.ink,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitleInRow: { ...typography.sectionTitle, color: colors.ink },
  sectionLink: { ...typography.label, color: colors.primary },
  footerSpace: { height: spacing.lg },
});
