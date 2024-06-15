import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { TestUtil } from './utils/test-util';
import { AuthService } from '../src/auth/auth.service';
import { AuthModule } from '../src/auth/auth.module';
import * as jwt from 'jsonwebtoken';
import { BadRequestException } from '@nestjs/common';

describe('Auth module', () => {
  let app: NestFastifyApplication;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef = await TestUtil.createTestingModule({
      imports: [AuthModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    authService = moduleRef.get<AuthService>(AuthService);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  beforeEach(async () => {
    (jwt.verify as jest.Mock) = jest.fn().mockImplementation((param) => {
      if (!param) {
        throw new BadRequestException('jwt must be provided');
      } else if (param === '12345') {
        return {
          id: 1,
          email: 'test@scg.com',
          lastLogin: new Date(),
          iat: 1717251817,
          exp: 1717338277,
        };
      }

      throw new BadRequestException('jwt malformed');
    });
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('Service decodeJwt', () => {
    it('should be success.', async () => {
      expect(authService.decodeJwt('12345')).toEqual(
        expect.objectContaining({
          id: 1,
          email: 'test@scg.com',
        }),
      );
    });

    it('error should be raised when the data is null.', async () =>
      expect(async () => {
        const result = await authService.decodeJwt(null);
        return result;
      }).rejects.toThrow('jwt must be provided'));

    it('error should occur when the data is incorrect.', async () =>
      expect(async () => {
        const result = await authService.decodeJwt('123');
        return result;
      }).rejects.toThrow('jwt malformed'));
  });
});
