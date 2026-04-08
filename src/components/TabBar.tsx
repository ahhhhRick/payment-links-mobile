import React, { useRef, useEffect, useState } from 'react'
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import { radius, spacing, fontSize, fontWeight } from '../utils/theme'
import type { AppTab } from '../types'

interface TabBarProps {
  activeTab: AppTab
  onTabPress: (tab: AppTab) => void
  collapsed?: boolean
}

const TABS: {
  key: AppTab
  label: string
  icon: keyof typeof Ionicons.glyphMap
  iconActive: keyof typeof Ionicons.glyphMap
}[] = [
  { key: 'home',     label: 'Home',   icon: 'home-outline',                        iconActive: 'home' },
  { key: 'create',   label: 'New',    icon: 'add-circle-outline',                  iconActive: 'add-circle' },
  { key: 'orders',   label: 'Orders', icon: 'receipt-outline',                     iconActive: 'receipt' },
  { key: 'settings', label: 'More',   icon: 'settings-outline',  iconActive: 'settings' },
]

const TAB_W       = 72
const TAB_H       = 52
const PAD         = 5
const GAP         = 2

export function TabBar({ activeTab, onTabPress, collapsed = false }: TabBarProps) {
  const activeIndex = TABS.findIndex(t => t.key === activeTab)

  // Indicator slide
  const translateX = useRef(new Animated.Value(activeIndex * (TAB_W + GAP))).current
  const scaleX     = useRef(new Animated.Value(1)).current

  // Collapse animation
  const collapseAnim = useRef(new Animated.Value(collapsed ? 0 : 1)).current

  useEffect(() => {
    const toX = activeIndex * (TAB_W + GAP)
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: toX,
        useNativeDriver: true,
        damping: 22,
        stiffness: 220,
        mass: 0.75,
      }),
      Animated.sequence([
        Animated.spring(scaleX, {
          toValue: 1.22,
          useNativeDriver: true,
          damping: 8,
          stiffness: 400,
          mass: 0.4,
        }),
        Animated.spring(scaleX, {
          toValue: 1,
          useNativeDriver: true,
          damping: 14,
          stiffness: 260,
          mass: 0.6,
        }),
      ]),
    ]).start()
  }, [activeIndex])

  useEffect(() => {
    Animated.spring(collapseAnim, {
      toValue: collapsed ? 0 : 1,
      useNativeDriver: false,
      damping: 20,
      stiffness: 200,
    }).start()
  }, [collapsed])

  // When collapsed, only show the active tab — pill shrinks to one item width
  const pillWidth = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [TAB_W + PAD * 2, TABS.length * TAB_W + (TABS.length - 1) * GAP + PAD * 2],
  })

  const inactivesOpacity = collapseAnim

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <Animated.View style={[styles.pillShadow, { width: pillWidth }]}>
        <BlurView intensity={60} tint="systemChromeMaterialLight" style={styles.pill}>
          {/* Top specular highlight */}
          <View style={styles.highlight} pointerEvents="none" />

          {/* Sliding glass indicator */}
          <Animated.View
            style={[
              styles.indicatorWrap,
              { transform: [{ translateX }, { scaleX }] },
            ]}
          >
            <BlurView intensity={85} tint="light" style={styles.indicator} />
          </Animated.View>

          {/* Tabs */}
          {TABS.map((tab, i) => {
            const isActive = activeTab === tab.key
            const isHidden = collapsed && !isActive

            return (
              <Animated.View
                key={tab.key}
                style={[
                  styles.tabWrap,
                  !isActive && { opacity: inactivesOpacity },
                  isHidden && { width: 0, overflow: 'hidden' },
                ]}
              >
                <TouchableOpacity
                  style={styles.tab}
                  onPress={() => onTabPress(tab.key)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isActive ? tab.iconActive : tab.icon}
                    size={22}
                    color={isActive ? 'rgba(20,20,40,0.9)' : 'rgba(60,60,80,0.42)'}
                  />
                </TouchableOpacity>
              </Animated.View>
            )
          })}
        </BlurView>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 34,
    paddingTop: spacing.sm,
  },
  pillShadow: {
    borderRadius: radius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    padding: PAD,
    gap: GAP,
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: radius.full,
    zIndex: 10,
  },
  indicatorWrap: {
    position: 'absolute',
    left: PAD,
    width: TAB_W,
    height: TAB_H,
    borderRadius: radius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
  },
  indicator: {
    flex: 1,
    borderRadius: radius.full,
  },
  tabWrap: {
    width: TAB_W,
    height: TAB_H,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(60,60,80,0.42)',
    letterSpacing: 0.1,
  },
  labelActive: {
    color: 'rgba(20,20,40,0.9)',
    fontWeight: '600',
  },
})
