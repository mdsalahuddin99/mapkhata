import {
  MessageSquare,
  Sparkles,
  Truck,
  Users,
  Wallet,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackHeader } from '../src/components/CustomerBits';
import { LedgerPanel } from '../src/components/LedgerRow';
import { dueOf, toBnDigits } from '../src/data/mock';
import { karigarSummary, useKarigars } from '../src/store/karigars';
import { useOrders } from '../src/store/orders';
import {
  colors,
  formatTaka,
  spacing,
  statusMeta,
  typography,
} from '../src/theme';

const takaBn = (amount: number) => toBnDigits(formatTaka(amount));

interface NoticeItem {
  key: string;
  tint: string;
  icon: React.ReactNode;
  title: string;
  meta: string;
  time: string;
}

const ICON_SIZE = 18;
const ICON_STROKE = 1.9;

/**
 * নোটিফিকেশন (Package G) — derived live where the data allows:
 * today's deliveries from the orders store, dues older than 30 days,
 * and the karigar wage-due summary; plus two seeded system items
 * (low SMS balance, new feature). The first two rows carry an unread
 * dot until "সব পড়া হয়েছে" is tapped (local state).
 */
export default function NotificationsScreen() {
  const orders = useOrders();
  const karigars = useKarigars();
  const [readAll, setReadAll] = useState(false);

  const items: NoticeItem[] = [];

  orders
    .filter(
      (o) =>
        o.deliveryInDays === 0 &&
        o.status !== 'cancelled' &&
        o.status !== 'delivered',
    )
    .forEach((o) => {
      items.push({
        key: `delivery-${o.id}`,
        tint: colors.primaryTint,
        icon: <Truck size={ICON_SIZE} color={colors.primary} strokeWidth={ICON_STROKE} />,
        title: `আজ ডেলিভারি: ${o.customerName} — ${o.garment}`,
        meta: `${o.code} · ${statusMeta[o.status].label}`,
        time: 'আজ সকাল',
      });
    });

  orders
    .filter((o) => o.status !== 'cancelled' && dueOf(o) > 0 && o.deliveryInDays < -30)
    .forEach((o) => {
      items.push({
        key: `due-${o.id}`,
        tint: colors.amberTint,
        icon: <Wallet size={ICON_SIZE} color={colors.amber} strokeWidth={ICON_STROKE} />,
        title: `পুরনো বকেয়া: ${o.customerName}`,
        meta: `${takaBn(dueOf(o))} · ${toBnDigits(-o.deliveryInDays)} দিন ধরে বাকি`,
        time: 'গতকাল',
      });
    });

  const kSummary = karigarSummary(karigars);
  if (kSummary.totalWageDue > 0) {
    items.push({
      key: 'karigar-due',
      tint: colors.mustardTint,
      icon: <Users size={ICON_SIZE} color={colors.mustard} strokeWidth={ICON_STROKE} />,
      title: 'কারিগরদের পাওনা বাকি',
      meta: `মোট ${takaBn(kSummary.totalWageDue)} · ${toBnDigits(kSummary.karigarCount)} জন কারিগর`,
      time: 'গতকাল',
    });
  }

  items.push(
    {
      key: 'system-sms',
      tint: colors.slateNeutralTint,
      icon: (
        <MessageSquare size={ICON_SIZE} color={colors.slate} strokeWidth={ICON_STROKE} />
      ),
      title: 'SMS ব্যালেন্স কম',
      meta: `মাত্র ${toBnDigits(120)}টি SMS আছে — প্যাক কিনে রাখুন`,
      time: `${toBnDigits(2)} দিন আগে`,
    },
    {
      key: 'system-feature',
      tint: colors.slateTint,
      icon: (
        <Sparkles size={ICON_SIZE} color={colors.slateBlue} strokeWidth={ICON_STROKE} />
      ),
      title: 'নতুন ফিচার',
      meta: 'রসিদে এখন অর্ডারের ট্র্যাকিং কোড থাকে',
      time: `${toBnDigits(3)} দিন আগে`,
    },
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="নোটিফিকেশন" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          {!readAll && items.length > 0 && (
            <Pressable
              onPress={() => setReadAll(true)}
              style={({ pressed }) => [
                styles.markRead,
                pressed && styles.pressed,
              ]}
              accessibilityLabel="সব পড়া হয়েছে"
            >
              <Text style={styles.markReadText}>সব পড়া হয়েছে</Text>
            </Pressable>
          )}

          {items.length === 0 ? (
            <Text style={styles.empty}>কোনো নোটিফিকেশন নেই।</Text>
          ) : (
            <LedgerPanel>
              {items.map((item, i) => (
                <View
                  key={item.key}
                  style={[styles.row, i < items.length - 1 && styles.divider]}
                >
                  <View
                    style={[styles.iconCircle, { backgroundColor: item.tint }]}
                  >
                    {item.icon}
                  </View>
                  <View style={styles.rowMain}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.rowMeta} numberOfLines={1}>
                      {item.meta}
                    </Text>
                  </View>
                  <View style={styles.rowRight}>
                    <Text style={styles.time}>{item.time}</Text>
                    {!readAll && i < 2 && <View style={styles.unreadDot} />}
                  </View>
                </View>
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
  markRead: {
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  pressed: { opacity: 0.6 },
  markReadText: { ...typography.label, color: colors.primary },
  empty: {
    ...typography.body,
    color: colors.textSecondary,
    marginHorizontal: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 64,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowMain: { flex: 1, gap: 2 },
  rowTitle: { ...typography.bodySemiBold, color: colors.ink },
  rowMeta: { ...typography.label, color: colors.textSecondary },
  rowRight: { alignItems: 'flex-end', gap: 6 },
  time: { ...typography.chip, color: colors.textFaint },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  footerSpace: { height: spacing.lg },
});
