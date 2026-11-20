/**
 * MapKhata theme — every token comes from DESIGN.md (locked v1 + v1.1).
 * Rules enforced here: max radius 8, no card/button shadows, no gradients,
 * flat surfaces divided by 1px hairlines, one primary colour.
 * v1.1 adds the bKash/Nagad-style cleanliness tokens: the flat primary
 * header band, its translucent balance panel, action tiles, mini stat strip.
 */

export const colors = {
  ink: '#1B1E23',
  textSecondary: '#5C636B',
  textFaint: '#8A9199',
  background: '#F7F6F3', // warm paper
  surface: '#FFFFFF',
  hairline: '#E4E1DA',
  primary: '#0E4F3C', // deep tailor green
  primaryPressed: '#093C2D',
  primaryTint: '#E7F0EC',
  amber: '#B45309', // due / urgent only
  amberTint: '#FBF0DC',
  danger: '#B42318',
  dangerTint: '#FAECEA',
  slateBlue: '#3E5C76',
  slateTint: '#EAF0F5',
  mustard: '#7C5C10',
  mustardTint: '#F6EFD8', // derived tint (DESIGN.md names the mustard, not its tint)
  slate: '#64707A', // "মাপ নেওয়া" slate (DESIGN.md: slate; সেলাই uses slateBlue)
  slateNeutralTint: '#EDF0F2',
  rose: '#9A3B2E', // v1.2: home-grid "দোকান" icon (muted rose, not bKash-bright)
  roseTint: '#F7E8E4', // v1.2: home-grid rose tint background
  neutralTint: '#EFEDE9', // delivered (neutral ink) chip background
  // v1.1 header band (flat primary surface, text/panels on top of it)
  onPrimary: '#FFFFFF',
  onPrimarySoft: 'rgba(255,255,255,0.85)', // context line / balance labels on the band
  bandPanelBg: 'rgba(255,255,255,0.12)', // balance panel fill inside the band
  bandPanelBorder: 'rgba(255,255,255,0.25)', // balance panel border inside the band
} as const;

export type OrderStatusKey =
  | 'measured'
  | 'cutting'
  | 'sewing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export const statusMeta: Record<
  OrderStatusKey,
  { label: string; color: string; tint: string }
> = {
  measured: { label: 'মাপ নেওয়া', color: colors.slate, tint: colors.slateNeutralTint },
  cutting: { label: 'কাটিং', color: colors.mustard, tint: colors.mustardTint },
  sewing: { label: 'সেলাই', color: colors.slateBlue, tint: colors.slateTint },
  ready: { label: 'রেডি', color: colors.primary, tint: colors.primaryTint },
  delivered: { label: 'ডেলিভারি সম্পন্ন', color: colors.ink, tint: colors.neutralTint },
  cancelled: { label: 'বাতিল', color: colors.danger, tint: colors.dangerTint },
};

export const radius = {
  chip: 4,
  control: 6, // buttons + inputs
  card: 8, // max anywhere in the app
  sheetTop: 12, // v1.2 exception: white sheet over the home band only (DESIGN.md v1.2)
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

/** Hind Siliguri family names as registered by @expo-google-fonts/hind-siliguri. */
export const fontFamily = {
  regular: 'HindSiliguri_400Regular',
  medium: 'HindSiliguri_500Medium',
  semiBold: 'HindSiliguri_600SemiBold',
  bold: 'HindSiliguri_700Bold',
} as const;

export const typography = {
  screenTitle: { fontSize: 20, lineHeight: 26, fontFamily: fontFamily.bold },
  sectionTitle: { fontSize: 13, lineHeight: 18, fontFamily: fontFamily.semiBold },
  body: { fontSize: 14, lineHeight: 20, fontFamily: fontFamily.regular },
  bodySemiBold: { fontSize: 14, lineHeight: 20, fontFamily: fontFamily.semiBold },
  label: { fontSize: 12, lineHeight: 16, fontFamily: fontFamily.medium },
  chip: { fontSize: 11, lineHeight: 14, fontFamily: fontFamily.medium },
  statNumber: { fontSize: 22, lineHeight: 28, fontFamily: fontFamily.semiBold },
  tabLabel: { fontSize: 10, lineHeight: 12, fontFamily: fontFamily.medium },
  // v1.1 band / tiles / mini strip
  bandContext: { fontSize: 12, lineHeight: 16, fontFamily: fontFamily.medium },
  bandGreeting: { fontSize: 17, lineHeight: 24, fontFamily: fontFamily.semiBold },
  balanceLabel: { fontSize: 12, lineHeight: 16, fontFamily: fontFamily.medium },
  balanceValue: { fontSize: 20, lineHeight: 26, fontFamily: fontFamily.semiBold },
  balanceSideLabel: { fontSize: 11, lineHeight: 14, fontFamily: fontFamily.medium },
  balanceSideValue: { fontSize: 15, lineHeight: 20, fontFamily: fontFamily.semiBold },
  actionTileLabel: { fontSize: 12, lineHeight: 16, fontFamily: fontFamily.semiBold },
  miniStatValue: { fontSize: 16, lineHeight: 22, fontFamily: fontFamily.semiBold },
  miniStatLabel: { fontSize: 11, lineHeight: 14, fontFamily: fontFamily.medium },
  // v1.2 bKash-style home: band top row, balance pill, circular action grid
  bandShopName: { fontSize: 15, lineHeight: 20, fontFamily: fontFamily.semiBold },
  bandShopSub: { fontSize: 11, lineHeight: 14, fontFamily: fontFamily.regular },
  balancePill: { fontSize: 13, lineHeight: 18, fontFamily: fontFamily.semiBold },
  gridLabel: { fontSize: 12, lineHeight: 16, fontFamily: fontFamily.medium },
  morePill: { fontSize: 12, lineHeight: 16, fontFamily: fontFamily.semiBold },
} as const;

/** The ONLY shadow in the system — bottom sheets / modals (DESIGN.md rule 2). */
export const sheetShadow = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 16,
  elevation: 4,
} as const;

export const controlHeight = 44;
export const ledgerRowMinHeight = 64;

/**
 * Taka formatting with Bangladeshi (lakh) digit grouping, Latin digits,
 * e.g. 12500 -> "৳12,500", 150000 -> "৳1,50,000".
 */
export function formatTaka(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  const digits = Math.abs(Math.round(amount)).toString();
  let grouped = digits;
  if (digits.length > 3) {
    const last3 = digits.slice(-3);
    let rest = digits.slice(0, -3);
    const parts: string[] = [];
    while (rest.length > 2) {
      parts.unshift(rest.slice(-2));
      rest = rest.slice(0, -2);
    }
    if (rest) parts.unshift(rest);
    grouped = parts.join(',') + ',' + last3;
  }
  return `${sign}৳${grouped}`;
}
