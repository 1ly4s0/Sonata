/**
 * Sonata - Local Music Player
 * Root application component
 */

import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { setupPlayer } from './src/services/TrackPlayerService';

LogBox.ignoreLogs([
  'new NativeEventEmitter',
  'Sending `onAnimatedValueUpdate`',
]);

export default function App() {
  useEffect(() => {
    setupPlayer();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18n}>
        <Provider store={store}>
          <SafeAreaProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <AppNavigator />
          </SafeAreaProvider>
        </Provider>
      </I18nextProvider>
    </GestureHandlerRootView>
  );
}
