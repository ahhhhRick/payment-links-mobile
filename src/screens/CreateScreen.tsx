import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch, StyleSheet, Alert } from 'react-native'
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme'
import { LINK_TYPE_CONFIGS, LinkType, LinkStatus, type PaymentLink, type WizardState } from '../types'

interface CreateScreenProps {
  wizard: WizardState
  updateWizard: (updates: Partial<WizardState>) => void
  resetWizard: () => void
  onLinkCreated: (link: PaymentLink) => void
  onCancel: () => void
}

function TypeSelector({ onSelect }: { onSelect: (type: LinkType) => void }) {
  const types = Object.values(LINK_TYPE_CONFIGS)
  return (
    <View style={styles.container}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>What are you selling?</Text>
        <Text style={styles.stepSubtitle}>Choose the type that best fits your needs</Text>
      </View>
      <View style={styles.typeList}>
        {types.map((config) => (
          <TouchableOpacity
            key={config.type}
            style={styles.typeCard}
            onPress={() => onSelect(config.type)}
            activeOpacity={0.7}
          >
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
        <TextInput
          style={styles.input}
          placeholder={isDonation ? 'e.g. Animal Rescue Fund' : 'e.g. Guitar Lesson'}
          value={wizard.name}
          onChangeText={(text) => updateWizard({ name: text })}
          placeholderTextColor={colors.textTertiary}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe what this payment is for"
          value={wizard.description}
          onChangeText={(text) => updateWizard({ description: text })}
          multiline
          numberOfLines={3}
          placeholderTextColor={colors.textTertiary}
        />
      </View>

      {!isDonation && (
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Amount</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={[styles.input, styles.amountInput]}
              placeholder="0.00"
              value={wizard.amountDollars}
              onChangeText={(text) => updateWizard({ amountDollars: text })}
              keyboardType="decimal-pad"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </View>
      )}

      {isDonation && (
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Suggested Amount</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={[styles.input, styles.amountInput]}
              placeholder="25.00"
              value={wizard.amountDollars}
              onChangeText={(text) => updateWizard({ amountDollars: text })}
              keyboardType="decimal-pad"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
          <Text style={styles.fieldHint}>Donors can change this amount at checkout</Text>
        </View>
      )}

      {isEvent && (
        <>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Event Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={wizard.eventDate}
              onChangeText={(text) => updateWizard({ eventDate: text })}
              placeholderTextColor={colors.textTertiary}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Venue</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Central Park Bandshell"
              value={wizard.eventVenue}
              onChangeText={(text) => updateWizard({ eventVenue: text })}
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </>
      )}
    </View>
  )
}

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
        <Switch
          value={wizard.allowTipping}
          onValueChange={(val) => updateWizard({ allowTipping: val })}
          trackColor={{ false: colors.backgroundTertiary, true: colors.primary + '40' }}
          thumbColor={wizard.allowTipping ? colors.primary : colors.textTertiary}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.toggleRow}>
        <View style={styles.toggleInfo}>
          <Text style={styles.toggleLabel}>Collect Shipping Address</Text>
          <Text style={styles.toggleDesc}>Show address form on checkout</Text>
        </View>
        <Switch
          value={wizard.askForShipping}
          onValueChange={(val) => updateWizard({ askForShipping: val })}
          trackColor={{ false: colors.backgroundTertiary, true: colors.primary + '40' }}
          thumbColor={wizard.askForShipping ? colors.primary : colors.textTertiary}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.toggleRow}>
        <View style={styles.toggleInfo}>
          <Text style={styles.toggleLabel}>Enable Coupons</Text>
          <Text style={styles.toggleDesc}>Buyers can enter coupon codes</Text>
        </View>
        <Switch
          value={wizard.enableCoupon}
          onValueChange={(val) => updateWizard({ enableCoupon: val })}
          trackColor={{ false: colors.backgroundTertiary, true: colors.primary + '40' }}
          thumbColor={wizard.enableCoupon ? colors.primary : colors.textTertiary}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Payment Note</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Note included in confirmation email"
          value={wizard.paymentNote}
          onChangeText={(text) => updateWizard({ paymentNote: text })}
          multiline
          numberOfLines={2}
          placeholderTextColor={colors.textTertiary}
        />
      </View>
    </View>
  )
}

