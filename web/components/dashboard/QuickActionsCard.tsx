import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Key, MessageSquare, FileText, Settings, BookOpen, Activity } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function QuickActionsCard() {
    const router = useRouter()

    const actions = [
        { label: 'QR Code', icon: Settings, path: '/dashboard/whatsapp' },
        { label: 'Webhooks', icon: FileText, path: '/dashboard/webhooks' },
        { label: 'API Keys', icon: Key, path: '/dashboard/apikeys' },
        { label: 'Ver Logs', icon: Activity, path: '/dashboard/status' },
    ]

    return (
        <Card className="bg-white/[0.02] border-white/5 hover:border-primary/30 transition-all duration-300">
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3">
                    {actions.map((action) => {
                        const Icon = action.icon
                        return (
                            <button
                                key={action.label}
                                onClick={() => router.push(action.path)}
                                className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-primary/10 hover:border-primary/30 cursor-pointer transition-all duration-300 text-center group"
                            >
                                <div className="p-2 rounded-full bg-primary/10 mb-2 group-hover:scale-110 transition-transform">
                                    <Icon className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-tight text-foreground/70 group-hover:text-foreground">{action.label}</span>
                            </button>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
