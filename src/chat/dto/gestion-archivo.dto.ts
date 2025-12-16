import { IsString, IsNotEmpty, Matches, MaxLength, IsEmail } from 'class-validator';

export class GestionArchivoDto {
  @IsEmail({}, { message: 'El usuario debe ser un email válido' })
  @IsNotEmpty({ message: 'El usuario es requerido' })
  usuario: string;

  @IsString({ message: 'El filename debe ser un texto' })
  @IsNotEmpty({ message: 'El filename es requerido' })
  @Matches(/\.(xlsx|xls)$/i, { message: 'El archivo debe ser Excel (.xlsx o .xls)' })
  @MaxLength(255, { message: 'El nombre del archivo es demasiado largo' })
  filename: string;

  @IsString({ message: 'El file_base64 debe ser un texto' })
  @IsNotEmpty({ message: 'El file_base64 es requerido' })
  file_base64: string;
}
