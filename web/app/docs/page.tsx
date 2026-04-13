"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Activity,
    AlertTriangle,
    ArrowRight,
    Bell,
    BookOpen,
    CheckCircle,
    Code,
    Database,
    FileText,
    Key,
    Lock,
    MessageSquare,
    Server,
    Shield,
    ShoppingCart,
    Users,
    Webhook,
    Zap
} from "lucide-react"

import { HEADERS } from "@/components/Header"
import { CodeBlock } from "@/components/ui/code-block"
import Link from "next/link"
import Logo from "@/components/logo"
import ApiReference from "../components/ApiReference"

export default function DocsPage() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zippyzap.online'

    const codeExamples = {
        sendMessage: `curl -X POST ${apiUrl}/whatsapp \\\\
-H "X-API-Key: YOUR_API_KEY" \\
-H "Content-Type: application/json" \\
-d '{
  "to": "11999999999",
  "type": "text",
  "message": "Olá! Sua mensagem foi enviada."
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
      '${apiUrl}/whatsapp',
      {
        to: '11999999999',
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
    url = "${apiUrl}/whatsapp"
    headers = {
        "X-API-Key": "YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    data = {
        "to": "11999999999",
        "type": "text",
        "message": "Olá! Sua mensagem foi enviada."
    }
    
    response = requests.post(url, json=data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

send_whatsapp_message()`,
    }

    // Structured Data for SEO
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://zippyzap.online'

    const techArticleSchema = {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": "Documentação ZippyZap - API WhatsApp Business",
        "description": "Documentação completa da API WhatsApp Business do ZippyZap com exemplos de código, webhooks e guias de integração",
        "author": {
            "@type": "Organization",
            "name": "ZippyZap"
        },
        "publisher": {
            "@type": "Organization",
            "name": "ZippyZap",
            "logo": {
                "@type": "ImageObject",
                "url": `${baseUrl}/logo.png`
            }
        },
        "datePublished": "2024-01-01",
        "dateModified": new Date().toISOString().split('T')[0]
    }

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": baseUrl
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Documentação",
                "item": `${baseUrl}/docs`
            }
        ]
    }

    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "Como integrar a API WhatsApp do ZippyZap",
        "description": "Guia passo a passo para integrar a API WhatsApp em sua aplicação",
        "step": [
            {
                "@type": "HowToStep",
                "position": 1,
                "name": "Criar conta",
                "text": "Registre-se gratuitamente e receba 1000 mensagens para testar"
            },
            {
                "@type": "HowToStep",
                "position": 2,
                "name": "Gerar API Key",
                "text": "Crie uma chave de API para autenticar suas requisições"
            },
            {
                "@type": "HowToStep",
                "position": 3,
                "name": "Configurar WhatsApp",
                "text": "Conecte sua conta WhatsApp escaneando o QR Code"
            },
            {
                "@type": "HowToStep",
                "position": 4,
                "name": "Enviar mensagem",
                "text": "Faça sua primeira chamada à API e envie uma mensagem"
            }
        ]
    }

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />

            <HEADERS.HeaderLp />

            {/* Hero Section */}
            <section className="relative py-24 px-4 overflow-hidden border-b border-white/5">
                {/* Background glow effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-primary/10 blur-[100px] rounded-full" />
                </div>
                
                <div className="container mx-auto max-w-6xl relative">
                    <div className="text-center">
                        <Badge variant="secondary" className="mb-6 bg-primary/15 text-primary border-primary/20 px-4 py-1.5 backdrop-blur-sm">
                            <BookOpen className="w-3.5 h-3.5 mr-2" />
                            Documentação Completa
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-[1.1] tracking-tight">
                            Documentação <span className="text-primary">ZippyZap</span>
                        </h1>
                        <p className="text-xl text-foreground/60 mb-10 leading-relaxed max-w-3xl mx-auto">
                            Tudo que você precisa saber para integrar WhatsApp em suas aplicações de forma profissional,
                            segura e escalável.
                        </p>
                    </div>
                </div>
            </section>

            {/* Quick Navigation */}
            <section className="py-12 px-4 bg-background border-b border-white/5 relative">
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
                                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/5 transition-all group"
                            >
                                <item.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 group-hover:text-primary transition-colors">{item.label}</span>
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
                        <h2 className="text-4xl font-serif font-bold text-foreground mb-8 flex items-center gap-3">
                            <BookOpen className="w-10 h-10 text-primary" />
                            Sobre o ZippyZap
                        </h2>

                        <div className="prose prose-invert prose-lg max-w-none">
                            <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
                                O <strong>ZippyZap</strong> é uma plataforma completa de API WhatsApp Business que permite
                                integrar funcionalidades de mensageria WhatsApp em suas aplicações, sistemas e processos de
                                negócio de forma simples, rápida e confiável.
                            </p>

                            <div className="grid md:grid-cols-3 gap-6 my-8">
                                <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
                                    <CardHeader>
                                        <Zap className="w-8 h-8 text-primary mb-2" />
                                        <CardTitle className="text-xl">Rápido</CardTitle>
                                        <CardDescription className="text-foreground/50">
                                            Integração em minutos com nossa API RESTful intuitiva
                                        </CardDescription>
                                    </CardHeader>
                                </Card>

                                <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
                                    <CardHeader>
                                        <Shield className="w-8 h-8 text-primary mb-2" />
                                        <CardTitle className="text-xl">Seguro</CardTitle>
                                        <CardDescription className="text-foreground/50">
                                            Autenticação robusta, rate limiting e proteção contra abusos
                                        </CardDescription>
                                    </CardHeader>
                                </Card>

                                <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
                                    <CardHeader>
                                        <Activity className="w-8 h-8 text-primary mb-2" />
                                        <CardTitle className="text-xl">Escalável</CardTitle>
                                        <CardDescription className="text-foreground/50">
                                            Infraestrutura preparada para milhares de mensagens por minuto
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </div>

                            <h3 className="text-2xl font-bold text-foreground mt-12 mb-4">Principais Recursos</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {[
                                    "Envio de mensagens de texto via API REST",
                                    "Webhooks em tempo real para receber mensagens e status",
                                    "Autenticação segura via API Keys",
                                    "Rate limiting inteligente por plano",
                                    "Suporte a múltiplas sessões WhatsApp",
                                    "Dashboard completo para gerenciamento",
                                    "Logs detalhados de todas as operações",
                                    "Documentação completa e exemplos de código",
                                ].map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                                        <span className="text-foreground/80">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Casos de Uso */}
                    <div id="use-cases" className="mb-20">
                        <h2 className="text-4xl font-serif font-bold text-foreground mb-8 flex items-center gap-3">
                            <Zap className="w-10 h-10 text-primary" />
                            Casos de Uso
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all backdrop-blur-sm group">
                                <CardHeader>
                                    <ShoppingCart className="w-10 h-10 text-primary mb-3 transition-transform group-hover:scale-110" />
                                    <CardTitle className="text-2xl">E-commerce</CardTitle>
                                    <CardDescription className="text-base text-foreground/50">
                                        Automatize notificações de pedidos, atualizações de entrega e suporte ao cliente
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-foreground/70">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-primary" />
                                            Confirmação de pedidos em tempo real
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-primary" />
                                            Rastreamento de entregas
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-primary" />
                                            Recuperação de carrinho abandonado
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-primary" />
                                            Promoções e ofertas personalizadas
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all backdrop-blur-sm group">
                                <CardHeader>
                                    <Bell className="w-10 h-10 text-primary mb-3 transition-transform group-hover:scale-110" />
                                    <CardTitle className="text-2xl">Notificações</CardTitle>
                                    <CardDescription className="text-base text-foreground/50">
                                        Envie alertas, lembretes e notificações importantes para seus usuários
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-foreground/70">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-primary" />
                                            Lembretes de agendamentos
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-primary" />
                                            Alertas de segurança (2FA)
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-primary" />
                                            Atualizações de sistema
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-primary" />
                                            Confirmações de transações
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all backdrop-blur-sm group">
                                <CardHeader>
                                    <Users className="w-10 h-10 text-primary mb-3 transition-transform group-hover:scale-110" />
                                    <CardTitle className="text-2xl">Marketing</CardTitle>
                                    <CardDescription className="text-base text-foreground/50">
                                        Campanhas de marketing direto com alto engajamento
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-foreground/70">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-primary" />
                                            Campanhas promocionais segmentadas
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-primary" />
                                            Newsletters e atualizações
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-primary" />
                                            Pesquisas de satisfação
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-primary" />
                                            Programas de fidelidade
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all backdrop-blur-sm group">
                                <CardHeader>
                                    <MessageSquare className="w-10 h-10 text-primary mb-3 transition-transform group-hover:scale-110" />
                                    <CardTitle className="text-2xl">Atendimento</CardTitle>
                                    <CardDescription className="text-base text-foreground/50">
                                        Suporte ao cliente automatizado e eficiente
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-foreground/70">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-primary" />
                                            Chatbots inteligentes
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-primary" />
                                            Respostas automáticas
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-primary" />
                                            Tickets de suporte
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-primary" />
                                            FAQ automatizado
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Como Usar */}
                    <div id="how-to-use" className="mb-20">
                        <h2 className="text-4xl font-serif font-bold text-foreground mb-8 flex items-center gap-3">
                            <Code className="w-10 h-10 text-primary" />
                            Como Utilizar
                        </h2>

                        <div className="space-y-8">
                            {/* Passo 1 */}
                            <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                                            1
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl">Crie sua Conta</CardTitle>
                                            <CardDescription className="text-base text-foreground/50">
                                                Registre-se gratuitamente e receba 1000 mensagens para testar
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-foreground/70 mb-6">
                                        Acesse a plataforma e crie sua conta em menos de 2 minutos. Você receberá acesso
                                        imediato ao dashboard e poderá começar a testar a API.
                                    </p>
                                    <Link href="/signup">
                                        <Button className="bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 h-12 px-8 rounded-full text-[12px] font-bold uppercase tracking-[0.2em]">
                                            Criar Conta Grátis
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            {/* Passo 2 */}
                            <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                                            2
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl">Gere sua API Key</CardTitle>
                                            <CardDescription className="text-base text-foreground/50">
                                                Crie uma chave de API para autenticar suas requisições
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-foreground/70 mb-6">
                                        No dashboard, acesse a seção "API Keys" e gere uma nova chave. Guarde-a em local seguro,
                                        pois ela será necessária para todas as chamadas à API.
                                    </p>
                                    <div className="space-y-3">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Exemplo de API Key:</span>
                                        <div className="p-4 bg-black/50 border border-white/5 rounded-xl font-mono text-primary text-sm">
                                            zapi_live_abc123def456ghi789
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Passo 3 */}
                            <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                                            3
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl">Configure o WhatsApp</CardTitle>
                                            <CardDescription className="text-base text-foreground/50">
                                                Conecte sua conta WhatsApp escaneando o QR Code
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-foreground/70 mb-6">
                                        Acesse a seção "WhatsApp" no dashboard e escaneie o QR Code com seu WhatsApp.
                                        Sua sessão ficará ativa e pronta para enviar mensagens.
                                    </p>
                                    <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-xl text-sm text-primary/80">
                                        <AlertTriangle className="w-4 h-4" />
                                        <span>Mantenha seu WhatsApp conectado à internet para receber mensagens</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Passo 4 */}
                            <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                                            4
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl">Envie sua Primeira Mensagem</CardTitle>
                                            <CardDescription className="text-base text-foreground/50">
                                                Faça sua primeira chamada à API e envie uma mensagem
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Tabs defaultValue="curl" className="w-full">
                                        <TabsList className="bg-white/5 p-1 border border-white/5 rounded-xl mb-6">
                                            <TabsTrigger value="curl" className="text-[10px] font-bold uppercase tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">cURL</TabsTrigger>
                                            <TabsTrigger value="node" className="text-[10px] font-bold uppercase tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Node.js</TabsTrigger>
                                            <TabsTrigger value="python" className="text-[10px] font-bold uppercase tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Python</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="curl">
                                            <CodeBlock code={codeExamples.sendMessage} language="bash" className="bg-black/50 border-white/5 rounded-xl" />
                                        </TabsContent>

                                        <TabsContent value="node">
                                            <CodeBlock code={codeExamples.nodeExample} language="javascript" className="bg-black/50 border-white/5 rounded-xl" />
                                        </TabsContent>

                                        <TabsContent value="python">
                                            <CodeBlock code={codeExamples.pythonExample} language="python" className="bg-black/50 border-white/5 rounded-xl" />
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Webhooks */}
                    <div id="webhooks" className="mb-20">
                        <h2 className="text-4xl font-serif font-bold text-foreground mb-8 flex items-center gap-3">
                            <Webhook className="w-10 h-10 text-primary" />
                            Webhooks
                        </h2>

                        <div className="space-y-6">
                            <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Como Funcionam os Webhooks</CardTitle>
                                    <CardDescription className="text-base text-foreground/50">
                                        Receba notificações em tempo real sobre eventos do WhatsApp
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <p className="text-foreground/80">
                                        Webhooks são chamadas HTTP POST que o ZippyZap faz para sua aplicação quando eventos
                                        importantes acontecem, como recebimento de mensagens, confirmações de entrega, leitura, etc.
                                    </p>

                                    <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                                        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                            <Server className="w-5 h-5 text-primary" />
                                            Configuração do Webhook
                                        </h4>
                                        <ol className="space-y-4 text-sm text-foreground/80">
                                            <li className="flex items-start gap-3">
                                                <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs flex-shrink-0">
                                                    1
                                                </span>
                                                <span>Acesse o dashboard e vá para "Configurações → Webhooks"</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs flex-shrink-0">
                                                    2
                                                </span>
                                                <span>Insira a URL do seu endpoint (ex: https://seusite.com/webhook)</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs flex-shrink-0">
                                                    3
                                                </span>
                                                <span>Selecione os eventos que deseja receber</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs flex-shrink-0">
                                                    4
                                                </span>
                                                <span>Salve e teste a conexão</span>
                                            </li>
                                        </ol>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                                        <div className="bg-black/20 p-6 rounded-xl border border-white/5">
                                            <h5 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                                <Activity className="w-5 h-5 text-primary" />
                                                Eventos Disponíveis
                                            </h5>
                                            <ul className="space-y-2 text-sm text-foreground/70">
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-primary" />
                                                    <code className="text-xs bg-white/5 px-2 py-1 rounded text-primary">message.received</code>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-primary" />
                                                    <code className="text-xs bg-white/5 px-2 py-1 rounded text-primary">message.sent</code>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-primary" />
                                                    <code className="text-xs bg-white/5 px-2 py-1 rounded text-primary">message.delivered</code>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-primary" />
                                                    <code className="text-xs bg-white/5 px-2 py-1 rounded text-primary">message.read</code>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-primary" />
                                                    <code className="text-xs bg-white/5 px-2 py-1 rounded text-primary">message.failed</code>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-primary" />
                                                    <code className="text-xs bg-white/5 px-2 py-1 rounded text-primary">session.connected</code>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-primary" />
                                                    <code className="text-xs bg-white/5 px-2 py-1 rounded text-primary">session.disconnected</code>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="bg-black/20 p-6 rounded-xl border border-white/5">
                                            <h5 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                                <Shield className="w-5 h-5 text-primary" />
                                                Segurança
                                            </h5>
                                            <ul className="space-y-4 text-sm text-foreground/70">
                                                <li className="flex items-start gap-3">
                                                    <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                                                    <span>Todas as requisições incluem header <code className="text-xs bg-white/5 px-1 py-0.5 rounded text-primary">X-Webhook-Signature</code></span>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                                                    <span>Valide a assinatura usando seu webhook secret</span>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                                                    <span>Use HTTPS para receber webhooks</span>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                                                    <span>Responda com status 200 em até 5 segundos</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Exemplo de Payload</CardTitle>
                                    <CardDescription className="text-base text-foreground/50">
                                        Estrutura de dados recebida no webhook
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CodeBlock code={codeExamples.webhookExample} language="json" className="bg-black/50 border-white/5 rounded-xl" />
                                </CardContent>
                            </Card>

                            <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Implementação do Handler</CardTitle>
                                    <CardDescription className="text-base text-foreground/50">
                                        Exemplo de como processar webhooks em Node.js
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CodeBlock code={codeExamples.webhookHandler} language="javascript" className="bg-black/50 border-white/5 rounded-xl" />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Segurança */}
                    <div id="security" className="mb-20">
                        <h2 className="text-4xl font-serif font-bold text-foreground mb-8 flex items-center gap-3">
                            <Shield className="w-10 h-10 text-primary" />
                            Segurança e Prevenção
                        </h2>

                        <div className="space-y-6">
                            <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl text-foreground">Mecanismos de Segurança</CardTitle>
                                            <CardDescription className="text-base text-foreground/50">
                                                Como protegemos sua conta e prevenimos uso indevido
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                                <Key className="w-6 h-6 text-primary mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                                <div>
                                                    <h4 className="font-semibold text-foreground mb-1">Criptografia E2E</h4>
                                                    <p className="text-sm text-foreground/70 leading-relaxed">
                                                        Todas as mensagens são criptografadas de ponta a ponta pelo WhatsApp.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                                <Activity className="w-6 h-6 text-primary mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                                <div>
                                                    <h4 className="font-semibold text-foreground mb-1">Rate Limiting</h4>
                                                    <p className="text-sm text-foreground/70 leading-relaxed">
                                                        Limites de requisições por minuto baseados no seu plano para evitar sobrecarga.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group" >
                                                <Lock className="w-6 h-6 text-primary mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                                <div>
                                                    <h4 className="font-semibold text-foreground mb-1">Criptografia TLS</h4>
                                                    <p className="text-sm text-foreground/70 leading-relaxed">
                                                        Todas as comunicações são criptografadas usando TLS 1.3.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                                <Database className="w-6 h-6 text-primary mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                                <div>
                                                    <h4 className="font-semibold text-foreground mb-1">Logs de Auditoria</h4>
                                                    <p className="text-sm text-foreground/70 leading-relaxed">
                                                        Todas as ações são registradas em logs imutáveis para análise profunda.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                                <AlertTriangle className="w-6 h-6 text-primary mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                                <div>
                                                    <h4 className="font-semibold text-foreground mb-1">Detecção de Spam</h4>
                                                    <p className="text-sm text-foreground/70 leading-relaxed">
                                                        Sistema automático identifica e bloqueia padrões de spam em tempo real.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                                <Shield className="w-6 h-6 text-primary mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                                <div>
                                                    <h4 className="font-semibold text-foreground mb-1">Validação de Conteúdo</h4>
                                                    <p className="text-sm text-foreground/70 leading-relaxed">
                                                        Verificação automática de conteúdo suspeito ou malicioso antes do envio.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-2xl flex items-center gap-2 text-foreground">
                                        <AlertTriangle className="w-6 h-6 text-primary" />
                                        Políticas de Uso Aceitável
                                    </CardTitle>
                                    <CardDescription className="text-base text-foreground/50">
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
                                            <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                                <AlertTriangle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                                                <span className="text-sm text-foreground/70">{policy}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-foreground">Boas Práticas</CardTitle>
                                    <CardDescription className="text-base text-foreground/50">
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
                                            <div key={idx} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all group">
                                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                    <CheckCircle className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-foreground mb-1">{practice.title}</h4>
                                                    <p className="text-sm text-foreground/60 leading-relaxed">{practice.description}</p>
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
                        <h2 className="text-4xl font-serif font-bold text-foreground mb-8 flex items-center gap-3">
                            <MessageSquare className="w-10 h-10 text-primary" />
                            Perguntas Frequentes (FAQ)
                        </h2>

                        <div className="space-y-4">
                            {[
                                {
                                    q: "Como obtenho minha API Key?",
                                    a: "Após criar sua conta, acesse o dashboard e vá para a seção \"API Keys\". Clique em \"Criar Nova Chave\", dê um nome descritivo e a chave será gerada instantaneamente."
                                },
                                {
                                    q: "Preciso de um número WhatsApp Business oficial?",
                                    a: "Não! O ZippyZap funciona com WhatsApp regular (não Business). Você pode usar seu número WhatsApp pessoal ou criar um novo número."
                                },
                                {
                                    q: "Qual é o limite de mensagens por segundo?",
                                    a: "Os limites variam por plano: Free (10 req/min), Pro (100 req/min), Enterprise (customizado)."
                                }
                            ].map((item, idx) => (
                                <Card key={idx} className="border-white/5 bg-white/[0.02] backdrop-blur-sm group hover:bg-white/[0.04] transition-all">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">{item.q}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-foreground/70">{item.a}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Limites e Planos */}
                    <div id="limits" className="mb-20">
                        <h2 className="text-4xl font-serif font-bold text-foreground mb-8 flex items-center gap-3">
                            <Activity className="w-10 h-10 text-primary" />
                            Limites e Planos
                        </h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
                                <CardHeader>
                                    <Badge className="w-fit mb-2 bg-white/5 text-foreground/40 border-white/10 uppercase text-[10px] font-bold tracking-[0.1em]">Free</Badge>
                                    <CardTitle className="text-2xl">Plano Gratuito</CardTitle>
                                    <CardDescription className="text-foreground/40 text-sm">Perfeito para testes e projetos pequenos</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="text-4xl font-bold text-foreground">
                                        1.000
                                        <span className="text-base font-normal text-foreground/40 ml-1">/mês</span>
                                    </div>
                                    <ul className="space-y-3 text-sm">
                                        {[
                                            "1.000 mensagens/mês",
                                            "10 req/minuto",
                                            "1 sessão WhatsApp",
                                            "Webhooks básicos",
                                            "Suporte por email"
                                        ].map((feat, i) => (
                                            <li key={i} className="flex items-center gap-3 text-foreground/70">
                                                <CheckCircle className="w-4 h-4 text-primary" />
                                                {feat}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-primary/30 bg-primary/5 backdrop-blur-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-bl-lg">Popular</div>
                                <CardHeader>
                                    <Badge className="w-fit mb-2 bg-primary text-primary-foreground border-none uppercase text-[10px] font-bold tracking-[0.1em]">Pro</Badge>
                                    <CardTitle className="text-2xl">Plano Pro</CardTitle>
                                    <CardDescription className="text-foreground/40 text-sm">Para empresas em crescimento</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="text-4xl font-bold text-foreground">
                                        50.000
                                        <span className="text-base font-normal text-foreground/40 ml-1">/mês</span>
                                    </div>
                                    <ul className="space-y-3 text-sm">
                                        {[
                                            "50.000 mensagens/mês",
                                            "100 req/minuto",
                                            "5 sessões WhatsApp",
                                            "Webhooks avançados",
                                            "Suporte prioritário",
                                            "Analytics detalhado"
                                        ].map((feat, i) => (
                                            <li key={i} className="flex items-center gap-3 text-foreground/70">
                                                <CheckCircle className="w-4 h-4 text-primary" />
                                                {feat}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
                                <CardHeader>
                                    <Badge className="w-fit mb-2 bg-white/10 text-foreground border-white/20 uppercase text-[10px] font-bold tracking-[0.1em]">Enterprise</Badge>
                                    <CardTitle className="text-2xl">Plano Enterprise</CardTitle>
                                    <CardDescription className="text-foreground/40 text-sm">Soluções customizadas</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="text-4xl font-bold text-foreground">
                                        Ilimitado
                                    </div>
                                    <ul className="space-y-3 text-sm">
                                        {[
                                            "Mensagens ilimitadas",
                                            "Rate limit customizado",
                                            "Sessões ilimitadas",
                                            "Webhooks customizados",
                                            "Suporte 24/7",
                                            "SLA garantido",
                                            "Infraestrutura dedicada"
                                        ].map((feat, i) => (
                                            <li key={i} className="flex items-center gap-3 text-foreground/70">
                                                <CheckCircle className="w-4 h-4 text-primary" />
                                                {feat}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* CTA Final */}
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                        <CardContent className="p-12 md:p-20 text-center relative z-10">
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
                                Pronto para Começar?
                            </h2>
                            <p className="text-xl text-foreground/60 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Crie sua conta gratuitamente e comece a enviar mensagens WhatsApp em poucos minutos com nossa API robusta.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                                <Link href="/signup">
                                    <Button size="lg" className="text-base px-10 h-14 bg-primary text-primary-foreground hover:opacity-90 shadow-[0_0_30px_rgba(37,211,102,0.3)] rounded-full font-bold uppercase tracking-[0.2em]">
                                        Começar Agora
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="text-base px-10 h-14 border-white/10 text-foreground/70 hover:bg-white/5 hover:text-foreground backdrop-blur-sm rounded-full font-bold uppercase tracking-[0.2em]"
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
            <footer className="py-20 px-4 border-t border-white/5 bg-background">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-4 gap-12">
                        <div className="col-span-1 md:col-span-1">
                            <Link href="/">
                                <Logo />
                            </Link>
                            <p className="text-foreground/50 text-sm mt-6 mb-8 leading-relaxed max-w-xs">
                                A API WhatsApp mais confiável para desenvolvedores e empresas que buscam performance e simplicidade.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-foreground text-[10px] uppercase tracking-[0.2em] mb-8">Produto</h4>
                            <ul className="space-y-4 text-sm text-foreground/40 font-bold uppercase tracking-[0.1em]">
                                <li><a href="/#features" className="hover:text-primary transition-colors">Recursos</a></li>
                                <li><a href="/#pricing" className="hover:text-primary transition-colors">Preços</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-foreground text-[10px] uppercase tracking-[0.2em] mb-8">Desenvolvedores</h4>
                            <ul className="space-y-4 text-sm text-foreground/40 font-bold uppercase tracking-[0.1em]">
                                <li><Link href="/docs" className="hover:text-primary transition-colors">Documentação</Link></li>
                                <li><Link href="/docs#api-reference" className="hover:text-primary transition-colors">API Reference</Link></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Exemplos</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-foreground text-[10px] uppercase tracking-[0.2em] mb-8">Suporte</h4>
                            <ul className="space-y-4 text-sm text-foreground/40 font-bold uppercase tracking-[0.1em]">
                                <li><a href="#" className="hover:text-primary transition-colors">Central de Ajuda</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Comunidade</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-foreground/30 font-medium">© 2024 ZippyZap. Todos os direitos reservados.</p>
                        <div className="flex gap-8">
                            <a href="#" className="text-foreground/30 hover:text-foreground transition-colors text-xs font-bold uppercase tracking-[0.1em]">Privacidade</a>
                            <a href="#" className="text-foreground/30 hover:text-foreground transition-colors text-xs font-bold uppercase tracking-[0.1em]">Termos</a>
                            <a href="#" className="text-foreground/30 hover:text-foreground transition-colors text-xs font-bold uppercase tracking-[0.1em]">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div >
    )
}