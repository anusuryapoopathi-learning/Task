# Architecture Decisions

This document outlines the key architectural decisions, patterns, and technologies used in this React Native task management application.

## Table of Contents

1. [Framework & Platform](#framework--platform)
2. [Routing](#routing)
3. [State Management](#state-management)
4. [Data Fetching](#data-fetching)
5. [Form Management](#form-management)
6. [Validation](#validation)
7. [Offline Support](#offline-support)
8. [Storage](#storage)
9. [Authentication](#authentication)
10. [Component Architecture](#component-architecture)
11. [Styling](#styling)
12. [Type Safety](#type-safety)
13. [Project Structure](#project-structure)

---

## Framework & Platform

### Expo
- **Decision**: Use Expo SDK for React Native development
- **Rationale**: 
  - Simplified development workflow
  - Built-in support for native modules
  - Easy deployment and updates
  - Cross-platform compatibility (iOS, Android, Web)
- **Version**: Expo SDK ~54.0.32

### React Native
- **Decision**: React Native for mobile app development
- **Rationale**: 
  - Cross-platform code sharing
  - Large ecosystem
  - Strong community support
- **Version**: React Native 0.81.5

### React
- **Decision**: React 19.1.0 with React Compiler enabled
- **Rationale**: 
  - Latest features and performance improvements
  - React Compiler for automatic optimizations
  - Modern hooks API

---

## Routing

### Expo Router
- **Decision**: File-based routing with Expo Router
- **Rationale**: 
  - File-based routing 
  - Type-safe routes
  - Deep linking support
  - Automatic code splitting
- **Features Used**:
  - Nested routing with `(tabs)` group
  - Route guards with `_auth-guard.tsx`
  - Dynamic routes
  - Typed routes (experimental)

### Route Structure
```
app/
├── _layout.tsx          # Root layout
├── _auth-guard.tsx      # Authentication guard
├── welcome.tsx          # Welcome screen
├── auth/
│   ├── _layout.tsx
│   └── login.tsx
└── (tabs)/
    ├── _layout.tsx      # Tab navigation
    ├── index.tsx        # Dashboard
    ├── createTask/
    │   └── add.tsx
    ├── editTask/
    │   └── edit-task.tsx
    ├── taskDetails/
    │   └── task-details.tsx
    └── tasks/
        └── tasks.tsx
```

---

## State Management

### React Query (TanStack Query)
- **Decision**: Use TanStack Query (React Query) for server state management
- **Rationale**: 
  - Automatic caching and synchronization
  - Background refetching
  - Optimistic updates
  - Built-in loading and error states
  - Offline-first support
- **Version**: @tanstack/react-query ^5.90.20

### Local State
- **Decision**: React hooks (`useState`, `useReducer`) for component-level state
- **Rationale**: 
  - Simple and sufficient for UI state
  - No need for global state management library
  - Keeps state close to where it's used

---

## Data Fetching

### React Query Hooks Pattern
- **Decision**: Custom hooks for data fetching (`useTasks`, `useTask`, `useCreateTask`, etc.)
- **Rationale**: 
  - Reusable data fetching logic
  - Consistent API across the app
  - Easy to mock for testing
  - Type-safe queries

### Query Keys Factory
- **Decision**: Use `@barehera/query-key-factory` for type-safe query keys
- **Rationale**: 
  - Prevents query key typos
  - Type-safe invalidation
  - Better developer experience

### Mock API Layer
- **Decision**: Mock API implementation in `api/mock/` directory
- **Rationale**: 
  - Development without backend
  - Easy testing
  - Can be swapped with real API later

---

## Form Management

### React Hook Form
- **Decision**: Use React Hook Form for form state management
- **Rationale**: 
  - Better performance (uncontrolled components)
  - Less re-renders
  - Easy validation integration
  - Small bundle size
- **Version**: react-hook-form ^7.71.1

### Form Architecture
- **Decision**: Reusable form field components in `components/FormFields/`
- **Rationale**: 
  - DRY principle
  - Consistent form UI
  - Easy to maintain
  - Type-safe form fields

### Form Patterns
- **Decision**: Use `FormProvider` for form context
- **Rationale**: 
  - Clean component structure
  - Easy access to form methods
  - Better performance

---

## Validation

### Zod
- **Decision**: Use Zod for schema validation
- **Rationale**: 
  - TypeScript-first
  - Runtime validation
  - Type inference
  - Great developer experience
- **Version**: zod ^4.3.6

### Validation Integration
- **Decision**: Use `@hookform/resolvers` to integrate Zod with React Hook Form
- **Rationale**: 
  - Seamless integration
  - Automatic type inference
  - Consistent validation across forms

### Validation Files Structure
```
zod/
├── signinZod/
│   └── signinZod.ts
└── TastCreateZod/
    ├── createTask.ts
    └── EditTask.ts
```

---

## Offline Support

### Offline-First Architecture
- **Decision**: Implement offline-first data synchronization
- **Rationale**: 
  - Better user experience
  - Works without internet connection
  - Automatic sync when online

### Implementation Strategy
1. **Network Detection**: `@react-native-community/netinfo`
2. **Offline Queue**: Queue mutations when offline
3. **Optimistic Updates**: Update UI immediately
4. **Background Sync**: Sync when connection restored

### Offline Queue Service
- **Location**: `services/offlineQueue.ts`
- **Features**:
  - Queue mutations when offline
  - Retry when online
  - Track pending mutations
  - Clear queue after sync

### Offline Sync Provider
- **Location**: `components/OfflineSyncProvider/`
- **Purpose**: 
  - Monitor network status
  - Sync queued mutations
  - Show offline indicator

---

## Storage

### AsyncStorage
- **Decision**: Use `@react-native-async-storage/async-storage` for non-sensitive data
- **Rationale**: 
  - Simple key-value storage
  - Persistent across app restarts
  - Good for offline queue, cache, etc.

### SecureStore
- **Decision**: Use `expo-secure-store` for sensitive data (tokens, credentials)
- **Rationale**: 
  - Encrypted storage
  - Secure credential storage
  - Platform-specific secure storage

### Storage Abstraction
- **Location**: `lib/storage/`
- **Purpose**: 
  - Unified storage API
  - Easy to swap implementations
  - Type-safe storage operations

---

## Authentication

### Auth Guard Pattern
- **Decision**: Route-level authentication guard
- **Location**: `app/_auth-guard.tsx`
- **Rationale**: 
  - Centralized auth logic
  - Automatic route protection
  - Clean separation of concerns

### Auth Flow
1. Check authentication status
2. Redirect to login if not authenticated
3. Redirect to welcome/dashboard if authenticated
4. Show loading state during check

### Auth API
- **Location**: `api/auth/`
- **Features**:
  - Login/logout
  - Session management
  - User data fetching

---

## Component Architecture

### Component Organization
- **Decision**: Feature-based component organization
- **Structure**:
  ```
  components/
  ├── CustomButton/
  ├── CustomInput/
  ├── TaskCard/
  ├── FormFields/
  └── ...
  ```

### Component Patterns
1. **Container/Presentational**: Separate logic from presentation
2. **Compound Components**: For complex UI (e.g., FormFields)
3. **Reusable Components**: CustomButton, CustomInput, etc.

### Component Guidelines
- One component per file
- Co-located styles (separate `styles.ts` files)
- TypeScript interfaces for props
- Consistent naming conventions

---

## Styling

### StyleSheet API
- **Decision**: Use React Native StyleSheet API
- **Rationale**: 
  - Native performance
  - Type-safe styles
  - No external dependencies

### Style Organization
- **Decision**: Separate styles files (`styles.ts`) in component folders
- **Rationale**: 
  - Better code organization
  - Easier to maintain
  - Cleaner component files
- **Example**:
  ```
  app/(tabs)/createTask/
  ├── add.tsx
  └── styles.ts
  ```

### Design System
- **Decision**: Consistent color palette and spacing
- **Location**: `constants/theme.ts`
- **Features**:
  - Centralized colors
  - Consistent spacing
  - Typography scale

---

## Type Safety

### TypeScript
- **Decision**: Full TypeScript implementation
- **Version**: TypeScript ~5.9.2
- **Rationale**: 
  - Type safety
  - Better IDE support
  - Catch errors at compile time
  - Better refactoring

### Type Organization
- **Location**: `types/` directory
- **Pattern**: 
  - Shared types in `types/`
  - Feature-specific types co-located
  - Type exports from index files

### Type Patterns
- Interface for component props
- Type aliases for unions
- Generic types for reusable components

---

## Project Structure

### Folder Organization
```
my-app/
├── app/                    # Routes (Expo Router)
│   ├── (tabs)/            # Tab navigation group
│   ├── auth/              # Auth routes
│   └── welcome.tsx        # Welcome screen
├── api/                   # API layer
│   ├── auth/              # Auth API
│   ├── tasks/             # Tasks API
│   ├── mock/              # Mock API
│   └── query-keys/        # Query key factory
├── components/            # Reusable components
├── constants/             # Constants and config
├── hooks/                 # Custom React hooks
├── lib/                   # Library configurations
│   ├── query-client.tsx   # React Query setup
│   └── storage/           # Storage abstraction
├── services/              # Business logic services
├── types/                 # TypeScript types
├── utils/                 # Utility functions
└── zod/                   # Validation schemas
```

### Naming Conventions
- **Files**: kebab-case for routes, PascalCase for components
- **Components**: PascalCase
- **Hooks**: camelCase with `use` prefix
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase

### Code Organization Principles
1. **Feature-based**: Group related files together
2. **Separation of Concerns**: API, UI, logic separated
3. **Reusability**: Shared code in common directories
4. **Scalability**: Easy to add new features

---

## Key Libraries & Tools

### Core Dependencies
- **expo-router**: File-based routing
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form management
- **zod**: Schema validation
- **@react-native-async-storage/async-storage**: Local storage
- **expo-secure-store**: Secure storage
- **@react-native-community/netinfo**: Network detection

### UI Libraries
- **@expo/vector-icons**: Icon library
- **expo-linear-gradient**: Gradient components
- **react-native-safe-area-context**: Safe area handling

### Development Tools
- **TypeScript**: Type safety
- **ESLint**: Code linting
- **expo-lint**: Expo-specific linting

---

## Performance Optimizations

### React Query Optimizations
- Query caching
- Background refetching
- Optimistic updates
- Request deduplication

### React Optimizations
- React Compiler (experimental)
- Memoization where needed
- FlatList for long lists
- KeyboardAvoidingView for forms

### Code Splitting
- File-based routing (automatic code splitting)
- Lazy loading where appropriate

---

## Testing Strategy

### Current State
- Mock API layer for development
- Type safety for compile-time checks

### Future Considerations
- Unit tests for utilities
- Component tests
- Integration tests for critical flows
- E2E tests for user journeys

---

## Security Considerations

### Data Storage
- SecureStore for sensitive data
- AsyncStorage for non-sensitive data

### Authentication
- Secure token storage
- Route guards for protected routes

### Network
- HTTPS for API calls (when implemented)
- Secure credential handling


## References

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)


