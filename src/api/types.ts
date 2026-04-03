// Square API Response Types
// ============================================================================
// Typed interfaces matching the Square Connect v2 API responses.
// Based on proto definitions from the PRD (Section 7).
// ============================================================================

// --- Common ---

export interface SquareMoney {
  amount: number      // In smallest denomination (cents for USD)
  currency: string    // ISO 4217
}

// --- Payment Links ---

export interface SquarePaymentLink {
  id: string
  version: number
  description?: string
  order_id: string
  checkout_options?: SquareCheckoutOptions
  pre_populated_data?: SquarePrePopulatedData
  url: string
  long_url: string
  created_at: string
  updated_at: string
  payment_note?: string
}

export interface SquareCheckoutOptions {
  allow_tipping?: boolean
  custom_fields?: SquareCustomField[]
  subscription_plan_id?: string
  redirect_url?: string
  merchant_support_email?: string
  ask_for_shipping_address?: boolean
  accepted_payment_methods?: SquareAcceptedPaymentMethods
  app_fee_money?: SquareMoney
  shipping_fee?: SquareShippingFee
  enable_coupon?: boolean
  enable_loyalty?: boolean
}

export interface SquareCustomField {
  title: string
}

export interface SquareAcceptedPaymentMethods {
  apple_pay?: boolean
  google_pay?: boolean
  cash_app_pay?: boolean
  afterpay_clearpay?: boolean
}

export interface SquareShippingFee {
  name: string
  charge: SquareMoney
}

export interface SquarePrePopulatedData {
  buyer_email?: string
  buyer_phone_number?: string
  buyer_address?: SquareAddress
}

export interface SquareAddress {
  address_line_1?: string
  address_line_2?: string
  locality?: string
  administrative_district_level_1?: string
  postal_code?: string
  country?: string
}

// --- Quick Pay ---

export interface SquareQuickPay {
  name: string
  price_money: SquareMoney
  location_id: string
}

// --- Orders ---

export interface SquareOrder {
  id: string
  location_id: string
  line_items?: SquareOrderLineItem[]
  fulfillments?: SquareFulfillment[]
  total_money?: SquareMoney
  total_tax_money?: SquareMoney
  total_discount_money?: SquareMoney
  total_tip_money?: SquareMoney
  state: 'DRAFT' | 'OPEN' | 'COMPLETED' | 'CANCELED'
  created_at: string
  updated_at: string
}

export interface SquareOrderLineItem {
  uid: string
  name: string
  quantity: string
  base_price_money: SquareMoney
  variation_name?: string
  note?: string
  catalog_object_id?: string
}

export interface SquareFulfillment {
  uid: string
  type: 'SHIPMENT' | 'PICKUP' | 'DIGITAL' | 'DELIVERY' | 'IN_STORE' | 'SIMPLE'
  state: 'PROPOSED' | 'RESERVED' | 'PREPARED' | 'COMPLETED' | 'CANCELED' | 'FAILED'
}

// --- Merchant ---

export interface SquareMerchant {
  id: string
  business_name?: string
  country: string
  language_code?: string
  currency: string
  status: string
  main_location_id?: string
}

export interface SquareLocation {
  id: string
  name?: string
  address?: SquareAddress
  timezone?: string
  status: 'ACTIVE' | 'INACTIVE'
  currency: string
}

// --- API Request/Response Wrappers ---

export interface CreatePaymentLinkRequest {
  idempotency_key: string
  description?: string
  quick_pay?: SquareQuickPay
  order?: Partial<SquareOrder>
  checkout_options?: SquareCheckoutOptions
  pre_populated_data?: SquarePrePopulatedData
  payment_note?: string
}

export interface CreatePaymentLinkResponse {
  payment_link: SquarePaymentLink
  related_resources?: {
    orders?: SquareOrder[]
  }
}

export interface ListPaymentLinksResponse {
  payment_links?: SquarePaymentLink[]
  cursor?: string
}

export interface RetrievePaymentLinkResponse {
  payment_link: SquarePaymentLink
}

export interface UpdatePaymentLinkRequest {
  payment_link: Partial<SquarePaymentLink> & { version: number }
}

export interface UpdatePaymentLinkResponse {
  payment_link: SquarePaymentLink
}

export interface DeletePaymentLinkResponse {
  id: string
  cancelled_order_id?: string
}

export interface ListOrdersRequest {
  location_ids: string[]
  cursor?: string
  limit?: number
}

export interface ListOrdersResponse {
  orders?: SquareOrder[]
  cursor?: string
}

export interface ListLocationsResponse {
  locations: SquareLocation[]
}

export interface RetrieveMerchantResponse {
  merchant: SquareMerchant[]
}

// --- OAuth ---

export interface OAuthTokenResponse {
  access_token: string
  token_type: string
  expires_at: string
  merchant_id: string
  refresh_token: string
}
