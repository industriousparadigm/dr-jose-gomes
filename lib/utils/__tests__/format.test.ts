/**
 * @jest-environment jsdom
 */
import { formatCurrency, formatCurrencyPT, formatPercentage } from '../format'

describe('formatCurrency', () => {
  it('should format USD currency correctly', () => {
    expect(formatCurrency(100, 'USD')).toBe('$100')
    expect(formatCurrency(1000, 'USD')).toBe('$1,000')
    expect(formatCurrency(0, 'USD')).toBe('$0')
  })

  it('should handle decimal amounts by rounding', () => {
    expect(formatCurrency(99.99, 'USD')).toBe('$100')
    expect(formatCurrency(99.49, 'USD')).toBe('$99')
  })

  it('should default to USD when no currency provided', () => {
    expect(formatCurrency(50)).toBe('$50')
  })

  it('should handle different currencies', () => {
    expect(formatCurrency(100, 'EUR')).toBe('€100')
    expect(formatCurrency(100, 'GBP')).toBe('£100')
  })

  it('should handle large amounts', () => {
    expect(formatCurrency(1000000, 'USD')).toBe('$1,000,000')
  })

  it('should handle negative amounts', () => {
    expect(formatCurrency(-50, 'USD')).toBe('-$50')
  })
})

describe('formatCurrencyPT', () => {
  it('should format BRL currency correctly', () => {
    expect(formatCurrencyPT(100, 'BRL')).toMatch(/R\$\s*100/)
    expect(formatCurrencyPT(1000, 'BRL')).toMatch(/R\$\s*1\.000/)
  })

  it('should default to BRL when no currency provided', () => {
    expect(formatCurrencyPT(50)).toMatch(/R\$\s*50/)
  })

  it('should handle decimal amounts by rounding', () => {
    expect(formatCurrencyPT(99.99, 'BRL')).toMatch(/R\$\s*100/)
    expect(formatCurrencyPT(99.49, 'BRL')).toMatch(/R\$\s*99/)
  })

  it('should handle different currencies with PT locale', () => {
    expect(formatCurrencyPT(100, 'EUR')).toMatch(/€\s*100/)
  })

  it('should handle zero amounts', () => {
    expect(formatCurrencyPT(0, 'BRL')).toMatch(/R\$\s*0/)
  })
})

describe('formatPercentage', () => {
  it('should calculate percentage correctly', () => {
    expect(formatPercentage(50, 100)).toBe(50)
    expect(formatPercentage(75, 100)).toBe(75)
    expect(formatPercentage(100, 100)).toBe(100)
  })

  it('should handle amounts over goal', () => {
    expect(formatPercentage(150, 100)).toBe(100) // Should cap at 100%
    expect(formatPercentage(200, 100)).toBe(100)
  })

  it('should handle zero goal', () => {
    expect(formatPercentage(50, 0)).toBe(0)
  })

  it('should handle zero current amount', () => {
    expect(formatPercentage(0, 100)).toBe(0)
  })

  it('should handle decimal percentages by rounding', () => {
    expect(formatPercentage(33, 100)).toBe(33)
    expect(formatPercentage(33.4, 100)).toBe(33)
    expect(formatPercentage(33.6, 100)).toBe(34)
  })

  it('should handle partial percentages', () => {
    expect(formatPercentage(25, 1000)).toBe(3) // 2.5% rounds to 3%
    expect(formatPercentage(125, 1000)).toBe(13) // 12.5% rounds to 13%
  })
})