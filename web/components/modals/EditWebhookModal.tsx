'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { IWebhook } from '@/types/webhook.types'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

interface EditWebhookModalProps {
  isOpen: boolean
  onClose: () => void
  webhook: IWebhook | null
  onSuccess: () => void
}

const AVAILABLE_EVENTS = [
  { id: 'message.received', label: 'Mensagem Recebida' },
  { id: 'message.sent', label: 'Mensagem Enviada' },
  { id: 'message.delivered', label: 'Mensagem Entregue' },
  { id: 'message.read', label: 'Mensagem Lida' },
  { id: 'connection.status', label: 'Status da Conexão' }
]

export function EditWebhookModal({ isOpen, onClose, webhook, onSuccess }: EditWebhookModalProps) {
  const { accessToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as string[]
  })

  useEffect(() => {
    if (webhook) {
      setFormData({
        name: webhook.name || '',
        url: webhook.url,
        events: webhook.webhookEvents.filter(we => we.active).map(we => we.event.slug)
      })
    }
  }, [webhook])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!webhook) return

    setLoading(true)
    try {
      await api.updateWebhook(accessToken, webhook.id, {
        name: formData.name,
        url: formData.url,
        events: formData.events
      })
      toast.success('Webhook atualizado com sucesso!')
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar webhook')
    } finally {
      setLoading(false)
    }
  }

  const handleEventToggle = (eventId: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter(e => e !== eventId)
        : [...prev.events, eventId]
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Webhook</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome (opcional)</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome do webhook"
            />
          </div>
          
          <div>
            <Label htmlFor="url">URL do Webhook</Label>
            <Input
              id="url"
              type="url"
              required
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://exemplo.com/webhook"
            />
          </div>

          <div>
            <Label>Eventos</Label>
            <div className="space-y-2 mt-2">
              {AVAILABLE_EVENTS.map((event) => (
                <div key={event.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={event.id}
                    checked={formData.events.includes(event.id)}
                    onCheckedChange={() => handleEventToggle(event.id)}
                  />
                  <Label htmlFor={event.id} className="text-sm font-normal">
                    {event.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || formData.events.length === 0}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}