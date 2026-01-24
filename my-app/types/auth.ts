export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface AuthError {
  message: string;
  code?: string;
}
