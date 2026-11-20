import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import {
  colors,
  controlHeight,
  fontFamily,
  radius,
  spacing,
  typography,
} from '../theme';

/* ------------------------------------------------------------------ */
/* LabeledInput — label on top, 44px field, primary border on focus,   */
/* inline danger error under the field (Package F auth/setup forms).   */
/* ------------------------------------------------------------------ */

interface LabeledInputProps extends TextInputProps {
  label: string;
  error?: string | null;
  gap?: boolean;
}

export function LabeledInput({
  label,
  error,
  gap,
  style,
  ...rest
}: LabeledInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={gap && styles.gap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        {...rest}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        placeholderTextColor={colors.textFaint}
        style={[
          styles.input,
          { borderColor: focused ? colors.primary : colors.hairline },
          style,
        ]}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* SelectChips — single-select chip row (orders-tab chip style): the   */
/* selected chip fills primary, the rest stay white with a hairline.   */
/* ------------------------------------------------------------------ */

export function SelectChips({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.chipWrap}>
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { marginTop: spacing.lg },
  fieldLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs + 2,
  },
  input: {
    ...typography.body,
    height: controlHeight,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.control,
    paddingHorizontal: spacing.md,
    color: colors.ink,
    paddingVertical: 0,
  },
  errorText: {
    ...typography.label,
    color: colors.danger,
    marginTop: spacing.xs + 2,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.ink,
  },
  chipLabelSelected: { color: '#FFFFFF' },
});
