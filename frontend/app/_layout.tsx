import React from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../src/auth';
import { I18nProvider } from '../src/i18n';
import { AddressProvider } from '../src/address';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../src/theme';

const PROTECTED_GROUPS = ['(customer)', '(restaurant)', '(rider)', '(admin)'];

// Inject global CSS for the web preview so scrollbars are hidden but scrolling still works.
if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('yeaamigo-global-css')) {
  const style = document.createElement('style');
  style.id = 'yeaamigo-global-css';
  style.innerHTML = `
    * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
    *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
    html, body { overflow-x: hidden; }
  `;
  document.head.appendChild(style);
}

// Global AuthGuard — watches auth state + current segment and redirects
// to /(auth)/login the moment a user becomes null inside a protected group.
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === '(auth)';
    const inProtected = PROTECTED_GROUPS.includes(segments[0] as string);
    if (!user && inProtected) {
      // Use replace to clear the back-stack — user cannot navigate back to protected routes
      router.replace('/(auth)/login');
    } else if (user && inAuth) {
      // If already logged in but on auth screen, route to correct shell
      const target =
        user.role === 'customer' ? '/(customer)/home'
        : user.role === 'restaurant_owner' ? '/(restaurant)/dashboard'
        : user.role === 'rider' ? '/(rider)/home'
        : user.role === 'admin' ? '/(admin)/dashboard'
        : '/(customer)/home';
      router.replace(target as any);
    }
  }, [user, loading, segments, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <AuthProvider>
          <AddressProvider>
            <StatusBar style="dark" />
            <AuthGuard>
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgSurface } }} />
            </AuthGuard>
          </AddressProvider>
        </AuthProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
