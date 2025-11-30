import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api'

export interface DashboardData {
    stats: {
        apiKeys: number
        messagesToday: number
        planLimit: number
        instanceStatus: string
    }
    usage: {
        current: number
        limit: number
        percentage: number
    }
    recentActivity: {
        type: 'message' | 'webhook'
        action: string
        time: string
        status: 'success' | 'error'
        details: string
    }[]
    metrics: {
        sent: number
        received: number
        webhooks: number
        errors: number
    }
}

export function useDashboard() {
    const { data: session } = useSession()
    const accessToken = (session as unknown as { accessToken: string })?.accessToken

    return useQuery({
        queryKey: ['dashboard-overview'],
        queryFn: async () => {
            if (!accessToken) {
                throw new Error('No access token available')
            }
            return await api.getDashboardOverview(accessToken)
        },
        enabled: !!accessToken,
        refetchInterval: 30000, // Refresh every 30 seconds
    })
}
