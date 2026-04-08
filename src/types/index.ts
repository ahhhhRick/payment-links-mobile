export enum LinkType {
  SimplePayment = 'simple',
  ItemSale = 'item',
  EventTickets = 'event',
  Donation = 'donation',
  ServicePayment = 'service',
  Subscription = 'subscription',
  FoodOrder = 'food',
  DigitalProduct = 'digital',
}

export enum LinkStatus {
  Active = 'active',
  Paused = 'paused',
  SoldOut = 'sold_out',
  Expired = 'expired',
  Draft = 'draft',
}

export enum FulfillmentType {
  Shipment = 'SHIPMENT',
  Pickup = 'PICKUP',
  Digital = 'DIGITAL',
  Delivery = 'DELIVERY',
  Simple = 'SIMPLE',
}

export interface Money {
  amount: number
  currency: string
}

export interface PaymentLink {
  id: string
  name: string
  linkType: LinkType
  status: LinkStatus
  amount: Money | null
  url: string
  description: string
  createdAt: string
  totalOrders: number
  totalRevenue: Money
  eventDate?: string
  eventVenue?: string
  imageUri?: string
  isPaused: boolean
  isOneTime: boolean
}

export interface LinkTypeConfig {
  type: LinkType
  label: string
  description: string
  icon: string
  color: string
}

export const LINK_TYPE_CONFIGS: Record<LinkType, LinkTypeConfig> = {
  [LinkType.SimplePayment]: {
    type: LinkType.SimplePayment,
    label: 'Simple Payment',
    description: 'Collect a specific amount',
    icon: '$',
    color: '#006AFF',
  },
  [LinkType.ItemSale]: {
    type: LinkType.ItemSale,
    label: 'Physical Product',
    description: 'Sell with shipping or pickup',
    icon: 'P',
    color: '#00A86B',
  },
  [LinkType.EventTickets]: {
    type: LinkType.EventTickets,
    label: 'Event / Tickets',
    description: 'Sell tickets with limits',
    icon: 'T',
    color: '#9B59B6',
  },
  [LinkType.Donation]: {
    type: LinkType.Donation,
    label: 'Donation',
    description: 'Accept donations',
    icon: 'H',
    color: '#E74C3C',
  },
  [LinkType.ServicePayment]: {
    type: LinkType.ServicePayment,
    label: 'Service Payment',
    description: 'Bill for a service',
    icon: 'B',
    color: '#F39C12',
  },
  [LinkType.Subscription]: {
    type: LinkType.Subscription,
    label: 'Subscription',
    description: 'Recurring payments',
    icon: 'R',
    color: '#1ABC9C',
  },
  [LinkType.FoodOrder]: {
    type: LinkType.FoodOrder,
    label: 'Food Order',
    description: 'Orders with modifiers',
    icon: 'F',
    color: '#E67E22',
  },
  [LinkType.DigitalProduct]: {
    type: LinkType.DigitalProduct,
    label: 'Digital Product',
    description: 'Downloadable items',
    icon: 'D',
    color: '#3498DB',
  },
}

export type AppTab = 'home' | 'links' | 'create' | 'orders' | 'settings'

export interface WizardState {
  step: number
  linkType: LinkType | null
  name: string
  description: string
  amountDollars: string
  eventDate: string
  eventVenue: string
  // Fulfillment
  fulfillmentType?: FulfillmentType
  shippingFee?: string
  pickupInstructions?: string
  digitalUrl?: string
  // Variants & modifiers
  variants?: { id: string; name: string; price: string; stock: string }[]
  modifierGroups?: any[]
  // Inventory
  trackInventory?: boolean
  totalQuantity?: string
  maxPerOrder?: string
  // Buyer data (invoices/services)
  buyerFirstName?: string
  buyerLastName?: string
  buyerEmail?: string
  buyerPhone?: string
  // Cover image
  imageUri?: string
  // Checkout options
  allowTipping: boolean
  askForShipping: boolean
  enableCoupon: boolean
  paymentNote: string
  customFields: string[]
}
