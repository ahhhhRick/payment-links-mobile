import React from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme'

interface BuyerDataFieldsProps {
  firstName: string
  lastName: string
  email: string
  phone: string
  onUpdate: (field: string, value: string) => void
}

export function BuyerDataFields({ firstName, lastName, email, phone, onUpdate }: BuyerDataFieldsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Pre-fill Buyer Info</Text>
      <Text style={styles.hint}>Pre-populate the checkout form for a known customer</Text>
      <View style={styles.nameRow}>
        <View style={styles.halfField}>
          <Text style={styles.fieldLabel}>First Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Jane"
            value={firstName}
            onChangeText={(v) => onUpdate('buyerFirstName', v)}
            placeholderTextColor={colors.textTertiary}
          />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.fieldLabel}>Last Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Doe"
            value={lastName}
            onChangeText={(v) => onUpdate('buyerLastName', v)}
            placeholderTextColor={colors.textTertiary}
          />
        </View>
      </View>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="jane@example.com"
          value={email}
          onChangeText={(v) => onUpdate('buyerEmail', v)}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colors.textTertiary}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Phone</Text>
        <TextInput
          style={styles.input}
          placeholder="(555) 123-4567"
          value={phone}
          onChangeText={(v) => onUpdate('buyerPhone', v)}
          keyboardType="phone-pad"
          placeholderTextColor={colors.textTertiary}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textPrimary },
  hint: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.md },
  nameRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  halfField: { flex: 1 },
  field: { marginBottom: spacing.sm },
  fieldLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    padding: spacing.md, fontSize: fontSize.md, color: colors.textPrimary,
  },
})
