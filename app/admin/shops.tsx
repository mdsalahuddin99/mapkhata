import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AdminShopRow,
  AdminStatusLine,
  PlanChip,
  adminColumnStyle,
} from '../../src/components/AdminBits';
import { BackHeader, SearchField } from '../../src/components/CustomerBits';
import { LedgerPanel } from '../../src/components/LedgerRow';
import {
  AdminPlan,
  AdminShop,
  adminShops,
} from '../../src/data/admin';
import { toBnDigits } from '../../src/data/mock';
import { colors, fontFamily, radius, spacing, typography } from '../../src/theme';

type PlanFilter = 'all' | AdminPlan;

const filters: { key: PlanFilter; label: string }[] = [
  { key: 'all', label: 'সব' },
  { key: 'pro', label: 'প্রো' },
  { key: 'free', label: 'ফ্রি' },
  { key: 'trial', label: 'ট্রায়াল' },
];

const digitsOnly = (s: string) => s.replace(/[^0-9]/g, '');

/**
 * সব দোকান — the operator's shop directory (Package I): search by
 * name / district / phone, filter by plan, tap through to a shop's
 * detail page.
 */
export default function AdminShopsScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<PlanFilter>('all');

  const visible = useMemo(() => {
    const q = query.trim();
    const qDigits = digitsOnly(q);
    return adminShops.filter((shop) => {
      if (active !== 'all' && shop.plan !== active) return false;
      if (!q) return true;
      return (
        shop.name.includes(q) ||
        shop.district.includes(q) ||
        shop.owner.includes(q) ||
        (qDigits.length > 0 && digitsOnly(shop.phone).includes(qDigits))
      );
    });
  }, [query, active]);

  const openShop = (shop: AdminShop) =>
    router.push({
      pathname: '/admin/shop/[id]',
      params: { id: shop.id },
    } as never);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="সব দোকান" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <View style={adminColumnStyle}>
            <SearchField
              value={query}
              onChangeText={setQuery}
              placeholder="দোকান, জেলা বা মোবাইল নম্বর"
            />

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
                    style={[
                      styles.filterChip,
                      selected && styles.filterChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterLabel,
                        selected && styles.filterLabelSelected,
                      ]}
                    >
                      {f.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.sectionTitle}>
              {toBnDigits(visible.length)}টি দোকান
            </Text>

            {visible.length === 0 ? (
              <Text style={styles.empty}>কোনো দোকান পাওয়া যায়নি।</Text>
            ) : (
              <LedgerPanel>
                {visible.map((shop, i) => (
                  <AdminShopRow
                    key={shop.id}
                    shop={shop}
                    index={i}
                    last={i === visible.length - 1}
                    onPress={() => openShop(shop)}
                    right={
                      <>
                        <PlanChip plan={shop.plan} />
                        <AdminStatusLine shop={shop} />
                      </>
                    }
                  />
                ))}
              </LedgerPanel>
            )}

            <View style={styles.footerSpace} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.lg },
  chipScroll: { flexGrow: 0, marginTop: spacing.md },
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
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.ink,
    marginTop: spacing.md,
    marginBottom: 7,
    marginHorizontal: 2,
  },
  empty: { ...typography.body, color: colors.textSecondary },
  footerSpace: { height: spacing.lg },
});
