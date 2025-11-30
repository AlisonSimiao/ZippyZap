'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Webhook } from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { IEvent } from '@/types/webhook.types'

interface CreateWebhookModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    accessToken: string
}

export function CreateWebhookModal({ isOpen, onClose, onSuccess, accessToken }: CreateWebhookModalProps) {
    const [url, setUrl] = useState('')
    const [name, setName] = useState('')
    const [selectedEvents, setSelectedEvents] = useState<string[]>([])
    const [isActive, setIsActive] = useState(true)
    const [loading, setLoading] = useState(false)
    const [availableEvents, setAvailableEvents] = useState<IEvent[]>([])
    const [loadingEvents, setLoadingEvents] = useState(false)

    useEffect(() => {
        if (isOpen) {
            fetchEvents()
        }
    }, [isOpen])

    const fetchEvents = async () => {
        setLoadingEvents(true)
        try {
            const events = await api.getWebhookEvents(accessToken)
            setAvailableEvents(events)
        } catch (error) {
            console.error('Error fetching events:', error)
            toast.error('Erro ao carregar eventos disponíveis')
        } finally {
            setLoadingEvents(false)
        }
    }

    const handleEventToggle = (eventSlug: string) => {
        setSelectedEvents(prev =>
            prev.includes(eventSlug)
                ? prev.filter(e => e !== eventSlug)
                : [...prev, eventSlug]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await api.createWebhook(accessToken, {
                url,
                name: name || undefined,
                events: selectedEvents.length > 0 ? selectedEvents : undefined,
                isActive,
            })
            toast.success('Webhook criado com sucesso!')
            setUrl('')
            setName('')
            setSelectedEvents([])
            setIsActive(true)
            onSuccess()
            onClose()
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Erro ao criar webhook')
        } finally {
            setLoading(false)
        }
    }


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Webhook className="h-5 w-5" />
                        Criar Webhook
                    </DialogTitle>
                    <DialogDescription>
                        Adicione um novo webhook para receber notificações de eventos
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="url">URL do Webhook *</Label>
                        <Input
                            id="url"
                            type="url"
                            placeholder="https://seu-dominio.com/webhook"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            URL que receberá as notificações via POST
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="name">Nome (opcional)</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Webhook de produção"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Nome descritivo para identificar o webhook
                        </p>
                    </div>

                    <div>
                        <Label>Eventos (opcional)</Label>
                        <p className="text-sm text-gray-500 mb-3">
                            Selecione os eventos que acionarão este webhook. Se nenhum for selecionado, todos os eventos serão enviados.
                        </p>
                        <div className="space-y-3 max-h-48 overflow-y-auto border rounded-lg p-3">
                            {loadingEvents ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                </div>
                            ) : availableEvents.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-2">Nenhum evento disponível</p>
                            ) : (
                                availableEvents.map((event) => (
                                    <div key={event.id} className="flex items-start space-x-3">
                                        <Checkbox
                                            id={event.slug}
                                            checked={selectedEvents.includes(event.slug)}
                                            onCheckedChange={() => handleEventToggle(event.slug)}
                                        />
                                        <div className="flex-1">
                                            <label
                                                htmlFor={event.slug}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {event.name}
                                            </label>
                                            <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="isActive">Ativo</Label>
                            <p className="text-sm text-gray-500">
                                Webhook receberá notificações
                            </p>
                        </div>
                        <Switch
                            id="isActive"
                            checked={isActive}
                            onCheckedChange={setIsActive}
                        />
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Criando...
                                </>
                            ) : (
                                <>
                                    <Webhook className="mr-2 h-4 w-4" />
                                    Criar Webhook
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
