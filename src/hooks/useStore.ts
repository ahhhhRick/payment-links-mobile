import { useState, useCallback } from 'react'
import { LinkType, LinkStatus, type PaymentLink, type WizardState } from '../types'
import { paymentLinksService } from '../services/paymentLinks'
import { authStore } from '../services/auth'

// ============================================================================
// Mode: 'mock' uses local sample data, 'live' uses Square API
// Set to 'live' once you've configured Square OAuth credentials
// ============================================================================
const API_MODE: 'mock' | 'live' = 'mock'

// Sample data for demo / offline development
const SAMPLE_LINKS: PaymentLink[] = [
  {
    id: '1',
    name: 'Guitar Lesson',
    linkType: LinkType.SimplePayment,
    status: LinkStatus.Active,
    amount: { amount: 7500, currency: 'USD' },
    url: 'https://square.link/u/abc123',
    description: 'One hour guitar lesson',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    totalOrders: 12,
    totalRevenue: { amount: 90000, currency: 'USD' },
    isPaused: false,
    isOneTime: false,
  },
  {
    id: '2',
    name: 'Summer Jazz Night',
    linkType: LinkType.EventTickets,
    status: LinkStatus.Active,
    amount: { amount: 3500, currency: 'USD' },
    url: 'https://square.link/u/def456',
    description: 'Live jazz at the park',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    totalOrders: 47,
    totalRevenue: { amount: 164500, currency: 'USD' },
    eventDate: '2026-05-15',
    eventVenue: 'Central Park Bandshell',
    isPaused: false,
    isOneTime: false,
  },
  {
    id: '3',
    name: 'Hand-Painted Mug',
    linkType: LinkType.ItemSale,
    status: LinkStatus.Active,
    amount: { amount: 2200, currency: 'USD' },
    url: 'https://square.link/u/ghi789',
    description: 'Artisan ceramic mug, hand-painted',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    totalOrders: 8,
    totalRevenue: { amount: 17600, currency: 'USD' },
    isPaused: false,
    isOneTime: false,
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
  },
  {
    id: '5',
    name: 'Website Redesign - Phase 1',
    linkType: LinkType.ServicePayment,
    status: LinkStatus.Paused,
    amount: { amount: 250000, currency: 'USD' },
    url: 'https://square.link/u/mno345',
    description: 'Invoice for website redesign project',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    totalOrders: 0,
    totalRevenue: { amount: 0, currency: 'USD' },
    isPaused: true,
    isOneTime: true,
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
