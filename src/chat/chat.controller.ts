import {
  Controller,
  Post,
  Body,
  Res,
  Header,
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

  // PLANIFICACIÓN
  @Post('consult')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async consultarChatbot(@Body() body: CreateChatDto, @Res() res: Response) {
    if (!body.usuario || !body.pregunta) {
      throw new BadRequestException('Se requieren usuario y pregunta');
    }

    const result = await this.chatService.consultarChatbot(
      body.usuario,
      body.pregunta,
      'planificacion',
    );

    if (!result.success) {
      if (result.error === 'INVALID_QUESTION') {
        throw new UnprocessableEntityException(result.message);
      }
      throw new BadGatewayException(result.message);
    }

    res.setHeader(
      'Content-Type',
      result.contentType ||
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.filename}"`,
    );
    res.send(result.buffer);
  }

  @Post('consult-frontend')
  async consultarChatbotFrontend(@Body() body: CreateChatDto) {
    if (!body.usuario || !body.pregunta) {
      throw new BadRequestException('Se requieren usuario y pregunta');
    }

    const result = await this.chatService.consultarChatbot(
      body.usuario,
      body.pregunta,
      'planificacion',
    );

    console.log('Result:', result);

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
      contentType: result.contentType,
    };
  }

  // PLANIFICADOR
  @Post('planificador')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async consultarPlanificador(
    @Body() body: CreateChatDto,
    @Res() res: Response,
  ) {
    if (!body.usuario || !body.pregunta) {
      throw new BadRequestException('Se requieren usuario y pregunta');
    }

    const result = await this.chatService.consultarChatbot(
      body.usuario,
      body.pregunta,
      'planificador',
    );

    if (!result.success) {
      if (result.error === 'INVALID_QUESTION') {
        throw new UnprocessableEntityException(result.message);
      }
      throw new BadGatewayException(result.message);
    }

    res.setHeader(
      'Content-Type',
      result.contentType ||
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.filename}"`,
    );
    res.send(result.buffer);
  }

  @Post('planificador-frontend')
  async consultarPlanificadorFrontend(@Body() body: CreateChatDto) {
    if (!body.usuario || !body.pregunta) {
      throw new BadRequestException('Se requieren usuario y pregunta');
    }

    const result = await this.chatService.consultarChatbot(
      body.usuario,
      body.pregunta,
      'planificador',
    );

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
      contentType: result.contentType,
    };
  }

  // INTEGRADOR
  @Post('integrador')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async consultarIntegrador(@Body() body: CreateChatDto, @Res() res: Response) {
    if (!body.usuario || !body.pregunta) {
      throw new BadRequestException('Se requieren usuario y pregunta');
    }

    const result = await this.chatService.consultarChatbot(
      body.usuario,
      body.pregunta,
      'integrador',
    );

    if (!result.success) {
      if (result.error === 'INVALID_QUESTION') {
        throw new UnprocessableEntityException(result.message);
      }
      throw new BadGatewayException(result.message);
    }

    res.setHeader(
      'Content-Type',
      result.contentType ||
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.filename}"`,
    );
    res.send(result.buffer);
  }

  @Post('integrador-frontend')
  async consultarIntegradorFrontend(@Body() body: CreateChatDto) {
    if (!body.usuario || !body.pregunta) {
      throw new BadRequestException('Se requieren usuario y pregunta');
    }

    const result = await this.chatService.consultarChatbot(
      body.usuario,
      body.pregunta,
      'integrador',
    );

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
      contentType: result.contentType,
    };
  }

  // ADECUACIÓN
  @Post('adecuacion')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async consultarAdecuacion(@Body() body: CreateChatDto, @Res() res: Response) {
    if (!body.usuario || !body.pregunta) {
      throw new BadRequestException('Se requieren usuario y pregunta');
    }

    const result = await this.chatService.consultarChatbot(
      body.usuario,
      body.pregunta,
      'adecuacion',
    );

    if (!result.success) {
      if (result.error === 'INVALID_QUESTION') {
        throw new UnprocessableEntityException(result.message);
      }
      throw new BadGatewayException(result.message);
    }

    res.setHeader(
      'Content-Type',
      result.contentType ||
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.filename}"`,
    );
    res.send(result.buffer);
  }

  @Post('adecuacion-frontend')
  async consultarAdecuacionFrontend(@Body() body: CreateChatDto) {
    if (!body.usuario || !body.pregunta) {
      throw new BadRequestException('Se requieren usuario y pregunta');
    }

    const result = await this.chatService.consultarChatbot(
      body.usuario,
      body.pregunta,
      'adecuacion',
    );

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
      contentType: result.contentType,
    };
  }

  // SEGUIMIENTO
  @Post('seguimiento')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async consultarSeguimiento(
    @Body() body: CreateChatDto,
    @Res() res: Response,
  ) {
    if (!body.usuario || !body.pregunta) {
      throw new BadRequestException('Se requieren usuario y pregunta');
    }

    const result = await this.chatService.consultarChatbot(
      body.usuario,
      body.pregunta,
      'seguimiento',
    );

    if (!result.success) {
      if (result.error === 'INVALID_QUESTION') {
        throw new UnprocessableEntityException(result.message);
      }
      throw new BadGatewayException(result.message);
    }

    res.setHeader(
      'Content-Type',
      result.contentType ||
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.filename}"`,
    );
    res.send(result.buffer);
  }

  @Post('seguimiento-frontend')
  async consultarSeguimientoFrontend(@Body() body: CreateChatDto) {
    if (!body.usuario || !body.pregunta) {
      throw new BadRequestException('Se requieren usuario y pregunta');
    }

    const result = await this.chatService.consultarChatbot(
      body.usuario,
      body.pregunta,
      'seguimiento',
    );

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
      contentType: result.contentType,
    };
  }
}
