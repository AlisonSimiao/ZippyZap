'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sidebar } from '@/components/Sidebar'
import { useSession } from 'next-auth/react'
import { IUser } from '@/types/user.types'
import { api } from '@/lib/api'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export default function AccountPage() {
  const { data: session, update } = useSession() as unknown as {data: {user: IUser, accessToken: string}, update: () => Promise<void>}
  const user = session?.user
  const token = session.accessToken
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    whatsapp: user?.whatsapp || '',
    webhookUrl: user?.webhookUrl || '',
    retentionDays: user?.retentionDays || 0
  })

  const handleUpdate = async () => {
    if (!token) return
    
    setLoading(true)
    try {
      await api.updateUser(token, formData)
      await update()
      toast({ title: 'Conta atualizada com sucesso!' })
    } catch (error) {
      toast({ title: 'Erro ao atualizar conta', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      <Sidebar activeTab="account" setActiveTab={() => {}} />
      
      <div className="flex-1 p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Conta</h1>
            <p className="text-gray-600">Gerencie suas informações pessoais</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Seus dados básicos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{user?.name || 'Usuário'}</h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Nome</label>
                    <Input 
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input 
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">WhatsApp</label>
                    <Input 
                      placeholder="+55 11 99999-9999" 
                      value={formData.whatsapp}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    />
                  </div>
                </div>
                
                <Button className="w-full" onClick={handleUpdate} disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
                <CardDescription>Preferências da conta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Webhook URL</label>
                  <Input 
                    value={formData.webhookUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Retenção de Dados (dias)</label>
                  <Input 
                    type="number" 
                    value={formData.retentionDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, retentionDays: Number(e.target.value) }))}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-medium text-red-600">Zona de Perigo</h4>
                  <Button variant="destructive" className="w-full">
                    Excluir Conta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}