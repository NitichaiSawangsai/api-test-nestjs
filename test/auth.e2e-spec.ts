import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestUtil } from './utils/test-util';
import { AuthService } from '../src/auth/auth.service';
import { User } from '../src/user-management/entities/user.entity';
import { AuthModule } from '../src/auth/auth.module';
import { UserService } from '../src/user-management/services/user.service';
import { QueryUserDto } from '../src/user-management/dtos/user.dto';
import { UserStatusType } from '../src/user-management/user-management.enum';

describe('Auth module', () => {
  let app: NestFastifyApplication;
  let userRepository: Repository<User>;
  let authService: AuthService;
  let userService: UserService;

  beforeAll(async () => {
    const moduleRef = await TestUtil.createTestingModule({
      imports: [AuthModule],
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
      createdBy: 'admin@scg.com',
      status: UserStatusType.Active,
    });

    await userRepository.save([
      user,
      userRepository.create({
        id: 2,
        email: 'admin2@scg.com',
        password: null,
        username: 'admin2',
        createdBy: 'admin@scg.com',
        status: UserStatusType.Inactive,
      }),
      userRepository.create({
        id: 3,
        email: 'admin3@scg.com',
        password: '12345',
        username: 'admin3',
        createdBy: 'admin@scg.com',
        status: UserStatusType.Inactive,
      }),
      userRepository.create({
        id: 4,
        email: 'admin4@scg.com',
        password: '12345',
        username: 'admin4',
        createdBy: 'admin@scg.com',
        status: UserStatusType.Inactive,
      }),
      userRepository.create({
        id: 5,
        email: 'admin5@scg.com',
        password: '12345',
        username: 'admin5',
        createdBy: 'admin@scg.com',
        status: UserStatusType.Inactive,
      }),
      userRepository.create({
        id: 6,
        email: 'admin6@scg.com',
        password: '12345',
        username: 'admin6',
        createdBy: 'admin@scg.com',
        status: UserStatusType.Inactive,
      }),
    ]);

    jest.spyOn(authService, 'decodeJwt').mockImplementation(() => {
      return user;
    });

    jest.spyOn(userService, 'getUser').mockImplementation((user) => {
      expect(user).toEqual(
        expect.objectContaining({
          id: 1,
          email: 'admin@scg.com',
        }),
      );
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

  // describe('/POST login', () => {
  //   it('Should be error show message', () =>
  //     app
  //       .inject({
  //         method: 'POST',
  //         url: '/api/v1/auth/login',
  //       })
  //       .then((result) => {
  //         const json = result.json();
  //         expect(json).toEqual({
  //           statusCode: 400,
  //           message: [
  //             `Please contact your system administrator.`,
  //             'email should not be empty',
  //             'password must be a string',
  //             'password should not be empty',
  //           ],
  //           error: 'Bad Request',
  //         });
  //       }));

  //   it('Should be success', () =>
  //     app
  //       .inject({
  //         method: 'POST',
  //         url: '/api/v1/auth/login',
  //         payload: {
  //           email: 'admin@scg.com',
  //           password: '12345',
  //         },
  //       })
  //       .then((result) => {
  //         const json = result.json();
  //         expect(json?.accessToken).not.toEqual(undefined);
  //       }));

  //   it('Should be login not success case 1', () =>
  //     app
  //       .inject({
  //         method: 'POST',
  //         url: '/api/v1/auth/login',
  //         payload: {
  //           email: 'admin@scg.com',
  //           password: '12',
  //         },
  //       })
  //       .then((result) => {
  //         const json = result.json();
  //         expect(json).toEqual({
  //           statusCode: 404,
  //           message: `We can't sign into your account. Please contact your system administrator`,
  //           error: 'EMAIL_INCORRECT_OR_PASSWORD_INCORRECT',
  //         });
  //       }));

  //   it('Should be login not success case 2', () =>
  //     app
  //       .inject({
  //         method: 'POST',
  //         url: '/api/v1/auth/login',
  //         payload: {
  //           email: 'admin3@scg.com',
  //           password: '12345',
  //         },
  //       })
  //       .then((result) => {
  //         const json = result.json();
  //         expect(json).toEqual({
  //           statusCode: 404,
  //           message:
  //             "We can't sign into your account. Please contact your system administrator.",
  //           error: 'EMPLOYEE_NOT_FOUND',
  //         });
  //       }));

  //   it('Should be login not success case 3', () =>
  //     app
  //       .inject({
  //         method: 'POST',
  //         url: '/api/v1/auth/login',
  //         payload: {
  //           email: 'admin4@scg.com',
  //           password: '12345',
  //         },
  //       })
  //       .then((result) => {
  //         const json = result.json();
  //         expect(json).toEqual({
  //           statusCode: 404,
  //           message:
  //             "We can't sign into your account. Please contact your system administrator.",
  //           error: 'EMPLOYEE_NOT_FOUND',
  //         });
  //       }));

  //   it('Should be login not success case 4', () =>
  //     app
  //       .inject({
  //         method: 'POST',
  //         url: '/api/v1/auth/login',
  //         payload: {
  //           email: 'admin5@scg.com',
  //           password: '12345',
  //         },
  //       })
  //       .then((result) => {
  //         const json = result.json();
  //         expect(json).toEqual({
  //           statusCode: 404,
  //           message:
  //             "We can't sign into your account. Please contact your system administrator.",
  //           error: 'EMPLOYEE_NOT_FOUND',
  //         });
  //       }));

  //   it('Should be login not success case 5', () =>
  //     app
  //       .inject({
  //         method: 'POST',
  //         url: '/api/v1/auth/login',
  //         payload: {
  //           email: 'admin6@scg.com',
  //           password: '12345',
  //         },
  //       })
  //       .then((result) => {
  //         const json = result.json();
  //         expect(json).toEqual({
  //           statusCode: 404,
  //           message:
  //             "We can't sign into your account. Please contact your system administrator.",
  //           error: 'EMPLOYEE_NOT_FOUND',
  //         });
  //       }));
  // });
});
