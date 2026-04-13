"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Loader2, ArrowLeft, ShieldCheck, CreditCard, Sparkles, Zap, Star, Crown } from "lucide-react"
import { api } from "@/lib/api"
import { IPlan } from "@/types/plan.types"
import { IUser } from "@/types/user.types"
import Link from "next/link"
import { useSession } from "next-auth/react"

function CheckoutContent() {
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

            const response = await api.createPayment(accessToken, plan.id)

            if (!response || !response.checkoutUrl) {
                throw new Error('URL de checkout não foi retornada pelo servidor')
            }

            window.location.href = response.checkoutUrl
        } catch (err: any) {
            console.error("Erro ao processar pagamento:", err)
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
        return limit > 999999 ? 'Ilimitado' : limit.toLocaleString('pt-BR')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
                <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse"></div>
                </div>
                <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/30 animate-pulse">Preparando Checkout...</p>
            </div>
        )
    }

    if (error && !plan) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <Card className="max-w-md w-full bg-white/[0.02] border-rose-500/20 shadow-2xl shadow-rose-500/5">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                            <ShieldCheck className="h-8 w-8 text-rose-500" />
                        </div>
                        <CardTitle className="text-xl font-bold text-rose-500 tracking-tight">Ocorreu um Erro</CardTitle>
                        <CardDescription className="text-foreground/40 font-medium">{error}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/plans">
                            <Button variant="ghost" className="w-full text-foreground/40 hover:text-foreground hover:bg-white/5 font-bold uppercase tracking-widest text-xs h-12 rounded-2xl">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Escolher outro Plano
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background py-20 px-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full -z-10 animate-pulse delay-700" />

            <div className="max-w-4xl mx-auto space-y-12 relative z-10">
                <Link href="/dashboard/plans" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30 hover:text-primary transition-all group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Alterar Seleção de Plano
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    {/* Left Column: Plan Summary */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
                                <Sparkles className="h-3 w-3" />
                                Confirmação de Upgrade
                            </div>
                            <h1 className="text-4xl font-serif font-black tracking-tight leading-tight">Revise os detalhes da sua assinatura</h1>
                            <p className="text-sm text-foreground/40 font-medium leading-relaxed">Você está a um passo de desbloquear recursos premium para sua automação.</p>
                        </div>

                        <Card className="bg-white/[0.02] border-white/5 overflow-hidden shadow-2xl">
                            <CardHeader className="p-8 pb-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    {plan?.name === 'Basic' && <Zap className="h-20 w-20" />}
                                    {plan?.name === 'Pro' && <Star className="h-20 w-20" />}
                                    {plan?.name === 'Enterprise' && <Crown className="h-20 w-20" />}
                                </div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        {plan?.name === 'Basic' && <Zap className="h-4 w-4" />}
                                        {plan?.name === 'Pro' && <Star className="h-4 w-4" />}
                                        {plan?.name === 'Enterprise' && <Crown className="h-4 w-4" />}
                                    </div>
                                    <CardTitle className="text-xl font-bold tracking-tight">ZippyZap {plan?.name}</CardTitle>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-serif font-black tracking-tighter">{formatPrice(Number(plan?.price || 0))}</span>
                                    <span className="text-xs font-bold text-foreground/20 uppercase tracking-widest">/ mensal</span>
                                </div>
                            </CardHeader>

                            <CardContent className="p-8 pt-6 space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Limite Diário</p>
                                        <p className="text-lg font-bold tracking-tight">{formatLimit(plan?.dailyLimit || 0)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Limite Mensal</p>
                                        <p className="text-lg font-bold tracking-tight">{formatLimit(plan?.monthlyLimit || 0)}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Vantagens Inclusas</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                                        {plan?.features?.map((feature, index) => (
                                            <div key={index} className="flex items-center gap-3 text-xs font-semibold text-foreground/60 transition-colors hover:text-foreground">
                                                <CheckCircle className="h-3.5 w-3.5 text-primary" />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                            
                            <CardFooter className="p-8 bg-white/[0.01] border-t border-white/5 flex items-center gap-4">
                                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest leading-relaxed">Garantia total de satisfação. Cancele sua assinatura a qualquer momento sem custos adicionais.</p>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Right Column: Payment & Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-white/[0.02] border-primary/20 shadow-2xl shadow-primary/5 overflow-hidden">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-primary" />
                                    Total a Pagar
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-8">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-foreground/40 font-medium">Subtotal</span>
                                        <span className="font-bold tracking-tight">{formatPrice(Number(plan?.price || 0))}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-foreground/40 font-medium">Taxas</span>
                                        <span className="text-emerald-500 font-bold tracking-tight">Isento</span>
                                    </div>
                                    <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                                        <span className="text-lg font-bold tracking-tight">Total Geral</span>
                                        <span className="text-3xl font-serif font-black tracking-tighter text-primary">
                                            {formatPrice(Number(plan?.price || 0))}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-start gap-4">
                                    <div className="p-2 bg-primary/10 rounded-lg shrink-0 mt-0.5">
                                        <CreditCard className="h-3 w-3 text-primary" />
                                    </div>
                                    <p className="text-[10px] text-foreground/50 font-bold leading-relaxed uppercase tracking-widest">
                                        Pagamento processado com segurança via <span className="text-primary">Mercado Pago</span>.
                                    </p>
                                </div>

                                {error && (
                                    <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                                        <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest leading-relaxed text-center">{error}</p>
                                    </div>
                                )}

                                <Button
                                    onClick={handleCheckout}
                                    disabled={processing}
                                    className="w-full bg-primary text-white hover:opacity-90 font-bold uppercase tracking-widest text-xs h-14 rounded-2xl shadow-xl shadow-primary/20 transition-all group overflow-hidden relative"
                                >
                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        {processing ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Processando...
                                            </>
                                        ) : (
                                            <>
                                                Concluir Assinatura
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </span>
                                </Button>
                            </CardContent>
                            <CardFooter className="p-8 pt-0 flex flex-col items-center gap-6">
                                <p className="text-[9px] text-center text-foreground/20 font-black uppercase tracking-[0.2em] leading-relaxed">
                                    Ao confirmar, você concorda com nossos termos de uso e faturamento recorrente.
                                </p>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
                <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse"></div>
                </div>
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    )
}
