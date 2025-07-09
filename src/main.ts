import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function bootstrap() {
  let httpsOptions: { key: Buffer; cert: Buffer } | null = null;

  // Verificar si existen los certificados
  if (fs.existsSync('key.pem') && fs.existsSync('cert.pem')) {
    httpsOptions = {
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem'),
    };
  }

  const app = await NestFactory.create(AppModule, httpsOptions ? { httpsOptions } : {});

  app.enableCors({
    origin: ['http://localhost:5174', 'http://www.mentora.ameritecgt.com', 'https://www.mentora.ameritecgt.com'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
  
  console.log(`Server running on ${httpsOptions ? 'https' : 'http'}://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();