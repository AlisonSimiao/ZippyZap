'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sidebar } from '@/components/Sidebar'
import { api } from '@/lib/api'
import { IPlan } from '@/types/plan.types'
import { Check, Crown } from 'lucide-react'
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
    <>
      <Sidebar activeTab="plans" setActiveTab={() => { }} />

      <div className="flex-1 p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Planos</h1>
            <p className="text-gray-600">Escolha o plano ideal para suas necessidades</p>
          </div>

          {loadingPlans ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const isActive = plan.id === user.planId
                return (
                  <Card key={plan.id} className={`relative ${plan.isActive ? 'ring-2 ring-blue-500' : ''}`}>
                    {plan.id === user.planId && (
                      <Badge className="absolute -top-2 left-4 bg-blue-500">
                        Plano Atual
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {plan.name}
                        {plan.name === 'Enterprise' && <Crown className="h-4 w-4 text-yellow-500" />}
                      </CardTitle>
                      <div className="text-3xl font-bold">
                        R$ {(+plan.price).toFixed(2)}
                        <span className="text-sm font-normal text-gray-500">/mês</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Limite diário:</span>
                            <span className="font-medium">{plan.dailyLimit?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Limite mensal:</span>
                            <span className="font-medium">{plan.monthlyLimit?.toLocaleString()}</span>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          {plan.features?.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <Check className="h-4 w-4 text-green-500" />
                              {feature}
                            </div>
                          ))}
                        </div>

                        <Button
                          className="w-full"
                          variant={isActive ? 'secondary' : 'default'}
                          disabled={isActive}
                          onClick={() => handleUpgrade(plan.id)}
                        >
                          {isActive ? 'Plano Atual' : 'Fazer Upgrade'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              }
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}