import React, { useState, useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, FlatList, Animated, Alert,
} from 'react-native'
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme'

interface OnboardingScreenProps {
  onConnect: () => void
  onSkipDemo: () => void
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const SLIDES = [
  {
    icon: '+',
    iconColor: colors.primary,
    title: 'Create Payment Links',
    subtitle: 'Generate shareable links for any type of payment — products, events, donations, services, and more.',
  },
  {
    icon: '\u2197',
    iconColor: '#00A86B',
    title: 'Share Anywhere',
    subtitle: 'Send links via text, email, social media, or QR code. Your customers pay with a single tap.',
  },
  {
    icon: '$',
    iconColor: '#9B59B6',
    title: 'Track Everything',
    subtitle: 'See orders, revenue, and analytics for every link. Know exactly how your business is performing.',
  },
]

function Slide({ item }: { item: typeof SLIDES[0] }) {
  return (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <View style={[styles.slideIcon, { backgroundColor: item.iconColor + '15' }]}>
        <Text style={[styles.slideIconText, { color: item.iconColor }]}>{item.icon}</Text>
      </View>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
    </View>
  )
}

export function OnboardingScreen({ onConnect, onSkipDemo }: OnboardingScreenProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH)
    setActiveIndex(index)
  }

  const handleConnect = () => {
    Alert.alert(
      'Connect Square',
      'This will open the Square authorization page. You\'ll need a Square Developer account with OAuth credentials configured.\n\nFor now, tap "Try Demo" to explore with sample data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Try Demo', onPress: onSkipDemo },
        { text: 'Connect', onPress: onConnect },
      ]
    )
  }

  return (
    <View style={styles.container}>
      {/* Slides */}
      <View style={styles.slidesContainer}>
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={({ item }) => <Slide item={item} />}
          keyExtractor={(_, index) => String(index)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />

        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Bottom */}
      <View style={styles.bottom}>
        <Text style={styles.brandTitle}>Payment Links</Text>
        <Text style={styles.brandSubtitle}>Powered by Square</Text>

        <TouchableOpacity style={styles.connectButton} onPress={handleConnect} activeOpacity={0.8}>
          <Text style={styles.connectButtonText}>Connect your Square account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.demoButton} onPress={onSkipDemo} activeOpacity={0.7}>
          <Text style={styles.demoButtonText}>Try with demo data</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  slidesContainer: { flex: 1, justifyContent: 'center' },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  slideIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  slideIconText: { fontSize: 40, fontWeight: fontWeight.bold },
  slideTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  slideSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.backgroundTertiary,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  bottom: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: 50,
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  connectButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  connectButtonText: {
    color: colors.textInverse,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  demoButton: {
    paddingVertical: spacing.md,
  },
  demoButtonText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
})
