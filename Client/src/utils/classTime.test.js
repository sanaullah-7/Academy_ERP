import { expect, it } from 'vitest'
import { classPeriod, classShift, classTimeLabel, formatClassTime } from './classTime.js'
it('formats midnight, noon and saved morning/evening times',()=>{
 expect(formatClassTime('00:00')).toBe('12:00 AM')
 expect(formatClassTime('12:00')).toBe('12:00 PM')
 expect(classTimeLabel('08:00','09:00')).toBe('8:00 AM - 9:00 AM (Morning)')
 expect(classShift('16:00')).toBe('Evening')
 expect(formatClassTime('bad')).toBe('Not configured')
})

it('labels dashboard periods at noon and evening boundaries',()=>{
 expect(classPeriod('08:00')).toBe('Morning')
 expect(classPeriod('11:59')).toBe('Morning')
 expect(classPeriod('12:00')).toBe('Afternoon')
 expect(classPeriod('16:59')).toBe('Afternoon')
 expect(classPeriod('17:00')).toBe('Evening')
 expect(classPeriod(null)).toBe('Time not configured')
})
