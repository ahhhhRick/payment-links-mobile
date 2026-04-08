import { useState, useCallback } from 'react'
import { Image } from 'react-native'
import { LinkType, LinkStatus, type PaymentLink, type WizardState } from '../types'
import { paymentLinksService } from '../services/paymentLinks'
import { authStore } from '../services/auth'

const img = {
  simplePayment:   Image.resolveAssetSource(require('../../assets/Simple_Payment.jpg')).uri,
  itemSale:        Image.resolveAssetSource(require('../../assets/Phisical Product.jpg')).uri,
  event:           Image.resolveAssetSource(require('../../assets/Event.jpg')).uri,
  donation:        Image.resolveAssetSource(require('../../assets/Donation.jpg')).uri,
  servicePayment:  Image.resolveAssetSource(require('../../assets/Service Payment.jpg')).uri,
  subscription:    Image.resolveAssetSource(require('../../assets/Subscription.jpg')).uri,
  foodOrder:       Image.resolveAssetSource(require('../../assets/Food Order.jpg')).uri,
  digitalProduct:  Image.resolveAssetSource(require('../../assets/Digital Product.jpg')).uri,
}

// ============================================================================
// Mode: 'mock' uses local sample data, 'live' uses Square API
// Set to 'live' once you've configured Square OAuth credentials
// ============================================================================
const API_MODE: 'mock' | 'live' = 'mock'

// Sample data for demo / offline development
const SAMPLE_LINKS: PaymentLink[] = [
  {
    id: '1',
    name: 'Birthday Funds',
    linkType: LinkType.SimplePayment,
    status: LinkStatus.Active,
    amount: { amount: 1000, currency: 'USD' },
    url: 'https://square.link/u/abc123',
    description: "Hey guys, it's Jack's birthday. Doing a rally round to give him some money for his trip.",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    totalOrders: 12,
    totalRevenue: { amount: 90000, currency: 'USD' },
    isPaused: false,
    isOneTime: false,
    imageUri: img.simplePayment,
  },
  {
    id: '2',
    name: 'MK.GEE Summer Nights, Brooklyn',
    linkType: LinkType.EventTickets,
    status: LinkStatus.Active,
    amount: { amount: 3499, currency: 'USD' },
    url: 'https://square.link/u/def456',
    description: 'Performing live in New York City.',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    totalOrders: 47,
    totalRevenue: { amount: 164453, currency: 'USD' },
    eventDate: '2026-05-15',
    eventVenue: 'Brooklyn, New York',
    isPaused: false,
    isOneTime: false,
    imageUri: img.event,
  },
  {
    id: '3',
    name: 'Sambas',
    linkType: LinkType.ItemSale,
    status: LinkStatus.Active,
    amount: { amount: 5999, currency: 'USD' },
    url: 'https://square.link/u/ghi789',
    description: "Men's size 9 Sambas, like new.",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    totalOrders: 8,
    totalRevenue: { amount: 17600, currency: 'USD' },
    isPaused: false,
    isOneTime: false,
    imageUri: img.itemSale,
  },
  {
    id: '4',
    name: 'Animal Rescue Fund',
    linkType: LinkType.Donation,
    status: LinkStatus.Active,
    amount: null,
    url: 'https://square.link/u/jkl012',
    description: 'Help us save animals in need',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    totalOrders: 156,
    totalRevenue: { amount: 782500, currency: 'USD' },
    isPaused: false,
    isOneTime: false,
    imageUri: img.donation,
  },
  {
    id: '5',
    name: "Jeff's Gardening Services",
    linkType: LinkType.ServicePayment,
    status: LinkStatus.Active,
    amount: { amount: 250000, currency: 'USD' },
    url: 'https://square.link/u/mno345',
    description: 'Monthly retainer for gardening services.',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    totalOrders: 0,
    totalRevenue: { amount: 0, currency: 'USD' },
    isPaused: true,
    isOneTime: true,
    imageUri: img.servicePayment,
  },
  {
    id: '6',
    name: 'Farmborough Farms Egg Subscription',
    linkType: LinkType.Subscription,
    status: LinkStatus.Active,
    amount: { amount: 1600, currency: 'USD' },
    url: 'https://square.link/u/pqr678',
    description: '24 eggs delivered monthly, first of the month.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    totalOrders: 24,
    totalRevenue: { amount: 237600, currency: 'USD' },
    isPaused: false,
    isOneTime: false,
    imageUri: img.subscription,
  },
  {
    id: '7',
    name: 'Lunch Special',
    linkType: LinkType.FoodOrder,
    status: LinkStatus.Active,
    amount: { amount: 1450, currency: 'USD' },
    url: 'https://square.link/u/stu901',
    description: 'Daily lunch special with drink',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    totalOrders: 83,
    totalRevenue: { amount: 120350, currency: 'USD' },
    isPaused: false,
    isOneTime: false,
    imageUri: img.foodOrder,
  },
  {
    id: '8',
    name: 'Lightroom Preset Pack',
    linkType: LinkType.DigitalProduct,
    status: LinkStatus.Active,
    amount: { amount: 1900, currency: 'USD' },
    url: 'https://square.link/u/vwx234',
    description: '50 professional Lightroom presets',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    totalOrders: 341,
    totalRevenue: { amount: 647900, currency: 'USD' },
    isPaused: false,
    isOneTime: false,
    imageUri: img.digitalProduct,
  },
]

