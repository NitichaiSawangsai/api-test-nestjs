import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import serverConfig from '../config/server.config';

@Module({
  imports: [TerminusModule, ConfigModule.forFeature(serverConfig)],
  controllers: [HealthController],
})
export class HealthModule {}
