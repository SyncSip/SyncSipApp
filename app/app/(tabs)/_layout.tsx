import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            height: 60,
            paddingBottom: 10,
          },
          default: {
            height: 70,
            paddingBottom: 8,
          },
        }),
        tabBarLabel: () => null,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabContainer}>
              <IconSymbol size={28} name="wifi.circle" color={color} />
              <Text style={[styles.label, { color }]}></Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="graph"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabContainer}>
              <IconSymbol size={28} name="chart.line.uptrend.xyaxis" color={color} />
              <Text style={[styles.label, { color }]}></Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabContainer}>
              <IconSymbol size={28} name="drop.halffull" color={color} />
              <Text style={[styles.label, { color }]}></Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
    paddingTop: Platform.OS === 'ios' ? 15 : 10
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
  }
});
