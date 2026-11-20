# MapKhata — Build Notes (Package: code foundation)
Date: 2026-11-20

## What was built
Expo + TypeScript + Expo Router foundation implementing DESIGN.md (locked v1)
exactly: flat, dense, hairline-divided, max radius 8px, no card/button shadows,
no gradients, Hind Siliguri, primary deep green #0E4F3C on warm paper #F7F6F3.

- `src/theme.ts` — all DESIGN.md tokens: colors incl. all status colors,
  radius 4/6/8, 4pt spacing scale, typography scale, hairline, the single
  sheet shadow (modals only), `formatTaka()` with lakh grouping.
- `src/components/` — primitives:
  - `LedgerRow` (+ `LedgerPanel`): 3px status strip, name + meta + status
    chip, right-aligned amount, hairline-divided rows in one white panel.
  - `StatusChip`: 4px radius, tint bg, 6px dot, 11px Medium.
  - `Buttons`: PrimaryButton / SecondaryButton — 44px, 6px radius, flat.
  - `StatPanel`: ONE white panel, hairline-divided 2×2 stats (not a card grid).
  - `ScreenHeader`: 20/Bold title + subtitle + right action.
- `src/data/mock.ts` — realistic Bengali mock data: shop "নিউ স্টার টেইলার্স"
  (এলিফ্যান্ট রোড, ঢাকা), 12 orders (পাঞ্জাবি/সালোয়ার কামিজ/শার্ট/প্যান্ট/
  ব্লাউজ/বোরকা/কামিজ, ৳650–1500), delivery dates as offsets from today
  (labels আজ/আগামীকাল/Bengali date), 4 karigars with wage dues. Dashboard
  stats are derived from the orders so the numbers are internally consistent.
- Screens (2 only, per package scope):
  - `app/(tabs)/index.tsx` — Dashboard: shop header + নতুন অর্ডার primary
    button, StatPanel (আজকের ডেলিভারি / চলমান অর্ডার / মোট বকেয়া (amber) /
    আজকের আদায়), আজকের ডেলিভারি ledger, আগামী ৩ দিন ledger.
  - `app/(tabs)/orders.tsx` — Orders: status filter chips (সব, মাপ নেওয়া,
    কাটিং, সেলাই, রেডি), dense ledger rows with status strip + chip + due.
  - Tab bar: flat white, top hairline, হোম / অর্ডার tabs, no floating button.

## File map
```
app/_layout.tsx          root stack, loads Hind Siliguri (google-fonts pkg)
app/(tabs)/_layout.tsx   flat tab bar
app/(tabs)/index.tsx     dashboard
app/(tabs)/orders.tsx    orders list + filters
src/theme.ts             design tokens + formatTaka
src/components/*.tsx     LedgerRow, StatusChip, Buttons, StatPanel, ScreenHeader
src/data/mock.ts         shop / orders / karigars + date helpers
assets/fonts/*.ttf       local Hind Siliguri TTFs (bundled fallback copies)
DESIGN.md                locked design system (untouched)
docs/                    untouched
```

## Verification
- `npx tsc --noEmit` — PASS (exit 0, no errors).
- `npx expo export --platform web` — PASS. Output in `dist/` (entry 1.1MB,
  index 5.5KB, orders 2.9KB bundles). First attempt failed with
  "Cannot find module 'babel-preset-expo'" (SDK 58 nests it under expo's own
  node_modules); fixed by adding `babel-preset-expo` as a project dependency.
- Not run: native (Android/iOS) export/build — this VM cannot run Gradle;
  APK builds go through the owner's PC / EAS later, same as Amar Aruail.

## Deviations / notes
- DESIGN.md names mustard #7C5C10 for কাটিং and "slate" for মাপ নেওয়া without
  chip tints; derived tints added in theme.ts: mustardTint #F6EFD8,
  slate #64707A / tint #EDF0F2, delivered tint #EFEDE9. Flagged for owner
  review — change in one place (theme.ts) if he prefers others.
