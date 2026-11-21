import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOptionDto {
  @ApiProperty({ example: 'Paris' })
  @IsString()
  @IsNotEmpty({ message: 'Option text cannot be empty' })
  text: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isCorrect: boolean;
}

export class CreateQuestionDto {
  @ApiProperty({ example: 'What is the capital of France?' })
  @IsString()
  @IsNotEmpty({ message: 'Question text cannot be empty' })
  text: string;

  @ApiProperty({ type: [CreateOptionDto] })
  @IsArray()
  @ArrayMinSize(2, { message: 'Each question must have at least 2 options (standard is 4)' })
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  options: CreateOptionDto[];
}

export class CreateQuizDto {
  @ApiProperty({ example: 'World Geography & Capitals' })
  @IsString()
  @IsNotEmpty({ message: 'Quiz title is required' })
  title: string;

  @ApiProperty({ example: 'Test your knowledge on countries, capitals, and landmarks.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [CreateQuestionDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Quiz must contain at least one question' })
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}
