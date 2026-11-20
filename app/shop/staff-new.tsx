import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LabeledInput, SelectChips } from '../../src/components/AuthBits';
import { PrimaryButton } from '../../src/components/Buttons';
import { BackHeader } from '../../src/components/CustomerBits';
import { StaffPermissions } from '../../src/data/mock';
import { addStaff } from '../../src/store/staff';
import { colors, radius, spacing, typography } from '../../src/theme';

const ROLES = ['ম্যানেজার', 'কাটিং মাস্টার', 'সহকারী'] as const;

const PERMISSION_ROWS: {
  key: keyof StaffPermissions;
  label: string;
  meta: string;
}[] = [
  { key: 'orders', label: 'অর্ডার নেওয়া', meta: 'নতুন অর্ডার তৈরি ও স্ট্যাটাস বদল' },
  { key: 'collect', label: 'টাকা জমা', meta: 'কাস্টমারের বকেয়া জমা নেওয়া' },
  { key: 'reports', label: 'রিপোর্ট দেখা', meta: 'দৈনিক ও মাসিক আয়ের হিসাব' },
];

/**
 * স্টাফ যোগ (Package G) — name, mobile, role chips, and permission
 * switches. Saving writes to the staff store, so the new member is on
 * the স্টাফ list as soon as we go back.
 */
export default function NewStaffScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<string>('সহকারী');
  const [permissions, setPermissions] = useState<StaffPermissions>({
    orders: true,
    collect: false,
    reports: false,
  });
  const [error, setError] = useState<string | null>(null);

  const onSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('স্টাফের নাম দিন।');
      return;
    }
    addStaff({
      name: trimmed,
      phone: phone.trim(),
      role,
      permissions,
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="স্টাফ যোগ" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <View style={styles.panel}>
            <LabeledInput
              label="নাম"
              value={name}
              onChangeText={(t) => {
                setName(t);
                setError(null);
              }}
              placeholder="স্টাফের নাম"
              error={error}
            />
            <LabeledInput
              label="মোবাইল নম্বর"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="01XXXXXXXXX"
              gap
            />
            <Text style={styles.fieldLabel}>ভূমিকা</Text>
            <SelectChips options={ROLES} value={role} onChange={setRole} />
          </View>

          <Text style={styles.sectionTitle}>অনুমতি</Text>
          <View style={styles.panel}>
            {PERMISSION_ROWS.map((row, i) => (
              <View
                key={row.key}
                style={[styles.permRow, i > 0 && styles.permDivider]}
              >
                <View style={styles.permMain}>
                  <Text style={styles.permLabel}>{row.label}</Text>
                  <Text style={styles.permMeta} numberOfLines={1}>
                    {row.meta}
                  </Text>
                </View>
                <Switch
                  value={permissions[row.key]}
                  onValueChange={(v) =>
                    setPermissions((prev) => ({ ...prev, [row.key]: v }))
                  }
                  trackColor={{ false: colors.hairline, true: colors.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={colors.hairline}
                />
              </View>
            ))}
          </View>

          <View style={styles.saveWrap}>
            <PrimaryButton label="সেভ করুন" onPress={onSave} />
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
  panel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs + 2,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.ink,
    marginTop: spacing.lg,
    marginBottom: 7,
    marginHorizontal: 2,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  permDivider: { borderTopWidth: 1, borderTopColor: colors.hairline },
  permMain: { flex: 1, gap: 1 },
  permLabel: { ...typography.bodySemiBold, color: colors.ink },
  permMeta: { ...typography.label, color: colors.textSecondary },
  saveWrap: { marginTop: spacing.md },
  footerSpace: { height: spacing.lg },
});
