import React, { useRef, useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  ScrollView,
  Share,
} from 'react-native'
import { BlurView } from 'expo-blur'
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme'
import { LINK_TYPE_CONFIGS, type PaymentLink } from '../types'
import { formatMoney } from '../utils/format'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.871)
const CARD_HEIGHT = 557
const CARD_GAP = -4
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP
const SIDE_INSET = (SCREEN_WIDTH - CARD_WIDTH) / 2
const IMAGE_HEIGHT = Math.round(CARD_HEIGHT * 0.46) // ~254px

type ViewMode = 'carousel' | 'rows'

const SEG_W   = 72
const SEG_H   = 32
const SEG_PAD = 2
const SEG_GAP = 0

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

function formatRevenue(cents: number) {
  const dollars = Math.floor(cents / 100)
  const rem = cents % 100
  return {
    whole: '$' + dollars.toLocaleString('en-US'),
    cents: '.' + rem.toString().padStart(2, '0'),
  }
}

function padIndex(n: number) {
  return (n + 1).toString().padStart(2, '0') + '.'
}

// ─── Individual card ─────────────────────────────────────────────────────────

interface CardProps {
  link: PaymentLink
  index: number
  scrollX: Animated.Value
  onPress: () => void
}

function LinkCard({ link, index, scrollX, onPress }: CardProps) {
  const config = LINK_TYPE_CONFIGS[link.linkType]

  const inputRange = [
    (index - 1) * SNAP_INTERVAL,
    index * SNAP_INTERVAL,
    (index + 1) * SNAP_INTERVAL,
  ]

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.88, 1, 0.88],
    extrapolate: 'clamp',
  })

  const expandedOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  })

  const condensedOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [1, 0, 1],
    extrapolate: 'clamp',
  })

  const price = link.amount ? formatMoney(link.amount) : 'Variable'

  return (
    <Animated.View
      style={[
        styles.cardShadow,
        { width: CARD_WIDTH, height: CARD_HEIGHT, transform: [{ scale }] },
      ]}
    >
      <TouchableOpacity
        style={[StyleSheet.absoluteFill, styles.cardInner]}
        onPress={onPress}
        activeOpacity={0.97}
      >
        {/* ── Image — rendered ONCE, always visible ── */}
        <View style={styles.cardImageInset}>
          {link.imageUri ? (
            <Image
              source={{ uri: link.imageUri }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.cardImagePlaceholder, { backgroundColor: config.color + '18' }]}>
              <Text style={[styles.cardImageBigIcon, { color: config.color }]}>{config.icon}</Text>
            </View>
          )}

          {/* Price pill — top left */}
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: expandedOpacity }]} pointerEvents="none">
            <View style={styles.cardPricePill}>
              <Text style={styles.cardPricePillText}>{price}</Text>
            </View>
          </Animated.View>

        </View>

        {/* ── Expanded content below image ── */}
        <Animated.View style={[styles.cardBody, { opacity: expandedOpacity }]} pointerEvents="box-none">
          <Text style={styles.cardName} numberOfLines={2}>{link.name}</Text>
          {link.description ? (
            <Text style={styles.cardDesc} numberOfLines={2}>{link.description}</Text>
          ) : null}
          <Text style={styles.cardPrice}>{price}</Text>
        </Animated.View>

        {/* ── Share button — always anchored to card bottom ── */}
        <Animated.View style={[styles.cardShareWrapper, { opacity: expandedOpacity }]} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.cardPayBtn}
            activeOpacity={0.85}
            onPress={() => Share.share({ message: link.name, url: link.url })}
          >
            <Text style={styles.cardPayBtnText}>Share  ↗</Text>
          </TouchableOpacity>
        </Animated.View>

      </TouchableOpacity>
    </Animated.View>
  )
}


// ─── Rows view ────────────────────────────────────────────────────────────────

interface RowItemProps {
  link: PaymentLink
  onPress: () => void
  isLast: boolean
}

