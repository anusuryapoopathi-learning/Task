import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              {focused && <View style={styles.activeIndicator} />}
              <Ionicons
                name="grid-outline"
                size={24}
                color={focused ? '#8B5CF6' : '#6B7280'}
              />
            </View>
          ),
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: () => (
            <LinearGradient
              colors={['#8B5CF6', '#A78BFA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.centerButtonGradient}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </LinearGradient>
          ),
          tabBarLabel: '',
          tabBarStyle: { display: 'none' },
          tabBarButton: (props) => (
            <View style={styles.centerButtonContainer}>
              <TouchableOpacity
                style={styles.centerButtonWrapper}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/add')}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#A78BFA']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.centerButtonGradient}
                >
                  <Ionicons name="add" size={24} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              {focused && <View style={styles.activeIndicator} />}
              <Ionicons
                name="checkmark-done-outline"
                size={24}
                color={focused ? '#8B5CF6' : '#6B7280'}
              />
            </View>
          ),
          tabBarLabel: 'Tasks',
        }}
      />
      <Tabs.Screen
        name="task-details"
        options={{
          href: null, // Hide from tab bar
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="edit-task"
        options={{
          href: null, // Hide from tab bar
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    height: 85,
    paddingBottom: 16,
    paddingTop: 10,
  },
  tabItem: {
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 32,
  },
  activeIndicator: {
    position: 'absolute',
    top: -12,
    width: 40,
    height: 3,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
  },
  centerButtonWrapper: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  centerButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
