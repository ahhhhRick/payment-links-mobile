import React from 'react'
import { View, Text, TouchableOpacity, TextInput, Switch, StyleSheet } from 'react-native'
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme'

export interface Modifier {
  id: string
  name: string
  price: string
}

export interface ModifierGroup {
  id: string
  name: string
  required: boolean
  multiSelect: boolean
  maxSelections: string
  modifiers: Modifier[]
}

interface ModifierBuilderProps {
  groups: ModifierGroup[]
  onGroupsChange: (groups: ModifierGroup[]) => void
}

function createModifier(): Modifier {
  return { id: Date.now().toString() + Math.random(), name: '', price: '' }
}

function createGroup(): ModifierGroup {
  return {
    id: Date.now().toString(),
    name: '',
    required: false,
    multiSelect: false,
    maxSelections: '',
    modifiers: [createModifier()],
  }
}

export function ModifierBuilder({ groups, onGroupsChange }: ModifierBuilderProps) {
  const addGroup = () => onGroupsChange([...groups, createGroup()])

  const removeGroup = (groupId: string) => {
    onGroupsChange(groups.filter((g) => g.id !== groupId))
  }

  const updateGroup = (groupId: string, field: string, value: any) => {
    onGroupsChange(groups.map((g) => (g.id === groupId ? { ...g, [field]: value } : g)))
  }

  const addModifier = (groupId: string) => {
    onGroupsChange(groups.map((g) =>
      g.id === groupId ? { ...g, modifiers: [...g.modifiers, createModifier()] } : g
    ))
  }

  const removeModifier = (groupId: string, modId: string) => {
    onGroupsChange(groups.map((g) =>
      g.id === groupId ? { ...g, modifiers: g.modifiers.filter((m) => m.id !== modId) } : g
    ))
  }

  const updateModifier = (groupId: string, modId: string, field: keyof Modifier, value: string) => {
    onGroupsChange(groups.map((g) =>
      g.id === groupId
        ? { ...g, modifiers: g.modifiers.map((m) => (m.id === modId ? { ...m, [field]: value } : m)) }
        : g
    ))
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Modifiers</Text>
        <Text style={styles.count}>{groups.length} groups</Text>
      </View>
      <Text style={styles.hint}>Add modifier groups like Size, Toppings, or Extras</Text>

      {groups.map((group, gi) => (
        <View key={group.id} style={styles.groupCard}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupNumber}>Group {gi + 1}</Text>
            <TouchableOpacity onPress={() => removeGroup(group.id)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Group Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Size, Toppings"
              value={group.name}
              onChangeText={(v) => updateGroup(group.id, 'name', v)}
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.togglesRow}>
            <View style={styles.toggleItem}>
              <Text style={styles.toggleLabel}>Required</Text>
              <Switch
                value={group.required}
                onValueChange={(v) => updateGroup(group.id, 'required', v)}
                trackColor={{ false: colors.backgroundTertiary, true: colors.primary + '40' }}
                thumbColor={group.required ? colors.primary : colors.textTertiary}
              />
            </View>
            <View style={styles.toggleItem}>
              <Text style={styles.toggleLabel}>Multi-select</Text>
              <Switch
                value={group.multiSelect}
                onValueChange={(v) => updateGroup(group.id, 'multiSelect', v)}
                trackColor={{ false: colors.backgroundTertiary, true: colors.primary + '40' }}
                thumbColor={group.multiSelect ? colors.primary : colors.textTertiary}
              />
            </View>
          </View>

          <Text style={styles.optionsLabel}>Options</Text>
          {group.modifiers.map((mod) => (
            <View key={mod.id} style={styles.modRow}>
              <TextInput
                style={[styles.input, styles.modName]}
                placeholder="e.g. Pepperoni"
                value={mod.name}
                onChangeText={(v) => updateModifier(group.id, mod.id, 'name', v)}
                placeholderTextColor={colors.textTertiary}
              />
              <View style={styles.modPrice}>
                <Text style={styles.plus}>+$</Text>
                <TextInput
                  style={[styles.input, styles.modPriceInput]}
                  placeholder="0"
                  value={mod.price}
                  onChangeText={(v) => updateModifier(group.id, mod.id, 'price', v)}
                  keyboardType="decimal-pad"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              {group.modifiers.length > 1 && (
                <TouchableOpacity style={styles.modRemove} onPress={() => removeModifier(group.id, mod.id)}>
                  <Text style={styles.modRemoveText}>X</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.addModButton} onPress={() => addModifier(group.id)}>
            <Text style={styles.addModText}>+ Add Option</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.addGroupButton} onPress={addGroup} activeOpacity={0.7}>
        <Text style={styles.addGroupText}>+ Add Modifier Group</Text>
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
  groupCard: {
    backgroundColor: colors.backgroundSecondary, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  groupHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm,
  },
  groupNumber: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  removeText: { fontSize: fontSize.sm, color: colors.danger, fontWeight: fontWeight.medium },
  field: { marginBottom: spacing.sm },
  fieldLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    padding: spacing.sm, fontSize: fontSize.md, color: colors.textPrimary, backgroundColor: colors.background,
  },
  togglesRow: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.md },
  toggleItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  toggleLabel: { fontSize: fontSize.sm, color: colors.textSecondary },
  optionsLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.xs, fontWeight: fontWeight.medium },
  modRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  modName: { flex: 1 },
  modPrice: { flexDirection: 'row', alignItems: 'center', width: 80 },
  plus: { fontSize: fontSize.sm, color: colors.textSecondary, marginRight: 2 },
  modPriceInput: { flex: 1, textAlign: 'right' },
  modRemove: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.dangerLight,
    alignItems: 'center', justifyContent: 'center',
  },
  modRemoveText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.danger },
  addModButton: { paddingVertical: spacing.sm, alignItems: 'center' },
  addModText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.medium },
  addGroupButton: {
    paddingVertical: spacing.md, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed', alignItems: 'center',
  },
  addGroupText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.primary },
})
