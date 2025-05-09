import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';

import { useColorScheme } from '@/hooks/useColorScheme';
import mainTheme from '@/assets/themes/main-theme.json';
import blueTheme from '@/assets/themes/blueTheme.json';
import redTheme from '@/assets/themes/redTheme.json';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={colorScheme === 'dark' ? {...eva.dark, ...redTheme} : {...eva.light, ...redTheme} }>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false, navigationBarHidden: true, statusBarHidden: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(main)/index" />
            <Stack.Screen name="(main)/home/products/createProduct/index" />
            <Stack.Screen name="(main)/home/products/[product]" />
            <Stack.Screen name="(main)/home/products/editProduct" />
            <Stack.Screen name="seller-registration/index" />
            <Stack.Screen name="+not-found" options={{ headerShown: true, title: 'Not Found' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </ApplicationProvider>
    </>
  );
}
