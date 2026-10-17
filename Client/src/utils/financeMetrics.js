export function financeMetrics(data = {}, now = new Date(), timeZone = 'Asia/Karachi', targetMonth = null) {
  const dateKey = value => {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value))
    } catch {
      return String(value).slice(0, 10)
    }
  }
  const clockDate = now instanceof Date ? now : new Date()
  const todayKey = dateKey(clockDate)
  const currentMonthKey = todayKey.slice(0, 7)

  let activeMonth = currentMonthKey
  if (targetMonth && typeof targetMonth === 'string') {
    activeMonth = targetMonth
  }

  const isAllTime = activeMonth === 'all'
  const yearNum = !isAllTime ? Number(activeMonth.slice(0, 4)) : clockDate.getFullYear()
  const monthNum = !isAllTime ? Number(activeMonth.slice(5, 7)) : clockDate.getMonth() + 1
  const monthDate = new Date(Date.UTC(yearNum, monthNum - 1, 15))
  const previousDate = new Date(Date.UTC(yearNum, monthNum - 2, 15))
  const previousMonthKey = dateKey(previousDate).slice(0, 7)

  const payments = (data?.payments || []).filter(item => !item.status || item.status === 'Verified')
  const posted = (data?.expenses || []).filter(item => !item.status || item.status === 'Posted')

  const paymentTotal = key => payments.filter(item => key === '' || dateKey(item.paidAt).startsWith(key)).reduce((sum, item) => sum + item.amount, 0)
  const expenseTotal = key => posted.filter(item => key === '' || item.entryDate.startsWith(key)).reduce((sum, item) => sum + item.amount, 0)

  const revenue = isAllTime ? paymentTotal('') : paymentTotal(activeMonth)
  const expenses = isAllTime ? expenseTotal('') : expenseTotal(activeMonth)
  const todayRevenue = paymentTotal(todayKey)
  const todayExpenses = expenseTotal(todayKey)

  const previousRevenue = isAllTime ? 0 : paymentTotal(previousMonthKey)
  const previousExpenses = isAllTime ? 0 : expenseTotal(previousMonthKey)
  const previousNet = previousRevenue - previousExpenses

  const net = revenue - expenses
  const margin = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : null
  const todayTotal = todayRevenue + todayExpenses
  const todayShare = todayTotal > 0 ? (todayRevenue / todayTotal) * 100 : 0

  const monthReceipts = isAllTime ? payments.length : payments.filter(item => dateKey(item.paidAt).startsWith(activeMonth)).length
  const monthExpenseCount = isAllTime ? posted.length : posted.filter(item => item.entryDate.startsWith(activeMonth)).length

  let comparisonPercent = 0
  if (previousNet !== 0) {
    comparisonPercent = Number((((net - previousNet) / Math.abs(previousNet)) * 100).toFixed(1))
  } else if (net > 0) {
    comparisonPercent = 100
  }

  const monthLabel = isAllTime ? 'All-Time' : new Intl.DateTimeFormat('en', { month: 'long', timeZone }).format(monthDate)
  const previousLabel = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone }).format(previousDate)
  const activeMonthCategories = [...new Set(posted.filter(item => isAllTime || item.entryDate.startsWith(activeMonth)).map(item => item.category))].join(', ')

  return {
    revenue,
    expenses,
    todayRevenue,
    todayExpenses,
    net,
    margin,
    todayShare,
    receipts: monthReceipts,
    expenseCount: monthExpenseCount,
    previousNet,
    comparisonPercent,
    monthLabel,
    previousLabel,
    activeMonth,
    categories: activeMonthCategories,
  }
}
