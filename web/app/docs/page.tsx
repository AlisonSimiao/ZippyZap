"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    BookOpen,
    Zap,
    Shield,
    Webhook,
    Code,
    AlertTriangle,
    CheckCircle,
    ArrowRight,
    Copy,
    MessageSquare,
    ShoppingCart,
    Bell,
    Users,
    Lock,
    Activity,
    FileText,
    Server,
    Database,
    Key,
    Search
} from "lucide-react"
import { useState } from "react"
import { HEADERS } from "@/components/Header"
import ApiReference from "../components/ApiReference"
import Link from "next/link"

export default function DocsPage() {
    const [copiedCode, setCopiedCode] = useState<string | null>(null)

    const copyToClipboard = (code: string, id: string) => {
        navigator.clipboard.writeText(code)
        setCopiedCode(id)
        setTimeout(() => setCopiedCode(null), 2000)
    }

    const codeExamples = {
        sendMessage: `curl -X POST https://api.zippyzap.com/v1/messages \\
-H "X-API-Key: YOUR_API_KEY" \\
-H "Content-Type: application/json" \\
-d '{
"to": "+5511999999999",
    "type": "text",
        "message": "Olá! Sua mensagem foi enviada."
  }'`,

        sendImage: `curl -X POST https://api.zippyzap.com/v1/messages \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+5511999999999",
    "type": "image",
    "image": "https://example.com/image.jpg",
    "caption": "Confira esta imagem!"
  }'`,

        webhookExample: `{
  "event": "message.received",
  "timestamp": "2024-11-22T10:30:00Z",
  "data": {
    "messageId": "msg_abc123",
    "from": "+5511999999999",
    "to": "+5511888888888",
    "type": "text",
    "message": "Olá!",
    "timestamp": "2024-11-22T10:30:00Z"
  }
}`,

        webhookHandler: `// Node.js/Express exemplo
app.post('/webhook', (req, res) => {
  const { event, data } = req.body;
  
  switch(event) {
    case 'message.received':
      console.log('Nova mensagem:', data.message);
      // Processar mensagem recebida
      break;
    case 'message.sent':
      console.log('Mensagem enviada:', data.messageId);
      break;
    case 'message.delivered':
      console.log('Mensagem entregue:', data.messageId);
      break;
    case 'message.read':
      console.log('Mensagem lida:', data.messageId);
      break;
  }
  
  res.status(200).send('OK');
});`,

        nodeExample: `const axios = require('axios');

async function sendWhatsAppMessage() {
  try {
    const response = await axios.post(
      'https://api.zippyzap.com/v1/messages',
      {
        to: '+5511999999999',
        type: 'text',
        message: 'Olá! Sua mensagem foi enviada.'
      },
      {
        headers: {
          'X-API-Key': 'YOUR_API_KEY',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Mensagem enviada:', response.data);
  } catch (error) {
    console.error('Erro:', error.response.data);
  }
}`,

        pythonExample: `import requests

def send_whatsapp_message():
    url = "https://api.zippyzap.com/v1/messages"
    headers = {
        "X-API-Key": "YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    data = {
        "to": "+5511999999999",
        "type": "text",
        "message": "Olá! Sua mensagem foi enviada."
    }
    
    response = requests.post(url, json=data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

send_whatsapp_message()`,
    }

    return (
        <div className="min-h-screen bg-white">
            <HEADERS.HeaderLp />

            {/* Hero Section */}
            <section className="py-20 px-4 bg-gradient-to-br from-[#25D366]/10 via-white to-[#FFD700]/10">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center">
                        <Badge variant="secondary" className="mb-6 bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Documentação Completa
                        </Badge>
                        <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#333333] mb-6 leading-tight">
                            Documentação <span className="text-[#0066FF]">ZippyZap</span>
                        </h1>
                        <p className="text-xl text-[#333333]/70 mb-8 max-w-3xl mx-auto">
                            Tudo que você precisa saber para integrar WhatsApp em suas aplicações de forma profissional,
                            segura e escalável.
                        </p>
                    </div>
                </div>
            </section>

            {/* Quick Navigation */}
            <section className="py-12 px-4 bg-white border-b border-gray-200">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[
                            { icon: BookOpen, label: "Introdução", href: "#intro" },
                            { icon: Zap, label: "Casos de Uso", href: "#use-cases" },
                            { icon: Code, label: "Como Usar", href: "#how-to-use" },
                            { icon: Webhook, label: "Webhooks", href: "#webhooks" },
                            { icon: Shield, label: "Segurança", href: "#security" },
                            { icon: AlertTriangle, label: "Limites", href: "#limits" },
                        ].map((item, idx) => (
                            <a
                                key={idx}
                                href={item.href}
                                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-[#F5F5F5] transition-colors"
                            >
                                <item.icon className="w-6 h-6 text-[#25D366]" />
                                <span className="text-sm font-medium text-[#333333]">{item.label}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-6xl">

                    {/* Introdução */}
                    <div id="intro" className="mb-20">
                        <h2 className="text-4xl font-serif font-bold text-[#333333] mb-8 flex items-center gap-3">
                            <BookOpen className="w-10 h-10 text-[#25D366]" />
                            Sobre o ZippyZap
                        </h2>

                        <div className="prose prose-lg max-w-none">
                            <p className="text-lg text-[#333333]/80 mb-6 leading-relaxed">
                                O <strong>ZippyZap</strong> é uma plataforma completa de API WhatsApp Business que permite
                                integrar funcionalidades de mensageria WhatsApp em suas aplicações, sistemas e processos de
                                negócio de forma simples, rápida e confiável.
                            </p>

                            <div className="grid md:grid-cols-3 gap-6 my-8">
                                <Card className="border-[#25D366]/20">
                                    <CardHeader>
                                        <Zap className="w-8 h-8 text-[#FFD700] mb-2" />
                                        <CardTitle className="text-xl">Rápido</CardTitle>
                                        <CardDescription>
                                            Integração em minutos com nossa API RESTful intuitiva
                                        </CardDescription>
                                    </CardHeader>
                                </Card>

                                <Card className="border-[#25D366]/20">
                                    <CardHeader>
                                        <Shield className="w-8 h-8 text-[#0066FF] mb-2" />
                                        <CardTitle className="text-xl">Seguro</CardTitle>
                                        <CardDescription>
                                            Autenticação robusta, rate limiting e proteção contra abusos
                                        </CardDescription>
                                    </CardHeader>
                                </Card>

                                <Card className="border-[#25D366]/20">
                                    <CardHeader>
                                        <Activity className="w-8 h-8 text-[#25D366] mb-2" />
                                        <CardTitle className="text-xl">Escalável</CardTitle>
                                        <CardDescription>
                                            Infraestrutura preparada para milhares de mensagens por minuto
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </div>

                            <h3 className="text-2xl font-bold text-[#333333] mt-12 mb-4">Principais Recursos</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {[
                                    "Envio de mensagens de texto, imagens, documentos e mídias",
                                    "Webhooks em tempo real para receber mensagens e status",
                                    "Autenticação segura via API Keys",
                                    "Rate limiting inteligente por plano",
                                    "Suporte a múltiplas sessões WhatsApp",
                                    "Dashboard completo para gerenciamento",
                                    "Logs detalhados de todas as operações",
                                    "Documentação completa e exemplos de código",
                                ].map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-[#25D366] mt-1 flex-shrink-0" />
                                        <span className="text-[#333333]/80">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Casos de Uso */}
                    <div id="use-cases" className="mb-20">
                        <h2 className="text-4xl font-serif font-bold text-[#333333] mb-8 flex items-center gap-3">
                            <Zap className="w-10 h-10 text-[#FFD700]" />
                            Casos de Uso
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <ShoppingCart className="w-10 h-10 text-[#25D366] mb-3" />
                                    <CardTitle className="text-2xl">E-commerce</CardTitle>
                                    <CardDescription className="text-base">
                                        Automatize notificações de pedidos, atualizações de entrega e suporte ao cliente
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-[#333333]/70">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                            Confirmação de pedidos em tempo real
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                            Rastreamento de entregas
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                            Recuperação de carrinho abandonado
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                            Promoções e ofertas personalizadas
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <Bell className="w-10 h-10 text-[#FFD700] mb-3" />
                                    <CardTitle className="text-2xl">Notificações</CardTitle>
                                    <CardDescription className="text-base">
                                        Envie alertas, lembretes e notificações importantes para seus usuários
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-[#333333]/70">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#FFD700]" />
                                            Lembretes de agendamentos
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#FFD700]" />
                                            Alertas de segurança (2FA)
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#FFD700]" />
                                            Atualizações de sistema
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#FFD700]" />
                                            Confirmações de transações
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <Users className="w-10 h-10 text-[#0066FF] mb-3" />
                                    <CardTitle className="text-2xl">Marketing</CardTitle>
                                    <CardDescription className="text-base">
                                        Campanhas de marketing direto com alto engajamento
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-[#333333]/70">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#0066FF]" />
                                            Campanhas promocionais segmentadas
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#0066FF]" />
                                            Newsletters e atualizações
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#0066FF]" />
                                            Pesquisas de satisfação
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#0066FF]" />
                                            Programas de fidelidade
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <MessageSquare className="w-10 h-10 text-[#25D366] mb-3" />
                                    <CardTitle className="text-2xl">Atendimento</CardTitle>
                                    <CardDescription className="text-base">
                                        Suporte ao cliente automatizado e eficiente
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-[#333333]/70">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                            Chatbots inteligentes
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                            Respostas automáticas
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                            Tickets de suporte
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                            FAQ automatizado
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Como Usar */}
                    <div id="how-to-use" className="mb-20">
                        <h2 className="text-4xl font-serif font-bold text-[#333333] mb-8 flex items-center gap-3">
                            <Code className="w-10 h-10 text-[#0066FF]" />
                            Como Utilizar
                        </h2>

                        <div className="space-y-8">
                            {/* Passo 1 */}
                            <Card className="border-[#25D366]/20">
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center text-black font-bold text-xl">
                                            1
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl">Crie sua Conta</CardTitle>
                                            <CardDescription className="text-base">
                                                Registre-se gratuitamente e receba 1000 mensagens para testar
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-[#333333]/70 mb-4">
                                        Acesse a plataforma e crie sua conta em menos de 2 minutos. Você receberá acesso
                                        imediato ao dashboard e poderá começar a testar a API.
                                    </p>
                                    <Button className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90">
                                        Criar Conta Grátis
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Passo 2 */}
                            <Card className="border-[#25D366]/20">
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center text-black font-bold text-xl">
                                            2
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl">Gere sua API Key</CardTitle>
                                            <CardDescription className="text-base">
                                                Crie uma chave de API para autenticar suas requisições
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-[#333333]/70 mb-4">
                                        No dashboard, acesse a seção "API Keys" e gere uma nova chave. Guarde-a em local seguro,
                                        pois ela será necessária para todas as chamadas à API.
                                    </p>
                                    <div className="bg-[#F5F5F5] p-4 rounded-lg border border-gray-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-[#333333]">Exemplo de API Key:</span>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => copyToClipboard("zapi_live_abc123def456ghi789", "apikey")}
                                            >
                                                {copiedCode === "apikey" ? (
                                                    <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                        <code className="text-sm text-[#333333]/80">zapi_live_abc123def456ghi789</code>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Passo 3 */}
                            <Card className="border-[#25D366]/20">
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center text-black font-bold text-xl">
                                            3
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl">Configure o WhatsApp</CardTitle>
                                            <CardDescription className="text-base">
                                                Conecte sua conta WhatsApp escaneando o QR Code
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-[#333333]/70 mb-4">
                                        Acesse a seção "WhatsApp" no dashboard e escaneie o QR Code com seu WhatsApp.
                                        Sua sessão ficará ativa e pronta para enviar mensagens.
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-[#333333]/60">
                                        <AlertTriangle className="w-4 h-4 text-[#FFD700]" />
                                        <span>Mantenha seu WhatsApp conectado à internet para receber mensagens</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Passo 4 */}
                            <Card className="border-[#25D366]/20">
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center text-black font-bold text-xl">
                                            4
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl">Envie sua Primeira Mensagem</CardTitle>
                                            <CardDescription className="text-base">
                                                Faça sua primeira chamada à API e envie uma mensagem
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Tabs defaultValue="curl" className="w-full">
                                        <TabsList className="grid w-full grid-cols-3 mb-4">
                                            <TabsTrigger value="curl">cURL</TabsTrigger>
                                            <TabsTrigger value="node">Node.js</TabsTrigger>
                                            <TabsTrigger value="python">Python</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="curl">
                                            <div className="relative">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="absolute top-2 right-2 z-10"
                                                    onClick={() => copyToClipboard(codeExamples.sendMessage, "curl")}
                                                >
                                                    {copiedCode === "curl" ? (
                                                        <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </Button>
                                                <pre className="bg-[#1e1e1e] text-white p-4 rounded-lg overflow-auto">
                                                    <code className="text-sm">{codeExamples.sendMessage}</code>
                                                </pre>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="node">
                                            <div className="relative">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="absolute top-2 right-2 z-10"
                                                    onClick={() => copyToClipboard(codeExamples.nodeExample, "node")}
                                                >
                                                    {copiedCode === "node" ? (
                                                        <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </Button>
                                                <pre className="bg-[#1e1e1e] text-white p-4 rounded-lg overflow-auto">
                                                    <code className="text-sm">{codeExamples.nodeExample}</code>
                                                </pre>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="python">
                                            <div className="relative">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="absolute top-2 right-2 z-10"
                                                    onClick={() => copyToClipboard(codeExamples.pythonExample, "python")}
                                                >
                                                    {copiedCode === "python" ? (
                                                        <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </Button>
                                                <pre className="bg-[#1e1e1e] text-white p-4 rounded-lg overflow-auto">
                                                    <code className="text-sm">{codeExamples.pythonExample}</code>
                                                </pre>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Webhooks */}
                    <div id="webhooks" className="mb-20">
                        <h2 className="text-4xl font-serif font-bold text-[#333333] mb-8 flex items-center gap-3">
                            <Webhook className="w-10 h-10 text-[#25D366]" />
                            Webhooks
                        </h2>

                        <div className="space-y-6">
                            <Card className="border-[#25D366]/20">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Como Funcionam os Webhooks</CardTitle>
                                    <CardDescription className="text-base">
                                        Receba notificações em tempo real sobre eventos do WhatsApp
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-[#333333]/80">
                                        Webhooks são chamadas HTTP POST que o ZippyZap faz para sua aplicação quando eventos
                                        importantes acontecem, como recebimento de mensagens, confirmações de entrega, leitura, etc.
                                    </p>

                                    <div className="bg-[#F5F5F5] p-6 rounded-lg border border-gray-200">
                                        <h4 className="font-semibold text-[#333333] mb-4 flex items-center gap-2">
                                            <Server className="w-5 h-5 text-[#25D366]" />
                                            Configuração do Webhook
                                        </h4>
                                        <ol className="space-y-3 text-sm text-[#333333]/80">
                                            <li className="flex items-start gap-3">
                                                <span className="w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center text-black font-bold text-xs flex-shrink-0">
                                                    1
                                                </span>
                                                <span>Acesse o dashboard e vá para "Configurações → Webhooks"</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center text-black font-bold text-xs flex-shrink-0">
                                                    2
                                                </span>
                                                <span>Insira a URL do seu endpoint (ex: https://seusite.com/webhook)</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center text-black font-bold text-xs flex-shrink-0">
                                                    3
                                                </span>
                                                <span>Selecione os eventos que deseja receber</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center text-black font-bold text-xs flex-shrink-0">
                                                    4
                                                </span>
                                                <span>Salve e teste a conexão</span>
                                            </li>
                                        </ol>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                                            <h5 className="font-semibold text-[#333333] mb-3 flex items-center gap-2">
                                                <Activity className="w-5 h-5 text-[#25D366]" />
                                                Eventos Disponíveis
                                            </h5>
                                            <ul className="space-y-2 text-sm text-[#333333]/70">
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                                    <code className="text-xs bg-[#F5F5F5] px-2 py-1 rounded">message.received</code>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                                    <code className="text-xs bg-[#F5F5F5] px-2 py-1 rounded">message.sent</code>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                                    <code className="text-xs bg-[#F5F5F5] px-2 py-1 rounded">message.delivered</code>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                                    <code className="text-xs bg-[#F5F5F5] px-2 py-1 rounded">message.read</code>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                                    <code className="text-xs bg-[#F5F5F5] px-2 py-1 rounded">message.failed</code>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                                    <code className="text-xs bg-[#F5F5F5] px-2 py-1 rounded">session.connected</code>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                                    <code className="text-xs bg-[#F5F5F5] px-2 py-1 rounded">session.disconnected</code>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                                            <h5 className="font-semibold text-[#333333] mb-3 flex items-center gap-2">
                                                <Shield className="w-5 h-5 text-[#0066FF]" />
                                                Segurança
                                            </h5>
                                            <ul className="space-y-2 text-sm text-[#333333]/70">
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="w-4 h-4 text-[#0066FF] mt-0.5" />
                                                    <span>Todas as requisições incluem header <code className="text-xs bg-[#F5F5F5] px-1 py-0.5 rounded">X-Webhook-Signature</code></span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="w-4 h-4 text-[#0066FF] mt-0.5" />
                                                    <span>Valide a assinatura usando seu webhook secret</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="w-4 h-4 text-[#0066FF] mt-0.5" />
                                                    <span>Use HTTPS para receber webhooks</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="w-4 h-4 text-[#0066FF] mt-0.5" />
                                                    <span>Responda com status 200 em até 5 segundos</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-[#25D366]/20">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Exemplo de Payload</CardTitle>
                                    <CardDescription className="text-base">
                                        Estrutura de dados recebida no webhook
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="absolute top-2 right-2 z-10"
                                            onClick={() => copyToClipboard(codeExamples.webhookExample, "webhook")}
                                        >
                                            {copiedCode === "webhook" ? (
                                                <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </Button>
                                        <pre className="bg-[#1e1e1e] text-white p-4 rounded-lg overflow-auto">
                                            <code className="text-sm">{codeExamples.webhookExample}</code>
                                        </pre>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-[#25D366]/20">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Implementação do Handler</CardTitle>
                                    <CardDescription className="text-base">
                                        Exemplo de como processar webhooks em Node.js
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="absolute top-2 right-2 z-10"
                                            onClick={() => copyToClipboard(codeExamples.webhookHandler, "handler")}
                                        >
                                            {copiedCode === "handler" ? (
                                                <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </Button>
                                        <pre className="bg-[#1e1e1e] text-white p-4 rounded-lg overflow-auto">
                                            <code className="text-sm">{codeExamples.webhookHandler}</code>
                                        </pre>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Segurança e Prevenção de Abusos */}
                    <div id="security" className="mb-20">
                        <h2 className="text-4xl font-serif font-bold text-[#333333] mb-8 flex items-center gap-3">
                            <Shield className="w-10 h-10 text-[#0066FF]" />
                            Segurança e Prevenção de Abusos
                        </h2>

                        <div className="space-y-6">
                            <Card className="border-[#0066FF]/20">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Mecanismos de Segurança</CardTitle>
                                    <CardDescription className="text-base">
                                        Como protegemos sua conta e prevenimos uso indevido
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <Key className="w-6 h-6 text-[#0066FF] mt-1 flex-shrink-0" />
                                                <div>
                                                    <h4 className="font-semibold text-[#333333] mb-1">Autenticação por API Key</h4>
                                                    <p className="text-sm text-[#333333]/70">
                                                        Todas as requisições devem incluir uma API Key válida no header
                                                        <code className="mx-1 text-xs bg-[#F5F5F5] px-1 py-0.5 rounded">X-API-Key</code>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <Activity className="w-6 h-6 text-[#0066FF] mt-1 flex-shrink-0" />
                                                <div>
                                                    <h4 className="font-semibold text-[#333333] mb-1">Rate Limiting</h4>
                                                    <p className="text-sm text-[#333333]/70">
                                                        Limites de requisições por minuto baseados no seu plano para evitar sobrecarga
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <Lock className="w-6 h-6 text-[#0066FF] mt-1 flex-shrink-0" />
                                                <div>
                                                    <h4 className="font-semibold text-[#333333] mb-1">Criptografia TLS</h4>
                                                    <p className="text-sm text-[#333333]/70">
                                                        Todas as comunicações são criptografadas usando TLS 1.3
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <Database className="w-6 h-6 text-[#0066FF] mt-1 flex-shrink-0" />
                                                <div>
                                                    <h4 className="font-semibold text-[#333333] mb-1">Logs de Auditoria</h4>
                                                    <p className="text-sm text-[#333333]/70">
                                                        Todas as ações são registradas para análise e detecção de anomalias
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="w-6 h-6 text-[#FFD700] mt-1 flex-shrink-0" />
                                                <div>
                                                    <h4 className="font-semibold text-[#333333] mb-1">Detecção de Spam</h4>
                                                    <p className="text-sm text-[#333333]/70">
                                                        Sistema automático identifica e bloqueia padrões de spam
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <Shield className="w-6 h-6 text-[#0066FF] mt-1 flex-shrink-0" />
                                                <div>
                                                    <h4 className="font-semibold text-[#333333] mb-1">Validação de Conteúdo</h4>
                                                    <p className="text-sm text-[#333333]/70">
                                                        Verificação automática de conteúdo suspeito ou malicioso
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-[#FFD700]/20 bg-[#FFD700]/5">
                                <CardHeader>
                                    <CardTitle className="text-2xl flex items-center gap-2">
                                        <AlertTriangle className="w-6 h-6 text-[#FFD700]" />
                                        Políticas de Uso Aceitável
                                    </CardTitle>
                                    <CardDescription className="text-base">
                                        Práticas proibidas que podem resultar em suspensão da conta
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {[
                                            "Envio de spam ou mensagens não solicitadas em massa",
                                            "Compartilhamento de conteúdo ilegal, ofensivo ou malicioso",
                                            "Uso da API para phishing, fraudes ou golpes",
                                            "Tentativas de burlar limites de rate limiting",
                                            "Compartilhamento de API Keys com terceiros não autorizados",
                                            "Uso de múltiplas contas para contornar limites",
                                            "Envio de mensagens para números sem consentimento prévio",
                                            "Violação das políticas do WhatsApp Business",
                                        ].map((policy, idx) => (
                                            <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-[#FFD700]/20">
                                                <AlertTriangle className="w-5 h-5 text-[#FFD700] mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-[#333333]/80">{policy}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-[#25D366]/20">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Boas Práticas</CardTitle>
                                    <CardDescription className="text-base">
                                        Recomendações para uso seguro e eficiente da API
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {[
                                            {
                                                title: "Obtenha Consentimento",
                                                description: "Sempre obtenha permissão antes de enviar mensagens para um número"
                                            },
                                            {
                                                title: "Respeite Horários",
                                                description: "Evite enviar mensagens em horários inadequados (noite/madrugada)"
                                            },
                                            {
                                                title: "Ofereça Opt-out",
                                                description: "Permita que usuários cancelem o recebimento de mensagens facilmente"
                                            },
                                            {
                                                title: "Mantenha API Keys Seguras",
                                                description: "Nunca exponha suas chaves em código público ou frontend"
                                            },
                                            {
                                                title: "Monitore Uso",
                                                description: "Acompanhe métricas e logs para detectar anomalias rapidamente"
                                            },
                                            {
                                                title: "Use Webhooks",
                                                description: "Implemente webhooks para rastrear status e evitar reenvios desnecessários"
                                            },
                                            {
                                                title: "Valide Números",
                                                description: "Verifique formato e validade dos números antes de enviar"
                                            },
                                            {
                                                title: "Implemente Retry Logic",
                                                description: "Use backoff exponencial para retentar mensagens falhadas"
                                            },
                                        ].map((practice, idx) => (
                                            <div key={idx} className="flex items-start gap-3 p-4 bg-[#F5F5F5] rounded-lg">
                                                <CheckCircle className="w-5 h-5 text-[#25D366] mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <h4 className="font-semibold text-[#333333] mb-1">{practice.title}</h4>
                                                    <p className="text-sm text-[#333333]/70">{practice.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <ApiReference />

                    {/* FAQ */}
                    <div id="faq" className="mb-20">
                        <h2 className="text-4xl font-serif font-bold text-[#333333] mb-8 flex items-center gap-3">
                            <MessageSquare className="w-10 h-10 text-[#25D366]" />
                            Perguntas Frequentes (FAQ)
                        </h2>

                        <div className="space-y-4">
                            <Card className="border-gray-200">
                                <CardHeader>
                                    <CardTitle className="text-lg">Como obtenho minha API Key?</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-[#333333]/70">
                                        Após criar sua conta, acesse o dashboard e vá para a seção "API Keys".
                                        Clique em "Criar Nova Chave", dê um nome descritivo e a chave será gerada instantaneamente.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-gray-200">
                                <CardHeader>
                                    <CardTitle className="text-lg">Preciso de um número WhatsApp Business oficial?</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-[#333333]/70">
                                        Não! O ZippyZap funciona com WhatsApp regular (não Business). Você pode usar seu número WhatsApp pessoal ou criar um novo número.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-gray-200">
                                <CardHeader>
                                    <CardTitle className="text-lg">Qual é o limite de mensagens por segundo?</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-[#333333]/70">
                                        Os limites variam por plano: Free (10 req/min), Pro (100 req/min), Enterprise (customizado).
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Limites e Planos */}
                    <div id="limits" className="mb-20">
                        <h2 className="text-4xl font-serif font-bold text-[#333333] mb-8 flex items-center gap-3">
                            <Activity className="w-10 h-10 text-[#25D366]" />
                            Limites e Planos
                        </h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            <Card className="border-gray-200">
                                <CardHeader>
                                    <Badge className="w-fit mb-2 bg-gray-100 text-gray-700">Free</Badge>
                                    <CardTitle className="text-2xl">Plano Gratuito</CardTitle>
                                    <CardDescription>Perfeito para testes e projetos pequenos</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-3xl font-bold text-[#333333]">
                                        1.000
                                        <span className="text-lg font-normal text-[#333333]/60">/mês</span>
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                            1.000 mensagens/mês
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                            10 req/minuto
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                            1 sessão WhatsApp
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                            Webhooks básicos
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                            Suporte por email
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-[#25D366] shadow-lg">
                                <CardHeader>
                                    <Badge className="w-fit mb-2 bg-[#25D366] text-white">Pro</Badge>
                                    <CardTitle className="text-2xl">Plano Pro</CardTitle>
                                    <CardDescription>Para empresas em crescimento</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-3xl font-bold text-[#333333]">
                                        50.000
                                        <span className="text-lg font-normal text-[#333333]/60">/mês</span>
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                            50.000 mensagens/mês
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                            100 req/minuto
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                            5 sessões WhatsApp
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                            Webhooks avançados
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                            Suporte prioritário
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#25D366]" />
                                            Analytics detalhado
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-[#0066FF]">
                                <CardHeader>
                                    <Badge className="w-fit mb-2 bg-[#0066FF] text-white">Enterprise</Badge>
                                    <CardTitle className="text-2xl">Plano Enterprise</CardTitle>
                                    <CardDescription>Soluções customizadas</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-3xl font-bold text-[#333333]">
                                        Ilimitado
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#0066FF]" />
                                            Mensagens ilimitadas
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#0066FF]" />
                                            Rate limit customizado
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#0066FF]" />
                                            Sessões ilimitadas
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#0066FF]" />
                                            Webhooks customizados
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#0066FF]" />
                                            Suporte 24/7
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#0066FF]" />
                                            SLA garantido
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#0066FF]" />
                                            Infraestrutura dedicada
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* CTA Final */}
                    <Card className="border-[#25D366] bg-gradient-to-br from-[#25D366]/5 to-[#FFD700]/5">
                        <CardContent className="p-12 text-center">
                            <h2 className="text-3xl font-serif font-bold text-[#333333] mb-4">
                                Pronto para Começar?
                            </h2>
                            <p className="text-lg text-[#333333]/70 mb-8 max-w-2xl mx-auto">
                                Crie sua conta gratuitamente e comece a enviar mensagens WhatsApp em minutos
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button size="lg" className="text-lg px-8 bg-[#FFD700] text-black hover:bg-[#FFD700]/90">
                                    Começar Agora
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="text-lg px-8 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
                                >
                                    <FileText className="w-5 h-5 mr-2" />
                                    API Reference
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div >
            </section >

            {/* Footer */}
            < footer className="py-12 px-4 border-t border-gray-200 bg-[#F5F5F5]" >
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-[#FFD700] rounded-lg flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-black" />
                                </div>
                                <span className="text-xl font-serif font-bold text-[#333333]">ZippyZap</span>
                            </div>
                            <p className="text-[#333333]/70 text-sm">
                                A API WhatsApp mais confiável para desenvolvedores e empresas.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-[#333333] mb-4">Produto</h4>
                            <ul className="space-y-2 text-sm text-[#333333]/70">
                                <li><a href="#" className="hover:text-[#333333] transition-colors">Recursos</a></li>
                                <li><a href="#" className="hover:text-[#333333] transition-colors">Preços</a></li>
                                <li><a href="#" className="hover:text-[#333333] transition-colors">Status</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-[#333333] mb-4">Desenvolvedores</h4>
                            <ul className="space-y-2 text-sm text-[#333333]/70">
                                <li><Link href="/docs" className="hover:text-[#333333] transition-colors">Documentação</Link></li>
                                <li><Link href="/docs#api-reference" className="hover:text-[#333333] transition-colors">API Reference</Link></li>
                                <li><a href="#" className="hover:text-[#333333] transition-colors">Exemplos</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-[#333333] mb-4">Suporte</h4>
                            <ul className="space-y-2 text-sm text-[#333333]/70">
                                <li><a href="#" className="hover:text-[#333333] transition-colors">Central de Ajuda</a></li>
                                <li><a href="#" className="hover:text-[#333333] transition-colors">Contato</a></li>
                                <li><a href="#" className="hover:text-[#333333] transition-colors">Comunidade</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-[#333333]/70">© 2024 ZippyZap. Todos os direitos reservados.</p>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <a href="#" className="text-[#333333]/70 hover:text-[#333333] transition-colors text-sm">Privacidade</a>
                            <a href="#" className="text-[#333333]/70 hover:text-[#333333] transition-colors text-sm">Termos</a>
                            <a href="#" className="text-[#333333]/70 hover:text-[#333333] transition-colors text-sm">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer >
        </div >
    )
}