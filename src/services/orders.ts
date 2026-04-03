// Orders Service
// ============================================================================
// Wraps the Square Orders API.
// Fetches orders created from payment links.
// ============================================================================

import { squareApi } from '../api/client'
import type {
  SquareOrder,
  ListOrdersResponse,
} from '../api/types'

export interface AppOrder {
  id: string
  linkName: string
  buyer: string
  amount: string
  status: 'Paid' | 'Shipped' | 'Refunded' | 'Pending'
  date: string
  totalMoney: number
}

function mapOrderStatus(state: SquareOrder['state']): AppOrder['status'] {
  switch (state) {
    case 'COMPLETED': return 'Paid'
    case 'OPEN': return 'Pending'
    case 'CANCELED': return 'Refunded'
    default: return 'Pending'
  }
}

function formatOrderDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0) {
    return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function mapToAppOrder(order: SquareOrder): AppOrder {
  const firstItem = order.line_items?.[0]
  const totalCents = order.total_money?.amount || 0
  const dollars = totalCents / 100

  return {
    id: order.id,
    linkName: firstItem?.name || 'Unknown',
    buyer: 'Customer', // Would need Customers API to get real name
    amount: `$${dollars.toFixed(2)}`,
    status: mapOrderStatus(order.state),
    date: formatOrderDate(order.created_at),
    totalMoney: totalCents,
  }
}

export const ordersService = {
  /**
   * Search orders for a given location.
   * Filters to orders created from payment links (OPEN or COMPLETED).
   */
  async list(locationIds: string[], cursor?: string, limit = 20): Promise<{
    orders: AppOrder[]
    cursor?: string
  }> {
    const response = await squareApi.post<ListOrdersResponse>(
      '/v2/orders/search',
      {
        location_ids: locationIds,
        cursor,
        limit,
        query: {
          sort: {
            sort_field: 'CREATED_AT',
            sort_order: 'DESC',
          },
        },
      }
    )

    const orders = (response.orders || []).map(mapToAppOrder)

    return {
      orders,
      cursor: response.cursor,
    }
  },

  /**
   * Get a single order by ID.
   */
  async get(orderId: string): Promise<AppOrder> {
    const response = await squareApi.get<{ order: SquareOrder }>(
      `/v2/orders/${orderId}`
    )
    return mapToAppOrder(response.order)
  },
}
