'use client'

import { cloneElement, isValidElement, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { HEADERS } from '@/components/Header'
import { AuthProvider } from '@/hooks/useAuth'

interface PrivateLayoutProps {
  children: ReactNode
}

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return null
  }

  if (!session) {
    return null
  }

  const accessToken = (session as unknown as { accessToken: string }).accessToken

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HEADERS.DashboardHeader />
      <AuthProvider accessToken={accessToken}>
        <div className="flex flex-1">
          {children}
        </div>
      </AuthProvider>
    </div>
  )
}