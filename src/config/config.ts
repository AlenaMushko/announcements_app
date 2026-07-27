import 'dotenv/config'

function getRequiredEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function getJwtSecret(): string {
  const secret = getRequiredEnv('JWT_SECRET')
  const weakSecrets = new Set([
    'your_secret_key_here',
    'secret',
    'jwt_secret',
    'changeme',
  ])

  if (weakSecrets.has(secret) || secret.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters and not a placeholder value',
    )
  }

  return secret
}

const port = Number(process.env.PORT ?? 3000)

export const config = {
  port,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: getRequiredEnv('DATABASE_URL'),
  jwtSecret: getJwtSecret(),
  appUrl: process.env.APP_URL ?? `http://localhost:${port}`,
} as const
