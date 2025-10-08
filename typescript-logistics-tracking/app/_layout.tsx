import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Slot, Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { useAuthStore } from "@/store/authStore";
import Head from "expo-router/head";

export const unstable_settings = {
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// This component handles authentication-based navigation
function AuthenticationGuard({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const initialRenderRef = useRef(true);

  useEffect(() => {
    // Skip navigation on the first render to avoid the warning
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }

    // Only run this effect after the first render
    const inAuthGroup = segments[0] === 'auth';
    const inTabsGroup = segments[0] === '(tabs)';
    
    if (!isAuthenticated && !inAuthGroup && segments[0] !== '') {
      // If not authenticated and not on auth screens or root, redirect to root
      router.replace('/');
    } else if (isAuthenticated && (inAuthGroup || segments[0] === '')) {
      // If authenticated and on auth screens or root, redirect to tabs
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Fix for mobile web viewport issues
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Fix for mobile browsers' viewport height issues
      const fixViewportHeight = () => {
        // Set a CSS variable with the actual viewport height
        document.documentElement.style.setProperty(
          '--vh', 
          `${window.innerHeight * 0.01}px`
        );
      };

      // Run once on mount
      fixViewportHeight();
      
      // Add event listener for resize and orientation changes
      window.addEventListener('resize', fixViewportHeight);
      window.addEventListener('orientationchange', fixViewportHeight);
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', fixViewportHeight);
        window.removeEventListener('orientationchange', fixViewportHeight);
      };
    }
  }, []);

  if (!loaded) {
    return <Slot />;
  }

  return (
    <ErrorBoundary>
      {Platform.OS === 'web' && (
        <Head>
          <title>LogiTrack - Efficient Logistics Management Platform</title>
          <meta name="description" content="LogiTrack connects transporters with businesses needing shipping services. Track shipments in real-time, manage your logistics operations, and optimize your supply chain with our comprehensive platform." />
          <meta property="og:title" content="LogiTrack - Efficient Logistics Management Platform" />
          <meta property="og:description" content="Connect with transporters, track shipments in real-time, and manage your logistics operations seamlessly." />
          <meta property="og:type" content="website" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, height=device-height, viewport-fit=cover" />
          <link rel="icon" type="image/x-icon" href="/favicon.png" />
          <style>{`
            /* Fix for mobile viewport height issues */
            :root {
              --vh: 1vh;
            }
            
            html, body {
              height: 100%;
              margin: 0;
              padding: 0;
              overflow-x: hidden;
            }
            
            /* Use the custom viewport height variable */
            #root, #root > div {
              min-height: 100vh; /* Fallback */
              min-height: calc(var(--vh, 1vh) * 100);
              display: flex;
              flex-direction: column;
            }
            
            /* Fix for iOS Safari bottom bar */
            @supports (-webkit-touch-callout: none) {
              body {
                /* Disable overscroll/bounce effect */
                overscroll-behavior-y: none;
                position: fixed;
                width: 100%;
                height: 100%;
              }
              
              #root, #root > div {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
              }
            }
          `}</style>
        </Head>
      )}
      <AuthenticationGuard>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="orders/[id]" 
            options={{ 
              title: "Order Details",
              headerBackTitle: "Back",
            }} 
          />
          <Stack.Screen 
            name="orders/create" 
            options={{ 
              title: "Create Order",
              headerBackTitle: "Back",
              presentation: "modal",
            }} 
          />
          <Stack.Screen 
            name="profile/edit" 
            options={{ 
              title: "Edit Profile",
              headerBackTitle: "Back",
            }} 
          />
          <Stack.Screen 
            name="profile/vehicles" 
            options={{ 
              title: "My Vehicles",
              headerBackTitle: "Back",
            }} 
          />
          <Stack.Screen 
            name="profile/vehicles/add" 
            options={{ 
              title: "Add Vehicle",
              headerBackTitle: "Back",
              presentation: "modal",
            }} 
          />
        </Stack>
      </AuthenticationGuard>
    </ErrorBoundary>
  );
}