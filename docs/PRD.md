# Product Requirements Document: Independent Payment Links App

---

## 0. Technical Foundation

### 0.1 Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Language** | TypeScript (strict mode) | Type safety across the entire codebase; catches errors at compile time; better IDE support and refactoring |
| **UI Framework** | React 18+ | Component-based architecture; massive ecosystem; shared code between web and mobile |
| **Mobile Framework** | React Native (via Expo) | Single TypeScript/React codebase for iOS + Android; native performance; access to device APIs (camera, share sheet, haptics) |
| **Web App** | React (Vite) | Fast dev server; optimized production builds; same components as mobile where possible |
| **Shared Code** | Monorepo (Turborepo or Nx) | Share business logic, API clients, types, and validation between web and mobile packages |
| **Navigation** | React Navigation (mobile) / React Router (web) | Industry-standard routing for each platform |
| **State Management** | Zustand or TanStack Query | Lightweight; TypeScript-first; TanStack Query for server state (API caching, refetching) |
| **Styling** | Tailwind CSS (web) / NativeWind (mobile) | Consistent design tokens across platforms; utility-first; NativeWind brings Tailwind to React Native |
| **API Client** | Generated TypeScript SDK from Square OpenAPI spec | Type-safe API calls; auto-generated request/response types; no manual type maintenance |
| **Testing** | Vitest (unit) + Playwright (web e2e) + Detox (mobile e2e) | Fast unit tests; cross-browser web testing; native mobile testing |
| **CI/CD** | GitHub Actions | Build, test, lint on every PR; deploy web to Cloudflare; submit mobile to app stores |

### 0.2 Cross-Platform Strategy

The app ships on **three platforms** from a single TypeScript/React codebase:

| Platform | Delivery | Framework | Distribution |
|----------|----------|-----------|-------------|
| **iOS** | Native app | React Native (Expo) | Apple App Store |
| **Android** | Native app | React Native (Expo) | Google Play Store |
| **Web** | Responsive web app | React (Vite) | Direct URL / Cloudflare |

#### Why React Native (Expo) for Mobile

| Alternative Considered | Why Not |
|----------------------|---------|
| **PWA (Progressive Web App)** | Limited access to native APIs (share sheet, push notifications, camera for QR scanning); no App Store presence; inconsistent experience across browsers; iOS PWA support is limited (no push notifications until recently, no badge counts) |
| **Capacitor (Ionic)** | WebView-based — performance is noticeably worse than React Native for animations and scrolling; feels like a wrapped website, not a native app |
| **Flutter** | Requires Dart — cannot share code with a React web app; separate language and ecosystem |
| **Native (Swift + Kotlin)** | Two separate codebases; 3x the development effort; no code sharing with web |
| **React Native (bare)** | Expo provides managed builds, OTA updates, push notifications, and device API access out of the box — bare RN requires manual native configuration |

#### Expo Advantages for This App
- **EAS Build** — cloud builds for iOS and Android without local Xcode/Android Studio setup
- **OTA Updates** — push bug fixes and minor updates without app store review
- **Expo Push Notifications** — unified push notification service for iOS + Android (for order alerts)
- **Expo Camera** — QR code scanning (for testing/previewing payment links)
- **Expo Sharing** — native share sheet integration (critical for the Sharing Hub)
- **Expo SecureStore** — encrypted storage for OAuth tokens on device
- **Expo Router** — file-based routing that mirrors React Router patterns

### 0.3 Monorepo Structure

```
payment-links-app/
├── apps/
│   ├── mobile/                    # React Native (Expo) app
│   │   ├── app/                   # Expo Router screens
│   │   │   ├── (tabs)/            # Tab navigator
│   │   │   │   ├── index.tsx      # Home/Dashboard
│   │   │   │   ├── create.tsx     # Link Creator
│   │   │   │   ├── links.tsx      # Link Manager
│   │   │   │   ├── orders.tsx     # Orders
│   │   │   │   └── analytics.tsx  # Analytics
│   │   │   ├── link/[id].tsx      # Link detail
│   │   │   ├── order/[id].tsx     # Order detail
│   │   │   ├── share/[id].tsx     # Sharing Hub
│   │   │   ├── settings.tsx       # Settings
│   │   │   └── onboarding.tsx     # OAuth onboarding
│   │   ├── components/            # Mobile-specific components
│   │   ├── app.json               # Expo config
│   │   ├── eas.json               # EAS Build config
│   │   └── package.json
│   │
│   └── web/                       # React (Vite) web app
│       ├── src/
│       │   ├── pages/             # Route pages
│       │   ├── components/        # Web-specific components
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── vite.config.ts
│       └── package.json
│
├── packages/
│   ├── shared/                    # Shared business logic
│   │   ├── src/
│   │   │   ├── api/               # Square API client (generated types)
│   │   │   │   ├── payment-links.ts
│   │   │   │   ├── orders.ts
│   │   │   │   ├── catalog.ts
│   │   │   │   └── types.ts       # All Square API types
│   │   │   ├── hooks/             # Shared React hooks
│   │   │   │   ├── useCreateLink.ts
│   │   │   │   ├── useLinks.ts
│   │   │   │   ├── useOrders.ts
│   │   │   │   └── useAnalytics.ts
│   │   │   ├── models/            # Domain models & validation
│   │   │   │   ├── link-types.ts  # LinkType enum, type configs
│   │   │   │   ├── wizard.ts      # Wizard state machine
│   │   │   │   └── validation.ts  # Zod schemas for all forms
│   │   │   ├── utils/             # Shared utilities
│   │   │   │   ├── currency.ts    # Money formatting
│   │   │   │   ├── dates.ts       # Date formatting
│   │   │   │   └── idempotency.ts # UUID generation
│   │   │   └── constants/         # Shared constants
│   │   │       ├── link-types.ts  # Type definitions & metadata
│   │   │       └── defaults.ts    # Default values per type
│   │   └── package.json
│   │
│   ├── ui/                        # Shared UI components (cross-platform)
│   │   ├── src/
│   │   │   ├── Button.tsx         # Platform-adaptive button
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ...
│   │   └── package.json
│   │
│   └── config/                    # Shared config (ESLint, TypeScript, etc.)
│       ├── tsconfig.base.json
│       ├── eslint.config.js
│       └── package.json
│
├── turbo.json                     # Turborepo pipeline config
├── package.json                   # Root workspace
└── tsconfig.json                  # Root TypeScript config
```

### 0.4 TypeScript Configuration

```jsonc
// tsconfig.base.json — shared across all packages
{
  "compilerOptions": {
    "strict": true,                    // All strict checks enabled
    "noUncheckedIndexedAccess": true,  // Catch undefined array/object access
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "exactOptionalPropertyTypes": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "skipLibCheck": true,
    "paths": {
      "@payment-links/shared/*": ["../packages/shared/src/*"],
      "@payment-links/ui/*": ["../packages/ui/src/*"]
    }
  }
}
```

### 0.5 Key TypeScript Types (Shared Package)

```typescript
// packages/shared/src/models/link-types.ts

/** All supported payment link types */
export enum LinkType {
  SimplePayment = 'simple',
  ItemSale = 'item',
  EventTickets = 'event',
  Donation = 'donation',
  ServicePayment = 'service',
  Subscription = 'subscription',
  FoodOrder = 'food',
  DigitalProduct = 'digital',
  Invoice = 'invoice',
  MultiItemCart = 'multi_item',
}

/** API creation mode — determined automatically from LinkType */
export enum CreationMode {
  QuickPay = 'quick_pay',
  OrderBased = 'order',
}

/** Fulfillment types available in the Orders API */
export enum FulfillmentType {
  Shipment = 'SHIPMENT',
  Pickup = 'PICKUP',
  Digital = 'DIGITAL',
  Delivery = 'DELIVERY',
  InStore = 'IN_STORE',
  Simple = 'SIMPLE',
}

/** Configuration metadata for each link type */
export interface LinkTypeConfig {
  type: LinkType;
  label: string;
  description: string;
  icon: string;
  creationMode: CreationMode;
  defaultFulfillment: FulfillmentType;
  supportsFulfillments: FulfillmentType[];
  supportsInventory: boolean;
  supportsVariants: boolean;
  defaultTipping: boolean;
  supportsCustomFields: boolean;
  supportsShipping: boolean;
  isReusable: boolean;
  wizardSteps: WizardStep[];
}

/** Wizard step identifiers */
export enum WizardStep {
  Type = 'type',
  Details = 'details',
  Variants = 'variants',
  Inventory = 'inventory',
  Fulfillment = 'fulfillment',
  Modifiers = 'modifiers',
  CheckoutOptions = 'checkout_options',
  Review = 'review',
}

/** Complete wizard state — serializable for draft persistence */
export interface WizardState {
  currentStep: WizardStep;
  linkType: LinkType | null;
  details: LinkDetails;
  variants: Variant[];
  inventory: InventoryConfig;
  fulfillment: FulfillmentConfig;
  modifiers: ModifierGroup[];
  checkoutOptions: CheckoutOptionsConfig;
  prePopulatedData: PrePopulatedData;
  metadata: LinkMetadata;
}

/** Link details — adapts per type */
export interface LinkDetails {
  name: string;
  description: string;
  amount: Money | null;            // For QuickPay types
  images: ImageAsset[];
  eventDate?: string;              // ISO 8601 (events only)
  eventTime?: string;              // HH:MM (events only)
  eventVenue?: string;             // Events only
  donationTiers?: Money[];         // Donations only
  donationAmountMode?: 'preset' | 'suggested' | 'open';
}

export interface Money {
  amount: number;                  // In smallest denomination (cents)
  currency: string;                // ISO 4217 (e.g., 'USD')
}

export interface Variant {
  id: string;
  name: string;
  priceMoney: Money;
  stockQuantity: number | null;    // null = unlimited
  sku?: string;
}

export interface InventoryConfig {
  trackInventory: boolean;
  totalQuantity: number | null;    // null = unlimited
  maxPerOrder: number | null;      // null = no limit
}

export interface FulfillmentConfig {
  type: FulfillmentType;
  shippingFee?: Money;
  pickupLocationId?: string;
  pickupInstructions?: string;
  prepTimeDuration?: string;       // ISO 8601 duration
  deliveryFee?: Money;
  deliveryInstructions?: string;
  digitalDeliveryUrl?: string;
  digitalAccessInstructions?: string;
}

export interface ModifierGroup {
  id: string;
  name: string;
  selectionType: 'single' | 'multiple';
  required: boolean;
  maxSelections?: number;
  modifiers: Modifier[];
}

export interface Modifier {
  id: string;
  name: string;
  priceMoney: Money;               // Price adjustment (can be 0)
}

export interface CheckoutOptionsConfig {
  allowTipping: boolean;
  customFields: CustomField[];
  subscriptionPlanId?: string;
  redirectUrl?: string;
  merchantSupportEmail?: string;
  askForShippingAddress: boolean;
  acceptedPaymentMethods: AcceptedPaymentMethods;
  shippingFee?: ShippingFee;
  enableCoupon: boolean;
  enableLoyalty: boolean;
  paymentNote?: string;
}

export interface CustomField {
  title: string;
  required: boolean;
}

export interface AcceptedPaymentMethods {
  applePay: boolean;
  googlePay: boolean;
  cashAppPay: boolean;
  afterpayClearpay: boolean;
}

export interface ShippingFee {
  name: string;
  charge: Money;
}

export interface PrePopulatedData {
  buyerFirstName?: string;
  buyerLastName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerAddress?: Address;
}

export interface Address {
  addressLine1: string;
  addressLine2?: string;
  locality: string;                // City
  administrativeDistrictLevel1: string; // State
  postalCode: string;
  country: string;                 // ISO 3166-1 alpha-2
}

export interface LinkMetadata {
  linkType: LinkType;
  isOneTime: boolean;
  isPaused: boolean;
  tags: string[];
  notes: string;
  eventDate?: string;
  eventVenue?: string;
  donationTiers?: Money[];
  maxPerOrder?: number;
}

export interface ImageAsset {
  uri: string;                     // Local URI or remote URL
  width: number;
  height: number;
  mimeType: 'image/jpeg' | 'image/png';
}
```

### 0.6 Platform-Specific Considerations

#### Mobile-Specific Features (React Native)

| Feature | Implementation | Why Native Matters |
|---------|---------------|-------------------|
| **Share Sheet** | `expo-sharing` / React Native Share API | Native share sheet lets sellers share links to any app (WhatsApp, iMessage, Instagram, etc.) — far superior to web share |
| **Push Notifications** | `expo-notifications` + EAS Push | Alert sellers when an order comes in — critical for time-sensitive orders (food, events) |
| **Camera / QR Scanner** | `expo-camera` | Scan QR codes to test/preview payment links; scan items to add to links |
| **Haptic Feedback** | `expo-haptics` | Tactile confirmation on link creation, copy actions, and order alerts |
| **Biometric Auth** | `expo-local-authentication` | Face ID / fingerprint to protect the app (handles financial data) |
| **Secure Storage** | `expo-secure-store` | Encrypted storage for OAuth tokens on device (Keychain on iOS, Keystore on Android) |
| **Deep Linking** | Expo Router deep links | `paymentlinks://link/abc123` — open a specific link directly from a notification or external source |
| **Offline Support** | TanStack Query + AsyncStorage | Cache link list and recent orders; create drafts offline; sync when back online |
| **App Badges** | `expo-notifications` badge count | Show unread order count on the app icon |

