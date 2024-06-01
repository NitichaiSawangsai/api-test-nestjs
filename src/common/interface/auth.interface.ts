import { User } from '../../user-management/entities/user.entity';

export interface IUserIAuthPayload {
  user?: User;
  IAccessToken?: string;
}

export interface IAuthPayload {
  id: number;
  email: string;
}

export interface IAccessToken {
  accessToken: string;
}

export interface IRequestAuth extends Request {
  user: IUserIAuthPayload;
  get: (param: string) => string;
}

export type IUser = User;
