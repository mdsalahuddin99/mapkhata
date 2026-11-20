import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackHeader } from '../src/components/CustomerBits';
import { LedgerPanel } from '../src/components/LedgerRow';
import { SummaryPanel } from '../src/components/SummaryPanel';
import {
  dashboardStats,
  dateFromOffset,
  dueOf,
  Order,
  toBnDigits,
} from '../src/data/mock';
import {
  karigarSummary,
  karigarTotals,
  useKarigars,
} from '../src/store/karigars';
import { useOrders, useSessionCollections } from '../src/store/orders';
import {
  colors,
  fontFamily,
  formatTaka,
  radius,
  spacing,
  typography,
} from '../src/theme';

/** Amounts on this screen use Bengali digits, like the other tab screens. */
const takaBn = (amount: number) => toBnDigits(formatTaka(amount));

/* ------------------------------------------------------------------ */
/* Derivations (Package E — full notes in BUILD_NOTES.md)              */
/*                                                                     */
/* The mock Order carries NO creation date; the only per-order date    */
/* is `deliveryInDays`. Every period figure is therefore windowed on   */
/* the delivery date — আজ {0}, এই সপ্তাহ {−6..0}, এই মাস {−29..0} —   */
/* over non-cancelled orders from the live store. `advance` is the     */
/* total collected on an order (initial অগ্রিম + every `payments`      */
/* entry, which the store folds into `advance`), so collections are    */
/* never double-counted.                                               */
/* ------------------------------------------------------------------ */

type PeriodKey = 'today' | 'week' | 'month';

const periods: { key: PeriodKey; label: string; start: number }[] = [
  { key: 'today', label: 'আজ', start: 0 },
  { key: 'week', label: 'এই সপ্তাহ', start: -6 },
  { key: 'month', label: 'এই মাস', start: -29 },
];

interface PeriodFigures {
  orderCount: number;
  sales: number;
  collected: number;
  dueAdded: number;
}

function periodFigures(
  active: Order[],
  start: number,
  todayCollection: number,
): PeriodFigures {
  const inWindow = active.filter(
    (o) => o.deliveryInDays >= start && o.deliveryInDays <= 0,
  );
  return {
    orderCount: inWindow.length,
    sales: inWindow.reduce((sum, o) => sum + o.total, 0),
    dueAdded: inWindow.reduce((sum, o) => sum + dueOf(o), 0),
    // আদায় = আজকের আদায় (the dashboard figure: mock counter constant +
    // this session's টাকা জমা collections) + the advances sitting on
    // orders delivered earlier inside the window. Those advances are the
    // only other collections the book can date — by delivery proxy.
    collected:
      todayCollection +
      inWindow
        .filter((o) => o.deliveryInDays < 0)
        .reduce((sum, o) => sum + o.advance, 0),
  };
}

interface GarmentRow {
  garment: string;
  count: number;
  total: number;
}

function garmentBreakdown(active: Order[], start: number): GarmentRow[] {
  const byGarment = new Map<string, GarmentRow>();
  active
    .filter((o) => o.deliveryInDays >= start && o.deliveryInDays <= 0)
    .forEach((o) => {
      const row = byGarment.get(o.garment) ?? {
        garment: o.garment,
        count: 0,
        total: 0,
      };
      row.count += 1;
      row.total += o.total;
      byGarment.set(o.garment, row);
    });
  return [...byGarment.values()].sort((a, b) => b.total - a.total);
}

const BAR_TRACK_HEIGHT = 64;

