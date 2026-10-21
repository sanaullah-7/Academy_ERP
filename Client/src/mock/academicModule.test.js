import { beforeEach, describe, expect, it } from 'vitest'
import { createMockDatabase } from './mockDatabase.js'
import { MOCK_DATABASE_KEY, MOCK_SESSION_KEY } from '../constants/storageKeys.js'

const north = { branchId: 'demo-north' }
const central = { branchId: 'demo-central' }
const session = (userId, branchId) => localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ version: 1, userId, branchId }))

describe('F04 Courses & Batches storage boundary', () => {
  beforeEach(() => localStorage.removeItem(MOCK_DATABASE_KEY))
  it('lets an active-branch Super Admin create and edit immutable course/batch IDs', () => {
    session('demo-admin', north.branchId)
    const db = createMockDatabase({ makeId: (() => { const ids = ['course-new', 'batch-new']; return () => ids.shift() })() })
    const course = db.academicOperation('save', { entity: 'course', record: { name: 'DEMO Robotics' }, query: north })
    const batch = db.academicOperation('save', { entity: 'batch', record: { name: 'DEMO Morning', courseId: course.id }, query: north })
    expect(db.academicOperation('save', { entity: 'course', id: course.id, record: { name: 'DEMO Robotics Plus' }, query: north })).toMatchObject({ id: course.id, name: 'DEMO Robotics Plus' })
    expect(db.academicOperation('save', { entity: 'batch', id: batch.id, record: { name: 'DEMO Morning A', courseId: course.id }, query: north })).toMatchObject({ id: batch.id, courseId: course.id })
    expect(JSON.parse(localStorage.getItem(MOCK_DATABASE_KEY)).courses.some(item => item.id === course.id)).toBe(true)
  })
  it('rejects duplicate and cross-branch references without changing saved bytes', () => {
    session('demo-admin', north.branchId)
    const db = createMockDatabase()
    const overview = db.academicOperation('overview', { query: north })
    const before = localStorage.getItem(MOCK_DATABASE_KEY)
    expect(() => db.academicOperation('save', { entity: 'course', record: { name: overview.courses[0].name.toUpperCase() }, query: north })).toThrow(expect.objectContaining({ code: 'DUPLICATE_RECORD' }))
    expect(() => db.academicOperation('save', { entity: 'batch', record: { name: 'Bad', courseId: 'course-demo-2' }, query: north })).toThrow(expect.objectContaining({ code: 'INVALID_REFERENCE' }))
    expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(before)
  })
  it.each([['demo-reception', north], ['demo-owner', central]])('%s can view but cannot manage', (userId, query) => {
    session(userId, query.branchId)
    const db = createMockDatabase()
    expect(db.academicOperation('overview', { query }).courses.length).toBeGreaterThan(0)
    expect(() => db.academicOperation('save', { entity: 'course', record: { name: 'Denied' }, query })).toThrow(expect.objectContaining({ code: 'DEMO_ACTION_DENIED' }))
  })
  it('denies Teacher, wrong branch and missing session', () => {
    const db = createMockDatabase()
    session('demo-teacher', central.branchId)
    expect(() => db.academicOperation('overview', { query: central })).toThrow(expect.objectContaining({ code: 'DEMO_ACTION_DENIED' }))
    session('demo-admin', north.branchId)
    expect(() => db.academicOperation('overview', { query: central })).toThrow(expect.objectContaining({ code: 'INVALID_SCOPE' }))
    localStorage.removeItem(MOCK_SESSION_KEY)
    expect(() => db.academicOperation('overview', { query: north })).toThrow(expect.objectContaining({ code: 'INVALID_SCOPE' }))
  })
  it('reports actual enrollment totals and honest absent operational configuration', () => {
    session('demo-admin', north.branchId)
    const db = createMockDatabase()
    const result = db.academicOperation('overview', { query: north })
    expect(result.batches[0]).toMatchObject({ enrolledCount: expect.any(Number), capacity: null, remainingSeats: null, teachers: [], timetable: [] })
    expect(result.courses[0]).toMatchObject({ batchCount: expect.any(Number), enrolledCount: expect.any(Number), category: 'Not configured' })
  })
})


it('scopes duplicate batch names to branch and course, including updates and shift validation', () => {
 session('demo-admin', north.branchId)
 const db=createMockDatabase()
 const a=db.academicOperation('save',{entity:'course',record:{name:'Shift Course A'},query:north})
 const b=db.academicOperation('save',{entity:'course',record:{name:'Shift Course B'},query:north})
 const save=(id,record)=>db.academicOperation('save',{entity:'batch',id,record,query:north})
 const first=save(null,{name:'Batch 1',courseId:a.id,shift:'Morning'})
 const second=save(null,{name:'Batch 1',courseId:b.id,shift:'Evening'})
 expect(second).toMatchObject({name:'Batch 1',courseId:b.id,shift:'Evening'})
 const before=localStorage.getItem(MOCK_DATABASE_KEY)
 expect(()=>save(null,{name:'  BATCH 1  ',courseId:a.id,shift:'Evening'})).toThrow(expect.objectContaining({code:'DUPLICATE_RECORD'}))
 expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(before)
 expect(()=>save(second.id,{name:'Batch 1',courseId:a.id})).toThrow(expect.objectContaining({code:'DUPLICATE_RECORD'}))
 expect(save(first.id,{name:'Batch 1',courseId:a.id,shift:null})).toMatchObject({id:first.id,shift:null})
 expect(()=>save(null,{name:'Night',courseId:a.id,shift:'Night'})).toThrow(expect.objectContaining({code:'INVALID_RECORD'}))
 expect(save(null,{name:'No Shift',courseId:a.id}).shift).toBeUndefined()
 const legacy=save(null,{name:'Legacy',courseId:a.id,startTime:'08:00',endTime:'09:00'})
 expect(save(legacy.id,{name:'Legacy',courseId:a.id,shift:'Morning'})).toMatchObject({shift:'Morning',startTime:'08:00',endTime:'09:00'})
 expect(createMockDatabase().academicOperation('get',{entity:'batch',id:second.id,query:north})).toMatchObject({shift:'Evening'})
})

it('persists optional month duration and rejects invalid values without changing saved records',()=>{
 session('demo-admin',north.branchId)
 const db=createMockDatabase()
 const course=db.academicOperation('overview',{query:north}).courses[0]
 const save=(id,record)=>db.academicOperation('save',{entity:'batch',id,record:{name:'Duration Batch',courseId:course.id,...record},query:north})
 const batch=save(null,{name:'Duration Batch',courseId:course.id,durationMonths:1})
 expect(createMockDatabase().academicOperation('get',{entity:'batch',id:batch.id,query:north}).durationMonths).toBe(1)
 expect(save(batch.id,{durationMonths:3}).durationMonths).toBe(3)
 for(const durationMonths of [0,-1,1.5,'2']){
  const before=localStorage.getItem(MOCK_DATABASE_KEY)
  expect(()=>save(batch.id,{durationMonths})).toThrow(expect.objectContaining({code:'INVALID_RECORD'}))
  expect(localStorage.getItem(MOCK_DATABASE_KEY)).toBe(before)
 }
 expect(save(batch.id,{durationMonths:null}).durationMonths).toBeNull()
})
