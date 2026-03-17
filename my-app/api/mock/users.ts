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
 * Create a new user
 */
export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<Omit<User, 'password'>> {
  await delay(700);

  const existing = findUserByEmail(input.email);
  if (existing) {
    throw new Error('Email already registered');
  }

  const newUser: User = {
    id: `${Date.now()}`,
    name: input.name,
    email: input.email,
    password: input.password,
    role: 'user',
  };

  mockUsers.push(newUser);
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
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

/**
 * Update user name
 */
export async function updateUserName(userId: string, newName: string): Promise<Omit<User, 'password'>> {
  await delay(500);

  const userIndex = mockUsers.findIndex((user) => user.id === userId);
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  mockUsers[userIndex].name = newName;
  const { password, ...userWithoutPassword } = mockUsers[userIndex];
  return userWithoutPassword;
}
