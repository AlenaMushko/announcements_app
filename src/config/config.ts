import 'dotenv/config';

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const getJwtSecret = (): string => {
  const secret = getRequiredEnv('JWT_SECRET');
  const weakSecrets = new Set(['your_secret_key_here', 'secret', 'jwt_secret', 'changeme']);

  if (weakSecrets.has(secret) || secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters and not a placeholder value');
  }

  return secret;
};

const port = Number(process.env.PORT ?? 3000);

export const config = {
  PORT: port,
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  DATABASE_URL: getRequiredEnv('DATABASE_URL'),
  JWT_SECRET: getJwtSecret(),
  APP_URL: process.env.APP_URL ?? `http://localhost:${port}`,
  SALT_ROUNDS: Number(process.env.SALT_ROUNDS ?? 10),
  ACCESS_TOKEN_LIFETIME: Number(process.env.ACCESS_TOKEN_LIFETIME ?? 15 * 60 * 1000),
  REFRESH_TOKEN_LIFETIME: Number(process.env.REFRESH_TOKEN_LIFETIME ?? 7 * 24 * 60 * 60 * 1000),
  ACCESS_TOKEN_COOKIE: process.env.ACCESS_TOKEN_COOKIE ?? 'accessToken',
  REFRESH_TOKEN_COOKIE: process.env.REFRESH_TOKEN_COOKIE ?? 'refreshToken',
} as const;
