import React, { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert, Image } from 'react-native'
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme'
import { LINK_TYPE_CONFIGS, type PaymentLink } from '../types'
import { formatMoney, formatRelativeDate } from '../utils/format'

interface LinksScreenProps {
  links: PaymentLink[]
  onTogglePause: (id: string) => void
  onDelete: (id: string) => void
  onShare: (link: PaymentLink) => void
}

const STATUS_COLORS: Record<string, { text: string }> = {
  active:   { text: colors.success },
  paused:   { text: colors.warning },
  sold_out: { text: colors.danger },
  expired:  { text: colors.textTertiary },
  draft:    { text: colors.info },
}

function LinkCard({
  link,
  onTogglePause,
  onDelete,
  onShare,
}: {
  link: PaymentLink
  onTogglePause: () => void
  onDelete: () => void
  onShare: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const config = LINK_TYPE_CONFIGS[link.linkType]
  const statusColor = STATUS_COLORS[link.status] || STATUS_COLORS.active

  const handleDelete = () => {
    Alert.alert('Delete link', `Delete "${link.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ])
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.88}
    >
      {/* Image / color header */}
      <View style={styles.imageWrapper}>
        {link.imageUri ? (
          <Image source={{ uri: link.imageUri }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={[styles.cardImage, styles.cardImageFallback]}>
            <View style={[StyleSheet.absoluteFill, { backgroundColor: config.color + '22' }]} />
            <Text style={styles.typeIconLarge}>{config.icon}</Text>
          </View>
        )}
      </View>

      {/* Card body */}
      <View style={styles.cardBody}>
        {/* Name + status */}
        <View style={styles.nameRow}>
          <Text style={styles.cardName} numberOfLines={1}>{link.name}</Text>
          <Text style={[styles.statusText, { color: statusColor.text }]}>{link.status}</Text>
        </View>

        {/* Amount */}
        {link.amount && (
          <Text style={styles.amount}>{formatMoney(link.amount)}</Text>
        )}

        {/* Description */}
        {link.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>{link.description}</Text>
        ) : null}

        {/* Stats + share */}
        <View style={styles.cardFooter}>
          <View style={styles.statsRow}>
            <Text style={styles.statText}>{link.totalOrders} orders</Text>
            <Text style={styles.statDot}>·</Text>
            <Text style={styles.statText}>{formatMoney(link.totalRevenue)}</Text>
          </View>
          {/* Arcade button-compact (standard) */}
          <TouchableOpacity style={styles.compactButton} onPress={onShare} activeOpacity={0.8}>
            <Text style={styles.compactButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Expanded actions */}
      {expanded && (
        <View style={styles.expandedSection}>
          <View style={styles.expandedDivider} />
          <Text style={styles.expandedMeta}>Created {formatRelativeDate(link.createdAt)}</Text>
          <View style={styles.expandedActions}>
            {/* Arcade button-default (standard) */}
            <TouchableOpacity style={styles.actionButton} onPress={onTogglePause} activeOpacity={0.8}>
              <Text style={styles.actionButtonText}>{link.isPaused ? 'Resume' : 'Pause'}</Text>
            </TouchableOpacity>
            {/* Arcade button-default (destructive) */}
            <TouchableOpacity style={[styles.actionButton, styles.destructiveButton]} onPress={handleDelete} activeOpacity={0.8}>
              <Text style={styles.destructiveButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  )
}

export function LinksScreen({ links, onTogglePause, onDelete, onShare }: LinksScreenProps) {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? links.filter(l => l.name.toLowerCase().includes(search.toLowerCase()))
    : links

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your links</Text>
        <Text style={styles.subtitle}>{links.length} total</Text>
      </View>

      {/* Search bar (Arcade search-bar pattern) */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={colors.textTertiary}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LinkCard
            link={item}
            onTogglePause={() => onTogglePause(item.id)}
            onDelete={() => onDelete(item.id)}
            onShare={() => onShare(item)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {search ? 'No links match your search' : 'No links yet'}
            </Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: 64,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: fontSize.lg, color: colors.textSecondary, marginTop: 4 },

  // ── Search bar (Arcade: pill shape, 9999 radius) ─────────────────────────
  searchWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceDefault,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    height: 44,
    gap: spacing.sm,
  },
  searchIcon: { fontSize: 18, color: colors.textTertiary },
  searchInput: {
    flex: 1,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },

  // ── List ──────────────────────────────────────────────────────────────────
  list: { padding: spacing.lg, gap: spacing.md },
  empty: { alignItems: 'center', paddingVertical: spacing.xxxl },
  emptyText: { fontSize: fontSize.lg, color: colors.textTertiary },

  // ── Card (Arcade card: 24px radius) ──────────────────────────────────────
  card: {
    backgroundColor: colors.surfaceDefault,
    borderRadius: radius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },

  // ── Image / header ────────────────────────────────────────────────────────
  imageWrapper: {
    margin: 10,
    borderRadius: radius.lg,
    overflow: 'hidden',
    height: 190,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  typeIconLarge: {
    fontSize: 52,
    fontWeight: fontWeight.bold,
    color: 'rgba(255,255,255,0.85)',
    zIndex: 1,
  },

  // ── Card body ─────────────────────────────────────────────────────────────
  cardBody: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  statusText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  amount: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  cardDesc: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  statDot: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },

  // Arcade button-compact (standard dark mode: #1A1A1A on card = use surfaceElevated)
  compactButton: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    height: 32,
    justifyContent: 'center',
  },
  compactButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },

  // ── Expanded actions ──────────────────────────────────────────────────────
  expandedSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  expandedDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  expandedMeta: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },
  expandedActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  // Arcade button-default (standard)
  actionButton: {
    flex: 1,
    height: 52,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  // Arcade button-default (destructive)
  destructiveButton: {
    backgroundColor: colors.dangerLight,
  },
  destructiveButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.danger,
  },
})