#### Web-Specific Features

| Feature | Implementation | Why Web Matters |
|---------|---------------|-----------------|
| **Embed Code Generator** | HTML snippet builder | Sellers embed payment buttons on their websites — desktop workflow |
| **Bulk Operations** | Multi-select + batch API calls | Managing 100+ links is easier with a mouse and keyboard |
| **Advanced Analytics** | Chart.js / Recharts | Larger screen real estate for detailed charts and data tables |
| **Print** | Browser print API | Print QR codes and link details for physical flyers |
| **Keyboard Shortcuts** | Custom key bindings | Power users: Cmd+N (new link), Cmd+C (copy link URL), etc. |

#### Shared Features (Both Platforms)

| Feature | Shared Package |
|---------|---------------|
| Link creation wizard logic | `@payment-links/shared/models/wizard.ts` |
| Form validation (Zod schemas) | `@payment-links/shared/models/validation.ts` |
| Square API client | `@payment-links/shared/api/*` |
| React hooks (useCreateLink, useLinks, etc.) | `@payment-links/shared/hooks/*` |
| Currency/date formatting | `@payment-links/shared/utils/*` |
| Link type configurations | `@payment-links/shared/constants/*` |
| State management (Zustand stores) | `@payment-links/shared/stores/*` |

### 0.7 Mobile App Store Requirements

#### iOS (Apple App Store)
| Requirement | Details |
|-------------|---------|
| Minimum iOS version | iOS 15+ (covers ~95% of active devices) |
| Required capabilities | Push notifications, camera (QR), Face ID |
| App Store review considerations | Financial app — must comply with Apple's guidelines for payment apps; Square handles actual payment processing so no IAP required |
| Privacy labels | Data collected: name, email, payment info (via Square), usage data |
| App size target | < 50MB initial download |

#### Android (Google Play)
| Requirement | Details |
|-------------|---------|
| Minimum Android version | Android 10 (API 29)+ |
| Required permissions | Camera, Internet, Push notifications, Biometric |
| Play Store review considerations | Financial app category; must comply with Google's financial services policy |
| Target SDK | Latest stable (API 34+) |
| App size target | < 40MB APK / < 60MB AAB |

### 0.8 Build & Deployment Pipeline

```
                    ┌─────────────┐
                    │   Git Push   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  CI Pipeline │
                    │  (GitHub     │
                    │   Actions)   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼─────┐ ┌───▼────┐ ┌────▼─────┐
       │  Lint +    │ │  Unit  │ │  Type    │
       │  Format    │ │  Tests │ │  Check   │
       │  (ESLint,  │ │(Vitest)│ │  (tsc)   │
       │  Prettier) │ │        │ │          │
       └──────┬─────┘ └───┬────┘ └────┬─────┘
              │            │           │
              └────────────┼───────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼─────┐ ┌───▼─────┐ ┌───▼──────┐
       │  Web Build │ │  iOS    │ │ Android  │
       │  (Vite)    │ │  Build  │ │ Build    │
       │            │ │ (EAS)   │ │ (EAS)    │
       └──────┬─────┘ └───┬─────┘ └───┬──────┘
              │            │           │
       ┌──────▼─────┐ ┌───▼─────┐ ┌───▼──────┐
       │  Deploy to │ │  Submit │ │ Submit   │
       │ Cloudflare │ │  to App │ │ to Play  │
       │  (staging  │ │  Store  │ │ Store    │
       │   → prod)  │ │ Connect │ │ Console  │
       └────────────┘ └─────────┘ └──────────┘
```

**OTA Updates (Expo):**
- Minor bug fixes and non-native changes can be pushed via `expo-updates` without app store review
- Major changes (new native modules, permissions) require a full app store submission
- OTA updates are downloaded in the background and applied on next app launch

---

## 1. Overview

### 1.1 Vision
An independent, standalone application that extracts the Payment Links experience from the Square Dashboard into its own dedicated app flow. The app leverages Square's existing onboarding, authentication, and Payment Links backend infrastructure (`online-checkout` service, Orders API, Catalog API) while providing a purpose-built, streamlined experience focused entirely on creating, managing, and sharing payment links.

The core thesis: **getting paid should be as easy as sending a link.** Today, Payment Links lives inside the broader Square Dashboard ECOM section, surrounded by website builders, item libraries, and order management. This app strips away everything except the link — making it the fastest path from "I need to get paid" to "here's your link."

### 1.2 Why Break It Out?

| Problem Today | How This App Solves It |
|---------------|----------------------|
| Payment Links is buried inside Dashboard → ECOM → Online Checkout. New sellers don't discover it. | Standalone app with a single purpose — impossible to miss. |
| The Dashboard is heavyweight — sellers who just want a payment link must navigate a complex UI. | Focused, wizard-driven experience. No distractions. |
| Link creation is generic — the same form regardless of whether you're selling a t-shirt or collecting donations. | Use-case-aware wizard that adapts fields, defaults, and guidance based on what the seller is doing. |
| Sharing is an afterthought — you create the link, copy it, and figure out distribution yourself. | First-class sharing hub with QR codes, social previews, email/SMS compose, and embed codes. |
| Analytics are scattered across Dashboard reports. | Dedicated per-link and aggregate analytics built into the app. |
| No templates — every link starts from scratch. | Reusable templates and one-click duplication. |

### 1.3 Target Users

#### Primary Personas

**1. The Side Hustler / Solo Seller**
- Sells handmade goods, vintage items, or limited drops
- No website, no storefront — sells through Instagram, TikTok, or word of mouth
- Needs: fast link creation, image upload, inventory tracking, shipping config
- Volume: 1–20 links/month, 10–200 orders/month

**2. The Service Provider**
- Freelance consultant, personal trainer, tutor, photographer, contractor
- Sends payment requests after completing work or to collect deposits
- Needs: simple "pay me $X" links, payment notes, pre-populated client data
- Volume: 5–50 links/month, mostly one-time use

**3. The Event Organizer**
- Runs community events, workshops, fundraiser dinners, pop-ups
- Needs: ticket tiers, quantity limits, attendee custom fields, date-based expiration
- Volume: 1–5 events/month, 50–500 tickets per event

**4. The Nonprofit / Creator**
- Collecting donations, tips, or pay-what-you-want contributions
- Needs: flexible/custom amounts, always-on reusable links, donor custom fields
- Volume: 1–5 permanent links, ongoing transactions

**5. The Small Restaurant / Food Business**
- Takes pre-orders, catering orders, or special menu items via links
- Needs: item modifiers, pickup/delivery fulfillment, tipping, prep time
- Volume: 5–20 links, recurring use

#### Secondary Personas
- **The Multi-Location Business** — manages links across multiple Square locations
- **The Subscription Seller** — offers recurring product/service plans
- **The Digital Creator** — sells digital downloads, courses, templates

### 1.4 Scope

#### In Scope (V1)
- **React + TypeScript** codebase in a monorepo (Turborepo)
- **React Native (Expo)** mobile apps for iOS and Android
- **React (Vite)** responsive web app
- Shared business logic, API clients, hooks, and validation across all platforms
- Link creation wizard with use-case-aware flows
- All 8 payment link types (simple, item, event, donation, service, subscription, food, digital)
- Full checkout configuration (tipping, custom fields, shipping, coupons, loyalty, payment methods)
- Link management (list, edit, deactivate, duplicate, delete)
- Sharing hub (copy URL, QR code, native share sheet on mobile, email, SMS, social, embed)
- Per-link and aggregate analytics
- Order list view with fulfillment status
- Push notifications for new orders (mobile)
- Biometric authentication (Face ID / fingerprint on mobile)
- Template system (save, load, pre-built templates)
- Square OAuth onboarding (in-app browser on mobile, redirect on web)
- Offline draft support (create links offline, sync when connected)

