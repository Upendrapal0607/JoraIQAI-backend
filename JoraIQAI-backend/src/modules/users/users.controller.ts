import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get categorized list of teachers and students' })
  @ApiResponse({ status: 200, description: 'Categorized list of teachers and students' })
  async getAllUsers() {
    return this.usersService.getAllCategorizedUsers();
  }

  @Get('students')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Get registered students for assignment (Teacher only)' })
  @ApiResponse({ status: 200, description: 'List of students' })
  @ApiResponse({ status: 403, description: 'Forbidden: Requires TEACHER role' })
  async getStudents() {
    return this.usersService.getStudents();
  }
}
