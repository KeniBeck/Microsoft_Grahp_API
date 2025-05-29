import { PartialType } from '@nestjs/mapped-types';
import { CreateMicrosoftGraphDto } from './create-microsoft_graph.dto';

export class UpdateMicrosoftGraphDto extends PartialType(CreateMicrosoftGraphDto) {}
