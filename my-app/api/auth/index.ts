import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { queryKeys } from '@/api/query-keys';
import { findUserByCredentials } from '@/api/mock/users';
import { delay } from '@/api/mock/delay';
import { secureStore, asyncStorage } from '@/lib/storage';
import type { LoginRequest, LoginResponse, AuthError, User } from '@/types/auth';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Login mutation
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, AuthError, LoginRequest>({
    mutationFn: async (credentials) => {
      await delay(800); // Simulate network delay

      const user = findUserByCredentials(credentials.email, credentials.password);

      if (!user) {
        throw {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        } as AuthError;
      }

      // Generate mock token
      const token = `mock_token_${user.id}_${Date.now()}`;

      // Store token securely
      await secureStore.setItem(TOKEN_KEY, token);

      // Store user data
      const { password, ...userWithoutPassword } = user;
      await asyncStorage.setItem(USER_KEY, userWithoutPassword);

      return {
        user: userWithoutPassword,
        token,
      };
    },
    onSuccess: (data) => {
      // Update query cache
      queryClient.setQueryData(queryKeys.me.queryKey, data.user);
      // Navigate to profile or home
      router.replace('/(tabs)');
    },
  });
}

/**
 * Logout mutation
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await delay(300); // Simulate network delay

      // Clear storage
      await secureStore.removeItem(TOKEN_KEY);
      await asyncStorage.removeItem(USER_KEY);
    },
    onSuccess: () => {
      // Clear query cache
      queryClient.removeQueries({ queryKey: queryKeys.me._def });
      // Navigate to login
      router.replace('/auth/login');
    },
  });
}

/**
 * Get current authenticated user
 */
export function useAuth() {
  return useQuery<User | null>({
    queryKey: queryKeys.me.queryKey,
    queryFn: async () => {
      // Check if token exists
      const token = await secureStore.getItem(TOKEN_KEY);
      if (!token) {
        return null;
      }

      // Get user from storage
      const user = await asyncStorage.getItem<User>(USER_KEY);
      return user || null;
    },
    staleTime: Infinity, // User data doesn't change often
    retry: false,
  });
}
