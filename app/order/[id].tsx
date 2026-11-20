import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton, SecondaryButton } from '../../src/components/Buttons';
import { CustomerAvatar } from '../../src/components/CustomerBits';
import { StatusChip } from '../../src/components/StatusChip';
import {
  deliveryLabel,
  dueOf,
  findCustomerByPhone,
  fullDateLabel,
  garmentDef,
  garmentKeysForLabel,
  GarmentDef,
  Order,
  toBnDigits,
} from '../../src/data/mock';
import { updateStatus, useOrders } from '../../src/store/orders';
import {
  colors,
  fontFamily,
  formatTaka,
  OrderStatusKey,
  radius,
  spacing,
  statusMeta,
  typography,
} from '../../src/theme';

const takaBn = (amount: number) => toBnDigits(formatTaka(amount));

const STAGES: OrderStatusKey[] = [
  'measured',
  'cutting',
  'sewing',
  'ready',
  'delivered',
];

/** Short stage names — the stepper columns are too narrow for full labels. */
const STEP_LABELS: Record<OrderStatusKey, string> = {
  measured: 'মাপ',
  cutting: 'কাটিং',
  sewing: 'সেলাই',
  ready: 'রেডি',
  delivered: 'ডেলিভারি',
  cancelled: 'বাতিল',
};

/* ------------------------------------------------------------------ */
/* Status stepper — done = filled green, current = ring, next = muted  */
/* ------------------------------------------------------------------ */

