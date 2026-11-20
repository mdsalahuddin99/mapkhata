import { OrderStatusKey } from '../theme';

export interface Karigar {
  id: string;
  name: string;
  skill: string;
  runningJobs: number;
  completedPieces: number;
  wageDue: number;
  /** Pieces completed this month (কারিগর screen summary). */
  monthlyPieces: number;
  /** Total earned this month; paid = monthlyEarned - wageDue. */
  monthlyEarned: number;
}

/** One recent work entry under a karigar (কারিগর screen). Amount = pieces × pieceRate. */
export interface KarigarWork {
  id: string;
  karigarId: string;
  garment: string;
  /** Meta after the garment, e.g. "MK-1042 রহিম উদ্দিন" or "চলমান". */
  meta: string;
  pieces: number;
  pieceRate: number;
  running?: boolean;
  /** Tag text for running work (default "সেলাই চলছে"). */
  runningLabel?: string;
}

export interface Order {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  garment: string;
  status: OrderStatusKey;
  /** Delivery date as day offset from today (0 = আজ, 1 = আগামীকাল, -1 = গতকাল). */
  deliveryInDays: number;
  total: number;
  advance: number;
  karigarName: string;
  /** Optional note shown on the বকেয়া list instead of the delivery date. */
  dueNote?: string;
  /** Measurements captured on the নতুন অর্ডার form (field key → value, inches). */
  measurements?: Record<string, string>;
  /** Free-text design note captured on the নতুন অর্ডার form. */
  designNote?: string;
}

/* ------------------------------------------------------------------ */
/* Garments + measurement templates (নতুন অর্ডার form, Package A)      */
/* ------------------------------------------------------------------ */

export type GarmentKey =
  | 'panjabi'
  | 'shirt'
  | 'pant'
  | 'salwar'
  | 'blouse'
  | 'borka';

export interface MeasurementField {
  key: string;
  label: string;
}

export interface GarmentDef {
  key: GarmentKey;
  label: string;
  fields: MeasurementField[];
}

export const garmentDefs: GarmentDef[] = [
  {
    key: 'panjabi',
    label: 'পাঞ্জাবি',
    fields: [
      { key: 'lomba', label: 'লম্বা' },
      { key: 'buk', label: 'বুক' },
      { key: 'pet', label: 'পেট' },
      { key: 'hata', label: 'হাতা' },
      { key: 'gola', label: 'গলা' },
      { key: 'kandh', label: 'কাঁধ' },
      { key: 'kof', label: 'কফ' },
    ],
  },
  {
    key: 'shirt',
    label: 'শার্ট',
    fields: [
      { key: 'lomba', label: 'লম্বা' },
      { key: 'buk', label: 'বুক' },
      { key: 'pet', label: 'পেট' },
      { key: 'hata', label: 'হাতা' },
      { key: 'gola', label: 'গলা' },
      { key: 'kandh', label: 'কাঁধ' },
    ],
  },
  {
    key: 'pant',
    label: 'প্যান্ট',
    fields: [
      { key: 'lomba', label: 'লম্বা' },
      { key: 'komor', label: 'কোমর' },
      { key: 'hip', label: 'হিপ' },
      { key: 'thai', label: 'থাই' },
      { key: 'nicherGher', label: 'নিচের ঘের' },
    ],
  },
  {
    key: 'salwar',
    label: 'সালোয়ার কামিজ',
    fields: [
      { key: 'kamizLomba', label: 'কামিজ লম্বা' },
      { key: 'buk', label: 'বুক' },
      { key: 'komor', label: 'কোমর' },
      { key: 'hata', label: 'হাতা' },
      { key: 'gola', label: 'গলা' },
      { key: 'salwarLomba', label: 'সালোয়ার লম্বা' },
      { key: 'salwarKomor', label: 'সালোয়ার কোমর' },
    ],
  },
  {
    key: 'blouse',
    label: 'ব্লাউজ',
    fields: [
      { key: 'lomba', label: 'লম্বা' },
      { key: 'buk', label: 'বুক' },
      { key: 'komor', label: 'কোমর' },
      { key: 'hata', label: 'হাতা' },
      { key: 'gola', label: 'গলা' },
    ],
  },
  {
    key: 'borka',
    label: 'বোরকা',
    fields: [
      { key: 'lomba', label: 'লম্বা' },
      { key: 'buk', label: 'বুক' },
      { key: 'hata', label: 'হাতা' },
      { key: 'gola', label: 'গলা' },
    ],
  },
];

