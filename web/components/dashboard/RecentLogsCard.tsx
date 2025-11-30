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
        <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Logs Recentes
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                        {logs.map((log, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                <div className={`p-2 rounded-full ${log.type === 'message' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                                    }`}>
                                    {log.type === 'message' ? <MessageSquare className="h-4 w-4" /> : <Webhook className="h-4 w-4" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{log.action}</p>
                                    <p className="text-xs text-gray-500 truncate">{log.details}</p>
                                </div>

                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-1 mb-1">
                                        {log.status === 'success' ?
                                            <CheckCircle className="h-3 w-3 text-green-500" /> :
                                            <AlertCircle className="h-3 w-3 text-red-500" />
                                        }
                                        <span className={`text-xs font-medium ${log.status === 'success' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {log.status === 'success' ? 'Sucesso' : 'Falha'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        {format(new Date(log.time), 'HH:mm')}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {logs.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                Nenhuma atividade recente
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
