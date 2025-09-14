// contexts/AuthContext.tsx
'use client'

import { createContext, useContext, ReactNode } from 'react'

interface AuthContextType {
  accessToken: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
  accessToken: string
}

export const AuthProvider = ({ children, accessToken }: AuthProviderProps) => {
  return (
    <AuthContext.Provider value={{ accessToken }}>
      {children}
    </AuthContext.Provider>
  )
}
