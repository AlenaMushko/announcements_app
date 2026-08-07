import prisma from '../../db.ts';

export async function cleanDatabase() {
  await prisma.refreshToken.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.user.deleteMany();
}

export async function cleanAnnouncementsData() {
  await prisma.refreshToken.deleteMany();
  await prisma.announcement.deleteMany();
}
