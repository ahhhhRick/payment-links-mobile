import React, { useState } from 'react'
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme'

interface ImagePickerFieldProps {
  uri?: string
  onChange: (uri: string | undefined) => void
}

export function ImagePickerField({ uri, onChange }: ImagePickerFieldProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(uri || '')

  const handleCommit = () => {
    const trimmed = draft.trim()
    onChange(trimmed || undefined)
    setEditing(false)
  }

  const handleRemove = () => {
    Alert.alert('Remove Photo', 'Remove the cover photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: () => {
          setDraft('')
          onChange(undefined)
          setEditing(false)
        }
      },
    ])
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Cover Photo</Text>

      {/* Preview */}
      {uri ? (
        <View style={styles.previewWrapper}>
          <Image source={{ uri }} style={styles.preview} resizeMode="cover" />
          {/* Specular highlight */}
          <View style={styles.previewHighlight} />
          <TouchableOpacity style={styles.removeBtn} onPress={handleRemove} activeOpacity={0.8}>
            <Text style={styles.removeBtnText}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.changeBtn} onPress={() => setEditing(true)} activeOpacity={0.8}>
            <Text style={styles.changeBtnText}>Change URL</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.placeholder}
          onPress={() => setEditing(true)}
          activeOpacity={0.75}
        >
          {/* Specular highlight on placeholder */}
          <View style={styles.placeholderHighlight} />
          <Text style={styles.placeholderIcon}>⬆</Text>
          <Text style={styles.placeholderLabel}>Add Cover Photo</Text>
          <Text style={styles.placeholderSub}>Optional — tap to paste a URL</Text>
        </TouchableOpacity>
      )}

      {/* URL input */}
      {editing && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.urlInput}
            placeholder="https://example.com/image.jpg"
            value={draft}
            onChangeText={setDraft}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="done"
            onSubmitEditing={handleCommit}
            autoFocus
            placeholderTextColor={colors.textTertiary}
          />
          <TouchableOpacity style={styles.applyBtn} onPress={handleCommit} activeOpacity={0.8}>
            <Text style={styles.applyBtnText}>Apply</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewWrapper: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    height: 200,
    position: 'relative',
    backgroundColor: colors.surfaceDefault,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  previewHighlight: {
    display: 'none',
  },
  removeBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.70)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: fontWeight.semibold,
  },
  changeBtn: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.surfaceDefault,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    height: 32,
    justifyContent: 'center',
  },
  changeBtnText: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  placeholder: {
    height: 140,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surfaceDefault,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  placeholderHighlight: {
    display: 'none',
  },
  placeholderIcon: {
    fontSize: 26,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  placeholderLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  placeholderSub: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  urlInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    height: 44,
    justifyContent: 'center',
  },
  applyBtnText: {
    color: colors.primaryText,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
})
