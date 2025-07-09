import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { MicrosoftGraphService } from './microsoft_graph.service';
import { ValidateTeacherDto } from './dto/create-microsoft_graph.dto';

@Controller('microsoft-graph')
export class MicrosoftGraphController {
  constructor(private readonly microsoftGraphService: MicrosoftGraphService) {}

   @Post('validate-teacher')
  async validateTeacher(@Body() body: ValidateTeacherDto) {
    try {
      if (!body.email || !body.password) {
        throw new HttpException(
          'Se requiere correo electrónico y contraseña',
          HttpStatus.BAD_REQUEST,
        );
      }
  
      const response = await this.microsoftGraphService.validateTeacher(
        body.email,
        body.password
      );
      
      if (response.status === 409) {
        throw new ConflictException(response.message);
      }
      
      if (response.status === 401) {
        throw new UnauthorizedException(response.message);
      }
  
      return response;
    } catch (error) {
      if (!(error instanceof HttpException)) {
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
