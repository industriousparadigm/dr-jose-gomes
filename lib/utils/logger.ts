// Development logger with colored output
const isDev = process.env.NODE_ENV === 'development'

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

export const logger = {
  info: (component: string, message: string, data?: any) => {
    if (!isDev) return
    const timestamp = new Date().toISOString()
    console.log(
      `${colors.cyan}[${timestamp}]${colors.reset} ${colors.blue}[${component}]${colors.reset} ${message}`,
      data ? data : ''
    )
  },

  success: (component: string, message: string, data?: any) => {
    if (!isDev) return
    const timestamp = new Date().toISOString()
    console.log(
      `${colors.cyan}[${timestamp}]${colors.reset} ${colors.green}✓ [${component}]${colors.reset} ${message}`,
      data ? data : ''
    )
  },

  warn: (component: string, message: string, data?: any) => {
    if (!isDev) return
    const timestamp = new Date().toISOString()
    console.warn(
      `${colors.cyan}[${timestamp}]${colors.reset} ${colors.yellow}⚠ [${component}]${colors.reset} ${message}`,
      data ? data : ''
    )
  },

  error: (component: string, message: string, error?: any) => {
    const timestamp = new Date().toISOString()
    console.error(
      `${colors.cyan}[${timestamp}]${colors.reset} ${colors.red}✗ [${component}]${colors.reset} ${message}`,
      error ? error : ''
    )

    // Also log to a future error tracking service
    if (typeof window !== 'undefined' && error) {
      // Could send to Sentry, LogRocket, etc.
      console.error('Stack trace:', error.stack)
    }
  },

  api: (method: string, url: string, data?: any) => {
    if (!isDev) return
    const timestamp = new Date().toISOString()
    console.log(
      `${colors.cyan}[${timestamp}]${colors.reset} ${colors.magenta}[API ${method}]${colors.reset} ${url}`,
      data ? data : ''
    )
  },

  db: (operation: string, table: string, data?: any) => {
    if (!isDev) return
    const timestamp = new Date().toISOString()
    console.log(
      `${colors.cyan}[${timestamp}]${colors.reset} ${colors.yellow}[DB ${operation}]${colors.reset} ${table}`,
      data ? data : ''
    )
  },

  performance: (component: string, operation: string, duration: number) => {
    if (!isDev) return
    const timestamp = new Date().toISOString()
    const color = duration > 1000 ? colors.red : duration > 500 ? colors.yellow : colors.green
    console.log(
      `${colors.cyan}[${timestamp}]${colors.reset} ${color}[PERF]${colors.reset} ${component}.${operation} took ${duration}ms`
    )
  },
}

// Browser-safe version for client components
export const clientLogger = {
  info: (component: string, message: string, data?: any) => {
    if (!isDev || typeof window === 'undefined') return
    console.log(`[${component}] ${message}`, data || '')
  },

  success: (component: string, message: string, data?: any) => {
    if (!isDev || typeof window === 'undefined') return
    console.log(`✓ [${component}] ${message}`, data || '')
  },

  warn: (component: string, message: string, data?: any) => {
    if (!isDev || typeof window === 'undefined') return
    console.warn(`⚠ [${component}] ${message}`, data || '')
  },

  error: (component: string, message: string, error?: any) => {
    if (typeof window === 'undefined') return
    console.error(`✗ [${component}] ${message}`, error || '')
  },

  click: (component: string, element: string, data?: any) => {
    if (!isDev || typeof window === 'undefined') return
    console.log(`🖱️ [${component}] Clicked: ${element}`, data || '')
  },

  render: (component: string, props?: any) => {
    if (!isDev || typeof window === 'undefined') return
    console.log(`🎨 [${component}] Rendering`, props || '')
  },
}
