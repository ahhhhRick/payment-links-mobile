import React from 'react'
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

interface CreateScreenProps {
  wizard: WizardState
  updateWizard: (updates: Partial<WizardState>) => void
  resetWizard: () => void
  onLinkCreated: (link: PaymentLink) => void
  onCancel: () => void
}

// Step 0: Type Selector
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
            <View style={[styles.typeCardIcon, { backgroundColor: config.color + '15' }]}>
              <Text style={[styles.typeCardIconText, { color: config.color }]}>{config.icon}</Text>
            </View>
            <View style={styles.typeCardInfo}>
              <Text style={styles.typeCardLabel}>{config.label}</Text>
              <Text style={styles.typeCardDesc}>{config.description}</Text>
            </View>
            <Text style={styles.chevron}>&rsaquo;</Text>
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
      <View style={styles.divider} />
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
  screen: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flex: 1 },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: 56, paddingBottom: spacing.md, backgroundColor: colors.background },
  navCancel: { fontSize: fontSize.md, color: colors.primary, fontWeight: fontWeight.medium },
  navTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  progressBar: { height: 3, backgroundColor: colors.backgroundTertiary },
  progressFill: { height: 3, backgroundColor: colors.primary },
  stepHeader: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.lg },
  stepTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.textPrimary },
  stepSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: 4 },
  stepContent: { flex: 1 },
  typeList: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  typeCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, backgroundColor: colors.backgroundSecondary, borderRadius: radius.lg, gap: spacing.md },
  typeCardIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  typeCardIconText: { fontSize: 18, fontWeight: fontWeight.bold },
  typeCardInfo: { flex: 1 },
  typeCardLabel: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  typeCardDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: 24, color: colors.textTertiary },
  field: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  fieldLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textPrimary, marginBottom: spacing.sm },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, fontSize: fontSize.md, color: colors.textPrimary, backgroundColor: colors.background },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  currencySymbol: { fontSize: fontSize.xl, fontWeight: fontWeight.semibold, color: colors.textPrimary, marginRight: spacing.sm },
  amountInput: { flex: 1, fontSize: fontSize.xl, fontWeight: fontWeight.semibold },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  toggleInfo: { flex: 1, marginRight: spacing.lg },
  toggleLabel: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.textPrimary },
  toggleDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.borderLight, marginHorizontal: spacing.xl },
  reviewCard: { marginHorizontal: spacing.xl, backgroundColor: colors.backgroundSecondary, borderRadius: radius.lg, padding: spacing.lg },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  reviewDivider: { height: 1, backgroundColor: colors.border + '40' },
  reviewLabel: { fontSize: fontSize.sm, color: colors.textSecondary },
  reviewValue: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textPrimary, textAlign: 'right', flex: 1, marginLeft: spacing.lg },
  bottomAction: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.xl, paddingBottom: 36, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.borderLight },
  primaryButton: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.lg, alignItems: 'center' },
  primaryButtonDisabled: { opacity: 0.4 },
  primaryButtonText: { color: colors.textInverse, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
})
