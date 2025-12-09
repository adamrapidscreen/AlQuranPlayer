import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DEFAULT_THEME_MODE, ThemePalette, type ThemeColors } from '../src/constants/theme';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';

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

function AppNavigator() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.navigatorContainer}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.Surface,
          },
          headerTintColor: colors.TextPrimary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: colors.Background,
          },
          animation: 'fade',
          animationDuration: 150,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SurahList" component={SurahListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Player" component={PlayerScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="TextViewer"
          component={TextViewerScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="Debug" component={DebugScreen} options={{ title: 'Debug Console' }} />
      </Stack.Navigator>
    </View>
  );
}

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
      <View style={loadingStyles.loadingContainer}>
        <ActivityIndicator size="large" color={ThemePalette[DEFAULT_THEME_MODE].Primary} />
      </View>
    );
  }

  if (fontError) {
    console.error('Font loading failed:', fontError);
  }

  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}

const loadingStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ThemePalette[DEFAULT_THEME_MODE].Background,
  },
});

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    navigatorContainer: {
      flex: 1,
      backgroundColor: colors.Background,
    },
  });
