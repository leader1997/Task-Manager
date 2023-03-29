import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.use(cookieParser());
  app.enableCors({ origin: 'http://localhost:3000', credentials: true });

  const config = new DocumentBuilder()
    .setTitle('Task Manager API')
    .setDescription(
      'The task manager project built with NestJS is designed to provide a secure and efficient way for users to manage their tasks. It utilizes authentication middleware to ensure that only authorized users can access their tasks and provides endpoints for creating, retrieving, updating, and deleting tasks.',
    )
    .setVersion('1.0')
    .addTag('Task Manager')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  await app.listen(3000);
}
bootstrap();
