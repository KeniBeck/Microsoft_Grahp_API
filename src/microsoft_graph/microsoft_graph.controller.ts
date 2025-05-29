import { Controller, Get, Post, Body, Param, Delete, Patch, HttpException, HttpStatus } from '@nestjs/common';
import { MicrosoftGraphService } from './microsoft_graph.service';
import { CreateMicrosoftGraphDto, ValidateTeacherDto } from './dto/create-microsoft_graph.dto';
import { UpdateMicrosoftGraphDto } from './dto/update-microsoft_graph.dto';

@Controller('microsoft-graph')
export class MicrosoftGraphController {
  constructor(private readonly microsoftGraphService: MicrosoftGraphService) {}

  @Post('validate-teacher')
  async validateTeacher(@Body() body: ValidateTeacherDto) {
    try {
      if (!body.email) {
        throw new HttpException('Se requiere un correo electrónico', HttpStatus.BAD_REQUEST);
      }
      
      return await this.microsoftGraphService.validateTeacher(body.email);
    } catch (error) {
      throw new HttpException({
        success: false, 
        error: 'Error al validar profesor',
        message: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('health')
  getHealth() {
    return { status: 'OK', message: 'Servidor funcionando correctamente' };
  }
}