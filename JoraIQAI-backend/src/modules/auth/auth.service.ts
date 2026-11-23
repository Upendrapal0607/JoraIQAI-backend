import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        password: hashedPassword,
        name: dto.name.trim(),
        role: dto.role,
        supabaseUid: dto.supabaseUid || null,
      },
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      accessToken: token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Role-portal verification:
    // If logging in via Teacher or Student portal, verify the user's registered role matches the portal
    if (dto.role && user.role !== dto.role) {
      throw new UnauthorizedException(
        `Invalid email or password. This account is registered as a ${user.role.toLowerCase()}, but you are trying to sign in through the ${dto.role.toLowerCase()} portal.`,
      );
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      accessToken: token,
    };
  }

  async syncSupabaseUser(payload: {
    supabaseUid: string;
    email: string;
    name?: string;
    role?: string;
  }) {
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { supabaseUid: payload.supabaseUid },
          { email: payload.email.toLowerCase().trim() },
        ],
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: payload.email.toLowerCase().trim(),
          name: payload.name || payload.email.split('@')[0],
          role: payload.role || 'STUDENT',
          supabaseUid: payload.supabaseUid,
        },
      });
    } else if (!user.supabaseUid) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { supabaseUid: payload.supabaseUid },
      });
    }

    const token = this.generateToken(user);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      accessToken: token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return user;
  }

  async checkSupabaseStatus() {
    const dbUrl = process.env.DATABASE_URL || '';
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const anonKey = process.env.SUPABASE_ANON_KEY || '';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    const isSqlite = dbUrl.startsWith('file:') || dbUrl.includes('.db');
    const isPostgres = dbUrl.startsWith('postgresql:') || dbUrl.startsWith('postgres:');
    const isSupabaseUrlPlaceholder =
      !supabaseUrl ||
      supabaseUrl.includes('your-project-id') ||
      supabaseUrl.includes('your-project');

    let supabaseClientHealthy = false;
    let supabaseClientError: string | null = null;
    let registeredUsersInActiveDb = 0;

    try {
      registeredUsersInActiveDb = await this.prisma.user.count();
    } catch {
      // ignore
    }

    if (!isSupabaseUrlPlaceholder && (serviceKey || anonKey)) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const client = createClient(supabaseUrl, serviceKey || anonKey, {
          auth: { persistSession: false },
        });
        const { error } = await client.from('users').select('id').limit(1);
        if (error) {
          supabaseClientError = error.message;
        } else {
          supabaseClientHealthy = true;
        }
      } catch (err: any) {
        supabaseClientError = err.message;
      }
    }

    return {
      activeDatabase: isPostgres ? 'Supabase PostgreSQL' : 'Local SQLite (dev.db)',
      databaseUrlMasked: isPostgres
        ? dbUrl.replace(/:([^:@]+)@/, ':****@')
        : dbUrl,
      supabaseUrl: isSupabaseUrlPlaceholder
        ? 'NOT CONFIGURED (Placeholder: your-project-id)'
        : supabaseUrl,
      hasAnonKey: !!anonKey && !anonKey.includes('your_supabase'),
      hasServiceRoleKey: !!serviceKey && !serviceKey.includes('your_supabase'),
      supabaseClientHealthy,
      supabaseClientError,
      recordsInActiveDatabase: {
        users: registeredUsersInActiveDb,
      },
      diagnosis: isSqlite
        ? 'Backend is currently configured with local SQLite (DATABASE_URL="file:./dev.db"). Data inserted via API calls is saved into local dev.db, which is why it does not show up in your Supabase Dashboard.'
        : 'Backend is connected to PostgreSQL.',
      instructionsToConnectSupabase: [
        '1. Open your Supabase Dashboard (https://supabase.com/dashboard/project/<PROJECT_REF>).',
        '2. In JoraIQAI-backend/.env, update SUPABASE_URL to "https://<PROJECT_REF>.supabase.co".',
        '3. In JoraIQAI-backend/.env, set DATABASE_URL="postgresql://postgres:uAaxkQ8GTL5J8QTc@db.<PROJECT_REF>.supabase.co:5432/postgres" (or pooler port 6543).',
        '4. Run "npm run db:push" in JoraIQAI-backend to sync all tables to Supabase PostgreSQL.',
      ],
    };
  }

  private generateToken(user: { id: string; email: string; role: string; name: string }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    return this.jwtService.sign(payload);
  }
}
