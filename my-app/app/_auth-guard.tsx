import { useAuth } from '@/api/auth';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inTabsGroup = segments[0] === '(tabs)';
    const inWelcomeScreen = segments[0] === 'welcome';

    if (!user && !inAuthGroup) {
      // User is not authenticated and not in auth group, redirect to login
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      // User is authenticated and in auth group, redirect to welcome
      router.replace('/welcome');
    }
    // Allow welcome screen and tabs for authenticated users
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
