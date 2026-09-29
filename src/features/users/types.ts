import type { components } from '@/core/api/generated/openapi';

export type UserResponse = components['schemas']['UserResponseDto'];
export type PaginatedUsers = components['schemas']['PaginatedUsersResponseDto'];
export type CreateUserRequest = components['schemas']['CreateUserDto'];
export type ManagedUserRole = UserResponse['roles'][number];
