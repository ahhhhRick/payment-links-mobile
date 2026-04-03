// Payment Links Service
// ============================================================================
// Wraps the Square Payment Links API (online-checkout).
// Handles both QuickPay and Order-based creation modes.
// Maps between app types and Square API types.
// ============================================================================

import { squareApi } from '../api/client'
import type {
  CreatePaymentLinkRequest,
  CreatePaymentLinkResponse,
  ListPaymentLinksResponse,
  RetrievePaymentLinkResponse,
  UpdatePaymentLinkRequest,
  UpdatePaymentLinkResponse,
  DeletePaymentLinkResponse,
  SquarePaymentLink,
  SquareCheckoutOptions,
} from '../api/types'
import { LinkType, type WizardState, type PaymentLink, LinkStatus } from '../types'
import { LINK_TYPE_CONFIGS } from '../types'

function generateIdempotencyKey(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Determine if a link type should use QuickPay or Order-based creation
function shouldUseQuickPay(linkType: LinkType): boolean {
  const config = LINK_TYPE_CONFIGS[linkType]
  return config.type === LinkType.SimplePayment
    || config.type === LinkType.ServicePayment
    || config.type === LinkType.Donation
    || config.type === LinkType.Invoice
}

// Build checkout options from wizard state
function buildCheckoutOptions(wizard: WizardState): SquareCheckoutOptions {
  const options: SquareCheckoutOptions = {}

  if (wizard.allowTipping) options.allow_tipping = true
  if (wizard.askForShipping) options.ask_for_shipping_address = true
  if (wizard.enableCoupon) options.enable_coupon = true

  if (wizard.customFields.length > 0) {
    options.custom_fields = wizard.customFields.map(title => ({ title }))
  }

  return options
}

// Convert wizard state to a CreatePaymentLink API request
function buildCreateRequest(wizard: WizardState, locationId: string): CreatePaymentLinkRequest {
  const request: CreatePaymentLinkRequest = {
    idempotency_key: generateIdempotencyKey(),
    description: wizard.description || undefined,
    checkout_options: buildCheckoutOptions(wizard),
    payment_note: wizard.paymentNote || undefined,
  }

  if (shouldUseQuickPay(wizard.linkType!)) {
    // QuickPay mode — simple name + price + location
    const amountCents = wizard.amountDollars
      ? Math.round(parseFloat(wizard.amountDollars) * 100)
      : 0

    request.quick_pay = {
      name: wizard.name,
      price_money: {
        amount: amountCents,
        currency: 'USD',
      },
      location_id: locationId,
    }
  } else {
    // Order-based mode — full order object
    const amountCents = wizard.amountDollars
      ? Math.round(parseFloat(wizard.amountDollars) * 100)
      : 0

    request.order = {
      location_id: locationId,
      line_items: [
        {
          uid: '1',
          name: wizard.name,
          quantity: '1',
          base_price_money: {
            amount: amountCents,
            currency: 'USD',
          },
        },
      ],
    }
  }

  return request
}

// Convert a Square API PaymentLink to our app's PaymentLink type
function mapToAppLink(squareLink: SquarePaymentLink, linkType?: LinkType): PaymentLink {
  return {
    id: squareLink.id,
    name: squareLink.description || 'Untitled Link',
    linkType: linkType || LinkType.SimplePayment,
    status: LinkStatus.Active,
    amount: null, // Would need to fetch the order to get the amount
    url: squareLink.url,
    description: squareLink.description || '',
    createdAt: squareLink.created_at,
    totalOrders: 0,
    totalRevenue: { amount: 0, currency: 'USD' },
    isPaused: false,
    isOneTime: false,
  }
}

// ============================================================================
// Public API
// ============================================================================

export const paymentLinksService = {
  /**
   * Create a new payment link from wizard state.
   * Automatically selects QuickPay or Order-based mode.
   */
  async create(wizard: WizardState, locationId: string): Promise<PaymentLink> {
    const request = buildCreateRequest(wizard, locationId)
    const response = await squareApi.post<CreatePaymentLinkResponse>(
      '/v2/online-checkout/payment-links',
      request
    )
    return mapToAppLink(response.payment_link, wizard.linkType!)
  },

  /**
   * List all payment links for the merchant.
   * Supports cursor-based pagination.
   */
  async list(cursor?: string, limit?: number): Promise<{
    links: PaymentLink[]
    cursor?: string
  }> {
    const params: Record<string, string> = {}
    if (cursor) params.cursor = cursor
    if (limit) params.limit = String(limit)

    const response = await squareApi.get<ListPaymentLinksResponse>(
      '/v2/online-checkout/payment-links',
      params
    )

    const links = (response.payment_links || []).map(sl => mapToAppLink(sl))

    return {
      links,
      cursor: response.cursor,
    }
  },

  /**
   * Get a single payment link by ID.
   */
  async get(id: string): Promise<PaymentLink> {
    const response = await squareApi.get<RetrievePaymentLinkResponse>(
      `/v2/online-checkout/payment-links/${id}`
    )
    return mapToAppLink(response.payment_link)
  },

  /**
   * Update a payment link.
   * Only the checkout_options and payment_note can be updated.
   */
  async update(id: string, version: number, updates: {
    checkoutOptions?: Partial<SquareCheckoutOptions>
    paymentNote?: string
  }): Promise<PaymentLink> {
    const request: UpdatePaymentLinkRequest = {
      payment_link: {
        version,
        checkout_options: updates.checkoutOptions,
        payment_note: updates.paymentNote,
      },
    }
    const response = await squareApi.put<UpdatePaymentLinkResponse>(
      `/v2/online-checkout/payment-links/${id}`,
      request
    )
    return mapToAppLink(response.payment_link)
  },

  /**
   * Delete a payment link.
   * This also cancels the associated order.
   */
  async delete(id: string): Promise<void> {
    await squareApi.delete<DeletePaymentLinkResponse>(
      `/v2/online-checkout/payment-links/${id}`
    )
  },
}
