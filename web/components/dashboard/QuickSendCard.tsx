import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'react-hot-toast'

export function QuickSendCard() {
    const [phone, setPhone] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSend = async () => {
        if (!phone || !message) return

        setLoading(true)
        try {
            // Assuming we need an API key or session ID. 
            // But wait, sendWhatsAppMessage takes (apiKey, message).
            // The dashboard is for the logged-in user.
            // The backend endpoint /whatsapp (POST) uses @Req() req.apiKey.userId.
            // But wait, the backend controller I saw earlier:
            // @Post() sendMessage(@Body() body: SendMessageDto, @Req() req: Request & { apiKey: { userId: number } })
            // It expects req.apiKey.
            // But the dashboard is authenticated via JWT (Bearer token).
            // The WhatsappController seems to be designed for API Key usage, not Dashboard usage?

            // Let's check WhatsappController again.
            // It uses @Req() req.apiKey.

            // If I want to send from dashboard, I might need a different endpoint or update WhatsappController to support User auth (JWT).

            // For now, I will try to use the new dashboard endpoint or existing one if compatible.
            // Actually, I should probably create a method in DashboardController to send message or update WhatsappController.

            // Let's look at WhatsappController again.
            // It uses a custom guard or middleware that populates req.apiKey?
            // In AppModule: .exclude({ path: '/whatsapp', method: RequestMethod.ALL }) from AuthMiddleware.
            // So /whatsapp is NOT protected by AuthMiddleware (JWT). It likely uses ApiKeyMiddleware.

            // So I cannot use /whatsapp endpoint from the dashboard easily without an API Key.
            // I should fetch the user's API key first?
            // Or I should expose a route in DashboardController to send message using JWT.

            // Let's add sendMessage to DashboardController.

            await api.sendDashboardMessage(phone, message)
            toast.success('Mensagem enviada com sucesso!')
            setMessage('')
        } catch (error) {
            toast.error('Erro ao enviar mensagem')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Teste Rápido de Envio
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Número (com DDI)</label>
                        <Input
                            placeholder="5511999999999"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Mensagem</label>
                        <Textarea
                            placeholder="Olá, teste de envio..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <Button
                        className="w-full"
                        onClick={handleSend}
                        disabled={loading || !phone || !message}
                    >
                        {loading ? 'Enviando...' : 'Enviar Teste'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
