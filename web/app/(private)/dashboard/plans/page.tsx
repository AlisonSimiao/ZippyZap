'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { api } from '@/lib/api'
import { IPlan } from '@/types/plan.types'
import { Check, Crown, Zap, ShieldCheck, Star, Sparkles, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import { IUser } from '@/types/user.types'
import { useRouter } from 'next/navigation'

export default function PlansPage() {
  const [plans, setPlans] = useState<IPlan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)
  const { data: session } = useSession()
  const user = session?.user as IUser
  const router = useRouter()

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plansData = await api.getPlans()
        setPlans(plansData)
      } catch (error) {
        toast.error('Erro ao carregar planos', { position: 'top-right' })
      } finally {
        setLoadingPlans(false)
      }
    }
    fetchPlans()
  }, [])

  const handleUpgrade = (planId: number) => {
    router.push(`/checkout?planId=${planId}`)
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="h-3 w-3" />
              Upgrade de Conta
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">Escolha sua Velocidade</h1>
          <p className="text-foreground/40 max-w-lg font-medium leading-relaxed">
            Planos flexíveis desenhados para escalar conforme sua necessidade. 
            Desperte o potencial total da automação WhatsApp.
          </p>
        </div>

        {loadingPlans ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white/[0.02] border-white/5 h-[500px] animate-pulse">
                <div className="h-full w-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-white/5 animate-spin" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => {
              const isActive = plan.id === user?.planId
              const isPopular = plan.name === 'Enterprise' || plan.name === 'Pro' 
              
              return (
                <Card key={plan.id} className={`relative group flex flex-col transition-all duration-500 overflow-hidden ${
                  isActive 
                  ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20' 
                  : 'bg-white/[0.02] border-white/5 hover:border-primary/20'
                }`}>
                  {isActive && (
                    <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-widest z-10">
                      Plano Atual
                    </div>
                  )}

                  {isPopular && !isActive && (
                      <div className="absolute top-0 right-0 bg-white/5 text-foreground/40 text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-widest">
                          Recomendado
                      </div>
                  )}

                  <CardHeader className="p-8 pb-4 relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-primary/20 text-primary' : 'bg-white/5 text-foreground/30'}`}>
                          {plan.name === 'Basic' && <Zap className="h-5 w-5" />}
                          {plan.name === 'Pro' && <Star className="h-5 w-5" />}
                          {plan.name === 'Enterprise' && <Crown className="h-5 w-5" />}
                      </div>
                      <CardTitle className="text-xl font-bold tracking-tight">{plan.name}</CardTitle>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-medium text-foreground/40">R$</span>
                      <span className="text-4xl font-serif font-black tracking-tighter">{(+plan.price).toFixed(0)}</span>
                      <span className="text-sm font-medium text-foreground/20">/mês</span>
                    </div>
                    <CardDescription className="text-xs font-semibold uppercase tracking-widest text-foreground/30 mt-4 leading-relaxed">
                        Ideal para {plan.name === 'Basic' ? 'iniciantes' : plan.name === 'Pro' ? 'crescimento' : 'grandes operações'}.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-8 pt-6 flex-grow">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center group/item">
                          <span className="text-xs font-medium text-foreground/40">Limite Diário</span>
                          <span className="text-sm font-bold tracking-tight group-hover/item:text-primary transition-colors">{plan.dailyLimit?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center group/item">
                          <span className="text-xs font-medium text-foreground/40">Limite Mensal</span>
                          <span className="text-sm font-bold tracking-tight group-hover/item:text-primary transition-colors">{plan.monthlyLimit?.toLocaleString()}</span>
                        </div>
                      </div>

                      <Separator className={isActive ? 'bg-primary/20' : 'bg-white/5'} />

                      <div className="space-y-3">
                        {plan.features?.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3 text-xs font-medium text-foreground/60 transition-colors hover:text-foreground">
                            <ShieldCheck className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-primary' : 'text-primary/40'}`} />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-8 pt-0">
                      <Button
                        className={`w-full h-12 font-bold uppercase tracking-widest text-xs transition-all duration-300 ${
                          isActive 
                          ? 'bg-transparent border border-primary/30 text-primary cursor-default' 
                          : 'bg-white text-black hover:bg-white/90 shadow-xl shadow-white/5'
                        }`}
                        disabled={isActive}
                        onClick={() => handleUpgrade(plan.id)}
                      >
                        {isActive ? 'Gerenciar Plano' : 'Ativar Agora'}
                      </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}

        <div className="pt-12 text-center pb-12">
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/20 mb-6">Meios de Pagamento Suportados</p>
            <div className="flex justify-center gap-8 opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
                {/* Simplistic mock icons for payments */}
                <div className="text-sm font-black italic tracking-tighter">VISA</div>
                <div className="text-sm font-black italic tracking-tighter">MASTERCARD</div>
                <div className="text-sm font-black italic tracking-tighter">PIX</div>
                <div className="text-sm font-black italic tracking-tighter">BOLETO</div>
            </div>
        </div>
      </div>
    </div>
  )
}