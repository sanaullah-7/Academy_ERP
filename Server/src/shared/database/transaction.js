import { AppError } from '../errors/AppError.js'
import { ERROR_CODES } from '../../constants/errorCodes.js'

export const MAX_TRANSACTION_RETRIES = 3
export const MAX_COMMIT_RETRIES = 3

/**
 * Executes a business operation within a managed MongoDB transaction.
 * 
 * Safety Rules:
 * 1. Fails closed: Never silently executes outside an actual transaction if MongoDB lacks replica set support.
 * 2. Transient retry: Retries on TransientTransactionError by aborting and restarting.
 * 3. Commit uncertainty: Retries commitTransaction on UnknownTransactionCommitResult without re-running the operation.
 * 4. Resource cleanup: Guarantees session is always ended in finally.
 * 
 * @param {import('mongoose').Connection} connection - Mongoose connection instance
 * @param {Function} operationFn - Function receiving (session) and returning a promise
 * @param {Object} options
 * @param {number} [options.maxRetries=3] - Maximum retry attempts for transient operational errors
 * @param {number} [options.maxCommitRetries=3] - Maximum retry attempts for uncertain commit results
 * @returns {Promise<*>}
 */
export async function withTransaction(
  connection,
  operationFn,
  {
    maxRetries = MAX_TRANSACTION_RETRIES,
    maxCommitRetries = MAX_COMMIT_RETRIES,
  } = {}
) {
  if (!connection || typeof connection.startSession !== 'function') {
    throw new AppError({
      statusCode: 500,
      code: ERROR_CODES.TRANSACTION_FAILED,
      message: 'Database connection does not support session management.',
    })
  }

  let attempt = 0
  while (attempt < maxRetries) {
    attempt += 1
    let session = null

    try {
      session = await connection.startSession()
    } catch (sessionErr) {
      // Fail closed: Do NOT execute without a transaction.
      if (sessionErr.message?.includes('replica set') || sessionErr.code === 20) {
        throw new AppError({
          statusCode: 500,
          code: ERROR_CODES.TRANSACTION_FAILED,
          message:
            'MongoDB deployment does not support multi-document transactions (replica set is required). Multi-record operation aborted to prevent non-atomic partial writes.',
        })
      }
      throw sessionErr
    }

    try {
      try {
        session.startTransaction({
          readConcern: { level: 'snapshot' },
          writeConcern: { w: 'majority' },
        })
      } catch (startErr) {
        // Fail closed if starting transaction fails due to standalone deployment
        if (startErr.message?.includes('replica set') || startErr.code === 20) {
          throw new AppError({
            statusCode: 500,
            code: ERROR_CODES.TRANSACTION_FAILED,
            message:
              'MongoDB deployment does not support multi-document transactions (replica set is required). Multi-record operation aborted to prevent non-atomic partial writes.',
          })
        }
        throw startErr
      }

      // Execute business operation with transaction session
      const result = await operationFn(session)

      // Commit handling with dedicated retry for UnknownTransactionCommitResult
      let commitAttempt = 0
      while (commitAttempt < maxCommitRetries) {
        commitAttempt += 1
        try {
          await session.commitTransaction()
          return result
        } catch (commitErr) {
          if (
            commitErr.hasErrorLabel?.('UnknownTransactionCommitResult') &&
            commitAttempt < maxCommitRetries
          ) {
            // Transient commit failure: retry commitTransaction on the SAME session
            continue
          }

          // If commit result remains uncertain, abort blind retries to prevent duplicate business writes
          if (commitErr.hasErrorLabel?.('UnknownTransactionCommitResult')) {
            throw new AppError({
              statusCode: 500,
              code: ERROR_CODES.TRANSACTION_UNCERTAIN,
              message:
                'Transaction commit result is uncertain. Operation cannot be safely retried automatically.',
            })
          }

          throw commitErr
        }
      }

      return result
    } catch (err) {
      if (session?.inTransaction?.()) {
        try {
          await session.abortTransaction()
        } catch {
          // Ignore abort errors
        }
      }

      // Standalone MongoDB error during execution: fail closed
      if (err.message?.includes('replica set') || err.code === 20) {
        throw new AppError({
          statusCode: 500,
          code: ERROR_CODES.TRANSACTION_FAILED,
          message:
            'MongoDB deployment does not support multi-document transactions (replica set is required). Multi-record operation aborted to prevent non-atomic partial writes.',
        })
      }

      // TransientTransactionError during operation (e.g. WriteConflict before commit): retry entire transaction
      const isTransientOperation =
        err.hasErrorLabel?.('TransientTransactionError') ||
        err.message?.includes('WriteConflict')

      if (isTransientOperation && attempt < maxRetries) {
        continue
      }

      throw err
    } finally {
      if (session) {
        try {
          await session.endSession()
        } catch {
          // Ignore endSession errors
        }
      }
    }
  }

  throw new AppError({
    statusCode: 500,
    code: ERROR_CODES.TRANSACTION_FAILED,
    message: 'Transaction failed after maximum retry attempts.',
  })
}
