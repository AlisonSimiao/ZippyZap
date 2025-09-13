'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sidebar } from '@/components/Sidebar'
import { 
  Key, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Activity, 
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function Dashboard() {
  const stats = [
    { title: 'API Keys', value: '3', icon: Key, color: 'blue' },
    { title: 'Mensagens Enviadas', value: '1,247', icon: MessageSquare, color: 'green' },
    { title: 'Taxa de Entrega', value: '98.5%', icon: CheckCircle, color: 'emerald' },
    { title: 'Usuários Ativos', value: '156', icon: Users, color: 'purple' }
  ]

  const recentActivity = [
    { action: 'API Key criada', time: '2 min atrás', status: 'success' },
    { action: 'Mensagem enviada', time: '5 min atrás', status: 'success' },
    { action: 'Webhook falhou', time: '10 min atrás', status: 'error' },
    { action: 'Plano atualizado', time: '1 hora atrás', status: 'success' }
  ]

  return (
    <>
      <Sidebar activeTab="dashboard" setActiveTab={() => {}} />
      
      <div className="flex-1 p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-600">Visão geral da sua conta e atividades</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.title}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                        <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Usage Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Uso nos Últimos 7 Dias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, index) => {
                    const usage = Math.floor(Math.random() * 99)
                    return (
                      <div key={day} className="flex items-center gap-3">
                        <span className="text-sm w-8">{day}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${usage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{usage}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                      {activity.status === 'success' ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      }
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Key className="h-8 w-8 text-blue-600 mb-2" />
                  <h3 className="font-medium">Criar API Key</h3>
                  <p className="text-sm text-gray-600">Gere uma nova chave de API</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <MessageSquare className="h-8 w-8 text-green-600 mb-2" />
                  <h3 className="font-medium">Enviar Mensagem</h3>
                  <p className="text-sm text-gray-600">Teste o envio de mensagens</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Calendar className="h-8 w-8 text-purple-600 mb-2" />
                  <h3 className="font-medium">Ver Relatórios</h3>
                  <p className="text-sm text-gray-600">Analise suas métricas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}