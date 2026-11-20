import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, OrderStatusKey, statusMeta, typography } from '../theme';

export function StatusChip({ status }: { status: OrderStatusKey }) {
  const meta = statusMeta[status];
  return (
    <View style={[styles.chip, { backgroundColor: meta.tint }]}>
      <View style={[styles.dot, { backgroundColor: meta.color }]} />
      <Text style={[styles.label, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { ...typography.chip },
});
