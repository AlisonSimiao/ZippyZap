import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Key, MessageSquare, FileText, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function QuickActionsCard() {
    const router = useRouter()

    const actions = [
        { label: 'Ver QR Code', icon: Settings, path: '/dashboard/whatsapp', color: 'blue' },
        { label: 'Configurar Webhook', icon: FileText, path: '/dashboard/webhooks', color: 'purple' },
        { label: 'Documentação API', icon: Key, path: '/dashboard/apikeys', color: 'green' },
        { label: 'Ver Logs', icon: MessageSquare, path: '/dashboard/logs', color: 'orange' },
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3">
                    {actions.map((action) => {
                        const Icon = action.icon
                        return (
                            <div
                                key={action.label}
                                onClick={() => router.push(action.path)}
                                className="flex flex-col items-center justify-center p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors text-center"
                            >
                                <div className={`p-2 rounded-full bg-${action.color}-100 mb-2`}>
                                    <Icon className={`h-4 w-4 text-${action.color}-600`} />
                                </div>
                                <span className="text-xs font-medium">{action.label}</span>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
