import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Info, AlertCircle } from 'lucide-react'

interface AlertCenterCardProps {
    alerts: {
        type: 'warning' | 'info' | 'error'
        message: string
    }[]
}

export function AlertCenterCard({ alerts }: AlertCenterCardProps) {
    if (alerts.length === 0) return null

    return (
        <Card className="bg-amber-500/5 border-amber-500/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-amber-500 font-bold text-sm tracking-tight">
                    <AlertTriangle className="h-4 w-4" />
                    ATENÇÃO REQUERIDA
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {alerts.map((alert, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-xs text-amber-200/80 leading-relaxed">
                            {alert.type === 'error' ? (
                                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                            ) : (
                                <Info className="h-4 w-4 shrink-0 text-amber-400" />
                            )}
                            <p>{alert.message}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
