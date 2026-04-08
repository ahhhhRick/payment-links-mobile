import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch, StyleSheet, Alert } from 'react-native'
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme'
import { LINK_TYPE_CONFIGS, LinkType, LinkStatus, FulfillmentType, type PaymentLink, type WizardState } from '../types'
import { DonationTiers } from '../components/DonationTiers'
import { CustomFieldsBuilder } from '../components/CustomFieldsBuilder'
import { FulfillmentPicker } from '../components/FulfillmentPicker'
import { VariantBuilder } from '../components/VariantBuilder'
import { ModifierBuilder } from '../components/ModifierBuilder'
import { InventoryFields } from '../components/InventoryFields'
import { BuyerDataFields } from '../components/BuyerDataFields'
import { ImagePickerField } from '../components/ImagePickerField'

interface CreateScreenProps {
  wizard: WizardState
  updateWizard: (updates: Partial<WizardState>) => void
  resetWizard: () => void
  onLinkCreated: (link: PaymentLink) => void
  onCancel: () => void
}

// Step 0: Type Selector
const TYPE_BENEFITS: Record<string, string> = {
  simple:        'Fast, one-tap checkout — ideal for lessons, sessions, or quick sales',
  item_sale:     'Sell physical goods with shipping or local pickup built in',
  event_tickets: 'Gate-keep access with ticket limits and automatic sold-out handling',
  donation:      'Let supporters choose their own amount — no friction, no minimum',
  service:       'Send a professional invoice your client pays in seconds',
  subscription:  'Lock in recurring revenue with automatic weekly or monthly billing',
  food_order:    'Take customisable orders with modifiers, combos, and pickup times',
  digital:       'Deliver files or access links instantly after payment — zero fulfilment',
}

