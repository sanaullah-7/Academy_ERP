/**
 * Purpose: Will define batch Service for the services area of the Academy frontend.
 * Module: services
 * Status: Planned — functionality not implemented.
 */

import { createReferenceService } from './referenceService.js'
const references = createReferenceService('batches')
export const batchService = {
  async list({ branchId, courseId } = {}) {
    const batches = await references.list({ branchId })
    return courseId == null ? batches : batches.filter(batch => batch.courseId === courseId)
  },
  getById: references.getById,
}
