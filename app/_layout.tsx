import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '~/context/AuthUserContext';
import { SnackbarProvider } from '~/context/SnackbarContext';
import { useColorScheme } from '~/hooks/useColorScheme';
import '../global.css';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function Root() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  if (user === undefined) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{ headerShown: false }}
        initialRouteName={!!user ? '(tabs)' : '(auth)'}>
        <Stack.Protected guard={user === null}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={!!user}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(protected)" />
        </Stack.Protected>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar barStyle="default" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    OnestLight: require('../assets/fonts/Onest-Light.ttf'),
    OnestThin: require('../assets/fonts/Onest-Thin.ttf'),
    OnestRegular: require('../assets/fonts/Onest-Regular.ttf'),
    OnestMedium: require('../assets/fonts/Onest-Medium.ttf'),
    OnestSemiBold: require('../assets/fonts/Onest-SemiBold.ttf'),
    OnestBold: require('../assets/fonts/Onest-Bold.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      // Hide splash screen once fonts are loaded or if there's an error
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Don't render anything until fonts are loaded
  if (!loaded && !error) {
    return null;
  }

  return (
    <AuthProvider>
      <SnackbarProvider>
        <Root />
      </SnackbarProvider>
    </AuthProvider>
  );
}