- Fonts load via @expo-google-fonts/hind-siliguri (available, v0.4.1);
  local TTFs from ~/workspace/fonts/hind-siliguri/ are also copied into
  assets/fonts/ as bundled fallbacks.
- Tabs limited to the 2 built screens; বকেয়া / কারিগর tabs arrive with
  their screens in the next package.
- No git init, no GitHub repo, no Supabase — per package instructions.

## What's next
1. Owner reviews the two screens (Expo Go / web export) against DESIGN.md.
2. Package 2 screens: নতুন অর্ডার + পোশাকভেদে মাপের ফর্ম, বকেয়া তালিকা,
   কারিগর পিস-হিসাব (DESIGN.md screen list 3–5).
3. Then: Supabase schema (shops/customers/measurements/karigars/orders,
   RLS by shop_id) and OTP auth decision (flagged earlier).

---

## v1.1 clean revision (2026-11-20)
Applied DESIGN.md v1.1 (bKash/Nagad-style cleanliness) per
`docs/prototype-v2-clean.html`. Radius/shadow/gradient rules unchanged.

### Changes
- `src/theme.ts` — v1.1 tokens added: band colours (`onPrimary`,
  `onPrimarySoft`, translucent `bandPanelBg`/`bandPanelBorder`) and
  typography for band greeting, balance panel, action tiles, mini strip.
- New components:
  - `BandHeader` — flat primary-green band (no gradient/shadow) with shop
    context line + greeting and ONE balance-style panel inside: মোট বকেয়া
    (with due-customer count) as the big number, আজকের আদায় as side number.
  - `ActionTile` / `ActionTileRow` — one icon + short label per tile,
    60px tall (≥48px touch target), radius 8, flat.
  - `MiniStatStrip` — 3 numbers in one hairline-divided panel.
- `LedgerRow` — new optional props `chipInMeta` (default true) and
  `rightChip`; existing behaviour unchanged for other callers.
- Dashboard (`app/(tabs)/index.tsx`) — white ScreenHeader + 2×2 StatPanel
  removed. Top is now: green BandHeader → 3 action tiles (নতুন অর্ডার filled
  primary with Plus, মাপ খুঁজুন with Ruler, টাকা জমা with Wallet) →
  MiniStatStrip (আজকের ডেলিভারি / চলমান অর্ডার / আগামী ৩ দিনে) → delivery
  ledgers. Today's rows: meta = garment · code (one line), status chip moved
  to the right column. Upcoming deliveries are grouped by day (আগামীকাল /
  date) with the order total on the right. Amounts on this screen render in
  Bengali digits. `StatPanel` is no longer used here (kept in components).
- Orders (`app/(tabs)/orders.tsx`) — rows simplified to one meta line
  (garment · delivery label, e.g. "পাঞ্জাবি · ডেলিভারি আজ"); the due/second
  line is gone from the list (due stays an order-detail concern); right side
  shows the order total only, in Bengali digits. Added the search field the
  v1 screen lacked (prototype v2 has one) — functional: matches customer
  name, order code, or phone digits. Filter chips reordered to prototype
  order (সব, রেডি, সেলাই, কাটিং, মাপ নেওয়া); header gained the compact
  নতুন অর্ডার button.

### Notes / minor deviations
- The green band starts below the status bar (SafeAreaView top inset stays
  on the paper background, status bar remains dark) instead of extending
  full-bleed under the status bar as in the HTML prototype.
- Dashboard greeting uses the full mock owner name (মোঃ আব্দুল মালেক);
  prototype showed a short first name.

### Verification
- `npx tsc --noEmit` — PASS (exit 0, no errors).
- `npx expo export --platform web` — PASS. Output in `dist/`
  (index bundle 8.1KB, orders 6.3KB, entry 1.1MB).
- No git init, no Supabase — unchanged.

---

## v1.2 bKash-style home (2026-11-20)
Applied DESIGN.md v1.2 (owner's decision: round icon circles on the home
grid, bKash-style) per `docs/prototype-v3-grid.html`. The circles/sheet are
the locked limited exception — buttons/cards/inputs elsewhere keep max
radius 8, no gradients, no shadows added.

