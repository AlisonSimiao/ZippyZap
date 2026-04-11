"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Star } from "lucide-react"
import { usePlans } from "@/hooks/use-plans"
import { useRouter } from "next/navigation"

export function PricingSection() {
  const { plans, loading, error } = usePlans()
  const router = useRouter()

  if (loading) {
    return (
      <section id="pricing" className="py-24 px-4 bg-background relative overflow-hidden">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Planos que Crescem com Você
            </h2>
            <div className="h-4 bg-white/5 w-64 mx-auto rounded animate-pulse"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-white/5 bg-white/[0.02] animate-pulse">
                <CardHeader className="text-center pb-8">
                  <div className="h-6 bg-white/10 rounded w-1/2 mx-auto mb-4"></div>
                  <div className="h-10 bg-white/10 rounded w-3/4 mx-auto mb-4"></div>
                  <div className="h-4 bg-white/10 rounded w-1/4 mx-auto"></div>
                </CardHeader>
                <div className="px-6 pb-6 space-y-4">
                  <div className="h-4 bg-white/10 rounded w-full"></div>
                  <div className="h-4 bg-white/10 rounded w-full"></div>
                  <div className="h-10 bg-white/10 rounded w-full mt-4"></div>
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
      <section id="pricing" className="py-24 px-4 bg-background border-t border-white/5">
        <div className="container mx-auto">
          <div className="text-center mb-16 px-4 py-8 rounded-2xl bg-destructive/10 border border-destructive/20 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-destructive mb-2">Erro ao carregar planos</h2>
            <p className="text-foreground/60">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  const formatPrice = (price: string) => {
    return parseFloat(price).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const formatLimit = (limit: number) => {
    return limit > 999999 ? 'Ilimitado' : limit.toLocaleString('pt-BR')
  }

  const handleSelectPlan = (planId: number, isEnterprise: boolean) => {
    if (isEnterprise) {
      window.location.href = "mailto:vendas@zippyzap.online?subject=Interesse no Plano Enterprise"
      return
    }

    const accessToken = localStorage.getItem("accessToken")
    if (!accessToken) {
      router.push(`/login?redirect=/checkout?planId=${planId}`)
    } else {
      router.push(`/checkout?planId=${planId}`)
    }
  }

  // O backend já filtra por isActive: true
  const activePlans = plans;

  return (
    <section id="pricing" className="py-24 px-4 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-6xl bg-primary/2 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto relative">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 tracking-tight">
            Planos que Crescem com Você
          </h2>
          <p className="text-xl text-foreground/50 max-w-2xl mx-auto">
            Escolha o plano ideal para suas necessidades. Comece grátis e escale conforme necessário.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {activePlans.map((plan, index) => {
            const isPopular = index === 1;
            const isLast = index === activePlans.length - 1;
            
            return (
              <Card
                key={plan.id}
                className={`transition-all duration-300 relative group overflow-hidden ${
                  isPopular 
                    ? 'bg-primary shadow-[0_0_40px_rgba(168,85,247,0.25)] border-primary scale-105 z-10 py-4' 
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-primary/30'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-px left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-white text-primary px-4 py-1 rounded-b-xl border-none font-bold text-[10px] uppercase tracking-widest">
                      <Star className="w-3 h-3 mr-1 fill-primary" />
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-6">
                  <CardTitle className={`text-xl font-medium mb-4 ${isPopular ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {plan.name}
                  </CardTitle>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className={`text-4xl font-bold tracking-tight ${isPopular ? 'text-primary-foreground' : 'text-foreground'}`}>
                        {formatPrice(plan.price.toString())}
                      </span>
                      <span className={isPopular ? 'text-primary-foreground/70' : 'text-foreground/50'}>/mês</span>
                    </div>
                  </div>
                </CardHeader>

                <div className="px-8 pb-10">
                  <div className={`h-px w-full mb-8 ${isPopular ? 'bg-white/20' : 'bg-white/5'}`} />
                  
                  <ul className="space-y-4 mb-10">
                    <li className="flex items-center gap-3">
                      <div className={`rounded-full p-0.5 ${isPopular ? 'bg-white/20' : 'bg-primary/10'}`}>
                        <CheckCircle className={`w-4 h-4 ${isPopular ? 'text-white' : 'text-primary'}`} />
                      </div>
                      <span className={`text-sm ${isPopular ? 'text-primary-foreground/90' : 'text-foreground/70'}`}>
                        <strong className={isPopular ? 'text-white' : 'text-foreground'}>
                          {formatLimit(plan.dailyLimit)}
                        </strong> mensagens/dia
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className={`rounded-full p-0.5 ${isPopular ? 'bg-white/20' : 'bg-primary/10'}`}>
                        <CheckCircle className={`w-4 h-4 ${isPopular ? 'text-white' : 'text-primary'}`} />
                      </div>
                      <span className={`text-sm ${isPopular ? 'text-primary-foreground/90' : 'text-foreground/70'}`}>
                        <strong className={isPopular ? 'text-white' : 'text-foreground'}>
                          {formatLimit(plan.monthlyLimit)}
                        </strong> mensagens/mês
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className={`rounded-full p-0.5 ${isPopular ? 'bg-white/20' : 'bg-primary/10'}`}>
                        <CheckCircle className={`w-4 h-4 ${isPopular ? 'text-white' : 'text-primary'}`} />
                      </div>
                      <span className={`text-sm ${isPopular ? 'text-primary-foreground/90' : 'text-foreground/70'}`}>
                        SSL Gratuito & Suporte 24/7
                      </span>
                    </li>
                  </ul>

                  <Button
                    onClick={() => handleSelectPlan(plan.id, index === activePlans.length - 1)}
                    className={`w-full h-11 text-sm font-bold transition-all duration-300 ${
                      isPopular 
                        ? 'bg-white text-primary hover:bg-white/90 shadow-xl' 
                        : 'bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20'
                    }`}
                  >
                    {isLast ? 'Falar com Vendas' : 'Começar Agora'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-20">
          <p className="text-foreground/40 text-sm mb-6 max-w-md mx-auto leading-relaxed">
            Todos os planos incluem: SSL gratuito, 99.9% uptime, webhooks em tempo real e documentação completa.
          </p>
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary hover:bg-primary/5 font-medium flex items-center gap-2 mx-auto"
          >
            Ver Comparação Completa
            <Star className="w-3.5 h-3.5 fill-current" />
          </Button>
        </div>
      </div>
    </section>
  )
}