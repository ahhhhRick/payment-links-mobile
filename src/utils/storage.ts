// Persistent storage using AsyncStorage (built into React Native)
import { Platform } from 'react-native'

// AsyncStorage-compatible wrapper
// React Native includes AsyncStorage in the core (deprecated but functional)
// For production, install @react-native-async-storage/async-storage

const memoryFallback: Record<string, string> = {}

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      // Try AsyncStorage first
      const AsyncStorage = require('@react-native-async-storage/async-storage')?.default
      if (AsyncStorage) {
        const value = await AsyncStorage.getItem(key)
        return value ? JSON.parse(value) : null
      }
    } catch {
      // Fallback to memory
    }
    const value = memoryFallback[key]
    return value ? JSON.parse(value) : null
  },

  async set<T>(key: string, value: T): Promise<void> {
    const json = JSON.stringify(value)
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage')?.default
      if (AsyncStorage) {
        await AsyncStorage.setItem(key, json)
        return
      }
    } catch {
      // Fallback to memory
    }
    memoryFallback[key] = json
  },

  async remove(key: string): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage')?.default
      if (AsyncStorage) {
        await AsyncStorage.removeItem(key)
        return
      }
    } catch {
      // Fallback
    }
    delete memoryFallback[key]
  },
}

// Storage keys
export const STORAGE_KEYS = {
  WIZARD_DRAFT: 'payment_links_wizard_draft',
  SETTINGS: 'payment_links_settings',
  ONBOARDED: 'payment_links_onboarded',
  SAVED_TEMPLATES: 'payment_links_saved_templates',
} as const
