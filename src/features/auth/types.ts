export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'vet' | 'caregiver' | 'volunteer';
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
