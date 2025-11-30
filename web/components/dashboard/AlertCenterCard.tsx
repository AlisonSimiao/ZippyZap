import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Info } from 'lucide-react'

interface AlertCenterCardProps {
    alerts: {
        type: 'warning' | 'info' | 'error'
        message: string
    }[]
}

export function AlertCenterCard({ alerts }: AlertCenterCardProps) {
    if (alerts.length === 0) return null

    return (
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/50">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                    <AlertTriangle className="h-5 w-5" />
                    Avisos Importantes
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {alerts.map((alert, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-yellow-800">
                            <Info className="h-4 w-4 mt-0.5 shrink-0" />
                            <p>{alert.message}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
