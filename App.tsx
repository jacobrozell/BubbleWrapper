import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ZenScreen } from './src/screens/ZenScreen';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ZenScreen />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
