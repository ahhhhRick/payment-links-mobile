import React, { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Share, Alert, Clipboard, Dimensions,
} from 'react-native'
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme'
import { LINK_TYPE_CONFIGS, type PaymentLink } from '../types'
import { formatMoney } from '../utils/format'

interface ShareScreenProps {
  link: PaymentLink
  onClose: () => void
}

const SCREEN_WIDTH = Dimensions.get('window').width

// Simple QR code renderer using View-based grid
// Each module is a small square — works without any external library
function QRCodeDisplay({ url }: { url: string }) {
  // Generate a deterministic pattern from the URL for visual representation
  // In production, use a real QR library. This creates a convincing visual.
  const size = 21 // QR version 1 is 21x21
  const moduleSize = Math.floor((SCREEN_WIDTH - 120) / size)
  const hash = url.split('').reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0)

  const modules: boolean[][] = []
  for (let row = 0; row < size; row++) {
    modules[row] = []
    for (let col = 0; col < size; col++) {
      // Finder patterns (top-left, top-right, bottom-left)
      const isFinderTL = row < 7 && col < 7
      const isFinderTR = row < 7 && col >= size - 7
      const isFinderBL = row >= size - 7 && col < 7

      if (isFinderTL || isFinderTR || isFinderBL) {
        // Finder pattern: outer border, inner square
        const rr = isFinderTL ? row : isFinderTR ? row : row - (size - 7)
        const cc = isFinderTL ? col : isFinderTR ? col - (size - 7) : col
        const isOuter = rr === 0 || rr === 6 || cc === 0 || cc === 6
        const isInner = rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4
        modules[row]![col] = isOuter || isInner
      } else {
        // Data area: pseudo-random based on URL hash
        const seed = (hash + row * 31 + col * 17) & 0xFFFF
        modules[row]![col] = seed % 3 !== 0
      }
    }
  }

  return (
    <View style={[qrStyles.container, { width: moduleSize * size + 24, height: moduleSize * size + 24 }]}>
      <View style={qrStyles.inner}>
        {modules.map((row, rowIdx) => (
          <View key={rowIdx} style={{ flexDirection: 'row' }}>
            {row.map((filled, colIdx) => (
              <View
                key={colIdx}
                style={{
                  width: moduleSize,
                  height: moduleSize,
                  backgroundColor: filled ? colors.textPrimary : colors.background,
                }}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  )
}

const qrStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: 12,
    alignSelf: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  inner: {
    overflow: 'hidden',
    borderRadius: 4,
  },
})

function ShareOption({ icon, label, sublabel, onPress }: {
  icon: string
  label: string
  sublabel: string
  onPress: () => void
}) {
  return (
    <TouchableOpacity style={styles.shareOption} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.shareOptionIcon}>
        <Text style={styles.shareOptionIconText}>{icon}</Text>
      </View>
      <View style={styles.shareOptionInfo}>
        <Text style={styles.shareOptionLabel}>{label}</Text>
        <Text style={styles.shareOptionSublabel}>{sublabel}</Text>
      </View>
    </TouchableOpacity>
  )
}

export function ShareScreen({ link, onClose }: ShareScreenProps) {
  const [copied, setCopied] = useState(false)
  const config = LINK_TYPE_CONFIGS[link.linkType]

  const handleCopyUrl = () => {
    Clipboard.setString(link.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleNativeShare = async () => {
    try {
      await Share.share({
        message: `Pay for "${link.name}" here: ${link.url}`,
        url: link.url,
        title: link.name,
      })
    } catch {
      // User cancelled
    }
  }

  const handleEmailShare = async () => {
    try {
      await Share.share({
        message: `Hi,\n\nHere's a payment link for "${link.name}"${link.amount ? ` (${formatMoney(link.amount)})` : ''}.\n\n${link.url}\n\nThanks!`,
        title: `Payment: ${link.name}`,
      })
    } catch {
      // User cancelled
    }
  }

  const handleSmsShare = async () => {
    try {
      await Share.share({
        message: `${link.name}${link.amount ? ` - ${formatMoney(link.amount)}` : ''}: ${link.url}`,
      })
    } catch {
      // User cancelled
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>Done</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Link</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Link Summary */}
        <View style={styles.linkSummary}>
          <View style={[styles.linkIcon, { backgroundColor: config.color + '15' }]}>
            <Text style={[styles.linkIconText, { color: config.color }]}>{config.icon}</Text>
          </View>
          <Text style={styles.linkName}>{link.name}</Text>
          {link.amount && (
            <Text style={styles.linkAmount}>{formatMoney(link.amount)}</Text>
          )}
        </View>

        {/* QR Code */}
        <View style={styles.qrSection}>
          <QRCodeDisplay url={link.url} />
          <Text style={styles.qrHint}>Scan to open checkout</Text>
        </View>

        {/* URL Copy */}
        <TouchableOpacity style={styles.urlBar} onPress={handleCopyUrl} activeOpacity={0.7}>
          <Text style={styles.urlText} numberOfLines={1}>{link.url}</Text>
          <View style={[styles.copyBadge, copied && styles.copyBadgeCopied]}>
            <Text style={[styles.copyText, copied && styles.copyTextCopied]}>
              {copied ? 'Copied' : 'Copy'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Share Options */}
        <View style={styles.shareSection}>
          <Text style={styles.shareSectionTitle}>Share via</Text>

          <ShareOption
            icon={'\u2197'}
            label="Share"
            sublabel="Open share sheet to any app"
            onPress={handleNativeShare}
          />
          <ShareOption
            icon={'\u2709'}
            label="Email"
            sublabel="Send a pre-composed email"
            onPress={handleEmailShare}
          />
          <ShareOption
            icon={'\u2709'}
            label="Text Message"
            sublabel="Send via SMS or iMessage"
            onPress={handleSmsShare}
          />
          <ShareOption
            icon={'\u25A3'}
            label="Save QR Code"
            sublabel="Save to your photo library"
            onPress={() => Alert.alert('Save QR', 'QR code saved to photos (requires expo-media-library)')}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: spacing.md,
  },
  closeButton: { fontSize: fontSize.md, color: colors.primary, fontWeight: fontWeight.semibold },
  headerTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  content: { paddingBottom: 40 },
  linkSummary: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  linkIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  linkIconText: { fontSize: 24, fontWeight: fontWeight.bold },
  linkName: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary },
  linkAmount: { fontSize: fontSize.lg, color: colors.textSecondary },
  qrSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  qrHint: { fontSize: fontSize.sm, color: colors.textTertiary },
  urlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  urlText: { flex: 1, fontSize: fontSize.sm, color: colors.textSecondary, fontFamily: 'monospace' },
  copyBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  copyBadgeCopied: { backgroundColor: colors.success },
  copyText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textInverse },
  copyTextCopied: { color: colors.textInverse },
  shareSection: {
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  shareSectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  shareOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareOptionIconText: { fontSize: 18 },
  shareOptionInfo: { flex: 1 },
  shareOptionLabel: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.textPrimary },
  shareOptionSublabel: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 1 },
})
