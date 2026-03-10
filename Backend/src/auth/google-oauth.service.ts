import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';

export interface GoogleUserInfo {
  id: string;
  email: string;
  given_name: string;
  family_name: string;
  picture?: string;
}

interface GoogleTokens {
  access_token: string;
  id_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: string;
}

@Injectable()
export class GoogleOAuthService {
  private readonly logger = new Logger(GoogleOAuthService.name);
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID || '';
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    this.redirectUri = process.env.GOOGLE_REDIRECT_URI || '';

    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      this.logger.error(
        'Google OAuth credentials missing from environment variables',
      );
    }
  }

  // ─── AUTH URL GENERATION ───

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // ─── TOKEN EXCHANGE ───

  private async exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.warn(`Failed to exchange code for tokens: ${errorBody}`);
        throw new BadRequestException(
          'Invalid authorization code or credentials',
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Error exchanging code for tokens: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Google authentication exchange failed',
      );
    }
  }

  // ─── USER INFO RETRIEVAL ───

  private async getUserInfoFromGoogle(
    accessToken: string,
  ): Promise<GoogleUserInfo> {
    try {
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        this.logger.warn(
          'Failed to get user info from Google (invalid access token)',
        );
        throw new BadRequestException(
          'Failed to retrieve user information from Google',
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Error getting user info from Google: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch user profile');
    }
  }

  async getUserInfo(authorizationCode: string): Promise<GoogleUserInfo> {
    try {
      const tokens = await this.exchangeCodeForTokens(authorizationCode);
      return await this.getUserInfoFromGoogle(tokens.access_token);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Error in Google OAuth flowchart: ${error.message}`);
      throw new InternalServerErrorException('Full authentication flow failed');
    }
  }

  // ─── ID TOKEN VERIFICATION ───

  async verifyIdToken(idToken: string): Promise<GoogleUserInfo> {
    try {
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
      );

      if (!response.ok) {
        this.logger.warn(
          `Invalid ID token verification attempt: ${idToken.substring(0, 10)}...`,
        );
        throw new BadRequestException('Invalid Google ID token');
      }

      const tokenInfo = await response.json();

      return {
        id: tokenInfo.sub,
        email: tokenInfo.email,
        given_name: tokenInfo.given_name,
        family_name: tokenInfo.family_name,
        picture: tokenInfo.picture,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Error verifying Google ID token: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('ID token verification failed');
    }
  }
}
