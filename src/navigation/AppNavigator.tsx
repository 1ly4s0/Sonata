import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomTabNavigator from './BottomTabNavigator';
import NowPlayingScreen from '../screens/NowPlayingScreen';
import PlaylistDetailScreen from '../screens/PlaylistDetailScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import RecentlyPlayedScreen from '../screens/RecentlyPlayedScreen';
import ArtistDetailScreen from '../screens/ArtistDetailScreen';
import AlbumDetailScreen from '../screens/AlbumDetailScreen';
import FolderDetailScreen from '../screens/FolderDetailScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import TermsScreen from '../screens/TermsScreen';
import AboutScreen from '../screens/AboutScreen';
import { RootStackParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();
const ONBOARDING_KEY = '@sonata_onboarded';
const TERMS_KEY = '@sonata/terms_accepted';

export default function AppNavigator() {
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [termsAccepted, setTermsAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(ONBOARDING_KEY),
      AsyncStorage.getItem(TERMS_KEY),
    ]).then(([ob, ta]) => {
      setOnboarded(ob === 'true');
      setTermsAccepted(ta === 'true');
    });
  }, []);

  if (onboarded === null || termsAccepted === null) {
    // Still loading — render nothing briefly (splash is still visible)
    return null;
  }

  if (!onboarded) {
    return <OnboardingScreen onDone={() => setOnboarded(true)} />;
  }

  if (!termsAccepted) {
    return (
      <TermsScreen
        onAccept={async () => {
          await AsyncStorage.setItem(TERMS_KEY, 'true');
          setTermsAccepted(true);
        }}
      />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="MainTabs"
      >
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        <Stack.Screen
          name="NowPlaying"
          component={NowPlayingScreen}
          options={{
            presentation: 'modal',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} />
        <Stack.Screen name="RecentlyPlayed" component={RecentlyPlayedScreen} />
        <Stack.Screen name="ArtistDetail" component={ArtistDetailScreen} />
        <Stack.Screen name="AlbumDetail" component={AlbumDetailScreen} />
        <Stack.Screen name="FolderDetail" component={FolderDetailScreen} />
        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{ presentation: 'modal', gestureEnabled: true }}
        />
        <Stack.Screen
          name="Terms"
          component={TermsScreen}
          options={{ presentation: 'modal', gestureEnabled: true }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
