'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/Sidebar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Save, Webhook } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { IWebhook, IEvent } from '@/types/webhook.types'

export default function WebhooksPage() {
    const { accessToken } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [webhook, setWebhook] = useState<IWebhook | null>(null)
    const [availableEvents, setAvailableEvents] = useState<IEvent[]>([])

    // Form state
    const [url, setUrl] = useState('')
    const [name, setName] = useState('')
    const [isActive, setIsActive] = useState(true)
    const [selectedEvents, setSelectedEvents] = useState<string[]>([])

    useEffect(() => {
        const loadData = async () => {
            try {
                const [webhookData, eventsData] = await Promise.all([
                    api.getWebhook(accessToken),
                    api.getWebhookEvents(accessToken)
                ])

                setAvailableEvents(eventsData)

                if (webhookData) {
                    setWebhook(webhookData)
                    setUrl(webhookData.url)
                    setName(webhookData.name || '')
                    setIsActive(webhookData.isActive)
                    setSelectedEvents(webhookData.webhookEvents
                        .filter(we => we.active)
                        .map(we => we.event.slug)
                    )
                }
            } catch (error) {
                console.error('Error loading data:', error)
                toast.error('Erro ao carregar configurações')
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [accessToken])

    const handleEventToggle = (eventSlug: string) => {
        setSelectedEvents(prev =>
            prev.includes(eventSlug)
                ? prev.filter(e => e !== eventSlug)
                : [...prev, eventSlug]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const data = {
                url,
                name: name || undefined,
                isActive,
                events: selectedEvents
            }

            if (webhook) {
                await api.updateWebhook(accessToken, webhook.id, data)
                toast.success('Webhook atualizado com sucesso!')
            } else {
                const newWebhook = await api.createWebhook(accessToken, data)
                setWebhook(newWebhook)
                toast.success('Webhook configurado com sucesso!')
            }
        } catch (error: any) {
            console.error('Error saving webhook:', error)
            toast.error(error.response?.data?.message || 'Erro ao salvar webhook')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <>
                <Sidebar activeTab="webhooks" setActiveTab={() => { }} />
                <div className="flex-1 p-8 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            </>
        )
    }

    return (
        <>
            <Sidebar activeTab="webhooks" setActiveTab={() => { }} />

            <div className="flex-1 p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Configuração de Webhook</h1>
                        <p className="text-gray-600">
                            Configure um único endpoint para receber todas as notificações de eventos da sua conta.
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Webhook className="h-5 w-5 text-blue-600" />
                                <CardTitle>Detalhes do Webhook</CardTitle>
                            </div>
                            <CardDescription>
                                Defina para onde devemos enviar os eventos e quais eventos você deseja receber.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="url">URL do Endpoint</Label>
                                        <Input
                                            id="url"
                                            placeholder="https://seu-sistema.com/api/webhook"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            required
                                            type="url"
                                        />
                                        <p className="text-sm text-gray-500">
                                            A URL deve ser pública e aceitar requisições POST.
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Nome de Identificação (Opcional)</Label>
                                        <Input
                                            id="name"
                                            placeholder="Ex: Integração Principal"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Status do Webhook</Label>
                                            <p className="text-sm text-gray-500">
                                                Quando desativado, nenhum evento será enviado.
                                            </p>
                                        </div>
                                        <Switch
                                            checked={isActive}
                                            onCheckedChange={setIsActive}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-base">Eventos Inscritos</Label>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {availableEvents.map((event) => (
                                            <div
                                                key={event.id}
                                                className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <Checkbox
                                                    id={event.slug}
                                                    checked={selectedEvents.includes(event.slug)}
                                                    onCheckedChange={() => handleEventToggle(event.slug)}
                                                />
                                                <div className="grid gap-1.5 leading-none">
                                                    <label
                                                        htmlFor={event.slug}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                    >
                                                        {event.name}
                                                    </label>
                                                    <p className="text-xs text-gray-500">
                                                        {event.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t">
                                    <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                                        {saving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Salvar Configurações
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}