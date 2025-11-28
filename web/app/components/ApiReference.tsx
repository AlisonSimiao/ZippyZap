import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code } from 'lucide-react';
import { CodeBlock } from '@/components/ui/code-block';

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
            <h2 className="text-4xl font-serif font-bold text-[#333333] mb-8 flex items-center gap-3">
                <Code className="w-10 h-10 text-[#0066FF]" />
                API Reference
            </h2>
            <Card className="mb-8 border-[#25D366]/20">
                <CardHeader>
                    <CardTitle className="text-xl">Status da Sessão</CardTitle>
                    <CardDescription>Possíveis estados da conexão com o WhatsApp</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#F5F5F5] text-[#333333]">
                                <tr>
                                    <th className="p-3 rounded-tl-lg">Status</th>
                                    <th className="p-3 rounded-tr-lg">Significado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {sessionStatuses.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="p-3 font-mono text-[#0066FF]">{item.status}</td>
                                        <td className="p-3 text-[#333333]/80">{item.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                {apiRoutes.map((route, index) => (
                    <Card key={index} className="border-[#25D366]/20">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge className="bg-[#25D366] text-white">{route.method}</Badge>
                                        <code className="text-lg font-mono">{route.path}</code>
                                    </div>
                                    <CardTitle className="text-xl">{route.title}</CardTitle>
                                    <CardDescription className='text-[#333333]/60'>{route.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {route.headers && route.headers.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-[#333333] mb-3">Headers</h4>
                                    <div className="bg-[#F5F5F5] p-4 rounded-lg space-y-2 text-sm">
                                        {route.headers.map((header, idx) => (
                                            <div key={idx} className="flex items-start gap-2">
                                                <code className="text-[#0066FF]">{header.name}</code>
                                                <span className="text-[#333333]/60">{header.type}</span>
                                                <Badge variant="outline" className="text-xs">{header.badge}</Badge>
                                                <span className="text-[#333333]/70">{header.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {route.bodyParams && route.bodyParams.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-[#333333] mb-3">Body Parameters</h4>
                                    <div className="bg-[#F5F5F5] p-4 rounded-lg space-y-3 text-sm">
                                        {route.bodyParams.map((param, idx) => (
                                            <div key={idx} className="flex items-start gap-2">
                                                <code className="text-[#0066FF]">{param.name}</code>
                                                <span className="text-[#333333]/60">{param.type}</span>
                                                <Badge variant="outline" className="text-xs">{param.badge}</Badge>
                                                <span className="text-[#333333]/70">{param.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {route.response && (
                                <div>
                                    <h4 className="font-semibold text-[#333333] mb-3">Response</h4>
                                    <CodeBlock code={route.response} language="json" />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
