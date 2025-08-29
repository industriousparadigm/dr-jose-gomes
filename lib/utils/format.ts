export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  
  return formatter.format(amount)
}

export function formatCurrencyPT(amount: number, currency: string = 'BRL'): string {
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  
  return formatter.format(amount)
}

export function formatPercentage(current: number, goal: number): number {
  if (goal === 0) return 0
  const percentage = (current / goal) * 100
  return Math.min(Math.round(percentage), 100)
}