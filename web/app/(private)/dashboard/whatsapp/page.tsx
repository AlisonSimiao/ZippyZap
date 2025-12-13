'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sidebar } from '@/components/Sidebar'
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
    WifiOff
} from 'lucide-react'
import { api } from '@/lib/api'
import { WhatsAppStatus } from '@/types/whatsapp.types'
import { IApikey } from '@/types/apikey'
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



    // Message form state
    const [phoneNumber, setPhoneNumber] = useState('')
    const [message, setMessage] = useState('')
    const [sendingMessage, setSendingMessage] = useState(false)


    // Polling interval ref


    // Load stored API key on mount and check initial status
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

    // Check connection status
    const checkStatus = useCallback(async (key: string) => {
        if (!key) return

        try {
            const response = await api.getWhatsAppStatus(key)
            setStatus(response.status as WhatsAppStatus)
            if (response.status === 'connected') {
                setSessionCreated(true)
            }
        } catch (err: any) {
            console.error('Error checking status:', err)
            setStatus('disconnected')
        }
    }, [])

    // Poll for QR code when session is created but not connected
    const pollQRCode = useCallback(async () => {
        if (!apiKey) return

        try {
            const response = await api.getWhatsAppQRCode(apiKey)
            setQrCode(response.qr)
            setStatus(response.status as WhatsAppStatus)

            // If connected, clear QR code
            if (response.status === 'connected') {
                setQrCode('')
            }
        } catch (err: any) {
            console.error('Error polling QR code:', err)
            // Don't show error if it's just waiting for QR code
            if (err.response?.status !== 404) {
                toast.error(err.response?.data?.message || 'Erro ao obter QR Code')
            }
        }
    }, [apiKey])

    // Poll status when connected to keep it updated
    const pollStatus = useCallback(async () => {
        if (!apiKey) return

        try {
            const response = await api.getWhatsAppStatus(apiKey)
            setStatus(response.status as WhatsAppStatus)

            // If disconnected, clear session
            if (response.status === 'disconnected') {
                setSessionCreated(false)
                setQrCode('')
            }
        } catch (err: any) {
            console.error('Error polling status:', err)
        }
    }, [apiKey])

    // Start polling based on connection state
    useEffect(() => {
        let interval: NodeJS.Timeout

        if (sessionCreated && apiKey) {
            if (status === 'connected') {
                // Poll status every 10 seconds when connected
                interval = setInterval(pollStatus, 10000)
            } else {
                // Poll QR code every 3 seconds when not connected
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
            // First check if already connected
            const statusResponse = await api.getWhatsAppStatus(apiKey)
            if (statusResponse.status === 'connected') {
                setStatus('connected')
                setSessionCreated(true)
                toast.success('Sessão já está conectada!')
                setLoading(false)
                return
            }

            // If not connected, create new session
            const response = await api.createWhatsAppSession(apiKey)
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
            disconnected: { label: 'Desconectado', variant: 'secondary' as const, icon: WifiOff },
            initializing: { label: 'Inicializando', variant: 'default' as const, icon: Loader2 },
            qr_received: { label: 'Aguardando QR Code', variant: 'default' as const, icon: QrCode },
            connected: { label: 'Conectado', variant: 'default' as const, icon: Wifi },
            error: { label: 'Erro', variant: 'destructive' as const, icon: XCircle }
        }

        const config = statusConfig[status] || statusConfig.disconnected
        const Icon = config.icon

        return (
            <Badge
                variant={config.variant}
                className={
                    status === 'connected' ? 'bg-green-500 hover:bg-green-600 text-white' :
                        status === 'initializing' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                            status === 'qr_received' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' :
                                ''
                }
            >
                <Icon className={`h-3 w-3 mr-1 ${status === 'initializing' ? 'animate-spin' : ''}`} />
                {config.label}
            </Badge>
        )
    }

    return (
        <>
            <Sidebar activeTab="whatsapp" setActiveTab={() => { }} />

            <div className="flex-1 p-8">
                <div className="space-y-6 max-w-4xl">
                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Gerenciamento WhatsApp</h1>
                        <p className="text-gray-600">
                            Crie sessões, conecte via QR Code e envie mensagens
                        </p>
                    </div>

                    {/* API Key Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                API Key
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="apiKey">API Key</Label>
                                <Input
                                    id="apiKey"
                                    placeholder="Cole sua API Key aqui"
                                    value={apiKey || ''}
                                    onChange={(e) => {
                                        const value = e.target.value
                                        setApiKey(value)
                                        localStorage.setItem('selectedApiKey', value)
                                    }}
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Insira a API Key que deseja usar para conectar
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Session Status */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <QrCode className="h-5 w-5" />
                                    Status da Sessão
                                </CardTitle>
                                {getStatusBadge()}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {initializing ? (
                                <div className="text-center py-8">
                                    <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
                                    <p className="text-gray-600">
                                        Carregando status...
                                    </p>
                                </div>
                            ) : !sessionCreated ? (
                                <div className="text-center py-8">
                                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-4">
                                        Nenhuma sessão ativa. Crie uma sessão para começar.
                                    </p>
                                    <Button
                                        onClick={handleCreateSession}
                                        disabled={loading || !apiKey}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Criando...
                                            </>
                                        ) : (
                                            <>
                                                <MessageSquare className="mr-2 h-4 w-4" />
                                                Criar Sessão
                                            </>
                                        )}
                                    </Button>
                                </div>
                            ) : status === 'connected' ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                    <p className="text-lg font-medium text-green-600 mb-2">
                                        WhatsApp Conectado!
                                    </p>
                                    <p className="text-gray-600 mb-4">
                                        Você pode enviar mensagens agora
                                    </p>
                                    <Button
                                        variant="destructive"
                                        onClick={handleLogout}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Desconectando...
                                            </>
                                        ) : (
                                            <>
                                                <WifiOff className="mr-2 h-4 w-4" />
                                                Desconectar
                                            </>
                                        )}
                                    </Button>
                                </div>
                            ) : qrCode ? (
                                <div className="text-center py-4">
                                    <p className="text-gray-600 mb-4">
                                        Escaneie o QR Code com seu WhatsApp
                                    </p>
                                    <div className="inline-block p-4 bg-white rounded-lg shadow-sm">
                                        <Image
                                            src={qrCode}
                                            alt="QR Code WhatsApp"
                                            width={256}
                                            height={256}
                                            className="mx-auto"
                                        />
                                    </div>
                                    <p className="text-sm text-gray-500 mt-4">
                                        O QR Code é atualizado automaticamente
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
                                    <p className="text-gray-600">
                                        Aguardando QR Code...
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Send Message */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Send className="h-5 w-5" />
                                Enviar Mensagem
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSendMessage} className="space-y-4">
                                <div>
                                    <Label htmlFor="phone">Número do WhatsApp</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="11999999999"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        disabled={status !== 'connected'}
                                        pattern="((55)?[1-9]{2}[0-9]{8,9})"
                                        required
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Formato: (55) + DDD + número (apenas números, sem espaços)
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="message">Mensagem</Label>
                                    <Textarea
                                        id="message"
                                        placeholder="Digite sua mensagem..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        disabled={status !== 'connected'}
                                        required
                                        rows={4}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={sendingMessage || status !== 'connected'}
                                    className="w-full"
                                >
                                    {sendingMessage ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Enviar Mensagem
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>


                </div>
            </div>
        </>
    )
}
