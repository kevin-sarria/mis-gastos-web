import type { Role, TokenType } from '@prisma/client';
import { prisma } from '../../lib/prisma';

interface CreateUserData {
  name: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  avatarUrl?: string;
  role?: Role;
  currencyCode: string;
}

interface CreateRefreshTokenData {
  userId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  userAgent?: string | null;
  ip?: string | null;
}

export const authRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email }, include: { currency: true } });
  },

  findByGoogleId(googleId: string) {
    return prisma.user.findUnique({ where: { googleId }, include: { currency: true } });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id }, include: { currency: true } });
  },

  createUser(data: CreateUserData) {
    return prisma.user.create({ data, include: { currency: true } });
  },

  updateUserPassword(userId: string, passwordHash: string) {
    return prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  },

  updateProfile(userId: string, data: { name?: string; currencyCode?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data,
      include: { currency: true },
    });
  },

  linkGoogleId(userId: string, googleId: string, avatarUrl?: string | null) {
    return prisma.user.update({
      where: { id: userId },
      data: { googleId, avatarUrl: avatarUrl ?? undefined },
      include: { currency: true },
    });
  },

  createRefreshToken(data: CreateRefreshTokenData) {
    return prisma.refreshToken.create({ data });
  },

  findRefreshToken(tokenHash: string) {
    return prisma.refreshToken.findUnique({ where: { tokenHash } });
  },

  revokeRefreshToken(id: string) {
    return prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } });
  },

  revokeRefreshTokenFamily(familyId: string) {
    return prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  revokeAllUserRefreshTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  createEmailToken(data: { userId: string; type: TokenType; tokenHash: string; expiresAt: Date }) {
    return prisma.emailToken.create({ data });
  },

  findEmailToken(tokenHash: string) {
    return prisma.emailToken.findUnique({ where: { tokenHash } });
  },

  markEmailTokenUsed(id: string) {
    return prisma.emailToken.update({ where: { id }, data: { usedAt: new Date() } });
  },
};
