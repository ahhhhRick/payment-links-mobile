import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme'
import { LINK_TYPE_CONFIGS, LinkType, type WizardState } from '../types'

interface Template {
  id: string
  name: string
  linkType: LinkType
  description: string
  isPrebuilt: boolean
  config: Partial<WizardState>
}

const PREBUILT_TEMPLATES: Template[] = [
  {
    id: 'tpl-quick', name: 'Quick Payment', linkType: LinkType.SimplePayment,
    description: 'Simple name + amount link', isPrebuilt: true,
    config: { allowTipping: false, askForShipping: false },
  },
  {
    id: 'tpl-product', name: 'Product Sale', linkType: LinkType.ItemSale,
    description: 'Item with shipping and inventory', isPrebuilt: true,
    config: { askForShipping: true, trackInventory: true },
  },
  {
    id: 'tpl-event', name: 'Event Ticket', linkType: LinkType.EventTickets,
    description: 'Tickets with date, venue, and limits', isPrebuilt: true,
    config: { trackInventory: true, customFields: ['Attendee Name'] },
  },
  {
    id: 'tpl-donation', name: 'Fundraiser', linkType: LinkType.Donation,
    description: 'Donation with preset tiers', isPrebuilt: true,
    config: { allowTipping: true, amountDollars: '25' },
  },
  {
    id: 'tpl-service', name: 'Service Invoice', linkType: LinkType.ServicePayment,
    description: 'Bill for a service with payment note', isPrebuilt: true,
    config: { allowTipping: true },
  },
  {
    id: 'tpl-food', name: 'Food Pre-Order', linkType: LinkType.FoodOrder,
    description: 'Food order with pickup and tipping', isPrebuilt: true,
    config: { allowTipping: true, fulfillmentType: 'PICKUP' as any },
  },
  {
    id: 'tpl-digital', name: 'Digital Download', linkType: LinkType.DigitalProduct,
    description: 'Digital product with redirect URL', isPrebuilt: true,
    config: {},
  },
  {
    id: 'tpl-sub', name: 'Monthly Subscription', linkType: LinkType.Subscription,
    description: 'Recurring monthly payment', isPrebuilt: true,
    config: {},
  },
]

interface TemplatesScreenProps {
  savedTemplates: Template[]
  onSelectTemplate: (template: Template) => void
  onClose: () => void
}

function TemplateCard({ template, onSelect }: { template: Template; onSelect: () => void }) {
  const config = LINK_TYPE_CONFIGS[template.linkType]
  return (
    <TouchableOpacity style={styles.card} onPress={onSelect} activeOpacity={0.7}>
      <View style={[styles.cardIcon, { backgroundColor: config.color + '15' }]}>
        <Text style={[styles.cardIconText, { color: config.color }]}>{config.icon}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{template.name}</Text>
        <Text style={styles.cardDesc}>{template.description}</Text>
      </View>
      <Text style={styles.chevron}>&rsaquo;</Text>
    </TouchableOpacity>
  )
}

export function TemplatesScreen({ savedTemplates, onSelectTemplate, onClose }: TemplatesScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.backButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Templates</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {savedTemplates.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Your Templates</Text>
            <View style={styles.sectionList}>
              {savedTemplates.map((tpl) => (
                <TemplateCard key={tpl.id} template={tpl} onSelect={() => onSelectTemplate(tpl)} />
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionLabel}>Quick Start</Text>
        <View style={styles.sectionList}>
          {PREBUILT_TEMPLATES.map((tpl) => (
            <TemplateCard key={tpl.id} template={tpl} onSelect={() => onSelectTemplate(tpl)} />
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingTop: 56, paddingBottom: spacing.md, backgroundColor: colors.background,
  },
  backButton: { fontSize: fontSize.md, color: colors.primary, fontWeight: fontWeight.medium },
  headerTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  content: { paddingBottom: 40 },
  sectionLabel: {
    fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5,
    paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.sm,
  },
  sectionList: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  card: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.lg,
    backgroundColor: colors.background, borderRadius: radius.lg, gap: spacing.md,
  },
  cardIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  cardIconText: { fontSize: 18, fontWeight: fontWeight.bold },
  cardInfo: { flex: 1 },
  cardName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  cardDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: 24, color: colors.textTertiary },
})

export { PREBUILT_TEMPLATES }
export type { Template }
