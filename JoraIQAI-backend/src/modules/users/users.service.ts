import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getStudents() {
    const students = await this.prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            assignments: true,
            attempts: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return students.map((s) => ({
      id: s.id,
      email: s.email,
      name: s.name,
      createdAt: s.createdAt,
      totalAssigned: s._count.assignments,
      totalCompleted: s._count.attempts,
    }));
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
  }

  async getAllCategorizedUsers() {
    const teachers = await this.prisma.user.findMany({
      where: { role: 'TEACHER' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    const students = await this.prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    return {
      teacher: teachers,
      student: students,
    };
  }
}
