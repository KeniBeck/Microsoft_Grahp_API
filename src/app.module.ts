import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MicrosoftGraphModule } from './microsoft_graph/microsoft_graph.module';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Importante para que sea accesible en toda la app
      envFilePath: '.env' // Especificamos el path del archivo .env
    }),
    MicrosoftGraphModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
