# Production-Readiness Security Audit — Weblink (Guest SPA)

> Part of a 3-repo platform audit (backend / frontend / weblink). This file covers the **guest-facing magic-link SPA** only.
> Generated 2026-07-01 · read-only audit · every finding adversarially re-verified against the code.

## ⛔ VERDICT: DO NOT GO LIVE — Platform Score: **14 / 100**

Weblink accounts for **19 of 129 platform findings: 0 Critical · 5 High · 6 Medium · 5 Low · 3 Suggestion.** In isolation this is the **cleanest** of the three repos — chat/guest content rendering is XSS-safe (verified), there are no committed `.env` secrets, and routes carry no enumerable IDs (data flows via router state, not URL params).

**But its safety is not self-contained.** Every High finding is *backend-dependent*: the guest SPA sends client-supplied identifiers (`channelid`, `foodOrderId`, `hotelId`, item prices) and relies entirely on the backend to enforce token-derived ownership. Given the backend has **confirmed** cross-tenant IDOR gaps (see the backend report), treat these as live until the backend is fixed. Weblink also participates in the platform-wide committed-secret problem: the JWT signing key is shared across all three repos.

---

## High

**1. JWT signing secret hardcoded across three repos incl. the shipped admin bundle.**
File: `Hotel-Automation/app/utils/constants.js:77` + the socket server + `Hotel-web-app/src/constants/data.ts:1198`
Problem: The HS256 signing secret `'fasdkfjkl…'` is committed in the API, the socket server, and — most damaging — bundled into the shipped admin React app, where it is trivially recoverable. weblink's own guest tokens are minted/verified with this key.
Impact: Anyone who views repo history or downloads the admin bundle holds the master signing key. (Full forgery is gated by the backend's session-table check, but that is defeated by the separately-committed Mongo Atlas creds — see the backend report.)
Recommendation: Move `JWT_SIGN_KEY` to env/secret manager, rotate, and purge from history in all three repos. Never ship the signing secret in any client bundle.

**2. IDOR: room device control via client-supplied `channelid`.**
File: `weblink/src/api/service/dashboardService.js:50-56`
Problem: `execDevice()` posts a client-supplied `channelid` to `POST /api/rooms/device/exec` (passed through by `lightViewModel.js` `toggleLight`/`updateFanLevel` and `RoomScenes.jsx`). Nothing client-side ties the `channelid` to the authenticated guest's room; the only binding is the raw JWT in the `authorization` header.
Impact: If the backend doesn't resolve the caller's room from the token and verify the `channelid` belongs to it, a guest can tamper the request body in devtools to actuate **another room's** lights/fans — a physical-safety and privacy concern. (Backend-dependent; not fixable in this SPA.)
Recommendation: **Backend** must derive the room from the verified JWT and reject cross-room `channelid`s with 403.

**3. Master/scene toggle forwards a client `channelid` that fans out to all room devices.**
File: `weblink/src/viewModel/lightViewModel.js:173-177` (also `RoomScenes.jsx:149-150`)
Problem: `toggleMaster()` sends the master/scene device's `channelid`; the backend then actuates every channel in that room.
Impact: Same root cause as #2 but larger blast radius — one forged request could switch an entire other room's devices. Backend-dependent.
Recommendation: **Backend** must apply the same token-derived room-ownership check to master/scene channels before any fan-out.

**4. Food order line-item prices are computed client-side and sent to the server.**
File: `weblink/src/viewModel/cartViewModel.js:319-323` (posted by `foodService.js:62-67`)
Problem: `handleConfirmOrder` builds `foodItems` with per-item `price: getCartUnitPrice(item)` taken from local cart state; no server-signed total accompanies it.
Impact: If the backend trusts the client `price`, an attacker sets `price=1` for expensive items and underpays (the manipulated stored price then flows into the Razorpay charge via `initiatePayment`). Backend-dependent.
Recommendation: **Backend** must ignore the client price and recompute each line from the authoritative food record, re-applying coupons server-side. Optionally drop `price` from the client payload.

**5. IDOR on payment initiate/verify via client `foodOrderId`.**
File: `weblink/src/api/service/foodService.js:76-91`
Problem: `initiatePayment({foodOrderId})` and `verifyPayment({foodOrderId, ...})` send a raw client-chosen order `_id` (from fetched listings). No client-side ownership check.
Impact: If the backend doesn't verify the order belongs to the authenticated guest, an attacker can call these against another guest's `foodOrderId` — leaking payment amounts or tampering with another order's lifecycle. Backend-dependent.
Recommendation: **Backend** must load the order and confirm ownership against the verified token before returning payment data or accepting verification.

---

## Medium (6)

| # | Title | File:Line |
|---|-------|-----------|
|6|Client auth never validates JWT `exp` — a stale/checked-out token renders an authenticated UI on load|context/AuthContext.jsx:9-71|
|7|Guest JWT sent to Socket.IO as a URL **query parameter** — leaks into server/proxy/CDN access logs|api/socketService.js:44-45|
|8|Guest JWT stored in localStorage (`hotel_guest_token`) — readable by any XSS|context/AuthContext.jsx:20 / api/client.js:15|
|9|Cross-tenant order-creation risk: `hotelId` + `deliveryAddress` supplied in the order body|viewModel/cartViewModel.js:325-329|
|10|Non-production API base URL hardcoded (`dev-hotel-api…`), no env abstraction — guest PII sent to dev infra|api/client.js:4|
|11|No dev/staging/prod separation; socket + CDN URLs hardcoded; stale ngrok in `vite.config.js`; ngrok baked into committed `dist`|utils/socketEvents.js:32, utils/constant.js:67, vite.config.js:8|

## Low (5)

URL-token scrub is cosmetic — no Referrer-Policy, runs after initial render, hash not cleared `context/AuthContext.jsx:50-51` · logout is client-only — no server-side session/token revocation, no explicit socket disconnect `context/AuthContext.jsx:84-95` · client-side JWT decode has no structural/claim validation (any non-null payload → authenticated UI) `context/AuthContext.jsx:9-18` · coupon applied by code only at order time — relies on backend re-validation `api/service/foodService.js:62-67` · no CSP and no SRI on the third-party Razorpay script while the guest JWT lives in localStorage `index.html:11`.

## Suggestion (3)

Client-side tax rate is display-only (no total sent to server — verified safe) `viewModel/cartViewModel.js:56-100` · JWT payload decoded/trusted client-side without signature verification (standard for SPAs; backend must never trust these claims) `context/AuthContext.jsx:9-51` · **[positive] chat / guest-authored content rendering is XSS-safe** — messages render via JSX interpolation (auto-escaped), no `dangerouslySetInnerHTML`/`innerHTML`/`eval` anywhere `UI/chat/component/ChatBubble.jsx:45-47`.

---

## Weblink remediation (before go-live)

**P0 (shared with the backend/frontend):** rotate the JWT signing key and purge it from history across all three repos; it must not appear in any client bundle.

**P0 — config:** move the API base, socket, and CDN URLs out of source into build-time env (`import.meta.env.VITE_*`); add `.env.example` + gitignored per-env files; remove the stale ngrok entry from `vite.config.js` and confirm the released `dist/` resolves to production hosts (not `dev-hotel-api…` and not ngrok).

**P1 — the High findings are fixed in the BACKEND** (device/order/payment ownership checks derived from the verified token). Weblink cannot fix them; verify the backend enforces them.

**P2 — hardening (weblink-side):**
- Reject tokens with missing/expired `exp` before setting `isAuthenticated`; validate token structure; never gate UI on unverified `payload.userType/hotelId`.
- Pass the socket token via the Socket.IO `auth` handshake payload, not the URL query.
- Add a backend logout endpoint and call it (+ explicit `socketService.disconnect()`) so logout revokes server-side.
- Add a strict CSP + `Referrer-Policy: no-referrer` and SRI on the Razorpay script; scrub the URL token as early as possible and clear the hash.
- Shorten guest-token TTL (backend default is 365d) to limit replay value.

## Verification
- **Config:** built `dist/` contains no `ngrok` and no `dev-hotel-api` host; requests hit the production API.
- **Ownership (backend):** as guest A, replay `device/exec`, `initiatePayment`, `verifyPayment`, and order-create with guest B's `channelid`/`foodOrderId`/`hotelId` → 403/404, no effect.
- **Price integrity (backend):** submit a food order with `price=1` for an expensive item → server recomputes; Razorpay charge reflects the true amount.
- **Token hygiene:** expired token on load → unauthenticated UI, no socket connect; token not present in the socket handshake URL; logout invalidates the session server-side.
