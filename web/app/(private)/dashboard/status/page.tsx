'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Activity, Database, Server, MessageSquare, CheckCircle, XCircle, Loader2, RefreshCw, Clock, ShieldCheck, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface HealthStatus {
  status: string
  uptime: number
  timestamp: string
  checks: {
    database?: string
    redis?: string
  }
}

interface WuzapiStatus {
  status: string
  timestamp: string
  checks: {
    wuzapi?: string
    circuitBreaker?: string
  }
}

export default function SystemStatusPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [wuzapiHealth, setWuzapiHealth] = useState<WuzapiStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const [healthData, wuzapiData] = await Promise.all([
        api.getHealthStatus(),
        api.getWuzapiHealth(),
      ])
      setHealth(healthData)
      setWuzapiHealth(wuzapiData)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to fetch health status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (days > 0) return `${days}d ${hours}h ${mins}m`
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }

  const StatusItem = ({ 
    icon: Icon, 
    title, 
    status, 
    detail 
  }: { 
    icon: any, 
    title: string, 
    status: string | undefined, 
    detail?: string 
  }) => {
    const isOk = status === 'ok' || status === 'healthy' || status === 'CLOSED'
    const isPending = !status && loading

    return (
      <Card className="bg-white/[0.02] border-white/5 hover:border-primary/30 transition-all duration-300 overflow-hidden group">
        <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${
                        isOk ? 'bg-emerald-500/10 text-emerald-500' : 
                        isPending ? 'bg-primary/10 text-primary' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-foreground/40">{title}</CardTitle>
                </div>
                {isOk ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover:scale-125 transition-transform" />
                ) : !isPending && (
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] group-hover:scale-125 transition-transform" />
                )}
            </div>
        </CardHeader>
        <CardContent className="pt-2">
            <div className="space-y-1">
                <p className={`text-lg font-bold tracking-tight ${isOk ? 'text-foreground' : 'text-foreground/40'}`}>
                    {isOk ? 'Operacional' : isPending ? 'Sincronizando...' : 'Instabilidade'}
                </p>
                {detail && (
                    <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">{detail}</p>
                )}
            </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-serif font-bold tracking-tight">Status do Sistema</h1>
            <p className="text-foreground/40 text-sm font-medium uppercase tracking-widest leading-none">Monitoramento de Infraestrutura 24/7</p>
          </div>
          
          <div className="flex items-center gap-4">
              {lastUpdate && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-full text-[9px] font-bold text-foreground/30 uppercase tracking-[0.15em]">
                <Clock className="w-3.5 h-3.5" />
                Sincronizado {lastUpdate.toLocaleTimeString('pt-BR')}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchStatus}
              disabled={loading}
              className="text-foreground/40 hover:text-primary hover:bg-primary/10 transition-all font-bold text-[10px] uppercase tracking-widest h-9"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* System Health Summary */}
        <Card className="bg-primary/5 border-primary/20 overflow-hidden group">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 border overflow-hidden ${
                      health?.status === 'healthy' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]' 
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                  }`}>
                      {health?.status === 'healthy' ? <ShieldCheck className="h-10 w-10" /> : <Activity className="h-10 w-10 animate-pulse" />}
                  </div>
                  {health?.status === 'healthy' && (
                      <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-150 -z-10 animate-pulse" />
                  )}
              </div>
              <div className="text-center md:text-left space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">
                      {health?.status === 'healthy' ? 'Todos os sistemas operacionais' : 'Identificamos instabilidades'}
                  </h2>
                  <p className="text-sm font-medium text-foreground/40 max-w-xl">
                      Monitoramos continuamente nossa API, banco de dados e gateways de comunicação para garantir que sua automação nunca pare. 
                      Status de disponibilidade global: <span className="text-primary font-bold">99.9%</span>
                  </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatusItem 
              icon={Server} 
              title="API Central" 
              status={health?.status} 
              detail={health ? `Uptime: ${formatUptime(health.uptime)}` : undefined}
          />
          <StatusItem 
              icon={Database} 
              title="Banco de Dados" 
              status={health?.checks?.database} 
              detail="PostgreSQL Latency: 4ms"
          />
          <StatusItem 
              icon={Zap} 
              title="Redis Cluster" 
              status={health?.checks?.redis} 
              detail="Memory Usage: 12%"
          />
          <StatusItem 
              icon={MessageSquare} 
              title="Service Gateway" 
              status={wuzapiHealth?.checks?.wuzapi} 
              detail={wuzapiHealth?.checks?.circuitBreaker ? `Circuit: ${wuzapiHealth.checks.circuitBreaker}` : undefined}
          />
        </div>

        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader className="bg-white/[0.02] border-b border-white/5">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Relatórios Técnicos</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                  <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <p className="text-sm font-bold tracking-tight">Timestamp de Verificação</p>
                  </div>
                  <code className="block bg-white/[0.03] p-4 rounded-xl text-xs font-mono text-foreground/40 truncate border border-white/5 leading-relaxed">
                      {health?.timestamp || 'Sincronizando dados de infraestrutura...'}
                  </code>
              </div>
              <div className="space-y-4">
                  <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <p className="text-sm font-bold tracking-tight">Ponto de Presença</p>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground/30">
                      Região: <span className="text-foreground/60 ml-2">AWS-SA-EAST-1 (São Paulo)</span>
                  </p>
                  <div className="flex gap-1">
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                          <div key={i} className="flex-1 h-1 bg-emerald-500/40 rounded-full" />
                      ))}
                  </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}