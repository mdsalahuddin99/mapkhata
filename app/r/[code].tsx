import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../src/components/Buttons';
import { ReceiptCard } from '../../src/components/ReceiptCard';
import { useOrders } from '../../src/store/orders';
import { colors, fontFamily, radius, spacing, typography } from '../../src/theme';

/**
 * পাবলিক রসিদ — /r/[code]. The customer opens this from an SMS/WhatsApp
 * link: no login, no tab bar. Same ReceiptCard as the in-app রসিদ,
 * plus a button into the public tracking page. Only this order's own
 * data is on the card.
 */
export default function PublicReceiptScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const orders = useOrders();
  const order = orders.find(
    (o) => o.code.toUpperCase() === (code ?? '').trim().toUpperCase(),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <View style={styles.column}>
            {!order ? (
              <View style={styles.notFoundPanel}>
                <Text style={styles.notFoundTitle}>রসিদ পাওয়া যায়নি</Text>
                <Text style={styles.notFoundText}>
                  এই কোডে কোনো অর্ডার পাওয়া যায়নি — কোডটি আবার দেখে নিন।
                </Text>
              </View>
            ) : (
              <>
                <ReceiptCard order={order} />
                <PrimaryButton
                  label="অর্ডারের অবস্থা দেখুন"
                  onPress={() =>
                    router.push({
                      pathname: '/track/[code]',
                      params: { code: order.code },
                    } as never)
                  }
                />
              </>
            )}
            <Text style={styles.footer}>MapKhata দিয়ে তৈরি</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.md, alignItems: 'center' },
  column: { width: '100%', maxWidth: 480, gap: spacing.md },
  notFoundPanel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  notFoundTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.ink,
    textAlign: 'center',
  },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  footer: {
    ...typography.label,
    color: colors.textFaint,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});