function RowItem({ link, onPress, isLast }: RowItemProps) {
  const config = LINK_TYPE_CONFIGS[link.linkType]
  const price = link.amount ? formatMoney(link.amount) : 'Variable'
  const isActive = link.status === 'active'

  return (
    <TouchableOpacity
      style={[styles.rowItem, !isLast && styles.rowItemDivider]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {link.imageUri ? (
        <Image source={{ uri: link.imageUri }} style={styles.rowThumb} resizeMode="cover" />
      ) : (
        <View style={[styles.rowThumb, styles.rowThumbPlaceholder, { backgroundColor: config.color + '18' }]}>
          <Text style={{ fontSize: 18, color: config.color }}>{config.icon}</Text>
        </View>
      )}
      <Text style={styles.rowName} numberOfLines={1}>{link.name}</Text>
      <Text style={styles.rowPrice} numberOfLines={1}>{price}</Text>
      <View style={[styles.rowStatusDot, { backgroundColor: isActive ? '#34C759' : colors.textTertiary }]} />
      <Text style={styles.rowChevron}>›</Text>
    </TouchableOpacity>
  )
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export function HomeScreen({
  stats,
  recentLinks,
  onCreatePress,
  onViewAllLinks,
  onLinkPress,
}: HomeScreenProps) {
  const scrollX = useRef(new Animated.Value(0)).current
  const revenue = formatRevenue(stats.totalRevenue)
  const [viewMode, setViewMode] = useState<ViewMode>('carousel')
  const [focusedIndex, setFocusedIndex] = useState(0)

  // Reset scroll position when returning to carousel so cards don't flash condensed state
  useEffect(() => {
    if (viewMode === 'carousel') {
      scrollX.setValue(0)
      setFocusedIndex(0)
    }
  }, [viewMode])

  const handleScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL)
    setFocusedIndex(Math.max(0, Math.min(index, recentLinks.length - 1)))
  }


  return (
    <View style={styles.container}>
      {/* Header with liquid glass segmented control */}
      <View style={styles.revenueHero}>
        <View style={styles.revenueHeroRow}>
          <View style={styles.revenueHeroLeft} />
          <View style={styles.revenueCenter}>
            {/* Liquid glass segmented control */}
            <BlurView intensity={50} tint="light" style={styles.segmented}>
              <View style={styles.segmentedHighlight} pointerEvents="none" />
              <Animated.View
                style={[
                  styles.segmentedIndicator,
                  { transform: [{ translateX: viewMode === 'carousel' ? 0 : SEG_W + SEG_GAP }] },
                ]}
              >
                <BlurView intensity={85} tint="light" style={styles.segmentedIndicatorBlur} />
              </Animated.View>
              {([['carousel', 'Cards'], ['rows', 'List']] as [ViewMode, string][]).map(([mode, label]) => (
                <TouchableOpacity
                  key={mode}
                  style={styles.segmentedTab}
                  onPress={() => setViewMode(mode)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.segmentedLabel, viewMode === mode && styles.segmentedLabelActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </BlurView>
          </View>
          <View style={styles.revenueHeroLeft} />
        </View>
      </View>

      {/* Content or empty state */}
      {recentLinks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No links yet</Text>
          <Text style={styles.emptyBody}>Create your first payment link to get started</Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={onCreatePress}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaButtonText}>Create link</Text>
          </TouchableOpacity>
        </View>
      ) : viewMode === 'list' ? (
        /* ── List view ── */
        <ScrollView style={styles.listSection} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {Object.entries(
            recentLinks.reduce<Record<string, PaymentLink[]>>((acc, link) => {
              ;(acc[link.linkType] = acc[link.linkType] || []).push(link)
              return acc
            }, {})
          ).map(([linkType, links]) => {
            const config = LINK_TYPE_CONFIGS[linkType as keyof typeof LINK_TYPE_CONFIGS]
            return (
              <View key={linkType} style={styles.typeModule}>
                {/* Module header */}
                <View style={[styles.typeModuleHeader, { backgroundColor: config.color + '14' }]}>
                  <Text style={styles.typeModuleIcon}>{config.icon}</Text>
                  <Text style={[styles.typeModuleLabel, { color: config.color }]}>{config.label}</Text>
                  <Text style={styles.typeModuleCount}>{links.length}</Text>
                </View>
                {/* Links in this type */}
                {links.map((link, index) => {
                  const isLast = index === links.length - 1
                  return (
                    <TouchableOpacity
                      key={link.id}
                      style={[styles.cell, !isLast && styles.cellDivider]}
                      onPress={() => onLinkPress(link)}
                      activeOpacity={0.7}
                    >
                      {link.imageUri ? (
                        <Image source={{ uri: link.imageUri }} style={styles.cellThumb} resizeMode="cover" />
                      ) : (
                        <View style={[styles.cellIcon, { backgroundColor: config.color + '20' }]}>
                          <Text style={{ fontSize: 20, color: config.color }}>{config.icon}</Text>
                        </View>
                      )}
                      <View style={styles.cellContent}>
                        <Text style={styles.cellLabel} numberOfLines={1}>{link.name}</Text>
                        <Text style={styles.cellBody} numberOfLines={1}>
                          {link.amount ? formatMoney(link.amount) : 'Variable'}
                        </Text>
                      </View>
                      <Text style={styles.cellChevron}>›</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            )
          })}
        </ScrollView>
      ) : viewMode === 'rows' ? (
        /* ── Rows view ── */
        <ScrollView style={styles.rowsSection} contentContainerStyle={styles.rowsContent} showsVerticalScrollIndicator={false}>
          {recentLinks.map((link, index) => (
            <RowItem
              key={link.id}
              link={link}
              onPress={() => onLinkPress(link)}
              isLast={index === recentLinks.length - 1}
            />
          ))}
        </ScrollView>
      ) : (
        /* ── Carousel view (default) ── */
        <View style={styles.carouselSection}>
          {/* Animated horizontal scroll carousel */}
          <Animated.ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={SNAP_INTERVAL}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: SIDE_INSET }}
            style={styles.carousel}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
            onMomentumScrollEnd={handleScrollEnd}
          >
            {recentLinks.map((link, index) => (
              <LinkCard
                key={link.id}
                link={link}
                index={index}
                scrollX={scrollX}
                onPress={() => onLinkPress(link)}
              />
            ))}
          </Animated.ScrollView>

          {/* Edit affordance */}
          <TouchableOpacity
            style={styles.editAffordance}
            onPress={() => recentLinks[focusedIndex] && onLinkPress(recentLinks[focusedIndex])}
            activeOpacity={0.7}
          >
            <Text style={styles.editAffordanceText}>Edit link</Text>
          </TouchableOpacity>

        </View>
      )}

    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── Revenue hero ────────────────────────────────────────────────────────────
  revenueHero: {
    paddingTop: 60 + spacing.lg,
    paddingBottom: spacing.xl,
    zIndex: 10,
  },
  segmented: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    padding: SEG_PAD,
    gap: SEG_GAP,
    overflow: 'hidden',
  },
  segmentedHighlight: {
    position: 'absolute',
    top: 0,
    left: 10,
    right: 10,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: radius.full,
    zIndex: 5,
  },
  segmentedIndicator: {
    position: 'absolute',
    left: SEG_PAD,
    width: SEG_W,
    height: SEG_H,
    borderRadius: radius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  segmentedIndicatorBlur: {
    flex: 1,
    borderRadius: radius.full,
  },
  segmentedTab: {
    width: SEG_W,
    height: SEG_H,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  segmentedLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: 'rgba(60,60,80,0.45)',
    letterSpacing: -0.1,
  },
  segmentedLabelActive: {
    color: 'rgba(20,20,40,0.88)',
    fontWeight: fontWeight.semibold,
  },
  revenueHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  revenueHeroLeft: {
    width: 44,
  },
  revenueCenter: {
    flex: 1,
    alignItems: 'center',
  },
  viewToggle: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleIcon: {
    fontSize: 18,
    color: colors.textPrimary,
  },
  revenueDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xxl,
  },
  revenueLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  revenueAmountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  revenueWhole: {
    fontSize: 46,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -1.5,
    lineHeight: 50,
  },
  revenueCents: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  revenueOrders: {
    fontSize: fontSize.md,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },

  // ── Carousel section ────────────────────────────────────────────────────────
  carouselSection: {
    marginVertical: -80,
    marginTop: -80,
  },
  carousel: {
    paddingVertical: 80,
    flexGrow: 0,
  },

  // ── Rows section ─────────────────────────────────────────────────────────────
  rowsSection: {
    flex: 1,
  },
  rowsContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 120,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  rowItemDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowThumb: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    flexShrink: 0,
  },
  rowThumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowName: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    minWidth: 0,
  },
  rowPrice: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flexShrink: 0,
  },
  rowStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    flexShrink: 0,
  },
  rowChevron: {
    fontSize: 18,
    color: colors.textTertiary,
    flexShrink: 0,
  },

  // ── List view ─────────────────────────────────────────────────────────────
  listSection: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 120,
    gap: spacing.md,
  },
  typeModule: {
    backgroundColor: colors.surfaceDefault,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  typeModuleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  typeModuleIcon: {
    fontSize: 16,
  },
  typeModuleLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typeModuleCount: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    fontWeight: fontWeight.medium,
  },
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.lg,
    minHeight: 72,
  },
  cellDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  cellThumb: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceDefault,
    flexShrink: 0,
  },
  cellIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cellContent: {
    flex: 1,
    minWidth: 0,
  },
  cellLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  cellBody: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cellChevron: {
    fontSize: 20,
    color: colors.textTertiary,
  },

  editAffordance: {
    position: 'absolute',
    top: 80 + CARD_HEIGHT + spacing.xl,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  editAffordanceText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },

  // ── Card shadow wrapper (no overflow:hidden so shadow renders) ───────────────
  cardShadow: {
    marginRight: CARD_GAP,
    borderRadius: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 20,
  },

  // ── Card inner (clips image to rounded corners) ───────────────────────────
  cardInner: {
    borderRadius: 36,
    backgroundColor: colors.surfaceDefault,
    overflow: 'hidden',
  },

  // ── Inset image ───────────────────────────────────────────────────────────
  cardImageInset: {
    margin: 10,
    borderRadius: 26,
    height: CARD_WIDTH - 20,
    overflow: 'hidden',
    backgroundColor: colors.backgroundTertiary,
  },
  cardImagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImageBigIcon: {
    fontSize: 56,
  },
  cardTypeBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.88)',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  cardTypeBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  cardPricePill: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.82)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  cardPricePillText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  cardIconCircle: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconCircleText: {
    fontSize: 18,
  },

  // ── Expanded content ──────────────────────────────────────────────────────
  cardBody: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  cardShareWrapper: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.xl,
    right: spacing.xl,
  },
  cardName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  cardDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  cardPrice: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  cardPayBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPayBtnText: {
    color: colors.primaryText,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.2,
  },

  // ── Condensed state ───────────────────────────────────────────────────────
  cardCondensedImageOverlay: {
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  cardIndexNum: {
    fontSize: 64,
    fontWeight: fontWeight.bold,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: -3,
    lineHeight: 68,
  },

  // ── Empty state ─────────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  emptyBody: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  ctaButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 14,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  ctaButtonText: {
    color: colors.primaryText,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
})
