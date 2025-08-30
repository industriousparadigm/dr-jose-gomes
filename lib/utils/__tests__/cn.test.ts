/**
 * @jest-environment jsdom
 */
import { cn } from '../cn'

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional')
  })

  it('should handle objects', () => {
    expect(cn({
      'active': true,
      'inactive': false,
      'base': true
    })).toBe('active base')
  })

  it('should handle arrays', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2')
  })

  it('should merge conflicting Tailwind classes', () => {
    // twMerge should handle conflicting classes
    expect(cn('p-4', 'p-6')).toBe('p-6')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('should handle undefined and null values', () => {
    expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2')
  })

  it('should handle empty strings', () => {
    expect(cn('', 'class1', '')).toBe('class1')
  })

  it('should handle complex combinations', () => {
    const result = cn(
      'base-class',
      {
        'conditional-class': true,
        'hidden-class': false
      },
      ['array-class1', 'array-class2'],
      'final-class'
    )
    expect(result).toBe('base-class conditional-class array-class1 array-class2 final-class')
  })

  it('should handle Tailwind responsive classes', () => {
    expect(cn('block', 'md:hidden', 'lg:block')).toBe('block md:hidden lg:block')
  })

  it('should handle Tailwind hover and focus states', () => {
    expect(cn('bg-blue-500', 'hover:bg-blue-600', 'focus:ring-2')).toBe('bg-blue-500 hover:bg-blue-600 focus:ring-2')
  })
})