export type UserRole = 'ADMIN' | 'VENDEDOR' | 'OPERARIO';

export interface User {
  id: number;
  username: string;
  password?: string;
  role: UserRole;
  token?: string;
  email?: string;
  fullName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role: UserRole;
  email?: string;
  fullName?: string;
}
