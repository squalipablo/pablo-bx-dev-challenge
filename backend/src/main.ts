import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new ConsoleLogger({
    prefix: 'Bonusx',
  });
  const app = await NestFactory.create(AppModule, {
    abortOnError: true,
    logger,
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: '*',
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') as number;

  await app.listen(port, 'localhost', () => {
    logger.log(
      `Bonusx File Uploader is running on: http://localhost:${port}`,
    );
  });
}

void bootstrap();
