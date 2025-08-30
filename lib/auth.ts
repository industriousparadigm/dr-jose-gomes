import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export interface SessionData {
  isLoggedIn: boolean
  username?: string
  isAdmin?: boolean
}

export const sessionOptions = {
  password: process.env.SESSION_SECRET || 'complex-password-at-least-32-characters-long',
  cookieName: 'jose-gomes-admin-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 1 week
  },
}

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

// Simple admin credentials - in production, use database
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync('admin123', 10)

export async function verifyCredentials(username: string, password: string) {
  if (username !== ADMIN_USERNAME) {
    return false
  }
  
  return bcrypt.compare(password, ADMIN_PASSWORD_HASH)
}

export async function isAuthenticated() {
  const session = await getSession()
  return session.isLoggedIn === true && session.isAdmin === true
}