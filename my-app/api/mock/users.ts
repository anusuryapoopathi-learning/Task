import type { User } from '@/types/auth';
import { delay } from './delay';

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
  {
    id: '3',
    email: 'testing@gmail.com',
    password: 'Test@123',
    name: 'Testing User',
    role: 'user',
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

/**
 * Update user email
 */
export async function updateUserEmail(userId: string, newEmail: string): Promise<Omit<User, 'password'>> {
  await delay(500); // Simulate network delay
  
  const userIndex = mockUsers.findIndex((user) => user.id === userId);
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  // Update email in mock database
  mockUsers[userIndex].email = newEmail;

  // Return user without password
  const { password, ...userWithoutPassword } = mockUsers[userIndex];
  return userWithoutPassword;
}
