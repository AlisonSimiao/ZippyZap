import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import * as express from 'express';

class ValidationError extends HttpException {
  constructor(errors: Record<string, string[]>) {
    super(errors, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

async function bootstrap(): Promise<void> {
  // Validar variáveis de ambiente críticas
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'MP_WEBHOOK_SECRET',
    'MP_ACCESS_TOKEN',
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.error(
      `❌ Variáveis de ambiente faltando: ${missingEnvVars.join(', ')}`,
    );
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: 422,
      exceptionFactory: (errors) => {
        const result: Record<string, string[]> = {};
        errors.forEach((error) => {
          result[error.property] = Object.values(error.constraints || {});
        });
        return new ValidationError(result);
      },
    }),
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server is running on port ${port}`);
    console.log(`✅ Webhook validation enabled`);
    console.log(`✅ Environment variables validated`);
  });
}

void bootstrap().catch((error) => {
  console.error('❌ Failed to bootstrap application:', error);
  process.exit(1);
});
