import { AuthProvider, useAuth } from "@/lib/auth-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import SplashAnimation from "@/components/SplashAnimation";

// Keep the splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

const theme = {
  ...MD3LightTheme,
  fonts: {
    ...MD3LightTheme.fonts,
    // Override all font variants with StyreneB-Regular
    bodyLarge: { ...MD3LightTheme.fonts.bodyLarge, fontFamily: 'StyreneB-Regular' },
    bodyMedium: { ...MD3LightTheme.fonts.bodyMedium, fontFamily: 'StyreneB-Regular' },
    bodySmall: { ...MD3LightTheme.fonts.bodySmall, fontFamily: 'StyreneB-Regular' },
    headlineLarge: { ...MD3LightTheme.fonts.headlineLarge, fontFamily: 'StyreneB-Regular' },
    headlineMedium: { ...MD3LightTheme.fonts.headlineMedium, fontFamily: 'StyreneB-Regular' },
    headlineSmall: { ...MD3LightTheme.fonts.headlineSmall, fontFamily: 'StyreneB-Regular' },
    titleLarge: { ...MD3LightTheme.fonts.titleLarge, fontFamily: 'StyreneB-Regular' },
    titleMedium: { ...MD3LightTheme.fonts.titleMedium, fontFamily: 'StyreneB-Regular' },
    titleSmall: { ...MD3LightTheme.fonts.titleSmall, fontFamily: 'StyreneB-Regular' },
    labelLarge: { ...MD3LightTheme.fonts.labelLarge, fontFamily: 'StyreneB-Regular' },
    labelMedium: { ...MD3LightTheme.fonts.labelMedium, fontFamily: 'StyreneB-Regular' },
    labelSmall: { ...MD3LightTheme.fonts.labelSmall, fontFamily: 'StyreneB-Regular' },
    // Add default font for Text components without variants
    default: { ...MD3LightTheme.fonts.bodyMedium, fontFamily: 'StyreneB-Regular' },
  },
};

const queryClient = new QueryClient();

function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoadingUser } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === "auth";

    if (!user && !inAuthGroup && !isLoadingUser) {
      router.replace("/auth");
    } else if (user && inAuthGroup && !isLoadingUser) {
      router.replace("/");
    }
  }, [user, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  
  const [fontsLoaded] = useFonts({
    'StyreneB-Regular': require('../assets/fonts/StyreneB-Regular-Trial-BF63f6cbe9db1d5.otf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <PaperProvider theme={theme}>
            <SafeAreaProvider>
              <RouteGuard>
                <Stack>
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="auth"
                    options={{ headerShown: false }}
                  />
                </Stack>
              </RouteGuard>
              {showSplash && (
                <SplashAnimation
                  onAnimationComplete={() => setShowSplash(false)}
                />
              )}
            </SafeAreaProvider>
          </PaperProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
