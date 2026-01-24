import { delay } from '@/api/mock/delay';
import { findUserByCredentials, updateUserEmail } from '@/api/mock/users';
import { queryKeys } from '@/api/query-keys';
import { asyncStorage, secureStore } from '@/lib/storage';
import type { AuthError, LoginRequest, LoginResponse, User } from '@/types/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

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
      queryClient.setQueryData<Omit<User, 'password'> | null>(
        queryKeys.me.queryKey,
        data.user
      );
      // Navigate to welcome screen
      router.replace('/welcome');
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
      queryClient.removeQueries({ queryKey: queryKeys.me.queryKey });
      // Navigate to login
      router.replace('/auth/login');
    },
  });
}

/**
 * Update user email mutation
 */
export function useUpdateEmail() {
  const queryClient = useQueryClient();

  return useMutation<Omit<User, 'password'>, Error, { userId: string; newEmail: string }>({
    mutationFn: async ({ userId, newEmail }) => {
      // Update email in mock API
      const updatedUser = await updateUserEmail(userId, newEmail);

      // Update user data in storage
      await asyncStorage.setItem(USER_KEY, updatedUser);

      return updatedUser;
    },
    onSuccess: (data) => {
      // Update query cache
      queryClient.setQueryData<Omit<User, 'password'> | null>(
        queryKeys.me.queryKey,
        data
      );
    },
  });
}

/**
 * Get current authenticated user
 */
export function useAuth() {
  return useQuery<Omit<User, 'password'> | null>({
    queryKey: queryKeys.me.queryKey,
    queryFn: async () => {
      // Check if token exists
      const token = await secureStore.getItem(TOKEN_KEY);
      if (!token) {
        return null;
      }

      // Get user from storage
      const user = await asyncStorage.getItem<Omit<User, 'password'>>(USER_KEY);
      return user || null;
    },
    staleTime: Infinity, // User data doesn't change often
    retry: false,
  });
}
