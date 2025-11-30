import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Initialize error logger

import { DebugScreen } from '../src/screens/DebugScreen';
import { HomeScreen } from '../src/screens/HomeScreen';
import { PlayerScreen } from '../src/screens/PlayerScreen';
import { SurahListScreen } from '../src/screens/SurahListScreen';

const Stack = createNativeStackNavigator();

console.log('App started');

export default function RootLayout() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1a1a1a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Al-Quran Player' }}
      />
      <Stack.Screen
        name="SurahList"
        component={SurahListScreen}
        options={{ title: 'Choose Surah' }}
      />
      <Stack.Screen
        name="Player"
        component={PlayerScreen}
        options={{ title: 'Player' }}
      />
      <Stack.Screen
        name="Debug"
        component={DebugScreen}
        options={{ title: 'Debug Console' }}
      />
    </Stack.Navigator>
  );
}
