import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    id: bigint;
    firstName: string | null;
    lastName: string | null;
    name: string | null;
    email: string;
    role: string;
    isActive: boolean;
  };
}

export type UserInRequestWithUser = RequestWithUser['user'];

export interface RequestWithUserInJWTStrategy extends Request {
  user: {
    userId: bigint;
    username: string;
    role: string;
    firstName: string | null;
    lastName: string | null;
    name: string | null;
  };
}

export type UserInRequestWithUserInJWTStrategy =
  RequestWithUserInJWTStrategy['user'];
