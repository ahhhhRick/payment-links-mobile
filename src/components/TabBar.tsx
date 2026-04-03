import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { colors, fontSize, spacing } from '../utils/theme'
import type { AppTab } from '../types'

interface TabBarProps {
  activeTab: AppTab
  onTabPress: (tab: AppTab) => void
}

const TABS: { key: AppTab; label: string; icon: string }[] = [
  { key: 'home', label: 'Home', icon: '\u2302' },
  { key: 'links', label: 'Links', icon: '\u26D3' },
  { key: 'create', label: 'Create', icon: '+' },
  { key: 'orders', label: 'Orders', icon: '\u2630' },
  { key: 'settings', label: 'Settings', icon: '\u2699' },
]

export function TabBar({ activeTab, onTabPress }: TabBarProps) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key
        const isCreate = tab.key === 'create'

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            {isCreate ? (
              <View style={styles.createButton}>
                <Text style={styles.createIcon}>+</Text>
              </View>
            ) : (
              <>
                <Text style={[styles.icon, isActive && styles.iconActive]}>
                  {tab.icon}
                </Text>
                <Text style={[styles.label, isActive && styles.labelActive]}>
                  {tab.label}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 20,
    paddingTop: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  icon: {
    fontSize: 20,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  iconActive: {
    color: colors.primary,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  labelActive: {
    color: colors.primary,
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createIcon: {
    fontSize: 28,
    color: colors.textInverse,
    fontWeight: '300',
    marginTop: -2,
  },
})
