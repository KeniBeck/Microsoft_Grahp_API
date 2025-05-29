import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MicrosoftGraphModule } from './microsoft_graph/microsoft_graph.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Importante para que sea accesible en toda la app
      envFilePath: '.env' // Especificamos el path del archivo .env
    }),
    MicrosoftGraphModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
