import bcrypt from 'bcrypt'
import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'

import { config } from '../config/config.ts'
import { authRepository } from '../repositories/auth.repository.ts'
import type {
  LoginBody,
  RegisterBody,
} from '../validations/auth.validator.ts'
import { createAuthTokens } from './token.service.ts'

const toPublicUser = <T extends { id: number; username: string; email: string; name: string }>(
  user: T,
): { id: number; username: string; email: string; name: string } => {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
  }
}

export const authService = {
  register: async (body: RegisterBody) => {
    const existingUser = await authRepository.findUserByUsernameOrEmail(
      body.username,
      body.email,
    )

    if (existingUser) {
      throw createHttpError(409, 'Username or email already taken')
    }

    const passwordHash = await bcrypt.hash(body.password, config.SALT_ROUNDS)

    const user = await authRepository.createUser({
      ...body,
      password: passwordHash,
    })

    const tokens = await createAuthTokens(user.id)

    return {
      user: toPublicUser(user),
      ...tokens,
    }
  },

  login: async (body: LoginBody) => {
    const user = await authRepository.findUserByUsername(body.username)

    if (!user) {
      throw createHttpError(401, 'Invalid credentials')
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.password)

    if (!isPasswordValid) {
      throw createHttpError(401, 'Invalid credentials')
    }

    await authRepository.deleteRefreshTokensByUserId(user.id)
    const tokens = await createAuthTokens(user.id)

    return {
      user: toPublicUser(user),
      ...tokens,
    }
  },

  refresh: async (refreshToken: string) => {
    let payload: jwt.JwtPayload

    try {
      payload = jwt.verify(refreshToken, config.JWT_SECRET) as jwt.JwtPayload
    } catch {
      throw createHttpError(401, 'Unauthorized')
    }

    const storedToken =
      await authRepository.findRefreshTokenByToken(refreshToken)

    if (!storedToken) {
      throw createHttpError(401, 'Unauthorized')
    }

    if (storedToken.expiresAt.getTime() < Date.now()) {
      await authRepository.deleteRefreshTokenByToken(refreshToken)
      throw createHttpError(401, 'Unauthorized')
    }

    const userId = Number(payload.sub)

    if (!Number.isInteger(userId) || userId <= 0) {
      throw createHttpError(401, 'Unauthorized')
    }

    await authRepository.deleteRefreshTokenByToken(refreshToken)

    return createAuthTokens(userId)
  },

  logout: async (userId: number) => {
    await authRepository.deleteRefreshTokensByUserId(userId)
  },

  getMe: async (userId: number) => {
    const user = await authRepository.findUserById(userId)

    if (!user) {
      throw createHttpError(401, 'Unauthorized')
    }

    return user
  },
}
