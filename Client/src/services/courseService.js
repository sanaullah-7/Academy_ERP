/**
 * Purpose: Will define course Service for the services area of the Academy frontend.
 * Module: services
 * Status: Planned — functionality not implemented.
 */

import { createCollectionService } from '../mock/mockApi.js'
import { createReferenceService } from './referenceService.js'
export const courseService = { ...createCollectionService('courses'), ...createReferenceService('courses') }
