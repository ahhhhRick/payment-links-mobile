import React from 'react'
import { View, Text, TextInput, Switch, StyleSheet } from 'react-native'
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme'

interface InventoryFieldsProps {
  trackInventory: boolean
  totalQuantity: string
  maxPerOrder: string
  onTrackChange: (track: boolean) => void
  onQuantityChange: (qty: string) => void
  onMaxPerOrderChange: (max: string) => void
}

export function InventoryFields({
  trackInventory, totalQuantity, maxPerOrder,
  onTrackChange, onQuantityChange, onMaxPerOrderChange,
}: InventoryFieldsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <View style={styles.toggleInfo}>
          <Text style={styles.label}>Track Inventory</Text>
          <Text style={styles.hint}>Automatically mark as sold out when stock runs out</Text>
        </View>
        <Switch
          value={trackInventory}
          onValueChange={onTrackChange}
          trackColor={{ false: colors.backgroundTertiary, true: colors.primary + '40' }}
          thumbColor={trackInventory ? colors.primary : colors.textTertiary}
        />
      </View>

      {trackInventory && (
        <>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Total Quantity Available</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 50"
              value={totalQuantity}
              onChangeText={onQuantityChange}
              keyboardType="number-pad"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Max Per Order</Text>
            <TextInput
              style={styles.input}
              placeholder="No limit"
              value={maxPerOrder}
              onChangeText={onMaxPerOrderChange}
              keyboardType="number-pad"
              placeholderTextColor={colors.textTertiary}
            />
            <Text style={styles.fieldHint}>Limit how many a single buyer can purchase</Text>
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md,
  },
  toggleInfo: { flex: 1, marginRight: spacing.lg },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textPrimary },
  hint: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  field: { marginBottom: spacing.md },
  fieldLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    padding: spacing.md, fontSize: fontSize.md, color: colors.textPrimary,
  },
  fieldHint: { fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 4 },
})
