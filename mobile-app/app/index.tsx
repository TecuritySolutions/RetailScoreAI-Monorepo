import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { LinearGradient } from 'expo-linear-gradient';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/use-auth';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const prepare = async () => {
      try {
        // Minimum splash screen display time
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (error) {
        console.error('Splash screen error:', error);
      } finally {
        // Hide the splash screen
        await SplashScreen.hideAsync();

        // Navigate based on auth status
        if (!isLoading) {
          if (isAuthenticated) {
            router.replace('/(tabs)/dashboard');
          } else {
            router.replace('/(auth)/login');
          }
        }
      }
    };

    if (!isLoading) {
      prepare();
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <LinearGradient colors={['#DBEAFE', '#E0F2FE']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>Tecurity</Text>
        <Text style={styles.tagline}>Empowering Retail Credit</Text>
        <View style={styles.spinnerContainer}>
          <LoadingSpinner size="large" color="#3B82F6" />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 40,
  },
  spinnerContainer: {
    marginTop: 20,
  },
});
