import { delay } from '@/api/mock/delay';
import { createUser, findUserByEmail, updateUserName } from '@/api/mock/users';
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

      const userByEmail = findUserByEmail(credentials.email);
      if (!userByEmail) {
        throw { message: 'User not found', code: 'USER_NOT_FOUND' } as AuthError;
      }

      if (userByEmail.password !== credentials.password) {
        throw { message: 'Invalid password', code: 'INVALID_CREDENTIALS' } as AuthError;
      }

      // Generate mock token
      const token = `mock_token_${userByEmail.id}_${Date.now()}`;

      // Store token securely
      await secureStore.setItem(TOKEN_KEY, token);

      // Store user data
      const { password, ...userWithoutPassword } = userByEmail;
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
 * Signup mutation (creates user, does NOT log in)
 */
export function useSignup() {
  return useMutation<Omit<User, 'password'>, AuthError, { name: string; email: string; password: string }>({
    mutationFn: async (input) => {
      try {
        const user = await createUser(input);
        return user;
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Signup failed';
        throw { message, code: 'SIGNUP_FAILED' } as AuthError;
      }
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
 * Update user name mutation
 */
export function useUpdateName() {
  const queryClient = useQueryClient();

  return useMutation<Omit<User, 'password'>, Error, { userId: string; newName: string }>({
    mutationFn: async ({ userId, newName }) => {
      const updatedUser = await updateUserName(userId, newName);
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
