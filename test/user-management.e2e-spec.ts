import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestUtil } from './utils/test-util';
import { AuthService } from '../src/auth/auth.service';
import { User } from '../src/user-management/entities/user.entity';
import { UserStatusType } from '../src/user-management/user-management.enum';
import { UserManagementModule } from '../src/user-management/user-management.module';
import { QueryUserDto } from '../src/user-management/dtos/user.dto';
import { UserService } from '../src/user-management/services/user.service';

describe('User Management module', () => {
  let app: NestFastifyApplication;
  let userRepository: Repository<User>;
  let authService: AuthService;
  let userService: UserService;

  beforeAll(async () => {
    const moduleRef = await TestUtil.createTestingModule({
      imports: [UserManagementModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    userRepository = app.get(getRepositoryToken(User));

    authService = moduleRef.get<AuthService>(AuthService);
    userService = moduleRef.get<UserService>(UserService);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  beforeEach(async () => {
    const user = userRepository.create({
      id: 1,
      email: 'admin@scg.com',
      password: '12345',
      refreshToken: '1',
      username: 'admin1',
      status: UserStatusType.Active,
      createdBy: 'admin@scg.com',
    });
    await userRepository.save([user]);

    jest.spyOn(authService, 'decodeJwt').mockImplementation(() => {
      return user;
    });

    jest
      .spyOn(userService, 'getUser')
      .mockImplementation((user, query: QueryUserDto) => {
        expect(user).toEqual(
          expect.objectContaining({
            id: 1,
            email: 'admin@scg.com',
          }),
        );
        expect(query).toEqual({ relations: 'user.role,user.menus,user2.menu' });
        return {
          ...user,
        };
      });
  });

  afterEach(async () => {
    await userRepository.delete({});
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });
});
