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
import { QueryUserDto } from './dtos/user.dto';
import { UserService } from './services/user.service';
import { UserReq } from '../common/custom-decorators/auth.custom-decorators';
import { UserAuthGuard } from '../auth/guards/user-auth-guard.guard';
import { IUser } from '../common/interface/auth.interface';

@ApiBearerAuth()
@ApiTags('UserManagement')
@Controller('api/v1/management')
@UsePipes(new ValidationPipe({ transform: true }))
export class UserManagementController {
  constructor(
    private readonly userService: UserService,
  ) {}
}
