import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from '@/components/ui/code-block';
import { Code } from 'lucide-react';

export default function ApiReference() {
    const apiRoutes = [
        {
            method: "POST",
            path: "/whatsapp",
            title: "Enviar Mensagem",
            description: "Envia uma mensagem de texto via WhatsApp",
            headers: [
                { name: "X-API-Key", type: "string", badge: "required", description: "Sua chave de API" },
                { name: "Content-Type", type: "string", badge: "required", description: "application/json" }
            ],
            bodyParams: [
                { name: "to", type: "string", badge: "required", description: "Número de destino no formato DDD + número (ex: 11999999999)" },
                { name: "type", type: "string", badge: "required", description: "Tipo da mensagem: text, image, document, audio, video" },
                { name: "message", type: "string", badge: "required", description: "Conteúdo da mensagem" }
            ],
            response: `{
  "message": "Mensagem enviada para a fila"
}`
        },
        {
            method: "GET",
            path: "/whatsapp/qrcode",
            title: "Obter QR Code",
            description: "Retorna o QR Code para autenticação do WhatsApp",
            headers: [
                { name: "X-API-Key", type: "string", badge: "required", description: "Sua chave de API" }
            ],
            response: `{
  "status": "qr_received",
  "qr": "data:image/png;base64,...."
}`
        },
        {
            method: "POST",
            path: "/whatsapp/session",
            title: "Criar Sessão WhatsApp",
            description: "Inicia uma nova sessão de autenticação WhatsApp",
            headers: [
                { name: "X-API-Key", type: "string", badge: "required", description: "Sua chave de API" }
            ],
            response: `{
  "message": "Sessão criada com sucesso"
}`
        },
        {
            method: "GET",
            path: "/whatsapp/status",
            title: "Verificar Status da Sessão",
            description: "Retorna o status atual da conexão WhatsApp",
            headers: [
                { name: "X-API-Key", type: "string", badge: "required", description: "Sua chave de API" }
            ],
            response: `{
  "status": "connected"
}`
        }
    ];

    const sessionStatuses = [
        { status: "initializing", description: "Sessão sendo criada" },
        { status: "qrcode", description: "QR válido para escanear" },
        { status: "scanning", description: "Cliente escaneando" },
        { status: "connected", description: "Sessão autenticada" },
        { status: "timeout", description: "QR expirou" },
        { status: "error", description: "Sessão falhou" }
    ];

    return (
        <div id="api-reference" className="mb-20 mt-20">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-8 flex items-center gap-3">
                <Code className="w-10 h-10 text-primary" />
                API Reference
            </h2>
            <Card className="mb-8 border-white/5 bg-white/[0.02] backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-xl">Status da Sessão</CardTitle>
                    <CardDescription className="text-foreground/50">Possíveis estados da conexão com o WhatsApp</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto rounded-xl border border-white/5">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white/5 text-foreground/40 font-bold uppercase tracking-[0.1em] text-[10px]">
                                <tr>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Significado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sessionStatuses.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4 font-mono text-primary">{item.status}</td>
                                        <td className="p-4 text-foreground/70">{item.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                {apiRoutes.map((route, index) => (
                    <Card key={index} className="border-white/5 bg-white/[0.02] backdrop-blur-sm group">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <Badge className="bg-primary text-primary-foreground border-none font-bold uppercase tracking-[0.1em] px-3 py-0.5">{route.method}</Badge>
                                        <code className="text-lg font-mono text-primary">{route.path}</code>
                                    </div>
                                    <CardTitle className="text-xl mb-2">{route.title}</CardTitle>
                                    <CardDescription className='text-foreground/50'>{route.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {route.headers && route.headers.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-4">Headers</h4>
                                    <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-3 text-sm">
                                        {route.headers.map((header, idx) => (
                                            <div key={idx} className="flex flex-wrap items-center gap-3">
                                                <code className="text-primary font-bold">{header.name}</code>
                                                <span className="text-foreground/40 text-[10px] uppercase font-bold">{header.type}</span>
                                                <Badge variant="outline" className="text-[9px] uppercase font-bold border-primary/20 text-primary/80 h-5 px-1.5">{header.badge}</Badge>
                                                <span className="text-foreground/70">{header.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {route.bodyParams && route.bodyParams.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-4">Body Parameters</h4>
                                    <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4 text-sm">
                                        {route.bodyParams.map((param, idx) => (
                                            <div key={idx} className="flex flex-wrap items-center gap-3">
                                                <code className="text-primary font-bold">{param.name}</code>
                                                <span className="text-foreground/40 text-[10px] uppercase font-bold">{param.type}</span>
                                                <Badge variant="outline" className="text-[9px] uppercase font-bold border-primary/20 text-primary/80 h-5 px-1.5">{param.badge}</Badge>
                                                <span className="text-foreground/70">{param.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {route.response && (
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-4">Response</h4>
                                    <CodeBlock code={route.response} language="json" className="bg-black/50 border-white/5 rounded-xl shadow-2xl" />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
