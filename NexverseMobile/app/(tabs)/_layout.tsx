import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationOptions,
  MaterialTopTabNavigationEventMap,
} from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '@/store/useThemeStore';
import { Colors } from '@/constants/theme';
import LucideIcon from '@/components/LucideIcon';

// Create the custom navigator
const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function TabLayout() {
  const { theme } = useThemeStore();
  const insets = useSafeAreaInsets();
  const colors = Colors[theme];

  const renderTabIcon = (iconName: string, color: string) => (
    <LucideIcon name={iconName} size={24} color={color} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <MaterialTopTabs
        tabBarPosition="bottom"
        screenOptions={{
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopWidth: 0,
            elevation: 0,
            paddingTop: 10,
            paddingBottom: Math.max(insets.bottom, 10),
            paddingHorizontal: 10,
            height: 68 + Math.max(insets.bottom, 10),
            shadowOpacity: 0,
            gap: 8, // Gap between tabs matching .nav { gap: 8px }
          },
          tabBarIndicatorStyle: {
            backgroundColor: 'transparent',
          },
          tabBarShowLabel: true,
          tabBarActiveTintColor: colors.tint, // Gold primary (#D4AF37)
          tabBarInactiveTintColor: colors.tabIconDefault, // Muted (#60646B)
          tabBarLabelStyle: {
            fontSize: 13, // Match .nav button { font-size: 13px }
            fontWeight: '500',
            textTransform: 'none',
            marginTop: 6, // Match .nav button { gap: 6px }
          },
          tabBarIconStyle: {
            height: 24,
            width: 24,
          },
          tabBarItemStyle: {
            borderRadius: 10, // Match .nav button { border-radius: 10px }
            paddingVertical: 8, // Match .nav button { padding: 8px }
          },
          swipeEnabled: true,
          animationEnabled: true,
        }}
      >
        <MaterialTopTabs.Screen
          name="nexverse"
          options={{
            title: 'Nexverse',
            tabBarIcon: ({ color }: { color: string }) => renderTabIcon('sparkles', color),
          }}
        />
        <MaterialTopTabs.Screen
          name="index"
          options={{
            title: 'Chats',
            tabBarIcon: ({ color }: { color: string }) => renderTabIcon('chats', color),
          }}
        />
        <MaterialTopTabs.Screen
          name="notifications"
          options={{
            title: 'Notifications',
            tabBarIcon: ({ color }: { color: string }) => renderTabIcon('bell', color),
          }}
        />
        <MaterialTopTabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }: { color: string }) => renderTabIcon('compass', color),
          }}
        />
        <MaterialTopTabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }: { color: string }) => renderTabIcon('settings', color),
          }}
        />

      </MaterialTopTabs>
    </View>
  );
}