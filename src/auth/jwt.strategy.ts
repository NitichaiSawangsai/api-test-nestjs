import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserService } from '../user-management/services/user.service';
import { ConfigService } from '@nestjs/config';
import {
  IAuthPayload,
  IUserIAuthPayload,
} from '../common/interface/auth.interface';
import { User } from '../user-management/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: (_, _token, done) => {
        done(null, configService.get<string>('server.auth.jwtSecretKey'));
      },
    });
  }

  async validate(payload: IAuthPayload): Promise<IUserIAuthPayload> {
    const { id, email } = payload;
    const user: User = {
      id,
      email,
      username: null,
      status: null,
      createdAt: null,
      updatedAt: null,
      createdBy: null,
    };

    return Promise.resolve({ user });
  }
}
