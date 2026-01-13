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
            paddingTop: 8,
            paddingBottom: Math.max(insets.bottom, 8),
            height: 64 + Math.max(insets.bottom, 8),
            shadowOpacity: 0,
          },
          tabBarIndicatorStyle: {
            backgroundColor: 'transparent', // Hide the line indicator for a bottom-tab look
          },
          tabBarShowLabel: true,
          tabBarActiveTintColor: colors.tabIconSelected,
          tabBarInactiveTintColor: colors.tabIconDefault,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
            textTransform: 'none',
          },
          tabBarIconStyle: {
            height: 24,
            width: 24,
          },
          swipeEnabled: true, // Enable horizontal swiping
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
            tabBarIcon: ({ color }: { color: string }) => renderTabIcon('message-circle', color),
            // Badges are not natively supported in TopTabs the same way, simplified for now
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