import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wifi, WifiOff, QrCode, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface InstanceStatusCardProps {
    status: string
}

export function InstanceStatusCard({ status }: InstanceStatusCardProps) {
    const router = useRouter()

    const getStatusColor = () => {
        switch (status) {
            case 'connected': return 'bg-green-100 text-green-700 border-green-200'
            case 'qr': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            default: return 'bg-red-100 text-red-700 border-red-200'
        }
    }

    const getStatusIcon = () => {
        switch (status) {
            case 'connected': return <Wifi className="h-5 w-5" />
            case 'qr': return <QrCode className="h-5 w-5" />
            default: return <WifiOff className="h-5 w-5" />
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
        <Card className={`border-l-4 ${status === 'connected' ? 'border-l-green-500' : status === 'qr' ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Status da Instância</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor()}`}>
                        {getStatusIcon()}
                        <span className="font-medium">{getStatusText()}</span>
                    </div>

                    <div className="flex gap-2">
                        {status === 'qr' && (
                            <Button size="sm" variant="outline" onClick={() => router.push('/dashboard/whatsapp')}>
                                Ver QR
                            </Button>
                        )}
                        {status !== 'connected' && status !== 'qr' && (
                            <Button size="sm" variant="outline" onClick={() => router.push('/dashboard/whatsapp')}>
                                Conectar
                            </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
