import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { validateEnv } from './config/env.validator';

// Load environment variables from .env file
dotenv.config();

async function bootstrap() {
  // Validate environment variables on startup
  const config = validateEnv();

  const logger = new Logger('Bootstrap');
  logger.log(`Starting application in ${config.NODE_ENV} mode`);

  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Setup Swagger API Documentation (disable in production)
  if (config.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Saúde API')
      .setDescription('API for health tracking and nutrition monitoring application')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('access_token')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  app.use(cookieParser());

  // Configure CORS with specific origins
  const allowedOrigins: (string | RegExp)[] = [
    'http://localhost:3000', // Dashboard
    'http://localhost:8081', // React Native Expo
    /saude-app.*\.vercel\.app$/,
    /saude-app-cd93e.*\.web\.app$/,
  ];

  // Add Cloud Run service URL if provided
  if (process.env.CLOUD_RUN_URL) {
    allowedOrigins.push(process.env.CLOUD_RUN_URL);
  }

  // Add dashboard URL from env
  if (config.WEB_URL) {
    allowedOrigins.push(config.WEB_URL);
  }

  app.enableCors({
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some((pattern) => {
        if (pattern instanceof RegExp) {
          return pattern.test(origin);
        }
        return pattern === origin;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        logger.warn(`Blocked CORS request from: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['set-cookie'],
  });

  const port = config.PORT;
  await app.listen(port, '0.0.0.0');

  logger.log(`Application is running on: http://0.0.0.0:${port}`);
}
bootstrap();
