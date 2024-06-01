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
import { Role } from '../src/user-management/entities/role.entity';
import { AuthModule } from '../src/auth/auth.module';
import { Employee } from '../src/employee/entities/employee.entity';
import { EmployeeCountry, EmployeeType } from '../src/employee/employee.enum';
import { UserService } from '../src/user-management/services/user.service';
import { QueryUserDto } from '../src/user-management/dtos/user.dto';
import { faker } from '@faker-js/faker';
import * as moment from 'moment';

describe('Auth module', () => {
  let app: NestFastifyApplication;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;
  let employeeRepository: Repository<Employee>;
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
    roleRepository = app.get(getRepositoryToken(Role));
    employeeRepository = app.get(getRepositoryToken(Employee));

    authService = moduleRef.get<AuthService>(AuthService);
    userService = moduleRef.get<UserService>(UserService);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  beforeEach(async () => {
    const role = roleRepository.create({
      id: 1,
      name: 'admin',
      createdBy: 'admin@scg.com',
    });

    await roleRepository.save(role);

    const user = userRepository.create({
      id: 1,
      roleId: role?.id,
      email: 'admin@scg.com',
      password: '12345',
      refreshToken: '1',
      firstname: 'admin1',
      lastname: 'admin2',
      status: UserStatusType.Inactive,
      createdBy: 'admin@scg.com',
      employee: employeeRepository.create({
        id: 1,
        email: 'admin@scg.com',
        firstNameEn: 'admin',
        employeeType: EmployeeType.Payroll,
        country: EmployeeCountry.Thailand,
        scgHiringDate: '1998-01-25',
        effectiveDate: null,
        createdBy: 'admin@scg.com',
      }),
      role,
    });

    await userRepository.save([
      user,
      userRepository.create({
        id: 2,
        roleId: 1,
        email: 'admin2@scg.com',
        password: null,
        firstname: 'admin2',
        lastname: 'admin2',
        status: UserStatusType.Active,
        createdBy: 'admin@scg.com',
        employee: employeeRepository.create({
          id: 2,
          email: 'admin2@scg.com',
          firstNameEn: 'admin2',
          employeeType: EmployeeType.Payroll,
          country: EmployeeCountry.Thailand,
          scgHiringDate: '1998-01-25',
          effectiveDate: null,
          createdBy: 'admin@scg.com',
        }),
      }),
      userRepository.create({
        id: 3,
        roleId: 1,
        email: 'admin3@scg.com',
        password: '12345',
        firstname: 'admin3',
        lastname: 'admin3',
        status: UserStatusType.Active,
        createdBy: 'admin@scg.com',
        employee: employeeRepository.create({
          id: 3,
          email: 'admin3@scg.com',
          firstNameEn: 'admin3',
          employeeType: EmployeeType.Payroll,
          country: EmployeeCountry.Thailand,
          scgHiringDate: '4000-01-25',
          effectiveDate: null,
          createdBy: 'admin@scg.com',
        }),
      }),
      userRepository.create({
        id: 4,
        roleId: 1,
        email: 'admin4@scg.com',
        password: '12345',
        firstname: 'admin4',
        lastname: 'admin4',
        status: UserStatusType.Active,
        createdBy: 'admin@scg.com',
        employee: employeeRepository.create({
          id: 4,
          email: 'admin4@scg.com',
          firstNameEn: 'admin4',
          employeeType: EmployeeType.Payroll,
          country: EmployeeCountry.Thailand,
          scgHiringDate: '1998-01-25',
          effectiveDate: '2020-01-01',
          createdBy: 'admin@scg.com',
        }),
      }),
      userRepository.create({
        id: 5,
        roleId: 1,
        email: 'admin5@scg.com',
        password: '12345',
        firstname: 'admin5',
        lastname: 'admin5',
        status: UserStatusType.Active,
        createdBy: 'admin@scg.com',
        employee: employeeRepository.create({
          id: 4,
          email: 'admin5@scg.com',
          firstNameEn: 'admin5',
          employeeType: EmployeeType.Payroll,
          country: EmployeeCountry.Thailand,
          scgHiringDate: '4000-01-25',
          effectiveDate: '4000-01-01',
          createdBy: 'admin@scg.com',
        }),
      }),
      userRepository.create({
        id: 6,
        roleId: 1,
        email: 'admin6@scg.com',
        password: '12345',
        firstname: 'admin6',
        lastname: 'admin6',
        status: UserStatusType.Active,
        createdBy: 'admin@scg.com',
        employee: employeeRepository.create({
          id: 4,
          email: 'admin6@scg.com',
          firstNameEn: 'admin6',
          employeeType: EmployeeType.Payroll,
          country: EmployeeCountry.Thailand,
          scgHiringDate: '1998-01-25',
          effectiveDate: moment().format('YYYY-MM-DD'),
          createdBy: 'admin@scg.com',
        }),
      }),
    ]);

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
            employee: expect.objectContaining({
              id: 1,
              firstNameEn: 'admin',
              email: 'admin@scg.com',
            }),
          }),
        );
        expect(query).toEqual({ relations: 'user.role,user.menus,user2.menu' });
        return {
          ...user,
          roleId: role?.id,
        };
      });
  });

  afterEach(async () => {
    await roleRepository.delete({});
    await userRepository.delete({});
    await employeeRepository.delete({});
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('/POST login/email', () => {
    it('Should be error show message', () =>
      app
        .inject({
          method: 'POST',
          url: '/api/v1/auth/login/email',
        })
        .then((result) => {
          const json = result.json();
          expect(json).toEqual({
            statusCode: 400,
            message: ['token must be a string', 'token should not be empty'],
            error: 'Bad Request',
          });
        }));
  });

  describe('/POST login', () => {
    it('Should be error show message', () =>
      app
        .inject({
          method: 'POST',
          url: '/api/v1/auth/login',
        })
        .then((result) => {
          const json = result.json();
          expect(json).toEqual({
            statusCode: 400,
            message: [
              `We can't sign into your account. Please contact your system administrator.`,
              'email should not be empty',
              'password must be a string',
              'password should not be empty',
            ],
            error: 'Bad Request',
          });
        }));

    it('Should be success', () =>
      app
        .inject({
          method: 'POST',
          url: '/api/v1/auth/login',
          payload: {
            email: 'admin@scg.com',
            password: '12345',
          },
        })
        .then((result) => {
          const json = result.json();
          expect(json?.accessToken).not.toEqual(undefined);
        }));

    it('Should be login not success case 1', () =>
      app
        .inject({
          method: 'POST',
          url: '/api/v1/auth/login',
          payload: {
            email: 'admin@scg.com',
            password: '12',
          },
        })
        .then((result) => {
          const json = result.json();
          expect(json).toEqual({
            statusCode: 404,
            message: `We can't sign into your account. Please contact your system administrator`,
            error: 'EMAIL_INCORRECT_OR_PASSWORD_INCORRECT',
          });
        }));

    it('Should be login not success case 2', () =>
      app
        .inject({
          method: 'POST',
          url: '/api/v1/auth/login',
          payload: {
            email: 'admin3@scg.com',
            password: '12345',
          },
        })
        .then((result) => {
          const json = result.json();
          expect(json).toEqual({
            statusCode: 404,
            message:
              "We can't sign into your account. Please contact your system administrator.",
            error: 'EMPLOYEE_NOT_FOUND',
          });
        }));

    it('Should be login not success case 3', () =>
      app
        .inject({
          method: 'POST',
          url: '/api/v1/auth/login',
          payload: {
            email: 'admin4@scg.com',
            password: '12345',
          },
        })
        .then((result) => {
          const json = result.json();
          expect(json).toEqual({
            statusCode: 404,
            message:
              "We can't sign into your account. Please contact your system administrator.",
            error: 'EMPLOYEE_NOT_FOUND',
          });
        }));

    it('Should be login not success case 4', () =>
      app
        .inject({
          method: 'POST',
          url: '/api/v1/auth/login',
          payload: {
            email: 'admin5@scg.com',
            password: '12345',
          },
        })
        .then((result) => {
          const json = result.json();
          expect(json).toEqual({
            statusCode: 404,
            message:
              "We can't sign into your account. Please contact your system administrator.",
            error: 'EMPLOYEE_NOT_FOUND',
          });
        }));

    it('Should be login not success case 5', () =>
      app
        .inject({
          method: 'POST',
          url: '/api/v1/auth/login',
          payload: {
            email: 'admin6@scg.com',
            password: '12345',
          },
        })
        .then((result) => {
          const json = result.json();
          expect(json).toEqual({
            statusCode: 404,
            message:
              "We can't sign into your account. Please contact your system administrator.",
            error: 'EMPLOYEE_NOT_FOUND',
          });
        }));
  });

  describe('/POST register', () => {
    it('Should be error show message', () =>
      app
        .inject({
          method: 'POST',
          url: '/api/v1/auth/register',
        })
        .then((result) => {
          const json = result.json();
          expect(json).toEqual({
            statusCode: 400,
            message: [
              `We can't sign into your account. Please contact your system administrator.`,
              'email should not be empty',
              'password must be a string',
              'password should not be empty',
            ],
            error: 'Bad Request',
          });
        }));

    it('Should be success', () => {
      return app
        .inject({
          method: 'POST',
          url: '/api/v1/auth/register',
          payload: {
            email: 'admin2@scg.com',
            password: '123456',
          },
        })
        .then((result) => {
          const json = result.json();
          expect(json).toEqual(
            expect.objectContaining({
              id: 2,
              roleId: 1,
              firstname: 'admin2',
              lastname: 'admin2',
              nickname: null,
              password: '123456',
              email: 'admin2@scg.com',
              status: 'active',
              avatar: null,
              createdBy: 'admin@scg.com',
              updatedBy: 'admin2@scg.com',
            }),
          );
        });
    });

    it('Should be error email already', () =>
      app
        .inject({
          method: 'POST',
          url: '/api/v1/auth/register',
          payload: {
            email: 'admin@scg.com',
            password: '123456',
          },
        })
        .then((result) => {
          const json = result.json();
          expect(json).toEqual({
            statusCode: 400,
            message: `We can't register into account. Please contact your system administrator.`,
            error: 'USER_ALREADY_EXISTS',
          });
        }));

    it('Should be error email because Unable to sign in. Please contact your system administrator.', () =>
      app
        .inject({
          method: 'POST',
          url: '/api/v1/auth/register',
          payload: {
            email: 'admin99@scg.com',
            password: '123456',
          },
        })
        .then((result) => {
          const json = result.json();
          expect(json).toEqual({
            statusCode: 404,
            message: `We can't register into account. Please contact your system administrator.`,
            error: 'EMPLOYEE_NOT_FOUND',
          });
        }));
  });

  describe('/POST logout', () => {
    it('Should be success', () =>
      app
        .inject({
          method: 'POST',
          url: '/api/v1/auth/logout',
        })
        .then((result) => {
          const json = result.json();
          expect(json).toEqual(
            expect.objectContaining({
              email: 'admin@scg.com',
            }),
          );
        }));
  });

  describe('MOCK Entity', () => {
    describe('/POST login/email', () => {
      it('Should be success', () => {
        userService.getUser = jest.fn().mockImplementationOnce((v1, v2) => {
          expect(v1).toEqual({
            encodeEmail: '123456778899',
          });
          expect(v2).toEqual({});
          return {
            id: 1,
            email: 'test@scg.com',
            roleId: 1,
          };
        });

        employeeRepository.createQueryBuilder = jest
          .fn()
          .mockImplementationOnce((v1) => {
            expect(v1).toEqual('employee');
            return {
              where: (v11) => {
                expect(v11).toEqual(
                  `encode(sha256(concat('$mocked-token',LOWER(email))::bytea), 'hex') = :email`,
                );
                return {
                  andWhere: () => {
                    return {
                      getOne: () => {
                        return expect.objectContaining({
                          getFullNameEn: () => 'test1 test2',
                          getStatus: () => 'active',
                          id: 1,
                          companyId: 1,
                          positionId: 152,
                          employeeGroupId: 1,
                          employeeCode: '3434-343434',
                          firstNameEn: 'test1',
                          lastNameEn: 'test2',
                          nickName: 'test',
                          email: 'test@scg.com',
                          jobLevel: 'S1',
                          scgHiringDate: '2022-04-01',
                          effectiveDate: null,
                          employeeType: 'payroll',
                          country: 'thailand',
                          yearOfExperience: 2,
                          remarks: null,
                          createdAt: faker.date.recent(),
                          updatedAt: faker.date.recent(),
                          createdBy: 'system@scg.com',
                          updatedBy: 'warissat@scg.com',
                          version: 8,
                        });
                      },
                    };
                  },
                };
              },
            };
          });

        authService.signUserToken = jest.fn().mockImplementation(() => {
          return {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
          };
        });

        return app
          .inject({
            method: 'POST',
            url: '/api/v1/auth/login/email',
            payload: {
              token: '123456778899',
            },
          })
          .then((result) => {
            const json = result.json();
            expect(json).toEqual({
              accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
            });
          });
      });
    });
  });
});
