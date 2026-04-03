import React from 'react'
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme'

export interface Variant {
  id: string
  name: string
  price: string
  stock: string
}

interface VariantBuilderProps {
  variants: Variant[]
  onVariantsChange: (variants: Variant[]) => void
  label?: string
  namePlaceholder?: string
}

export function VariantBuilder({
  variants,
  onVariantsChange,
  label = 'Variants',
  namePlaceholder = 'e.g. Large',
}: VariantBuilderProps) {
  const addVariant = () => {
    onVariantsChange([
      ...variants,
      { id: Date.now().toString(), name: '', price: '', stock: '' },
    ])
  }

  const updateVariant = (id: string, field: keyof Variant, value: string) => {
    onVariantsChange(variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)))
  }

  const removeVariant = (id: string) => {
    onVariantsChange(variants.filter((v) => v.id !== id))
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.count}>{variants.length} added</Text>
      </View>
      <Text style={styles.hint}>Add sizes, colors, tiers, or other options buyers can choose from</Text>

      {variants.map((variant, index) => (
        <View key={variant.id} style={styles.variantCard}>
          <View style={styles.variantHeader}>
            <Text style={styles.variantNumber}>Option {index + 1}</Text>
            <TouchableOpacity onPress={() => removeVariant(variant.id)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.fieldFlex}>
              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder={namePlaceholder}
                value={variant.name}
                onChangeText={(v) => updateVariant(variant.id, 'name', v)}
                placeholderTextColor={colors.textTertiary}
              />
            </View>
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.fieldHalf}>
              <Text style={styles.fieldLabel}>Price</Text>
              <View style={styles.priceRow}>
                <Text style={styles.dollar}>$</Text>
                <TextInput
                  style={[styles.input, styles.priceInput]}
                  placeholder="0.00"
                  value={variant.price}
                  onChangeText={(v) => updateVariant(variant.id, 'price', v)}
                  keyboardType="decimal-pad"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            </View>
            <View style={styles.fieldHalf}>
              <Text style={styles.fieldLabel}>Stock</Text>
              <TextInput
                style={styles.input}
                placeholder="Unlimited"
                value={variant.stock}
                onChangeText={(v) => updateVariant(variant.id, 'stock', v)}
                keyboardType="number-pad"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={addVariant} activeOpacity={0.7}>
        <Text style={styles.addText}>+ Add Option</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textPrimary },
  count: { fontSize: fontSize.xs, color: colors.textTertiary },
  hint: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.md },
  variantCard: {
    backgroundColor: colors.backgroundSecondary, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  variantHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm,
  },
  variantNumber: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  removeText: { fontSize: fontSize.sm, color: colors.danger, fontWeight: fontWeight.medium },
  fieldRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  fieldFlex: { flex: 1 },
  fieldHalf: { flex: 1 },
  fieldLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    padding: spacing.sm, fontSize: fontSize.md, color: colors.textPrimary, backgroundColor: colors.background,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  dollar: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary, marginRight: 4 },
  priceInput: { flex: 1 },
  addButton: {
    paddingVertical: spacing.md, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed', alignItems: 'center',
  },
  addText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.primary },
})
