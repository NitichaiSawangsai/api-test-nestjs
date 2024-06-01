import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './services/user.service';
import { User } from './entities/user.entity';
import { UserManagementController } from './user-management.controller';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import serverConfig from '../config/server.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [serverConfig],
    }),
    TypeOrmModule.forFeature([
      User,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => HttpModule),
  ],
  controllers: [UserManagementController],
  providers: [UserService],
  exports: [
    UserService,
    TypeOrmModule.forFeature([User]),
  ],
})
export class UserManagementModule {}
