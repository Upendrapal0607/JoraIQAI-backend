import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AssignQuizDto } from './dto/assign-quiz.dto';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async assignQuiz(quizId: string, teacherId: string, dto: AssignQuizDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.teacherId !== teacherId) {
      throw new ForbiddenException('You do not own this quiz');
    }

    // Verify all studentIds exist and are eligible students
    const students = await this.prisma.user.findMany({
      where: {
        id: { in: dto.studentIds },
        role: 'STUDENT',
      },
    });

    if (students.length === 0) {
      throw new BadRequestException('No valid students found with the provided IDs');
    }

    let assignedCount = 0;
    for (const student of students) {
      const existing = await this.prisma.quizAssignment.findUnique({
        where: {
          quizId_studentId: {
            quizId,
            studentId: student.id,
          },
        },
      });

      if (!existing) {
        await this.prisma.quizAssignment.create({
          data: {
            quizId,
            studentId: student.id,
            status: 'PENDING',
          },
        });
        assignedCount++;
      }
    }

    return {
      message: `Successfully assigned quiz to ${assignedCount} new student(s).`,
      assignedCount,
      totalSelected: students.length,
    };
  }

  async getQuizAssignments(quizId: string, teacherId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.teacherId !== teacherId) {
      throw new ForbiddenException('You do not own this quiz');
    }

    const assignments = await this.prisma.quizAssignment.findMany({
      where: { quizId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attempt: {
          select: {
            id: true,
            score: true,
            totalQuestions: true,
            correctAnswers: true,
            incorrectAnswers: true,
            accuracy: true,
            submittedAt: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return assignments.map((a) => ({
      assignmentId: a.id,
      studentId: a.student.id,
      studentName: a.student.name,
      studentEmail: a.student.email,
      assignedAt: a.assignedAt,
      status: a.status,
      completedAt: a.completedAt,
      attempt: a.attempt,
    }));
  }

  async getStudentAssignments(studentId: string) {
    const assignments = await this.prisma.quizAssignment.findMany({
      where: { studentId },
      include: {
        quiz: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: { questions: true },
            },
          },
        },
        attempt: {
          select: {
            id: true,
            score: true,
            totalQuestions: true,
            correctAnswers: true,
            incorrectAnswers: true,
            accuracy: true,
            submittedAt: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return assignments.map((a) => ({
      assignmentId: a.id,
      quizId: a.quiz.id,
      quizTitle: a.quiz.title,
      quizDescription: a.quiz.description,
      teacherName: a.quiz.teacher.name,
      totalQuestions: a.quiz._count.questions,
      assignedAt: a.assignedAt,
      status: a.status,
      completedAt: a.completedAt,
      attempt: a.attempt,
    }));
  }
}
