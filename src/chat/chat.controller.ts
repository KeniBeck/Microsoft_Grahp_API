import {
  Controller,
  Post,
  Body,
  Res,
  Header,
  ConflictException,
  BadRequestException,
  BadGatewayException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Response } from 'express';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Para Swagger - descarga directa
  @Post('consult')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async consultarChatbot(@Body() body: CreateChatDto, @Res() res: Response) {
    if (!body.usuario || !body.pregunta) {
      throw new BadRequestException('Se requieren usuario y pregunta');
    }

    const result = await this.chatService.consultarChatbot(body.usuario, body.pregunta);
    
    if (!result.success) {
      if (result.error === 'INVALID_QUESTION') {
        throw new ConflictException(result.message);
      }
      throw new BadGatewayException(result.message);
    }
    
    res.setHeader('Content-Type', result.contentType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.buffer);
  }
  
  // Para frontend - retorna base64
  @Post('consult-frontend')
  async consultarChatbotFrontend(@Body() body: CreateChatDto) {
    if (!body.usuario || !body.pregunta) {
      throw new BadRequestException('Se requieren usuario y pregunta');
    }

    const result = await this.chatService.consultarChatbot(body.usuario, body.pregunta);
    
    if (!result.success) {
      if (result.error === 'INVALID_QUESTION') {
        throw new UnprocessableEntityException(result.message);
      }
      throw new BadGatewayException(result.message);
    }
    
    return {
      success: true,
      data: result.buffer!.toString('base64'),
      filename: result.filename,
      contentType: result.contentType
    };
  }
}