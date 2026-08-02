import prisma from '../../db.ts';
import { AUTH_ME_SELECT, PUBLIC_USER_SELECT } from '../constants/userSelect.ts';
import type { RegisterBody } from '../validations/auth.validator.ts';

export const authRepository = {
  createUser: async (data: RegisterBody & { password: string }) => {
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
        name: data.name,
      },
      select: PUBLIC_USER_SELECT,
    });

    return user;
  },

  createRefreshToken: (data: { userId: number; token: string; expiresAt: Date }) =>
    prisma.refreshToken.create({
      data,
    }),

  findUserByUsernameOrEmail: (username: string, email: string) =>
    prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
      select: { id: true },
    }),

  deleteRefreshTokensByUserId: (userId: number) =>
    prisma.refreshToken.deleteMany({
      where: { userId },
    }),

  findRefreshTokenByToken: (token: string) =>
    prisma.refreshToken.findUnique({
      where: { token },
    }),

  deleteRefreshTokenByToken: (token: string) =>
    prisma.refreshToken.deleteMany({
      where: { token },
    }),

  findUserByUsername: (username: string) =>
    prisma.user.findUnique({
      where: { username },
    }),

  findUserById: (id: number) =>
    prisma.user.findUnique({
      where: { id },
      select: AUTH_ME_SELECT,
    }),
};
