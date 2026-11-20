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

## Package B: মাপ ট্যাব + কাস্টমার (2026-11-20)
The measurement book and the customer pages: find a customer's saved
measurements by name/phone, browse all customers, and open one
customer's full page (summary + measurements + order history).

### Screens
- **মাপ ট্যাব — `app/(tabs)/measurements.tsx`** (new tab, Ruler icon,
  order: হোম, অর্ডার, মাপ, বকেয়া, কারিগর). White header "মাপের খাতা",
  a prominent search field (48px — finding is this screen's main job),
  then only the customers who HAVE saved measurements (9 of the 12 mock
  customers), as ledger rows: circular initial avatar, name, one meta
  line (phone in Bengali digits · garments with saved measurements,
  e.g. "পাঞ্জাবি, শার্ট"), chevron. Tap → customer detail.
- **কাস্টমার তালিকা — `app/customers.tsx`** (stack). Back header,
  search, all 12 mock customers. Right side: total due in amber
  (derived live from the orders store, matched by phone) when > 0,
  otherwise the order count (or "নতুন কাস্টমার"). Tap → detail.
  Wired from the dashboard grid "কাস্টমার" cell; the grid's
  "মাপ খুঁজুন" cell now routes to the মাপ tab too.
- **কাস্টমার বিস্তারিত — `app/customer/[phone].tsx`** (stack, keyed by
  phone). Summary panel (মোট বকেয়া big — amber only when > 0 — plus
  মোবাইল / মোট অর্ডার / মোট জমা), then one panel per measured garment
  with field/value pairs in 2-column hairline rows (labels from
  garmentDefs, values in Bengali digits) and a visual "মাপ সম্পাদনা"
  button, then the customer's order history from `useOrders()` as
  ledger rows with status chips (right: total + বকেয়া/পরিশোধ), and a
  "টাকা জমা নিন" primary button when a due remains (visual — Package C
  builds the collection screen). Unknown phones degrade gracefully:
  name/orders are derived from the store, measurements show empty.
- **বকেয়া tab rows are now tappable** → the same customer detail
  (the row's "জমা নিন" button stays visual and keeps its own press).

### Shared bits — `src/components/CustomerBits.tsx`
- `CustomerAvatar` (circular initial, tint rotates through the muted
  palette), `SearchField` (the list-screen search box, optional
  prominent height), `BackHeader` (white bar, back chevron + title)
  — extracted so the three new screens share one look.

### Deviations / notes
- Customers still come from the mock list: a customer first created
  through the নতুন অর্ডার form appears in Orders immediately but joins
  the customer list / মাপ tab only when a real customers store
  replaces the mock `customers` array.
- "মাপ সম্পাদনা" and "টাকা জমা নিন" on the detail screen are visual
  Pressables with no action yet (edit-prefill flow and the collection
  screen are later packages, per scope).

### Verification
- `rm -rf dist` first (stale-dist tsc gotcha), then
  `npx tsc --noEmit` — PASS (exit 0, no errors).
- `npx expo export --platform web` — PASS; measurements (3.1KB),
  customers (3.9KB) and [phone] (4.6KB) bundles emitted alongside the
  existing routes.
- No git operations, no Supabase.

---

## Package C: অর্ডার বিস্তারিত + রসিদ + টাকা জমা (2026-11-20)
An order is now a full working page: status moves forward step by step,
money can be collected against it, and a receipt can be shown — with the
বকেয়া tab finally reading the live store so collections land everywhere.

### Store — `src/store/orders.ts`
- `updateStatus(id, status)` — immutable map swap + notify (the order
  detail's stepper button is the caller).
- `addPayment(id, amount, method?)` — records a collection: the amount
  is clamped to the open due (paid never exceeds the bill, due never
  below 0), added to `advance` (total paid), and appended to the
  order's `payments` history as `{ amount, dateOffset: 0, method }`.
  Returns the amount actually recorded. The spec's `addPayment(id,
  amount)` signature gained an optional `method` so the collect
  screen's নগদ/বিকাশ/নাগদ choice is kept in the history.
- Session collections counter + `useSessionCollections()` — money taken
  through the collect screen this session, added on top of the mock
  আজকের আদায় constant by the Dashboard band and the বকেয়া summary,
  so "আজ আদায়" moves too, not just the dues.

### Data — `src/data/mock.ts`
- `Order` gains optional `payments?: OrderPayment[]` (new exported
  type). The initial অগ্রিম is deliberately NOT a payments entry — the
  detail screen derives it as `advance − sum(payments)`, so seed orders
  (no entries) show their full advance as অগ্রিম.
- `shop` gains `phone` ('01812-345678') — the receipt header needs one;
  the mock shop had none.
- `garmentKeysForLabel(label)` — maps an order's display garment
  ("শার্ট ও প্যান্ট" → [shirt, pant], "কামিজ" → [salwar]) to garment
  def keys, used to pick the measurement template / saved measurements
  on the order detail.

### Screens
- **অর্ডার বিস্তারিত — `app/order/[id].tsx`** (stack). Header: back,
  order code, status chip. Status panel: horizontal 5-stage stepper
  (মাপ → কাটিং → সেলাই → রেডি → ডেলিভারি; done = filled green dot with
  check + green line, current = primary ring with inner dot, upcoming
  = muted; stepper labels are shortened — "মাপ"/"ডেলিভারি" — because
  the full labels don't fit five columns) and a "পরের ধাপে নিন · {next}"
  primary button advancing via `updateStatus` (hidden once delivered;
  cancelled orders show a danger note instead of the stepper).
  Customer panel (avatar, name, phone) taps through to the customer
  detail. পোশাক ও মাপ panel: measurements from `order.measurements`
  when the order carries them, else the customer's saved measurements
  for the garment (compound garments like শার্ট ও প্যান্ট show both
  blocks with sub-titles), 2-column label/value rows as on the customer
  detail, design note under a hairline when present, "মাপ সেভ নেই"
  when neither exists. ডেলিভারি panel: date (আজ/আগামীকাল · calendar
  date) + কারিগর row. বিল panel: মোট / জমা / বকেয়া (amber, bold)
  plus payment history — অগ্রিম row ("অর্ডার নেওয়ার সময়") then one
  row per collection (method · date label, আজ for session ones).
  Actions: টাকা জমা নিন (primary, only when due > 0) → collect screen;
  রসিদ (secondary) → receipt; ট্র্যাকিং লিঙ্ক (secondary) toggles an
  inline primary-tint note with the tracking code (= order code) —
  the public page itself is Package H.
- **টাকা জমা — `app/collect/[id].tsx`** (stack; flat route chosen over
  `app/order/collect/[id].tsx` for a cleaner URL, used consistently).
  Customer + order panel, বকেয়া big in amber, amount input prefilled
  with the full due, quick chips (পুরোটা / ৫০০ / ১,০০০), method chips
  (নগদ default / বিকাশ / নাগদ), live "জমার পর বকেয়া থাকবে" line,
  inline validation (amount > 0 and ≤ due), জমা নিন → `addPayment`
  → back. An order with no due shows "এই অর্ডারে কোনো বকেয়া নেই।"
- **রসিদ — `app/order/receipt/[id].tsx`** (stack). Printable-style
  white card on paper: shop name/address/phone centered, রসিদ নং
  (order code), তারিখ (today), customer name/phone, garment, delivery
  date, bill lines (মোট/জমা/বকেয়া — due amber + bold when open),
  "ধন্যবাদ! আবার আসবেন।", and a primary-tint tracking box ("অর্ডারের
  অবস্থা জানতে এই কোডটি রাখুন" + the code). শেয়ার is a visual
  secondary button (no native share wiring, per scope); back is the
  header.

### Wiring + Due tab migration
- Order rows now open the detail everywhere: Orders tab, Dashboard
  (আজকের ডেলিভারি + upcoming lists), customer detail order history.
- Customer detail's "টাকা জমা নিন" now collects against the
  customer's OLDEST due order (earliest delivery offset with due > 0).
- **বকেয়া tab migrated to the store**: list + summary (মোট বকেয়া /
  কাস্টমার সংখ্যা / ৩০ দিনের বেশি পুরনো / আজ আদায়) are derived from
  `useOrders()` with the same rules the static mock constants used;
  its "জমা নিন" buttons open the collect screen for that row's order
  (stopPropagation so the row's customer-detail tap doesn't fire).
  The static `dueEntries`/`dueStats` exports remain in mock.ts but are
  no longer imported anywhere. কারিগর tab is untouched (still mock).

### Deviations / notes
- Collect route is `app/collect/[id].tsx`, not `app/order/collect/[id].tsx`
  (spec allowed either; flat picked and used in all three entry points).
- The receipt's shop phone is a new mock field (see Data above).
- আজকের আদায় now = mock constant + session collections (see Store) —
  after an app restart the session part resets, like all store state,
  until Supabase lands.

### Verification
- `rm -rf dist` first (stale-dist tsc gotcha), then
  `npx tsc --noEmit` — PASS (exit 0, no errors).
- `npx expo export --platform web` — PASS; three new [id] bundles
  emitted (order detail 16KB, collect 8KB, receipt 8KB) alongside the
  existing routes.
- No git operations, no Supabase.

## Package D: কারিগর বিস্তারিত + নতুন কারিগর + কারিগর পেমেন্ট (2026-11-20)

Goal: the কারিগর tab stops being a static mock page — karigars get
their own store (same pattern as orders), a detail page with work +
payment history, an add-karigar form, and a wage-payment screen whose
effect shows up everywhere immediately.

### Store — `src/store/karigars.ts` (new)
- Mirrors `src/store/orders.ts`: module-level state seeded from the
  mock karigars + their `karigarWork` entries, `useSyncExternalStore`,
  immutable updates + listener fan-out. Screens only see
  `useKarigars()` / `karigarTotals()` / `karigarSummary()` /
  `addKarigar()` / `addKarigarPayment()`.
- Money model per karigar: earned (this month) = the mock aggregate
  `monthlyEarned`; paid = sum of `payments`; due (পাওনা) =
  max(0, earned − paid). Seeded payment history per karigar
  (2 entries each, নগদ/বিকাশ/নাগদ, ৩–১৩ days ago) is sized so paid
  equals `monthlyEarned − wageDue` — the derived due therefore
  reproduces the mock dues exactly (৳4,200 / ৳3,150 / ৳2,400 /
  ৳1,800; tab total ৳11,550, পরিশোধ ৳7,200), and the detail screen
  gets a real history instead of an empty list.
- `addKarigar({name, role, phone?, pieceRates?})` appends an entry
  with zeroed aggregates and empty work/payments. `wageDue` on the
  entry stays 0 — all screens read the derived totals, never the raw
  mock field.
- `addKarigarPayment(id, amount, method?)` clamps to the open due
  (never overpays), appends `{amount, dateOffset: 0, method}`, and
  returns the amount actually recorded — same contract as orders'
  `addPayment`.

### Screens
- **কারিগর tab migrated to the store** (`app/(tabs)/karigar.tsx`):
  same visual design as before; summary + per-karigar পাওনা/আয় now
  derived via `karigarTotals`. Each karigar block is one Pressable →
  detail. Header gains a compact "+ নতুন কারিগর" primary button
  (Plus icon) via a new optional `right` slot on `WhiteHeader`
  (বকেয়া tab unaffected).
- **কারিগর বিস্তারিত — `app/karigar/[id].tsx`** (stack). BackHeader;
  identity panel (48px circular initial avatar in the tab's rotating
  tint, name, role, phone row when present); SummaryPanel with পাওনা
  big in ink and stats এই মাসে আয় / মোট পরিশোধ / এই মাসে সম্পন্ন
  পিস; কাজের তালিকা — one LedgerPanel of work rows (garment · order
  code/customer, "N পিস × ৳রেট" sub-line, running tag, amount);
  পেমেন্ট ইতিহাস — LedgerPanel, newest first (method, date label via
  `deliveryLabel`, amount). Actions: পেমেন্ট করুন (primary, only
  when due > 0) → payment screen; কাজ দিন (secondary) is **visual
  only** — assigning work lives in the order flow (অর্ডারে কারিগর
  বাছাই); wiring it here is a later package. Empty states are the
  standard one-liners.
- **নতুন কারিগর — `app/karigar/new.tsx`** (stack). Form panel: নাম
  (required, inline danger error), ভূমিকা chips (সেলাই মাস্টার /
  কাটিং মাস্টার / সেলাই / ফিনিশিং / অন্যান্য; stored as `skill`),
  মোবাইল নম্বর (optional, phone-pad). পিস-রেট panel: পাঞ্জাবি ৩০০ /
  কামিজ ২৫০ / কাটিং ১৫০ / ব্লাউজ ১৮০ prefilled from the rates the
  mock work already uses, editable right-aligned numeric inputs with
  ৳ mark; zero/blank rates are dropped. Save → `addKarigar` → back;
  the new karigar is on the tab (with an empty কাজের তালিকা).
- **কারিগর পেমেন্ট — `app/karigar/pay/[id].tsx`** (stack). Mirrors
  the টাকা জমা collect screen control-for-control: identity panel,
  পাওনা panel, amount input prefilled with the full due, quick chips
  (পুরোটা / ৫০০ / ১,০০০), method chips (নগদ / বিকাশ / নাগদ), live
  "পেমেন্টের পর পাওনা থাকবে", inline validation (amount > 0 and
  ≤ due) → `addKarigarPayment` → back. Deliberate difference from
  collect: পাওনা and the remaining figure stay **ink** — this due is
  the shop's own payable, and amber is reserved for customer dues
  (DESIGN.md v1.3). A karigar with no due sees "এই কারিগরের কোনো
  পাওনা নেই।"

### Deviations / notes
- The role chip "সেলাই" is stored verbatim as the skill, so a karigar
  added with it shows "সেলাই" where seeded karigars show "সেলাই
  কারিগর" — the chip list follows the Package D spec exactly.
- Piece rates from the form are stored on the entry (`pieceRates`)
  but nothing consumes them yet — they take effect when কাজ দেওয়া
  is wired to the order flow.
- Seeded payments are mock history invented for the detail screen;
  their sums are pinned to the mock aggregates (see Store), so no
  figure on the tab changed in this migration.
- Store state is session-only, like the orders store — payments and
  new karigars reset on app restart until Supabase lands.

### Verification
- `rm -rf dist` first (stale-dist tsc gotcha), then
  `npx tsc --noEmit` — PASS (exit 0, no errors).
- `npx expo export --platform web` — PASS; new bundles emitted for
  karigar detail, karigar payment ([id] bundles) and নতুন কারিগর
  (new) alongside the migrated কারিগর tab bundle.
- No git operations, no Supabase.

## Package E: রিপোর্ট (2026-11-20)

### Screens
- **রিপোর্ট — `app/reports.tsx`** (stack, wired from the dashboard grid
  "রিপোর্ট" item via a new `route: '/reports'` on ActionGrid).
  BackHeader "রিপোর্ট"; সব হিসাব live from `useOrders()` +
  `useKarigars()` + `useSessionCollections()`, Bengali digits
  everywhere, amber only on due figures.
  - **দৈনিক সারসংক্ষেপ — আজ:** SummaryPanel, big = আজকের আদায়;
    stats আজকের অর্ডার / আজকের ডেলিভারি / আজ ডেলিভারিতে বকেয়া
    (amber).
  - **সময়ের হিসাব:** period chips (আজ / এই সপ্তাহ / এই মাস, orders-tab
    chip style) switching a SummaryPanel: big = মোট বিক্রি; stats
    মোট অর্ডার / মোট আদায় / বকেয়া যোগ হয়েছে (amber).
  - **গত ৭ দিনের অর্ডার:** View-based bar strip — 7 flat primary bars
    on muted neutral-tint tracks (64px), count on top, date number
    below ("আজ" for today). No chart library, no gradients.
  - **আয়ের বিবরণী — {period}:** per-garment rows (নাম, Nটি অর্ডার,
    মোট টাকা) in one LedgerPanel, sorted by total desc, closing
    মোট বিক্রি row that equals the period panel's figure. Empty
    period → the standard one-line empty state.
  - **কারিগর খরচ — এই মাস:** per-karigar rows from the karigar store
    (নাম; meta "আয় X · পরিশোধ Y"; right পাওনা in ink — the shop's own
    payable, so NOT amber, same rule as Package D), closing
    মোট কারিগর পাওনা row. Period-independent (see below).
  - Footnote: "সব হিসাব অর্ডারের ডেলিভারি তারিখ ধরে করা।"
- **`SummaryPanel` extension:** `SummaryStat` gained an optional
  `valueColor` (used for the amber due stats). Backward compatible —
  every existing screen renders unchanged.

### Derivations — the honest part
The mock `Order` has **no creation date**. The only per-order date is
`deliveryInDays`, and the only dated money events are session
collections (`payments[]`, all `dateOffset: 0`), which the store has
already folded into `advance`. So:

- **Period windows are delivery-date windows** over non-cancelled
  orders: আজ = offset 0; এই সপ্তাহ = −6..0; এই মাস = −29..0.
  মোট অর্ডার = count in window; মোট বিক্রি = Σ `total`;
  বকেয়া যোগ হয়েছে = Σ `dueOf` in window (net — a session collection
  against an in-window order shrinks it, correctly).
- **মোট আদায় (period)** = আজকের আদায় + Σ `advance` of orders
  delivered earlier inside the window (offset < 0). আজকের আদায় is the
  figure the Dashboard/বকেয়া already show — the mock counter constant
  ৳6,300 + `useSessionCollections()` — so the আজ period matches the
  dashboard exactly. The delivered orders' advances are the only other
  collections the book can place in a window at all; treating them as
  realized in their delivery window is a proxy, and `advance` (which
  already includes every `payments` entry) is summed once, never
  advance+payments double-counted.
- **দৈনিক সারসংক্ষেপ proxies:** আজকের অর্ডার = orders with delivery
  due today (the day's order book — there is no "placed today" field);
  আজকের ডেলিভারি = of those, the ones ready or delivered (hand-over
  able); আজ ডেলিভারিতে বকেয়া = Σ `dueOf` of today's orders — the
  collection expected at today's handovers.
- **৭-day bars are delivery-date counts** (offsets −6..0), not
  order-placement counts — same proxy, labelled on screen only as
  "গত ৭ দিনের অর্ডার" with the delivery-date footnote covering it.
- **কারিগর খরচ ignores the period chips:** karigar figures are monthly
  aggregates (`monthlyEarned`, payments list) with no per-order dates,
  so the section is fixed to এই মাস and says so in its title.
- **Future-delivery orders (offset > 0) sit outside every window** —
  they are upcoming work, already counted on the Dashboard as চলমান
  অর্ডার. A brand-new order therefore moves the report only when a
  collection is taken on it (session collections lift আজকের আদায় and
  every period's মোট আদায় at once) — "where the data allows", as
  specced. Real created-at timestamps land with Supabase and retire
  every proxy above.

Seed check (verified by script against the mock data): আজ —
৩টি অর্ডার, বিক্রি ৳৩,৫০০, আদায় ৳৬,৩০০, বকেয়া ৳১,২৫০; সপ্তাহ —
৬টি, ৳৬,৯০০, ৳৮,৯৫০, ৳২,০০০; মাস — ১২টি, ৳১২,৩৫০, ৳১১,২০০,
৳৫,২০০ (monotonic, and the per-garment month rows sum to the month
বিক্রি). Daily card: অর্ডার ৩টি, ডেলিভারি ১টি, বকেয়া ৳১,২৫০.
7-day counts: ১,০,০,০,১,১,৩. মোট কারিগর পাওনা ৳১১,৫৫০.

### Verification
- `rm -rf dist` first (stale-dist tsc gotcha), then
  `npx tsc --noEmit` — PASS (exit 0, no errors).
- `npx expo export --platform web` — PASS; new `reports` bundle
  (9.3KB) emitted alongside all existing bundles.
- No git operations, no Supabase.

## Package F: লগইন / OTP / সেটআপ / প্ল্যান — onboarding UI (2026-11-20)

The front door exists as complete interactive UI. **No auth backend
and no gating**: the root still opens straight to the tabs; the auth
screens live in an `app/(auth)/` route group (clean URLs /login,
/otp, /setup, /plan) and are reachable by route. One discreet entry
point for reviewers: the dashboard band's avatar is now a Pressable
(BandHeader gained an optional `onAvatarPress`) that pushes /login.
Supabase phone auth replaces the demo flow later without changing
the screens' shape.

### Screens
- **লগইন — `app/(auth)/login.tsx`.** bKash-style entry: flat green
  band (logo circle with Ruler icon, app name "মাপখাতা", one-line
  promise "মাপের খাতা, অর্ডার আর বকেয়ার হিসাব — এখন মোবাইলে"), then
  a white sheet panel: মোবাইল নম্বর input (digits only, 11 max) with
  BD validation `/^01[3-9]\d{8}$/` and an inline danger error,
  "OTP পাঠান" primary → /otp with the phone as a route param. Footer
  note: চালিয়ে যাওয়া = শর্তাবলিতে সম্মতি.
- **OTP যাচাই — `app/(auth)/otp.tsx`.** Shows the target phone
  (Bengali digits). Four boxes are rendered from ONE visually hidden
  TextInput laid over the box row (tapping the boxes focuses it;
  the active box gets the primary border, an error turns all four
  danger). **Demo behaviour, clearly labelled on screen**: a
  primary-tint panel reads "ডেমো মোড — এখনো SMS যুক্ত হয়নি। ডেমো
  কোড: ১২৩৪", and ONLY the code 1234 verifies — any other 4 digits
  show "কোড মিলছে না" inline (no any-code shortcut). Resend is a
  ৩০-second countdown label; when it expires, "আবার কোড পাঠান"
  appears and merely restarts the countdown + clears the boxes (no
  SMS is sent). Success → /setup (new-shop flow). A quiet text
  button "আগের দোকান আছে? সরাসরি ঢুকুন" replaces to the tabs home
  for existing shops.
- **দোকান সেটআপ — `app/(auth)/setup.tsx`.** Logo placeholder:
  64px tint circle (ImagePlus icon) with a "ছবি দিন" action —
  visual only, no image picker. Form: দোকানের নাম*, মালিকের নাম*
  (both validated with inline errors), ঠিকানা/বাজার, জেলা, and
  দোকানের ধরন chips (টেইলার্স / বুটিক / দুটোই, default টেইলার্স).
  Save → /plan. Nothing is persisted.
- **প্ল্যান বাছাই — `app/(auth)/plan.tsx`.** মাসিক/বার্ষিক toggle
  chips. Two plan panels (selected = primary border + primary tint,
  with a radio dot): ফ্রি (শুরু) ৳০ — মাসে ৩০টি অর্ডার, মাপের খাতা,
  বকেয়া তালিকা; প্রো (badge "জনপ্রিয়", mustard tint) — মাসিক
  ৳৪৯৯, বার্ষিক ৳৪,৯৯০ with "২ মাস ফ্রি" — অসীম অর্ডার, SMS
  নোটিফিকেশন, কারিগর হিসাব, রিপোর্ট. প্রো is preselected. Note
  line "প্রথম ১ মাস ফ্রি — কার্ড লাগবে না।" "শুরু করুন" replaces
  to the tabs home. Prices render in Bengali digits via formatTaka
  + toBnDigits.

### Shared bits — `src/components/AuthBits.tsx`
- `LabeledInput` — label-on-top 44px field (paper-tinted inside
  white panels, same convention as the new-order form), primary
  border on focus, inline danger error. Used by login + setup.
- `SelectChips` — the single-select filled-primary chip row (same
  style as the karigar role chips), used by setup + plan.

### Deviations / notes
- The OTP boxes use an opacity-0 overlay input rather than four
  separate inputs — one source of truth for the code, no focus
  juggling; digits render in Bengali inside the boxes.
- The plan radio dot is an extra affordance on top of the specced
  border + tint selected state (circles are allowed; it reads as a
  radio, not decoration).
- All state is local/useState — setup data and the chosen plan are
  NOT written anywhere; they become real when Supabase lands.

### Verification
- `rm -rf dist` first (stale-dist tsc gotcha), then
  `npx tsc --noEmit` — PASS (exit 0, no errors).
- `npx expo export --platform web` — PASS; login, otp, setup and
  plan bundles all emitted alongside the existing routes.
- No git operations, no Supabase.

## Package G: সেটিংস প্যাকেজ — দোকান হাব, প্রোফাইল, স্টাফ, সাবস্ক্রিপশন/SMS, নোটিফিকেশন, সার্চ (2026-11-20)

The shop's back office is complete as UI: a settings hub with five
destinations, plus notifications and a global search wired into the
dashboard band. Everything follows DESIGN.md incl. the v1.3 colour
matrix (paper/white/tint backgrounds only, amber only on due figures,
≤3 colour families per screen, radius ≤8 outside the allowed circles).

### Screens
- **দোকান হাব — `app/shop.tsx`** (stack). Identity panel: 56px logo
  circle (primary tint, shop initial), shop name + mustard "প্রো"
  plan badge, owner and phone/area meta lines. Settings list in one
  LedgerPanel — ledger rows with a small tint icon circle, label, one
  meta line, chevron: দোকানের প্রোফাইল → /shop/profile; স্টাফ →
  /shop/staff; সাবস্ক্রিপশন ও SMS → /shop/subscription; নোটিফিকেশন →
  /notifications; সাহায্য (visual row, no route). Footer: centered
  "মাপখাতা v0.1.0" + a danger-text লগআউট button → replace /login.
  Wired from BOTH dashboard grid cells: দোকান (main grid) and সেটিংস
  (expanded grid) now carry `route: '/shop'` in ActionGrid.
- **প্রোফাইল — `app/shop/profile.tsx`**. LabeledInput form in one
  white panel, prefilled from the mock shop: নাম, মালিক, ফোন,
  ঠিকানা/বাজার + জেলা (split from `shop.area` "এলিফ্যান্ট রোড,
  ঢাকা"), ধরন SelectChips (টেইলার্স / বুটিক / দুটোই). সেভ shows the
  inline "সেভ হয়েছে" note (primary, check icon) and goes back after
  a beat. **Local state only — there is no shop store yet, so edits
  do not persist or reach the dashboard band; persistence arrives
  with Supabase.**
- **স্টাফ — `app/shop/staff.tsx` + `app/shop/staff-new.tsx`**.
  List reads the new staff store: avatar rows (name, "ভূমিকা · ফোন"
  meta, Bengali digits) with a section-row "+ স্টাফ যোগ" primary
  button; a footnote states the boundary — কারিগররা স্টাফ নন, their
  piece-rate হিসাব stays in the কারিগর ট্যাব. The form: নাম
  (required, inline danger error via LabeledInput), মোবাইল, ভূমিকা
  SelectChips (ম্যানেজার / কাটিং মাস্টার / সহকারী), and an অনুমতি
  panel of RN Switch rows (অর্ডার নেওয়া default on, টাকা জমা,
  রিপোর্ট দেখা; Switch track = primary when on, hairline when off).
  Save → `addStaff` → back; the new member is on the list at once.
- **সাবস্ক্রিপশন ও SMS — `app/shop/subscription.tsx`**. Plan panel:
  প্রো প্ল্যান + ৳৪৯৯/মাস, মেয়াদ শেষ = today + 18 days
  (`fullDateLabel`), এই মাসে ব্যবহৃত অর্ডার counted live from the
  orders store (this month's delivery window, the Package E
  derivation — ১২টি on the seed) with a flat progress bar (primary
  fill on a primary-tint track) read against the ফ্রি limit of ৩০,
  captioned "প্রো-তে অসীম". SMS SummaryPanel: ব্যালেন্স ১২০টি big;
  stats এই মাসে পাঠানো ৪৬টি / কনফার্ম ২৮টি / রেডি ১৮টি (28 + 18 =
  46); per-SMS cost note under the panel (৳০.৬০ small pack, ৳০.৫০
  large). Pack SelectChips (১০০টি · ৳৬০ / ৫০০টি · ৳২৭৫ / ১০০০টি ·
  ৳৫০০) + কিনুন button — visual only: pressing shows the inline
  primary-tint note "পেমেন্ট গেটওয়ে শীঘ্রই আসছে". প্ল্যান বদলান
  ledger row → /plan.
- **নোটিফিকেশন — `app/notifications.tsx`**. Derived live: today's
  undelivered orders from the orders store ("আজ ডেলিভারি: নাম —
  পোশাক", code · status meta, Truck icon, "আজ সকাল"), dues older
  than 30 days ("পুরনো বকেয়া: নাম", amount · days, Wallet/amber,
  "গতকাল"), one karigar wage-due summary row from the karigar store
  (মোট ৳১১,৫৫০ · ৪ জন). Plus two seeded system items (SMS ব্যালেন্স
  কম, নতুন ফিচার). Rows: 36px tint icon circle, title, one meta
  line, right column with time label and — on the first two rows —
  an 8px primary unread dot. "সব পড়া হয়েছে" text button above the
  list clears the dots (local state).
- **গ্লোবাল সার্চ — `app/search.tsx`**. Prominent SearchField; a
  query under 2 characters shows only the hint line. Grouped
  sections: কাস্টমার (mock customers by name/phone digits → customer
  detail), অর্ডার (orders store by code — Latin or digit fragment —
  or customer name; LedgerRow with status → order detail), কারিগর
  (karigar store by name → karigar detail). No hits → the one-line
  empty state "কিছু পাওয়া যায়নি।"

### Store + data
- `src/store/staff.ts` (new) — mirrors the karigar store pattern
  (module state, `useSyncExternalStore`, immutable append):
  `useStaff()` / `addStaff({name, phone, role, permissions})`.
- `src/data/mock.ts` — `Staff` / `StaffPermissions` types and a
  3-person `staff` seed (ম্যানেজার আরিফুল ইসলাম — all permissions;
  কাটিং মাস্টার সুমন আহমেদ; সহকারী নাজমুল হাসান — orders only),
  with a comment pinning the staff ≠ karigar boundary.
- `BandHeader` gained optional `onSearchPress` / `onBellPress`
  props; the dashboard wires search → /search and bell →
  /notifications. Without the props the buttons stay visual, as
  before.

### Deviations / notes
- The profile's ঠিকানা/জেলা are one mock field (`shop.area`) split
  on the comma — a real shop record will carry them separately.
- The subscription usage bar needs a denominator; প্রো is unlimited,
  so the bar is drawn against the ফ্রি plan's ৩০-order limit and
  labelled as such (same honesty approach as Package E's proxies).
- সাহায্য on the hub and the bell/search buttons' pressed states are
  visual; there is no help screen in this package's scope.

### Verification
- `rm -rf dist` first (stale-dist tsc gotcha), then
  `npx tsc --noEmit` — PASS (exit 0, no errors; one import fix during
  the run: `statusMeta` comes from theme, not mock).
- `npx expo export --platform web` — PASS; new bundles emitted:
  shop 6.2KB, subscription 7.2KB, search 4.5KB, staff-new 4.3KB,
  profile 3.5KB, staff 2.8KB, notifications (bundle present in dist).
- No git operations, no Supabase.
