import { useSyncExternalStore } from 'react';
import { dueOf, Order, orders as seedOrders } from '../data/mock';
import { OrderStatusKey } from '../theme';

/**
 * Tiny shared in-memory order store (Package A).
 *
 * Module-level state seeded from the mock orders. Screens subscribe with
 * `useOrders()`; `addOrder()` swaps in a new array (immutable update) and
 * notifies every listener, so the Orders tab and the Dashboard update
 * immediately — no context provider or prop drilling needed.
 *
 * This is deliberately the seam where Supabase replaces the seed later:
 * screens only ever see `useOrders()` / `addOrder()`.
 */

let currentOrders: Order[] = [...seedOrders];
let idCounter = 0;
/** Money collected through the টাকা জমা screen during this session —
 *  added on top of the mock আজকের আদায় constant by Dashboard / বকেয়া. */
let sessionCollected = 0;
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

function getSnapshot(): Order[] {
  return currentOrders;
}

/** All orders (newest first — newly added orders are prepended). */
export function useOrders(): Order[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Next order code, e.g. seeds end at MK-1051 → "MK-1052". */
export function nextOrderCode(list: Order[] = currentOrders): string {
  const max = list.reduce((acc, o) => {
    const match = /^MK-(\d+)$/.exec(o.code);
    return match ? Math.max(acc, Number(match[1])) : acc;
  }, 0);
  return `MK-${max + 1}`;
}

export type NewOrderInput = Omit<Order, 'id' | 'code' | 'status'>;

/** Add an order with status মাপ নেওয়া and the next code; returns it. */
export function addOrder(input: NewOrderInput): Order {
  idCounter += 1;
  const order: Order = {
    ...input,
    id: `new-${idCounter}`,
    code: nextOrderCode(),
    status: 'measured',
  };
  currentOrders = [order, ...currentOrders];
  emitChange();
  return order;
}

/** Move one order to a new status (Package C: order-detail stepper). */
export function updateStatus(id: string, status: OrderStatusKey): void {
  const target = currentOrders.find((o) => o.id === id);
  if (!target || target.status === status) return;
  currentOrders = currentOrders.map((o) =>
    o.id === id ? { ...o, status } : o,
  );
  emitChange();
}

/**
 * Record a collection against an order (Package C: টাকা জমা screen).
 * The amount is clamped to the open due — paid never exceeds the bill —
 * and appended to the order's `payments` history (dateOffset 0 = আজ).
 * Returns the amount actually recorded (0 when nothing was due).
 */
export function addPayment(id: string, amount: number, method?: string): number {
  const target = currentOrders.find((o) => o.id === id);
  if (!target) return 0;
  const recorded = Math.min(Math.max(0, Math.round(amount)), dueOf(target));
  if (recorded <= 0) return 0;
  currentOrders = currentOrders.map((o) =>
    o.id === id
      ? {
          ...o,
          advance: o.advance + recorded,
          payments: [
            ...(o.payments ?? []),
            { amount: recorded, dateOffset: 0, method },
          ],
        }
      : o,
  );
  sessionCollected += recorded;
  emitChange();
  return recorded;
}

function getCollectedSnapshot(): number {
  return sessionCollected;
}

/** Total collected via the টাকা জমা screen in this session (৳). */
export function useSessionCollections(): number {
  return useSyncExternalStore(
    subscribe,
    getCollectedSnapshot,
    getCollectedSnapshot,
  );
}
