import { useSyncExternalStore } from 'react';
import {
  Karigar,
  KarigarWork,
  karigars as seedKarigars,
  workForKarigar,
} from '../data/mock';

/**
 * Tiny shared in-memory karigar store (Package D) — mirrors
 * src/store/orders.ts: module-level state, `useSyncExternalStore`,
 * immutable updates + listener fan-out, so the কারিগর tab, the detail
 * and the payment screen always agree. Supabase replaces the seed
 * behind this seam later; screens only see the hooks/functions below.
 *
 * Money model per karigar:
 *   earned (this month) = the mock aggregate `monthlyEarned`
 *   paid                = sum of `payments`
 *   due (পাওনা)         = max(0, earned − paid)
 * The seeded payments below are chosen so each karigar's paid total
 * equals `monthlyEarned − wageDue` — i.e. the derived due reproduces
 * the mock `wageDue` exactly (k1 ৳4,200, k2 ৳3,150, k3 ৳2,400,
 * k4 ৳1,800) while the detail screen still gets a real history.
 */

export interface KarigarPayment {
  amount: number;
  /** Day offset from today the payment was made (0 = আজ). */
  dateOffset: number;
  /** নগদ / বিকাশ / নাগদ — as picked on the payment screen. */
  method?: string;
}

export interface KarigarEntry extends Karigar {
  phone?: string;
  /** Default piece rates by garment label, from the নতুন কারিগর form. */
  pieceRates?: Record<string, number>;
  work: KarigarWork[];
  payments: KarigarPayment[];
}

export interface KarigarTotals {
  earned: number;
  paid: number;
  due: number;
}

/** Seed payment history per karigar id (sums = monthlyEarned − wageDue). */
const seedPayments: Record<string, KarigarPayment[]> = {
  // paid ৳2,100
  k1: [
    { amount: 1200, dateOffset: -6, method: 'নগদ' },
    { amount: 900, dateOffset: -13, method: 'বিকাশ' },
  ],
  // paid ৳2,250
  k2: [
    { amount: 1500, dateOffset: -5, method: 'নগদ' },
    { amount: 750, dateOffset: -12, method: 'বিকাশ' },
  ],
  // paid ৳1,700
  k3: [
    { amount: 1000, dateOffset: -4, method: 'নগদ' },
    { amount: 700, dateOffset: -11, method: 'নাগদ' },
  ],
  // paid ৳1,150
  k4: [
    { amount: 650, dateOffset: -3, method: 'নগদ' },
    { amount: 500, dateOffset: -10, method: 'বিকাশ' },
  ],
};

let currentKarigars: KarigarEntry[] = seedKarigars.map((k) => ({
  ...k,
  work: workForKarigar(k.id),
  payments: seedPayments[k.id] ?? [],
}));
let idCounter = 0;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): KarigarEntry[] {
  return currentKarigars;
}

/** All karigars with their work + payments (seed order; new ones appended). */
export function useKarigars(): KarigarEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Derived money totals for one karigar — due never below zero. */
export function karigarTotals(entry: KarigarEntry): KarigarTotals {
  const paid = entry.payments.reduce((sum, p) => sum + p.amount, 0);
  return {
    earned: entry.monthlyEarned,
    paid,
    due: Math.max(0, entry.monthlyEarned - paid),
  };
}

/** কারিগর tab summary, derived from the store (same rules as mock stats). */
export function karigarSummary(entries: KarigarEntry[]) {
  return {
    totalWageDue: entries.reduce(
      (sum, e) => sum + karigarTotals(e).due,
      0,
    ),
    karigarCount: entries.length,
    monthlyPieces: entries.reduce((sum, e) => sum + e.monthlyPieces, 0),
    monthlyPaid: entries.reduce(
      (sum, e) => sum + karigarTotals(e).paid,
      0,
    ),
  };
}

export interface NewKarigarInput {
  name: string;
  /** Stored as the karigar's `skill`. */
  role: string;
  phone?: string;
  pieceRates?: Record<string, number>;
}

/** Add a karigar with no work/payments yet; returns the new entry. */
export function addKarigar(input: NewKarigarInput): KarigarEntry {
  idCounter += 1;
  const entry: KarigarEntry = {
    id: `karigar-${idCounter}`,
    name: input.name,
    skill: input.role,
    phone: input.phone,
    pieceRates: input.pieceRates,
    runningJobs: 0,
    completedPieces: 0,
    wageDue: 0,
    monthlyPieces: 0,
    monthlyEarned: 0,
    work: [],
    payments: [],
  };
  currentKarigars = [...currentKarigars, entry];
  emitChange();
  return entry;
}

/**
 * Record a wage payment (Package D: কারিগর পেমেন্ট screen). The amount
 * is clamped to the open due — the shop never overpays on paper — and
 * appended to the karigar's `payments` (dateOffset 0 = আজ). Returns the
 * amount actually recorded (0 when nothing was due).
 */
export function addKarigarPayment(
  id: string,
  amount: number,
  method?: string,
): number {
  const target = currentKarigars.find((e) => e.id === id);
  if (!target) return 0;
  const recorded = Math.min(
    Math.max(0, Math.round(amount)),
    karigarTotals(target).due,
  );
  if (recorded <= 0) return 0;
  currentKarigars = currentKarigars.map((e) =>
    e.id === id
      ? {
          ...e,
          payments: [
            ...e.payments,
            { amount: recorded, dateOffset: 0, method },
          ],
        }
      : e,
  );
  emitChange();
  return recorded;
}
