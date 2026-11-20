import { useRouter } from 'expo-router';
import { ChevronLeft, Search } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  colors,
  controlHeight,
  fontFamily,
  radius,
  spacing,
  typography,
} from '../theme';

/* ------------------------------------------------------------------ */
/* Avatar — circular initial, tint rotates through the muted palette   */
/* (circles are allowed for avatars per DESIGN.md).                    */
/* ------------------------------------------------------------------ */

const AVATAR_TINTS = [
  { bg: colors.primaryTint, fg: colors.primary },
  { bg: colors.slateTint, fg: colors.slateBlue },
  { bg: colors.mustardTint, fg: colors.mustard },
  { bg: colors.slateNeutralTint, fg: colors.slate },
  { bg: colors.roseTint, fg: colors.rose },
];

export function CustomerAvatar({
  name,
  index = 0,
  size = 40,
}: {
  name: string;
  index?: number;
  size?: number;
}) {
  const tint = AVATAR_TINTS[Math.abs(index) % AVATAR_TINTS.length];
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: tint.bg,
        },
      ]}
    >
      <Text
        style={{
          fontFamily: fontFamily.semiBold,
          fontSize: size * 0.42,
          lineHeight: size * 0.55,
          color: tint.fg,
        }}
      >
        {name.trim().charAt(0)}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* SearchField — the name/phone search box used on list screens.       */
/* ------------------------------------------------------------------ */

export function SearchField({
  value,
  onChangeText,
  placeholder = 'নাম বা মোবাইল নম্বর',
  prominent = false,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** Slightly taller — when finding is the screen's main job (মাপ ট্যাব). */
  prominent?: boolean;
}) {
  return (
    <View style={[styles.searchField, prominent && styles.searchProminent]}>
      <Search size={18} color={colors.textFaint} strokeWidth={1.8} />
      <TextInput
        style={styles.searchInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* BackHeader — white bar with back chevron + title (stack screens).   */
/* ------------------------------------------------------------------ */

export function BackHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <View style={styles.headerBar}>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        accessibilityLabel="ফিরে যান"
      >
        <ChevronLeft size={24} color={colors.ink} strokeWidth={2} />
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: controlHeight,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.control,
    paddingHorizontal: spacing.md,
  },
  searchProminent: { height: 48 },
  searchInput: {
    ...typography.body,
    flex: 1,
    color: colors.ink,
    padding: 0,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  headerTitle: { ...typography.screenTitle, color: colors.ink, flex: 1 },
});
