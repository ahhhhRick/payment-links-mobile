import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme'

const SAMPLE_ORDERS = [
  { id: '1', linkName: 'Guitar Lesson', buyer: 'Sarah M.', amount: '$75.00', status: 'Paid', date: 'Today, 2:30 PM' },
  { id: '2', linkName: 'Summer Jazz Night', buyer: 'James K.', amount: '$70.00', status: 'Paid', date: 'Today, 11:15 AM' },
  { id: '3', linkName: 'Hand-Painted Mug', buyer: 'Emily R.', amount: '$22.00', status: 'Shipped', date: 'Yesterday' },
  { id: '4', linkName: 'Animal Rescue Fund', buyer: 'Anonymous', amount: '$50.00', status: 'Paid', date: 'Yesterday' },
  { id: '5', linkName: 'Summer Jazz Night', buyer: 'Lisa T.', amount: '$35.00', status: 'Paid', date: '2 days ago' },
  { id: '6', linkName: 'Guitar Lesson', buyer: 'Mike D.', amount: '$75.00', status: 'Refunded', date: '3 days ago' },
]

const ORDER_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Paid: { bg: colors.successLight, text: colors.success },
  Shipped: { bg: colors.infoLight, text: colors.info },
  Refunded: { bg: colors.warningLight, text: colors.warning },
}

interface OrdersScreenProps {
  onOrderPress?: (order: any) => void
  totalRevenue?: number
}

function formatBalance(cents: number) {
  const dollars = Math.floor(cents / 100)
  const rem = cents % 100
  return '$' + dollars.toLocaleString('en-US') + '.' + rem.toString().padStart(2, '0')
}

export function OrdersScreen({ onOrderPress, totalRevenue = 0 }: OrdersScreenProps = {}) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text style={styles.balanceAmount}>{formatBalance(totalRevenue)}</Text>
        <Text style={styles.subtitle}>{SAMPLE_ORDERS.length} recent orders</Text>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {SAMPLE_ORDERS.map((order) => {
          const statusColor = ORDER_STATUS_COLORS[order.status] || ORDER_STATUS_COLORS.Paid
          return (
            <TouchableOpacity key={order.id} style={styles.orderCard} onPress={() => onOrderPress?.({
              ...order,
              email: 'customer@example.com',
              items: [{ name: order.linkName, qty: 1, price: order.amount }],
              fulfillment: { type: 'Simple', status: order.status === 'Shipped' ? 'Shipped' : 'Pending' },
              tip: order.amount.includes('75') ? '$11.25' : undefined,
              tax: '$2.10',
            })} activeOpacity={0.7}>
              <View style={styles.orderTop}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderLink}>{order.linkName}</Text>
                  <Text style={styles.orderBuyer}>{order.buyer}</Text>
                </View>
                <View style={styles.orderRight}>
                  <Text style={styles.orderAmount}>{order.amount}</Text>
                  <View style={[styles.orderStatus, { backgroundColor: statusColor.bg }]}>
                    <Text style={[styles.orderStatusText, { color: statusColor.text }]}>{order.status}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.orderDate}>{order.date}</Text>
            </TouchableOpacity>
          )
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  balanceLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.sm },
  balanceAmount: { fontSize: 46, fontWeight: fontWeight.bold, color: colors.textPrimary, letterSpacing: -1.5, lineHeight: 50 },
  title: { fontSize: fontSize.xxxl, fontWeight: fontWeight.bold, color: colors.textPrimary },
  subtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: 8 },
  list: { flex: 1 },
  listContent: { padding: spacing.lg, gap: spacing.sm },
  orderCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderInfo: { flex: 1 },
  orderLink: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  orderBuyer: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  orderRight: { alignItems: 'flex-end' },
  orderAmount: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary },
  orderStatus: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm, marginTop: 4 },
  orderStatusText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  orderDate: { fontSize: fontSize.xs, color: colors.textTertiary, marginTop: spacing.sm },
})
