import type { components } from '@/core/api/generated/openapi';

export type LoginRequest = components['schemas']['LoginDto'];
export type AuthResponse = components['schemas']['AuthResponseDto'];
export type User = components['schemas']['AuthenticatedUser'];
export type UserRole = User['roles'][number];
