import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
  forwardRef,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserService } from '../../user-management/services/user.service';
import { User } from '../../user-management/entities/user.entity';
import { encodeEmail } from '../../common/utils/hash-data-identifiable.utils';
import { Reflector } from '@nestjs/core';

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,

    @Inject(forwardRef(() => UserService))
    private userService: UserService,

    @Inject(forwardRef(() => HttpService))
    private httpService: HttpService,

    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const bearer = request.headers.authorization?.replace(/^bearer\s/i, '');

    let user: User = null;
    let errorDecode = null;
    let userMe: any = null;
    try {
      try {
        user = await this.authService.decodeJwt(bearer);
      } catch (error) {
        errorDecode = error;
      }

      if (user?.email) {
        const token = encodeEmail(process.env.JWT_SECRET_KEY, user.email);

        userMe = user;
        user = await this.userService.getUser(
          { ...userMe, encodeEmail: token },
          {
          },
        );
      }
    } catch (error) {
      if (error?.response?.error === 'STATUS_INACTIVE') {
        throw new ForbiddenException(
          error?.response?.message,
          error?.response?.error,
        );
      } else {
        throw new BadRequestException(
          error?.response?.message,
          error?.response?.error,
        );
      }
    }

    if (!user?.refreshToken || userMe?.refreshToken !== user?.refreshToken) {
      throw new UnauthorizedException();
    }

    if (errorDecode) {
      throw new UnauthorizedException();
    }

    if (!user?.id) {
      throw new NotFoundException('user not found', 'USER_NOT_FOUND');
    }

    request.user = {};
    request.user.user = user;

    return true;
  }
}
