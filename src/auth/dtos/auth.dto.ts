import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsEmail, IsString } from 'class-validator';

@Exclude()
export class LoginDto {
  @ApiProperty({ example: 'test@scg.com' })
  @IsNotEmpty()
  @IsEmail(
    {},
    {
      message: `Please contact your system administrator.`,
    },
  )
  @Expose()
  email: string;

  @ApiProperty({
    example: 'c8db92dee1f74a867042ca72ff24a438a7c235502f0add27715d62b6615a53da',
  })
  @IsNotEmpty()
  @IsString()
  @Expose()
  password: string;
}

@Exclude()
export class RegisterDto extends LoginDto {}
