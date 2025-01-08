import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import * as YAML from 'yaml'
import { ConfigService } from '@nestjs/config';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get('server.port');
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));


  const config = new DocumentBuilder()
    .setTitle('SyncSipApi')
    .setDescription('API For the SyncSip App')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const yamlString = YAML.stringify(document);
  fs.writeFileSync('../OpenApiConfig/openapi-spec.yaml', yamlString);

  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
}
bootstrap();
