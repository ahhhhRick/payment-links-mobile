import React from 'react'
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme'
import { FulfillmentType } from '../types'

interface FulfillmentPickerProps {
  selected: FulfillmentType
  onSelect: (type: FulfillmentType) => void
  availableTypes: FulfillmentType[]
  shippingFee: string
  onShippingFeeChange: (fee: string) => void
  pickupInstructions: string
  onPickupInstructionsChange: (text: string) => void
  digitalUrl: string
  onDigitalUrlChange: (url: string) => void
}

const TYPE_CONFIG: Record<FulfillmentType, { label: string; icon: string; desc: string }> = {
  [FulfillmentType.Shipment]: { label: 'Ship', icon: 'S', desc: 'Mail to buyer' },
  [FulfillmentType.Pickup]: { label: 'Pickup', icon: 'P', desc: 'Buyer picks up' },
  [FulfillmentType.Digital]: { label: 'Digital', icon: 'D', desc: 'Email or download' },
  [FulfillmentType.Delivery]: { label: 'Deliver', icon: 'V', desc: 'You deliver' },
  [FulfillmentType.Simple]: { label: 'None', icon: 'N', desc: 'No fulfillment' },
}

export function FulfillmentPicker({
  selected, onSelect, availableTypes,
  shippingFee, onShippingFeeChange,
  pickupInstructions, onPickupInstructionsChange,
  digitalUrl, onDigitalUrlChange,
}: FulfillmentPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>How will this be fulfilled?</Text>
      <View style={styles.options}>
        {availableTypes.map((type) => {
          const config = TYPE_CONFIG[type]
          const isActive = selected === type
          return (
            <TouchableOpacity
              key={type}
              style={[styles.option, isActive && styles.optionActive]}
              onPress={() => onSelect(type)}
            >
              <Text style={[styles.optionIcon, isActive && styles.optionIconActive]}>{config.icon}</Text>
              <Text style={[styles.optionLabel, isActive && styles.optionLabelActive]}>{config.label}</Text>
              <Text style={styles.optionDesc}>{config.desc}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {selected === FulfillmentType.Shipment && (
        <View style={styles.extraField}>
          <Text style={styles.extraLabel}>Shipping Fee</Text>
          <View style={styles.feeRow}>
            <Text style={styles.dollar}>$</Text>
            <TextInput
              style={styles.feeInput}
              placeholder="0.00 (free)"
              value={shippingFee}
              onChangeText={onShippingFeeChange}
              keyboardType="decimal-pad"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </View>
      )}

      {selected === FulfillmentType.Pickup && (
        <View style={styles.extraField}>
          <Text style={styles.extraLabel}>Pickup Instructions</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Enter through side door"
            value={pickupInstructions}
            onChangeText={onPickupInstructionsChange}
            placeholderTextColor={colors.textTertiary}
          />
        </View>
      )}

      {selected === FulfillmentType.Digital && (
        <View style={styles.extraField}>
          <Text style={styles.extraLabel}>Download / Access URL</Text>
          <TextInput
            style={styles.textInput}
            placeholder="https://..."
            value={digitalUrl}
            onChangeText={onDigitalUrlChange}
            keyboardType="url"
            autoCapitalize="none"
            placeholderTextColor={colors.textTertiary}
          />
          <Text style={styles.extraHint}>Buyer is redirected here after payment</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textPrimary, marginBottom: spacing.md },
  options: { flexDirection: 'row', gap: spacing.sm },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 4,
  },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  optionIcon: { fontSize: 20, fontWeight: fontWeight.bold, color: colors.textSecondary },
  optionIconActive: { color: colors.primary },
  optionLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  optionLabelActive: { color: colors.primary },
  optionDesc: { fontSize: fontSize.xs, color: colors.textTertiary },
  extraField: { marginTop: spacing.lg },
  extraLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textPrimary, marginBottom: spacing.sm },
  feeRow: { flexDirection: 'row', alignItems: 'center' },
  dollar: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary, marginRight: 4 },
  feeInput: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, fontSize: fontSize.md },
  textInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, fontSize: fontSize.md, color: colors.textPrimary },
  extraHint: { fontSize: fontSize.xs, color: colors.textTertiary, marginTop: spacing.xs },
})
