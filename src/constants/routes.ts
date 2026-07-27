export const APP_PATHS = {
  AUTH: '/auth',
  ANNOUNCEMENTS: '/announcements',
} as const

export const AUTH_PATHS = {
  REGISTER: '/register',
  LOGIN: '/login',
  REFRESH: '/refresh',
  LOGOUT: '/logout',
  ME: '/me',
} as const

export const ANNOUNCEMENT_PATHS = {
  ROOT: '/',
  BY_ID: '/:id',
} as const
