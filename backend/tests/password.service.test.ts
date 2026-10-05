import { describe, expect, it } from 'vitest';
import { passwordService } from '../src/modules/auth/password.service';

describe('passwordService', () => {
  it('hashea y verifica una contraseña correctamente', async () => {
    const hashed = await passwordService.hash('mi-contrasena-segura');

    expect(hashed).not.toBe('mi-contrasena-segura');
    await expect(passwordService.verify(hashed, 'mi-contrasena-segura')).resolves.toBe(true);
    await expect(passwordService.verify(hashed, 'incorrecta')).resolves.toBe(false);
  });
});
