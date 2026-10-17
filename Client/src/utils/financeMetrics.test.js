import { expect,it } from 'vitest'
import { financeMetrics } from './financeMetrics.js'
it('derives live cards from receipts and posted expenses using Karachi day/month',()=>{
 const data={payments:[{amount:1000,paidAt:'2026-09-30T20:00:00Z',status:'Verified'},{amount:500,paidAt:'2026-09-29T00:00:00Z',status:'Verified'},{amount:999,paidAt:'2026-09-30T20:00:00Z',status:'Pending'}],expenses:[{amount:250,entryDate:'2026-10-01',category:'Rent',status:'Posted'},{amount:100,entryDate:'2026-09-01',category:'Other',status:'Posted'}]}
 expect(financeMetrics(data,new Date('2026-09-30T21:00:00Z'))).toMatchObject({monthLabel:'October',revenue:1000,expenses:250,todayRevenue:1000,todayExpenses:250,net:750,margin:75,todayShare:80,previousNet:400,receipts:1,expenseCount:1,categories:'Rent'})
 expect(financeMetrics(data,new Date('2026-10-01T20:00:00Z')).todayRevenue).toBe(0)
})
it('handles zero revenue, expense-only losses and January rollover honestly',()=>{
 expect(financeMetrics({},new Date('2027-01-01T00:00:00Z'))).toMatchObject({margin:null,previousLabel:'Dec 2026',todayShare:0})
 expect(financeMetrics({expenses:[{amount:10,entryDate:'2027-01-01',category:'Other'}]},new Date('2027-01-01T00:00:00Z'))).toMatchObject({net:-10,margin:null,todayExpenses:10})
})
