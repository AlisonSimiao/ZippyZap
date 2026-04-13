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
        <Card className="bg-white/[0.02] border-white/5 hover:border-primary/30 transition-all duration-300">
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-foreground/50 uppercase tracking-wider flex items-center gap-2">
                    <Send className="h-4 w-4 text-primary" />
                    Envio Rápido
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-2 block">Número (com DDI)</label>
                        <Input
                            placeholder="5511999999999"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="bg-white/[0.03] border-white/5 focus-visible:ring-primary/50 transition-all h-10 placeholder:text-foreground/20"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-2 block">Mensagem</label>
                        <Textarea
                            placeholder="Olá, teste de envio..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                            className="bg-white/[0.03] border-white/5 focus-visible:ring-primary/50 transition-all resize-none placeholder:text-foreground/20"
                        />
                    </div>
                    <Button
                        className="w-full bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20 h-10 font-bold uppercase tracking-wider text-xs"
                        onClick={handleSend}
                        disabled={loading || !phone || !message}
                    >
                        {loading ? 'Enviando...' : 'Enviar Teste'}
                        <Send className="w-3.5 h-3.5 ml-2" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
