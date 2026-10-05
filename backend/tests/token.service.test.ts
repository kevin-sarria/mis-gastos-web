import { describe, expect, it } from 'vitest';
import { tokenService } from '../src/modules/auth/token.service';

describe('tokenService', () => {
  const payload = { userId: 'user-1', email: 'a@b.com', role: 'USER' as const };

  it('firma y verifica un access token', () => {
    const token = tokenService.signAccessToken(payload);
    const decoded = tokenService.verifyAccessToken(token);

    expect(decoded.userId).toBe('user-1');
    expect(decoded.email).toBe('a@b.com');
    expect(decoded.role).toBe('USER');
  });

  it('rechaza un token inválido', () => {
    expect(() => tokenService.verifyAccessToken('token-invalido')).toThrow();
  });
});
