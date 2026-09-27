import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';

async function bootstrap() {
  const logger = new Logger('NEXORA-Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT', 4000);
  const apiPrefix = configService.get<string>('API_PREFIX', '/api/v1').replace(/^\//, '');

  // 1. Security Headers (Helmet)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    }),
  );

  // 2. Compression
  app.use(compression());

  // 3. CORS Configuration
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  });

  // 4. Global API Prefix
  app.setGlobalPrefix(apiPrefix);

  // 5. Global Validation Pipe
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

  // 6. Global Response Interceptor & Exception Filter
  app.useGlobalInterceptors(new TransformResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 7. Swagger OpenAPI Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NEXORA — Enterprise HRIS RESTful API')
    .setDescription(
      'Spesifikasi API untuk Human Resource Information System (HRIS). Mengatur Otentikasi, Master Karyawan, Presensi Geofencing, Pengajuan Cuti, Payroll PPh 21 TER, dan Audit Trail.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Masukkan access token JWT dengan format: Bearer <token>',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Health & Observability', 'Liveness & Readiness probe sistem')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'NEXORA HRIS — API Documentation',
  });

  // 8. Start Listening
  await app.listen(port);
  logger.log(`🚀 NEXORA Backend API is running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📑 Swagger Documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
