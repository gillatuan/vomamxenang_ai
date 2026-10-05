import { Request } from 'express';

export interface AuthenticatedUser {
  sub: string;
  userId: string;
  email: string;
  role: string;
}

export type AuthenticatedRequest = Request & { user: AuthenticatedUser };
