import { env } from '../../../config/env';
import { ValidationError } from '../../../shared/errors/app-error';

interface GoogleTokenResponse {
  access_token: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

export const googleOAuth = {
  buildAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: env.GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'online',
      prompt: 'select_account',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  },

  async getProfileFromCode(code: string): Promise<GoogleProfile> {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      throw new ValidationError('Google OAuth no está configurado');
    }

    const tokenResponse = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new ValidationError('No se pudo autenticar con Google');
    }

    const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;

    const infoResponse = await fetch(USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!infoResponse.ok) {
      throw new ValidationError('No se pudo obtener el perfil de Google');
    }

    const info = (await infoResponse.json()) as GoogleUserInfo;

    return {
      googleId: info.sub,
      email: info.email,
      name: info.name,
      avatarUrl: info.picture ?? null,
    };
  },
};
