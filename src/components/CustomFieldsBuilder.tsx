import React from 'react'
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme'

interface CustomFieldsBuilderProps {
  fields: string[]
  onFieldsChange: (fields: string[]) => void
}

export function CustomFieldsBuilder({ fields, onFieldsChange }: CustomFieldsBuilderProps) {
  const addField = () => {
    if (fields.length < 5) {
      onFieldsChange([...fields, ''])
    }
  }

  const updateField = (index: number, value: string) => {
    const updated = [...fields]
    updated[index] = value
    onFieldsChange(updated)
  }

  const removeField = (index: number) => {
    onFieldsChange(fields.filter((_, i) => i !== index))
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Custom Fields</Text>
        <Text style={styles.count}>{fields.length}/5</Text>
      </View>
      <Text style={styles.hint}>Ask buyers for additional information at checkout</Text>

      {fields.map((field, index) => (
        <View key={index} style={styles.fieldRow}>
          <TextInput
            style={styles.fieldInput}
            placeholder="e.g. Attendee Name"
            value={field}
            onChangeText={(text) => updateField(index, text)}
            placeholderTextColor={colors.textTertiary}
          />
          <TouchableOpacity style={styles.removeButton} onPress={() => removeField(index)}>
            <Text style={styles.removeText}>X</Text>
          </TouchableOpacity>
        </View>
      ))}

      {fields.length < 5 && (
        <TouchableOpacity style={styles.addButton} onPress={addField}>
          <Text style={styles.addText}>+ Add Field</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textPrimary },
  count: { fontSize: fontSize.xs, color: colors.textTertiary },
  hint: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.md },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  fieldInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.danger },
  addButton: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.primary },
})
