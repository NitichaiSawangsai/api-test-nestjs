import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from '../user-management/services/user.service';
import { IAccessToken, IAuthPayload } from '../common/interface/auth.interface';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user-management/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import serverConf from '../config/server.config';
import { ConfigType } from '@nestjs/config';
import * as moment from 'moment-timezone';
import { LoginDto } from './dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(serverConf.KEY)
    private readonly serverConfig: ConfigType<typeof serverConf>,

    private jwtService: JwtService,
    private readonly userService: UserService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  decodeJwt(token: string): User {
    return this.jwtService.verify(token);
  }

  async signUserToken(payload: IAuthPayload): Promise<IAccessToken> {
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = LOWER(:email)', {
        email: dto?.email,
      })
      .andWhere(`user.password = :password`, {
        password: dto?.password,
      })
      .getOne();

    if (!user) {
      throw new NotFoundException(
        `Please contact your system administrator`,
        'EMAIL_INCORRECT_OR_PASSWORD_INCORRECT',
      );
    }

    const lastLogin = moment().toDate();
    const refreshToken = await this.signUserToken({
      id: user.id,
      email: user.email,
      lastLogin,
    } as any);

    const [token] = await Promise.all([
      this.signUserToken({
        id: user.id,
        email: user.email,
        refreshToken: refreshToken?.accessToken || null,
      } as any),
      this.userRepository.save({
        ...user,
        refreshToken: refreshToken?.accessToken || null,
        lastLogin,
      }),
    ]);

    return token;
  }
}
