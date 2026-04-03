import React, { useState } from 'react'
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
import { useStore } from './src/hooks/useStore'
import type { AppTab, PaymentLink } from './src/types'

type Screen =
  | { type: 'tab'; tab: AppTab }
  | { type: 'share'; link: PaymentLink }
  | { type: 'detail'; link: PaymentLink }
  | { type: 'onboarding' }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ type: 'tab', tab: 'home' })
  const [hasOnboarded, setHasOnboarded] = useState(true) // Set false to show onboarding
  const store = useStore()

  const activeTab = screen.type === 'tab' ? screen.tab : 'home'

  const goTab = (tab: AppTab) => setScreen({ type: 'tab', tab })
  const goShare = (link: PaymentLink) => setScreen({ type: 'share', link })
  const goDetail = (link: PaymentLink) => setScreen({ type: 'detail', link })

  const handleCreateLink = (link: PaymentLink) => {
    store.addLink(link)
    goShare(link) // Go straight to share screen after creation
  }

  const handleNativeShare = async (link: PaymentLink) => {
    try {
      await Share.share({ message: `${link.name}: ${link.url}`, url: link.url })
    } catch { /* cancelled */ }
  }

  // Onboarding
  if (!hasOnboarded) {
    return (
      <OnboardingScreen
        onConnect={() => {
          Alert.alert('OAuth', 'Square OAuth flow would open here. Using demo data for now.')
          setHasOnboarded(true)
        }}
        onSkipDemo={() => setHasOnboarded(true)}
      />
    )
  }

  // Share screen (full-screen overlay)
  if (screen.type === 'share') {
    return (
      <ShareScreen
        link={screen.link}
        onClose={() => goTab('home')}
      />
    )
  }

  // Link detail screen
  if (screen.type === 'detail') {
    const link = screen.link
    return (
      <LinkDetailScreen
        link={link}
        onClose={() => goTab('links')}
        onShare={() => goShare(link)}
        onTogglePause={() => {
          store.togglePause(link.id)
          goTab('links')
        }}
        onDelete={() => {
          store.deleteLink(link.id)
          goTab('links')
        }}
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
        return <OrdersScreen />
      case 'settings':
        return <SettingsScreen />
      default:
        return null
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {renderScreen()}
      {activeTab !== 'create' && (
        <TabBar activeTab={activeTab} onTabPress={goTab} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
})
