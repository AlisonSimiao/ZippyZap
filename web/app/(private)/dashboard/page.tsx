'use client'

import { Sidebar } from '@/components/Sidebar'
import { useDashboard } from '@/hooks/use-dashboard'
import { InstanceStatusCard } from '@/components/dashboard/InstanceStatusCard'
import { UsageLimitsCard } from '@/components/dashboard/UsageLimitsCard'
import { RecentLogsCard } from '@/components/dashboard/RecentLogsCard'
import { MetricsCard } from '@/components/dashboard/MetricsCard'
import { QuickActionsCard } from '@/components/dashboard/QuickActionsCard'
import { AlertCenterCard } from '@/components/dashboard/AlertCenterCard'
import { QuickSendCard } from '@/components/dashboard/QuickSendCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Key, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const { data, isLoading, isError, error, refetch } = useDashboard()
  const router = useRouter()

  if (isLoading) {
    return (
      <>
        <Sidebar activeTab="dashboard" setActiveTab={() => { }} />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </>
    )
  }

  if (isError || !data) {
    return (
      <>
        <Sidebar activeTab="dashboard" setActiveTab={() => { }} />
        <div className="flex-1 p-8 flex flex-col items-center justify-center gap-4">
          <p className="text-red-500">Erro ao carregar dados do dashboard.</p>
          <p className="text-sm text-gray-500">{(error as any)?.message || 'Erro desconhecido'}</p>
          <Button onClick={() => refetch()}>Tentar novamente</Button>
        </div>
      </>
    )
  }

  // Generate alerts based on data
  const alerts: { type: 'warning' | 'info' | 'error', message: string }[] = []

  if (data.stats.instanceStatus !== 'connected') {
    alerts.push({ type: 'error', message: 'Sua instância está desconectada. Conecte-se para enviar mensagens.' })
  }

  if (data.usage.percentage > 90) {
    alerts.push({ type: 'warning', message: 'Limite de mensagens quase atingido.' })
  }

  if (data.metrics.errors > 5) {
    alerts.push({ type: 'warning', message: 'Muitos erros de webhook detectados hoje.' })
  }

  return (
    <>
      <Sidebar activeTab="dashboard" setActiveTab={() => { }} />

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="space-y-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
              <p className="text-gray-600">Visão geral da sua conta e atividades</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>

          <AlertCenterCard alerts={alerts} />

          {/* Top Row: Status, Limits, Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InstanceStatusCard status={data.stats.instanceStatus} />
            <UsageLimitsCard
              current={data.usage.current}
              limit={data.usage.limit}
              percentage={data.usage.percentage}
            />
            <QuickActionsCard />
          </div>

          {/* Metrics Row */}
          <MetricsCard metrics={data.metrics} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              <RecentLogsCard logs={data.recentActivity} />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Chaves de API
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Chaves Ativas</p>
                      <p className="text-sm text-gray-500">{data.stats.apiKeys} chaves configuradas</p>
                    </div>
                    <Button variant="outline" onClick={() => router.push('/dashboard/apikeys')}>
                      Gerenciar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column (1/3) */}
            <div className="space-y-6">
              <QuickSendCard />

              {/* Webhooks Status Mini Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Webhooks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">{data.metrics.webhooks}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${data.metrics.errors === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                      {data.metrics.errors === 0 ? 'Operacional' : `${data.metrics.errors} Falhas`}
                    </span>
                  </div>
                  <Button variant="link" className="p-0 h-auto text-sm" onClick={() => router.push('/dashboard/webhooks')}>
                    Ver configurações &rarr;
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}