function Stepper({ status }: { status: OrderStatusKey }) {
  const idx = STAGES.indexOf(status);
  const delivered = status === 'delivered';
  return (
    <View style={styles.stepper}>
      {STAGES.map((stage, i) => {
        const filled = i < idx || delivered;
        const current = i === idx && !delivered;
        const lineDone = (n: number) => n < idx || delivered;
        return (
          <View key={stage} style={styles.stepCell}>
            <View style={styles.stepTrack}>
              <View
                style={[
                  styles.stepLine,
                  {
                    backgroundColor:
                      i === 0
                        ? 'transparent'
                        : lineDone(i)
                          ? colors.primary
                          : colors.hairline,
                  },
                ]}
              />
              <View
                style={[
                  styles.stepDot,
                  filled && styles.stepDotFilled,
                  current && styles.stepDotCurrent,
                ]}
              >
                {filled ? (
                  <Check size={10} color="#FFFFFF" strokeWidth={3} />
                ) : current ? (
                  <View style={styles.stepDotInner} />
                ) : null}
              </View>
              <View
                style={[
                  styles.stepLine,
                  {
                    backgroundColor:
                      i === STAGES.length - 1
                        ? 'transparent'
                        : lineDone(i + 1)
                          ? colors.primary
                          : colors.hairline,
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.stepLabel,
                (filled || current) && styles.stepLabelActive,
              ]}
              numberOfLines={1}
            >
              {STEP_LABELS[stage]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function InfoRow({
  label,
  value,
  valueColor,
  bold,
  last,
}: {
  label: string;
  value: string;
  valueColor?: string;
  bold?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !last && styles.infoDivider]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={[
          styles.infoValue,
          bold && styles.infoValueBold,
          valueColor && { color: valueColor },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

interface MeasureBlock {
  def: GarmentDef;
  values: Record<string, string>;
}

function blocksFor(order: Order): MeasureBlock[] {
  const keys = garmentKeysForLabel(order.garment);
  if (keys.length === 0) return [];
  if (order.measurements && Object.keys(order.measurements).length > 0) {
    return [{ def: garmentDef(keys[0]), values: order.measurements }];
  }
  const customer = findCustomerByPhone(order.customerPhone);
  if (!customer) return [];
  const blocks: MeasureBlock[] = [];
  for (const key of keys) {
    const values = customer.measurements[key];
    if (values && Object.keys(values).length > 0) {
      blocks.push({ def: garmentDef(key), values });
    }
  }
  return blocks;
}

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const orders = useOrders();
  const [showTracking, setShowTracking] = useState(false);

  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            accessibilityLabel="ফিরে যান"
          >
            <ChevronLeft size={24} color={colors.ink} strokeWidth={2} />
          </Pressable>
          <Text style={styles.headerTitle}>অর্ডার</Text>
        </View>
        <Text style={styles.empty}>অর্ডারটি পাওয়া যায়নি।</Text>
      </SafeAreaView>
    );
  }

  const due = dueOf(order);
  const stageIdx = STAGES.indexOf(order.status);
  const nextStatus =
    stageIdx >= 0 && stageIdx < STAGES.length - 1
      ? STAGES[stageIdx + 1]
      : null;
  const blocks = blocksFor(order);
  const collections = order.payments ?? [];
  const collectionsSum = collections.reduce((s, p) => s + p.amount, 0);
  const advancePart = order.advance - collectionsSum;
  const deliveryText =
    order.deliveryInDays <= 1
      ? `${deliveryLabel(order.deliveryInDays)} · ${fullDateLabel(order.deliveryInDays)}`
      : fullDateLabel(order.deliveryInDays);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header — back, order code, status chip */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          accessibilityLabel="ফিরে যান"
        >
          <ChevronLeft size={24} color={colors.ink} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>{order.code}</Text>
        <StatusChip status={order.status} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          {/* ------------ অবস্থা ------------ */}
          <View style={styles.panel}>
            {order.status === 'cancelled' ? (
              <Text style={styles.cancelledNote}>
                এই অর্ডারটি বাতিল করা হয়েছে।
              </Text>
            ) : (
              <>
                <Stepper status={order.status} />
                {nextStatus && (
                  <>
                    <View style={styles.panelDivider} />
                    <PrimaryButton
                      label={`পরের ধাপে নিন · ${statusMeta[nextStatus].label}`}
                      onPress={() => updateStatus(order.id, nextStatus)}
                    />
                  </>
                )}
              </>
            )}
          </View>

          {/* ------------ কাস্টমার ------------ */}
          <Text style={styles.sectionTitle}>কাস্টমার</Text>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/customer/[phone]',
                params: { phone: order.customerPhone },
              } as never)
            }
            style={({ pressed }) => [
              styles.panel,
              styles.customerRow,
              pressed && styles.pressedBg,
            ]}
          >
            <CustomerAvatar name={order.customerName} size={40} />
            <View style={styles.customerMain}>
              <Text style={styles.customerName}>{order.customerName}</Text>
              <Text style={styles.customerPhone}>
                {toBnDigits(order.customerPhone)}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textFaint} strokeWidth={2} />
          </Pressable>

          {/* ------------ পোশাক ও মাপ ------------ */}
          <Text style={styles.sectionTitle}>পোশাক ও মাপ</Text>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>{order.garment}</Text>
            {blocks.length === 0 ? (
              <Text style={styles.muted}>মাপ সেভ নেই।</Text>
            ) : (
              blocks.map((block, bi) => {
                const fields = block.def.fields.filter(
                  (f) => block.values[f.key] !== undefined,
                );
                const pairs: (typeof fields)[] = [];
                for (let i = 0; i < fields.length; i += 2) {
                  pairs.push(fields.slice(i, i + 2));
                }
                return (
                  <View key={block.def.key} style={bi > 0 && styles.blockGap}>
                    {blocks.length > 1 && (
                      <Text style={styles.blockTitle}>{block.def.label}</Text>
                    )}
                    {pairs.map((pair, pi) => (
                      <View
                        key={pi}
                        style={[
                          styles.measureRow,
                          pi > 0 && styles.measureDivider,
                        ]}
                      >
                        {pair.map((f) => (
                          <View key={f.key} style={styles.measureCell}>
                            <Text style={styles.measureLabel}>{f.label}</Text>
                            <Text style={styles.measureValue}>
                              {toBnDigits(block.values[f.key] ?? '')}
                            </Text>
                          </View>
                        ))}
                        {pair.length === 1 && (
                          <View style={styles.measureCell} />
                        )}
                      </View>
                    ))}
                  </View>
                );
              })
            )}
            {order.designNote && (
              <>
                <View style={styles.panelDivider} />
                <Text style={styles.measureLabel}>ডিজাইন নোট</Text>
                <Text style={styles.designNote}>{order.designNote}</Text>
              </>
            )}
          </View>

          {/* ------------ ডেলিভারি ------------ */}
          <Text style={styles.sectionTitle}>ডেলিভারি</Text>
          <View style={styles.panel}>
            <InfoRow
              label="ডেলিভারি তারিখ"
              value={deliveryText}
              last={!order.karigarName}
            />
            {order.karigarName ? (
              <InfoRow label="কারিগর" value={order.karigarName} last />
            ) : null}
          </View>

          {/* ------------ বিল ------------ */}
          <Text style={styles.sectionTitle}>বিল</Text>
          <View style={styles.panel}>
            <InfoRow label="মোট টাকা" value={takaBn(order.total)} />
            <InfoRow label="জমা" value={takaBn(order.advance)} />
            <InfoRow
              label="বকেয়া"
              value={takaBn(due)}
              valueColor={due > 0 ? colors.amber : colors.ink}
              bold
              last
            />
            <View style={styles.panelDivider} />
            <Text style={styles.historyTitle}>টাকা জমার ইতিহাস</Text>
            {advancePart <= 0 && collections.length === 0 ? (
              <Text style={styles.muted}>এখনো কোনো টাকা জমা হয়নি।</Text>
            ) : (
              <>
                {advancePart > 0 && (
                  <View style={styles.payRow}>
                    <View style={styles.payMain}>
                      <Text style={styles.payLabel}>অগ্রিম</Text>
                      <Text style={styles.payMeta}>অর্ডার নেওয়ার সময়</Text>
                    </View>
                    <Text style={styles.payAmount}>{takaBn(advancePart)}</Text>
                  </View>
                )}
                {collections.map((p, i) => (
                  <View
                    key={i}
                    style={[
                      styles.payRow,
                      (advancePart > 0 || i > 0) && styles.payDivider,
                    ]}
                  >
                    <View style={styles.payMain}>
                      <Text style={styles.payLabel}>জমা</Text>
                      <Text style={styles.payMeta}>
                        {p.method ? `${p.method} · ` : ''}
                        {deliveryLabel(p.dateOffset)}
                      </Text>
                    </View>
                    <Text style={styles.payAmount}>{takaBn(p.amount)}</Text>
                  </View>
                ))}
              </>
            )}
          </View>

          {/* ------------ অ্যাকশন ------------ */}
          <View style={styles.actions}>
            {due > 0 && (
              <PrimaryButton
                label="টাকা জমা নিন"
                onPress={() =>
                  router.push({
                    pathname: '/collect/[id]',
                    params: { id: order.id },
                  } as never)
                }
              />
            )}
            <SecondaryButton
              label="রসিদ"
              onPress={() =>
                router.push({
                  pathname: '/order/receipt/[id]',
                  params: { id: order.id },
                } as never)
              }
            />
            <SecondaryButton
              label="ট্র্যাকিং লিঙ্ক"
              onPress={() => setShowTracking((v) => !v)}
            />
            {showTracking && (
              <View style={styles.trackingBox}>
                <Text style={styles.trackingCode}>
                  ট্র্যাকিং কোড: {order.code}
                </Text>
                <Text style={styles.trackingText}>
                  কাস্টমার এই কোড দিয়ে অর্ডারের অবস্থা জানতে পারবেন।
                  (ট্র্যাকিং ওয়েব পেজ আসছে)
                </Text>
              </View>
            )}
          </View>

          <View style={styles.footerSpace} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.sm,
  },
  pressed: { opacity: 0.6 },
  pressedBg: { backgroundColor: colors.background },
  headerTitle: { ...typography.screenTitle, color: colors.ink, flex: 1 },
  body: { padding: spacing.md },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.ink,
    marginTop: spacing.lg,
    marginBottom: 7,
    marginHorizontal: 2,
  },
  panel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  panelDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  panelTitle: { ...typography.bodySemiBold, color: colors.ink, marginBottom: spacing.sm },
  /* stepper */
  stepper: { flexDirection: 'row' },
  stepCell: { flex: 1, alignItems: 'center', gap: 6 },
  stepTrack: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  stepLine: { flex: 1, height: 2 },
  stepDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotFilled: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepDotCurrent: { borderColor: colors.primary },
  stepDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  stepLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    lineHeight: 14,
    color: colors.textFaint,
  },
  stepLabelActive: { color: colors.ink, fontFamily: fontFamily.semiBold },
  cancelledNote: { ...typography.body, color: colors.danger },
  /* customer */
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  customerMain: { flex: 1, gap: 1 },
  customerName: { ...typography.bodySemiBold, color: colors.ink },
  customerPhone: { ...typography.label, color: colors.textSecondary },
  /* measurements */
  blockGap: { marginTop: spacing.md },
  blockTitle: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  measureRow: { flexDirection: 'row', paddingVertical: 6 },
  measureDivider: { borderTopWidth: 1, borderTopColor: colors.hairline },
  measureCell: { flex: 1, gap: 1 },
  measureLabel: { ...typography.label, color: colors.textSecondary },
  measureValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.ink,
  },
  designNote: { ...typography.body, color: colors.ink, marginTop: 2 },
  muted: { ...typography.body, color: colors.textSecondary },
  /* info + bill rows */
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  infoDivider: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  infoLabel: { ...typography.body, color: colors.textSecondary },
  infoValue: { ...typography.bodySemiBold, color: colors.ink },
  infoValueBold: { fontFamily: fontFamily.bold, fontSize: 15 },
  historyTitle: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  payDivider: { borderTopWidth: 1, borderTopColor: colors.hairline },
  payMain: { flex: 1, gap: 1 },
  payLabel: { ...typography.bodySemiBold, color: colors.ink },
  payMeta: { ...typography.label, color: colors.textFaint },
  payAmount: { ...typography.bodySemiBold, color: colors.ink },
  /* actions */
  actions: { marginTop: spacing.lg, gap: spacing.sm },
  trackingBox: {
    backgroundColor: colors.primaryTint,
    borderRadius: radius.card,
    padding: spacing.md,
    gap: 2,
  },
  trackingCode: { ...typography.bodySemiBold, color: colors.primary },
  trackingText: { ...typography.label, color: colors.primary },
  empty: { ...typography.body, color: colors.textSecondary, padding: spacing.lg },
  footerSpace: { height: spacing.lg },
});
