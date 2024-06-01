import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigType } from '@nestjs/config';
import serverConfig from './config/server.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('UTILIZATION API')
    .addBearerAuth()
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const svConfig: ConfigType<typeof serverConfig> = app.get(serverConfig.KEY);

  app.use('/docs', function (_req, res, next) {
    if (['production', 'prod'].includes(svConfig.nodeEnv)) {
      return res.status(401).send({ message: 'Unauthorized' });
    }
    next();
  });
  SwaggerModule.setup('docs', app, document);

  await app.listen(svConfig.port);
}
bootstrap();
