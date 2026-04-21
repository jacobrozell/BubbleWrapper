import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootTabs } from './src/navigation/RootTabs';
import { getTheme, subscribeZenStore } from './src/storage/zenStore';

function AppNavigation(): React.JSX.Element {
  const [, bump] = useState(0);
  useEffect(() => subscribeZenStore(() => bump((x) => x + 1)), []);

  const mode = getTheme();
  const navTheme = useMemo(() => {
    const base = mode === 'dark' ? DarkTheme : DefaultTheme;
    const bg = mode === 'dark' ? '#1c1f24' : '#dce4ee';
    return {
      ...base,
      colors: {
        ...base.colors,
        background: bg,
        card: mode === 'dark' ? '#262b33' : '#eef2f7',
        border: mode === 'dark' ? '#14161a' : 'rgba(22,32,48,0.14)',
        text: mode === 'dark' ? '#eef1f6' : '#1b2230',
        primary: mode === 'dark' ? '#8fd4f0' : '#1f6f78',
      },
    };
  }, [mode, bump]);

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
