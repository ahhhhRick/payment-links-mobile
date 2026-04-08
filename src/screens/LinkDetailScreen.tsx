import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme'
import { LINK_TYPE_CONFIGS, type PaymentLink } from '../types'
import { formatMoney, formatDate } from '../utils/format'

interface LinkDetailScreenProps {
  link: PaymentLink
  onClose: () => void
  onShare: () => void
  onEdit: () => void
  onTogglePause: () => void
  onDelete: () => void
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: colors.successLight, text: colors.success, label: 'Active' },
  paused: { bg: colors.warningLight, text: colors.warning, label: 'Paused' },
  sold_out: { bg: colors.dangerLight, text: colors.danger, label: 'Sold Out' },
  expired: { bg: colors.backgroundTertiary, text: colors.textSecondary, label: 'Expired' },
  draft: { bg: colors.infoLight, text: colors.info, label: 'Draft' },
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

export function LinkDetailScreen({ link, onClose, onShare, onEdit, onTogglePause, onDelete }: LinkDetailScreenProps) {
  const config = LINK_TYPE_CONFIGS[link.linkType]
  const status = STATUS_CONFIG[link.status] || STATUS_CONFIG.active

  const handleDelete = () => {
    Alert.alert(
      'Delete Link',
      `Are you sure you want to delete "${link.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Link Details</Text>
        <TouchableOpacity onPress={onShare}>
          <Text style={styles.shareButton}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: config.color + '15' }]}>
            <Text style={[styles.heroIconText, { color: config.color }]}>{config.icon}</Text>
          </View>
          <Text style={styles.heroName}>{link.name}</Text>
          <View style={styles.heroMeta}>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
            </View>
            <Text style={styles.heroType}>{config.label}</Text>
          </View>
          {link.amount && (
            <Text style={styles.heroAmount}>{formatMoney(link.amount)}</Text>
          )}
          <TouchableOpacity onPress={onEdit}>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Orders" value={String(link.totalOrders)} />
          <StatCard label="Revenue" value={formatMoney(link.totalRevenue)} />
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailCard}>
            <DetailRow label="Type" value={config.label} />
            <View style={styles.detailDivider} />
            <DetailRow label="Created" value={formatDate(link.createdAt)} />
            {link.description ? (
              <>
                <View style={styles.detailDivider} />
                <DetailRow label="Description" value={link.description} />
              </>
            ) : null}
            {link.eventDate ? (
              <>
                <View style={styles.detailDivider} />
                <DetailRow label="Event Date" value={formatDate(link.eventDate)} />
              </>
            ) : null}
            {link.eventVenue ? (
              <>
                <View style={styles.detailDivider} />
                <DetailRow label="Venue" value={link.eventVenue} />
              </>
            ) : null}
            <View style={styles.detailDivider} />
            <DetailRow label="Reusable" value={link.isOneTime ? 'One-time' : 'Yes'} />
          </View>
        </View>

        {/* Link URL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment URL</Text>
          <View style={styles.urlCard}>
            <Text style={styles.urlText} selectable>{link.url}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionsCard}>
            <TouchableOpacity style={styles.actionRow} onPress={onShare}>
              <Text style={styles.actionIcon}>{'\u2197'}</Text>
              <Text style={styles.actionLabel}>Share Link</Text>
              <Text style={styles.actionChevron}>&rsaquo;</Text>
            </TouchableOpacity>
            <View style={styles.actionDivider} />
            <TouchableOpacity style={styles.actionRow} onPress={onTogglePause}>
              <Text style={styles.actionIcon}>{link.isPaused ? '\u25B6' : '\u23F8'}</Text>
              <Text style={styles.actionLabel}>{link.isPaused ? 'Resume Link' : 'Pause Link'}</Text>
              <Text style={styles.actionChevron}>&rsaquo;</Text>
            </TouchableOpacity>
            <View style={styles.actionDivider} />
            <TouchableOpacity style={styles.actionRow} onPress={() => Alert.alert('Duplicate', 'Link duplicated (would open wizard with pre-filled data)')}>
              <Text style={styles.actionIcon}>{'\u2398'}</Text>
              <Text style={styles.actionLabel}>Duplicate Link</Text>
              <Text style={styles.actionChevron}>&rsaquo;</Text>
            </TouchableOpacity>
            <View style={styles.actionDivider} />
            <TouchableOpacity style={styles.actionRow} onPress={handleDelete}>
              <Text style={[styles.actionIcon, { color: colors.danger }]}>{'\u2715'}</Text>
              <Text style={[styles.actionLabel, { color: colors.danger }]}>Delete Link</Text>
              <Text style={[styles.actionChevron, { color: colors.danger }]}>&rsaquo;</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  backButton: { fontSize: fontSize.md, color: colors.primary, fontWeight: fontWeight.medium },
  headerTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  shareButton: { fontSize: fontSize.md, color: colors.primary, fontWeight: fontWeight.semibold },
  editLink: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  content: { paddingBottom: 40 },
  hero: {
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingVertical: spacing.xxl,
    paddingBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  heroIconText: { fontSize: 28, fontWeight: fontWeight.bold },
  heroName: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.textPrimary },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  heroType: { fontSize: fontSize.sm, color: colors.textSecondary },
  heroAmount: { fontSize: fontSize.xxxl, fontWeight: fontWeight.bold, color: colors.textPrimary, marginTop: spacing.xs },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  statValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary },
  statLabel: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 },
  section: { paddingTop: spacing.xxl, paddingHorizontal: spacing.lg },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  detailCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  detailLabel: { fontSize: fontSize.sm, color: colors.textSecondary },
  detailValue: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textPrimary, textAlign: 'right', flex: 1, marginLeft: spacing.xl },
  detailDivider: { height: 1, backgroundColor: colors.borderLight },
  urlCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  urlText: { fontSize: fontSize.sm, color: colors.primary, fontFamily: 'monospace' },
  actionsCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  actionIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  actionLabel: { flex: 1, fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.textPrimary },
  actionChevron: { fontSize: 20, color: colors.textTertiary },
  actionDivider: { height: 1, backgroundColor: colors.borderLight, marginLeft: spacing.lg + spacing.md + 24 },
})
