'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Key, 
  Copy, 
  Trash2, 
  Plus,
  Edit,
  Activity,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { IApikey } from '@/types/apikey'
import { format } from 'date-fns'
import { CreateApiKeyModal } from '@/components/modals/CreateApiKeyModal'

export default function ApiKeysPage() {
  const { accessToken } = useAuth()
  const [apiKeys, setApiKeys] = useState<IApikey[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (!accessToken) return
    
    api.getApiKeys(accessToken)
      .then(setApiKeys)
      .catch(error => {
        console.error('Error fetching API keys:', error)
        toast.error('Erro ao carregar chaves de API')
      })
  }, [accessToken])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('ID da chave copiado!')
  }

  return (
    <div className="p-8">
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2 tracking-tight">API Keys</h1>
            <p className="text-foreground/40 text-sm font-medium uppercase tracking-widest leading-none">Chaves de Acesso e Segurança</p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-primary text-white hover:opacity-90 font-bold uppercase tracking-widest text-xs h-11 px-6 shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Chave
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/[0.02] border-white/5 hover:border-primary/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <Key className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest mb-1">Total de Chaves</p>
                  <p className="text-3xl font-bold tracking-tight">{apiKeys.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/[0.02] border-white/5 hover:border-primary/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest mb-1">Chaves Ativas</p>
                  <p className="text-3xl font-bold tracking-tight">{apiKeys.filter(key => key.status === 'ACTIVE').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.02] border-white/5 hover:border-primary/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest mb-1">Uso nas últimas 24h</p>
                  <p className="text-3xl font-bold tracking-tight">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Keys Table Placeholder if empty */}
        {apiKeys.length === 0 ? (
          <Card className="bg-white/[0.02] border-white/5 py-20">
              <div className="flex flex-col items-center justify-center text-foreground/20 italic">
                <ShieldCheck className="h-16 w-16 mb-4 opacity-10" />
                <p className="text-lg font-medium">Nenhuma chave de API encontrada.</p>
                <p className="text-sm not-italic mt-1">Crie uma chave para começar a integrar seus serviços.</p>
                <Button variant="outline" onClick={() => setIsModalOpen(true)} className="text-primary border-primary/20 hover:bg-primary/10 mt-6 font-bold uppercase tracking-widest text-xs">
                  Criar minha primeira chave
                </Button>
              </div>
          </Card>
        ) : (
          <Card className="bg-white/[0.02] border-white/5 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5">
                      <th className="p-4 text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Nome da Chave</th>
                      <th className="p-4 text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Secret Key</th>
                      <th className="p-4 text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Criada em</th>
                      <th className="p-4 text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Status</th>
                      <th className="p-4 text-[10px] font-bold text-foreground/30 uppercase tracking-widest text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {apiKeys.map((apiKey) => (
                      <tr key={apiKey.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-1.5 h-1.5 rounded-full ${apiKey.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-foreground/20'}`} />
                            <span className="font-bold tracking-tight">{apiKey.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <code className="bg-white/5 px-3 py-1.5 rounded-lg text-xs font-mono text-foreground/40 tracking-wider">
                              {'•'.repeat(24)}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyToClipboard(apiKey.id.toString())}
                              className="h-8 w-8 text-foreground/30 hover:text-primary hover:bg-primary/10 transition-all"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                        <td className="p-4 text-foreground/50 font-medium">
                          <div className="flex items-center gap-2 text-xs">
                            <Calendar className="w-3.5 h-3.5 opacity-30" />
                            {format(new Date(apiKey.createdAt), 'dd MMM, yyyy')}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${
                            apiKey.status === 'ACTIVE' 
                              ? 'bg-emerald-500/10 text-emerald-500' 
                              : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {apiKey.status === 'ACTIVE' ? 'Ativa' : 'Revogada'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-foreground/30 hover:text-primary hover:bg-primary/10 transition-all rounded-xl"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-foreground/30 hover:text-rose-500 hover:bg-rose-500/10 transition-all rounded-xl"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateApiKeyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          api.getApiKeys(accessToken)
            .then(setApiKeys)
            .catch(error => console.error('Error fetching API keys:', error))
        }}
        accessToken={accessToken}
      />
    </div>
  )
}