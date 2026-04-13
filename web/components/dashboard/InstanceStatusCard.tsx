import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wifi, WifiOff, QrCode, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface InstanceStatusCardProps {
    status: string
}

export function InstanceStatusCard({ status }: InstanceStatusCardProps) {
    const router = useRouter()

    const getStatusStyles = () => {
        switch (status) {
            case 'connected': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            case 'qr': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            default: return 'bg-rose-500/10 text-rose-500 border-rose-500/20'
        }
    }

    const getStatusIcon = () => {
        switch (status) {
            case 'connected': return <Wifi className="h-4 w-4" />
            case 'qr': return <QrCode className="h-4 w-4" />
            default: return <WifiOff className="h-4 w-4" />
        }
    }

    const getStatusText = () => {
        switch (status) {
            case 'connected': return 'Conectado'
            case 'qr': return 'QR Code Pendente'
            default: return 'Desconectado'
        }
    }

    return (
        <Card className="bg-white/[0.02] border-white/5 hover:border-primary/30 transition-all duration-300">
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Status da Instância</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusStyles()}`}>
                        {getStatusIcon()}
                        <span className="text-sm font-medium">{getStatusText()}</span>
                    </div>

                    <div className="flex gap-2">
                        {status === 'qr' && (
                            <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10" onClick={() => router.push('/dashboard/whatsapp')}>
                                Ver QR
                            </Button>
                        )}
                        {status !== 'connected' && status !== 'qr' && (
                            <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10" onClick={() => router.push('/dashboard/whatsapp')}>
                                Conectar
                            </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-foreground/30 hover:text-foreground hover:bg-white/5">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
