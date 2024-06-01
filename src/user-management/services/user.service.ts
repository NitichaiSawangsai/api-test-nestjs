import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { QueryUserDto, QueryUsersDto } from "../dtos/user.dto";
import { hashEmailUseWhere } from "../../common/utils/hash-data-identifiable.utils";
import serverConf from '../../config/server.config';
import { ConfigType } from "@nestjs/config";
import { IUser } from "../../common/interface/auth.interface";

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


  async getV1Users(query: QueryUsersDto) {
    const queryBuilder = await this.userRepository.createQueryBuilder('user')
    
    if(query?.query){
      queryBuilder.where('LOWER(user.username) like LOWER(:query)',{
        query: `%${query.query}%` 
      })
    }

    return queryBuilder.offset((query.page -1) * query.limit ).limit(query.limit).getMany()
  }

  async getV2Users(query: QueryUsersDto) {
    const queryBuilder = await this.userRepository.createQueryBuilder('user')
    
    if(query?.query){
      queryBuilder.where('user.username ilike :query',{
        query: `%${query.query}%` 
      })
    }

    return queryBuilder.offset((query.page -1) * query.limit ).limit(query.limit).getMany()
  }

  async getV3Users(query: QueryUsersDto) {
    let textQuery = `
      SELECT *
      FROM "user-management"."user" u
      WHERE 1=1 ::WHERE
      OFFSET ${(query.page - 1) * query.limit}
      LIMIT ${query.limit}
    `
    const valueRaw = []
    
    if(query?.query){
      textQuery = textQuery.replace(
        /::WHERE/g,
        ` AND u.username ILIKE $1`
      )
      valueRaw.push(`%${query?.query}%`)
    }
    textQuery = textQuery.replace(
      /::WHERE/g,
      ``
    )

    return this.userRepository.query(textQuery,valueRaw)
  }
  
}
