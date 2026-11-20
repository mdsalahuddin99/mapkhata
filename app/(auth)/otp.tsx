import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../src/components/Buttons';
import { BackHeader } from '../../src/components/CustomerBits';
import { toBnDigits } from '../../src/data/mock';
import {
  colors,
  fontFamily,
  radius,
  spacing,
  typography,
} from '../../src/theme';

/** Demo OTP — no SMS backend yet (Package F). Only this code verifies. */
export const DEMO_OTP = '1234';
const RESEND_SECONDS = 30;

/**
 * OTP যাচাই (Package F — demo). One visually-hidden input drives four
 * boxes. Only the demo code ১২৩৪ verifies; a wrong code shows an
 * inline error. Resend is a ৩০-second countdown label — after it runs
 * out, the resend button just restarts the countdown (no SMS is sent).
 * Success goes to the new-shop setup flow; existing shops can skip
 * straight to the tabs home.
 */
export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string }>();
  const phone = (params.phone ?? '').replace(/\D/g, '');
  const inputRef = useRef<React.ElementRef<typeof TextInput>>(null);

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const onVerify = () => {
    if (code.length < 4) {
      setError('৪ ডিজিটের কোড দিন।');
      return;
    }
    if (code !== DEMO_OTP) {
      setError('কোড মিলছে না। আবার চেষ্টা করুন — ডেমো কোড ১২৩৪।');
      return;
    }
    router.push('/setup' as never);
  };

  const onResend = () => {
    setCode('');
    setError(null);
    setSecondsLeft(RESEND_SECONDS);
    inputRef.current?.focus();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="OTP যাচাই" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <View style={styles.panel}>
            <Text style={styles.panelText}>
              কোড পাঠানো হয়েছে{' '}
              <Text style={styles.phoneText}>
                {phone ? toBnDigits(phone) : 'আপনার নম্বরে'}
              </Text>
            </Text>

            <Pressable
              style={styles.boxesWrap}
              onPress={() => inputRef.current?.focus()}
            >
              <View style={styles.boxes} pointerEvents="none">
                {[0, 1, 2, 3].map((i) => {
                  const digit = code[i];
                  const active = code.length === i;
                  return (
                    <View
                      key={i}
                      style={[
                        styles.box,
                        active && styles.boxActive,
                        error ? styles.boxError : null,
                      ]}
                    >
                      <Text style={styles.boxDigit}>
                        {digit ? toBnDigits(digit) : ''}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <TextInput
                ref={inputRef}
                style={styles.hiddenInput}
                value={code}
                onChangeText={(t) => {
                  setCode(t.replace(/\D/g, '').slice(0, 4));
                  setError(null);
                }}
                keyboardType="number-pad"
                maxLength={4}
                autoFocus
                caretHidden
                accessibilityLabel="OTP কোড"
              />
            </Pressable>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.demoPanel}>
              <Text style={styles.demoText}>
                ডেমো মোড — এখনো SMS যুক্ত হয়নি। ডেমো কোড:{' '}
                <Text style={styles.demoCode}>{toBnDigits(DEMO_OTP)}</Text>
              </Text>
            </View>

            <View style={styles.buttonGap}>
              <PrimaryButton label="যাচাই করুন" onPress={onVerify} />
            </View>

            {secondsLeft > 0 ? (
              <Text style={styles.resendWait}>
                আবার কোড পাঠাতে {toBnDigits(secondsLeft)} সেকেন্ড অপেক্ষা করুন
              </Text>
            ) : (
              <Pressable
                onPress={onResend}
                style={({ pressed }) => [
                  styles.resendBtn,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.resendLabel}>আবার কোড পাঠান</Text>
              </Pressable>
            )}
          </View>

          <Pressable
            onPress={() => router.replace('/(tabs)' as never)}
            style={({ pressed }) => [styles.skipBtn, pressed && styles.pressed]}
          >
            <Text style={styles.skipLabel}>
              আগের দোকান আছে? সরাসরি ঢুকুন
            </Text>
          </Pressable>
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
    paddingVertical: spacing.lg,
  },
  panelText: { ...typography.body, color: colors.textSecondary },
  phoneText: { ...typography.bodySemiBold, color: colors.ink },
  boxesWrap: { marginTop: spacing.lg, position: 'relative' },
  boxes: { flexDirection: 'row', gap: spacing.sm + 2 },
  box: {
    width: 52,
    height: 56,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: { borderColor: colors.primary },
  boxError: { borderColor: colors.danger },
  boxDigit: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: fontFamily.semiBold,
    color: colors.ink,
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    color: 'transparent',
  },
  errorText: {
    ...typography.label,
    color: colors.danger,
    marginTop: spacing.sm,
  },
  demoPanel: {
    marginTop: spacing.lg,
    backgroundColor: colors.primaryTint,
    borderRadius: radius.control,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  demoText: { ...typography.label, color: colors.primary },
  demoCode: { fontFamily: fontFamily.bold, color: colors.primary },
  buttonGap: { marginTop: spacing.lg },
  resendWait: {
    ...typography.label,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  resendBtn: { alignSelf: 'center', marginTop: spacing.md, padding: spacing.xs },
  resendLabel: { ...typography.bodySemiBold, color: colors.primary },
  skipBtn: { alignSelf: 'center', marginTop: spacing.lg, padding: spacing.xs },
  skipLabel: { ...typography.bodySemiBold, color: colors.textSecondary },
  pressed: { opacity: 0.6 },
});
