// Square API Configuration
// ============================================================================
// To use this app, you need a Square Developer account:
// 1. Go to https://developer.squareup.com
// 2. Create an application
// 3. Copy your Application ID and OAuth credentials
// 4. Set them below or via environment variables
// ============================================================================

export const SQUARE_CONFIG = {
  // OAuth
  clientId: process.env.EXPO_PUBLIC_SQUARE_CLIENT_ID || '',
  // NOTE: Client secret should NEVER be in the mobile app.
  // It lives on your backend server only.

  // API
  apiBaseUrl: 'https://connect.squareup.com',
  apiVersion: '2024-12-18',

  // OAuth URLs
  authorizationEndpoint: 'https://connect.squareup.com/oauth2/authorize',
  tokenEndpoint: 'https://connect.squareup.com/oauth2/token',
  revokeEndpoint: 'https://connect.squareup.com/oauth2/revoke',

  // OAuth Scopes (from PRD Section 2.2)
  scopes: [
    'ONLINE_STORE_SNIPPETS_WRITE',
    'ONLINE_STORE_SNIPPETS_READ',
    'ORDERS_READ',
    'ORDERS_WRITE',
    'ITEMS_READ',
    'ITEMS_WRITE',
    'INVENTORY_READ',
    'CUSTOMERS_READ',
    'PAYMENTS_READ',
    'MERCHANT_PROFILE_READ',
  ],

  // Deep link redirect for OAuth callback
  redirectUri: 'paymentlinks://oauth/callback',

  // Sandbox mode for development
  useSandbox: __DEV__,
  sandboxApiBaseUrl: 'https://connect.squareupsandbox.com',
} as const

export function getApiBaseUrl(): string {
  return SQUARE_CONFIG.useSandbox
    ? SQUARE_CONFIG.sandboxApiBaseUrl
    : SQUARE_CONFIG.apiBaseUrl
}

export function getAuthorizationUrl(): string {
  return SQUARE_CONFIG.useSandbox
    ? 'https://connect.squareupsandbox.com/oauth2/authorize'
    : SQUARE_CONFIG.authorizationEndpoint
}
