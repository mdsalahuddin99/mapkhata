import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../src/components/Buttons';
import {
  BackHeader,
  CustomerAvatar,
} from '../../src/components/CustomerBits';
import { LedgerPanel } from '../../src/components/LedgerRow';
import { toBnDigits } from '../../src/data/mock';
import { useStaff } from '../../src/store/staff';
import { colors, spacing, typography } from '../../src/theme';

/**
 * স্টাফ (Package G) — the people who run the shop counter (ম্যানেজার,
 * কাটিং মাস্টার, সহকারী), read from the staff store so a member added
 * on the form appears here at once. Karigars are NOT staff — their
 * piece-rate হিসাব lives in the কারিগর ট্যাব (noted under the list).
 */
export default function StaffListScreen() {
  const router = useRouter();
  const staffList = useStaff();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="স্টাফ" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>
              স্টাফ — {toBnDigits(staffList.length)} জন
            </Text>
            <PrimaryButton
              compact
              label="স্টাফ যোগ"
              onPress={() => router.push('/shop/staff-new' as never)}
              icon={<Plus size={18} color="#FFFFFF" strokeWidth={2.2} />}
            />
          </View>

          <LedgerPanel>
            {staffList.map((member, i) => (
              <View
                key={member.id}
                style={[
                  styles.row,
                  i < staffList.length - 1 && styles.divider,
                ]}
              >
                <CustomerAvatar name={member.name} index={i} size={40} />
                <View style={styles.rowMain}>
                  <Text style={styles.rowName} numberOfLines={1}>
                    {member.name}
                  </Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {member.role} · {toBnDigits(member.phone)}
                  </Text>
                </View>
              </View>
            ))}
          </LedgerPanel>

          <Text style={styles.note}>
            কারিগররা স্টাফ নন — পিস-রেটে কাজ করা কারিগরদের হিসাব কারিগর
            ট্যাবে থাকে।
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
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginHorizontal: 2,
  },
  sectionTitle: { ...typography.sectionTitle, color: colors.ink },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 64,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  rowMain: { flex: 1, gap: 2 },
  rowName: { ...typography.bodySemiBold, color: colors.ink },
  rowMeta: { ...typography.label, color: colors.textSecondary },
  note: {
    ...typography.label,
    color: colors.textFaint,
    marginTop: spacing.md,
    marginHorizontal: 2,
  },
  footerSpace: { height: spacing.lg },
});
