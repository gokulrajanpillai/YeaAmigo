# YeaAmigo — Product Requirements (current build)

## Overview
YeaAmigo is a mobile-first food delivery platform for India connecting 4 roles in one app:
- **Customer** — discover restaurants, place & track orders
- **Restaurant Owner** — manage menu, accept & fulfil orders
- **Rider** — go online, accept deliveries, pickup → drop-off
- **Admin** — platform metrics, restaurant approvals, oversight

## Brand
- Name: **YeaAmigo** · Tagline: **"Food delivery made easy"** (translated to 7 languages)
- Palette: deep ocean teal `#0B5D5A` (primary), mustard gold `#E2B43A` (accent), berry plum `#7A2E55`, warm cream surface `#FAF7F1`. Deliberately non-orange; not similar to Swiggy/Zomato.
- Original SVG penguin mascot (parent + child variant, role variants: main/child/chef/delivery/customer) with mood variants (happy, hungry, searching, celebrate, waiting, sorry, sleeping). Used in splash, login, home, profile, empty cart, empty orders, support, order-tracking success.
- Currency: **INR (₹)** throughout.

## Tech
- Backend: FastAPI + MongoDB (motor). JWT auth. `/api/*` prefix.
- Frontend: Expo (React Native) with expo-router file-based routing.
- Storage: AsyncStorage for token, cart, language pref.
- Realtime: polling (4–5s) on order tracking & live order feed. WebSockets deferred to v2.

## i18n
7 languages: English · Hindi · Tamil · Malayalam · Kannada · Marathi · Bengali.
- Auto-detect via device locale (Intl)
- Region-to-language mapping (e.g. KL→ml, TN→ta)
- Manual override via Login or Profile language picker
- Persists across app restarts (AsyncStorage)

## Key features
- Role-based auth + auto redirect by role
- Customer: home discovery, menu w/ bottom-sheet item details, cart, place order, live order tracking with progress steps + map placeholder, order history (Active/Past tabs), support tickets, profile w/ language picker, sign out
- Restaurant: dashboard with stats + OPEN/CLOSED toggle + live order cards w/ Confirm/Reject/Prep/Ready buttons, kanban view, menu builder with availability toggles, settings
- Rider: GO ONLINE toggle, available orders, accept → pickup → en_route → delivered flow, history with earnings
- Admin: overview metrics, restaurants approval queue, all orders, all users

## Demo data (auto-seeded on first boot)
- 1 admin + 1 customer + 1 rider + 2 restaurant owners
- 2 restaurants (Rossi's Wood-Fired Pizza, Sharma's Spice Kitchen)
- 12 menu items across 3 categories per restaurant
- See `/app/memory/test_credentials.md` for accounts

## Acceptance
- ✅ App rebranded to YeaAmigo end-to-end
- ✅ Teal + mustard palette (no orange anywhere)
- ✅ INR ₹ currency app-wide
- ✅ Bottom nav: 4 tabs, labels not cut off, respects safe-area-bottom
- ✅ Sign-out works from all 4 role profile/dashboards (auth state cleared + redirect to /login)
- ✅ Language picker on Login + Profile, 7 languages, auto-detect + persistence
- ✅ Original penguin mascot in Splash, Login, Home, Profile
- ✅ Restaurant menu items properly aligned in row layout (flex 1 + minWidth 0 + numberOfLines)

## Deferred to v2
- WebSocket realtime (currently polling, works)
- Rider↔customer in-app chat
- Live geolocation tracking on map (placeholder map used)
- Recharts charts in restaurant dashboard
- Image upload (menu items use pre-set Unsplash URLs)

## v1.1 — Address & Polish (current iteration)
- ✅ **Global AuthGuard**: root layout watches auth state + segments; protected routes immediately redirect to /login on logout. Cart cleared on logout.
- ✅ **Hidden scrollbars** across all 20 screens: `showsVerticalScrollIndicator={false}` + `showsHorizontalScrollIndicator={false}` on every ScrollView/FlatList plus global ::-webkit-scrollbar CSS injection on web preview.
- ✅ **Map-based Address Selection** (OpenStreetMap + Leaflet, **no API key** required):
  - New `(customer)/address.tsx` screen with three modes: saved list, map picker, manual form.
  - Leaflet OSM tiles rendered in WebView (native) and iframe (web) with center-pin crosshair.
  - Nominatim forward search (typeahead) + reverse geocode (auto-fills street/city/pincode as pin moves).
  - "Use current location" via geolocation API.
  - Persisted addresses with Home/Work/Other labels via AddressContext + AsyncStorage.
  - Wired into home location header (tap to change) and cart delivery address.
- ✅ **i18n dynamic content**: phrases dictionary now translates dish names, descriptions, cuisine tags, categories, dietary tags ("Vegetarian/Spicy/Gluten-Free") across 7 languages. Verified Hindi shows "मार्गेरीटा / दीवोला / स्वच्छता 5/5".
- ✅ **Tab bar labels**: explicit `tabBarLabel: () => <Text>...</Text>` ensures cross-platform legible labels.
- ✅ **Theme aliases**: added `colors.amber`/`amberLight` aliases to `accent`/`accentLight` for legacy references.