### Changes
- `src/theme.ts` — v1.2 tokens: `rose #9A3B2E` / `roseTint #F7E8E4`
  (দোকান grid icon), `radius.sheetTop = 12` (home sheet only), typography
  for band shop name/sub, balance pill, grid labels, "আরো দেখুন" pill.
- `BandHeader` (rewritten) — top row inside the green band: circular
  shop-initial avatar (38px, primary tint), shop name + area sub-line,
  two circular translucent icon buttons (Search, Bell). The always-visible
  balance panel is replaced by a white pill — ৳ mark + "আজকের হিসাব দেখুন"
  — bKash "ব্যালেন্স দেখুন" behaviour: figures hidden by default, tapping
  the pill (useState) reveals the v1.1 panel (মোট বকেয়া big + আজকের আদায়
  side), tapping the panel hides them again. Band bottom padding grew so
  the sheet overlap leaves a clean green strip.
- New `ActionGrid` component — white sheet content: 4-column grid of 48px
  circular icon buttons, light tints from the muted palette (green /
  slate-blue / amber / mustard / slate / rose), lucide icon + short Bangla
  label under each. Order: নতুন অর্ডার (Plus), মাপ খুঁজুন (Ruler),
  বকেয়া (Wallet), কারিগর (Users), কাস্টমার (UserPlus), টাকা জমা
  (HandCoins), রিপোর্ট (BarChart3), দোকান (Store). Centered "আরো দেখুন"
  outline pill expands a placeholder row (SMS ব্যালেন্স, অফার/নোটিশ,
  সাহায্য, সেটিংস, same circle style; toggles to "কম দেখুন"). Items are
  visual Pressables (pressed opacity only, no navigation yet).
- Dashboard (`app/(tabs)/index.tsx`) — the v1.1 3-ActionTile row is
  replaced by the sheet + grid: the white sheet (top corners radius 12)
  overlaps the band by 10px (negative margin, clipped). MiniStatStrip
  third number changed per prototype v3: আজকের ডেলিভারি / চলমান অর্ডার /
  মোট বকেয়া (মোট বকেয়া also appears in the band reveal, as in the
  prototype). Delivery ledger lists unchanged from v1.1; tab bar
  untouched (center big + button comes in a later package). `ActionTiles`
  component is no longer used by the dashboard (kept in components).

### Verification
- `npx tsc --noEmit` — PASS (exit 0, no errors).
- `npx expo export --platform web` — PASS. Output in `dist/`
  (orders bundle 6.3KB, entry + index bundles emitted).
- Gotcha found: with a stale `dist/` from a previous export present,
  `npx tsc --noEmit` crashes with "Maximum call stack size exceeded"
  (tsc pulls the bundled JS in dist into the program). Run tsc BEFORE
  export, or delete `dist/` first — the v1.2 code itself type-checks
  clean once dist is removed.
- No git init, no Supabase — unchanged.

---

## Package: বকেয়া + কারিগর screens (2026-11-20)
Built per `docs/prototype-v4-due-karigar.html` and DESIGN.md incl. the
v1.3 colour matrix: backgrounds paper/white only (no black anywhere),
amber only on due figures, ≤3 colour families per screen, radius ≤8,
no shadows/gradients.

