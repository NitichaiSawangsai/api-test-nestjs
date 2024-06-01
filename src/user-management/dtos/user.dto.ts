import { ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsString, IsOptional } from "class-validator";

export class QueryUserDto {
  @ApiPropertyOptional({
    name: 'order-by',
  })
  @IsString()
  @IsOptional()
  @Expose({ name: 'order-by' })
  orderBy?: string;
}
