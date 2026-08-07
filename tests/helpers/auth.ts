import prisma from '../../db.ts';
import { createAuthTokens } from '../../src/services/token.service.ts';

export async function createAuthUser(
  overrides: Partial<{
    username: string;
    email: string;
    name: string;
  }> = {},
) {
  const user = await prisma.user.create({
    data: {
      username: overrides.username ?? 'testuser',
      email: overrides.email ?? 'test@example.com',
      password: 'fake_hash_not_used_in_tests',
      name: overrides.name ?? 'Test User',
    },
  });

  const { accessToken } = await createAuthTokens(user.id);

  return { user, accessToken };
}
