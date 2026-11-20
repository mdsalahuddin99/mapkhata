import { colors } from '../theme';
import { toBnDigits } from './mock';

/* ------------------------------------------------------------------ */
/* Superadmin (Package I) — the SaaS operator's view of every shop    */
/* on MapKhata. This is DEMO seed data for the operator panel the      */
/* owner himself uses; it is separate from any one shop's own data     */
/* (src/data/mock.ts) and arrives from the platform backend later.     */
/* ------------------------------------------------------------------ */

export type AdminPlan = 'pro' | 'free' | 'trial';
export type AdminShopStatus = 'active' | 'expired' | 'trial';

export interface AdminShop {
  id: string;
  name: string;
  owner: string;
  district: string;
  /** Display format, same as elsewhere: "01712-445566". */
  phone: string;
  plan: AdminPlan;
  status: AdminShopStatus;
  joinedDaysAgo: number;
  /** Days until the current plan period ends; negative = already over. */
  renewalInDays: number;
  ordersThisMonth: number;
  smsBalance: number;
  lastActiveDaysAgo: number;
}

/** প্রো plan price — the same ৳৪৯৯/মাস the plan screen (Package F) shows. */
export const PRO_PRICE = 499;

/**
 * SMS pack income this month, as ONE seeded figure. Pack sales have no
 * ledger in the demo data yet, so — unlike every other figure on the
 * admin screens, which is derived from `adminShops` below — this is a
 * constant, and the dashboard labels it as this month's pack sales.
 * The payment backend replaces it later.
 */
export const SMS_INCOME_THIS_MONTH = 1850;

export const adminShops: AdminShop[] = [
  {
    // The demo shop from mock.ts — same name/owner/phone, প্রো plan,
    // renewal +18 days and SMS balance 120 as its own subscription
    // screen (Package G) shows.
    id: 'a1',
    name: 'নিউ স্টার টেইলার্স',
    owner: 'মোঃ আব্দুল মালেক',
    district: 'ঢাকা',
    phone: '01812-345678',
    plan: 'pro',
    status: 'active',
    joinedDaysAgo: 96,
    renewalInDays: 18,
    ordersThisMonth: 142,
    smsBalance: 120,
    lastActiveDaysAgo: 0,
  },
  {
    id: 'a2',
    name: 'আল-আমিন টেইলার্স',
    owner: 'মোঃ আল-আমিন',
    district: 'ব্রাহ্মণবাড়িয়া',
    phone: '01715-902341',
    plan: 'pro',
    status: 'active',
    joinedDaysAgo: 61,
    renewalInDays: 3,
    ordersThisMonth: 98,
    smsBalance: 25,
    lastActiveDaysAgo: 0,
  },
  {
    id: 'a3',
    name: 'রূপসী বুটিক হাউস',
    owner: 'শারমিন সুলতানা',
    district: 'কুমিল্লা',
    phone: '01823-456701',
    plan: 'pro',
    status: 'active',
    joinedDaysAgo: 45,
    renewalInDays: 15,
    ordersThisMonth: 76,
    smsBalance: 210,
    lastActiveDaysAgo: 1,
  },
  {
    id: 'a4',
    name: 'চট্টলা ফ্যাশন টেইলার্স',
    owner: 'দেলোয়ার হোসেন',
    district: 'চট্টগ্রাম',
    phone: '01917-334455',
    plan: 'pro',
    status: 'active',
    joinedDaysAgo: 120,
    renewalInDays: 6,
    ordersThisMonth: 167,
    smsBalance: 64,
    lastActiveDaysAgo: 0,
  },
  {
    id: 'a5',
    name: 'সিলেট বুটিক কর্নার',
    owner: 'ফারহানা আক্তার',
    district: 'সিলেট',
    phone: '01762-889900',
    plan: 'free',
    status: 'active',
    joinedDaysAgo: 38,
    renewalInDays: 22,
    ordersThisMonth: 24,
    smsBalance: 0,
    lastActiveDaysAgo: 2,
  },
  {
    id: 'a6',
    name: 'রাজশাহী নিউ লুক টেইলার্স',
    owner: 'মাহমুদুল হাসান',
    district: 'রাজশাহী',
    phone: '01845-667788',
    plan: 'trial',
    status: 'trial',
    joinedDaysAgo: 9,
    renewalInDays: 5,
    ordersThisMonth: 17,
    smsBalance: 50,
    lastActiveDaysAgo: 0,
  },
  {
    id: 'a7',
    name: 'খুলনা স্টাইল পয়েন্ট',
    owner: 'তানিয়া রহমান',
    district: 'খুলনা',
    phone: '01928-112233',
    plan: 'pro',
    status: 'expired',
    joinedDaysAgo: 210,
    renewalInDays: -4,
    ordersThisMonth: 0,
    smsBalance: 12,
    lastActiveDaysAgo: 11,
  },
  {
    id: 'a8',
    name: 'ময়মনসিংহ দর্জি বাড়ি',
    owner: 'আব্দুর রহিম',
    district: 'ময়মনসিংহ',
    phone: '01739-445566',
    plan: 'trial',
    status: 'trial',
    joinedDaysAgo: 3,
    renewalInDays: 11,
    ordersThisMonth: 8,
    smsBalance: 50,
    lastActiveDaysAgo: 1,
  },
];

