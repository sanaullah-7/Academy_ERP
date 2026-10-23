import { AppError } from '../../shared/errors/AppError.js'
import { ERROR_CODES } from '../../constants/errorCodes.js'

export function assertBranchCreationAllowed() {
  // Branch creation remains paused for all roles by current owner instruction
  throw new AppError({
    statusCode: 403,
    code: ERROR_CODES.BRANCH_CREATION_PAUSED,
    message: 'Branch creation is currently paused by policy.',
  })
}
