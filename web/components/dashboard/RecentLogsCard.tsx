import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Activity, CheckCircle, AlertCircle, MessageSquare, Webhook } from 'lucide-react'
import { format } from 'date-fns'

interface LogItem {
    type: 'message' | 'webhook'
    action: string
    time: string
    status: 'success' | 'error'
    details: string
}

interface RecentLogsCardProps {
    logs: LogItem[]
}

export function RecentLogsCard({ logs }: RecentLogsCardProps) {
    return (
        <Card className="bg-white/[0.02] border-white/5 hover:border-primary/30 transition-all duration-300">
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-foreground/50 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Logs Recentes
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-3">
                        {logs.map((log, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group">
                                <div className={`p-2 rounded-lg ${log.type === 'message' ? 'bg-primary/10 text-primary' : 'bg-white/5 text-foreground/50'
                                    }`}>
                                    {log.type === 'message' ? <MessageSquare className="h-4 w-4" /> : <Webhook className="h-4 w-4" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{log.action}</p>
                                    <p className="text-xs text-foreground/40 truncate">{log.details}</p>
                                </div>

                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-1.5 mb-1 text-[10px] font-bold uppercase tracking-wider">
                                        {log.status === 'success' ? (
                                            <div className="flex items-center gap-1.2 text-emerald-500">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                                                SUCESSO
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.2 text-rose-500">
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]" />
                                                FALHA
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-foreground/30 font-medium">
                                        {format(new Date(log.time), 'HH:mm')}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {logs.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-foreground/20 italic text-sm">
                                <Activity className="h-8 w-8 mb-3 opacity-20" />
                                Nenhuma atividade recente
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
