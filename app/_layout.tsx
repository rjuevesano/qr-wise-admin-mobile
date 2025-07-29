import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '~/context/AuthUserContext';
import { SnackbarProvider } from '~/context/SnackbarContext';
import { useColorScheme } from '~/hooks/useColorScheme';
import '../global.css';

function Root() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  if (user === undefined) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(protected)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar barStyle="default" />
      {user ? <Redirect href="/dashboard" /> : <Redirect href="/main" />}
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
