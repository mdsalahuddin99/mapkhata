import { useLocalSearchParams, useRouter } from 'expo-router';
import { Phone } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton, SecondaryButton } from '../../src/components/Buttons';
import { BackHeader } from '../../src/components/CustomerBits';
import { LedgerPanel } from '../../src/components/LedgerRow';
import { SummaryPanel } from '../../src/components/SummaryPanel';
import { deliveryLabel, toBnDigits, workAmount } from '../../src/data/mock';
import { karigarTotals, useKarigars } from '../../src/store/karigars';
import {
  colors,
  fontFamily,
  formatTaka,
  radius,
  spacing,
  typography,
} from '../../src/theme';

const takaBn = (amount: number) => toBnDigits(formatTaka(amount));

/** Avatar tints rotate through the muted palette — same order as the tab. */
const avatarTints = [
  { bg: colors.primaryTint, fg: colors.primary },
  { bg: colors.mustardTint, fg: colors.mustard },
  { bg: colors.slateTint, fg: colors.slateBlue },
];

function initialOf(name: string): string {
  const stripped = name.replace(/^মোঃ\s*/, '');
  return stripped.charAt(0);
}

/**
 * কারিগর বিস্তারিত — one karigar's whole page: identity, this month's
 * money (আয় / পরিশোধ / পাওনা), every work entry with piece maths, and
 * the payment history. All figures derive from the karigar store, so a
 * payment made on the payment screen updates this page on return.
 */
export default function KarigarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const entries = useKarigars();
  const index = entries.findIndex((e) => e.id === id);
  const entry = index >= 0 ? entries[index] : undefined;

  if (!entry) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <BackHeader title="কারিগর বিস্তারিত" />
        <Text style={styles.empty}>কারিগরকে পাওয়া যায়নি।</Text>
      </SafeAreaView>
    );
  }

  const totals = karigarTotals(entry);
  const tint = avatarTints[index % avatarTints.length];
  // Newest first — session payments (আজ) land at the top.
  const payments = [...entry.payments].reverse();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="কারিগর বিস্তারিত" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          {/* ------------ পরিচিতি ------------ */}
          <View style={styles.identityPanel}>
            <View
              style={[styles.avatar, { backgroundColor: tint.bg }]}
            >
              <Text style={[styles.avatarText, { color: tint.fg }]}>
                {initialOf(entry.name)}
              </Text>
            </View>
            <View style={styles.identityMain}>
              <Text style={styles.name} numberOfLines={1}>
                {entry.name}
              </Text>
              <Text style={styles.role} numberOfLines={1}>
                {entry.skill}
              </Text>
              {entry.phone ? (
                <View style={styles.phoneRow}>
                  <Phone size={12} color={colors.textSecondary} strokeWidth={2} />
                  <Text style={styles.phone}>{toBnDigits(entry.phone)}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* ------------ এই মাসের হিসাব ------------ */}
          <View style={styles.summaryWrap}>
            <SummaryPanel
              label="পাওনা"
              value={takaBn(totals.due)}
              valueColor={colors.ink}
              stats={[
                { value: takaBn(totals.earned), label: 'এই মাসে আয়' },
                { value: takaBn(totals.paid), label: 'মোট পরিশোধ' },
                {
                  value: `${toBnDigits(entry.monthlyPieces)} পিস`,
                  label: 'এই মাসে সম্পন্ন',
                },
              ]}
            />
          </View>

          {/* ------------ কাজের তালিকা ------------ */}
          <Text style={styles.sectionTitle}>কাজের তালিকা</Text>
          {entry.work.length === 0 ? (
            <Text style={styles.empty}>এখনো কোনো কাজ দেওয়া হয়নি।</Text>
          ) : (
            <LedgerPanel>
              {entry.work.map((w, wi) => (
                <View
                  key={w.id}
                  style={[
                    styles.workRow,
                    wi < entry.work.length - 1 && styles.rowDivider,
                  ]}
                >
                  <View style={styles.workMain}>
                    <Text style={styles.workTitle} numberOfLines={1}>
                      {w.garment}
                      <Text style={styles.workMeta}> · {w.meta}</Text>
                    </Text>
                    <Text style={styles.workSub}>
                      {toBnDigits(w.pieces)} পিস × {takaBn(w.pieceRate)}
                    </Text>
                  </View>
                  {w.running && (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>
                        {w.runningLabel ?? 'সেলাই চলছে'}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.workAmount}>
                    {takaBn(workAmount(w))}
                  </Text>
                </View>
              ))}
            </LedgerPanel>
          )}

          {/* ------------ পেমেন্ট ইতিহাস ------------ */}
          <Text style={styles.sectionTitle}>পেমেন্ট ইতিহাস</Text>
          {payments.length === 0 ? (
            <Text style={styles.empty}>এখনো কোনো পেমেন্ট হয়নি।</Text>
          ) : (
            <LedgerPanel>
              {payments.map((p, pi) => (
                <View
                  key={pi}
                  style={[
                    styles.payRow,
                    pi < payments.length - 1 && styles.rowDivider,
                  ]}
                >
                  <View style={styles.workMain}>
                    <Text style={styles.workTitle}>{p.method ?? 'নগদ'}</Text>
                    <Text style={styles.workSub}>
                      {deliveryLabel(p.dateOffset)}
                    </Text>
                  </View>
                  <Text style={styles.workAmount}>{takaBn(p.amount)}</Text>
                </View>
              ))}
            </LedgerPanel>
          )}

          {/* ------------ অ্যাকশন ------------ */}
          <View style={styles.actions}>
            {totals.due > 0 && (
              <PrimaryButton
                label="পেমেন্ট করুন"
                onPress={() =>
                  router.push({
                    pathname: '/karigar/pay/[id]',
                    params: { id: entry.id },
                  } as never)
                }
              />
            )}
            {/* Visual for now — কাজ দেওয়া lives in the order flow
                (অর্ডারে কারিগর বাছাই), a later package wires it here. */}
            <SecondaryButton label="কাজ দিন" />
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
  identityPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fontFamily.bold, fontSize: 19, lineHeight: 24 },
  identityMain: { flex: 1, gap: 1 },
  name: {
    fontFamily: fontFamily.semiBold,
    fontSize: 17,
    lineHeight: 23,
    color: colors.ink,
  },
  role: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  phone: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  summaryWrap: { marginTop: spacing.md },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.ink,
    marginTop: spacing.lg,
    marginBottom: 7,
    marginHorizontal: 2,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  workRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
  },
  workMain: { flex: 1, gap: 1 },
  workTitle: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 19,
    color: colors.ink,
  },
  workMeta: { fontSize: 12, color: colors.textSecondary },
  workSub: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  tag: {
    backgroundColor: colors.mustardTint,
    borderRadius: radius.chip,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  tagText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 10,
    lineHeight: 13,
    color: colors.mustard,
  },
  workAmount: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 19,
    color: colors.ink,
    minWidth: 64,
    textAlign: 'right',
  },
  actions: { marginTop: spacing.lg, gap: spacing.sm },
  empty: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginHorizontal: 2,
  },
  footerSpace: { height: spacing.lg },
});