function ReviewStep({ wizard }: { wizard: WizardState }) {
  const config = wizard.linkType ? LINK_TYPE_CONFIGS[wizard.linkType] : null
  return (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Review</Text>
        <Text style={styles.stepSubtitle}>Confirm your payment link details</Text>
      </View>

      <View style={styles.reviewCard}>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Type</Text>
          <Text style={styles.reviewValue}>{config?.label}</Text>
        </View>
        <View style={styles.reviewDivider} />
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Name</Text>
          <Text style={styles.reviewValue}>{wizard.name || '(not set)'}</Text>
        </View>
        <View style={styles.reviewDivider} />
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Amount</Text>
          <Text style={styles.reviewValue}>
            {wizard.amountDollars ? `$${wizard.amountDollars}` : 'Variable'}
          </Text>
        </View>
        {wizard.description ? (
          <>
            <View style={styles.reviewDivider} />
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Description</Text>
              <Text style={styles.reviewValue} numberOfLines={2}>{wizard.description}</Text>
            </View>
          </>
        ) : null}
        {wizard.eventDate ? (
          <>
            <View style={styles.reviewDivider} />
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Event Date</Text>
              <Text style={styles.reviewValue}>{wizard.eventDate}</Text>
            </View>
          </>
        ) : null}
        {wizard.eventVenue ? (
          <>
            <View style={styles.reviewDivider} />
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Venue</Text>
              <Text style={styles.reviewValue}>{wizard.eventVenue}</Text>
            </View>
          </>
        ) : null}
        <View style={styles.reviewDivider} />
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Tipping</Text>
          <Text style={styles.reviewValue}>{wizard.allowTipping ? 'Enabled' : 'Disabled'}</Text>
        </View>
        <View style={styles.reviewDivider} />
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Shipping</Text>
          <Text style={styles.reviewValue}>{wizard.askForShipping ? 'Collect address' : 'No'}</Text>
        </View>
      </View>
    </View>
  )
}

const STEP_COUNT = 3 // Details, Options, Review

export function CreateScreen({ wizard, updateWizard, resetWizard, onLinkCreated, onCancel }: CreateScreenProps) {
  // Step 0 = type selection (not counted in progress)
  if (!wizard.linkType) {
    return (
      <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={onCancel}>
            <Text style={styles.navCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>New Link</Text>
          <View style={{ width: 60 }} />
        </View>
        <TypeSelector onSelect={(type) => updateWizard({ linkType: type, step: 1 })} />
      </ScrollView>
    )
  }

  const handleNext = () => {
    if (wizard.step < STEP_COUNT) {
      updateWizard({ step: wizard.step + 1 })
    }
  }

  const handleBack = () => {
    if (wizard.step <= 1) {
      updateWizard({ linkType: null, step: 0 })
    } else {
      updateWizard({ step: wizard.step - 1 })
    }
  }

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

  const isLastStep = wizard.step === STEP_COUNT
  const canProceed = wizard.step === 1 ? wizard.name.trim().length > 0 : true

  return (
    <View style={styles.screen}>
      {/* Nav */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.navCancel}>{wizard.step <= 1 ? 'Back' : 'Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>
          Step {wizard.step} of {STEP_COUNT}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(wizard.step / STEP_COUNT) * 100}%` }]} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {wizard.step === 1 && <DetailsStep wizard={wizard} updateWizard={updateWizard} />}
        {wizard.step === 2 && <OptionsStep wizard={wizard} updateWizard={updateWizard} />}
        {wizard.step === 3 && <ReviewStep wizard={wizard} />}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={[styles.primaryButton, !canProceed && styles.primaryButtonDisabled]}
          onPress={isLastStep ? handleCreate : handleNext}
          disabled={!canProceed}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            {isLastStep ? 'Create Link' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  scrollContent: { flex: 1 },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  navCancel: { fontSize: fontSize.md, color: colors.primary, fontWeight: fontWeight.medium },
  navTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  progressBar: {
    height: 3,
    backgroundColor: colors.backgroundTertiary,
  },
  progressFill: {
    height: 3,
    backgroundColor: colors.primary,
  },
  stepHeader: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  stepTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.textPrimary },
  stepSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: 4 },
  stepContent: { flex: 1 },
  typeList: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.lg,
    gap: spacing.md,
  },
  typeCardIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeCardIconText: { fontSize: 18, fontWeight: fontWeight.bold },
  typeCardInfo: { flex: 1 },
  typeCardLabel: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  typeCardDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: 24, color: colors.textTertiary },
  field: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  fieldLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textPrimary, marginBottom: spacing.sm },
  fieldHint: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  currencySymbol: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  amountInput: { flex: 1, fontSize: fontSize.xl, fontWeight: fontWeight.semibold },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  toggleInfo: { flex: 1, marginRight: spacing.lg },
  toggleLabel: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.textPrimary },
  toggleDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.borderLight, marginHorizontal: spacing.xl },
  reviewCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  reviewDivider: { height: 1, backgroundColor: colors.border + '40' },
  reviewLabel: { fontSize: fontSize.sm, color: colors.textSecondary },
  reviewValue: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textPrimary, textAlign: 'right', flex: 1, marginLeft: spacing.lg },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    paddingBottom: 36,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  primaryButtonDisabled: { opacity: 0.4 },
  primaryButtonText: { color: colors.textInverse, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
})
