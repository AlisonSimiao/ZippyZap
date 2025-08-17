"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Star } from "lucide-react"
import { usePlans } from "@/hooks/use-plans"

export function PricingSection() {
  const { plans, loading, error } = usePlans()

  if (loading) {
    return (
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-[#333333] mb-4">
              Planos que Crescem com Você
            </h2>
            <p className="text-xl text-[#333333]/70 max-w-2xl mx-auto">
              Carregando planos disponíveis...
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-gray-200 bg-white animate-pulse">
                <CardHeader className="text-center pb-8">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-12 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </CardHeader>
                <div className="px-6 pb-6">
                  <div className="space-y-3 mb-8">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-[#333333] mb-4">
              Planos que Crescem com Você
            </h2>
            <p className="text-xl text-red-600 max-w-2xl mx-auto">
              {error}
            </p>
          </div>
        </div>
      </section>
    )
  }

  const formatNumber = (num: string) => {
    return parseInt(num).toLocaleString('pt-BR')
  }

  const formatPrice = (price: string) => {
    return parseFloat(price).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const formatLimit = (limit: number) => {
    return limit > 999999 ? '✨ Ilimitado' : formatNumber(limit.toString())
  }

  return (
    <section id="pricing" className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-[#333333] mb-4">
            Planos que Crescem com Você
          </h2>
          <p className="text-xl text-[#333333]/70 max-w-2xl mx-auto">
            Escolha o plano ideal para suas necessidades. Comece grátis e escale conforme necessário.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.filter(plan => plan.isActive).map((plan, index) => (
            <Card 
              key={plan.id} 
              className={`border-gray-200 hover:shadow-lg transition-shadow bg-white relative ${
                index === 1 ? 'border-[#FFD700]' : ''
              }`}
            >
              {index === 1 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-[#FFD700] text-black px-4 py-1">
                    <Star className="w-4 h-4 mr-1" />
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className={`text-center pb-8 ${index === 1 ? 'pt-8' : ''}`}>
                <CardTitle className="text-2xl text-[#333333] mb-2">{plan.name}</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-[#333333]">
                    {formatPrice(plan.price.toString())}
                  </span>
                  <span className="text-[#333333]/70">/mês</span>
                </div>
                <CardDescription className="text-[#333333]/70">
                  {plan.features[0] || 'Plano completo para suas necessidades'}
                </CardDescription>
              </CardHeader>
              
              <div className="px-6 pb-6">
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#25D366]" />
                    <span className="text-[#333333]">
                      {formatLimit(plan.dailyLimit)} mensagens/dia
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#25D366]" />
                    <span className="text-[#333333]">
                      {formatLimit(plan.monthlyLimit)} mensagens/mês
                    </span>
                  </li>
                  {plan.features.slice(1).map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[#25D366]" />
                      <span className="text-[#333333]">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button className="w-full bg-[#FFD700] text-black hover:bg-[#FFD700]/90">
                  {index === plans.length - 1 ? 'Falar com Vendas' : 'Começar Agora'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-[#333333]/70 mb-4">
            Todos os planos incluem: SSL gratuito, 99.9% uptime, documentação completa
          </p>
          <Button variant="outline" className="border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white">
            Ver Comparação Completa
          </Button>
        </div>
      </div>
    </section>
  )
}