/* ------------------------------------------------------------------ */
/* Plan / status presentation (chip colours follow DESIGN.md tints)    */
/* ------------------------------------------------------------------ */

export const planMeta: Record<
  AdminPlan,
  { label: string; color: string; tint: string }
> = {
  pro: { label: 'প্রো', color: colors.primary, tint: colors.primaryTint },
  free: { label: 'ফ্রি', color: colors.slate, tint: colors.slateNeutralTint },
  trial: { label: 'ট্রায়াল', color: colors.mustard, tint: colors.mustardTint },
};

export const adminStatusMeta: Record<
  AdminShopStatus,
  { label: string; color: string }
> = {
  active: { label: 'সক্রিয়', color: colors.primary },
  trial: { label: 'ট্রায়ালে', color: colors.mustard },
  expired: { label: 'মেয়াদ শেষ', color: colors.danger },
};

/* ------------------------------------------------------------------ */
/* Derived figures — every total on the admin screens comes from       */
/* these helpers over `adminShops`, never from a typed-in number.      */
/* ------------------------------------------------------------------ */

/** Shops actually paying: প্রো plan and not expired. */
export function payingShops(): AdminShop[] {
  return adminShops.filter((s) => s.plan === 'pro' && s.status === 'active');
}

export function trialShops(): AdminShop[] {
  return adminShops.filter((s) => s.status === 'trial');
}

/** Monthly recurring revenue from subscriptions: paying shops × ৳৪৯৯. */
export function subscriptionMrr(): number {
  return payingShops().length * PRO_PRICE;
}

/** Period ends within 7 days (expired ones included), soonest first. */
export function expiringShops(withinDays = 7): AdminShop[] {
  return adminShops
    .filter((s) => s.renewalInDays <= withinDays)
    .sort((a, b) => a.renewalInDays - b.renewalInDays);
}

/** SMS balance running low (below 30), lowest first. */
export function lowSmsShops(threshold = 30): AdminShop[] {
  return adminShops
    .filter((s) => s.smsBalance < threshold)
    .sort((a, b) => a.smsBalance - b.smsBalance);
}

/** Most recently joined first. */
export function recentShops(): AdminShop[] {
  return [...adminShops].sort((a, b) => a.joinedDaysAgo - b.joinedDaysAgo);
}

export function findAdminShop(id: string): AdminShop | undefined {
  return adminShops.find((s) => s.id === id);
}

/* ------------------------------------------------------------------ */
/* Labels (Bengali digits everywhere)                                  */
/* ------------------------------------------------------------------ */

export function joinedLabel(daysAgo: number): string {
  if (daysAgo === 0) return 'আজ যোগ দিয়েছে';
  if (daysAgo === 1) return 'গতকাল যোগ দিয়েছে';
  return `${toBnDigits(daysAgo)} দিন আগে যোগ দিয়েছে`;
}

export function lastActiveLabel(daysAgo: number): string {
  if (daysAgo === 0) return 'আজ সক্রিয়';
  if (daysAgo === 1) return 'গতকাল সক্রিয়';
  return `${toBnDigits(daysAgo)} দিন আগে সক্রিয়`;
}

/** "৩ দিন বাকি" / "আজই শেষ" / "মেয়াদ শেষ" (with how long ago). */
export function renewalLabel(shop: AdminShop): string {
  if (shop.renewalInDays < 0) {
    return shop.renewalInDays === -1
      ? 'মেয়াদ শেষ (গতকাল)'
      : `মেয়াদ শেষ (${toBnDigits(-shop.renewalInDays)} দিন আগে)`;
  }
  if (shop.renewalInDays === 0) return 'আজই শেষ';
  return `${toBnDigits(shop.renewalInDays)} দিন বাকি`;
}
