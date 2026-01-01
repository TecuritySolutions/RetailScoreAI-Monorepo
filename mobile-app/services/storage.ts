import * as SecureStore from 'expo-secure-store';

const TOKENS_KEY = 'auth_tokens';

export interface StoredTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export const StorageService = {
  async getTokens(): Promise<StoredTokens | null> {
    try {
      const tokensString = await SecureStore.getItemAsync(TOKENS_KEY);
      if (!tokensString) {
        return null;
      }
      return JSON.parse(tokensString) as StoredTokens;
    } catch (error) {
      console.error('Error getting tokens from secure storage:', error);
      return null;
    }
  },

  async setTokens(tokens: StoredTokens): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKENS_KEY, JSON.stringify(tokens));
    } catch (error) {
      console.error('Error saving tokens to secure storage:', error);
      throw error;
    }
  },

  async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKENS_KEY);
    } catch (error) {
      console.error('Error clearing tokens from secure storage:', error);
      throw error;
    }
  },
};
