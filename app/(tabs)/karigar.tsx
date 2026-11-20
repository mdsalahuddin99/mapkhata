import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../src/components/Buttons';
import { LedgerPanel } from '../../src/components/LedgerRow';
import { SummaryPanel } from '../../src/components/SummaryPanel';
import { WhiteHeader } from '../../src/components/WhiteHeader';
import { toBnDigits, workAmount } from '../../src/data/mock';
import {
  karigarSummary,
  karigarTotals,
  useKarigars,
} from '../../src/store/karigars';
import {
  colors,
  fontFamily,
  formatTaka,
  radius,
  spacing,
  typography,
} from '../../src/theme';

/** Amounts on this screen use Bengali digits (prototype v4). */
const takaBn = (amount: number) => toBnDigits(formatTaka(amount));

/** Avatar tints rotate through the muted palette (DESIGN.md v1.3). */
const avatarTints = [
  { bg: colors.primaryTint, fg: colors.primary },
  { bg: colors.mustardTint, fg: colors.mustard },
  { bg: colors.slateTint, fg: colors.slateBlue },
];

function initialOf(name: string): string {
  const stripped = name.replace(/^মোঃ\s*/, '');
  return stripped.charAt(0);
}

export default function KarigarScreen() {
  const router = useRouter();
  // Package D: the list reads from the karigar store, so payments made
  // on the payment screen and karigars added on the form appear here
  // immediately (figures derived per karigar, never the mock fields).
  const entries = useKarigars();
  const summary = karigarSummary(entries);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <WhiteHeader
        title="কারিগর"
        right={
          <PrimaryButton
            compact
            label="নতুন কারিগর"
            onPress={() => router.push('/karigar/new')}
            icon={<Plus size={18} color="#FFFFFF" strokeWidth={2.2} />}
          />
        }
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <SummaryPanel
            label="এই মাসে কারিগরদের মোট পাওনা"
            value={takaBn(summary.totalWageDue)}
            valueColor={colors.ink}
            stats={[
              { value: `${toBnDigits(summary.karigarCount)} জন`, label: 'কারিগর' },
              { value: `${toBnDigits(summary.monthlyPieces)} পিস`, label: 'এই মাসে সম্পন্ন' },
              { value: takaBn(summary.monthlyPaid), label: 'পরিশোধ হয়েছে' },
            ]}
          />

          <Text style={styles.sectionTitle}>কারিগর অনুযায়ী হিসাব</Text>

          <LedgerPanel>
            {entries.map((entry, ki) => {
              const totals = karigarTotals(entry);
              const tint = avatarTints[ki % avatarTints.length];
              const isLastBlock = ki === entries.length - 1;
              return (
                <Pressable
                  key={entry.id}
                  onPress={() =>
                    router.push({
                      pathname: '/karigar/[id]',
                      params: { id: entry.id },
                    } as never)
                  }
                  style={({ pressed }) => [
                    !isLastBlock && styles.blockDivider,
                    pressed && styles.blockPressed,
                  ]}
                >
                  <View style={styles.khead}>
                    <View style={[styles.avatar, { backgroundColor: tint.bg }]}>
                      <Text style={[styles.avatarText, { color: tint.fg }]}>
                        {initialOf(entry.name)}
                      </Text>
                    </View>
                    <View style={styles.kheadMain}>
                      <Text style={styles.kname} numberOfLines={1}>
                        {entry.name}
                      </Text>
                      <Text style={styles.krole} numberOfLines={1}>
                        {entry.skill}
                      </Text>
                    </View>
                    <View style={styles.earn}>
                      <Text style={styles.earnValue}>
                        পাওনা {takaBn(totals.due)}
                      </Text>
                      <Text style={styles.earnLabel}>
                        এই মাসে আয় {takaBn(totals.earned)}
                      </Text>
                    </View>
                  </View>

                  {entry.work.map((w, wi) => (
                    <View
                      key={w.id}
                      style={[
                        styles.krow,
                        wi < entry.work.length - 1 && styles.rowDivider,
                      ]}
                    >
                      <View style={styles.garmentCell}>
                        <Text style={styles.garment} numberOfLines={1}>
                          {w.garment}
                          <Text style={styles.garmentMeta}> · {w.meta}</Text>
                        </Text>
                        {w.running && (
                          <View style={styles.tag}>
                            <Text style={styles.tagText}>
                              {w.runningLabel ?? 'সেলাই চলছে'}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.pieces}>
                        {toBnDigits(w.pieces)} পিস
                      </Text>
                      <Text style={styles.wage}>{takaBn(workAmount(w))}</Text>
                    </View>
                  ))}
                </Pressable>
              );
            })}
          </LedgerPanel>

          <View style={styles.footerSpace} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.md },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.ink,
    marginTop: spacing.md,
    marginBottom: 7,
    marginHorizontal: 2,
  },
  blockDivider: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  blockPressed: { backgroundColor: colors.background },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  khead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fontFamily.bold, fontSize: 14, lineHeight: 18 },
  kheadMain: { flex: 1, gap: 1 },
  kname: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.ink,
  },
  krole: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    lineHeight: 14,
    color: colors.textSecondary,
  },
  earn: { alignItems: 'flex-end', gap: 1 },
  earnValue: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    lineHeight: 19,
    color: colors.ink,
  },
  earnLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    lineHeight: 13,
    color: colors.textSecondary,
  },
  krow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  garmentCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  garment: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink,
    flexShrink: 1,
  },
  garmentMeta: { fontSize: 11, color: colors.textSecondary },
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
  pieces: {
    width: 64,
    textAlign: 'right',
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  wage: {
    width: 70,
    textAlign: 'right',
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink,
  },
  footerSpace: { height: spacing.lg },
});
