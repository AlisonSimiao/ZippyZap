'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sidebar } from '@/components/Sidebar'
import { useSession } from 'next-auth/react'
import { IUser } from '@/types/user.types'

export default function AccountPage() {
  const { data: session } = useSession() 
  const user = session?.user as unknown as IUser
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
                    <Input defaultValue={user?.name || ''} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input defaultValue={user?.email || ''} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">WhatsApp</label>
                    <Input placeholder="+55 11 99999-9999" defaultValue={user?.whatsapp || ''}/>
                  </div>
                </div>
                
                <Button className="w-full">Salvar Alterações</Button>
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
                  <Input  defaultValue={user.webhookUrl || ''}/>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Retenção de Dados (dias)</label>
                  <Input type="number" defaultValue={user.retentionDays || 0} />
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

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de Uso</CardTitle>
              <CardDescription>Seu consumo atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">1,247</div>
                  <div className="text-sm text-gray-600">Mensagens Enviadas</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">98.5%</div>
                  <div className="text-sm text-gray-600">Taxa de Entrega</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">15</div>
                  <div className="text-sm text-gray-600">Dias Restantes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}