/**
 * Purpose: Will define course Service for the services area of the Academy frontend.
 * Module: services
 * Status: Planned — functionality not implemented.
 */

import { academicService } from './academicService.js'

export const courseService = {
  list: async query => (await academicService.overview(query)).courses,
  getById: academicService.getCourse,
  create: (record, query) => academicService.saveCourse(undefined, record, query),
  update: academicService.saveCourse,
  delete: academicService.deleteCourse,
}
