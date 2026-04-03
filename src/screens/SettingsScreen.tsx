import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet } from 'react-native'
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme'

export function SettingsScreen() {
  const [defaultTipping, setDefaultTipping] = useState(false)
  const [autoDeactivateInvoices, setAutoDeactivateInvoices] = useState(true)
  const [autoDeactivateEvents, setAutoDeactivateEvents] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account */}
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Square Account</Text>
              <Text style={styles.rowValue}>Connected</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
          </View>
        </View>

        {/* Defaults */}
        <Text style={styles.sectionLabel}>Defaults</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Default Tipping</Text>
              <Text style={styles.rowHint}>Enable tipping on new links by default</Text>
            </View>
            <Switch
              value={defaultTipping}
              onValueChange={setDefaultTipping}
              trackColor={{ false: colors.backgroundTertiary, true: colors.primary + '40' }}
              thumbColor={defaultTipping ? colors.primary : colors.textTertiary}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.toggleRow}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Auto-deactivate Invoices</Text>
              <Text style={styles.rowHint}>Deactivate invoice links after first payment</Text>
            </View>
            <Switch
              value={autoDeactivateInvoices}
              onValueChange={setAutoDeactivateInvoices}
              trackColor={{ false: colors.backgroundTertiary, true: colors.primary + '40' }}
              thumbColor={autoDeactivateInvoices ? colors.primary : colors.textTertiary}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.toggleRow}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Auto-deactivate Events</Text>
              <Text style={styles.rowHint}>Deactivate event links after the event date</Text>
            </View>
            <Switch
              value={autoDeactivateEvents}
              onValueChange={setAutoDeactivateEvents}
              trackColor={{ false: colors.backgroundTertiary, true: colors.primary + '40' }}
              thumbColor={autoDeactivateEvents ? colors.primary : colors.textTertiary}
            />
          </View>
        </View>

        {/* Notifications */}
        <Text style={styles.sectionLabel}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Email Notifications</Text>
              <Text style={styles.rowHint}>Get notified when someone pays</Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: colors.backgroundTertiary, true: colors.primary + '40' }}
              thumbColor={emailNotifications ? colors.primary : colors.textTertiary}
            />
          </View>
        </View>

        {/* About */}
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
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
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  title: { fontSize: fontSize.xxxl, fontWeight: fontWeight.bold, color: colors.textPrimary },
  content: { flex: 1 },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  rowInfo: { flex: 1, marginRight: spacing.lg },
  rowLabel: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.textPrimary },
  rowValue: { fontSize: fontSize.md, color: colors.textSecondary },
  rowHint: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.borderLight, marginLeft: spacing.lg },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
})
