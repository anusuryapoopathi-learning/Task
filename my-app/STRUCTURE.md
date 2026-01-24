# Project Structure

This document outlines the folder structure and organization of the React Native Expo project.

## 📁 Folder Structure

```
my-app/
├── api/                    # API layer
│   ├── auth/              # Authentication API
│   │   ├── index.ts       # Auth hooks (useLogin, useLogout, useAuth)
│   │   ├── queryKey.ts    # Query keys (backward compatibility)
│   │   └── type.ts        # Types (backward compatibility)
│   ├── mock/              # Mocked API utilities
│   │   ├── delay.ts       # Network delay simulation
│   │   ├── users.ts       # Mocked users database
│   │   └── index.ts       # Mock exports
│   ├── query-keys/        # Query keys factory
│   │   └── index.ts       # Centralized query keys using @barehera/query-key-factory
│   ├── queries.ts         # Re-export all API hooks
│   └── index.ts           # Main API exports
│
├── app/                   # Expo Router app directory
│   ├── _layout.tsx        # Root layout (includes QueryProvider)
│   ├── (tabs)/            # Tab navigation
│   ├── auth/              # Auth screens
│   │   ├── login.tsx      # Login screen with Zod validation
│   │   └── profile.tsx    # Profile screen with user data and logout
│   └── modal.tsx          # Modal screen
│
├── lib/                   # Core libraries and utilities
│   ├── query-client.tsx   # React Query setup and provider
│   └── storage/           # Storage utilities
│       ├── async-storage.ts  # AsyncStorage wrapper
│       ├── secure-store.ts   # SecureStore wrapper
│       └── index.ts          # Storage exports
│
├── schemas/               # Zod validation schemas
│   ├── auth.ts            # Auth schemas (login, register, user)
│   └── index.ts           # Schema exports
│
├── types/                 # TypeScript type definitions
│   ├── auth.ts            # Auth types (LoginResponse, AuthError)
│   └── index.ts           # Type exports
│
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── constants/             # App constants
└── assets/                # Static assets
```

## 🔧 Key Technologies

- **React Query** (`@tanstack/react-query`) - Data fetching and state management
- **Query Key Factory** (`@barehera/query-key-factory`) - Type-safe query keys
- **Zod** - Schema validation
- **AsyncStorage** (`@react-native-async-storage/async-storage`) - Persistent storage
- **SecureStore** (`expo-secure-store`) - Secure storage for sensitive data

## 📝 Usage Examples

### Using Auth Hooks

```typescript
import { useLogin, useAuth, useLogout } from '@/api/auth';
import { loginSchema } from '@/schemas/auth';

function LoginScreen() {
  const login = useLogin();
  const { data: user, isLoading } = useAuth();
  const logout = useLogout();

  const handleLogin = async (email: string, password: string) => {
    // Validate with Zod
    const validated = loginSchema.parse({ email, password });
    
    // Login
    await login.mutateAsync(validated);
  };

  return (
    // Your UI here
  );
}
```

### Using Storage

```typescript
import { asyncStorage, secureStore } from '@/lib/storage';

// AsyncStorage (for non-sensitive data)
await asyncStorage.setItem('theme', 'dark');
const theme = await asyncStorage.getItem<string>('theme');

// SecureStore (for sensitive data like tokens)
await secureStore.setItem('token', 'abc123');
const token = await secureStore.getItem('token');
```

### Using Query Keys

```typescript
import { queryKeys } from '@/api/query-keys';

// Access query keys
queryKeys.me.queryKey  // ['auth', 'me']
queryKeys.me._def      // ['auth', 'me'] (for invalidation)
queryKeys.login.queryKey  // ['auth', 'login']
```

### Validating with Zod

```typescript
import { loginSchema } from '@/schemas/auth';

try {
  const validated = loginSchema.parse({ email, password });
  // Use validated data
} catch (error) {
  // Handle validation errors
  if (error instanceof z.ZodError) {
    console.error(error.errors);
  }
}
```

## 🔐 Mocked Credentials

For testing purposes, the following mocked users are available:

- **Email:** `user@example.com` | **Password:** `password123`
- **Email:** `admin@example.com` | **Password:** `admin123`

## 🚀 Next Steps

1. Create auth screens in `app/auth/`
2. Add more API endpoints in `api/`
3. Extend schemas in `schemas/` as needed
4. Add more query keys in `api/query-keys/index.ts`
