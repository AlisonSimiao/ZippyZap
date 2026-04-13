"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2, ArrowRight, ShieldCheck, Zap, Star, Sparkles, Home } from "lucide-react"
import { api } from "@/lib/api"
import Link from "next/link"

function PaymentSuccessContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const paymentId = searchParams.get("payment_id")
    const externalReference = searchParams.get("external_reference")

    const [status, setStatus] = useState<string>("pending")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let interval: NodeJS.Timeout
        let retryCount = 0
        const maxRetries = 10

        async function checkPaymentStatus() {
            try {
                const accessToken = localStorage.getItem("accessToken")

                if (!accessToken) {
                    router.push("/login")
                    return
                }

                if (!paymentId) {
                    setError("ID de pagamento não encontrado")
                    setLoading(false)
                    return
                }

                const checkStatus = async () => {
                    try {
                        const data = await api.getPaymentStatus(accessToken, paymentId)
                        
                        if (data?.status) {
                            setStatus(data.status)
                            setLoading(false)
                            clearInterval(interval)
                        } else if (retryCount < maxRetries) {
                            retryCount++
                        } else {
                            setError("Confirmação em andamento. Verifique seu status no dashboard em instantes.")
                            setLoading(false)
                            clearInterval(interval)
                        }
                    } catch (err) {
                        console.error("Erro ao verificar status:", err)
                        if (retryCount >= maxRetries) {
                            setError("Não foi possível confirmar o status agora. Verifique seu e-mail.")
                            setLoading(false)
                            clearInterval(interval)
                        }
                        retryCount++
                    }
                }

                setTimeout(checkStatus, 2000)
                interval = setInterval(checkStatus, 5000)

            } catch (err) {
                setError("Ocorreu um erro inesperado")
                setLoading(false)
            }
        }

        checkPaymentStatus()

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [paymentId, router])

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <div className="relative mb-8">
                    <Loader2 className="w-16 h-16 animate-spin text-primary" />
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-serif font-black tracking-tight mb-2">Processando Upgrade</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/30 animate-pulse">
                    Aguarde enquanto confirmamos sua transação com segurança
                </p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <Card className="max-w-md w-full bg-white/[0.02] border-rose-500/20 shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
                            <Zap className="h-10 w-10 text-rose-500" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-rose-500">Atenção</CardTitle>
                        <CardDescription className="text-foreground/40 font-medium">{error}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Link href="/dashboard" className="w-full">
                            <Button className="w-full bg-primary text-white font-bold h-12 rounded-2xl">
                                Ir para o Dashboard
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full -z-10 animate-pulse delay-700" />

            <div className="w-full max-w-lg relative z-10">
                <Card className="bg-white/[0.02] border-emerald-500/20 shadow-2xl shadow-emerald-500/5 overflow-hidden backdrop-blur-xl rounded-[2.5rem]">
                    <CardHeader className="text-center pt-12 pb-8">
                        <div className="relative w-24 h-24 mx-auto mb-8">
                            <div className="absolute inset-0 bg-emerald-500 animate-ping opacity-20 rounded-full"></div>
                            <div className="relative w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="w-12 h-12 text-emerald-500" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2">
                                Transação Concluída
                            </Badge>
                            <CardTitle className="text-4xl font-serif font-black tracking-tight text-foreground">
                                Pagamento Aprovado!
                            </CardTitle>
                            <CardDescription className="text-sm font-medium text-foreground/40">
                                Sua assinatura premium foi ativada com sucesso.
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="px-10 pb-10 space-y-8">
                        <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 space-y-4">
                            <div className="flex items-center gap-4 group">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 transition-transform group-hover:scale-110">
                                    <Star className="w-4 h-4 fill-emerald-500/20" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-foreground/60 transition-colors group-hover:text-foreground">Benefícios Pro liberados</span>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 transition-transform group-hover:scale-110">
                                    <Zap className="w-4 h-4 fill-emerald-500/20" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-foreground/60 transition-colors group-hover:text-foreground">Limites de envio ampliados</span>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 transition-transform group-hover:scale-110">
                                    <ShieldCheck className="w-4 h-4 fill-emerald-500/20" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-foreground/60 transition-colors group-hover:text-foreground">Suporte priorizado ativo</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Link href="/dashboard" className="block">
                                <Button className="w-full bg-primary text-white hover:opacity-90 font-bold uppercase tracking-widest text-xs h-14 rounded-2xl shadow-xl shadow-primary/20 transition-all group">
                                    Acessar Plataforma
                                    <ArrowRight className="w-4 h-4 ml-3 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                            <Link href="/" className="block">
                                <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/20 hover:text-foreground/40 hover:bg-white/5 h-12 rounded-2xl transition-all">
                                    <Home className="w-3.5 h-3.5 mr-2" />
                                    Voltar à Home
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                    
                    <CardFooter className="bg-primary/5 border-t border-primary/10 p-6">
                        <div className="flex items-center gap-3 w-full justify-center">
                            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-[0.1em] text-primary/70">
                                Prepare-se para decolar sua automação
                            </p>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
                <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse"></div>
                </div>
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    )
}
