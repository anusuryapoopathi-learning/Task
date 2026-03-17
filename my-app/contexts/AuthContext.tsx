import { useAuth, useLogin, useLogout, useSignup } from '@/api/auth';
import type { AuthError, LoginRequest } from '@/types/auth';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useMemo } from 'react';

type User = NonNullable<ReturnType<typeof useAuth>['data']>;

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (input: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const { data: user, isLoading } = useAuth();
  const loginMutation = useLogin();
  const signupMutation = useSignup();
  const logoutMutation = useLogout();

  const value: AuthContextValue = useMemo(
    () => ({
      user: user ?? null,
      isLoading,
      login: async (credentials) => {
        await loginMutation.mutateAsync(credentials);
      },
      signup: async (input) => {
        await signupMutation.mutateAsync(input);
      },
      logout: async () => {
        await logoutMutation.mutateAsync();
      },
    }),
    [user, isLoading, loginMutation, signupMutation, logoutMutation]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    const err = new Error('useAuthContext must be used within AuthProvider') as AuthError;
    err.code = 'AUTH_CONTEXT_MISSING';
    throw err;
  }
  return ctx;
}