### Screens
- `app/(tabs)/due.tsx` — বকেয়া: white header bar; summary panel (মোট
  বকেয়া big in amber; hairline stats: কাস্টমারের কাছে / ৩০ দিনের বেশি
  পুরনো / আজ আদায়); search filtering by name or phone digits; section
  "সবচেয়ে পুরনো আগে"; ledger rows sorted oldest delivery first — name,
  ONE meta line (garment · delivery date, or the order's due note),
  right side amber due amount + age ("২৩ দিন"; আজ/আগামীকাল for
  not-yet-delivered), compact primary "জমা নিন" button (32px, pressed
  state only, no action yet).
- `app/(tabs)/karigar.tsx` — কারিগর: white header bar; summary panel
  (এই মাসে মোট পাওনা big in INK, not amber; stats: কারিগর সংখ্যা / এই
  মাসে সম্পন্ন পিস / পরিশোধ হয়েছে); per-karigar blocks inside ONE
  panel — header row with circular initial avatar (tints rotate
  green → mustard → slate-blue), name + role, right পাওনা (bold) +
  এই মাসে আয়; work rows under each (garment + order-code/customer
  meta, pieces, amount = pieces × piece rate); running work carries
  the mustard tag ("সেলাই চলছে"; the cutting master's running row
  reads "কাটিং চলছে").
- New shared components: `WhiteHeader` (white bar + bottom hairline)
  and `SummaryPanel` (label + big number + hairline stat row, value
  colour configurable). Tabs registered in `app/(tabs)/_layout.tsx`
  (Wallet / Users icons) — order now হোম, অর্ডার, বকেয়া, কারিগর, same
  flat tab bar.

### Data notes (src/data/mock.ts)
- বকেয়া figures match prototype v4 EXACTLY, derived from orders: 9
  older delivered orders (o13–o21) added as repeat orders from the
  same 9 due customers, so মোট বকেয়া = ৳12,450 across exactly ৯ জন,
  and ৳3,200 of it sits on orders delivered >30 days ago (সালমা −৩৫দি,
  রুমানা −৩৮দি). ফাতেমা's −৯দি order carries `dueNote: 'আংশিক জমা
  আছে'` (new optional Order field), mirroring the prototype row.
  `dueEntries` / `dueStats` derive the list (due > 0, oldest first)
  and the summary. আজ আদায় uses the shared `todayCollection`, raised
  2,850 → 6,300 to match the prototypes (also updates the dashboard
  band's side figure). Dashboard fix: its "মোট বকেয়া (N জন)" count
  now counts distinct customers, not due orders (would have read ১৮).
- কারিগর: persons/totals come from the existing mock karigars, so the
  summary derives honestly rather than copying the prototype's people:
  মোট পাওনা ৳11,550 (sum of existing wageDue — prototype showed
  ৳8,750 for different karigars), পরিশোধ হয়েছে ৳7,200 (prototype
  ৳5,000). New Karigar fields `monthlyPieces` / `monthlyEarned`
  (paid = earned − wageDue); monthly pieces total ৩৭ পিস, matching
  the prototype. Work rows are recent entries (prototype behaves the
  same way — its rows don't sum to the header totals) at prototype
  piece rates: কাটিং ৳১৫০, পাঞ্জাবি ৳৩০০, কামিজ ৳২৫০, ব্লাউজ ৳১৮০,
  বোরকা ৳৩৫০, ফিনিশিং ৳১০০.

### Verification
- `rm -rf dist` first (known stale-dist tsc gotcha), then
  `npx tsc --noEmit` — PASS (exit 0, no errors).
- `npx expo export --platform web` — PASS; due bundle 4.9KB, karigar
  bundle 5.2KB emitted alongside index/orders.
- No git init, no Supabase — unchanged.

---

## Package A: নতুন অর্ডার flow + shared order store (2026-11-20)
The order book is now writable: a shared in-memory store, a full
নতুন অর্ডার form, and both entry points wired.

### Store — `src/store/orders.ts`
- Module-level store seeded from the mock orders, exposed via
  `useSyncExternalStore`: `useOrders()` subscribes a screen to the live
  list; `addOrder(input)` prepends a new order (status মাপ নেওয়া,
  code from `nextOrderCode()` — max MK-number + 1, so the first new
  order is MK-1052) and notifies all listeners with an immutable array
  swap. No context/provider needed; the module is the seam where
  Supabase replaces the seed later.
- Refactored to read from the store: Orders tab (list + filters +
  search) and Dashboard (today's deliveries, upcoming-by-day lists).
  Dashboard stats are now recomputed from the store list with the same
  derivations as `mock.dashboardStats` (todayDeliveries / runningOrders
  / totalDue), so a new order moves the band + mini-strip numbers
  immediately; আজকের আদায় stays the shared mock constant (collections
  are not orders). বকেয়া / কারিগর tabs still read the static mock
  derivations (`dueEntries`/`dueStats`) — store migration for those
  lists is a later package.

### Data — `src/data/mock.ts`
- mock.ts had NO measurements/customers structure (orders carry
  name/phone inline), so Package A adds the "মাপের খাতা" layer:
  `garmentDefs` (6 garments with the exact field sets: পাঞ্জাবি 7,
  শার্ট 6, প্যান্ট 5, সালোয়ার কামিজ 7, ব্লাউজ 5, বোরকা 4) and a
  `customers` list covering all 12 mock customers — 9 with saved
  measurements for their usual garment(s) (তানভীর has শার্ট + প্যান্ট),
  3 with none (নতুন কাস্টমার path). Helpers: `findCustomerByPhone`
  (exact digit match), `searchCustomers` (name/phone fragment),
  `hasSavedMeasurements`. `Order` gains optional `measurements` /
  `designNote` so the form's data is kept on the created order.

### Screen — `app/new-order.tsx` (stack screen, headerShown off)
Single scroll form, white panels on paper, 44px inputs (paper-tinted
inside white panels so the field reads against the panel; focus =
primary border, no glow), fixed footer with the save button.
- হেডার: white bar — back chevron, "নতুন অর্ডার", next order code in a
  slate chip (live from the store).
- কাস্টমার: phone field — typing a full mock number auto-fills the
  name and selects the customer; a suggestion list (name/phone
  fragment, max 4, "মাপ আছে" tag) appears under the fields while
  typing. Selected customer with saved measurements shows a primary
  "আগের মাপ আছে" note; without, a muted "মাপ প্রথমবার নেওয়া হচ্ছে".
- পোশাক: garment chips (the 6 defs) switch the measurement template.
- মাপ: labelled numeric inputs (decimal-pad) in a 2-column grid,
  pre-filled from the customer's saved measurement for that garment
  (per-garment typed cache wins once edited; switching customer resets
  the cache; "আগের মাপ বসানো হয়েছে" note while untouched). ডিজাইন নোট
  multiline below.
- ডেলিভারি ও বিল: delivery chips ৩/৫/৭ দিনে or "তারিখ লিখুন" — a
  free-text date ("২৭ নভেম্বর") parsed best-effort (Bengali digits +
  month names → offset; unparseable falls back to 7 days with an
  inline note). Live line shows the resolved delivery date. মোট টাকা /
  জমা (অগ্রিম) inputs; বকেয়া computed live under a hairline (amber
  when > 0, muted at ০). কারিগর chips optional ("পরে ঠিক করব" = none).
- সেভ: validates name + total > 0 (inline danger message above the
  button otherwise), adds the order via the store, then
  `router.replace` to the Orders tab where it appears at the top.
- Entry points wired: dashboard grid "নতুন অর্ডার" cell (ActionGrid
  gained an optional per-item `route`) and the Orders header button.
  Tab-bar center button is NOT in this package (per scope).

### Deviations / notes
- Inputs inside white panels use the paper background instead of pure
  white (DESIGN.md says white inputs — on a white panel they would be
  invisible except for the hairline; the paper tint keeps the locked
  palette and the field boundary readable).
- The বকেয়া tab's summary/list still derive from the static mock
  constants, so a brand-new order's due appears in Orders + Dashboard
  totals immediately but joins the বকেয়া list only when that tab is
  migrated to the store.
- Custom delivery dates are parsed only in "day + Bengali month name"
  form; anything else falls back to 7 days with a visible note.

### Verification
- `rm -rf dist` first (stale-dist tsc gotcha), then
  `npx tsc --noEmit` — PASS (exit 0, no errors).
- `npx expo export --platform web` — PASS; new-order bundle 15KB
  emitted alongside index/orders/due/karigar.
- No git commits/pushes (coordinator handles git), no Supabase.
