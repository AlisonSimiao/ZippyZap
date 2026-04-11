"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Zap, Shield, Webhook, FileText, Users, ArrowRight, CheckCircle, Twitter, Instagram } from "lucide-react"
import { useState, Suspense } from "react"
import { PricingSection } from "@/components/pricing-section"
import { HEADERS } from "@/components/Header"
import Image from "next/image"
import Link from "next/link"
import { CodeBlock } from "@/components/ui/code-block"
import Logo from "@/components/logo"

function CodeExamples() {
  // Structured Data for SEO
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://zippyzap.online'

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ZippyZap",
    "url": baseUrl,
    "description": "Plataforma de API WhatsApp Business para integração de mensagens",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/docs?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  }

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "ZippyZap WhatsApp API",
    "description": "API completa para integração WhatsApp Business com webhooks em tempo real e envio de mensagens de texto",
    "brand": {
      "@type": "Brand",
      "name": "ZippyZap"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "BRL",
      "lowPrice": "0",
      "highPrice": "499",
      "offerCount": "3"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127"
    }
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Como funciona a API do ZippyZap?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A API do ZippyZap permite integrar funcionalidades WhatsApp em suas aplicações através de requisições HTTP RESTful. Você pode enviar mensagens, arquivos e receber webhooks em tempo real."
        }
      },
      {
        "@type": "Question",
        "name": "Quanto tempo leva para integrar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A integração pode ser feita em menos de 5 minutos. Basta criar sua conta, gerar uma API key, conectar seu WhatsApp e fazer sua primeira chamada à API."
        }
      },
      {
        "@type": "Question",
        "name": "Qual o uptime da plataforma?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Garantimos 99.9% de uptime com infraestrutura robusta e escalável preparada para milhares de mensagens por minuto."
        }
      }
    ]
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zippyzap.online'

  const examples = {
    curl: `curl -X POST \\
  ${apiUrl}/v1/messages \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+5511999999999",
    "type": "text",
    "message": "Olá! Sua mensagem foi enviada."
  }'`,

    node: `const axios = require('axios');

const response = await axios.post(
  '${apiUrl}/v1/messages',
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

console.log(response.data);`,

    python: `import requests

url = "${apiUrl}/v1/messages"
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
print(response.json())`,

    go: `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

func main() {
    url := "${apiUrl}/v1/messages"
    
    payload := map[string]string{
        "to":      "+5511999999999",
        "type":    "text",
        "message": "Olá! Sua mensagem foi enviada.",
    }
    
    jsonData, _ := json.Marshal(payload)
    
    req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
    req.Header.Set("X-API-Key", "YOUR_API_KEY")
    req.Header.Set("Content-Type", "application/json")
    
    client := &http.Client{}
    resp, _ := client.Do(req)
    defer resp.Body.Close()
    
    fmt.Println("Status:", resp.Status)
}`,
  }

  const [activeTab, setActiveTab] = useState("curl")

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <HEADERS.HeaderLp />

      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Background glow effects - "entre efeitos e sutil" */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-primary/10 blur-[100px] rounded-full" />
        </div>

        <div className="container mx-auto max-w-6xl relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <Badge variant="secondary" className="mb-6 bg-primary/15 text-primary border-primary/20 px-4 py-1.5 backdrop-blur-sm">
                <Zap className="w-3.5 h-3.5 mr-2 fill-primary" />
                API WhatsApp Confiável
              </Badge>
              <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-[1.1] tracking-tight">
                Integre WhatsApp em
                <span className="text-primary block lg:inline"> Segundos</span>
              </h1>
              <p className="text-xl text-foreground/60 mb-10 leading-relaxed max-w-2xl lg:max-w-none">
                Envie mensagens de texto para WhatsApp através de nossa API robusta. Com webhooks em tempo
                real e documentação completa para desenvolvedores.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="text-base px-8 h-12 bg-primary text-primary-foreground hover:opacity-90 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all hover:scale-[1.02]">
                  Começar Agora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base px-8 h-12 border-white/10 text-foreground/80 hover:bg-white/5 hover:text-foreground backdrop-blur-sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Ver Documentação
                </Button>
              </div>
              <div className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-foreground/40">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary/60" />
                  Setup em 5 minutos
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary/60" />
                  99.9% de uptime
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary/60" />
                  Suporte 24/7
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative rounded-3xl overflow-hidden border border-white/5 bg-card/50 backdrop-blur-xl p-4 md:p-8 shadow-2xl">
                <Image
                  src="/happy-professional-success.png"
                  alt="Pessoa bem-sucedida usando ZippyZap no notebook"
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-2xl grayscale-[0.2] contrast-[1.1]"
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
                <div className="absolute top-8 right-8 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg">
                  <CheckCircle className="w-3.5 h-3.5 fill-primary-foreground text-primary" />
                  Mensagem Enviada
                </div>
                <div className="absolute bottom-8 left-8 bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-white/10">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  +1.2k Mensagens Hoje
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RecursosFeatures Section */}
      <section id="features" className="py-24 px-4 bg-background relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-primary/5 blur-[100px] rounded-full" />
        
        <div className="container mx-auto relative">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Recursos Poderosos para Desenvolvedores
            </h2>
            <p className="text-xl text-foreground/50 max-w-2xl mx-auto">
              Tudo que você precisa para integrar WhatsApp em suas aplicações de forma profissional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 hover:border-primary/30 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl mb-3">Mensagens de Texto</CardTitle>
                <CardDescription className="text-foreground/50 leading-relaxed">
                  Envie mensagens de texto formatadas com emojis e links para qualquer número WhatsApp
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 hover:border-primary/30 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl mb-3">Gestão de Sessões</CardTitle>
                <CardDescription className="text-foreground/50 leading-relaxed">
                  Conexão via QR Code instantânea com reconexão automática e persistência de sessão
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 hover:border-primary/30 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                  <Webhook className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl mb-3">Webhooks em Tempo Real</CardTitle>
                <CardDescription className="text-foreground/50 leading-relaxed">
                  Receba notificações instantâneas sobre status de entrega, leitura e respostas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 hover:border-primary/30 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl mb-3">Segurança Avançada</CardTitle>
                <CardDescription className="text-foreground/50 leading-relaxed">
                  Autenticação por API key, rate limiting e criptografia end-to-end
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 hover:border-primary/30 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl mb-3">Escalabilidade</CardTitle>
                <CardDescription className="text-foreground/50 leading-relaxed">
                  Processe milhares de mensagens por minuto com nossa infraestrutura robusta
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <Suspense fallback={
        <section id="pricing" className="py-24 px-4 bg-background">
          <div className="container mx-auto">
            <div className="text-center mb-20">
              <div className="h-12 bg-white/5 w-64 mx-auto rounded mb-4 animate-pulse"></div>
              <div className="h-6 bg-white/5 w-96 mx-auto rounded animate-pulse"></div>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[500px] bg-white/[0.02] border border-white/5 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </section>
      }>
        <PricingSection />
      </Suspense>

      {/* Code Example Section */}
      <section className="py-24 px-4 bg-background border-y border-white/5 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Integração Simples e Rápida</h2>
            <p className="text-xl text-foreground/50">
              Comece a enviar mensagens em poucos minutos com nossa API RESTful
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="bg-[#0A0A0A] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                <div className="flex gap-2">
                  {["curl", "node", "python", "go"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        activeTab === tab
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "text-foreground/50 hover:text-foreground hover:bg-white/5"
                      }`}
                    >
                      {tab === "curl" ? "cURL" : tab === "node" ? "Node.js" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-1">
                <CodeBlock
                  code={examples[activeTab as keyof typeof examples]}
                  language={activeTab === "curl" ? "bash" : activeTab === "go" ? "go" : activeTab === "python" ? "python" : "javascript"}
                  className="border-none bg-transparent"
                />
              </div>
            </div>

            <div className="space-y-8 py-4">
              <div className="flex items-start gap-6 group">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-lg border border-primary/20 transition-all group-hover:scale-110">
                  1
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Obtenha sua API Key</h4>
                  <p className="text-foreground/50 leading-relaxed">
                    Registre-se gratuitamente e receba sua chave de API instantaneamente
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-lg border border-primary/20 transition-all group-hover:scale-110">
                  2
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Configure os Webhooks</h4>
                  <p className="text-foreground/50 leading-relaxed">Defina endpoints para receber notificações em tempo real</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-lg border border-primary/20 transition-all group-hover:scale-110">
                  3
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Comece a Enviar</h4>
                  <p className="text-foreground/50 leading-relaxed">
                    Faça sua primeira chamada à API e envie mensagens instantaneamente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto text-center max-w-3xl relative">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8">Pronto para Começar?</h2>
          <p className="text-xl text-foreground/50 mb-10">
            Junte-se a milhares de desenvolvedores que confiam no ZippyZap para suas integrações WhatsApp
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-base px-10 h-12 bg-primary text-primary-foreground hover:opacity-90 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              Criar Conta Grátis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base px-10 h-12 border-white/10 text-foreground/70 hover:bg-white/5 hover:text-foreground backdrop-blur-sm"
            >
              Falar com Vendas
            </Button>
          </div>
          <p className="text-sm text-foreground/30 mt-8">
            Sem cartão de crédito • 1000 mensagens grátis • Suporte incluído
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 border-t border-white/5 bg-background">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
              <Logo />
              <p className="text-foreground/50 text-sm mt-6 mb-8 leading-relaxed max-w-xs">
                A API WhatsApp mais confiável para desenvolvedores e empresas que buscam performance e simplicidade.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://x.com/zippyzapOfc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-foreground/50 hover:text-primary hover:bg-white/10 transition-all"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://www.instagram.com/zippyzapapi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-foreground/50 hover:text-primary hover:bg-white/10 transition-all"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-6">Produto</h4>
              <ul className="space-y-4 text-sm text-foreground/50">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Recursos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Preços
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Status
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-6">Desenvolvedores</h4>
              <ul className="space-y-4 text-sm text-foreground/50">
                <li>
                  <Link href="/docs" className="hover:text-primary transition-colors">
                    Documentação
                  </Link>
                </li>
                <li>
                  <Link href="/docs#api-reference" className="hover:text-primary transition-colors">
                    API Reference
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-6">Suporte</h4>
              <ul className="space-y-4 text-sm text-foreground/50">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Central de Ajuda
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Contato
                  </a>
                </li>
                <li>
                  <a
                    href="https://discord.gg/ntzVaqUD"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    Comunidade (Discord)
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-foreground/30">© 2024 ZippyZap. Todos os direitos reservados.</p>
            <div className="flex gap-8">
              <a href="#" className="text-foreground/30 hover:text-foreground transition-colors text-xs">
                Privacidade
              </a>
              <a href="#" className="text-foreground/30 hover:text-foreground transition-colors text-xs">
                Termos
              </a>
              <a href="#" className="text-foreground/30 hover:text-foreground transition-colors text-xs">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default CodeExamples
