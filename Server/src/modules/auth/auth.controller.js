import { authService as defaultAuthService } from './auth.service.js'
import { validateLoginInput, validateActiveBranchInput } from './auth.validation.js'
import { toAuthResponse, toAuthorizedBranches, toSafeUser } from './auth.mapper.js'
import {
  SESSION_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  getSessionCookieOptions,
  getCsrfCookieOptions,
} from '../../config/cookies.js'

export class AuthController {
  constructor({ service = defaultAuthService, config = {} } = {}) {
    this.service = service
    this.config = config
  }

  login = async (request, response, next) => {
    try {
      const validated = validateLoginInput(request.body)
      const ipAddress = request.ip || request.socket.remoteAddress
      const userAgent = request.headers['user-agent']

      const result = await this.service.login({
        email: validated.email,
        password: validated.password,
        ipAddress,
        userAgent,
      })

      const sessionCookieOpts = getSessionCookieOptions(this.config)
      const csrfCookieOpts = getCsrfCookieOptions(this.config)

      response.cookie(SESSION_COOKIE_NAME, result.sessionToken, sessionCookieOpts)
      response.cookie(CSRF_COOKIE_NAME, result.csrfToken, csrfCookieOpts)
      response.setHeader('x-csrf-token', result.csrfToken)

      response.status(200).json(
        toAuthResponse({
          user: result.user,
          branches: result.branches,
          activeBranch: result.activeBranch,
          permissions: result.permissions,
          csrfToken: result.csrfToken,
        })
      )
    } catch (error) {
      next(error)
    }
  }

  getSession = async (request, response, next) => {
    try {
      const result = await this.service.getSessionState(
        request.session,
        request.user
      )

      response.setHeader('x-csrf-token', result.csrfToken)
      response.status(200).json({
        data: {
          user: toSafeUser(result.user),
          branches: result.branches,
          activeBranch: result.activeBranch,
          permissions: result.permissions,
          csrfToken: result.csrfToken,
        },
      })
    } catch (error) {
      next(error)
    }
  }

  logout = async (request, response, next) => {
    try {
      await this.service.logout(request.session)

      const sessionCookieOpts = getSessionCookieOptions(this.config)
      const csrfCookieOpts = getCsrfCookieOptions(this.config)

      response.clearCookie(SESSION_COOKIE_NAME, sessionCookieOpts)
      response.clearCookie(CSRF_COOKIE_NAME, csrfCookieOpts)

      response.status(200).json({
        data: {
          status: 'logged_out',
        },
      })
    } catch (error) {
      next(error)
    }
  }

  switchActiveBranch = async (request, response, next) => {
    try {
      const validated = validateActiveBranchInput(request.body)
      const result = await this.service.switchActiveBranch(
        request.session,
        request.user,
        validated.branchId
      )

      response.status(200).json({
        data: {
          activeBranch: result.activeBranch,
          permissions: result.permissions,
        },
      })
    } catch (error) {
      next(error)
    }
  }

  listAuthorizedBranches = async (request, response, next) => {
    try {
      const branches = toAuthorizedBranches(request.user)
      response.status(200).json({
        data: {
          branches,
        },
      })
    } catch (error) {
      next(error)
    }
  }
}

export const authController = new AuthController()
