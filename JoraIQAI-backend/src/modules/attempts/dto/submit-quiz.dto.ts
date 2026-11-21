import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerItemDto {
  @ApiProperty({ example: 'question-uuid-1' })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({ example: 'option-uuid-2' })
  @IsString()
  @IsNotEmpty()
  selectedOptionId: string;
}

export class SubmitQuizDto {
  @ApiProperty({ example: 'assignment-uuid' })
  @IsString()
  @IsNotEmpty()
  assignmentId: string;

  @ApiProperty({ type: [AnswerItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answers: AnswerItemDto[];
}
