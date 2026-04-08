import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Share, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { TabBar } from './src/components/TabBar'
import { HomeScreen } from './src/screens/HomeScreen'
import { CreateScreen } from './src/screens/CreateScreen'
import { LinksScreen } from './src/screens/LinksScreen'
import { OrdersScreen } from './src/screens/OrdersScreen'
import { SettingsScreen } from './src/screens/SettingsScreen'
import { ShareScreen } from './src/screens/ShareScreen'
import { LinkDetailScreen } from './src/screens/LinkDetailScreen'
import { OnboardingScreen } from './src/screens/OnboardingScreen'
import { OrderDetailScreen } from './src/screens/OrderDetailScreen'
import { AnalyticsScreen } from './src/screens/AnalyticsScreen'
import { TemplatesScreen, type Template } from './src/screens/TemplatesScreen'
import { useStore } from './src/hooks/useStore'
import { storage, STORAGE_KEYS } from './src/utils/storage'
import type { AppTab, PaymentLink } from './src/types'

type Screen =
  | { type: 'tab'; tab: AppTab }
  | { type: 'share'; link: PaymentLink }
  | { type: 'detail'; link: PaymentLink; returnTab: AppTab }
  | { type: 'orderDetail'; order: any }
  | { type: 'analytics' }
  | { type: 'templates' }
  | { type: 'onboarding' }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ type: 'onboarding' })
  const store = useStore()

  // Check if user has onboarded before
  useEffect(() => {
    storage.get<boolean>(STORAGE_KEYS.ONBOARDED).then((val) => {
      if (val) setScreen({ type: 'tab', tab: 'home' })
    })
  }, [])

  // Save wizard draft on changes
  useEffect(() => {
    if (store.wizard.name || store.wizard.linkType) {
      storage.set(STORAGE_KEYS.WIZARD_DRAFT, store.wizard)
    }
  }, [store.wizard])

  const activeTab = screen.type === 'tab' ? screen.tab : 'home'

  const goTab = (tab: AppTab) => setScreen({ type: 'tab', tab })
  const goShare = (link: PaymentLink) => setScreen({ type: 'share', link })
  const goDetail = (link: PaymentLink) => setScreen({ type: 'detail', link, returnTab: activeTab })

  const handleCreateLink = (link: PaymentLink) => {
    store.addLink(link)
    storage.remove(STORAGE_KEYS.WIZARD_DRAFT)
    goShare(link)
  }

  const handleOnboard = () => {
    storage.set(STORAGE_KEYS.ONBOARDED, true)
    goTab('home')
  }

  const handleSelectTemplate = (template: Template) => {
    store.resetWizard()
    store.updateWizard({
      linkType: template.config.linkType || template.linkType,
      step: 1,
      ...template.config,
    })
    goTab('create')
  }

  // Onboarding
  if (screen.type === 'onboarding') {
    return (
      <OnboardingScreen
        onConnect={() => {
          Alert.alert('OAuth', 'Square OAuth flow would open here. Using demo data for now.')
          handleOnboard()
        }}
        onSkipDemo={handleOnboard}
      />
    )
  }

  // Share screen
  if (screen.type === 'share') {
    return <ShareScreen link={screen.link} onClose={() => goTab('home')} />
  }

  // Link detail
  if (screen.type === 'detail') {
    const link = screen.link
    const returnTab = screen.returnTab
    return (
      <LinkDetailScreen
        link={link}
        onClose={() => goTab(returnTab)}
        onShare={() => goShare(link)}
        onTogglePause={() => { store.togglePause(link.id); goTab(returnTab) }}
        onDelete={() => { store.deleteLink(link.id); goTab(returnTab) }}
      />
    )
  }

  // Order detail
  if (screen.type === 'orderDetail') {
    return <OrderDetailScreen order={screen.order} onClose={() => goTab('orders')} />
  }

  // Analytics (full screen from settings/more)
  if (screen.type === 'analytics') {
    return (
      <View style={styles.container}>
        <AnalyticsScreen links={store.links} />
        <TabBar activeTab="settings" onTabPress={goTab} />
      </View>
    )
  }

  // Templates
  if (screen.type === 'templates') {
    return (
      <TemplatesScreen
        savedTemplates={[]}
        onSelectTemplate={handleSelectTemplate}
        onClose={() => goTab('create')}
      />
    )
  }

  // Main tab screens
  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            stats={store.stats}
            recentLinks={store.links}
            onCreatePress={() => goTab('create')}
            onViewAllLinks={() => goTab('links')}
            onLinkPress={goDetail}
          />
        )
      case 'create':
        return (
          <CreateScreen
            wizard={store.wizard}
            updateWizard={store.updateWizard}
            resetWizard={store.resetWizard}
            onLinkCreated={handleCreateLink}
            onCancel={() => { store.resetWizard(); goTab('home') }}
          />
        )
      case 'links':
        return (
          <LinksScreen
            links={store.links}
            onTogglePause={store.togglePause}
            onDelete={store.deleteLink}
            onShare={goShare}
          />
        )
      case 'orders':
        return (
          <OrdersScreen
            onOrderPress={(order: any) => setScreen({ type: 'orderDetail', order })}
            totalRevenue={store.stats.totalRevenue}
          />
        )
      case 'settings':
        return (
          <SettingsScreen
            onAnalyticsPress={() => setScreen({ type: 'analytics' })}
            onTemplatesPress={() => setScreen({ type: 'templates' })}
          />
        )
      default:
        return null
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {renderScreen()}
      <TabBar activeTab={activeTab} onTabPress={goTab} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  tabBarOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
})