#### Out of Scope (V1)
- Rebuilding the buyer-side checkout page (ECKO handles this)
- Full order management / fulfillment workflows (link to Dashboard for deep order management)
- Inventory management UI (use Catalog API for tracking, but full inventory management stays in Dashboard)
- Custom domain support for checkout URLs
- Multi-currency within a single link (follows merchant's configured currency)
- Apple Watch / Wear OS companion apps
- Tablet-optimized layouts (responsive design covers tablets, but no tablet-specific UX in V1)

---

## 2. Architecture

### 2.1 Backend Services to Leverage

| Service | Role | Integration Pattern |
|---------|------|---------------------|
| **`online-checkout`** | Core Payment Links Go service — CRUD operations on payment links | Primary backend. All link creation, updates, listing, and deletion route through this service via the Payment Links API. |
| **`payapi-checkouts`** | Public Checkout API layer | Exposes the `CreatePaymentLink`, `UpdatePaymentLink`, `DeletePaymentLink`, `RetrievePaymentLink`, `ListPaymentLinks` endpoints. The app calls these via authenticated API requests. |
| **`ecom-checkout-app` (ECKO)** | Hosted buyer-facing checkout page | The buyer experience. When a buyer clicks a payment link URL, they land on ECKO. This app does NOT rebuild the checkout — it reuses ECKO entirely. |
| **Orders API** (`omg`) | Order management — line items, fulfillments, taxes, discounts | Every payment link is backed by an Order. For complex links (multi-item, events, subscriptions), the app constructs an Order object and passes it to `CreatePaymentLink`. |
| **Catalog API** | Item/product catalog | For links tied to catalog items. Enables inventory tracking (stock counts), item variations (sizes, tiers), images, and modifier lists. The app reads from the catalog to populate link details. |
| **Subscriptions API** | Recurring payment plans | For subscription-type links. The app references a `subscription_plan_id` (a Catalog object) in `checkout_options`. |
| **Customers API** | Customer directory | For pre-populating buyer data on links sent to known customers. |
| **Payments API** | Payment records | For analytics — retrieving payment details associated with completed orders from payment links. |
| **Webhooks** | Real-time event notifications | Listen for `payment.completed`, `order.updated`, `order.fulfilled`, `inventory.count.updated` to keep the app's analytics and status displays current. |

### 2.2 Authentication & Onboarding

#### Onboarding Flow

**Web:**
```
1. Seller opens the web app for the first time
2. App presents "Connect your Square account" 
3. Seller clicks → redirected to Square OAuth consent screen
4. Seller authorizes → redirected back with auth code
5. App exchanges code for access token + refresh token (server-side)
6. App fetches merchant profile, locations, and catalog
7. Seller lands on the main dashboard — ready to create their first link
```

**Mobile (iOS / Android):**
```
1. Seller downloads app from App Store / Play Store
2. App presents welcome screen with "Connect your Square account"
3. Seller taps → in-app browser (expo-auth-session) opens Square OAuth consent
4. Seller authorizes → deep link redirects back to the app (paymentlinks://oauth/callback)
5. App exchanges code for tokens (via backend — tokens never stored in client code)
6. Tokens stored in Expo SecureStore (encrypted Keychain / Keystore)
7. App fetches merchant profile, locations, and catalog
8. Seller prompted to enable push notifications and biometric lock
9. Seller lands on the main dashboard — ready to create their first link
```

**Token Storage by Platform:**
| Platform | Storage | Encryption |
|----------|---------|------------|
| iOS | Keychain (via `expo-secure-store`) | Hardware-backed encryption |
| Android | Android Keystore (via `expo-secure-store`) | Hardware-backed encryption |
| Web | HttpOnly secure cookie (server-side session) | TLS + cookie flags |

#### Required OAuth Scopes
| Scope | Why |
|-------|-----|
| `ONLINE_STORE_SNIPPETS_WRITE` | Create and manage payment links |
| `ONLINE_STORE_SNIPPETS_READ` | List and retrieve payment links |
| `ORDERS_READ` | Read orders created from payment links |
| `ORDERS_WRITE` | Create orders backing payment links |
| `ITEMS_READ` | Read catalog items for item-based links |
| `ITEMS_WRITE` | Create catalog items (for in-app item creation) |
| `INVENTORY_READ` | Check stock levels for inventory-tracked links |
| `CUSTOMERS_READ` | Pre-populate buyer data from customer directory |
| `PAYMENTS_READ` | Read payment details for analytics |
| `MERCHANT_PROFILE_READ` | Read merchant info, locations, currency |
| `SUBSCRIPTIONS_READ` | Read subscription plans for recurring links |

#### Token Management
- Store access tokens and refresh tokens securely (encrypted at rest)
- Implement automatic token refresh before expiry
- Handle token revocation gracefully (prompt re-authorization)

### 2.3 App Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Client Applications                             │
│                                                                      │
│  ┌─────────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │   iOS App            │  │   Android App     │  │   Web App      │  │
│  │   (React Native /    │  │   (React Native / │  │   (React /     │  │
│  │    Expo)              │  │    Expo)           │  │    Vite)       │  │
│  │                       │  │                    │  │                │  │
│  │  • Native share sheet │  │  • Native share   │  │  • Embed code  │  │
│  │  • Push notifications │  │  • Push notifs    │  │  • Bulk ops    │  │
│  │  • Face ID / Touch ID │  │  • Fingerprint    │  │  • Print       │  │
│  │  • Camera (QR scan)   │  │  • Camera (QR)    │  │  • Keyboard    │  │
│  │  • Haptic feedback    │  │  • Haptic feedback │  │    shortcuts   │  │
│  │  • Offline drafts     │  │  • Offline drafts  │  │  • Charts      │  │
│  └──────────┬────────────┘  └────────┬───────────┘  └───────┬───────┘  │
│             │                        │                      │          │
│  ┌──────────┴────────────────────────┴──────────────────────┴───────┐  │
│  │                @payment-links/shared (TypeScript)                 │  │
│  │                                                                   │  │
│  │  • API client (Square SDK types)    • React hooks                 │  │
│  │  • Wizard state machine             • Zod validation schemas      │  │
│  │  • Domain models & types            • Currency/date utils         │  │
│  │  • Zustand stores                   • Link type configurations    │  │
│  └──────────────────────────────┬────────────────────────────────────┘  │
└─────────────────────────────────┼──────────────────────────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │    Backend API (Hono)       │
                    │    Cloudflare Worker         │
                    │                              │
                    │  /api/links     - CRUD proxy │
                    │  /api/templates - D1 storage │
                    │  /api/analytics - Aggregation│
                    │  /api/sharing   - QR gen     │
                    │  /api/settings  - Prefs      │
                    │  /api/webhooks  - Square      │
                    │                  events       │
                    └─────────────┬────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │      D1 Database            │
                    │  Templates, metadata,       │
                    │  analytics cache, settings   │
                    └─────────────┬────────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                    │
              ▼                   ▼                    ▼
       ┌────────────┐    ┌──────────────┐    ┌──────────────┐
       │ Payment    │    │  Orders API  │    │  Catalog API │
       │ Links API  │    │  (omg)       │    │              │
       │ (online-   │    │              │    │              │
       │  checkout) │    │              │    │              │
       └─────┬──────┘    └──────────────┘    └──────────────┘
             │
             ▼
       ┌──────────────────┐
       │  ECKO Checkout   │  ← Buyer-facing hosted checkout
       │  (buyer clicks   │     (reuse as-is, not rebuilt)
       │   link → lands   │
       │   here)          │
       └──────────────────┘
```

### 2.4 Two Creation Modes (from the API)

The Payment Links API supports two distinct creation paths. The app abstracts these behind the wizard — the seller never sees this distinction.

#### QuickPay Mode
- **When used:** Simple payments, services, basic donations, invoices
- **API payload:** `{ quick_pay: { name, price_money, location_id } }`
- **What it creates:** A single ad-hoc line item order automatically
- **Limitations:** Single item, no catalog integration, no inventory tracking, no variants, no fulfillment details
- **Advantage:** Fastest path — 3 fields and you have a link

#### Order-Based Mode
- **When used:** Item sales, events, subscriptions, food orders, digital products, multi-item carts, anything with fulfillment/inventory/variants
- **API payload:** `{ order: { location_id, line_items, fulfillments, taxes, discounts, service_charges } }`
- **What it creates:** A full Order object with all the specified details
- **Limitations:** More complex to construct — the app must build the Order correctly
- **Advantage:** Full flexibility — supports every use case

#### Automatic Mode Selection Logic
```
IF use_case is "simple_payment" OR "service" OR "invoice":
    AND no inventory tracking
    AND no variants
    AND no fulfillment details needed
    → Use QuickPay

ELSE:
    → Use Order-Based
```

### 2.5 Data Flow: Link Creation → Buyer Checkout → Payment

```
Seller creates link in app
        │
        ▼
App constructs API request (QuickPay or Order-based)
        │
        ▼
POST /v2/online-checkout/payment-links
        │
        ▼
online-checkout service creates:
  1. Order (in DRAFT state)
  2. PaymentLink record
  3. Short URL + Long URL
        │
        ▼
App receives PaymentLink response with URLs
        │
        ▼
Seller shares URL (copy, QR, email, SMS, social, embed)
        │
        ▼
Buyer clicks URL
        │
        ▼
ECKO checkout page loads with order details
        │
        ▼
Buyer fills in details (address, custom fields, tip, payment method)
        │
        ▼
Buyer submits payment
        │
        ▼
Square processes payment → Order moves to COMPLETED
        │
        ▼
Webhook fires: payment.completed, order.updated
        │
        ▼
App updates analytics, order status, inventory
```

---

## 3. Payment Link Types & Use Case Permutations

### 3.1 Use Case Matrix

| Use Case | API Mode | Fulfillment | Inventory | Variants | Tipping | Custom Fields | Shipping | Reusable |
|----------|----------|-------------|-----------|----------|---------|---------------|----------|----------|
| **Simple Payment** | QuickPay | `SIMPLE` | No | No | Optional | Optional | No | Yes |
| **Item Sale** | Order | `SHIPMENT`/`PICKUP` | Yes | Yes | No | Optional | Yes | Yes (until sold out) |
| **Event / Tickets** | Order | `DIGITAL` | Yes (ticket cap) | Yes (tiers) | No | Yes | No | Yes (until sold out) |
| **Donation** | QuickPay/Order | `SIMPLE` | No | No | Yes (as "add extra") | Yes | No | Always |
| **Service Payment** | QuickPay | `SIMPLE` | No | No | Optional | Yes | No | Configurable |
| **Subscription** | Order | Varies | No | No | No | Optional | Varies | Yes |
| **Food Order** | Order | `PICKUP`/`DELIVERY` | Optional | Yes (sizes) | Yes | Yes | Delivery only | Yes |
| **Digital Product** | Order | `DIGITAL` | Optional | Optional | No | No | No | Yes (until sold out) |
| **Invoice** | QuickPay | `SIMPLE` | No | No | No | Optional | No | No (one-time) |
| **Multi-Item Cart** | Order | `SHIPMENT` | Yes | Yes | Optional | Optional | Yes | Yes |

### 3.2 Detailed Requirements Per Use Case

---

#### 3.2.1 Simple Payment / Pay Me

**Scenario:** "I need someone to pay me a specific amount for something."

**Seller Flow:**
1. Select "Simple Payment"
2. Enter: name/label (e.g., "Guitar Lesson"), amount (e.g., $75.00)
3. Optionally add: payment note, support email, redirect URL
4. Click "Create Link"
5. Share the link

**Required Fields:**
| Field | Type | Validation | Maps To |
|-------|------|------------|---------|
| Name | Text (1–255 chars) | Required, non-empty | `quick_pay.name` |
| Amount | Currency | Required, > $0, ≤ $999,999.99 | `quick_pay.price_money` |
| Location | Dropdown | Required (auto-selected if single location) | `quick_pay.location_id` |

**Optional Fields:**
| Field | Type | Default | Maps To |
|-------|------|---------|---------|
| Description | Text (0–4096 chars) | Empty | `description` |
| Payment Note | Text (0–500 chars) | Empty | `payment_note` |
| Allow Tipping | Toggle | Off | `checkout_options.allow_tipping` |
| Support Email | Email | Merchant default | `checkout_options.merchant_support_email` |
| Redirect URL | URL | None (Square confirmation) | `checkout_options.redirect_url` |
| Accepted Payment Methods | Multi-select | All enabled | `checkout_options.accepted_payment_methods` |
| Enable Coupons | Toggle | Off | `checkout_options.enable_coupon` |
| Enable Loyalty | Toggle | Off | `checkout_options.enable_loyalty` |

**Reusability:** Always reusable — multiple buyers can pay through the same link.

**Edge Cases:**
- Seller has multiple locations → must select one (amount may vary by location for tax purposes)
- Seller disables all payment methods → validation error, at least one required
- Amount of $0 → not allowed; minimum is $1.00 (or currency equivalent)

**Example:** A yoga instructor sends a $20 drop-in class link to students via group text.

---

#### 3.2.2 Item Sale (Physical Product)

**Scenario:** "I'm selling a physical product that needs to be shipped or picked up."

**Seller Flow:**
1. Select "Physical Product"
2. Enter item details: name, description, price, image(s)
3. Configure variants (optional): size, color, material — each with its own price and stock
4. Set inventory: total quantity available (or unlimited)
5. Configure fulfillment: Ship or Pickup
   - If Ship: set shipping fee (flat rate), toggle address collection
   - If Pickup: select pickup location, set pickup instructions
6. Configure taxes (auto-calculated or manual)
7. Review and create link

**Required Fields:**
| Field | Type | Validation | Maps To |
|-------|------|------------|---------|
| Item Name | Text (1–255 chars) | Required | `order.line_items[0].name` |
| Price | Currency | Required, > $0 | `order.line_items[0].base_price_money` |
| Location | Dropdown | Required | `order.location_id` |
| Fulfillment Type | Radio (Ship/Pickup) | Required | `order.fulfillments[0].type` |

**Optional Fields:**
| Field | Type | Default | Maps To |
|-------|------|---------|---------|
| Description | Text (0–4096 chars) | Empty | `order.line_items[0].note` or `description` |
| Image(s) | File upload (JPG/PNG, max 5MB each, up to 5) | None | Catalog item images |
| Variants | Variant builder (name + price + stock per variant) | None | Catalog item variations |
| Quantity Available | Integer (1–999,999) | Unlimited | Catalog inventory count |
| Max Per Order | Integer (1–100) | No limit | `order.line_items[0].quantity` max (app-enforced) |
| Shipping Fee | Currency | $0 (free shipping) | `checkout_options.shipping_fee` |
| Collect Shipping Address | Toggle | On (if Ship) | `checkout_options.ask_for_shipping_address` |
| Pickup Instructions | Text | Empty | `order.fulfillments[0].pickup_details.note` |
| Tax Rate | Percentage or Auto | Auto (location-based) | `order.taxes` |
| Allow Tipping | Toggle | Off | `checkout_options.allow_tipping` |
| Custom Fields | Field builder | None | `checkout_options.custom_fields` |
| Enable Coupons | Toggle | Off | `checkout_options.enable_coupon` |

**Inventory Behavior:**
- When stock reaches 0, the checkout page shows "Sold Out" — the link remains active but unpurchasable
- If variants have independent stock (e.g., Small: 10, Medium: 5, Large: 0), only available variants are purchasable
- Inventory decrements happen at payment completion, not at checkout start (no "hold" mechanism in V1)
- Inventory syncs across all channels — if the item sells on POS, the link's available quantity updates

**Variant Model:**
```
Item: "Hand-Painted Mug"
├── Variant: "Small" — $18.00, Stock: 25
├── Variant: "Medium" — $22.00, Stock: 15
└── Variant: "Large" — $28.00, Stock: 10
```
Each variant is a `CatalogItemVariation` in the Catalog API. The buyer selects a variant on the ECKO checkout page.

**Shipping Details:**
- Flat-rate shipping fee is modeled as a `ShippingFee` in checkout options, which becomes a service charge on the order
- The app collects the buyer's shipping address via `ask_for_shipping_address: true`
- After payment, the seller sees the shipping address in the order and can fulfill manually
- Tracking number can be added to the fulfillment after shipping (via Orders API update)

**Edge Cases:**
- Seller uploads an image that exceeds 5MB → show error, suggest compression
- Seller sets 0 inventory → link is created but immediately shows "Sold Out"
- Buyer tries to purchase after last item sells → checkout shows "Sold Out" error
- Seller has no locations with shipping enabled → prompt to configure in Square Dashboard
- Price of $0 for a variant → allowed (free item, e.g., promotional giveaway with shipping cost only)

**Example:** An artist sells limited-edition prints — 3 sizes (8x10 $25, 11x14 $40, 16x20 $65), 20 of each, $8 flat-rate shipping.

---

#### 3.2.3 Event / Tickets

**Scenario:** "I'm hosting an event and need to sell tickets with limited availability."

**Seller Flow:**
1. Select "Event / Tickets"
2. Enter event details: name, date/time, venue/location, description
3. Configure ticket tiers: name, price, quantity per tier
4. Set per-order limit (optional): max tickets per purchase
5. Add custom fields: attendee name, dietary restrictions, etc.
6. Set event image/banner
7. Review and create link

**Required Fields:**
| Field | Type | Validation | Maps To |
|-------|------|------------|---------|
| Event Name | Text (1–255 chars) | Required | `order.line_items[0].name` / catalog item name |
| Event Date | Date picker | Required, must be in the future | App metadata (stored in D1) |
| Event Time | Time picker | Required | App metadata (stored in D1) |
| Venue / Location | Text (1–500 chars) | Required | App metadata (stored in D1) |
| At least 1 ticket tier | Tier builder | Required, price ≥ $0 | Catalog item variations |
| Quantity per tier | Integer (1–99,999) | Required, ≥ 1 | Catalog inventory count per variation |

**Optional Fields:**
| Field | Type | Default | Maps To |
|-------|------|---------|---------|
| Event Description | Rich text (0–4096 chars) | Empty | `description` / catalog item description |
| Event Image | File upload (JPG/PNG, max 5MB) | None | Catalog item image |
| Max Tickets Per Order | Integer (1–100) | No limit | App-enforced validation |
| Custom Fields | Field builder (up to 5) | None | `checkout_options.custom_fields` |
| Support Email | Email | Merchant default | `checkout_options.merchant_support_email` |
| Redirect URL | URL | None | `checkout_options.redirect_url` |
| Enable Coupons | Toggle | Off | `checkout_options.enable_coupon` |

**Ticket Tier Model:**
```
Event: "Summer Jazz Night"
├── Tier: "General Admission" — $35.00, 200 available
├── Tier: "VIP (front row + drink)" — $75.00, 50 available
└── Tier: "Student" — $15.00, 100 available
```

**Fulfillment:** `DIGITAL` — no physical delivery. The buyer receives a confirmation email from Square which serves as their ticket. The app can optionally generate a ticket PDF or confirmation code.

**Per-Order Limits:**
- Enforced at the app layer before creating the order
- If max is 4 tickets, the checkout page quantity selector caps at 4
- This prevents scalpers from buying all tickets in one transaction

**Time-Based Behavior:**
- The app stores the event date/time in D1 metadata
- A scheduled job (or on-access check) deactivates the link after the event date passes
- Optionally: seller can set a "sales end" date/time that's before the event (e.g., "ticket sales close 2 hours before the event")

**Custom Fields for Events:**
| Field | Purpose | Example |
|-------|---------|---------|
| Attendee Name | Required for will-call / check-in | "Jane Smith" |
| Dietary Restrictions | For events with food | "Vegetarian" |
| T-Shirt Size | For events with swag | "Medium" |
| Company / Organization | For professional events | "Acme Corp" |
| Special Accommodations | Accessibility needs | "Wheelchair accessible seating" |

**Edge Cases:**
- Event date is in the past → validation error on creation
- All tiers sell out → link shows "Sold Out" but remains accessible (shows event details)
- Seller wants to add more tickets after creation → update inventory count via Catalog API
- Buyer selects mixed tiers (2 GA + 1 VIP) → supported if modeled as separate line items
- Refund after event → seller processes manually, inventory does NOT automatically restock (configurable)

**Example:** Community theater production — 3 shows (Fri/Sat/Sun), each with 150 GA ($20) and 30 VIP ($45) seats, max 6 tickets per order, custom field for "Which performance?" dropdown.

---

#### 3.2.4 Donation

**Scenario:** "I want to collect donations for a cause, with suggested amounts or a custom amount."

**Seller Flow:**
1. Select "Donation"
2. Enter cause details: name, description, image
3. Configure amount options:
   - Preset tiers (e.g., $10, $25, $50, $100) — OR
   - Single suggested amount with "pay what you want" — OR
   - Fully open (buyer enters any amount)
4. Add custom fields (optional): donor name, dedication message, anonymity toggle
5. Review and create link

**Required Fields:**
| Field | Type | Validation | Maps To |
|-------|------|------------|---------|
| Cause Name | Text (1–255 chars) | Required | `quick_pay.name` or `order.line_items[0].name` |
| Amount Mode | Radio (Preset Tiers / Suggested / Open) | Required | Determines API mode |

**Conditional Fields (by Amount Mode):**

*Preset Tiers:*
| Field | Type | Validation | Maps To |
|-------|------|------------|---------|
| Tier amounts | Currency list (2–6 tiers) | Each > $0 | Multiple line items or app-layer selection |
| Allow custom amount | Toggle | — | If on, adds a "Custom" option |

*Suggested Amount:*
| Field | Type | Validation | Maps To |
|-------|------|------------|---------|
| Suggested amount | Currency | > $0 | `quick_pay.price_money` (modifiable by buyer) |

*Open Amount:*
| Field | Type | Validation | Maps To |
|-------|------|------------|---------|
| Minimum amount | Currency | ≥ $1.00 | App-enforced validation |
| Maximum amount | Currency | Optional, > minimum | App-enforced validation |

**Optional Fields:**
| Field | Type | Default | Maps To |
|-------|------|---------|---------|
| Description | Rich text (0–4096 chars) | Empty | `description` |
| Image | File upload | None | Catalog item image |
| Custom Fields | Field builder | None | `checkout_options.custom_fields` |
| Allow "Add Extra" (Tipping) | Toggle | On | `checkout_options.allow_tipping` |
| Donor Recognition | Toggle | Off | Custom field: "Display name publicly?" |
| Dedication Message | Toggle | Off | Custom field: "In honor of..." |
| Tax-Deductible Notice | Text | None | Displayed on checkout (via description) |
| Support Email | Email | Merchant default | `checkout_options.merchant_support_email` |

**Reusability:** Always reusable. A donation link never "sells out" — it stays active indefinitely until the seller deactivates it.

**Tax Handling:** Donations are typically not taxed. The app should default taxes to OFF for donation links.

**Implementation Note:** The "preset tiers" model is the most complex. Options:
1. **Multiple links** — one link per tier (simplest, but seller manages multiple links)
2. **Single link with item variations** — each tier is a catalog item variation (buyer selects on checkout)
3. **App-layer landing page** — the app shows a tier selection page, then redirects to the appropriate QuickPay link (best UX, requires an intermediate page)

Recommended: Option 3 for V1 — the app hosts a simple tier-selection page that creates a dynamic QuickPay link based on the buyer's choice.

**Edge Cases:**
- Buyer enters $0 → minimum $1.00 enforced
- Buyer enters $1,000,000 → maximum enforced (seller-configurable or platform cap)
- Donation link shared on social media goes viral → no inventory limits, but monitor for fraud
- Seller wants to show a fundraising goal / progress bar → app-layer feature (track total donations in D1)

**Example:** Animal rescue fundraiser — preset tiers ($25 "Feed a pet for a week", $50 "Sponsor a vet visit", $100 "Cover an adoption fee"), custom amount option, "In memory of" dedication field.

---

#### 3.2.5 Service Payment

**Scenario:** "I completed a service and need to collect payment, or I need a deposit for an upcoming service."

**Seller Flow:**
1. Select "Service Payment"
2. Enter: service description, amount
3. Optionally pre-populate buyer info (if sending to a known client)
4. Add payment note (invoice #, project name)
5. Add custom fields (optional): project reference, service date
6. Review and create link

**Required Fields:**
| Field | Type | Validation | Maps To |
|-------|------|------------|---------|
| Service Description | Text (1–255 chars) | Required | `quick_pay.name` |
| Amount | Currency | Required, > $0 | `quick_pay.price_money` |
| Location | Dropdown | Required | `quick_pay.location_id` |

**Optional Fields:**
| Field | Type | Default | Maps To |
|-------|------|---------|---------|
| Detailed Description | Text (0–4096 chars) | Empty | `description` |
| Payment Note | Text (0–500 chars) | Empty | `payment_note` |
| Allow Tipping | Toggle | On (common for services) | `checkout_options.allow_tipping` |
| Pre-fill Buyer Name | Text | Empty | `pre_populated_data.buyer_name` |
| Pre-fill Buyer Email | Email | Empty | `pre_populated_data.buyer_email` |
| Pre-fill Buyer Phone | Phone | Empty | `pre_populated_data.buyer_phone` |
| Custom Fields | Field builder | None | `checkout_options.custom_fields` |
| Redirect URL | URL | None | `checkout_options.redirect_url` |
| Support Email | Email | Merchant default | `checkout_options.merchant_support_email` |

**Reusability Options:**
- **One-time link:** For a specific client/invoice — deactivate after first payment
- **Reusable link:** For a standard service rate — e.g., "$100/hour consultation" that any client can use

**Pre-Populated Data Flow:**
```
Seller knows the client → enters their name/email/phone
        │
        ▼
App sets pre_populated_data on the PaymentLink
        │
        ▼
Buyer opens checkout → fields are pre-filled (but editable)
        │
        ▼
Reduces friction for known clients
```

**Edge Cases:**
- Seller wants to send different amounts to different clients → create separate links (or use "Invoice" type)
- Seller wants a deposit (partial payment) → set amount to deposit amount, note "Deposit for [service]"
- Client disputes the amount → seller can void/refund via the order
- Tipping on a $5,000 consulting invoice feels odd → seller can toggle tipping off

**Example:** A freelance web developer sends a $2,500 link for "Website Redesign - Phase 1" to client@company.com with their name pre-filled and payment note "Invoice #2024-0847".

---

#### 3.2.6 Subscription / Recurring

**Scenario:** "I want buyers to subscribe to a recurring payment plan — monthly box, membership, retainer, etc."

**Seller Flow:**
1. Select "Subscription"
2. Choose an existing subscription plan from their catalog — OR create a new one
3. Configure plan details: name, price, billing cadence, trial period
4. Set fulfillment type (depends on what's being subscribed to)
5. Review and create link

**Required Fields:**
| Field | Type | Validation | Maps To |
|-------|------|------------|---------|
| Subscription Plan | Dropdown (from Catalog) or "Create New" | Required | `checkout_options.subscription_plan_id` |
| Plan Name | Text (1–255 chars) | Required (if creating new) | Catalog subscription plan name |
| Price | Currency | Required, > $0 | Subscription plan pricing |
| Billing Cadence | Dropdown | Required | Subscription plan cadence |
| Location | Dropdown | Required | `order.location_id` |

**Billing Cadence Options:**
| Cadence | Description | Example |
|---------|-------------|---------|
| Weekly | Billed every week | Weekly meal prep delivery |
| Every 2 Weeks | Billed biweekly | Biweekly cleaning service |
| Monthly | Billed every month | Monthly subscription box |
| Every 2 Months | Billed every 60 days | Bi-monthly supplement refill |
| Quarterly | Billed every 3 months | Quarterly wine club |
| Every 4 Months | Billed every 4 months | Seasonal deliveries |
| Every 6 Months | Billed twice a year | Semi-annual membership |
| Annually | Billed once a year | Annual membership |

**Optional Fields:**
| Field | Type | Default | Maps To |
|-------|------|---------|---------|
| Description | Text (0–4096 chars) | Empty | Plan description |
| Image | File upload | None | Catalog item image |
| Trial Period | Integer (days) | None (no trial) | Subscription plan trial |
| Fulfillment Type | Radio | None | `order.fulfillments[0].type` |
| Shipping Fee | Currency (if SHIPMENT) | $0 | `checkout_options.shipping_fee` |
| Custom Fields | Field builder | None | `checkout_options.custom_fields` |

**Subscription Lifecycle:**
```
Buyer clicks link → Subscribes on checkout
        │
        ▼
First payment processed immediately (or after trial)
        │
        ▼
Recurring payments auto-charged per cadence
        │
        ▼
Buyer can cancel via Square's subscription management
        │
        ▼
Seller sees subscription status in Dashboard (not in this app V1)
```

**Edge Cases:**
- Seller has no subscription plans in catalog → show "Create your first plan" flow
- Buyer's card declines on renewal → handled by Square's subscription engine (retry logic, dunning)
- Seller wants to offer multiple plan tiers (Basic $10/mo, Pro $25/mo) → create separate links or use catalog variations
- Trial period ends and buyer doesn't want to continue → auto-cancellation handled by Square

**Example:** A pottery studio offers a "Monthly Clay Kit" subscription — $45/month, ships a box of clay + tools, free trial for first month, $8 shipping.

---

#### 3.2.7 Food / Restaurant Order

**Scenario:** "I run a food business and want customers to pre-order or place orders via a link."

**Seller Flow:**
1. Select "Food Order"
2. Build the menu: items with modifiers (sizes, toppings, add-ons)
3. Configure fulfillment: Pickup or Delivery
   - Pickup: select location, set prep time, pickup instructions
   - Delivery: set delivery radius/fee, delivery time estimate
4. Enable tipping
5. Review and create link

**Required Fields:**
| Field | Type | Validation | Maps To |
|-------|------|------------|---------|
| At least 1 menu item | Item builder | Required | `order.line_items` |
| Item Name | Text | Required per item | `line_item.name` |
| Item Price | Currency | Required, ≥ $0 | `line_item.base_price_money` |
| Fulfillment Type | Radio (Pickup/Delivery) | Required | `order.fulfillments[0].type` |
| Location | Dropdown | Required | `order.location_id` |

**Optional Fields:**
| Field | Type | Default | Maps To |
|-------|------|---------|---------|
| Item Image | File upload | None | Catalog item image |
| Item Modifiers | Modifier builder | None | `line_item.modifiers` |
| Prep Time | Duration (minutes) | None | `fulfillment.pickup_details.prep_time_duration` |
| Pickup Instructions | Text | Empty | `fulfillment.pickup_details.note` |
| Delivery Fee | Currency | $0 | Service charge on order |
| Delivery Instructions | Text | Empty | `fulfillment.delivery_details.note` |
| Allow Tipping | Toggle | On | `checkout_options.allow_tipping` |
| Special Instructions Field | Toggle | On | `checkout_options.custom_fields` |
| Enable Coupons | Toggle | Off | `checkout_options.enable_coupon` |

**Modifier Model:**
```
Item: "Build Your Pizza"
├── Size (required, select 1):
│   ├── Personal (10") — +$0
│   ├── Medium (14") — +$4
│   └── Large (18") — +$8
├── Crust (required, select 1):
│   ├── Classic — +$0
│   ├── Thin — +$0
│   └── Stuffed — +$3
└── Toppings (optional, select up to 5):
    ├── Pepperoni — +$2
    ├── Mushrooms — +$1.50
    ├── Extra Cheese — +$2.50
    └── ...
```

Modifiers are modeled as `CatalogModifierList` objects in the Catalog API. Each modifier has a name and a price adjustment.

**Tipping for Food:**
- Default tip options: 15%, 20%, 25%, custom
- Tipping is standard for food orders — default to ON
- Tip is added as a separate line on the payment

**Edge Cases:**
- Seller wants time-limited availability (lunch menu only 11am–2pm) → app-layer scheduling, deactivate/reactivate link
- Delivery address outside service area → not enforceable at checkout in V1; seller handles post-order
- Buyer orders 50 pizzas → no per-order limit by default; seller can set max quantity
- Kitchen is overwhelmed → seller can temporarily deactivate the link

**Example:** A taco truck shares a link for "Taco Tuesday Special" — 3 tacos ($12), choice of protein (chicken/steak/veggie), add guac (+$2), pickup at the truck in 15 min.

---

#### 3.2.8 Digital Product

**Scenario:** "I'm selling a digital product — download, template, course access, digital art, etc."

**Seller Flow:**
1. Select "Digital Product"
2. Enter product details: name, description, price, preview image
3. Configure delivery method: download URL, access code, or email delivery
4. Set inventory (optional): limited edition or unlimited
5. Review and create link

**Required Fields:**
| Field | Type | Validation | Maps To |
|-------|------|------------|---------|
| Product Name | Text (1–255 chars) | Required | `order.line_items[0].name` |
| Price | Currency | Required, ≥ $0 (free allowed) | `order.line_items[0].base_price_money` |
| Location | Dropdown | Required | `order.location_id` |

**Optional Fields:**
| Field | Type | Default | Maps To |
|-------|------|---------|---------|
| Description | Rich text (0–4096 chars) | Empty | `description` |
| Preview Image | File upload | None | Catalog item image |
| Delivery URL | URL | None | `fulfillment.digital_details` / redirect URL |
| Access Instructions | Text | Empty | Included in confirmation email via `payment_note` |
| Inventory | Integer | Unlimited | Catalog inventory count |
| Custom Fields | Field builder | None | `checkout_options.custom_fields` |
| Enable Coupons | Toggle | Off | `checkout_options.enable_coupon` |

**Digital Delivery Methods:**
| Method | How It Works | Best For |
|--------|-------------|----------|
| **Redirect URL** | After payment, buyer is redirected to a download page | Files hosted elsewhere (Gumroad, Dropbox, Google Drive) |
| **Confirmation Email** | Square's confirmation email includes the access info in the payment note | Simple access codes, instructions |
| **Custom Fulfillment** | Seller manually sends the digital product after seeing the order | Personalized deliverables, custom work |

**Fulfillment:** `DIGITAL` — no shipping address collected. The `redirect_url` in checkout options is the primary delivery mechanism for V1.

**Edge Cases:**
- Buyer shares the download URL with others → not preventable in V1; seller should use expiring links or access codes
- Seller wants DRM / license keys → out of scope for V1; use custom fulfillment
- Price of $0 (free download) → allowed; useful for lead magnets, free samples
- Limited-edition digital art (e.g., 100 copies) → inventory tracking via Catalog API

**Example:** A designer sells a Figma UI kit for $29 — unlimited copies, buyer is redirected to a Gumroad download page after payment.

---

#### 3.2.9 Invoice / Custom Amount

**Scenario:** "I need to bill a specific person a specific amount with a reference number."

**Seller Flow:**
1. Select "Invoice"
2. Enter: description, amount, invoice/reference number
3. Pre-populate buyer info (name, email)
4. Review and create link

**Required Fields:**
| Field | Type | Validation | Maps To |
|-------|------|------------|---------|
| Description | Text (1–255 chars) | Required | `quick_pay.name` |
| Amount | Currency | Required, > $0 | `quick_pay.price_money` |
| Location | Dropdown | Required | `quick_pay.location_id` |

**Optional Fields:**
| Field | Type | Default | Maps To |
|-------|------|---------|---------|
| Invoice / Reference # | Text (0–100 chars) | Empty | `payment_note` |
| Due Date | Date picker | None | App metadata (D1) — for display/reminders only |
| Buyer Name | Text | Empty | `pre_populated_data.buyer_name` |
| Buyer Email | Email | Empty | `pre_populated_data.buyer_email` |
| Buyer Phone | Phone | Empty | `pre_populated_data.buyer_phone` |
| Itemized Breakdown | Line item builder | None | Shown in description (QuickPay) or as line items (Order) |
| Support Email | Email | Merchant default | `checkout_options.merchant_support_email` |

**Reusability:** One-time by default. Once paid, the seller should deactivate the link (or the app auto-deactivates it based on seller preference).

**Difference from Simple Payment:** Invoices are client-specific, reference-numbered, and typically one-time. Simple payments are generic and reusable.

**Edge Cases:**
- Buyer pays twice on a one-time invoice → app should warn seller; auto-deactivation after first payment recommended
- Seller wants to send a reminder → app can compose an email/SMS with the link (sharing hub feature)
- Amount disputed → seller handles via refund

**Example:** A contractor sends a $3,200 invoice link for "Kitchen Renovation - Final Payment" to homeowner@email.com, reference #INV-2024-0312.

---

#### 3.2.10 Multi-Item Cart

**Scenario:** "I want to sell multiple items together in a single checkout — a bundle, a collection, or a curated set."

**Seller Flow:**
1. Select "Multi-Item Cart"
2. Add items: name, price, quantity, image (for each item)
3. Configure variants per item (optional)
4. Set inventory per item (optional)
5. Configure shared fulfillment: Ship or Pickup
6. Set shipping fee, taxes, discounts
7. Review and create link

**Required Fields:**
| Field | Type | Validation | Maps To |
|-------|------|------------|---------|
| At least 2 items | Item builder | Required, ≥ 2 items | `order.line_items` |
| Per-item: Name | Text | Required | `line_item.name` |
| Per-item: Price | Currency | Required, ≥ $0 | `line_item.base_price_money` |
| Per-item: Quantity | Integer | Required, ≥ 1 | `line_item.quantity` |
| Location | Dropdown | Required | `order.location_id` |
| Fulfillment Type | Radio | Required | `order.fulfillments[0].type` |

**Optional Fields:**
| Field | Type | Default | Maps To |
|-------|------|---------|---------|
| Per-item: Image | File upload | None | Catalog item image |
| Per-item: Variants | Variant builder | None | Catalog item variations |
| Per-item: Inventory | Integer | Unlimited | Catalog inventory count |
| Order-level Discount | Currency or % | None | `order.discounts` |
| Shipping Fee | Currency | $0 | `checkout_options.shipping_fee` |
| Tax | Auto or manual | Auto | `order.taxes` |
| Custom Fields | Field builder | None | `checkout_options.custom_fields` |
| Enable Coupons | Toggle | Off | `checkout_options.enable_coupon` |

**Discount Model:**
| Discount Type | Description | Maps To |
|---------------|-------------|---------|
| Fixed amount off | "$10 off the bundle" | `order.discounts[].amount_money` |
| Percentage off | "15% off when you buy the set" | `order.discounts[].percentage` |
| Per-item discount | "$5 off item X" | `order.discounts[].scope = LINE_ITEM` |
| Order-level discount | "10% off entire order" | `order.discounts[].scope = ORDER` |

**Edge Cases:**
- One item in the cart sells out but others are available → entire link may fail; app should warn seller about inventory risk
- Buyer wants to adjust quantities → not supported in V1 (fixed quantities per link); seller creates a new link
- Bundle pricing (total is less than sum of parts) → model as an order-level discount

**Example:** A skincare brand sells a "Starter Kit" — Cleanser ($18) + Toner ($15) + Moisturizer ($22) = $55 with a $10 bundle discount → $45 total, free shipping.

---

## 4. Checkout Configuration Options (Deep Dive)

All payment links support these optional configurations. This section details the exact behavior, defaults, and constraints for each.

### 4.1 Accepted Payment Methods

| Method | Description | Default | Availability |
|--------|-------------|---------|-------------|
| **Credit/Debit Cards** | Visa, Mastercard, Amex, Discover | Always on (cannot be disabled) | All merchants |
| **Apple Pay** | Apple Pay on supported devices | On (if merchant enabled) | Requires merchant activation |
| **Google Pay** | Google Pay on supported devices | On (if merchant enabled) | Requires merchant activation |
| **Cash App Pay** | Pay via Cash App | On (if merchant enabled) | US only, requires merchant activation |
| **Afterpay/Clearpay** | Buy now, pay in 4 installments | On (if merchant enabled) | Orders $1–$2,000, requires merchant activation |
| **Square Gift Cards** | Pay with Square gift card balance | Off | Requires merchant to sell gift cards |

**Behavior:**
- At least one payment method must be enabled (cards are always on)
- Methods only appear if the merchant has activated them in their Square account
- The app should show which methods are available vs. which require activation, with a link to Square Dashboard to enable them
- Afterpay has order amount limits ($1 minimum, $2,000 maximum) — if the link amount exceeds this, Afterpay is automatically hidden

### 4.2 Tipping

**Configuration:**
| Setting | Type | Default |
|---------|------|---------|
| Enable tipping | Toggle | Off (On for food/service) |

**Buyer Experience:**
- When enabled, the checkout page shows: 15%, 20%, 25%, No Tip, Custom Amount
- Tip percentages are calculated on the subtotal (before tax and shipping)
- Tip is recorded as a separate component on the Payment object
- Tip appears on the seller's payment receipt and in reporting

**When to Default On:**
- Food orders → always default on
- Service payments → default on
- Donations → default on (as "add extra")
- Everything else → default off

### 4.3 Custom Fields

**Configuration:**
| Setting | Type | Constraints |
|---------|------|-------------|
| Field title | Text (1–100 chars) | Required per field |
| Field type | Text input | Only text supported in V1 |
| Required | Toggle | Per field |
| Max fields | — | Up to 5 custom fields per link |

**Buyer Experience:**
- Custom fields appear on the checkout page between the item details and payment section
- Required fields must be filled before the buyer can submit payment
- Field values are stored on the Order and visible to the seller

**Common Patterns by Use Case:**
| Use Case | Suggested Fields |
|----------|-----------------|
| Events | "Attendee Name" (required), "Dietary Restrictions" (optional) |
| Donations | "Donor Name" (optional), "Dedication Message" (optional) |
| Services | "Project Reference" (optional), "Preferred Date" (optional) |
| Food | "Special Instructions" (optional), "Allergies" (optional) |

### 4.4 Shipping

**Configuration:**
| Setting | Type | Default | Maps To |
|---------|------|---------|---------|
| Collect shipping address | Toggle | Off (On for SHIPMENT fulfillment) | `ask_for_shipping_address` |
| Shipping fee | Currency | $0 (free) | `shipping_fee.charge` |
| Shipping fee name | Text | "Shipping" | `shipping_fee.name` |

**Buyer Experience:**
- When enabled, the checkout page shows full address form (street, city, state, zip, country)
- Shipping fee appears as a line item on the order summary
- Address is stored on the Order's fulfillment details

**Shipping Fee Model:**
- V1 supports flat-rate shipping only
- The fee is applied as a `ShippingFee` which becomes a service charge on the order
- Free shipping = $0 fee (address still collected if `ask_for_shipping_address` is true)
- Future: calculated shipping based on weight/destination (out of scope for V1)

### 4.5 Coupons & Loyalty

**Coupons:**
| Setting | Type | Default |
|---------|------|---------|
| Enable coupon field | Toggle | Off |

- When enabled, the checkout page shows an "Add coupon" input field
- Buyers can enter Square Marketing coupon codes
- Coupons must be created in Square Marketing (not in this app)
- The app can surface a note: "Create coupons in Square Marketing to offer discounts"

**Loyalty:**
| Setting | Type | Default |
|---------|------|---------|
| Enable loyalty | Toggle | Off |

- When enabled, the checkout page shows a "Rewards" section
- Buyers can enter their phone number to look up their loyalty account
- They can earn points on the purchase and/or redeem existing points
- Requires the merchant to have Square Loyalty set up

### 4.6 Redirect & Support

**Redirect URL:**
| Setting | Type | Default | Validation |
|---------|------|---------|------------|
| Post-payment redirect | URL | None (Square confirmation page) | Must be valid HTTPS URL |

- After successful payment, the buyer is redirected to this URL instead of Square's default confirmation page
- Useful for: thank-you pages, download pages, membership portals, custom confirmation
- The redirect URL receives query parameters: `orderId`, `transactionId` (for the seller's backend to verify)

**Support Email:**
| Setting | Type | Default |
|---------|------|---------|
| Merchant support email | Email | Merchant's account email |

- Displayed on the checkout page as "Questions? Contact [email]"
- Also included in the buyer's confirmation email
- Helps buyers reach the seller for order issues

### 4.7 Pre-Populated Buyer Data

| Field | Type | Maps To |
|-------|------|---------|
| Buyer first name | Text | `pre_populated_data.buyer_first_name` |
| Buyer last name | Text | `pre_populated_data.buyer_last_name` |
| Buyer email | Email | `pre_populated_data.buyer_email` |
| Buyer phone | Phone | `pre_populated_data.buyer_phone` |
| Buyer address | Address object | `pre_populated_data.buyer_address` |

- All fields are optional and pre-fill the corresponding checkout form fields
- Buyer can edit any pre-filled field
- Most useful for: invoices, service payments, and links sent to known clients
- Can be combined with the Customers API to auto-populate from the seller's customer directory

### 4.8 App Fee (Platform Fee)

| Setting | Type | Constraints |
|---------|------|-------------|
| App fee amount | Currency | > $0, ≤ 90% of total order amount |

- Only relevant if this app operates as a platform/marketplace collecting a transaction fee
- The fee is deducted from the seller's payout and sent to the app developer's account
- Specified in the smallest currency denomination (cents for USD)
- Transparent to the buyer — they see the total price, not the fee split

**V1 Decision:** If this app is a first-party Square app, app fees may not apply. If it's a third-party platform, this is how the platform monetizes. **Recommend: defer to V2 unless platform model is confirmed.**

### 4.9 Payment Note

| Setting | Type | Constraints |
|---------|------|-------------|
| Payment note | Text (0–500 chars) | Optional |

- Attached to the resulting `Payment` object after processing
- Included in the buyer's post-payment confirmation email
- Visible in the seller's payment history in Square Dashboard
- Use cases: invoice numbers, order references, thank-you messages, service descriptions

---

## 5. Fulfillment Types (Deep Dive)

### 5.1 SHIPMENT

**When to Use:** Physical products that need to be mailed/shipped to the buyer.

**Required at Checkout:**
- Buyer's shipping address (collected via `ask_for_shipping_address`)

**Seller Post-Payment Actions:**
1. View order with shipping address
2. Pack and ship the item
3. Update fulfillment with carrier and tracking number (via Orders API)
4. Fulfillment state moves: `PROPOSED` → `RESERVED` → `PREPARED` → `COMPLETED`

**Data Model:**
```
FulfillmentShipmentDetails {
  recipient: {
    display_name: string
    email_address: string
    phone_number: string
    address: Address
  }
  carrier: string              // "USPS", "UPS", "FedEx", etc.
  shipping_note: string        // Packing instructions
  shipping_type: string        // "Standard", "Express", "Overnight"
  tracking_number: string      // Added after shipping
  tracking_url: string         // Added after shipping
  placed_at: timestamp
  in_progress_at: timestamp
  packaged_at: timestamp
  expected_shipped_at: timestamp
  shipped_at: timestamp
  canceled_at: timestamp
  cancel_reason: string
  failed_at: timestamp
  failure_reason: string
}
```

### 5.2 PICKUP

**When to Use:** Food orders, local retail, will-call tickets, buy-online-pickup-in-store.

**Required at Checkout:**
- Buyer's name and contact info (for notification)

**Seller Configuration:**
| Field | Description |
|-------|-------------|
| Pickup location | Which Square location the buyer picks up from |
| Prep time | Estimated time to prepare the order (e.g., 15 minutes) |
| Pickup window | When the buyer can pick up (e.g., "Today 5pm–7pm") |
| Pickup instructions | "Enter through the side door", "Ask for Mike at the counter" |

**Data Model:**
```
FulfillmentPickupDetails {
  recipient: { display_name, email, phone }
  schedule_type: "SCHEDULED" | "ASAP"
  pickup_at: timestamp
  pickup_window_duration: string  // ISO 8601 duration
  prep_time_duration: string      // ISO 8601 duration
  note: string                    // Pickup instructions
  placed_at: timestamp
  accepted_at: timestamp
  ready_at: timestamp
  expired_at: timestamp
  picked_up_at: timestamp
  canceled_at: timestamp
  cancel_reason: string
  is_curbside_pickup: bool
  curbside_pickup_details: {
    curbside_details: string      // "Blue Honda Civic"
    buyer_arrived_at: timestamp
  }
}
```

### 5.3 DIGITAL

**When to Use:** Tickets, digital downloads, access codes, virtual event links.

**Required at Checkout:**
- Buyer's email address (for delivery)

**Delivery Mechanism:**
- Primary: `redirect_url` sends buyer to a download/access page after payment
- Secondary: `payment_note` includes access instructions in the confirmation email
- Tertiary: Seller manually sends the digital product after seeing the order

**Data Model:**
```
FulfillmentDigitalDetails {
  recipient: { display_name, email, phone }
}
```

### 5.4 DELIVERY

**When to Use:** Food delivery, local delivery by the seller.

**Required at Checkout:**
- Buyer's delivery address
- Delivery contact info

**Seller Configuration:**
| Field | Description |
|-------|-------------|
| Delivery fee | Flat fee for delivery |
| Delivery window | Estimated delivery time |
| Delivery instructions | "Leave at front door", "Call on arrival" |

**Data Model:**
```
FulfillmentDeliveryDetails {
  recipient: { display_name, email, phone, address }
  schedule_type: "SCHEDULED" | "ASAP"
  deliver_at: timestamp
  prep_time_duration: string
  delivery_window_duration: string
  note: string
  placed_at: timestamp
  in_progress_at: timestamp
  ready_at: timestamp
  delivered_at: timestamp
  canceled_at: timestamp
  cancel_reason: string
  courier_pickup_at: timestamp
  courier_pickup_window_duration: string
  is_no_contact_delivery: bool
  dropoff_notes: string
  courier_provider_name: string
  courier_support_phone_number: string
  square_delivery_id: string
  external_delivery_id: string
  managed_delivery: bool
}
```

### 5.5 IN_STORE

**When to Use:** Buy online, fulfill in store. The buyer purchases via the link and picks up or receives the item at the store without a specific pickup time.

**Data Model:**
```
FulfillmentInStoreDetails {
  recipient: { display_name, email, phone }
  placed_at: timestamp
  ready_at: timestamp
  picked_up_at: timestamp
  canceled_at: timestamp
  cancel_reason: string
}
```

### 5.6 SIMPLE

**When to Use:** No fulfillment needed — donations, services, simple payments, tips.

**Data Model:**
```
FulfillmentSimpleDetails {
  // Minimal — just marks the fulfillment as complete
}
```

---

## 6. App Features & Screens (Detailed)

### 6.1 Onboarding

**Screen: Welcome**
- App logo and tagline: "Get paid with a link"
- "Connect your Square account" button → Square OAuth flow
- Brief value props: "Create payment links in seconds", "Share anywhere", "Track every sale"
- **Mobile:** Full-screen with swipeable value prop cards (3 screens) before the CTA
- **Web:** Single page with value props stacked vertically

**Screen: Setup**
- After OAuth, fetch merchant profile and locations
- If merchant has multiple locations: "Which location do you primarily use?" (can be changed later)
- If merchant has no catalog items: skip catalog sync
- If merchant has catalog items: "We found X items in your catalog. You can use these when creating links."
- **Mobile only:** "Enable push notifications?" prompt — explains "Get notified when someone pays"
- **Mobile only:** "Secure with Face ID / fingerprint?" prompt — biometric lock setup
- "Create your first link" CTA → Link Creator Wizard

### 6.2 Main Dashboard (Home)

**Layout (Mobile):**
- Top: Quick stats cards (horizontally scrollable) — Total links, Revenue (30d), Orders (30d)
- Middle: Recent links list (FlatList, pull-to-refresh, last 10 with status badges)
- Floating Action Button (FAB): "+" to create a new link
- Bottom tab navigator: Home, Links, Create (+), Orders, More (Analytics, Settings)

**Layout (Web):**
- Top: Quick stats bar — Total links (active), Revenue (last 30 days), Orders (last 30 days)
- Middle: Recent links list (last 10, with status badges and quick actions)
- Bottom: Quick-create buttons for each link type
- Persistent sidebar nav: Home, Create, Links, Orders, Analytics, Settings

**Quick Stats:**
| Stat | Source |
|------|--------|
| Active Links | Count of non-deactivated PaymentLinks |
| Revenue (30d) | Sum of payments from payment link orders |
| Orders (30d) | Count of completed orders from payment links |
| Top Link | Highest-revenue link in the last 30 days |

### 6.3 Link Creation Wizard

**Step 1: Choose Type**
- Grid of 8 cards, each with an icon, title, and one-line description:
  - Simple Payment — "Collect a specific amount"
  - Physical Product — "Sell an item with shipping or pickup"
  - Event / Tickets — "Sell tickets with limited availability"
  - Donation — "Accept donations with suggested amounts"
  - Service Payment — "Bill for a service or collect a deposit"
  - Subscription — "Set up recurring payments"
  - Food Order — "Take food orders with modifiers"
  - Digital Product — "Sell a downloadable or digital item"

**Step 2: Details** (adapts per type — see Section 3.2 for fields per type)
- Dynamic form that shows only the relevant fields for the selected type
- Inline validation on all fields
- Image upload with drag-and-drop and preview
- Variant/modifier builders with add/remove rows
- Inventory toggle with quantity input

**Step 3: Fulfillment** (skipped for types that don't need it)
- Fulfillment type selector (only shows relevant options for the chosen type)
- Conditional fields based on fulfillment type (shipping fee, pickup location, delivery details)

**Step 4: Checkout Options**
- Accordion sections for each option group:
  - Payment Methods (checkboxes)
  - Tipping (toggle)
  - Custom Fields (add/remove field builder)
  - Shipping (toggle + fee input)
  - Coupons & Loyalty (toggles)
  - Redirect URL (input)
  - Support Email (input)
  - Pre-populated Buyer Data (expandable form)
  - Payment Note (textarea)

**Step 5: Review & Create**
- Summary card showing all configured details
- Checkout preview (mock of how the ECKO page will look — approximate)
- "Create Link" button
- On success: immediately show the Sharing Hub for this link

**Wizard UX Principles:**
- Progress indicator showing current step and total steps
- Back button on every step (preserves entered data)
- "Save as Draft" option (stored in D1) — resume later
- Smart defaults per type (e.g., tipping ON for food, shipping ON for physical products)
- Inline help text explaining each field

### 6.4 Link Manager

**List View:**
- Sortable table/card list of all payment links
- Columns: Name, Type (badge), Status (Active/Paused/Sold Out/Expired), Created, Revenue, Orders, Actions
- Filters: by type, by status, by date range
- Search: by name or description
- Bulk actions: deactivate selected, export selected

**Status Badges:**
| Status | Color | Meaning |
|--------|-------|---------|
| Active | Green | Link is live and accepting payments |
| Paused | Yellow | Seller manually paused the link |
| Sold Out | Red | Inventory reached 0 |
| Expired | Gray | Event date passed or seller deactivated |
| Draft | Blue | Saved but not yet created/published |

**Per-Link Actions:**
| Action | Description |
|--------|-------------|
| Copy Link | Copy short URL to clipboard |
| Share | Open Sharing Hub for this link |
| Edit | Open wizard in edit mode (updates the link via `UpdatePaymentLink`) |
| Duplicate | Create a new link with the same configuration |
| Pause / Resume | Toggle link availability without deleting |
| View Orders | Filter orders list to this link |
| View Analytics | Open analytics for this link |
| Delete | Permanently delete the link (with confirmation) |

**Edit Behavior:**
- Editing a link calls `UpdatePaymentLink` with the updated fields
- The link URL does NOT change — same short URL, updated content
- Version number increments on each update
- Some fields may not be editable after orders have been placed (e.g., changing price on a link with existing orders)

### 6.5 Sharing Hub

**Triggered:** After link creation, or via "Share" action on any link.

**Sharing Options:**

| Method | Mobile (iOS/Android) | Web | Details |
|--------|---------------------|-----|---------|
| **Native Share Sheet** | `expo-sharing` / React Native Share API | N/A | **Primary mobile sharing method.** Opens the OS share sheet — seller can share to any installed app (iMessage, WhatsApp, Instagram, Slack, email, etc.) with a single tap. Includes link URL, item name, and preview image. |
| **Copy URL** | Clipboard API (`expo-clipboard`) | Clipboard API | Copy short URL with one tap/click. Toast/haptic confirmation: "Link copied!" |
| **QR Code** | Generated client-side; save to camera roll via `expo-media-library` | Generated client-side; download PNG/SVG | Display QR code with save/download option. Customizable: size, color, logo overlay. Mobile: "Save to Photos" button. |
| **Email** | Opens native mail composer via `expo-mail-composer` | `mailto:` link or compose UI | Pre-composed email with link, item description, and image. Subject: "Pay for [item name]" |
| **SMS** | Opens native SMS via `expo-sms` | `sms:` link | Pre-composed text message with link and brief description. Mobile: can select contacts from address book. |
| **Social Media** | Handled by native share sheet (above) | Platform-specific share URLs (Twitter, Facebook, LinkedIn) | On mobile, the native share sheet covers all social apps. On web, provide direct share buttons. Preview card with item image, name, price. |
| **Embed Code** | N/A (not relevant on mobile) | Generated HTML snippet | `<a>` button or `<iframe>` for embedding on websites. Customizable button text and style. Web-only feature. |
| **Print** | N/A | Browser print dialog | Formatted page with QR code, link URL, and item details — for physical flyers/posters. Web-only. |
| **AirDrop (iOS)** | Included in native share sheet | N/A | iOS sellers can AirDrop the link to nearby devices — useful at in-person events. |

**Social Preview Card:**
- When a payment link URL is shared on social media, the ECKO page serves Open Graph meta tags
- The app can show a preview of how the link will appear on each platform
- Image, title, description, and price are pulled from the link configuration

### 6.6 Analytics Dashboard

**Per-Link Analytics:**
| Metric | Source | Description |
|--------|--------|-------------|
| Total Revenue | Payments API | Sum of all payments from this link's orders |
| Total Orders | Orders API | Count of completed orders |
| Conversion Rate | Calculated | Orders / Link views (if view tracking available) |
| Average Order Value | Calculated | Total Revenue / Total Orders |
| Last Order | Orders API | Timestamp of most recent order |
| Inventory Remaining | Catalog API | Current stock level (if tracked) |

**Aggregate Analytics (All Links):**
| Metric | Description |
|--------|-------------|
| Total Active Links | Count of non-deactivated links |
| Total Revenue (period) | Sum across all links for selected time period |
| Total Orders (period) | Count across all links |
| Top Performing Links | Ranked by revenue |
| Revenue by Link Type | Breakdown: items vs. events vs. donations vs. etc. |
| Revenue Over Time | Line chart: daily/weekly/monthly revenue |
| Orders Over Time | Line chart: daily/weekly/monthly order count |
| New Links Created | Count of links created in the period |

**Time Period Selector:** Today, Last 7 Days, Last 30 Days, Last 90 Days, Custom Range

**Data Source:** The app queries the Orders API and Payments API, then caches aggregated results in D1 for performance. A background job refreshes the cache periodically (or on-demand when the user views analytics).

### 6.7 Orders View

**Purpose:** Show orders that originated from payment links, with fulfillment status.

**List View:**
- Columns: Order #, Link Name, Buyer, Amount, Status, Fulfillment, Date
- Filters: by link, by status (Paid, Fulfilled, Refunded), by date range
- Search: by order number, buyer name, or buyer email

**Order Detail View:**
- Order summary: items, quantities, prices, taxes, discounts, tips, total
- Buyer info: name, email, phone, address (if collected)
- Custom field responses
- Fulfillment status with timeline:
  ```
  Ordered → Preparing → Shipped/Ready → Delivered/Picked Up
  ```
- Actions: Mark as fulfilled, Add tracking number, Refund (partial or full)
- Link to full order in Square Dashboard (for advanced management)

**Fulfillment Actions by Type:**
| Fulfillment | Actions Available |
|-------------|-------------------|
| SHIPMENT | Add carrier + tracking number → Mark as shipped |
| PICKUP | Mark as ready → Mark as picked up |
| DIGITAL | Mark as delivered (or auto-complete) |
| DELIVERY | Mark as out for delivery → Mark as delivered |
| SIMPLE | Auto-completed on payment |

### 6.8 Templates

**Purpose:** Save and reuse link configurations to speed up repeat link creation.

**Template Sources:**
1. **Pre-built templates** — shipped with the app for common use cases
2. **Custom templates** — seller saves a link configuration as a template
3. **From existing link** — "Save as template" action on any link

**Pre-Built Templates:**
| Template | Type | Pre-configured |
|----------|------|----------------|
| "Quick Payment" | Simple | Just name + amount |
| "Product Sale" | Item | Name, price, image, shipping |
| "Event Ticket" | Event | Name, date, venue, 2 tiers |
| "Fundraiser" | Donation | Cause name, 4 preset tiers |
| "Service Invoice" | Service | Description, amount, payment note |
| "Monthly Subscription" | Subscription | Plan name, monthly cadence |
| "Food Pre-Order" | Food | Item with modifiers, pickup |
| "Digital Download" | Digital | Product name, price, redirect URL |

**Template Storage:** D1 database — templates are stored per-merchant with all configuration fields serialized as JSON.

**Template Flow:**
```
Create Link → Step 1: Choose Type
                  ↓
              "Start from a template?" → Select template
                  ↓
              Wizard pre-filled with template values
                  ↓
              Seller modifies as needed → Create Link
```

### 6.9 Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Default Location | Primary location for new links | First location |
| Default Support Email | Pre-filled on all new links | Merchant account email |
| Default Payment Methods | Which methods are enabled by default | All available |
| Default Tipping | Whether tipping is on by default | Off |
| Auto-Deactivate Invoices | Deactivate invoice links after first payment | On |
| Auto-Deactivate Events | Deactivate event links after event date | On |
| Analytics Cache Refresh | How often to refresh analytics data | Every 15 minutes |
| Notification Preferences | Email/push notifications for new orders | Email on |

---

## 7. Data Model Summary

### 7.1 Square API Objects (External — not owned by this app)

**PaymentLink** (from `online-checkout`):
```
{
  id: string,                    // Square-assigned ID
  version: uint32,               // Incremented on each update
  description: string,           // Internal description
  order_id: string,              // Backing Order ID
  checkout_options: CheckoutOptions,
  pre_populated_data: PrePopulatedData,
  url: string,                   // Short URL (shareable)
  long_url: string,              // Full URL
  payment_note: string,          // Note on resulting payment
  created_at: string,            // RFC 3339 timestamp
  updated_at: string             // RFC 3339 timestamp
}
```

**CheckoutOptions:**
```
{
  allow_tipping: bool,
  custom_fields: CustomField[],
  subscription_plan_id: string,
  redirect_url: string,
  merchant_support_email: string,
  ask_for_shipping_address: bool,
  accepted_payment_methods: {
    apple_pay: bool,
    google_pay: bool,
    cash_app_pay: bool,
    afterpay_clearpay: bool
  },
  app_fee_money: { amount: int64, currency: string },
  shipping_fee: { name: string, charge: { amount: int64, currency: string } },
  enable_coupon: bool,
  enable_loyalty: bool
}
```

**Order** (from `omg`):
```
{
  id: string,
  location_id: string,
  line_items: [{
    uid: string,
    name: string,
    quantity: string,
    base_price_money: { amount: int64, currency: string },
    variation_name: string,
    note: string,
    modifiers: [{ name: string, base_price_money: Money }],
    catalog_object_id: string
  }],
  fulfillments: [Fulfillment],
  taxes: [{ name: string, percentage: string, scope: "ORDER"|"LINE_ITEM" }],
  discounts: [{ name: string, amount_money: Money, percentage: string, scope: "ORDER"|"LINE_ITEM" }],
  service_charges: [{ name: string, amount_money: Money }],
  total_money: Money,
  total_tax_money: Money,
  total_discount_money: Money,
  total_tip_money: Money,
  state: "DRAFT"|"OPEN"|"COMPLETED"|"CANCELED"
}
```

### 7.2 App-Owned Data (D1 Database)

**link_metadata** — Extended metadata not stored in the Payment Links API:
```sql
CREATE TABLE link_metadata (
  id TEXT PRIMARY KEY,                    -- UUID
  payment_link_id TEXT NOT NULL UNIQUE,   -- Square PaymentLink ID
  merchant_id TEXT NOT NULL,              -- Square Merchant ID
  link_type TEXT NOT NULL,                -- 'simple'|'item'|'event'|'donation'|'service'|'subscription'|'food'|'digital'|'invoice'|'multi_item'
  event_date TEXT,                        -- ISO 8601 (for events)
  event_time TEXT,                        -- HH:MM (for events)
  event_venue TEXT,                       -- Venue name (for events)
  is_one_time BOOLEAN DEFAULT FALSE,      -- Auto-deactivate after first payment
  is_paused BOOLEAN DEFAULT FALSE,        -- Seller manually paused
  donation_tiers TEXT,                    -- JSON array of preset amounts (for donations)
  max_per_order INTEGER,                  -- Max quantity per purchase
  tags TEXT,                              -- JSON array of seller-defined tags
  notes TEXT,                             -- Seller's internal notes
  created_at TEXT NOT NULL,               -- ISO 8601
  updated_at TEXT NOT NULL                -- ISO 8601
);
```

**templates** — Saved link configurations:
```sql
CREATE TABLE templates (
  id TEXT PRIMARY KEY,                    -- UUID
  merchant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  link_type TEXT NOT NULL,
  configuration TEXT NOT NULL,            -- Full JSON of all wizard fields
  is_prebuilt BOOLEAN DEFAULT FALSE,      -- System-provided template
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

**analytics_cache** — Cached aggregated analytics:
```sql
CREATE TABLE analytics_cache (
  id TEXT PRIMARY KEY,
  merchant_id TEXT NOT NULL,
  payment_link_id TEXT,                   -- NULL for aggregate metrics
  metric_name TEXT NOT NULL,              -- 'revenue', 'orders', 'conversion_rate', etc.
  metric_value REAL NOT NULL,
  period_start TEXT NOT NULL,             -- ISO 8601
  period_end TEXT NOT NULL,               -- ISO 8601
  computed_at TEXT NOT NULL,              -- When this cache entry was computed
  UNIQUE(merchant_id, payment_link_id, metric_name, period_start)
);
```

**sharing_history** — Track how links are shared:
```sql
CREATE TABLE sharing_history (
  id TEXT PRIMARY KEY,
  merchant_id TEXT NOT NULL,
  payment_link_id TEXT NOT NULL,
  share_method TEXT NOT NULL,             -- 'copy'|'qr'|'email'|'sms'|'social'|'embed'
  shared_at TEXT NOT NULL
);
```

**user_settings** — Per-merchant preferences:
```sql
CREATE TABLE user_settings (
  merchant_id TEXT PRIMARY KEY,
  default_location_id TEXT,
  default_support_email TEXT,
  default_tipping BOOLEAN DEFAULT FALSE,
  auto_deactivate_invoices BOOLEAN DEFAULT TRUE,
  auto_deactivate_events BOOLEAN DEFAULT TRUE,
  notification_email BOOLEAN DEFAULT TRUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

---

## 8. Non-Functional Requirements

### 8.1 Performance

| Metric | Target | How |
|--------|--------|-----|
| Link creation (API round-trip) | < 2 seconds | Single API call to `CreatePaymentLink`; app constructs payload client-side |
| Link list load | < 1 second for up to 100 links | Paginated API calls + D1 metadata join; TanStack Query cache |
| Analytics dashboard load | < 3 seconds | Pre-computed aggregates in D1 cache; refresh in background |
| Sharing hub (QR generation) | < 500ms | Client-side QR generation, no server round-trip |
| Wizard step transitions | < 200ms | Client-side navigation, no API calls between steps |
| Search/filter | < 500ms | Client-side filtering for loaded data; API search for large datasets |
| **Mobile: app cold start** | < 2 seconds | Expo optimized bundle; lazy-load non-critical screens; preload auth state |
| **Mobile: app warm start** | < 500ms | App state preserved in memory; React Navigation state restoration |
| **Mobile: time to interactive** | < 3 seconds on 4G | Minimal initial bundle; defer analytics and templates loading |
| **Mobile: frame rate** | 60fps on scrolling lists | FlatList with `getItemLayout`; memoized list items; avoid JS thread blocking |
| **Mobile: bundle size** | < 15MB (JS bundle) | Tree-shaking; lazy imports; shared code deduplication |
| **Web: Lighthouse score** | > 90 (Performance) | Vite code splitting; lazy routes; optimized images; CDN delivery |

### 8.2 Security

| Concern | Mitigation |
|---------|------------|
| **OAuth token storage (mobile)** | `expo-secure-store` — iOS Keychain / Android Keystore; hardware-backed encryption; tokens never in AsyncStorage or JS memory longer than needed |
| **OAuth token storage (web)** | HttpOnly secure cookies; server-side session management; no tokens in localStorage |
| **Biometric authentication** | `expo-local-authentication` — Face ID / Touch ID / fingerprint required to open app (optional, seller-configurable) |
| **PCI compliance** | Not applicable — Square's ECKO checkout handles all payment data; this app never touches card numbers |
| **XSS** | React's built-in escaping; CSP headers (web); sanitize all user inputs |
| **CSRF** | SameSite cookies (web); CSRF tokens on state-changing requests |
| **Certificate pinning (mobile)** | Pin Square API SSL certificates to prevent MITM attacks on mobile networks |
| **Rate limiting** | Respect Square API rate limits (20 requests/second per merchant); implement client-side throttling |
| **Data access** | All API calls scoped to the authenticated merchant; no cross-merchant data access |
| **Image uploads** | Validate file type (JPG/PNG only), size (max 5MB), and scan for malware |
| **Jailbreak/root detection** | Warn users on jailbroken/rooted devices; optionally restrict access (financial data risk) |
| **App transport security (iOS)** | All network requests over HTTPS; ATS enabled by default in Expo |
| **Code obfuscation** | Hermes bytecode (React Native) provides basic obfuscation; ProGuard on Android |

### 8.3 Scalability

| Dimension | Target | Approach |
|-----------|--------|----------|
| Links per merchant | Up to 10,000+ | Paginated API calls; virtual scrolling in UI |
| Orders per merchant | Up to 100,000+ | Paginated API calls; analytics pre-aggregated |
| Concurrent users | 1,000+ simultaneous merchants | Stateless app server; D1 for per-merchant data |
| Image storage | Up to 50,000 images | Images stored via Catalog API (Square-hosted CDN) |

### 8.4 Reliability

| Concern | Mitigation |
|---------|------------|
| Idempotency | All create/update calls include `idempotency_key` (UUID generated client-side) |
| API failures | Retry with exponential backoff (max 3 retries); show user-friendly error messages |
| Webhook delivery | Implement webhook signature verification; handle out-of-order delivery; idempotent processing |
| Data consistency | D1 metadata is supplementary — Square API is the source of truth for links and orders |
| Offline resilience | Wizard state saved to localStorage; resume on reconnect |

### 8.5 Accessibility

| Requirement | Implementation |
|-------------|---------------|
| WCAG 2.1 AA compliance | Semantic HTML, ARIA labels, keyboard navigation, focus management |
| Screen reader support | All interactive elements labeled; form fields have associated labels; status announcements |
| Color contrast | Minimum 4.5:1 ratio for text; don't rely on color alone for status |
| Keyboard navigation | All actions reachable via keyboard; visible focus indicators; logical tab order |
| Responsive design | Mobile-first; usable on screens 320px and up |

### 8.6 Observability

| Signal | Tool | What to Track |
|--------|------|---------------|
| Errors | Datadog / Sentry | API failures, client-side exceptions, webhook processing errors |
| Performance | Datadog RUM | Page load times, API latency, wizard completion time |
| Usage | Custom analytics (D1) | Links created by type, sharing methods used, feature adoption |
| Business | Datadog dashboards | Revenue processed, orders completed, conversion rates |

---

## 9. Success Metrics

### 9.1 Activation Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to first link | < 60 seconds from completing onboarding | Timestamp diff: onboarding complete → first `CreatePaymentLink` |
| Onboarding completion rate | > 90% | Users who complete OAuth / users who start onboarding |
| First link creation rate | > 70% | Users who create a link / users who complete onboarding |
| First share rate | > 80% | Users who share their first link / users who create a link |

### 9.2 Engagement Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Links created per seller per month | > 5 (average) | Count of `CreatePaymentLink` per merchant per month |
| Daily active sellers | Track growth WoW | Unique merchants with any app activity per day |
| Weekly active sellers | Track growth WoW | Unique merchants with any app activity per week |
| Wizard completion rate | > 85% | Users who finish the wizard / users who start it |
| Template usage rate | > 30% | Links created from templates / total links created |
| Feature adoption | Track per feature | % of merchants using each feature (tipping, custom fields, coupons, etc.) |

### 9.3 Business Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| GMV (Gross Merchandise Value) | Track growth MoM | Total payment volume through app-created links |
| Revenue per link | Track average | Total GMV / total links with at least one order |
| Checkout conversion rate | ≥ Dashboard baseline | Orders completed / checkout page loads (from ECKO analytics) |
| Average order value | Track by link type | Total revenue / total orders, segmented by type |
| Seller retention (30-day) | > 60% | Sellers active in month 2 / sellers who onboarded in month 1 |
| Seller retention (90-day) | > 40% | Sellers active in month 4 / sellers who onboarded in month 1 |

### 9.4 Quality Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Error rate | < 1% of API calls | Failed API calls / total API calls |
| App crash rate | < 0.1% of sessions | Sessions with unhandled exceptions / total sessions |
| Support ticket volume | < 5% of active sellers/month | Support tickets / active sellers |
| NPS (Net Promoter Score) | > 50 | Periodic in-app survey |

---

## 10. Phased Rollout

### Phase 1: MVP (V1)
**Goal:** Core link creation, management, and sharing for the 4 most common use cases. Ship on all 3 platforms.

**Included:**
- **Monorepo setup:** Turborepo with `apps/mobile`, `apps/web`, `packages/shared`, `packages/ui`
- **Mobile apps (iOS + Android):** React Native (Expo) with core navigation, OAuth via in-app browser, secure token storage, push notification setup
- **Web app:** React (Vite) with responsive layout, OAuth redirect flow
- **Shared package:** TypeScript API client, wizard state machine, Zod validation, React hooks, domain models
- Simple Payment, Item Sale, Event/Tickets, Donation (4 of 8 types)
- Basic wizard (Steps 1–5) — shared logic, platform-specific UI
- Link Manager (list, edit, deactivate, duplicate, delete)
- Sharing Hub: copy URL, QR code, native share sheet (mobile), email compose
- Basic analytics (per-link revenue and order count)
- Square OAuth onboarding (in-app browser on mobile, redirect on web)
- Biometric lock (Face ID / fingerprint) on mobile
- Offline draft support (save wizard state locally, sync when connected)
- Settings (default location, support email)
- **App Store submissions:** iOS App Store + Google Play Store

**Not Included:**
- Service, Subscription, Food, Digital Product types
- Templates
- Advanced analytics (charts, funnels, time-series)
- Order management (link to Dashboard)
- Social media sharing, SMS, embed codes (web)
- Bulk operations
- Tablet-optimized layouts

### Phase 2: Full Type Coverage (V1.5)
**Goal:** Support all 8 payment link types, templates, and richer mobile features.

**Added:**
- Service Payment, Subscription, Food Order, Digital Product types
- Template system (pre-built + custom)
- Order list view with basic fulfillment actions
- Push notifications for new orders (mobile) — "New order from [Link Name]!"
- SMS and social media sharing (native share sheet already covers this on mobile)
- Embed code generation (web only)
- Haptic feedback on key actions (mobile)
- Widget support: iOS home screen widget showing today's revenue / recent orders
- Android app shortcut: long-press app icon → "Create New Link"

### Phase 3: Analytics & Intelligence (V2)
**Goal:** Rich analytics and smart features across all platforms.

**Added:**
- Full analytics dashboard with charts, funnels, time-series (Recharts on web, Victory Native on mobile)
- Revenue by type breakdown
- Sharing method effectiveness tracking
- Smart defaults (learn from seller's past links)
- Bulk link creation and management (web)
- Webhook-driven real-time order updates
- Fundraising goal / progress bar for donations
- Apple Watch companion: glanceable revenue + order count + new order notifications
- Tablet-optimized layouts (iPad split view, Android large screen)

### Phase 4: Platform & Growth (V2.5+)
**Goal:** Platform features and growth tools.

**Added:**
- App fee / platform monetization
- A/B testing for checkout pages
- Link expiration and scheduling
- Multi-currency support
- Advanced inventory management
- API for programmatic link creation (for power users)
- Camera-based item creation: snap a photo → AI extracts name, description, price → pre-fills wizard (mobile)
- Siri Shortcuts / Google Assistant integration: "Hey Siri, create a payment link for $50"
- App Clips (iOS) / Instant Apps (Android): lightweight checkout experience without full app install

---

## 11. Open Questions & Decisions Needed

| # | Question | Options | Recommendation | Impact |
|---|----------|---------|----------------|--------|
| 1 | **First-party or third-party app?** | First-party (inside Square ecosystem) vs. third-party (independent, uses OAuth) | Third-party with OAuth — maximizes independence and portability | Architecture, auth flow, app fee model |
| 2 | **Donation preset tiers: how to implement?** | A) Multiple links per tier, B) Catalog variations, C) App-layer landing page | C) App-layer landing page for best UX | Donation flow complexity |
| 3 | **Link "pausing" mechanism?** | A) Delete and recreate, B) App-layer flag (hide from sharing), C) API-level deactivation | B) App-layer flag in D1 — fastest to implement, URL stays valid | Link management UX |
| 4 | **Per-order quantity limits?** | A) Catalog-level enforcement, B) App-layer validation before checkout, C) Not supported in V1 | B) App-layer validation — set max quantity in wizard, enforce before creating checkout | Event ticket scalping prevention |
| 5 | **Analytics data freshness?** | A) Real-time (API on every load), B) Cached (refresh every 15 min), C) Webhook-driven | B) Cached for V1, C) Webhook-driven for V2 | Performance vs. freshness tradeoff |
| 6 | **Multi-location handling?** | A) Single location per app session, B) Location selector per link, C) Location switcher in nav | B) Location selector per link — most flexible | UX complexity for multi-location merchants |
| 7 | **Event link expiration?** | A) Manual only, B) Auto-expire on event date, C) Configurable (auto or manual) | C) Configurable — default to auto-expire, seller can override | Event link lifecycle |
| 8 | **Image hosting?** | A) Catalog API (Square CDN), B) App-owned storage (R2/S3), C) External URLs only | A) Catalog API — leverages existing infrastructure, no additional storage costs | Image upload flow |
| 9 | **Offline/draft support?** | A) No drafts, B) localStorage drafts, C) D1-stored drafts | C) D1-stored drafts — persist across devices | Wizard abandonment recovery |
| 10 | **Branding/theming?** | A) Square brand only, B) Seller-customizable colors, C) Multiple brand themes | A) Square brand for V1 — consistent, fast to build | Design system scope |

---

## 12. Dependencies & Risks

### Dependencies

| Dependency | Owner | Risk Level | Mitigation |
|------------|-------|------------|------------|
| Payment Links API availability | SOC team (`online-checkout`) | Low | Well-established API; monitor via Datadog dashboards |
| ECKO checkout page | SOC team (`ecom-checkout-app`) | Low | Reused as-is; no changes needed from this app |
| Orders API | OMG team | Low | Core Square infrastructure; highly reliable |
| Catalog API | Catalog team | Low | Core Square infrastructure |
| Square OAuth | Platform team | Low | Standard OAuth 2.0; well-documented |
| Webhooks | Platform team | Medium | Delivery not guaranteed; implement polling fallback |
| D1 Database | Cloudflare | Low | Managed service; built-in replication |
| **Expo SDK** | Expo (open source) | Low | Well-maintained; large community; pinned SDK version |
| **Apple App Store review** | Apple | Medium | Financial apps face stricter review; plan 1–2 week review buffer; follow guidelines precisely |
| **Google Play review** | Google | Low–Medium | Generally faster than Apple; comply with financial services policy |
| **React Native ecosystem** | Community | Low | Mature ecosystem; Expo abstracts most native complexity |

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| API rate limits hit during high-traffic events | Medium | High (link creation fails) | Client-side throttling; queue requests; show "try again" with backoff |
| Inventory race conditions (overselling) | Medium | High (seller oversells) | Inventory is managed by Catalog API (atomic decrements); monitor and alert |
| Webhook delivery delays | Medium | Medium (stale analytics) | Polling fallback; cache refresh on user action |
| Square API breaking changes | Low | High (app breaks) | Pin API version; monitor Square developer changelog; integration tests |
| ECKO checkout UX changes | Low | Medium (inconsistent preview) | Checkout preview in wizard is approximate; link to live preview |
| OAuth token expiry during long sessions | Medium | Low (temporary auth failure) | Automatic token refresh; graceful re-auth prompt |
| **App Store rejection** | Medium | High (delays launch) | Pre-review checklist; follow Apple/Google financial app guidelines; no IAP conflicts (Square handles payments externally) |
| **React Native version conflicts** | Low | Medium (build failures) | Pin Expo SDK version; use EAS Build for consistent environments; avoid bare native modules |
| **Mobile performance on low-end devices** | Medium | Medium (poor UX) | Test on budget Android devices; optimize list rendering; use Hermes engine; lazy-load screens |
| **Push notification opt-in rate** | Medium | Low (reduced engagement) | Explain value clearly during onboarding; allow re-prompting later; don't block app usage |
| **Cross-platform UI inconsistencies** | Medium | Low (confusing UX) | Shared design tokens via NativeWind; platform-specific components where native patterns differ (e.g., back navigation, tab bars); test on both platforms in CI |
| **App size exceeds targets** | Low | Low (slower downloads) | Monitor bundle size in CI; tree-shake aggressively; lazy-load heavy dependencies (charts, QR) |
