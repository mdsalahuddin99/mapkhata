import { useLocalSearchParams } from 'expo-router';
import { Check, Phone } from 'lucide-react-native';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SecondaryButton } from '../../src/components/Buttons';
import {
  deliveryLabel,
  dueOf,
  fullDateLabel,
  shop,
  toBnDigits,
} from '../../src/data/mock';
import { useOrders } from '../../src/store/orders';
import {
  colors,
  fontFamily,
  formatTaka,
  OrderStatusKey,
  radius,
  spacing,
  typography,
} from '../../src/theme';

const takaBn = (amount: number) => toBnDigits(formatTaka(amount));

/* ------------------------------------------------------------------ */
/* Customer-friendly status steps (public wording, not shop jargon)    */
/* ------------------------------------------------------------------ */

interface TrackStep {
  key: OrderStatusKey;
  label: string;
  /** Short line shown under the step while it is the current one. */
  message?: string;
}

const TRACK_STEPS: TrackStep[] = [
  {
    key: 'measured',
    label: 'মাপ নেওয়া হয়েছে',
    message: 'আপনার মাপ নেওয়া হয়েছে। শীঘ্রই কাটিং শুরু হবে।',
  },
  {
    key: 'cutting',
    label: 'কাটিং চলছে',
    message: 'আপনার পোশাকের কাপড় এখন কাটিং হচ্ছে।',
  },
  {
    key: 'sewing',
    label: 'সেলাই চলছে',
    message: 'আপনার পোশাক এখন সেলাই হচ্ছে।',
  },
  { key: 'ready', label: 'তৈরি হয়ে গেছে' },
  { key: 'delivered', label: 'ডেলিভারি সম্পন্ন' },
];

