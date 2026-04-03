// Merchant Service
// ============================================================================
// Fetches merchant profile and locations from Square API.
// Used during onboarding and for location selection in link creation.
// ============================================================================

import { squareApi } from '../api/client'
import type {
  SquareMerchant,
  SquareLocation,
  ListLocationsResponse,
} from '../api/types'

export interface MerchantProfile {
  id: string
  businessName: string
  country: string
  currency: string
  mainLocationId: string | null
}

export interface Location {
  id: string
  name: string
  currency: string
  isActive: boolean
}

export const merchantService = {
  /**
   * Get the authenticated merchant's profile.
   */
  async getProfile(): Promise<MerchantProfile> {
    const response = await squareApi.get<{ merchant: SquareMerchant[] }>('/v2/merchants/me')
    const merchant = response.merchant[0]

    return {
      id: merchant.id,
      businessName: merchant.business_name || 'My Business',
      country: merchant.country,
      currency: merchant.currency,
      mainLocationId: merchant.main_location_id || null,
    }
  },

  /**
   * List all active locations for the merchant.
   */
  async getLocations(): Promise<Location[]> {
    const response = await squareApi.get<ListLocationsResponse>('/v2/locations')

    return response.locations
      .filter(loc => loc.status === 'ACTIVE')
      .map(loc => ({
        id: loc.id,
        name: loc.name || 'Unnamed Location',
        currency: loc.currency,
        isActive: loc.status === 'ACTIVE',
      }))
  },
}
