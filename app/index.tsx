import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { KiswahTheme } from '../src/constants/theme';

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

// Initialize error logger

import { DebugScreen } from '../src/screens/DebugScreen';
import { HomeScreen } from '../src/screens/HomeScreen';
import { PlayerScreen } from '../src/screens/PlayerScreen';
import { SurahListScreen } from '../src/screens/SurahListScreen';
import { TextViewerScreen } from '../src/screens/TextViewerScreen';

const Stack = createNativeStackNavigator();

console.log('App started');

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Amiri-Regular': require('../assets/fonts/Amiri-Regular.ttf'),
    'Amiri-Bold': require('../assets/fonts/Amiri-Bold.ttf'),
    'Lato-Regular': require('../assets/fonts/Lato-Regular.ttf'),
  });

  // Debug: Log font loading state
  console.log('Font loading state:', { fontsLoaded, fontError });

  useEffect(() => {
    if (fontsLoaded) {
      console.log('✅ Fonts loaded successfully:', {
        'Amiri-Regular': true,
        'Amiri-Bold': true,
        'Lato-Regular': true,
      });
      SplashScreen.hideAsync();
    }
    if (fontError) {
      console.error('❌ Font loading error:', fontError);
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Show loading view while fonts are loading
  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={KiswahTheme.Primary} />
      </View>
    );
  }

  if (fontError) {
    console.error('Font loading failed:', fontError);
  }

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
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TextViewer"
        component={TextViewerScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Debug"
        component={DebugScreen}
        options={{ title: 'Debug Console' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: KiswahTheme.Background,
  },
});
