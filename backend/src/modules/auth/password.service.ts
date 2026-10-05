import { hash, verify } from '@node-rs/argon2';

export const passwordService = {
  hash(plain: string): Promise<string> {
    return hash(plain);
  },

  verify(hashed: string, plain: string): Promise<boolean> {
    return verify(hashed, plain);
  },
};
