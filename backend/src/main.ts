import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import express from 'express';
import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const frontendUrls: string[] = (configService.get<string>('FRONTEND_URL') || 'http://localhost:3000')
    .split(',')
    .map((url: string) => url.trim())
    .filter(Boolean);
  if (configService.get('NODE_ENV') !== 'production') {
    frontendUrls.push('http://localhost:3000', 'http://127.0.0.1:3000');
  }
  app.enableCors({
    origin: [...new Set(frontendUrls)],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(express.json({
    limit: '30mb',
    verify: (req: any, res, buf) => {
      if (req.originalUrl?.includes('/api/v1/orders/webhook')) {
        req.rawBody = buf;
      }
    },
  }));

  app.use(cookieParser());

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
    defaultVersion: '1',
  });

  await app.listen(configService.get('PORT', 3001));
}
bootstrap();
