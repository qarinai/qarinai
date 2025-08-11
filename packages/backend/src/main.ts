import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './swagger.config';
import { WorkerService } from 'nestjs-graphile-worker';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.enableCors();

  // Swagger setup
  setupSwagger(app);

  //
  app.enableShutdownHooks();

  // Start the Graphile Worker service
  void app.get(WorkerService).run();

  const logger = new Logger('Bootstrap');
  const port = process.env.PORT || 3000;
  await app.listen(port, () => {
    logger.log(`Application is running on: http://localhost:${port}`);
  });
}
bootstrap();