export function garmentDef(key: GarmentKey): GarmentDef {
  return garmentDefs.find((g) => g.key === key) ?? garmentDefs[0];
}

/* ------------------------------------------------------------------ */
/* Customers + saved measurements                                      */
/*                                                                     */
/* The mock orders carry customer name/phone inline; this list is the  */
/* "মাপের খাতা" view of the same people — who has saved measurements   */
/* for which garment. Values are inches, as strings (form input text). */
/* ------------------------------------------------------------------ */

export interface Customer {
  name: string;
  /** Display format, same as on the orders: "01712-445566". */
  phone: string;
  measurements: Partial<Record<GarmentKey, Record<string, string>>>;
}

export const customers: Customer[] = [
  {
    name: 'রহিম উদ্দিন',
    phone: '01712-445566',
    measurements: {
      panjabi: { lomba: '42', buk: '40', pet: '38', hata: '23.5', gola: '15.5', kandh: '17.5', kof: '9.5' },
    },
  },
  {
    name: 'ফাতেমা বেগম',
    phone: '01819-223344',
    measurements: {
      salwar: { kamizLomba: '44', buk: '36', komor: '32', hata: '21', gola: '14', salwarLomba: '38', salwarKomor: '28' },
    },
  },
  {
    name: 'তানভীর আহমেদ',
    phone: '01611-778899',
    measurements: {
      shirt: { lomba: '29', buk: '40', pet: '38', hata: '24', gola: '15.5', kandh: '17.5' },
      pant: { lomba: '40', komor: '34', hip: '40', thai: '24', nicherGher: '15' },
    },
  },
  {
    name: 'আয়েশা সিদ্দিকা',
    phone: '01755-901234',
    measurements: {
      blouse: { lomba: '15', buk: '34', komor: '30', hata: '10', gola: '13' },
    },
  },
  {
    name: 'মোঃ কামাল হোসেন',
    phone: '01913-667788',
    measurements: {
      panjabi: { lomba: '41', buk: '42', pet: '40', hata: '24', gola: '16', kandh: '18', kof: '10' },
    },
  },
  {
    name: 'শারমিন আক্তার',
    phone: '01842-112233',
    measurements: {
      salwar: { kamizLomba: '43', buk: '35', komor: '31', hata: '20.5', gola: '13.5', salwarLomba: '37', salwarKomor: '27' },
    },
  },
  {
    name: 'নুসরাত জাহান',
    phone: '01798-334455',
    measurements: {
      salwar: { kamizLomba: '44', buk: '34', komor: '30', hata: '21', gola: '13.5', salwarLomba: '38', salwarKomor: '26' },
    },
  },
  {
    name: 'হাসান মাহমুদ',
    phone: '01552-990011',
    measurements: {
      pant: { lomba: '41', komor: '36', hip: '42', thai: '25', nicherGher: '16' },
    },
  },
  {
    name: 'রুমানা পারভীন',
    phone: '01676-221100',
    measurements: {
      borka: { lomba: '54', buk: '42', hata: '22', gola: '14' },
    },
  },
  // No saved measurements yet — the "নতুন কাস্টমার" path in the form.
  { name: 'ইমরান হোসেন', phone: '01720-556677', measurements: {} },
  { name: 'সালমা খাতুন', phone: '01830-445566', measurements: {} },
  { name: 'জাকির হোসেন', phone: '01925-778800', measurements: {} },
];

const phoneDigits = (s: string) => s.replace(/[^0-9]/g, '');

/** Exact customer match for a typed phone number (digits compared). */
export function findCustomerByPhone(phone: string): Customer | undefined {
  const digits = phoneDigits(phone);
  if (digits.length < 11) return undefined;
  return customers.find((c) => phoneDigits(c.phone) === digits);
}

/** Suggestion list for the নতুন অর্ডার form: name or phone fragment. */
export function searchCustomers(query: string): Customer[] {
  const q = query.trim();
  if (q.length < 2) return [];
  const qDigits = phoneDigits(q);
  return customers.filter(
    (c) =>
      c.name.includes(q) ||
      (qDigits.length >= 2 && phoneDigits(c.phone).includes(qDigits)),
  );
}

