import { create } from 'zustand'
import { TOKEN_KEY } from '../api/client'
import type { User } from '../types'

const USER_KEY = 'preproute_user'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  setAuth: (token: string, user: User) => void
  logout: () => void
}

function getStoredUser(): User | null {
  const value = localStorage.getItem(USER_KEY)
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as User
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set) => {
  const token = localStorage.getItem(TOKEN_KEY)
  const user = getStoredUser()

  return {
    token,
    user,
    isAuthenticated: Boolean(token),
    setAuth: (nextToken, nextUser) => {
      localStorage.setItem(TOKEN_KEY, nextToken)
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
      set({ token: nextToken, user: nextUser, isAuthenticated: true })
    },
    logout: () => {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      set({ token: null, user: null, isAuthenticated: false })
    },
  }
})
