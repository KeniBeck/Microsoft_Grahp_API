import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
  ConflictException,
} from '@nestjs/common';
import { MicrosoftGraphService } from './microsoft_graph.service';
import { ValidateTeacherDto } from './dto/create-microsoft_graph.dto';

@Controller('microsoft-graph')
export class MicrosoftGraphController {
  constructor(private readonly microsoftGraphService: MicrosoftGraphService) {}

  @Post('validate-teacher')
  async validateTeacher(@Body() body: ValidateTeacherDto) {
    try {
      if (!body.email) {
        throw new HttpException(
          'Se requiere un correo electrónico',
          HttpStatus.BAD_REQUEST,
        );
      }

      const response = await this.microsoftGraphService.validateTeacher(
        body.email,
      );
      if (response.status === 409) {
        throw new ConflictException(response.message);
      }

      return response;
    } catch (error) {
      if (!(error instanceof ConflictException)) {
        console.log('Error al validar el profesor:', error);
      }
      throw error;
    }
  }

  @Get('health')
  getHealth() {
    return { status: 'OK', message: 'Servidor funcionando correctamente' };
  }
}
