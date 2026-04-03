import { useState, useCallback } from 'react'
import { LinkType, LinkStatus, type PaymentLink, type WizardState } from '../types'

// Sample data for demo
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

  const addLink = useCallback((link: PaymentLink) => {
    setLinks(prev => [link, ...prev])
  }, [])

  const togglePause = useCallback((id: string) => {
    setLinks(prev => prev.map(l =>
      l.id === id
        ? { ...l, isPaused: !l.isPaused, status: l.isPaused ? LinkStatus.Active : LinkStatus.Paused }
        : l
    ))
  }, [])

  const deleteLink = useCallback((id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id))
  }, [])

  const resetWizard = useCallback(() => {
    setWizard(INITIAL_WIZARD)
  }, [])

  const updateWizard = useCallback((updates: Partial<WizardState>) => {
    setWizard(prev => ({ ...prev, ...updates }))
  }, [])

  const stats = {
    activeLinks: links.filter(l => l.status === LinkStatus.Active).length,
    totalLinks: links.length,
    totalRevenue: links.reduce((sum, l) => sum + l.totalRevenue.amount, 0),
    totalOrders: links.reduce((sum, l) => sum + l.totalOrders, 0),
  }

  return {
    links,
    addLink,
    togglePause,
    deleteLink,
    wizard,
    updateWizard,
    resetWizard,
    stats,
  }
}
