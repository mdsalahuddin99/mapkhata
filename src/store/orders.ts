import { useSyncExternalStore } from 'react';
import { Order, orders as seedOrders } from '../data/mock';

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
