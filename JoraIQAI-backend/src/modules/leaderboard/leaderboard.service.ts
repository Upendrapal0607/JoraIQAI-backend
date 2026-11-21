import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getQuizLeaderboard(quizId: string, userId: string, userRole: Role) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        assignments: true,
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Access control:
    // Teachers must be the creator of the quiz
    if (userRole === Role.TEACHER && quiz.teacherId !== userId) {
      throw new ForbiddenException('You do not have access to this quiz leaderboard');
    }

    // Students must have an assignment for this quiz
    if (userRole === Role.STUDENT) {
      const isAssigned = quiz.assignments.some((a) => a.studentId === userId);
      if (!isAssigned) {
        throw new ForbiddenException('You must be assigned to this quiz to view its leaderboard');
      }
    }

    // Fetch all completed attempts for this quiz
    const attempts = await this.prisma.quizAttempt.findMany({
      where: { quizId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { accuracy: 'desc' },
        { correctAnswers: 'desc' },
        { submittedAt: 'asc' }, // Earlier submission breaks tie or maintains consistency
      ],
    });

    // Rank calculation: Standard Competition Ranking (1, 1, 3)
    let currentRank = 1;
    const leaderboardEntries = attempts.map((attempt, index) => {
      if (index > 0) {
        const prev = attempts[index - 1];
        // If accuracy is equal, they receive the SAME rank
        if (attempt.accuracy === prev.accuracy) {
          // keep currentRank same as prev
        } else {
          // Standard competition ranking: jump to index + 1
          currentRank = index + 1;
        }
      }

      return {
        rank: currentRank,
        studentId: attempt.student.id,
        studentName: attempt.student.name,
        studentEmail: attempt.student.email,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        correctAnswers: attempt.correctAnswers,
        accuracy: attempt.accuracy,
        submittedAt: attempt.submittedAt,
        isCurrentUser: attempt.student.id === userId,
      };
    });

    // Find current user's entry if applicable
    const currentUserEntry = leaderboardEntries.find((e) => e.studentId === userId) || null;

    return {
      quizId: quiz.id,
      quizTitle: quiz.title,
      totalParticipants: leaderboardEntries.length,
      currentUserEntry,
      leaderboard: leaderboardEntries,
    };
  }
}