export default function ReportsScreen() {
  const orders = useOrders();
  const karigars = useKarigars();
  const sessionCollected = useSessionCollections();
  const [period, setPeriod] = useState<PeriodKey>('month');

  const active = useMemo(
    () => orders.filter((o) => o.status !== 'cancelled'),
    [orders],
  );

  // আজকের আদায় — the same figure the Dashboard and বকেয়া screens show:
  // the mock counter constant + this session's collections.
  const todayCollection = dashboardStats.todayCollection + sessionCollected;

  const periodDef = periods.find((p) => p.key === period) ?? periods[2];
  const figures = useMemo(
    () => periodFigures(active, periodDef.start, todayCollection),
    [active, periodDef, todayCollection],
  );
  const garments = useMemo(
    () => garmentBreakdown(active, periodDef.start),
    [active, periodDef],
  );

  /* দৈনিক সারসংক্ষেপ — আজ (delivery-date proxy, see header note). */
  const todayOrders = active.filter((o) => o.deliveryInDays === 0);
  const todaySummary = {
    orderCount: todayOrders.length,
    deliverable: todayOrders.filter(
      (o) => o.status === 'ready' || o.status === 'delivered',
    ).length,
    dueExpected: todayOrders.reduce((sum, o) => sum + dueOf(o), 0),
  };

  /* গত ৭ দিন — order counts by delivery offset (−6..0). */
  const last7 = useMemo(
    () =>
      [-6, -5, -4, -3, -2, -1, 0].map((offset) => ({
        offset,
        count: active.filter((o) => o.deliveryInDays === offset).length,
        date: dateFromOffset(offset),
      })),
    [active],
  );
  const maxBarCount = Math.max(1, ...last7.map((d) => d.count));

  const karigarTotal = karigarSummary(karigars);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="রিপোর্ট" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          {/* ---------- দৈনিক সারসংক্ষেপ — আজ ---------- */}
          <Text style={styles.sectionTitleFirst}>দৈনিক সারসংক্ষেপ — আজ</Text>
          <SummaryPanel
            label="আজকের আদায়"
            value={takaBn(todayCollection)}
            stats={[
              {
                value: `${toBnDigits(todaySummary.orderCount)}টি`,
                label: 'আজকের অর্ডার',
              },
              {
                value: `${toBnDigits(todaySummary.deliverable)}টি`,
                label: 'আজকের ডেলিভারি',
              },
              {
                value: takaBn(todaySummary.dueExpected),
                label: 'আজ ডেলিভারিতে বকেয়া',
                valueColor: colors.amber,
              },
            ]}
          />

          {/* ---------- সময়ের হিসাব ---------- */}
          <Text style={styles.sectionTitle}>সময়ের হিসাব</Text>
          <View style={styles.chipRow}>
            {periods.map((p) => {
              const selected = p.key === period;
              return (
                <Pressable
                  key={p.key}
                  onPress={() => setPeriod(p.key)}
                  style={[styles.chip, selected && styles.chipSelected]}
                  accessibilityLabel={p.label}
                >
                  <Text
                    style={[
                      styles.chipLabel,
                      selected && styles.chipLabelSelected,
                    ]}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <SummaryPanel
            label="মোট বিক্রি"
            value={takaBn(figures.sales)}
            stats={[
              {
                value: `${toBnDigits(figures.orderCount)}টি`,
                label: 'মোট অর্ডার',
              },
              { value: takaBn(figures.collected), label: 'মোট আদায়' },
              {
                value: takaBn(figures.dueAdded),
                label: 'বকেয়া যোগ হয়েছে',
                valueColor: colors.amber,
              },
            ]}
          />

          {/* ---------- গত ৭ দিনের অর্ডার ---------- */}
          <Text style={styles.sectionTitle}>গত ৭ দিনের অর্ডার</Text>
          <View style={styles.panel}>
            <View style={styles.barRow}>
              {last7.map((day) => (
                <View key={day.offset} style={styles.barCol}>
                  <Text style={styles.barValue}>
                    {toBnDigits(day.count)}
                  </Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height:
                            day.count > 0
                              ? Math.max(
                                  6,
                                  (day.count / maxBarCount) *
                                    BAR_TRACK_HEIGHT,
                                )
                              : 0,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>
                    {day.offset === 0
                      ? 'আজ'
                      : toBnDigits(day.date.getDate())}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* ---------- আয়ের বিবরণী ---------- */}
          <Text style={styles.sectionTitle}>
            আয়ের বিবরণী — {periodDef.label}
          </Text>
          {garments.length === 0 ? (
            <Text style={styles.empty}>এই সময়ে কোনো অর্ডার নেই।</Text>
          ) : (
            <LedgerPanel>
              {garments.map((row, i) => (
                <View
                  key={row.garment}
                  style={[
                    styles.breakRow,
                    i < garments.length - 1 && styles.divider,
                  ]}
                >
                  <View style={styles.breakMain}>
                    <Text style={styles.breakName} numberOfLines={1}>
                      {row.garment}
                    </Text>
                    <Text style={styles.breakMeta}>
                      {toBnDigits(row.count)}টি অর্ডার
                    </Text>
                  </View>
                  <Text style={styles.breakAmount}>{takaBn(row.total)}</Text>
                </View>
              ))}
              <View style={[styles.breakRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>মোট বিক্রি</Text>
                <Text style={styles.breakAmount}>{takaBn(figures.sales)}</Text>
              </View>
            </LedgerPanel>
          )}

          {/* ---------- কারিগর খরচ — এই মাস ---------- */}
          <Text style={styles.sectionTitle}>কারিগর খরচ — এই মাস</Text>
          <LedgerPanel>
            {karigars.map((entry, i) => {
              const totals = karigarTotals(entry);
              return (
                <View
                  key={entry.id}
                  style={[
                    styles.breakRow,
                    i < karigars.length - 1 && styles.divider,
                  ]}
                >
                  <View style={styles.breakMain}>
                    <Text style={styles.breakName} numberOfLines={1}>
                      {entry.name}
                    </Text>
                    <Text style={styles.breakMeta} numberOfLines={1}>
                      আয় {takaBn(totals.earned)} · পরিশোধ{' '}
                      {takaBn(totals.paid)}
                    </Text>
                  </View>
                  <View style={styles.right}>
                    <Text style={styles.breakAmount}>
                      {takaBn(totals.due)}
                    </Text>
                    <Text style={styles.rightLabel}>পাওনা</Text>
                  </View>
                </View>
              );
            })}
            <View style={[styles.breakRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>মোট কারিগর পাওনা</Text>
              <Text style={styles.breakAmount}>
                {takaBn(karigarTotal.totalWageDue)}
              </Text>
            </View>
          </LedgerPanel>

          <Text style={styles.footnote}>
            সব হিসাব অর্ডারের ডেলিভারি তারিখ ধরে করা।
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
  sectionTitleFirst: {
    ...typography.sectionTitle,
    color: colors.ink,
    marginBottom: 7,
    marginHorizontal: 2,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.ink,
    marginTop: spacing.lg,
    marginBottom: 7,
    marginHorizontal: 2,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.ink,
  },
  chipLabelSelected: { color: colors.onPrimary },
  panel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm + 2,
  },
  barRow: { flexDirection: 'row' },
  barCol: { flex: 1, alignItems: 'center', gap: spacing.xs },
  barValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.ink,
  },
  barTrack: {
    width: 28,
    height: BAR_TRACK_HEIGHT,
    borderRadius: radius.chip,
    backgroundColor: colors.neutralTint,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.chip,
  },
  barLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    lineHeight: 14,
    color: colors.textSecondary,
  },
  breakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    minHeight: 48,
  },
  breakMain: { flex: 1, gap: 2 },
  breakName: { ...typography.bodySemiBold, color: colors.ink },
  breakMeta: { ...typography.label, color: colors.textSecondary },
  breakAmount: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.ink,
  },
  totalLabel: {
    ...typography.bodySemiBold,
    color: colors.ink,
    flex: 1,
  },
  right: { alignItems: 'flex-end', gap: 1 },
  rightLabel: { ...typography.label, color: colors.textFaint },
  empty: { ...typography.body, color: colors.textSecondary },
  footnote: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textFaint,
    marginTop: spacing.md,
    marginHorizontal: 2,
  },
  footerSpace: { height: spacing.lg },
});
