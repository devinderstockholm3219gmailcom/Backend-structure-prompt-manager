import type { User } from '../types'

export const setToken  = (t: string) => localStorage.setItem('access_token', t)
export const getToken  = ()           => localStorage.getItem('access_token')
export const clearToken= ()           => localStorage.removeItem('access_token')

export const setUser   = (u: User)    => localStorage.setItem('user', JSON.stringify(u))
export const getUser   = (): User | null => {
  try { return JSON.parse(localStorage.getItem('user') ?? 'null') }
  catch { return null }
}
export const clearUser = () => localStorage.removeItem('user')

export const isLoggedIn = () => !!getToken()

export function logout() {
  clearToken()
  clearUser()
  window.location.href = '/login'
}