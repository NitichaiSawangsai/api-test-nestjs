import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { IRequestAuth } from '../interface/auth.interface';

/**
 * UserReq decorator extracts the user from the request object.
 * The user is assumed to be populated by the JwtStrategy after validating the JWT.
 */
export const UserReq = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request: IRequestAuth = ctx.switchToHttp().getRequest();
    return request?.user?.user;
  },
);
