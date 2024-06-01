import { ModuleMetadata } from '@nestjs/common';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { DatabaseTest } from './config.test';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../../src/auth/auth.module';
import { Repository } from 'typeorm';


export class TestUtil {
  static createTestingModule({
    controllers = [],
    imports = [],
    providers = [],
    exports = [],
  }: ModuleMetadata): TestingModuleBuilder {
    process.env = {
      JWT_SECRET_KEY: '$mocked-token',
    };

    jest.mock('@nestjs/jwt', () => ({
      JwtService: jest.fn().mockImplementation(() => ({
        sign: jest.fn().mockReturnValue('mocked-token'),
        verify: jest.fn().mockReturnValue('mocked-token'),
      })),
    }));

    return Test.createTestingModule({
      imports: [DatabaseTest, AuthModule, ...imports, HttpModule],
      controllers,
      providers,
      exports,
    })
  }
}

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<T[P]>;
};

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({
    find: jest.fn((entity) => entity),
    findOne: jest.fn((entity) => entity),
    create: jest.fn((entity) => entity),
    save: jest.fn((entity) => entity),
    remove: jest.fn((entity) => entity),
    createQueryBuilder: jest.fn((entity) => entity),
  }),
);
