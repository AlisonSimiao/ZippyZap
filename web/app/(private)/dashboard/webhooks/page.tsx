'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox, type CheckedState } from '@/components/ui/checkbox'
import { Loader2, Save, Webhook, Globe, Settings2, BellRing } from 'lucide-react'
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
                    setIsActive(Boolean(webhookData.isActive))
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

    const handleEventCheckedChange = (eventSlug: string, checked: CheckedState) => {
        setSelectedEvents(prev => {
            if (checked === true) {
                return prev.includes(eventSlug) ? prev : [...prev, eventSlug]
            }

            return prev.filter(e => e !== eventSlug)
        })
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
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="relative">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-serif font-bold mb-2 tracking-tight">Webhooks</h1>
                        <p className="text-foreground/40 text-sm font-medium uppercase tracking-widest leading-none">Notificações em Tempo Real</p>
                    </div>
                </div>

                <Card className="bg-white/[0.02] border-white/5 overflow-hidden">
                    <CardHeader className="bg-white/[0.02] border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                <Webhook className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold tracking-tight">Configurações do Endpoint</CardTitle>
                                <CardDescription className="text-xs text-foreground/40 font-medium uppercase tracking-wider">Configure o destino das suas notificações</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid gap-6">
                                <div className="grid gap-3">
                                    <Label htmlFor="url" className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">URL do Endpoint</Label>
                                    <div className="relative group">
                                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="url"
                                            placeholder="https://seu-sistema.com/api/webhook"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            required
                                            type="url"
                                            className="pl-11 bg-white/[0.03] border-white/5 focus-visible:ring-primary/50 h-12 transition-all"
                                        />
                                    </div>
                                    <p className="text-xs text-foreground/30 font-medium">
                                        A URL deve ser pública e aceitar requisições <span className="text-foreground/50 border-b border-white/10 italic">POST</span>.
                                    </p>
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Onde será usado? (Opcional)</Label>
                                    <div className="relative group">
                                        <Settings2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="name"
                                            placeholder="Ex: Integração Principal CRM"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="pl-11 bg-white/[0.03] border-white/5 focus-visible:ring-primary/50 h-12 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.01] border border-white/5 group hover:bg-white/[0.03] transition-all">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-bold tracking-tight">Status do Canal</Label>
                                        <p className="text-xs text-foreground/30 font-medium">
                                            Ative ou pause o envio de eventos para este endpoint.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={isActive}
                                        onCheckedChange={(checked) => setIsActive(Boolean(checked))}
                                        className="data-[state=checked]:bg-primary"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6 pt-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <BellRing className="h-4 w-4 text-primary" />
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 leading-none">Eventos Inscritos</Label>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {availableEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className={`flex items-start space-x-3 p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                                                selectedEvents.includes(event.slug)
                                                ? 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                                                : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-white/10'
                                            }`}
                                            onClick={() => handleEventToggle(event.slug)}
                                        >
                                            <Checkbox
                                                id={event.slug}
                                                checked={selectedEvents.includes(event.slug)}
                                                onClick={(e) => e.stopPropagation()}
                                                onCheckedChange={(checked) => handleEventCheckedChange(event.slug, checked)}
                                                className="mt-0.5 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                            />
                                            <div className="grid gap-1 leading-none">
                                                <label
                                                    htmlFor={event.slug}
                                                    className={`text-sm font-bold tracking-tight cursor-pointer ${
                                                        selectedEvents.includes(event.slug) ? 'text-primary' : 'text-foreground/80'
                                                    }`}
                                                >
                                                    {event.name}
                                                </label>
                                                <p className="text-[10px] text-foreground/30 font-medium leading-relaxed">
                                                    {event.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end pt-8 border-t border-white/5 gap-3">
                                <Button 
                                    type="submit" 
                                    disabled={saving} 
                                    className="w-full bg-primary text-white hover:opacity-90 font-bold uppercase tracking-widest text-xs h-12 shadow-lg shadow-primary/20"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                                            Salvando Configurações...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Salvar Alterações
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}