import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SecondaryButton } from '../../../src/components/Buttons';
import { BackHeader } from '../../../src/components/CustomerBits';
import {
  dueOf,
  fullDateLabel,
  shop,
  todayLabel,
  toBnDigits,
} from '../../../src/data/mock';
import { useOrders } from '../../../src/store/orders';
import {
  colors,
  fontFamily,
  formatTaka,
  radius,
  spacing,
  typography,
} from '../../../src/theme';

const takaBn = (amount: number) => toBnDigits(formatTaka(amount));

function BillLine({
  label,
  value,
  bold,
  amber,
  last,
}: {
  label: string;
  value: string;
  bold?: boolean;
  amber?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.billRow, !last && styles.billDivider]}>
      <Text style={[styles.billLabel, bold && styles.billBold]}>{label}</Text>
      <Text
        style={[
          styles.billValue,
          bold && styles.billBold,
          amber && { color: colors.amber },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

/**
 * রসিদ — a clean printable-style receipt card for one order. The শেয়ার
 * button is visual for now (native share wiring is a later package);
 * Package H adds the public tracking page behind the code at the bottom.
 */
export default function ReceiptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orders = useOrders();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <BackHeader title="রসিদ" />
        <Text style={styles.empty}>অর্ডারটি পাওয়া যায়নি।</Text>
      </SafeAreaView>
    );
  }

  const due = dueOf(order);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="রসিদ" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <View style={styles.card}>
            {/* দোকান */}
            <Text style={styles.shopName}>{shop.name}</Text>
            <Text style={styles.shopMeta}>{shop.area}</Text>
            <Text style={styles.shopMeta}>{toBnDigits(shop.phone)}</Text>

            <View style={styles.divider} />

            {/* রসিদ তথ্য */}
            <BillLine label="রসিদ নং" value={order.code} />
            <BillLine label="তারিখ" value={todayLabel()} last />

            <View style={styles.divider} />

            <BillLine label="কাস্টমার" value={order.customerName} />
            <BillLine
              label="মোবাইল"
              value={toBnDigits(order.customerPhone)}
            />
            <BillLine label="পোশাক" value={order.garment} />
            <BillLine
              label="ডেলিভারি"
              value={fullDateLabel(order.deliveryInDays)}
              last
            />

            <View style={styles.divider} />

            {/* বিল */}
            <BillLine label="মোট টাকা" value={takaBn(order.total)} />
            <BillLine label="জমা" value={takaBn(order.advance)} />
            <BillLine
              label="বকেয়া"
              value={takaBn(due)}
              bold
              amber={due > 0}
              last
            />

            <Text style={styles.thanks}>ধন্যবাদ! আবার আসবেন।</Text>

            {/* ট্র্যাকিং কোড */}
            <View style={styles.trackingBox}>
              <Text style={styles.trackingLabel}>
                অর্ডারের অবস্থা জানতে এই কোডটি রাখুন
              </Text>
              <Text style={styles.trackingCode}>{order.code}</Text>
            </View>
          </View>

          {/* Visual for now — native share wiring is a later package. */}
          <View style={styles.shareWrap}>
            <SecondaryButton label="শেয়ার" />
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
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  shopName: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.ink,
    textAlign: 'center',
  },
  shopMeta: {
    ...typography.label,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 1,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    marginVertical: spacing.md,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    gap: spacing.md,
  },
  billDivider: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  billLabel: { ...typography.body, color: colors.textSecondary },
  billValue: { ...typography.bodySemiBold, color: colors.ink },
  billBold: { fontFamily: fontFamily.bold, fontSize: 15 },
  thanks: {
    ...typography.bodySemiBold,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  trackingBox: {
    backgroundColor: colors.primaryTint,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: 2,
    marginTop: spacing.md,
  },
  trackingLabel: { ...typography.label, color: colors.primary },
  trackingCode: {
    fontFamily: fontFamily.bold,
    fontSize: 17,
    lineHeight: 22,
    color: colors.primary,
  },
  shareWrap: { marginTop: spacing.md },
  empty: { ...typography.body, color: colors.textSecondary, padding: spacing.lg },
  footerSpace: { height: spacing.lg },
});
