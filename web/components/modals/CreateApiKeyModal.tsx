'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Key, Copy, CheckCircle, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'

interface CreateApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  accessToken: string
}

export function CreateApiKeyModal({ isOpen, onClose, onSuccess, accessToken }: CreateApiKeyModalProps) {
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'ACTIVE' | 'REVOKED'>('ACTIVE')
  const [loading, setLoading] = useState(false)
  const [createdToken, setCreatedToken] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (name && name.length < 3) {
      toast.error('Nome deve ter pelo menos 3 caracteres')
      return
    }

    setLoading(true)
    try {
      const response = await api.createApiKey(accessToken, { name, status })
      setCreatedToken(response.token)
      toast.success('API Key criada com sucesso!')
      onSuccess()
    } catch (error) {
      toast.error('Erro ao criar API Key')
    } finally {
      setLoading(false)
    }
  }

  const copyToken = () => {
    if (createdToken) {
      navigator.clipboard.writeText(createdToken)
      toast.success('Token copiado!')
    }
  }

  const handleClose = () => {
    setName('')
    setStatus('ACTIVE')
    setCreatedToken(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-background border-white/10 text-foreground shadow-2xl shadow-primary/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-serif font-bold tracking-tight">
            {createdToken ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <Key className="h-5 w-5 text-primary" />}
            {createdToken ? 'API Key Criada!' : 'Criar Nova API Key'}
          </DialogTitle>
        </DialogHeader>
        
        {createdToken ? (
          <div className="space-y-6 pt-4">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-emerald-500 font-bold uppercase tracking-wider mb-1">Cuidado!</p>
                <p className="text-xs text-emerald-500/70 font-medium leading-relaxed">Copie este token agora. Por segurança, ele não será exibido novamente.</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Seu Token de API</Label>
              <div className="flex gap-2">
                <Input value={createdToken} readOnly className="font-mono text-sm bg-white/5 border-white/10 selection:bg-primary/30" />
                <Button onClick={copyToken} size="icon" className="bg-primary hover:bg-primary/90">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Button onClick={handleClose} className="w-full bg-white text-black hover:bg-white/90 font-bold uppercase tracking-widest text-xs h-11">
              Finalizar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Nome da Chave</Label>
              <Input
                id="name"
                placeholder="Ex: Produção, Mobile App..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/5 border-white/10 focus-visible:ring-primary/50 h-11"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="status" className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Status Inicial</Label>
              <Select value={status} onValueChange={(value: 'ACTIVE' | 'REVOKED') => setStatus(value)}>
                <SelectTrigger className="bg-white/5 border-white/10 focus:ring-primary/50 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-white/10">
                  <SelectItem value="ACTIVE" className="focus:bg-primary/10 transition-colors cursor-pointer">Ativo</SelectItem>
                  <SelectItem value="REVOKED" className="focus:bg-rose-500/10 focus:text-rose-500 transition-colors cursor-pointer">Inativo (Revogado)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={handleClose} className="text-foreground/50 hover:bg-white/5 font-bold uppercase tracking-widest text-xs h-11">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="bg-primary text-white hover:opacity-90 font-bold uppercase tracking-widest text-xs h-11 shadow-lg shadow-primary/20">
                {loading ? 'Criando...' : 'Criar Chave'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}