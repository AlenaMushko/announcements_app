import type { RequestHandler } from 'express'
import { authService } from '../services/auth.services.ts'

export const register: RequestHandler = async () => {
  await authService.register()
}

export const login: RequestHandler = async () => {
  await authService.login()
}

export const refresh: RequestHandler = async () => {
  await authService.refresh()
}

export const logout: RequestHandler = async () => {
  await authService.logout()
}

export const getMe: RequestHandler = async () => {
  await authService.getMe()
}
