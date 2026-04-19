import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Respect upstream proxy headers (x-forwarded-for, x-real-ip) for client IP extraction.
  const httpAdapter = app.getHttpAdapter();
  if (httpAdapter.getType() === 'express') {
    const expressApp = httpAdapter.getInstance() as {
      set: (setting: string, value: unknown) => void;
    };
    expressApp.set('trust proxy', true);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      skipMissingProperties: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('BE Ecomerce Shop')
    .setVersion('1.0')
    .addServer('http://localhost:4000', 'Development server')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, document, {
    jsonDocumentUrl: 'documentation-json',
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  (BigInt.prototype as any).toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
  };

  app.enableCors({
    origin: 'http://localhost:3000', // Allow your Next.js frontend
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    credentials: true, // Allow cookies/auth headers
  });

  await app.listen(process.env.PORT! || 4000);
}
bootstrap();
