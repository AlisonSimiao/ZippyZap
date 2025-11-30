import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Zap } from 'lucide-react'

interface UsageLimitsCardProps {
    current: number
    limit: number
    percentage: number
}

export function UsageLimitsCard({ current, limit, percentage }: UsageLimitsCardProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Limites de Uso
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium">Mensagens Hoje</span>
                            <span className="text-gray-500">{current} / {limit}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Renova em: 24h</span>
                        <span>Plano Gratuito</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
