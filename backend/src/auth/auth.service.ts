import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';

const REFRESH_TOKEN_EXPIRES = '7d';
const ACCESS_TOKEN_EXPIRES = process.env.JWT_EXPIRATION ?? '7d';

const ALLOWED_ROLES: Role[] = ['ADMIN_MANAGER', 'STOREKEEPER'];
const isAllowedRole = (value: string | undefined): value is Role => !!value && ALLOWED_ROLES.includes(value as Role);

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('Email is already registered');
    }

    const role = isAllowedRole(dto.role) ? dto.role : 'STOREKEEPER';
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role,
      },
    });

    return { id: user.id, email: user.email, role: user.role };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: ACCESS_TOKEN_EXPIRES });
    const refreshToken = this.jwtService.sign(payload, { secret: process.env.REFRESH_TOKEN_SECRET ?? process.env.JWT_SECRET, expiresIn: REFRESH_TOKEN_EXPIRES });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  createAccessTokenForUser(user: { id: string; email: string; role: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload, { expiresIn: ACCESS_TOKEN_EXPIRES });
  }

  createRefreshTokenForUser(user: { id: string; email: string; role: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload, { secret: process.env.REFRESH_TOKEN_SECRET ?? process.env.JWT_SECRET, expiresIn: REFRESH_TOKEN_EXPIRES });
  }

  verifyRefreshToken(token: string) {
    try {
      return this.jwtService.verify(token, { secret: process.env.REFRESH_TOKEN_SECRET ?? process.env.JWT_SECRET });
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { ok: true }; // don't reveal

    const token = Math.random().toString(36).slice(2, 8).toUpperCase();
    // In a real app: save token with expiry and send email. Here we console log for testing.
    console.log(`Reset token for ${email}: ${token}`);
    return { ok: true };
  }
}
