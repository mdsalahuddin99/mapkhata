import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SecondaryButton } from '../../../src/components/Buttons';
import { BackHeader } from '../../../src/components/CustomerBits';
import { ReceiptCard } from '../../../src/components/ReceiptCard';
import { useOrders } from '../../../src/store/orders';
import { colors, spacing, typography } from '../../../src/theme';

/**
 * রসিদ — in-app receipt screen. The card itself is the shared
 * ReceiptCard (also used by the public /r/[code] page, Package H).
 * The শেয়ার button is visual for now (native share wiring is a
 * later package).
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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="রসিদ" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <ReceiptCard order={order} />

          {/* Visual for now — native share wiring is a later package. */}
          <View style={styles.shareWrap}>
            <SecondaryButton label="শেয়ার" />
          </View>

          <Text style={styles.publicLink}>
            কাস্টমারের রসিদ লিঙ্ক: /r/{order.code}
          </Text>

          <View style={styles.footerSpace} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.md },
  shareWrap: { marginTop: spacing.md },
  publicLink: {
    ...typography.label,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  empty: { ...typography.body, color: colors.textSecondary, padding: spacing.lg },
  footerSpace: { height: spacing.lg },
});
