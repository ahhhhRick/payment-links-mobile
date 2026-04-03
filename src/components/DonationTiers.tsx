import React from 'react'
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme'

interface DonationTiersProps {
  selectedAmount: string
  onAmountChange: (amount: string) => void
}

const PRESET_AMOUNTS = ['10', '25', '50', '100']

export function DonationTiers({ selectedAmount, onAmountChange }: DonationTiersProps) {
  const isCustom = selectedAmount !== '' && !PRESET_AMOUNTS.includes(selectedAmount)

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Suggested Amounts</Text>
      <View style={styles.tiersRow}>
        {PRESET_AMOUNTS.map((amt) => (
          <TouchableOpacity
            key={amt}
            style={[styles.tier, selectedAmount === amt && styles.tierActive]}
            onPress={() => onAmountChange(amt)}
          >
            <Text style={[styles.tierText, selectedAmount === amt && styles.tierTextActive]}>
              ${amt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.customRow}>
        <Text style={styles.customLabel}>Custom amount</Text>
        <View style={styles.customInput}>
          <Text style={styles.dollar}>$</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={isCustom ? selectedAmount : ''}
            onChangeText={onAmountChange}
            keyboardType="decimal-pad"
            placeholderTextColor={colors.textTertiary}
          />
        </View>
      </View>
      <Text style={styles.hint}>Donors can change the amount at checkout</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textPrimary, marginBottom: spacing.sm },
  tiersRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  tier: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  tierActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  tierText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  tierTextActive: { color: colors.primary },
  customRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  customLabel: { fontSize: fontSize.sm, color: colors.textSecondary },
  customInput: { flexDirection: 'row', alignItems: 'center' },
  dollar: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary, marginRight: 4 },
  input: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary, minWidth: 80, textAlign: 'right' },
  hint: { fontSize: fontSize.xs, color: colors.textTertiary, marginTop: spacing.sm },
})
