import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import express from 'express';
import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { AppModule } from '../src/app.module';

let server: Promise<ReturnType<typeof createServer>> | undefined;

async function createServer() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const logger = app.get(Logger);
  const frontendUrls = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((url: string) => url.trim())
    .filter(Boolean);

  app.useLogger(logger);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors({ origin: frontendUrls, credentials: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] });
  app.use(express.json({ verify: (request: any, _response, buffer) => { if (request.originalUrl?.includes('/api/v1/orders/webhook')) request.rawBody = buffer; } }));
  app.use(cookieParser());
  app.enableVersioning({ type: VersioningType.URI, prefix: 'api/v', defaultVersion: '1' });
  await app.init();
  return app.getHttpAdapter().getInstance();
}

export default async function handler(request: any, response: any) {
  server ??= createServer();
  const app = await server;
  return app(request, response);
}
