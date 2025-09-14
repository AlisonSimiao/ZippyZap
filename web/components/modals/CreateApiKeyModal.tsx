'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Key, Copy, CheckCircle } from 'lucide-react'
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {createdToken ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Key className="h-5 w-5" />}
            {createdToken ? 'API Key Criada!' : 'Criar Nova API Key'}
          </DialogTitle>
        </DialogHeader>
        
        {createdToken ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 mb-2 font-medium">⚠️ Importante: Copie este token agora!</p>
              <p className="text-xs text-green-700">Este token não poderá ser visualizado novamente por questões de segurança.</p>
            </div>
            
            <div className="space-y-2">
              <Label>Seu Token de API</Label>
              <div className="flex gap-2">
                <Input value={createdToken} readOnly className="font-mono text-sm" />
                <Button onClick={copyToken} size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Button onClick={handleClose} className="w-full">
              Fechar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome (opcional)</Label>
              <Input
                id="name"
                placeholder="Ex: Produção, Desenvolvimento..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: 'ACTIVE' | 'REVOKED') => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Ativo</SelectItem>
                  <SelectItem value="REVOKED">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Criando...' : 'Criar API Key'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}