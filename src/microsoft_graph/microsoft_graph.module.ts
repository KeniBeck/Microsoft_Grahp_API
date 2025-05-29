import { Module } from '@nestjs/common';
import { MicrosoftGraphService } from './microsoft_graph.service';
import { MicrosoftGraphController } from './microsoft_graph.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [MicrosoftGraphController],
  providers: [MicrosoftGraphService],
  exports: [MicrosoftGraphService],
})
export class MicrosoftGraphModule { }
