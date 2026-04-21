import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import { PopScreen } from '../screens/PopScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { ShopScreen } from '../screens/ShopScreen';
import { useZenStore } from '../storage/useZenStore';
import { makeTheme } from '../theme/tokens';

import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootTabs(): React.JSX.Element {
  const { themeMode } = useZenStore();
  const tabTheme = makeTheme(themeMode);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tabTheme.panel,
          borderTopColor: tabTheme.bubbleBorder,
        },
        tabBarActiveTintColor: tabTheme.text,
        tabBarInactiveTintColor: tabTheme.mutedText,
      }}
    >
      <Tab.Screen
        name="Pop"
        component={PopScreen}
        options={{
          title: 'Pop',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="radio-button-on" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Shop"
        component={ShopScreen}
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
