import { AppError } from '../shared/errors/AppError.js'

export function notFound(request, _response, next) {
  next(new AppError({
    statusCode: 404,
    code: 'ROUTE_NOT_FOUND',
    message: `Route ${request.method} ${request.path} was not found.`,
  }))
}