const INITIAL_WIZARD: WizardState = {
  step: 0,
  linkType: null,
  name: '',
  description: '',
  amountDollars: '',
  eventDate: '',
  eventVenue: '',
  allowTipping: false,
  askForShipping: false,
  enableCoupon: false,
  paymentNote: '',
  customFields: [],
}

export function useStore() {
  const [links, setLinks] = useState<PaymentLink[]>(SAMPLE_LINKS)
  const [wizard, setWizard] = useState<WizardState>(INITIAL_WIZARD)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // ---- Auth ----

  const checkAuth = useCallback(async () => {
    if (API_MODE === 'mock') {
      setIsAuthenticated(true)
      return true
    }
    const authed = await authStore.isAuthenticated()
    setIsAuthenticated(authed)
    return authed
  }, [])

  const logout = useCallback(async () => {
    await authStore.clearTokens()
    setIsAuthenticated(false)
    setLinks([])
  }, [])

  // ---- Links ----

  const fetchLinks = useCallback(async () => {
    if (API_MODE === 'mock') return

    setIsLoading(true)
    setError(null)
    try {
      const result = await paymentLinksService.list()
      setLinks(result.links)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch links')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addLink = useCallback(async (link: PaymentLink) => {
    if (API_MODE === 'live') {
      // In live mode, the link was already created via the API
      // Just add it to local state
    }
    setLinks(prev => [link, ...prev])
  }, [])

  const createLinkFromWizard = useCallback(async (locationId?: string): Promise<PaymentLink | null> => {
    if (API_MODE === 'mock') {
      // Mock creation
      const amountCents = wizard.amountDollars ? Math.round(parseFloat(wizard.amountDollars) * 100) : 0
      const newLink: PaymentLink = {
        id: Date.now().toString(),
        name: wizard.name || 'Untitled Link',
        linkType: wizard.linkType!,
        status: LinkStatus.Active,
        amount: amountCents > 0 ? { amount: amountCents, currency: 'USD' } : null,
        url: `https://square.link/u/${Math.random().toString(36).slice(2, 8)}`,
        description: wizard.description,
        createdAt: new Date().toISOString(),
        totalOrders: 0,
        totalRevenue: { amount: 0, currency: 'USD' },
        eventDate: wizard.eventDate || undefined,
        eventVenue: wizard.eventVenue || undefined,
        imageUri: wizard.imageUri || undefined,
        isPaused: false,
        isOneTime: false,
      }
      setLinks(prev => [newLink, ...prev])
      return newLink
    }

    // Live API creation
    setIsLoading(true)
    setError(null)
    try {
      const newLink = await paymentLinksService.create(wizard, locationId || 'main')
      // Enrich with wizard data that the API doesn't store
      const enrichedLink: PaymentLink = {
        ...newLink,
        name: wizard.name || newLink.name,
        linkType: wizard.linkType!,
        eventDate: wizard.eventDate || undefined,
        eventVenue: wizard.eventVenue || undefined,
      }
      setLinks(prev => [enrichedLink, ...prev])
      return enrichedLink
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create link')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [wizard])

  const togglePause = useCallback((id: string) => {
    setLinks(prev => prev.map(l =>
      l.id === id
        ? { ...l, isPaused: !l.isPaused, status: l.isPaused ? LinkStatus.Active : LinkStatus.Paused }
        : l
    ))
  }, [])

  const deleteLink = useCallback(async (id: string) => {
    if (API_MODE === 'live') {
      try {
        await paymentLinksService.delete(id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete link')
        return
      }
    }
    setLinks(prev => prev.filter(l => l.id !== id))
  }, [])

  // ---- Wizard ----

  const resetWizard = useCallback(() => {
    setWizard(INITIAL_WIZARD)
  }, [])

  const updateWizard = useCallback((updates: Partial<WizardState>) => {
    setWizard(prev => ({ ...prev, ...updates }))
  }, [])

  // ---- Stats ----

  const stats = {
    activeLinks: links.filter(l => l.status === LinkStatus.Active).length,
    totalLinks: links.length,
    totalRevenue: links.reduce((sum, l) => sum + l.totalRevenue.amount, 0),
    totalOrders: links.reduce((sum, l) => sum + l.totalOrders, 0),
  }

  return {
    // Auth
    isAuthenticated,
    checkAuth,
    logout,
    // Links
    links,
    isLoading,
    error,
    fetchLinks,
    addLink,
    createLinkFromWizard,
    togglePause,
    deleteLink,
    // Wizard
    wizard,
    updateWizard,
    resetWizard,
    // Stats
    stats,
    // Config
    apiMode: API_MODE,
  }
}
