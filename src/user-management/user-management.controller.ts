import {
  Controller,
  Get,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './services/user.service';
import { UserAuthGuard } from '../auth/guards/user-auth-guard.guard';
import { QueryUsersDto } from './dtos/user.dto';
import { User } from './entities/user.entity';

@UseGuards(UserAuthGuard)
@ApiOkResponse()
@ApiBearerAuth()
@ApiTags('UserManagement')
@Controller('api/v1/management')
@UsePipes(new ValidationPipe({ transform: true }))
export class UserManagementController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Get('/v1/users')
  getV1Users(
    @Query() query: QueryUsersDto,
  ): Promise<User[]> {
    return this.userService.getV1Users(query);
  }

  @Get('/v2/users')
  getV2Users(
    @Query() query: QueryUsersDto,
  ): Promise<User[]> {
    return this.userService.getV2Users(query);
  }

  @Get('/v3/users')
  getV3Users(
    @Query() query: QueryUsersDto,
  ): Promise<User[]> {
    return this.userService.getV3Users(query);
  }
}
