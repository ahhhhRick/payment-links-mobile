import React, { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert, Share } from 'react-native'
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme'
import { LINK_TYPE_CONFIGS, type PaymentLink } from '../types'
import { formatMoney, formatRelativeDate } from '../utils/format'

interface LinksScreenProps {
  links: PaymentLink[]
  onTogglePause: (id: string) => void
  onDelete: (id: string) => void
  onShare: (link: PaymentLink) => void
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active: { bg: colors.successLight, text: colors.success },
  paused: { bg: colors.warningLight, text: colors.warning },
  sold_out: { bg: colors.dangerLight, text: colors.danger },
  expired: { bg: colors.backgroundTertiary, text: colors.textSecondary },
  draft: { bg: colors.infoLight, text: colors.info },
}

function LinkCard({ link, onTogglePause, onDelete, onShare }: {
  link: PaymentLink
  onTogglePause: () => void
  onDelete: () => void
  onShare: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const config = LINK_TYPE_CONFIGS[link.linkType]
  const statusColor = STATUS_COLORS[link.status] || STATUS_COLORS.active

  const handleDelete = () => {
    Alert.alert('Delete Link', `Are you sure you want to delete "${link.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ])
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: config.color + '15' }]}>
          <Text style={[styles.cardIconText, { color: config.color }]}>{config.icon}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{link.name}</Text>
          <Text style={styles.cardMeta}>
            {link.amount ? formatMoney(link.amount) : 'Variable'} · {formatRelativeDate(link.createdAt)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
          <Text style={[styles.statusText, { color: statusColor.text }]}>{link.status}</Text>
        </View>
      </View>

      {expanded && (
        <View style={styles.cardExpanded}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{link.totalOrders}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{formatMoney(link.totalRevenue)}</Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
          </View>

          {link.description ? (
            <Text style={styles.cardDescription}>{link.description}</Text>
          ) : null}

          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.actionButton} onPress={onShare}>
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onTogglePause}>
              <Text style={styles.actionButtonText}>{link.isPaused ? 'Resume' : 'Pause'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.actionButtonDanger]} onPress={handleDelete}>
              <Text style={styles.actionButtonTextDanger}>Delete</Text>
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
      <View style={styles.header}>
        <Text style={styles.title}>Your Links</Text>
        <Text style={styles.subtitle}>{links.length} total</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search links..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={colors.textTertiary}
        />
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
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  title: { fontSize: fontSize.xxxl, fontWeight: fontWeight.bold, color: colors.textPrimary },
  subtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: 4 },
  searchContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  searchInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  list: { padding: spacing.lg, gap: spacing.sm },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconText: { fontSize: 16, fontWeight: fontWeight.bold },
  cardInfo: { flex: 1, minWidth: 0 },
  cardName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  cardMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  cardExpanded: { marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.borderLight },
  statsRow: { flexDirection: 'row', gap: spacing.xl, marginBottom: spacing.md },
  stat: {},
  statValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary },
  statLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  cardDescription: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.md },
  cardActions: { flexDirection: 'row', gap: spacing.sm },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
  },
  actionButtonDanger: { backgroundColor: colors.dangerLight },
  actionButtonText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textPrimary },
  actionButtonTextDanger: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.danger },
  empty: { alignItems: 'center', paddingVertical: spacing.xxxl },
  emptyText: { fontSize: fontSize.md, color: colors.textSecondary },
})
