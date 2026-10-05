import type { Role } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: Role;
}

const ISSUER = 'mis-gastos-api';

export const tokenService = {
  signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign({ email: payload.email, role: payload.role }, env.ACCESS_TOKEN_SECRET, {
      subject: payload.userId,
      expiresIn: env.ACCESS_TOKEN_TTL_SECONDS,
      issuer: ISSUER,
    });
  },

  verifyAccessToken(token: string): AccessTokenPayload {
    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET, { issuer: ISSUER });

    if (typeof decoded === 'string' || !decoded.sub) {
      throw new Error('Token inválido');
    }

    return {
      userId: decoded.sub,
      email: typeof decoded.email === 'string' ? decoded.email : '',
      role: (decoded.role as Role | undefined) ?? 'USER',
    };
  },
};
