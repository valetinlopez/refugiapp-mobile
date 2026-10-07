import type { User } from '../types';

export function accountDisplayName(user: Pick<User, 'email' | 'firstName' | 'lastName'>): string {
  const fullName = `${user.firstName.trim()} ${user.lastName.trim()}`.trim();
  return fullName === '' ? user.email : fullName;
}

export function accountInitials(user: Pick<User, 'email' | 'firstName' | 'lastName'>): string {
  const initials = [user.firstName, user.lastName].map((part) => part.trim().charAt(0)).join('');

  return initials === '' ? user.email.slice(0, 2) : initials;
}
