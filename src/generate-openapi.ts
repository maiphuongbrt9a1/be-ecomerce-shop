import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('BE Ecomerce Shop')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const outDir = join(process.cwd(), 'frontend');
  const outFile = join(outDir, 'openapi.json');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, JSON.stringify(document, null, 2), 'utf-8');
  await app.close();

  console.log(`OpenAPI spec exported to ${outFile}`);
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
