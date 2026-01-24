import type { User } from '@/types/auth';

/**
 * Mocked users database
 */
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe',
    role: 'user',
  },
  {
    id: '2',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
  },
];

/**
 * Find user by email
 */
export function findUserByEmail(email: string): User | undefined {
  return mockUsers.find((user) => user.email === email);
}

/**
 * Find user by email and password
 */
export function findUserByCredentials(
  email: string,
  password: string
): User | undefined {
  return mockUsers.find(
    (user) => user.email === email && user.password === password
  );
}
