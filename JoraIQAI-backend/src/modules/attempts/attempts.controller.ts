import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AttemptsService } from './attempts.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Attempts')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post('quizzes/:id/submit')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Submit quiz answers and compute score server-side (Student only)' })
  @ApiResponse({ status: 201, description: 'Quiz submitted and score calculated' })
  @ApiResponse({ status: 409, description: 'Conflict: Quiz already submitted for this assignment' })
  @ApiResponse({ status: 403, description: 'Forbidden: Student not assigned to this quiz' })
  async submitQuiz(
    @Param('id') quizId: string,
    @CurrentUser('id') studentId: string,
    @Body() dto: SubmitQuizDto,
  ) {
    return this.attemptsService.submitQuiz(studentId, quizId, dto);
  }

  @Get('quizzes/:id/result')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get current student result for a completed quiz' })
  async getStudentQuizResult(
    @Param('id') quizId: string,
    @CurrentUser('id') studentId: string,
  ) {
    return this.attemptsService.getStudentQuizResult(quizId, studentId);
  }

  @Get('attempts/:id')
  @ApiOperation({ summary: 'Get attempt details and score breakdown (Student or Teacher)' })
  async getAttemptResult(
    @Param('id') attemptId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.attemptsService.getAttemptResult(attemptId, userId, userRole);
  }
}
