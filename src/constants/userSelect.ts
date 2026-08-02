export const PUBLIC_USER_SELECT = {
  id: true,
  username: true,
  email: true,
  name: true,
} as const;

export const AUTH_ME_SELECT = {
  ...PUBLIC_USER_SELECT,
  createdAt: true,
} as const;
