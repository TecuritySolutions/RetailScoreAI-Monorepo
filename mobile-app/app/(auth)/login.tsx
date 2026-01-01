import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { validators } from '@/utils/validators';
import { authApi } from '@/services/api/auth.api';
import { ApiRequestError } from '@/types/api';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!validators.email(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleContinueWithEmail = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    try {
      const response = await authApi.sendOtp(email);
      if (response.success) {
        Alert.alert('Success', response.message);
        router.push({
          pathname: '/(auth)/verify-otp',
          params: { email },
        });
      }
    } catch (error) {
      if (error instanceof ApiRequestError) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#111827' : '#FFFFFF' }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={colorScheme === 'dark' ? ['#1E3A8A', '#0E7490'] : ['#DBEAFE', '#E0F2FE']}
          style={styles.headerGradient}
        >
          <Text style={[styles.logo, { color: colorScheme === 'dark' ? '#F9FAFB' : '#1F2937' }]}>
            Tecurity
          </Text>
          <Text style={[styles.tagline, { color: colorScheme === 'dark' ? '#D1D5DB' : '#6B7280' }]}>
            Empowering Retail Credit
          </Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: colorScheme === 'dark' ? '#F9FAFB' : '#1F2937' }]}>
            Welcome Back
          </Text>
          <Text style={[styles.subtitle, { color: colorScheme === 'dark' ? '#D1D5DB' : '#6B7280' }]}>
            Sign in to continue to your account
          </Text>

          <View style={styles.inputContainer}>
            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={emailError}
              editable={!loading}
            />

            <Button
              title="Continue with Email"
              onPress={handleContinueWithEmail}
              loading={loading}
              style={styles.emailButton}
            />
          </View>

          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { backgroundColor: colorScheme === 'dark' ? '#374151' : '#E5E7EB' }]} />
            <Text style={[styles.dividerText, { color: colorScheme === 'dark' ? '#9CA3AF' : '#6B7280' }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: colorScheme === 'dark' ? '#374151' : '#E5E7EB' }]} />
          </View>

          <TouchableOpacity
            style={[
              styles.googleButton,
              colorScheme === 'dark' ? styles.googleButtonDark : styles.googleButtonLight,
              styles.googleButtonDisabled,
            ]}
            disabled={true}
            activeOpacity={0.7}
          >
            <View style={styles.googleIconContainer}>
              <Text style={styles.googleIcon}>G</Text>
            </View>
            <Text style={[styles.googleButtonText, colorScheme === 'dark' && styles.googleButtonTextDark]}>
              Continue with Google (Coming Soon)
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colorScheme === 'dark' ? '#9CA3AF' : '#6B7280' }]}>
              By continuing, you agree to our{' '}
              <Text style={[styles.link, { color: colorScheme === 'dark' ? '#60A5FA' : '#3B82F6' }]}>Terms of Service</Text> and{' '}
              <Text style={[styles.link, { color: colorScheme === 'dark' ? '#60A5FA' : '#3B82F6' }]}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#6B7280',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  emailButton: {
    marginTop: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  googleButtonLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  googleButtonDark: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
  },
  googleButtonDisabled: {
    opacity: 0.5,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  googleButtonTextDark: {
    color: '#F9FAFB',
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: 24,
  },
  footerText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 18,
  },
  link: {
    color: '#3B82F6',
    fontWeight: '500',
  },
});
