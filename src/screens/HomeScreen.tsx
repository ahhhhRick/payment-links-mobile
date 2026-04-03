import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme'
import { LINK_TYPE_CONFIGS, LinkType, type PaymentLink } from '../types'
import { formatMoney, formatRelativeDate } from '../utils/format'

interface HomeScreenProps {
  stats: {
    activeLinks: number
    totalLinks: number
    totalRevenue: number
    totalOrders: number
  }
  recentLinks: PaymentLink[]
  onCreatePress: () => void
  onViewAllLinks: () => void
  onLinkPress: (link: PaymentLink) => void
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
    </View>
  )
}

function TypeButton({ type, onPress }: { type: LinkType; onPress: () => void }) {
  const config = LINK_TYPE_CONFIGS[type]
  return (
    <TouchableOpacity style={styles.typeButton} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.typeIcon, { backgroundColor: config.color + '15' }]}>
        <Text style={[styles.typeIconText, { color: config.color }]}>{config.icon}</Text>
      </View>
      <Text style={styles.typeLabel} numberOfLines={1}>{config.label}</Text>
    </TouchableOpacity>
  )
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active: { bg: colors.successLight, text: colors.success },
  paused: { bg: colors.warningLight, text: colors.warning },
  sold_out: { bg: colors.dangerLight, text: colors.danger },
  expired: { bg: colors.backgroundTertiary, text: colors.textSecondary },
  draft: { bg: colors.infoLight, text: colors.info },
}

export function HomeScreen({ stats, recentLinks, onCreatePress, onViewAllLinks, onLinkPress }: HomeScreenProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Payment Links</Text>
        <Text style={styles.subtitle}>Create, share, get paid</Text>
      </View>

      {/* Metrics */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsScroll} contentContainerStyle={styles.metricsContent}>
        <MetricCard title="Active Links" value={String(stats.activeLinks)} />
        <MetricCard title="Total Links" value={String(stats.totalLinks)} />
        <MetricCard title="Revenue" value={formatMoney({ amount: stats.totalRevenue, currency: 'USD' })} />
        <MetricCard title="Orders" value={String(stats.totalOrders)} />
      </ScrollView>

      {/* Quick Create */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Create a Link</Text>
          <TouchableOpacity onPress={onCreatePress}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.typeGrid}>
          <TypeButton type={LinkType.SimplePayment} onPress={onCreatePress} />
          <TypeButton type={LinkType.ItemSale} onPress={onCreatePress} />
          <TypeButton type={LinkType.EventTickets} onPress={onCreatePress} />
          <TypeButton type={LinkType.Donation} onPress={onCreatePress} />
        </View>
      </View>

      {/* Recent Links */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Links</Text>
          <TouchableOpacity onPress={onViewAllLinks}>
            <Text style={styles.seeAll}>View all</Text>
          </TouchableOpacity>
        </View>

        {recentLinks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>+</Text>
            <Text style={styles.emptyTitle}>No links yet</Text>
            <Text style={styles.emptySubtitle}>Create your first payment link to get started</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={onCreatePress}>
              <Text style={styles.emptyButtonText}>Create Link</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.linkList}>
            {recentLinks.slice(0, 5).map((link) => {
              const config = LINK_TYPE_CONFIGS[link.linkType]
              const statusColor = STATUS_COLORS[link.status] || STATUS_COLORS.active
              return (
                <TouchableOpacity
                  key={link.id}
                  style={styles.linkItem}
                  onPress={() => onLinkPress(link)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.linkIcon, { backgroundColor: config.color + '15' }]}>
                    <Text style={[styles.linkIconText, { color: config.color }]}>{config.icon}</Text>
                  </View>
                  <View style={styles.linkInfo}>
                    <View style={styles.linkNameRow}>
                      <Text style={styles.linkName} numberOfLines={1}>{link.name}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                        <Text style={[styles.statusText, { color: statusColor.text }]}>{link.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.linkMeta}>
                      {link.amount ? formatMoney(link.amount) : 'Variable'} · {config.label}
                    </Text>
                  </View>
                  <Text style={styles.linkTime}>{formatRelativeDate(link.createdAt)}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  content: { paddingBottom: 20 },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  greeting: { fontSize: fontSize.xxxl, fontWeight: fontWeight.bold, color: colors.textPrimary },
  subtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: 4 },
  metricsScroll: { backgroundColor: colors.background, paddingBottom: spacing.lg },
  metricsContent: { paddingHorizontal: spacing.xl, gap: spacing.md },
  metricCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    minWidth: 140,
  },
  metricValue: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.textPrimary },
  metricTitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 },
  section: {
    backgroundColor: colors.background,
    marginTop: spacing.sm,
    paddingVertical: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  seeAll: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.medium },
  typeGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  typeIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIconText: { fontSize: 22, fontWeight: fontWeight.bold },
  typeLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textPrimary, textAlign: 'center' },
  linkList: { paddingHorizontal: spacing.lg },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.md,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkIconText: { fontSize: 16, fontWeight: fontWeight.bold },
  linkInfo: { flex: 1, minWidth: 0 },
  linkNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  linkName: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.textPrimary, flexShrink: 1 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  linkMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  linkTime: { fontSize: fontSize.xs, color: colors.textTertiary },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: { fontSize: 48, color: colors.textTertiary, marginBottom: spacing.md },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  emptySubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' },
  emptyButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  emptyButtonText: { color: colors.textInverse, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
})
