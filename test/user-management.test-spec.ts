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

    jest.spyOn(authService, 'decodeJwt').mockImplementation((param) => {
      if (param === '123345') {
        return user;
      }
      return null;
    });

    jest.spyOn(userService, 'getUser').mockImplementation((user) => {
      if (user.id === 1) {
        return user;
      }
      return null;
    });
  });

  afterEach(async () => {
    await userRepository.delete({});
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('/GET /api/v1/management/v1/users', () => {
    it('Should be error dto', () =>
      app
        .inject({
          method: 'GET',
          url: '/api/v1/management/v1/users',
          headers: {
            authorization: '123345',
          },
        })
        .then((result) => {
          const json = result.json();
          expect(json).toEqual({
            statusCode: 400,
            message: [
              'page must be a number conforming to the specified constraints',
              'limit must be a number conforming to the specified constraints',
            ],
            error: 'Bad Request',
          });
        }));

    it('Should be success', () => {
      return app
        .inject({
          method: 'GET',
          url: '/api/v1/management/v1/users',
          headers: {
            authorization: '123345',
          },
          query: {
            query: 'admin1',
            page: '1',
            limit: '10',
          },
        })
        .then((result) => {
          const json = result.json();
          expect(json).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                username: 'admin1',
                password: '12345',
                email: 'admin@scg.com',
                status: 'active',
              }),
            ]),
          );
        });
    });
  });

  describe('MOCK Entity', () => {
    describe('/GET /api/v2/management/v2/users', () => {
      it('Should be error dto', () =>
        app
          .inject({
            method: 'GET',
            url: '/api/v1/management/v2/users',
            headers: {
              authorization: '123345',
            },
          })
          .then((result) => {
            const json = result.json();
            expect(json).toEqual({
              statusCode: 400,
              message: [
                'page must be a number conforming to the specified constraints',
                'limit must be a number conforming to the specified constraints',
              ],
              error: 'Bad Request',
            });
          }));

      it('Should be success', () => {
        userRepository.createQueryBuilder = jest
          .fn()
          .mockImplementationOnce((v1) => {
            expect(v1).toEqual('user');
            return {
              where: (v21, v22) => {
                expect(v21).toEqual('user.username ilike :query');
                expect(v22).toEqual({ query: '%admin1%' });
              },
              offset: (v3) => {
                expect(v3).toEqual(0);
                return {
                  limit: (v4) => {
                    expect(v4).toEqual(10);
                    return {
                      getMany: () => {
                        return [
                          {
                            username: 'admin1',
                            password: '12345',
                            email: 'admin@scg.com',
                            status: 'active',
                          },
                        ];
                      },
                    };
                  },
                };
              },
            };
          });

        return app
          .inject({
            method: 'GET',
            url: '/api/v1/management/v2/users',
            headers: {
              authorization: '123345',
            },
            query: {
              query: 'admin1',
              page: '1',
              limit: '10',
            },
          })
          .then((result) => {
            const json = result.json();
            expect(json).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  username: 'admin1',
                  password: '12345',
                  email: 'admin@scg.com',
                  status: 'active',
                }),
              ]),
            );
          });
      });
    });

    describe('/GET /api/v3/management/v3/users', () => {
      it('Should be error dto', () =>
        app
          .inject({
            method: 'GET',
            url: '/api/v1/management/v3/users',
            headers: {
              authorization: '123345',
            },
          })
          .then((result) => {
            const json = result.json();
            expect(json).toEqual({
              statusCode: 400,
              message: [
                'page must be a number conforming to the specified constraints',
                'limit must be a number conforming to the specified constraints',
              ],
              error: 'Bad Request',
            });
          }));

      it('Should be success', () => {
        userRepository.query = jest.fn().mockImplementationOnce((v1) => {
          expect(v1?.replace(/ /gi, '')).toEqual(
            `
            SELECT *
            FROM "user-management"."user" u
            WHERE 1=1  AND u.username ILIKE $1
            OFFSET 0
            LIMIT 10
            `?.replace(/ /gi, ''),
          );
          return [
            {
              username: 'admin1',
              password: '12345',
              email: 'admin@scg.com',
              status: 'active',
            },
          ];
        });

        return app
          .inject({
            method: 'GET',
            url: '/api/v1/management/v3/users',
            headers: {
              authorization: '123345',
            },
            query: {
              query: 'admin1',
              page: '1',
              limit: '10',
            },
          })
          .then((result) => {
            const json = result.json();
            expect(json).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  username: 'admin1',
                  password: '12345',
                  email: 'admin@scg.com',
                  status: 'active',
                }),
              ]),
            );
          });
      });
    });
  });
});
