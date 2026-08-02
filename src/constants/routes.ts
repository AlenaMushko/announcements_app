export const APP_PATHS = {
  AUTH: '/auth',
  ANNOUNCEMENTS: '/announcements',
} as const;

export const AUTH_PATHS = {
  REGISTER: '/register',
  LOGIN: '/login',
  REFRESH: '/refresh',
  LOGOUT: '/logout',
  ME: '/me',
} as const;

export const ANNOUNCEMENT_PATHS = {
  ROOT: '/',
  BY_ID: '/:id',
} as const;

export const AUTH_OPENAPI_PATHS = {
  REGISTER: `${APP_PATHS.AUTH}${AUTH_PATHS.REGISTER}`,
  LOGIN: `${APP_PATHS.AUTH}${AUTH_PATHS.LOGIN}`,
  REFRESH: `${APP_PATHS.AUTH}${AUTH_PATHS.REFRESH}`,
  LOGOUT: `${APP_PATHS.AUTH}${AUTH_PATHS.LOGOUT}`,
  ME: `${APP_PATHS.AUTH}${AUTH_PATHS.ME}`,
} as const;

export const ANNOUNCEMENT_OPENAPI_PATHS = {
  ROOT: APP_PATHS.ANNOUNCEMENTS,
  BY_ID: `${APP_PATHS.ANNOUNCEMENTS}/{id}`,
} as const;
