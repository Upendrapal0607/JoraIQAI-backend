import { IsArray, ArrayMinSize, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignQuizDto {
  @ApiProperty({ example: ['student-uuid-1', 'student-uuid-2'] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Must select at least one student to assign the quiz' })
  @IsString({ each: true })
  studentIds: string[];
}
