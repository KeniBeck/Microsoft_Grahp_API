import { IsString, IsNotEmpty, Length, IsEmail } from 'class-validator';
import { CHAT_CONSTANTS } from '../constants/chat.constants';

export class CreateChatDto {
  @IsEmail({}, { message: 'El usuario debe ser un email válido' })
  @IsNotEmpty({ message: 'El usuario es requerido' })
  usuario: string;

  @IsString({ message: 'La pregunta debe ser un texto' })
  @IsNotEmpty({ message: 'La pregunta es requerida' })
  @Length(CHAT_CONSTANTS.MIN_PREGUNTA_LENGTH, CHAT_CONSTANTS.MAX_PREGUNTA_LENGTH, {
    message: `La pregunta debe tener entre ${CHAT_CONSTANTS.MIN_PREGUNTA_LENGTH} y ${CHAT_CONSTANTS.MAX_PREGUNTA_LENGTH} caracteres`,
  })
  pregunta: string;
}