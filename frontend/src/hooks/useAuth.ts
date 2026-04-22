import { useState } from 'react'
import { api } from '@lib/axios'
import { setToken, setUser, logout as doLogout } from '@lib/auth'
import axios from 'axios'
import type { AuthResponse } from '../types'

// ── Helper ────────────────────────────────────────────────────────────────────
// axios.isAxiosError() narrows 'unknown' to AxiosError
// so we can safely read e.response?.data?.message (the backend error message)
// e.g. "Email already exists" or "Invalid credentials"
// Without this, you'd only see generic JS error messages
function getErrorMessage(e: unknown, fallback: string): string {
  if (axios.isAxiosError(e)) return e.response?.data?.message ?? fallback
  if (e instanceof Error)    return e.message
  return fallback
}

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function login(email: string, password: string): Promise<boolean> {
    setLoading(true); setError(null)
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
      setToken(data.data.tokens.accessToken)
      setUser(data.data.user)
      return true
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Login failed'))
      return false
    } finally { setLoading(false) }
  }

  async function register(username: string, email: string, password: string): Promise<boolean> {
    setLoading(true); setError(null)
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', { username, email, password })
      setToken(data.data.tokens.accessToken)
      setUser(data.data.user)
      return true
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Registration failed'))
      const msg = getErrorMessage(e, 'Registration failed')
      console.log('ERROR MESSAGE:', msg)
      return false
    } finally { setLoading(false) }
  }

  return { login, register, loading, error, logout: doLogout }
}