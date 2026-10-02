import type { components } from '@/core/api/generated/openapi';

export type LoginRequest = components['schemas']['LoginDto'];
export type AuthResponse = components['schemas']['AuthResponseDto'];
export type User = components['schemas']['AuthenticatedUser'];
export type UserRole = User['roles'][number];
export type ChangePasswordRequest = components['schemas']['ChangePasswordDto'];
export type RequestPasswordResetRequest = components['schemas']['RequestPasswordResetDto'];
export type PasswordResetRequestedResponse = components['schemas']['PasswordResetRequestedDto'];
export type ConfirmPasswordResetRequest = components['schemas']['ConfirmPasswordResetDto'];
