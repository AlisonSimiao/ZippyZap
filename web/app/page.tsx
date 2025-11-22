"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Zap, Shield, Webhook, FileText, Users, ArrowRight, CheckCircle } from "lucide-react"
import { useState } from "react"
import { PricingSection } from "@/components/pricing-section"
import { HEADERS } from "@/components/Header"
import Image from "next/image"
import Link from "next/link"

function CodeExamples() {
  const examples = {
    curl: `curl -X POST \\
  https://api.zippyzap.com/v1/messages \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+5511999999999",
    "type": "text",
    "message": "Olá! Sua mensagem foi enviada."
  }'`,

    node: `const axios = require('axios');

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

console.log(response.data);`,

    python: `import requests

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
print(response.json())`,

    go: `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

func main() {
    url := "https://api.zippyzap.com/v1/messages"
    
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
    <div className="min-h-screen bg-white">
      <HEADERS.HeaderLp />

      {/* Hero Section */}
      <section className="py-20 px-4 bg-[#F5F5F5]">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge variant="secondary" className="mb-6 bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20">
                <Zap className="w-4 h-4 mr-2 text-[#FFD700]" />
                API WhatsApp Confiável
              </Badge>
              <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#333333] mb-6 leading-tight">
                Integre WhatsApp em
                <span className="text-[#0066FF]"> Segundos</span>
              </h1>
              <p className="text-xl text-[#333333]/70 mb-8 leading-relaxed max-w-2xl lg:max-w-none">
                Envie mensagens, arquivos e mídias para WhatsApp através de nossa API robusta. Com webhooks em tempo
                real e documentação completa para desenvolvedores.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="text-lg px-8 bg-[#FFD700] text-black hover:bg-[#FFD700]/90">
                  Começar Agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white bg-transparent"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Ver Documentação
                </Button>
              </div>
              <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-sm text-[#333333]/60">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#FFD700]" />
                  Setup em 5 minutos
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#FFD700]" />
                  99.9% de uptime
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#FFD700]" />
                  Suporte 24/7
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-8">
                <Image
                  src="/happy-professional-success.png"
                  alt="Pessoa bem-sucedida usando ZippyZap no notebook"
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-lg"
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
                <div className="absolute top-4 right-4 bg-[#25D366] text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Mensagem Enviada
                </div>
                <div className="absolute bottom-4 left-4 bg-[#FFD700] text-black px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  +1.2k Mensagens Hoje
                </div>
              </div>
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#FFD700]/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#25D366]/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* RecursosFeatures Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-[#333333] mb-4">
              Recursos Poderosos para Desenvolvedores
            </h2>
            <p className="text-xl text-[#333333]/70 max-w-2xl mx-auto">
              Tudo que você precisa para integrar WhatsApp em suas aplicações de forma profissional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-gray-200 hover:shadow-lg transition-shadow bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-[#25D366]/20 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-[#25D366]" />
                </div>
                <CardTitle className="text-xl text-[#333333]">Mensagens de Texto</CardTitle>
                <CardDescription className="text-[#333333]/70">
                  Envie mensagens de texto formatadas com emojis e links para qualquer número WhatsApp
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-shadow bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-[#25D366]/20 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-[#25D366]" />
                </div>
                <CardTitle className="text-xl text-[#333333]">Envio de Arquivos</CardTitle>
                <CardDescription className="text-[#333333]/70">
                  Suporte completo para imagens, documentos, áudios e vídeos com validação automática
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-shadow bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-[#FFD700]/20 rounded-lg flex items-center justify-center mb-4">
                  <Webhook className="w-6 h-6 text-[#FFD700]" />
                </div>
                <CardTitle className="text-xl text-[#333333]">Webhooks em Tempo Real</CardTitle>
                <CardDescription className="text-[#333333]/70">
                  Receba notificações instantâneas sobre status de entrega, leitura e respostas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-shadow bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-[#0066FF]/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-[#0066FF]" />
                </div>
                <CardTitle className="text-xl text-[#333333]">Segurança Avançada</CardTitle>
                <CardDescription className="text-[#333333]/70">
                  Autenticação por API key, rate limiting e criptografia end-to-end
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-shadow bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-[#0066FF]/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-[#0066FF]" />
                </div>
                <CardTitle className="text-xl text-[#333333]">Escalabilidade</CardTitle>
                <CardDescription className="text-[#333333]/70">
                  Processe milhares de mensagens por minuto com nossa infraestrutura robusta
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Code Example Section */}
      <section className="py-20 px-4 bg-[#F5F5F5]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-[#333333] mb-4">Integração Simples e Rápida</h2>
            <p className="text-xl text-[#333333]/70">
              Comece a enviar mensagens em poucos minutos com nossa API RESTful
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-serif font-bold text-[#333333]">Exemplos de Uso</h3>
                <div className="flex gap-2">
                  <Button
                    variant={activeTab === "curl" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("curl")}
                    className={`text-xs ${activeTab === "curl"
                        ? "bg-[#FFD700] text-black hover:bg-[#FFD700]/90"
                        : "border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
                      }`}
                  >
                    cURL
                  </Button>
                  <Button
                    variant={activeTab === "node" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("node")}
                    className={`text-xs ${activeTab === "node"
                        ? "bg-[#FFD700] text-black hover:bg-[#FFD700]/90"
                        : "border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
                      }`}
                  >
                    Node.js
                  </Button>
                  <Button
                    variant={activeTab === "python" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("python")}
                    className={`text-xs ${activeTab === "python"
                        ? "bg-[#FFD700] text-black hover:bg-[#FFD700]/90"
                        : "border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
                      }`}
                  >
                    Python
                  </Button>
                  <Button
                    variant={activeTab === "go" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("go")}
                    className={`text-xs ${activeTab === "go"
                        ? "bg-[#FFD700] text-black hover:bg-[#FFD700]/90"
                        : "border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
                      }`}
                  >
                    Go
                  </Button>
                </div>
              </div>
              <pre className="bg-white p-4 rounded-lg overflow-auto border border-gray-200 shadow-sm">
                <code className="text-[#333333]">{examples[activeTab as keyof typeof examples]}</code>
              </pre>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center text-black font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-[#333333] mb-2">Obtenha sua API Key</h4>
                  <p className="text-[#333333]/70">
                    Registre-se gratuitamente e receba sua chave de API instantaneamente
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center text-black font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-[#333333] mb-2">Configure os Webhooks</h4>
                  <p className="text-[#333333]/70">Defina endpoints para receber notificações em tempo real</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center text-black font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-[#333333] mb-2">Comece a Enviar</h4>
                  <p className="text-[#333333]/70">
                    Faça sua primeira chamada à API e envie mensagens instantaneamente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-serif font-bold text-[#333333] mb-6">Pronto para Começar?</h2>
          <p className="text-xl text-[#333333]/70 mb-8">
            Junte-se a milhares de desenvolvedores que confiam no ZippyZap para suas integrações WhatsApp
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 bg-[#FFD700] text-black hover:bg-[#FFD700]/90">
              Criar Conta Grátis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white bg-transparent"
            >
              Falar com Vendas
            </Button>
          </div>
          <p className="text-sm text-[#333333]/60 mt-6">
            Sem cartão de crédito • 1000 mensagens grátis • Suporte incluído
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-200 bg-[#F5F5F5]">
        <div className="container mx-auto">
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
                <li>
                  <a href="#" className="hover:text-[#333333] transition-colors">
                    Recursos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#333333] transition-colors">
                    Preços
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#333333] transition-colors">
                    Status
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#333333] mb-4">Desenvolvedores</h4>
              <ul className="space-y-2 text-sm text-[#333333]/70">
                <li>
                  <Link href="/docs" className="hover:text-[#333333] transition-colors">
                    Documentação
                  </Link>
                </li>
                <li>
                  <Link href="/docs#api-reference" className="hover:text-[#333333] transition-colors">
                    API Reference
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#333333] mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-[#333333]/70">
                <li>
                  <a href="#" className="hover:text-[#333333] transition-colors">
                    Central de Ajuda
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#333333] transition-colors">
                    Contato
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#333333] transition-colors">
                    Comunidade
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-[#333333]/70">© 2024 ZippyZap. Todos os direitos reservados.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-[#333333]/70 hover:text-[#333333] transition-colors text-sm">
                Privacidade
              </a>
              <a href="#" className="text-[#333333]/70 hover:text-[#333333] transition-colors text-sm">
                Termos
              </a>
              <a href="#" className="text-[#333333]/70 hover:text-[#333333] transition-colors text-sm">
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
