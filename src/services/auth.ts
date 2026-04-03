// Authentication Service
// ============================================================================
// Manages Square OAuth tokens.
// In production, uses expo-secure-store for encrypted storage.
// Falls back to in-memory storage when SecureStore isn't available.
// ============================================================================

// NOTE: expo-secure-store needs to be installed separately.
// For now we use a simple in-memory store that persists for the session.
// When you install expo-secure-store, uncomment the SecureStore lines below.

// import * as SecureStore from 'expo-secure-store'

const TOKEN_KEY = 'square_access_token'
const REFRESH_TOKEN_KEY = 'square_refresh_token'
const MERCHANT_ID_KEY = 'square_merchant_id'
const EXPIRES_AT_KEY = 'square_token_expires_at'

// In-memory fallback (replace with SecureStore when available)
const memoryStore: Record<string, string> = {}

async function secureGet(key: string): Promise<string | null> {
  // return await SecureStore.getItemAsync(key)
  return memoryStore[key] || null
}

async function secureSet(key: string, value: string): Promise<void> {
  // await SecureStore.setItemAsync(key, value)
  memoryStore[key] = value
}

async function secureDelete(key: string): Promise<void> {
  // await SecureStore.deleteItemAsync(key)
  delete memoryStore[key]
}

export const authStore = {
  async getAccessToken(): Promise<string | null> {
    return secureGet(TOKEN_KEY)
  },

  async getRefreshToken(): Promise<string | null> {
    return secureGet(REFRESH_TOKEN_KEY)
  },

  async getMerchantId(): Promise<string | null> {
    return secureGet(MERCHANT_ID_KEY)
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await secureGet(TOKEN_KEY)
    if (!token) return false

    // Check expiry
    const expiresAt = await secureGet(EXPIRES_AT_KEY)
    if (expiresAt) {
      const expiryDate = new Date(expiresAt)
      if (expiryDate <= new Date()) {
        // Token expired — caller should refresh
        return false
      }
    }
    return true
  },

  async saveTokens(params: {
    accessToken: string
    refreshToken: string
    merchantId: string
    expiresAt: string
  }): Promise<void> {
    await secureSet(TOKEN_KEY, params.accessToken)
    await secureSet(REFRESH_TOKEN_KEY, params.refreshToken)
    await secureSet(MERCHANT_ID_KEY, params.merchantId)
    await secureSet(EXPIRES_AT_KEY, params.expiresAt)
  },

  async clearTokens(): Promise<void> {
    await secureDelete(TOKEN_KEY)
    await secureDelete(REFRESH_TOKEN_KEY)
    await secureDelete(MERCHANT_ID_KEY)
    await secureDelete(EXPIRES_AT_KEY)
  },
}
