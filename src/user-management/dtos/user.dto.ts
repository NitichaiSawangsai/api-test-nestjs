import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { IsString, IsOptional, IsNumber } from "class-validator";

export class QueryUserDto {
  @ApiPropertyOptional({
    name: 'order-by',
  })
  @IsString()
  @IsOptional()
  @Expose({ name: 'order-by' })
  orderBy?: string;
}

export class QueryUsersDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Expose()
  query?: string;

  @ApiProperty()
  @IsNumber()
  @Expose()
  @Transform(
    ({ value }) => Number(value)
  )
  page: number;

  @ApiProperty()
  @IsNumber()
  @Expose()
  @Transform(
    ({ value }) => Number(value)
  )
  limit: number;
}
