import { Alert } from 'react-native';
import { ApiRequestError, UnauthorizedError } from '@/types/api';

export const handleError = (error: unknown, customMessage?: string): void => {
  if (error instanceof UnauthorizedError) {
    Alert.alert('Session Expired', 'Please log in again to continue.');
    return;
  }

  if (error instanceof ApiRequestError) {
    Alert.alert('Error', error.message);
    return;
  }

  if (error instanceof Error) {
    Alert.alert('Error', customMessage || error.message);
    return;
  }

  Alert.alert('Error', customMessage || 'An unexpected error occurred. Please try again.');
};

export const showSuccess = (message: string, title: string = 'Success'): void => {
  Alert.alert(title, message);
};

export const showConfirmation = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
): void => {
  Alert.alert(title, message, [
    {
      text: 'Cancel',
      style: 'cancel',
      onPress: onCancel,
    },
    {
      text: 'OK',
      onPress: onConfirm,
    },
  ]);
};
