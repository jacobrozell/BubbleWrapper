import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import React, { useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootTabs } from './src/navigation/RootTabs';
import { useZenStore } from './src/storage/useZenStore';

function AppNavigation(): React.JSX.Element {
  const { themeMode } = useZenStore();
  const navTheme = useMemo(() => {
    const base = themeMode === 'dark' ? DarkTheme : DefaultTheme;
    const bg = themeMode === 'dark' ? '#1c1f24' : '#dce4ee';
    return {
      ...base,
      colors: {
        ...base.colors,
        background: bg,
        card: themeMode === 'dark' ? '#262b33' : '#eef2f7',
        border: themeMode === 'dark' ? '#14161a' : 'rgba(22,32,48,0.14)',
        text: themeMode === 'dark' ? '#eef1f6' : '#1b2230',
        primary: themeMode === 'dark' ? '#8fd4f0' : '#1f6f78',
      },
    };
  }, [themeMode]);

  return (
    <NavigationContainer theme={navTheme}>
      <RootTabs />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppNavigation />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
