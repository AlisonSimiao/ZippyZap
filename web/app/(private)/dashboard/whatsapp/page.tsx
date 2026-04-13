'use client'

import { useState, useEffect, useCallback } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'react-hot-toast'
import { Badge } from '@/components/ui/badge'

import {
    MessageSquare,
    QrCode,
    Send,
    CheckCircle,
    XCircle,
    Loader2,
    Wifi,
    WifiOff,
    Smartphone,
    Activity,
    Info,
    RefreshCw,
    Key,
    ShieldCheck
} from 'lucide-react'
import { api } from '@/lib/api'
import { WhatsAppStatus } from '@/types/whatsapp.types'
import { useAuth } from '@/hooks/useAuth'
import Image from 'next/image'

export default function WhatsAppPage() {
    const { accessToken } = useAuth()

    const [apiKey, setApiKey] = useState<string | undefined>(undefined)
    const [sessionCreated, setSessionCreated] = useState(false)
    const [qrCode, setQrCode] = useState<string>('')
    const [status, setStatus] = useState<WhatsAppStatus>('disconnected')
    const [loading, setLoading] = useState(false)
    const [initializing, setInitializing] = useState(true)

    const [phoneNumber, setPhoneNumber] = useState('')
    const [message, setMessage] = useState('')
    const [sendingMessage, setSendingMessage] = useState(false)

    useEffect(() => {
        const loadInitialStatus = async () => {
            const storedApiKey = localStorage.getItem('selectedApiKey')
            if (storedApiKey) {
                setApiKey(storedApiKey)
                try {
                    const response = await api.getWhatsAppStatus(storedApiKey)
                    setStatus(response.status as WhatsAppStatus)
                    if (response.status === 'connected') {
                        setSessionCreated(true)
                    }
                } catch (err) {
                    console.error('Error checking initial status:', err)
                    setStatus('disconnected')
                }
            }
            setInitializing(false)
        }
        loadInitialStatus()
    }, [])

    const pollQRCode = useCallback(async () => {
        if (!apiKey) return

        try {
            const response = await api.getWhatsAppQRCode(apiKey)
            setQrCode(response.qr)
            setStatus(response.status as WhatsAppStatus)

            if (response.status === 'connected') {
                setQrCode('')
            }
        } catch (err: any) {
            console.error('Error polling QR code:', err)
            if (err.response?.status !== 404) {
                toast.error(err.response?.data?.message || 'Erro ao obter QR Code')
            }
        }
    }, [apiKey])

    const pollStatus = useCallback(async () => {
        if (!apiKey) return

        try {
            const response = await api.getWhatsAppStatus(apiKey)
            setStatus(response.status as WhatsAppStatus)

            if (response.status === 'disconnected') {
                setSessionCreated(false)
                setQrCode('')
            }
        } catch (err: any) {
            console.error('Error polling status:', err)
        }
    }, [apiKey])

    useEffect(() => {
        let interval: NodeJS.Timeout

        if (sessionCreated && apiKey) {
            if (status === 'connected') {
                interval = setInterval(pollStatus, 10000)
            } else {
                pollQRCode()
                interval = setInterval(pollQRCode, 3000)
            }
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [sessionCreated, status, apiKey, pollQRCode, pollStatus])

    const handleCreateSession = async () => {
        if (!apiKey) {
            toast.error('Por favor, insira uma API Key primeiro')
            return
        }

        setLoading(true)

        try {
            const statusResponse = await api.getWhatsAppStatus(apiKey)
            if (statusResponse.status === 'connected') {
                setStatus('connected')
                setSessionCreated(true)
                toast.success('Sessão já está conectada!')
                setLoading(false)
                return
            }

            await api.createWhatsAppSession(apiKey)
            setSessionCreated(true)
            setStatus('initializing')
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Erro ao criar sessão')
        } finally {
            setLoading(false)
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!apiKey) {
            toast.error('Por favor, insira uma API Key')
            return
        }

        if (status !== 'connected') {
            toast.error('WhatsApp não está conectado')
            return
        }

        setSendingMessage(true)

        try {
            await api.sendWhatsAppMessage(apiKey, {
                to: phoneNumber,
                type: 'text',
                message
            })
            toast.success('Mensagem enviada com sucesso!')
            setMessage('')
        } catch (err: any) {
            console.error(err)
            toast.error(err.response?.data?.message || 'Erro ao enviar mensagem')
        } finally {
            setSendingMessage(false)
        }
    }

    const handleLogout = async () => {
        if (!apiKey) {
            toast.error('Por favor, insira uma API Key')
            return
        }

        setLoading(true)

        try {
            await api.logoutWhatsApp(apiKey)
            toast.success('Desconectado com sucesso!')
            setStatus('disconnected')
            setSessionCreated(false)
            setQrCode('')
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Erro ao desconectar')
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = () => {
        const statusConfig = {
            disconnected: { label: 'Desconectado', color: 'rose', icon: WifiOff },
            initializing: { label: 'Inicializando', color: 'blue', icon: RefreshCw },
            qr_received: { label: 'QR Code Pendente', color: 'amber', icon: QrCode },
            connected: { label: 'Conectado', color: 'emerald', icon: Wifi },
            error: { label: 'Erro', color: 'rose', icon: XCircle }
        }

        const config = statusConfig[status] || statusConfig.disconnected
        const Icon = config.icon

        return (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${
                config.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                config.color === 'amber' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                config.color === 'blue' ? 'bg-primary/10 text-primary border-primary/20' :
                'bg-rose-500/10 text-rose-500 border-rose-500/20'
            }`}>
                <Icon className={`h-3 w-3 ${status === 'initializing' ? 'animate-spin' : ''}`} />
                {config.label}
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="space-y-8 max-w-4xl mx-auto">
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-serif font-bold mb-2 tracking-tight">WhatsApp</h1>
                        <p className="text-foreground/40 text-sm font-medium uppercase tracking-widest leading-none">Conexão e Envio Manual</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Session Management (2/3) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* API Key Selection */}
                        <Card className="bg-white/[0.02] border-white/5 overflow-hidden">
                            <CardHeader className="bg-white/[0.02] border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <CardTitle className="text-lg font-bold tracking-tight">Seleção de Chave</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <Label htmlFor="apiKey" className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Insira sua API Key</Label>
                                    <div className="relative group">
                                        <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="apiKey"
                                            placeholder="Sua_Chave_De_Acesso_Aqui"
                                            value={apiKey || ''}
                                            onChange={(e) => {
                                                const value = e.target.value
                                                setApiKey(value)
                                                localStorage.setItem('selectedApiKey', value)
                                            }}
                                            className="pl-11 bg-white/[0.03] border-white/5 focus-visible:ring-primary/50 h-12 transition-all font-mono text-sm leading-none"
                                        />
                                    </div>
                                    <p className="text-[10px] text-foreground/30 font-medium">Use uma API Key ativa para gerenciar a sessão.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Session Status & QR Code */}
                        <Card className="bg-white/[0.02] border-white/5 overflow-hidden">
                            <CardHeader className="bg-white/[0.02] border-b border-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                            <Smartphone className="h-5 w-5" />
                                        </div>
                                        <CardTitle className="text-lg font-bold tracking-tight">Status da Conexão</CardTitle>
                                    </div>
                                    {getStatusBadge()}
                                </div>
                            </CardHeader>
                            <CardContent className="p-10">
                                {initializing ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                                        <p className="text-sm text-foreground/40 font-bold uppercase tracking-widest">Sincronizando...</p>
                                    </div>
                                ) : !sessionCreated ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="w-20 h-20 bg-white/[0.03] border border-white/5 rounded-full flex items-center justify-center mb-6">
                                            <QrCode className="h-10 w-10 text-foreground/10" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">Pronto para conectar?</h3>
                                        <p className="text-sm text-foreground/40 max-w-xs mb-8">
                                            Crie uma nova sessão de WhatsApp para gerar o QR Code de autenticação.
                                        </p>
                                        <Button
                                            onClick={handleCreateSession}
                                            disabled={loading || !apiKey}
                                            className="bg-primary text-white hover:opacity-90 font-bold uppercase tracking-widest text-xs h-12 px-8 shadow-lg shadow-primary/20"
                                        >
                                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
                                            Criar Nova Sessão
                                        </Button>
                                    </div>
                                ) : status === 'connected' ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6 relative">
                                            <CheckCircle className="h-12 w-12 text-emerald-500" />
                                            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-125 animate-pulse"></div>
                                        </div>
                                        <h3 className="text-2xl font-bold text-emerald-500 mb-2 tracking-tight">WhatsApp Conectado!</h3>
                                        <p className="text-sm text-foreground/40 max-w-xs mb-10">
                                            Sua instância está operacional e pronta para enviar e receber mensagens em tempo real.
                                        </p>
                                        <Button
                                            variant="ghost"
                                            onClick={handleLogout}
                                            disabled={loading}
                                            className="text-foreground/30 hover:text-rose-500 hover:bg-rose-500/10 font-bold uppercase tracking-widest text-[10px]"
                                        >
                                            {loading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <WifiOff className="mr-2 h-3 w-3" />}
                                            Encerrar Sessão
                                        </Button>
                                    </div>
                                ) : qrCode ? (
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="mb-8 p-6 bg-white rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.05)] border border-white/10 group overflow-hidden relative">
                                            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                                            <Image
                                                src={qrCode}
                                                alt="QR Code WhatsApp"
                                                width={280}
                                                height={280}
                                                className="relative z-10"
                                            />
                                        </div>
                                        <div className="flex items-start gap-4 p-4 border border-amber-500/10 bg-amber-500/5 rounded-2xl max-w-md">
                                            <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-amber-500 uppercase tracking-tight">Instruções de Login</p>
                                                <p className="text-xs text-amber-200/60 leading-relaxed font-semibold">Abra o WhatsApp no seu celular {'>'} Menu/Configurações {'>'} Aparelhos Conectados {'>'} Conectar um Aparelho.</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                                        <p className="text-sm text-foreground/40 font-bold uppercase tracking-widest">Gerando QR Code...</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Send Message Form (1/3) */}
                    <div className="space-y-8">
                        <Card className="bg-white/[0.02] border-white/5 overflow-hidden">
                            <CardHeader className="bg-white/[0.02] border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                        <Send className="h-5 w-5" />
                                    </div>
                                    <CardTitle className="text-lg font-bold tracking-tight">Envio de Teste</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleSendMessage} className="space-y-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Número de Whatsapp</Label>
                                        <div className="relative group">
                                            <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="5511999999999"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                disabled={status !== 'connected'}
                                                className="pl-11 bg-white/[0.03] border-white/5 focus-visible:ring-primary/50 h-11 h-12 transition-all font-mono text-sm leading-none"
                                                required
                                            />
                                        </div>
                                        <p className="text-[10px] text-foreground/30 font-medium">Inclua DDI (55) + DDD + Número.</p>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="message" className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Sua Mensagem</Label>
                                        <Textarea
                                            id="message"
                                            placeholder="Olá, como posso ajudar?"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            disabled={status !== 'connected'}
                                            required
                                            className="bg-white/[0.03] border-white/5 focus-visible:ring-primary/50 min-h-[140px] transition-all resize-none p-4"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={sendingMessage || status !== 'connected'}
                                        className="w-full bg-primary text-white hover:opacity-90 font-bold uppercase tracking-widest text-xs h-12 shadow-lg shadow-primary/20"
                                    >
                                        {sendingMessage ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Enviar Agora
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="bg-primary/5 border-primary/10 overflow-hidden border">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary/70">Dica de Performance</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-primary/40 leading-relaxed font-medium">Use sessões diferentes para campanhas em massa e atendimento direto para prolongar a vida das suas instâncias.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}



