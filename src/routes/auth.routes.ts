import express from 'express'

import * as authController from '../controllers/auth.controller.ts'
import { authenticate } from '../middlewares/authenticate.ts'
import { validateBody } from '../middlewares/validate.ts'
import { AUTH_PATHS } from '../constants/routes.ts'
import {
  LoginSchema,
  RefreshSchema,
  RegisterSchema,
} from '../validations/auth.validator.ts'

const router = express.Router()

router.post(
  AUTH_PATHS.REGISTER,
  validateBody(RegisterSchema),
  authController.register,
)
router.post(AUTH_PATHS.LOGIN, validateBody(LoginSchema), authController.login)
router.post(
  AUTH_PATHS.REFRESH,
  validateBody(RefreshSchema),
  authController.refresh,
)
router.post(AUTH_PATHS.LOGOUT, authenticate, authController.logout)
router.get(AUTH_PATHS.ME, authenticate, authController.getMe)

export default router
