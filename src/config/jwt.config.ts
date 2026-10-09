import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'super-secret-jwt-key-replace-in-production',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-jwt-key-replace-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));
