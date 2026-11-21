import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { AssignQuizDto } from './dto/assign-quiz.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Assignments')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post('quizzes/:id/assign')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Assign a quiz to selected students (Teacher only)' })
  @ApiResponse({ status: 200, description: 'Quiz assigned successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: Requires TEACHER role' })
  async assignQuiz(
    @Param('id') quizId: string,
    @CurrentUser('id') teacherId: string,
    @Body() dto: AssignQuizDto,
  ) {
    return this.assignmentsService.assignQuiz(quizId, teacherId, dto);
  }

  @Get('quizzes/:id/assignments')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Get all student assignments and completion status for a quiz (Teacher only)' })
  async getQuizAssignments(
    @Param('id') quizId: string,
    @CurrentUser('id') teacherId: string,
  ) {
    return this.assignmentsService.getQuizAssignments(quizId, teacherId);
  }

  @Get('student/quizzes')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get all assigned quizzes for the authenticated student' })
  async getStudentAssignments(@CurrentUser('id') studentId: string) {
    return this.assignmentsService.getStudentAssignments(studentId);
  }
}
