import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import MiniPlayer from '../components/MiniPlayer';
import { Colors } from '../theme';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.tabInactive,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ color, size }) => {
            let icon = 'music-note';
            if (route.name === 'Home') icon = 'music-note';
            if (route.name === 'Search') icon = 'magnify';
            if (route.name === 'Playlists') icon = 'playlist-music';
            return <Icon name={icon} color={color} size={size} />;
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: t('nav_library') }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{ title: t('nav_search') }}
        />
        <Tab.Screen
          name="Playlists"
          component={PlaylistsScreen}
          options={{ title: t('nav_playlists') }}
        />
      </Tab.Navigator>
      <MiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabBar: {
    backgroundColor: Colors.bottomBar,
    borderTopColor: Colors.bottomBarBorder,
    borderTopWidth: 1,
    elevation: 0,
    height: 60,
    paddingBottom: 8,
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});
