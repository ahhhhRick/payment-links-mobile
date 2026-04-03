import React, { useState } from 'react'
import { View, StyleSheet, Share, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { TabBar } from './src/components/TabBar'
import { HomeScreen } from './src/screens/HomeScreen'
import { CreateScreen } from './src/screens/CreateScreen'
import { LinksScreen } from './src/screens/LinksScreen'
import { OrdersScreen } from './src/screens/OrdersScreen'
import { SettingsScreen } from './src/screens/SettingsScreen'
import { useStore } from './src/hooks/useStore'
import type { AppTab, PaymentLink } from './src/types'

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home')
  const store = useStore()

  const handleCreateLink = (link: PaymentLink) => {
    store.addLink(link)
    setActiveTab('home')
  }

  const handleShare = async (link: PaymentLink) => {
    try {
      await Share.share({
        message: `Pay for "${link.name}" here: ${link.url}`,
        url: link.url,
      })
    } catch {
      Alert.alert('Share', `Link copied: ${link.url}`)
    }
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            stats={store.stats}
            recentLinks={store.links}
            onCreatePress={() => setActiveTab('create')}
            onViewAllLinks={() => setActiveTab('links')}
            onLinkPress={(link) => handleShare(link)}
          />
        )
      case 'create':
        return (
          <CreateScreen
            wizard={store.wizard}
            updateWizard={store.updateWizard}
            resetWizard={store.resetWizard}
            onLinkCreated={handleCreateLink}
            onCancel={() => {
              store.resetWizard()
              setActiveTab('home')
            }}
          />
        )
      case 'links':
        return (
          <LinksScreen
            links={store.links}
            onTogglePause={store.togglePause}
            onDelete={store.deleteLink}
            onShare={handleShare}
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
        <TabBar activeTab={activeTab} onTabPress={setActiveTab} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
})
