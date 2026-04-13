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
        <Card className="bg-white/[0.02] border-white/5 hover:border-primary/30 transition-all duration-300">
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-foreground/50 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Limites de Uso
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium">Mensagens Hoje</span>
                            <span className="text-foreground/50">{current.toLocaleString()} / {limit.toLocaleString()}</span>
                        </div>
                        <Progress 
                            value={percentage} 
                            className="h-2 bg-white/5" 
                            indicatorClassName="bg-primary shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                        />
                    </div>

                    <div className="flex justify-between text-xs text-foreground/30">
                        <span>Renova em: 24h</span>
                        <span className="text-primary/70 font-medium">Plano Atual</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
