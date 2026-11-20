import { useRouter } from 'expo-router';
import { ImagePlus } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LabeledInput, SelectChips } from '../../src/components/AuthBits';
import { PrimaryButton } from '../../src/components/Buttons';
import { BackHeader } from '../../src/components/CustomerBits';
import { colors, radius, spacing, typography } from '../../src/theme';

const SHOP_TYPES = ['টেইলার্স', 'বুটিক', 'দুটোই'] as const;

/**
 * দোকান সেটআপ (Package F — UI only). New-shop profile form after the
 * demo OTP: shop name + owner name are required, everything else has a
 * sensible default. The logo button is visual only — image picking
 * lands with the backend. Save moves to plan selection; nothing is
 * persisted yet.
 */
export default function SetupScreen() {
  const router = useRouter();
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [shopType, setShopType] = useState<string>('টেইলার্স');
  const [errors, setErrors] = useState<{ shop?: string; owner?: string }>({});

  const onSave = () => {
    const next: { shop?: string; owner?: string } = {};
    if (!shopName.trim()) next.shop = 'দোকানের নাম দিন।';
    if (!ownerName.trim()) next.owner = 'মালিকের নাম দিন।';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    router.push('/plan' as never);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="দোকান সেটআপ" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <View style={styles.logoRow}>
            <Pressable
              style={({ pressed }) => [
                styles.logoCircle,
                pressed && styles.pressed,
              ]}
              accessibilityLabel="দোকানের ছবি দিন"
            >
              <ImagePlus size={22} color={colors.primary} strokeWidth={1.8} />
            </Pressable>
            <View style={styles.logoTextBlock}>
              <Text style={styles.logoTitle}>দোকানের লোগো</Text>
              <Pressable
                style={({ pressed }) => pressed && styles.pressed}
                accessibilityLabel="ছবি দিন"
              >
                <Text style={styles.logoAction}>ছবি দিন</Text>
              </Pressable>
              <Text style={styles.logoHint}>না দিলেও চলবে — পরে দেওয়া যাবে।</Text>
            </View>
          </View>

          <View style={styles.panel}>
            <LabeledInput
              label="দোকানের নাম"
              value={shopName}
              onChangeText={(t) => {
                setShopName(t);
                setErrors((e) => ({ ...e, shop: undefined }));
              }}
              placeholder="যেমন: নিউ স্টার টেইলার্স"
              error={errors.shop}
            />
            <LabeledInput
              label="মালিকের নাম"
              gap
              value={ownerName}
              onChangeText={(t) => {
                setOwnerName(t);
                setErrors((e) => ({ ...e, owner: undefined }));
              }}
              placeholder="আপনার নাম"
              error={errors.owner}
            />
            <LabeledInput
              label="ঠিকানা / বাজার"
              gap
              value={address}
              onChangeText={setAddress}
              placeholder="যেমন: এলিফ্যান্ট রোড"
            />
            <LabeledInput
              label="জেলা"
              gap
              value={district}
              onChangeText={setDistrict}
              placeholder="যেমন: ঢাকা"
            />
            <Text style={styles.chipLabel}>দোকানের ধরন</Text>
            <SelectChips
              options={SHOP_TYPES}
              value={shopType}
              onChange={setShopType}
            />
          </View>

          <View style={styles.buttonGap}>
            <PrimaryButton label="সংরক্ষণ করে এগিয়ে যান" onPress={onSave} />
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
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
    marginHorizontal: 2,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryTint,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTextBlock: { flex: 1, gap: 1 },
  logoTitle: { ...typography.bodySemiBold, color: colors.ink },
  logoAction: { ...typography.bodySemiBold, color: colors.primary },
  logoHint: { ...typography.label, color: colors.textFaint },
  panel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  chipLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs + 2,
  },
  buttonGap: { marginTop: spacing.md },
  footerSpace: { height: spacing.lg },
  pressed: { opacity: 0.6 },
});
