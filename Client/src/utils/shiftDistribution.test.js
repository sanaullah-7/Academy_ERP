import { expect, it } from 'vitest'
import { shiftDistribution } from './shiftDistribution.js'

const batch={id:'b',courseId:'c',enrolledCount:5,capacity:10}
const academic={courses:[{id:'c'}],subjects:[{id:'s',name:'Biology'}],batches:[batch]}
const assignment={id:'a',branchId:'branch',teacherId:'t',courseId:'c',batchId:'b',subjectId:'s',days:['Mon','Sat'],startTime:'09:00',endTime:'10:00'}
const monday=new Date('2026-10-19T04:00:00Z')
it('uses actual unique batch seat capacity even with multiple lectures',()=>{
 const [morning]=shiftDistribution({assignments:[assignment,{...assignment,id:'a2',startTime:'10:00',endTime:'11:00'}],academic,branchId:'branch',now:monday})
 expect(morning).toMatchObject({lectures:2,batches:1,percentage:50,enrolled:5,capacity:10})
})
it('does not invent capacity and respects empty branch/day states',()=>{
 expect(shiftDistribution({assignments:[assignment],academic:{...academic,batches:[{...batch,capacity:undefined}]},branchId:'branch',now:monday})[0].percentage).toBeNull()
 expect(shiftDistribution({assignments:[assignment],academic,branchId:'other',now:monday}).every(s=>s.percentage===0&&s.lectures===0)).toBe(true)
})
it('uses weekend sessions and updates on day rollover',()=>{
 expect(shiftDistribution({assignments:[assignment],academic,branchId:'branch',now:new Date('2026-10-17T04:00:00Z')})[2].lectures).toBe(1)
 expect(shiftDistribution({assignments:[assignment],academic,branchId:'branch',now:new Date('2026-10-19T19:01:00Z')}).every(s=>s.lectures===0)).toBe(true)
})

it('calculates live elapsed scheduled minutes without inventing completion',()=>{
 const get=now=>shiftDistribution({assignments:[assignment],academic,branchId:'branch',now:new Date(now)})[0]
 expect(get('2026-10-19T03:00:00Z').progress).toBe(0)
 expect(get('2026-10-19T04:30:00Z').progress).toBe(50)
 expect(get('2026-10-19T05:00:00Z').progress).toBe(100)
 expect(get('2026-10-19T04:30:00Z').time).toContain('9:00 AM')
})

it('keeps weekend morning/evening shifts visible as well as weekend summary',()=>{
 const cards=shiftDistribution({assignments:[assignment,{...assignment,id:'pm',startTime:'15:00',endTime:'16:00'}],academic,branchId:'branch',now:new Date('2026-10-17T10:30:00Z')})
 expect(cards.map(card=>card.lectures)).toEqual([1,1,2])
 expect(cards[0].progress).toBe(100)
 expect(cards[1].progress).toBe(50)
})
