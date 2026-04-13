'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSession } from 'next-auth/react'
import { IUser } from '@/types/user.types'
import { api } from '@/lib/api'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { User, Mail, Smartphone, Globe, ShieldAlert, Save, Loader2, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

export default function AccountPage() {
  const { data: session, update } = useSession() as unknown as {data: {user: IUser, accessToken: string}, update: () => Promise<void>}
  const user = session?.user
  const token = session?.accessToken
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
      toast({ title: 'Perfil atualizado com sucesso!' })
    } catch (error) {
      toast({ title: 'Erro ao atualizar perfil', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2 tracking-tight">Configurações</h1>
            <p className="text-foreground/40 text-sm font-medium uppercase tracking-widest leading-none">Perfil e Preferências da Conta</p>
          </div>
          <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="text-rose-500 hover:bg-rose-500/10 font-bold uppercase tracking-widest text-[10px]"
          >
            <LogOut className="h-3.5 w-3.5 mr-2" />
            Sair da Conta
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-white/[0.02] border-white/5 overflow-hidden">
              <CardHeader className="bg-white/[0.02] border-b border-white/5 pb-8">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="relative group">
                          <Avatar className="h-24 w-24 border-2 border-primary/20 p-1 bg-background ring-4 ring-primary/5">
                              <AvatarImage src={user?.image || ''} />
                              <AvatarFallback className="text-2xl font-serif bg-primary/10 text-primary">
                                  {user?.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                          </Avatar>
                          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full -z-10 animate-pulse"></div>
                      </div>
                      <div className="text-center md:text-left">
                          <h3 className="text-2xl font-bold tracking-tight mb-1">{user?.name || 'Usuário'}</h3>
                          <p className="text-sm text-foreground/40 font-medium mb-4">{user?.email}</p>
                          <div className="flex flex-wrap justify-center md:justify-start gap-2">
                              <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-primary/10">Plano Pro</span>
                              <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/10">Status: Ativo</span>
                          </div>
                      </div>
                  </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 flex items-center gap-2">
                              <User className="h-3 w-3" />
                              Nome Completo
                          </Label>
                          <Input 
                              value={formData.name}
                              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                              className="bg-white/[0.03] border-white/5 focus-visible:ring-primary/50 h-12 transition-all"
                          />
                      </div>
                      <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              Endereço de E-mail
                          </Label>
                          <Input 
                              value={formData.email}
                              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                              className="bg-white/[0.03] border-white/5 focus-visible:ring-primary/50 h-12 transition-all opacity-50 cursor-not-allowed"
                              disabled
                          />
                      </div>
                      <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 flex items-center gap-2">
                              <Smartphone className="h-3 w-3" />
                              WhatsApp de Contato
                          </Label>
                          <Input 
                              placeholder="+55 11 99999-9999" 
                              value={formData.whatsapp}
                              onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                              className="bg-white/[0.03] border-white/5 focus-visible:ring-primary/50 h-12 transition-all"
                          />
                      </div>
                  </div>

                  <div className="pt-4">
                      <Button 
                          className="bg-primary text-white hover:opacity-90 font-bold uppercase tracking-widest text-xs h-12 px-8 shadow-lg shadow-primary/20" 
                          onClick={handleUpdate} 
                          disabled={loading}
                      >
                          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                          Salvar Alterações
                      </Button>
                  </div>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.02] border-white/5 overflow-hidden">
              <CardHeader className="bg-white/[0.02] border-b border-white/10">
                  <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500">
                          <Globe className="h-5 w-5" />
                      </div>
                      <div>
                          <CardTitle className="text-lg font-bold tracking-tight">Preferências Técnicas</CardTitle>
                          <CardDescription className="text-xs text-foreground/40 font-medium uppercase tracking-wider">Ajustes avançados do sistema</CardDescription>
                      </div>
                  </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                  <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Webhook Global de Notificações</Label>
                      <Input 
                          placeholder="https://sua-url.com/webhook"
                          value={formData.webhookUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, webhookUrl: e.target.value }))}
                          className="bg-white/[0.03] border-white/5 focus-visible:ring-primary/50 h-12"
                      />
                      <p className="text-[10px] text-foreground/30 font-medium italic">Esta URL receberá todos os eventos importantes da sua conta.</p>
                  </div>
                  
                  <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Retenção de Logs (dias)</Label>
                      <div className="max-w-[200px]">
                          <Input 
                              type="number" 
                              value={formData.retentionDays}
                              onChange={(e) => setFormData(prev => ({ ...prev, retentionDays: Number(e.target.value) }))}
                              className="bg-white/[0.03] border-white/5 focus-visible:ring-primary/50 h-12"
                          />
                      </div>
                  </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Danger Zone */}
          <div className="space-y-8">
              <Card className="bg-rose-500/[0.02] border-rose-500/10 overflow-hidden">
                  <CardHeader className="bg-rose-500/[0.02] border-b border-rose-500/10">
                      <div className="flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4 text-rose-500" />
                          <CardTitle className="text-xs font-bold uppercase tracking-widest text-rose-500/80">Zona Crítica</CardTitle>
                      </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                      <p className="text-xs text-foreground/40 leading-relaxed font-medium">Ações nesta área são permanentes e não podem ser desfeitas. Tenha cautela.</p>
                      <Separator className="bg-rose-500/10" />
                      <Button variant="ghost" className="w-full text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 font-bold uppercase tracking-widest text-[10px] h-11">
                          Excluir Minha Conta
                      </Button>
                  </CardContent>
              </Card>

              <Card className="bg-white/[0.02] border-white/5 p-6 border-dashed">
                  <div className="space-y-4 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Precisa de Ajuda?</p>
                      <p className="text-xs text-foreground/50 leading-relaxed font-medium">Nossa equipe de suporte está disponível em horário comercial para auxiliar com qualquer configuração.</p>
                      <Button variant="link" className="text-primary font-bold uppercase tracking-widest text-[10px] p-0 h-auto">Contactar Suporte</Button>
                  </div>
              </Card>
          </div>
        </div>
      </div>
    </div>
  )
}