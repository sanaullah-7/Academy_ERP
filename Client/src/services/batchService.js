/**
 * Purpose: Will define batch Service for the services area of the Academy frontend.
 * Module: services
 * Status: Planned — functionality not implemented.
 */

import { academicService } from './academicService.js'
export const batchService = {
  async list({ branchId, courseId } = {}) {
    const batches = (await academicService.overview({ branchId })).batches
    return courseId == null ? batches : batches.filter(batch => batch.courseId === courseId)
  },
  getById: academicService.getBatch,
  create: (record, query) => academicService.saveBatch(undefined, record, query),
  update: academicService.saveBatch,
}
