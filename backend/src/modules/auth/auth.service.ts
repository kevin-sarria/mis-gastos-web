import type { User } from '@prisma/client';
import { env } from '../../config/env';
import { ConflictError, UnauthorizedError, ValidationError } from '../../shared/errors/app-error';
import { randomToken, sha256 } from '../../shared/utils/crypto';
import { emailService } from '../notifications/email.service';
import { currencyRepository } from '../currencies/currency.repository';
import { authRepository } from './auth.repository';
import { toPublicUser } from './auth.mapper';
import type { PublicUser } from './auth.mapper';
import { googleOAuth } from './oauth/google.service';
import { passwordService } from './password.service';
import { tokenService } from './token.service';
import type { LoginInput, RegisterInput, ResetPasswordInput } from './auth.schemas';

export interface RequestMeta {
  userAgent?: string | null;
  ip?: string | null;
}

export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutos

class AuthService {
  async register(input: RegisterInput, meta: RequestMeta): Promise<AuthResult> {
    const currency = await currencyRepository.findByCode(input.currencyCode);
    if (!currency) {
      throw new ValidationError('La moneda seleccionada no es válida');
    }

    const existing = await authRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('Ya existe una cuenta con este correo');
    }

    const passwordHash = await passwordService.hash(input.password);
    const user = await authRepository.createUser({
      name: input.name,
      email: input.email,
      passwordHash,
      currencyCode: input.currencyCode,
    });

    return this.issueResult(user, meta);
  }

  async login(input: LoginInput, meta: RequestMeta): Promise<AuthResult> {
    const user = await authRepository.findByEmail(input.email);

    if (!user?.passwordHash) {
      throw new UnauthorizedError('Correo o contraseña incorrectos');
    }

    const valid = await passwordService.verify(user.passwordHash, input.password);
    if (!valid) {
      throw new UnauthorizedError('Correo o contraseña incorrectos');
    }

    return this.issueResult(user, meta);
  }

  async refresh(rawToken: string, meta: RequestMeta): Promise<AuthResult> {
    const tokenHash = sha256(rawToken);
    const record = await authRepository.findRefreshToken(tokenHash);

    if (!record) {
      throw new UnauthorizedError('Sesión inválida');
    }

    if (record.revokedAt) {
      // Posible reuso de token: revocamos toda la familia por seguridad.
      await authRepository.revokeRefreshTokenFamily(record.familyId);
      throw new UnauthorizedError('Sesión inválida');
    }

    if (record.expiresAt < new Date()) {
      throw new UnauthorizedError('Sesión expirada');
    }

    const user = await authRepository.findById(record.userId);
    if (!user) {
      throw new UnauthorizedError('Sesión inválida');
    }

    // Rotación: el token actual queda revocado y emitimos uno nuevo.
    await authRepository.revokeRefreshToken(record.id);

    return this.issueResult(user, meta);
  }

  async logout(rawToken: string): Promise<void> {
    if (!rawToken) {
      return;
    }
    const tokenHash = sha256(rawToken);
    const record = await authRepository.findRefreshToken(tokenHash);
    if (record && !record.revokedAt) {
      await authRepository.revokeRefreshToken(record.id);
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      return; // No revelamos si el correo existe.
    }

    const rawToken = randomToken(32);
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await authRepository.createEmailToken({
      userId: user.id,
      type: 'PASSWORD_RESET',
      tokenHash,
      expiresAt,
    });

    const resetUrl = `${env.APP_URL}/recuperar-contrasena?token=${rawToken}`;

    await emailService.send({
      to: user.email,
      subject: 'Recupera tu contraseña',
      text: `Hola ${user.name}, para restablecer tu contraseña abre este enlace: ${resetUrl}\n\nEl enlace caduca en 30 minutos. Si no lo pediste, ignora este correo.`,
    });
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const tokenHash = sha256(input.token);
    const record = await authRepository.findEmailToken(tokenHash);

    if (
      !record ||
      record.type !== 'PASSWORD_RESET' ||
      record.usedAt ||
      record.expiresAt < new Date()
    ) {
      throw new ValidationError('El enlace no es válido o ya expiró');
    }

    const passwordHash = await passwordService.hash(input.password);
    await authRepository.updateUserPassword(record.userId, passwordHash);
    await authRepository.markEmailTokenUsed(record.id);
    await authRepository.revokeAllUserRefreshTokens(record.userId);
  }

  async googleLogin(code: string, meta: RequestMeta): Promise<AuthResult> {
    const profile = await googleOAuth.getProfileFromCode(code);

    let user = await authRepository.findByGoogleId(profile.googleId);

    if (!user) {
      const byEmail = await authRepository.findByEmail(profile.email);

      if (byEmail) {
        user = await authRepository.linkGoogleId(byEmail.id, profile.googleId, profile.avatarUrl);
      } else {
        const currency =
          (await currencyRepository.findDefault()) ?? (await currencyRepository.findFirstActive());

        if (!currency) {
          throw new ValidationError('No hay monedas disponibles. Contacta al administrador.');
        }

        user = await authRepository.createUser({
          name: profile.name,
          email: profile.email,
          googleId: profile.googleId,
          avatarUrl: profile.avatarUrl ?? undefined,
          currencyCode: currency.code,
        });
      }
    }

    return this.issueResult(user, meta);
  }

  async getMe(userId: string): Promise<PublicUser> {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('Usuario no encontrado');
    }
    return toPublicUser(user);
  }

  private async issueResult(user: User, meta: RequestMeta): Promise<AuthResult> {
    const accessToken = tokenService.signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = randomToken(48);
    const tokenHash = sha256(refreshToken);
    const familyId = randomToken(16);
    const refreshTokenExpiresAt = new Date(
      Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    await authRepository.createRefreshToken({
      userId: user.id,
      tokenHash,
      familyId,
      expiresAt: refreshTokenExpiresAt,
      userAgent: meta.userAgent,
      ip: meta.ip,
    });

    return {
      user: toPublicUser(user),
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
    };
  }
}

export const authService = new AuthService();