export function hasSavedMeasurements(customer: Customer): boolean {
  return Object.values(customer.measurements).some(
    (m) => m && Object.keys(m).length > 0,
  );
}

export const shop = {
  name: 'নিউ স্টার টেইলার্স',
  area: 'এলিফ্যান্ট রোড, ঢাকা',
  ownerName: 'মোঃ আব্দুল মালেক',
};

export const karigars: Karigar[] = [
  { id: 'k1', name: 'মোঃ সেলিম', skill: 'কাটিং মাস্টার', runningJobs: 4, completedPieces: 38, wageDue: 4200, monthlyPieces: 12, monthlyEarned: 6300 },
  { id: 'k2', name: 'আব্দুল করিম', skill: 'সেলাই কারিগর', runningJobs: 3, completedPieces: 31, wageDue: 3150, monthlyPieces: 11, monthlyEarned: 5400 },
  { id: 'k3', name: 'রফিকুল ইসলাম', skill: 'সেলাই কারিগর', runningJobs: 2, completedPieces: 24, wageDue: 2400, monthlyPieces: 8, monthlyEarned: 4100 },
  { id: 'k4', name: 'শাহিন আলম', skill: 'ফিনিশিং ও ইস্ত্রি', runningJobs: 2, completedPieces: 45, wageDue: 1800, monthlyPieces: 6, monthlyEarned: 2950 },
];

export const karigarWork: KarigarWork[] = [
  // মোঃ সেলিম — কাটিং (পিস-রেট ৳১৫০)
  { id: 'w1', karigarId: 'k1', garment: 'কাটিং', meta: 'MK-1044 তানভীর আহমেদ', pieces: 2, pieceRate: 150 },
  { id: 'w2', karigarId: 'k1', garment: 'কাটিং', meta: 'MK-1047 শারমিন আক্তার', pieces: 1, pieceRate: 150 },
  { id: 'w3', karigarId: 'k1', garment: 'কাটিং', meta: 'চলমান', pieces: 3, pieceRate: 150, running: true, runningLabel: 'কাটিং চলছে' },
  // আব্দুল করিম — সেলাই (পাঞ্জাবি ৳৩০০, বোরকা ৳৩৫০)
  { id: 'w4', karigarId: 'k2', garment: 'পাঞ্জাবি', meta: 'MK-1042 রহিম উদ্দিন', pieces: 1, pieceRate: 300 },
  { id: 'w5', karigarId: 'k2', garment: 'বোরকা', meta: 'MK-1049 রুমানা পারভীন', pieces: 1, pieceRate: 350 },
  { id: 'w6', karigarId: 'k2', garment: 'পাঞ্জাবি', meta: 'চলমান', pieces: 2, pieceRate: 300, running: true },
  // রফিকুল ইসলাম — সেলাই (ব্লাউজ ৳১৮০, কামিজ ৳২৫০)
  { id: 'w7', karigarId: 'k3', garment: 'ব্লাউজ', meta: 'MK-1045 আয়েশা সিদ্দিকা', pieces: 1, pieceRate: 180 },
  { id: 'w8', karigarId: 'k3', garment: 'সালোয়ার কামিজ', meta: 'MK-1043 ফাতেমা বেগম', pieces: 1, pieceRate: 250 },
  { id: 'w9', karigarId: 'k3', garment: 'কামিজ', meta: 'চলমান', pieces: 1, pieceRate: 250, running: true },
  // শাহিন আলম — ফিনিশিং (৳১০০)
  { id: 'w10', karigarId: 'k4', garment: 'ফিনিশিং', meta: 'MK-1036 জাকির হোসেন', pieces: 1, pieceRate: 100 },
  { id: 'w11', karigarId: 'k4', garment: 'ফিনিশিং', meta: 'MK-1039 সালমা খাতুন', pieces: 2, pieceRate: 100 },
];

export function workAmount(work: KarigarWork): number {
  return work.pieces * work.pieceRate;
}

export function workForKarigar(karigarId: string): KarigarWork[] {
  return karigarWork.filter((w) => w.karigarId === karigarId);
}

