import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { TestUtil } from './utils/test-util';
import { AuthService } from '../src/auth/auth.service';
import { AuthModule } from '../src/auth/auth.module';
import * as jwt from 'jsonwebtoken';
import { BadRequestException } from '@nestjs/common';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

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

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('Service decodeJwt', () => {
    it('should be success.', async () => {
      (jwt.verify as jest.Mock) = jest.fn().mockImplementationOnce((v) => {
        expect(v).toEqual('12345');
        return {
          id: 1,
          email: 'test@scg.com',
          lastLogin: new Date(),
          iat: 1717251817,
          exp: 1717338277,
        };
      });

      const result = await authService.decodeJwt('12345');

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          email: 'test@scg.com',
        }),
      );
    });

    it('should be err.', async () => {
      (jwt.verify as jest.Mock) = jest.fn().mockImplementationOnce((v) => {
        expect(v).toEqual('12345');
        throw new BadRequestException('ERR JWT');
      });

      try {
        await authService.decodeJwt('12345');
      } catch (error) {
        expect(error.message).toEqual('ERR JWT');
      }
    });
  });
});
