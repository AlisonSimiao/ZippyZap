'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Activity, Database, Server, MessageSquare, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

  const StatusBadge = ({ status }: { status: string }) => {
    const isOk = status === 'ok' || status === 'healthy' || status === 'CLOSED'
    return (
      <Badge variant={isOk ? 'default' : 'destructive'} className={isOk ? 'bg-green-500' : ''}>
        {isOk ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
        {status}
      </Badge>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Status do Sistema</h1>
          <p className="text-muted-foreground">Monitoramento em tempo real</p>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {lastUpdate && (
        <p className="text-sm text-muted-foreground">
          Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">API</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : health ? (
              <div className="space-y-2">
                <StatusBadge status={health.status} />
                <p className="text-xs text-muted-foreground">
                  Uptime: {formatUptime(health.uptime)}
                </p>
              </div>
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Banco de Dados</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : health?.checks?.database ? (
              <StatusBadge status={health.checks.database} />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Redis</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : health?.checks?.redis ? (
              <StatusBadge status={health.checks.redis} />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">WhatsApp (WuzAPI)</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : wuzapiHealth?.checks?.wuzapi ? (
              <div className="space-y-2">
                <StatusBadge status={wuzapiHealth.checks.wuzapi} />
                <p className="text-xs text-muted-foreground">
                  Circuit: {wuzapiHealth.checks.circuitBreaker || 'N/A'}
                </p>
              </div>
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Timestamp</p>
              <p className="font-mono">{health?.timestamp || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status Geral</p>
              <p className="font-medium">
                {health?.status === 'healthy' && wuzapiHealth?.checks?.wuzapi === 'ok'
                  ? 'Tudo operacional'
                  : 'Problemas detectados'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}