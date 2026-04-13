import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, ArrowDownLeft, ArrowUpRight, Webhook, AlertCircle } from 'lucide-react'

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
        { label: 'Enviadas', value: metrics.sent, icon: ArrowUpRight, isError: false },
        { label: 'Recebidas', value: metrics.received, icon: ArrowDownLeft, isError: false },
        { label: 'Webhooks', value: metrics.webhooks, icon: Webhook, isError: false },
        { label: 'Erros', value: metrics.errors, icon: AlertCircle, isError: metrics.errors > 0 },
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item) => {
                const Icon = item.icon
                return (
                    <Card key={item.label} className="bg-white/[0.02] border-white/5 hover:border-primary/30 transition-all duration-300">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1">{item.label}</p>
                                <p className="text-2xl font-bold tracking-tight">{item.value.toLocaleString()}</p>
                            </div>
                            <div className={`p-2 rounded-xl ${item.isError ? 'bg-rose-500/10 text-rose-500' : 'bg-primary/10 text-primary'}`}>
                                <Icon className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