function StatusStepper({ status }: { status: OrderStatusKey }) {
  const idx = TRACK_STEPS.findIndex((s) => s.key === status);
  return (
    <View>
      {TRACK_STEPS.map((step, i) => {
        const done = status === 'delivered' ? true : i < idx;
        const current = status !== 'delivered' && i === idx;
        const last = i === TRACK_STEPS.length - 1;
        return (
          <View key={step.key} style={styles.stepRow}>
            <View style={styles.stepRail}>
              <View
                style={[
                  styles.stepDot,
                  done && styles.stepDotDone,
                  current && styles.stepDotCurrent,
                ]}
              >
                {done ? (
                  <Check size={12} color="#FFFFFF" strokeWidth={3} />
                ) : current ? (
                  <View style={styles.stepDotInner} />
                ) : null}
              </View>
              {!last && (
                <View
                  style={[
                    styles.stepLine,
                    done && { backgroundColor: colors.primary },
                  ]}
                />
              )}
            </View>
            <View style={[styles.stepMain, !last && styles.stepMainGap]}>
              <Text
                style={[
                  styles.stepLabel,
                  (done || current) && styles.stepLabelActive,
                ]}
              >
                {step.label}
              </Text>
              {current && step.message && (
                <Text style={styles.stepMessage}>{step.message}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function BillRow({
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

/** "মোঃ কামাল হোসেন" → "কামাল"; other names → first word. */
function firstNameOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if ((parts[0] === 'মোঃ' || parts[0] === 'মো:') && parts.length > 1) {
    return parts[1];
  }
  return parts[0];
}

function ShopHeader() {
  const tel = `tel:${shop.phone.replace(/[^0-9+]/g, '')}`;
  return (
    <View style={[styles.panel, styles.shopPanel]}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoText}>{shop.name.trim().charAt(0)}</Text>
      </View>
      <Text style={styles.shopName}>{shop.name}</Text>
      <Text style={styles.shopArea}>{shop.area}</Text>
      <View style={styles.callRow}>
        <Text style={styles.shopPhone}>{toBnDigits(shop.phone)}</Text>
        <SecondaryButton
          label="কল করুন"
          compact
          icon={<Phone size={15} color={colors.ink} strokeWidth={2} />}
          onPress={() => Linking.openURL(tel)}
        />
      </View>
    </View>
  );
}

function Footer() {
  return <Text style={styles.footer}>MapKhata দিয়ে তৈরি</Text>;
}

/* ------------------------------------------------------------------ */
/* Screen — public page, opened from an SMS/WhatsApp link.             */
/* No login, no tab bar; only this order's own data is shown.          */
/* ------------------------------------------------------------------ */

export default function TrackScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const orders = useOrders();
  const order = orders.find(
    (o) => o.code.toUpperCase() === (code ?? '').trim().toUpperCase(),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <View style={styles.column}>
            <ShopHeader />

            {!order ? (
              <View style={styles.panel}>
                <Text style={styles.notFoundTitle}>অর্ডার পাওয়া যায়নি</Text>
                <Text style={styles.notFoundText}>
                  এই কোডে কোনো অর্ডার পাওয়া যায়নি — কোডটি আবার দেখে নিন।
                </Text>
              </View>
            ) : (
              <>
                {/* সালাম + অর্ডার পরিচিতি */}
                <View style={styles.panel}>
                  <Text style={styles.greeting}>
                    আসসালামু আলাইকুম, {firstNameOf(order.customerName)}
                  </Text>
                  <Text style={styles.greetingMeta}>
                    অর্ডার {order.code} · {order.garment}
                  </Text>
                </View>

                {/* তৈরি / ডেলিভারি সম্পন্ন হলে সবার আগে বড় বার্তা */}
                {order.status === 'ready' && (
                  <View style={styles.readyPanel}>
                    <Text style={styles.readyText}>
                      আপনার পোশাক তৈরি! দোকান থেকে সংগ্রহ করুন।
                    </Text>
                  </View>
                )}
                {order.status === 'delivered' && (
                  <View style={styles.deliveredPanel}>
                    <Text style={styles.deliveredText}>
                      ডেলিভারি সম্পন্ন হয়েছে। ধন্যবাদ!
                    </Text>
                  </View>
                )}

                {/* অবস্থা */}
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>অর্ডারের অবস্থা</Text>
                  {order.status === 'cancelled' ? (
                    <Text style={styles.cancelledText}>
                      এই অর্ডারটি বাতিল করা হয়েছে। বিস্তারিত জানতে দোকানে কল
                      করুন।
                    </Text>
                  ) : (
                    <StatusStepper status={order.status} />
                  )}
                </View>

                {/* ডেলিভারির তারিখ */}
                <View style={styles.panel}>
                  <Text style={styles.dateLabel}>ডেলিভারির তারিখ</Text>
                  <Text style={styles.dateValue}>
                    {deliveryLabel(order.deliveryInDays)} ·{' '}
                    {fullDateLabel(order.deliveryInDays)}
                  </Text>
                </View>

                {/* নিজের বিল */}
                <View style={styles.panel}>
                  <BillRow label="মোট টাকা" value={takaBn(order.total)} />
                  <BillRow label="জমা" value={takaBn(order.advance)} />
                  <BillRow
                    label="বকেয়া"
                    value={takaBn(dueOf(order))}
                    bold
                    amber={dueOf(order) > 0}
                    last
                  />
                </View>
              </>
            )}

            <Footer />
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
  panel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  /* shop identity */
  shopPanel: { alignItems: 'center' },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  logoText: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.primary,
  },
  shopName: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.ink,
    textAlign: 'center',
  },
  shopArea: {
    ...typography.label,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 1,
  },
  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  shopPhone: { ...typography.bodySemiBold, color: colors.ink },
  /* greeting */
  greeting: {
    fontFamily: fontFamily.semiBold,
    fontSize: 17,
    lineHeight: 24,
    color: colors.ink,
  },
  greetingMeta: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  /* prominent status panels */
  readyPanel: {
    backgroundColor: colors.primaryTint,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  readyText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    lineHeight: 23,
    color: colors.primary,
    textAlign: 'center',
  },
  deliveredPanel: {
    backgroundColor: colors.neutralTint,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  deliveredText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    lineHeight: 23,
    color: colors.ink,
    textAlign: 'center',
  },
  cancelledText: { ...typography.body, color: colors.danger },
  /* stepper */
  panelTitle: {
    ...typography.sectionTitle,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  stepRow: { flexDirection: 'row', gap: spacing.md },
  stepRail: { width: 22, alignItems: 'center' },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepDotCurrent: { borderColor: colors.primary },
  stepDotInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.hairline,
    marginVertical: 3,
    minHeight: 14,
  },
  stepMain: { flex: 1, paddingTop: 2 },
  stepMainGap: { paddingBottom: spacing.lg },
  stepLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textFaint,
  },
  stepLabelActive: { color: colors.ink, fontFamily: fontFamily.semiBold },
  stepMessage: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  /* delivery date */
  dateLabel: { ...typography.label, color: colors.textSecondary },
  dateValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: 20,
    lineHeight: 27,
    color: colors.ink,
    marginTop: 2,
  },
  /* bill */
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  billDivider: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  billLabel: { ...typography.body, color: colors.textSecondary },
  billValue: { ...typography.bodySemiBold, color: colors.ink },
  billBold: { fontFamily: fontFamily.bold, fontSize: 15 },
  /* not found */
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
