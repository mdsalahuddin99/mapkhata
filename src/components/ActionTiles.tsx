import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

interface ActionTileProps {
  label: string;
  /** A lucide icon element, coloured by the caller for the variant. */
  icon: React.ReactNode;
  /** 'primary' = filled green tile (the screen's one main job); 'surface' = white hairline tile. */
  variant?: 'primary' | 'surface';
  onPress?: () => void;
}

/**
 * v1.1 clean action tile: one recognisable icon + one short label.
 * Used as a single row of 3 directly under the header band — the screen's
 * main actions, not a decorative icon grid (DESIGN.md v1 rule 5 stands).
 * Flat, radius 8, no shadow; well over the 48px touch-target minimum.
 */
export function ActionTile({ label, icon, variant = 'surface', onPress }: ActionTileProps) {
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        primary ? styles.tilePrimary : styles.tileSurface,
        pressed && (primary ? styles.tilePrimaryPressed : styles.tileSurfacePressed),
      ]}
    >
      {icon}
      <Text style={[styles.label, { color: primary ? colors.onPrimary : colors.ink }]}>
        {label}
      </Text>
    </Pressable>
  );
}

/** The row that holds the action tiles (gap from the 4pt scale). */
export function ActionTileRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  tile: {
    flex: 1,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 60,
  },
  tilePrimary: { backgroundColor: colors.primary },
  tilePrimaryPressed: { backgroundColor: colors.primaryPressed },
  tileSurface: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  tileSurfacePressed: { backgroundColor: colors.background },
  label: { ...typography.actionTileLabel },
});
