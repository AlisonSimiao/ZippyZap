"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Loader2, ArrowLeft } from "lucide-react"
import { api } from "@/lib/api"
import { IPlan } from "@/types/plan.types"
import { IUser } from "@/types/user.types"
import Link from "next/link"
import { useSession } from "next-auth/react"

export default function CheckoutPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const planId = searchParams.get("planId")
    const { data: session } = useSession() as unknown as { data: { user: IUser, accessToken: string } }

    const [plan, setPlan] = useState<IPlan | null>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadPlan() {
            if (!planId) {
                setError("Plano não especificado")
                setLoading(false)
                return
            }

            try {
                const plans = await api.getPlans()
                const selectedPlan = plans.find(p => p.id === parseInt(planId))

                if (!selectedPlan) {
                    setError("Plano não encontrado")
                } else {
                    setPlan(selectedPlan)
                }
            } catch (err) {
                setError("Erro ao carregar plano")
            } finally {
                setLoading(false)
            }
        }

        loadPlan()
    }, [planId])

    const handleCheckout = async () => {
        if (!plan) return

        setProcessing(true)
        setError(null)

        try {
            const accessToken = session?.accessToken

            if (!accessToken) {
                router.push(`/login?redirect=/checkout?planId=${planId}`)
                return
            }

            console.log('Criando pagamento para plano:', plan.id)
            const response = await api.createPayment(accessToken, plan.id)
            console.log('Resposta do backend:', response)

            if (!response || !response.checkoutUrl) {
                throw new Error('URL de checkout não foi retornada pelo servidor')
            }

            console.log('Redirecionando para:', response.checkoutUrl)

            // Redirecionar para o Mercado Pago
            window.location.href = response.checkoutUrl
        } catch (err: any) {
            console.error("Erro completo:", err)
            console.error("Resposta do erro:", err.response?.data)

            const errorMessage = err.response?.data?.message
                || err.message
                || "Erro ao processar pagamento. Tente novamente."

            setError(errorMessage)
            setProcessing(false)
        }
    }

    const formatPrice = (price: number) => {
        return price.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })
    }

    const formatLimit = (limit: number) => {
        return limit > 999999 ? '✨ Ilimitado' : limit.toLocaleString('pt-BR')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#FFD700]" />
            </div>
        )
    }

    if (error && !plan) {
        return (
            <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="text-red-600">Erro</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/#pricing">
                            <Button variant="outline" className="w-full">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voltar para Planos
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F5F5F5] py-12 px-4">
            <div className="container mx-auto max-w-2xl">
                <Link href="/#pricing" className="inline-flex items-center text-[#333333]/70 hover:text-[#333333] mb-8">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para Planos
                </Link>

                <Card className="border-gray-200 shadow-lg">
                    <CardHeader className="text-center pb-6">
                        <Badge className="bg-[#FFD700] text-black px-4 py-1 w-fit mx-auto mb-4">
                            Checkout
                        </Badge>
                        <CardTitle className="text-3xl text-[#333333]">Confirme sua Assinatura</CardTitle>
                        <CardDescription className="text-lg">
                            Você está prestes a assinar o plano {plan?.name}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Resumo do Plano */}
                        <div className="bg-[#F5F5F5] rounded-lg p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[#333333] font-semibold">Plano</span>
                                <span className="text-[#333333] text-lg font-bold">{plan?.name}</span>
                            </div>

                            <div className="border-t border-gray-200 pt-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-[#25D366]" />
                                    <span className="text-[#333333]">
                                        {formatLimit(plan?.dailyLimit || 0)} mensagens/dia
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-[#25D366]" />
                                    <span className="text-[#333333]">
                                        {formatLimit(plan?.monthlyLimit || 0)} mensagens/mês
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-[#25D366]" />
                                    <span className="text-[#333333]">Webhooks em tempo real</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-[#25D366]" />
                                    <span className="text-[#333333]">Suporte 24/7</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                                <span className="text-[#333333] font-semibold text-lg">Total</span>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-[#333333]">
                                        {formatPrice(Number(plan?.price || 0))}
                                    </div>
                                    <div className="text-sm text-[#333333]/70">por mês</div>
                                </div>
                            </div>
                        </div>

                        {/* Informações de Pagamento */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                <strong>Pagamento Seguro:</strong> Você será redirecionado para o Mercado Pago para completar o pagamento de forma segura.
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        {/* Botão de Checkout */}
                        <Button
                            onClick={handleCheckout}
                            disabled={processing}
                            className="w-full bg-[#FFD700] text-black hover:bg-[#FFD700]/90 text-lg py-6"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                "Prosseguir para Pagamento"
                            )}
                        </Button>

                        <p className="text-xs text-center text-[#333333]/60">
                            Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
