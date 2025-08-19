import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
  ConflictException,
  UnauthorizedException,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { MicrosoftGraphService } from './microsoft_graph.service';
import { ValidateTeacherDto } from './dto/create-microsoft_graph.dto';

@Controller('microsoft-graph')
export class MicrosoftGraphController {
  constructor(private readonly microsoftGraphService: MicrosoftGraphService) { }

  private normalizeStatus(status?: any) {
    return (typeof status === 'number' && status >= 100 && status < 1000) ? status : null;
  }

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

      const status = this.normalizeStatus(response?.status);

      if (status === 409) throw new ConflictException(response.message);
      if (status === 401) throw new UnauthorizedException(response.message);

      // Si el servicio devolvió fallo pero sin status válido -> mapear a 503
      if (response && response.success === false && !status) {
        throw new HttpException(response.message || 'Error en Microsoft Graph', HttpStatus.SERVICE_UNAVAILABLE);
      }

      return response;
    } catch (error) {
      if (!(error instanceof HttpException)) {
        console.log('Error al validar el profesor:', error);
      }
      throw error;
    }
  }

  @Get('validate-teacher/:email')
  async validateTeacherByEmail(@Param('email') email: string) {
    try {
      if (!email) {
        throw new HttpException(
          'Se requiere correo electrónico',
          HttpStatus.BAD_REQUEST,
        );
      }

      const response = await this.microsoftGraphService.validateTeacherByEmail(email);

      const status = this.normalizeStatus(response?.status);

      if (status === 404) throw new NotFoundException(response.message);
      if (status === 401) throw new UnauthorizedException(response.message);

      if (response && response.success === false && !status) {
        throw new HttpException(response.message || 'Error en Microsoft Graph', HttpStatus.SERVICE_UNAVAILABLE);
      }

      return response;
    } catch (error) {
      if (!(error instanceof HttpException)) {
        console.log('Error al validar el profesor por email:', error);
      }
      throw error;
    }
  }

  @Get('health')
  getHealth() {
    return { status: 'OK', message: 'Servidor funcionando correctamente' };
  }
}
