import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import serverConfig from './config/server.config';
import { AuthModule } from './auth/auth.module';
import { UserManagementModule } from './user-management/user-management.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, serverConfig],
      cache: true,
      validationSchema: Joi.object({
        SERVER_PORT: Joi.number().port().label('port server').required(),
        DATABASE_HOST: Joi.string().label('DATABASE_HOST').required(),
        DATABASE_PORT: Joi.number().label('DATABASE_PORT').required(),
        DATABASE_USERNAME: Joi.string().label('DATABASE_USERNAME').required(),
        DATABASE_PASSWORD: Joi.string().label('DATABASE_PASSWORD').required(),
        DATABASE_NAME: Joi.string().label('DATABASE_NAME').required(),
        DATABASE_SYNC: Joi.string().label('DATABASE_SYNC').required(),
        DATABASE_SCHEMA: Joi.string().label('DATABASE_SCHEMA').required(),
        TZ: Joi.string().label('TZ').required(),
        JWT_SECRET_KEY: Joi.string().label('JWT_SECRET_KEY').required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        charset: 'utf8',
        host: configService.get('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        schema: configService.get('database.schema'),
        autoLoadEntities: true,
        synchronize: configService.get('database.syncEnabled') === 'enable',
        cli: { migrationsDir: 'src/migrations' },
        namingStrategy: new SnakeNamingStrategy(),
        ssl:
          configService.get('database.SSLEnable') === 'enable'
            ? {
                sslmode: 'require',
                rejectUnauthorized: false,
              }
            : null,
      }),
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    AuthModule,
    UserManagementModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((_req, response, next) => {
        response.setHeader('X-XSS-Protection', '1; mode=block');
        response.setHeader('X-Content-Type-Options', 'nosniff');
        response.setHeader('X-Frame-Options', 'DENY');
        response.setHeader('Content-Security-Policy', "default-src 'self'");
        response.setHeader(
          'Strict-Transport-Security',
          'max-age=15552000; includeSubDomains',
        );
        response.setHeader('Referrer-Policy', 'no-referrer');
        next();
      })
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
