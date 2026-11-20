import { useSyncExternalStore } from 'react';
import { Staff, StaffPermissions, staff as seedStaff } from '../data/mock';

/**
 * Tiny shared in-memory staff store (Package G) — mirrors
 * src/store/karigars.ts: module-level state seeded from the mock staff,
 * `useSyncExternalStore`, immutable updates + listener fan-out, so the
 * স্টাফ list and the স্টাফ যোগ form always agree. Staff are the people
 * who run the shop counter; the piece-rate karigars live in their own
 * store. Supabase replaces the seed behind this seam later.
 */

let currentStaff: Staff[] = [...seedStaff];
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

function getSnapshot(): Staff[] {
  return currentStaff;
}

/** All staff (seed order; new ones appended). */
export function useStaff(): Staff[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export interface NewStaffInput {
  name: string;
  phone: string;
  role: string;
  permissions: StaffPermissions;
}

/** Add a staff member; returns the new entry. */
export function addStaff(input: NewStaffInput): Staff {
  idCounter += 1;
  const entry: Staff = { ...input, id: `staff-${idCounter}` };
  currentStaff = [...currentStaff, entry];
  emitChange();
  return entry;
}