export const orders: Order[] = [
  { id: 'o1', code: 'MK-1042', customerName: 'রহিম উদ্দিন', customerPhone: '01712-445566', garment: 'পাঞ্জাবি', status: 'ready', deliveryInDays: 0, total: 1200, advance: 500, karigarName: 'আব্দুল করিম' },
  { id: 'o2', code: 'MK-1043', customerName: 'ফাতেমা বেগম', customerPhone: '01819-223344', garment: 'সালোয়ার কামিজ', status: 'sewing', deliveryInDays: 0, total: 950, advance: 400, karigarName: 'রফিকুল ইসলাম' },
  { id: 'o3', code: 'MK-1044', customerName: 'তানভীর আহমেদ', customerPhone: '01611-778899', garment: 'শার্ট ও প্যান্ট', status: 'cutting', deliveryInDays: 0, total: 1350, advance: 1350, karigarName: 'মোঃ সেলিম' },
  { id: 'o4', code: 'MK-1045', customerName: 'আয়েশা সিদ্দিকা', customerPhone: '01755-901234', garment: 'ব্লাউজ', status: 'ready', deliveryInDays: 1, total: 650, advance: 300, karigarName: 'রফিকুল ইসলাম' },
  { id: 'o5', code: 'MK-1046', customerName: 'মোঃ কামাল হোসেন', customerPhone: '01913-667788', garment: 'পাঞ্জাবি', status: 'sewing', deliveryInDays: 1, total: 850, advance: 0, karigarName: 'আব্দুল করিম' },
  { id: 'o6', code: 'MK-1047', customerName: 'শারমিন আক্তার', customerPhone: '01842-112233', garment: 'সালোয়ার কামিজ', status: 'cutting', deliveryInDays: 2, total: 1100, advance: 500, karigarName: 'মোঃ সেলিম' },
  { id: 'o7', code: 'MK-1048', customerName: 'নুসরাত জাহান', customerPhone: '01798-334455', garment: 'কামিজ', status: 'measured', deliveryInDays: 2, total: 900, advance: 200, karigarName: 'রফিকুল ইসলাম' },
  { id: 'o8', code: 'MK-1049', customerName: 'হাসান মাহমুদ', customerPhone: '01552-990011', garment: 'প্যান্ট', status: 'measured', deliveryInDays: 3, total: 700, advance: 700, karigarName: 'মোঃ সেলিম' },
  { id: 'o9', code: 'MK-1050', customerName: 'রুমানা পারভীন', customerPhone: '01676-221100', garment: 'বোরকা', status: 'sewing', deliveryInDays: 3, total: 1500, advance: 600, karigarName: 'আব্দুল করিম' },
  { id: 'o10', code: 'MK-1051', customerName: 'ইমরান হোসেন', customerPhone: '01720-556677', garment: 'শার্ট', status: 'measured', deliveryInDays: 5, total: 650, advance: 0, karigarName: 'রফিকুল ইসলাম' },
  { id: 'o11', code: 'MK-1039', customerName: 'সালমা খাতুন', customerPhone: '01830-445566', garment: 'সালোয়ার কামিজ', status: 'delivered', deliveryInDays: -1, total: 1050, advance: 800, karigarName: 'আব্দুল করিম' },
  { id: 'o12', code: 'MK-1036', customerName: 'জাকির হোসেন', customerPhone: '01925-778800', garment: 'পাঞ্জাবি', status: 'delivered', deliveryInDays: -2, total: 1250, advance: 1250, karigarName: 'মোঃ সেলিম' },
  // Older delivered orders — the বকেয়া book. Repeat orders from the same 9
  // customers above, so মোট বকেয়া ৳12,450 across exactly ৯ জন (prototype v4),
  // of which ৳3,200 sits on orders delivered more than 30 days ago.
  { id: 'o13', code: 'MK-1028', customerName: 'রহিম উদ্দিন', customerPhone: '01712-445566', garment: 'পাঞ্জাবি', status: 'delivered', deliveryInDays: -15, total: 900, advance: 450, karigarName: 'আব্দুল করিম' },
  { id: 'o14', code: 'MK-1031', customerName: 'ফাতেমা বেগম', customerPhone: '01819-223344', garment: 'সালোয়ার কামিজ', status: 'delivered', deliveryInDays: -9, total: 800, advance: 450, karigarName: 'রফিকুল ইসলাম', dueNote: 'আংশিক জমা আছে' },
  { id: 'o15', code: 'MK-1033', customerName: 'নুসরাত জাহান', customerPhone: '01798-334455', garment: 'বোরকা', status: 'delivered', deliveryInDays: -8, total: 1600, advance: 400, karigarName: 'আব্দুল করিম' },
  { id: 'o16', code: 'MK-1030', customerName: 'আয়েশা সিদ্দিকা', customerPhone: '01755-901234', garment: 'ব্লাউজ', status: 'delivered', deliveryInDays: -12, total: 600, advance: 200, karigarName: 'রফিকুল ইসলাম' },
  { id: 'o17', code: 'MK-1025', customerName: 'মোঃ কামাল হোসেন', customerPhone: '01913-667788', garment: 'পাঞ্জাবি', status: 'delivered', deliveryInDays: -18, total: 900, advance: 400, karigarName: 'আব্দুল করিম' },
  { id: 'o18', code: 'MK-1034', customerName: 'শারমিন আক্তার', customerPhone: '01842-112233', garment: 'সালোয়ার কামিজ', status: 'delivered', deliveryInDays: -6, total: 1100, advance: 600, karigarName: 'মোঃ সেলিম' },
  { id: 'o19', code: 'MK-1029', customerName: 'ইমরান হোসেন', customerPhone: '01720-556677', garment: 'শার্ট', status: 'delivered', deliveryInDays: -14, total: 650, advance: 350, karigarName: 'রফিকুল ইসলাম' },
  { id: 'o20', code: 'MK-1008', customerName: 'সালমা খাতুন', customerPhone: '01830-445566', garment: 'সালোয়ার কামিজ', status: 'delivered', deliveryInDays: -35, total: 2400, advance: 400, karigarName: 'আব্দুল করিম' },
  { id: 'o21', code: 'MK-1005', customerName: 'রুমানা পারভীন', customerPhone: '01676-221100', garment: 'বোরকা', status: 'delivered', deliveryInDays: -38, total: 2000, advance: 800, karigarName: 'আব্দুল করিম' },
];

