import { Tabs } from 'expo-router';
import { ClipboardList, LayoutDashboard, Ruler, Users, Wallet } from 'lucide-react-native';
import React from 'react';
import { colors, fontFamily } from '../../src/theme';

/**
 * Flat white tab bar with a top hairline — no floating button, no shadow.
 * নতুন অর্ডার lives in the dashboard header, per DESIGN.md.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.hairline,
          height: 56,
          paddingTop: 6,
          paddingBottom: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: {
          fontFamily: fontFamily.medium,
          fontSize: 10,
          lineHeight: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'হোম',
          tabBarIcon: ({ color }) => (
            <LayoutDashboard size={22} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'অর্ডার',
          tabBarIcon: ({ color }) => (
            <ClipboardList size={22} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="measurements"
        options={{
          title: 'মাপ',
          tabBarIcon: ({ color }) => (
            <Ruler size={22} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="due"
        options={{
          title: 'বকেয়া',
          tabBarIcon: ({ color }) => (
            <Wallet size={22} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="karigar"
        options={{
          title: 'কারিগর',
          tabBarIcon: ({ color }) => (
            <Users size={22} color={color} strokeWidth={1.8} />
          ),
        }}
      />
    </Tabs>
  );
}
