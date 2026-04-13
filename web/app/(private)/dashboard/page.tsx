'use client'

import { useDashboard } from '@/hooks/use-dashboard'
import { InstanceStatusCard } from '@/components/dashboard/InstanceStatusCard'
import { UsageLimitsCard } from '@/components/dashboard/UsageLimitsCard'
import { RecentLogsCard } from '@/components/dashboard/RecentLogsCard'
import { MetricsCard } from '@/components/dashboard/MetricsCard'
import { QuickActionsCard } from '@/components/dashboard/QuickActionsCard'
import { AlertCenterCard } from '@/components/dashboard/AlertCenterCard'
import { QuickSendCard } from '@/components/dashboard/QuickSendCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Key, RefreshCw, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const { data, isLoading, isError, error, refetch } = useDashboard()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-4 min-h-[400px]">
        <p className="text-rose-500 font-bold">Erro ao carregar dados do dashboard.</p>
        <p className="text-sm text-foreground/40 font-medium">{(error as any)?.message || 'Erro desconhecido'}</p>
        <Button onClick={() => refetch()} variant="outline" className="border-primary/20 text-primary">Tentar novamente</Button>
      </div>
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
    <div className="p-8">
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2 tracking-tight">Dashboard</h1>
            <p className="text-foreground/40 text-sm font-medium uppercase tracking-widest leading-none">Painel de Controle Principal</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="text-foreground/50 hover:text-primary hover:bg-primary/10 transition-all font-bold text-[10px] uppercase tracking-widest"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Sincronizar
          </Button>
        </div>

        {alerts.length > 0 && <AlertCenterCard alerts={alerts} />}

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

            <Card className="bg-white/[0.02] border-white/5 hover:border-primary/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xs font-semibold text-foreground/50 uppercase tracking-wider flex items-center gap-2">
                  <Key className="h-4 w-4 text-primary" />
                  Gerenciar Acesso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all cursor-pointer" onClick={() => router.push('/dashboard/apikeys')}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                      <Key className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Chaves de API</p>
                      <p className="text-sm text-foreground/40 font-medium">{data.stats.apiKeys} chaves ativas configuradas no sistema.</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (1/3) */}
          <div className="space-y-6">
            <QuickSendCard />

            {/* Webhooks Status Mini Card */}
            <Card className="bg-white/[0.02] border-white/5 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Webhooks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold tracking-tight">{data.metrics.webhooks}</span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${data.metrics.errors === 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                    {data.metrics.errors === 0 ? 'Operacional' : `${data.metrics.errors} Falhas`}
                  </span>
                </div>
                <Button
                  variant="link"
                  className="p-0 h-auto text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-widest flex items-center gap-2 group"
                  onClick={() => router.push('/dashboard/webhooks')}
                >
                  Configurações
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}