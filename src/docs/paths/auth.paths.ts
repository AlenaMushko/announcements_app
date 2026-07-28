import { AUTH_OPENAPI_PATHS } from '../../constants/routes.ts'
import { registry } from '../openapi.ts'
import {
  AuthMeSchema,
  AuthSessionSchema,
  AuthTokensSchema,
} from '../schemas/auth.schemas.ts'
import {
  LoginSchema,
  RefreshSchema,
  RegisterSchema,
} from '../../validations/auth.validator.ts'

const AUTH_TAG = 'Auth'

registry.registerPath({
  method: 'post',
  path: AUTH_OPENAPI_PATHS.REGISTER,
  tags: [AUTH_TAG],
  summary: 'Register a new user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: RegisterSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'User registered successfully',
      content: {
        'application/json': {
          schema: AuthSessionSchema,
        },
      },
    },
    409: { description: 'Username or email already taken' },
    422: { description: 'Validation error' },
  },
})

registry.registerPath({
  method: 'post',
  path: AUTH_OPENAPI_PATHS.LOGIN,
  tags: [AUTH_TAG],
  summary: 'Login with username and password',
  request: {
    body: {
      content: {
        'application/json': {
          schema: LoginSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Login successful',
      content: {
        'application/json': {
          schema: AuthSessionSchema,
        },
      },
    },
    401: { description: 'Invalid credentials' },
    422: { description: 'Validation error' },
  },
})

registry.registerPath({
  method: 'post',
  path: AUTH_OPENAPI_PATHS.REFRESH,
  tags: [AUTH_TAG],
  summary: 'Refresh access and refresh tokens',
  request: {
    body: {
      content: {
        'application/json': {
          schema: RefreshSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Tokens refreshed successfully',
      content: {
        'application/json': {
          schema: AuthTokensSchema,
        },
      },
    },
    401: { description: 'Invalid or missing refresh token' },
    422: { description: 'Validation error' },
  },
})

registry.registerPath({
  method: 'post',
  path: AUTH_OPENAPI_PATHS.LOGOUT,
  tags: [AUTH_TAG],
  summary: 'Logout current user',
  security: [{ bearerAuth: [] }],
  responses: {
    204: { description: 'Logged out successfully' },
    401: { description: 'Authentication required' },
  },
})

registry.registerPath({
  method: 'get',
  path: AUTH_OPENAPI_PATHS.ME,
  tags: [AUTH_TAG],
  summary: 'Get current authenticated user',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Current user profile',
      content: {
        'application/json': {
          schema: AuthMeSchema,
        },
      },
    },
    401: { description: 'Authentication required' },
  },
})
