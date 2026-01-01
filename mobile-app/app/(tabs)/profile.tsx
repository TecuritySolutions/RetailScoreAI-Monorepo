import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';
import { userApi } from '@/services/api/user.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { validators } from '@/utils/validators';
import { ApiRequestError } from '@/types/api';
import type { UpdateUserProfileDTO } from '@/types/auth';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const { user, logout, updateProfile } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone_number: user?.phone_number || '',
    company_name: user?.company_name || '',
    city: user?.city || '',
    state: user?.state || '',
    country: user?.country || 'India',
  });

  const [errors, setErrors] = useState({
    phone_number: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await userApi.getProfile();
      if (response.success && response.user) {
        updateProfile(response.user);
        setFormData({
          full_name: response.user.full_name || '',
          phone_number: response.user.phone_number || '',
          company_name: response.user.company_name || '',
          city: response.user.city || '',
          state: response.user.state || '',
          country: response.user.country || 'India',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { phone_number: '' };

    if (formData.phone_number && !validators.phoneNumber(formData.phone_number, formData.country)) {
      newErrors.phone_number = formData.country === 'India'
        ? 'Phone number must be 10 digits'
        : 'Phone number must be 10-20 digits';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const updates: UpdateUserProfileDTO = {};
      if (formData.full_name) updates.full_name = formData.full_name;
      if (formData.phone_number) updates.phone_number = formData.phone_number;
      if (formData.company_name) updates.company_name = formData.company_name;
      if (formData.city) updates.city = formData.city;
      if (formData.state) updates.state = formData.state;
      if (formData.country) updates.country = formData.country;

      const response = await userApi.updateProfile(updates);
      if (response.success && response.user) {
        updateProfile(response.user);
        Alert.alert('Success', response.message);
      }
    } catch (error) {
      if (error instanceof ApiRequestError) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const getInitials = () => {
    if (user?.full_name) {
      return user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#111827' : '#F9FAFB' }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
          <Text style={[styles.email, { color: colorScheme === 'dark' ? '#D1D5DB' : '#6B7280' }]}>
            {user?.email}
          </Text>
          {user?.subscription_tier && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{user.subscription_tier}</Text>
            </View>
          )}
          {user?.total_assessments_count !== undefined && (
            <Text style={[styles.assessmentsCount, { color: colorScheme === 'dark' ? '#9CA3AF' : '#6B7280' }]}>
              {user.total_assessments_count} Total Assessments
            </Text>
          )}
        </View>

        <Card style={styles.formCard}>
          <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#F9FAFB' : '#1F2937' }]}>
            Profile Information
          </Text>

          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.full_name}
            onChangeText={(text) => setFormData({ ...formData, full_name: text })}
            editable={!saving}
          />

          <Input
            label="Phone Number"
            placeholder="Enter your phone number"
            value={formData.phone_number}
            onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
            keyboardType="phone-pad"
            error={errors.phone_number}
            editable={!saving}
          />

          <Input
            label="Company Name"
            placeholder="Enter your company name"
            value={formData.company_name}
            onChangeText={(text) => setFormData({ ...formData, company_name: text })}
            editable={!saving}
          />

          <Input
            label="City"
            placeholder="Enter your city"
            value={formData.city}
            onChangeText={(text) => setFormData({ ...formData, city: text })}
            editable={!saving}
          />

          <Input
            label="State"
            placeholder="Enter your state"
            value={formData.state}
            onChangeText={(text) => setFormData({ ...formData, state: text })}
            editable={!saving}
          />

          <Input
            label="Country"
            placeholder="Enter your country"
            value={formData.country}
            onChangeText={(text) => setFormData({ ...formData, country: text })}
            editable={!saving}
          />

          <Button
            title="Update Profile"
            onPress={handleUpdateProfile}
            loading={saving}
            style={styles.updateButton}
          />
        </Card>

        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          disabled={saving}
          style={styles.logoutButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  email: {
    fontSize: 16,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  assessmentsCount: {
    fontSize: 14,
  },
  formCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  updateButton: {
    marginTop: 8,
  },
  logoutButton: {
    marginTop: 16,
  },
});
