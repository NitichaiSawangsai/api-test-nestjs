import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { QueryUserDto } from "../dtos/user.dto";
import { hashEmailUseWhere } from "../../common/utils/hash-data-identifiable.utils";
import serverConf from '../../config/server.config';
import { ConfigType } from "@nestjs/config";

@Injectable()
export class UserService {
  constructor(
    @Inject(serverConf.KEY)
    private readonly serverConfig: ConfigType<typeof serverConf>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}


  async getUser(user, query: QueryUserDto) {
    const email =
      typeof user?.['encodeEmail'] === 'function'
        ? user.encodeEmail()
        : user?.['encodeEmail'];

    const qb = this.userRepository
      .createQueryBuilder('user')
      .where(hashEmailUseWhere(this.serverConfig.auth.jwtSecretKey, 'email'), {
        email,
      });

    if (user?.['id']) {
      qb.andWhere('user.id = :id', { id: user['id'] });
    }

    if (query?.orderBy) {
      const orderBy = query.orderBy.split(',');
      orderBy.forEach((order) => {
        const [column, orderType] = order.split(':');
        qb.addOrderBy(
          `${column.trim()}`,
          orderType.trim().toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
        );
      });
    }

    let userDB = await qb.getOne();

    if (!userDB) {
      throw new NotFoundException('User not found', 'USER_NOT_FOUND');
    }

    return userDB
  }

}
