import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BackHeader,
  CustomerAvatar,
  SearchField,
} from '../src/components/CustomerBits';
import { LedgerPanel, LedgerRow } from '../src/components/LedgerRow';
import { customers, toBnDigits } from '../src/data/mock';
import { useKarigars } from '../src/store/karigars';
import { useOrders } from '../src/store/orders';
import { colors, spacing, typography } from '../src/theme';

const digitsOnly = (s: string) => s.replace(/[^0-9]/g, '');

/**
 * গ্লোবাল সার্চ (Package G) — one field over the whole shop book:
 * customers by name/phone, orders by code or customer name, karigars
 * by name. Results are grouped; each row goes to its detail screen.
 * Reached from the dashboard band's search button.
 */
export default function SearchScreen() {
  const router = useRouter();
  const orders = useOrders();
  const karigars = useKarigars();
  const [query, setQuery] = useState('');

  const q = query.trim();
  const qDigits = digitsOnly(q);
  const searching = q.length >= 2;

  const customerHits = searching
    ? customers.filter(
        (c) =>
          c.name.includes(q) ||
          (qDigits.length >= 2 && digitsOnly(c.phone).includes(qDigits)),
      )
    : [];
  const orderHits = searching
    ? orders.filter(
        (o) =>
          o.customerName.includes(q) ||
          o.code.toLowerCase().includes(q.toLowerCase()) ||
          (qDigits.length >= 2 && digitsOnly(o.code).includes(qDigits)),
      )
    : [];
  const karigarHits = searching
    ? karigars.filter((k) => k.name.includes(q))
    : [];

  const noResults =
    searching &&
    customerHits.length === 0 &&
    orderHits.length === 0 &&
    karigarHits.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="খুঁজুন" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder="নাম, মোবাইল বা অর্ডার কোড"
            prominent
          />

          {!searching && (
            <Text style={styles.hint}>
              কাস্টমারের নাম, মোবাইল নম্বর বা অর্ডার কোড লিখুন।
            </Text>
          )}

          {noResults && (
            <Text style={styles.hint}>কিছু পাওয়া যায়নি।</Text>
          )}

          {customerHits.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>কাস্টমার</Text>
              <LedgerPanel>
                {customerHits.map((c, i) => (
                  <Pressable
                    key={c.phone}
                    onPress={() =>
                      router.push({
                        pathname: '/customer/[phone]',
                        params: { phone: c.phone },
                      } as never)
                    }
                    style={({ pressed }) => [
                      styles.personRow,
                      i < customerHits.length - 1 && styles.divider,
                      pressed && styles.pressed,
                    ]}
                  >
                    <CustomerAvatar name={c.name} index={i} size={40} />
                    <View style={styles.personMain}>
                      <Text style={styles.personName} numberOfLines={1}>
                        {c.name}
                      </Text>
                      <Text style={styles.personMeta} numberOfLines={1}>
                        {toBnDigits(c.phone)}
                      </Text>
                    </View>
                    <ChevronRight
                      size={18}
                      color={colors.textFaint}
                      strokeWidth={2}
                    />
                  </Pressable>
                ))}
              </LedgerPanel>
            </>
          )}

          {orderHits.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>অর্ডার</Text>
              <LedgerPanel>
                {orderHits.map((o, i) => (
                  <LedgerRow
                    key={o.id}
                    status={o.status}
                    title={o.customerName}
                    meta={`${o.garment} · ${o.code}`}
                    last={i === orderHits.length - 1}
                    onPress={() =>
                      router.push({
                        pathname: '/order/[id]',
                        params: { id: o.id },
                      } as never)
                    }
                  />
                ))}
              </LedgerPanel>
            </>
          )}

          {karigarHits.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>কারিগর</Text>
              <LedgerPanel>
                {karigarHits.map((k, i) => (
                  <Pressable
                    key={k.id}
                    onPress={() =>
                      router.push({
                        pathname: '/karigar/[id]',
                        params: { id: k.id },
                      } as never)
                    }
                    style={({ pressed }) => [
                      styles.personRow,
                      i < karigarHits.length - 1 && styles.divider,
                      pressed && styles.pressed,
                    ]}
                  >
                    <CustomerAvatar name={k.name} index={i} size={40} />
                    <View style={styles.personMain}>
                      <Text style={styles.personName} numberOfLines={1}>
                        {k.name}
                      </Text>
                      <Text style={styles.personMeta} numberOfLines={1}>
                        {k.skill}
                      </Text>
                    </View>
                    <ChevronRight
                      size={18}
                      color={colors.textFaint}
                      strokeWidth={2}
                    />
                  </Pressable>
                ))}
              </LedgerPanel>
            </>
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
  hint: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginHorizontal: 2,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.ink,
    marginTop: spacing.lg,
    marginBottom: 7,
    marginHorizontal: 2,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 64,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  pressed: { backgroundColor: colors.background },
  personMain: { flex: 1, gap: 2 },
  personName: { ...typography.bodySemiBold, color: colors.ink },
  personMeta: { ...typography.label, color: colors.textSecondary },
  footerSpace: { height: spacing.lg },
});
