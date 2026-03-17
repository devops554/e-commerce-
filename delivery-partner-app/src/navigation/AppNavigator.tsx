// src/navigation/AppNavigator.tsx

import React, { useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { authAPI, locationAPI } from '../api/services';
import { socketService } from '../services/socketService';
import Ionicons from '@expo/vector-icons/Ionicons';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';

// Main screens
import HomeScreen from '../screens/home/HomeScreen';
import AvailableOrdersScreen from '../screens/orders/AvailableOrdersScreen';
import ActiveDeliveryScreen from '../screens/orders/ActiveDeliveryScreen';
import MapNavigationScreen from '../screens/orders/MapNavigationScreen';
import HistoryScreen from '../screens/orders/HistoryScreen';
import FullMapScreen from '../screens/orders/FullMapScreen';
import NotificationsScreen from '../screens/orders/NotificationsScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import UploadDocumentsScreen from '../screens/profile/UploadDocumentsScreen';
import ViewDocumentScreen from '../screens/profile/ViewDocumentScreen';
import { Colors, FontSize } from '../utils/theme';
import ActiveOrdersListScreen from '../screens/orders/Activeorderslistscreen';
import ReturnItemReviewScreen from '../screens/orders/ReturnItemReviewScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Tab Icons ────────────────────────────────────────────────────────────────

const TabIcon = ({
  name,
  nameFocused,
  label,
  focused,
  badge,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  nameFocused: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  focused: boolean;
  badge?: number;
}) => (
  <View style={styles.tabItem}>
    <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
      <View>
        <Ionicons
          name={focused ? nameFocused : name}
          size={22}
          color={focused ? Colors.primary : Colors.textMuted}
        />
        {badge && badge > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
          </View>
        ) : null}
      </View>
    </View>
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
      {label}
    </Text>
  </View>
);

// ─── Main Tab Navigator ───────────────────────────────────────────────────────

function MainTabs() {
  const insets = useSafeAreaInsets();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 10);
  const tabHeight = 64 + bottomPadding;

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
          paddingTop: 6,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
      }}
    >
      {/* ✅ Home is first — loads as default tab */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="home-outline"
              nameFocused="home"
              label="Home"
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="AvailableOrders"
        component={AvailableOrdersScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="receipt-outline"
              nameFocused="receipt"
              label="Orders"
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="time-outline"
              nameFocused="time"
              label="History"
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="wallet-outline"
              nameFocused="wallet"
              label="Wallet"
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="person-circle-outline"
              nameFocused="person-circle"
              label="Profile"
              focused={focused}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────────────────────────────────

function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const loadStoredAuth = useAuthStore((s) => s.loadStoredAuth);
  const updatePartner = useAuthStore((s) => s.updatePartner);

  useEffect(() => {
    (async () => {
      const hasToken = await loadStoredAuth();
      if (hasToken) {
        try {
          const profile = await authAPI.getProfile();
          updatePartner(profile);
          socketService.connect();

          if (profile.availabilityStatus !== 'ONLINE') {
            try {
              const updatedProfile = await locationAPI.updateAvailability('ONLINE');
              updatePartner({ availabilityStatus: updatedProfile.availabilityStatus });
            } catch (err) {
              console.log('[Auto-Online] Failed:', err);
            }
          }
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
        <ActivityIndicator color={Colors.white} style={{ marginTop: 40 }} />
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
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MapNavigation"
            component={MapNavigationScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="FullMap"
            component={FullMapScreen}
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
          <Stack.Screen
            name="ActiveOrdersList"
            component={ActiveOrdersListScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ReturnItemReview"
            component={ReturnItemReviewScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

// ─── App Navigator ────────────────────────────────────────────────────────────

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  // ── Tab Bar ──────────────────────────────────────────────
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    paddingTop: 2,
    gap: 3,
  },
  tabIconWrap: {
    width: 44,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapActive: {
    backgroundColor: Colors.primary + '18', // ~10% opacity tint
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    fontWeight: '800',
    color: Colors.primary,
  },

  // ── Badge ────────────────────────────────────────────────
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Colors.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.white,
    zIndex: 10,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 8,
    fontWeight: '900',
  },

  // ── Splash ───────────────────────────────────────────────
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