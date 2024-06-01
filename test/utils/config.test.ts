import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const DatabaseTest = TypeOrmModule.forRoot({
  type: 'sqlite',
  database: ':memory:',
  dropSchema: true,
  synchronize: true,
  logging: false,
  autoLoadEntities: true,
  entities: ['src/**/entities/**.entity{.ts,.js}'],
  namingStrategy: new SnakeNamingStrategy(),
});
