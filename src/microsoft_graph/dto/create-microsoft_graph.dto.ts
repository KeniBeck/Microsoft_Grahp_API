import { IsEmail, IsNotEmpty } from 'class-validator';
export class CreateMicrosoftGraphDto {}

export class ValidateTeacherDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
