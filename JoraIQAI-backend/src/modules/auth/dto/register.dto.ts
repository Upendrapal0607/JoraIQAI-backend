import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../common/enums/role.enum';

export class RegisterDto {
  @ApiProperty({ example: 'teacher@school.edu' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @ApiProperty({ example: 'Prof. Sarah Jenkins' })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({ example: 'TEACHER', enum: Role })
  @IsIn([Role.TEACHER, Role.STUDENT], { message: 'Role must be either TEACHER or STUDENT' })
  role: Role;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  supabaseUid?: string;
}
