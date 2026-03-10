// src/navigation/AppNavigator.tsx

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../api/services';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';

// Main screens
import HomeScreen from '../screens/home/HomeScreen';
import AvailableOrdersScreen from '../screens/orders/AvailableOrdersScreen';
import ActiveDeliveryScreen from '../screens/orders/ActiveDeliveryScreen';
import MapNavigationScreen from '../screens/orders/MapNavigationScreen';
import HistoryScreen from '../screens/orders/HistoryScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import UploadDocumentsScreen from '../screens/profile/UploadDocumentsScreen';
import ViewDocumentScreen from '../screens/profile/ViewDocumentScreen';
import { Colors, FontSize } from '../utils/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Tab Icons ────────────────────────────────────────────────────────────────

const TabIcon = ({ icon, label, focused }: { icon: string; label: string; focused: boolean }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', height: 50, paddingTop: 4 }}>
    <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.6 }}>{icon}</Text>
    <Text
      style={{
        fontSize: 10,
        fontWeight: focused ? '800' : '600',
        color: focused ? Colors.primary : Colors.textMuted,
        marginTop: 2,
      }}
    >
      {label}
    </Text>
  </View>
);

// ─── Main Tab Navigator ────────────────────────────────────────────────────────

function MainTabs() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 10);
  const tabHeight = 60 + bottomPadding;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="AvailableOrders"
        component={AvailableOrdersScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="📋" label="Orders" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🕐" label="History" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="💳" label="Wallet" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" label="Profile" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ────────────────────────────────────────────────────────────

function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const loadStoredAuth = useAuthStore((s) => s.loadStoredAuth);
  const updatePartner = useAuthStore((s) => s.updatePartner);
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    (async () => {
      const hasToken = await loadStoredAuth();
      if (hasToken) {
        try {
          // Hydrate partner profile on auto-login
          const profile = await authAPI.getProfile();
          updatePartner(profile);
        } catch (e) {
          // token expired — handled by axios interceptor
        }
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashLogo}>🛵</Text>
        <Text style={styles.splashName}>SwiftDeliver</Text>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="ActiveDelivery"
            component={ActiveDeliveryScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="MapNavigation"
            component={MapNavigationScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="UploadDocuments"
            component={UploadDocumentsScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="ViewDocument"
            component={ViewDocumentScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

// ─── App Navigator ─────────────────────────────────────────────────────────────

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: { fontSize: 72 },
  splashName: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.white,
    marginTop: 12,
    letterSpacing: -0.5,
  },
});