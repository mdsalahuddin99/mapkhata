import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LabeledInput, SelectChips } from '../../src/components/AuthBits';
import { PrimaryButton } from '../../src/components/Buttons';
import { BackHeader } from '../../src/components/CustomerBits';
import { shop } from '../../src/data/mock';
import { colors, radius, spacing, typography } from '../../src/theme';

const SHOP_TYPES = ['টেইলার্স', 'বুটিক', 'দুটোই'] as const;

/**
 * দোকানের প্রোফাইল (Package G) — editable form prefilled from the
 * mock shop. Local state only: nothing persists yet (no shop store);
 * persistence lands with Supabase. Saving shows the "সেভ হয়েছে" note
 * inline, then goes back.
 */
export default function ShopProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState(shop.name);
  const [owner, setOwner] = useState(shop.ownerName);
  const [phone, setPhone] = useState(shop.phone);
  // shop.area is "এলিফ্যান্ট রোড, ঢাকা" — split into বাজার / জেলা fields.
  const [address, setAddress] = useState(shop.area.split(',')[0].trim());
  const [district, setDistrict] = useState(
    shop.area.split(',')[1]?.trim() ?? '',
  );
  const [type, setType] = useState<string>('টেইলার্স');
  const [saved, setSaved] = useState(false);

  const onSave = () => {
    setSaved(true);
    setTimeout(() => router.back(), 900);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="দোকানের প্রোফাইল" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <View style={styles.panel}>
            <LabeledInput
              label="দোকানের নাম"
              value={name}
              onChangeText={setName}
              placeholder="দোকানের নাম"
            />
            <LabeledInput
              label="মালিকের নাম"
              value={owner}
              onChangeText={setOwner}
              placeholder="মালিকের নাম"
              gap
            />
            <LabeledInput
              label="মোবাইল নম্বর"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="01XXXXXXXXX"
              gap
            />
            <LabeledInput
              label="ঠিকানা / বাজার"
              value={address}
              onChangeText={setAddress}
              placeholder="যেমন: এলিফ্যান্ট রোড"
              gap
            />
            <LabeledInput
              label="জেলা"
              value={district}
              onChangeText={setDistrict}
              placeholder="যেমন: ঢাকা"
              gap
            />
            <Text style={styles.fieldLabel}>দোকানের ধরন</Text>
            <SelectChips
              options={SHOP_TYPES}
              value={type}
              onChange={setType}
            />
          </View>

          {saved && (
            <View style={styles.savedNote}>
              <Check size={15} color={colors.primary} strokeWidth={2.4} />
              <Text style={styles.savedText}>সেভ হয়েছে</Text>
            </View>
          )}
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
  savedNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginTop: spacing.md,
  },
  savedText: { ...typography.label, color: colors.primary },
  saveWrap: { marginTop: spacing.md },
  footerSpace: { height: spacing.lg },
});
