import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('students')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Get all registered students (Teacher only)' })
  @ApiResponse({ status: 200, description: 'List of students' })
  @ApiResponse({ status: 403, description: 'Forbidden: Requires TEACHER role' })
  async getStudents() {
    return this.usersService.getStudents();
  }
}
