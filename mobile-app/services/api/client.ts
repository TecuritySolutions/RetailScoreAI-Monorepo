import { API_CONFIG } from '@/constants/api-config';
import { StorageService } from '@/services/storage';
import { ApiRequestError, UnauthorizedError } from '@/types/api';

class ApiClient {
  private baseURL: string;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const tokens = await StorageService.getTokens();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (tokens?.access_token) {
      headers['Authorization'] = `Bearer ${tokens.access_token}`;
    }

    return headers;
  }

  private async handleTokenRefresh(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const tokens = await StorageService.getTokens();
        if (!tokens?.refresh_token) {
          throw new UnauthorizedError('No refresh token available');
        }

        const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.REFRESH_TOKEN}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: tokens.refresh_token }),
        });

        if (!response.ok) {
          await StorageService.clearTokens();
          throw new UnauthorizedError('Token refresh failed');
        }

        const data = await response.json();
        if (data.success && data.tokens) {
          await StorageService.setTokens(data.tokens);
          return true;
        }

        await StorageService.clearTokens();
        return false;
      } catch (error) {
        await StorageService.clearTokens();
        return false;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      // Handle 401 - Attempt token refresh and retry
      if (response.status === 401) {
        const refreshed = await this.handleTokenRefresh();
        if (refreshed) {
          // Retry the original request with new token
          const newHeaders = await this.getAuthHeaders();
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              ...newHeaders,
              ...options.headers,
            },
          });

          if (!retryResponse.ok) {
            const errorData = await retryResponse.json().catch(() => ({
              message: 'Request failed after token refresh',
            }));
            throw new ApiRequestError(
              errorData.message || 'Request failed',
              retryResponse.status
            );
          }

          return retryResponse.json();
        } else {
          throw new UnauthorizedError('Session expired. Please log in again.');
        }
      }

      // Handle other errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'An unexpected error occurred',
        }));
        throw new ApiRequestError(
          errorData.message || `Request failed with status ${response.status}`,
          response.status
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiRequestError || error instanceof UnauthorizedError) {
        throw error;
      }
      throw new ApiRequestError(
        error instanceof Error ? error.message : 'Network error occurred',
        0
      );
    }
  }

  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
