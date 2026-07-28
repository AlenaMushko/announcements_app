import type { RequestHandler } from 'express'

import { config } from '../config/config.ts'
import { authService } from '../services/auth.services.ts'
import {
  clearAuthCookies,
  setAuthCookies,
} from '../services/token.service.ts'
import { getAuthenticatedUserId } from '../utils/auth.ts'
import type {
  LoginBody,
  RefreshBody,
  RegisterBody,
} from '../validations/auth.validator.ts'

export const register: RequestHandler = async (req, res, next) => {
  try {
    const body = req.body as RegisterBody
    const result = await authService.register(body)

    setAuthCookies(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    })

    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}

export const login: RequestHandler = async (req, res, next) => {
  try {
    const body = req.body as LoginBody
    const result = await authService.login(body)

    setAuthCookies(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    })

    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export const refresh: RequestHandler = async (req, res, next) => {
  try {
    const body = req.body as RefreshBody
    const refreshTokenFromCookie = req.cookies?.[config.REFRESH_TOKEN_COOKIE] as
      | string
      | undefined

    const refreshToken = body.refreshToken || refreshTokenFromCookie

    if (!refreshToken) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const tokens = await authService.refresh(refreshToken)

    setAuthCookies(res, tokens)
    res.status(200).json(tokens)
  } catch (error) {
    next(error)
  }
}

export const logout: RequestHandler = async (req, res, next) => {
  try {
    const userId = getAuthenticatedUserId(req)
    await authService.logout(userId)
    clearAuthCookies(res)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
}

export const getMe: RequestHandler = async (req, res, next) => {
  try {
    const userId = getAuthenticatedUserId(req)
    const user = await authService.getMe(userId)
    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}
