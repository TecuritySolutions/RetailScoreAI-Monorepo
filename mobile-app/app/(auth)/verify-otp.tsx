import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { OTPInput } from '@/components/auth/otp-input';
import { Button } from '@/components/ui/button';
import { authApi } from '@/services/api/auth.api';
import { userApi } from '@/services/api/user.api';
import { StorageService } from '@/services/storage';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ApiRequestError } from '@/types/api';

const OTP_EXPIRY_TIME = 15 * 60; // 15 minutes in seconds

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { login } = useAuth();
  const colorScheme = useColorScheme();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(OTP_EXPIRY_TIME);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyOTP = async (otpValue: string) => {
    if (!email) {
      Alert.alert('Error', 'Email not found. Please go back and try again.');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Verify OTP and get tokens + basic user info
      const authResponse = await authApi.verifyOtp(email, otpValue);
      if (authResponse.success && authResponse.user && authResponse.tokens) {
        // Step 2: Store tokens immediately (so next API call can use them)
        await StorageService.setTokens(authResponse.tokens);

        // Step 3: Fetch full user profile using the new tokens
        try {
          const profileResponse = await userApi.getProfile();

          // Step 4: Login with full profile data
          const fullUser = profileResponse.success && profileResponse.user
            ? profileResponse.user
            : authResponse.user;

          await login(fullUser, authResponse.tokens);
        } catch (profileError) {
          // If profile fetch fails, still login with basic user data
          console.warn('Failed to fetch profile, using basic user data:', profileError);
          await login(authResponse.user, authResponse.tokens);
        }

        // Step 5: Navigate to dashboard
        router.replace('/(tabs)/dashboard');
      }
    } catch (error) {
      if (error instanceof ApiRequestError) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Failed to verify OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Email not found. Please go back and try again.');
      return;
    }

    setResending(true);
    try {
      const response = await authApi.sendOtp(email);
      if (response.success) {
        Alert.alert('Success', 'A new OTP has been sent to your email.');
        setTimeRemaining(OTP_EXPIRY_TIME);
        setOtp('');
      }
    } catch (error) {
      if (error instanceof ApiRequestError) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Failed to resend OTP. Please try again.');
      }
    } finally {
      setResending(false);
    }
  };

  const canResend = timeRemaining === 0 && !resending && !loading;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#111827' : '#FFFFFF' }]}
    >
      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          disabled={loading}
        >
          <Text style={[styles.backText, { color: colorScheme === 'dark' ? '#60A5FA' : '#3B82F6' }]}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: colorScheme === 'dark' ? '#F9FAFB' : '#1F2937' }]}>Verify Your Email</Text>
          <Text style={[styles.subtitle, { color: colorScheme === 'dark' ? '#D1D5DB' : '#6B7280' }]}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={[styles.email, { color: colorScheme === 'dark' ? '#60A5FA' : '#3B82F6' }]}>{email}</Text>
          </Text>
        </View>

        <OTPInput
          length={6}
          onComplete={handleVerifyOTP}
          onChangeText={setOtp}
          disabled={loading || resending}
        />

        {timeRemaining > 0 && (
          <View style={styles.timerContainer}>
            <Text style={[styles.timerText, { color: colorScheme === 'dark' ? '#9CA3AF' : '#6B7280' }]}>
              Code expires in {formatTime(timeRemaining)}
            </Text>
          </View>
        )}

        <View style={styles.resendContainer}>
          <Text style={[styles.resendText, { color: colorScheme === 'dark' ? '#9CA3AF' : '#6B7280' }]}>Didn't receive the code? </Text>
          <TouchableOpacity
            onPress={handleResendOTP}
            disabled={!canResend}
          >
            <Text
              style={[
                styles.resendLink,
                { color: colorScheme === 'dark' ? '#60A5FA' : '#3B82F6' },
                !canResend && styles.resendLinkDisabled,
              ]}
            >
              Resend OTP
            </Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colorScheme === 'dark' ? '#60A5FA' : '#3B82F6' }]}>Verifying...</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 32,
  },
  backText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  headerContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  email: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  timerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  resendText: {
    fontSize: 14,
    color: '#6B7280',
  },
  resendLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  resendLinkDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
});
