import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme'
import { LINK_TYPE_CONFIGS, type PaymentLink } from '../types'
import { formatMoney } from '../utils/format'

interface AnalyticsScreenProps {
  links: PaymentLink[]
}

type Period = '7d' | '30d' | '90d'

const SCREEN_WIDTH = Dimensions.get('window').width

// Simple bar chart using Views
function BarChart({ data, maxValue }: { data: { label: string; value: number }[]; maxValue: number }) {
  const barWidth = Math.floor((SCREEN_WIDTH - 80) / data.length) - 4
  return (
    <View style={chartStyles.container}>
      <View style={chartStyles.bars}>
        {data.map((item, i) => {
          const height = maxValue > 0 ? Math.max(4, (item.value / maxValue) * 120) : 4
          return (
            <View key={i} style={chartStyles.barCol}>
              <View style={[chartStyles.bar, { height, width: barWidth }]} />
              <Text style={chartStyles.barLabel}>{item.label}</Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

const chartStyles = StyleSheet.create({
  container: { paddingVertical: spacing.md },
  bars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 140 },
  barCol: { alignItems: 'center', gap: 4 },
  bar: { backgroundColor: colors.primary, borderRadius: 3, minHeight: 4 },
  barLabel: { fontSize: 10, color: colors.textTertiary },
})

function MetricCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </View>
  )
}

function TypeBreakdown({ links }: { links: PaymentLink[] }) {
  const breakdown: Record<string, { count: number; revenue: number }> = {}
  links.forEach((link) => {
    if (!breakdown[link.linkType]) breakdown[link.linkType] = { count: 0, revenue: 0 }
    breakdown[link.linkType]!.count++
    breakdown[link.linkType]!.revenue += link.totalRevenue.amount
  })

  const sorted = Object.entries(breakdown).sort((a, b) => b[1].revenue - a[1].revenue)

  return (
    <View style={styles.breakdownList}>
      {sorted.map(([type, data]) => {
        const config = LINK_TYPE_CONFIGS[type as keyof typeof LINK_TYPE_CONFIGS]
        if (!config) return null
        return (
          <View key={type} style={styles.breakdownRow}>
            <View style={[styles.breakdownIcon, { backgroundColor: config.color + '15' }]}>
              <Text style={[styles.breakdownIconText, { color: config.color }]}>{config.icon}</Text>
            </View>
            <View style={styles.breakdownInfo}>
              <Text style={styles.breakdownLabel}>{config.label}</Text>
              <Text style={styles.breakdownMeta}>{data.count} links</Text>
            </View>
            <Text style={styles.breakdownValue}>{formatMoney({ amount: data.revenue, currency: 'USD' })}</Text>
          </View>
        )
      })}
    </View>
  )
}

export function AnalyticsScreen({ links }: AnalyticsScreenProps) {
  const [period, setPeriod] = useState<Period>('30d')

  const totalRevenue = links.reduce((sum, l) => sum + l.totalRevenue.amount, 0)
  const totalOrders = links.reduce((sum, l) => sum + l.totalOrders, 0)
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const topLink = [...links].sort((a, b) => b.totalRevenue.amount - a.totalRevenue.amount)[0]

  // Generate chart data (simulated daily revenue for the period)
  const days = period === '7d' ? 7 : period === '30d' ? 7 : 12
  const labels = period === '90d'
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].slice(0, days)
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].slice(0, days)

  const chartData = labels.map((label, i) => ({
    label,
    value: Math.floor(totalRevenue / days * (0.5 + Math.random())),
  }))
  const maxChart = Math.max(...chartData.map(d => d.value), 1)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <View style={styles.periodPicker}>
          {(['7d', '30d', '90d'] as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodButton, period === p && styles.periodButtonActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <MetricCard title="Revenue" value={formatMoney({ amount: totalRevenue, currency: 'USD' })} />
          <MetricCard title="Orders" value={String(totalOrders)} />
          <MetricCard title="Avg. Order" value={formatMoney({ amount: avgOrderValue, currency: 'USD' })} />
          <MetricCard title="Active Links" value={String(links.filter(l => l.status === 'active').length)} />
        </View>

        {/* Revenue Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Revenue Over Time</Text>
          <BarChart data={chartData} maxValue={maxChart} />
        </View>

        {/* Top Link */}
        {topLink && (
          <View style={styles.topLinkCard}>
            <Text style={styles.topLinkLabel}>Top Performing Link</Text>
            <View style={styles.topLinkRow}>
              <View style={[styles.topLinkIcon, { backgroundColor: LINK_TYPE_CONFIGS[topLink.linkType].color + '15' }]}>
                <Text style={{ color: LINK_TYPE_CONFIGS[topLink.linkType].color, fontWeight: fontWeight.bold, fontSize: 16 }}>
                  {LINK_TYPE_CONFIGS[topLink.linkType].icon}
                </Text>
              </View>
              <View style={styles.topLinkInfo}>
                <Text style={styles.topLinkName}>{topLink.name}</Text>
                <Text style={styles.topLinkMeta}>{topLink.totalOrders} orders</Text>
              </View>
              <Text style={styles.topLinkRevenue}>{formatMoney(topLink.totalRevenue)}</Text>
            </View>
          </View>
        )}

        {/* Type Breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Revenue by Type</Text>
          <TypeBreakdown links={links} />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  header: {
    paddingHorizontal: spacing.xl, paddingTop: 60, paddingBottom: spacing.md, backgroundColor: colors.background,
  },
  title: { fontSize: fontSize.xxxl, fontWeight: fontWeight.bold, color: colors.textPrimary },
  periodPicker: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.md },
  periodButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.sm, backgroundColor: colors.backgroundSecondary },
  periodButtonActive: { backgroundColor: colors.primary },
  periodText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary },
  periodTextActive: { color: colors.textInverse },
  content: { padding: spacing.lg, gap: spacing.md },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metricCard: {
    flex: 1, minWidth: '45%', backgroundColor: colors.background, borderRadius: radius.lg, padding: spacing.lg,
  },
  metricTitle: { fontSize: fontSize.xs, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  metricValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary, marginTop: 4 },
  metricSubtitle: { fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 2 },
  chartCard: { backgroundColor: colors.background, borderRadius: radius.lg, padding: spacing.lg },
  chartTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  topLinkCard: { backgroundColor: colors.background, borderRadius: radius.lg, padding: spacing.lg },
  topLinkLabel: { fontSize: fontSize.xs, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md },
  topLinkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  topLinkIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  topLinkInfo: { flex: 1 },
  topLinkName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  topLinkMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  topLinkRevenue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary },
  breakdownCard: { backgroundColor: colors.background, borderRadius: radius.lg, padding: spacing.lg },
  breakdownTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing.md },
  breakdownList: { gap: spacing.sm },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  breakdownIcon: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  breakdownIconText: { fontSize: 14, fontWeight: fontWeight.bold },
  breakdownInfo: { flex: 1 },
  breakdownLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textPrimary },
  breakdownMeta: { fontSize: fontSize.xs, color: colors.textSecondary },
  breakdownValue: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textPrimary },
})
