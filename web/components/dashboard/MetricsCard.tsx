import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, ArrowDownLeft, ArrowUpRight, Webhook } from 'lucide-react'

interface MetricsCardProps {
    metrics: {
        sent: number
        received: number
        webhooks: number
        errors: number
    }
}

export function MetricsCard({ metrics }: MetricsCardProps) {
    const items = [
        { label: 'Enviadas', value: metrics.sent, icon: ArrowUpRight, color: 'blue' },
        { label: 'Recebidas', value: metrics.received, icon: ArrowDownLeft, color: 'green' },
        { label: 'Webhooks', value: metrics.webhooks, icon: Webhook, color: 'purple' },
        { label: 'Erros', value: metrics.errors, icon: MessageSquare, color: 'red' },
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((item) => {
                const Icon = item.icon
                return (
                    <Card key={item.label}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                                <p className="text-2xl font-bold">{item.value}</p>
                            </div>
                            <div className={`p-2 rounded-lg bg-${item.color}-100`}>
                                <Icon className={`h-5 w-5 text-${item.color}-600`} />
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
