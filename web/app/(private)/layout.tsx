'use client'

import { cloneElement, isValidElement, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { HEADERS } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
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
    <AuthProvider accessToken={accessToken}>
      <div className="flex h-screen bg-background overflow-hidden w-full">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <HEADERS.DashboardHeader />
          <main className="flex-1 overflow-y-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  )
}