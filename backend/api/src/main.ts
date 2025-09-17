import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';

class ValidationError extends HttpException {
  constructor(errors: Record<string, string[]>) {
    super(errors, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  console.log(process.env.DATABASE_URL);
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
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0', () => {
    console.log(`Server is running on port ${process.env.PORT ?? 3000}`);
  });
}

void bootstrap().catch();