export function dueOf(order: Order): number {
  return Math.max(0, order.total - order.advance);
}

const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export function toBnDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
}

const bnMonths = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
];

export function dateFromOffset(inDays: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + inDays);
  return d;
}

/** "আজ" / "আগামীকাল" / "২৩ নভেম্বর" */
export function deliveryLabel(inDays: number): string {
  if (inDays === 0) return 'আজ';
  if (inDays === 1) return 'আগামীকাল';
  if (inDays === -1) return 'গতকাল';
  const d = dateFromOffset(inDays);
  return `${toBnDigits(d.getDate())} ${bnMonths[d.getMonth()]}`;
}

export function todayLabel(): string {
  const d = new Date();
  return `${toBnDigits(d.getDate())} ${bnMonths[d.getMonth()]}`;
}

/** Always the calendar date ("২৩ নভেম্বর") — no আজ/আগামীকাল shortcuts. */
export function fullDateLabel(inDays: number): string {
  const d = dateFromOffset(inDays);
  return `${toBnDigits(d.getDate())} ${bnMonths[d.getMonth()]}`;
}

/** Dashboard stats derived from the mock orders (internally consistent). */
export const dashboardStats = {
  todayDeliveries: orders.filter((o) => o.deliveryInDays === 0 && o.status !== 'cancelled').length,
  runningOrders: orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length,
  totalDue: orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + dueOf(o), 0),
  todayCollection: 6300, // mock: আজকের মোট আদায় (prototype v2/v4 figure)
};

/** বকেয়া list: every open order with due > 0, oldest delivery first. */
export const dueEntries = orders
  .filter((o) => o.status !== 'cancelled' && dueOf(o) > 0)
  .sort((a, b) => a.deliveryInDays - b.deliveryInDays);

export const dueStats = {
  totalDue: dueEntries.reduce((sum, o) => sum + dueOf(o), 0),
  customerCount: new Set(dueEntries.map((o) => o.customerName)).size,
  over30Due: dueEntries
    .filter((o) => o.deliveryInDays < -30)
    .reduce((sum, o) => sum + dueOf(o), 0),
  todayCollection: dashboardStats.todayCollection,
};

/** কারিগর summary, derived from the karigar aggregates. */
export const karigarStats = {
  totalWageDue: karigars.reduce((sum, k) => sum + k.wageDue, 0),
  karigarCount: karigars.length,
  monthlyPieces: karigars.reduce((sum, k) => sum + k.monthlyPieces, 0),
  monthlyPaid: karigars.reduce((sum, k) => sum + (k.monthlyEarned - k.wageDue), 0),
};
