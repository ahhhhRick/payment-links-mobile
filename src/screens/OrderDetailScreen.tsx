import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme'

interface OrderDetail {
  id: string
  linkName: string
  buyer: string
  email: string
  amount: string
  status: string
  date: string
  items: { name: string; qty: number; price: string }[]
  fulfillment: { type: string; status: string; tracking?: string }
  tip?: string
  tax?: string
  customFields?: { label: string; value: string }[]
}

interface OrderDetailScreenProps {
  order: OrderDetail
  onClose: () => void
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Paid: { bg: colors.successLight, text: colors.success },
  Shipped: { bg: colors.infoLight, text: colors.info },
  Refunded: { bg: colors.warningLight, text: colors.warning },
  Pending: { bg: colors.backgroundTertiary, text: colors.textSecondary },
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  )
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  )
}

export function OrderDetailScreen({ order, onClose }: OrderDetailScreenProps) {
  const statusColor = STATUS_COLORS[order.status] || STATUS_COLORS.Paid

  const handleRefund = () => {
    Alert.alert('Refund Order', `Issue a refund of ${order.amount} to ${order.buyer}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Refund', style: 'destructive', onPress: () => Alert.alert('Refunded', 'Refund processed (would call Square Refunds API)') },
    ])
  }

  const handleMarkFulfilled = () => {
    Alert.alert('Mark Fulfilled', 'Mark this order as fulfilled?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => Alert.alert('Done', 'Order marked as fulfilled (would call Orders API)') },
    ])
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryAmount}>{order.amount}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.statusText, { color: statusColor.text }]}>{order.status}</Text>
          </View>
          <Text style={styles.summaryDate}>{order.date}</Text>
          <Text style={styles.summaryLink}>From: {order.linkName}</Text>
        </View>

        {/* Buyer */}
        <Section title="Buyer">
          <Row label="Name" value={order.buyer} />
          <View style={styles.divider} />
          <Row label="Email" value={order.email} />
        </Section>

        {/* Items */}
        <Section title="Items">
          {order.items.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQty}>Qty: {item.qty}</Text>
                </View>
                <Text style={styles.itemPrice}>{item.price}</Text>
              </View>
            </React.Fragment>
          ))}
          {order.tax && (
            <>
              <View style={styles.divider} />
              <Row label="Tax" value={order.tax} />
            </>
          )}
          {order.tip && (
            <>
              <View style={styles.divider} />
              <Row label="Tip" value={order.tip} />
            </>
          )}
          <View style={styles.divider} />
          <Row label="Total" value={order.amount} valueColor={colors.textPrimary} />
        </Section>

        {/* Custom Fields */}
        {order.customFields && order.customFields.length > 0 && (
          <Section title="Custom Fields">
            {order.customFields.map((field, i) => (
              <React.Fragment key={i}>
                {i > 0 && <View style={styles.divider} />}
                <Row label={field.label} value={field.value} />
              </React.Fragment>
            ))}
          </Section>
        )}

        {/* Fulfillment */}
        <Section title="Fulfillment">
          <Row label="Type" value={order.fulfillment.type} />
          <View style={styles.divider} />
          <Row label="Status" value={order.fulfillment.status} />
          {order.fulfillment.tracking && (
            <>
              <View style={styles.divider} />
              <Row label="Tracking" value={order.fulfillment.tracking} />
            </>
          )}
        </Section>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleMarkFulfilled}>
            <Text style={styles.actionButtonText}>Mark as Fulfilled</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButtonDanger} onPress={handleRefund}>
            <Text style={styles.actionButtonDangerText}>Issue Refund</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingTop: 56, paddingBottom: spacing.md, backgroundColor: colors.background,
  },
  backButton: { fontSize: fontSize.md, color: colors.primary, fontWeight: fontWeight.medium },
  headerTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  content: { paddingBottom: 40 },
  summary: {
    alignItems: 'center', backgroundColor: colors.background,
    paddingVertical: spacing.xxl, paddingBottom: spacing.xxxl, gap: spacing.sm,
  },
  summaryAmount: { fontSize: 36, fontWeight: fontWeight.bold, color: colors.textPrimary },
  statusBadge: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.sm },
  statusText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  summaryDate: { fontSize: fontSize.sm, color: colors.textSecondary },
  summaryLink: { fontSize: fontSize.sm, color: colors.textTertiary },
  section: { paddingTop: spacing.xl, paddingHorizontal: spacing.lg },
  sectionTitle: {
    fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm, paddingHorizontal: spacing.xs,
  },
  sectionCard: { backgroundColor: colors.background, borderRadius: radius.lg, padding: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  rowLabel: { fontSize: fontSize.sm, color: colors.textSecondary },
  rowValue: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textPrimary, textAlign: 'right', flex: 1, marginLeft: spacing.xl },
  divider: { height: 1, backgroundColor: colors.borderLight },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  itemInfo: { flex: 1 },
  itemName: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textPrimary },
  itemQty: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  itemPrice: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  actions: { paddingHorizontal: spacing.lg, paddingTop: spacing.xxl, gap: spacing.sm },
  actionButton: {
    backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.lg, alignItems: 'center',
  },
  actionButtonText: { color: colors.textInverse, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  actionButtonDanger: {
    backgroundColor: colors.background, borderRadius: radius.md, paddingVertical: spacing.lg,
    alignItems: 'center', borderWidth: 1.5, borderColor: colors.danger,
  },
  actionButtonDangerText: { color: colors.danger, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
})
