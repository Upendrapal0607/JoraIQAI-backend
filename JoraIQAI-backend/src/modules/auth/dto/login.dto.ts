import { IsEmail, IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../common/enums/role.enum';

export class LoginDto {
  @ApiProperty({ example: 'teacher@school.edu' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiProperty({ example: 'TEACHER', enum: Role, required: false })
  @IsOptional()
  @IsIn([Role.TEACHER, Role.STUDENT], { message: 'Role must be either TEACHER or STUDENT' })
  role?: Role;
}
