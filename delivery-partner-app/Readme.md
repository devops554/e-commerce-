# 🛵 kiranase — Delivery Partner App

A production-ready React Native (Expo) app for delivery partners. Built with TypeScript, TanStack Query, Zustand, Socket.io, and Google Maps.

---

## 📁 Project Structure

```
DeliveryPartnerApp/
├── App.tsx                        # Root entry point
├── app.json                       # Expo config
├── package.json
└── src/
    ├── api/
    │   ├── client.ts              # Axios instance + interceptors + token refresh
    │   └── services.ts            # All API functions (auth, orders, location, wallet)
    ├── components/
    │   └── ui.tsx                 # Button, Card, Badge, Skeleton, StatusDot, EmptyState
    ├── hooks/
    │   └── useQueries.ts          # All TanStack Query hooks
    ├── navigation/
    │   └── AppNavigator.tsx       # Stack + Tab navigation + auto-login splash
    ├── screens/
    │   ├── auth/
    │   │   └── LoginScreen.tsx    # Phone + password login, validation, error handling
    │   ├── home/
    │   │   └── HomeScreen.tsx     # Dashboard with stats, toggle, active order
    │   ├── orders/
    │   │   ├── AvailableOrdersScreen.tsx   # New order requests, accept/reject
    │   │   ├── ActiveDeliveryScreen.tsx    # Active delivery with all actions
    │   │   ├── MapNavigationScreen.tsx     # Google Maps + polyline + navigation
    │   │   └── HistoryScreen.tsx           # Delivery history with filters
    │   ├── wallet/
    │   │   └── WalletScreen.tsx   # Earnings, transactions, balance
    │   └── profile/
    │       └── ProfileScreen.tsx  # Partner info, documents, logout
    ├── services/
    │   ├── socketService.ts       # Socket.io connection + event handlers
    │   ├── locationService.ts     # Expo Location watching + WS/REST location updates
    │   └── notificationService.ts # Expo Notifications (push + local)
    ├── store/
    │   └── authStore.ts           # Zustand auth store + SecureStore persistence
    ├── types/
    │   └── index.ts               # All TypeScript interfaces and types
    └── utils/
        ├── theme.ts               # Colors, spacing, shadows, fonts
        └── helpers.ts             # Format currency, date, distance, status labels
```

---

## ⚙️ Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file:

```env
EXPO_PUBLIC_API_URL=http://your-backend.com/api
EXPO_PUBLIC_WS_URL=http://your-backend.com
```

### 3. Start the app

```bash
npx expo start
```

---

## 🔑 Authentication Flow

- Login with phone + password → JWT tokens stored in **Expo SecureStore**
- On app launch → `loadStoredAuth()` checks for stored token → auto-login
- Axios interceptor → attaches `Authorization: Bearer <token>` to every request
- On 401 → interceptor attempts token refresh → retries original request
- On refresh failure → clears tokens → redirects to Login

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Partner login |
| POST | `/auth/logout` | Logout |
| POST | `/auth/refresh` | Refresh token |
| GET | `/delivery/profile` | Get partner profile |
| PATCH | `/delivery/profile` | Update profile |
| GET | `/delivery/orders/available` | Available orders |
| GET | `/delivery/orders/active` | Active order |
| POST | `/delivery/orders/accept` | Accept order |
| POST | `/delivery/orders/reject` | Reject order |
| POST | `/delivery/orders/start` | Start delivery |
| POST | `/delivery/orders/complete` | Mark delivered |
| POST | `/delivery/orders/fail` | Report failed delivery |
| GET | `/delivery/orders/history` | Order history |
| POST | `/delivery/location/update` | Update location (REST fallback) |
| PATCH | `/delivery/availability` | Toggle online/offline |
| GET | `/delivery/wallet/summary` | Wallet summary |
| GET | `/delivery/wallet/transactions` | Transaction history |
| GET | `/delivery/dashboard/stats` | Dashboard stats |

---

## 🔌 WebSocket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `connect` | client → server | Auth token via `auth: { token }` |
| `location-update` | client → server | `{ latitude, longitude }` |
| `new-order` | server → client | `Order` object |
| `order-assigned` | server → client | `Order` object |
| `order-status-update` | server → client | `{ orderId, status }` |

---

## 📍 Location Tracking

- Uses **Expo Location** `watchPositionAsync`
- Updates every **8 seconds** or **20 meters** of movement
- Sends location via **Socket.io** (primary) + REST API (fallback)
- Starts when partner goes **ONLINE**, stops when **OFFLINE**

---

## 🗺 Map Features (react-native-maps)

- **Partner marker** 🛵 — real-time location
- **Customer marker** 📍 — delivery destination
- **Polyline** — dashed route between partner and customer
- **fitToCoordinates** — auto-fit to show both markers
- **Open in Google Maps** — deep-link for turn-by-turn navigation

---

## 🔔 Notifications

- Push notifications via **Expo Notifications**
- Local notifications for:
  - New order request
  - Order assigned
  - Delivery reminders
- Android notification channel: `orders`

---

## 🧱 Tech Stack

| Package | Purpose |
|---------|---------|
| `expo` ~50 | Framework |
| `react-native` 0.73 | Core |
| `typescript` 5.x | Type safety |
| `@tanstack/react-query` v5 | Server state |
| `axios` | HTTP client |
| `zustand` | Client state |
| `socket.io-client` v4 | WebSocket |
| `react-native-maps` | Google Maps |
| `expo-location` | GPS tracking |
| `expo-secure-store` | Token storage |
| `expo-notifications` | Push notifications |
| `expo-linear-gradient` | UI gradients |
| `@react-navigation/native` | Navigation |

---

## 🎨 Design System

The app uses a **deep indigo-navy** primary palette with **electric cyan** accents:

- `primary`: `#1A1F5E` — Deep navy
- `accent`: `#00D4FF` — Electric cyan  
- `success`: `#00C896` — Emerald
- `warning`: `#FF9F0A` — Amber
- `danger`: `#FF3B5C` — Red

---

## 🚀 Production Checklist

- [x] Secure token storage (SecureStore)
- [x] Auto token refresh
- [x] Input validation on login
- [x] Error alerts on all mutations
- [x] Loading states on all async operations
- [x] Skeleton loaders
- [x] Pull-to-refresh
- [x] Empty states
- [x] WebSocket reconnection (auto-retry x5)
- [x] Location permission handling
- [x] COD confirmation dialog
- [x] Failed delivery reason capture
- [x] Deep-link to Google Maps
- [x] Push notification registration
- [ ] Offline banner (NetInfo)
- [ ] Dark mode (extend theme)
- [ ] Order sound alert (expo-av)