function TypeSelector({ onSelect }: { onSelect: (type: LinkType) => void }) {
  const types = Object.values(LINK_TYPE_CONFIGS)

  return (
    <View>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>What are you selling?</Text>
        <Text style={styles.stepSubtitle}>Choose the type that best fits</Text>
      </View>
      <View style={styles.typeList}>
        {types.map((config) => (
          <TouchableOpacity key={config.type} style={styles.typeCard} onPress={() => onSelect(config.type)} activeOpacity={0.7}>
            <View style={styles.typeCardInfo}>
              <Text style={styles.typeCardLabel}>{config.label}</Text>
              <Text style={styles.typeCardDesc} numberOfLines={1}>{TYPE_BENEFITS[config.type] ?? config.description}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

// Step 1: Details
function DetailsStep({ wizard, updateWizard }: { wizard: WizardState; updateWizard: (u: Partial<WizardState>) => void }) {
  const config = wizard.linkType ? LINK_TYPE_CONFIGS[wizard.linkType] : null
  const isEvent = wizard.linkType === LinkType.EventTickets
  const isDonation = wizard.linkType === LinkType.Donation

  return (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>{config?.label} Details</Text>
        <Text style={styles.stepSubtitle}>Fill in the basics</Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Name</Text>
        <TextInput style={styles.input} placeholder={isDonation ? 'e.g. Animal Rescue Fund' : 'e.g. Guitar Lesson'} value={wizard.name} onChangeText={(t) => updateWizard({ name: t })} placeholderTextColor={colors.textTertiary} />
      </View>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Description</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Describe what this payment is for" value={wizard.description} onChangeText={(t) => updateWizard({ description: t })} multiline numberOfLines={3} placeholderTextColor={colors.textTertiary} />
      </View>
      <ImagePickerField
        uri={wizard.imageUri}
        onChange={(uri) => updateWizard({ imageUri: uri })}
      />
      {isDonation ? (
        <DonationTiers selectedAmount={wizard.amountDollars} onAmountChange={(amt) => updateWizard({ amountDollars: amt })} />
      ) : (
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Amount</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput style={[styles.input, styles.amountInput]} placeholder="0.00" value={wizard.amountDollars} onChangeText={(t) => updateWizard({ amountDollars: t })} keyboardType="decimal-pad" placeholderTextColor={colors.textTertiary} />
          </View>
        </View>
      )}
      {isEvent && (
        <>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Event Date</Text>
            <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={wizard.eventDate} onChangeText={(t) => updateWizard({ eventDate: t })} placeholderTextColor={colors.textTertiary} />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Venue</Text>
            <TextInput style={styles.input} placeholder="e.g. Central Park Bandshell" value={wizard.eventVenue} onChangeText={(t) => updateWizard({ eventVenue: t })} placeholderTextColor={colors.textTertiary} />
          </View>
        </>
      )}
      {/* Variants — for items, events, food */}
      {(wizard.linkType === LinkType.ItemSale || wizard.linkType === LinkType.EventTickets) && (
        <VariantBuilder
          variants={wizard.variants || []}
          onVariantsChange={(v) => updateWizard({ variants: v })}
          label={wizard.linkType === LinkType.EventTickets ? 'Ticket Tiers' : 'Variants'}
          namePlaceholder={wizard.linkType === LinkType.EventTickets ? 'e.g. VIP' : 'e.g. Large'}
        />
      )}
      {wizard.linkType === LinkType.FoodOrder && (
        <ModifierBuilder
          groups={wizard.modifierGroups || []}
          onGroupsChange={(g) => updateWizard({ modifierGroups: g })}
        />
      )}
      {/* Inventory — for items, events, digital, food */}
      {(wizard.linkType === LinkType.ItemSale || wizard.linkType === LinkType.EventTickets || wizard.linkType === LinkType.DigitalProduct || wizard.linkType === LinkType.FoodOrder) && (
        <InventoryFields
          trackInventory={wizard.trackInventory || false}
          totalQuantity={wizard.totalQuantity || ''}
          maxPerOrder={wizard.maxPerOrder || ''}
          onTrackChange={(v) => updateWizard({ trackInventory: v })}
          onQuantityChange={(v) => updateWizard({ totalQuantity: v })}
          onMaxPerOrderChange={(v) => updateWizard({ maxPerOrder: v })}
        />
      )}
      {/* Buyer data — for invoices and services */}
      {(wizard.linkType === LinkType.Invoice || wizard.linkType === LinkType.ServicePayment) && (
        <BuyerDataFields
          firstName={wizard.buyerFirstName || ''}
          lastName={wizard.buyerLastName || ''}
          email={wizard.buyerEmail || ''}
          phone={wizard.buyerPhone || ''}
          onUpdate={(field, value) => updateWizard({ [field]: value })}
        />
      )}
    </View>
  )
}

// Step 2: Fulfillment
function FulfillmentStep({ wizard, updateWizard }: { wizard: WizardState; updateWizard: (u: Partial<WizardState>) => void }) {
  const config = wizard.linkType ? LINK_TYPE_CONFIGS[wizard.linkType] : null
  const availableTypes = getAvailableFulfillments(wizard.linkType!)
  const selected = wizard.fulfillmentType || availableTypes[0] || FulfillmentType.Simple

  return (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Fulfillment</Text>
        <Text style={styles.stepSubtitle}>How will the buyer receive this?</Text>
      </View>
      <FulfillmentPicker
        selected={selected}
        onSelect={(type) => updateWizard({ fulfillmentType: type })}
        availableTypes={availableTypes}
        shippingFee={wizard.shippingFee || ''}
        onShippingFeeChange={(fee) => updateWizard({ shippingFee: fee })}
        pickupInstructions={wizard.pickupInstructions || ''}
        onPickupInstructionsChange={(text) => updateWizard({ pickupInstructions: text })}
        digitalUrl={wizard.digitalUrl || ''}
        onDigitalUrlChange={(url) => updateWizard({ digitalUrl: url })}
      />
    </View>
  )
}

function getAvailableFulfillments(linkType: LinkType): FulfillmentType[] {
  switch (linkType) {
    case LinkType.ItemSale: return [FulfillmentType.Shipment, FulfillmentType.Pickup]
    case LinkType.EventTickets: return [FulfillmentType.Digital]
    case LinkType.FoodOrder: return [FulfillmentType.Pickup, FulfillmentType.Delivery]
    case LinkType.DigitalProduct: return [FulfillmentType.Digital]
    case LinkType.Subscription: return [FulfillmentType.Shipment, FulfillmentType.Digital, FulfillmentType.Simple]
    default: return [FulfillmentType.Simple]
  }
}

// Step 3: Checkout Options
function OptionsStep({ wizard, updateWizard }: { wizard: WizardState; updateWizard: (u: Partial<WizardState>) => void }) {
  return (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Checkout Options</Text>
        <Text style={styles.stepSubtitle}>Configure the buyer experience</Text>
      </View>
      <View style={styles.toggleCard}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Allow Tipping</Text>
            <Text style={styles.toggleDesc}>Buyers can add a tip at checkout</Text>
          </View>
          <Switch value={wizard.allowTipping} onValueChange={(v) => updateWizard({ allowTipping: v })} trackColor={{ false: colors.backgroundTertiary, true: colors.primary + '40' }} thumbColor={wizard.allowTipping ? colors.primary : colors.textTertiary} />
        </View>
        <View style={styles.divider} />
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Collect Shipping Address</Text>
            <Text style={styles.toggleDesc}>Show address form on checkout</Text>
          </View>
          <Switch value={wizard.askForShipping} onValueChange={(v) => updateWizard({ askForShipping: v })} trackColor={{ false: colors.backgroundTertiary, true: colors.primary + '40' }} thumbColor={wizard.askForShipping ? colors.primary : colors.textTertiary} />
        </View>
        <View style={styles.divider} />
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Enable Coupons</Text>
            <Text style={styles.toggleDesc}>Buyers can enter coupon codes</Text>
          </View>
          <Switch value={wizard.enableCoupon} onValueChange={(v) => updateWizard({ enableCoupon: v })} trackColor={{ false: colors.backgroundTertiary, true: colors.primary + '40' }} thumbColor={wizard.enableCoupon ? colors.primary : colors.textTertiary} />
        </View>
      </View>
      <CustomFieldsBuilder fields={wizard.customFields} onFieldsChange={(fields) => updateWizard({ customFields: fields })} />
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Payment Note</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Note included in confirmation email" value={wizard.paymentNote} onChangeText={(t) => updateWizard({ paymentNote: t })} multiline numberOfLines={2} placeholderTextColor={colors.textTertiary} />
      </View>
    </View>
  )
}

// Step 4: Review
function ReviewStep({ wizard }: { wizard: WizardState }) {
  const config = wizard.linkType ? LINK_TYPE_CONFIGS[wizard.linkType] : null
  const rows: { label: string; value: string }[] = [
    { label: 'Type', value: config?.label || '' },
    { label: 'Name', value: wizard.name || '(not set)' },
    { label: 'Amount', value: wizard.amountDollars ? `$${wizard.amountDollars}` : 'Variable' },
  ]
  if (wizard.description) rows.push({ label: 'Description', value: wizard.description })
  if (wizard.eventDate) rows.push({ label: 'Event Date', value: wizard.eventDate })
  if (wizard.eventVenue) rows.push({ label: 'Venue', value: wizard.eventVenue })
  if (wizard.fulfillmentType) rows.push({ label: 'Fulfillment', value: wizard.fulfillmentType })
  rows.push({ label: 'Tipping', value: wizard.allowTipping ? 'Enabled' : 'Disabled' })
  rows.push({ label: 'Shipping', value: wizard.askForShipping ? 'Collect address' : 'No' })
  if (wizard.customFields.length > 0) rows.push({ label: 'Custom Fields', value: wizard.customFields.filter(Boolean).join(', ') })
  if (wizard.variants && wizard.variants.length > 0) rows.push({ label: 'Variants', value: wizard.variants.map(v => v.name || '(unnamed)').join(', ') })
  if (wizard.modifierGroups && wizard.modifierGroups.length > 0) rows.push({ label: 'Modifier Groups', value: `${wizard.modifierGroups.length} groups` })
  if (wizard.trackInventory) rows.push({ label: 'Inventory', value: wizard.totalQuantity ? `${wizard.totalQuantity} available` : 'Tracked' })
  if (wizard.maxPerOrder) rows.push({ label: 'Max Per Order', value: wizard.maxPerOrder })
  if (wizard.buyerEmail) rows.push({ label: 'Buyer Email', value: wizard.buyerEmail })

  return (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Review</Text>
        <Text style={styles.stepSubtitle}>Confirm your payment link details</Text>
      </View>
      <View style={styles.reviewCard}>
        {rows.map((row, i) => (
          <React.Fragment key={row.label}>
            {i > 0 && <View style={styles.reviewDivider} />}
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>{row.label}</Text>
              <Text style={styles.reviewValue} numberOfLines={2}>{row.value}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>
    </View>
  )
}

// Determine if fulfillment step should be shown
function needsFulfillmentStep(linkType: LinkType): boolean {
  return [LinkType.ItemSale, LinkType.EventTickets, LinkType.FoodOrder, LinkType.DigitalProduct, LinkType.Subscription].includes(linkType)
}

const TOTAL_STEPS = 4 // Details, Fulfillment, Options, Review

export function CreateScreen({ wizard, updateWizard, resetWizard, onLinkCreated, onCancel }: CreateScreenProps) {
  if (!wizard.linkType) {
    return (
      <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={onCancel}><Text style={styles.navCancel}>Cancel</Text></TouchableOpacity>
          <Text style={styles.navTitle}>New Link</Text>
          <View style={{ width: 60 }} />
        </View>
        <TypeSelector onSelect={(type) => updateWizard({ linkType: type, step: 1 })} />
      </ScrollView>
    )
  }

  const hasFulfillment = needsFulfillmentStep(wizard.linkType)
  const stepCount = hasFulfillment ? TOTAL_STEPS : TOTAL_STEPS - 1
  const isLastStep = wizard.step === stepCount
  const canProceed = wizard.step === 1 ? wizard.name.trim().length > 0 : true

  const getStepContent = () => {
    if (hasFulfillment) {
      switch (wizard.step) {
        case 1: return <DetailsStep wizard={wizard} updateWizard={updateWizard} />
        case 2: return <FulfillmentStep wizard={wizard} updateWizard={updateWizard} />
        case 3: return <OptionsStep wizard={wizard} updateWizard={updateWizard} />
        case 4: return <ReviewStep wizard={wizard} />
      }
    } else {
      switch (wizard.step) {
        case 1: return <DetailsStep wizard={wizard} updateWizard={updateWizard} />
        case 2: return <OptionsStep wizard={wizard} updateWizard={updateWizard} />
        case 3: return <ReviewStep wizard={wizard} />
      }
    }
    return null
  }

  const handleBack = () => {
    if (wizard.step <= 1) updateWizard({ linkType: null, step: 0 })
    else updateWizard({ step: wizard.step - 1 })
  }

  const handleNext = () => updateWizard({ step: wizard.step + 1 })

  const handleCreate = () => {
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
    onLinkCreated(newLink)
    resetWizard()
    Alert.alert('Link Created', `Your "${newLink.name}" payment link is ready to share.`)
  }

  return (
    <View style={styles.screen}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={handleBack}><Text style={styles.navCancel}>Back</Text></TouchableOpacity>
        <Text style={styles.navTitle}>Step {wizard.step} of {stepCount}</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(wizard.step / stepCount) * 100}%` }]} />
      </View>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {getStepContent()}
        <View style={{ height: 120 }} />
      </ScrollView>
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={[styles.primaryButton, !canProceed && styles.primaryButtonDisabled]}
          onPress={isLastStep ? handleCreate : handleNext}
          disabled={!canProceed}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>{isLastStep ? 'Create Link' : 'Continue'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F7F7' },
  scrollContent: { flex: 1 },

  // ── Nav bar ────────────────────────────────────────────────────────────────
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.md,
    backgroundColor: '#F7F7F7',
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  navCancel: { fontSize: fontSize.lg, color: colors.brand, fontWeight: fontWeight.medium },
  navTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary },

  // ── Progress bar (Arcade: brand green fill) ────────────────────────────────
  progressBar: { height: 2, backgroundColor: colors.surfaceDefault },
  progressFill: { height: 2, backgroundColor: colors.brand },

  // ── Step header ────────────────────────────────────────────────────────────
  stepHeader: { paddingHorizontal: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.lg },
  stepTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.textPrimary, letterSpacing: -0.3 },
  stepSubtitle: { fontSize: fontSize.lg, color: colors.textSecondary, marginTop: 4 },
  stepContent: { flex: 1 },

  // ── Type selector ─────────────────────────────────────────────────────────
  typeList: { gap: spacing.sm, paddingHorizontal: spacing.lg },
  typeCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.lg,
    backgroundColor: colors.background, gap: spacing.lg,
    minHeight: 72,
    borderRadius: radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  typeCardIcon: { width: 48, height: 48, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  typeCardIconText: { fontSize: 20, fontWeight: fontWeight.bold },
  typeCardInfo: { flex: 1 },
  typeCardLabel: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  typeCardDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: 22, color: colors.textTertiary },

  // ── Form fields ────────────────────────────────────────────────────────────
  field: {
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  fieldLabel: {
    fontSize: fontSize.sm, fontWeight: fontWeight.medium,
    color: colors.textSecondary, marginBottom: spacing.xs,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  input: {
    fontSize: fontSize.lg, color: colors.textPrimary,
    paddingVertical: spacing.sm,
    backgroundColor: 'transparent',
  },
  textArea: { minHeight: 72, textAlignVertical: 'top' },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  currencySymbol: { fontSize: fontSize.xl, fontWeight: fontWeight.semibold, color: colors.textPrimary, marginRight: spacing.sm },
  amountInput: { flex: 1, fontSize: fontSize.xl, fontWeight: fontWeight.semibold },

  // ── Options (toggles) ─────────────────────────────────────────────────────
  toggleCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.lg,
    minHeight: 64,
  },
  toggleInfo: { flex: 1, marginRight: spacing.lg },
  toggleLabel: { fontSize: fontSize.lg, fontWeight: fontWeight.medium, color: colors.textPrimary },
  toggleDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.borderLight },

  // ── Review card ────────────────────────────────────────────────────────────
  reviewCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surfaceDefault,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  reviewDivider: { height: 1, backgroundColor: colors.borderLight },
  reviewLabel: { fontSize: fontSize.md, color: colors.textSecondary },
  reviewValue: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.textPrimary, textAlign: 'right', flex: 1, marginLeft: spacing.lg },

  // ── Bottom action (Arcade button-cta prominent) ───────────────────────────
  bottomAction: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 36,
    backgroundColor: colors.background,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: { opacity: 0.35 },
  primaryButtonText: { color: colors.primaryText, fontSize: fontSize.lg, fontWeight: fontWeight.semibold },

  // ── Variant picker strip ───────────────────────────────────────────────────
  variantStrip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  variantPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F0F0F0',
  },
  variantPillActive: {
    backgroundColor: '#000000',
  },
  variantPillText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#1A1A1A',
  },
  variantPillTextActive: {
    color: '#FFFFFF',
  },

  // ── Variant 2: 2-col Grid ──────────────────────────────────────────────────
  v2Grid: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  v2Row: { flexDirection: 'row', gap: spacing.sm },
  v2Card: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    overflow: 'hidden',
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  v2CardEmpty: { flex: 1 },
  v2Accent: { position: 'absolute', top: 0, left: 0, right: 0, height: 6 },
  v2Label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary, textAlign: 'center', paddingHorizontal: spacing.sm },

  // ── Variant 3: Color Blocks ────────────────────────────────────────────────
  v3Card: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.sm,
  },
  v3Label: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: '#FFFFFF' },
  v3Desc: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.85)', marginTop: 4 },

  // ── Variant 4: Minimal Rows ────────────────────────────────────────────────
  v4Container: { marginHorizontal: spacing.lg },
  v4Row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  v4Label: { fontSize: fontSize.lg, color: colors.textPrimary, fontWeight: fontWeight.medium },
  v4Divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderLight },

  // ── Variant 5: Icon Chips ──────────────────────────────────────────────────
  v5Wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  v5Chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    backgroundColor: colors.background,
  },
  v5Icon: { fontSize: 16 },
  v5ChipLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary },

  // ── Variant 6: Large Feature Cards ────────────────────────────────────────
  v6Card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    minHeight: 120,
    borderLeftWidth: 4,
    gap: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  v6Icon: { fontSize: 36 },

  // ── Variant 7: Compact 3-col Grid ─────────────────────────────────────────
  v7Grid: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  v7Row: { flexDirection: 'row', gap: spacing.sm },
  v7Tile: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    minHeight: 72,
  },
  v7TileEmpty: { flex: 1 },
  v7TileIcon: { fontSize: 24 },
  v7TileLabel: { fontSize: 10, fontWeight: fontWeight.semibold, color: colors.textPrimary, textAlign: 'center', paddingHorizontal: 4 },

  // ── Variant 8: Magazine ────────────────────────────────────────────────────
  v8Container: { gap: spacing.sm },
  v8Hero: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    height: 140,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    justifyContent: 'flex-end',
  },
  v8HeroLabel: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: '#FFFFFF' },
  v8HeroDesc: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.85)', marginTop: 4 },

  // ── Variant 9: Horizontal Scroll Cards ────────────────────────────────────
  v9Strip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  v9Card: {
    width: 160,
    height: 120,
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    padding: spacing.md,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  v9Icon: { fontSize: 24 },
  v9Label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  v9Desc: { fontSize: 11, color: colors.textSecondary, lineHeight: 15 },

  // ── Variant 10: Numbered List ──────────────────────────────────────────────
  v10Card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  v10Number: { fontSize: 28, fontWeight: fontWeight.bold, minWidth: 44 },
})
