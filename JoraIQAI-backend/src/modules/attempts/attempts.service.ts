import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class AttemptsService {
  constructor(private readonly prisma: PrismaService) {}

  async submitQuiz(studentId: string, quizId: string, dto: SubmitQuizDto) {
    // 1. Check assignment
    const assignment = await this.prisma.quizAssignment.findUnique({
      where: { id: dto.assignmentId },
      include: { attempt: true },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.studentId !== studentId) {
      throw new ForbiddenException('You do not own this assignment');
    }

    if (assignment.quizId !== quizId) {
      throw new BadRequestException('Assignment does not match the specified quiz');
    }

    // 2. Prevent duplicate submission (Requirement: single submission only)
    if (assignment.status === 'COMPLETED' || assignment.attempt) {
      throw new ConflictException(
        'Quiz has already been submitted for this assignment. Duplicate submissions are not allowed.',
      );
    }

    // 3. Fetch quiz questions and options with correct answer keys
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    const totalQuestions = quiz.questions.length;
    if (totalQuestions === 0) {
      throw new BadRequestException('This quiz has no questions');
    }

    // 4. Server-side score calculation
    let correctAnswers = 0;
    const answerRecords: Array<{
      questionId: string;
      selectedOptionId: string;
      isCorrect: boolean;
    }> = [];

    const answerMap = new Map<string, string>();
    for (const ans of dto.answers) {
      answerMap.set(ans.questionId, ans.selectedOptionId);
    }

    for (const question of quiz.questions) {
      const selectedOptionId = answerMap.get(question.id);
      let isCorrect = false;

      if (selectedOptionId) {
        const option = question.options.find((o) => o.id === selectedOptionId);
        if (option && option.isCorrect) {
          isCorrect = true;
          correctAnswers++;
        }
        answerRecords.push({
          questionId: question.id,
          selectedOptionId,
          isCorrect,
        });
      }
    }

    const incorrectAnswers = totalQuestions - correctAnswers;
    const accuracy = Math.round((correctAnswers / totalQuestions) * 1000) / 10;
    const score = correctAnswers;

    // 5. Transactional record creation
    const attempt = await this.prisma.$transaction(async (tx) => {
      const createdAttempt = await tx.quizAttempt.create({
        data: {
          assignmentId: assignment.id,
          quizId: quiz.id,
          studentId,
          totalQuestions,
          correctAnswers,
          incorrectAnswers,
          score,
          accuracy,
          submittedAt: new Date(),
        },
      });

      for (const ans of answerRecords) {
        await tx.attemptAnswer.create({
          data: {
            attemptId: createdAttempt.id,
            questionId: ans.questionId,
            selectedOptionId: ans.selectedOptionId,
            isCorrect: ans.isCorrect,
          },
        });
      }

      await tx.quizAssignment.update({
        where: { id: assignment.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      return createdAttempt;
    });

    return this.getAttemptResult(attempt.id, studentId, Role.STUDENT);
  }

  async getAttemptResult(attemptId: string, userId: string, userRole: Role) {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
              include: {
                options: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        answers: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }

    // Authorization: Student who took it OR Teacher who created it
    if (userRole === Role.STUDENT && attempt.studentId !== userId) {
      throw new ForbiddenException('You do not have permission to view this result');
    }

    if (userRole === Role.TEACHER && attempt.quiz.teacherId !== userId) {
      throw new ForbiddenException('You do not have permission to view this result');
    }

    const answerMap = new Map<string, { selectedOptionId: string; isCorrect: boolean }>();
    for (const ans of attempt.answers) {
      answerMap.set(ans.questionId, {
        selectedOptionId: ans.selectedOptionId,
        isCorrect: ans.isCorrect,
      });
    }

    const breakdown = attempt.quiz.questions.map((q) => {
      const studentAns = answerMap.get(q.id);
      const selectedOption = q.options.find((o) => o.id === studentAns?.selectedOptionId);
      const correctOption = q.options.find((o) => o.isCorrect);

      return {
        questionId: q.id,
        questionText: q.text,
        options: q.options.map((o) => ({
          id: o.id,
          text: o.text,
          isCorrect: o.isCorrect,
          isSelected: o.id === studentAns?.selectedOptionId,
        })),
        selectedOptionId: studentAns?.selectedOptionId || null,
        selectedOptionText: selectedOption?.text || 'Not answered',
        correctOptionId: correctOption?.id || null,
        correctOptionText: correctOption?.text || null,
        isCorrect: studentAns?.isCorrect || false,
      };
    });

    return {
      attemptId: attempt.id,
      quizId: attempt.quizId,
      quizTitle: attempt.quiz.title,
      studentId: attempt.student.id,
      studentName: attempt.student.name,
      studentEmail: attempt.student.email,
      totalQuestions: attempt.totalQuestions,
      correctAnswers: attempt.correctAnswers,
      incorrectAnswers: attempt.incorrectAnswers,
      score: attempt.score,
      accuracy: attempt.accuracy,
      submittedAt: attempt.submittedAt,
      breakdown,
    };
  }

  async getStudentQuizResult(quizId: string, studentId: string) {
    const attempt = await this.prisma.quizAttempt.findFirst({
      where: {
        quizId,
        studentId,
      },
    });

    if (!attempt) {
      throw new NotFoundException('No completed attempt found for this quiz');
    }

    return this.getAttemptResult(attempt.id, studentId, Role.STUDENT);
  }
}
