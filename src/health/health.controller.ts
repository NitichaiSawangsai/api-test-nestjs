import { Controller, Get, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import {
  HealthCheck,
  HealthCheckService,
  MicroserviceHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import serverConf from '../config/server.config';

@Controller('/health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly microservice: MicroserviceHealthIndicator,
    private readonly db: TypeOrmHealthIndicator,
    @Inject(serverConf.KEY)
    private readonly serverConfig: ConfigType<typeof serverConf>,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return from(
      this.health.check([
        () =>
          this.microservice.pingCheck('api', {
            transport: Transport.TCP,
            options: {
              host: 'localhost',
              port: this.serverConfig.port,
            },
          }),
        () => this.db.pingCheck('database'),
      ]),
    ).pipe(
      map((indicators) => ({
        ...indicators,
      })),
      catchError((err) => {
        err = {
          ...err,
        };
        return of(err);
      }),
    );
  }
}
