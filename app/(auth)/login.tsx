import { useRouter } from 'expo-router';
import { Ruler } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LabeledInput } from '../../src/components/AuthBits';
import { PrimaryButton } from '../../src/components/Buttons';
import { colors, radius, spacing, typography } from '../../src/theme';

/** BD mobile: 11 digits, starts 01, third digit 3–9. */
const BD_MOBILE = /^01[3-9]\d{8}$/;

/**
 * লগইন (Package F — UI only, no auth backend yet). bKash-style entry:
 * flat green band with the app name + one-line promise, then a white
 * sheet with the mobile number. A valid number moves to the OTP screen
 * with the phone as a route param; Supabase phone auth replaces the
 * demo flow later.
 */
export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSendOtp = () => {
    const digits = phone.replace(/\D/g, '');
    if (!BD_MOBILE.test(digits)) {
      setError('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (01 দিয়ে শুরু)।');
      return;
    }
    router.push({ pathname: '/otp' as never, params: { phone: digits } });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.band}>
          <View style={styles.logoCircle}>
            <Ruler size={26} color={colors.primary} strokeWidth={2} />
          </View>
          <Text style={styles.appName}>মাপখাতা</Text>
          <Text style={styles.promise}>
            মাপের খাতা, অর্ডার আর বকেয়ার হিসাব — এখন মোবাইলে
          </Text>
        </View>

        <View style={styles.sheet}>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>লগইন করুন</Text>
            <Text style={styles.panelSub}>
              আপনার মোবাইল নম্বরে একটি OTP কোড পাঠানো হবে।
            </Text>
            <View style={styles.formGap}>
              <LabeledInput
                label="মোবাইল নম্বর"
                value={phone}
                onChangeText={(t) => {
                  setPhone(t.replace(/\D/g, '').slice(0, 11));
                  setError(null);
                }}
                keyboardType="phone-pad"
                placeholder="01XXXXXXXXX"
                error={error}
              />
            </View>
            <View style={styles.buttonGap}>
              <PrimaryButton label="OTP পাঠান" onPress={onSendOtp} />
            </View>
          </View>

          <Text style={styles.footerNote}>
            চালিয়ে যাওয়া মানে আপনি মাপখাতার শর্তাবলি ও গোপনীয়তা নীতিতে
            সম্মতি দিচ্ছেন।
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  band: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + spacing.sm,
    paddingBottom: spacing.xxl + spacing.lg,
    alignItems: 'flex-start',
  },
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: 28,
    lineHeight: 36,
    fontFamily: typography.screenTitle.fontFamily,
    color: colors.onPrimary,
  },
  promise: {
    ...typography.body,
    color: colors.onPrimarySoft,
    marginTop: spacing.xs,
  },
  sheet: {
    marginTop: -spacing.lg,
    paddingHorizontal: spacing.md,
  },
  panel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  panelTitle: { ...typography.screenTitle, color: colors.ink, fontSize: 18 },
  panelSub: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  formGap: { marginTop: spacing.lg },
  buttonGap: { marginTop: spacing.lg },
  footerNote: {
    ...typography.label,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginHorizontal: spacing.md,
  },
});
